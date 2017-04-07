package com.archibus.eventhandler.CapitalProjects;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

/**
 * This event handler implements business logic related to Project Management. Copyright (c) 2005,
 * ARCHIBUS, Inc.
 * 
 *@author Antoni Ansarov
 *@created June 9, 2005
 *@version 1.0
 */
public class ProjectManagementHandler extends EventHandlerBase {

    // enable db exceptions for testing
    final static boolean throwException = false;

    final String prefix = "[ARCHIBUS] ";

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
     * Get the email of the project manager responsible for this project
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     *@param excludeField Description of the Parameter
     * 
     */

    private String getProjectManagerEmailAddress(EventHandlerContext context,
            Integer activity_log_id) {
        final String whereExpression = " em_id = ( SELECT proj_mgr FROM project, activity_log "
                + " WHERE project.project_id = activity_log.project_id "
                + " AND activity_log.activity_log_id = " + activity_log_id + ")";
        return (String) selectDbValue(context, "em", "em_id", whereExpression);
    }
    
    /**
     * Get the email of Change Request Approval Manager 
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     *@param excludeField Description of the Parameter
     * 
     */

    private String getApprvManagerEmailAddress(EventHandlerContext context,
            Integer activity_log_id) {
        final String whereExpression = " em_id = ( SELECT approved_by FROM activity_log "
                + " WHERE activity_log.activity_log_id = " + activity_log_id + ")";
        return (String) selectDbValue(context, "em", "em_id", whereExpression);
    }

    /**
     * Get questions from questions and questionnaire tables for use in Request Project
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */

    public void getQuestions(EventHandlerContext context) {
        final String q_id = (String) context.getParameter("questionnaire_id");

        String sql = "SELECT questions.questionnaire_id, questions.format_type, questions.enum_list, questions.freeform_width, questions.lookup_table, ";
        sql += " questions.lookup_field, questions.activity_type, questions.action_response, questions.quest_name, questions.quest_text, questionnaire.table_name, questionnaire.field_name";
        sql += " FROM questions";
        if (isOracle(context)) {
            sql += ", questionnaire";
        } else {
            sql += " LEFT OUTER JOIN questionnaire ON questions.questionnaire_id = questionnaire.questionnaire_id";
        }
        sql += " WHERE questions.questionnaire_id = " + literal(context, q_id);
        if (isOracle(context)) {
            sql += " AND questions.questionnaire_id = questionnaire.questionnaire_id(+)";
        }
        sql += " ORDER BY questions.sort_order";
        List records = selectDbRecords(context, sql);

        boolean recordExists = true;
        if (records.size() <= 0) {
            recordExists = false;
        }

        JSONArray jsonRecords = new JSONArray();
        for (int r = 0; r < records.size(); r++) {
            Object[] record = (Object[]) records.get(r);
            JSONObject jsonRecord = new JSONObject();
            jsonRecord.put("questions.questionnaire_id", record[0]);
            jsonRecord.put("questions.format_type", record[1]);
            jsonRecord.put("questions.enum_list", record[2]);
            jsonRecord.put("questions.freeform_width", record[3]);
            jsonRecord.put("questions.lookup_table", record[4]);
            jsonRecord.put("questions.lookup_field", record[5]);
            jsonRecord.put("questions.activity_type", record[6]);
            jsonRecord.put("questions.action_response", record[7]);
            jsonRecord.put("questions.quest_name", record[8]);
            jsonRecord.put("questions.quest_text", record[9]);
            jsonRecord.put("questionnaire.table_name", record[10]);
            jsonRecord.put("questionnaire.field_name", record[11]);
            jsonRecords.put(jsonRecord);
        }
        // Create the output parameter
        JSONObject results = new JSONObject();
        results.put("quest", recordExists);
        results.put("data", jsonRecords);
        context.addResponseParameter("jsonExpression", results.toString());
    }

    /**
     * Get contact information from the em, cf, or vn tables
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */

    public void getContactInfo(EventHandlerContext context) {
        final String member_id = (String) context.getParameter("member_id");
        final String member_id_table = (String) context.getParameter("member_id_table");
        final String field_name = member_id_table + "." + member_id_table + "_id";

        JSONObject contactInfo = new JSONObject();

        String dialect = "generic";
        if (isOracle(context)) {
            dialect = "oracle";
        } else if (isSqlServer(context)) {
            dialect = "sqlserver";
        }
        contactInfo.put("dialect", dialect);

        contactInfo.put("member_id", member_id);
        contactInfo.put("member_id_table", member_id_table);

        String bl_id = "";

        if (member_id_table.equals("em")) {
            List records = selectDbRecords(context, "em", new String[] { "bl_id", "name_first",
                    "name_last", "honorific", "phone", "fax", "pager_number", "email" }, field_name
                    + " = " + literal(context, member_id));

            Iterator it = records.iterator();
            Object[] record = (Object[]) it.next();

            contactInfo.put("bl_id", record[0]);
            contactInfo.put("name_first", record[1]);
            contactInfo.put("name_last", record[2]);
            contactInfo.put("honorific", record[3]);
            contactInfo.put("phone", record[4]);
            contactInfo.put("fax", record[5]);
            contactInfo.put("pager", record[6]);
            contactInfo.put("email", record[7]);

            bl_id = (String) record[0];
            if (bl_id != "" && bl_id != null) {
                List bl_records = selectDbRecords(context, "bl", new String[] { "address1",
                        "address2", "city_id", "state_id", "zip", "regn_id", "ctry_id" },
                    "bl_id = " + literal(context, bl_id));
                Iterator bl_it = bl_records.iterator();
                Object[] bl_record = (Object[]) bl_it.next();
                contactInfo.put("address1", bl_record[0]);
                contactInfo.put("address2", bl_record[1]);
                contactInfo.put("city_id", bl_record[2]);
                contactInfo.put("state_id", bl_record[3]);
                contactInfo.put("zip", bl_record[4]);
                contactInfo.put("regn_id", bl_record[5]);
                contactInfo.put("ctry_id", bl_record[6]);
            }
        } else if (member_id_table.equals("cf")) {
            List cf_records = selectDbRecords(context, "cf", new String[] { "email", "tr_id" },
                field_name + " = " + literal(context, member_id));
            Iterator cf_it = cf_records.iterator();
            Object[] cf_record = (Object[]) cf_it.next();
            contactInfo.put("email", cf_record[0]);
            contactInfo.put("tr_id", cf_record[1]);
        } else if (member_id_table.equals("vn")) {
            List vn_records = selectDbRecords(context, "vn",
                new String[] { "company", "address1", "address2", "city", "phone", "state", "fax",
                        "postal_code", "country", "email" }, field_name + " = "
                        + literal(context, member_id));
            Iterator vn_it = vn_records.iterator();
            Object[] vn_record = (Object[]) vn_it.next();

            contactInfo.put("company", vn_record[0]);
            contactInfo.put("address1", vn_record[1]);
            contactInfo.put("address2", vn_record[2]);
            contactInfo.put("city_id", vn_record[3]);
            contactInfo.put("phone", vn_record[4]);
            contactInfo.put("state_id", vn_record[5]);
            contactInfo.put("fax", vn_record[6]);
            contactInfo.put("zip", vn_record[7]);
            contactInfo.put("ctry_id", vn_record[8]);
            contactInfo.put("email", vn_record[9]);
        }

        context.addResponseParameter("jsonExpression", contactInfo.toString());

    }

