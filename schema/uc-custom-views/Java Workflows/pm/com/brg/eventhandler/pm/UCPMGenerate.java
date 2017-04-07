package com.brg.eventhandler.pm;

import java.text.ParseException;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.datasource.DataSource;
import com.archibus.datasource.DataSourceFactory;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.prevmaint.PreventiveMaintenanceCommonHandler;

import com.archibus.utility.*;
import java.text.SimpleDateFormat;
import java.text.MessageFormat;
import org.json.*;

import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.jobmanager.Job;
import com.archibus.jobmanager.JobBase;
import com.archibus.jobmanager.JobManager;
import com.archibus.jobmanager.JobStatus;
import com.archibus.jobmanager.JobStatus.JobResult;



public class UCPMGenerate extends EventHandlerBase {

   private static final String ACTIVITY_ID = "AbBldgOpsPM";

    /**
     * Calls the Stock generate PM WO workflow and then calls the custom
     * after processing routines. 
     * 
     * These parameters need to be set in the afm_activity_params table:
     *   UC_GENWO_RUN : Only auto-updates if set to Y.
     *   UC_GENWO_PERIOD : Determines if the period is in months (M) or days (D). Default M.
     *   UC_GENWO_PERIODLENGTH : The length of the period.  Default 1.
     * 
     * @param context
     * @throws ParseException 
     * @throws ExceptionBase 
     */
    public void generateEQPM(EventHandlerContext context) throws ExceptionBase, ParseException {
		Object genFlagObj = selectDbValue(context, "afm_activity_params", "param_value",
				"activity_id = 'AbBldgOpsPM' AND param_id = 'UC_GENWO_RUN'");

		if (genFlagObj == null || !genFlagObj.toString().equals("Y")) {
			this.log.info("Generate PM procedures Ran, but process flag not set.");
			return;
		}
    			
        PreventiveMaintenanceCommonHandler pmCommonHandler = new PreventiveMaintenanceCommonHandler();
        
        // Set parameters if needed
        String dateFrom = null;
        String dateTo = null;
		if (context.parameterExistsNotEmpty("dateFrom")) {
			dateFrom = context.getString("dateFrom");
			dateTo = context.getString("dateTo");
		}
		else {
			Object periodObj = selectDbValue(context, "afm_activity_params", "param_value",
				"activity_id = 'AbBldgOpsPM' AND param_id = 'UC_GENWO_PERIOD'");
		
			int period = Calendar.MONTH;
			if (periodObj != null && periodObj.toString().equals("D")) {
				period = Calendar.DATE;
			}
			
			Object periodLengthObj = selectDbValue(context, "afm_activity_params", "param_value",
				"activity_id = 'AbBldgOpsPM' AND param_id = 'UC_GENWO_PERIODLENGTH'");
			
			int periodLength = 1;
			if (periodLengthObj != null) {
				periodLength = Integer.parseInt(periodLengthObj.toString());
			}
			
			Calendar cal = Calendar.getInstance();

			String ds = Integer.toString(cal.get(Calendar.YEAR)) + "-" + Integer.toString(cal.get(Calendar.MONTH)+1) + "-" + Integer.toString(cal.get(Calendar.DAY_OF_MONTH));

			cal.add(period, periodLength);
			
			String de = Integer.toString(cal.get(Calendar.YEAR)) + "-" + Integer.toString(cal.get(Calendar.MONTH)+1) + "-" + Integer.toString(cal.get(Calendar.DAY_OF_MONTH));
			
			dateFrom = ds;
	        dateTo = de;
		}

		String pmsidRestriction = null;
		if (context.parameterExistsNotEmpty("pmsidRestriction")) {
			pmsidRestriction = context.getString("pmsidRestriction");
		}
		else {
    		Object pmsResObj = selectDbValue(context, "afm_activity_params", "param_value",
				"activity_id = 'AbBldgOpsPM' AND param_id = 'UC_GENWO_PMSIDREST'");
    		
    		pmsidRestriction = notNull(pmsResObj);
		}

		String generateNewDate = "false";
		//if (context.parameterExistsNotEmpty("generateNewDate")) {
		//  generateNewDate = "true";
		//}		

		String useGroupCode = "false";
		if (context.parameterExistsNotEmpty("useGroupCode")) {
	        useGroupCode = context.getString("useGroupCode");
		}		
		
		String groupBy = "0";
		if (context.parameterExistsNotEmpty("groupBy")) {
			groupBy = context.getString("groupBy");
		}	
		
		String pmType = "EQPM";
		if (context.parameterExistsNotEmpty("pmType")) {
			pmType = context.getString("pmType");
		}	

        // Run the Stock Generate WO
		pmCommonHandler.PmWorkOrderGenerator(dateFrom, dateTo, pmType, groupBy, generateNewDate, useGroupCode, pmsidRestriction);

        // get the Gen WO ID
    	Map contextResponse = context.getResponse();
    	JSONObject jobInfo = new JSONObject((String) contextResponse.get("jsonExpression"));
    	
    	// start the UCPMJob.
    	JobManager.ThreadSafe jobManager = getJobManager(context);
    	UCPMJob pmJob = new UCPMJob(jobInfo.getString("jobId"));
    	
        String jobId = jobManager.startJob(pmJob);

        log.debug("UC EQ Preventive Maintenance Post processing - Job Number: "+jobId);
    }
	
