package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import org.springframework.util.StringUtils;

import com.archibus.datasource.SqlUtils;

/**
 * Provides the SQL queries used by the Maintenance Mobile service.
 *
 * @author Jeff Martin
 * @since 23.1
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
public final class MaintenanceMobileQuery {

    /**
     * SQL AS constant.
     */
    public static final String SQL_AS = " ${sql.as} ";

    /**
     * Zero constant.
     */
    public static final String ZERO = "0";

    /**
     * Current Date - this can be updated to reflect the local date based on the building and site.
     */
    public static final String SQL_CURRENT_DATE =
            MaintenanceMobileManager.getSQLCurrentDateString();

    /**
     * SQL SET operator.
     */
    public static final String SQL_SET = " SET ";

    /**
     * SQL INSERT operator.
     */
    private static final String SQL_INSERT = " INSERT";

    /**
     * SQL UPDATE operator.
     */
    private static final String SQL_UPDATE = " UPDATE ";

    /**
     * SQL WHERE constant.
     */
    private static final String SQL_WHERE = " WHERE ";

    /**
     * SQL SELECT constant.
     */
    private static final String SQL_SELECT = " SELECT ";

    /**
     * SQL INTO constant.
     *
     */
    private static final String SQL_INTO = " INTO ";

    /**
     * SQL TOP constant.
     */
    private static final String SQL_TOP = " TOP ";

    /**
     * SPACE constant.
     */
    private static final String SPACE = " ";

    /**
     * Last Modified assignment constant.
     */
    private static final String SET_LAST_MODIFIED =
            WR_SYNC_TABLE + SQL_DOT + LAST_MODIFIED + EQUAL + System.currentTimeMillis();

    /**
     * start date unavailable restriction.
     */
    private static final String WORKFLOW_SUBSTITUTES_START_DATE_UNAVAILABLE_NULL_OR_LESS_OR_EQUAL =
            "workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= ";

    /**
     * end date unavailable restriction.
     */
    private static final String WORKFLOW_SUBSTITUTES_END_DATE_UNAVAILABLE_NULL_OR_GREATER_OR_EQUAL =
            "workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= ";

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileQuery() {
    }

    /**
     * Returns the query to insert records from the wr table to the wr_sync table.
     *
     * @param syncTableFields fields to include in the insert statement
     * @param restriction to apply to the wr records
     * @param userName of the logged in user.
     * @param workRequestLimit number or records to include in the insert
     * @param sort to apply to the inserted records.
     * @return the SQL query string.
     */
    public static String getWorkRequestSyncInsertQuery(final String[] syncTableFields,
            final String restriction, final String userName, final String workRequestLimit,
            final String sort) {

        final String fields = StringUtils.arrayToCommaDelimitedString(syncTableFields);

        final String insertFields = fields + SQL_COMMA + LAST_MODIFIED + SQL_COMMA + DELETED
                + SQL_COMMA + MOB_LOCKED_BY + SQL_COMMA + MOB_IS_CHANGED;

        final String selectFields = getWorkRequestSyncSelectFields(userName, fields);

        String sql = "";

        if (SqlUtils.isOracle()) {
            sql = SQL_INSERT + SQL_INTO + WR_SYNC_TABLE + START_PARENTHESIS + insertFields
                    + END_PARENTHESIS + SQL_SELECT + insertFields + SQL_FROM + START_PARENTHESIS
                    + SQL_SELECT + selectFields + SQL_FROM + WR_TABLE + SQL_WHERE + restriction
                    + " AND NOT EXISTS(SELECT 1 FROM wr_sync WHERE wr.wr_id = wr_sync.wr_id"
                    + SQL_AND + WR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY + EQUAL
                    + SqlUtils.formatValueForSql(userName) + SQL_AND + WR_SYNC_TABLE + SQL_DOT
                    + DELETED + EQUAL + ZERO + END_PARENTHESIS + SPACE + sort + END_PARENTHESIS
                    + SQL_WHERE + " rownum <=" + workRequestLimit;

        } else {
            sql = SQL_INSERT + SQL_INTO + WR_SYNC_TABLE + START_PARENTHESIS + insertFields
                    + END_PARENTHESIS + SQL_SELECT + SQL_TOP + workRequestLimit + SPACE
                    + selectFields + SQL_FROM + WR_TABLE + SQL_WHERE + restriction
                    + " AND NOT EXISTS(SELECT 1 FROM wr_sync WHERE wr.wr_id = wr_sync.wr_id "
                    + SQL_AND + WR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY + EQUAL
                    + SqlUtils.formatValueForSql(userName) + SQL_AND + WR_SYNC_TABLE + SQL_DOT
                    + DELETED + EQUAL + ZERO + END_PARENTHESIS + SPACE + sort;

        }

        return sql;

    }

    /**
     * Generates the query used to update the step waiting fields in the wr_sync table.
     *
     * @param userRole of the logged in user.
     * @param userName of the logged in user.
     * @param emId employee id of the logged in user.
     * @return generated update query.
     */
    public static String getUpdateStepWaitingQuery(final String userRole, final String userName,
            final String emId) {

        String compareSql =
                "((wr_sync.step <> step.step OR wr_sync.step IS NULL) OR (wr_sync.STEP_TYPE <> step.step_type OR wr_sync.step_type IS NULL)"
                        + "  OR (wr_sync.STEP_LOG_ID <> step.STEP_LOG_ID OR wr_sync.step_log_id IS NULL) OR (wr_sync.step_role_name <>step.ROLE_NAME OR wr_sync.STEP_ROLE_NAME IS NULL)"
                        + "  OR (wr_sync.step_user_name <> step.user_name OR wr_sync.STEP_USER_NAME IS NULL)) ";

        if (SqlUtils.isOracle()) {
            compareSql = compareSql.replace("step.", "wr_step_waiting.");
        }

        final String sql = SQL_UPDATE + WR_SYNC_TABLE + SQL_SET + "wr_sync.step = step.step,"
                + "Wr_sync.step_type = step.step_type," + "wr_sync.step_log_id = step.step_log_id,"
                + "wr_sync.step_role_name = step.role_name,"
                + "wr_sync.step_user_name = step.user_name," + "wr_sync.step_em_id = step.em_id,"
                + SET_LAST_MODIFIED + SQL_FROM + START_PARENTHESIS + SQL_SELECT
                + "wr_step_waiting.wr_id," + "wr_step_waiting.step," + "wr_step_waiting.step_type,"
                + "wr_step_waiting.step_log_id," + "wr_step_waiting.role_name,"
                + "wr_step_waiting.user_name," + "wr_step_waiting.em_id" + SQL_FROM
                + WR_STEP_WAITING_TABLE + SQL_WHERE + START_PARENTHESIS
                + "wr_step_waiting.role_name=" + SqlUtils.formatValueForSql(userRole) + SQL_OR
                + " wr_step_waiting.user_name=" + SqlUtils.formatValueForSql(userName) + SQL_OR
                + " wr_step_waiting.em_id IN " + START_PARENTHESIS
                + "SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.em_id = wr_step_waiting.em_id"
                + " AND workflow_substitutes.em_id=" + SqlUtils.formatValueForSql(emId)
                + " AND workflow_substitutes.steptype_or_role = wr_step_waiting.step_type"
                + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable  <= "
                + SQL_CURRENT_DATE + END_PARENTHESIS
                + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                + SQL_CURRENT_DATE + END_PARENTHESIS + END_PARENTHESIS + END_PARENTHESIS + ") step"
                + " WHERE step.wr_id = wr_sync.wr_id" + SQL_AND + WR_SYNC_TABLE + SQL_DOT
                + MOB_LOCKED_BY + EQUAL + SqlUtils.formatValueForSql(userName);
        // + SQL_AND + compareSql;

        final String oracleSql = SQL_UPDATE + WR_SYNC_TABLE + SQL_SET
                + "(wr_sync.step,wr_sync.step_type,wr_sync.step_log_id,wr_sync.step_role_name,wr_sync.step_user_name,wr_sync.step_em_id)="
                + START_PARENTHESIS
                + "SELECT wr_step_waiting.step,wr_step_waiting.step_type,wr_step_waiting.step_log_id,wr_step_waiting.role_name,wr_step_waiting.user_name,wr_step_waiting.em_id"
                + " FROM wr_step_waiting"
                + " WHERE wr_sync.wr_id=wr_step_waiting.wr_id "
                + SQL_AND + START_PARENTHESIS + " wr_step_waiting.role_name="
                + SqlUtils.formatValueForSql(userRole) + " OR  wr_step_waiting.user_name="
                + SqlUtils.formatValueForSql(userName) + " OR  wr_step_waiting.em_id " + " IN ("
                + " SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.em_id = wr_step_waiting.em_id AND workflow_substitutes.em_id="
                + SqlUtils.formatValueForSql(emId)
                + " AND workflow_substitutes.steptype_or_role = wr_step_waiting.step_type "
                + SQL_AND + START_PARENTHESIS
                + " workflow_substitutes.start_date_unavailable IS NULL  OR workflow_substitutes.start_date_unavailable <="
                + SQL_CURRENT_DATE + END_PARENTHESIS + SQL_AND + START_PARENTHESIS
                + " workflow_substitutes.end_date_unavailable IS NULL  OR workflow_substitutes.end_date_unavailable >="
                + SQL_CURRENT_DATE + ")))" + ")";

        return SqlUtils.isOracle() ? oracleSql : sql;

    }

    /**
     * Generates the query used to update the escalated_completion and escalated_response fields in
     * the wr_sync table.
     *
     * @param userName of the logged in user.
     * @return generated update query.
     */
    public static String getUpdateActivityLogValuesQuery(final String userName) {
        final String sql = SQL_UPDATE + WR_SYNC_TABLE + SQL_SET
                + "wr_sync.escalated_completion=activity_log.escalated_completion,"
                + "wr_sync.escalated_response = activity_log.escalated_response,"
                + SET_LAST_MODIFIED + SQL_FROM + ACTIVITY_LOG_TABLE
                + " WHERE wr_sync.wr_id=activity_log.wr_id "
                + " AND (wr_sync.escalated_completion <> activity_log.escalated_completion OR wr_sync.escalated_response <> activity_log.escalated_response)"
                + SQL_AND + WR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY + EQUAL
                + SqlUtils.formatValueForSql(userName);

        final String oracleSql = SQL_UPDATE + WR_SYNC_TABLE + SQL_SET
                + "(wr_sync.escalated_completion,wr_sync.escalated_response,wr_sync.last_modified) = "
                + " (SELECT activity_log.escalated_completion, activity_log.escalated_response,"
                + System.currentTimeMillis() + " FROM activity_log"
                + " WHERE wr_sync.wr_id=activity_log.wr_id)"
                + " WHERE EXISTS(SELECT 1 FROM activity_log WHERE wr_sync.wr_id=activity_log.wr_id"
                + " AND (wr_sync.escalated_completion <> activity_log.escalated_completion" + SQL_OR
                + " wr_sync.escalated_response <> activity_log.escalated_response))" + SQL_AND
                + WR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY + EQUAL
                + SqlUtils.formatValueForSql(userName);

        return SqlUtils.isOracle() ? oracleSql : sql;
    }

    /**
     * Generates the query used to update the is_req_supervisor field in the wr_sync table.
     *
     * @param userName of the logged in user.
     * @param emId employee id of the logged in user.
     * @param userEmail email of the logged in user.
     * @return query string.
     */
    public static String getUpdateSupervisorQuery(final String userName, final String emId,
            final String userEmail) {

        final String sql = SQL_UPDATE + WR_SYNC_TABLE + SQL_SET + "wr_sync.is_req_supervisor=1,"
                + SET_LAST_MODIFIED + SQL_WHERE + "wr_sync.wr_id IN( " + SQL_SELECT + " wr_id  "
                + SQL_FROM + WR_TABLE + SQL_WHERE + START_PARENTHESIS + " wr.supervisor="
                + SqlUtils.formatValueForSql(emId) + SQL_OR + START_PARENTHESIS
                + "  wr.supervisor IS NULL AND wr.work_team_id IN (SELECT cf_work_team.work_team_id FROM cf,cf_work_team WHERE cf.cf_id = cf_work_team.cf_id AND cf.is_supervisor = 1 AND cf.email="
                + SqlUtils.formatValueForSql(userEmail) + END_PARENTHESIS + END_PARENTHESIS
                + " OR wr.supervisor IN  " + START_PARENTHESIS
                + " SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.steptype_or_role='supervisor'"
                + SQL_AND + "workflow_substitutes.substitute_em_id="
                + SqlUtils.formatValueForSql(emId) + SQL_AND + START_PARENTHESIS
                + WORKFLOW_SUBSTITUTES_START_DATE_UNAVAILABLE_NULL_OR_LESS_OR_EQUAL
                + SQL_CURRENT_DATE + END_PARENTHESIS + SQL_AND + START_PARENTHESIS
                + WORKFLOW_SUBSTITUTES_END_DATE_UNAVAILABLE_NULL_OR_GREATER_OR_EQUAL
                + SQL_CURRENT_DATE + END_PARENTHESIS + END_PARENTHESIS + SQL_OR + START_PARENTHESIS
                + " wr.supervisor IS NULL AND wr.work_team_id IN (SELECT cf_work_team.work_team_id FROM cf,cf_work_team WHERE cf.cf_id = cf_work_team.cf_id   "
                + " AND cf.is_supervisor=1" + " AND cf.email IN("
                + " SELECT email FROM em WHERE em_id IN ("
                + " SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.steptype_or_role='supervisor'  "
                + " AND workflow_substitutes.substitute_em_id=" + SqlUtils.formatValueForSql(emId)
                + SQL_AND + START_PARENTHESIS
                + WORKFLOW_SUBSTITUTES_START_DATE_UNAVAILABLE_NULL_OR_LESS_OR_EQUAL
                + SQL_CURRENT_DATE + END_PARENTHESIS + SQL_AND + START_PARENTHESIS
                + WORKFLOW_SUBSTITUTES_END_DATE_UNAVAILABLE_NULL_OR_GREATER_OR_EQUAL
                + SQL_CURRENT_DATE + END_PARENTHESIS + END_PARENTHESIS + END_PARENTHESIS
                + END_PARENTHESIS + END_PARENTHESIS
                + " AND wr_sync.wr_id=wr.wr_id AND wr_sync.mob_locked_by="
                + SqlUtils.formatValueForSql(userName) + ")) AND wr_sync.mob_locked_by="
                + SqlUtils.formatValueForSql(userName);

        return sql;
    }

    /**
     * Generates the query used to update the is_req_craftsperson field in the wr_sync table.
     *
     * @param userName of the logged in user.
     * @param userEmail email of the logged in user.
     * @return SQL query string.
     */
    public static String getUpdateCraftspersonQuery(final String userName, final String userEmail) {
        final String sql = "UPDATE wr_sync " + "SET wr_sync.is_req_craftsperson=1, "
                + SET_LAST_MODIFIED + SQL_WHERE + " wr_id IN( " + "SELECT wr_id  " + SQL_FROM
                + WR_TABLE + SQL_WHERE + "(wr.status IN ('I','HA','HP','HL')" + SQL_AND + " EXISTS "
                + "(SELECT 1 FROM wrcf WHERE wrcf.status = 'Active' AND wrcf.wr_id = wr.wr_id AND (wrcf.cf_id IN (select cf.cf_id from cf where cf.email="
                + SqlUtils.formatValueForSql(userEmail) + END_PARENTHESIS + " OR wrcf.cf_id IN "
                + START_PARENTHESIS
                + "SELECT workflow_substitutes.cf_id FROM workflow_substitutes,cf WHERE workflow_substitutes.substitute_cf_id =cf.cf_id and cf.email="
                + SqlUtils.formatValueForSql(userEmail)
                + " AND workflow_substitutes.steptype_or_role= 'craftsperson'  "
                + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable<="
                + SQL_CURRENT_DATE + END_PARENTHESIS
                + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >="
                + SQL_CURRENT_DATE + END_PARENTHESIS + END_PARENTHESIS + END_PARENTHESIS
                + END_PARENTHESIS + " AND wr_sync.wr_id=wr.wr_id " + END_PARENTHESIS
                + END_PARENTHESIS + " AND wr_sync.mob_locked_by="
                + SqlUtils.formatValueForSql(userName);

        return sql;
    }

    /**
     * Generates the query used to update the is_wt_self_assign field in the wr_sync table.
     *
     * @param userName of the logged in user.
     * @param userEmail email address of the logged in user.
     * @return sql query.
     */
    public static String getUpdateWorkTeamSelfAssignQuery(final String userName,
            final String userEmail) {
        final String sql = SQL_UPDATE + WR_SYNC_TABLE + SQL_SET + "wr_sync.is_wt_self_assign=1,"
                + SET_LAST_MODIFIED + SQL_WHERE + "EXISTS" + START_PARENTHESIS
                + "SELECT wr_id,(SELECT site_id FROM bl where bl.bl_id=wr.bl_id) As site_id,bl_id "
                + SQL_FROM + WR_TABLE + SQL_WHERE + "${sql.vpaRestriction} " + SQL_AND
                + " NOT EXISTS(SELECT 1 FROM wrcf WHERE wrcf.wr_id = wr.wr_id)" + SQL_AND
                + "(EXISTS (SELECT 1 FROM cf,cf_work_team WHERE cf.cf_id = cf_work_team.cf_id AND cf.is_supervisor = 0"
                + SQL_AND + "cf.email=" + SqlUtils.formatValueForSql(userEmail)
                + " AND cf_work_team.work_team_id = wr.work_team_id))" + " AND wr.status='AA'"
                + " AND EXISTS" + START_PARENTHESIS + "SELECT 1 FROM cf,cf_work_team,work_team  "
                + SQL_WHERE
                + "cf.cf_id = cf_work_team.cf_id AND cf_work_team.work_team_id = work_team.work_team_id AND work_team.cf_assign= 1"
                + " AND cf_work_team.work_team_id = wr.work_team_id AND cf.email="
                + SqlUtils.formatValueForSql(userEmail) + END_PARENTHESIS + END_PARENTHESIS
                + "AND EXISTS(SELECT 1 FROM wr where wr.wr_id = wr_sync.wr_id and wr_sync.mob_locked_by="
                + SqlUtils.formatValueForSql(userName) + END_PARENTHESIS;

        return sql;
    }

    /**
     * Generates the query used to update the estimation_comp and scheduling_comp fields in the
     * wr_sync table.
     *
     * @param userName of the logged in user.
     * @param type estimation or scheduling field to update. Valid values are estimation or
     *            scheduling.
     * @return SQL query.
     */
    public static String getUpdateEstimateAndScheduleQuery(final String userName,
            final String type) {

        final String query = SQL_UPDATE + WR_SYNC_TABLE + SQL_SET + WR_SYNC_TABLE + SQL_DOT + type
                + "_comp=1," + SET_LAST_MODIFIED + SQL_WHERE + "EXISTS( " + "SELECT 1" + SQL_FROM
                + "helpdesk_step_log  " + SQL_WHERE
                + "helpdesk_step_log.table_name='wr' AND helpdesk_step_log.date_response IS NOT NULL AND helpdesk_step_log.step_type='"
                + type + "'"
                + " AND NOT EXISTS(SELECT 1 from wr_step_waiting WHERE wr_step_waiting.user_name="
                + SqlUtils.formatValueForSql(userName) + " AND  wr_step_waiting.step_type='" + type
                + "' AND wr_step_waiting.wr_id=helpdesk_step_log.pkey_value)"
                + " AND EXISTS(SELECT 1 FROM wr_sync WHERE wr_sync.wr_id=helpdesk_step_log.pkey_value AND wr_sync.mob_locked_by="
                + SqlUtils.formatValueForSql(userName) + END_PARENTHESIS + END_PARENTHESIS;

        return query;

    }

    /**
     * Generates the query used to insert the related sync records into the wr_sync table.
     *
     * @param syncTableFields fields to include in the insert statement
     * @param userName of the logged in user.
     * @return SQL query string.
     */
    public static String getInsertRelatedSyncRecordsQuery(final String[] syncTableFields,
            final String userName) {

        // TODO: Handle sync table default values.

        final String fields = StringUtils.arrayToCommaDelimitedString(syncTableFields);

        final String insertFields =
                fields + SQL_COMMA + LAST_MODIFIED + SQL_COMMA + DELETED + SQL_COMMA + MOB_LOCKED_BY
                        + SQL_COMMA + MOB_IS_CHANGED + SQL_COMMA + "request_type";
        final String selectFields = getWorkRequestSyncSelectFields(userName, fields);

        final String sql = SQL_INSERT + SQL_INTO + WR_SYNC_TABLE + START_PARENTHESIS + insertFields
                + ") SELECT " + selectFields + SQL_COMMA + "2" + SQL_AS + " request_type "
                + SQL_FROM + "wrhwr" + SQL_WHERE
                + "(EXISTS(SELECT 1 FROM wr_sync WHERE wr_sync.wr_id=wrhwr.parent_wr_id" + SQL_AND
                + WR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY + EQUAL
                + SqlUtils.formatValueForSql(userName) + "  AND wr_sync.deleted=0)" + SQL_OR
                + " EXISTS(SELECT 1 FROM wr_sync WHERE wr_sync.parent_wr_id=wrhwr.wr_id" + SQL_AND
                + WR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY + EQUAL
                + SqlUtils.formatValueForSql(userName) + " AND wr_sync.deleted=0))"
                + " AND NOT EXISTS(SELECT 1 FROM wr_sync WHERE wr_sync.wr_id=wrhwr.wr_id" + SQL_AND
                + WR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY + EQUAL
                + SqlUtils.formatValueForSql(userName) + " AND wr_sync.deleted=0)";

        return sql;
    }

    /**
     * Returns a list of fields to use in the wr_sync table insert statements. Handles null and
     * empty space conversions that are applied by ARCHIBUS datasources.
     *
     * @param userName of the logged in user.
     * @param fields comma delimited string of field names.
     * @return a comma delimited string of fields with the timestamp sync fields populated.
     */
    private static String getWorkRequestSyncSelectFields(final String userName,
            final String fields) {

        String selectFields =
                fields + SQL_COMMA + System.currentTimeMillis() + SQL_AS + LAST_MODIFIED + SQL_COMMA
                        + ZERO + SQL_AS + DELETED + SQL_COMMA + SqlUtils.formatValueForSql(userName)
                        + SQL_AS + MOB_LOCKED_BY + SQL_COMMA + ZERO + SQL_AS + MOB_IS_CHANGED;

        // Replace fields in the select list with the statements required to handle the default
        // values.
        selectFields = selectFields.replace("cf_notes",
            "(CASE WHEN cf_notes IS NULL THEN '' WHEN LTRIM(RTRIM(cf_notes)) = '' THEN NULL ELSE LTRIM(RTRIM(cf_notes)) END) ${sql.as} cf_notes");
        selectFields = selectFields.replace("step_status",
            "(CASE WHEN step_status IS NULL THEN 'none' WHEN step_status = '' THEN NULL ELSE step_status END) ${sql.as} step_status");
        selectFields = selectFields.replace("parent_wr_id",
            "(CASE WHEN parent_wr_id IS NULL THEN 0 ELSE parent_wr_id END) ${sql.as} parent_wr_id");

        return selectFields;
    }

}
