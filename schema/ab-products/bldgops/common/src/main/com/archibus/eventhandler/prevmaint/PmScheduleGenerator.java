package com.archibus.eventhandler.prevmaint;

import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.DbConnection;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.*;
import com.archibus.service.Period.Callback;
import com.archibus.utility.StringUtil;

/**
 * PmScheduleGenerator - Long running job that generates Preventive Maintenance Schedule dates.
 * 
 * <p>
 * History:
 * <li>Initial implementation for PM release 1.
 * <li>Modified implementation for PM release 2 new functionality: support procedure supression, by
 * Zhang Yi.
 * 
 * @author Sergey, Zhang Yi
 */
public class PmScheduleGenerator extends JobBase implements DataSource.RecordHandler {
    
    // ----------------------- constants ----------------------------------------------------------
    
    public static final String PERIOD_WEEK = "week";
    
    public static final String PERIOD_WEEK_PROC = "week proc";
    
    public static final String PERIOD_WEEK_EQ_PROC = "week EQ proc";
    
    public static final String PERIOD_MONTH = "month";
    
    // @translatable
    private final String JOB_TITLE = "Generate Schedule Dates";
    
    // ----------------------- localized messages -------------------------------------------------
    
    // ----------------------- properties that define schedule generation -------------------------
    
    private final Date dateFrom;
    
    private final Date dateTo;
    
    private final String restriction;
    
    private final boolean createFutureDates;
    
    private Map<Integer, DataRecord> cacheWrLastDates;
    
    private Map<Integer, DataRecord> cacheHwrLastDates;
    
    private Map<String, DataRecord> cacheEquipments;
    
    private Map<Integer, DataRecord> cacheNextToDoDates;
    
    private Map<Integer, DataRecord> cachePmsNactives;
    
    private final String narrowPmsRestriction =
            " AND EXISTS (SELECT 1 FROM pmp WHERE pmp.pmp_id = pms.pmp_id AND pms.pms_id in (select pms_id from pms where pms_id not in (select pms_id from pms where (interval_freq = 1 and interval_1 = 0) or "
                    + "(interval_freq = 2 and interval_2 = 0) or "
                    + "(interval_freq = 3 and interval_3 = 0) or "
                    + "(interval_freq = 4 and interval_4 = 0)))) ";
    
    // ----------------------- implementation -----------------------------------------------------
    