    /**
     * Calls the Stock generate PM WO workflow and then calls the custom
     * after processing routines. 
     * 
     * These parameters need to be set in the afm_activity_params table:
     *   UC_GENWO_RUN : Only auto-updates if set to Y.
     *   UC_GENWO_PERIOD : Determines if the period is in months (M) or days (D). Default M.
     *   UC_GENWO_PERIODLENGTH : The length of the period.  Default 1.
     * 
     * @param context
     * @throws ParseException 
     * @throws ExceptionBase 
     */
    public void generateHSPM(EventHandlerContext context) throws ExceptionBase, ParseException {
		Object genFlagObj = selectDbValue(context, "afm_activity_params", "param_value",
			"activity_id = 'AbBldgOpsPM' AND param_id = 'UC_GENWO_RUN'");

		if (genFlagObj == null || !genFlagObj.toString().equals("Y")) {
			this.log.info("Generate PM procedures Ran, but process flag not set.");
			return;
		}
				
		PreventiveMaintenanceCommonHandler pmCommonHandler = new PreventiveMaintenanceCommonHandler();
		
        // Set parameters if needed
		String dateFrom = null;
		String dateTo = null;
		if (context.parameterExistsNotEmpty("dateFrom")) {
			dateFrom = context.getString("dateFrom");
			dateTo = context.getString("dateTo");
		}
		else {
			Object periodObj = selectDbValue(context, "afm_activity_params", "param_value",
			"activity_id = 'AbBldgOpsPM' AND param_id = 'UC_GENWO_PERIOD'");

			int period = Calendar.MONTH;
			if (periodObj != null && periodObj.toString().equals("D")) {
				period = Calendar.DATE;
			}

			Object periodLengthObj = selectDbValue(context, "afm_activity_params", "param_value",
			"activity_id = 'AbBldgOpsPM' AND param_id = 'UC_GENWO_PERIODLENGTH'");

			int periodLength = 1;
			if (periodLengthObj != null) {
				periodLength = Integer.parseInt(periodLengthObj.toString());
			}

			Calendar cal = Calendar.getInstance();

			String ds = Integer.toString(cal.get(Calendar.YEAR)) + "-" + Integer.toString(cal.get(Calendar.MONTH)+1) + "-" + Integer.toString(cal.get(Calendar.DAY_OF_MONTH));

			cal.add(period, periodLength);

			String de = Integer.toString(cal.get(Calendar.YEAR)) + "-" + Integer.toString(cal.get(Calendar.MONTH)+1) + "-" + Integer.toString(cal.get(Calendar.DAY_OF_MONTH));

			dateFrom = ds;
			dateTo = de;
		}

		String pmsidRestriction = null;
		if (context.parameterExistsNotEmpty("pmsidRestriction")) {
			pmsidRestriction = context.getString("pmsidRestriction");
		}
		else {
			Object pmsResObj = selectDbValue(context, "afm_activity_params", "param_value",
			"activity_id = 'AbBldgOpsPM' AND param_id = 'UC_GENWO_PMSIDREST'");

			pmsidRestriction = notNull(pmsResObj);
		}

		String generateNewDate = "false";
		//if (context.parameterExistsNotEmpty("generateNewDate")) {
		//  generateNewDate = "true";
		//}		

		String useGroupCode = "false";
		if (context.parameterExistsNotEmpty("useGroupCode")) {
			useGroupCode = context.getString("useGroupCode");
		}		

		String groupBy = "0";
		if (context.parameterExistsNotEmpty("groupBy")) {
			groupBy = context.getString("groupBy");
		}	

		String pmType = "HSPM";
		if (context.parameterExistsNotEmpty("pmType")) {
			pmType = context.getString("pmType");
		}	

		// Run the Stock Generate WO
		pmCommonHandler.PmWorkOrderGenerator(dateFrom, dateTo, pmType, groupBy, generateNewDate, useGroupCode, pmsidRestriction);


		// get the Gen WO ID
		Map contextResponse = context.getResponse();
		JSONObject jobInfo = new JSONObject((String) contextResponse.get("jsonExpression"));
		        
		// start the UCPMJob.
		JobManager.ThreadSafe jobManager = getJobManager(context);
		UCPMJob pmJob = new UCPMJob(jobInfo.getString("jobId"));
		
		String jobId = jobManager.startJob(pmJob);
        log.debug("UC HS Preventative Maintenance Post processing - Job Number: "+jobId);
    }
    
