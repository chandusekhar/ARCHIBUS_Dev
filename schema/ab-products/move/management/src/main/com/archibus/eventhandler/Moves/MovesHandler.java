package com.archibus.eventhandler.Moves;

import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.jobmanager.*;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.*;

/**
 * This event handler implements business logic related to Move management. Copyright (c) 2005,
 * ARCHIBUS, Inc.
 *
 * @author Antoni Ansarov
 * @created May 1, 2005
 * @version 1.0 Update 10/4/06 CK Changed the following line in issueGroupMove as per KB 3013699
 *          Object[] args = new Object[] {project_id}; Also modified addBulkMoves to update the
 *          to_bl_id and to_fl_id fields as per KB 3013699 Update 3/13/07 CK Added the following
 *          missing line to addIndividualMoveNewHire for KB 3014885: throw exception; Updated
 *          addMoveProjectRecord so that it first checks if the Dept Contact is valid prior to
 *          proceeding with the SQL statement (KB 3014886) Added query to check if a project exists.
 *          KB 3015042 Update 7/1/07-11/30/07 CK Updated Workflow Rules for 17.1 Update 7/16/07 CK
 *          Added SQL Statements to update Equipment Move To Location for KB 3015787 and 3015757
 *          11/27/07 CK Updated addProjectMoveAsset to include from_bl_id as per KB 3015666 11/28/07
 *          CK Updated to address KB 3016589 8/30/08 CK Updated to address KB 3017219 - Added
 *          Validation for Activity Type 01/27/11 CK Updated closeGroupMove to make sure only Moves
 *          with status of Completed-Verified are updated
 */

public class MovesHandler extends EventHandlerBase {

    // enable db exceptions for testing
    final boolean throwException = false;

    final boolean testMail = false;

    // enable for JUnit tests of mail

    final String newLine = " \n\n ";

    // @translatable
    String prefix = "[ARCHIBUS - Move Management] ";

    // Error messages

    /**
     * Description of the Field
     */

    // @translatable
    protected final static String errorMsgGroupEmExist =
            "Group move [{0}] already includes a move for Employee [{1}]";

    /**
     * Description of the Field
     */

    // @translatable
    protected final static String errorMsgGroupItExist =
            "Group move [{0}] already includes a move for Item [{1}]";

    /**
     * Description of the Field
     */

    // @translatable
    protected final static String errorMsgGroupRmExist =
            "Group move [{0}] already includes a move for Room [{1}]";

    /**
     * Description of the Field
     */

    // @translatable
    protected final static String errorMsgAddBulkMoves =
            "The department and locations entered do not match any employees";

    /**
     * Description of the Field
     */

    // @translatable
    protected final static String errorMsgDeptContactInvalid =
            "The department contact [{0}] is invalid";

    /**
     * Description of the Field
     */

    // @translatable
    protected final static String errorMsgActivityTypeInvalid =
            "The activity type [{0}] is invalid";

    // @translatable
    protected final static String errorMsgScenarioExist =
            "Scenario [{0}] for Project [{1}] already exists";

    // @translatable
    protected final static String errorMsgMissingRequestor =
            "Requestor for Action Item [{0}] is invalid or is missing";

    // @translatable
    protected final static String errorMsgMissingBuilding =
            "Building for Action Item [{0}] is invalid or is missing";

    /**
     * removeQuotes
     *
     * @param field String value
     * @return String with leading and trailing quotes removed
     */

    private String removeQuotes(String field) {
        if (field == null) {
            return field;
        }

        field = field.trim();

        if (field.length() > 0 && field.charAt(0) == '\'') {
            field = field.substring(1);
        }
        if (field.length() > 0 && field.charAt(field.length() - 1) == '\'') {
            field = field.substring(0, field.length() - 1);
        }

        return field;
    }

    /**
     * getDepartmentContact from mo or project
     *
     * @param context Description of the Parameter
     * @param mo_id Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The departmentContact value
     */

    private String getDepartmentContact(final EventHandlerContext context, final String mo_id,
            final String project_id) {
        String contact = null;
        if (notNull(mo_id).length() == 0) {
            contact =
                    (String) selectDbValue(context, "project", "dept_contact", "project_id = "
                            + literal(context, project_id));
        } else {
            contact = (String) selectDbValue(context, "mo", "dept_contact", "mo_id = " + mo_id);
        }
        return contact;
    }

    /**
     * sendEmail
     *
     * @param context Description of the Parameter
     * @param recipient Description of the Parameter
     * @param subject Description of the Parameter
     * @param body Description of the Parameter
     */

    private void sendEmail(final EventHandlerContext context, final String body,
            final String subject, final String recipient) {

        context.addResponseParameter("notifyEmailAddress", recipient);
        context.addResponseParameter("notifySubject", subject);
        context.addResponseParameter("notifyBody", body);
        context.addResponseParameter("activityId", "AbMoveManagement");

        runWorkflowRule(context, "AbCommonResources-notify", true);

    }

    /**
     * sendEmailTest sends email for testing
     *
     * @param context Description of the Parameter
     * @param subject Description of the Parameter
     * @param body Description of the Parameter
     * @param wfrName Description of the Parameter
     */

    private void sendEmailTest(final EventHandlerContext context, final String body,
            final String subject, final String wfrName) {

        context.addResponseParameter("recipient", "WEBCENTRALTEST@archibus.com");
        context.addResponseParameter("subject", wfrName + " - " + subject);
        context.addResponseParameter("body", body);
        context.addResponseParameter("activityId", "AbMoveManagement");

        runWorkflowRule(context, "AbCommonResources-notify", true);

    }

    /**
     * moveExist from mo or project
     *
     * @param context Description of the Parameter
     * @param em_id Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The departmentContact value
     */

    private boolean moveExist(final EventHandlerContext context, final String em_id,
            final String project_id) {
        final Object found_move_id =
                selectDbValue(context, "mo", "mo_id", "project_id=" + literal(context, project_id)
                    + " AND em_id=" + literal(context, em_id));
        return (found_move_id != null);
    }

    /**
     * validDeptContact
     *
     * @param context Description of the Parameter
     * @param dept_contact Description of the Parameter
     * @return The departmentContact value
     */

    private boolean validDeptContact(final EventHandlerContext context, final String dept_contact) {
        final Object validContact =
                selectDbValue(context, "em", "em_id", "em_id=" + literal(context, dept_contact));
        return (validContact != null);
    }

    /**
     * validActivityType
     *
     * @param context Description of the Parameter
     * @param activity_type Description of the Parameter
     * @return The activity_type value
     */

    private boolean validActivityType(final EventHandlerContext context, final String activity_type) {
        final Object validType =
                selectDbValue(context, "activitytype", "activity_type",
                    "activity_type=" + literal(context, activity_type));
        return (validType != null);
    }

    /**
     * getRequestor from mo or project
     *
     * @param context Description of the Parameter
     * @param mo_id Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The requestor value
     */

    private String getRequestor(final EventHandlerContext context, final String mo_id,
            final String project_id) {
        String requestor = null;
        if (notNull(mo_id).length() == 0) {
            requestor =
                    (String) selectDbValue(context, "project", "requestor", "project_id = "
                            + literal(context, project_id));
        } else {
            requestor = (String) selectDbValue(context, "mo", "requestor", "mo_id = " + mo_id);
        }
        return requestor;
    }

    /**
     * getMoveCoordinator from mo
     *
     * @param context Description of the Parameter
     * @param mo_id Description of the Parameter
     * @return The requestor value
     */

    private String getMoveCoordinator(final EventHandlerContext context, final String mo_id) {
        return (String) selectDbValue(context, "mo", "mo_coord", "mo_id = " + mo_id);
    }

    /**
     * getProjectManager from mo or project
     *
     * @param context Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The requestor value
     */

    private String getProjectManager(final EventHandlerContext context, final String project_id) {
        return (String) selectDbValue(context, "project", "proj_mgr",
            "project_id = " + literal(context, project_id));
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////////////// JACKS METHODS
    // ////////////////////////////////////////////////////
    // ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Jacks class
     *
     * @author Antoni Ansarov
     * @created June 3, 2005
     */
    public class Jacks {
        String description = "";

        String from_jk_id_voice = "";

        String from_jk_id_data = "";
    }

    /**
     * setJacks
     *
     * @param context Description of the Parameter
     * @param em_id The new jacks value
     * @return Description of the Return Value
     */

    public Jacks setJacks(final EventHandlerContext context, final String em_id) {

        /*
         * We have two fields in the move table, one to hold the Data Jack and one to hold the Voice
         * Jack. In the jk (jack) table we have a field tc_service which can be set to 'Data' or
         * 'Voice'. In case the employee has two voice or data jacks we will place the first jack in
         * order to the appropriate field and any additional ones to the Description field. The
         * query to find the Voice jacks would be: (SELECT jk_id FROM jk where em_id = 'em_id' and
         * tc_service='Voice') You can save the first jack in the order to the from_jk_id_voice
         * field. Any additional ones can be appended to the Description field in a separate line:
         * Voice Jack 2: xxxx, Voice Jack 3: xxxx The query to find the Data jacks would be: (SELECT
         * jk_id FROM jk where em_id = 'em_id' and tc_service='Data') You can then save the first
         * data jack in order to from_jk_id_data field and any additional ones in the same line as
         * the other jacks like: Data Jack 2: xxxx, Data Jack 3: xxxx.
         */
        final Jacks jacks = new Jacks();

        int indexD = 1;
        int indexV = 1;
        boolean firstD = true;
        boolean firstV = true;

        final List records =
                selectDbRecords(context, "jk", new String[] { "jk_id", "tc_service" }, "em_id="
                        + literal(context, em_id));
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] values = (Object[]) it.next();

            final String jk_id = (String) values[0];
            final String telecom = (String) values[1];

            if (telecom.equals("D")) {
                if (firstD) {
                    jacks.from_jk_id_data = jk_id;
                    firstD = false;
                } else {
                    jacks.description = jacks.description + "\nData Jack " + ++indexD + ":" + jk_id;
                }
            } else if (telecom.equals("V")) {
                if (firstV) {
                    jacks.from_jk_id_voice = jk_id;
                    firstV = false;
                } else {
                    jacks.description =
                            jacks.description + "\nVoice Jack " + ++indexV + ":" + jk_id;
                }
            }
        }

