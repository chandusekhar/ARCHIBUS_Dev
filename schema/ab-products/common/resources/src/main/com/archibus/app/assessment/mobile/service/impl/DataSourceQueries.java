package com.archibus.app.assessment.mobile.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import org.springframework.util.StringUtils;

import com.archibus.datasource.SqlUtils;

/**
 *
 * Utility class. Provides methods used to generate queries for the Condition Assessment app sync.
 *
 * @author Jeff Martin
 * @since 23.1
 *
 */
@SuppressWarnings("PMD.AvoidUsingSql")
final class DataSourceQueries {

    /**
     * Field names to copy between inventory and sync tables.
     */
    public static final String[] COMMON_COPY_FIELD_NAMES = { PROJECT_ID, ACTIVITY_TYPE, ASSESSED_BY,
            DATE_ASSESSED, REC_ACTION, COND_PRIORITY, SUST_PRIORITY, COND_VALUE, DESCRIPTION,
            QUESTIONNAIRE_ID, ACT_QUEST, SITE_ID, BL_ID, FL_ID, RM_ID, EQ_ID, LOCATION, DOC, DOC1,
            DOC2, DOC3, DOC4, COST_EST_CAP, COST_ESTIMATED
			,COST_FIM, COST_ANNUAL_SAVE, UC_FIM };

    /**
     * Project table JOIN relationship.
     */
    public static final String PROJECT_TABLE_JOIN =
            " LEFT OUTER JOIN project ON activity_log.project_id=project.project_id"
                    + " WHERE project.status='Issued-In Process' AND project.project_type IN('ASSESSMENT','ASSESSMENT - ENVIRONMENTAL','COMMISSIONING')";

    /**
     * SQL FROM keyword.
     */
    private static final String SQL_FROM = " FROM ";

    /**
     * SQL UPDATE keyword.
     */
    private static final String SQL_UPDATE = " UPDATE ";

    /**
     * Hide default constructor.
     */
    private DataSourceQueries() {
    }

    /**
     * Generates the SQL query used to update records in the sync table that are marked for deletion
     * on the client.
     *
     * @param userName of the logged in user.
     * @return SQL query.
     */
    static String generateDeletedQuery(final String userName) {
        final String deletedSql =
                "SELECT activity_log_id FROM activity_log_sync" + " WHERE mob_locked_by = '"
                        + userName + QUOTE + " AND NOT EXISTS(SELECT 1 FROM activity_log"
                        + PROJECT_TABLE_JOIN + " AND " + getAssessedByRestriciton(userName)
                        + " AND activity_log.activity_log_id=activity_log_sync.activity_log_id)";

        final String sql = SQL_UPDATE + ACTIVITY_LOG_SYNC_TABLE + " SET last_modified ="
                + System.currentTimeMillis() + ",deleted=1 WHERE mob_locked_by='" + userName + QUOTE
                + " AND deleted <> 1 AND activity_log_id IN(" + deletedSql + ")";

        return sql;
    }

    /**
     * Generates a query that compares the fields in the sync table to the WC table. The query
     * returns the activity_log_id values for any records that do no match between the tables.
     *
     * @param userName user name of the logged in user.
     * @return the constructed query.
     */
    static String generateDifferenceQuery(final String userName) {

        final List<String> commonFields =
                new ArrayList<String>(Arrays.asList(COMMON_COPY_FIELD_NAMES));
        commonFields.add(0, ACTIVITY_LOG_ID);
        final String activityLogSyncFields =
                generateFieldNames(ACTIVITY_LOG_SYNC_TABLE, commonFields);
        final String activityLogFields = generateFieldNames(ACTIVITY_LOG_TABLE, commonFields);

        final String exceptOperator = SqlUtils.isOracle() ? " MINUS " : " EXCEPT ";
        final String sql = "SELECT diff." + ACTIVITY_LOG_ID + SQL_FROM + "( SELECT "
                + activityLogFields + SQL_FROM + ACTIVITY_LOG_TABLE + PROJECT_TABLE_JOIN + " AND "
                + getAssessedByRestriciton(userName) + exceptOperator + " SELECT "
                + activityLogSyncFields + SQL_FROM + ACTIVITY_LOG_SYNC_TABLE
                + " WHERE mob_locked_by='" + userName + "') diff";

        return sql;
    }