    private final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * Pm Schedule Generator
     * 
     * @param dateFrom ,from date
     * @param dateTo,to date
     * @param restriction, restriction
     * @param createFutureDates,generate future date
     */
    public PmScheduleGenerator(final Date dateFrom, final Date dateTo, final String restriction,
            final boolean createFutureDates) {
        this.dateFrom = dateFrom;
        
        // kb#3037837: add 1 ms to parameter 'date_end' so that calculator in Period.java can return
        // date_end if it match the interval setting and calculating.
        this.dateTo = new Date();
        this.dateTo.setTime(dateTo.getTime() + 1);
        
        this.restriction = restriction + this.narrowPmsRestriction;
        this.createFutureDates = createFutureDates;
        
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
    @Override
    public void run() {
        this.status.setTotalNumber(100);
        
        // SQL Server JDBC driver requires either autoCommit=true, or SelectMethod=cursor
        // if multiple Statements are used within a single Connection
        // SelectMethod=cursor imposes severe performance penalty,
        // so we use autoCommit=true
        
        // add to fix KB3028545 by Guo Jiangtao 2010-08-25
        this.status.setResult(new JobResult(this.JOB_TITLE));
        
        final DataRecord pmsCountRecord = this.pmsCountDS.getRecord(this.restriction);
        this.pmsCount = pmsCountRecord.getInt("pms.pms_count");
        // TODO: expose pmsCount for UI status update
        
        if (this.log.isDebugEnabled()) {
            this.log
                .debug(MessageFormat
                    .format(
                        "Schedule dates generator: restriction [{0}], from [{1}] to [{2}], create future dates [{3}], count [{4}] ",
                        new Object[] { this.restriction, this.dateFrom, this.dateTo,
                                String.valueOf(this.createFutureDates),
                                String.valueOf(this.pmsCount) }));
        }
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Query for pms records... ");
        }
        
        this.status.setCurrentNumber(1);
        
        if (this.createFutureDates) {
            this.deleteFuturePmsd();
        }
        
        this.initializeDataCache();
        this.pmsSelectDS.queryRecords(this.restriction, this);
        
        this.status.setCurrentNumber(80);
        removeSupressedPMSD();
        this.status.setCurrentNumber(100);
        
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOP_REQUESTED);
            return;
        }
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Removes all supressed PM Schedule dates with date range.
     * 
     * By Zhang Yi
     */
    private void removeSupressedPMSD() {
        
        this.pmsdSuppressedDS.setParameter("dateFrom", this.dateFrom).setParameter("dateTo",
            this.dateTo);
        this.pmsdSuppressedDS.queryRecords(new RecordHandler() {
            
            // this callback method is called for each retrieved record
            public boolean handleRecord(final DataRecord record) {
                
                PmScheduleGenerator.this.pmsdSuppressedDS.deleteRecord(record);
                
                return true; // true to continue scrolling through the result set, false to stop
            }
            
        });
    }
    
    /**
     * Construct a location restriction string composed of field bl_id, fl_id and rm_id for given
     * table based on location field values of given pms record.
     * 
     * By Zhang Yi
     */
    private String getPmsLocationRestriction(final String tableToRestrict) {
        final String locationRestriction =
                " (   " + tableToRestrict + ".bl_id is null and pms.bl_id is null or "
                        + tableToRestrict + ".bl_id=pms.bl_id ) and  (  " + tableToRestrict
                        + ".fl_id is null and pms.fl_id is null or " + tableToRestrict
                        + ".fl_id=pms.fl_id ) and " + " ( " + tableToRestrict
                        + ".rm_id is null and pms.rm_id is null or " + tableToRestrict
                        + ".rm_id=pms.rm_id ) ";
        return locationRestriction;
    }
    
    public int pmsCounter = 0;
    
    public int pmsCount = 0;
    
    public int pmsdCounter = 0;
    
    public int surPmsdCounter = 0;
    
    public int totalsurPmsdRecords = 0;
    
    /**
     * This method is called for each PM Schedule record retrieved by DataSource in the
     * createScheduledDates method.
     * 
     * @param DataRecord record ,pms record
     */
    public boolean handleRecord(final DataRecord record) {
        if (this.stopRequested) {
            return false;
        }
        
        this.pmsCounter++;
        
        final int pmsId = record.getInt("pms.pms_id");
        final String eqId = record.getString("pms.eq_id");
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Start to forecast and generate pmsd for PM Schedule: [{0}]",
                new Object[] { String.valueOf(pmsId) }));
        }
        
        final Date now = new Date();
        Date dateNextTodo = now;
        
        // Determine PMS.NACTIVE: get a count of all date_assigned unique uncompletd Work Requests
        // for this pms.
        this.wrNActiveDS.setParameter("pmsId", pmsId);
        // wrNActiveDS.setAutoCommit(true);
        final int nActive = this.wrNActiveDS.getRecord().getInt("wr.nactive");
        
        // Determine the last completed Work Request for this pms. Determine pms.meter_last_pm from
        // the last "completed" wr record with a curr_meter_val for that pms.
        // Check both the current WR table (wr) and the historic WR table (hwr).
        Date dateLastCompleted = null;
        double meterLastCompleted = 0;
        Date dateLastCompletedHwr = null;
        double meterLastCompletedHwr = 0;
        
        if (this.cacheWrLastDates.get(pmsId) != null) {
            final DataRecord wrRecord = this.cacheWrLastDates.get(pmsId);
            dateLastCompleted = wrRecord.getDate("pms.last_completed");
            meterLastCompleted = wrRecord.getDouble("pms.last_meter");
        }
        
        if (this.cacheHwrLastDates.get(pmsId) != null) {
            final DataRecord hwrRecord = this.cacheHwrLastDates.get(pmsId);
            dateLastCompletedHwr = hwrRecord.getDate("pms.last_completed");
            meterLastCompletedHwr = hwrRecord.getDouble("pms.last_meter");
        }
        
        if (dateLastCompleted == null
                || (dateLastCompletedHwr != null && dateLastCompletedHwr.after(dateLastCompleted))) {
            dateLastCompleted = dateLastCompletedHwr;
        }
        if (meterLastCompletedHwr > meterLastCompleted) {
            meterLastCompleted = meterLastCompletedHwr;
        }
        
        final String intervalType = record.getString("pms.interval_type");
        final int intervalFrequency = record.getInt("pms.interval_freq");
        final int interval = record.getInt("pms.interval_" + intervalFrequency);
        
        // For PM schedules based on manual scheduling get the minimum next date from pmsd
        // that is greater than the current date.
        if (intervalType.equals("a")) {
            // For PM schedules based on manual scheduling get the minimum next date from pmsd
            // that is greater than the current date.
            final DataRecord nextRecord = this.cacheNextToDoDates.get(pmsId);
            final Date nextDate =
                    nextRecord == null ? null : nextRecord.getDate("pms.next_date_todo");
            if (nextDate != null) {
                dateNextTodo = nextDate;
            }
            
        } else if (interval > 0) {
            // For PM schedules based on metered usage: (pms.interval_type in ('i','h','e')):
            // pms.date_next_todo is calculated based on the following:
            // eq.meter, eq.meter_usage_per_day,
            // pms.meter_last_pm, pms.fixed, pms.interval_freq,
            // pms.date_first_todo, Date_last_completed
            // and the appropriate interval
            if (intervalType.equals("i") || intervalType.equals("h") || intervalType.equals("e")) {
                // miles, hours, meter
                
                // String eqId = record.getString("pms.eq_id");
                if (StringUtil.notNullOrEmpty(eqId)) {
                    
                    final DataRecord eqRecord = this.cacheEquipments.get(eqId);
                    final double meter = eqRecord.getDouble("eq.meter");
                    final double meterUsagePerDay = eqRecord.getDouble("eq.meter_usage_per_day");
                    
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
                        final Period periodNextTodo =
                                new Period(Period.YEAR, 99, clearTimePartOfDateValue(dateNextTodo));
                        periodNextTodo.setNoOfIntervals(0);
                        createForecastDates(pmsId, periodNextTodo);
                        
                    } else if (meterUsagePerDay > 0) {
                        final int daysInterval = (int) (interval / meterUsagePerDay);
                        
                        // Establish "initial" next dates: If no Work Orders have been completed for
                        // this pms then the intitial next date is the first date, else add the
                        // interval.
                        final Date dateFirstTodo = record.getDate("pms.date_first_todo");
                        if (dateLastCompleted == null) {
                            dateNextTodo = dateFirstTodo;
                        } else {
                            if (record.getInt("pms.fixed") == 0) {
                                // floating
                                dateNextTodo =
                                        Period.incrementDate(
                                            clearTimePartOfDateValue(dateLastCompleted),
                                            Period.CUSTOM, daysInterval);
                            } else {
                                // fixed
                                dateNextTodo =
                                        Period.incrementDate(
                                            clearTimePartOfDateValue(dateFirstTodo), Period.CUSTOM,
                                            daysInterval);
                            }
                        }
                        
                        final Period periodNextTodo =
                                new Period(Period.CUSTOM, daysInterval,
                                    clearTimePartOfDateValue(dateNextTodo));
                        periodNextTodo.setNoOfIntervals(0);
                        createForecastDates(pmsId, periodNextTodo);
                    }
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
                    
                    final Date d =
                            Period.incrementDate(clearTimePartOfDateValue(dateNextTodo),
                                intervalType, interval);
                    if (d.before(now) && nActive == 0) {
                        dateNextTodo = now;
                    }
                } else {
                    if (record.getInt("pms.fixed") == 0) {
                        // floating
                        final Date dateNextAltTodo = record.getDate("pms.date_next_alt_todo");
                        if (dateNextAltTodo == null || dateNextAltTodo.before(now)) {
                            dateNextTodo =
                                    Period.incrementDate(
                                        clearTimePartOfDateValue(dateLastCompleted), intervalType,
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
                        final Date dateFirstTodo = record.getDate("pms.date_first_todo");
                        dateNextTodo =
                                Period.incrementDate(clearTimePartOfDateValue(dateFirstTodo),
                                    intervalType, interval);
                        dateNextTodo =
                                Period.getDateAfter(clearTimePartOfDateValue(dateNextTodo),
                                    clearTimePartOfDateValue(dateLastCompleted), intervalType,
                                    interval);
                    }
                }
                
                if (this.createFutureDates) {
                    final Period periodNextTodo =
                            new Period(intervalType, interval,
                                clearTimePartOfDateValue(dateNextTodo));
                    periodNextTodo.setNoOfIntervals(0);
                    
                    createForecastDates(pmsId, periodNextTodo);
                }
            }
            
        }
        
        record.setValue("pms.nactive", nActive);
        record.setValue("pms.date_last_completed", dateLastCompleted);
        record.setValue("pms.meter_last_pm", meterLastCompleted);
        record.setValue("pms.date_next_todo", new java.sql.Date(dateNextTodo.getTime()));
        this.pmsUpdateDS.updateRecord(record);
        
        if (pmsId % 1000 == 0) {
            //this.pmsUpdateDS.commit();
            
            this.log
                .debug(MessageFormat.format(
                    "Total pms generated: [{0}], total pmsd generated [{1}] ", new Object[] {
                            String.valueOf(this.pmsCounter), String.valueOf(this.pmsdCounter) }));
        }
        
        this.status.setCurrentNumber(1 + 79 * this.pmsCounter / this.pmsCount);
        return true;
    }
    
    /**
     * Create forecasted dates for chosen schedule and date range.
     * 
     * @param pmsId PM Schedule id
     * @param periodNextTodo Period Next todo
     */
    private void createForecastDates(final int pmsId, final Period periodNextTodo) {
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Generating pmsd for PM Schedule: [{0}], from [{1}] to [{2}]", new Object[] {
                        String.valueOf(pmsId), this.dateFrom, this.dateTo }));
        }
        
        // create new pmsd records
        // increment the date starting from dateNextTodo until it is within the date range
        // keep incrementing while the date is in the range, calling the callback for each increment
        periodNextTodo.iterate(this.dateFrom, this.dateTo, new Callback() {
            public boolean call(final Date currentDate) {
                final DataRecord pmsdRecord =
                        PmScheduleGenerator.this.pmsdCreateDS.createNewRecord();
                pmsdRecord.setValue("pmsd.pms_id", pmsId);
                pmsdRecord.setValue("pmsd.date_todo", currentDate);
                PmScheduleGenerator.this.pmsdCreateDS.saveRecord(pmsdRecord);
                PmScheduleGenerator.this.pmsdCounter++;
                return true;
            }
        });
    }
    
    // ----------------------- data sources -------------------------------------------------------
    
    private DataSourceGroupingImpl pmsCountDS;
    
    private DataSource pmsSelectDS;
    
    private DataSource pmsUpdateDS;
    
    private DataSource pmsdDeleteDS;
    
    private DataSource pmsdCreateDS;
    
    private DataSource pmsdSuppressedDS;
    
    private DataSource wrNActiveDS;
    
    /**
     * Creates data sources initially.
     */
    private void createDataSources() {
        
        this.pmsCountDS = new DataSourceGroupingImpl();
        this.pmsCountDS.addTable("pms");
        this.pmsCountDS.addCalculatedField("pms", "pms_count", DataSource.DATA_TYPE_INTEGER, 6, 0,
            "count", "pms.pms_id");
        this.pmsCountDS.setApplyVpaRestrictions(false);
        
        this.pmsSelectDS =
                DataSourceFactory.createDataSourceForFields("pms", new String[] { "pms_id",
                        "fixed", "eq_id", "interval_type", "interval_freq", "interval_1",
                        "interval_2", "interval_3", "interval_4", "date_first_todo",
                        "date_next_todo", "date_next_alt_todo", "date_last_completed",
                        "meter_last_pm", "nactive", "bl_id", "fl_id", "rm_id", "pmp_id" });
        this.pmsSelectDS.setApplyVpaRestrictions(false);
        
        this.pmsUpdateDS =
                DataSourceFactory.createDataSourceForFields("pms", new String[] { "pms_id",
                        "nactive", "date_last_completed", "meter_last_pm", "date_next_todo" });
        this.pmsUpdateDS.setApplyVpaRestrictions(false);
        
        this.pmsdCreateDS =
                DataSourceFactory.createDataSourceForFields("pmsd", new String[] { "pms_id",
                        "date_todo" });
        this.pmsdCreateDS.setApplyVpaRestrictions(false);
        
        this.pmsdSuppressedDS =
                DataSourceFactory
                    .createDataSourceForFields("pmsd", new String[] { "pms_id", "date_todo" })
                    .addQuery(
                        " Select pmsd.pms_id, pmsd.date_todo from pmsd "
                                + " left outer join pms on pms.pms_id=pmsd.pms_id "
                                + " left outer join pmp ${sql.as} outer_pmp on outer_pmp.pmp_id=pms.pmp_id "
                                + " where exists (                                      "
                                + "          select 1 from pmsd  ${sql.as} inner_pmsd "
                                + "                   left outer join pms ${sql.as} inner_pms on inner_pmsd.pms_id=inner_pms.pms_id "
                                + "                   left outer join pmp ${sql.as} inner_pmp on inner_pms.pmp_id=inner_pmp.pmp_id  "
                                + "                   where pmsd.date_todo=inner_pmsd.date_todo "
                                + "                       and inner_pmp.pmp_ids_to_suppress like '%'${sql.concat}RTRIM(outer_pmp.pmp_id)${sql.concat}'%' "
                                + "                       and ( ( inner_pms.eq_id=pms.eq_id and inner_pmp.pmp_type='EQ' and outer_pmp.pmp_type='EQ') or "
                                + "                             ( inner_pms.bl_id=pms.bl_id or ( pms.bl_id is null and inner_pms.bl_id is null ) ) and "
                                + "                             ( inner_pms.fl_id=pms.fl_id or ( pms.fl_id is null and inner_pms.fl_id is null ) ) and "
                                + "                             ( inner_pms.rm_id=pms.rm_id or ( pms.rm_id is null and inner_pms.rm_id is null ) ) and "
                                + "                             ( inner_pmp.pmp_type='HK' and outer_pmp.pmp_type='HK' )"
                                + "                           ) "
                                + "         )  "
                                + "         AND date_todo >= ${parameters['dateFrom']} AND date_todo <= ${parameters['dateTo']}"
                                + "         AND " + this.restriction)
                    .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                    .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE);
        this.pmsdSuppressedDS.setApplyVpaRestrictions(false);
        
        this.pmsdDeleteDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable("pmsd")
                    .addQuery(
                        "DELETE FROM pmsd WHERE pmsd.date_todo >= ${parameters['dateFrom']} AND pmsd.date_todo <= ${parameters['dateTo']} "
                                // kb#3037893: for pms which having interval type'manual', don't
                                // delete their pmsd.
                                + " AND pmsd.pms_id IN ( SELECT pms.pms_id from pms where pms.interval_type!='a' and "
                                + this.restriction + ") ")
                    .addParameter("dateFrom", "", DataSource.DATA_TYPE_DATE)
                    .addParameter("dateTo", "", DataSource.DATA_TYPE_DATE);
        this.pmsdDeleteDS.setApplyVpaRestrictions(false);
        
        this.wrNActiveDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable("wr")
                    .addQuery(
                        "SELECT COUNT(DISTINCT date_assigned) ${sql.as} nactive FROM wr WHERE pms_id = ${parameters['pmsId']} AND date_completed IS NULL")
                    .addVirtualField("wr", "nactive", DataSource.DATA_TYPE_INTEGER)
                    .addParameter("pmsId", "", DataSource.DATA_TYPE_INTEGER);
        this.wrNActiveDS.setApplyVpaRestrictions(false);
    }
    
    /**
     * Initial load data so that reduce DataBase accessing times during loop of PM Schedules.
     * 
     * By Zhang Yi
     */
    private void initializeDataCache() {
        this.cachePmsLastDate();
        this.cacheEquipment();
        this.cachePmsDateToDo();
    }
    
    /**
     * Initial load date last completed and meter last completed for pm schedules queried from
     * DataBase to a map.
     * 
     * By Zhang Yi
     */
    private void cachePmsLastDate() {
        this.cacheWrLastDates = new HashMap<Integer, DataRecord>();
        this.cacheHwrLastDates = new HashMap<Integer, DataRecord>();
        
        final String wrLocationRestriction = getPmsLocationRestriction("wr");
        final DataSource wrLastDateDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable("pms")
                    .addQuery(
                        "       SELECT pms.pms_id, "
                                + "  MAX(wr.date_completed)  ${sql.as} last_completed,  "
                                + "  MAX(curr_meter_val) ${sql.as} last_meter  "
                                + " from wr left outer join pms on pms.pms_id=wr.pms_id where "
                                + " ( date_completed IS NOT NULL "
                                + "     OR ( "
                                + "         wr.eq_id = pms.eq_id "
                                + "         AND "
                                + "         EXISTS (SELECT 1 FROM pmp WHERE exists ( select 1 from pms inter where inter.pms_id=wr.pms_id and inter.pmp_id = pmp.pmp_id  )  )"
                                + "        )"
                                + "     OR ( "
                                + "         wr.eq_id IS NULL AND "
                                + wrLocationRestriction
                                + "         AND "
                                + "         EXISTS (SELECT 1 FROM pmp WHERE exists ( select 1 from pms inter where inter.pms_id=wr.pms_id and inter.pmp_id = pmp.pmp_id  )  )"
                                + "     ) " + "  ) and " + this.restriction
                                + " group by pms.pms_id ")
                    .addVirtualField("pms", "last_completed", DataSource.DATA_TYPE_DATE)
                    .addVirtualField("pms", "last_meter", DataSource.DATA_TYPE_NUMBER);
        wrLastDateDS.setApplyVpaRestrictions(false);
        final List<DataRecord> records = wrLastDateDS.getAllRecords();
        for (final DataRecord record : records) {
            this.cacheWrLastDates.put(record.getInt("pms.pms_id"), record);
        }
        
        final String hwrLocationRestriction = getPmsLocationRestriction("hwr");
        final DataSource hwrLastDateDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable("pms")
                    .addQuery(
                        "       SELECT pms.pms_id, "
                                + "  MAX(hwr.date_completed)  ${sql.as} last_completed,  "
                                + "  MAX(curr_meter_val) ${sql.as} last_meter  "
                                + " from hwr left outer join pms on pms.pms_id=hwr.pms_id where "
                                + " ( date_completed IS NOT NULL "
                                + "     OR ( "
                                + "         hwr.eq_id = pms.eq_id "
                                + "         AND "
                                + "         EXISTS (SELECT 1 FROM pmp WHERE exists ( select 1 from pms inter where inter.pms_id=hwr.pms_id and inter.pmp_id = pmp.pmp_id  )  )"
                                + "        )"
                                + "     OR ( "
                                + "         hwr.eq_id IS NULL AND "
                                + hwrLocationRestriction
                                + "         AND "
                                + "         EXISTS (SELECT 1 FROM pmp WHERE exists ( select 1 from pms inter where inter.pms_id=hwr.pms_id and inter.pmp_id = pmp.pmp_id  )  )"
                                + "     ) " + "  ) and " + this.restriction
                                + " group by pms.pms_id ")
                    .addVirtualField("pms", "last_completed", DataSource.DATA_TYPE_DATE)
                    .addVirtualField("pms", "last_meter", DataSource.DATA_TYPE_NUMBER);
        hwrLastDateDS.setApplyVpaRestrictions(false);
        
        for (final DataRecord record : hwrLastDateDS.getAllRecords()) {
            this.cacheHwrLastDates.put(record.getInt("pms.pms_id"), record);
        }
        
    }
    
    /**
     * Initial query dates next to for pm schedules from DataBase to a map.
     * 
     * By Zhang Yi
     */
    private void cachePmsDateToDo() {
        
        this.cacheNextToDoDates = new HashMap<Integer, DataRecord>();
        
        final DataSource pmsToDoDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable("pms")
                    .addQuery(
                        
                        " select pms.pms_id, ( SELECT MIN(date_todo) FROM pmsd WHERE pmsd.pms_id = pms.pms_id AND date_todo >= ${sql.currentDate} ) ${sql.as} next_date_todo "
                                + " from pms where " + this.restriction)
                    .addVirtualField("pms", "next_date_todo", DataSource.DATA_TYPE_DATE);
        pmsToDoDS.setApplyVpaRestrictions(false);
        final List<DataRecord> records = pmsToDoDS.getAllRecords();
        for (final DataRecord record : records) {
            this.cacheNextToDoDates.put(record.getInt("pms.pms_id"), record);
        }
        
    }
    
    /**
     * Initial load equipment for pm schedules queried from DataBase to a map.
     * 
     * By Zhang Yi
     */
    private void cacheEquipment() {
        this.cacheEquipments = new HashMap<String, DataRecord>();
        
        final DataSource pmsEqDS =
                DataSourceFactory.createDataSourceForFields(new String[] { "pms", "eq" },
                    new String[] { "pms.eq_id", "eq.meter_usage_per_day", "eq.meter" }).addQuery(
                    "       SELECT distinct pms.eq_id, eq.meter_usage_per_day, eq.meter "
                            + " from pms left outer join eq on eq.eq_id=pms.eq_id " + " where "
                            + this.restriction);
        pmsEqDS.setApplyVpaRestrictions(false);
        final List<DataRecord> records = pmsEqDS.getAllRecords();
        for (final DataRecord record : records) {
            this.cacheEquipments.put(record.getString("pms.eq_id"), record);
        }
    }
    
    /**
     * Batch delete pmsd records for all filtered out pm schedules and specified date range.
     * 
     * By Zhang Yi
     */
    private void deleteFuturePmsd() {
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format("Deleting future pmsd from [{1}] to [{2}]",
                new Object[] { this.dateFrom, this.dateTo }));
        }
        
        // deletes any current pmsd records for date range
        this.pmsdDeleteDS.setParameter("dateFrom", this.dateFrom);
        this.pmsdDeleteDS.setParameter("dateTo", this.dateTo);
        this.pmsdDeleteDS.executeUpdate();
    }
    
    /**
     * Add a function to clear the time part of a Date value before pass it as parameter to call the
     * common service Period, thus the comparision inside the Period can work correctly.
     * 
     * By Zhang Yi
     */
    private Date clearTimePartOfDateValue(final Date date) {
        
        // determine end date
        final Calendar c = Calendar.getInstance();
        c.setTime(date);
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return (Date) c.getTime().clone();
        
    }
    
}
