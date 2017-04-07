package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.text.SimpleDateFormat;
import java.util.*;

import org.springframework.util.StringUtils;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * Provides supporting methods related to synchronizing the mobile user data with the main work
 * request tables. Supports the MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.3
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
final class MaintenanceMobileManager {

    /**
     * Current Date - this can be updated to reflect the local date based on the building and site.
     */
    public static final String SQL_CURRENT_DATE = getSQLCurrentDateString();

    /**
     * WR_WORK_TEAM_RESTRICTION - Selects the work teams the user belongs to.
     */
    public static final String WR_WORK_TEAM_RESTRICTION =
            " SELECT cf_work_team.work_team_id FROM cf,cf_work_team WHERE cf.cf_id = cf_work_team.cf_id AND  ";

    /**
     * AbBldgOpsHelpDesk activity.
     */
    private static final String HELP_DESK_ACTIVITY = "AbBldgOpsHelpDesk";

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileManager() {
    }

    /**
     * Update part records from the part sync table.
     *
     * @param userName User Name of Supervisor
     * @param cfId Crafts Person Code
     * @param userMaintRole User's maintenance role
     */
    static void syncFromWebCentralNewManagerWork(final String userName, final String cfId,
            final String userMaintRole) {

        // Get values for key user values to pass to the method that sets the restrictions
        final String userEmail = ContextStore.get().getUser().getEmail();
        final String emId = ContextStore.get().getUser().getEmployee().getId();
        final String userRole = ContextStore.get().getUser().getRole();

        // Set the main restriction for all roles
        String permanentRestriction = getAllRoleRestriction(userName, userEmail, emId, userRole);

        if ("supervisor".equals(userMaintRole)) {
            // Build the restriction for the supervisor consistent with the Bldg Ops Console
            permanentRestriction = permanentRestriction + SQL_OR
                    + getSupervisorRestriction(userEmail, emId, userRole);
        }

        permanentRestriction = START_PARENTHESIS + permanentRestriction + END_PARENTHESIS;

        // Adding to ensure that requests of status Stopped Cancelled and Closed do not show in the
        // mobile.
        final String statusRestriction =
                START_PARENTHESIS + WR_TABLE + SQL_DOT + STATUS + " NOT IN ('S','Can','Clo')"

                        + END_PARENTHESIS;

        permanentRestriction = permanentRestriction + SQL_AND + statusRestriction;
        // + SQL_AND
        // + noWorkWithVerificationStepRestriction;

        MaintenanceMobileWorkUpdate.insertNewSyncRecords(WR_SYNC_INSERT_FIELDS,
            permanentRestriction, userName);

        // Insert the related work requests
        MaintenanceMobileManagerWorkUpdate.insertRelatedRequestSyncRecords(WR_SYNC_INSERT_FIELDS,
            userName);

        // Update ancillary work request sync fields.

        MaintenanceMobileManagerWorkUpdate.updateActivityLogValues(userName);

        MaintenanceMobileManagerWorkUpdate.updateStepWaiting(userRole, userName, emId);

        MaintenanceMobileManagerWorkUpdate.updateSupervisor(userName, emId, userEmail);

        MaintenanceMobileManagerWorkUpdate.updateCraftsperson(userName, userEmail);

        MaintenanceMobileManagerWorkUpdate.updateWorkTeamSelfAssign(userName, userEmail);

        MaintenanceMobileManagerWorkUpdate.updateEstimateAndSchedule(userName);

        // Insert the resource records
        MaintenanceMobileLaborUpdate.createLaborSyncRecords(userName);
        MaintenanceMobilePartsUpdate.createPartSyncRecords(userName);
        MaintenanceMobileCostsUpdate.createOtherCostSyncRecords(userName);
        MaintenanceMobileManagerTradesUpdate.createTradeSyncRecords(userName);
        MaintenanceMobileManagerToolsUpdate.createToolSyncRecords(userName);

        // KB#3050980 // Insert reference records into reference sync table.
        MaintenanceMobileManagerReferenceUpdate.insertReferenceSyncRecords(userName);

        insertClosedAndCancelledMyRequests(userName, emId);

        // Copy documents
        MaintenanceMobileWorkUpdate.copyWorkRequestDocumentsToSyncWorkRequests(userName);

    }