    /**
     * Generates the query used to determine the difference between the Web Central table and the
     * sync table.
     *
     * @param userName of the current user.
     * @return query string.
     */
    static String generateDifferenceUpdateQuery(final String userName) {

        final String differenceQuery = generateDifferenceQuery(userName);
        final String differenceUpdateQuery = generateSyncDifferenceUpdateQuery();

        final String sql = differenceUpdateQuery + " AND activity_log_sync.activity_log_id IN("
                + differenceQuery + END_PARENTHESIS;

        return sql;

    }

    /**
     * Generates the query used to update the sync table with values that have been modified in the
     * Web Central table.
     *
     * @return update query to be applied to the sync table.
     */
    static String generateSyncDifferenceUpdateQuery() {
        final List<String> activityLogSyncFields =
                new ArrayList<String>(Arrays.asList(COMMON_COPY_FIELD_NAMES));
        activityLogSyncFields.add(0, ACTIVITY_LOG_ID);
        activityLogSyncFields.add(DELETED);
        activityLogSyncFields.add(LAST_MODIFIED);

        final List<String> activityLogFields =
                new ArrayList<String>(Arrays.asList(COMMON_COPY_FIELD_NAMES));
        activityLogFields.add(0, ACTIVITY_LOG_ID);
        // Set the deleted flag to 0
        activityLogFields.add("0");
        final long timeStamp = System.currentTimeMillis();
        activityLogFields.add(Long.toString(timeStamp));

        final String sql;
        if (SqlUtils.isOracle()) {
            sql = generateOracleUpdateQuery(activityLogSyncFields, activityLogFields);
        } else {
            sql = generateUpateQuery(activityLogSyncFields, activityLogFields);
        }
        return sql;
    }

    /**
     * Generates the update statement used by Oracle databases.
     *
     * @param activityLogSyncFields list of fields to update in the activity_log_sync table.
     * @param activityLogFields list of fields to update from the activity log table.
     * @return update query.
     */
    static String generateOracleUpdateQuery(final List<String> activityLogSyncFields,
            final List<String> activityLogFields) {

        final String syncFieldNames =
                StringUtils.collectionToCommaDelimitedString(activityLogSyncFields);
        final String activityLogFieldNames =
                StringUtils.collectionToCommaDelimitedString(activityLogFields);

        final String sql = SQL_UPDATE + ACTIVITY_LOG_SYNC_TABLE + " SET(" + syncFieldNames + ") = ("
                + "SELECT " + activityLogFieldNames + SQL_FROM + ACTIVITY_LOG_TABLE
                + " WHERE activity_log_sync.activity_log_id = activity_log.activity_log_id)"
                + " WHERE EXISTS (SELECT 1 FROM activity_log where activity_log_sync.ACTIVITY_LOG_ID = activity_log.ACTIVITY_LOG_ID)";

        return sql;

    }

    /**
     * Generates the update statement used by Sybase and SQL Server databases.
     *
     * @param activityLogSyncFields list of fields to update in the activity_log_sync table.
     * @param activityLogFields list of fields to update from the activity log table.
     * @return update query.
     */
    static String generateUpateQuery(final List<String> activityLogSyncFields,
            final List<String> activityLogFields) {

        final List<String> updateFields = new ArrayList<String>();

        for (int i = 0; i < activityLogSyncFields.size(); i++) {
            final String activityLogSyncFieldName = activityLogSyncFields.get(i);
            final String activityLogSyncField =
                    ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + activityLogSyncFields.get(i);
            String activityLogField = activityLogFields.get(i);

            // The activity_log values for the deleted and last_modified fields should not have
            // the table name prefix applied.
            if (!(LAST_MODIFIED.equals(activityLogSyncFieldName)
                    || DELETED.equals(activityLogSyncFieldName))) {
                activityLogField = ACTIVITY_LOG_TABLE + SQL_DOT + activityLogField;
            }
            updateFields.add(activityLogSyncField + "=" + activityLogField);
        }

        final String sql = "UPDATE " + ACTIVITY_LOG_SYNC_TABLE + " SET "
                + StringUtils.collectionToCommaDelimitedString(updateFields) + SQL_FROM
                + ACTIVITY_LOG_TABLE
                + " WHERE activity_log_sync.activity_log_id = activity_log.activity_log_id";

        return sql;
    }

    /**
     * Returns a list containing the full field names of the fields.
     *
     * @param tableName table name
     * @param fields list of field names
     * @return comma delimited list of fields.
     */
    public static String generateFieldNames(final String tableName, final List<String> fields) {
        final List<String> fieldNames = new ArrayList<String>();
        for (final String field : fields) {
            fieldNames.add(tableName + "." + field);
        }

        return StringUtils.collectionToCommaDelimitedString(fieldNames);
    }