    /**
     * sendEmail
     * 
     *@param context Description of the Parameter
     *@param recipient Description of the Parameter
     *@param subject Description of the Parameter
     *@param body Description of the Parameter
     *@exception ExceptionBase Description of the Exception
     */

    private void sendEmail(EventHandlerContext context, String body, String subject,
            String recipient) {

        context.addResponseParameter("notifyEmailAddress", recipient);
        context.addResponseParameter("notifySubject", subject);
        context.addResponseParameter("notifyBody", body);
        context.addResponseParameter("activityId", "AbProjectManagement");

        runWorkflowRule(context, "AbCommonResources-notify", true);

    }

    /**
     * Get the email of the vendor responsible for this activity_log:
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     *@param excludeField Description of the Parameter
     * 
     */

    private String getVendorEmailAddress(EventHandlerContext context, Integer activity_log_id) {
        final String whereExpression = " vn_id = ( SELECT work_pkg_bids.vn_id FROM work_pkg_bids, activity_log "
                + "  WHERE work_pkg_bids.project_id = activity_log.project_id "
                + "  AND work_pkg_bids.work_pkg_id = activity_log.work_pkg_id "
                + "  AND activity_log.activity_log_id = "
                + activity_log_id
                + "  AND work_pkg_bids.status IN ('Approved', 'Approved � Contract Signed', 'In Process', "
                + "  'In Process � On Hold' )) ";
        return (String) selectDbValue(context, "vn", "email", whereExpression);
    }

    /**
     * Send vendor an approved or a rejected email
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     *@param approved Description of the Parameter
     *@param approved Description of the Parameter
     *@param approved Description of the Parameter
     * 
     */

    private void sendVendorEmail(EventHandlerContext context, String recipient, boolean approved,
            String work_pkg_id, String project_id) {

        /*
         * Rejection Email: Subject: �Bid status for work package: � {work_pkg_id} Message: �This is
         * an automated email. Please to not reply to this email address. Your bid for work package:
         * {work_pkg_id} has not been accepted. We will still consider you for other work in the
         * future.�
         * 
         * Acceptance Email: Subject: �Bid status for work package: � {work_pkg_id} Message: �This
         * is an automated email. Please to not reply to this email address. Your bid has been
         * accepted for work package: {work_pkg_id}. Please contact {ProjMgr} as soon as possible to
         * formalize a contract.�
         */

        final String projectManager = (String) selectDbValue(context, "project", "proj_mgr",
            "project_id=" + literal(context, project_id));

        final String emailAddress = (String) selectDbValue(context, "vn", "email", "vn_id="
                + literal(context, recipient));

        // approved
        if (approved) {

            // @translatable
            String subject = "Bid status for work package: [{0}]";
            Object[] args = new Object[] { work_pkg_id };
            subject = prepareMessage(context, subject, args);

            // @translatable
            String body = "This is an automated email. Please to not reply to this email address. Your bid has been accepted for work package: [{0}]  Please contact [{1}] as soon as possible to formalize a contract.";

            Object[] args2 = new Object[] { work_pkg_id, projectManager };
            body = prepareMessage(context, body, args2);

            body = this.newLine + body;

            sendEmail(context, body, this.prefix + subject, emailAddress);

            // rejected
        } else {

            // @translatable
            String subject = "Bid status for work package: [{0}]";
            Object[] args = new Object[] { work_pkg_id };
            subject = prepareMessage(context, subject, args);

            // @translatable
            String body = "This is an automated email. Please to not reply to this email address. Your bid has been rejected for work package: [{0}]";

            Object[] args2 = new Object[] { work_pkg_id };
            body = prepareMessage(context, body, args2);

            body = this.newLine + body;

            sendEmail(context, body, this.prefix + subject, emailAddress);
        }

    }

    /**
     * Get list of vendors to send rejection email to
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     *@param excludeField Description of the Parameter
     * 
     */

    private void sendVendorsEmail(EventHandlerContext context, String project_id,
            String work_pkg_id, boolean approved) {
        /*
         * List of vendors to send rejection or approved email to: SELECT vn_id FROM work_pkg_bids
         * WHERE project_id = {project_id} AND work_pkg_id = {work_pkg_id} AND status = 'Rejected'
         * or 'Approved'
         */
        String strWhere = " project_id = " + literal(context, project_id) + " AND work_pkg_id = "
                + literal(context, work_pkg_id);
        if (approved) {
            strWhere += " AND status = 'Approved'";
        } else {
            strWhere += " AND status = 'Rejected'";
        }

        List records = selectDbRecords(context, "work_pkg_bids", new String[] { "vn_id" }, strWhere);

        for (Iterator it = records.iterator(); it.hasNext();) {
            Object[] record = (Object[]) it.next();
            String vendor = (String) record[0];
            sendVendorEmail(context, vendor, approved, work_pkg_id, project_id);

        }
    }

