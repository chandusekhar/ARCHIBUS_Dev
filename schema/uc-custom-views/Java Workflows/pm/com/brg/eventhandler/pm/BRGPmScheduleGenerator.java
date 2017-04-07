package com.brg.eventhandler.pm;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.DataSourceFactory;
import com.archibus.datasource.DataSourceGroupingImpl;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.DbConnection;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.jobmanager.JobBase;
import com.archibus.jobmanager.JobStatus;
import com.archibus.service.Period;
import com.archibus.service.Period.Callback;
import com.archibus.utility.StringUtil;
import java.text.SimpleDateFormat;


/**
* PmScheduleGenerator - Long running job that generates Preventive Maintenance Schedule dates.
*
* <p>
* History:
* <li>Initial implementation for PM release 1.
* <li>Modified implementation for PM release 2 new functionality: support procedure supression, by Zhang Yi.
*
* @author Sergey, Zhang Yi
*/
public class BRGPmScheduleGenerator extends JobBase implements DataSource.RecordHandler {

    // ----------------------- constants ----------------------------------------------------------

    public static final String PERIOD_WEEK = "week";

    public static final String PERIOD_WEEK_PROC = "week proc";

    public static final String PERIOD_WEEK_EQ_PROC = "week EQ proc";

    public static final String PERIOD_MONTH = "month";

    // ----------------------- localized messages -------------------------------------------------

    // ----------------------- properties that define schedule generation -------------------------

    private final Date dateFrom;

    private final Date dateTo;

	private final String sdateFrom;

    private final String sdateTo;

   private final String restriction;

   private String pmddRestriction;
   
    private final boolean createFutureDates;
	
	private final boolean RecreateDatesFromScratch;

    // ----------------------- implementation -----------------------------------------------------

    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * Constructor.
     * 
     * @param restriction 
     */
    public BRGPmScheduleGenerator(Date dateFrom, Date dateTo, String restriction,boolean createFutureDates,boolean RecreateDatesFromScratch) {
	
  		EventHandlerContext context = ContextStore.get().getEventHandlerContext(); 
		this.dateFrom = dateFrom;
        this.dateTo = dateTo;
      //  this.restriction = restriction;
		this.pmddRestriction = "";
		String restr = EventHandlerBase.getActivityParameterString(context, "AbBldgOpsPM", "PMDD_RESTRICTION");
		restr = restr.replace("\\","");
		if (!restriction.equals("")) {
			if (!restr.equals("") ) {
				restr = "(" +  restr + ") and ";
			}
			restr = restr + "(" + restriction + ")";
			this.pmddRestriction = " AND EXISTS (SELECT 1 FROM pms WHERE pms.pms_id = pmdd.pms_id AND "+restriction+")";
		}
		else if (!restr.equals("") ) {
			restr = "(" +  restr + ")";
		}
		this.restriction = restr;
        this.createFutureDates = createFutureDates;
		this.RecreateDatesFromScratch = RecreateDatesFromScratch;
		
		//if (!this.restriction.equals("")) {
		//	this.pmddRestriction = " AND EXISTS (SELECT 1 FROM pms WHERE pms.pms_id = pmdd.pms_id AND "+this.restriction+")";
		//}

		
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
 		
		
		if (EventHandlerBase.isOracle(context)) {
			this.sdateFrom = "to_date(" + dateFormat.format(dateFrom) + "','YYYY-MM-DD')";
			this.sdateTo = "to_date('" + dateFormat.format(dateTo)+ "','YYYY-MM-DD')";
		}
		else {
			this.sdateFrom = "'" + dateFormat.format(dateFrom) + "'";
			this.sdateTo = "'" + dateFormat.format(dateTo)+ "'";
		}
    	
        createDataSources();
    }