    /**
     * Returns the assessed by restriction for the current user.
     *
     * @param userName of the logged in user.
     * @return SQL restriction.
     */
    private static String getAssessedByRestriciton(final String userName) {
        return " assessed_by=" + SqlUtils.formatValueForSql(userName);
    }

    /**
     * Generates the query used to retrieve the document version information for each of the
     * document fields contained in the activity_log table.
     *
     * @param userName of the mobile user.
     * @return SQL query string.
     */
    static String getActivityLogDocumentVersionsQuery(final String userName) {

        final String query =
                "SELECT activity_log.activity_log_id,docVersions.version,docVersions.field_name,docVersions.doc_file,docVersions.description"
                        + " FROM activity_log" + " JOIN " + getDocVersionQuery(ACTIVITY_LOG_TABLE)
                        + " ON activity_log.activity_log_id=docVersions.pkey_value"
                        + " JOIN activity_log_sync ON activity_log.activity_log_id=activity_log_sync.activity_log_id AND activity_log_sync.assessed_by="
                        + SqlUtils.formatValueForSql(userName);

        return query;

    }

    /**
     * Generates the query used to retrieve the document version information for each of the
     * document fields contained in the activity_log_sync table.
     *
     * @param userName of the mobile user.
     * @return SQL query string.
     */
    static String getSyncDocumentVersionsQuery(final String userName) {

        final String query =
                "SELECT docFields.auto_number,docFields.activity_log_id,docFields.doc_field_name ${sql.as} field_name,docFields.doc_field ${sql.as} doc_file, "
                        + "CASE WHEN docVersions.version IS NULL THEN 0 ELSE docVersions.version END ${sql.as} version, docVersions.description ${sql.as} description  "
                        + "FROM ( "
                        + "SELECT auto_number,activity_log_id,'doc' ${sql.as} doc_field_name,doc ${sql.as} doc_field from activity_log_sync WHERE doc IS NOT NULL "
                        + SQL_UNION
                        + "SELECT auto_number,activity_log_id,'doc1',doc1 from activity_log_sync WHERE doc1 IS NOT NULL "
                        + SQL_UNION
                        + "SELECT auto_number,activity_log_id,'doc2',doc2 from activity_log_sync WHERE doc2 IS NOT NULL "
                        + SQL_UNION
                        + "SELECT auto_number,activity_log_id,'doc3',doc3 from activity_log_sync WHERE doc3 IS NOT NULL "
                        + SQL_UNION
                        + "SELECT auto_number,activity_log_id,'doc4',doc4 from activity_log_sync WHERE doc4 IS NOT NULL "
                        + ") docFields " + "LEFT OUTER JOIN  "
                        + getDocVersionQuery(ACTIVITY_LOG_SYNC_TABLE)
                        + " ON docVersions.pkey_value=docFields.auto_number AND docVersions.field_name=docFields.doc_field_name"
                        + " WHERE EXISTS(SELECT 1 FROM activity_log_sync WHERE activity_log_sync.activity_log_id=docFields.activity_log_id AND activity_log_sync.assessed_by="
                        + SqlUtils.formatValueForSql(userName) + ")"
                        + " GROUP BY docFields.auto_number,docFields.activity_log_id,docFields.doc_field_name,docFields.doc_field,docVersions.version,docVersions.description";

        return query;

    }

    /**
     * Generates a SQL query used to retrieve the latest version of each document in the referenced
     * table.
     *
     * @param tableName table name of the table referencing the documents.
     * @return SQL query string.
     */
    private static String getDocVersionQuery(final String tableName) {
        final String sql =
                "(SELECT max(version) ${sql.as} version,afm_docvers.table_name,afm_docvers.field_name,afm_docvers.doc_file,afm_docvers.pkey_value,afm_docs.description"
                        + " FROM afm_docvers"
                        + " JOIN afm_docs ON afm_docvers.table_name=afm_docs.table_name AND afm_docvers.field_name=afm_docs.field_name AND afm_docvers.pkey_value=afm_docs.pkey_value"
                        + " WHERE afm_docvers.table_name=" + SqlUtils.formatValueForSql(tableName)
                        + " GROUP BY afm_docvers.table_name,afm_docvers.field_name,afm_docvers.doc_file,afm_docvers.pkey_value,afm_docs.description"
                        + ") docVersions ";

        return sql;
    }

}
