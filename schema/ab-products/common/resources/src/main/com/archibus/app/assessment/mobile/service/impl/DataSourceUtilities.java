package com.archibus.app.assessment.mobile.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import com.archibus.app.common.mobile.util.ActivityLogUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.service.*;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Utility class. Provides methods related with data sources for Condition Assessment mobile
 * services.
 *
 * @author Cristina Moldovan
 * @since 21.2
 *
 */
@SuppressWarnings("PMD.AvoidUsingSql")
final class DataSourceUtilities {

    /**
     * Constant: field name.
     */
    public static final String FIELD_NAME = "field_name";

    /**
     * Hide default constructor.
     */
    private DataSourceUtilities() {
    }

    /**
     * Creates data source for the activity log table.
     *
     * @return activity_log data source
     */
    static DataSource createActivityLogDataSource() {
        final DataSource datasource =
                ActivityLogUtilities
                    .createActivityLogDataSource(DataSourceQueries.COMMON_COPY_FIELD_NAMES);

        datasource.addField(ACTIVITY_LOG_TABLE, ACTION_TITLE);

        datasource.addTable(PROJECT_TABLE, DataSource.ROLE_STANDARD);

        datasource.addField(PROJECT_TABLE, STATUS);

        datasource.addField(PROJECT_TABLE, PROJECT_TYPE);

        return datasource;
    }

    /**
     * Insert a new activity log record from a activity log sync record from the mobile device.
     *
     * @param record activity log_sync record
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @param setActivityTypeDescription Set the Action Title of the new record equal to the
     *            Activity Type Description of the sync record?
     * @param copyDocuments Copy also the documents of the sync record to the new record?
     * @return activity_log_id of the new record.
     */
    static int insertActivityLogRecord(final DataRecord record,
            final String[] commonCopyFieldNames, final boolean setActivityTypeDescription,
            final boolean copyDocuments) {
        // Create the activity log data source
        final DataSource datasource = createActivityLogDataSource();

        final int activityLogId =
                ActivityLogUtilities.insertActivityLogRecord(datasource, record,
                    DataSourceQueries.COMMON_COPY_FIELD_NAMES, true, true);

        return activityLogId;
    }

    /**
     * Updates the activity log record from the activity log sync record from the mobile device.
     *
     * @param record activity log_sync record
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @param setActivityTypeDescription Set the Action Title of the record equal to the Activity
     *            Type Description of the sync record?
     * @param copyDocuments Copy also the documents of the sync record to the record?
     */
    static void updateActivityLogRecord(final DataRecord record,
            final String[] commonCopyFieldNames, final boolean setActivityTypeDescription,
            final boolean copyDocuments) {
        // Create the activity log data source
        final DataSource datasource = createActivityLogDataSource();

        ActivityLogUtilities.updateActivityLogRecord(datasource, record,
            DataSourceQueries.COMMON_COPY_FIELD_NAMES, true, true);
    }

    /**
     *
     * Delete all sync data for the user to refresh mobile in the last step.
     *
     * @param userName The assessor's user name
     *
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #2.1. Statements with INSERT ... SELECT pattern.
     */
    static void deleteSyncWork(final String userName) {
        final String sql =
                String.format(
                    "DELETE FROM activity_log_sync WHERE activity_log_sync.mob_locked_by = %s",
                    SqlUtils.formatValueForSql(userName));

        SqlUtils.executeUpdate(ACTIVITY_LOG_SYNC_TABLE, sql);
    }

    /**
     *
     * Get all Web Central assigned work back to the sync table.
     *
     * @param userName The assessor's user name
     *
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #2.1. Statements with INSERT ... SELECT pattern.
     */
    static void syncFromWebCentralNewAssignedWork(final String userName) {
        insertNewSyncRecords(userName);
        updateModifiedSyncRecords(userName);
        updateDeletedSyncRecords(userName);

        copyDocsIntoSyncRecords(userName);
        deleteOrphandedDocuments();
    }

