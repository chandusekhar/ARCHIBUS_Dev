package com.archibus.eventhandler.CapitalProjects;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

/**
 * This event handler implements business logic related to Capital Budgeting. Copyright (c) 2005,
 * ARCHIBUS, Inc.
 *
 * @author Antoni Ansarov
 * @created June 1, 2005
 * @version 1.0
 */
public class CapitalProjectsHandler extends EventHandlerBase {

    // enable db exceptions for testing
    final static boolean THROW_EXCEPTION = false;

    final String prefix = "[ARCHIBUS] ";

    final String newLine = " \n\n ";

    /**
     * getCurrrentDate
     *
     * @param context Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public String getCurrentDate(final EventHandlerContext context) {
        final java.sql.Date date = Utility.currentDate();
        final String current_date =
                formatSqlFieldValue(context, date, "java.sql.Date", "current_date");
        return current_date;
    }

    /**
     * Creates new or updates existing record using specified table name and field values.
     */
    public void saveRecord(final EventHandlerContext context) {

        // get input parameters from context
        final String tableName = (String) context.getParameter("tableName");
        String pkeyName = null;
        if (context.parameterExists("pkeyName")) {
            pkeyName = (String) context.getParameter("pkeyName");
        }
        final Map fieldValues = context.getParameters("fields");

        // create or update record
        executeDbSave(context, tableName, stripPrefix(fieldValues));

        // if requested, retrieve new object pkey value and attach it to the response as "message"
        if (pkeyName != null) {
            final Double pkeyDouble = retrieveStatistic(context, "max", null, tableName, pkeyName);
            final Integer pkeyInt = new Integer(pkeyDouble.intValue());
            context.addResponseParameter("message", pkeyInt.toString());
        }
    }

    /**
     * sendEmail
     *
     * @param context Description of the Parameter
     * @param recipient Description of the Parameter
     * @param subject Description of the Parameter
     * @param body Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */

    private void sendEmail(final EventHandlerContext context, final String body,
            final String subject, final String recipient) {

        context.addResponseParameter("notifyEmailAddress", recipient);
        context.addResponseParameter("notifySubject", subject);
        context.addResponseParameter("notifyBody", body);
        context.addResponseParameter("activityId", "AbCapitalBudgeting");

        runWorkflowRule(context, "AbCommonResources-notify", true);

    }

    /**
     * getRequestor from mo or project
     *
     * @param context Description of the Parameter
     * @param mo_id Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The requestor value
     * @exception ExceptionBase Description of the Exception
     */
    private String getRequestor(final EventHandlerContext context, final String mo_id,
            final String project_id) {
        String requestor = null;
        if (notNull(mo_id).length() == 0) {
            requestor =
                    (String) selectDbValue(context, "project", "requestor", "project_id = "
                            + literal(context, project_id));
        } else {
            requestor =
                    (String) selectDbValue(context, "mo", "requestor",
                        "mo_id = " + literal(context, mo_id));
        }
        return requestor;
    }

    /**
     * getProjectManager from mo or project
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The requestor value
     * @exception ExceptionBase Description of the Exception
     */
    private String getProjectManager(final EventHandlerContext context, final String project_id) {
        return (String) selectDbValue(context, "project", "proj_mgr",
            "project_id = " + literal(context, project_id));
    }

    /**
     * getDepartmentContact from mo or project
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @param mo_id Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The departmentContact value
     * @exception ExceptionBase Description of the Exception
     */
    private String getDepartmentContact(final EventHandlerContext context, final String mo_id,
            final String project_id) {
        String contact = null;
        if (notNull(mo_id).length() == 0) {
            contact =
                    (String) selectDbValue(context, "project", "dept_contact", "project_id = "
                            + literal(context, project_id));
        } else {
            contact =
                    (String) selectDbValue(context, "mo", "dept_contact",
                        "mo_id = " + literal(context, mo_id));
        }
        return contact;
    }

    /**
     * getActivityLogFields
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @param excludeField Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */

    private String getActivityLogFields(final EventHandlerContext context,
            final String excludeFields) {
        // XXX: use StringBuffer to hold string values !!!!
        final StringBuffer fieldNames = new StringBuffer();
        // XXX: Never directly query schema table afl_flds!!!!
        final String[] tableFieldNames = EventHandlerBase.getAllFieldNames(context, "activity_log");
        for (final String fieldName : tableFieldNames) {
            if (excludeFields.indexOf(fieldName) == -1) {
                if (fieldNames.length() != 0) {
                    fieldNames.append(",");
                }
                fieldNames.append(fieldName);
            }
        }
        return fieldNames.toString();
    }

    /**
     * prepareStringList
     *
     * @param aValue List of string id's like Id1;Id2;Id3
     * @return Returns an id string list like ('Id1','Id2','Id3')
     * @exception ExceptionBase Description of the Exception
     */