    // //////////////////////////////////////////////////////////////////////////////////////////////
    // //////
    // //////////////////////// PROJECT MANAGEMENT WORKFLOW RULES
    // ////////////////////////////////////////////
    // //////////////////////////////////////////////////////////////////////////////////////////////
    // //////

    /**
     * Notify all bidders for a work package indicating whether they've been awarded the work the
     * work package.
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */
    public void emailBidderOnBidApprovalOrRejection(EventHandlerContext context) {

        /*
         * Passed Parameters: {project_id}, {work_pkg_id} Test Data:
         * 
         * {project_id} = �BUILD-HQ-NEW� {work_pkg_id} = �Demolition - HQ 17 int. Walls� Logic:
         * 
         * List of vendors to send rejection email to: SELECT vn_id FROM work_pkg_bids WHERE
         * project_id = {project_id} AND work_pkg_id = {work_pkg_id} AND status = 'Rejected'
         * 
         * Vendor to send acceptance email to: SELECT vn_id FROM work_pkg_bids WHERE project_id =
         * {project_id} AND work_pkg_id = {work_pkg_id} AND status = 'Approved'
         * 
         * Get ProjMgr: SELECT proj_mgr FROM project WHERE project_id = {project_id}
         */

        final String project_id = (String) context.getParameter("project_id");
        final String work_pkg_id = (String) context.getParameter("work_pkg_id");

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("EmailBidderOnBidApprovalOrRejection");
        }

        // send email to approved vendors

        boolean approved = true;
        sendVendorsEmail(context, project_id, work_pkg_id, approved);

        // send email to rejected vendors