    /**
     * Inserts new Web Central records into the sync table.
     * <p>
     * Sets the last_modified timestamp of the new records.
     *
     * @param userName of the current user.
     */
    static void insertNewSyncRecords(final String userName) {
        final String sqlFormattedUserName = SqlUtils.formatValueForSql(userName);
        final String activityLogSyncFields =
                DataSourceQueries.generateFieldNames(ACTIVITY_LOG_SYNC_TABLE,
                    Arrays.asList(DataSourceQueries.COMMON_COPY_FIELD_NAMES));
        final String activityLogFields =
                DataSourceQueries.generateFieldNames(ACTIVITY_LOG_TABLE,
                    Arrays.asList(DataSourceQueries.COMMON_COPY_FIELD_NAMES));

        final String sql =
                "INSERT INTO activity_log_sync (activity_log_sync.activity_log_id,"
                        + activityLogSyncFields
                        + ", activity_log_sync.mob_locked_by,activity_log_sync.last_modified,activity_log_sync.deleted)"
                        + " SELECT activity_log.activity_log_id, "
                        + activityLogFields
                        + SQL_COMMA
                        + sqlFormattedUserName
                        + SQL_COMMA
                        + System.currentTimeMillis()
                        + ",0"
                        + " FROM activity_log "
                        + DataSourceQueries.PROJECT_TABLE_JOIN
                        + " AND activity_log.assessed_by = "
                        + sqlFormattedUserName
                        + " AND NOT EXISTS(SELECT 1 FROM activity_log_sync WHERE activity_log_sync.activity_log_id = activity_log.activity_log_id "
                        + " AND activity_log_sync.mob_locked_by=" + sqlFormattedUserName
                        + END_PARENTHESIS;

        SqlUtils.executeUpdate(ACTIVITY_LOG_SYNC_TABLE, sql);

    }

    /**
     * Updates values in the sync table for records that have been modified in Web Central.
     * <p>
     * Sets the last_modified timestamp to the current time for the modified records.
     *
     * @param userName of the logged in user.
     */
    static void updateModifiedSyncRecords(final String userName) {
        final String sql = DataSourceQueries.generateDifferenceUpdateQuery(userName);
        SqlUtils.executeUpdate(ACTIVITY_LOG_SYNC_TABLE, sql);
    }

    /**
     * Sets the deleted flag and last_modifed timestamp of records in the sync table that should be
     * removed from the client during the sync.
     *
     * @param userName of the logged in user.
     */
    static void updateDeletedSyncRecords(final String userName) {
        final String sql = DataSourceQueries.generateDeletedQuery(userName);
        SqlUtils.executeUpdate(ACTIVITY_LOG_SYNC_TABLE, sql);
    }

    /**
     * Deletes records from the document management tables that no longer have an associated record
     * in the activity_log_sync table.
     */

    static void deleteOrphandedDocuments() {
        final String sql =
                "DELETE FROM " + "%s WHERE table_name='" + ACTIVITY_LOG_SYNC_TABLE + "' "
                        + "AND NOT EXISTS(SELECT 1 FROM " + ACTIVITY_LOG_SYNC_TABLE + " WHERE "
                        + ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + AUTO_NUMBER + " = %s" + SQL_DOT
                        + "pkey_value)";

        String sqlStatement = String.format(sql, AFM_DOCVERS_TABLE, AFM_DOCVERS_TABLE);
        SqlUtils.executeUpdate(AFM_DOCVERS_TABLE, sqlStatement);

        sqlStatement = String.format(sql, AFM_DOCVERSARCH_TABLE, AFM_DOCVERSARCH_TABLE);
        SqlUtils.executeUpdate(AFM_DOCVERSARCH_TABLE, sqlStatement);

        sqlStatement = String.format(sql, AFM_DOCS_TABLE, AFM_DOCS_TABLE);
        SqlUtils.executeUpdate(AFM_DOCS_TABLE, sqlStatement);
    }