    private String prepareStringList(final String aValue, final EventHandlerContext context) {

        final StringTokenizer ids = new StringTokenizer(aValue, ";");

        String strRet = "";
        while (ids.hasMoreTokens()) {
            if (strRet.length() > 0) {
                strRet += ",";
            }
            strRet += formatSqlFieldValue(context, ids.nextToken(), "java.lang.String", null);
        }

        strRet = "(" + strRet + ")";
        return strRet;
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    // //////////////////////// CAPITAL PROJECT WORKFLOW RULES
    // ////////////////////////////////////////////
    // ////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void insertProjectQuestionnaireRecord(final EventHandlerContext context)
            throws ExceptionBase {
        /*
         * InsertProjectQuestionnaireRecord: Purpose: Adds a new questionnaire record for a project
         * type Passed Parameters: {selected project_type} SQL Statement: INSERT INTO questionnaire
         * (questionnaire_id, title, table_name, field_name, description) VALUES ( �PROJECT�
         * #Concat%% �-� #Concat%% {selected project_type}, �Questionnaire: PROJECT� #Concat%% �-�
         * #Concat%% {selected project_type}, �project�, �project_quest�, �Questionnaire for
         * PROJECT� #Concat%% �-� #Concat%% {selected project_type})
         */
        final String HANDLER = "CapitalProjectsHandler.insertProjectQuestionnaireRecord";

        final String project_type = (String) context.getParameter("project_type");
        if (notNull(project_type).length() == 0) {
            // @translatable
            final String errorMessage = "project_type is required!";

            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(HANDLER + ": " + errorMessage);
            exception.setTranslatable(true);

            throw exception;
        }

        final String sqlInsert =
                " INSERT INTO questionnaire  (questionnaire_id, title, table_name, field_name, description) VALUES ("
                        + literal(context, "Project - " + project_type)
                        + ","
                        + literal(context, "Questionnaire:PROJECT-" + project_type)
                        + ","
                        + "'project', 'project_quest',"
                        + literal(context, "Questionnaire for PROJECT-" + project_type) + ")";

        if (this.log.isDebugEnabled()) {
            this.log.debug(HANDLER + ": project_type=[" + project_type + "]");
            this.log.debug(HANDLER + ": SQL Statement=[" + sqlInsert + "]");
        }

        executeDbSql(context, sqlInsert, THROW_EXCEPTION);

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void setFieldDefaultValue(final EventHandlerContext context) {
        /*
         * SetFieldDefaultValue: Purpose: Sets a default value for a field in a table where the user
         * has just added a record Passed Parameters: {table}, {field}, {value} SQL Statement:
         * UPDATE {table} SET {field} = {value} WHERE {the record�s pkey field(s) are the same as
         * the record just saved by the default SAVE function} Implementation Note: This needs to
         * tie into the default Save functionality to get the pkey values of the record just saved.
         * If this is not possible then we may have to pass those pkey�s as parameters.
         */
        final String HANDLER = "CapitalProjectsHandler.setFieldDefaultValue";

        final String parameterTableName = (String) context.getParameter("parameterTableName");
        final String parameterFieldNames = (String) context.getParameter("parameterFieldNames");
        final String parameterFieldValues = (String) context.getParameter("parameterFieldValues");
        final String parameterFieldTypes = (String) context.getParameter("parameterFieldTypes");
        final Map fieldValues = new HashMap(context.getParameters("fields"));

        // Handle setting multiple values with semi-colon delimited field and value lists
        final StringTokenizer fields = new StringTokenizer(parameterFieldNames, ";");
        final StringTokenizer values = new StringTokenizer(parameterFieldValues, ";");
        final StringTokenizer types = new StringTokenizer(parameterFieldTypes, ";");

        // Currently it's not an error if one list is longer than the rest
        while (fields.hasMoreTokens() && values.hasMoreTokens() && types.hasMoreTokens()) {
            final String fieldName = fields.nextToken();
            final String fieldVal = values.nextToken();
            final String fieldType = types.nextToken();

            final Object fieldValueObject =
                    parseFieldValue(context, fieldVal, fieldType, fieldName);
            if (fieldValueObject != null) {
                fieldValues.put(fieldName, fieldValueObject);
            }
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug(HANDLER + ": table=[" + parameterTableName + "], input values=["
                    + fieldValues + "]");
        }

        executeDbSave(context, parameterTableName, fieldValues);
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void createFCIScenario(final EventHandlerContext context) {

        final String project_id = (String) context.getParameter("project_id");
        final String fiscal_year = (String) context.getParameter("fiscal_year");
        final String proj_scenario_id = (String) context.getParameter("proj_scenario_id");

        final String sqlInsert =
                "INSERT INTO actscns (proj_scenario_id, activity_log_id, fiscal_year) SELECT "
                        + literal(context, proj_scenario_id) + ", activity_log_id, " + fiscal_year
                        + " FROM activity_log WHERE activity_type='ASSESSMENT' AND project_id = "
                        + literal(context, project_id) + " AND NOT EXISTS (SELECT 1 FROM actscns "
                        + " WHERE actscns.activity_log_id = activity_log.activity_log_id "
                        + " AND actscns.proj_scenario_id = " + literal(context, proj_scenario_id)
                        + ") ";

        executeDbSql(context, sqlInsert, false);

    }

    /**
     * createProject
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void createProject(final EventHandlerContext context) {
        /*
         * CreateProject: Purpose: Inserts a new record with status of �Created�, similar to the
         * Move record creation process, so that a questionnaire can be displayed based on the
         * project type. Copy department contact information from the em table. Passed Parameters:
         * project fields Logic: This can be exactly like the MovesHandler-AddMoveProjectRecord
         * method.
         */
        final String HANDLER = "CapitalProjectsHandler.createProject";

        final Map fieldValues = context.getParameters("projectFields");
        if (this.log.isDebugEnabled()) {
            this.log.debug(HANDLER + ": input values=[" + fieldValues + "]");
        }

        final String project_id = (String) fieldValues.get("project.project_id");
        final String project_type = (String) fieldValues.get("project.project_type");
        final String bl_id = (String) fieldValues.get("project.bl_id");
        final String requestor = (String) fieldValues.get("project.requestor");
        final String dept_contact = (String) fieldValues.get("project.dept_contact");
        final String contact_id = (String) fieldValues.get("project.contact_id");
        final String summary = (String) fieldValues.get("project.summary");

        final java.sql.Date date_start_date = (java.sql.Date) fieldValues.get("project.date_start");
        final java.sql.Date date_end_date = (java.sql.Date) fieldValues.get("project.date_end");
        formatSqlFieldValue(context, date_start_date, "java.sql.Date", "date_start");
        formatSqlFieldValue(context, date_end_date, "java.sql.Date", "date_end");

        final String projectIdSqlQuery =
                "SELECT project_id FROM project WHERE project_id = " + literal(context, project_id);
        final List rows = selectDbRecords(context, projectIdSqlQuery);
        if (rows.size() == 0) {
            /*
             * final String sqlInsert =
             * "INSERT INTO project (contact_id, summary, project_id,project_type,bl_id, description,date_start,date_end,requestor,"
             * + "dept_contact,phone_req,phone_dept_contact,dv_id,dp_id,date_created) " + " SELECT "
             * + literal(context, contact_id) + "," + literal(context, summary) + "," +
             * literal(context, project_id) + "," + literal(context, project_type) + "," +
             * literal(context, bl_id) + "," + literal(context, description) + "," + date_start +
             * "," + date_end + "," + literal(context, requestor) + "," + literal(context,
             * dept_contact) + "," + " requestor.phone," + " dept_contact.phone," +
             * " dept_contact.dv_id," + " dept_contact.dp_id," + getCurrentDate(context) +
             * " FROM em requestor, em dept_contact " + " WHERE requestor.em_id = " +
             * literal(context, requestor) + " AND dept_contact.em_id = " + literal(context,
             * dept_contact);
             */
            /*
             * (JH 08.30.2005 - Recreated in v15.1.1.42 on Sybase. The WFR SQL is wrong. It needs to
             * be corrected. The SQL should be: INSERT INTO project (project_id, project_type,
             * requestor, phone_req, dept_contact, phone_dept_contact, summary) VALUES (
             * {project_id}, {project_type}, {requestor}, {phone_req}, {dept_contact},
             * {phone_dept_contact}, {summary} )
             */

            final String phone_req =
                    (String) selectDbValue(context, "em", "phone",
                        "em_id" + "=" + literal(context, requestor));
            final String phone_dept_contact =
                    (String) selectDbValue(context, "em", "phone",
                        "em_id" + "=" + literal(context, dept_contact));

            final String sqlInsert =
                    "INSERT INTO project "
                            + "(contact_id, project_id, project_type, bl_id, requestor, phone_req, dept_contact, phone_dept_contact, summary)"
                            + " VALUES " + "(" + literal(context, contact_id) + ","
                            + literal(context, project_id) + "," + literal(context, project_type)
                            + "," + literal(context, bl_id) + "," + literal(context, requestor)
                            + "," + literal(context, phone_req) + ","
                            + literal(context, dept_contact) + ","
                            + literal(context, phone_dept_contact) + ","
                            + literal(context, summary) + ")";

            executeDbSql(context, sqlInsert, true);
        } else {
            // Group Move already includes item. Show error message
            // @translatable
            final String errorMessage = "Project [{0}] already exists.";

            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMessage);
            exception.setTranslatable(true);
            final Object[] args = { project_id };
            exception.setArgs(args);

            throw exception;
        }

    }

    /**
     * requestProject
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void requestProject(final EventHandlerContext context) {

        /*
         * RequestProject: Purpose: changes the status from �Created� to �Requested� Passed
         * Parameters: project fields Logic: This can be exactly like the
         * MovesHandler-RequestGroupMove EXCEPT: - Remove UpdateSQL2 statement - Remove all
         * references to �move� - Change the comments � they are incorrect.
         */

        // Get the record parameters from the nested hash map.
        final Map values = fromJSONObject(context.getJSONObject("fieldValues"));
        final String project_id = (String) values.get("project.project_id");

        // Filter out those that do not have the �project.� Prefix.
        final Map valuesFiltered = filterWithPrefix(values, "project");

        // Strip the �project.� Prefix from the elements in the map so the result will be
        // able to be passed to executeDbSave().
        final Map valuesStripped = stripPrefix(valuesFiltered);

        // Save the values.
        executeDbSave(context, "project", valuesStripped);

        // execute the sql commands as one tranaction.
        final Vector sqlCommands = new Vector();
        final String updateSql1 =
                "UPDATE project set status='Requested',date_requested=" + getCurrentDate(context)
                + " where project_id=" + literal(context, project_id);
        sqlCommands.add(updateSql1);

        // System.out.println(updateSql1);

        executeDbSqlCommands(context, sqlCommands, THROW_EXCEPTION);

        // //////////////////////////////////////////////////////////////////////////////////////////////////////
        // Send email notifications
        // /////////////////////////////////////////////////////////////////////////////////////////////////////

        // Emails will get sent to the Requestor and the Department Contact.

        // @translatable
        String text = "Thank you for submitting a project request.";
        text = localizeString(context, text);

        // @translatable
        String textDeptContact =
                localizeString(context,
                        "A project has been placed in your queue to be routed for approval.");

        String link = "\n\n" + getWebCentralPath(context) + "/ab-examine-project-form.axvw";
        link += "?project.project_id=" + project_id;

        text = text + link;

        textDeptContact = textDeptContact + link;

        final String requestor = getEmailAddress(context, getRequestor(context, "", project_id));
        final String deptContact =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));

        // @translatable
        String subject = "Requested project";
        subject = localizeString(context, subject);

        if (notNull(requestor).length() != 0) {
            sendEmail(context, text, this.prefix + subject, requestor);
        }

        if (notNull(deptContact).length() != 0) {
            sendEmail(context, textDeptContact, this.prefix + subject, deptContact);
        }

    }

    /**
     * KB3047494 Update project actions when the project is requested.
     *
     * @param context Description of the Parameter.
     */
    public void requestActions(final EventHandlerContext context) {
        // Get the record parameters from the nested hash map.
        final Map values = fromJSONObject(context.getJSONObject("fieldValues"));
        final String project_id = (String) values.get("project.project_id");
        
        // execute the sql commands as one tranaction.
        final Vector sqlCommands = new Vector();
        final String updateSql1 =
                "UPDATE activity_log SET status='REQUESTED'," + "requestor="
                        + literal(context, ContextStore.get().getUser().getEmployee().getId())
                        + "," + "date_requested=" + getCurrentDate(context) + " WHERE project_id="
                        + literal(context, project_id);
        sqlCommands.add(updateSql1);
        executeDbSqlCommands(context, sqlCommands, THROW_EXCEPTION);
    }

    /**
     * withdrawProject
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void withdrawProject(final EventHandlerContext context) {

        /*
         * WithdrawProject: Purpose: changes the status from �Created� to �Created-Withdrawn� Passed
         * Parameters: project fields Logic: This can be exactly like the
         * MovesHandler-WithdrawGroupMove method EXCEPT: - Remove the DeleteProject SQL statement -
         * Add �AND status = �Created� to the DeleteMove SQL and Rename the statement DeleteProject
         * (the stmts are misnamed in the move method): � DELETE FROM project WHERE
         * project.project_id = {project_id} AND status = �Created�
         */

        final String project_id = (String) context.getParameter("project_id");

        /*
         * Withdraw Group Move Rule triggers upon the pressing of the Withdraw button. This button
         * is only visible in the second Request a Group Move form and if the project has the status
         * of Created.
         */
        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("withdrawProject");
        }

        final Vector sqlCommands = new Vector();
        final String deleteProject =
                "DELETE FROM project WHERE project.project_id = " + literal(context, project_id)
                + " AND status = 'Created' ";
        sqlCommands.add(deleteProject);
        executeDbSqlCommands(context, sqlCommands, THROW_EXCEPTION);

    }

    /**
     * copyActionsToProject
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void copyActionsToProject(final EventHandlerContext context) {
        final String activity_log_ids = (String) context.getParameter("activity_log_ids");
        final String project_id = (String) context.getParameter("project_id");

        if (this.log.isDebugEnabled()) {
            this.log.debug("copyActionsToProject");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        final String fields =
                getActivityLogFields(context, "copied_from;project_id;activity_log_id");

        if (this.log.isDebugEnabled()) {
            this.log.debug("fields=[" + fields + "]");
        }

        final StringTokenizer ids = new StringTokenizer(activity_log_ids, ",");

        while (ids.hasMoreTokens()) {

            final String activity_log_id = ids.nextToken();

            if (notNull(activity_log_id).length() != 0) {

                final String sqlInsert =
                        "INSERT INTO activity_log (copied_from,project_id," + fields + ")"
                                + " SELECT activity_log_id " + "," + literal(context, project_id)
                                + "," + fields + " FROM activity_log WHERE activity_log_id = "
                                + activity_log_id;

                // System.out.println(sqlInsert);
                executeDbSql(context, sqlInsert, true);
            }
        }

    }

    /**
     * copyTemplateActionsToProject
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void copyTemplateActionsToProject(final EventHandlerContext context) {
        final String project_id_template = (String) context.getParameter("proj_id_template");
        final String project_id_destination = (String) context.getParameter("proj_id_destination");

        if (this.log.isDebugEnabled()) {
            this.log.debug("copyTemplateActionsToProject");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id_template=[" + project_id_template + "]");
        }

        String strWorkPkgInsert = "";
        if (isOracle(context)) {
            strWorkPkgInsert =
                    " INSERT INTO work_pkgs (project_id, work_pkg_id, summary, description, days_per_week, date_est_start, date_est_end) SELECT "
                            + literal(context, project_id_destination)
                            + ", work_pkg_id, summary, description, days_per_week"
                            + ", (SELECT project.date_start FROM project WHERE project.project_id = "
                            + literal(context, project_id_destination)
                            + ")  work_pkg_date_start, (SELECT project.date_end FROM project WHERE project.project_id = "
                            + literal(context, project_id_destination)
                            + ") work_pkg_date_end FROM work_pkgs WHERE project_id = "
                            + literal(context, project_id_template);
        } else {
            strWorkPkgInsert =
                    " INSERT INTO work_pkgs (project_id, work_pkg_id, summary, description, days_per_week, date_est_start, date_est_end) SELECT "
                            + literal(context, project_id_destination)
                            + ", work_pkg_id, summary, description, days_per_week"
                            + ", (SELECT project.date_start FROM project WHERE project.project_id = "
                            + literal(context, project_id_destination)
                            + ") AS work_pkg_date_start, (SELECT project.date_end FROM project WHERE project.project_id = "
                            + literal(context, project_id_destination)
                            + ") AS work_pkg_date_end FROM work_pkgs WHERE project_id = "
                            + literal(context, project_id_template);

        }
        executeDbSql(context, strWorkPkgInsert, THROW_EXCEPTION);

        final String fields =
                getActivityLogFields(context,
                        "project_id;activity_log_id;date_requested;date_planned_for;date_scheduled");
        String strInsert = "";
        if (isOracle(context)) {
            strInsert =
                    " INSERT INTO activity_log (project_id,date_planned_for,date_scheduled,"
                            + fields
                            + ")"
                            + " SELECT "
                            + literal(context, project_id_destination)
                            + ", (SELECT project.date_start FROM project WHERE project.project_id = "
                            + literal(context, project_id_destination)
                            + ") project_date_planned_for, (SELECT project.date_start FROM project WHERE project.project_id = "
                            + literal(context, project_id_destination)
                            + ") project_date_scheduled," + fields + " FROM activity_log "
                            + " WHERE project_id = " + literal(context, project_id_template);
        } else {
            strInsert =
                    " INSERT INTO activity_log (project_id,date_planned_for,date_scheduled,"
                            + fields
                            + ")"
                            + " SELECT "
                            + literal(context, project_id_destination)
                            + ", (SELECT project.date_start FROM project WHERE project.project_id = "
                            + literal(context, project_id_destination)
                            + ") AS project_date_planned_for, (SELECT project.date_start FROM project WHERE project.project_id = "
                            + literal(context, project_id_destination)
                            + ") AS project_date_scheduled," + fields + " FROM activity_log "
                            + " WHERE project_id = " + literal(context, project_id_template);
        }
        executeDbSql(context, strInsert, THROW_EXCEPTION);
    }

    /**
     * rollUpActionCostsToProjects Sums up activity_log baseline and design estimated costs to
     * projects
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void rollUpActionCostsToProjects(final EventHandlerContext context) {

        final String project_id = (String) context.getParameter("project_id");

        /*
         * UPDATE project SET cost_est_baseline = ( CASE WHEN (SELECT SUM(cost_est_cap +
         * cost_estimated) FROM activity_log WHERE project_id = {Project id} ) IS NULL THEN 0 ELSE
         * (SELECT SUM(cost_est_cap + cost_estimated) FROM activity_log WHERE project_id = {Project
         * id} ) END ) , cost_est_design = ( CASE WHEN (SELECT SUM(cost_est_design_cap +
         * cost_est_design_exp) FROM activity_log WHERE project_id = {Project id} ) IS NULL THEN 0
         * ELSE (SELECT SUM(cost_est_design_cap + cost_est_design_exp) FROM activity_log WHERE
         * project_id = {Project id} ) END ) WHERE project_id = {Project id};
         */

        if (this.log.isDebugEnabled()) {
            this.log.debug("rollUpActionCostsToProjects");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        final String updateSQL =
                " UPDATE project SET " + " cost_est_baseline = " + " ( CASE WHEN "
                        + " (SELECT SUM(cost_est_cap + cost_estimated) "
                        + " FROM activity_log WHERE project_id = "
                        + literal(context, project_id)
                        + " )"
                        + " IS NULL THEN 0 ELSE "
                        + " (SELECT SUM(cost_est_cap + cost_estimated) "
                        + " FROM activity_log WHERE project_id = "
                        + literal(context, project_id)
                        + " )"
                        + " END ) "
                        + " , cost_est_design = "
                        + " ( CASE WHEN "
                        + " (SELECT SUM(cost_est_design_cap + cost_est_design_exp) "
                        + "  FROM activity_log WHERE project_id = "
                        + literal(context, project_id)
                        + " )"
                        + " IS NULL THEN 0 ELSE "
                        + " (SELECT SUM(cost_est_design_cap + cost_est_design_exp) "
                        + " FROM activity_log WHERE project_id = "
                        + literal(context, project_id)
                        + " )" + " END ) " + " WHERE project_id = " + literal(context, project_id);

        executeDbSql(context, updateSQL, THROW_EXCEPTION);

    }

    /**
     * createScenarioItemsFromActivityLogs
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void createScenarioItemsFromActivityLogs(final EventHandlerContext context) {

        /*
         * CreateScenarioItemsFromActivityLogs() Purpose: Creates scenario cost records from
         * activity_log data. Passed parameters: { Project id}, {proj_scenario_id} SQL Statement:
         * INSERT INTO projscns (project_id, proj_scenario_id, costs_est_cap, costs_est_exp,
         * fiscal_year, fund_id ) SELECT ( project_id, {proj_scenario_id}, cost_est_cap,
         * cost_estimate, YEAR(date_planned_for), �Not Specified� ) FROM activity_log WHERE
         * project_id = { project id} GROUP BY YEAR(date_planned_for)
         */

        final WorkflowRulesContainer.Immutable container = getWorkflowRulesContainer(context);
        final WorkflowRule.Immutable workflowRule =
                container.getWorkflowRule("AbCommonResources-ActionService");

        container.runRule(workflowRule, "calcActivityLogDatePlannedEndForProject", context);

        final String project_id = (String) context.getParameter("project_id");
        final String project_scenario_id = (String) context.getParameter("project_scenario_id");

        if (this.log.isDebugEnabled()) {
            this.log.debug("createScenarioItemsFromActivityLogs");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        String sqlInsert = "";

        if (isOracle(context)) {
            sqlInsert =
                    "INSERT INTO projscns "
                            + "(project_id, proj_scenario_id, costs_est_cap, costs_est_exp, fiscal_year, fund_id ) "
                            + "( SELECT project_id, MAX("
                            + literal(context, project_scenario_id)
                            + "), 0, 0, TO_NUMBER( TO_CHAR( date_planned_for, 'YYYY' )), MAX('Not Specified') "
                            + "FROM activity_log WHERE project_id = "
                            + literal(context, project_id)
                            + " AND date_planned_for IS NOT NULL "
                            + " AND NOT EXISTS (SELECT 1 FROM projscns "
                            + " WHERE projscns.project_id = activity_log.project_id "
                            + " AND projscns.proj_scenario_id = "
                            + literal(context, project_scenario_id)
                            + " AND projscns.fiscal_year = TO_NUMBER( TO_CHAR( activity_log.date_planned_for, 'YYYY' )) "
                            + " AND projscns.fund_id = 'Not Specified' ) "
                            + " GROUP BY project_id, TO_NUMBER( TO_CHAR( date_planned_for, 'YYYY' ))) ";
        } else {
            sqlInsert =
                    "INSERT INTO projscns "
                            + "(project_id, proj_scenario_id, costs_est_cap, costs_est_exp, fiscal_year, fund_id ) "
                            + "( SELECT project_id, MAX(" + literal(context, project_scenario_id)
                            + "), 0, 0, YEAR(date_planned_for), MAX('Not Specified') "
                            + "FROM activity_log WHERE project_id = "
                            + literal(context, project_id) + " AND date_planned_for IS NOT NULL "
                            + " AND NOT EXISTS (SELECT 1 FROM projscns "
                            + " WHERE projscns.project_id = activity_log.project_id "
                            + " AND projscns.proj_scenario_id = "
                            + literal(context, project_scenario_id)
                            + " AND projscns.fiscal_year = YEAR(activity_log.date_planned_for) "
                            + " AND projscns.fund_id = 'Not Specified' ) "
                            + " GROUP BY project_id, YEAR(date_planned_for)) ";

        }

        // set to false to avoid no records updated error
        executeDbSql(context, sqlInsert, false);
    }

    /**
     * routeProjectForApproval
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void routeProjectForApproval(final EventHandlerContext context) {
        /*
         * RouteProjectForApproval() Purpose: Sends emails to Approving Managers; changes project
         * status. Passed parameters: { Project id} SQL Statement: UPDATE project SET status =
         * 'Requested-Routed' WHERE project_id = { Project id} Implementation Note: This WFR is very
         * similar to the RouteGroupMoveForApproval method. Except: - There is no UpdateSQL2
         * statement - The word �move� in the notifications should be �Project� - The view link
         * should be to /ab-project-approve-form.axvw - The subject for the emails should be
         * �Project requires approval� instead of �Move Approved�
         */

        final String project_id = (String) context.getParameter("project_id");
        String apprv_mgr1 = (String) context.getParameter("apprv_mgr1");
        String apprv_mgr2 = (String) context.getParameter("apprv_mgr2");
        String apprv_mgr3 = (String) context.getParameter("apprv_mgr3");

        String appr_mgr1_email = null;
        String appr_mgr2_email = null;
        String appr_mgr3_email = null;

        // get approving manager's email addresses
        if (notNull(apprv_mgr1).length() == 0) {
            apprv_mgr1 = "";
        } else {
            appr_mgr1_email = getEmailAddress(context, apprv_mgr1);
        }
        if (notNull(apprv_mgr2).length() == 0) {
            apprv_mgr2 = "";
        } else {
            appr_mgr2_email = getEmailAddress(context, apprv_mgr2);
        }
        if (notNull(apprv_mgr3).length() == 0) {
            apprv_mgr3 = "";
        } else {
            appr_mgr3_email = getEmailAddress(context, apprv_mgr3);
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("routeProjectForApproval");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        final Vector sqlCommands = new Vector();
        final String updateSql1 =
                "UPDATE project set status = 'Requested-Routed' WHERE project.project_id = "
                        + literal(context, project_id);

        sqlCommands.add(updateSql1);
        executeDbSqlCommands(context, sqlCommands, THROW_EXCEPTION);

        // //////////////////////////////////////////////////////////////////////////////////////////////////////
        // Send email notifications
        // /////////////////////////////////////////////////////////////////////////////////////////////////////

        // Emails will get sent to the Requestor and the Department Contact.

        // @translatable
        String text =
                "Please indicate your approval by clicking in the URL below and selecting from the action options that appear next to your name";
        text = localizeString(context, text);

        text = this.newLine + text + this.newLine;

        // @translatable
        String text2 = "Project [{0}] routed for approval.";
        final Object[] args = new Object[] { project_id };
        text2 = prepareMessage(context, text2, args);
        text2 = this.newLine + text2 + this.newLine;

        String link = "\n\n" + getWebCentralPath(context) + "/ab-project-approve-form.axvw";
        link += "?project.project_id=" + project_id;

        // @translatable
        String subject = "Approval required";
        subject = localizeString(context, subject);

        final String requestor = getEmailAddress(context, getRequestor(context, "", project_id));
        final String deptContact =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));

        if (notNull(requestor).length() != 0) {
            sendEmail(context, text2, "[ARCHIBUS] " + subject, requestor);
        }

        if (notNull(deptContact).length() != 0) {
            sendEmail(context, text2, "[ARCHIBUS] " + subject, deptContact);
        }

        if (notNull(appr_mgr1_email).length() != 0) {
            sendEmail(context, text + link, "[ARCHIBUS] " + subject, appr_mgr1_email);
        }

        if (notNull(appr_mgr2_email).length() != 0) {
            sendEmail(context, text + link, "[ARCHIBUS] " + subject, appr_mgr2_email);
        }

        if (notNull(appr_mgr3_email).length() != 0) {
            sendEmail(context, text + link, "[ARCHIBUS] " + subject, appr_mgr3_email);
        }

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @param project_id The new approvingManagersStatusGroup value
     * @exception ExceptionBase Description of the Exception
     */

    private void setApprovingManagersStatusGroup(final EventHandlerContext context,
            final String project_id) {

        /*
         * 2)Checks if all the approval managers have approved the move, and if so, sets the mo
         * status field to 'Approved'. Here is pseudo-code for how this might be done: Use a
         * recordset to retrieve: "SELECT apprv_mgr1, apprv_mgr1_status, apprv_mgr2,
         * apprv_mgr2_status, apprv_mgr3, apprv_mgr3_status FROM mo WHERE mo_id = "+ mo_id; For each
         * approval manager, check if they have approved the move: Boolean bApprove = true; if
         * (apprv_mgr1 != NULL && apprv_mgr1_status != 'Approve') bApprove = false; / ... etc. for
         * apprv mgr 2 and 3 if (bApprove) sql =
         * "UPDATE mo SET status = 'Approved' WHERE project_id = " + project_id; String emailAddress
         * = "";
         */

        final List records =
                selectDbRecords(context, "project", new String[] { "apprv_mgr1",
                        "apprv_mgr1_status", "apprv_mgr2", "apprv_mgr2_status", "apprv_mgr3",
                "apprv_mgr3_status" }, "project_id=" + literal(context, project_id));

        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();

            final String apprv_mgr1 = (String) record[0];
            final String apprv_mgr2 = (String) record[2];
            final String apprv_mgr3 = (String) record[4];

            final String apprv_mgr1_status = (String) record[1];
            final String apprv_mgr2_status = (String) record[3];
            final String apprv_mgr3_status = (String) record[5];

            boolean bApprove = true;
            if (notNull(apprv_mgr1).length() > 0
                    && !notNull(apprv_mgr1_status).equalsIgnoreCase("A")) {
                bApprove = false;
            }

            if (notNull(apprv_mgr2).length() > 0
                    && !notNull(apprv_mgr2_status).equalsIgnoreCase("A")) {
                bApprove = false;
            }

            if (notNull(apprv_mgr3).length() > 0
                    && !notNull(apprv_mgr3_status).equalsIgnoreCase("A")) {
                bApprove = false;
            }

            if (bApprove) {

                final Vector sqlCommands = new Vector();
                final String updateProject =
                        "UPDATE project SET status = 'Approved', date_approved = "
                                + getCurrentDate(context) + " WHERE project_id = "
                                + literal(context, project_id);
                sqlCommands.add(updateProject);
                executeDbSqlCommands(context, sqlCommands, THROW_EXCEPTION);
            }
        }

    }

    /**
     * approveProject
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void approveProject(final EventHandlerContext context) {

        /*
         * ApproveProject() Purpose: Updates the approval status for an individual approving
         * manager. If all approving managers have approved the project then the project status is
         * updated. Passed parameters: {project_id}, {em_id}, {apprv_mgr1}, {apprv_mgr2},
         * {apprv_mgr3} Logic: Exactly like ApproveGroupMove and SetApprovingManagerStatusGroup
         * except the UpdateMoves SQL statement should be removed from BOTH methods.
         */

        final String project_id = (String) context.getParameter("project_id");
        final String em_em_id = (String) context.getParameter("em_em_id");
        final String apprv_mgr1 = (String) context.getParameter("apprv_mgr1");
        final String apprv_mgr2 = (String) context.getParameter("apprv_mgr2");
        final String apprv_mgr3 = (String) context.getParameter("apprv_mgr3");

        // Set the status_field value based on which approving manager the current user is

        String status_field = "";
        String date_field = "";

        if (em_em_id.equalsIgnoreCase(apprv_mgr1)) {
            status_field = "apprv_mgr1_status";
            date_field = "date_app_mgr1";
        } else if (em_em_id.equalsIgnoreCase(apprv_mgr2)) {
            status_field = "apprv_mgr2_status";
            date_field = "date_app_mgr2";
        } else if (em_em_id.equalsIgnoreCase(apprv_mgr3)) {
            status_field = "apprv_mgr3_status";
            date_field = "date_app_mgr3";
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("approveGroupMove");
        }

        final Vector sqlCommands = new Vector();

        String updateProject = "";
        if (isOracle(context)) {

            updateProject =
                    "BEGIN UPDATE project SET " + status_field + " = 'A', " + date_field + " = "
                            + getCurrentDate(context) + " WHERE project.project_id = "
                            + literal(context, project_id) + "; COMMIT; END;";

        } else {

            updateProject =
                    "UPDATE project SET " + status_field + " = 'A', " + date_field + " = "
                            + getCurrentDate(context) + " WHERE project.project_id = "
                            + literal(context, project_id);

        }

        sqlCommands.add(updateProject);
        executeDbSqlCommands(context, sqlCommands, THROW_EXCEPTION);

        setApprovingManagersStatusGroup(context, project_id);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        // @translatable
        String text = "Project [{0}] has been approved by [{1}]";
        final Object[] args = new Object[] { project_id, em_em_id };
        text = prepareMessage(context, text, args);

        text = this.newLine + text;

        String link = "\n\n" + getWebCentralPath(context) + "/ab-examine-project-form.axvw";
        link += "?project.project_id=" + project_id;

        text = text + link;

        final String requestor = getEmailAddress(context, getRequestor(context, "", project_id));
        final String deptContact =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        final String projectManager =
                getEmailAddress(context, getProjectManager(context, project_id));

        // @translatable
        String subject = "Project approved";
        subject = localizeString(context, subject);

        if (notNull(requestor).length() != 0) {
            sendEmail(context, text, this.prefix + subject, requestor);
        }

        if (notNull(deptContact).length() != 0) {
            sendEmail(context, text, this.prefix + subject, deptContact);
        }

        if (notNull(projectManager).length() != 0) {
            sendEmail(context, text, this.prefix + subject, projectManager);
        }

    }

    /**
     * rejectProject
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void rejectProject(final EventHandlerContext context) {

        /*
         * RejectProject() Purpose: Updates the approval status for an individual approving manager
         * to Rejected. Passed parameters: {project_id} Logic: Exactly like RejectGroupMove except
         * remove the UpdateMoves SQL statement.
         */

        final String project_id = (String) context.getParameter("project_id");
        final String em_em_id = (String) context.getParameter("em_em_id");
        final String apprv_mgr1 = (String) context.getParameter("apprv_mgr1");
        final String apprv_mgr2 = (String) context.getParameter("apprv_mgr2");
        final String apprv_mgr3 = (String) context.getParameter("apprv_mgr3");

        // Set the status_field value based on which approving manager the current user is

        String status_field = "";

        if (em_em_id.equalsIgnoreCase(apprv_mgr1)) {
            status_field = "apprv_mgr1_status";
        } else if (em_em_id.equalsIgnoreCase(apprv_mgr2)) {
            status_field = "apprv_mgr2_status";
        } else if (em_em_id.equalsIgnoreCase(apprv_mgr3)) {
            status_field = "apprv_mgr3_status";
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("rejectProject");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        final Vector sqlCommands = new Vector();
        final String updateProject =
                "UPDATE project SET " + status_field
                + " = 'R', status = 'Requested-Rejected' WHERE project.project_id = "
                + literal(context, project_id);
        sqlCommands.add(updateProject);
        executeDbSqlCommands(context, sqlCommands, THROW_EXCEPTION);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        // @translatable
        String text = "Project [{0}] has been rejected.";
        final Object[] args = new Object[] { project_id };
        text = prepareMessage(context, text, args);

        text = this.newLine + text;

        String link = "\n\n" + getWebCentralPath(context) + "/ab-examine-project-form.axvw";
        link += "?project.project_id=" + project_id;

        text = text + link;

        final String requestor = getEmailAddress(context, getRequestor(context, "", project_id));
        final String deptContact =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));

        // @translatable
        String subject = "Project rejected";
        subject = localizeString(context, subject);

        if (notNull(requestor).length() != 0) {
            sendEmail(context, text, this.prefix + subject, requestor);
        }

        if (notNull(deptContact).length() != 0) {
            sendEmail(context, text, this.prefix + subject, deptContact);
        }

    }

    /**
     * copyScenarioRecordsToProjectFunds rule
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     *
     */
    public void copyScenarioRecordsToProjectFunds(final EventHandlerContext context) {
        final String ProjScenarioId = (String) context.getParameter("ProjScenarioId");
        final String ProjectId = (String) context.getParameter("ProjectId");
        final String description = "Copied from scenario: " + ProjScenarioId;
        final String sql =
                "INSERT INTO projfunds (project_id, fund_id, fiscal_year, amount_cap, amount_exp, description) "
                        + " SELECT project_id, fund_id, fiscal_year, SUM( costs_est_cap ), SUM( costs_est_exp ), "
                        + literal(context, description)
                        + " FROM projscns WHERE proj_scenario_id = "
                        + literal(context, ProjScenarioId) + " AND project_id = "
                        + literal(context, ProjectId)
                        + " AND fund_id IS NOT NULL GROUP BY project_id, fund_id, fiscal_year";
        executeDbSql(context, sql, THROW_EXCEPTION);

    }

    /**
     * generateProgramBudget
     *
     * @param context Description of the Parameter
     * @param response Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void generateProgramBudget(final EventHandlerContext context) {
        /*
         * GenerateProgramBudget() Purpose: Generates program budget item records for a user
         * specified range of years for all programs associated with an optionally user specified
         * site and/or program_type. The result is a set of records that the user can easily edit
         * from a view analysis view (Edit Budget Details).Passed Parameters: Site, Program_Type,
         * From Year, To Year ) SQL Statement and Logic: Year = FromYear While Year <= ToYear
         *
         * A. Create records from programs:
         *
         * INSERT INTO prog_budget_items (budget_id,program_id,fiscal_year, amt_capital,
         * amt_expense) VALUES ( SELECT {budget_id}, program_id, {year}, 0.0, 0.0 ) FROM program
         * WHERE status = �Active� AND site_id IN { sites list � make literal } // Only if sites are
         * entered in console AND program_type IN {program types list} // Only if program types are
         * entered
         *
         * IF �Update Budget Items from Projects� is checked on THEN: B. Update program budget items
         * records from projects:
         *
         * UPDATE prog_budget_items SET source=�Projects�, amt_capital = ( SELECT
         * SUM(projfunds.amount_cap) FROM program, project, projfunds WHERE program.program_id =
         * prog_budget_items.program_id AND project.program_id = prog_budget_items.program_id AND
         * projfunds.project_id = project.project_id AND project.status IN (�Approved�,�Approved-In
         * Design�,�Issued-In Process�,�Issued-On Hold�) AND program.site_id IN { sites list } //
         * Only if entered in console AND project.site_id IN { sites list } // Only if entered in
         * console AND program_type = { program types list } // Only if entered , amt_expense =
         * {same subquery as afm_capital except SUM(projfunds.amount_exp)} WHERE source<> �Manual�
         * AND budget_id = {selected budget}
         *
         * Year=Year+1 WEnd
         */
        final String HANDLER = "CapitalProjectsHandler.generateProgramBudget";

        String sites_list = (String) context.getParameter("sites_list");
        String program_type_list = (String) context.getParameter("program_type_list");
        final String strFromYear = (String) context.getParameter("from_year");
        final String strToYear = (String) context.getParameter("to_year");
        final Integer from_year = new Integer(strFromYear);
        final Integer to_year = new Integer(strToYear);
        final String budget_id = (String) context.getParameter("budget_id");

        // final Integer UpdateBudgetItems = (Integer) context.getParameter("UpdateBudgetItems");
        // boolean intUpdateBudgetItems = (UpdateBudgetItems.intValue() == 1);
        final boolean updateBudgetItems =
                StringUtil.toBoolean(context.getParameter("updateBudgetItems"));

        boolean sites = false;
        if (notNull(sites_list).length() != 0) {
            sites = true;
        }

        boolean programTypes = false;
        if (notNull(program_type_list).length() != 0) {
            programTypes = true;
        }

        // Format and parse string lists
        sites_list = prepareStringList(sites_list, context);
        program_type_list = prepareStringList(program_type_list, context);

        String year_list = "";
        for (int year = from_year.intValue(); year <= to_year.intValue(); year++) {
            year_list += year;
            if (year < to_year.intValue()) {
                year_list += ",";
            }
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug(HANDLER + ": program_type_list=[" + program_type_list + "]");
            this.log.debug(HANDLER + ": sites_list=[" + sites_list + "]");
        }

        // delete existing budget rows that either a) do not match new budget specification, or b)
        // were not manually edited
        String sqlDelete =
                "DELETE FROM prog_budget_items WHERE budget_id=" + literal(context, budget_id)
                + " AND (fiscal_year NOT IN (" + year_list + ")";
        if (sites || programTypes) {
            sqlDelete += " OR program_id NOT IN (SELECT program_id FROM program WHERE status=1";
            if (sites) {
                sqlDelete += " AND site_id IN " + sites_list;
            }
            if (programTypes) {
                sqlDelete += " AND program_type IN " + program_type_list;
            }

            sqlDelete += ")";
        }
        sqlDelete += " OR source <> 'Manual')";
        // System.out.println(sqlDelete);
        executeDbSql(context, sqlDelete, THROW_EXCEPTION);

        for (int year = from_year.intValue(); year <= to_year.intValue(); year++) {

            // A. Create records from programs:
            String sqlInsert =
                    " INSERT INTO prog_budget_items (budget_id,program_id,fiscal_year,cost_budget_cap,cost_budget_exp)"
                            + " SELECT " + literal(context, budget_id) + ",program_id," + year
                            + ",0.0,0.0" + " FROM program WHERE status=1";
            if (sites) {
                sqlInsert += " AND site_id IN " + sites_list; // Only if sites are entered in
                // console
            }
            if (programTypes) {
                sqlInsert += " AND program_type IN " + program_type_list; // Only if program types
                // are entered
            }
            sqlInsert +=
                    " AND NOT EXISTS ("
                            + "SELECT program_id FROM prog_budget_items WHERE budget_id="
                            + literal(context, budget_id)
                            + " AND prog_budget_items.program_id=program.program_id AND fiscal_year="
                            + year + ")";

            if (this.log.isDebugEnabled()) {
                this.log.debug(HANDLER + ": SQL Statement=[" + sqlInsert + "]");
            }

            // System.out.println(sqlInsert);
            executeDbSql(context, sqlInsert, THROW_EXCEPTION);

        }

        // IF �Update Budget Items from Projects� is checked on THEN:
        // B. Update program budget items records from projects:
        if (updateBudgetItems) {
            String sqlUpdateTemplate =
                    " FROM program, project, projfunds"
                            + " WHERE program.program_id = prog_budget_items.program_id"
                            + " AND project.program_id = prog_budget_items.program_id"
                            + " AND projfunds.project_id = project.project_id"
                            + " AND project.status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold') "
                            + " AND projfunds.fiscal_year = prog_budget_items.fiscal_year ";

            if (sites) {
                sqlUpdateTemplate +=
                        " AND program.site_id IN " + sites_list + "  " + " AND project.site_id IN "
                                + sites_list + "  ";
            }
            if (programTypes) {
                sqlUpdateTemplate += " AND program_type IN " + program_type_list;
            }

            sqlUpdateTemplate =
                    sqlUpdateTemplate + " GROUP BY project.program_id, projfunds.fiscal_year), 0 ";

            String sqlUpdate = "";
            if (isOracle(context)) {
                sqlUpdate =
                        " UPDATE prog_budget_items SET source='Projects',"
                                + " cost_budget_cap = NVL( (SELECT SUM(projfunds.amount_cap)"
                                + sqlUpdateTemplate
                                + "),"
                                + " cost_budget_exp = NVL( (SELECT SUM(projfunds.amount_exp)"
                                + sqlUpdateTemplate
                                + ")"
                                + " WHERE ( source <> 'Manual' OR ( cost_budget_cap = 0 AND cost_budget_exp = 0 )) AND budget_id ="
                                + literal(context, budget_id);
            } else {
                sqlUpdate =
                        " UPDATE prog_budget_items SET source='Projects',"
                                + " cost_budget_cap = ISNULL( (SELECT SUM(projfunds.amount_cap)"
                                + sqlUpdateTemplate
                                + "),"
                                + " cost_budget_exp = ISNULL( (SELECT SUM(projfunds.amount_exp)"
                                + sqlUpdateTemplate
                                + ")"
                                + " WHERE ( source <> 'Manual' OR ( cost_budget_cap = 0 AND cost_budget_exp = 0 )) AND budget_id ="
                                + literal(context, budget_id);

            }

            if (this.log.isDebugEnabled()) {
                this.log.debug(HANDLER + ": SQL Statement=[" + sqlUpdate + "]");
            }

            executeDbSql(context, sqlUpdate, THROW_EXCEPTION);
        }
    }

}