    /**
     * Determines the first date, greater than or equal to the current date, that a PM schedule will
     * be due. Fills in the date for next PM in the PM Schedule with that date.
     * <p>
     * If a PM Schedule is specified NOT to be Manually scheduled: Determines all the dates, within
     * a given date range, that a PM schedule will be coming due.
     * <p>
     * Using the PM Schedule Dates Table, any old date records for the specified date range are
     * deleted and the newly calculated dates are inserted.
     * <p>
     * Updates pms.date_last_completed from the latest completion date of all Work Requests which
     * have a completion date and are assigned to this PMS.
     * <p>
     * The last date from wr and hwr tables are obtained and the last one used.
     * <p>
     * Updates pms.nactive from the number of active wr records for this pms with UNIQUE
     * wr.date_assigned.
     * <p>
     * Updates pms.meter_last_pm from the last "completed" wr record for that pms.
     * <p>
     * If that wr record has no wr.cur_meter_val value then 0 is used.
     * <p>
     * Updates pms.date_next_todo by calculating the schedule intervals.
     */
    public void run() {
        // TODO: find out how VPA restrictions are applied to PM schedule generation

        // SQL Server JDBC driver requires either autoCommit=true, or SelectMethod=cursor
        // if multiple Statements are used within a single Connection
        // SelectMethod=cursor imposes severe performance penalty,
        // so we use autoCommit=true
        if (this.pmsCountDS.isSqlServer()) {
            EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
            DbConnection.ThreadSafe connection = EventHandlerBase
                    .getDbConnection(eventHandlerContext);
            connection.setAutoCommit(true);
        }

        DataRecord pmsCountRecord = pmsCountDS.getRecord(this.restriction);
        this.pmsCount = pmsCountRecord.getInt("pms.pms_count");
        // TODO: expose pmsCount for UI status update

        if (log.isDebugEnabled()) {
            log
                    .debug(MessageFormat
                            .format(
                                    "Schedule dates generator: restriction [{0}], from [{1}] to [{2}], create future dates [{3}], count [{4}] ",
                                    new Object[] { restriction, dateFrom, dateTo,
                                            String.valueOf(createFutureDates),
                                            String.valueOf(this.pmsCount) }));
        }

        if (log.isDebugEnabled()) {
            log.debug("Query for pms records... ");
        }
		
		EventHandlerContext context = ContextStore.get().getEventHandlerContext(); 

		//Update Desired to 'R' for this pms_id and date_range so we know which ones are no longer valid
		String sqlupdate = "Update pmdd set desired = 'R' WHERE  date_todo >= " + sdateFrom  + this.pmddRestriction;
		if (!RecreateDatesFromScratch) {
			//Unless they want to recreate from scratch - only set to R where desired = 'N' or 'Y'  - Leave 'M' Manual ones alone
			sqlupdate = sqlupdate +  " and desired in ('Y','N')";
		}
		EventHandlerBase.executeDbSql(context, sqlupdate, false);
		EventHandlerBase.executeDbCommit(context);
		
		//Update approved to 'N' for this pms_id and date_range if it's currently set to 'Y'.  Don't change if it is set to 'YM' Yes Manual or 'YN' No Manual
		sqlupdate = "Update pmdd set approved = 'N' WHERE  date_todo >= " + sdateFrom + this.pmddRestriction;
		if (!RecreateDatesFromScratch) {
			//Unless they want to recreate from scratch - only set to N where desired = 'Y'  - Leave 'YM' Yes Manual and 'YN' No Manual ones alone
			sqlupdate = sqlupdate + " and approved = 'Y'";
		}
		EventHandlerBase.executeDbSql(context, sqlupdate, false);
		EventHandlerBase.executeDbCommit(context);
		

        this.status.setCurrentNumber(1);
        pmsSelectDS.queryRecords(this.restriction, this);
		
		//remove any pmdd for the pmsId and date ranged where the desired = 'R[
		sqlupdate = "Delete pmdd where desired = 'R' AND date_todo >= " + sdateFrom;
		EventHandlerBase.executeDbSql(context, sqlupdate, false);
		EventHandlerBase.executeDbCommit(context);
        
        this.status.setCurrentNumber(80);
        BRGremoveSupressedPMSD();
        this.status.setCurrentNumber(100);
        
        if(this.stopRequested){
        	this.status.setCode(JobStatus.JOB_STOP_REQUESTED);
        	return;
        }
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }

    //Stored supressed PM Schedule date records
    private List<DataRecord> supressedPMSD = null;
    