        approved = false;
        sendVendorsEmail(context, project_id, work_pkg_id, approved);

    }

    /**
     * Updates Work Package Bids and Work Package status when a bid is approved
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */
    public void approveWorkPkgBid(EventHandlerContext context) {

        /*
         * Called From: Procure � Approve Bids Passed Parameters: {project_id}, {work_pkg_id},
         * {vn_id}, {logged in user�s email address} Test Data: {project_id} = �BUILD-HQ-NEW�
         * {work_pkg_id} = �Demolition - HQ 17 int. Walls� {vn_id} = �DDD DEMOLITION� {user�s email}
         * = �afm@tgd.com� Logic:
         * 
         * 1) Update work_pkg_bids status, approved_by, and date_approved for the selected bid
         * UPDATE work_pkg_bids SET status = �Approved�, approved_by = (SELECT em_id FROM em WHERE
         * email = {logged in user�s email address}, date_approved = {current date} WHERE project_id
         * = {project_id} AND work_pkg_id = {work_pkg_id} AND vn_id = {vn_id}
         * 
         * 2) All other bids statuses for that work_pkg are set to �Rejected� UPDATE work_pkg_bids
         * SET status = �Rejected� WHERE project_id = {project_id} AND work_pkg_id = {work_pkg_id}
         * AND vn_id <> {vn_id} (KE - added restriction AND status NOT IN ('Created', 'Withdrawn'))
         * 
         * 3) Set work_pkgs status to �Approved-Bids Award� for that work_pkg_id UPDATE work_pkgs
         * SET status = �Approved-Bids Award� WHERE project_id = {project_id} AND work_pkg_id =
         * {work_pkg_id}
         * 
         * 4) Execute the EmailBidderOnBidApprovalOrRejection() workflow rule (if the above
         * statements succeed.) EmailBidderOnBidApprovalOrRejection( {project_id}, {work_pkg_id} )
         * 
         * Refresh the bid frames
         */

        final String project_id = (String) context.getParameter("project_id");
        final String work_pkg_id = (String) context.getParameter("work_pkg_id");
        final String vn_id = (String) context.getParameter("vn_id");

        if (this.log.isDebugEnabled()) {
            this.log.debug("ApproveWorkPkgBid");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        String email_address = getParentContextAttribute(context, "email");

        // execute the sql commands as one tranaction.
        Vector sqlCommands = new Vector();

        String updateSql1 = " UPDATE work_pkg_bids " + " SET status = 'Approved', "
                + " approved_by = (SELECT MIN(em_id) FROM em WHERE email = "
                + literal(context, email_address) + ")" + " , date_approved = "
                + getCurrentDate(context) + " WHERE project_id = " + literal(context, project_id)
                + " AND work_pkg_id = " + literal(context, work_pkg_id) + " AND vn_id = "
                + literal(context, vn_id);

        String updateSql2 = "UPDATE work_pkg_bids " + " SET status = 'Rejected' "
                + " WHERE project_id = " + literal(context, project_id) + " AND work_pkg_id = "
                + literal(context, work_pkg_id) + " AND vn_id <> " + literal(context, vn_id)
                + " AND status NOT IN ('Created', 'Withdrawn')";

        String updateSql3 = "  UPDATE work_pkgs " + " SET status = 'Approved-Bids Award' "
                + " WHERE project_id = " + literal(context, project_id) + " AND work_pkg_id = "
                + literal(context, work_pkg_id);

        sqlCommands.add(updateSql1);
        sqlCommands.add(updateSql2);
        sqlCommands.add(updateSql3);

        executeDbSqlCommands(context, sqlCommands, throwException);

        emailBidderOnBidApprovalOrRejection(context);

    }

    /**
     * CreateWorkRequestForAction rule Copies field values from a selected activity_log record to
     * create a work request
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */
    public void createWorkRequestForAction(EventHandlerContext context) {

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
                    + "WHERE wr.activity_log_id = " + activity_log_id + " "
                    + "  AND wr.description = " + literal(context, email_address);
        }

        newQuery = expandParameters(context, newQuery);
        //context.addResponseParameter("sqlQuery", newQuery);
        
        executeDbSql(context, newQuery, throwException);
        
        //boolean asynchronous = false;
        //runWorkflowRule(context, "AbCommonResources-executeSQL", asynchronous);

    }

    /**
     * calcActivityLogDateSchedEndForActivity moved to ActionService.java in AbCommonResources.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * 
     */
    public void calcActivityLogDateSchedEndForActivity(EventHandlerContext context) {
        
        WorkflowRulesContainer.ThreadSafe workflowRulesContainer = ContextStore.get()
            .getUserSession().findProject().loadWorkflowRules();
        
        workflowRulesContainer.runRule(
            workflowRulesContainer.getWorkflowRule("AbCommonResources-ActionService"),
            "calcActivityLogDateSchedEndForActivity", context);
    }
    
    /**
     * CalcActivityLogDateSchedEndForWorkPkg moved to ActionService.java in AbCommonResources.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * 
     */
    public void calcActivityLogDateSchedEndForWorkPkg(EventHandlerContext context) {
        
        WorkflowRulesContainer.ThreadSafe workflowRulesContainer = ContextStore.get()
            .getUserSession().findProject().loadWorkflowRules();
        
        workflowRulesContainer.runRule(
            workflowRulesContainer.getWorkflowRule("AbCommonResources-ActionService"),
            "calcActivityLogDateSchedEndForWorkPkg", context);
    }
    
    /**
     * calcActivityLogDateSchedEndForProject moved to ActionService.java in AbCommonResources.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * 
     */
    public void calcActivityLogDateSchedEndForProject(EventHandlerContext context) {
        
        WorkflowRulesContainer.ThreadSafe workflowRulesContainer = ContextStore.get()
            .getUserSession().findProject().loadWorkflowRules();
        
        workflowRulesContainer.runRule(
            workflowRulesContainer.getWorkflowRule("AbCommonResources-ActionService"),
            "calcActivityLogDateSchedEndForProject", context);
    }
    
    /**
     * CalcActivityLogDatePlannedEndForActivity moved to ActionService.java in AbCommonResources.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * 
     */
    public void calcActivityLogDatePlannedEndForActivity(EventHandlerContext context) {
        
        WorkflowRulesContainer.ThreadSafe workflowRulesContainer = ContextStore.get()
            .getUserSession().findProject().loadWorkflowRules();
        
        workflowRulesContainer.runRule(
            workflowRulesContainer.getWorkflowRule("AbCommonResources-ActionService"),
            "calcActivityLogDatePlannedEndForActivity", context);
    }
    
    /**
     * CalcActivityLogDatePlannedEndForWorkPkg moved to ActionService.java in AbCommonResources.
     * 
     * @param context Description of the Parameter
     * 
     */
    public void calcActivityLogDatePlannedEndForWorkPkg(EventHandlerContext context) {
        
        WorkflowRulesContainer.ThreadSafe workflowRulesContainer = ContextStore.get()
            .getUserSession().findProject().loadWorkflowRules();
        
        workflowRulesContainer.runRule(
            workflowRulesContainer.getWorkflowRule("AbCommonResources-ActionService"),
            "calcActivityLogDatePlannedEndForWorkPkg", context);
    }
    
    /**
     * CalcActivityLogDatePlannedEndForProject moved to ActionService.java in AbCommonResources.
     * 
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * 
     */
    public void calcActivityLogDatePlannedEndForProject(EventHandlerContext context) {
        
        WorkflowRulesContainer.ThreadSafe workflowRulesContainer = ContextStore.get()
            .getUserSession().findProject().loadWorkflowRules();
        
        workflowRulesContainer.runRule(
            workflowRulesContainer.getWorkflowRule("AbCommonResources-ActionService"),
            "calcActivityLogDatePlannedEndForProject", context);
    }

    /**
     * Sets status = Approved and approved_by for a selected activity_log record and send
     * notifications to vendor and project manager. Called From: Adjust � Estimate and/or Approve
     * Change Order
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */
    public void approveChangeOrder(EventHandlerContext context) {

        /*
         * Purpose: Sets status = Approved and approved_by for a selected activity_log record and
         * send notifications to vendor and project manager. Called From: Adjust � Estimate and/or
         * Approve Change Order
         * 
         * Passed Parameters: {activity_log_id}, {email of user logged in}
         * 
         * Test Data: {activity_log_id} = 239 {user�s email} = �afm@tgd.com� Logic:
         * 
         * 1) Set status of activity_log: UPDATE activity_log SET status = �APPROVED�, (10.23.2007
         * KE - 'SCHEDULED') approved_by = (SELECT em_id FROM em WHERE email = {email of user logged
         * in} ) WHERE activity_log_id = {activity_log_id}
         * 
         * 2) Send notifications: Get the email of the vendor responsible for this activity_log:
         * SELECT email FROM vn WHERE vn_id = ( SELECT vn_id FROM work_pkg_bids, activity_log WHERE
         * work_pkg_bids.project_id = activity_log.project_id AND work_pkg_bids.work_pkg_id =
         * activity_log.work_pkg_id AND activity_log.activity_log_id = {activity_log_id} AND
         * work_pkg_bids.status IN (�Approved�, �Approved � Contract Signed�, �In Process�, �In
         * Process � On Hold� )
         * 
         * Get the email of the project manager responsible for this project: SELECT email FROM em
         * WHERE em_id = ( SELECT proj_mgr FROM project, activity_log WHERE project.project_id =
         * activity_log.project_id AND activity_log.activity_log_id = {activity_log_id} )
         * 
         * Get the project, work_pkg_id, and action_title for the Change Order: SELECT project_id,
         * work_pkg_id, action_title FROM activity_log WHERE activity_log_id = {activity_log_id}
         * 
         * Send the emails to the vendor and project manager: Subject: Change Order Approved for
         * project: {project_id} and work_pkg: {work_pkg_id} Message: Action: {activity_log_id} �
         * {action_title} Has been approved for project: {project_id} and work_pkg: {work_pkg_id}
         * which is assigned to vendor: {vn_id}. For details pick on the following link: {link to
         * the Actions by Work Package view restricted to show only the selected activity_log_id}
         */
        final String activityLogId = (String) context.getParameter("activity_log_id");
        final Integer activity_log_id = new Integer(activityLogId);
        // final Integer activity_log_id = (Integer) context.getParameter("activity_log_id");

        if (this.log.isDebugEnabled()) {
            this.log.debug("approveChangeOrder");
        }

        final String email_address = getParentContextAttribute(context, "email");

        final String sqlUpdate = "UPDATE activity_log SET status = 'SCHEDULED',"
                + " approved_by =  (SELECT em_id FROM em WHERE email = "
                + literal(context, email_address) + ") WHERE activity_log_id = " + activity_log_id;

        executeDbSql(context, sqlUpdate, throwException);

        // ////////////////////////////////////////////////////////////////////////////////////
        // Send notification message
        // ///////////////////////////////////////////////////////////////////////////////////

        final String vendorEmail = getVendorEmailAddress(context, activity_log_id);

        final String projectManagerEmail = getProjectManagerEmailAddress(context, activity_log_id);

        final String project_id = (String) selectDbValue(context, "activity_log", "project_id",
            " activity_log_id=" + activity_log_id);
        final String work_pkg_id = (String) selectDbValue(context, "activity_log", "work_pkg_id",
            " activity_log_id=" + activity_log_id);
        final String action_title = (String) selectDbValue(context, "activity_log", "action_title",
            " activity_log_id=" + activity_log_id);

        // @translatable
        String subject = "Change Order Approved for project: [{0}] and work_pkg: [{1}]";
        Object[] args = new Object[] { project_id, work_pkg_id };
        subject = prepareMessage(context, subject, args);

        // @translatable
        String body = " Action: [{0}] � [{1}]  Has been approved for project: [{2}] and work_pkg: [{3}] which is assigned to vendor:  For details click on the following link: ";

        Object[] args2 = new Object[] { activity_log_id.toString(), action_title, project_id,
                work_pkg_id };
        body = prepareMessage(context, body, args2);

        sendEmail(context, body, this.prefix + subject, vendorEmail);
        sendEmail(context, body, this.prefix + subject, projectManagerEmail);

    }
    
    public void approveChangeOrderFCPM(final EventHandlerContext context) {
        
        final String activityLogId = (String) context.getParameter("activity_log_id");
        final Integer activity_log_id = new Integer(activityLogId);
        // final Integer activity_log_id = (Integer) context.getParameter("activity_log_id");
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("approveChangeOrder");
        }
        
        getParentContextAttribute(context, "email");
        
        // ////////////////////////////////////////////////////////////////////////////////////
        // Send notification message
        // ///////////////////////////////////////////////////////////////////////////////////
        
        final String vendorEmail = getVendorEmailAddress(context, activity_log_id);
        
        final String projectManagerEmail = getProjectManagerEmailAddress(context, activity_log_id);
        
        final String apprvManagerEmail = getApprvManagerEmailAddress(context, activity_log_id);
        
        final String project_id =
                (String) selectDbValue(context, "activity_log", "project_id", " activity_log_id="
                        + activity_log_id);
        final String work_pkg_id =
                (String) selectDbValue(context, "activity_log", "work_pkg_id", " activity_log_id="
                        + activity_log_id);
        final String action_title =
                (String) selectDbValue(context, "activity_log", "action_title", " activity_log_id="
                        + activity_log_id);
        
        // @translatable
        String subject = "Change Order Approved for project: [{0}] and work_pkg: [{1}]";
        final Object[] args = new Object[] { project_id, work_pkg_id };
        subject = prepareMessage(context, subject, args);
        
        // @translatable
        String body =
                " Action: [{0}] � [{1}]  Has been approved for project: [{2}] and work_pkg: [{3}] which is assigned to vendor:  For details click on the following link: ";
        
        final Object[] args2 =
                new Object[] { activity_log_id.toString(), action_title, project_id, work_pkg_id };
        body = prepareMessage(context, body, args2);
        
        sendEmail(context, body, this.prefix + subject, vendorEmail);
        sendEmail(context, body, this.prefix + subject, projectManagerEmail);
        if (!projectManagerEmail.equals(apprvManagerEmail))
            sendEmail(context, body, this.prefix + subject, apprvManagerEmail);
    }

    /**
     * NotifyAssigneeOfPendingActions rule Automatically notify the activity_log.assigned_to of
     * pending tasks via e-mail. Notification should be sent on activity_log.date_scheduled � 1 (the
     * day before the task is to commence.)
     * 
     * Expects a single input parameter: "notifyViewName" that assignee can use to review the
     * request. The view name is formatted into URL that will be attached to the message body.
     * Example of the view name parameter:
     * #Attribute%//preferences/@absoluteAppPath%/ab-proj-view-action.axvw.
     * 
     *@param context Rule execution context.
     * 
     */
    public void notifyAssigneeOfPendingActions(EventHandlerContext context) {

        /*
         * Logic: 1) // Get list of em to email to: SELECT em.email, activity_log.activity_log_id,
         * activity_log.action_title, activity_log.project_id FROM em, activity_log WHERE em.em_id =
         * activity_log.assigned_to AND activity_log.status = �SCHEDULED� AND
         * activity_log.date_scheduled � 1 = {current date}
         * 
         * 2) // Get list of vn to email to: SELECT vn.email, activity_log.activity_log_id,
         * activity_log.action_title, activity_log.project_id FROM vn, activity_log WHERE vn.vn_id =
         * activity_log.assigned_to AND activity_log.status = �SCHEDULED� AND
         * activity_log.date_scheduled � 1 = {current date}
         * 
         * 3) // Get list of cf to email to: SELECT em.email, activity_log.activity_log_id,
         * activity_log.action_title, activity_log.project_id FROM em, cf, activity_log WHERE
         * cf.cf_id = activity_log.assigned_to AND activity_log.status = �SCHEDULED� AND
         * activity_log.date_scheduled � 1 = {current date} AND em.em_id = cf.cf_id
         * 
         * 4) // Send an email to all of the email addresses returned by the record set queries
         * above: Subject: Pending Task Message: Action # {activity_log.activity_log_id} �
         * {activity_log.action_title} for project: {activity_log.project_id} is scheduled to
         * commence tomorrow. Please click on this link to see details: {url to
         * ab-proj-view-action.axvw restricted to the {activity_log.activity_log_id} }
         */

        // get list of em to email to
        String em_sql = expandParameters(
            context,
            "SELECT em.email, activity_log.activity_log_id, activity_log.action_title, activity_log.project_id "
                    + "FROM em, activity_log "
                    + "WHERE em.em_id = activity_log.assigned_to "
                    + "AND activity_log.status = 'SCHEDULED' "
                    + "AND activity_log.date_scheduled - 1 = #Date%CurrentDateTime%");
        List em_rows = selectDbRecords(context, em_sql);

        // get list of vn to email to
        String vn_sql = expandParameters(
            context,
            "SELECT vn.email, activity_log.activity_log_id, activity_log.action_title, activity_log.project_id "
                    + "FROM vn, activity_log "
                    + "WHERE vn.vn_id = activity_log.assigned_to "
                    + "AND activity_log.status = 'SCHEDULED' "
                    + "AND activity_log.date_scheduled - 1 = #Date%CurrentDateTime%");
        List vn_rows = selectDbRecords(context, vn_sql);

        // get list of cf to email to
        String cf_sql = expandParameters(
            context,
            "SELECT em.email, activity_log.activity_log_id, activity_log.action_title, activity_log.project_id "
                    + "FROM em, cf, activity_log "
                    + "WHERE cf.cf_id = activity_log.assigned_to "
                    + "AND em.em_id = cf.cf_id "
                    + "AND activity_log.status = 'SCHEDULED' "
                    + "AND activity_log.date_scheduled - 1 = #Date%CurrentDateTime%");
        List cf_rows = selectDbRecords(context, cf_sql);

        // merge all three lists into one
        List all_rows = new ArrayList(em_rows.size() + vn_rows.size() + cf_rows.size());
        all_rows.addAll(em_rows);
        all_rows.addAll(vn_rows);
        all_rows.addAll(cf_rows);

        // get email server parameters
        final String notifyViewName = (String) context.getParameter("notifyViewName");

        // for each assignee:
        for (int i = 0; i < all_rows.size(); i++) {

            // each row contains values from SELECT clause
            Object[] values = (Object[]) all_rows.get(i);

            // assigneed email address
            String email = (String) values[0];

            // @translatable
            String subject = "Pending action";
            subject = localizeString(context, subject);

            String activity_log_id = (String) values[0];

            // @translatable
            String body = "Action #[{0}] � [{1}] for project: [{2}] is scheduled to commence tomorrow. Please click on this link to see details: ";
            Object[] args = new Object[] { (String) values[0], (String) values[1],
                    (String) values[2] };
            body = prepareMessage(context, body, args);

            body = body + this.newLine;

            String link = notifyViewName + "?handler=com.archibus.config.find&activity_log_id='"
                    + activity_log_id + "'";

            if (this.log.isDebugEnabled()) {
                this.log.debug("notifyAssigneeOfPendingActions: email [" + email + "], message ["
                        + body + "]");
            }

            sendEmail(context, body + link, this.prefix + subject, email);
        }
    }

    /**
     * applyPaymentToVendorInvoice rule Update the invoice.amount_closed and invoice.status when a
     * payment is applied to an invoice.
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */
    public void applyPaymentToVendorInvoice(EventHandlerContext context) {

        final String invoiceId = (String) context.getParameter("invoice.invoice_id");
        final Integer invoice_id = new Integer(invoiceId);

        if (this.log.isDebugEnabled()) {
            this.log.debug("applyPaymentToVendorInvoice");
        }

        final String sqlUpdate = "UPDATE invoice "
                + "SET amount_closed = "
                + "(CASE WHEN EXISTS(SELECT * FROM invoice_payment WHERE invoice_payment.invoice_id = invoice.invoice_id) "
                + "THEN (SELECT SUM(amount_expense) FROM invoice_payment WHERE invoice_payment.invoice_id = invoice.invoice_id) "
                + "ELSE 0 END) " + "WHERE invoice_id = " + invoice_id;

        executeDbSql(context, sqlUpdate, throwException);

        executeDbCommit(context);

        final String sqlUpdateTot = "UPDATE invoice "
                + "SET status = ( CASE WHEN ( amount_tot_invoice <= amount_closed  ) THEN 'CLOSED' ELSE status END ) "
                + "WHERE invoice_id = " + invoice_id;

        executeDbSql(context, sqlUpdateTot, throwException);

        // boolean asynchronous = false;
        // runWorkflowRule(context, "AbCommonResources-executeSQL", asynchronous);

    }

    /**
     * addWorkPkgBid rule
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */
    public void addWorkPkgBid(EventHandlerContext context) {

        if (this.log.isDebugEnabled()) {
            this.log.debug("AddWorkPkgBid");
        }

        String email = getParentContextAttribute(context, "email");

        // Get the record parameters from the nested hash map.
        Map values = fromJSONObject(context.getJSONObject("fieldValues"));
        // Map values = context.getParameters("work_pkg_bids");

        // Filter out those that do not have the �work_pkg_bids.� Prefix.
        Map valuesFiltered = filterWithPrefix(values, "work_pkg_bids");

        // Strip the �work_pkg_bids.� Prefix from the elements in the map so the result will be
        // able to be passed to executeDbSave().
        Map valuesStripped = stripPrefix(valuesFiltered);

        final String vn_id = (String) selectDbValue(context, "vn", "vn_id", "email = "
                + literal(context, email));
        boolean emailMatchesVendor = false;
        if (notNull(vn_id).length() != 0) {
            emailMatchesVendor = true;

            valuesStripped.put("vn_id", vn_id);
            valuesStripped.put("status", "Created");

            if (this.log.isDebugEnabled()) {
                this.log.debug("values=[" + valuesStripped + "]");
            }

            // Save the values.
            executeDbSave(context, "work_pkg_bids", valuesStripped);
        }

        JSONObject result = new JSONObject();
        result.put("emailMatchesVendor", emailMatchesVendor);
        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * addWorkPackage rule
     * 
     *@param context Description of the Parameter
     *@param response Description of the Parameter
     * 
     */
    public void addWorkPackage(EventHandlerContext context) {

        if (this.log.isDebugEnabled()) {
            this.log.debug("addWorkPackage");
        }

        // Get the record parameters from the nested hash map.
        Map values = context.getParameters("work_pkgs");

        // Filter out those that do not have the �work_pkg_bids.� Prefix.
        Map valuesFiltered = filterWithPrefix(values, "work_pkgs");

        // Strip the �work_pkgs.� Prefix from the elements in the map so the result will be
        // able to be passed to executeDbSave().
        Map valuesStripped = stripPrefix(valuesFiltered);

        valuesStripped.put("status", "Created");

        if (this.log.isDebugEnabled()) {
            this.log.debug("values=[" + valuesStripped + "]");
        }

        // Save the values.
        executeDbSave(context, "work_pkgs", valuesStripped);

    }

    /**
     * updateDateStatement rule
     * 
     *@param context Description of the Parameter
     *@param days Sub-query to get number of days or number
     *@param planned Planned or scheduled
     * 
     */
    public String updateDateStatement(EventHandlerContext context, String days, boolean planned) {

        if (this.log.isDebugEnabled()) {
            this.log.debug("updateDateStatement");
        }

        String update = "";

        // ////////////////////////////////////////////////////////
        // ////// SYBASE ////////////////////////////////////
        // ////////////////////////////////////////////////////////

        if (isSybase(context)) {

            if (planned) {
                update = " UPDATE activity_log " + " SET  date_planned_end = "
                        + "(CASE	WHEN DATEPART(WEEKDAY, date_planned_for) = 1 AND  "
                        + days
                        + "  <> 7 "
                        + " THEN "
                        + "(CASE  WHEN 	MOD( duration_est_baseline,  "
                        + days
                        + " ) = 0 "
                        + " THEN 	date_planned_for + 1 + duration_est_baseline + (((duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " ELSE 	date_planned_for + 1 + duration_est_baseline + ((duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	MOD( duration_est_baseline,  "
                        + days
                        + " ) = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_planned_for +  "
                        + days
                        + "  - 1)) > ( "
                        + days
                        + "  + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_planned_for +  "
                        + days
                        + "  - 1)) < DATEPART(WEEKDAY, date_planned_for)) "
                        + "  THEN date_planned_for + duration_est_baseline + (((duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) + (7- "
                        + days
                        + " ) - 1 "
                        + "   ELSE date_planned_for + duration_est_baseline + (((duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_planned_for + MOD( duration_est_baseline,  "
                        + days
                        + " ) - 1)) > ( "
                        + days
                        + "  + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_planned_for + MOD( duration_est_baseline,  "
                        + days
                        + " ) - 1)) < DATEPART(WEEKDAY,  date_planned_for)) "
                        + "  THEN date_planned_for + duration_est_baseline + ((duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) + (7- "
                        + days
                        + " ) - 1 "
                        + "  ELSE date_planned_for + duration_est_baseline + ((duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "  END) "
                        + "  END) "
                        + "  END)";
            } else {
                update = " UPDATE activity_log " + " SET  date_scheduled_end = "
                        + "(CASE	WHEN DATEPART(WEEKDAY, date_scheduled) = 1 AND "
                        + days
                        + " <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN 	MOD( duration, "
                        + days
                        + ") = 0 "
                        + " THEN 	date_scheduled + 1 + duration + (((duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + " ELSE 	date_scheduled + 1 + duration + ((duration / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	MOD( duration, "
                        + days
                        + ") = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_scheduled + "
                        + days
                        + " - 1)) > ("
                        + days
                        + " + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_scheduled + "
                        + days
                        + " - 1)) < DATEPART(WEEKDAY, date_scheduled)) "
                        + "  THEN date_scheduled + duration + (((duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) + (7-"
                        + days
                        + ") - 1 "
                        + "   ELSE date_scheduled + duration + (((duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_scheduled + MOD( duration, "
                        + days
                        + ") - 1)) > ("
                        + days
                        + " + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_scheduled + MOD( duration, "
                        + days
                        + ") - 1)) < DATEPART(WEEKDAY,  date_scheduled)) "
                        + "  THEN date_scheduled + duration + ((duration / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) + (7-"
                        + days
                        + ") - 1 "
                        + "  ELSE date_scheduled + duration + ((duration / "
                        + days
                        + ") * (7 - "
                        + days + ")) - 1 " + "  END) " + "  END) " + "  END)";
            }
        }

        // ////////////////////////////////////////////////////////
        // ////// ORACLE ////////////////////////////////////
        // ////////////////////////////////////////////////////////

        if (isOracle(context)) {

            if (planned) {
                update = " UPDATE activity_log " + " SET  date_planned_end = "
                        + "(CASE	WHEN TO_CHAR(date_planned_for, 'D') = 1 AND  "
                        + days
                        + "  <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN 	MOD( duration_est_baseline,  "
                        + days
                        + " ) = 0 "
                        + " THEN 	date_planned_for + 1 + duration_est_baseline + ((FLOOR(duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " ELSE 	date_planned_for + 1 + duration_est_baseline + (FLOOR(duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	MOD( duration_est_baseline,  "
                        + days
                        + " ) = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(TO_CHAR((date_planned_for +  "
                        + days
                        + "  - 1), 'D') > ( "
                        + days
                        + "  + 1)  OR "
                        + "  TO_CHAR((date_planned_for +  "
                        + days
                        + " - 1), 'D') < TO_CHAR(date_planned_for, 'D')) "
                        + "  THEN date_planned_for + duration_est_baseline + ((FLOOR(duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) + (7- "
                        + days
                        + " ) - 1 "
                        + "   ELSE date_planned_for + duration_est_baseline + ((FLOOR(duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN ( TO_CHAR((date_planned_for + MOD( duration_est_baseline,  "
                        + days
                        + " ) - 1), 'D') > ( "
                        + days
                        + "  + 1)  OR "
                        + "  TO_CHAR((date_planned_for + MOD( duration_est_baseline,  "
                        + days
                        + " ) - 1), 'D') < TO_CHAR(date_planned_for, 'D')) "
                        + "  THEN date_planned_for + duration_est_baseline + (FLOOR(duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) + (7 - "
                        + days
                        + " ) - 1 "
                        + "  ELSE date_planned_for + duration_est_baseline + (FLOOR(duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "  END) "
                        + "  END) "
                        + "  END)";
            } else {
                update = " UPDATE activity_log " + " SET  date_scheduled_end = "
                        + "(CASE	WHEN TO_CHAR(date_scheduled, 'D') = 1 AND "
                        + days
                        + " <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN 	MOD( duration, "
                        + days
                        + ") = 0 "
                        + " THEN 	date_scheduled + 1 + duration + ((FLOOR(duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + " ELSE 	date_scheduled + 1 + duration + (FLOOR(duration / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	MOD( duration, "
                        + days
                        + ") = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(TO_CHAR((date_scheduled + "
                        + days
                        + " - 1), 'D') > ("
                        + days
                        + " + 1)  OR "
                        + "  TO_CHAR((date_scheduled + "
                        + days
                        + " - 1), 'D') < TO_CHAR(date_scheduled, 'D')) "
                        + "  THEN date_scheduled + duration + ((FLOOR(duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) + (7 - "
                        + days
                        + ") - 1 "
                        + "   ELSE date_scheduled + duration + ((FLOOR(duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(TO_CHAR((date_scheduled + MOD( duration, "
                        + days
                        + ") - 1), 'D') > ("
                        + days
                        + " + 1)  OR "
                        + "  TO_CHAR((date_scheduled + MOD( duration, "
                        + days
                        + ") - 1), 'D') < TO_CHAR(date_scheduled, 'D')) "
                        + "  THEN date_scheduled + duration + (FLOOR(duration / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) + (7-"
                        + days
                        + ") - 1 "
                        + "  ELSE date_scheduled + duration + (FLOOR(duration / "
                        + days
                        + ") * (7 - " + days + ")) - 1 " + "  END) " + "  END) " + "  END)";
            }
        }

        // ////////////////////////////////////////////////////////////////////////////
        // ////////MS SQL /////////////////////////////////////////////////////////////
        // ///////////////////////////////////////////////////////////////////////////
        if (isSqlServer(context)) {

            if (planned) {

                update = " UPDATE activity_log " + " SET  date_planned_end = "
                        + "(CASE	WHEN DATEPART(WEEKDAY, date_planned_for) = 1 AND  "
                        + days
                        + "  <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN 	duration_est_baseline %  "
                        + days
                        + " = 0 "
                        + " THEN 	date_planned_for + 1 + duration_est_baseline + (((duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " ELSE 	date_planned_for + 1 + duration_est_baseline + ((duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	duration_est_baseline %  "
                        + days
                        + "  = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_planned_for +  "
                        + days
                        + "  - 1)) > ( "
                        + days
                        + "  + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_planned_for +  "
                        + days
                        + "  - 1)) < DATEPART(WEEKDAY, date_planned_for)) "
                        + "  THEN date_planned_for + duration_est_baseline + (((duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) + (7 - "
                        + days
                        + " ) - 1 "
                        + "   ELSE date_planned_for + duration_est_baseline + (((duration_est_baseline /  "
                        + days
                        + " ) - 1) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_planned_for +  duration_est_baseline % "
                        + days
                        + "  - 1)) > ( "
                        + days
                        + "  + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_planned_for +  duration_est_baseline %  "
                        + days
                        + "  - 1)) < DATEPART(WEEKDAY,  date_planned_for)) "
                        + "  THEN date_planned_for + duration_est_baseline + ((duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) + (7- "
                        + days
                        + " ) - 1 "
                        + "  ELSE date_planned_for + duration_est_baseline + ((duration_est_baseline /  "
                        + days
                        + " ) * (7 -  "
                        + days
                        + " )) - 1 "
                        + "  END) "
                        + "  END) "
                        + "  END)";

            } else {
                update = " UPDATE activity_log " + " SET  date_scheduled_end = "
                        + "(CASE	WHEN DATEPART(WEEKDAY, date_scheduled) = 1 AND "
                        + days
                        + " <> 7 "
                        + " THEN "
                        + "(CASE 	WHEN  duration % "
                        + days
                        + " = 0 "
                        + " THEN 	date_scheduled + 1 + duration + (((duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + " ELSE 	date_scheduled + 1 + duration + ((duration / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) - 1 "
                        + " END) "
                        + " ELSE "
                        + " (CASE 	WHEN 	duration % "
                        + days
                        + " = 0 "
                        + " THEN "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_scheduled + "
                        + days
                        + " - 1)) > ("
                        + days
                        + " + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_scheduled + "
                        + days
                        + " - 1)) < DATEPART(WEEKDAY, date_scheduled)) "
                        + "  THEN date_scheduled + duration + (((duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) + (7-"
                        + days
                        + ") - 1 "
                        + "   ELSE date_scheduled + duration + (((duration / "
                        + days
                        + ") - 1) * (7 - "
                        + days
                        + ")) - 1 "
                        + "   END) "
                        + "   ELSE "
                        + "  (CASE 	WHEN 	(DATEPART(WEEKDAY, (date_scheduled + duration % "
                        + days
                        + " - 1)) > ("
                        + days
                        + " + 1)  OR "
                        + "  DATEPART(WEEKDAY, (date_scheduled +  duration % "
                        + days
                        + " - 1)) < DATEPART(WEEKDAY,  date_scheduled)) "
                        + "  THEN date_scheduled + duration + ((duration / "
                        + days
                        + ") * (7 - "
                        + days
                        + ")) + (7 - "
                        + days
                        + ") - 1 "
                        + "  ELSE date_scheduled + duration + ((duration / "
                        + days
                        + ") * (7 - "
                        + days + ")) - 1 " + "  END) " + "  END) " + "  END)";
            }
        }
        return update;
    }
}
