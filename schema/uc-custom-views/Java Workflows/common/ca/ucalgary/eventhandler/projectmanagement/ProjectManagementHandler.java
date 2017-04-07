package  ca.ucalgary.eventhandler.projectmanagement;

import java.util.*;

import org.json.*;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;
import com.archibus.eventhandler.helpdesk.RequestHandler;

import java.io.UnsupportedEncodingException;
import java.text.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.jobmanager.*;

/**
 * This event handler implements business logic related to Project Management.
 * 
 */
public class ProjectManagementHandler extends EventHandlerBase {

    // @translatable
    protected final static String errorMsgMissingRequestor = "Requestor for Action Item [{0}] is invalid or is missing";


    // enable db exceptions for testing
    final static boolean throwException = false;

    final String prefix = "[A/FM] ";

    final String newLine = " \n\n ";

    /**
     * getCurrrentDate
     * 
     *@param context Description of the Parameter
     *@exception ExceptionBase Description of the Exception
     */
    public String getCurrentDate(EventHandlerContext context) {
        java.sql.Date date = Utility.currentDate();
        final String current_date = formatSqlFieldValue(context, date, "java.sql.Date",
            "current_date");
        return current_date;
    }

  

    /**
     * CreateWorkRequestForAction rule Copies field values from a selected activity_log record to
     * create a work request
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */
    public void brgCreateWorkRequestForAction(EventHandlerContext context) {
	
	//BRG insert a new activity_log tied back to the Project Action's activity_log_id via the assessment_id
		
		final String activityLogId = (String) context.getParameter("assessment_id");
		
		final String requestor = (String) context.getParameter("requestor");
		final String phone = (String) context.getParameter("phone");
		final String bl_id = (String) context.getParameter("bl_id");
		final String fl_id = (String) context.getParameter("fl_id");
		final String rm_id = (String) context.getParameter("rm_id");
		final String location = (String) context.getParameter("location");
		final String dv_id = (String) context.getParameter("dv_id");
		final String dp_id = (String) context.getParameter("dp_id");
		final String prob_type = (String) context.getParameter("prob_type");
		final String tr_id = (String) context.getParameter("tr_id");
		final String ac_id = (String) context.getParameter("ac_id");
		final String eq_id = (String) context.getParameter("eq_id");
		final String date_to_perform = (String) context.getParameter("date_to_perform");
		final String est_labor_hours = (String) context.getParameter("est_labor_hours");
		final String description = (String) context.getParameter("description");

        // get the originating acivity_log record
        String wrTable = "activity_log";
        String[] wrFields = { "activity_log_id", "assessment_id", "activity_type", "bl_id",
                "fl_id", "rm_id", "site_id", "prob_type", "date_required", "date_scheduled",
                "cost_estimated", "hours_est_baseline", "description", "dv_id", "dp_id",
                "phone_requestor", "ac_id", "priority", "created_by", "requestor" };
        DataSource wrDs = DataSourceFactory.createDataSourceForFields(wrTable, wrFields);
        wrDs.addRestriction(Restrictions.eq("activity_log", "activity_log_id", activityLogId));
        DataRecord origRecord = wrDs.getRecord();
        // check is action item have a requestor
        if (!origRecord.valueExists("activity_log.requestor")) {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgMissingRequestor);
            exception.setTranslatable(true);
            final Object[] args = { activityLogId };
            exception.setArgs(args);
            throw exception;
        }
        // if (!origRecord.valueExists("activity_log.bl_id")) {
        // final ExceptionBase exception = new ExceptionBase();
        // exception.setPattern(errorMsgMissingBuilding);
        // exception.setTranslatable(true);
        // final Object[] args = { activityLogId };
        // exception.setArgs(args);
        // throw exception;
        // }
        String[] reqFields = { "em_id", "phone" };
        DataRecord reqRecord = getDataRecord("em", reqFields, Restrictions.eq("em", "em_id",
            origRecord.getString("activity_log.requestor")));
        String[] blFields = { "bl_id", "site_id" };
        DataRecord blRecord = getDataRecord("bl", blFields, Restrictions.eq("bl", "bl_id",
            origRecord.getString("activity_log.bl_id")));
        // create new wr record
        DataRecord wrRecord = wrDs.createNewRecord();
        wrRecord.setValue("activity_log.assessment_id", Integer.valueOf(activityLogId).intValue());
        wrRecord.setValue("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
		
		
        wrRecord.setValue("activity_log.bl_id", bl_id); //origRecord.getString("activity_log.bl_id"));
        wrRecord.setValue("activity_log.fl_id", fl_id); //origRecord.getString("activity_log.fl_id"));
        wrRecord.setValue("activity_log.rm_id", rm_id); //origRecord.getString("activity_log.rm_id"));
        if (blRecord != null && blRecord.valueExists("bl.site_id")) {
            wrRecord.setValue("activity_log.site_id", blRecord.getString("bl.site_id"));
        }
        wrRecord.setValue("activity_log.prob_type", origRecord.getString("activity_log.prob_type"));
        wrRecord.setValue("activity_log.date_required", origRecord
            .getDate("activity_log.date_required"));
        wrRecord.setValue("activity_log.date_scheduled", origRecord
            .getDate("activity_log.date_scheduled"));
        wrRecord.setValue("activity_log.cost_estimated", origRecord
            .getDouble("activity_log.cost_estimated"));
        wrRecord.setValue("activity_log.hours_est_baseline", origRecord
            .getInt("activity_log.hours_est_baseline"));
        wrRecord.setValue("activity_log.description", origRecord
            .getString("activity_log.description"));
        wrRecord.setValue("activity_log.dv_id", origRecord.getString("activity_log.dv_id"));
        wrRecord.setValue("activity_log.dp_id", origRecord.getString("activity_log.dp_id"));
        wrRecord.setValue("activity_log.phone_requestor", reqRecord.getString("em.phone"));
        wrRecord.setValue("activity_log.ac_id", origRecord.getString("activity_log.ac_id"));
        wrRecord.setValue("activity_log.priority", (Integer.valueOf("1")).intValue());
        wrRecord.setValue("activity_log.created_by", reqRecord.getString("em.em_id"));
        wrRecord.setValue("activity_log.requestor", reqRecord.getString("em.em_id"));
        // save new wr record
        DataRecord wrPkRecord = wrDs.saveRecord(wrRecord);
        int wrId = wrPkRecord.getInt("activity_log.activity_log_id");
        // get the new record from database
        wrDs.clearRestrictions();
        wrDs.addRestriction(Restrictions.eq("activity_log", "activity_log_id", wrId));
        wrRecord = wrDs.getRecord();

        // call submit wr wfr

        RequestHandler wfrHandler = new RequestHandler();
	
       String strWrId = new String().valueOf(wrId);

		//19.1 JSONObject jsonRecord = toJSONObject(handleRecordValue(wrRecord));

       context.addResponseParameter("tableName",  "activity_log");
       context.addResponseParameter("fieldName",  "activity_log_id");
       context.addResponseParameter("activity_log_id",  strWrId);

        JSONObject jsonRecord = toJSONObject(handleRecordValue(wrRecord));
       context.addResponseParameter("fields", jsonRecord.toString());

        try {
    		wfrHandler.submitRequest(strWrId, jsonRecord);
            // 18.2 wfrHandler.submitRequest(context);
        } catch (ExceptionBase exception) {
            throw exception;
        } catch (Throwable exception) {
            // @translatable
            String errorMessage = "Generated Service Request [{0}] cannot be submitted due to system error";

            final ExceptionBase newException = new ExceptionBase(null, exception);
            newException.setPattern(errorMessage);
            newException.setTranslatable(true);
            final Object[] args = { wrId };
            newException.setArgs(args);
            throw newException;
        }
        /*
         * CreateWorkRequestForAction Passed Parameters: activity_log_id
         * 
         * 
         * INSERT INTO wr (date_requested, time_requested, prob_type, bl_id, fl_id, rm_id, location,
         * description, eq_id, dv_id, dp_id, ac_id, status,activity_log_id, date_assigned, tr_id,
         * est_labor_hours) VALUES (SELECT CURRENT DATE,CURRENT TIME, activity_log.prob_type,
         * activity_log.bl_id, activity_log.fl_id, activity_log.rm_id, activity_log.location,
         * activity_log.description, activity_log.eq_id, project.dv_id, project.dp_id,
         * project.ac_id, 'R', activity_log.activity_log_id, activity_log.date_scheduled,
         * activity_log.tr_id, activity_log.hours_est_design FROM activity_log, project WHERE
         * activity_log.activity_log_id = {passed activity_log_id} AND project.project_id =
         * activity_log.activity_log_id )
         * 
         * Note that the status of the work request is set as 'R' Requested. The activity_log_id is
         * essential as it ties the work request to the action it is associated with and via this
         * action to the project.
         */

        // FIX ME: the original SQL query in afm_wf_rules is not correct for SQL Server or Oracle
        // adding correct SQL query to the response map using the same name
/*
        final String email_address = getParentContextAttribute(context, "email");
        final String activityLogId = (String) context.getParameter("activity_log_id");
        final Integer activity_log_id = new Integer(activityLogId);
        String newQuery = "";

        if (isOracle(context)) {

            newQuery = "BEGIN " + "INSERT INTO wr (" + "activity_log_id, description) "
                    + "VALUES ("
                    + activity_log_id
                    + ", "
                    + literal(context, email_address)
                    + "); "
                    + "COMMIT; "
                    + "UPDATE wr SET (date_requested, time_requested, prob_type, "
                    + " bl_id, fl_id, rm_id, location, description, eq_id, dv_id, dp_id, ac_id, status, "
                    + " date_assigned, tr_id, est_labor_hours) "
                    + " = (SELECT #Date%CurrentDateTime%, #Time%CurrentDateTime%, activity_log.prob_type, "
                    + "           activity_log.bl_id, activity_log.fl_id, activity_log.rm_id, "
                    + "           activity_log.location, activity_log.description, activity_log.eq_id, "
                    + "           project.dv_id, project.dp_id, project.ac_id, 'R', "
                    + "           activity_log.date_scheduled, activity_log.tr_id, activity_log.hours_est_design "
                    + "    FROM activity_log, project WHERE activity_log.project_id = project.project_id "
                    + "    AND activity_log.activity_log_id = "
                    + activity_log_id
                    + " ) "
                    + "WHERE wr.activity_log_id = "
                    + activity_log_id
                    + " "
                    + "  AND wr.description = " + literal(context, email_address) + ";END;";

        } else {

            newQuery = "INSERT INTO wr ("
                    + "activity_log_id, description) "
                    + "VALUES ("
                    + activity_log_id
                    + ", "
                    + literal(context, email_address)
                    + "); "
                    + "COMMIT; "
                    + "UPDATE wr SET "
                    + "wr.date_requested = #Date%CurrentDateTime%, wr.time_requested = #Time%CurrentDateTime%, "
                    + "wr.prob_type = activity_log.prob_type, "
                    + "wr.bl_id = activity_log.bl_id, wr.fl_id = activity_log.fl_id, wr.rm_id = activity_log.rm_id, "
                    + "wr.location = activity_log.location, wr.description = activity_log.description, "
                    + "wr.eq_id = activity_log.eq_id, wr.dv_id = project.dv_id, wr.dp_id = project.dp_id, "
                    + "wr.ac_id = project.ac_id, wr.status = 'R', "
                    + "wr.date_assigned = activity_log.date_scheduled, "
                    + "wr.tr_id = activity_log.tr_id, wr.est_labor_hours = activity_log.hours_est_design "
                    + "FROM wr JOIN activity_log ON wr.activity_log_id = activity_log.activity_log_id "
                    + "JOIN project ON activity_log.project_id = project.project_id "
                    + "WHERE activity_log.activity_log_id = " + activity_log_id + " "
                    + "  AND wr.description = " + literal(context, email_address);
        }

        newQuery = expandParameters(context, newQuery);
        context.addResponseParameter("sqlQuery", newQuery);
        boolean asynchronous = false;
        runWorkflowRule(context, "AbCommonResources-executeSQL", asynchronous);
*/
    }
	/**
     * return a record for specified table , field and restriction
     * 
     * @param table
     * @param fields
     * @param restriction
     * @return
     */
    private DataRecord getDataRecord(String table, String[] fields, Clause restriction) {
        // get requestor data
        DataSource ds = DataSourceFactory.createDataSourceForFields(table, fields);
        ds.addRestriction(restriction);
        return (ds.getRecord());
    }
  
	/**
     * convert record values to hash map
     * 
     * @param record
     * @return
     */
    private HashMap handleRecordValue(DataRecord record) {

        HashMap result = new HashMap();

        List fields = record.getFields();
        for (Iterator it = fields.iterator(); it.hasNext();) {
            DataValue field = (DataValue) it.next();
            String key = field.getName();
            Object value = field.getValue();
            result.put(key, value);
        }
        return result;
    } 

}
