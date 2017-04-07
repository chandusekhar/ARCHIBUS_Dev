package com.archibus.app.workplace.mobile.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import org.apache.commons.lang.StringUtils;

import com.archibus.app.common.mobile.util.*;
import com.archibus.app.workplace.mobile.service.IWorkplacePortalMobileService;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.utility.DateTime;

/**
 * {@inheritDoc}.
 */
public class WorkplacePortalMobileService implements IWorkplacePortalMobileService {

    /**
     * Constant for "SERVICE DESK - MAINTENANCE" activity type.
     */
    static final String SERVICE_DESK_MAINTENANCE = "SERVICE DESK - MAINTENANCE";

    /**
     * {@inheritDoc}.
     *
     * <p>
     * Step 1: Get new mobile service desk requests onto Web Central (inventory table: activity_log)
     * added by the requestor AND Update existing service desk requests (overwrite Web Central)
     *
     * Step 2: Delete all sync service desk requests (activity_log_sync table) for the user to
     * refresh mobile in the last step
     *
     * Step 3: Get all Web Central assigned service desk requests back to the sync table
     *
     */
    @Override
    public void syncServiceDeskRequests(final String userName, final String userId,
            final String activityType) {

        /*
         * Get new mobile work added by the requestor AND Update existing mobile work data and
         * overwrite Web Central
         */
        syncFromMobileNewOrExistingAssignedWork(userName, activityType);

        // Delete all sync data for the user to refresh mobile in the last step
        deleteSyncWork(userName, activityType);

        // Get all Web Central assigned work back to the sync table
        syncFromWebCentralAssignedWork(userName, userId, activityType);

    }

    /**
     * {@inheritDoc}.
     *
     * <p>
     * Step 1: Create the request: inserts activity_log record
     *
     * Step 2: Submit the request: calls WFR for submitting service desk request
     *
     * Step 3: Return the request id
     *
     */
    @Override
    public Map<String, Object> createAndSubmitServiceDeskRequest(final String userName,
            final Map<String, String> requestParameters) {

        // create the service desk request
        final DataRecord newRecord = createServiceDeskRequest(requestParameters);
        final Integer activityLogId =
                newRecord.getInt(ACTIVITY_LOG_TABLE + SQL_DOT + ACTIVITY_LOG_ID);

        // Invoke the workflow rule to submit the mobile request
        final RequestHandler handler = new RequestHandler();
        handler.submitMobileRequest(activityLogId);

        // return request id
        final Map<String, Object> result = new HashMap<String, Object>();
        result.put(ACTIVITY_LOG_ID, activityLogId);

        return result;
    }

    /**
     * Copy documents from activity_log record into it's correspondent wr record.
     *
     * @param activityLogId activity log id
     */
    private void copyDocumentsFromActivityLogToWrRecord(final int activityLogId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(ACTIVITY_LOG_TABLE, ACTIVITY_LOG_ID, activityLogId, Operation.EQUALS);

        final DataSource datasource = ActivityLogUtilities
            .createActivityLogDataSource(DataSourceUtilities.COMMON_COPY_FIELD_NAMES);

        // Get the activity log record
        final List<DataRecord> activityLogRecords = datasource.getRecords(restriction);

        if (!activityLogRecords.isEmpty()) {
            final DataRecord activityLogRecord = activityLogRecords.get(0);

            final String doc1 = activityLogRecord.getString(ACTIVITY_LOG_TABLE + SQL_DOT + DOC1);
            final String doc2 = activityLogRecord.getString(ACTIVITY_LOG_TABLE + SQL_DOT + DOC2);
            final String doc3 = activityLogRecord.getString(ACTIVITY_LOG_TABLE + SQL_DOT + DOC3);
            final String doc4 = activityLogRecord.getString(ACTIVITY_LOG_TABLE + SQL_DOT + DOC4);

            if (StringUtils.isNotEmpty(doc1) || StringUtils.isNotEmpty(doc2)
                    || StringUtils.isNotEmpty(doc3) || StringUtils.isNotEmpty(doc4)) {
                final String[] fieldsToCopy = new String[] { DOC1, DOC2, DOC3, DOC4 };

                final DataSource wrDataSource = DataSourceFactory.createDataSourceForFields(
                    WR_TABLE, new String[] { FieldNameConstantsMaintenance.WR_ID, ACTIVITY_LOG_ID,
                            DOC1, DOC2, DOC3, DOC4 });
                wrDataSource
                    .addRestriction(Restrictions.eq(WR_TABLE, ACTIVITY_LOG_ID, activityLogId));
                final DataRecord wrRecord = wrDataSource.getRecord();
                DocumentsUtilities.copyDocuments(fieldsToCopy, activityLogRecord, wrRecord);
            }
        }
    }