	public void BRGPmScheduleGenerator(EventHandlerContext context) throws ExceptionBase,
            ParseException {

		
		if (context.parameterExistsNotEmpty("dateFrom")) {
			if (!isDateRangeParameterValid(context)) {
				handlerDateRangeError(context);
			}
		}
        
        //Retrieve parameters come from JS client
        boolean createFutureDates = true;
        boolean RecreateDatesFromScratch = false;
		String pmsidRestriction ="";
		
		SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
		
		java.sql.Date dt = Utility.currentDate();
       // String current_date = formatSqlFieldValue(context, date, "java.sql.Date","current_date");
		Date dateStart;
		Date dateEnd;

		if (context.parameterExistsNotEmpty("dateFrom")) {
			dateStart = dateFormat.parse((String) context.getParameter("dateFrom"));
			dateEnd = dateFormat.parse((String) context.getParameter("dateTo"));
		}
		else {
			SimpleDateFormat yrFormat = new SimpleDateFormat("yyyy");
			int mnth = dt.getMonth();
			int yr = Integer.parseInt(yrFormat.format(dt));
			String ds = Integer.toString(yr) + "-" + Integer.toString(mnth + 2) + "-01";
			if (mnth == 11) {
				ds = Integer.toString(yr + 1)  + "-01-01";
			}
			else {
				ds = Integer.toString(yr) + "-"  + Integer.toString(mnth + 2) + "-01";
			}
			dateStart =  dateFormat.parse((String) ds);
			
			String de = Integer.toString(yr + 1) + "-"  + Integer.toString(mnth + 1) + "-01";
			dateEnd = dateFormat.parse((String) de);
		}
		
		if (context.parameterExistsNotEmpty("pmsidRestriction")) {
			pmsidRestriction = (String) context.getParameter("pmsidRestriction");
		}
        if (context.parameterExistsNotEmpty("createFutureDates")) {
            createFutureDates = context.getBoolean("createFutureDates");
        }
        if (context.parameterExistsNotEmpty("RecreateDatesFromScratch")) {
            RecreateDatesFromScratch = context.getBoolean("RecreateDatesFromScratch");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format("Run BRGPmScheduleGenerator between [{0}] to [{1}].",
                new Object[] { dateStart, dateEnd }));
        }

        //Call BRGPmScheduleGenerator to create schedule date records in table pmsd.
        BRGPmScheduleGenerator generator = new BRGPmScheduleGenerator(dateStart, dateEnd,pmsidRestriction, createFutureDates,RecreateDatesFromScratch);

        long t = System.currentTimeMillis();
        startJob(context, generator);

        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Total time for executing BRGPmScheduleGenerator is [{0}].", new Object[] { String
                    .valueOf(System.currentTimeMillis() - t) }));
        }
    }
	/**
     * This method validate the  date range parameters, only take EventHandlerContext as parameter. In
     * this method, the dateFrom and dateTo value come from context. If dateFrom or dateTo is null,
     * or date value is not valid(by calling isDateRangeValid), return false and set error message
     * in response of context.
     *
     * By Zhang Yi
     * 
     * @param context Event handler context.
     * @return
     */	
	 private boolean isDateRangeParameterValid(EventHandlerContext context) {
        boolean isValid = false;

        if (context.parameterExists("dateFrom") && context.parameterExists("dateTo")) {
            String dateFrom = notNull(context.getParameter("dateFrom"));
            String dateTo = notNull(context.getParameter("dateTo"));
            if (isDateRangeValid(context, dateFrom, dateTo)) {
                isValid = true;
            }
        }
        return isValid;
    }
	  /**
     * This method validate date range values itself, take EventHandlerContext , dateFrom value
     * and dateTo value as parameters. Here assume date's format from JS CLIENT is "yyyy-MM-dd". If
     * both date values is valid and dateFrom before dateTo, return true; else return false.
     *
     * By Zhang Yi
     * 
     * @param context: Event handler context.
     * @param dateFrom: from date value in string format
     * @param dateTo: to date value in string format
     * @return
     * 
     */
    private boolean isDateRangeValid(EventHandlerContext context, String dateFrom, String dateTo) {
        Calendar cFrom = Calendar.getInstance();
        SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        Date from = null, to = null;
        try {
            from = dateFormat.parse(dateFrom);
        } catch (ParseException e) {
            e.printStackTrace();
            return false;
        }
        cFrom.setTime(from);
        Calendar cTo = Calendar.getInstance();
        try {
            to = dateFormat.parse(dateTo);
        } catch (ParseException e) {
            e.printStackTrace();
            return false;
        }
        cTo.setTime(to);
        if (cTo.before(cFrom)) {
            return false;
        }
        return true;
    }

	/**
     * This method handler date range error: set error message picked form database, then throw
     * exception.

     * By Zhang Yi
     * 
     * @param context Event handler context.
     */
    private void handlerDateRangeError(EventHandlerContext context) {
        String errMessage = localizeMessage(context, ACTIVITY_ID,
            "PreventiveMaintenanceCommonHandler", "NullDateRange", null);
        context.addResponseParameter("message", errMessage);
        IllegalArgumentException originalException = new IllegalArgumentException();
        ExceptionBase customException = new ExceptionBase(null, errMessage, originalException);
        customException.setLocalizedMessage(errMessage);
        throw customException;
    }