    /**
     * Inserts work requests that have been closed or cancelled within the
     * DaysAfterArchiveWRShowInMobile activity parameter.
     *
     * @param userName User name
     * @param emId employee code of the current user.
     */
    static void insertClosedAndCancelledMyRequests(final String userName, final String emId) {

        // Get show days after work request archived
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String workRequestLimit = EventHandlerBase.getActivityParameterString(context,
            HELP_DESK_ACTIVITY, "MobileWorkRequestsMaxQuantity");

        // If there is no activity parameter we set the default to the value from java
        // which is 250.
        if (workRequestLimit == null) {
            workRequestLimit = WORK_REQUESTS_TO_SYNC;
        }
        final int existingWrCouts = DataStatistics.getIntWithoutVpa(WR_SYNC_TABLE, WR_ID, "COUNT",
            WR_SYNC_TABLE + SQL_DOT + MOB_LOCKED_BY + EQUAL + SqlUtils.formatValueForSql(userName));
        final int closeAndCanelledMyRequestCounts =
                Integer.parseInt(workRequestLimit) - existingWrCouts;
        if (closeAndCanelledMyRequestCounts > 0) {
            String showDaysAfterArchived = EventHandlerBase.getActivityParameterString(context,
                "AbBldgOpsOnDemandWork", "DaysAfterArchiveWRShowInMobile");
            final String fields = StringUtils.arrayToCommaDelimitedString(WR_SYNC_INSERT_FIELDS);

            final String insertFields = fields + SQL_COMMA + LAST_MODIFIED + SQL_COMMA + DELETED
                    + SQL_COMMA + MOB_LOCKED_BY + SQL_COMMA + MOB_IS_CHANGED;
            final String selectFields =
                    fields + "," + System.currentTimeMillis() + ",0,'" + userName + "',0";

            // If there is no activity parameter we set the default to the value from java
            // which is 7.
            if (showDaysAfterArchived == null) {
                showDaysAfterArchived = SHOW_DAYS_AFTER_ARCHIVED;
            }

            final String workRequestSortParameter = EventHandlerBase.getActivityParameterString(
                context, HELP_DESK_ACTIVITY, "MobileWorkRequestsSyncSort");
            String workRequestSort = " ORDER BY wr_id ASC";

            // EAR 1/27/17 implementation for KB 3039928
            if (StringUtil.notNullOrEmpty(workRequestSortParameter)) {
                workRequestSort = parseSortFields(workRequestSortParameter);
            }

            final String restriction = "hwr.requestor=" + SqlUtils.formatValueForSql(emId)
                    + " and  ${sql.daysBeforeCurrentDate('hwr.date_closed')} &lt;="
                    + showDaysAfterArchived;

            String sql = "";

            if (SqlUtils.isOracle()) {

                sql = "INSERT INTO wr_sync( " + insertFields + ") SELECT " + selectFields
                        + " FROM (select " + selectFields + " from hwr WHERE " + restriction
                        + " AND NOT EXISTS(SELECT 1 FROM wr_sync WHERE hwr.wr_id = wr_sync.wr_id AND wr_sync.mob_locked_by= '"
                        + userName + "' AND wr_sync.deleted=0 ) " + workRequestSort
                        + ") where rownum <=" + closeAndCanelledMyRequestCounts;

            } else {
                sql = "INSERT INTO wr_sync(" + insertFields + ") SELECT TOP "
                        + closeAndCanelledMyRequestCounts + " " + selectFields + " FROM hwr WHERE "
                        + restriction
                        + " AND NOT EXISTS(SELECT 1 FROM wr_sync WHERE hwr.wr_id = wr_sync.wr_id AND wr_sync.mob_locked_by='"
                        + userName + "' AND wr_sync.deleted=0) " + workRequestSort;

            }

            SqlUtils.executeUpdate(WR_SYNC_TABLE, sql);
        }
    }