        return jacks;
    }

    /**
     * setJacksForBulkMove.
     *
     * @param context The new jacksForBullMove value
     * @param project_id The new jacksForBullMove value
     * @param whereClause The new jacksForBullMove value
     */

    private void setJacksForBulkMove(final EventHandlerContext context, final String project_id,
            final String whereClause) {

        // SELECT em_id,mo_id from mo WHERE em_id IN (select em_id from mo where mo.project_id=xxx
        // and mo.mo_type='Employee'
        // AND em_id IN (SELECT em_id from em + strWhereClause))

        final String strWhereClause =
                "em_id IN (SELECT em_id FROM mo WHERE mo.project_id="
                        + literal(context, project_id) + " AND mo.mo_type='Employee'"
                        + "  AND em_id IN (SELECT em_id FROM em " + " WHERE " + whereClause + "))";

        final List records =
                selectDbRecords(context, "mo", new String[] { "em_id", "mo_id" }, strWhereClause);
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] values = (Object[]) it.next();

            final String em_id = (String) values[0];
            final Integer mo_id = (Integer) values[1];
            String description = "";

            final Jacks jacks = setJacks(context, em_id);
            if (jacks.description != "") {
                description = "\n\n" + jacks.description;
            }

            final String from_jk_id_data = jacks.from_jk_id_data;
            final String from_jk_id_voice = jacks.from_jk_id_voice;

            final String update =
                    "UPDATE mo SET description=" + literal(context, description)
                    + ",from_jk_id_data=" + literal(context, from_jk_id_data)
                    + ", from_jk_id_voice =" + literal(context, from_jk_id_voice)
                    + " WHERE project_id =" + literal(context, project_id) + " AND em_id="
                    + literal(context, em_id) + " AND mo_id=" + mo_id;

            executeDbSql(context, update, this.throwException);
        }
    }

    /**
     * Gets the currentDate attribute of the MovesHandler object
     *
     * @param context Description of the Parameter
     * @return The currentDate value
     */
    public String getCurrentDate(final EventHandlerContext context) {
        final java.sql.Date date = Utility.currentDate();
        final String current_date =
                formatSqlFieldValue(context, date, "java.sql.Date", "current_date");
        return current_date;
    }

    /**
     * Gets the currentTime attribute of the MovesHandler object
     *
     * @param context Description of the Parameter
     * @return The currentTime value
     */
    public String getCurrentTime(final EventHandlerContext context) {
        final java.sql.Time time = Utility.currentTime();
        final String current_time =
                formatSqlFieldValue(context, time, "java.sql.Time", "current_time");
        return current_time;
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////////////
    // //////////////////////// MOVE MANAGEMENT WORKFLOW RULES
    // ////////////////////////////////////////////
    // ////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * addIndividualMove
     *
     * @param record - data record
     * @param addEq - boolean
     * @param addTa - boolean
     * @throws ParseException
     */
    public void addIndividualMove(final DataRecord record, final boolean addEq, final boolean addTa)
            throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        String description = record.getString("mo.description");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String requestor = record.getString("mo.requestor");
        final String dept_contact = record.getString("mo.dept_contact");

        final String to_bl_id = record.getString("mo.to_bl_id");
        final String to_fl_id = record.getString("mo.to_fl_id");
        final String to_rm_id = record.getString("mo.to_rm_id");
        /*
         * get questionnaire default value
         */
        final String qId = "Move Order - " + mo_type;
        final String qDefValue = getDefaultQuestionnaireValues(qId);

        final String date_start_req =
                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("em_id=[" + em_id + "]");
        }

        // change work request status
        if (this.log.isDebugEnabled()) {
            this.log.debug("addIndividualMove");
        }

        final Jacks jacks = setJacks(context, em_id);
        if (jacks.description != "") {
            description = description + "\n\n" + jacks.description;
        }

        final String from_jk_id_data = jacks.from_jk_id_data;
        final String from_jk_id_voice = jacks.from_jk_id_voice;

        /*
         * *NEW* INSERT INTO mo
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,
         * from_bl_id,from_fl_id,from_rm_id,from_dv_id,from_dp_id,to_dv_id,to_dp_id,from_phone,
         * to_phone,from_fax,to_fax,from_mailstop,from_jk_id_data,from_jk_id_voice) SELECT %status%,
         * em.em_id, requestor.em_id, dept_contact.em_id, %date_created% , %mo_type% , %mo_class% ,
         * %description% , %date_start_req% , %to_bl_id% , %to_fl_id% , %to_rm_id% ,
         * requestor.phone, dept_contact.phone, dept_contact.dv_id, dept_contact.dp_id, em_id.bl_id,
         * em_id.fl_id, em_id.rm_id, em_id.dv_id, em_id.dp_id, em_id.dv_id, em_id.dp_id,
         * em_id.phone, em_id.phone, em_id.fax, em_id.fax, em_id.mailstop, %from_jk_id_data%,
         * %from_jk_id_voice% FROM em em_id, em requestor, em dept_contact WHERE em_id.em_id =
         * %em_id% AND requestor.em_id = %requestor% AND dept_contact.em_id = %dept_contact%
         */
        if (validDeptContact(context, dept_contact)) {

            String fromClause = null;

            if (isOracle(context)) {
                fromClause =
                        " FROM " + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, dept_contact) + ") dept_contact, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, em_id) + ") em, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, requestor) + ") requestor "
                                + "  WHERE requestor.join_id (+) = dept_contact.join_id "
                                + "  AND em.join_id (+) = dept_contact.join_id ";
            } else {
                fromClause =
                        " FROM em dept_contact "
                                + " LEFT OUTER JOIN em requestor ON requestor.em_id = "
                                + literal(context, requestor)
                                + " LEFT OUTER JOIN em ON em.em_id = " + literal(context, em_id)
                                + " WHERE dept_contact.em_id = " + literal(context, dept_contact);
            }

            // insert move request
            /*
             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
             */
            executeDbSql(
                context,
                "INSERT INTO mo (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description "
                        + ",date_start_req,date_to_perform,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,from_bl_id,"
                        + "from_fl_id,from_rm_id,from_dv_id,from_dp_id,to_dv_id,to_dp_id,from_phone,to_phone,from_fax,"
                        + "to_fax,from_mailstop,from_jk_id_data,from_jk_id_voice,mo_quest)"
                        + " SELECT "
                        + literal(context, status)
                        + ","
                        + literal(context, em_id)
                        + ","
                        + literal(context, requestor)
                        + ","
                        + literal(context, dept_contact)
                        + ","
                        + date_created
                        + ","
                        + literal(context, mo_type)
                        + " ,"
                        + literal(context, mo_class)
                        + ","
                        + literal(context, description)
                        + ","
                        + date_start_req
                        + ","
                        + date_start_req
                        + ","
                        + literal(context, to_bl_id)
                        + ","
                        + literal(context, to_fl_id)
                        + ","
                        + literal(context, to_rm_id)
                        + ","
                        + " requestor.phone,"
                        + "  dept_contact.phone,"
                        + "  dept_contact.dv_id,"
                        + "  dept_contact.dp_id,"
                        + "  em.bl_id, em.fl_id, em.rm_id,  em.dv_id,  em.dp_id,  em.dv_id,"
                        + " em.dp_id,  em.phone,  em.phone,  em.fax,  em.fax, em.mailstop,"
                        + literal(context, from_jk_id_data)
                        + ","
                        + literal(context, from_jk_id_voice)
                        + ","
                        + literal(context, qDefValue)
                        + fromClause, true);

            Double lastPrimaryKey = new Double(0.0);
            if (notNull(requestor).length() != 0) {
                lastPrimaryKey =
                        getLastPrimaryKeyValue(context, "mo", "mo_id",
                            "requestor = " + literal(context, requestor));

            } else {
                lastPrimaryKey =
                        getLastPrimaryKeyValue(context, "mo", "mo_id", "requestor IS NULL");
            }

            // add the equipments and tagged furniture, if asked to
            if (addEq || addTa) {
                addEquipmentsAndTaggedFurnitureToMove(context, addEq, addTa, lastPrimaryKey, em_id);
            }

            // make sure we commit for Oracle
            executeDbCommit(context);

            addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgDeptContactInvalid);
            exception.setTranslatable(true);

            final Object[] args = { dept_contact };
            exception.setArgs(args);
            throw exception;
        }
    }

    /**
     * Adds employee's / employee leaving' / new hire's / room's equipments and tagged furniture to
     * the move. For employee, employee leaving and room: blId, flId and rmId are taken from the
     * move. For new hire: blId, flId and rmId are those are taken from the equipment/tagged
     * furniture.
     *
     * @param context
     * @param addEq Add equipments ? true/false
     * @param addTa Add tagged furniture ? true/false
     * @param lastPrimaryKeyValue ID of the movement
     * @param em_id employee ID; if null, the assets (equipments and tagged furniture) of the room
     *            will be added instead of those of the employee
     */
    protected void addEquipmentsAndTaggedFurnitureToMove(final EventHandlerContext context,
            final boolean addEq, final boolean addTa, final Double lastPrimaryKeyValue,
            final String em_id) {

        if (lastPrimaryKeyValue.intValue() <= 0) {
            return;
        }

        if (addEq) {
            String fromClause =
                    " FROM eq " + " LEFT OUTER JOIN mo ON mo.mo_id = "
                            + lastPrimaryKeyValue.intValue()
                            + " LEFT OUTER JOIN eqstd ON eqstd.eq_std = eq.eq_std";
            if (em_id != null) {
                fromClause += " WHERE eq.em_id = " + literal(context, em_id);
            } else {
                fromClause +=
                        " WHERE eq.bl_id = mo.from_bl_id AND eq.fl_id = mo.from_fl_id AND eq.rm_id = mo.from_rm_id";
            }

            final String blFlRmFields =
                    " (CASE WHEN eq.bl_id IS NULL THEN mo.from_bl_id ELSE eq.bl_id END)"
                            + ", (CASE WHEN eq.bl_id IS NULL THEN mo.from_fl_id ELSE eq.fl_id END)"
                            + ", (CASE WHEN eq.bl_id IS NULL THEN mo.from_rm_id ELSE eq.rm_id END)";

            // insert equipments
            executeDbSql(
                context,
                "INSERT INTO mo_eq (eq_id,eq_std,mo_id,from_bl_id,from_fl_id,from_rm_id,cost_moving)"
                        + " SELECT eq_id,eq.eq_std,"
                        + literal(context, String.valueOf(lastPrimaryKeyValue.intValue())) + ","
                        + blFlRmFields + "," + formatSqlIsNull(context, "eqstd.cost_moving,0")
                        + fromClause, true);

            // make sure we commit for Oracle
            executeDbCommit(context);
        }

        if (addTa) {
            String fromClause =
                    " FROM ta " + " LEFT OUTER JOIN mo ON mo.mo_id = "
                            + lastPrimaryKeyValue.intValue()
                            + " LEFT OUTER JOIN fnstd ON fnstd.fn_std = ta.fn_std";
            if (em_id != null) {
                fromClause += " WHERE ta.em_id = " + literal(context, em_id);
            } else {
                fromClause +=
                        " WHERE ta.bl_id = mo.from_bl_id AND ta.fl_id = mo.from_fl_id AND ta.rm_id = mo.from_rm_id";
            }

            final String blFlRmFields =
                    " (CASE WHEN ta.bl_id IS NULL THEN mo.from_bl_id ELSE ta.bl_id END)"
                            + ", (CASE WHEN ta.bl_id IS NULL THEN mo.from_fl_id ELSE ta.fl_id END)"
                            + ", (CASE WHEN ta.bl_id IS NULL THEN mo.from_rm_id ELSE ta.rm_id END)";

            // insert tagged furniture
            executeDbSql(
                context,
                "INSERT INTO mo_ta (ta_id,fn_std,mo_id,from_bl_id,from_fl_id,from_rm_id,cost_moving)"
                        + " SELECT ta_id, ta.fn_std" + ","
                        + literal(context, String.valueOf(lastPrimaryKeyValue.intValue())) + ","
                        + blFlRmFields + ", " + formatSqlIsNull(context, "fnstd.cost_moving,0")
                        + fromClause, true);

            // make sure we commit for Oracle
            executeDbCommit(context);
        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     *
     */

    public void addIndividualMoveNewHire(final DataRecord record, final boolean addEq,
            final boolean addTa) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        final String dept_contact = record.getString("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String description = record.getString("mo.description");
        final String to_bl_id = record.getString("mo.to_bl_id");
        final String to_fl_id = record.getString("mo.to_fl_id");
        final String to_rm_id = record.getString("mo.to_rm_id");

        final String date_start_req =
                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("em_id=[" + em_id + "]");
        }

        // change work request status
        if (this.log.isDebugEnabled()) {
            this.log.debug("addIndividualMoveNewHire");
        }

        /*
         * get questionnaire default value
         */
        final String qId = "Move Order - " + mo_type;
        final String qDefValue = getDefaultQuestionnaireValues(qId);

        /*
         * INSERT INTO mo
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id) VALUES
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req,to_bl_id,to_fl_id,to_rm_id, (select phone from em where em_id=requestor),
         * (select phone from em where em_id=dept_contact), (select dv_id from em where
         * em_id=dept_contact), (select dp_id from em where em_id=dept_contact) )
         */
        /*
         * *NEW* INSERT INTO mo
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id) SELECT
         * %status% , %em_id% , requestor.em_id, dept_contact.em_id, %date_created% , %mo_type% ,
         * %mo_class% , %description% , %date_start_req% , %to_bl_id% , %to_fl_id% , %to_rm_id% ,
         * requestor.phone, dept_contact.phone, dept_contact.dv_id, dept_contact.dp_id FROM em
         * requestor, em dept_contact WHERE requestor.em_id = %requestor% AND dept_contact.em_id =
         * %dept_contact%
         */
        if (validDeptContact(context, dept_contact)) {
            String fromClause = null;

            if (isOracle(context)) {
                fromClause =
                        " FROM " + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, dept_contact) + ") dept_contact, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, em_id) + ") em, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, requestor) + ") requestor "
                                + "  WHERE requestor.join_id (+) = dept_contact.join_id "
                                + "  AND em.join_id (+) = dept_contact.join_id ";
            } else {
                fromClause =
                        " FROM em dept_contact "
                                + " LEFT OUTER JOIN em requestor ON requestor.em_id = "
                                + literal(context, requestor) + " WHERE dept_contact.em_id = "
                                + literal(context, dept_contact);
            }

            // insert Group move request
            /*
             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
             */
            executeDbSql(
                context,
                "INSERT INTO mo (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,date_start_req,date_to_perform,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,mo_quest)"
                        + "  SELECT "
                        + literal(context, status)
                        + ","
                        + literal(context, em_id)
                        + ","
                        + literal(context, requestor)
                        + ","
                        + literal(context, dept_contact)
                        + ","
                        + date_created
                        + ","
                        + literal(context, mo_type)
                        + ","
                        + literal(context, mo_class)
                        + ","
                        + literal(context, description)
                        + ","
                        + date_start_req
                        + ","
                        + date_start_req
                        + ","
                        + literal(context, to_bl_id)
                        + ","
                        + literal(context, to_fl_id)
                        + ","
                        + literal(context, to_rm_id)
                        + ","
                        + " requestor.phone, dept_contact.phone, dept_contact.dv_id, dept_contact.dp_id, "
                        + literal(context, qDefValue) + fromClause, true);

            Double lastPrimaryKey = new Double(0.0);
            if (notNull(requestor).length() != 0) {
                lastPrimaryKey =
                        getLastPrimaryKeyValue(context, "mo", "mo_id",
                            "requestor = " + literal(context, requestor));

            } else {
                lastPrimaryKey =
                        getLastPrimaryKeyValue(context, "mo", "mo_id", "requestor IS NULL");
            }

            // add the equipments and tagged furniture, if asked to
            if (addEq || addTa) {
                addEquipmentsAndTaggedFurnitureToMove(context, addEq, addTa, lastPrimaryKey, em_id);
            }

            // make sure we commit for Oracle
            executeDbCommit(context);

            addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgDeptContactInvalid);
            exception.setTranslatable(true);
            final Object[] args = { dept_contact };
            exception.setArgs(args);
            throw exception;
        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     *
     */

    public void addIndividualMoveEmployeeLeaving(final DataRecord record, final boolean addEq,
            final boolean addTa) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        final String dept_contact = record.getString("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        String description = record.getString("mo.description");

        final String date_start_req =
                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("em_id=[" + em_id + "]");
        }

        // change work request status
        if (this.log.isDebugEnabled()) {
            this.log.debug("addIndividualMoveEmployeeLeaving");
        }
        /*
         * get questionnaire default value
         */
        final String qId = "Move Order - " + mo_type;
        final String qDefValue = getDefaultQuestionnaireValues(qId);

        /*
         * INSERT INTO mo (status,em_id,requestor,dept_contact,date_created,mo_type,
         * mo_class,description,date_start_req,phone,phone_dept_contact,dv_id,dp_id,
         * from_bl_id,from_fl_id,from_rm_id,from_dv_id,from_dp_id,from_phone,from_fax,from_mailstop)
         * VALUES
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,date_start_req
         * , (select phone from em where em_id=requestor), (select phone from em where
         * em_id=dept_contact), (select dv_id from em where em_id=dept_contact), (select dp_id from
         * em where em_id=dept_contact), (select bl_id from em where em_id = em_id), (select fl_id
         * from em where em_id=em_id), (select rm_id from em where em_id=em_id), (select dv_id from
         * em where em_id=em), (select dp_id from em where em_id=em), (select phone from em where
         * em_id=em_id), (select fax_id from em where em_id=em_id), (select mailstop from em where
         * em_id=em_id))
         */

        final Jacks jacks = setJacks(context, em_id);
        if (jacks.description != "") {
            description = description + "\n\n" + jacks.description;
        }

        final String from_jk_id_data = jacks.from_jk_id_data;
        final String from_jk_id_voice = jacks.from_jk_id_voice;

        /*
         * *NEW*
         *
         * INSERT INTO mo (status, em_id, requestor, dept_contact, date_created, mo_type, mo_class,
         * description, date_start_req, phone, phone_dept_contact, dv_id, dp_id, from_bl_id,
         * from_fl_id, from_rm_id, from_dv_id, from_dp_id, from_phone, from_fax, from_mailstop,
         * from_jk_id_data, from_jk_id_voice) SELECT %status% , em.em_id, requestor.em_id,
         * dept_contact.em_id, %date_created% , %mo_type%, %mo_class% , %description% ,
         * %date_start_req% , requestor.phone, dept_contact.phone, dept_contact.dv_id,
         * dept_contact.dp_id, em_id.bl_id, em_id.fl_id, em_id.rm_id, em.dv_id, em.dp_id,
         * em_id.phone, em_id.fax, em_id.mailstop, %from_jk_id_data%, %from_jk_id_voice% FROM em, em
         * requestor, em dept_contact WHERE em.em_id = %em_id% AND requestor.em_id = %requestor% AND
         * dept_contact.em_id = %dept_contact%
         */
        if (validDeptContact(context, dept_contact)) {
            String fromClause = null;

            if (isOracle(context)) {
                fromClause =
                        " FROM " + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, dept_contact) + ") dept_contact, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, em_id) + ") em, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, requestor) + ") requestor "
                                + "  WHERE requestor.join_id (+) = dept_contact.join_id "
                                + "  AND em.join_id (+) = dept_contact.join_id ";
            } else {
                fromClause =
                        " FROM em dept_contact "
                                + " LEFT OUTER JOIN em requestor ON requestor.em_id = "
                                + literal(context, requestor)
                                + " LEFT OUTER JOIN em ON em.em_id = " + literal(context, em_id)
                                + " WHERE dept_contact.em_id = " + literal(context, dept_contact);
            }

            // insert Group move request
            /*
             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
             */
            executeDbSql(
                context,
                "INSERT INTO mo (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,"
                        + "date_start_req,date_to_perform,phone,phone_dept_contact,dv_id,dp_id,from_bl_id,from_fl_id,from_rm_id,from_dv_id,"
                        + "from_dp_id,from_phone,from_fax,from_mailstop,from_jk_id_data,from_jk_id_voice,mo_quest)"
                        + "  SELECT "
                        + literal(context, status)
                        + ","
                        + literal(context, em_id)
                        + ","
                        + literal(context, requestor)
                        + ","
                        + literal(context, dept_contact)
                        + ","
                        + date_created
                        + ","
                        + literal(context, mo_type)
                        + ","
                        + literal(context, mo_class)
                        + ","
                        + literal(context, description)
                        + ","
                        + date_start_req
                        + ","
                        + date_start_req
                        + ","
                        + "  requestor.phone, "
                        + " dept_contact.phone, "
                        + "  dept_contact.dv_id, "
                        + "  dept_contact.dp_id, "
                        + "  em.bl_id, "
                        + " em.fl_id, "
                        + " em.rm_id, "
                        + " em.dv_id, "
                        + " em.dp_id, "
                        + " em.phone, "
                        + " em.fax, "
                        + " em.mailstop,"
                        + literal(context, from_jk_id_data)
                        + ","
                        + literal(context, from_jk_id_voice)
                        + ","
                        + literal(context, qDefValue)
                        + fromClause, true);

            Double lastPrimaryKey = new Double(0.0);
            if (notNull(requestor).length() != 0) {
                lastPrimaryKey =
                        getLastPrimaryKeyValue(context, "mo", "mo_id",
                            "requestor = " + literal(context, requestor));

            } else {
                lastPrimaryKey =
                        getLastPrimaryKeyValue(context, "mo", "mo_id", "requestor IS NULL");
            }

            // add the equipments and tagged furniture, if asked to
            if (addEq || addTa) {
                addEquipmentsAndTaggedFurnitureToMove(context, addEq, addTa, lastPrimaryKey, em_id);
            }

            // make sure we commit for Oracle
            executeDbCommit(context);

            addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgDeptContactInvalid);
            exception.setTranslatable(true);
            final Object[] args = { dept_contact };
            exception.setArgs(args);
            throw exception;
        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */

    public void addIndividualMoveAsset(final DataRecord record, final boolean addEq,
            final boolean addTa) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        final String dept_contact = record.getString("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String description = record.getString("mo.description");
        final String to_bl_id = record.getString("mo.to_bl_id");
        final String to_fl_id = record.getString("mo.to_fl_id");
        final String to_rm_id = record.getString("mo.to_rm_id");

        final String date_start_req =
                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("em_id=[" + em_id + "]");
        }

        // change work request status
        if (this.log.isDebugEnabled()) {
            this.log.debug("addIndividualMoveAsset");
        }
        /*
         * get questionnaire default value
         */
        final String qId = "Move Order - " + mo_type;
        final String qDefValue = getDefaultQuestionnaireValues(qId);

        /*
         * INSERT INTO mo
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description
         * ,date_start_req, to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id) VALUES
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req,to_bl_id,to_fl_id,to_rm_id, (select phone from em where em_id=requestor),
         * (select phone from em where em_id=dept_contact), (select dv_id from em where
         * em_id=dept_contact), (select dp_id from em where em_id=dept_contact))
         */
        // insert Group move request
        /*
         * *NEW*
         *
         * INSERT INTO mo (status, em_id, requestor, dept_contact, date_created, mo_type, mo_class,
         * description, date_start_req, to_bl_id, to_fl_id, to_rm_id, phone, phone_dept_contact,
         * dv_id, dp_id) SELECT %status%, %em_id%, requestor.em_id, dept_contact.em_id,
         * %date_created%, %mo_type% , %mo_class% , %description% , %date_start_req% , %to_bl_id% ,
         * %to_fl_id% , %to_rm_id%, requestor.phone, dept_contact.phone, dept_contact.dv_id,
         * dept_contact.dp_id FROM em requestor, em dept_contact WHERE requestor.em_id = %requestor%
         * AND dept_contact.em_id = %dept_contact%
         */
        if (validDeptContact(context, dept_contact)) {
            String fromClause = null;

            if (isOracle(context)) {
                fromClause =
                        " FROM " + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, dept_contact) + ") dept_contact, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, em_id) + ") em, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, requestor) + ") requestor "
                                + "  WHERE requestor.join_id (+) = dept_contact.join_id "
                                + "  AND em.join_id (+) = dept_contact.join_id ";
            } else {
                fromClause =
                        " FROM em dept_contact "
                                + " LEFT OUTER JOIN em requestor ON requestor.em_id = "
                                + literal(context, requestor) + " WHERE dept_contact.em_id = "
                                + literal(context, dept_contact);
            }

            /*
             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
             */
            executeDbSql(
                context,
                "INSERT INTO mo (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,date_start_req,date_to_perform,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,mo_quest)"
                        + "  SELECT "
                        + literal(context, status)
                        + ","
                        + literal(context, em_id)
                        + ","
                        + literal(context, requestor)
                        + ","
                        + literal(context, dept_contact)
                        + ","
                        + date_created
                        + ","
                        + literal(context, mo_type)
                        + ","
                        + literal(context, mo_class)
                        + ","
                        + literal(context, description)
                        + ","
                        + date_start_req
                        + ","
                        + date_start_req
                        + ","
                        + literal(context, to_bl_id)
                        + ","
                        + literal(context, to_fl_id)
                        + ","
                        + literal(context, to_rm_id)
                        + " ,requestor.phone, "
                        + " dept_contact.phone, "
                        + " dept_contact.dv_id,"
                        + " dept_contact.dp_id," + literal(context, qDefValue) + fromClause, true);

            // make sure we commit for Oracle
            executeDbCommit(context);

            if (notNull(requestor).length() != 0) {
                addLastPrimaryKeyValueToResponse(context, "mo", "mo_id",
                    "requestor = " + literal(context, requestor));
            } else {
                addLastPrimaryKeyValueToResponse(context, "mo", "mo_id", "requestor IS NULL");
            }

        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgDeptContactInvalid);
            exception.setTranslatable(true);
            final Object[] args = { dept_contact };
            exception.setArgs(args);
            throw exception;
        }

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */

    public void addIndividualMoveEquipment(final DataRecord record, final boolean addEq,
            final boolean addTa) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        final String dept_contact = record.getString("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String description = record.getString("mo.description");
        final String to_bl_id = record.getString("mo.to_bl_id");
        final String to_fl_id = record.getString("mo.to_fl_id");
        final String to_rm_id = record.getString("mo.to_rm_id");

        final String date_start_req =
                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("em_id=[" + em_id + "]");
        }

        // change work request status
        if (this.log.isDebugEnabled()) {
            this.log.debug("addIndividualMoveEquipment");
        }
        /*
         * get questionnaire default value
         */
        final String qId = "Move Order - " + mo_type;
        final String qDefValue = getDefaultQuestionnaireValues(qId);

        /*
         * INSERT INTO mo
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req
         * ,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,from_bl_id,
         * from_fl_id,from_rm_id,from_dv_id,from_dp_id,to_dv_id,to_dp_id) VALUES
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req,to_bl_id,to_fl_id,to_rm_id, (select phone from em where em_id=requestor),
         * (select phone from em where em_id=dept_contact), (select dv_id from em where
         * em_id=dept_contact), (select dp_id from em where em_id=dept_contact), (select bl_id from
         * eq where eq_id = em_id), (select fl_id from eq where eq_id=em_id), (select rm_id from eq
         * where eq_id=em_id), (select dv_id from eq where eq_id=em), (select dp_id from eq where
         * eq_id=em), from_dv_id,from_dp_id) )
         */
        /*
         * *NEW*
         *
         * INSERT INTO mo
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req
         * ,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,from_bl_id,
         * from_fl_id,from_rm_id,from_dv_id,from_dp_id,to_dv_id,to_dp_id) SELECT %status% ,
         * em.em_id, requestor.em_id, dept_contact.em_id, %date_created% , %mo_type% , %mo_class% ,
         * %description% , %date_start_req% , %to_bl_id% , %to_fl_id% , %to_rm_id% ,
         * requestor.phone, dept_contact.phone, dept_contact.dv_id, dept_contact.dp_id, " em.bl_id,
         * em.fl_id, em.rm_id, em.dv_id, em.dp_id, em.dv_id," + " em.dp_id, em.phone, em.phone,
         * em.fax, em.fax, em.mailstop," + FROM em, em requestor, em dept_contact, em em_id WHERE
         * em.em_id = %em_id% AND requestor.em_id = %requestor% AND dept_contact.em_id =
         * %dept_contact%
         */
        if (validDeptContact(context, dept_contact)) {
            String fromClause = null;

            if (isOracle(context)) {
                fromClause =
                        " FROM " + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, dept_contact) + ") dept_contact, "
                                + " (SELECT eq.*, 'X' join_id FROM eq WHERE eq_id = "
                                + literal(context, em_id) + ") eq, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, requestor) + ") requestor "
                                + "  WHERE requestor.join_id (+) = dept_contact.join_id "
                                + "  AND eq.join_id (+) = dept_contact.join_id ";
            } else {
                fromClause =
                        " FROM em dept_contact "
                                + " LEFT OUTER JOIN em requestor ON requestor.em_id = "
                                + literal(context, requestor)
                                + " LEFT OUTER JOIN eq ON eq.eq_id = " + literal(context, em_id)
                                + " WHERE dept_contact.em_id = " + literal(context, dept_contact);
            }

            // insert Group move request
            /*
             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
             */
            executeDbSql(
                context,
                "INSERT INTO mo (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,"
                        + "date_start_req,date_to_perform,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,from_bl_id,"
                        + "from_fl_id,from_rm_id,from_dv_id,from_dp_id,to_dv_id,to_dp_id,mo_quest)"
                        + " SELECT"
                        + literal(context, status)
                        + ","
                        + literal(context, em_id)
                        + ","
                        + literal(context, requestor)
                        + ","
                        + literal(context, dept_contact)
                        + ","
                        + date_created
                        + ","
                        + literal(context, mo_type)
                        + ","
                        + literal(context, mo_class)
                        + ","
                        + literal(context, description)
                        + ","
                        + date_start_req
                        + ","
                        + date_start_req
                        + ","
                        + literal(context, to_bl_id)
                        + ","
                        + literal(context, to_fl_id)
                        + ","
                        + literal(context, to_rm_id)
                        + ","
                        + "  requestor.phone, "
                        + "  dept_contact.phone,"
                        + "  dept_contact.dv_id,"
                        + "  dept_contact.dp_id,"
                        + "  eq.bl_id,"
                        + "  eq.fl_id,"
                        + "  eq.rm_id,"
                        + "  eq.dv_id,"
                        + "  eq.dp_id,"
                        + "  eq.dv_id,"
                        + "  eq.dp_id,"
                        + literal(context, qDefValue) + fromClause, true);

            // make sure we commit for Oracle
            executeDbCommit(context);

            if (notNull(requestor).length() != 0) {
                addLastPrimaryKeyValueToResponse(context, "mo", "mo_id",
                    "requestor = " + literal(context, requestor));
            } else {
                addLastPrimaryKeyValueToResponse(context, "mo", "mo_id", "requestor IS NULL");
            }

        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgDeptContactInvalid);
            exception.setTranslatable(true);
            final Object[] args = { dept_contact };
            exception.setArgs(args);
            throw exception;
        }

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */

    public void addIndividualMoveRoom(final DataRecord record, final boolean addEq,
            final boolean addTa) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        final String dept_contact = record.getString("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String description = record.getString("mo.description");
        final String to_bl_id = record.getString("mo.to_bl_id");
        final String to_fl_id = record.getString("mo.to_fl_id");
        final String to_rm_id = record.getString("mo.to_rm_id");

        final String from_bl_id = record.getString("mo.from_bl_id");
        final String from_fl_id = record.getString("mo.from_fl_id");
        final String from_rm_id = record.getString("mo.from_rm_id");

        final String date_start_req =
                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("em_id=[" + em_id + "]");
        }

        // change work request status
        if (this.log.isDebugEnabled()) {
            this.log.debug("addIndividualMoveRoom");
        }
        /*
         * get questionnaire default value
         */
        final String qId = "Move Order - " + mo_type;
        final String qDefValue = getDefaultQuestionnaireValues(qId);

        /*
         * INSERT INTO mo
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,
         * from_bl_id,from_fl_id,from_rm_id) VALUES
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req,to_bl_id,to_fl_id,to_rm_id, (select phone from em where em_id=requestor),
         * (select phone from em where em_id=dept_contact), (select dv_id from em where
         * em_id=dept_contact), (select dp_id from em where em_id=dept_contact),
         * from_bl_id,from_fl_id,from_rm_id )
         */
        /*
         * *NEW*
         *
         * INSERT INTO mo
         * (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,
         * date_start_req
         * ,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,from_bl_id,
         * from_fl_id,from_rm_id) SELECT %status% , %em_id%, requestor.em_id, dept_contact.em_id,
         * %date_created% , %mo_type% , %mo_class% , %description% , %date_start_req% , %to_bl_id% ,
         * %to_fl_id% , %to_rm_id% , requestor.phone, dept_contact.phone, dept_contact.dv_id,
         * dept_contact.dp_id, %from_bl_id% , %from_fl_id% , %from_rm_id% FROM em requestor, em
         * dept_contact WHERE requestor.em_id = %requestor% AND dept_contact.em_id = %dept_contact%
         */
        if (validDeptContact(context, dept_contact)) {

            String fromClause = null;

            if (isOracle(context)) {
                fromClause =
                        " FROM " + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, dept_contact) + ") dept_contact, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, em_id) + ") em, "
                                + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                + literal(context, requestor) + ") requestor "
                                + "  WHERE requestor.join_id (+) = dept_contact.join_id "
                                + "  AND em.join_id (+) = dept_contact.join_id ";
            } else {
                fromClause =
                        " FROM em dept_contact "
                                + " LEFT OUTER JOIN em requestor ON requestor.em_id = "
                                + literal(context, requestor) + " WHERE dept_contact.em_id = "
                                + literal(context, dept_contact);
            }

            // insert Group move request
            /*
             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
             */
            executeDbSql(
                context,
                "INSERT INTO mo (status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description"
                        + ",date_start_req,date_to_perform,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,from_bl_id,from_fl_id,from_rm_id,mo_quest)"
                        + " SELECT "
                        + literal(context, status)
                        + ","
                        + literal(context, em_id)
                        + ","
                        + literal(context, requestor)
                        + ","
                        + literal(context, dept_contact)
                        + ","
                        + date_created
                        + ","
                        + literal(context, mo_type)
                        + ","
                        + literal(context, mo_class)
                        + ","
                        + literal(context, description)
                        + ","
                        + date_start_req
                        + ","
                        + date_start_req
                        + ","
                        + literal(context, to_bl_id)
                        + ","
                        + literal(context, to_fl_id)
                        + ","
                        + literal(context, to_rm_id)
                        + ","
                        + " requestor.phone,"
                        + " dept_contact.phone,"
                        + " dept_contact.dv_id,"
                        + " dept_contact.dp_id,"
                        + literal(context, from_bl_id)
                        + ","
                        + literal(context, from_fl_id)
                        + ","
                        + literal(context, from_rm_id)
                        + ","
                        + literal(context, qDefValue) + fromClause, true);

            Double lastPrimaryKey = new Double(0.0);
            if (notNull(requestor).length() != 0) {
                lastPrimaryKey =
                        getLastPrimaryKeyValue(context, "mo", "mo_id",
                            "requestor = " + literal(context, requestor));

            } else {
                lastPrimaryKey =
                        getLastPrimaryKeyValue(context, "mo", "mo_id", "requestor IS NULL");
            }

            // add the equipments and tagged furniture, if asked to
            if (addEq || addTa) {
                addEquipmentsAndTaggedFurnitureToMove(context, addEq, addTa, lastPrimaryKey, null);
            }

            // make sure we commit for Oracle
            executeDbCommit(context);

            addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgDeptContactInvalid);
            exception.setTranslatable(true);
            final Object[] args = { dept_contact };
            exception.setArgs(args);
            throw exception;
        }

    }

    // ///////////////////////////////////////////////////////////////////////////////////////
    // /////////// GROUP MOVES ////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addProjectMove(final DataRecord record) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = record.getString("mo.project_id");
        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");

        String description =
                record.findField("mo.description") != null ? record.getString("mo.description")
                        : "";
                final String mo_type = record.getString("mo.mo_type");
                final String mo_class = record.getString("mo.mo_class");
                final String requestor = record.getString("mo.requestor");
                final String from_bl_id =
                        record.findField("mo.from_bl_id") != null ? record.getString("mo.from_bl_id") : "";
                        final String from_fl_id =
                                record.findField("mo.from_fl_id") != null ? record.getString("mo.from_fl_id") : "";
                                final String from_rm_id =
                                        record.findField("mo.from_rm_id") != null ? record.getString("mo.from_rm_id") : "";
                                        final String to_bl_id =
                                                record.findField("mo.to_bl_id") != null ? record.getString("mo.to_bl_id") : "";
                                                final String to_fl_id =
                                                        record.findField("mo.to_fl_id") != null ? record.getString("mo.to_fl_id") : "";
                                                        final String to_rm_id =
                                                                record.findField("mo.to_rm_id") != null ? record.getString("mo.to_rm_id") : "";

                                                                final String date_start_req =
                                                                        SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
                                                                final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

                                                                if (this.log.isDebugEnabled()) {
                                                                    this.log.debug("project_id=[" + project_id + "]");
                                                                }

                                                                // change work request status
                                                                if (this.log.isDebugEnabled()) {
                                                                    this.log.debug("addProjectMove");
                                                                }

                                                                final Jacks jacks = setJacks(context, em_id);
                                                                if (jacks.description != "") {
                                                                    description = description + "\n\n" + jacks.description;
                                                                }

                                                                final String from_jk_id_data = jacks.from_jk_id_data;
                                                                final String from_jk_id_voice = jacks.from_jk_id_voice;
                                                                /*
                                                                 * get questionnaire default value
                                                                 */
                                                                final String qId = "Move Order - " + mo_type;
                                                                final String qDefValue = getDefaultQuestionnaireValues(qId);

                                                                /*
                                                                 * *NEW*
                                                                 *
                                                                 * INSERT INTO mo
                                                                 * (project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class
                                                                 * ,description,date_start_req,to_bl_id,to_fl_id,to_rm_id,
                                                                 * phone,phone_dept_contact,dv_id,dp_id
                                                                 * ,ac_id,from_bl_id,from_fl_id,from_rm_id,from_dv_id,from_dp_id,
                                                                 * to_dv_id,to_dp_id,from_phone
                                                                 * ,to_phone,from_fax,to_fax,from_mailstop,from_jk_id_data,from_jk_id_voice) SELECT
                                                                 * project.project_id , %status% , %em_id% , %requestor% , project.dept_contact ,
                                                                 * %date_created% , %mo_type% , %mo_class% , %description% , %date_start_req% , %to_bl_id% ,
                                                                 * %to_fl_id% , %to_rm_id% , project.phone_req, project.phone_dept_contact, project.dv_id,
                                                                 * project.dp_id, project.ac_id, em.bl_id, em.fl_id, em.rm_id, em.dv_id, em.dp_id, em.dv_id,
                                                                 * em.dp_id, em.phone, em.phone, em.fax, em.fax, em.mailstop, %from_jk_id_data% ,
                                                                 * %from_jk_id_voice% FROM em, project WHERE em.em_id = %em_id%, project.project_id =
                                                                 * %project_id%
                                                                 */
                                                                String fromClause = null;

                                                                if (isOracle(context)) {
                                                                    fromClause =
                                                                            " FROM " + " (SELECT project.*, 'X' join_id FROM project WHERE project_id = "
                                                                                    + literal(context, project_id) + ") project,"
                                                                                    + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                                                                    + literal(context, em_id) + ") em"
                                                                                    + " WHERE project.join_id = em.join_id (+) ";

                                                                } else {

                                                                    fromClause =
                                                                            " FROM project LEFT OUTER JOIN em ON em.em_id = " + literal(context, em_id)
                                                                            + " WHERE project.project_id = " + literal(context, project_id);
                                                                }

                                                                if (!moveExist(context, em_id, project_id)) {
                                                                    // insert Group move request
                                                                    /*
                                                                     * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
                                                                     */
                                                                    executeDbSql(
                                                                        context,
                                                                        "INSERT INTO mo (project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,date_start_req,date_to_perform,to_bl_id,to_fl_id,to_rm_id,"
                                                                                + "phone,phone_dept_contact,dv_id,dp_id,ac_id,from_bl_id,from_fl_id,from_rm_id,from_dv_id,from_dp_id,"
                                                                                + "to_dv_id,to_dp_id,from_phone,to_phone,from_fax,to_fax,from_mailstop,from_jk_id_data,from_jk_id_voice,mo_quest)"
                                                                                + "  SELECT " + " project.project_id , "
                                                                                + literal(context, status)
                                                                                + ","
                                                                                + literal(context, em_id)
                                                                                + ","
                                                                                + literal(context, requestor)
                                                                                + ", project.dept_contact, "
                                                                                + date_created
                                                                                + ","
                                                                                + literal(context, mo_type)
                                                                                + ","
                                                                                + literal(context, mo_class)
                                                                                + ","
                                                                                + literal(context, description)
                                                                                + ","
                                                                                + date_start_req
                                                                                + ","
                                                                                + date_start_req
                                                                                + ","
                                                                                + literal(context, to_bl_id)
                                                                                + ","
                                                                                + literal(context, to_fl_id)
                                                                                + ","
                                                                                + literal(context, to_rm_id)
                                                                                + ","
                                                                                + " project.phone_req,"
                                                                                + " project.phone_dept_contact,"
                                                                                + " project.dv_id,"
                                                                                + " project.dp_id,"
                                                                                + " project.ac_id,"
                                                                                + literal(context, from_bl_id)
                                                                                + ","
                                                                                + literal(context, from_fl_id)
                                                                                + ","
                                                                                + literal(context, from_rm_id)
                                                                                + ","
                                                                                + " em.dv_id, em.dp_id,"
                                                                                + " em.dv_id, em.dp_id, em.phone, em.phone, em.fax, em.fax, em.mailstop,"
                                                                                + literal(context, from_jk_id_data)
                                                                                + ","
                                                                                + literal(context, from_jk_id_voice)
                                                                                + ","
                                                                                + literal(context, qDefValue)
                                                                                + fromClause, true);
                                                                    final Double lastPrimaryKey =
                                                                            getLastPrimaryKeyValue(context, "mo", "mo_id",
                                                                                "project_id = " + literal(context, project_id));

                                                                    addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
                                                                } else {
                                                                    // Group Move already includes item. Show error message
                                                                    final ExceptionBase exception = new ExceptionBase();
                                                                    exception.setPattern(errorMsgGroupEmExist);
                                                                    exception.setTranslatable(true);
                                                                    final Object[] args = { project_id, em_id };
                                                                    exception.setArgs(args);
                                                                    throw exception;
                                                                }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addProjectMoveNewHire(final DataRecord record) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = record.getString("mo.project_id");
        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        // final String dept_contact = (String) fields.get("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String description =
                record.findField("mo.description") != null ? record.getString("mo.description")
                        : "";
                final String to_bl_id =
                        record.findField("mo.to_bl_id") != null ? record.getString("mo.to_bl_id") : "";
                        final String to_fl_id =
                                record.findField("mo.to_fl_id") != null ? record.getString("mo.to_fl_id") : "";
                                final String to_rm_id =
                                        record.findField("mo.to_rm_id") != null ? record.getString("mo.to_rm_id") : "";

                                        final String date_start_req =
                                                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
                                        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

                                        if (this.log.isDebugEnabled()) {
                                            this.log.debug("project_id=[" + project_id + "]");
                                            this.log.debug("em_id=[" + em_id + "]");
                                        }

                                        // change work request status
                                        if (this.log.isDebugEnabled()) {
                                            this.log.debug("addProjectMoveNewHire");
                                        }
                                        /*
                                         * get questionnaire default value
                                         */
                                        final String qId = "Move Order - " + mo_type;
                                        final String qDefValue = getDefaultQuestionnaireValues(qId);

                                        /*
                                         * *NEW*
                                         *
                                         * INSERT INTO mo
                                         * (project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class
                                         * ,description, date_start_req,
                                         * to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,ac_id) SELECT
                                         * project.project_id, %status% , %em_id% , %requestor% , project.dept_contact ,
                                         * %date_created% , %mo_type% , %mo_class% , %description% , %date_start_req% , %to_bl_id% ,
                                         * %to_fl_id% , %to_rm_id% , project.phone_req, project.phone_dept_contact, project.dv_id,
                                         * project.dp_id, project.ac_id FROM project WHERE project.project_id = %project_id%
                                         */
                                        if (!moveExist(context, em_id, project_id)) {
                                            /*
                                             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
                                             */
                                            executeDbSql(
                                                context,
                                                "INSERT INTO mo (project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,date_start_req,date_to_perform, to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,ac_id,mo_quest)"
                                                        + "  SELECT " + " project.project_id, "
                                                        + literal(context, status)
                                                        + ","
                                                        + literal(context, em_id)
                                                        + ","
                                                        + literal(context, requestor)
                                                        + ",project.dept_contact,"
                                                        + date_created
                                                        + ","
                                                        + literal(context, mo_type)
                                                        + ","
                                                        + literal(context, mo_class)
                                                        + ","
                                                        + literal(context, description)
                                                        + ","
                                                        + date_start_req
                                                        + ","
                                                        + date_start_req
                                                        + ","
                                                        + literal(context, to_bl_id)
                                                        + ","
                                                        + literal(context, to_fl_id)
                                                        + ","
                                                        + literal(context, to_rm_id)
                                                        + ", project.phone_req, project.phone_dept_contact, project.dv_id, project.dp_id, project.ac_id, "
                                                        + literal(context, qDefValue)
                                                        + " FROM project "
                                                        + " WHERE project.project_id = " + literal(context, project_id), true);
                                            final Double lastPrimaryKey =
                                                    getLastPrimaryKeyValue(context, "mo", "mo_id",
                                                        "project_id = " + literal(context, project_id));

                                            addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
                                        } else {
                                            // Group Move already includes item. Show error message
                                            final ExceptionBase exception = new ExceptionBase();
                                            exception.setPattern(errorMsgGroupEmExist);
                                            exception.setTranslatable(true);
                                            final Object[] args = { project_id, em_id };
                                            exception.setArgs(args);
                                            throw exception;
                                        }

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addProjectMoveEmployeeLeaving(final DataRecord record) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = record.getString("mo.project_id");
        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        // final String dept_contact = (String) fields.get("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        String description =
                record.findField("mo.description") != null ? record.getString("mo.description")
                        : "";
                final String from_bl_id =
                        record.findField("mo.from_bl_id") != null ? record.getString("mo.from_bl_id") : "";
                        final String from_fl_id =
                                record.findField("mo.from_fl_id") != null ? record.getString("mo.from_fl_id") : "";
                                final String from_rm_id =
                                        record.findField("mo.from_rm_id") != null ? record.getString("mo.from_rm_id") : "";

                                        final String date_start_req =
                                                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
                                        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

                                        if (this.log.isDebugEnabled()) {
                                            this.log.debug("project_id=[" + project_id + "]");
                                            this.log.debug("em_id=[" + em_id + "]");
                                        }

                                        // change work request status
                                        if (this.log.isDebugEnabled()) {
                                            this.log.debug("addProjectMoveEmployeeLeaving");
                                        }

                                        final Jacks jacks = setJacks(context, em_id);
                                        if (jacks.description != "") {
                                            description = description + "\n\n" + jacks.description;
                                        }

                                        final String from_jk_id_data = jacks.from_jk_id_data;
                                        final String from_jk_id_voice = jacks.from_jk_id_voice;
                                        /*
                                         * get questionnaire default value
                                         */
                                        final String qId = "Move Order - " + mo_type;
                                        final String qDefValue = getDefaultQuestionnaireValues(qId);

                                        /*
                                         * *NEW* INSERT INTO
                                         * mo(project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class
                                         * ,description,
                                         * date_start_req,phone,phone_dept_contact,dv_id,dp_id,ac_id,from_bl_id,from_fl_id
                                         * ,from_rm_id,
                                         * from_dv_id,from_dp_id,from_phone,from_fax,from_mailstop,from_jk_id_data,from_jk_id_voice)
                                         * SELECT project.project_id, %status% , %em_id% , %requestor% , project.dept_contact,
                                         * %date_created%, %mo_type% , %mo_class% , %description% , %date_start_req%,
                                         * project.phone_req, project.phone_dept_contact, project.dv_id, project.dp_id,
                                         * project.ac_id, em.bl_id, em.fl_id, em.rm_id, em.dv_id, em.dp_id, em.phone, em.fax,
                                         * em.mailstop, %from_jk_id_data% , %from_jk_id_voice% FROM em, project WHERE em.em_id =
                                         * %em_id%, project.project_id = %project_id%
                                         */
                                        String fromClause = null;

                                        if (isOracle(context)) {
                                            fromClause =
                                                    " FROM " + " (SELECT project.*, 'X' join_id FROM project WHERE project_id = "
                                                            + literal(context, project_id) + ") project,"
                                                            + " (SELECT em.*, 'X' join_id FROM em WHERE em_id = "
                                                            + literal(context, em_id) + ") em"
                                                            + " WHERE project.join_id = em.join_id (+) ";

                                        } else {

                                            fromClause =
                                                    " FROM project LEFT OUTER JOIN em ON em.em_id = " + literal(context, em_id)
                                                    + " WHERE project.project_id = " + literal(context, project_id);
                                        }

                                        if (!moveExist(context, em_id, project_id)) {
                                            /*
                                             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
                                             */
                                            executeDbSql(
                                                context,
                                                "INSERT INTO mo(project_id,status,em_id,requestor,dept_contact,date_created,mo_type,"
                                                        + "mo_class,description,date_start_req,date_to_perform,phone,phone_dept_contact,dv_id,dp_id,ac_id,"
                                                        + "from_bl_id,from_fl_id,from_rm_id,from_dv_id,from_dp_id,from_phone,from_fax,from_mailstop,from_jk_id_data,from_jk_id_voice,mo_quest)"
                                                        + " SELECT " + " project.project_id, "
                                                        + literal(context, status)
                                                        + ","
                                                        + literal(context, em_id)
                                                        + ","
                                                        + literal(context, requestor)
                                                        + ","
                                                        + " project.dept_contact,"
                                                        + date_created
                                                        + ","
                                                        + literal(context, mo_type)
                                                        + ","
                                                        + literal(context, mo_class)
                                                        + ","
                                                        + literal(context, description)
                                                        + ","
                                                        + date_start_req
                                                        + ","
                                                        + date_start_req
                                                        + ",project.phone_req, project.phone_dept_contact, project.dv_id, project.dp_id, project.ac_id,"
                                                        + literal(context, from_bl_id)
                                                        + ","
                                                        + literal(context, from_fl_id)
                                                        + ","
                                                        + literal(context, from_rm_id)
                                                        + ","
                                                        + " em.dv_id,"
                                                        + " em.dp_id,"
                                                        + " em.phone,"
                                                        + " em.fax,"
                                                        + " em.mailstop"
                                                        + ","
                                                        + literal(context, from_jk_id_data)
                                                        + ","
                                                        + literal(context, from_jk_id_voice)
                                                        + ","
                                                        + literal(context, qDefValue)
                                                        + fromClause, true);
                                            final Double lastPrimaryKey =
                                                    getLastPrimaryKeyValue(context, "mo", "mo_id",
                                                        "project_id = " + literal(context, project_id));

                                            addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
                                        } else {
                                            // Group Move already includes item. Show error message
                                            final ExceptionBase exception = new ExceptionBase();
                                            exception.setPattern(errorMsgGroupEmExist);
                                            exception.setTranslatable(true);
                                            final Object[] args = { project_id, em_id };
                                            exception.setArgs(args);
                                            throw exception;
                                        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addProjectMoveEquipment(final DataRecord record) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = record.getString("mo.project_id");
        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        // final String dept_contact = (String) fields.get("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String description = record.getString("mo.description");
        final String from_bl_id =
                record.findField("mo.from_bl_id") != null ? record.getString("mo.from_bl_id") : "";
                final String from_fl_id =
                        record.findField("mo.from_fl_id") != null ? record.getString("mo.from_fl_id") : "";
                        final String from_rm_id =
                                record.findField("mo.from_rm_id") != null ? record.getString("mo.from_rm_id") : "";
                                final String to_bl_id = record.getString("mo.to_bl_id");
                                final String to_fl_id = record.getString("mo.to_fl_id");
                                final String to_rm_id = record.getString("mo.to_rm_id");

                                final String date_start_req =
                                        SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
                                final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

                                if (this.log.isDebugEnabled()) {
                                    this.log.debug("project_id=[" + project_id + "]");
                                    this.log.debug("em_id=[" + em_id + "]");
                                }

                                // change work request status
                                if (this.log.isDebugEnabled()) {
                                    this.log.debug("addProjectMoveEquipment");
                                }
                                /*
                                 * get questionnaire default value
                                 */
                                final String qId = "Move Order - " + mo_type;
                                final String qDefValue = getDefaultQuestionnaireValues(qId);

                                /*
                                 * *NEW* INSERT INTO
                                 * mo(project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class
                                 * ,description,
                                 * date_start_req,phone,phone_dept_contact,dv_id,dp_id,ac_id,from_bl_id,from_fl_id
                                 * ,from_rm_id, from_dv_id,from_dp_id,to_dv_id,to_dp_id) SELECT project.project_id, %status%
                                 * , %em_id% , %requestor% , project.dept_contact, %date_created%, %mo_type% , %mo_class% ,
                                 * %description% , %date_start_req%, project.phone_req, project.phone_dept_contact,
                                 * project.dv_id, project.dp_id, project.ac_id, eq.bl_id, eq.fl_id, eq.rm_id, eq.dv_id,
                                 * eq.dp_id, eq.dv_id, eq.dp_id FROM eq, project WHERE eq.eq_id = %em_id%,
                                 * project.project_id = %project_id%
                                 */
                                String fromClause = null;

                                if (isOracle(context)) {

                                    fromClause =
                                            " FROM " + " (SELECT project.*, 'X' join_id FROM project WHERE project_id = "
                                                    + literal(context, project_id) + ") project,"
                                                    + " (SELECT eq.*, 'X' join_id FROM eq WHERE eq_id = "
                                                    + literal(context, em_id) + ") eq"
                                                    + " WHERE project.join_id = eq.join_id (+) ";

                                } else {

                                    fromClause =
                                            " FROM project LEFT OUTER JOIN eq ON eq.eq_id = " + literal(context, em_id)
                                            + " WHERE project.project_id = " + literal(context, project_id);

                                }

                                if (!moveExist(context, em_id, project_id)) {
                                    /*
                                     * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
                                     */
                                    executeDbSql(
                                        context,
                                        "INSERT INTO mo(project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description, "
                                                + "  date_start_req,date_to_perform,phone,phone_dept_contact,dv_id,dp_id,ac_id,from_bl_id,from_fl_id,from_rm_id,to_bl_id,to_fl_id,to_rm_id, "
                                                + "  from_dv_id,from_dp_id,to_dv_id,to_dp_id,mo_quest) "
                                                + " SELECT "
                                                + " project.project_id,"
                                                + literal(context, status)
                                                + ","
                                                + literal(context, em_id)
                                                + ","
                                                + literal(context, requestor)
                                                + ","
                                                + " project.dept_contact,"
                                                + date_created
                                                + ","
                                                + literal(context, mo_type)
                                                + ","
                                                + literal(context, mo_class)
                                                + ","
                                                + literal(context, description)
                                                + ","
                                                + date_start_req
                                                + ","
                                                + date_start_req
                                                + ",project.phone_req, project.phone_dept_contact, project.dv_id, project.dp_id, project.ac_id,"
                                                + literal(context, from_bl_id)
                                                + ","
                                                + literal(context, from_fl_id)
                                                + ","
                                                + literal(context, from_rm_id)
                                                + ","
                                                + literal(context, to_bl_id)
                                                + ","
                                                + literal(context, to_fl_id)
                                                + ","
                                                + literal(context, to_rm_id)
                                                + ","
                                                + " eq.dv_id,"
                                                + " eq.dp_id,"
                                                + " eq.dv_id,"
                                                + " eq.dp_id,"
                                                + literal(context, qDefValue) + fromClause, true);
                                    final Double lastPrimaryKey =
                                            getLastPrimaryKeyValue(context, "mo", "mo_id",
                                                "project_id = " + literal(context, project_id));

                                    addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
                                } else {
                                    // Group Move already includes item. Show error message
                                    final ExceptionBase exception = new ExceptionBase();
                                    exception.setPattern(errorMsgGroupItExist);
                                    exception.setTranslatable(true);
                                    final Object[] args = { project_id, em_id };
                                    exception.setArgs(args);
                                    throw exception;
                                }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addProjectMoveAsset(final DataRecord record) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = record.getString("mo.project_id");
        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        // final String dept_contact = (String) fields.get("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String description = record.getString("mo.description");
        final String from_bl_id =
                record.findField("mo.from_bl_id") != null ? record.getString("mo.from_bl_id") : "";
                final String from_fl_id =
                        record.findField("mo.from_fl_id") != null ? record.getString("mo.from_fl_id") : "";
                        final String from_rm_id =
                                record.findField("mo.from_rm_id") != null ? record.getString("mo.from_rm_id") : "";
                                final String to_bl_id = record.getString("mo.to_bl_id");
                                final String to_fl_id = record.getString("mo.to_fl_id");
                                final String to_rm_id = record.getString("mo.to_rm_id");

                                final String date_start_req =
                                        SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
                                final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

                                if (this.log.isDebugEnabled()) {
                                    this.log.debug("project_id=[" + project_id + "]");
                                    this.log.debug("em_id=[" + em_id + "]");
                                }

                                // change work request status
                                if (this.log.isDebugEnabled()) {
                                    this.log.debug("addProjectMoveAsset");
                                }
                                /*
                                 * get questionnaire default value
                                 */
                                final String qId = "Move Order - " + mo_type;
                                final String qDefValue = getDefaultQuestionnaireValues(qId);

                                // insert Group move request

                                /*
                                 * *NEW*
                                 *
                                 * INSERT INTO mo
                                 * (project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class
                                 * ,description,
                                 * date_start_req,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,ac_id)
                                 * SELECT project.project_id , %status% , %em_id% , %requestor% , project.dept_contact ,
                                 * %date_created% , %mo_type% , %mo_class% , %description% , %date_start_req% , %to_bl_id% ,
                                 * %to_fl_id% , %to_rm_id% , project.phone_req, project.phone_dept_contact, project.dv_id,
                                 * project.dp_id, project.ac_id FROM project WHERE project.project_id = %project_id%
                                 */
                                if (!moveExist(context, em_id, project_id)) {
                                    /*
                                     * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
                                     */
                                    executeDbSql(
                                        context,
                                        "INSERT INTO mo (project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,"
                                                + "date_start_req,date_to_perform,from_bl_id,from_fl_id,from_rm_id,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,ac_id,mo_quest)"
                                                + " SELECT " + " project.project_id ,"
                                                + literal(context, status)
                                                + ","
                                                + literal(context, em_id)
                                                + ","
                                                + literal(context, requestor)
                                                + ","
                                                + "  project.dept_contact , "
                                                + date_created
                                                + ","
                                                + literal(context, mo_type)
                                                + ","
                                                + literal(context, mo_class)
                                                + ","
                                                + literal(context, description)
                                                + ","
                                                + date_start_req
                                                + ","
                                                + date_start_req
                                                + ","
                                                + literal(context, from_bl_id)
                                                + ","
                                                + literal(context, from_fl_id)
                                                + ","
                                                + literal(context, from_rm_id)
                                                + ","
                                                + literal(context, to_bl_id)
                                                + ","
                                                + literal(context, to_fl_id)
                                                + ","
                                                + literal(context, to_rm_id)
                                                + ","
                                                + " project.phone_req,"
                                                + " project.phone_dept_contact,"
                                                + " project.dv_id,"
                                                + " project.dp_id,"
                                                + " project.ac_id,"
                                                + literal(context, qDefValue)
                                                + " FROM project "
                                                + " WHERE project.project_id =" + literal(context, project_id), true);

                                    final Double lastPrimaryKey =
                                            getLastPrimaryKeyValue(context, "mo", "mo_id",
                                                "project_id = " + literal(context, project_id));

                                    addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
                                } else {
                                    // Group Move already includes item. Show error message
                                    final ExceptionBase exception = new ExceptionBase();
                                    exception.setPattern(errorMsgGroupItExist);
                                    exception.setTranslatable(true);
                                    final Object[] args = { project_id, em_id };
                                    exception.setArgs(args);
                                    throw exception;
                                }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addProjectMoveRoom(final DataRecord record) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = record.getString("mo.project_id");
        final String status = record.getString("mo.status");
        final String em_id = record.getString("mo.em_id");
        final String requestor = record.getString("mo.requestor");
        // final String dept_contact = (String) fields.get("mo.dept_contact");
        final String mo_type = record.getString("mo.mo_type");
        final String mo_class = record.getString("mo.mo_class");
        final String description =
                record.findField("mo.description") != null ? record.getString("mo.description")
                        : "";
                final String to_bl_id =
                        record.findField("mo.to_bl_id") != null ? record.getString("mo.to_bl_id") : "";
                        final String to_fl_id =
                                record.findField("mo.to_fl_id") != null ? record.getString("mo.to_fl_id") : "";
                                final String to_rm_id =
                                        record.findField("mo.to_rm_id") != null ? record.getString("mo.to_rm_id") : "";

                                        final String from_bl_id = record.getString("mo.from_bl_id");
                                        final String from_fl_id = record.getString("mo.from_fl_id");
                                        final String from_rm_id = record.getString("mo.from_rm_id");

                                        final String date_start_req =
                                                SqlUtils.formatValueForSql(record.getDate("mo.date_start_req"));
                                        final String date_created = SqlUtils.formatValueForSql(record.getDate("mo.date_created"));

                                        if (this.log.isDebugEnabled()) {
                                            this.log.debug("project_id=[" + project_id + "]");
                                            this.log.debug("em_id=[" + em_id + "]");
                                        }

                                        // change work request status
                                        if (this.log.isDebugEnabled()) {
                                            this.log.debug("addProjectMoveRoom");
                                        }
                                        /*
                                         * get questionnaire default value
                                         */
                                        final String qId = "Move Order - " + mo_type;
                                        final String qDefValue = getDefaultQuestionnaireValues(qId);

                                        /*
                                         * *NEW*
                                         *
                                         * INSERT INTO mo
                                         * (project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class
                                         * ,description, date_start_req,to_bl_id,to_fl_id,to_rm_id,
                                         * phone,phone_dept_contact,dv_id,dp_id,ac_id,from_bl_id,from_fl_id, from_rm_id) SELECT
                                         * project.project_id , %status% , %em_id% , %requestor% , project.dept_contact ,
                                         * %date_created% , %mo_type% , %mo_class% , %description% , %date_start_req% , %to_bl_id% ,
                                         * %to_fl_id% , %to_rm_id% , project.phone_req, project.phone_dept_contact, project.dv_id,
                                         * project.dp_id, project.ac_id, %from_bl_id% , %from_fl_id% , %from_rm_id% FROM project
                                         * WHERE project.project_id = %project_id%
                                         */
                                        // insert Group move request
                                        /*
                                         * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
                                         */
                                        if (!moveExist(context, em_id, project_id)) {
                                            executeDbSql(
                                                context,
                                                "INSERT INTO mo (project_id,status,em_id,requestor,dept_contact,date_created,mo_type,mo_class,description,"
                                                        + "date_start_req,date_to_perform,to_bl_id,to_fl_id,to_rm_id,phone,phone_dept_contact,dv_id,dp_id,ac_id,from_bl_id,from_fl_id, from_rm_id,mo_quest)"
                                                        + " SELECT " + " project.project_id , "
                                                        + literal(context, status)
                                                        + ","
                                                        + literal(context, em_id)
                                                        + ","
                                                        + literal(context, requestor)
                                                        + ","
                                                        + " project.dept_contact ,"
                                                        + date_created
                                                        + ","
                                                        + literal(context, mo_type)
                                                        + ","
                                                        + literal(context, mo_class)
                                                        + ","
                                                        + literal(context, description)
                                                        + ","
                                                        + date_start_req
                                                        + ","
                                                        + date_start_req
                                                        + ","
                                                        + literal(context, to_bl_id)
                                                        + ","
                                                        + literal(context, to_fl_id)
                                                        + ","
                                                        + literal(context, to_rm_id)
                                                        + ","
                                                        + " project.phone_req,"
                                                        + " project.phone_dept_contact,"
                                                        + " project.dv_id,"
                                                        + " project.dp_id,"
                                                        + " project.ac_id,"
                                                        + literal(context, from_bl_id)
                                                        + ","
                                                        + literal(context, from_fl_id)
                                                        + ","
                                                        + literal(context, from_rm_id)
                                                        + ","
                                                        + literal(context, qDefValue)
                                                        + " FROM project "
                                                        + " WHERE project.project_id = "
                                                        + literal(context, project_id), true);
                                            final Double lastPrimaryKey =
                                                    getLastPrimaryKeyValue(context, "mo", "mo_id",
                                                        "project_id = " + literal(context, project_id));

                                            addPrimaryKeyValueToResponse(context, lastPrimaryKey, "mo", "mo_id");
                                        } else {
                                            // Group Move already includes item. Show error message
                                            final ExceptionBase exception = new ExceptionBase();
                                            exception.setPattern(errorMsgGroupRmExist);
                                            exception.setTranslatable(true);
                                            final Object[] args = { project_id, em_id };
                                            exception.setArgs(args);
                                            throw exception;
                                        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addProjectMoveRecord(final DataRecord record) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = record.getString("project.project_id");
        final String description = record.getString("project.description");
        final String bl_id = record.getString("project.bl_id");
        final String requestor = record.getString("project.requestor");
        final String dept_contact = record.getString("project.dept_contact");
        final String contact_id = record.getString("project.contact_id");

        final String date_start = SqlUtils.formatValueForSql(record.getDate("project.date_start"));
        final String date_end = SqlUtils.formatValueForSql(record.getDate("project.date_end"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("addMoveProjectRecord");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("Adding project record: project_id=[" + project_id + "]");
        }

        /*
         * *NEW* INSERT INTO project (contact_id, project_id,project_type,description,bl_id,
         * date_start,date_end,requestor,
         * dept_contact,phone_req,phone_dept_contact,dv_id,dp_id,date_created) SELECT %contact_id% ,
         * %project_id% , 'Move' , %description% , %bl_id% , %date_start%, %date_end% , %requestor%,
         * %dept_contact%, requestor.phone, dept_contact.phone, dept_contact.dv_id,
         * dept_contact.dp_id, %current_date% FROM em requestor, em dept_contact WHERE
         * requestor.em_id = %requestor% AND dept_contact.em_id = %dept_contact%
         */
        if (validDeptContact(context, dept_contact)) {
            final String projectIdSqlQuery =
                    "SELECT project_id FROM project WHERE project_id = "
                            + literal(context, project_id);
            final List rows = selectDbRecords(context, projectIdSqlQuery);
            if (rows.size() == 0) {
                final String sqlInsert =
                        "INSERT INTO project (contact_id, project_id,project_type,description, bl_id, site_id, date_start,date_end,requestor,"
                                + "dept_contact,phone_req,phone_dept_contact,dv_id,dp_id,date_created) "
                                + " SELECT "
                                + literal(context, contact_id)
                                + ","
                                + literal(context, project_id)
                                + ", 'Move' ,"
                                + literal(context, description)
                                + ","
                                + literal(context, bl_id)
                                + ","
                                + "(SELECT site_id FROM bl where bl_id = "
                                + literal(context, bl_id)
                                + ")"
                                + ","
                                + date_start
                                + ","
                                + date_end
                                + ","
                                + literal(context, requestor)
                                + ","
                                + literal(context, dept_contact)
                                + ","
                                + " requestor.phone,"
                                + " dept_contact.phone,"
                                + " dept_contact.dv_id,"
                                + " dept_contact.dp_id,"
                                + getCurrentDate(context)
                                + " FROM em requestor, em dept_contact "
                                + " WHERE requestor.em_id = "
                                + literal(context, requestor)
                                + " AND dept_contact.em_id = " + literal(context, dept_contact);

                executeDbSql(context, sqlInsert, true);
            } else {
                // Group Move already includes item. Show error message
                // @translatable
                final String errorMessage = "Group move [{0}] already exists.";

                final ExceptionBase exception = new ExceptionBase();
                exception.setPattern(errorMessage);
                exception.setTranslatable(true);
                final Object[] args = { project_id };
                exception.setArgs(args);
                throw exception;
            }
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgDeptContactInvalid);
            exception.setTranslatable(true);
            final Object[] args = { dept_contact };
            exception.setArgs(args);
            throw exception;
        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addBulkMoves(final DataRecord inputRec) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = inputRec.getString("mo.project_id");
        final String from_dv_id = inputRec.getString("mo.from_dv_id");
        final String from_dp_id = inputRec.getString("mo.from_dp_id");
        final String from_bl_id = inputRec.getString("mo.from_bl_id");
        final String from_fl_id = inputRec.getString("mo.from_fl_id");
        final String to_bl_id = inputRec.getString("mo.to_bl_id");
        final String to_fl_id = inputRec.getString("mo.to_fl_id");
        final String requestor = inputRec.getString("mo.requestor");

        final String date_start_req =
                SqlUtils.formatValueForSql(inputRec.getDate("mo.date_start_req"));

        // change work request status
        if (this.log.isDebugEnabled()) {
            this.log.debug("Add bulk move:");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("Adding project record: project_id=[" + project_id + "]");
        }
        /*
         * get questionnaire default value
         */
        final String qId = "Move Order - Employee";
        final String qDefValue = getDefaultQuestionnaireValues(qId);

        /*
         * *NEW*
         *
         * INSERT INTO mo (project_id, status,requestor,phone, dept_contact, phone_dept_contact,
         * dv_id, dp_id, ac_id, mo_type, date_start_req,
         * em_id,from_bl_id,from_fl_id,from_rm_id,from_dv_id
         * ,from_dp_id,from_phone,from_fax,from_mailstop, to_dv_id,to_dp_id,to_phone,to_fax) SELECT
         * project.project_id, 'Created', %requestor% project.phone_req, project.dept_contact,
         * project.phone_dept_contact, project.dv_id, project.dp_id, project.ac_id, 'Employee',
         * %date_start_req%, em.em_id, em.bl_id, em.fl_id, em.rm_id, em.dv_id, em.dp_id, em.phone,
         * em.fax, em.mailstop, em.dv_id, em.dp_id, em.phone, em.fax FROM em, project WHERE
         * project.project_id = %project_id% AND em.em_id NOT IN (SELECT em_id FROM mo WHERE
         * project_id=%project_id% AND mo_type='Employee') AND %strWhereClause%
         */
        String strWhereClause = "   ";
        boolean bAnd = false;

        if (notNull(from_dv_id).length() != 0) {
            strWhereClause += "em.dv_id = " + literal(context, from_dv_id);
            bAnd = true;
        }

        if (notNull(from_dp_id).length() != 0) {
            if (bAnd) {
                strWhereClause += " AND ";
            }
            strWhereClause += "em.dp_id = " + literal(context, from_dp_id);
            bAnd = true;
        }

        if (notNull(from_bl_id).length() != 0) {
            if (bAnd) {
                strWhereClause += " AND ";
            }
            strWhereClause += "em.bl_id = " + literal(context, from_bl_id);
            bAnd = true;
        }

        if (notNull(from_fl_id).length() != 0) {
            if (bAnd) {
                strWhereClause += " AND ";
            }
            strWhereClause += "em.fl_id = " + literal(context, from_fl_id);
            bAnd = true;
        }

        final String whereClause = strWhereClause;

        if (bAnd) {
            // strWhereClause += " AND ";
        }

        final List records = selectDbRecords(context, "em", new String[] { "em_id" }, whereClause);
        if (records.size() == 0) {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgAddBulkMoves);
            exception.setTranslatable(true);
            throw exception;
        }

        // remember the existent moves for the project, in order to NOT add eq & ta to them
        String movesIdList = "";
        final String existentMovesClause =
                " project_id=" + literal(context, project_id) + " AND mo_type='Employee'";
        final List movesRecords =
                selectDbRecords(context, "mo", new String[] { "mo_id" }, existentMovesClause);
        for (final Iterator it = movesRecords.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            movesIdList += (movesIdList != "" ? "," : "") + String.valueOf(record[0]);
        }

        try {
            /*
             * 03/07/2010 IOAN KB 3026359 add date_to_perform = date_start_req
             */
            executeDbSql(
                context,
                "INSERT INTO mo "
                        + "(project_id, status,requestor,phone,"
                        + "dept_contact,"
                        + "phone_dept_contact,"
                        + "dv_id,"
                        + "dp_id,"
                        + "ac_id,"
                        + "to_bl_id,"
                        + "to_fl_id,"
                        + "mo_type,date_start_req,date_to_perform,"
                        + "em_id,from_bl_id,from_fl_id,from_rm_id,from_dv_id,from_dp_id,from_phone,from_fax,from_mailstop,"
                        + "to_dv_id,to_dp_id,to_phone,to_fax,mo_quest) "
                        + " SELECT project.project_id, 'Created',"
                        + literal(context, requestor)
                        + " ,project.phone_req, project.dept_contact, project.phone_dept_contact,"
                        + " project.dv_id, project.dp_id, project.ac_id,"
                        + literal(context, to_bl_id)
                        + ","
                        + literal(context, to_fl_id)
                        + ",'Employee', "
                        + date_start_req
                        + ","
                        + date_start_req
                        + ","
                        + " em.em_id, em.bl_id, em.fl_id, em.rm_id,"
                        + " em.dv_id, em.dp_id, em.phone, em.fax, em.mailstop,"
                        + " em.dv_id, em.dp_id, em.phone, em.fax,"
                        + literal(context, qDefValue)
                        + " FROM em, project "
                        + " WHERE project.project_id = "
                        + literal(context, project_id)
                        + " AND em.em_id NOT IN (SELECT em_id FROM mo WHERE project_id="
                        + literal(context, project_id)
                        + " AND mo_type='Employee')"
                        + "AND "
                        + strWhereClause, true);
        } catch (final Exception e) {
            // no records updated
            return;
        }

        setJacksForBulkMove(context, project_id, whereClause);

        // add equipments and tagged furniture
        try {
            final String moJoin =
                    " JOIN "
                            + " (SELECT mo.mo_id, mo.from_bl_id, mo.from_fl_id, mo.from_rm_id, mo.em_id FROM mo, em"
                            + " WHERE em.em_id = mo.em_id "
                            + " AND mo.project_id = "
                            + literal(context, project_id)
                            + (movesIdList == "" ? "" : " AND mo.mo_id NOT IN (" + movesIdList
                                    + ")") + " AND " + strWhereClause + " ) "
                                    + (isOracle(context) ? "" : " AS ") + " mo_temp";

            String fromClause =
                    " FROM eq " + moJoin + " ON mo_temp.em_id = eq.em_id"
                            + " LEFT OUTER JOIN eqstd ON eqstd.eq_std = eq.eq_std";

            String blFlRmFields =
                    " (CASE WHEN eq.bl_id IS NULL THEN mo_temp.from_bl_id ELSE eq.bl_id END)"
                            + ", (CASE WHEN eq.bl_id IS NULL THEN mo_temp.from_fl_id ELSE eq.fl_id END)"
                            + ", (CASE WHEN eq.bl_id IS NULL THEN mo_temp.from_rm_id ELSE eq.rm_id END)";

            // insert equipment
            executeDbSql(context,
                "INSERT INTO mo_eq (eq_id,eq_std,mo_id,from_bl_id,from_fl_id,from_rm_id,cost_moving)"
                        + " SELECT eq_id,eq.eq_std,mo_temp.mo_id," + blFlRmFields + ","
                        + formatSqlIsNull(context, "eqstd.cost_moving,0") + fromClause, true);

            fromClause =
                    " FROM ta " + moJoin + " ON mo_temp.em_id = ta.em_id"
                            + " LEFT OUTER JOIN fnstd ON fnstd.fn_std = ta.fn_std";

            blFlRmFields =
                    " (CASE WHEN ta.bl_id IS NULL THEN mo_temp.from_bl_id ELSE ta.bl_id END)"
                            + ", (CASE WHEN ta.bl_id IS NULL THEN mo_temp.from_fl_id ELSE ta.fl_id END)"
                            + ", (CASE WHEN ta.bl_id IS NULL THEN mo_temp.from_rm_id ELSE ta.rm_id END)";

            // insert tagged furniture
            executeDbSql(context,
                "INSERT INTO mo_ta (ta_id,fn_std,mo_id,from_bl_id,from_fl_id,from_rm_id,cost_moving)"
                        + " SELECT ta_id,ta.fn_std,mo_temp.mo_id," + blFlRmFields + ","
                        + formatSqlIsNull(context, "fnstd.cost_moving,0") + fromClause, true);

        } catch (final Exception e) {
            // no records updated
            return;
        }

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void requestIndividualMove(final String mo_id) {

        /*
         * This action will update a move record and set the status to Requested and the Date
         * Requested as the current date. This will also update any fields that have been changed in
         * the form. This rule triggers upon the pressing of the Request button. This button is only
         * visible if the move has the status of Created. Only the Save button is visible if the
         * move status is set to Requested. This action will also send a notification email to the
         * requestor and one to the department contact if one is entered and based on the dept
         * contact email in the employee table. The message for the notification will be built in
         * the Javascript function and will be passed as an argument to the workflow rule. Following
         * is a sample message: Thank you for submitting a move request. We will notify you via
         * email upon the Approval, Issuing and Closing of this move request. Mandatory fields are:
         * Move Description, Requestor Name and Phone, Division, Department and Requested Start
         * Date. Once the user clicks on Request we first Save the data either as a separate
         * workflow rule or as an UPDATE within javascript. We can then trigger a Workflow rule that
         * will have the following two components: 1) Issue an SQL statement to update the move
         * status to requested and set the date requested field 2) Send an email to both the
         * Requestor and Department Contact based on their emails in the employee table: The
         * arguments passed to the Request Individual Move Workflow Rule program would be: Move
         * Code, Move Status, Date Requested, Request Message The SQL statement would be: UPDATE mo
         * set status='Requested',date_requested=CURRENT where mo_id = xxx
         */

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("Changing status to requested");
        }

        final String sql =
                "UPDATE mo set status='Requested',time_requested=" + getCurrentTime(context)
                + ",date_requested=" + getCurrentDate(context) + " where mo_id =" + mo_id;

        if (this.log.isDebugEnabled()) {
            this.log.debug("\n" + sql + "\n");
        }

        executeDbSql(context, sql, this.throwException);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.
        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(false);
        moveNotifications.setMoveId(Integer.valueOf(mo_id).intValue());

        final String requestorEmail = getEmailAddress(context, getRequestor(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("REQUEST", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("REQUEST", "INFORM_CONTACT", deptContactEmail);
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void requestGroupMove(final String project_id) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("requestGroupMove");
        }

        /*
         * Rule triggers upon the pressing of the Request and Approve button. This is only visible
         * if the person logged in belongs to the Move Coordinator role. Update a move project
         * record and set the status to Approved and the Date Approved to the current date. Set the
         * Move Coordinator name based on the person logged in. (If they were not the Move
         * Coordinator they would not have access to this button.) Update all the project moves and
         * set their status to Approved and the Date Approved to the current date. Enter the Move
         * Coordinator as the Approving Manager 1 and the Date Manager 1 Approved to the current
         * date and the Manager 1 Approve Status field to Approved. Send an email notification to
         * the requestor and the department coordinator as follows: Thank you for submitting a move
         * request. We will notify you via email upon the Approval, Issuing and Closing of this move
         * request. Mandatory fields are: Project Description, Requestor Name, Phone, Division,
         * Department and Requested Start Date. It is also mandatory that at least one move must be
         * assigned to the project in order for the approval to go through.
         */
        // execute the sql commands as one tranaction.
        final Vector<String> sqlCommands = new Vector<String>();
        final String updateSql1 =
                "UPDATE project set status='Requested',date_requested=" + getCurrentDate(context)
                + " where project_id=" + literal(context, project_id);
        final String updateSql2 =
                "UPDATE mo set status='Requested',date_requested=" + getCurrentDate(context)
                + " where project_id=" + literal(context, project_id);
        sqlCommands.add(updateSql1);
        sqlCommands.add(updateSql2);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        // //////////////////////////////////////////////////////////////////////////////////////////////////////
        // Send email notifications
        // /////////////////////////////////////////////////////////////////////////////////////////////////////

        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(true);
        moveNotifications.setProjectId(project_id);

        final String requestorEmail =
                getEmailAddress(context, getRequestor(context, "", project_id));
        moveNotifications.sendEmailToRecipient("REQUEST", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        moveNotifications.sendEmailToRecipient("REQUEST", "INFORM_CONTACT", deptContactEmail);

    }

    // //////////////////////////////////////////////////////////////////////////////////////////
    // /////////////////// APPROVAL ////////////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////////////////////////////////

    /**
     * routeIndividualMoveForApproval
     *
     * @param context Description of the Parameter
     */
    public void routeIndividualMoveForApproval(final String mo_id, String apprv_mgr1,
            String apprv_mgr2, String apprv_mgr3) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("routeIndividualMoveForApproval");
        }

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

        /*
         * UPDATE mo set status = 'Requested-Routed' appr_mgr1 =
         * appr_mgr1,appr_mgr1_email=appr_mgr1_email, appr_mgr1_phone= appr_mgr1_phone... WHERE
         * mo.mo_id = xxx
         */
        final String status = (String) selectDbValue(context, "mo", "status", "mo.mo_id=" + mo_id);
        boolean routed = false;

        // if already routed for approval, do nothing
        if (status.compareToIgnoreCase("Requested-Routed") != 0) {

            String sql = "UPDATE mo SET status = 'Requested-Routed' ";

            if (notNull(apprv_mgr1).length() == 0) {
                sql = sql + "  ,apprv_mgr1 = '" + SqlUtils.makeLiteralOrBlank(apprv_mgr1) + "'";
            }
            if (notNull(apprv_mgr1).length() == 0) {
                sql = sql + ",apprv_mgr2 = '" + apprv_mgr2 + "'";
            }
            if (notNull(apprv_mgr1).length() == 0) {
                sql = sql + ",apprv_mgr3 = '" + apprv_mgr3 + "'";
            }

            sql = sql + "  WHERE mo_id = " + mo_id;

            executeDbSql(context, sql, this.throwException);
        } else {
            routed = true;

        }

        /*
         * An email will be sent to all the Approving Managers as well as the Move Coordinator. The
         * email will point the managers to the URL for approving the individual move. The text in
         * the email can be: 'Please indicate your approval to move order: xxxx by clicking in the
         * URL below and selecting from the action options that appear next to your name'.
         */
        // //////////////////////////////////////////////////////////////////////////////////////////////////////
        // Send email notifications
        // /////////////////////////////////////////////////////////////////////////////////////////////////////
        // if already routed for approval, do nothing
        if (!routed) {

            final MoveNotifications moveNotifications = new MoveNotifications(context);
            moveNotifications.setGroupMove(false);
            moveNotifications.setMoveId(Integer.valueOf(mo_id).intValue());

            final String requestorEmail =
                    getEmailAddress(context, getRequestor(context, mo_id, ""));
            moveNotifications.sendEmailToRecipient("ROUTE", "INFORM", requestorEmail);

            final String deptContactEmail =
                    getEmailAddress(context, getDepartmentContact(context, mo_id, ""));
            moveNotifications.sendEmailToRecipient("ROUTE", "INFORM", deptContactEmail);

            final String moveCoordinatorEmail =
                    getEmailAddress(context, getMoveCoordinator(context, mo_id));
            moveNotifications.sendEmailToRecipient("ROUTE", "INFORM", moveCoordinatorEmail);

            moveNotifications.sendEmailToRecipient("ROUTE", "REQUEST", appr_mgr1_email);
            moveNotifications.sendEmailToRecipient("ROUTE", "REQUEST", appr_mgr2_email);
            moveNotifications.sendEmailToRecipient("ROUTE", "REQUEST", appr_mgr3_email);

        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void routeGroupMoveForApproval(final String project_id, String apprv_mgr1,
            String apprv_mgr2, String apprv_mgr3) {

        /*
         * For group moves UPDATE project set status = 'Requested-Routed' WHERE project.project_id =
         * xxxx For group moves we would also update the status of any associated moves: UPDATE mo
         * set status='Requested-Routed' WHERE mo.project_id = xxxx
         */
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

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
            this.log.debug("routeGroupMoveForApproval");
        }

        final Vector<String> sqlCommands = new Vector<String>();

        final String updateSql1 =
                "UPDATE project set status = 'Requested-Routed' WHERE project.project_id = "
                        + literal(context, project_id);
        final String updateSql2 =
                "UPDATE mo set status='Requested-Routed' WHERE mo.project_id = "
                        + literal(context, project_id);

        sqlCommands.add(updateSql1);
        sqlCommands.add(updateSql2);

        executeDbSqlCommands(context, sqlCommands, this.throwException);

        /*
         * An email will be sent to all the Approving Managers as well as the Move Coordinator. The
         * email will point the managers to the URL for approving the individual move. The text in
         * the email can be: 'Please indicate your approval to move order: xxxx by clicking in the
         * URL below and selecting from the action options that appear next to your name'.
         */
        // //////////////////////////////////////////////////////////////////////////////////////////////////////
        // Send email notifications
        // /////////////////////////////////////////////////////////////////////////////////////////////////////
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(true);
        moveNotifications.setProjectId(project_id);

        final String requestorEmail =
                getEmailAddress(context, getRequestor(context, "", project_id));
        moveNotifications.sendEmailToRecipient("ROUTE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        moveNotifications.sendEmailToRecipient("ROUTE", "INFORM", deptContactEmail);

        final String projectManager =
                getEmailAddress(context, getProjectManager(context, project_id));
        moveNotifications.sendEmailToRecipient("ROUTE", "INFORM", projectManager);

        moveNotifications.sendEmailToRecipient("ROUTE", "REQUEST", appr_mgr1_email);
        moveNotifications.sendEmailToRecipient("ROUTE", "REQUEST", appr_mgr2_email);
        moveNotifications.sendEmailToRecipient("ROUTE", "REQUEST", appr_mgr3_email);

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @param mo_id The new approvingManagersStatus value
     */

    private void setApprovingManagersStatus(final EventHandlerContext context, final String mo_id) {

        /*
         * 2)Checks if all the approval managers have approved the move, and if so, sets the mo
         * status field to 'Approved'. Here is pseudo-code for how this might be done: Use a
         * recordset to retrieve: "SELECT apprv_mgr1, apprv_mgr1_status, apprv_mgr2,
         * apprv_mgr2_status, apprv_mgr3, apprv_mgr3_status FROM mo WHERE mo_id = "+ mo_id; For each
         * approval manager, check if they have approved the move: Boolean bApprove = true; if
         * (apprv_mgr1 != NULL && apprv_mgr1_status != 'A') bApprove = false; / ... etc. for apprv
         * mgr 2 and 3 if (bApprove) sql = "UPDATE mo SET status = 'Approved' WHERE mo_id = " +
         * mo_id; String emailAddress = "";
         */
        final List records =
                selectDbRecords(context, "mo", new String[] { "apprv_mgr1", "apprv_mgr1_status",
                        "apprv_mgr2", "apprv_mgr2_status", "apprv_mgr3", "apprv_mgr3_status" },
                        "mo_id=" + mo_id);
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] values = (Object[]) it.next();

            final String apprv_mgr1 = (String) values[0];
            final String apprv_mgr2 = (String) values[2];
            final String apprv_mgr3 = (String) values[4];

            final String apprv_mgr1_status = (String) values[1];
            final String apprv_mgr2_status = (String) values[3];
            final String apprv_mgr3_status = (String) values[5];

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

                final String update =
                        "UPDATE mo SET status = 'Approved', date_approved = "
                                + getCurrentDate(context) + " WHERE mo_id = " + mo_id;
                executeDbSql(context, update, this.throwException);

            }
        }

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void approveIndividualMove(final String mo_id, final String apprv_mgr1,
            final String apprv_mgr2, final String apprv_mgr3) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String em_em_id = ContextStore.get().getUser().getEmployee().getId();

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

        /*
         * approveIndividualMove takes an mo_id and the approval manager status field name (like
         * 'apprv_mgr1_status'). The rule: 1) Updates the mo record for that mo_id and sets the
         * approval manager status field to 'A': String mo_id = getParameter("mo_id"); String
         * status_field = getParameter("status_field"); String sql = "UPDATE mo SET " + status_field
         * + " = 'A' WHERE mo_id = " +mo_id;
         */
        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("approveIndividualMove");
        }

        /*
         * This action will update the move status to 'A' only if all the Approving Managers have
         * already approved the move. Otherwise it will simply save the action each Approving
         * Manager has taken by updating the Date Manager Approved field and the Manager 1 Approve
         * Status field. Individual Moves: UPDATE mo SET status='A' WHERE mo.mo_id=xxx
         */
        String sqlUpdate = "";

        if (isOracle(context)) {

            sqlUpdate =
                    "BEGIN UPDATE mo SET " + status_field + " = 'A', " + date_field + " = "
                            + getCurrentDate(context) + " WHERE mo_id = " + mo_id
                            + "; COMMIT; END;";

        } else {

            sqlUpdate =
                    "UPDATE mo SET " + status_field + " = 'A', " + date_field + " = "
                            + getCurrentDate(context) + " WHERE mo_id = " + mo_id;

        }

        executeDbSql(context, sqlUpdate, this.throwException);

        setApprovingManagersStatus(context, mo_id);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(false);
        moveNotifications.setMoveId(Integer.valueOf(mo_id).intValue());

        final String requestorEmail = getEmailAddress(context, getRequestor(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("APPROVE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("APPROVE", "INFORM", deptContactEmail);

        final String moveCoordinatorEmail =
                getEmailAddress(context, getMoveCoordinator(context, mo_id));
        moveNotifications.sendEmailToRecipient("APPROVE", "INFORM", moveCoordinatorEmail);

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @param project_id The new approvingManagersStatusGroup value
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
            final Object[] values = (Object[]) it.next();

            final String apprv_mgr1 = (String) values[0];
            final String apprv_mgr2 = (String) values[2];
            final String apprv_mgr3 = (String) values[4];

            final String apprv_mgr1_status = (String) values[1];
            final String apprv_mgr2_status = (String) values[3];
            final String apprv_mgr3_status = (String) values[5];

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

                final Vector<String> sqlCommands = new Vector<String>();
                final String updateProject =
                        "UPDATE project SET status = 'Approved', date_approved = "
                                + getCurrentDate(context) + " WHERE project_id = "
                                + literal(context, project_id);
                final String updateMoves =
                        "UPDATE mo SET status = 'Approved', date_approved = "
                                + getCurrentDate(context) + " WHERE project_id = "
                                + literal(context, project_id);
                sqlCommands.add(updateProject);
                sqlCommands.add(updateMoves);
                executeDbSqlCommands(context, sqlCommands, this.throwException);
            }
        }

    }

    /**
     * autoApproveIndividualMove UPDATE mo SET apprv_mgr1 = literal(move_coordinator,context),
     * apprv_mgr1_status='Approved',apprv_mgr1_date=CURRENT,status='Approved' WHERE mo_id=xxx and
     * mo.status<>'Approved'
     *
     * @param context Description of the Parameter
     */
    public void autoApproveIndividualMove(final String mo_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String apprv_mgr1 = ContextStore.get().getUser().getEmployee().getId();

        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("autoApproveIndividualMove");
        }

        final String sqlUpdate =
                "UPDATE mo SET apprv_mgr1 = " + literal(context, apprv_mgr1)
                + ",apprv_mgr1_status = 'A', date_app_mgr1 = " + getCurrentDate(context)
                + ", status= 'Approved' WHERE mo_id = " + mo_id;
        executeDbSql(context, sqlUpdate, this.throwException);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(false);
        moveNotifications.setMoveId(Integer.valueOf(mo_id).intValue());

        final String requestorEmail = getEmailAddress(context, getRequestor(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("AUTOAPPROVE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("AUTOAPPROVE", "INFORM", deptContactEmail);

        final String moveCoordinatorEmail =
                getEmailAddress(context, getMoveCoordinator(context, mo_id));
        moveNotifications.sendEmailToRecipient("AUTOAPPROVE", "INFORM", moveCoordinatorEmail);

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void approveGroupMove(final String project_id, final String apprv_mgr1,
            final String apprv_mgr2, final String apprv_mgr3) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String em_em_id = ContextStore.get().getUser().getEmployee().getId();

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

        final Vector<String> sqlCommands = new Vector<String>();

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

        String updateMoves = "";

        if (isOracle(context)) {

            updateMoves =
                    "BEGIN UPDATE mo SET " + status_field + " = 'A', " + date_field + " = "
                            + getCurrentDate(context) + " WHERE project_id = "
                            + literal(context, project_id) + "; COMMIT; END;";

        } else {

            updateMoves =
                    "UPDATE mo SET " + status_field + " = 'A', " + date_field + " = "
                            + getCurrentDate(context) + " WHERE project_id = "
                            + literal(context, project_id);

        }

        sqlCommands.add(updateProject);
        sqlCommands.add(updateMoves);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        setApprovingManagersStatusGroup(context, project_id);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(true);
        moveNotifications.setProjectId(project_id);

        final String requestorEmail =
                getEmailAddress(context, getRequestor(context, "", project_id));
        moveNotifications.sendEmailToRecipient("APPROVE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        moveNotifications.sendEmailToRecipient("APPROVE", "INFORM", deptContactEmail);

        final String projectManagerEmail =
                getEmailAddress(context, getProjectManager(context, project_id));
        moveNotifications.sendEmailToRecipient("APPROVE", "INFORM", projectManagerEmail);

    }

    /**
     * autoApproveGroupMove UPDATE project SET apprv_mgr1 = literal(proj_mgr,context),
     * apprv_mgr1_status='Approved',apprv_mgr1_date=CURRENT,status='Approved' WHERE project_id='xxx'
     *
     * @param context Description of the Parameter
     */

    public void autoApproveGroupMove(final String project_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String apprv_mgr1 = ContextStore.get().getUser().getEmployee().getId();

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("approveGroupMove");
        }

        final Vector<String> sqlCommands = new Vector<String>();
        final String updateProject =
                "UPDATE project SET status='Approved', apprv_mgr1 = "
                        + literal(context, apprv_mgr1)
                        + ",apprv_mgr1_status = 'A', date_app_mgr1 = " + getCurrentDate(context)
                        + " WHERE project.project_id = " + literal(context, project_id);
        final String updateMoves =
                "UPDATE mo SET status='Approved', apprv_mgr1 = " + literal(context, apprv_mgr1)
                + ",apprv_mgr1_status = 'A', date_app_mgr1 = " + getCurrentDate(context)
                + " WHERE mo.project_id =" + literal(context, project_id);
        sqlCommands.add(updateProject);
        sqlCommands.add(updateMoves);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(true);
        moveNotifications.setProjectId(project_id);

        final String requestorEmail =
                getEmailAddress(context, getRequestor(context, "", project_id));
        moveNotifications.sendEmailToRecipient("AUTOAPPROVE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        moveNotifications.sendEmailToRecipient("AUTOAPPROVE", "INFORM", deptContactEmail);

        final String projectManagerEmail =
                getEmailAddress(context, getProjectManager(context, project_id));
        moveNotifications.sendEmailToRecipient("AUTOAPPROVE", "INFORM", projectManagerEmail);

    }

    // /////////////////////////////////////////////////////////////////////////////////////////
    // ///////////////////// REJECT MOVES ////////////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void rejectIndividualMove(final String mo_id, final String apprv_mgr1,
            final String apprv_mgr2, final String apprv_mgr3) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String em_em_id = ContextStore.get().getUser().getEmployee().getId();

        // Set the status_field value based on which approving manager the current user is

        String status_field = "";

        if (em_em_id.equalsIgnoreCase(apprv_mgr1)) {
            status_field = "apprv_mgr1_status";
        } else if (em_em_id.equalsIgnoreCase(apprv_mgr2)) {
            status_field = "apprv_mgr2_status";
        } else if (em_em_id.equalsIgnoreCase(apprv_mgr3)) {
            status_field = "apprv_mgr3_status";
        }

        /*
         * rejectIndividualMove takes an mo_id and an approval manager status field name. The rule:
         * 1) Updates the mo record and sets the approval manager status field to "R" - Rejected 2)
         * Sets the mo status field to "Requested-Rejected". There is no need to query the other
         * status fields, as a single rejection is enough to reject the move. These two steps can be
         * one SQL statement: String mo_id = getParameter("mo_id"); String status_field =
         * getParameter("status_field"); String sql = "UPDATE mo SET " + status_field + " = 'R',
         * status = 'Requested-Rejected'; sql += ' WHERE mo_id = ' + mo_id;
         */
        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("rejectIndividualMove");
        }

        final String sqlUpdate =
                "UPDATE mo SET " + status_field + " = 'R', status = 'Requested-Rejected'"
                        + " WHERE mo_id = " + mo_id;

        executeDbSql(context, sqlUpdate, this.throwException);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(false);
        moveNotifications.setMoveId(Integer.valueOf(mo_id).intValue());

        final String requestorEmail = getEmailAddress(context, getRequestor(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("REJECT", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("REJECT", "INFORM", deptContactEmail);

        final String useWorkspaceTransactions =
                ContextStore.get().getProject().getActivityParameterManager()
                .getParameterValue("AbSpaceRoomInventoryBAR-UseWorkspaceTransactions");
        if (useWorkspaceTransactions.equals("1")) {
            // delete Rmpct Record
            this.processDeleteRmpctRecord("mo", mo_id);
            // update associatecd space transaction service request status
            updateAssociatedServiceRequestStatus("mo", mo_id);
        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void rejectGroupMove(final String project_id, final String apprv_mgr1,
            final String apprv_mgr2, final String apprv_mgr3) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String em_em_id = ContextStore.get().getUser().getEmployee().getId();

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
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("approveGroupMove");
        }

        /*
         * Group Moves: UPDATE project set status='Approved' WHERE project.project_id=xxx UPDATE mo
         * SET status='Approved' WHERE project.project_id=xxx
         */
        final Vector<String> sqlCommands = new Vector<String>();
        final String updateProject =
                "UPDATE project SET " + status_field
                + " = 'R', status = 'Requested-Rejected' WHERE project.project_id = "
                + literal(context, project_id);
        final String updateMoves =
                "UPDATE mo SET " + status_field
                + "='R', status='Requested-Rejected' WHERE mo.project_id ="
                + literal(context, project_id);
        sqlCommands.add(updateProject);
        sqlCommands.add(updateMoves);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.
        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(true);
        moveNotifications.setProjectId(project_id);

        final String requestorEmail =
                getEmailAddress(context, getRequestor(context, "", project_id));
        moveNotifications.sendEmailToRecipient("REJECT", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        moveNotifications.sendEmailToRecipient("REJECT", "INFORM", deptContactEmail);

        final String useWorkspaceTransactions =
                ContextStore.get().getProject().getActivityParameterManager()
                .getParameterValue("AbSpaceRoomInventoryBAR-UseWorkspaceTransactions");
        if (useWorkspaceTransactions.equals("1")) {
            // delete Rmpct Record
            this.processDeleteRmpctRecord("project", project_id);
            // update associatecd space transaction service request status
            updateAssociatedServiceRequestStatus("project", project_id);
        }
    }

    // //////////////////////////////////////////////////////////////////////////////////////////
    // //////////////////////////// WITHDRAW //////////////////////////////////////////////////
    // //////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void withdrawIndividualMove(final EventHandlerContext context) {

        final Integer mo_id_int = (Integer) context.getParameter("mo_id");

        final String mo_id = mo_id_int.toString();

        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("withdrawIndividualMove");
        }

        executeDbSql(context, "DELETE FROM  mo WHERE mo.mo_id=" + mo_id, this.throwException);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(false);
        moveNotifications.setMoveId(Integer.valueOf(mo_id).intValue());

        final String requestorEmail = getEmailAddress(context, getRequestor(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("WITHDRAW", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("WITHDRAW", "INFORM", deptContactEmail);

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void withdrawSelectedMoves(final EventHandlerContext context) {

        final String mo_id_list = (String) context.getParameter("mo_id_list");
        final String formatted_id_list =
                removeQuotes(formatSqlFieldValue(context, mo_id_list, "java.lang.String",
                        "mo_id_list"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id_list=[" + mo_id_list + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("withdrawSelectedMoves");
        }

        executeDbSql(context, "DELETE FROM mo WHERE mo.mo_id IN  (" + formatted_id_list + ")",
            this.throwException);

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void withdrawGroupMove(final EventHandlerContext context) {

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
            this.log.debug("withdrawGroupMove");
        }

        final Vector<String> sqlCommands = new Vector<String>();
        final String deleteProject =
                "DELETE FROM mo WHERE mo.project_id = " + literal(context, project_id);
        final String deleteMoves =
                "DELETE FROM project WHERE project.project_id = " + literal(context, project_id);
        sqlCommands.add(deleteProject);
        sqlCommands.add(deleteMoves);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.
        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(true);
        moveNotifications.setProjectId(project_id);

        final String requestorEmail =
                getEmailAddress(context, getRequestor(context, "", project_id));
        moveNotifications.sendEmailToRecipient("WITHDRAW", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        moveNotifications.sendEmailToRecipient("WITHDRAW", "INFORM", deptContactEmail);
        final String projectManagerEmail =
                getEmailAddress(context, getProjectManager(context, project_id));
        moveNotifications.sendEmailToRecipient("WITHDRAW", "INFORM", projectManagerEmail);

    }

    // //////////////////////////////////////////////////////////////////////////////////////////
    // ////////////////// ISSUE //////////////////////////////////////////////////////////
    // /////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void issueIndividualMove(final String mo_id, final String requestor) {

        /*
         * Issuing a move will trigger a series of emails to the various parties involved. Any
         * automatic work requests associated with the actions will also be triggered. First an
         * update SQL statement will set the move's status to 'Issued' and the issue date to current
         * date. The status of all associated move actions will also be set to 'Issued'. UPDATE mo
         * set status = 'Issued-In Process', date_issued = current date where mo_id = xxx (No single
         * quotes) UPDATE activity_log set status='Issued-In Process' where mo_id=xxx (No single
         * quotes) To generate work requests we would issue separate INSERT statements for each
         * action that will need a work request.
         */
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("issueIndividualMove");
        }

        // execute the sql commands as one tranaction.
        final Vector<String> sqlCommands = new Vector<String>();

        final String update1 =
                "UPDATE mo SET status='Issued-In Process', date_issued = "
                        + getCurrentDate(context) + " WHERE mo.mo_id=" + mo_id;
        sqlCommands.add(update1);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        // create service request for current move
        createServiceRequest(mo_id, new String());

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(false);
        moveNotifications.setMoveId(Integer.valueOf(mo_id).intValue());

        final String requestorEmail = getEmailAddress(context, getRequestor(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("ISSUE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("ISSUE", "INFORM", deptContactEmail);
        final String moveCoordinatorEmail =
                getEmailAddress(context, getMoveCoordinator(context, mo_id));
        moveNotifications.sendEmailToRecipient("ISSUE", "INFORM", moveCoordinatorEmail);

        final List records2 =
                selectDbRecords(context, "activity_log", new String[] { "assigned_to" }, "mo_id="
                        + mo_id);

        for (final Iterator it = records2.iterator(); it.hasNext();) {
            final Object[] values = (Object[]) it.next();

            final String assigned_to = (String) values[0];

            String emailAddress =
                    (String) selectDbValue(context, "em", "email",
                        "em_id=" + literal(context, assigned_to));

            if (notNull(emailAddress).length() == 0) {
                emailAddress =
                        (String) selectDbValue(context, "cf", "email",
                            "cf_id=" + literal(context, assigned_to));
            }

            moveNotifications.sendEmailToRecipient("ISSUE", "REQUEST", emailAddress);
        }

        final String useWorkspaceTransactions =
                ContextStore.get().getProject().getActivityParameterManager()
                    .getParameterValue("AbSpaceRoomInventoryBAR-UseWorkspaceTransactions");
        
        // Activity parameter CaptureSpaceHistory
        final String captureSpaceHistory =
                ContextStore.get().getProject().getActivityParameterManager()
                .getParameterValue("AbSpaceRoomInventoryBAR-CaptureSpaceHistory");

        if (useWorkspaceTransactions.equals("1")|| captureSpaceHistory.equals("1")) {
            // update associatecd space transaction service request status
            updateAssociatedServiceRequestStatus("mo", mo_id);
            // update associatecd rmpct records
            updateAssociatedRmpct("mo", mo_id, false);
        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void issueGroupMove(final String project_id, final String requestor) {

        /*
         * This is the action that starts the project and issues any associated actions and in turn
         * work requests associated with actions. The save statement will first change any edits
         * made to the Issue form. The workflow rule issueGroupMove will add the following: Update
         * the status for the project and the individual moves and actions. UPDATE project set
         * status=' Issued-In Process', date_issued = current date WHERE project.project_id=xxx
         *
         * UPDATE mo SET status='Issued-In Process', date_issued = current date WHERE
         * project.project_id=xxx
         *
         * UPDATE activity_log SET status='Issued-In Process' WHERE project.project_id=xxx
         */
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("issueGroupMove");
        }

        // XXXX throwException should be false for the last two commands?????
        final Vector<String> sqlCommands = new Vector<String>();
        final String updateProject =
                "UPDATE project SET status = 'Issued-In Process', date_issued = "
                        + getCurrentDate(context) + " WHERE project.project_id = "
                        + literal(context, project_id);
        final String updateMoves =
                "UPDATE mo SET status='Issued-In Process', date_issued = "
                        + getCurrentDate(context)
                        + " WHERE mo.status <> 'Approved-Cancelled' AND mo.project_id ="
                        + literal(context, project_id);

        final String updateMoveDate =
                " UPDATE mo set mo.date_to_perform=(SELECT project.date_commence_work from project "
                        + " WHERE project.project_id=" + literal(context, project_id)
                        + ") WHERE mo.date_to_perform is null and "
                        + " mo.project_id IN (SELECT project_id from project "
                        + " where date_commence_work is not null and project_id="
                        + literal(context, project_id) + ")";

        sqlCommands.add(updateProject);
        sqlCommands.add(updateMoves);
        sqlCommands.add(updateMoveDate);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        // create service request
        createServiceRequest(new String(), project_id);

        // Send email notification
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(true);
        moveNotifications.setProjectId(project_id);

        final String requestorEmail =
                getEmailAddress(context, getRequestor(context, "", project_id));
        moveNotifications.sendEmailToRecipient("ISSUE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        moveNotifications.sendEmailToRecipient("ISSUE", "INFORM", deptContactEmail);
        final String projectManagerEmail =
                getEmailAddress(context, getProjectManager(context, project_id));
        moveNotifications.sendEmailToRecipient("ISSUE", "INFORM", projectManagerEmail);


        final List records2 =
                selectDbRecords(context, "activity_log", new String[] { "assigned_to" },
                    "project_id=" + literal(context, project_id));

        for (final Iterator it = records2.iterator(); it.hasNext();) {
            final Object[] values = (Object[]) it.next();

            final String assigned_to = (String) values[0];

            String emailAddress =
                    (String) selectDbValue(context, "em", "email",
                        "em_id=" + literal(context, assigned_to));

            if (notNull(emailAddress).length() == 0) {
                emailAddress =
                        (String) selectDbValue(context, "cf", "email",
                            "cf_id=" + literal(context, assigned_to));
            }

            moveNotifications.sendEmailToRecipient("ISSUE", "REQUEST", emailAddress);
        }

        final String useWorkspaceTransactions =
                ContextStore.get().getProject().getActivityParameterManager()
                    .getParameterValue("AbSpaceRoomInventoryBAR-UseWorkspaceTransactions");

        // Activity parameter CaptureSpaceHistory
        final String captureSpaceHistory =
                ContextStore.get().getProject().getActivityParameterManager()
                .getParameterValue("AbSpaceRoomInventoryBAR-CaptureSpaceHistory");
        if (useWorkspaceTransactions.equals("1") || captureSpaceHistory.equals("1")) {
            // update associatecd space transaction service request status
            updateAssociatedServiceRequestStatus("project", project_id);
            // update associatecd rmpct records
            updateAssociatedRmpct("project", project_id, false);
        }
    }

    // ///////////////////////////////////////////////////////////////////////////////////////////
    // ////////////////////////////// CLOSE MOVES ///////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////

    /**
     * getMoveType helper method
     *
     * @param context Description of the Parameter
     * @param mo_id Description of the Parameter
     * @return The moveType value
     */

    private String getMoveType(final EventHandlerContext context, final String mo_id) {
        return (String) selectDbValue(context, "mo", "mo_type", "mo_id=" + mo_id);
    }

    /**
     * actionsNoCompleted
     *
     * @param context Description of the Parameter
     * @param mo_id Description of the Parameter
     * @return The departmentContact value
     */

    private boolean actionsNotCompleted(final EventHandlerContext context, final String mo_id) {
        final Object found_mo_id =
                selectDbValue(context, "activity_log", "activity_log_id", "mo_id=" + mo_id
                    + " AND status NOT IN ('COMPLETED-V','REJECTED','CANCELLED')");
        return (found_mo_id != null);
    }

    /**
     * closeIndividualMove
     *
     * @param context Description of the Parameter
     */
    public void closeIndividualMove(final String mo_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("closeIndividualMove");
        }

        /*
         * When we close an Individual Move as part of the closeIndividualMove worklfow rule we need
         * to check if any associated actions are completed. The SELECT statement would be: SELECT 1
         * FROM activity_log WHERE mo_id = xxx AND status <> 'COMPLETED-V' If this selection returns
         * records that means that there are activity log records that remain open.
         */
        if (actionsNotCompleted(context, mo_id)) {
            // Not all actions are marked complete. Show error message
            // @translatable
            final String errorMessage =
                    "Please make sure to mark all actions as COMPLETED AND VERIFIED prior to closing this move.";

            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMessage);
            exception.setTranslatable(true);
            throw exception;
        }

        /*
         * UPDATE mo set status='Closed', date_closed=CURRENT where mo_id=xxx UPDATE activity_log
         * set status='Closed', date_closed=CURRENT where mo_id=xxx NOTE: John will add a
         * date_closed to the activity_log table
         */
        // java.sql.Date t = Utility.currentDate();
        // the second SQL command should have throwException as false

        final Vector<String> sqlCommands = new Vector<String>();
        final String updateProject =
                "UPDATE mo SET status='Closed', date_closed=" + getCurrentDate(context)
                + " WHERE mo.mo_id=" + mo_id;
        final String updateMoves =
                "UPDATE activity_log SET status='CLOSED', date_closed=" + getCurrentDate(context)
                + " WHERE mo_id=" + mo_id;
        sqlCommands.add(updateProject);
        sqlCommands.add(updateMoves);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        final String moveType = getMoveType(context, mo_id);

        if (this.log.isDebugEnabled()) {
            this.log.debug("Move type:" + moveType);
        }

        if ((moveType.compareToIgnoreCase("Employee") == 0)
                || (moveType.compareToIgnoreCase("New Hire") == 0)
                || (moveType.compareToIgnoreCase("Leaving") == 0)) {

            final String sqlUpdate =
                    " UPDATE em SET " + " em.bl_id=(SELECT mo.to_bl_id FROM mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (SELECT bl_id from bl)),"
                            + " em.fl_id=(select mo.to_fl_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id)),"
                            + " em.rm_id=(select mo.to_rm_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id) and mo.to_rm_id in (select rm_id from rm where rm.bl_id=mo.to_bl_id and rm.fl_id=mo.to_fl_id)),"
                            + " em.dv_id=(SELECT mo.to_dv_id FROM mo where mo_id="
                            + mo_id
                            + "and mo.to_dv_id in (SELECT dv_id from dv)),"
                            + " em.dp_id=(select mo.to_dp_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_dv_id in (select dv_id from dv) and mo.to_dp_id in (select dp_id from dp where dp.dp_id=mo.to_dp_id)),"
                            + " em.phone=(select mo.to_phone from mo where mo_id="
                            + mo_id
                            + "),"
                            + " em.fax=(select mo.to_fax from mo where mo_id="
                            + mo_id
                            + "),"
                            + " em.mailstop=(select mo.to_mailstop from mo where mo_id="
                            + mo_id
                            + ")"
                            + " WHERE em.em_id IN (SELECT mo.em_id FROM mo WHERE mo_id="
                            + mo_id
                            // to keep consistent with space transaction, do not update the
                            // Employees table
                            // when it is not a primary location move
                            + "                   AND NOT EXISTS(SELECT 1 FROM rmpct WHERE rmpct.activity_log_id IS NOT NULL"
                            + "                                  AND rmpct.activity_log_id = mo.activity_log_id"
                            + "                                  AND rmpct.em_id = mo.em_id AND rmpct.primary_em=0)"
                            + "                   )";

            final String sqlUpdateEq =
                    " UPDATE eq SET "
                            + " eq.bl_id=(SELECT mo.to_bl_id FROM mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (SELECT bl_id from bl)),"
                            + " eq.fl_id=(select mo.to_fl_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id)),"
                            + " eq.rm_id=(select mo.to_rm_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id) and mo.to_rm_id in (select rm_id from rm where rm.bl_id=mo.to_bl_id and rm.fl_id=mo.to_fl_id)),"
                            + " eq.dv_id=(SELECT mo.to_dv_id FROM mo where mo_id="
                            + mo_id
                            + "and mo.to_dv_id in (SELECT dv_id from dv)),"
                            + " eq.dp_id=(select mo.to_dp_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_dv_id in (select dv_id from dv) and mo.to_dp_id in (select dp_id from dp where dp.dp_id=mo.to_dp_id))"
                            + " WHERE eq.eq_id IN (SELECT mo.em_id FROM mo WHERE mo_id=" + mo_id
                            + ")";

            // To update the jack data we need two statements:

            final String sqlUpdateJacks1 =
                    " UPDATE jk SET " + " em_id = (SELECT mo.em_id FROM mo WHERE mo.mo_id = "
                            + mo_id + " AND mo.em_id IN (SELECT em_id from em)) "
                            + " WHERE jk.jk_id IN (SELECT to_jk_id_voice FROM mo WHERE mo.mo_id ="
                            + mo_id + ")";

            final String sqlUpdateJacks2 =
                    " UPDATE jk SET " + " em_id = (SELECT mo.em_id FROM mo where mo.mo_id = "
                            + mo_id + " AND mo.em_id IN (SELECT em_id from em)) "
                            + " WHERE jk.jk_id IN (SELECT to_jk_id_data FROM mo WHERE mo.mo_id ="
                            + mo_id + ")";

            sqlCommands.clear();
            sqlCommands.add(sqlUpdate);
            sqlCommands.add(sqlUpdateEq);

            if (moveType.compareToIgnoreCase("Leaving") == 0) {

                final String sqlUpdateJacks3 =
                        " UPDATE jk SET " + " em_id = NULL WHERE em_id in "
                                + " (SELECT mo.em_id FROM mo where mo.mo_id = " + mo_id
                                + " AND mo.em_id IN (SELECT em_id from em)) ";
                sqlCommands.add(sqlUpdateJacks3);

            } else {
                sqlCommands.add(sqlUpdateJacks1);
                sqlCommands.add(sqlUpdateJacks2);

            }

            executeDbSqlCommands(context, sqlCommands, this.throwException);
        }

        // If a move is of type 'Equipment' we update the equipment data:
        if (moveType.compareToIgnoreCase("Equipment") == 0) {

            final String sqlUpdate =
                    " UPDATE eq SET "
                            + " eq.bl_id=(SELECT mo.to_bl_id FROM mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (SELECT bl_id from bl)), "
                            + " eq.fl_id=(select mo.to_fl_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id)), "
                            + " eq.rm_id=(select mo.to_rm_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id) and mo.to_rm_id in (select rm_id from rm where rm.bl_id=mo.to_bl_id and rm.fl_id=mo.to_fl_id)), "
                            + " eq.dv_id=(SELECT mo.to_dv_id FROM mo where mo_id="
                            + mo_id
                            + " and mo.to_dv_id in (SELECT dv_id from dv)), "
                            + " eq.dp_id=(select mo.to_dp_id from mo where mo_id="
                            + mo_id
                            + " and mo.to_dv_id in (select dv_id from dv) and mo.to_dp_id in (select dp_id from dp where dp.dp_id=mo.to_dp_id)) "
                            + " WHERE eq.eq_id IN (SELECT mo.em_id FROM mo WHERE mo.mo_id=" + mo_id
                            + ")";

            executeDbSql(context, sqlUpdate, this.throwException);

        }

        String sqlEq = "";
        String sqlTa = "";

        /*
         * If "Employee", "Room", "New Hire" move, we update the move's equipments and tagged
         * furniture
         */
        if ((moveType.compareToIgnoreCase("Employee") == 0)
                || (moveType.compareToIgnoreCase("Room") == 0)
                || (moveType.compareToIgnoreCase("New Hire") == 0)) {
            /*
             * 04/07/2011 Ioan KB 3031018
             */

            sqlEq =
                    "UPDATE eq SET eq.bl_id = (SELECT mo.to_bl_id FROM mo WHERE mo.mo_id = "
                            + mo_id
                            + "), eq.fl_id =  (SELECT mo.to_fl_id FROM mo WHERE mo.mo_id = "
                            + mo_id
                            + "), eq.rm_id = (SELECT mo.to_rm_id FROM mo WHERE mo.mo_id = "
                            + mo_id
                            + ") "
                            + "WHERE eq.eq_id IN (SELECT mo_eq.eq_id FROM mo_eq WHERE mo_eq.mo_id = "
                            + mo_id + ")";

            sqlTa =
                    "UPDATE ta SET ta.bl_id = (SELECT mo.to_bl_id FROM mo WHERE mo.mo_id = "
                            + mo_id
                            + "), ta.fl_id =  (SELECT mo.to_fl_id FROM mo WHERE mo.mo_id = "
                            + mo_id
                            + "), ta.rm_id = (SELECT mo.to_rm_id FROM mo WHERE mo.mo_id = "
                            + mo_id
                            + ") "
                            + "WHERE ta.ta_id IN (SELECT mo_ta.ta_id FROM mo_ta WHERE mo_ta.mo_id = "
                            + mo_id + ")";

            sqlCommands.clear();
            sqlCommands.add(sqlEq);
            sqlCommands.add(sqlTa);
            executeDbSqlCommands(context, sqlCommands, this.throwException);
        }

        // //////////////////////////////////////////////////////////////////////////////////////////////////////
        // Send email notifications
        // /////////////////////////////////////////////////////////////////////////////////////////////////////

        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(false);
        moveNotifications.setMoveId(Integer.valueOf(mo_id).intValue());

        final String requestorEmail = getEmailAddress(context, getRequestor(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("CLOSE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, mo_id, ""));
        moveNotifications.sendEmailToRecipient("CLOSE", "INFORM", deptContactEmail);
        final String moveCoordinatorEmail =
                getEmailAddress(context, getMoveCoordinator(context, mo_id));
        moveNotifications.sendEmailToRecipient("CLOSE", "INFORM", moveCoordinatorEmail);

        final String useWorkspaceTransactions =
                ContextStore.get().getProject().getActivityParameterManager()
                    .getParameterValue("AbSpaceRoomInventoryBAR-UseWorkspaceTransactions");

        // Activity parameter CaptureSpaceHistory
        final String captureSpaceHistory =
                ContextStore.get().getProject().getActivityParameterManager()
                .getParameterValue("AbSpaceRoomInventoryBAR-CaptureSpaceHistory");
        if (useWorkspaceTransactions.equals("1") || captureSpaceHistory.equals("1")) {
            // update associatecd space transaction service request status
            updateAssociatedServiceRequestStatus("mo", mo_id);
            // update associatecd rmpct records
            updateAssociatedRmpct("mo", mo_id, true);
        }
    }

    /**
     * actionsNotCompletedProjectMoves
     *
     * @param context Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The departmentContact value
     */

    private boolean actionsNotCompletedProjectMoves(final EventHandlerContext context,
            final String project_id) {
        final Object found_mo_id =
                selectDbValue(
                    context,
                    "mo",
                    "mo_id",
                    "project_id="
                            + literal(context, project_id)
                            + " AND status NOT IN ('Completed-Verified','Approved-Cancelled','Issued-Stopped')");
        return (found_mo_id != null);
    }

    /**
     * actionsNotCompletedProjectActivityLogs
     *
     * @param context Description of the Parameter
     * @param project_id Description of the Parameter
     * @return The departmentContact value
     */

    private boolean actionsNotCompletedProjectActivityLogs(final EventHandlerContext context,
            final String project_id) {
        final Object found_mo_id =
                selectDbValue(context, "activity_log", "activity_log_id",
                    "project_id=" + literal(context, project_id)
                    + " AND status NOT IN ('COMPLETED-V','REJECTED','CANCELLED')");
        return (found_mo_id != null);
    }

    /**
     * Description of the Method closeGroupMove
     *
     * @param context Description of the Parameter
     */
    public void closeGroupMove(final String project_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("closeGroupMove");
        }

        /*
         * When we close a Group Move as part of the closeGroupMove workflow rule we need to check
         * if all moves and actions are completed. We need to run two SELECT statements. The first
         * checks for moves: SELECT 1 FROM mo WHERE project_id = 'xxx' AND status NOT IN
         * ('Completed-Verified','Approved-Cancelled','Issued-Stopped') If there are moves that are
         * not completed and verified we can provide the following message: Please make sure to mark
         * all moves as Completed-Verified, Approved-Cancelled or Issued-Stopped prior to closing
         * this project. The second statement will check for activity log records: SELECT 1 FROM
         * activity_log WHERE project_id = 'xxx' AND status NOT IN
         * ('COMPLETED-V','REJECTED','CANCELLED') If there are actions that are not completed and
         * verified we can provide the following message: Please make sure to mark all actions as
         * COMPLETED-VERIFIED, REJECTED or CANCELLED prior to closing this project.
         */
        if (actionsNotCompletedProjectMoves(context, project_id)) {
            // Not all moves are marked complete. Show error message
            // @translatable
            final String errorMessage =
                    "Please make sure to mark all moves as Completed-Verified, Approved-Cancelled or Issued-Stopped prior to closing this Project.";

            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMessage);
            exception.setTranslatable(true);
            throw exception;
        }

        if (actionsNotCompletedProjectActivityLogs(context, project_id)) {
            // Not all actions are marked complete. Show error message
            // @translatable
            final String errorMessage =
                    "Please make sure to mark all actions as COMPLETED AND VERIFIED, REJECTED or CANCELLED prior to closing this Project.";
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMessage);
            exception.setTranslatable(true);
            throw exception;
        }

        final Vector<String> sqlCommands = new Vector<String>();

        // The following SQL statements we can issue for both employee and equipment moves.

        final String sqlUpdate =
                " UPDATE em SET " + " em.bl_id= (SELECT mo.to_bl_id FROM mo where project_id= "
                        + literal(context, project_id)
                        + "  and mo.em_id=em.em_id and mo.to_bl_id in (SELECT bl_id from bl)), "
                        + " em.fl_id= (select mo.to_fl_id from mo where project_id= "
                        + literal(context, project_id)
                        + " and mo.em_id=em.em_id and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id)), "
                        + " em.rm_id= (select mo.to_rm_id from mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=em.em_id and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id) and mo.to_rm_id in (select rm_id from rm where rm.bl_id=mo.to_bl_id and rm.fl_id=mo.to_fl_id)), "
                        + " em.dv_id= (SELECT mo.to_dv_id FROM mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=em.em_id and mo.to_dv_id in (SELECT dv_id from dv)), "
                        + " em.dp_id= (select mo.to_dp_id from mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=em.em_id and mo.to_dv_id in (select dv_id from dv) and mo.to_dp_id in (select dp_id from dp where dp.dp_id=mo.to_dp_id)), "
                        + " em.phone= (select mo.to_phone from mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=em.em_id), "
                        + " em.fax= (select mo.to_fax from mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=em.em_id), "
                        + " em.mailstop= (select mo.to_mailstop from mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=em.em_id) "
                        + " WHERE em.em_id IN (SELECT em_id from mo WHERE mo.status='Completed-Verified' AND mo.mo_type in ('Employee', 'New Hire','Leaving') and project_id="
                        + literal(context, project_id)
                        // to keep consistent with space transaction, do not update the Employees
                        // table
                        // when it is not a primary location move
                        + "                      AND NOT EXISTS(SELECT 1 FROM rmpct WHERE rmpct.activity_log_id IS NOT NULL"
                        + "                                  AND rmpct.activity_log_id = mo.activity_log_id"
                        + "                                  AND rmpct.em_id = mo.em_id AND rmpct.primary_em=0)"
                        + "                  )";

        final String sqlUpdateEq =
                " UPDATE eq SET "
                        + " eq.bl_id= (SELECT mo.to_bl_id FROM mo where project_id= "
                        + literal(context, project_id)
                        + "  and mo.em_id=eq.eq_id and mo.to_bl_id in (SELECT bl_id from bl)), "
                        + " eq.fl_id= (select mo.to_fl_id from mo where project_id= "
                        + literal(context, project_id)
                        + " and mo.em_id=eq.eq_id and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id)), "
                        + " eq.rm_id= (select mo.to_rm_id from mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=eq.eq_id and mo.to_bl_id in (select bl_id from bl) and mo.to_fl_id in (select fl_id from fl where fl.bl_id=mo.to_bl_id) and mo.to_rm_id in (select rm_id from rm where rm.bl_id=mo.to_bl_id and rm.fl_id=mo.to_fl_id)), "
                        + " eq.dv_id= (SELECT mo.to_dv_id FROM mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=eq.eq_id and mo.to_dv_id in (SELECT dv_id from dv)), "
                        + " eq.dp_id= (select mo.to_dp_id from mo where project_id="
                        + literal(context, project_id)
                        + " and mo.em_id=eq.eq_id and mo.to_dv_id in (select dv_id from dv) and mo.to_dp_id in (select dp_id from dp where dp.dp_id=mo.to_dp_id)) "
                        + " WHERE eq.eq_id IN (SELECT em_id from mo WHERE mo.status='Completed-Verified' AND mo.mo_type in ('Equipment') and project_id="
                        + literal(context, project_id) + ")";

        // To update the jack data we need two statements:

        final String sqlUpdateJacks1 =
                " UPDATE jk SET "
                        + " em_id= (SELECT mo.em_id FROM mo where jk.jk_id=mo.to_jk_id_voice and mo.project_id = "
                        + literal(context, project_id)
                        + " and mo.em_id IN (SELECT em_id from em)) "
                        + " WHERE jk_id IN (SELECT to_jk_id_voice FROM mo WHERE mo.status='Completed-Verified' AND mo.mo_type IN ('Employee','New Hire') AND mo.project_id="
                        + literal(context, project_id) + ")";

        final String sqlUpdateJacks2 =
                " UPDATE jk SET "
                        + " em_id=(SELECT mo.em_id FROM mo where jk.jk_id=mo.to_jk_id_data and mo.project_id="
                        + literal(context, project_id)
                        + " and mo.em_id IN (SELECT em_id from em)) "
                        + " WHERE jk_id IN (SELECT to_jk_id_data FROM mo WHERE mo.status='Completed-Verified' AND mo.mo_type IN ('Employee','New Hire') AND mo.project_id="
                        + literal(context, project_id) + ")";

        final String sqlUpdateJacks3 =
                " UPDATE jk SET "
                        + " em_id = NULL WHERE em_id in (SELECT mo.em_id FROM mo WHERE mo.status='Completed-Verified' AND mo.mo_type='Leaving' AND mo.project_id="
                        + literal(context, project_id)
                        + " AND mo.em_id IN (SELECT em_id from em)) ";

        /*
         * For "Employee" and "Room" moves, we update the moves' equipments and tagged furniture
         */
        String sqlEq = "";
        String sqlTa = "";

        if (!SqlUtils.isOracle()) {
            sqlEq =
                    "UPDATE eq"
                            + " SET bl_id=mo.to_bl_id,fl_id=mo.to_fl_id,rm_id=mo.to_rm_id"
                            + " FROM mo,mo_eq"
                            + " WHERE eq.eq_id=mo_eq.eq_id AND mo_eq.mo_id=mo.mo_id"
                            + " AND mo.project_id="
                            + literal(context, project_id)
                            + " AND mo.status='Completed-Verified' AND mo.mo_type IN ('Employee','Room')";
            sqlTa =
                    "UPDATE ta"
                            + " SET bl_id=mo.to_bl_id,fl_id=mo.to_fl_id,rm_id=mo.to_rm_id"
                            + " FROM mo,mo_ta"
                            + " WHERE ta.ta_id=mo_ta.ta_id AND mo_ta.mo_id=mo.mo_id"
                            + " AND mo.project_id="
                            + literal(context, project_id)
                            + " AND mo.status='Completed-Verified' AND mo.mo_type IN ('Employee','Room')";
        }
        if (SqlUtils.isOracle()) {
            sqlEq =
                    "UPDATE eq"
                            + " SET (bl_id, fl_id, rm_id) = (SELECT mo.to_bl_id, mo.to_fl_id, mo.to_rm_id FROM mo,mo_eq"
                            + " WHERE eq.eq_id=mo_eq.eq_id AND mo_eq.mo_id=mo.mo_id AND mo.project_id="
                            + literal(context, project_id)
                            + " AND mo.status='Completed-Verified' AND mo.mo_type IN ('Employee','Room')) WHERE eq.eq_id = (SELECT mo_eq.eq_id FROM mo,mo_eq"
                            + " WHERE eq.eq_id=mo_eq.eq_id AND mo_eq.mo_id=mo.mo_id AND mo.project_id="
                            + literal(context, project_id)
                            + " AND mo.status='Completed-Verified' AND mo.mo_type IN ('Employee','Room'))";

            sqlTa =
                    "UPDATE ta"
                            + " SET (bl_id, fl_id, rm_id) = (SELECT mo.to_bl_id, mo.to_fl_id, mo.to_rm_id FROM mo,mo_ta"
                            + " WHERE ta.ta_id=mo_ta.ta_id AND mo_ta.mo_id=mo.mo_id AND mo.project_id="
                            + literal(context, project_id)
                            + " AND mo.status='Completed-Verified' AND mo.mo_type IN ('Employee','Room')) WHERE ta.ta_id = (SELECT mo_ta.ta_id FROM mo,mo_ta"
                            + " WHERE ta.ta_id=mo_ta.ta_id AND mo_ta.mo_id=mo.mo_id AND mo.project_id="
                            + literal(context, project_id)
                            + " AND mo.status='Completed-Verified' AND mo.mo_type IN ('Employee','Room'))";
        }
        sqlCommands.clear();
        sqlCommands.add(sqlUpdate);
        sqlCommands.add(sqlUpdateEq);
        sqlCommands.add(sqlUpdateJacks1);
        sqlCommands.add(sqlUpdateJacks2);
        sqlCommands.add(sqlUpdateJacks3);
        sqlCommands.add(sqlEq);
        sqlCommands.add(sqlTa);

        executeDbSqlCommands(context, sqlCommands, this.throwException);

        /*
         * UPDATE project set status='Closed', date_closed=CURRENT where project_id='xxx' UPDATE mo
         * set status='Closed', date_closed=CURRENT where project_id='xxx' UPDATE activity_log set
         * status='Closed', date_closed=CURRENT where project_id='xxx' NOTE: John will add a
         * date_closed to the activity_log table
         */
        // java.sql.Date t = Utility.currentDate();
        // the last two SQlCommand should have throwException as false ???

        // 11/4/13 CK Added move cost calculation - sqlUpdateMoCosts - on the completion of a group
        // move.
        // Assumes that the user will enter costs using the project's actual cost field.
        // Divides the project's actual cost equally across all moves that are part of this project.

        final String sqlUpdateProject =
                "UPDATE project set status='Closed', date_closed=" + getCurrentDate(context)
                + " where project_id=" + literal(context, project_id);
        final String sqlUpdateMo =
                "UPDATE mo set status='Closed', date_closed=" + getCurrentDate(context)
                + " WHERE project_id=" + literal(context, project_id);

        final String sqlUpdateMoCosts =
                "UPDATE mo SET cost_actual= (SELECT project.cost_paid FROM project WHERE mo.project_id = project.project_id) / (select count(*) FROM mo mo_int WHERE mo.project_id= mo_int.project_id)"
                        + " WHERE (select count(*) FROM mo mo_int WHERE mo.project_id= mo_int.project_id) > 0 AND mo.project_id="
                        + literal(context, project_id);
        final String sqlUpdateActLog =
                "UPDATE activity_log set status='CLOSED', date_closed=" + getCurrentDate(context)
                + " where project_id=" + literal(context, project_id);
        sqlCommands.add(sqlUpdateProject);
        sqlCommands.add(sqlUpdateMo);
        sqlCommands.add(sqlUpdateMoCosts);
        sqlCommands.add(sqlUpdateActLog);
        executeDbSqlCommands(context, sqlCommands, this.throwException);

        // //////////////////////////////////////////////////////////////////////////////////////////////////////
        // Send email notifications
        // /////////////////////////////////////////////////////////////////////////////////////////////////////
        // Emails will get sent to the Requestor and the Department Contact.

        final MoveNotifications moveNotifications = new MoveNotifications(context);
        moveNotifications.setGroupMove(true);
        moveNotifications.setProjectId(project_id);

        final String requestorEmail =
                getEmailAddress(context, getRequestor(context, "", project_id));
        moveNotifications.sendEmailToRecipient("CLOSE", "INFORM", requestorEmail);

        final String deptContactEmail =
                getEmailAddress(context, getDepartmentContact(context, "", project_id));
        moveNotifications.sendEmailToRecipient("CLOSE", "INFORM", deptContactEmail);
        final String projectManagerEmail =
                getEmailAddress(context, getProjectManager(context, project_id));
        moveNotifications.sendEmailToRecipient("CLOSE", "INFORM", projectManagerEmail);

        final String useWorkspaceTransactions =
                ContextStore.get().getProject().getActivityParameterManager()
                    .getParameterValue("AbSpaceRoomInventoryBAR-UseWorkspaceTransactions");

        // Activity parameter CaptureSpaceHistory
        final String captureSpaceHistory =
                ContextStore.get().getProject().getActivityParameterManager()
                .getParameterValue("AbSpaceRoomInventoryBAR-CaptureSpaceHistory");
        if (useWorkspaceTransactions.equals("1") || captureSpaceHistory.equals("1")) {
            // update associatecd space transaction service request status
            updateAssociatedServiceRequestStatus("project", project_id);
            // update associatecd rmpct records
            updateAssociatedRmpct("project", project_id, true);
        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void completeSelectedMoves(final String mo_id_list) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        // final String mo_id_list = (String) context.getParameter("mo_id_list");

        final String formatted_id_list =
                removeQuotes(formatSqlFieldValue(context, mo_id_list, "java.lang.String",
                        "mo_id_list"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id_list=[" + mo_id_list + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("completeSelectedMoves");
        }

        executeDbSql(context, "UPDATE mo SET status='Completed-Verified' WHERE mo.mo_id IN  ("
                + formatted_id_list + ")", this.throwException);

        // update associatecd space transaction service request status
        final String[] moIdArray = formatted_id_list.split(",");
        for (final String element : moIdArray) {
            updateAssociatedServiceRequestStatus("mo", element);
        }

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void completeSelectedActions(final String activity_log_id_list) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        // final String activity_log_id_list = (String)
        // context.getParameter("activity_log_id_list");

        final String formatted_id_list =
                removeQuotes(formatSqlFieldValue(context, activity_log_id_list, "java.lang.String",
                        "activity_log_id_list"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("activity_log_id=[" + activity_log_id_list + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("completeSelectedActions");
        }

        executeDbSql(context,
            "UPDATE activity_log set status='COMPLETED-V' WHERE activity_log_id IN  ("
                    + formatted_id_list + ")", this.throwException);

    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void tagEditMultipleMoves(final EventHandlerContext context) {

        final JSONObject json = context.getJSONObject("fields");
        final String mo_id_list = json.getString("mo_id_list");
        final String project_id = json.getString("mo.project_id");
        final String em_em_id = (String) context.getParameter("em_em_id");

        final String formatted_id_list =
                removeQuotes(formatSqlFieldValue(context, mo_id_list, "java.lang.String",
                        "mo_id_list"));

        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id_list=[" + mo_id_list + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("tagEditMultipleMoves");
        }

        executeDbSql(context,
            "UPDATE mo SET option2 = NULL WHERE option2 = " + literal(context, em_em_id)
            + " AND mo.project_id = " + literal(context, project_id), this.throwException);

        executeDbSql(context, "UPDATE mo SET option2 = " + literal(context, em_em_id)
            + " WHERE mo.mo_id IN  (" + formatted_id_list + ")", this.throwException);

        // make sure we commit for Oracle
        executeDbCommit(context);
    }

    // ///////////////////////////////////////////////////////////////////////////////////////////////
    // ////////////////////////////// ACTIONS
    // ////////////////////////////////////////////////////////
    // ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void addActionIndividualMove(final DataRecord record) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String description = record.getString("activity_log.description");
        final String activity_type = record.getString("activity_log.activity_type");
        final String requestor = record.getString("activity_log.requestor");
        final String mo_id = String.valueOf(record.getInt("activity_log.mo_id"));

        final String moTable = "mo";
        final String[] moFields = { "mo_id", "from_dp_id", "from_dv_id", "ac_id" };
        final DataSource dsMo = DataSourceFactory.createDataSourceForFields(moTable, moFields);
        dsMo.addRestriction(Restrictions.eq("mo", "mo_id", mo_id));
        final DataRecord moRec = dsMo.getRecord();
        final String dp_id = moRec.getString("mo.from_dp_id");
        final String dv_id = moRec.getString("mo.from_dv_id");
        final String ac_id = moRec.getString("mo.ac_id");
        /*
         * Add an action to an individual move. Inserts a new activity_log record with the data for
         * the Action. INSERT INTO activity_log
         * (mo_id,description,tr_id,assigned_to,status,activity_type,date_created,
         * prob_type,autocreate_wr) VALUES
         * (MO_ID,DESCRIPTION,TR_ID,ASSIGNED_TO,'Requested',ACTIVITY_TYPE,CURRENT DATE,
         * PROB_TYPE,AUTOCREATE_WR) Note: Building Code, Site Code
         */
        if (this.log.isDebugEnabled()) {
            this.log.debug("mo_id=[" + mo_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("addActionIndividualMove");
        }

        if (validActivityType(context, activity_type)) {

            // "(SELECT autocreate_wr FROM activitytype WHERE activity_type = " + literal(context,
            // activity_type) + "))"
            final Integer autocreate_wr =
                    (Integer) selectDbValue(context, "activitytype", "autocreate_wr",
                        "activity_type = " + literal(context, activity_type));

            final String sqlInsert =
                    " INSERT INTO activity_log (mo_id,description,status,activity_type,date_requested,autocreate_wr,date_scheduled, requestor, dp_id, dv_id, ac_id) "
                            + "VALUES "
                            + "("
                            + mo_id
                            + ","
                            + literal(context, description)
                            + ","
                            + "'REQUESTED',"
                            + literal(context, activity_type)
                            + ","
                            + getCurrentDate(context)
                            + ","
                            + autocreate_wr.toString()
                            + ",null, '"
                            + requestor
                            + "', "
                            + literal(context, dp_id)
                            + ","
                            + literal(context, dv_id) + "," + literal(context, ac_id) + ")";
            try {
                SqlUtils.executeUpdate("activity_log", sqlInsert);

                // make sure we commit for Oracle
                executeDbCommit(context);

                addLastPrimaryKeyValueToResponse(context, "activity_log", "activity_log_id",
                    "mo_id = " + mo_id);
            } catch (final ExceptionBase origException) {
                throw origException;
            }
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgActivityTypeInvalid);
            exception.setTranslatable(true);

            final Object[] args = { activity_type };
            exception.setArgs(args);
            throw exception;
        }
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     */
    public void addActionGroupMove(final DataRecord record) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String project_id = record.getString("activity_log.project_id");
        final String description = record.getString("activity_log.description");
        final String activity_type = record.getString("activity_log.activity_type");
        final String requestor = record.getString("activity_log.requestor");

        final String projectTable = "project";
        final String[] projectFields = { "project_id", "dp_id", "dv_id", "ac_id" };
        final DataSource dsProject =
                DataSourceFactory.createDataSourceForFields(projectTable, projectFields);
        dsProject.addRestriction(Restrictions.eq("project", "project_id", project_id));
        final DataRecord projectRec = dsProject.getRecord();
        final String dp_id = projectRec.getString("project.dp_id");
        final String dv_id = projectRec.getString("project.dv_id");
        final String ac_id = projectRec.getString("project.ac_id");

        /*
         * INSERT INTO activity_log (project_id,description,tr_id,assigned_to,status,
         * activity_type,date_created,prob_type,autocreate_wr, requestor) VALUES
         * (PROJECT_ID,DESCRIPTION,TR_ID,ASSIGNED_TO,'Requested',ACTIVITY_TYPE,CURRENT DATE,
         * PROB_TYPE,AUTOCREATE_WR, REQUESTOR) Note: Building Code, Site Code
         */
        if (this.log.isDebugEnabled()) {
            this.log.debug("project_id=[" + project_id + "]");
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("addActionGroupMove");
        }

        if (validActivityType(context, activity_type)) {

            final Integer autocreate_wr =
                    (Integer) selectDbValue(context, "activitytype", "autocreate_wr",
                        "activity_type = " + literal(context, activity_type));

            final String sqlInsert =
                    " INSERT INTO activity_log (project_id,description,status,activity_type,date_requested,autocreate_wr,date_scheduled, requestor, dp_id, dv_id, ac_id) "
                            + "VALUES "
                            + "("
                            + literal(context, project_id)
                            + ","
                            + literal(context, description)
                            + ",'REQUESTED'"
                            + ","
                            + literal(context, activity_type)
                            + ","
                            + getCurrentDate(context)
                            + ","
                            + autocreate_wr.toString()
                            + ",null, '"
                            + requestor
                            + "', "
                            + literal(context, dp_id)
                            + ","
                            + literal(context, dv_id)
                            + ","
                            + literal(context, ac_id) + ")";
            try {
                executeDbSql(context, sqlInsert, this.throwException);

                // make sure we commit for Oracle
                executeDbCommit(context);

                addLastPrimaryKeyValueToResponse(context, "activity_log", "activity_log_id",
                    "project_id = " + literal(context, project_id));
            } catch (final ExceptionBase origException) {
                throw origException;
            }
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgActivityTypeInvalid);
            exception.setTranslatable(true);

            final Object[] args = { activity_type };
            exception.setArgs(args);
            throw exception;
        }
    }

    /**
     * return true if an field exists in the JSONObejct and it not is empty
     *
     * @param JSONArray elements
     * @param String field
     * @return boolean
     */
    protected static boolean propertyExistsNotNull(final JSONObject json, final String field) {
        return ((json.has(field)) && (!json.getString(field).equals("")));
    }

    /**
     * Retrieve the mo_id value of the record most recently added by the current user
     *
     * @param context
     * @param tableName
     * @param primaryKeyName
     * @param restriction
     * @return the primary key
     */
    protected Double getLastPrimaryKeyValue(final EventHandlerContext context,
            final String tableName, final String primaryKeyName, final String restriction) {

        return retrieveStatistic(context, null, "SELECT max(" + primaryKeyName + ") FROM "
                + tableName + " WHERE " + restriction, tableName, null);
    }

    /**
     * Retrieve the mo_id value of the record most recently added by the current user and add it to
     * the WFR response in the JSON format expected by the edit form command.
     *
     * @param context
     */
    void addLastPrimaryKeyValueToResponse(final EventHandlerContext context,
            final String tableName, final String primaryKeyName, final String restriction) {

        final JSONObject primaryKeyRecord = new JSONObject();
        final Double lastPrimaryKeyValue =
                getLastPrimaryKeyValue(context, tableName, primaryKeyName, restriction);
        primaryKeyRecord.put(tableName + "." + primaryKeyName, "" + lastPrimaryKeyValue.intValue());

        final JSONObject data = new JSONObject();
        // result structure is different in view version 1 vs. 2.0
        if (getViewFormatVersion(context) == 1) {
            final JSONArray primaryKeyRecords = new JSONArray();
            primaryKeyRecords.put(primaryKeyRecord);
            data.put("records", primaryKeyRecords);
        } else {
            data.put("record", primaryKeyRecord);
        }

        context.addResponseParameter("jsonExpression", data.toString());
    }

    /**
     * Add the primary key value to the WFR response in the JSON format expected by the edit form
     * command.
     *
     * @param context
     * @param primaryKeyValue
     * @param tableName
     * @param primaryKeyName
     */
    void addPrimaryKeyValueToResponse(final EventHandlerContext context,
            final Double primaryKeyValue, final String tableName, final String primaryKeyName) {

        final JSONObject primaryKeyRecord = new JSONObject();
        primaryKeyRecord.put(tableName + "." + primaryKeyName, "" + primaryKeyValue.intValue());

        final JSONObject data = new JSONObject();
        // result structure is different in view version 1 vs. 2.0
        if (getViewFormatVersion(context) == 1) {
            final JSONArray primaryKeyRecords = new JSONArray();
            primaryKeyRecords.put(primaryKeyRecord);
            data.put("records", primaryKeyRecords);
        } else {
            data.put("record", primaryKeyRecord);
        }

        context.addResponseParameter("jsonExpression", data.toString());
    }

    /**
     * Insert assements after adding a move of an employee or a room
     *
     * @param context Description of the Parameter
     * @throws ParseException
     */
    public void addEmAssetsMove(final List<String> primaryKeys, final String em_id,
            final String mo_id, final String table, final String assetsFor) throws ParseException {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String sql_em_id = assetsFor.equals("employee") ? ("em_id,") : "";
        final String insert_value_em_id = assetsFor.equals("employee") ? ("'" + em_id + "',") : "";

        final String std_table = table.equals("eq") ? "eqstd" : "fnstd";
        final String field_std = table.equals("eq") ? "eq" : "fn";

        final String selectFromBlId =
                "(CASE WHEN " + table + ".bl_id IS NOT NULL THEN " + table
                + ".bl_id ELSE (select from_bl_id from mo where mo_id = '" + mo_id
                + "') END)";
        final String selectFromFlId =
                "(CASE WHEN " + table + ".bl_id IS NOT NULL THEN " + table
                + ".fl_id ELSE (select from_fl_id from mo where mo_id = '" + mo_id
                + "') END)";
        final String selectFromRmId =
                "(CASE WHEN " + table + ".bl_id IS NOT NULL THEN " + table
                + ".rm_id ELSE (select from_rm_id from mo where mo_id = '" + mo_id
                + "') END)";

        for (int i = 0; i < primaryKeys.size(); i++) {

            final StringBuilder sqlStatment = new StringBuilder();
            sqlStatment.append("INSERT INTO mo_" + table + " (" + table + "_id," + field_std
                + "_std,mo_id," + sql_em_id + "from_bl_id,from_fl_id,from_rm_id,cost_moving)");
            sqlStatment.append(" (SELECT  " + table + "_id, " + field_std + "_std,");
            sqlStatment.append(mo_id + ",");
            sqlStatment.append(insert_value_em_id);
            sqlStatment.append((assetsFor.equals("employee") ? selectFromBlId : "bl_id") + ",");
            sqlStatment.append((assetsFor.equals("employee") ? selectFromFlId : "fl_id") + ",");
            sqlStatment.append((assetsFor.equals("employee") ? selectFromRmId : "rm_id") + ",");
            final String costMovingSelect =
                    "(select cost_moving from " + std_table + " where " + table + "." + field_std
                    + "_std = " + std_table + "." + field_std + "_std) ";
            sqlStatment.append(formatSqlIsNull(context, costMovingSelect + ",0 "));

            if (assetsFor.equals("employee")) {
                sqlStatment.append("from " + table + " where em_id='" + em_id + "' and " + table
                    + "_id = '" + primaryKeys.get(i) + "')");
            } else if (assetsFor.equals("room")) {
                sqlStatment.append("from " + table + " where bl_id = " + selectFromBlId
                    + " and fl_id = " + selectFromFlId + " and rm_id = " + selectFromRmId
                    + " and " + table + "_id = '" + primaryKeys.get(i) + "')");
            }
            executeDbSql(context, sqlStatment.toString(), this.throwException);
            // make sure we commit for Oracle
            executeDbCommit(context);

        }
    }

    // Moves Scenario methods
    /**
     * insert new move scenario
     *
     */
    public void createMoveScenario(final DataRecord record, final boolean isDefault)
            throws ExceptionBase {
        String scenarioId = record.getString("mo_scenario.scenario_id");
        final String projectId = record.getString("mo_scenario.project_id");
        if (isDefault && getScenarioNo(projectId) == 0) {
            scenarioId = "Scenario 1";
            record.setValue("mo_scenario.scenario_id", scenarioId);
            record.setValue("mo_scenario.description", scenarioId);
            try {
                scenarioId = insertMoveScenario(record);
            } catch (final ExceptionBase e) {
                throw e;
            }
            insertMoveScenarioEm(scenarioId, projectId);
        } else if (!isDefault) {
            try {
                scenarioId = insertMoveScenario(record);
            } catch (final ExceptionBase e) {
                throw e;
            }
            insertMoveScenarioEm(scenarioId, projectId);
        }
    }

    /**
     * Copy selected scenario
     *
     * @param record
     * @param origScenarioId
     */
    public void copyMoveScenario(final DataRecord record, final String origScenarioId)
            throws ExceptionBase {
        String scenarioId = record.getString("mo_scenario.scenario_id");
        final String projectId = record.getString("mo_scenario.project_id");
        try {
            scenarioId = insertMoveScenario(record);
        } catch (final ExceptionBase e) {
            throw e;
        }
        String sqlStatement;
        sqlStatement =
                "INSERT INTO mo_scenario_em (project_id, scenario_id, em_id,to_rm_id,to_fl_id,to_bl_id,date_start,date_end)"
                        + "SELECT project_id, '"
                        + scenarioId
                        + "', em_id,to_rm_id,to_fl_id,to_bl_id,date_start,date_end FROM mo_scenario_em WHERE mo_scenario_em.scenario_id = '"
                        + origScenarioId + "' AND mo_scenario_em.project_id = '" + projectId + "'";
        SqlUtils.executeUpdate("mo_scenario_em", sqlStatement);
    }

    /**
     * delete selected move scenario
     *
     * @param scenarioId
     * @param projectId
     */
    public void deleteMoveScenario(final String scenarioId, final String projectId) {
        String sqlStatment;
        sqlStatment =
                "DELETE FROM mo_scenario_em WHERE mo_scenario_em.scenario_id = '" + scenarioId
                + "' AND mo_scenario_em.project_id = '" + projectId + "'";
        SqlUtils.executeUpdate("mo_scenario_em", sqlStatment);

        sqlStatment =
                "DELETE FROM mo_scenario WHERE mo_scenario.scenario_id = '" + scenarioId
                + "' AND mo_scenario.project_id = '" + projectId + "'";
        SqlUtils.executeUpdate("mo_scenario", sqlStatment);

    }

    /**
     * update move project with data from selected scenario
     *
     * @param projectId
     * @param scenarioId
     */
    public void updateMoveProject(final String projectId, final String scenarioId) {
        String sqlStatement;
        // sqlStatement =
        // "UPDATE mo SET mo.to_bl_id = mo_scenario_em.to_bl_id, mo.to_fl_id =
        // mo_scenario_em.to_fl_id, "
        // +
        // "mo.to_rm_id=mo_scenario_em.to_rm_id FROM mo_scenario_em WHERE
        // mo.project_id=mo_scenario_em.project_id "
        // +
        // "AND mo.em_id = mo_scenario_em.em_id AND mo_scenario_em.to_bl_id IS NOT NULL AND
        // mo_scenario_em.to_fl_id IS NOT NULL AND mo_scenario_em.to_rm_id IS NOT NULL AND "
        // +
        // "( mo.to_bl_id IS NULL OR mo.to_fl_id IS NULL OR mo.to_rm_id IS NULL OR mo.to_bl_id <>
        // mo_scenario_em.to_bl_id OR mo.to_fl_id <> mo_scenario_em.to_fl_id OR mo.to_rm_id <>
        // mo_scenario_em.to_rm_id )"
        // + " AND mo_scenario_em.scenario_id='"
        // + scenarioId
        // + "' and mo_scenario_em.project_id='" + projectId + "'";

        if (!SqlUtils.isOracle()) {
            sqlStatement =
                    "UPDATE mo SET mo.to_bl_id = mo_scenario_em.to_bl_id, mo.to_fl_id = mo_scenario_em.to_fl_id, "
                            + " mo.to_rm_id=mo_scenario_em.to_rm_id FROM mo_scenario_em WHERE mo.project_id=mo_scenario_em.project_id "
                            + " AND mo.em_id = mo_scenario_em.em_id "
                            + " AND  mo_scenario_em.scenario_id='" + scenarioId
                            + "' AND mo_scenario_em.project_id='" + projectId + "'";
        } else {
            sqlStatement =
                    "UPDATE mo SET (mo.to_bl_id, mo.to_fl_id, mo.to_rm_id) = "
                            + "(SELECT mo_scenario_em.to_bl_id, mo_scenario_em.to_fl_id, mo_scenario_em.to_rm_id"
                            + " FROM mo_scenario_em WHERE mo.project_id=mo_scenario_em.project_id"
                            + " AND mo.em_id = mo_scenario_em.em_id "
                            + " AND  mo_scenario_em.scenario_id='"
                            + scenarioId
                            + "' AND mo_scenario_em.project_id='"
                            + projectId
                            + "')"
                            + " WHERE mo.project_id='"
                            + projectId
                            + "'"
                            + " AND mo.em_id IN (SELECT em_id FROM mo_scenario_em WHERE project_id='"
                            + projectId + "'" + " AND scenario_id='" + scenarioId + "')";
        }
        SqlUtils.executeUpdate("mo", sqlStatement);
    }

    /**
     * update changes to selected move scenario first all settings are reseted to default and after
     * this new changes are saved
     *
     * @param projectId
     * @param scenarioId
     * @param records
     */
    public void updateMoveScenario(final String projectId, final String scenarioId,
            final List<Map<String, Object>> records) {
        // String table = "mo_scenario_em";
        // String[] fields = { "project_id", "scenario_id", "em_id", "to_bl_id", "to_fl_id",
        // "to_rm_id" };
        // DataSource ds = DataSourceFactory.createDataSourceForFields(table, fields);
        // // first we reset all asignment for selected scenario
        // String sqlStatement;
        // sqlStatement =
        // "UPDATE mo_scenario_em SET to_bl_id = NULL, to_fl_id = NULL, to_rm_id = NULL "
        // + "WHERE project_id = '" + projectId + "' AND scenario_id = '" + scenarioId + "'";
        // SqlUtils.executeUpdate("mo_scenario_em", sqlStatement);
        //
        // for (Map<String, Object> record : records) {
        // boolean isNew = false;
        // JSONObject values = (JSONObject) record.get("values");
        // JSONObject oldValues = (JSONObject) record.get("oldValues");
        // DataRecord pkRecord = ds.createRecord();
        // pkRecord.fromJSON(values, oldValues, isNew);
        // pkRecord.setOldValue("mo_scenario_em.to_bl_id", "");
        // pkRecord.setOldValue("mo_scenario_em.to_fl_id", "");
        // pkRecord.setOldValue("mo_scenario_em.to_rm_id", "");
        // ds.saveRecord(pkRecord);
        // }
        synchronizeScenario(projectId, scenarioId);
    }

    /**
     * Synchronize scenario with project delete records that no longer exist in project insert
     * records from project that not exists in scenario
     *
     * @param projectId
     * @param scenarioId
     */
    public void synchronizeScenario(final String projectId, final String scenarioId) {
        String sqlStatementDelete;
        String sqlStatementInsert;
        sqlStatementDelete =
                "DELETE FROM mo_scenario_em WHERE "
                        + "mo_scenario_em.em_id NOT IN (SELECT mo.em_id FROM mo WHERE mo.mo_type = 'Employee' AND mo.project_id = '"
                        + projectId + "')" + "AND mo_scenario_em.project_id = '" + projectId
                        + "' AND mo_scenario_em.scenario_id = '" + scenarioId + "'";
        sqlStatementInsert =
                "INSERT INTO mo_scenario_em (project_id, scenario_id, em_id) SELECT DISTINCT mo.project_id, '"
                        + scenarioId
                        + "', mo.em_id FROM mo, em WHERE mo.project_id ='"
                        + projectId
                        + "' AND mo.mo_type = 'Employee' AND mo.em_id = em.em_id "
                        + "AND mo.em_id NOT IN (SELECT mo_scenario_em.em_id FROM mo_scenario_em WHERE mo_scenario_em.project_id = '"
                        + projectId + "' AND mo_scenario_em.scenario_id = '" + scenarioId + "')";
        SqlUtils.executeUpdate("mo_scenario_em", sqlStatementDelete);
        SqlUtils.executeUpdate("mo_scenario_em", sqlStatementInsert);
    }

    /**
     * Add new move scenario
     *
     * @param record
     * @return
     */
    private String insertMoveScenario(DataRecord record) throws ExceptionBase {
        final String table = "mo_scenario";

        /*
         * check the existence of the scenario to insert, for displaying - if it's the case - of a
         * personalized error message
         */
        final String[] fieldsExistentScenario = { "project_id", "scenario_id" };
        final DataSource dsExistent =
                DataSourceFactory.createDataSourceForFields(table, fieldsExistentScenario);
        dsExistent.addRestriction(new Restrictions.Restriction.Clause(table, "project_id", record
            .getValue(table + ".project_id"), Restrictions.OP_EQUALS));
        dsExistent.addRestriction(new Restrictions.Restriction.Clause(table, "scenario_id", record
            .getValue(table + ".scenario_id"), Restrictions.OP_EQUALS));
        final DataRecord existentScenario = dsExistent.getRecord();
        if (existentScenario != null) {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgScenarioExist);
            exception.setTranslatable(true);
            final Object[] args =
                { record.getValue(table + ".scenario_id"),
                    record.getValue(table + ".project_id") };
            exception.setArgs(args);
            throw exception;
        }

        final String[] fields =
            { "project_id", "scenario_id", "planner", "description", "comments", "date_created" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields(table, fields);
        final Date now = new Date();
        record.setValue("mo_scenario.date_created", now);
        record = ds.saveRecord(record);
        return record.getString("mo_scenario.scenario_id");
    }

    /**
     * Add empoyees from move project to move scenario
     *
     * @param scenarioId
     * @param projectId
     */
    private void insertMoveScenarioEm(final String scenarioId, final String projectId) {
        final StringBuilder sqlStatment = new StringBuilder();
        sqlStatment
        .append("INSERT INTO mo_scenario_em (project_id, scenario_id, em_id, to_bl_id, to_fl_id, to_rm_id)");
        sqlStatment
        .append("SELECT DISTINCT mo.project_id, '"
                + scenarioId
                + "', mo.em_id, mo.to_bl_id, mo.to_fl_id, mo.to_rm_id FROM mo, em WHERE mo.project_id ='"
                + projectId + "' AND mo.mo_type = 'Employee' AND mo.em_id = em.em_id ");
        SqlUtils.executeUpdate("mo_scenario_em", sqlStatment.toString());
    }

    private int getScenarioNo(final String projectId) {
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("mo_scenario");
        ds.addVirtualField("mo_scenario", "scenario_no", DataSource.DATA_TYPE_NUMBER);
        ds.addQuery(
            "SELECT count(mo_scenario.scenario_id) scenario_no  FROM mo_scenario WHERE mo_scenario.project_id = '"
                    + projectId + "'", SqlExpressions.DIALECT_GENERIC);
        final DataRecord record = ds.getRecord();
        return (int) (record.getDouble("mo_scenario.scenario_no"));
    }

    /**
     * calculate historical employee headcount implemented as job that run on first day of the month
     */
    public void calculateHistoricalEmployeeHeadcount() {
        final Calendar now = Calendar.getInstance();
        now.setTime(new Date());
        final int month = now.get(Calendar.MONTH) + 1;
        final int year = now.get(Calendar.YEAR);

        /*
         * 07/03/2010 IOAN Kb 3026371 check if data already exists for current month and exit is
         * data exist
         */

        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("hist_em_count");
        ds.addField("year");
        ds.addField("month");
        ds.addRestriction(Restrictions.and(
            Restrictions.eq("hist_em_count", "year", String.valueOf(year)),
            Restrictions.eq("hist_em_count", "month", String.valueOf(month))));
        final List recs = ds.getRecords();
        if (!recs.isEmpty()) {
            return;
        }

        final String sqlStatement1 =
                "INSERT INTO hist_em_count (bl_id,dv_id,dp_id,year,month,count_em)"
                        + "(SELECT bl_id,dv_id,dp_id,"
                        + year
                        + ","
                        + month
                        + ",count(*) "
                        + "FROM em WHERE bl_id IS NOT NULL AND dv_id IS NOT NULL AND dp_id IS NOT NULL "
                        + "GROUP by bl_id,dv_id,dp_id)";

        final String sqlStatement2 =
                "INSERT INTO hist_em_count (bl_id,dv_id,dp_id,year,month,count_em) "
                        + "(SELECT 'None',dv_id,dp_id,"
                        + year
                        + ","
                        + month
                        + ",count(*) "
                        + "FROM em WHERE bl_id IS NULL AND dv_id IS NOT NULL AND dp_id IS NOT NULL "
                        + "GROUP by dv_id,dp_id)";

        final String sqlStatement3 =
                "INSERT INTO hist_em_count (bl_id,dv_id,dp_id,year,month,count_em) "
                        + "(SELECT bl_id,dv_id,'None', "
                        + year
                        + ","
                        + month
                        + ",count(*) "
                        + "FROM em WHERE bl_id IS NOT NULL AND dv_id IS NOT NULL AND dp_id IS NULL "
                        + "GROUP by bl_id,dv_id)";

        final String sqlStatement4 =
                "INSERT INTO hist_em_count (bl_id,dv_id,dp_id,year,month,count_em) "
                        + "(SELECT bl_id,'None','None', " + year + "," + month + ",count(*) "
                        + "FROM em WHERE bl_id IS NOT NULL AND dv_id IS NULL AND dp_id IS NULL "
                        + "GROUP by bl_id)";

        SqlUtils.executeUpdate("hist_em_count", sqlStatement1.toString());
        SqlUtils.executeUpdate("hist_em_count", sqlStatement2.toString());
        SqlUtils.executeUpdate("hist_em_count", sqlStatement3.toString());
        SqlUtils.executeUpdate("hist_em_count", sqlStatement4.toString());
        SqlUtils.commit();
    }

    /**
     * create paginated report
     *
     * @param rptType
     * @param projectId
     * @param selectedId
     */
    public void onPaginatedReport(final String rptType, final String projectId,
            final String selectedId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final MovePaginatedReportGenerator moPaginatedReportGenerator =
                new MovePaginatedReportGenerator(rptType, projectId, selectedId);
        startJob(context, moPaginatedReportGenerator);

    }

    /**
     * start a job and return status as result
     *
     * @param context
     * @param job
     */
    private void startJob(final EventHandlerContext context, final Job job) {
        final JobManager.ThreadSafe jobManager = getJobManager(context);
        final String jobId = jobManager.startJob(job);

        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);

        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());

        context.addResponseParameter("jsonExpression", result.toString());
    }

    /*
     * ***************************************************************************
     * ********************* SERVICE REQUEST **********************************
     * ***************************************************************************
     */

    /**
     * create service request for issued single move and group move
     *
     * @param moId
     * @param projectId
     */
    private void createServiceRequest(final String moId, final String projectId) {
        // generate service request for current issued move
        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("activity_log");
        ds.addField("activity_log", "activity_log_id");
        ds.addField("activity_log", "mo_id");
        ds.addField("activity_log", "project_id");
        ds.addField("activity_log", "prob_type");
        ds.addField("activity_log", "autocreate_wr");
        // read all records
        ds.setContext();
        ds.setMaxRecords(0);
        Clause idClause = null;
        if (StringUtil.notNullOrEmpty(projectId)) {
            idClause = Restrictions.eq("activity_log", "project_id", projectId);
        } else if (StringUtil.notNullOrEmpty(moId)) {
            idClause = Restrictions.eq("activity_log", "mo_id", moId);
        }

        ds.addRestriction(Restrictions.and(idClause,
            Restrictions.isNotNull("activity_log", "prob_type"),
            Restrictions.eq("activity_log", "autocreate_wr", "1")));
        final List records = ds.getRecords();
        for (final Iterator it_rec = records.iterator(); it_rec.hasNext();) {
            final DataRecord crtRecord = (DataRecord) it_rec.next();
            final Integer activityLogId = crtRecord.getInt("activity_log.activity_log_id");
            genWorkRequest(activityLogId.toString(), projectId, moId);
        }
    }

    /**
     * Create work request for move actions that are issued (status in 'Issued-In
     * Process','Issued-On Hold')
     *
     * @param activityLogId - id of action record from activity_log table
     * @param projectId - move project id, used for group moves
     * @param moId - move id, used for single move
     */
    public void genWorkRequest(final String activityLogId, final String projectId, final String moId)
            throws ExceptionBase {

        // check the status for move or project when the WFR is called from edit action view
        String table = "";
        final String[] fields = { "status" };
        String id = "";
        String id_field = "";

        if (StringUtil.notNullOrEmpty(projectId) && !projectId.equals("null")) {
            table = "project";
            id = projectId;
            id_field = "project_id";
        } else if (StringUtil.notNullOrEmpty(moId) && !moId.equals("null")) {
            table = "mo";
            id = moId;
            id_field = "mo_id";
        }

        final DataSource statusDs = DataSourceFactory.createDataSourceForFields(table, fields);
        statusDs.addRestriction(Restrictions.eq(table, id_field, id));
        final DataRecord statusRec = statusDs.getRecord();

        final String status = (String) statusRec.getValue(table + ".status");
        if (!status.equals("Issued-In Process") && !status.equals("Issued-On Hold")) {
            return;
        }

        // get the originating acivity_log record
        final String wrTable = "activity_log";
        final String[] wrFields =
            { "activity_log_id", "assessment_id", "activity_type", "bl_id", "fl_id", "rm_id",
                "site_id", "prob_type", "date_required", "date_scheduled",
                "cost_estimated", "hours_est_baseline", "description", "dv_id", "dp_id",
                "phone_requestor", "ac_id", "priority", "created_by", "requestor" };
        final DataSource wrDs = DataSourceFactory.createDataSourceForFields(wrTable, wrFields);
        wrDs.addRestriction(Restrictions.eq("activity_log", "activity_log_id", activityLogId));
        final DataRecord origRecord = wrDs.getRecord();
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
        final String[] reqFields = { "em_id", "phone" };
        final DataRecord reqRecord =
                getDataRecord("em", reqFields,
                    Restrictions.eq("em", "em_id", origRecord.getString("activity_log.requestor")));
        final String[] blFields = { "bl_id", "site_id" };
        final DataRecord blRecord =
                getDataRecord("bl", blFields,
                    Restrictions.eq("bl", "bl_id", origRecord.getString("activity_log.bl_id")));
        // create new wr record
        DataRecord wrRecord = wrDs.createNewRecord();
        wrRecord.setValue("activity_log.assessment_id", Integer.valueOf(activityLogId).intValue());
        wrRecord.setValue("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
        wrRecord.setValue("activity_log.bl_id", origRecord.getString("activity_log.bl_id"));
        wrRecord.setValue("activity_log.fl_id", origRecord.getString("activity_log.fl_id"));
        wrRecord.setValue("activity_log.rm_id", origRecord.getString("activity_log.rm_id"));
        if (blRecord != null && blRecord.valueExists("bl.site_id")) {
            wrRecord.setValue("activity_log.site_id", blRecord.getString("bl.site_id"));
        }
        wrRecord.setValue("activity_log.prob_type", origRecord.getString("activity_log.prob_type"));
        wrRecord.setValue("activity_log.date_required",
            origRecord.getDate("activity_log.date_required"));
        wrRecord.setValue("activity_log.date_scheduled",
            origRecord.getDate("activity_log.date_scheduled"));
        wrRecord.setValue("activity_log.cost_estimated",
            origRecord.getDouble("activity_log.cost_estimated"));
        wrRecord.setValue("activity_log.hours_est_baseline",
            origRecord.getInt("activity_log.hours_est_baseline"));
        wrRecord.setValue("activity_log.description",
            origRecord.getString("activity_log.description"));
        wrRecord.setValue("activity_log.dv_id", origRecord.getString("activity_log.dv_id"));
        wrRecord.setValue("activity_log.dp_id", origRecord.getString("activity_log.dp_id"));
        wrRecord.setValue("activity_log.phone_requestor", reqRecord.getString("em.phone"));
        wrRecord.setValue("activity_log.ac_id", origRecord.getString("activity_log.ac_id"));
        wrRecord.setValue("activity_log.priority", (Integer.valueOf("1")).intValue());
        wrRecord.setValue("activity_log.created_by", reqRecord.getString("em.em_id"));
        wrRecord.setValue("activity_log.requestor", reqRecord.getString("em.em_id"));
        // save new wr record
        final DataRecord wrPkRecord = wrDs.saveRecord(wrRecord);
        final int wrId = wrPkRecord.getInt("activity_log.activity_log_id");
        // get the new record from database
        wrDs.clearRestrictions();
        wrDs.addRestriction(Restrictions.eq("activity_log", "activity_log_id", wrId));
        wrRecord = wrDs.getRecord();

        // call submit wr wfr

        final RequestHandler wfrHandler = new RequestHandler();

        final String strWrId = new String().valueOf(wrId);
        final JSONObject jsonRecord = toJSONObject(handleRecordValue(wrRecord));

        try {
            wfrHandler.submitRequest(strWrId, jsonRecord);
        } catch (final ExceptionBase exception) {
            throw exception;
        } catch (final Throwable exception) {
            // @translatable
            final String errorMessage =
                    "Generated Service Request [{0}] cannot be submitted due to system error";

            final ExceptionBase newException = new ExceptionBase(null, exception);
            newException.setPattern(errorMessage);
            newException.setTranslatable(true);
            final Object[] args = { wrId };
            newException.setArgs(args);
            throw newException;
        }

    }

    /**
     * convert record values to hash map
     *
     * @param record
     * @return
     */
    private HashMap handleRecordValue(final DataRecord record) {

        final HashMap result = new HashMap();

        final List fields = record.getFields();
        for (final Iterator it = fields.iterator(); it.hasNext();) {
            final DataValue field = (DataValue) it.next();
            final String key = field.getName();
            final Object value = field.getValue();
            result.put(key, value);
        }
        return result;
    }

    /**
     * return a record for specified table , field and restriction
     *
     * @param table
     * @param fields
     * @param restriction
     * @return
     */
    private DataRecord getDataRecord(final String table, final String[] fields,
            final Clause restriction) {
        // get requestor data
        final DataSource ds = DataSourceFactory.createDataSourceForFields(table, fields);
        ds.addRestriction(restriction);
        return (ds.getRecord());
    }

    /**
     * Returns an xml string with default questionnaire answer values
     *
     * @param q_id Questionnaire ID
     */
    private String getDefaultQuestionnaireValues(final String q_id) {
        String xml = "";

        final DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("questions");
        ds.addField("questionnaire_id");
        ds.addField("quest_name");
        ds.addField("format_type");
        ds.addField("enum_list");
        ds.addRestriction(Restrictions.eq("questions", "questionnaire_id", q_id));
        final List<DataRecord> records = ds.getRecords();

        if (records.size() == 0) {
            return "";
        }
        xml = "<questionnaire questionnaire_id=\"" + convert2validXMLValueCustom(q_id) + "\">";

        for (int r = 0; r < records.size(); r++) {
            String new_value = "";
            if (records.get(r).getString("questions.format_type").equals("Enum")) {
                final String enumList = records.get(r).getString("questions.enum_list");
                final String[] splitList = enumList.split(";");
                if (splitList.length > 0) {
                    new_value = splitList[0];
                }
            }
            final String quest_name = records.get(r).getString("questions.quest_name");
            xml =
                    xml + "<question quest_name=\"" + convert2validXMLValueCustom(quest_name)
                    + "\" value=\"" + convert2validXMLValueCustom(new_value) + "\"/>";
        }
        xml = xml + "</questionnaire>";
        return xml;
    }

    /**
     * Returns encoded value for insertion into an xml string
     *
     * @param fieldValue Value to be encoded
     */
    private String convert2validXMLValueCustom(String fieldValue) {
        /*
         * use custom encoder for all special characters since the hidden question XML field is
         * automatically decoded upon view load. Special characters (like '&' and '>') must be
         * encoded for evaluation of the XML statement.
         */
        fieldValue = fieldValue.replaceAll("/&amp;/g", "&");
        fieldValue = fieldValue.replaceAll("/&/g", "%26");
        fieldValue = fieldValue.replaceAll("/&lt;/g", "<");
        fieldValue = fieldValue.replaceAll("/</g", "%3C");
        fieldValue = fieldValue.replaceAll("/&gt;/g", ">");
        fieldValue = fieldValue.replaceAll("/>/g", "%3E");
        fieldValue = fieldValue.replaceAll("/&apos;/g", "\'");
        fieldValue = fieldValue.replaceAll("/\'/g", "%27");
        fieldValue = fieldValue.replaceAll("/&quot;/g", "\"");
        fieldValue = fieldValue.replaceAll("/\"/g", "%22");
        return fieldValue;
    }

    /**
     * only use for 'Review and Estimate Group Moves' and when the project Status was
     * 'Request-Rejected' .
     *
     * @param tableName <String> table name, the value should be mo or project
     * @param pkeyValue <String> primary key value
     */
    public void updateStatusForReviewAndEstimate(final String tableName, final String pkeyValue) {
        this.updateAssociatedServiceRequestStatus(tableName, pkeyValue);
    }

    /**
     * update associated service request status from mo record or project record.
     *
     * @param tableName <String> table name, the value should be mo or project
     * @param pkeyValue <String> primary key value
     */
    public void updateAssociatedServiceRequestStatus(final String tableName, final String pkeyValue) {

        // the associated activity_log_id
        int activityLogId = 0;

        // current project status or mo status
        String currentStatus = null;

        final String[] moFieldNames =
            { "mo_id", "activity_log_id", "status", "project_id", "em_id", "from_bl_id",
                "from_fl_id", "from_rm_id", "to_bl_id", "to_fl_id", "to_rm_id" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields("mo", moFieldNames);
        // get all records
        ds.setContext();
        ds.setMaxRecords(0);

        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("mo", "activity_log_id", null, Operation.IS_NOT_NULL);
        if ("mo".equals(tableName)) {
            restriction.addClause("mo", "mo_id", pkeyValue, Operation.EQUALS);
        } else {
            restriction.addClause("mo", "project_id", pkeyValue, Operation.EQUALS);
        }
        final List<DataRecord> moRecords = ds.getRecords(restriction);
        if (moRecords.size() > 0) {
            // get associated activity_log_id and store to activityLogId
            activityLogId = moRecords.get(0).getInt("mo.activity_log_id");
            // if exists activity_log_id, then go through logic to update the status,else do nothing
            if (activityLogId != 0 && isValidActivityLogId(activityLogId)) {

                // get the status of project or mo and store to currentStatus
                currentStatus = moRecords.get(0).getString("mo.status");

                // the flag of whether all mo record with same project are same
                final boolean isStatusSame = checkIfSameStatus(currentStatus, ds, moRecords);
                final String mo_id = moRecords.get(0).getInt("mo.mo_id") + "";
                // if is StatusSame is true, call SeviceDesk WFR to update the status,else do
                // nothing
                if (isStatusSame) {
                    final String activityLogStatus =
                            updateActivityLogStatus(currentStatus, activityLogId);
                    callMoveProcessAndBackUpHistory(activityLogId, mo_id, activityLogStatus);
                }
            }
        } else {
            if ("project".equals(tableName)) {
                // when there is not rmpct try to get the associated activity_log item by searching
                // the activity_log table
                // and only update activity log status.
                final DataRecord projectRecord = getProjectById(pkeyValue);
                activityLogId = getActivityLogSearching(pkeyValue, projectRecord);
                // get the status of project or mo and store to currentStatus
                currentStatus = projectRecord.getString("project.status");
                // if exists activity_log_id, then go through logic to update the status,else do
                // nothing
                if (activityLogId != 0 && isValidActivityLogId(activityLogId)) {
                    final String activityLogStatus =
                            updateActivityLogStatus(currentStatus, activityLogId);
                    callMoveProcessAndBackUpHistory(activityLogId, null, activityLogStatus);
                }
            }
        }
    }

    /**
     * call 'processDeleteRmpctRecord' if activityLogStatus not empty and exists mo, then back up
     * history.
     *
     * @param activityLogId
     * @param mo_id
     * @param activityLogStatus
     */
    private void callMoveProcessAndBackUpHistory(final int activityLogId, final String mo_id,
            final String activityLogStatus) {
        if (activityLogStatus != null) {
            // KB#3037377: Try to delete requested rmpct records when cancel the move order
            // or set its status to 'Requested-Rejected' in Review And Estimate Moves view.
            if (activityLogStatus.equals("CANCELLED") || activityLogStatus.equals("REJECTED")) {
                final String useWorkspaceTransactions =
                        ContextStore.get().getProject().getActivityParameterManager()
                        .getParameterValue("AbSpaceRoomInventoryBAR-UseWorkspaceTransactions");
                if (useWorkspaceTransactions.equals("1") && mo_id != null) {
                    // delete Rmpct Record
                    this.processDeleteRmpctRecord("mo", mo_id);
                }
                moveToHistory(activityLogId);
            }
        }
    }

    /**
     * Move cancelled or rejected activity_log record to hactivity_log
     *
     * @param activityLogId
     */
    private void moveToHistory(final int activityLogId) {
        // KB#3037357:Move cancelled or rejected activity_log record to
        // hactivity_log
        SqlUtils.executeUpdate("hactivity_log",
            " INSERT INTO hactivity_log SELECT * FROM  activity_log WHERE activity_log.activity_log_id="
                    + activityLogId);
        final DataSource activityLogDS =
                DataSourceFactory.createDataSourceForFields("activity_log",
                    new String[] { "activity_log_id" });
        final DataRecord activityLogRecord =
                activityLogDS.getRecord("activity_log.activity_log_id=" + activityLogId);
        if (activityLogRecord != null) {
            activityLogDS.deleteRecord(activityLogRecord);
        }
    }

    /**
     * search mo table and check if exists status differnent form current status.
     *
     * @param currentStatus
     * @param ds
     * @param moRecords
     * @return
     */
    private boolean checkIfSameStatus(final String currentStatus, final DataSource ds,
            final List<DataRecord> moRecords) {
        boolean isStatusSame = true;
        ParsedRestrictionDef restriction;
        // determin the flag isStatusSame by query database
        final String projectId = moRecords.get(0).getString("mo.project_id");
        if (projectId != null) {
            restriction = new ParsedRestrictionDef();
            restriction.addClause("mo", "activity_log_id", null, Operation.IS_NOT_NULL);
            restriction.addClause("mo", "project_id", projectId, Operation.EQUALS);
            restriction.addClause("mo", "status", currentStatus, Operation.NOT_EQUALS);
            if (ds.getRecords(restriction).size() > 0) {
                isStatusSame = false;
            }
        }
        return isStatusSame;
    }

    /**
     * get activity_log status from current status. and call WFR
     * "AbBldgOpsHelpDesk-RequestsService-updateStatus" update status.
     *
     * @param currentStatus
     * @param activityLogId
     * @return
     */
    private String updateActivityLogStatus(final String currentStatus, final int activityLogId) {
        final Map<String, String> swapStatus = new HashMap<String, String>();
        swapStatus.put("Requested-Estimated", "REQUESTED");
        swapStatus.put("Requested-On Hold", "REQUESTED");
        swapStatus.put("Requested-Routed", "REQUESTED");
        swapStatus.put("Requested-Rejected", "REJECTED");
        swapStatus.put("Approved", "APPROVED");
        swapStatus.put("Approved-In Design", "APPROVED");
        swapStatus.put("Approved-Cancelled", "CANCELLED");
        swapStatus.put("Issued-In Process", "IN PROGRESS");
        swapStatus.put("Issued-On Hold", "IN PROCESS-H");
        swapStatus.put("Issued-Stopped", "STOPPED");
        swapStatus.put("Completed-Pending", "COMPLETED");
        swapStatus.put("Completed-Not Ver", "COMPLETED");
        swapStatus.put("Completed-Verified", "COMPLETED-V");
        swapStatus.put("Closed", "CLOSED");
        // status of activity_log, the value should be IN PROGRESS or COMPLETED or CLOSED
        // it is determined by the value of currentStatus
        final String activityLogStatus = swapStatus.get(currentStatus);
        if (activityLogStatus != null) {
            // prepare the WFR parameter
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            final JSONArray methodParameters = new JSONArray();
            methodParameters.put(activityLogId);
            methodParameters.put(activityLogStatus);
            context.addResponseParameter("methodParameters", methodParameters);
            // call WFR to update the status
            runWorkflowRuleMethod(context, "AbBldgOpsHelpDesk-RequestsService-updateStatus");
        }
        return activityLogStatus;
    }

    /**
     * Try to get the associated activity_log item by searching the activity_log table.
     *
     * @param pkeyValue
     * @return
     */
    private int getActivityLogSearching(final String pkeyValue, final DataRecord projectRecord) {
        // kb 3038809 try to get the associated activity_log item by searching the activity_log
        // table
        // WHERE activitytype = 'SERVICE DESK - GROUP MOVE' AND date_requested <=
        // project.date_created
        // AND act_quest IS NOT NULL AND act_quest LIKE %'quest_name="project_name"
        // value="<project.project_id>"'%
        int activityLogId = 0;
        final ParsedRestrictionDef restrictionActivityLog = new ParsedRestrictionDef();
        final String[] activityLogFieldNames =
            { "activity_log_id", "activity_type", "date_requested", "act_quest" };
        final DataSource activityLogProject =
                DataSourceFactory.createDataSourceForFields("activity_log", activityLogFieldNames);
        restrictionActivityLog.addClause("activity_log", "activity_type",
            "SERVICE DESK - GROUP MOVE", Operation.EQUALS);
        restrictionActivityLog.addClause("activity_log", "date_requested",
            projectRecord.getDate("project.date_created"), Operation.LTE);
        restrictionActivityLog.addClause("activity_log", "act_quest", null, Operation.IS_NOT_NULL);
        restrictionActivityLog.addClause("activity_log", "act_quest",
            "%quest_name=%project_name%value=%" + projectRecord.getString("project.project_id")
            + "%", Operation.LIKE);

        final List<DataRecord> activityLogRecords =
                activityLogProject.getRecords(restrictionActivityLog);

        if (activityLogRecords.size() > 0) {
            // get associated activity_log_id and store to activityLogId
            activityLogId = activityLogRecords.get(0).getInt("activity_log.activity_log_id");
        }
        return activityLogId;
    }

    /**
     * get project record by main key project_id.
     *
     * @param pkeyValue
     * @return
     */
    private DataRecord getProjectById(final String pkeyValue) {
        final ParsedRestrictionDef restrictionProject = new ParsedRestrictionDef();
        restrictionProject.addClause("project", "project_id", pkeyValue, Operation.EQUALS);
        final String[] projectFieldNames =
            { "project_id", "date_created", "project_name", "status" };
        final DataSource dsProject =
                DataSourceFactory.createDataSourceForFields("project", projectFieldNames);
        final DataRecord projectRecord = dsProject.getRecords(restrictionProject).get(0);
        return projectRecord;
    }

    /**
     * wfr call, update associated rmpct from mo record or project record. kb 3032502 when
     * currentStatus equals "Approved-Cancelled"
     *
     * @param tableName <String> table name, the value should be mo or project
     * @param pkeyValue <String> primary key value
     */
    public void onProcessDeleteRmpctRecord(final String tableName, final String pkeyValue) {
        final String useWorkspaceTransactions =
                ContextStore.get().getProject().getActivityParameterManager()
                .getParameterValue("AbSpaceRoomInventoryBAR-UseWorkspaceTransactions");
        if (useWorkspaceTransactions.equals("1")) {
            this.processDeleteRmpctRecord(tableName, pkeyValue);
        }
    }

    /**
     * update associated rmpct from mo record or project record.
     *
     * @param tableName <String> table name, the value should be mo or project
     * @param pkeyValue <String> primary key value
     */
    private void processDeleteRmpctRecord(final String tableName, final String pkeyValue) {

        // 10/9/13 - for KB 3039803 Add move_type to the field list
        final String[] moFieldNames =
            { "mo_id", "activity_log_id", "status", "project_id", "em_id", "from_bl_id",
                "from_fl_id", "from_rm_id", "to_bl_id", "to_fl_id", "to_rm_id",
                "date_to_perform", "mo_type" };
        final DataSource ds = DataSourceFactory.createDataSourceForFields("mo", moFieldNames);

        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();

        // 10/9/13 - KB 3039803 From EAR: Add move type restriction to move datasoure
        final List<String> moTypes = new ArrayList<String>();
        moTypes.add("Employee");
        moTypes.add("Leaving");
        moTypes.add("New Hire");
        restriction.addClause("mo", "mo_type", moTypes, Operation.IN);
        // End change for KB 3039803

        restriction.addClause("mo", "activity_log_id", null, Operation.IS_NOT_NULL);
        if ("mo".equals(tableName)) {
            restriction.addClause("mo", "mo_id", pkeyValue, Operation.EQUALS);
        } else {
            restriction.addClause("mo", "project_id", pkeyValue, Operation.EQUALS);
        }
        final List<DataRecord> moRecords = ds.getRecords(restriction);

        final JSONArray deleteList = new JSONArray();
        for (final DataRecord moRecord : moRecords) {

            final JSONObject assignment = new JSONObject();
            // kb#3034359: add mo_id to assingment before call Space Workflow rule - ZY
            assignment.put("mo_id", moRecord.getInt("mo.mo_id"));
            assignment.put("activity_log_id", 0);
            assignment.put("parent_pct_id", -1);
            deleteList.put(assignment);
        }

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray methodParameters = new JSONArray();
        methodParameters.put(0);
        methodParameters.put(deleteList);
        context.addResponseParameter("methodParameters", methodParameters);
        // call WFR to update the status
        runWorkflowRuleMethod(context,
                "AbSpaceRoomInventoryBAR-SpaceTransactionProcess-cancelMoveOrder");

    }

    /**
     * Delete associated rmpct by mo record when deleting move record(s).
     *
     * Added for kb3037865 - by ZY
     *
     * @param moIds list of mo ids that deleted on client side
     */
    public void deleteRequestedSpaceTransactions(final String moIds) {

        if (StringUtil.notNullOrEmpty(moIds)) {
            SqlUtils.executeUpdate("rmpct",
                "Delete from rmpct Where rmpct.status=0 and rmpct.mo_id in (" + moIds + ")");
        }

    }

    /**
     * update associated rmpct from mo record or project record.
     *
     * @param tableName <String> table name, the value should be mo or project
     * @param pkeyValue <String> primary key value
     */
    private void updateAssociatedRmpct(final String tableName, final String pkeyValue,
            final boolean isApproved) {

        // the associated activity_log_id
        int activityLogId = 0;

        // 10/9/13 - KB 3039803 Add move_type to the fields
        final String[] moFieldNames =
            { "mo_id", "activity_log_id", "status", "project_id", "em_id", "from_bl_id",
                "from_fl_id", "from_rm_id", "to_bl_id", "to_fl_id", "to_rm_id",
                "date_to_perform", "mo_type" };
        final DataSource moDs = DataSourceFactory.createDataSourceForFields("mo", moFieldNames);
        // get all records
        moDs.setContext();
        moDs.setMaxRecords(0);

        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();

        // 10/9/13 - KB 3039803 From EAR: Add move type restriction to move datasoure
        final List<String> moTypes = new ArrayList<String>();
        moTypes.add("Employee");
        moTypes.add("Leaving");
        moTypes.add("New Hire");
        restriction.addClause("mo", "mo_type", moTypes, Operation.IN);
        // End change for KB 3039803

        if ("mo".equals(tableName)) {
            restriction.addClause("mo", "mo_id", pkeyValue, Operation.EQUALS);
        } else {
            restriction.addClause("mo", "project_id", pkeyValue, Operation.EQUALS);
        }
        final List<DataRecord> moRecords = moDs.getRecords(restriction);

        final String[] rmpctFieldNames =
            { "pct_id", "parent_pct_id", "date_start", "em_id", "bl_id", "fl_id", "rm_id",
                "from_bl_id", "from_fl_id", "from_rm_id", "status", "activity_log_id",
                "dv_id", "dp_id", "rm_cat", "rm_type", "user_name", "primary_em",
                "primary_rm", "pct_space", "prorate", "date_end" };
        final DataSource rmpctDs =
                DataSourceFactory.createDataSourceForFields("rmpct", rmpctFieldNames);
        // get all records
        rmpctDs.setContext();
        rmpctDs.setMaxRecords(0);

        final JSONArray insertList = new JSONArray();
        final JSONArray unchangeList = new JSONArray();
        final JSONArray deleteList = new JSONArray();

        // kb#3034176: pass current date to all rmpct records for given activity_log_id
        Date mo_date = Utility.currentDate();

        for (final DataRecord moRecord : moRecords) {

            // if the move is not approved (Issued) make sure to use the Move Date
            if (!isApproved) {
                mo_date = moRecord.getDate("mo.date_to_perform");
            }

            // get associated activity_log_id and store to activityLogId
            activityLogId = moRecord.getInt("mo.activity_log_id");
            // if exists activity_log_id, for each of the mo record call WFR
            // 'AbSpaceRoomInventoryBAR-SpaceTransaction-insertUpdateRmpctRecordsFromMoveServiceRequest'
            // to update rmpct record
            // get all rmpct records where rmpct.activity_log_id= <activityLogId>

            final List<DataRecord> rmpctRecords =
                    rmpctDs.getRecords(getRestrictionForRmpct(moRecord));

            if (rmpctRecords.size() > 0) {
                final DataRecord rmpctRecord = rmpctRecords.get(0);
                if (anyToLocationChange(moRecord, rmpctRecord)) {
                    final JSONObject assignment =
                            getInsertAssignmentObject(activityLogId, moRecord, rmpctRecord,
                                mo_date, isApproved);
                    insertList.put(assignment);

                    final JSONObject assignmentD = new JSONObject();
                    assignmentD.put("pct_id", rmpctRecord.getInt("rmpct.pct_id"));
                    // kb#3034359: add mo_id to assingment before call Space Workflow rule - ZY
                    assignmentD.put("mo_id", moRecord.getInt("mo.mo_id"));
                    assignmentD.put("activity_log_id", activityLogId);
                    deleteList.put(assignmentD);
                } else {
                    final JSONObject assignment =
                            getUnChangedAssignment(activityLogId, moRecord, rmpctRecord, isApproved);
                    unchangeList.put(assignment);
                }
                // kb#3035110:for issue#1, now update the date_start of rmpct for approving to
                // current date in Move Application side before calling Space workflow rules
                rmpctRecord.setValue("rmpct.date_start", mo_date);
                rmpctDs.saveRecord(rmpctRecord);

            } else {
                final JSONObject assignment =
                        getInsertAssignmentObject(activityLogId, moRecord, null, mo_date,
                            isApproved);
                insertList.put(assignment);

            }
        }

        final JSONObject assignmentsObject = new JSONObject();
        assignmentsObject.put("I", insertList);
        assignmentsObject.put("U", unchangeList);
        assignmentsObject.put("D", deleteList);

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray methodParameters = new JSONArray();
        methodParameters.put(mo_date);
        methodParameters.put(assignmentsObject);
        context.addResponseParameter("methodParameters", methodParameters);

        if (isApproved) {
            // call WFR to update the status
            runWorkflowRuleMethod(context,
                    "AbSpaceRoomInventoryBAR-SpaceTransactionProcess-closeMoveOrder");
        } else {
            // call WFR to update the status
            runWorkflowRuleMethod(context,
                    "AbSpaceRoomInventoryBAR-SpaceTransactionProcess-issueMoveOrder");
        }
    }

    private JSONObject getUnChangedAssignment(final int activityLogId, final DataRecord moRecord,
            final DataRecord rmpctRecord, final boolean isApproved) {
        final JSONObject assignment = new JSONObject();

        if (activityLogId != 0) {
            // kb#3034359: for assignment initiated from Space, set existed activity log id to
            // assignment.
            assignment.put("activity_log_id", activityLogId);

        } else {

            // kb#3034359: add mo_id to assingment initiated from Move Management before call Space
            // Workflow rule - ZY
            assignment.put("activity_log_id", 0);
        }

        assignment.put("mo_id", moRecord.getInt("mo.mo_id"));

        if (isApproved) {
            assignment.put("status", 1);
        } else {
            assignment.put("status", 0);
        }

        assignment.put("action", "update");
        assignment.put("activity_log_id", activityLogId);
        assignment.put("em_id", rmpctRecord.getString("rmpct.em_id"));
        assignment.put("from_bl_id", moRecord.getString("mo.from_bl_id"));
        assignment.put("from_fl_id", moRecord.getString("mo.from_fl_id"));
        assignment.put("from_rm_id", moRecord.getString("mo.from_rm_id"));
        assignment.put("bl_id", rmpctRecord.getString("rmpct.bl_id"));
        assignment.put("fl_id", rmpctRecord.getString("rmpct.fl_id"));
        assignment.put("rm_id", rmpctRecord.getString("rmpct.rm_id"));
        assignment.put("primary_em", rmpctRecord.getInt("rmpct.primary_em"));
        assignment.put("dv_id", rmpctRecord.getString("rmpct.dv_id"));
        assignment.put("dp_id", rmpctRecord.getString("rmpct.dp_id"));
        assignment.put("rm_cat", rmpctRecord.getString("rmpct.rm_cat"));
        assignment.put("rm_type", rmpctRecord.getString("rmpct.rm_type"));
        assignment.put("primary_rm", rmpctRecord.getInt("rmpct.primary_rm"));
        assignment.put("parent_pct_id", rmpctRecord.getInt("rmpct.parent_pct_id") == 0 ? ""
                : rmpctRecord.getInt("rmpct.parent_pct_id"));
        assignment.put("pct_id", rmpctRecord.getInt("rmpct.pct_id"));
        return assignment;
    }

    /**
     * this method will encapsulate an JSONObject.
     *
     * @param activityLogId
     * @param moRecord
     * @param rmpctRecord
     * @return
     */
    private JSONObject getInsertAssignmentObject(final int activityLogId,
            final DataRecord moRecord, final DataRecord rmpctRecord, final Date mo_date,
            final boolean isApproved) {

        final String mo_bl_id = moRecord.getString("mo.to_bl_id");
        final String mo_fl_id = moRecord.getString("mo.to_fl_id");
        final String mo_rm_id = moRecord.getString("mo.to_rm_id");
        final JSONObject assignment = new JSONObject();

        // kb#3034359: add mo_id to assingment before call Space Workflow rule - ZY
        assignment.put("mo_id", moRecord.getInt("mo.mo_id"));

        // kb#3034359: for newly insert assignment from Move Management, activity log id is not
        // existed.
        assignment.put("activity_log_id", activityLogId);

        assignment.put("em_id", moRecord.getString("mo.em_id"));
        assignment.put("from_bl_id", moRecord.getString("mo.from_bl_id"));
        assignment.put("from_fl_id", moRecord.getString("mo.from_fl_id"));
        assignment.put("from_rm_id", moRecord.getString("mo.from_rm_id"));
        assignment.put("bl_id", mo_bl_id);
        assignment.put("fl_id", mo_fl_id);
        assignment.put("rm_id", mo_rm_id);
        // kb#3035094:(FK 2012-02-13 10:06)Unless the primary_em value is specified with the Space
        // request (in other words, the move request initiated from Space has a primary_em value),
        // then we must assume primary_em is 1.
        assignment.put("primary_em",
            rmpctRecord == null ? 1 : rmpctRecord.getInt("rmpct.primary_em"));
        assignment.put("dv_id", "");
        assignment.put("dp_id", "");
        assignment.put("rm_cat", "");
        assignment.put("rm_type", "");
        assignment.put("primary_rm",
            rmpctRecord == null ? 1 : rmpctRecord.getInt("rmpct.primary_rm"));
        assignment.put("parent_pct_id", "");
        assignment.put("date_start", mo_date.getTime());

        // kb 3037650 the primary_em flag of the new "to location"
        // should be the same as the primary_em of the "from location" record that had the employee
        // previously.
        if (this.isLocationPrimaryOfEmployee(moRecord.getString("mo.em_id"),
            moRecord.getString("mo.from_bl_id"), moRecord.getString("mo.from_fl_id"),
            moRecord.getString("mo.from_rm_id"), mo_date)) {
            assignment.put("primary_em", 1);
        }

        if (isApproved) {
            assignment.put("status", 1);
        } else {
            assignment.put("status", 0);
        }

        assignment.put("action", "update");
        return assignment;
    }

    /**
     * @return if the location is the primary location of employee.
     *
     * @param emId String employee code
     * @param blId String building code
     * @param flId String floor code
     * @param rmId String room code
     * @param requestDate Date request date
     *
     */
    private boolean isLocationPrimaryOfEmployee(final String emId, final String blId,
            final String flId, final String rmId, final Date requestDate) {

        final String[] rmpctFieldNames =
            { "pct_id", "parent_pct_id", "date_start", "em_id", "bl_id", "fl_id", "rm_id",
                "from_bl_id", "from_fl_id", "from_rm_id", "status", "activity_log_id",
                "dv_id", "dp_id", "rm_cat", "rm_type", "user_name", "primary_em",
                "primary_rm", "pct_space", "prorate", "date_end" };
        final DataSource rmpctDs =
                DataSourceFactory.createDataSourceForFields("rmpct", rmpctFieldNames);

        // Construct a ParsedRestrictionDef object that contains below conditions:
        // bl_id = <from_bl_id> AND fl_id = <from_fl_id> AND rm_id = <from_rm_id> AND em_id=<em_id>
        // AND status = 1 AND
        // (date_start IS NULL OR date_start <= <date>) AND (date_end IS NULL OR date_end >= <date>)
        // and primary_em=1
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause("rmpct", "bl_id", blId, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "fl_id", flId, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "rm_id", rmId, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "em_id", emId, Operation.EQUALS);

        rmpctResDef.addClause("rmpct", "status", 1, Operation.EQUALS);

        rmpctResDef.addClause("rmpct", "date_start", requestDate, Operation.LTE,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause("rmpct", "date_start", null, Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause("rmpct", "date_end", requestDate, Operation.GTE,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause("rmpct", "date_end", null, Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause("rmpct", "primary_em", 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);

        boolean isPrimary = false;
        final List<DataRecord> listRmpct = rmpctDs.getRecords(rmpctResDef);
        if (listRmpct.size() > 0) {
            isPrimary = true;
        }

        return isPrimary;
    }

    /*
     * Get restriction for rmpct records: if move order initiated from Space - activity log id is
     * not null, then
     */
    private ParsedRestrictionDef getRestrictionForRmpct(final DataRecord moRecord) {
        // TODO Auto-generated method stub

        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();

        final int activityLogId = moRecord.getInt("mo.activity_log_id");

        if (moRecord.valueExists("mo.activity_log_id") && activityLogId != 0
                && isValidActivityLogId(activityLogId)) {
            restriction.addClause("rmpct", "em_id", moRecord.getString("mo.em_id"),
                Operation.EQUALS);
            restriction.addClause("rmpct", "activity_log_id", activityLogId, Operation.EQUALS);
        } else {
            restriction.addClause("rmpct", "mo_id", moRecord.getInt("mo.mo_id"), Operation.EQUALS);

        }
        return restriction;
    }

    /**
     * check if to locaction had change.
     *
     * @param moRecord mo record
     * @param rmpctRecord rmpct record
     * @return
     */
    private boolean anyToLocationChange(final DataRecord moRecord, final DataRecord rmpctRecord) {
        final String mo_bl_id = moRecord.getString("mo.to_bl_id");
        final String mo_fl_id = moRecord.getString("mo.to_fl_id");
        final String mo_rm_id = moRecord.getString("mo.to_rm_id");
        // Date mo_date = moRecord.getDate("mo.date_to_perform");
        final String rmpct_bl_id = rmpctRecord.getString("rmpct.bl_id");
        final String rmpct_fl_id = rmpctRecord.getString("rmpct.fl_id");
        final String rmpct_rm_id = rmpctRecord.getString("rmpct.rm_id");
        // Date rmpct_date = rmpctRecord.getDate("rmpct.date_start");
        if (mo_bl_id == null) {
            if (StringUtil.notNullOrEmpty(rmpct_bl_id)) {
                return true;
            }
        } else {
            if (!mo_bl_id.equalsIgnoreCase(rmpct_bl_id)) {
                return true;
            }
        }

        if (mo_fl_id == null) {
            if (StringUtil.notNullOrEmpty(rmpct_fl_id)) {
                return true;
            }
        } else {
            if (!mo_fl_id.equalsIgnoreCase(rmpct_fl_id)) {
                return true;
            }
        }

        if (mo_rm_id == null) {
            if (StringUtil.notNullOrEmpty(rmpct_rm_id)) {
                return true;
            }
        } else {
            if (!mo_rm_id.equalsIgnoreCase(rmpct_rm_id)) {
                return true;
            }
        }

        return false;
    }

    /**
     * check if to locaction had change.
     *
     * @param moRecord mo record
     * @param rmpctRecord rmpct record
     * @return
     */
    private boolean anyFromLocationChange(final DataRecord moRecord, final DataRecord rmpctRecord) {
        final String mo_bl_id = moRecord.getString("mo.from_bl_id");
        final String mo_fl_id = moRecord.getString("mo.from_fl_id");
        final String mo_rm_id = moRecord.getString("mo.from_rm_id");
        // Date mo_date = moRecord.getDate("mo.date_to_perform");
        final String rmpct_bl_id = rmpctRecord.getString("rmpct.from_bl_id");
        final String rmpct_fl_id = rmpctRecord.getString("rmpct.from_fl_id");
        final String rmpct_rm_id = rmpctRecord.getString("rmpct.from_rm_id");
        // Date rmpct_date = rmpctRecord.getDate("rmpct.date_start");
        if (mo_bl_id == null) {
            if (StringUtil.notNullOrEmpty(rmpct_bl_id)) {
                return true;
            }
        } else {
            if (!mo_bl_id.equalsIgnoreCase(rmpct_bl_id)) {
                return true;
            }
        }

        if (mo_fl_id == null) {
            if (StringUtil.notNullOrEmpty(rmpct_fl_id)) {
                return true;
            }
        } else {
            if (!mo_fl_id.equalsIgnoreCase(rmpct_fl_id)) {
                return true;
            }
        }

        if (mo_rm_id == null) {
            if (StringUtil.notNullOrEmpty(rmpct_rm_id)) {
                return true;
            }
        } else {
            if (!mo_rm_id.equalsIgnoreCase(rmpct_rm_id)) {
                return true;
            }
        }

        return false;
    }

    /**
     * return all the reocrds with to location and em_id is null.
     *
     * @param toFlId
     * @param toBlId
     * @param toRmId
     * @param requestDate
     * @return
     */
    public static List<DataRecord> getParsedRmpctRestrictionForEmptyToLocation(final String toBlId,
        final String toFlId, final String toRmId, final Date requestDate) {

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();

        rmpctResDef.addClause("rmpct", "fl_id", toFlId, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "rm_id", toRmId, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "bl_id", toBlId, Operation.EQUALS);

        rmpctResDef.addClause("rmpct", "status", 1, Operation.EQUALS);
        rmpctResDef.addClause("rmpct", "em_id", null, Operation.IS_NULL);

        rmpctResDef.addClause("rmpct", "date_start", requestDate, Operation.LTE,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause("rmpct", "date_start", null, Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause("rmpct", "date_end", requestDate, Operation.GTE,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause("rmpct", "date_end", null, Operation.IS_NULL, RelativeOperation.OR);

        final DataSource rmpctDS =
                DataSourceFactory.createDataSourceForFields("rmpct", new String[] { "pct_id",
                        "parent_pct_id", "date_start", "em_id", "bl_id", "fl_id", "rm_id",
                        "from_bl_id", "from_fl_id", "from_rm_id", "status", "activity_log_id",
                        "dv_id", "dp_id", "rm_cat", "rm_type", "user_name", "primary_em",
                        "primary_rm", "pct_space", "prorate", "date_end" });

        return rmpctDS.getRecords(rmpctResDef);
    }

    /**
     * check whether the given activity log id exists or not .
     *
     * @param ativityLogId <int> activity_log id
     */
    private boolean isValidActivityLogId(final int ativityLogId) {
        final String[] fieldNames = { "activity_log_id" };
        final DataSource ds =
                DataSourceFactory.createDataSourceForFields("activity_log", fieldNames);

        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("activity_log", "activity_log_id", ativityLogId, Operation.EQUALS);
        final List<DataRecord> records = ds.getRecords(restriction);
        if (records.size() > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * rule workflow rule method.
     *
     * @param context <EventHandlerContext> user context
     * @param ruleName <String> workflow rule name that with method name like
     *            "AbBldgOpsHelpDesk-RequestsService-updateStatus"
     */
    private void runWorkflowRuleMethod(final EventHandlerContext context, final String ruleName) {
        // get rule id and method name
        final List<String> ruleParts = StringUtil.tokenizeString(ruleName, "-");
        final String ruleId = ruleParts.get(0) + "-" + ruleParts.get(1);
        final String methodName = ruleParts.get(2);

        // get workflow rule container
        final WorkflowRulesContainer.ThreadSafe workflowRulesContainer =
                ContextStore.get().getUserSession().findProject().loadWorkflowRules();

        // run workflow rule mehtod
        workflowRulesContainer.runRule(workflowRulesContainer.getWorkflowRule(ruleId), methodName,
            context);
    }

}