    /**
     * Removes all supressed PM Schedule dates with date range.
     * 
     * By Zhang Yi
     */
    private void BRGremoveSupressedPMSD() {
        this.supressedPMSD = new ArrayList<DataRecord>();
        this.pmsdSelectDS.setParameter("dateFrom", this.dateFrom).setParameter("dateTo", this.dateTo);
        this.totalsurPmsdRecords = this.pmsdSelectDS.getRecords().size();
        this.pmsdSelectDS.queryRecords(new RecordHandler() {

            // this callback method is called for each retrieved record
            public boolean handleRecord(DataRecord record) {

                // add the work order ID to the message buffer
                DataRecord asscoaitedPms = pmsSelectDS.getRecord(" pms_id="+record.getInt("pmdd.pms_id"));
                String eqId = asscoaitedPms.getString("pms.eq_id");
                String blId = asscoaitedPms.getString("pms.bl_id");
                String flId = asscoaitedPms.getString("pms.fl_id");
                String rmId = asscoaitedPms.getString("pms.rm_id");
                String pmpId = asscoaitedPms.getString("pms.pmp_id");
                //pmpSuppressDS.setParameter("pmpId", pmpId);
                List<DataRecord> suppressor = pmpSuppressDS.getRecords("pmp_ids_to_suppress LIKE '%''"+pmpId+"''%'");
                for(DataRecord suPMP:suppressor){
                    String suPmpId = suPMP.getString("pmp.pmp_id");
                    pmsdSuppressDS.setParameter("suppressPmpId", suPmpId)
                                  .setParameter("dateToDo", record.getValue("pmdd.date_todo"))
                                  .setParameter("eqId", eqId)
                                  .setParameter("blId", blId)
                                  .setParameter("flId", flId)
                                  .setParameter("rmId", rmId);
                    if(pmsdSuppressDS.getRecord()!=null){
                        supressedPMSD.add(record);
                        break;
                    }
                }             
                surPmsdCounter++;
                status.setCurrentNumber(80+20*surPmsdCounter/totalsurPmsdRecords);
                return true; // true to continue scrolling through the result set, false to stop
            }
        });
        
        for(DataRecord suPMSD:supressedPMSD){
            pmsdSelectDS.deleteRecord(suPMSD);
        }
        
    }

    public int pmsCounter = 0;

    public int pmsCount = 0;

    public int pmsdCounter = 0;

    public int surPmsdCounter = 0;