    /**
     * Parse sort field from parameter.
     *
     * @param workRequestSortParameter - sort parameter.
     * @return - the new request status.
     */
    private static String parseSortFields(final String workRequestSortParameter) {
        String workRequestSort = "";
        final String[] sortFields = workRequestSortParameter.split(";");
        if (sortFields[1].toUpperCase().contains("DESC")) {
            workRequestSort = SQL_ORDER_BY + sortFields[0] + " DESC";
        } else {
            workRequestSort = SQL_ORDER_BY + sortFields[0] + " ASC";
        }

        return workRequestSort;
    }

    /**
     *
     * syncFromMobileExistingManagerWork - Updates existing manager work requests with the data from
     * mobile. This overwrites the main work request data in web central as the assumption is that
     * once a work request is assigned to a mobile user, that user has control of the fields that
     * he/she can update on the device.
     *
     * @param userName - Mobile User Name - userMaintRole - User's Maintenance Role
     * @param cfId craftsperson code of the user.
     * @return returnMessage - All messages in a single string.
     */
    static String syncFromMobileExistingManagerWork(final String userName, final String cfId) {
        String returnMessage = "";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        // Create data source for work request sync table
        final DataSource datasource =
                DataSourceFactory.createDataSourceForFields(WR_SYNC_TABLE, WR_SYNC_MGR_FIELDS);
        datasource.setContext();
        datasource.setMaxRecords(0);

        final String sqlRestriction = "mob_locked_by = '" + userName
                + "' AND wr_sync.wr_id IS NOT NULL "
                + " AND EXISTS (SELECT 1 FROM wr WHERE wr.wr_id = wr_sync.wr_id) AND mob_is_changed=1";

        // Add restriction to look for all work request sync records that are locked for the
        // manager and that also have a work request code
        datasource.addRestriction(Restrictions.sql(sqlRestriction));

        // Get the work request sync records
        final List<DataRecord> records = datasource.getRecords();

        // Go through every work request sync record to update the work request and component
        // records - This can be updated to exclude work requests that are already closed in WebC.

        final Map<Integer, String> wrStatus = new HashMap<Integer, String>();
        final Set<Integer> modifiedWorkRequests = new HashSet<Integer>();

        // Update the work requests that have been modified on the mobile device
        for (final DataRecord record : records) {

            final String status = updateWorkRequest(record);
            final int wrId = record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID);
            modifiedWorkRequests.add(wrId);
            wrStatus.put(wrId, status);
        }

        updateResourceTables(userName, cfId, modifiedWorkRequests);

        // Loop through the records again, this time calculate the costs for the modified work
        // requests and execute the workflow logic
        for (final DataRecord record : records) {
            final int wrId = record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID);
            final int mobStatStepChg = record.getInt(WR_SYNC_TABLE + SQL_DOT + MOB_STAT_STEP_CHG);

            // Calculate costs after resource records are inserted and updated.
            new WorkRequestHandler().recalculateCosts(context, wrId);
            new WorkRequestHandler().recalculateEstCosts(context, wrId);

            String newMessage = "";
            if (mobStatStepChg == 1) {
                newMessage = MaintenanceMobileManagerWorkflow.runWorkflowLogic(record,
                    wrStatus.get(wrId));

            }