/**
     * This method start a job, set status to result
     * 
     * By Zhang Yi
     * 
     * @param context: Event handler context.
     * @param job: job object.
     * 
     */
    private void startJob(EventHandlerContext context, Job job) {
        JobManager.ThreadSafe jobManager = getJobManager(context);
        String jobId = jobManager.startJob(job);

        // add the status to the response
        JSONObject result = new JSONObject();
        result.put("jobId", jobId);

        // get the job status from the job id
        JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());

        context.addResponseParameter("jsonExpression", result.toString());
    }


    /**
     * This method serve as a WFR to add PM Schedules for multiple equipments and procedures. 
     * Modified by BRG to handle the recommended intervals
     * 
     * By Zhang Yi
     * 
     * @param context: Event handler context.
     * 
     */
    public void addPMSForMultiEq(EventHandlerContext context) {

        JSONArray equipments = context.getJSONArray("equipments");
        JSONArray procs = context.getJSONArray("procs");

        DataSource insertPMSDS = DataSourceFactory.createDataSourceForFields("pms", new String[] {
                "pmp_id", "eq_id", "interval_1", "interval_type" });
        
        boolean nullPms=false;
        if(insertPMSDS.getRecord()==null)
            nullPms = true;

        DataSource eqDS = DataSourceFactory.createDataSourceForFields("eq", new String[] {
                "qty_pms", "eq_id" });
        
        //For each equipment, add PM Schedule and update pm schedule count value in eq table.
        for (int i = 0; i < equipments.length(); i++) {
            JSONObject eq = equipments.getJSONObject(i);
            String eq_id = eq.getString("eq.eq_id");

            //For current equipment and each procedure, create a new PMS.
            for (int j = 0; j < procs.length(); j++) {
                JSONObject proc = procs.getJSONObject(j);
                String pmp_id = proc.getString("pmp.pmp_id");
                //modified for kb 3024355, by zhang yi 
                if(!nullPms){
                    insertPMSDS.addQuery(
                                    "INSERT INTO pms (eq_id, pmp_id,interval_1, interval_type) " 
                                            + "SELECT DISTINCT '" + eq_id + "','" + pmp_id + "', interval_rec, interval_type " + "FROM pmp "
                                            + "WHERE pmp_id ='" + pmp_id + "' "
                                            + "AND NOT EXISTS (SELECT 1 FROM pms WHERE eq_id ='" + eq_id
                                            + "' AND pmp_id ='" + pmp_id + "')")
                                .executeUpdate();
                }
                else{
                    insertPMSDS.addQuery(
                                    "INSERT INTO pms (eq_id, pmp_id,interval_1, interval_type) "
                                    + "SELECT '" + eq_id + "','" + pmp_id + "', interval_rec, interval_type " + "FROM pmp "
                                    + "WHERE pmp_id ='" + pmp_id + "' ")
                                .executeUpdate();
                    nullPms = false;
                }
            }
            
            eqDS.addQuery(
                    "UPDATE eq SET qty_pms = (SELECT COUNT (1) FROM pms WHERE eq_id ='" + eq_id + "')"
                     + " WHERE eq_id='" + eq_id + "'")
                .executeUpdate();
        }
    }
}