    public int totalsurPmsdRecords=0;
    /**
     * This method is called for each PM Schedule record retrieved by DataSource in the createScheduledDates
     * method.
     */
    public boolean handleRecord(DataRecord record) {
    	if(this.stopRequested){
    		return false;
    	}
        EventHandlerContext context = ContextStore.get().getEventHandlerContext(); 
		
		
    	
        pmsCounter++;

        int pmsId = record.getInt("pms.pms_id");
        String eqId = record.getString("pms.eq_id");
        String blId = record.getString("pms.bl_id");
        String flId = record.getString("pms.fl_id");
        String rmId = record.getString("pms.rm_id");
        String pmpId = record.getString("pms.pmp_id");
/*		        
		//Update Desired to 'R' for this pms_id and date_range so we know which ones are no longer valid
		String sqlupdate = "Update pmdd set desired = 'R' WHERE  pms_id = " + pmsId + " AND date_todo >= " + sdateFrom  + this.pmddRestriction;
		if (!RecreateDatesFromScratch) {
			//Unless they want to recreate from scratch - only set to R where desired = 'N' or 'Y'  - Leave 'M' Manual ones alone
			sqlupdate = sqlupdate +  " and desired in ('Y','N')";
		}
		EventHandlerBase.executeDbSql(context, sqlupdate, false);
		EventHandlerBase.executeDbCommit(context);
		
		//Update approved to 'N' for this pms_id and date_range if it's currently set to 'Y'.  Don't change if it is set to 'YM' Yes Manual or 'YN' No Manual
		sqlupdate = "Update pmdd set approved = 'N' WHERE  pms_id = " + pmsId + " AND date_todo >= " + sdateFrom + this.pmddRestriction;
		if (!RecreateDatesFromScratch) {
			//Unless they want to recreate from scratch - only set to N where desired = 'Y'  - Leave 'YM' Yes Manual and 'YN' No Manual ones alone
			sqlupdate = sqlupdate + " and approved = 'Y'";
		}
		EventHandlerBase.executeDbSql(context, sqlupdate, false);
		EventHandlerBase.executeDbCommit(context);
*/
        if (log.isDebugEnabled()) {
            log.debug(MessageFormat
                    .format("Start to forecast and generate pmsd for PM Schedule: [{0}]",
                            new Object[] { String.valueOf(pmsId) }));
        }

        Date now = new Date();
        Date dateNextTodo = now;

        // Determine PMS.NACTIVE: get a count of all date_assigned unique uncompleted Work Requests
        // for this pms.
        wrNActiveDS.setParameter("pmsId", pmsId);
        // wrNActiveDS.setAutoCommit(true);
        int nActive = wrNActiveDS.getRecord().getInt("wr.nactive");

        // Determine the last completed Work Request for this pms. Determine pms.meter_last_pm from
        // the last "completed" wr record with a curr_meter_val for that pms.
        // Check both the current WR table (wr) and the historic WR table (hwr).
        wrLastCompletedDS.setParameter("pmsId", pmsId)
                         .setParameter("eqId", eqId)
                         .setParameter("blId", blId)
                         .setParameter("flId", flId)
                         .setParameter("rmId", rmId)
                         .setParameter("pmpId", pmpId)
                         .setParameter("suPrePmpId", "%'"+pmpId+"'%");
        DataRecord wrRecord = wrLastCompletedDS.getRecord();
        Date dateLastCompleted = wrRecord.getDate("wr.last_completed");
        double meterLastCompleted = wrRecord.getDouble("wr.last_meter");

        hwrLastCompletedDS.setParameter("pmsId", pmsId)
                          .setParameter("eqId", eqId)
                          .setParameter("blId", blId)
                          .setParameter("flId", flId)
                          .setParameter("rmId", rmId)
                          .setParameter("pmpId", pmpId)
                          .setParameter("suPrePmpId", "%'"+pmpId+"'%");
        DataRecord hwrRecord = hwrLastCompletedDS.getRecord();
        Date dateLastCompletedHwr = hwrRecord.getDate("hwr.last_completed");
        double meterLastCompletedHwr = hwrRecord.getDouble("hwr.last_meter");

        if (dateLastCompleted == null
                || (dateLastCompletedHwr != null && dateLastCompletedHwr.after(dateLastCompleted))) {
            dateLastCompleted = dateLastCompletedHwr;
        }
        if (meterLastCompletedHwr > meterLastCompleted) {
            meterLastCompleted = meterLastCompletedHwr;
        }

        String intervalType = record.getString("pms.interval_type");
        int intervalFrequency = record.getInt("pms.interval_freq");
        int interval = record.getInt("pms.interval_" + intervalFrequency);
		
		//Run this section twice once for the actual dates based on pms.interval_type and pms.interval_XX
		//And then again for the desired dates based on the pmp.interval_type and pmp.interval.
		String desired = "N";
		while (!desired.equals("")) {

			if (interval > 0) {
				// For PM schedules based on metered usage: (pms.interval_type in ('i','h','e')):
				// pms.date_next_todo is calculated based on the following:
				// eq.meter, eq.meter_usage_per_day,
				// pms.meter_last_pm, pms.fixed, pms.interval_freq,
				// pms.date_first_todo, Date_last_completed
				// and the appropriate interval
				if (intervalType.equals("i") || intervalType.equals("h") || intervalType.equals("e")) {
					// miles, hours, meter

	//                String eqId = record.getString("pms.eq_id");
					if (StringUtil.notNullOrEmpty(eqId)) {

						DataRecord eqRecord = eqSelectDS.getRecord("eq_id = '" + eqId + "'");
						double meter = eqRecord.getDouble("eq.meter");
						double meterUsagePerDay = eqRecord.getDouble("eq.meter_usage_per_day");

						// If the current equipment meter reading is greater than the (meter reading
						// at the last PM plus the Interval) and there is not a current uncompleted WR
						// for this PMS:
						// Then schedule the PM for the current day.
						if (meter >= meterLastCompleted + interval && nActive < 1) {
							dateNextTodo = now;
							// for a metered based PM we only want to create a single pmsd record;
							// if the current equipment meter value > (value as of the last PM
							// completion + the meter interval to do PM)
							// then set the next date to do the PM as the current date;
							// since all other future PM will depend on the meter reading for the
							// equipment
							// we add 99 years as the increment to next check so that
							// no pmsd records will be created other than the one for the current date.
							BRGcreateForecastDates(pmsId, new Period(Period.YEAR, 99, dateNextTodo), desired);

						} else if (meterUsagePerDay > 0) {
							int daysInterval = (int) (interval / meterUsagePerDay);

							// Establish "initial" next dates: If no Work Orders have been completed for
							// this pms then the intitial next date is the first date, else add the
							// interval.
							Date dateFirstTodo = record.getDate("pms.date_first_todo");
							if (dateLastCompleted == null) {
								dateNextTodo = dateFirstTodo;
							} else {
								if (record.getInt("pms.fixed") == 0) {
									// floating
									dateNextTodo = Period.incrementDate(dateLastCompleted,
																		Period.CUSTOM, daysInterval);
								} else {
									// fixed
									dateNextTodo = Period.incrementDate(dateFirstTodo, Period.CUSTOM,
																		daysInterval);
								}
							}

							Period periodNextTodo = new Period(Period.CUSTOM, daysInterval,
									dateNextTodo);
							BRGcreateForecastDates(pmsId, periodNextTodo,desired);
						}
					}

					// For PM schedules based on manual scheduling get the minimum next date from pmsd
					// that is greater than the current date.
				} else if (intervalType.equals("a")) {
					// For PM schedules based on manual scheduling get the minimum next date from pmsd
					// that is greater than the current date.
					pmsNextDS.setParameter("pmsId", pmsId);
					List nextRecords = pmsNextDS.getRecords();
					Date nextDate = ((DataRecord) nextRecords.get(0)).getDate("pmsd.next_date_todo");
					if (nextDate != null) {
						dateNextTodo = nextDate;
					}

					// For PM schedules based on elapsed dates pms.date_next_todo is calculated based on
					// pms.meter_last_pm, pms.fixed, pms.interval_freq, and the appropriate interval
					// days,weeks, months, quarters, years
				} else if (intervalType.equals("d") || intervalType.equals("ww")
						|| intervalType.equals("m") || intervalType.equals("q")
						|| intervalType.equals("yyyy")) {
					// If no Work Orders have been completed or active for this pms
					// then the next date is the first date,
					// then If the next date + interval < current date and there are no active WR
					// then next date = current date;
					// else calculate the interval.
					if (dateLastCompleted == null) {
						dateNextTodo = record.getDate("pms.date_first_todo");

						Date d = Period.incrementDate(dateNextTodo, intervalType, interval);
						if (d.before(now) && nActive == 0) {
							dateNextTodo = now;
						}
					} else {
						if (record.getInt("pms.fixed") == 0) {
							// floating
							Date dateNextAltTodo = record.getDate("pms.date_next_alt_todo");
							if (desired.equals("Y") && (dateNextAltTodo == null || dateNextAltTodo.before(now))) {
								dateNextTodo = Period.incrementDate(dateLastCompleted, intervalType,
																	interval);
							} else {
								dateNextTodo = dateNextAltTodo;
							}

							// deal with missed PMs
							if (nActive == 0 && dateNextTodo.before(now)) {
								dateNextTodo = now;
							}

						} else {
							// fixed
							Date dateFirstTodo = record.getDate("pms.date_first_todo");
							dateNextTodo = Period.incrementDate(dateFirstTodo, intervalType, interval);
							dateNextTodo = Period.getDateAfter(dateNextTodo, dateLastCompleted,
															   intervalType, interval);
						}
					}

					if (createFutureDates) {
						BRGcreateForecastDates(pmsId, new Period(intervalType, interval, dateNextTodo),desired);
					}
				}

				if (desired.equals("N")) {
					record.setValue("pms.nactive", nActive);
					record.setValue("pms.date_last_completed", dateLastCompleted);
					record.setValue("pms.meter_last_pm", meterLastCompleted);
					record.setValue("pms.date_next_todo", new java.sql.Date(dateNextTodo.getTime()));
					pmsUpdateDS.saveRecord(record);
				}
				if (pmsId % 1000 == 0) {
					pmsUpdateDS.commit();

					log.debug(MessageFormat
							.format("Total pms generated: [{0}], total pmsd generated [{1}] ",
									new Object[] { String.valueOf(pmsCounter),
											String.valueOf(pmsdCounter) }));
				}
			}
			
			if (desired.equals("Y")) {
				desired = "";
			}
			else {
				//Now run the desired dates based on the pmp.interval_type and pmp.interval
				desired = "Y";
				pmpDS.setParameter("pmpId", pmpId);
				DataRecord pmpRecord = pmpDS.getRecord();
				intervalType = pmpRecord.getString("pmp.interval_type");
				interval = pmpRecord.getInt("pmp.interval_rec");
			}
		}	
/*
		//remove any pmdd for the pmsId and date ranged where the desired = 'R[
		sqlupdate = "Delete pmdd where desired = 'R' and pms_id = " + pmsId + " AND date_todo >= " + sdateFrom;
		EventHandlerBase.executeDbSql(context, sqlupdate, false);
		EventHandlerBase.executeDbCommit(context);
*/
        this.status.setCurrentNumber(1+79*this.pmsCounter/this.pmsCount);
        return true;
    }

