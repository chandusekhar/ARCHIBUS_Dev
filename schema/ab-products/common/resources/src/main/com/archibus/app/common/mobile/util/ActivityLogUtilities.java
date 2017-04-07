package com.archibus.app.common.mobile.util;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 *
 * Utility class. Provides methods to insert, update, delete activity_log and activity_log_sync
 * records for mobile apps.
 * <p>
 *
 * @author Cristina Reghina
 * @since 21.3
 *
 */
public final class ActivityLogUtilities {

    /**
     * Document field names for activity_log table.
     */
    public static final String[] DOCUMENT_FIELD_NAMES_ACTIVITY_LOG =
        { DOC, DOC1, DOC2, DOC3, DOC4 };

    /**
     * Hide default constructor.
     */
    private ActivityLogUtilities() {
    }

    /**
     * Creates data source for the activity log table.
     *
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @return activity_log data source
     */
    public static DataSource createActivityLogDataSource(final String[] commonCopyFieldNames) {
        final DataSource datasource =
                createBaseWorkDataSource(ACTIVITY_LOG_TABLE, commonCopyFieldNames);

        return datasource;
    }

    /**
     * Creates data source for the activity log sync table.
     *
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @return activity_log_sync data source
     */
    public static DataSource createActivityLogSyncDataSource(final String[] commonCopyFieldNames) {
        final DataSource datasource =
                createBaseWorkDataSource(ACTIVITY_LOG_SYNC_TABLE, commonCopyFieldNames);

        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, MOB_IS_CHANGED);
        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, MOB_LOCKED_BY);
        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, LAST_MODIFIED);

        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, DOC_ISNEW);
        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, DOC1_ISNEW);
        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, DOC2_ISNEW);
        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, DOC3_ISNEW);
        datasource.addField(ACTIVITY_LOG_SYNC_TABLE, DOC4_ISNEW);

        return datasource;
    }

    /**
     * Creates a base data source with the common elements for the activity log and the activity log
     * sync table.
     *
     * @param tableName - Either activity_log or activity_log_sync
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @return datasource - The data source of either activity_log_sync or activity_log with the
     *         common fields
     */
    static DataSource createBaseWorkDataSource(final String tableName,
            final String[] commonCopyFieldNames) {
        final DataSource datasource = DataSourceFactory.createDataSource();

        datasource.addTable(tableName, DataSource.ROLE_MAIN);

        // Fields that are common between the activity_log_sync and activity_log tables
        datasource.addField(tableName, ACTIVITY_LOG_ID);

        for (final String fieldName : commonCopyFieldNames) {
            datasource.addField(tableName, fieldName);
        }

        return datasource;
    }

    /**
     * Insert a new activity log record from a activity log sync record from the mobile device.
     *
     * @param activityLogDatasource Datasource to use for activity_log; if null, a datasource with
     *            commonCopyFieldNames will be created
     * @param record activity log_sync record
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @param setActivityTypeDescription Set the Action Title of the new record equal to the
     *            Activity Type Description of the sync record?
     * @param copyDocuments Copy also the documents of the sync record to the new record?
     * @return activity_log_id of the inserted record.
     */
    public static int insertActivityLogRecord(final DataSource activityLogDatasource,
            final DataRecord record, final String[] commonCopyFieldNames,
            final boolean setActivityTypeDescription, final boolean copyDocuments) {
        // Create the activity log data source if not passed
        final DataSource datasource =
                activityLogDatasource == null ? createActivityLogDataSource(commonCopyFieldNames)
                        : activityLogDatasource;

                // Open a new record to save the data for the new activity log
                DataRecord newRecord = datasource.createNewRecord();

                // copy values from sync record
                copyActivityLogSyncRecord(record, newRecord, commonCopyFieldNames);

                // set as Action Title the activitytype.description
                if (setActivityTypeDescription) {
                    copyActivityTypeDescriptionToActionTitle(newRecord);
                }

                newRecord = datasource.saveRecord(newRecord);
                final int activityLogId = newRecord.getInt(ACTIVITY_LOG_TABLE + SQL_DOT + ACTIVITY_LOG_ID);

                // copy the attached documents
                if (copyDocuments) {
                    // Get the document fields from the record where the _isnew field is set.
                    final String[] fieldsToCopy =
                            getDocumentFieldsToCopy(DOCUMENT_FIELD_NAMES_ACTIVITY_LOG, record);

                    if (fieldsToCopy.length > 0) {
                        DocumentsUtilities.copyDocuments(fieldsToCopy, record, newRecord);
                    }
                }

                return activityLogId;
    }

    /**
     * Copies field values from the activity log sync record to the activity log record.
     *
     * @param sourceRecord The activity log sync record
     * @param destinationRecord The activity log record
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     */
    private static void copyActivityLogSyncRecord(final DataRecord sourceRecord,
            final DataRecord destinationRecord, final String[] commonCopyFieldNames) {

        for (final String fieldName : commonCopyFieldNames) {
            destinationRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + fieldName,
                sourceRecord.getValue(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + fieldName));
        }
    }

    /**
     *
     * Retrieves the activity type description and set it to Activity Log's Action Title.
     *
     * @param activityLogRecord The Activity Log record
     */
    private static void copyActivityTypeDescriptionToActionTitle(final DataRecord activityLogRecord) {
        final String activityType =
                activityLogRecord.getString(ACTIVITY_LOG_TABLE + SQL_DOT + ACTIVITY_TYPE);

        final DataSource activityTypeDS = DataSourceFactory.createDataSource();

        activityTypeDS.addTable(ACTIVITY_TYPE_TABLE, DataSource.ROLE_MAIN);
        activityTypeDS.addField(ACTIVITY_TYPE);
        activityTypeDS.addField(DESCRIPTION);
        activityTypeDS.addRestriction(Restrictions.eq(ACTIVITY_TYPE_TABLE, ACTIVITY_TYPE,
            activityType));

        final DataRecord activityTypeRecord = activityTypeDS.getRecord();

        if (activityTypeRecord != null) {
            activityLogRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + ACTION_TITLE,
                activityTypeRecord.getString(ACTIVITY_TYPE_TABLE + SQL_DOT + DESCRIPTION));
        }
    }

    /**
     * Updates the activity log record from the activity log sync record from the mobile device.
     *
     * @param activityLogDatasource Datasource to use for activity_log
     * @param record activity log_sync record
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @param setActivityTypeDescription Set the Action Title of the record equal to the Activity
     *            Type Description of the sync record?
     * @param copyDocuments Copy also the documents of the sync record to the record?
     */
    public static void updateActivityLogRecord(final DataSource activityLogDatasource,
            final DataRecord record, final String[] commonCopyFieldNames,
            final boolean setActivityTypeDescription, final boolean copyDocuments) {
        // Create the activity log data source if not passed
        final DataSource datasource =
                activityLogDatasource == null ? createActivityLogDataSource(commonCopyFieldNames)
                        : activityLogDatasource;

                final int activityLogId =
                        record.getInt(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + ACTIVITY_LOG_ID);

                final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
                restriction.addClause(ACTIVITY_LOG_TABLE, ACTIVITY_LOG_ID, activityLogId, Operation.EQUALS);

                // Get the activity log record
                final List<DataRecord> updateRecords = datasource.getRecords(restriction);

                if (!updateRecords.isEmpty()) {
                    final DataRecord updateRecord = updateRecords.get(0);

                    // copy values from sync record
                    copyActivityLogSyncRecord(record, updateRecord, commonCopyFieldNames);

                    // set as Action Title the activitytype.description
                    if (setActivityTypeDescription) {
                        copyActivityTypeDescriptionToActionTitle(updateRecord);
                    }

                    datasource.saveRecord(updateRecord);

            // copy the attached documents
                    if (copyDocuments) {
                        // Get the document fields from the record where the _isnew field is set.
                        final String[] fieldsToCopy =
                                getDocumentFieldsToCopy(DOCUMENT_FIELD_NAMES_ACTIVITY_LOG, record);

                        if (fieldsToCopy.length > 0) {
                            DocumentsUtilities.copyDocuments(fieldsToCopy, record, updateRecord);
                        }
                    }
                }
    }

    /**
     * Insert a new activity log sync record from a activity log record from the server.
     *
     * @param record activity log record
     * @param userName The user name
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @param copyDocuments Copy also the documents of the sync record to the record?
     */
    public static void insertActivityLogSyncRecord(final DataRecord record, final String userName,
            final String[] commonCopyFieldNames, final boolean copyDocuments) {
        // Create the activity log sync data source
        final DataSource datasource = createActivityLogSyncDataSource(commonCopyFieldNames);

        // Open a new record to save the data in the activity log sync table
        DataRecord newRecord = datasource.createNewRecord();

        copyActivityLogRecord(record, newRecord, userName, commonCopyFieldNames);

        newRecord = datasource.saveRecord(newRecord);

        // copy the attached documents
        if (copyDocuments) {
            DocumentsUtilities.copyDocuments(DOCUMENT_FIELD_NAMES_ACTIVITY_LOG, record, newRecord);
        }
    }

    /**
     * Copies field values from the activity log record to the activity log sync record. Sets
     * mob_locked_by = current user
     *
     * @param sourceRecord The activity log record
     * @param destinationRecord The activity log sync record
     * @param userName The user name
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     */
    private static void copyActivityLogRecord(final DataRecord sourceRecord,
            final DataRecord destinationRecord, final String userName,
            final String[] commonCopyFieldNames) {

        // set locked on mobile by the current user
        destinationRecord.setValue(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY, userName);

        destinationRecord.setValue(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + ACTIVITY_LOG_ID,
            sourceRecord.getValue(ACTIVITY_LOG_TABLE + SQL_DOT + ACTIVITY_LOG_ID));

        for (final String fieldName : commonCopyFieldNames) {
            destinationRecord.setValue(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + fieldName,
                sourceRecord.getValue(ACTIVITY_LOG_TABLE + SQL_DOT + fieldName));
        }

    }

    /**
     * Deletes all activity log sync records of the user. Note: Cascading deletion or the document
     * records does not occur. The activity_log_sync table does not have the FK relationships
     * required to trigger cascading deletes.
     *
     * @param userName The user name
     * @param commonCopyFieldNames Common fields for activity_log and activity_lof_sync tables
     * @param restrictions array list of restrictions to apply to the datasource for retrieving the
     *            records to delete
     */
    public static void deleteActivityLogSyncRecords(final String userName,
            final String[] commonCopyFieldNames, final List<Restriction> restrictions) {
        final DataSource datasource = createActivityLogSyncDataSource(commonCopyFieldNames);
        datasource.setContext();
        datasource.setMaxRecords(0);

        datasource
        .addRestriction(Restrictions.eq(ACTIVITY_LOG_SYNC_TABLE, MOB_LOCKED_BY, userName));

        for (final Restriction restriction : restrictions) {
            datasource.addRestriction(restriction);
        }

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            datasource.deleteRecord(record);
        }
    }

    /**
     * Returns the list of document fields where the associated doc_isnew field is true.
     *
     * @param docFieldNames the document fields contained in the sync table.
     * @param record to inspect
     * @return array of document fields
     */
    static String[] getDocumentFieldsToCopy(final String[] docFieldNames, final DataRecord record) {

        final List<String> fieldsToCopy = new ArrayList<String>();
        for (final String fieldName : docFieldNames) {
            final int isNew =
                    record.getInt(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + fieldName + "_isnew");
            if (isNew == 1) {
                fieldsToCopy.add(fieldName);
            }
        }

        return fieldsToCopy.toArray(new String[fieldsToCopy.size()]);
    }
}
