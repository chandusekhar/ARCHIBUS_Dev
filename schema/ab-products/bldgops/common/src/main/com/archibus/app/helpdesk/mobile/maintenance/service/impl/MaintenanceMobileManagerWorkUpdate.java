package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.List;

import org.json.JSONObject;

import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.utility.StringUtil;

/**
 * Provides supporting methods related to synchronizing the data in the main work request tables.
 * Supports the MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.3
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobileManagerWorkUpdate {

    /**
     * Document field names for wr table.
     */
    public static final String[] DOCUMENT_FIELD_NAMES_WR = { DOC1, DOC2, DOC3, DOC4 };

    /**
     * Document field names for activity_log table.
     */
    public static final String[] DOCUMENT_FIELD_NAMES_ACTIVITY_LOG = { DOC1, DOC2, DOC3, DOC4 };

    /**
     * Current Date - this can be updated to reflect the local date based on the building and site.
     */
    public static final String SQL_CURRENT_DATE =
            MaintenanceMobileManager.getSQLCurrentDateString();

    /**
     * WR_WORK_TEAM_RESTRICTION - Selects work teams the user belongs to.
     */
    public static final String WR_WORK_TEAM_RESTRICTION =
            " SELECT cf_work_team.work_team_id FROM cf,cf_work_team WHERE cf.cf_id = cf_work_team.cf_id AND  ";

    /**
     * start date unavailable restriction.
     */
    public static final String WORKFLOW_SUBSTITUTES_START_DATE_UNAVAILABLE_NULL_OR_LESS_OR_EQUAL =
            "workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= ";

    /**
     * end date unavailable restriction.
     */
    public static final String WORKFLOW_SUBSTITUTES_END_DATE_UNAVAILABLE_NULL_OR_GREATER_OR_EQUAL =
            "workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= ";

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileManagerWorkUpdate() {
    }

    /**
     * Update the fields of an existing work request with the values coming from the mobile device.
     *
     * @param record wr_sync record
     * @param wrId - work request code
     * @param mobPendingAction - if set to "Com" we update the completed_by field
     * @param mobStatStepChg - 0 or 1 if there is a step
     * @return previousStatus - Return the status of the work request prior to the update
     */
    static String updateManagerWorkRequestRecord(final DataRecord record, final int wrId,
            final String mobPendingAction, final int mobStatStepChg) {
        // Create the data source for the work request table
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_TABLE, WR_MGR_FIELDS);

        // Restrict based on the work request code to find the record that we need to update
        datasource.addRestriction(Restrictions.eq(WR_TABLE, WR_ID, wrId));

        // Get the work request record
        final DataRecord wrRecord = datasource.getRecord();

        String previousStatus = "";

        // Update the work request fields from data on the sync table. Does not update
        // date_requested.
        if (wrRecord != null && record.getInt(WR_SYNC_TABLE + SQL_DOT + MOB_IS_CHANGED) == 1) {

            if (!"approve".equals(record.getString(WR_SYNC_TABLE + SQL_DOT + MOB_STEP_ACTION))) {
                final JSONObject editRequestParametersJSONRecord =
                        buildJSONRecordForEditRequestParameters(record, wrId);

                new WorkRequestHandler().editRequestParameters(editRequestParametersJSONRecord);
            }

            previousStatus = wrRecord.getString(WR_TABLE + SQL_DOT + STATUS);

            final String[] locationFields = { LOCATION };
            for (final String fieldName : locationFields) {
                wrRecord.setValue(WR_TABLE + SQL_DOT + fieldName, MaintenanceMobileUtility
                    .getFieldStringValueOrEmpty(record, WR_SYNC_TABLE + SQL_DOT + fieldName));
            }

            final String[] textFields =
                    { CAUSE_TYPE, CF_NOTES, DESCRIPTION, REPAIR_TYPE, REQUESTOR, TR_ID };
            MaintenanceMobileUtility.setTextValues(record, wrRecord, textFields);

            final String[] dateFields =
                    { DATE_EST_COMPLETION, DATE_ESCALATION_COMPLETION, DATE_ASSIGNED };

            MaintenanceMobileUtility.setDateValues(record, wrRecord, dateFields);

            if (COMPLETED_STATUS.equals(mobPendingAction)) {
                wrRecord.setValue(WR_TABLE + SQL_DOT + COMPLETED_BY,
                    ContextStore.get().getUser().getEmployee().getId());
            }

            datasource.saveRecord(wrRecord);
            // 04.24.2016 Removed datasource.commit JEFFM

            // copy the attached documents
            // Get the document fields from the record where the _isnew field is set.
            final String[] fieldsToCopy = MaintenanceMobileUtility
                .getDocumentFieldsToCopy(DOCUMENT_FIELD_NAMES_WR, record);

            if (fieldsToCopy.length > 0) {
                DocumentsUtilities.copyDocuments(fieldsToCopy, record, wrRecord);
            }

        }
        return previousStatus;
    }

    /**
     * Get the activity log record.
     *
     * @param wrId - Work Request Code
     * @return record
     */
    static DataRecord getActivityLogRecord(final int wrId) {

        final String[] escalatedFields = { ESCALATED_COMPLETION, ESCALATED_RESPONSE };

        // Create the data source for the activity_log table
        final DataSource activitydatasource =
                DataSourceFactory.createDataSourceForFields(ACTIVITY_LOG_TABLE, escalatedFields);

        // Build restriction for the wr_step_waiting table to account for the case there is a role
        // name and also for the case there is a specific step for the mobile user
        final String sqlRestriction = "wr_id = " + Integer.toString(wrId);

        // Restrict based on the work request code to find the wr_step_waiting record
        activitydatasource.addRestriction(Restrictions.sql(sqlRestriction));

        return activitydatasource.getRecord();
    }

    /**
     *
     * Build a JSON Record to pass to the Edit Request parameters workflow rule.
     *
     * @param record - Work Request Sync Record
     * @param wrId - Work Request Code
     * @return jsonRecord
     */
    static JSONObject buildJSONRecordForEditRequestParameters(final DataRecord record,
            final int wrId) {

        final JSONObject jsonRecord = new JSONObject();
        jsonRecord.put(WR_TABLE + SQL_DOT + PMP_ID,
            StringUtil.notNull(record.getString(WR_SYNC_TABLE + SQL_DOT + PMP_ID)));

        MaintenanceMobileUtility.copyJSONValues(record, wrId, jsonRecord);

        jsonRecord.put(WR_TABLE + SQL_DOT + WR_ID,
            Integer.toString(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)));

        return jsonRecord;
    }

    /**
     * Inserts related work requests into the wr_sync table.
     *
     * @param syncTableFields fields to include in the insert statement.
     * @param userName User Name
     */
    static void insertRelatedRequestSyncRecords(final String[] syncTableFields,
            final String userName) {

        final String sql =
                MaintenanceMobileQuery.getInsertRelatedSyncRecordsQuery(syncTableFields, userName);
        SqlUtils.executeUpdate(WR_SYNC_TABLE, sql);
    }

    /**
     * Updates the wr sync table escalated_completion and escalated_response values with the
     * associated values in the activity_log table.
     *
     * @param userName of the logged in user.
     */
    static void updateActivityLogValues(final String userName) {
        final String sql = MaintenanceMobileQuery.getUpdateActivityLogValuesQuery(userName);
        SqlUtils.executeUpdate(WR_SYNC_TABLE, sql);
    }

    /**
     * Updates the step waiting fields in the wr sync table.
     *
     * @param userRole of the current user
     * @param userName cf_id of the user
     * @param emId employee code
     */
    static void updateStepWaiting(final String userRole, final String userName, final String emId) {

        final String sql =
                MaintenanceMobileQuery.getUpdateStepWaitingQuery(userRole, userName, emId);
        SqlUtils.executeUpdate(WR_SYNC_TABLE, sql);
    }

    /**
     * Updates the wr_sync is_req_supervisor field.
     * <p>
     * Sets the value to 1 if the user is a supervisor, 0 otherwise.
     *
     * @param userName of the logged in user.
     * @param emId employee code of the logged in user.
     * @param userEmail email address of the logged in user.
     */
    static void updateSupervisor(final String userName, final String emId, final String userEmail) {

        final String sql =
                MaintenanceMobileQuery.getUpdateSupervisorQuery(userName, emId, userEmail);
        SqlUtils.executeUpdate(WR_SYNC_TABLE, sql);
    }

    /**
     * Updates the wr_sync is_req_craftsperson field.
     *
     * @param userName of the logged in user.
     * @param userEmail email address of the logged in user.
     */
    static void updateCraftsperson(final String userName, final String userEmail) {
        final String sql = MaintenanceMobileQuery.getUpdateCraftspersonQuery(userName, userEmail);
        SqlUtils.executeUpdate(WR_SYNC_TABLE, sql);
    }

    /**
     * Updates the wr_sync is_wt_self_assign fields. Sets the value to 1 if the request is self
     * assigned by the work team.
     *
     * @param userName of the logged in user.
     * @param userEmail email address of the logged in user.
     */
    static void updateWorkTeamSelfAssign(final String userName, final String userEmail) {

        final String sql =
                MaintenanceMobileQuery.getUpdateWorkTeamSelfAssignQuery(userName, userEmail);
        SqlUtils.executeUpdate(WR_SYNC_TABLE, sql);
    }

    /**
     * Updates the wr_sync estimation_comp and scheduling_comp fields.
     *
     * @param userName of the logged in user.
     */
    static void updateEstimateAndSchedule(final String userName) {

        final String editEstAndSchedAfterStepComplete =
                ContextStore.get().getProject().getActivityParameterManager()
                    .getParameterValue("AbBldgOpsOnDemandWork-EditEstAndSchedAfterStepComplete");
        if ("0".equals(editEstAndSchedAfterStepComplete)) {

            // Create the data source for the work request sync table
            final DataSource datasource =
                    DataSourceFactory.createDataSourceForFields(WR_SYNC_TABLE, WR_SYNC_MGR_FIELDS);

            // Restrict based on the work request code to find the record that we need to update
            datasource.addRestriction(Restrictions.eq(WR_SYNC_TABLE, MOB_LOCKED_BY, userName));
            datasource.addRestriction(
                Restrictions.sql("exists(select 1 from wr where wr.wr_id = wr_sync.wr_id)"));

            final List<DataRecord> records = datasource.getAllRecords();
            final WorkRequestHandler handler = new WorkRequestHandler();
            for (final DataRecord record : records) {
                record.setValue(WR_SYNC_TABLE + ".scheduling_comp",
                    handler.isEstimateOrSchedulingCompleted(
                        String.valueOf(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)),
                        "scheduling") ? 1 : 0);
                record.setValue(WR_SYNC_TABLE + ".estimation_comp",
                    handler.isEstimateOrSchedulingCompleted(
                        String.valueOf(record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID)),
                        "estimation") ? 1 : 0);
                datasource.saveRecord(record);
            }
        }

    }

}