    private String cbDesired;
    private String cbApproved;
    private String schedDate;
    
    /**
     * Create forecasted dates for chosen schedule and date range.
     * 
     * @param pmsId PM Schedule id
     * @param periodNextTodo Period Next todo 
     */
    private void BRGcreateForecastDates(final int pmsId, final Period periodNextTodo, String desired) {
		String approved = "Y";
		if (desired.equals("Y")) {approved = "N";}
		
		/*
       if (log.isDebugEnabled()) {
            log.debug(MessageFormat
                    .format("Deleting pmdd for PM Schedule: [{0}], from [{1}] to [{2}]",
                            new Object[] { String.valueOf(pmsId), dateFrom, dateTo }));
        }
		*/
        // deletes any current pmsd records for specified pms_id and date range
	    /*
		pmsdDeleteDS.setParameter("pmsId", pmsId);
        pmsdDeleteDS.setParameter("dateFrom", dateFrom);
        pmsdDeleteDS.setParameter("dateTo", dateTo);
        pmsdDeleteDS.executeUpdate();
		*/
		

        if (log.isDebugEnabled()) {
            log.debug(MessageFormat
                    .format("Generating pmdd for PM Schedule: [{0}], from [{1}] to [{2}]",
                            new Object[] { String.valueOf(pmsId), dateFrom, dateTo }));
        }
		
		String sqlupdate = "";

		cbApproved = approved;
		cbDesired = desired;
		
        // create new pmsd records
        // increment the date starting from dateNextTodo until it is within the date range
        // keep incrementing while the date is in the range, calling the callback for each increment
        periodNextTodo.iterate(dateFrom, dateTo, new Callback() {
            public boolean call(Date currentDate) {
			
			
			
            EventHandlerContext context = ContextStore.get().getEventHandlerContext();
			
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
			
			if (EventHandlerBase.isOracle(context)) {
				schedDate = "to_date(" + dateFormat.format(currentDate) + "','YYYY-MM-DD')";
			}
			else {
				schedDate = "'" + dateFormat.format(currentDate) + "'";
			}
			
            	
			///BRG only Insert if it does not exists
			String sqlupdate = "Insert into pmdd (pms_id, date_todo, approved) select " + pmsId + "," + schedDate + ",'" + cbApproved + "'" ;
			if (EventHandlerBase.isOracle(context)) {
				sqlupdate = sqlupdate + " from dual";
			}
			sqlupdate = sqlupdate +" where not exists (select 1 from pmdd p where p.pms_id = " + pmsId + " and date_todo = " + schedDate + ")";
			EventHandlerBase.executeDbSql(context, sqlupdate, false);
			EventHandlerBase.executeDbCommit(context);
			
			///Update desired to 'Y' or 'N'
			sqlupdate = "Update pmdd set desired = '" + cbDesired + "' WHERE pms_id = " + pmsId + " AND date_todo = " + schedDate;
			EventHandlerBase.executeDbSql(context, sqlupdate, false);
			EventHandlerBase.executeDbCommit(context);
			
			
			if (cbApproved.equals("Y")) {
				///Update approved to 'Y' if approved = 'N' or A (Don't touch if approved = 'R')
				sqlupdate = "Update pmdd set approved = 'Y' WHERE approved in ('A', 'N') and pms_id = " + pmsId + " AND date_todo = " + schedDate ;
				EventHandlerBase.executeDbSql(context, sqlupdate, false);
				EventHandlerBase.executeDbCommit(context);
			}
			else {
				///Update approved to 'N' if approved = 'R' or A (Don't touch if approved = 'Y', 'N' or 'A')
				sqlupdate = "Update pmdd set approved = 'N' WHERE approved in ('R') and pms_id = " + pmsId + " AND date_todo = " + schedDate ;
				EventHandlerBase.executeDbSql(context, sqlupdate, false);
				EventHandlerBase.executeDbCommit(context);
			}
				
			/*
                DataRecord pmsdRecord = pmsdCreateDS.createNewRecord();
                pmsdRecord.setValue("pmsd.pms_id", pmsId);
                pmsdRecord.setValue("pmsd.date_todo", currentDate);
                pmsdCreateDS.saveRecord(pmsdRecord);
			*/
                pmsdCounter++;
                return true;
            }
        });
		
		
		
		
    }