    /**
     * Retrieves the document information records along with the document version.
     *
     * @param userName of the mobile user.
     * @param tableName of the table the documents are referenced in.
     * @return Map containing the document information and indexed by the document key values.
     */
    static Map<String, DataRecord> getDocumentVersions(final String userName, final String tableName) {
        final Map<String, DataRecord> documentVersions = new HashMap<String, DataRecord>();
        String query;

        if (ACTIVITY_LOG_SYNC_TABLE.equals(tableName)) {
            query = DataSourceQueries.getSyncDocumentVersionsQuery(userName);
        } else {
            query = DataSourceQueries.getActivityLogDocumentVersionsQuery(userName);
        }

        final DataSource dataSource =
                DataSourceFactory.createDataSource().addTable(tableName).addQuery(query);

        dataSource.addQuery(query);

        dataSource.addVirtualField(tableName, ACTIVITY_LOG_ID, DataSource.DATA_TYPE_INTEGER);
        dataSource.addVirtualField(tableName, "version", DataSource.DATA_TYPE_INTEGER);
        dataSource.addVirtualField(tableName, FIELD_NAME, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(tableName, "doc_file", DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(tableName, "description", DataSource.DATA_TYPE_TEXT);

        dataSource.setMaxRecords(0);
        dataSource.setContext();

        final List<DataRecord> records = dataSource.getRecords();
        for (final DataRecord record : records) {
            final int activityLogId = record.getInt(tableName + SQL_DOT + ACTIVITY_LOG_ID);
            final String fieldName = record.getString(tableName + SQL_DOT + FIELD_NAME);
            documentVersions.put(activityLogId + "|" + fieldName, record);
        }

        return documentVersions;
    }

    /**
     * Copies the document data in the document management tables. Copies the document referenced in
     * the activity_log table to the document referenced in the activity_log_sync table.
     * <p>
     * Only copies the document if the version in the activity_log table is greater than the
     * existing version referenced in the activity_log_sync table.
     *
     * @param activityLogDocRecord DataRecord containing the activity_log document data.
     * @param syncDocRecord DataRecord containing the activity_log_sync document data.
     */
    static void copyDocument(final DataRecord activityLogDocRecord, final DataRecord syncDocRecord) {
        final Map<String, String> activityLogKey = new HashMap<String, String>();
        final Map<String, String> syncKey = new HashMap<String, String>();

        activityLogKey.put(ACTIVITY_LOG_ID,
            activityLogDocRecord.getNeutralValue(ACTIVITY_LOG_TABLE + SQL_DOT + ACTIVITY_LOG_ID));
        syncKey.put(AUTO_NUMBER,
            syncDocRecord.getNeutralValue(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + AUTO_NUMBER));

        final String docFieldName = activityLogDocRecord.getString("activity_log.field_name");
        final String docFileName = activityLogDocRecord.getString("activity_log.doc_file");
        final String docDescription = activityLogDocRecord.getString("activity_log.description");

        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");

        // The sync document is the target
        final DocumentParameters syncDocParam =
                new DocumentParameters(syncKey, ACTIVITY_LOG_SYNC_TABLE, docFieldName, docFileName,
                    docDescription, "0");

        final DocumentParameters activityLogDocParam =
                new DocumentParameters(activityLogKey, "activity_log", docFieldName, null, true);

        // copy document
        // KB 3049225 - do not interrupt the process due to errors caused by missing
        // document from afm_docs table
        try {
            documentService.copyDocument(activityLogDocParam, syncDocParam);
        } catch (final ExceptionBase e) {
            if (e.getErrorNumber() != ExceptionBase.ERROR_NUMBER_DOCUMENT_STORAGE_CORRUPTED) {
                throw e;
            }
        }

    }

    /**
     * Copy documents for fields doc, doc1, doc2. doc3. doc4 from activity_log records into
     * activity_log_sync records.
     *
     * @param userName The assessor's user name
     */
    static void copyDocsIntoSyncRecords(final String userName) {

        final Map<String, DataRecord> syncDocVersions =
                getDocumentVersions(userName, ACTIVITY_LOG_SYNC_TABLE);
        final Map<String, DataRecord> activityLogDocumentVersions =
                getDocumentVersions(userName, ACTIVITY_LOG_TABLE);
        final String updateTimestampSql =
                "UPDATE activity_log_sync SET last_modified=%d WHERE auto_number=%d";
        for (final Map.Entry<String, DataRecord> entry : syncDocVersions.entrySet()) {
            final String key = entry.getKey();
            if (activityLogDocumentVersions.containsKey(key)) {
                final int syncDocumentVersion =
                        entry.getValue().getInt("activity_log_sync.version");
                final int activityLogDocumentVersion =
                        activityLogDocumentVersions.get(key).getInt("activity_log.version");

                if (syncDocumentVersion < activityLogDocumentVersion) {
                    copyDocument(activityLogDocumentVersions.get(key), entry.getValue());
                    // Update last modified timestamp in the sync table.
                    final int autoNumber = entry.getValue().getInt("activity_log_sync.auto_number");
                    final String sql =
                            String.format(updateTimestampSql, System.currentTimeMillis(),
                                autoNumber);
                    SqlUtils.executeUpdate("activity_log_sync", sql);
                }
            }
        }

    }
}
