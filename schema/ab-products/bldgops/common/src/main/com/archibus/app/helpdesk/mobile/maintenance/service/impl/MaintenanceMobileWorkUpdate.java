package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Provides supporting methods related to synchronizing the data in the main work request tables.
 * Supports the MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.1
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobileWorkUpdate {

    /**
     * Document field names for wr table.
     */
    public static final String[] DOCUMENT_FIELD_NAMES_WR = { DOC1, DOC2, DOC3, DOC4 };

    /**
     * Document field names for activity_log table.
     */
    public static final String[] DOCUMENT_FIELD_NAMES_ACTIVITY_LOG = { DOC1, DOC2, DOC3, DOC4 };

    /**
     * AbBldgOpsHelpDesk activity.
     */
    private static final String HELP_DESK_ACTIVITY = "AbBldgOpsHelpDesk";

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileWorkUpdate() {
    }

    /**
     * Insert a new work request record from a work request sync record from the mobile device.
     *
     * @param record wr_sync record
     * @param mobPendingAction - if set to "Com" we update the completed_by field
     * @return wrId - work request code
     */
    static int insertWorkRequestRecord(final DataRecord record, final String mobPendingAction) {
        // Start a new work request record
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_TABLE, WR_FIELDS);

        DataRecord newRecord = datasource.createNewRecord();

        final String blId = record.getString(WR_SYNC_TABLE + SQL_DOT + BL_ID);

        final String siteId = MaintenanceMobileUtility.getSiteId(blId);

        // Set the activity_type field to the default value. This is not set at the mobile.
        newRecord.setValue(WR_TABLE + SQL_DOT + ACTIVITY_TYPE, DEFAULT_ACTIVITY_TYPE);

        newRecord.setValue(WR_TABLE + SQL_DOT + BL_ID, blId);

        newRecord.setValue(WR_TABLE + SQL_DOT + SITE_ID, siteId);

        newRecord.setValue(WR_TABLE + SQL_DOT + DATE_REQUESTED,
            retrieveCurrentLocalDate(blId, siteId));

        newRecord.setValue(WR_TABLE + SQL_DOT + TIME_REQUESTED,
            retrieveCurrentLocalTime(blId, siteId));

        // Copy all the doc fields as this is a new record
        final String[] textFields =
                { CF_NOTES, CAUSE_TYPE, DESCRIPTION, DOC1, DOC2, DOC3, DOC4, EQ_ID, FL_ID,
                        LOCATION, PROB_TYPE, REPAIR_TYPE, REQUESTOR, RM_ID, TR_ID };
        for (final String fieldName : textFields) {
            newRecord.setValue(WR_TABLE + SQL_DOT + fieldName,
                record.getString(WR_SYNC_TABLE + SQL_DOT + fieldName));
        }

        final String[] dateFields =
                { DATE_ASSIGNED, DATE_EST_COMPLETION, DATE_ESCALATION_COMPLETION };
        for (final String fieldName : dateFields) {
            newRecord.setValue(WR_TABLE + SQL_DOT + fieldName,
                record.getDate(WR_SYNC_TABLE + SQL_DOT + fieldName));
        }

        newRecord.setValue(WR_TABLE + SQL_DOT + PRIORITY,
            record.getInt(WR_SYNC_TABLE + SQL_DOT + PRIORITY));

        // Set the status to Issued
        newRecord.setValue(WR_TABLE + SQL_DOT + STATUS, STATUS_I);

        if (COMPLETED_STATUS.equals(mobPendingAction)) {
            newRecord.setValue(WR_TABLE + SQL_DOT + COMPLETED_BY, ContextStore.get().getUser()
                .getEmployee().getId());
        }

        newRecord = datasource.saveRecord(newRecord);
        datasource.commit();

        // copy the attached documents
        final String[] fieldsToCopy =
                MaintenanceMobileUtility.getDocumentFieldsToCopy(DOCUMENT_FIELD_NAMES_WR, record);

        if (fieldsToCopy.length > 0) {
            DocumentsUtilities.copyDocuments(fieldsToCopy, record, newRecord);
        }

        return newRecord.getInt(WR_TABLE + SQL_DOT + WR_ID);
    }

    /**
     * Insert a new activity log record from a work request sync record from the mobile device.
     *
     * @param record wr_sync record
     * @return activity_log_id Activity Log ID
     */
    static int insertActivityLogRecord(final DataRecord record) {
        // Create the activity log data source
        final DataSource datasource =
                DataSourceFactory
                    .createDataSourceForFields(ACTIVITY_LOG_TABLE, ACTIVITY_LOG_FIELDS);

        // Open a new record to save the data for the new activity log
        DataRecord newRecord = datasource.createNewRecord();

        final String blId = record.getString(WR_SYNC_TABLE + SQL_DOT + BL_ID);

        final String siteId = MaintenanceMobileUtility.getSiteId(blId);

        final String emId = ContextStore.get().getUser().getEmployee().getId();

        // when current user is not an employee, will cause null pinter error, so only set the dv dp
        // when emId is not null and empty
        if (StringUtil.notNullOrEmpty(emId)) {
            final String[] dvDpArray = getDvDpArray(emId);
            final String dvId = dvDpArray[0];
            final String dpId = dvDpArray[1];

            // Set the activity_log division and department values
            newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + DV_ID, dvId);
            newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + DP_ID, dpId);
        }

        // Set the activity_type field to the default value. This is not set at the mobile.
        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + ACTIVITY_TYPE, DEFAULT_ACTIVITY_TYPE);

        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + SITE_ID, siteId);

        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + TIME_REQUESTED,
            retrieveCurrentLocalTime(blId, siteId));

        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + DATE_REQUESTED,
            retrieveCurrentLocalDate(blId, siteId));

        // Copy all the doc fields as this is a new activity log record
        final String[] textFields =
                { BL_ID, CAUSE_TYPE, DOC1, DOC2, DOC3, DOC4, EQ_ID, FL_ID, LOCATION, DESCRIPTION,
                        PROB_TYPE, REPAIR_TYPE, REQUESTOR, RM_ID, TR_ID };
        for (final String fieldName : textFields) {
            newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + fieldName,
                record.getString(WR_SYNC_TABLE + SQL_DOT + fieldName));
        }

        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + COMMENTS,
            record.getString(WR_SYNC_TABLE + SQL_DOT + CF_NOTES));

        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + CREATED_BY,
            record.getString(WR_SYNC_TABLE + SQL_DOT + REQUESTOR));

        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + DATE_SCHEDULED,
            record.getDate(WR_SYNC_TABLE + SQL_DOT + DATE_EST_COMPLETION));

        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + PRIORITY,
            record.getInt(WR_SYNC_TABLE + SQL_DOT + PRIORITY));

        // Create the activity log with status CREATED
        newRecord.setValue(ACTIVITY_LOG_TABLE + SQL_DOT + STATUS, "CREATED");

        newRecord = datasource.saveRecord(newRecord);
        // datasource.commit();

        // copy the attached documents
        DocumentsUtilities.copyDocuments(DOCUMENT_FIELD_NAMES_ACTIVITY_LOG, record, newRecord);

        return newRecord.getInt(ACTIVITY_LOG_TABLE + SQL_DOT + ACTIVITY_LOG_ID);
    }

    /**
     *
     * Returns the current local time.
     *
     * @param blId Building code
     * @param siteId Site code
     * @return Current local time
     */
    private static java.sql.Time retrieveCurrentLocalTime(final String blId, final String siteId) {
        final java.sql.Time currentLocalTime =
                LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
        return currentLocalTime;
    }

    /**
     *
     * Returns the current local date.
     *
     * @param blId Building code
     * @param siteId Site code
     * @return Current local date
     */
    private static java.sql.Date retrieveCurrentLocalDate(final String blId, final String siteId) {
        final java.sql.Date currentLocalDate =
                LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
        return currentLocalDate;
    }

    /**
     * Update the fields of an existing work request with the values coming from the mobile device.
     *
     * @param record wr_sync record
     * @param wrId - work request code
     * @param mobPendingAction - if set to "Com" we update the completed_by field
     */
    static void updateWorkRequestRecord(final DataRecord record, final int wrId,
            final String mobPendingAction) {
        // Create the data source for the work request table
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_TABLE, WR_FIELDS);

        // Restrict based on the work request code to find the record that we need to update
        datasource.addRestriction(Restrictions.eq(WR_TABLE, WR_ID, wrId));

        // Get the work request record
        final DataRecord wrRecord = datasource.getRecord();

        // Update the work request fields from data on the sync table. Does not update
        // date_requested.
        if (wrRecord != null) {

            final String[] locationFields = { BL_ID, FL_ID, RM_ID, LOCATION };
            for (final String fieldName : locationFields) {
                wrRecord.setValue(
                    WR_TABLE + SQL_DOT + fieldName,
                    MaintenanceMobileUtility.getFieldStringValueOrEmpty(record, WR_SYNC_TABLE
                            + SQL_DOT + fieldName));
            }

            final String[] textFields =
                    { CAUSE_TYPE, CF_NOTES, DESCRIPTION, EQ_ID, PROB_TYPE, REPAIR_TYPE, REQUESTOR,
                            SITE_ID, TR_ID };

            MaintenanceMobileUtility.setTextValues(record, wrRecord, textFields);

            final String[] dateFields =
                    { DATE_ASSIGNED, DATE_EST_COMPLETION, DATE_ESCALATION_COMPLETION };
            MaintenanceMobileUtility.setDateValues(record, wrRecord, dateFields);

            wrRecord.setValue(WR_TABLE + SQL_DOT + PRIORITY,
                record.getInt(WR_SYNC_TABLE + SQL_DOT + PRIORITY));

            // To address Resume to Issued. If the status = I and there is no mobile pending action
            // For all other status codes we let the pending action change the status through the
            // work flow
            final String status = record.getString(WR_SYNC_TABLE + SQL_DOT + STATUS);
            if (STATUS_I.equals(status) && mobPendingAction.length() == 0) {
                wrRecord.setValue(WR_TABLE + SQL_DOT + STATUS, status);
            }

            if (COMPLETED_STATUS.equals(mobPendingAction)) {
                wrRecord.setValue(WR_TABLE + SQL_DOT + COMPLETED_BY, ContextStore.get().getUser()
                    .getEmployee().getId());
            }

            datasource.saveRecord(wrRecord);

            // copy the attached documents
            // Get the document fields from the record where the _isnew field is set.
            final String[] fieldsToCopy =
                    MaintenanceMobileUtility.getDocumentFieldsToCopy(DOCUMENT_FIELD_NAMES_WR,
                        record);

            if (fieldsToCopy.length > 0) {
                DocumentsUtilities.copyDocuments(fieldsToCopy, record, wrRecord);
            }
        }
    }

    /**
     * Get dv_id and dp_id for user logged in.
     *
     * @param emId - Employee Id
     * @return dvDpArray - Array with the dv_id and dp_id values
     */
    static String[] getDvDpArray(final String emId) {

        final DataSource emdatasource =
                DataSourceFactory.createDataSourceForFields(EM_TABLE, EM_FIELDS);

        emdatasource.addRestriction(Restrictions.eq(EM_TABLE, EM_ID, emId));

        final DataRecord emRecord = emdatasource.getRecord();
        String dvId = "";
        String dpId = "";

        if (emRecord != null) {
            dvId = emRecord.getString(EM_TABLE + SQL_DOT + DV_ID);
            dpId = emRecord.getString(EM_TABLE + SQL_DOT + DP_ID);
        }

        final String[] dvDpArray = { dvId, dpId };

        return dvDpArray;
    }

    /**
     * Populates the wr_sync table with requests for the current mobile user.
     *
     * @param syncTableFields fields common to the wr and wr_sync table.
     * @param restriction to apply to the selection
     * @param userName User Name
     */
    static void insertNewSyncRecords(final String[] syncTableFields, final String restriction,
            final String userName) {

        // Get the Maximum number of Work Requests to Sync for each mobile user
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        String workRequestLimit =
                EventHandlerBase.getActivityParameterString(context, HELP_DESK_ACTIVITY,
                        "MobileWorkRequestsMaxQuantity");

        final String workRequestSortParameter =
                EventHandlerBase.getActivityParameterString(context, HELP_DESK_ACTIVITY,
                        "MobileWorkRequestsSyncSort");

        // If there is no activity parameter we set the default to the value from java
        // which is 250.
        if (workRequestLimit == null) {
            workRequestLimit = WORK_REQUESTS_TO_SYNC;
        }

        String workRequestSort = " ORDER BY wr_id ASC";

        // EAR 1/27/17 implementation for KB 3039928
        if (StringUtil.notNullOrEmpty(workRequestSortParameter)) {
            final String[] sortFields = workRequestSortParameter.split(";");
            if (sortFields[1].toUpperCase().contains("DESC")) {
                workRequestSort = SQL_ORDER_BY + sortFields[0] + " DESC";
            } else {
                workRequestSort = SQL_ORDER_BY + sortFields[0] + " ASC";
            }
        }

        final String sql =
                MaintenanceMobileQuery.getWorkRequestSyncInsertQuery(syncTableFields, restriction,
                    userName, workRequestLimit, workRequestSort);
        SqlUtils.executeUpdate(WR_SYNC_TABLE, sql);
    }

    /**
     * Transfers the documents to the associated sync records in the document management tables.
     *
     * @param userName User name.
     */
    static void copyWorkRequestDocumentsToSyncWorkRequests(final String userName) {

        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_TABLE, WR_MGR_FIELDS);

        final DataSource datasourceSync =
                DataSourceFactory.createDataSourceForFields(WR_SYNC_TABLE, WR_SYNC_MGR_FIELDS);

        datasource.setContext();
        datasource.setMaxRecords(0);

        datasourceSync.setContext();
        datasourceSync.setMaxRecords(0);

        String sqlRestriction = "";

        for (final String docFieldName : DOCUMENT_FIELD_NAMES_WR) {
            sqlRestriction +=
                    (StringUtil.notNullOrEmpty(sqlRestriction) ? SQL_OR : "(") + WR_TABLE + SQL_DOT
                    + docFieldName + SQL_IS_NOT_NULL;
        }

        sqlRestriction += StringUtil.notNullOrEmpty(sqlRestriction) ? ")" : "";

        sqlRestriction +=
                " AND EXISTS(SELECT 1 FROM " + WR_SYNC_TABLE + " WHERE " + WR_SYNC_TABLE + SQL_DOT
                        + "wr_id=" + WR_TABLE + ".wr_id AND " + WR_SYNC_TABLE + SQL_DOT
                        + MOB_LOCKED_BY + EQUAL + SqlUtils.formatValueForSql(userName)
                        + END_PARENTHESIS;

        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        // Get the work request records
        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            final int wrId = record.getInt(WR_TABLE + SQL_DOT + WR_ID);
            datasourceSync.clearRestrictions();
            datasourceSync.addRestriction(Restrictions.eq(WR_SYNC_TABLE, WR_ID, wrId));
            datasourceSync.addRestriction(Restrictions.eq(WR_SYNC_TABLE, MOB_LOCKED_BY, userName));
            // Get the work request sync record
            final DataRecord wrSyncRecord = datasourceSync.getRecord();
            if (wrSyncRecord != null) {
                DocumentsUtilities.copyDocuments(DOCUMENT_FIELD_NAMES_WR, record, wrSyncRecord);
            }

        }
    }

}