    // ----------------------- data sources -------------------------------------------------------

    private DataSourceGroupingImpl pmsCountDS;

    private DataSource pmsNextDS;

    private DataSource pmsSelectDS;

    private DataSource pmsUpdateDS;

    private DataSource wrNActiveDS;

    private DataSource wrLastCompletedDS;

    private DataSource hwrLastCompletedDS;

    private DataSource eqSelectDS;

    private DataSource pmsdDeleteDS;

    private DataSource pmsdCreateDS;

    private DataSource pmsdSelectDS;

    private DataSource pmpSuppressDS;

    private DataSource pmsdSuppressDS;
    
    private DataSource pmpDS;
    /**
     * Creates data sources initially.
     */
    private void createDataSources() {
        pmsCountDS = new DataSourceGroupingImpl();
        pmsCountDS.addTable("pms");
        pmsCountDS.addCalculatedField("pms", "pms_count", DataSource.DATA_TYPE_INTEGER, 6, 0,
                                      "count", "pms.pms_id");

        pmsNextDS = DataSourceFactory
                .createDataSource()
                .addTable("pmdd")
                .addQuery(
                          "SELECT MIN(date_todo) ${sql.as} next_date_todo FROM pmdd WHERE pms_id = ${parameters['pmsId']} AND date_todo >= ${sql.currentDate}")
                .addVirtualField("pmdd", "next_date_todo", DataSource.DATA_TYPE_DATE)
                .addParameter("pmsId", "", DataSource.DATA_TYPE_INTEGER)
                .setAutoCommit(true);

        pmsSelectDS = DataSourceFactory.createDataSourceForFields("pms", new String[] { "pms_id",
                "fixed", "eq_id", "interval_type", "interval_freq", "interval_1", "interval_2",
                "interval_3", "interval_4", "date_first_todo", "date_next_todo",
                "date_next_alt_todo", "date_last_completed", "meter_last_pm", "nactive",
                "bl_id", "fl_id", "rm_id", "pmp_id" });

        pmsUpdateDS = DataSourceFactory.createDataSourceForFields("pms", new String[] { "pms_id",
                "nactive", "date_last_completed", "meter_last_pm", "date_next_todo" });

        wrNActiveDS = DataSourceFactory
                .createDataSource()
                .addTable("wr")
                .addQuery(
                          "SELECT COUNT(DISTINCT date_assigned) ${sql.as} nactive FROM wr WHERE pms_id = ${parameters['pmsId']} AND date_completed IS NULL")
                .addVirtualField("wr", "nactive", DataSource.DATA_TYPE_INTEGER)
                .addParameter("pmsId", "", DataSource.DATA_TYPE_INTEGER);

        wrLastCompletedDS = DataSourceFactory
                .createDataSource()
                .addTable("wr")
                .addQuery(
                          "SELECT MAX(date_completed) ${sql.as} last_completed, MAX(curr_meter_val) ${sql.as} last_meter FROM wr " +
                              "WHERE  pms_id = ${parameters['pmsId']} AND date_completed IS NOT NULL "+
                                      "OR ( " +
                                            "wr.eq_id = ${parameters['eqId']} " +
                                            " AND " +
                                            "EXISTS (SELECT 1 FROM pmp WHERE exists ( select 1 from pms inter where inter.pms_id=wr.pms_id and inter.pmp_id = pmp.pmp_id  )  and pmp.pmp_ids_to_suppress like ${parameters['suPrePmpId']})" +
                                          ")"+
                                      "OR ( " +
                                            "wr.eq_id IS NULL AND wr.bl_id = ${parameters['blId']} AND wr.fl_id = ${parameters['flId']} AND wr.rm_id = ${parameters['rmId']} " +
                                            " AND " +
                                            "EXISTS (SELECT 1 FROM pmp WHERE exists ( select 1 from pms inter where inter.pms_id=wr.pms_id and inter.pmp_id = pmp.pmp_id  )  and pmp.pmp_ids_to_suppress like ${parameters['suPrePmpId']})" +
                                          ")"
                          )
                .addVirtualField("wr", "last_completed", DataSource.DATA_TYPE_DATE)
                .addVirtualField("wr", "last_meter", DataSource.DATA_TYPE_NUMBER)
                .addParameter("pmsId", "", DataSource.DATA_TYPE_INTEGER)
                .addParameter("pmpId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("eqId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("blId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("flId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("rmId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("suPrePmpId", "", DataSource.DATA_TYPE_TEXT);

        hwrLastCompletedDS = DataSourceFactory
                .createDataSource()
                .addTable("hwr")
                .addQuery(
                          "SELECT MAX(date_completed) ${sql.as} last_completed, MAX(curr_meter_val) ${sql.as} last_meter FROM hwr " +
                                "WHERE pms_id = ${parameters['pmsId']} AND date_completed IS NOT NULL "+
                                       "OR ( " +
                                             "hwr.eq_id = ${parameters['eqId']} " +
                                             " AND " +
                                             "EXISTS (SELECT 1 FROM pmp WHERE exists ( select 1 from pms inter where inter.pms_id=hwr.pms_id and inter.pmp_id = pmp.pmp_id  )  and pmp.pmp_ids_to_suppress like ${parameters['suPrePmpId']})" +
                                           ")"+
                                       "OR ( " +
                                             "hwr.eq_id IS NULL AND hwr.bl_id = ${parameters['blId']} AND hwr.fl_id = ${parameters['flId']} AND hwr.rm_id = ${parameters['rmId']} " +
                                             " AND " +
                                             "EXISTS (SELECT 1 FROM pmp WHERE exists ( select 1 from pms inter where inter.pms_id=hwr.pms_id and inter.pmp_id = pmp.pmp_id  )  and pmp.pmp_ids_to_suppress like ${parameters['suPrePmpId']})" +
                                           ")"
                        )
                .addVirtualField("hwr", "last_completed", DataSource.DATA_TYPE_DATE)
                .addVirtualField("hwr", "last_meter", DataSource.DATA_TYPE_NUMBER)
                .addParameter("pmsId", "", DataSource.DATA_TYPE_INTEGER)
                .addParameter("pmpId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("eqId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("blId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("flId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("rmId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("suPrePmpId", "", DataSource.DATA_TYPE_TEXT);
				
		pmpDS = DataSourceFactory
                .createDataSourceForFields("pmp", new String[] { "interval_type", "interval_rec" })
                .addQuery(
                          "SELECT interval_type, interval_rec FROM pmp WHERE  pmp_id = ${parameters['pmpId']} "
                          )
                .addParameter("pmpId", "", DataSource.DATA_TYPE_TEXT);

        eqSelectDS = DataSourceFactory.createDataSourceForFields("eq", new String[] { "meter",
                        "meter_usage_per_day" });

        pmsdCreateDS = DataSourceFactory.createDataSourceForFields("pmsd", new String[] { "pms_id",
                "date_todo" })
                .setAutoCommit(true);

        pmsdSelectDS = DataSourceFactory.createDataSourceForFields("pmdd", new String[] { "pms_id", "date_todo" })
                .addQuery("Select pms_id,date_todo FROM pmdd WHERE date_todo >= ${parameters['dateFrom']} AND date_todo <= ${parameters['dateTo']}")
                .addParameter("dateFrom","", DataSource.DATA_TYPE_DATE)
                .addParameter("dateTo","", DataSource.DATA_TYPE_DATE)
                .setAutoCommit(true);

        pmpSuppressDS = DataSourceFactory.createDataSourceForFields("pmp", new String[] { "pmp_id", "pmp_ids_to_suppress" });

        pmsdSuppressDS = DataSourceFactory.createDataSourceForFields("pmdd", new String[] { "pms_id", "date_todo" })
                .addQuery("Select pms_id, date_todo FROM pmdd WHERE pmdd.date_todo=${parameters['dateToDo']} " +
                		                    "AND EXISTS( SELECT 1 FROM pms WHERE pmdd.pms_id=pms.pms_id " +
                		                                                      "AND (" +
                                                                                        "(pms.eq_id IS NOT NULL " +
                                                                                        "AND pms.eq_id = ${parameters['eqId']}) " +
                                                                                    "OR " +
                                                                                        "(pms.eq_id IS NULL " +
                                                                                        "AND pms.bl_id = ${parameters['blId']} " +
                                                                                        "AND pms.fl_id = ${parameters['flId']} " +
                                                                                        "AND pms.rm_id = ${parameters['rmId']} )" +
                                                                                    ") "+
                                                                               "AND pms.pmp_id=${parameters['suppressPmpId']}"+
                                                 ")" )
                .addParameter("suppressPmpId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("dateToDo", "", DataSource.DATA_TYPE_DATE)
                .addParameter("eqId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("blId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("flId", "", DataSource.DATA_TYPE_TEXT)
                .addParameter("rmId", "", DataSource.DATA_TYPE_TEXT)
                .setAutoCommit(true);


        pmsdDeleteDS = DataSourceFactory
                .createDataSource()
                .addTable("pmsd")
                .addQuery(
                          "DELETE FROM pmsd WHERE pms_id = ${parameters['pmsId']} AND date_todo >= ${parameters['dateFrom']} AND date_todo <= ${parameters['dateTo']}")
                .addParameter("pmsId", "", DataSource.DATA_TYPE_INTEGER)
                .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE)
                .setAutoCommit(true);
				

    }
}