            if (!("".equals(newMessage))) {
                returnMessage = returnMessage + "\n" + newMessage;
            }
        }

        return returnMessage;
    }

    /**
     * Updates the Pending Action and Step Change status of the work request record.
     *
     * @param syncRecord - record to update.
     * @return - the new request status.
     */
    private static String updateWorkRequest(final DataRecord syncRecord) {
        final int mobStatStepChg = syncRecord.getInt(WR_SYNC_TABLE + SQL_DOT + MOB_STAT_STEP_CHG);

        final String mobPendingAction =
                syncRecord.getString(WR_SYNC_TABLE + SQL_DOT + MOB_PENDING_ACTION);

        final int wrId = syncRecord.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID);

        // Update the work request data from the sync data and return the previous status
        final String workStatus = MaintenanceMobileManagerWorkUpdate
            .updateManagerWorkRequestRecord(syncRecord, wrId, mobPendingAction, mobStatStepChg);

        return workStatus;
    }

    /**
     * Updates the resource records that have changed on the client.
     *
     * @param userName - User name.
     * @param cfId - craftsperson code of the user.
     * @param updatedRequests - set of work request codes that have been previously modified.
     */
    private static void updateResourceTables(final String userName, final String cfId,
            final Set<Integer> updatedRequests) {
        // Update the request's labor records from the sync labor data
        MaintenanceMobileLaborUpdate.updateLaborRecords(userName, cfId, updatedRequests);

        // Update the request's part records from the sync parts data
        MaintenanceMobilePartsUpdate.updatePartRecords(userName);

        // Update the request's cost records from the sync costs data
        MaintenanceMobileCostsUpdate.updateCostRecords(userName, updatedRequests);

        // Update the request's tool records from the sync tools data
        MaintenanceMobileManagerToolsUpdate.updateToolRecords(userName, updatedRequests);

        // Update the request's trade records from the sync trades data
        MaintenanceMobileManagerTradesUpdate.updateTradeRecords(userName, updatedRequests);
    }

    /**
     * Get the all role restriction that applies to all the roles.
     *
     * @param mobUser - Mobile User
     * @param userEmail - Mobile User's Email
     * @param emId - Employee Id
     * @param userRole - User Role
     * @return craftspersonRestriction
     */
    static String getAllRoleRestriction(final String mobUser, final String userEmail,
            final String emId, final String userRole) {

        String allRoleRestriction = "";

        if (StringUtil.notNullOrEmpty(emId)) {
            allRoleRestriction = getClientRestriction(emId) + SQL_OR;
        }

        allRoleRestriction = allRoleRestriction + getCraftspersonRestriction(userEmail) + SQL_OR
                + getStepCompleterRestriction(mobUser, userEmail, emId, userRole);

        return allRoleRestriction;
    }

    /**
     * Get the craftsperson restriction - consistent with code in the ops console under the
     * opsConsoleFilterRestrictionController.
     *
     * @param userEmail - Mobile User's Email
     * @return craftspersonRestriction
     */
    static String getCraftspersonRestriction(final String userEmail) {

        final String selfAssignRestriction =
                "  (NOT EXISTS (SELECT 1 FROM wrcf WHERE wrcf.wr_id = wr.wr_id AND wrcf.status = 'Active') AND"
                        + " (EXISTS (SELECT 1 FROM cf,cf_work_team WHERE cf.cf_id = cf_work_team.cf_id and cf.is_supervisor = 0 and cf.email = "
                        + SqlUtils.formatValueForSql(userEmail)
                        + " AND cf_work_team.work_team_id = wr.work_team_id)) AND"
                        + " wr.status = 'AA' AND exists (SELECT 1 FROM cf,cf_work_team,work_team WHERE cf.cf_id = cf_work_team.cf_id AND cf_work_team.work_team_id = work_team.work_team_id AND work_team.cf_assign= 1 AND cf_work_team.work_team_id = wr.work_team_id AND cf.email = "
                        + SqlUtils.formatValueForSql(userEmail) + " ))";

        // Changed on 9/17/14 to include on hold requests in addition to issued.
        final String craftspersonRestriction = " ((" + selfAssignRestriction + ") "
                + " OR (wr.status IN ('I','HA','HP','HL') AND  EXISTS (SELECT 1 FROM wrcf WHERE wrcf.status = 'Active' and wrcf.wr_id = wr.wr_id and (wrcf.cf_id IN (select cf.cf_id from cf where cf.email = "
                + SqlUtils.formatValueForSql(userEmail)
                + ") OR wrcf.cf_id IN (SELECT workflow_substitutes.cf_id FROM workflow_substitutes,cf WHERE workflow_substitutes.substitute_cf_id =cf.cf_id and cf.email = "
                + SqlUtils.formatValueForSql(userEmail)
                + " AND workflow_substitutes.steptype_or_role= 'craftsperson'"
                + " AND (workflow_substitutes.start_date_unavailable  IS NULL OR workflow_substitutes.start_date_unavailable <= "
                + SQL_CURRENT_DATE
                + ") AND (workflow_substitutes.end_date_unavailable IS NULL  OR workflow_substitutes.end_date_unavailable >= "
                + SQL_CURRENT_DATE + "))) )))";

        return craftspersonRestriction;
    }

    /**
     * Get the step completer restriction - consistent with code in the ops console under the
     * opsConsoleFilterRestrictionController.
     *
     * @param mobUser - Mobile User
     * @param userEmail - Mobile User's Email
     * @param emId - User's Employee
     * @param userRole - User's Role
     * @return stepCompleterRestriction
     */
    static String getStepCompleterRestriction(final String mobUser, final String userEmail,
            final String emId, final String userRole) {

        String stepEmRestriction = "";
        String substituteRestriction = "";

        if (StringUtil.notNullOrEmpty(emId)) {
            stepEmRestriction = " OR wr_step_waiting.em_id = " + SqlUtils.formatValueForSql(emId);

            substituteRestriction =
                    " OR wr_step_waiting.em_id IN (SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.substitute_em_id = "
                            + SqlUtils.formatValueForSql(emId)
                            + " AND workflow_substitutes.steptype_or_role = wr_step_waiting.step_type"
                            + " AND (workflow_substitutes.start_date_unavailable IS NULL OR  workflow_substitutes.start_date_unavailable <= "
                            + SQL_CURRENT_DATE
                            + " ) AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                            + SQL_CURRENT_DATE + ") )";
        }

        final String stepCompleterRestriction =
                "(EXISTS (SELECT 1 FROM wr_step_waiting where wr_step_waiting.wr_id=wr.wr_id and wr_step_waiting.status = wr.status"
                        + " AND ( wr_step_waiting.role_name = "
                        + SqlUtils.formatValueForSql(userRole) + " OR wr_step_waiting.user_name = "
                        + SqlUtils.formatValueForSql(mobUser) + stepEmRestriction
                        + substituteRestriction + ")))";

        return stepCompleterRestriction;
    }

    /**
     * Get the supervisor restriction - consistent with code in the ops console under the
     * opsConsoleFilterRestrictionController.
     *
     * @param userEmail - Mobile User's Email
     * @param emId - User's Employee
     * @param userRole - User's Role
     * @return supervisorRestriction
     */
    static String getSupervisorRestriction(final String userEmail, final String emId,
            final String userRole) {

        final String supervisorRestriction = "(wr.supervisor = " + SqlUtils.formatValueForSql(emId)
                + " OR (wr.supervisor IS NULL AND wr.work_team_id IN ( " + WR_WORK_TEAM_RESTRICTION
                + " cf.email = " + SqlUtils.formatValueForSql(userEmail) + ")) "
                + " OR wr.supervisor IN (SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.steptype_or_role='supervisor'"
                + " AND workflow_substitutes.substitute_em_id = " + SqlUtils.formatValueForSql(emId)
                + "   AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                + SQL_CURRENT_DATE
                + ")  AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                + SQL_CURRENT_DATE + "))" + " OR (wr.supervisor IS NULL AND wr.work_team_id IN ("
                + WR_WORK_TEAM_RESTRICTION
                + " cf.email IN (SELECT email FROM em WHERE em_id IN (SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.steptype_or_role='supervisor'"
                + "  AND workflow_substitutes.substitute_em_id = "
                + SqlUtils.formatValueForSql(emId)
                + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                + SQL_CURRENT_DATE
                + ") AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                + SQL_CURRENT_DATE + "))))))";

        return supervisorRestriction;
    }

    /**
     * Get the client restriction - consistent with code in the ops console under the
     * opsConsoleFilterRestrictionController.
     *
     * @param emId - User's Employee Id
     * @return clientRestriction
     */
    static String getClientRestriction(final String emId) {

        final String clientRestriction = "(wr.requestor =" + SqlUtils.formatValueForSql(emId) + ")";

        return clientRestriction;
    }

    /**
     * @return string of current date.
     *
     */
    static String getSQLCurrentDateString() {

        final Date currentDate = new Date();
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");

        return " ${sql.date(" + QUOTE + dateFormat.format(currentDate) + QUOTE + ")} ";
    }

}