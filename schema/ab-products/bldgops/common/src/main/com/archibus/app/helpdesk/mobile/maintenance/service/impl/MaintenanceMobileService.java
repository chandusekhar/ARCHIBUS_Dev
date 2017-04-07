package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import org.apache.log4j.Logger;
import org.json.JSONArray;

import com.archibus.app.helpdesk.mobile.maintenance.service.IMaintenanceMobileService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * WorkflowRule Service for Maintenance mobile application.
 *
 * Registered in the ARCHIBUS WorkflowRules table as 'AbBldgOpsHelpDesk-MaintenanceMobileService'.
 *
 * Provides methods for integrating "wr_sync" work requests sync table with "wr" work requests table
 * and the work requests business logic.
 *
 * Invoked by mobile client.
 *
 * @author Constantine Kriezis
 * @since 21.1
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class MaintenanceMobileService implements IMaintenanceMobileService {

    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /** {@inheritDoc} */

    // TODO: (VT): can cfId be deduced from cfUser here?
    @Override
    public String syncWorkData(final String cfUser, final String cfId) {
        String returnMessage = "";

        if (this.logger.isDebugEnabled()) {
            this.logger.debug(String.format("MaintenanceMobileService:  username=[%s]", cfUser));
        }

        // Get new mobile work assigned to the crafts person
        syncFromMobileNewAssignedWork(cfUser);

        // Get new mobile work reported by the crafts person
        syncFromMobileNewReportedWork(cfUser);

        final WorkRequestHandler handler = new WorkRequestHandler();

        // Check if we have the proper schema to run the manager version of the syncWorkData logic.
        final boolean managerVersion = handler.checkSchemaExisting("wr_sync", "mob_step_action");

        // if (handler.checkSchemaExisting("wr_sync", "mob_step_action")) {
        if (managerVersion) {
            // if (!runOldVersion) {
            // Update all existing mobile work data and overwrite Web Central data
            returnMessage =
                    MaintenanceMobileManager.syncFromMobileExistingManagerWork(cfUser, cfId);

            deleteSyncManagerWork(cfUser);

            // Get the value for the user's maintenance role.
            final String userMaintRole = handler.getCurrentUserRoleName();

            // Refresh Web Central work requests to the sync tables.
            MaintenanceMobileManager.syncFromWebCentralNewManagerWork(cfUser, cfId, userMaintRole);
        } else {
            // Update existing mobile work data and overwrite Web Central
            syncFromMobileExistingAssignedWork(cfUser, cfId);

            // Delete all sync data for the user to refresh mobile in the last step
            deleteSyncWork(cfUser);

            // Get all Web Central assigned work back to the sync table
            syncFromWebCentralNewAssignedWork(cfUser, cfId);
        }
        return returnMessage;
    }

    /**
     * syncFromMobileNewAssignedWork Get new assigned work from the mobile device.
     *
     * @param cfUser - User name of craftsperson
     */
    private void syncFromMobileNewAssignedWork(final String cfUser) {
        // The program needs to call existing workflow rule from class WorkRequestHandler that
        // require context as a parameter
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_SYNC_TABLE, WR_SYNC_MGR_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);

        // We can use request_type in wr_sync and set this to 0 for My Work and 1 for My Requests
        final String sqlRestriction = "  mob_locked_by = '" + cfUser
                + "' AND wr_sync.mob_wr_id IS NOT NULL AND wr_sync.wr_id IS NULL AND EXISTS"
                + " (SELECT 1 FROM wrcf_sync WHERE wrcf_sync.mob_wr_id=wr_sync.mob_wr_id)";

        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {

            final int mobWrId = record.getInt(WR_SYNC_TABLE + SQL_DOT + MOB_WR_ID);

            final String mobPendingAction =
                    record.getString(WR_SYNC_TABLE + SQL_DOT + MOB_PENDING_ACTION);
            final String mobStepAction =
                    record.getString(WR_SYNC_TABLE + SQL_DOT + MOB_STEP_ACTION);

            final int wrId =
                    MaintenanceMobileWorkUpdate.insertWorkRequestRecord(record, mobPendingAction);

            record.setValue(WR_SYNC_TABLE + SQL_DOT + WR_ID, wrId);
            record.setValue(WR_SYNC_TABLE + SQL_DOT + "mob_is_changed", 0);

            datasource.saveRecord(record);

            // Create labor records from the sync data
            MaintenanceMobileLaborUpdate.createLaborRecords(wrId, mobWrId);

            // Create the part records from the sync data
            MaintenanceMobilePartsUpdate.createPartRecords(wrId, mobWrId);

            // Create the tool records from the sync data
            MaintenanceMobileManagerToolsUpdate.createToolRecords(wrId, mobWrId);

            // Create the other cost records from the sync data
            MaintenanceMobileCostsUpdate.createOtherCostRecords(wrId, mobWrId);

            // Invoke rule to create activity log and wo records
            new WorkRequestHandler().invokeSLAForMobileWorkRequest(context, wrId);

            // Call a std workflow rule to calculate the costs for the work request
            new WorkRequestHandler().recalculateCosts(context, wrId);

            // If there is a pending action (Complete or On Hold) update the status using the
            // corresponding rule in Web Central
            if (pendingAction(mobPendingAction)) {
                new WorkRequestHandler().updateMobileWorkRequestStatus(wrId, mobPendingAction);
            }

            if ("cfComplete".equals(mobStepAction)) {
                final JSONArray completeRecords = new JSONArray();
                completeRecords.put(MaintenanceMobileUtility.buildJSONRecordForClose(record));
                new WorkRequestHandler().completeCf(completeRecords);
            }

            if ("supervisorComplete".equals(mobStepAction)) {
                new WorkRequestHandler().updateMobileWorkRequestStatus(wrId, COMPLETED_STATUS);
            }
        }
    }

    /**
     *
     * syncFromMobileNewReportedWork - Creates new requests in web central from new requests on the
     * mobile that are reported by the craftsperson for others to complete.
     *
     * @param cfUser User Name of Crafts Person
     */
    private void syncFromMobileNewReportedWork(final String cfUser) {
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_SYNC_TABLE, WR_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);

        final String sqlRestriction = " mob_locked_by = '" + cfUser
                + "' AND wr_sync.mob_wr_id IS NOT NULL AND wr_sync.wr_id IS NULL AND "
                + "NOT EXISTS (SELECT 1 FROM wrcf_sync WHERE wrcf_sync.mob_wr_id=wr_sync.mob_wr_id)";

        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> records = datasource.getRecords();

        for (final DataRecord record : records) {

            final int activityLogId = MaintenanceMobileWorkUpdate.insertActivityLogRecord(record);

            // Invoke new workflow rule to submit a new mobile request
            new RequestHandler().submitMobileRequest(activityLogId);

            if (record.getInt(WR_SYNC_TABLE + SQL_DOT + PARENT_WR_ID) != 0) {
                // Justification: Case #2.2 : Statement with UPDATE ... WHERE pattern.
                SqlUtils.executeUpdate(WR_TABLE,
                    "update wr set parent_wr_id = "
                            + record.getInt(WR_SYNC_TABLE + SQL_DOT + PARENT_WR_ID)
                            + " where activity_log_id = " + activityLogId);
            }
        }
    }

    /**
     *
     * syncFromMobileExistingAssignedWork - Updates existing work requests with the data from
     * mobile. This overwrites the main work request data in web central as the assumption is that
     * once a work request is assigned to a mobile user, that user has control of the fields that
     * he/she can update on the device.
     *
     * @param cfUser - Username of Craftsperson
     * @param cfId Craftsperson ID
     */
    private void syncFromMobileExistingAssignedWork(final String cfUser, final String cfId) {
        // Create data source for work request sync table
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_SYNC_TABLE, WR_SYNC_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);

        final String sqlRestriction =
                "mob_locked_by = '" + cfUser + "' AND wr_sync.wr_id IS NOT NULL AND "
                        + "EXISTS (SELECT 1 FROM wrcf_sync WHERE wrcf_sync.wr_id=wr_sync.wr_id)"
                        + " AND EXISTS (SELECT 1 FROM wr WHERE wr.wr_id = wr_sync.wr_id) "
                        + " AND mob_is_changed=1";

        // Add restriction to look for all work request sync records that are locked for the
        // craftsperson and that also have a work request code and that also have an associated
        // labor record
        // Query database to get the work request sync records
        final List<DataRecord> records = datasource.getRecords(sqlRestriction);

        final Set<Integer> modifiedWorkRequests = new HashSet<Integer>();

        // Go through every work request sync record to update the work request and component
        // records - This can be updated to exclude work requests that are already closed in WebC.
        for (final DataRecord record : records) {
            syncSingleRecord(record);
            final int wrId = record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID);
            modifiedWorkRequests.add(wrId);
        }

        // Upload new resource records
        // Update the request's labor records from the sync labor data
        MaintenanceMobileLaborUpdate.updateLaborRecords(cfUser, cfId, modifiedWorkRequests);

        // Update the request's part records from the sync parts data
        MaintenanceMobilePartsUpdate.updatePartRecords(cfUser);

        // Update the request's cost records from the sync costs data
        MaintenanceMobileCostsUpdate.updateCostRecords(cfUser, modifiedWorkRequests);
    }

    /**
     * sync single record.
     *
     * @param record record
     */
    private void syncSingleRecord(final DataRecord record) {
        final String mobPendingAction =
                record.getString(WR_SYNC_TABLE + SQL_DOT + MOB_PENDING_ACTION);

        final int wrId = record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID);

        // Update the work request data from the sync data
        MaintenanceMobileWorkUpdate.updateWorkRequestRecord(record, wrId, mobPendingAction);

        // If there is a pending action execute the corresponding rule in Web Central
        if (pendingAction(mobPendingAction)) {
            new WorkRequestHandler().updateMobileWorkRequestStatus(wrId, mobPendingAction);
        }
    }

    /**
     *
     * Deletes all the sync records for the current user. This ensures we start from scratch and
     * rebuild the sync records from the Web Central tables. We update the Web Central tables from
     * mobile before we execute this rule.
     * <p>
     * Deletes any document records that reference deleted wr_sync records.
     *
     * @param cfUser User Name of Crafts Person
     */
    private void deleteSyncWork(final String cfUser) {

        final String whereClause = " WHERE mob_locked_by = '" + cfUser + QUOTE;
        final String deleteStatement = "DELETE FROM ";
        String sqlStatement;

        // Justification: Case #2.3: Statements with DELETE FROM ... pattern
        sqlStatement = deleteStatement + WR_SYNC_TABLE + whereClause;
        SqlUtils.executeUpdate(WR_SYNC_TABLE, sqlStatement);

        sqlStatement = deleteStatement + WRCF_SYNC_TABLE + whereClause;
        SqlUtils.executeUpdate(WRCF_SYNC_TABLE, sqlStatement);

        sqlStatement = deleteStatement + WRPT_SYNC_TABLE + whereClause;
        SqlUtils.executeUpdate(WRPT_SYNC_TABLE, sqlStatement);

        sqlStatement = deleteStatement + WR_OTHER_SYNC_TABLE + whereClause;
        SqlUtils.executeUpdate(WR_OTHER_SYNC_TABLE, sqlStatement);
        // KB#3050980 Delete sync record from docs_assigned_sync table locked by cfUser
        sqlStatement = deleteStatement + INCIDENT_DOCUMENTS_SYNC_TABLE + whereClause;
        SqlUtils.executeUpdate(INCIDENT_DOCUMENTS_SYNC_TABLE, sqlStatement);

        // The wr_sync table does not have foreign keys defined for the document tables
        // We need to delete the orphaned records from the document tables.
        // The documents must be deleted after deleting the wr_sync records.
        sqlStatement = deleteStatement + "afm_docvers WHERE table_name='wr_sync' "
                + "AND NOT EXISTS (SELECT 1 FROM wr_sync WHERE wr_sync.auto_number = afm_docvers.pkey_value)";
        SqlUtils.executeUpdate("afm_docvers", sqlStatement);

        sqlStatement = deleteStatement + "afm_docversarch WHERE table_name='wr_sync' "
                + "AND NOT EXISTS (SELECT 1 FROM wr_sync WHERE wr_sync.auto_number = afm_docversarch.pkey_value)";
        SqlUtils.executeUpdate("afm_docversarch", sqlStatement);

        sqlStatement = deleteStatement + "afm_docs WHERE table_name='wr_sync' "
                + "AND NOT EXISTS (SELECT 1 FROM wr_sync WHERE wr_sync.auto_number = afm_docs.pkey_value)";
        SqlUtils.executeUpdate("afm_docs", sqlStatement);
    }

    /**
     *
     * Deletes all the sync records for the manager user.
     *
     * @param cfUser User Name of mobile user
     */
    private void deleteSyncManagerWork(final String cfUser) {

        // Call the same function as above
        deleteSyncWork(cfUser);

        String sqlS;

        sqlS = "DELETE FROM wrtl_sync WHERE mob_locked_by = '" + cfUser + QUOTE;
        SqlUtils.executeUpdate(WRTL_SYNC_TABLE, sqlS);

        sqlS = "DELETE FROM wrtr_sync WHERE mob_locked_by = '" + cfUser + QUOTE;
        SqlUtils.executeUpdate(WRTR_SYNC_TABLE, sqlS);

        SqlUtils.commit();

    }

    /**
     *
     * Moves all work requests assigned to the mobile user to the sync tables. Looks only at
     * requests of status Issued or On Hold.
     *
     * @param userName User Name of Craftsperson
     * @param cfId Crafts Person Code
     */
    private void syncFromWebCentralNewAssignedWork(final String userName, final String cfId) {

        // Make sure that if there is already a wr_sync record locked by another mobile user that we
        // exclude it and only read records that are not locked (in the sync table) and are assigned
        // to the mobile user
        final String sqlRestriction =
                "status IN ('I','HP','HA','HL') AND EXISTS (SELECT 1 FROM wrcf WHERE wrcf.wr_id=wr.wr_id and wrcf.cf_id='"
                        + cfId + "')";

        MaintenanceMobileWorkUpdate.insertNewSyncRecords(WR_SYNC_INSERT_FIELDS, sqlRestriction,
            userName);

        // Insert the resource records
        MaintenanceMobileLaborUpdate.createLaborSyncRecords(userName);
        MaintenanceMobilePartsUpdate.createPartSyncRecords(userName);
        MaintenanceMobileCostsUpdate.createOtherCostSyncRecords(userName);

        // Copy documents.
        MaintenanceMobileWorkUpdate.copyWorkRequestDocumentsToSyncWorkRequests(userName);
    }

    /**
     *
     * Checks to see if there is a pending action based on work request status being Com, HA, HP or
     * HL an.
     *
     * @param status - Work Request Status
     * @return true or false based on conditional check
     */
    private boolean pendingAction(final String status) {
        return "Com".equals(status) || "HA".equals(status) || "HP".equals(status)
                || "HL".equals(status);
    }
}