    /**
     * Creates a service desk request according to the parameters.
     *
     * @param requestParameters request parameters
     * @return the new request record
     */
    private DataRecord createServiceDeskRequest(final Map<String, String> requestParameters) {
        final String paramDateRequested = requestParameters.get(DATE_REQUESTED);
        final Date dateRequested = DateTime.stringToDate(paramDateRequested, "yyyy-MM-dd");

        // create the datasource
        final DataSource datasource = ActivityLogUtilities
            .createActivityLogDataSource(DataSourceUtilities.COMMON_COPY_FIELD_NAMES);
        final String tableName = datasource.getMainTableName();
        datasource.addField(tableName, CREATED_BY);

        // Open a new record to save the data for the new activity log
        DataRecord newRecord = datasource.createNewRecord();
        newRecord.setValue(tableName + SQL_DOT + CREATED_BY, requestParameters.get(REQUESTOR));

        // set request parameters to the new record
        for (final Map.Entry<String, String> parameter : requestParameters.entrySet()) {
            final String key = parameter.getKey();
            final Object value = parameter.getValue();
            final String fieldName = tableName + SQL_DOT + key;

            if (key.equals(DATE_REQUESTED)) {
                newRecord.setValue(fieldName, dateRequested);
            } else {
                newRecord.setValue(fieldName, value);
            }
        }

        // save the new record
        newRecord = datasource.saveRecord(newRecord);
        final Integer activityLogId = newRecord.getInt(tableName + SQL_DOT + ACTIVITY_LOG_ID);

        // retrieve the new request
        datasource.addRestriction(Restrictions.eq(tableName, ACTIVITY_LOG_ID, activityLogId));
        newRecord = datasource.getRecord();

        return newRecord;
    }

    /**
     *
     * Get new mobile work (activity_log_sync.activity_log_id is null) added by the user AND Update
     * existing mobile work data and overwrite Web Central.
     *
     * @param userName user name
     * @param activityType activity type. Empty if want to sync all types
     */
    private void syncFromMobileNewOrExistingAssignedWork(final String userName,
            final String activityType) {
        final DataSource datasource = ActivityLogUtilities
            .createActivityLogSyncDataSource(DataSourceUtilities.COMMON_COPY_FIELD_NAMES);
        datasource.setContext();
        datasource.setMaxRecords(0);

        datasource
            .addRestriction(Restrictions.eq(ACTIVITY_LOG_SYNC_TABLE, MOB_LOCKED_BY, userName));
        datasource.addRestriction(Restrictions.eq(ACTIVITY_LOG_SYNC_TABLE, MOB_IS_CHANGED, "1"));

        final List<Restriction> serviceDeskTypesRestrictions = DataSourceUtilities
            .createServiceDeskTypesRestriction(ACTIVITY_LOG_SYNC_TABLE, activityType);
        for (final Restriction restriction : serviceDeskTypesRestrictions) {
            datasource.addRestriction(restriction);
        }

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            final int activityLogId =
                    record.getInt(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + ACTIVITY_LOG_ID);
            if (activityLogId > 0) {
                if ("CANCELLED".equals(record.getString(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + STATUS))
                        && SERVICE_DESK_MAINTENANCE.equals(
                            record.getString(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + ACTIVITY_TYPE))) {
                    new WorkRequestHandler().cancelWorkRequest(activityLogId);
                } else {
                    // update service desk item
                    ActivityLogUtilities.updateActivityLogRecord(null, record,
                        DataSourceUtilities.COMMON_COPY_FIELD_NAMES, false, true);

                    if (SERVICE_DESK_MAINTENANCE.equals(
                        record.getString(ACTIVITY_LOG_SYNC_TABLE + SQL_DOT + ACTIVITY_TYPE))) {
                        copyDocumentsFromActivityLogToWrRecord(activityLogId);
                    }
                }

            } else {
                // insert service desk item
                ActivityLogUtilities.insertActivityLogRecord(null, record,
                    DataSourceUtilities.COMMON_COPY_FIELD_NAMES, false, true);
            }
        }
    }

    /**
     *
     * Delete all sync data for the user to refresh mobile in the last step.
     *
     * @param userName user name
     * @param activityType activity type. Empty if want to sync all types
     */
    private void deleteSyncWork(final String userName, final String activityType) {
        ActivityLogUtilities.deleteActivityLogSyncRecords(userName,
            DataSourceUtilities.COMMON_COPY_FIELD_NAMES, DataSourceUtilities
                .createServiceDeskTypesRestriction(ACTIVITY_LOG_SYNC_TABLE, activityType));
    }

    /**
     *
     * Get all Web Central assigned work back to the sync table.
     *
     * @param userName user name
     * @param userId User employee id from em table
     * @param activityType activity type. Empty if want to sync all types
     */
    private void syncFromWebCentralAssignedWork(final String userName, final String userId,
            final String activityType) {
        final DataSource datasource = ActivityLogUtilities
            .createActivityLogDataSource(DataSourceUtilities.COMMON_COPY_FIELD_NAMES);
        datasource.setContext();
        datasource.setMaxRecords(0);

        final Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DATE, -NUMBER_OF_PAST_DAYS);
        final Date pastDate = calendar.getTime();

        datasource.addRestriction(Restrictions.eq(ACTIVITY_LOG_TABLE, REQUESTOR, userId));

        final List<Restriction> serviceDeskTypesRestrictions = DataSourceUtilities
            .createServiceDeskTypesRestriction(ACTIVITY_LOG_TABLE, activityType);
        for (final Restriction restriction : serviceDeskTypesRestrictions) {
            datasource.addRestriction(restriction);
        }

        datasource.addRestriction(Restrictions.gt(ACTIVITY_LOG_TABLE, DATE_REQUESTED, pastDate));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {
            // insert condition assessment item in activity log sync table
            ActivityLogUtilities.insertActivityLogSyncRecord(record, userName,
                DataSourceUtilities.COMMON_COPY_FIELD_NAMES, true);
        }
    }
}
