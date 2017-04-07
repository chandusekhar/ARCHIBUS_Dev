package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsMaintenance.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.SQL_DOT;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * Provides supporting method related to executing the workflows related to the mobile updates.
 * Supports the MaintenanceMobileService class.
 *
 * @author Constantine Kriezis
 * @since 21.3
 *
 */
@SuppressWarnings({ "PMD.AvoidUsingSql", "PMD.CyclomaticComplexity", "PMD.NPathComplexity" })
final class MaintenanceMobileManagerWorkflow {

    /**
     * the translatable request string.
     */
    // @translatable
    public static final String REQUESTED = "Request";

    /**
     * the translatable 'self assign already issued' string.
     */
    // @translatable
    public static final String SELF_ASSIGN_ALREADY_ISSUED =
            "Self Assign did not execute as the request is already issued.";

    /**
     * Hide default constructor.
     */
    private MaintenanceMobileManagerWorkflow() {
    }

    /**
     *
     * runMaintenanceMobileManagerWorkflowLogic - Runs workflow rules based on mobile actions.
     *
     * @param record - Work Request Sync record
     * @param status - Previous Work Request Status
     * @return returnMessage - Message reporting any issues with executing the actions
     */
    static String runWorkflowLogic(final DataRecord record, final String status) {
        String returnMessage = "";

        final int wrId = record.getInt(WR_SYNC_TABLE + SQL_DOT + WR_ID);

        final String mobPendingAction =
                record.getString(WR_SYNC_TABLE + SQL_DOT + MOB_PENDING_ACTION);

        final String mobStepAction = record.getString(WR_SYNC_TABLE + SQL_DOT + MOB_STEP_ACTION);

        final String mobStepComments =
                record.getString(WR_SYNC_TABLE + SQL_DOT + MOB_STEP_COMMENTS);

        if (StringUtil.notNullOrEmpty(mobStepAction) && !SELF_ASSIGN_ACTION.equals(mobStepAction)) {
            invokeWorkflowStep(record, wrId, mobStepAction, mobStepComments);
        } else {
            returnMessage = invokeStatusChangeWorkflowRule(record, status, wrId, mobPendingAction,
                mobStepAction);
        }

        return returnMessage;
    }

    /**
     * Invoke status change WorkflowRule.
     *
     * @param record record
     * @param status status
     * @param wrId work request code
     * @param mobPendingAction mobPendingAction
     * @param mobStepAction mobStepAction
     * @return message for response
     */
    private static String invokeStatusChangeWorkflowRule(final DataRecord record,
            final String status, final int wrId, final String mobPendingAction,
            final String mobStepAction) {
        String returnMessage = "";
        // Call rule to Issue status change
        if ("I".equals(mobPendingAction)) {
            returnMessage = issueWorkRequest(record, status, wrId, mobStepAction);
        }

        // Call rule to Cancel status change
        if ("Can".equals(mobPendingAction)) {
            new WorkRequestHandler().cancelWorkRequest(Integer.toString(wrId));
        }

        // Call rule to Cancel status change
        if ("Clo".equals(mobPendingAction)) {
            final JSONArray closeRecords = new JSONArray();
            final JSONObject wrCloseRecord =
                    MaintenanceMobileUtility.buildJSONRecordForClose(record);
            closeRecords.put(wrCloseRecord);
            new WorkRequestHandler().closeWorkRequests(closeRecords);
        }

        // If there is a pending action execute the corresponding rule in Web Central.
        // This accounts for executing the rules for the On Hold, Stop, Complete
        // and Close actions.
        if (MaintenanceMobileUtility.pendingManagerAction(mobPendingAction)) {
            new WorkRequestHandler().updateMobileWorkRequestStatus(wrId, mobPendingAction);
        }
        return returnMessage;
    }

    /**
     * Invoke workflow step.
     *
     * @param record record
     * @param wrId work request code
     * @param mobStepAction mobStepAction
     * @param mobStepComments mobStepComments
     */
    private static void invokeWorkflowStep(final DataRecord record, final int wrId,
            final String mobStepAction, final String mobStepComments) {

        boolean isReturnfromCfAction = false;
        if (mobStepAction != null) {
            isReturnfromCfAction = mobStepAction.indexOf("returnCf") != -1;
        }

        // Call rule to Approve Work Request and change its status
        if ("approve".equals(mobStepAction)) {
            approveWorkRequest(record, wrId, mobStepComments);
        }

        // Call rule to return request
        if (mobStepAction != null && mobStepAction.indexOf("return") != -1
                && !isReturnfromCfAction) {
            returnWorkRequestFromSupervisor(wrId, mobStepAction, mobStepComments);
        }

        // Call rule to Reject step
        if (mobStepAction != null && mobStepAction.indexOf("reject") != -1) {
            rejectWorkRequest(record, wrId, mobStepAction, mobStepComments);

        }

        // Call rule to Approve Estimate and Approve Schedule steps
        final boolean isConfirmStep = isConfirmStep(mobStepAction);
        if (isConfirmStep) {
            new WorkRequestHandler().approveWorkRequest(
                MaintenanceMobileUtility.buildJSONRecordForApprovalStep(record, mobStepComments),
                mobStepComments);
        }

        executeWorflowRuleByAction(record, wrId, mobStepAction, mobStepComments,
            isReturnfromCfAction);
    }

    /**
     * Execute workflow rule by action name.
     *
     * @param record record
     * @param wrId work request code
     * @param mobStepAction action name
     * @param mobStepComments action comments
     * @param isReturnfromCfAction is Return from cf action
     */
    private static void executeWorflowRuleByAction(final DataRecord record, final int wrId,
            final String mobStepAction, final String mobStepComments,
            final boolean isReturnfromCfAction) {
        // Call rule to Complete Estimation step
        if ("completeEstimation".equals(mobStepAction)) {
            new WorkRequestHandler().completeEstimation(WR_TABLE, WR_ID, Integer.toString(wrId),
                MaintenanceMobileUtility.buildJSONRecordForCompleteEstimateScheduleStep(record));
        } else

        // Call rule to Complete Scheduling step
        if ("completeScheduling".equals(mobStepAction)) {
            new WorkRequestHandler().completeScheduling(
                MaintenanceMobileUtility.buildJSONRecordForCompleteEstimateScheduleStep(record));
        } else

        // Call rule for forward step
        if ("forwardWorkRequest".equals(mobStepAction)) {
            forwardWorkRequest(record, wrId, mobStepComments, false);
        } else

        // Call rule for forward issued step
        if ("forwarIssueddWorkRequest".equals(mobStepAction)) {
            forwardWorkRequest(record, wrId, mobStepComments, true);
        } else

        // Call rule for return craftsperson
        if (isReturnfromCfAction) {
            new WorkRequestHandler().returnWorkRequestFromCf(wrId, mobStepComments);

        }

        // kb#3050226 Add verify functionality.
        // call rule to verify step.
        if ("verify".equals(mobStepAction)) {
            new WorkRequestHandler().verifyWorkRequest(
                MaintenanceMobileUtility.buildJSONRecordForVerifyStep(record, mobStepComments));
        }

        if ("verifyIncomplete".equals(mobStepAction)) {
            new WorkRequestHandler().returnWorkRequest(
                MaintenanceMobileUtility.buildJSONRecordForVerifyStep(record, mobStepComments));
        }

        if ("cfComplete".equals(mobStepAction)) {
            final JSONArray completeRecords = new JSONArray();
            completeRecords.put(MaintenanceMobileUtility.buildJSONRecordForClose(record));
            new WorkRequestHandler().completeCf(completeRecords);
        }

        if ("supervisorComplete".equals(mobStepAction)) {
            new WorkRequestHandler().updateMobileWorkRequestStatus(wrId, "Com");
        }
    }

    /**
     * Is confirm step.
     *
     * @param mobStepAction mobStepAction
     * @return is confirm step
     */
    private static boolean isConfirmStep(final String mobStepAction) {
        final boolean isConfirmStep = ("approveEstimate".equals(mobStepAction))
                || ("approveSchedule".equals(mobStepAction))
                || ("approveManager".equals(mobStepAction));
        return isConfirmStep;
    }

    /**
     * Approve Work Request.
     *
     * @param record record
     * @param wrId work request code
     * @param mobStepComments step comments
     */
    private static void approveWorkRequest(final DataRecord record, final int wrId,
            final String mobStepComments) {
        final JSONObject saveRequestJSONRecord =
                MaintenanceMobileUtility.buildJSONRecordForApprovalSave(record, wrId);

        new RequestHandler().saveRequest(saveRequestJSONRecord);

        final JSONObject editAndApproveJSONRecord =
                MaintenanceMobileUtility.buildJSONRecordForApprovalStatus(record, wrId);

        new WorkRequestHandler().editAndApproveWorkRequest(editAndApproveJSONRecord,
            mobStepComments);
    }

    /**
     * issue work request.
     *
     * @param record record
     * @param status record
     * @param wrId work request code
     * @param mobStepAction step action
     * @return message for response
     */
    private static String issueWorkRequest(final DataRecord record, final String status,
            final int wrId, final String mobStepAction) {
        boolean issueFlag = true;

        String returnMessage = "";

        // If the pending issue is from the self assign action and the request is already
        // issued
        // we set the issueFlag to false.
        if ((SELF_ASSIGN_ACTION.equals(mobStepAction))
                && (!("R".equals(status) || "A".equals(status) || "AA".equals(status)))) {
            issueFlag = false;

            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

            // @translatable
            final String localRequest = EventHandlerBase.localizeString(context,
                MaintenanceMobileManagerWorkflow.REQUESTED,
                MaintenanceMobileManagerWorkflow.class.getName());

            // @translatable
            final String localSelfAlreayIssuedMsg = EventHandlerBase.localizeString(context,
                MaintenanceMobileManagerWorkflow.SELF_ASSIGN_ALREADY_ISSUED,
                MaintenanceMobileManagerWorkflow.class.getName());

            // Add message that this cannot be issued.
            returnMessage =
                    localRequest + ": " + Integer.toString(wrId) + " " + localSelfAlreayIssuedMsg;
        }

        if (issueFlag) {
            final JSONArray issueRecords = new JSONArray();
            final JSONObject wrIssueRecord =
                    MaintenanceMobileUtility.buildJSONRecordForIssue(record, wrId);
            issueRecords.put(wrIssueRecord);
            new WorkRequestHandler().issueWorkRequests(issueRecords);
        }
        return returnMessage;
    }

    /**
     * Forward Work Request.
     *
     * @param record record
     * @param wrId work request code
     * @param mobStepComments step comments
     * @param forwardIssuedWorkRequest forward issued WorkRequest
     */
    private static void forwardWorkRequest(final DataRecord record, final int wrId,
            final String mobStepComments, final boolean forwardIssuedWorkRequest) {

        if (forwardIssuedWorkRequest) {
            final JSONArray wrIdList = new JSONArray();
            wrIdList.put(wrId);

            final String fwdSupervisor = MaintenanceMobileUtility.getFieldStringValueOrEmpty(record,
                WR_SYNC_TABLE + SQL_DOT + FWD_SUPERVISOR);
            final String fwdWorkTeamId = MaintenanceMobileUtility.getFieldStringValueOrEmpty(record,
                WR_SYNC_TABLE + SQL_DOT + FWD_WORK_TEAM_ID);
            new WorkRequestHandler().forwardIssuedWorkRequests(wrIdList, fwdSupervisor,
                fwdWorkTeamId, mobStepComments);

            return;
        }

        final JSONObject jsonRecord = new JSONObject();

        final String fwdSupervisor = MaintenanceMobileUtility.getFieldStringValueOrEmpty(record,
            WR_SYNC_TABLE + SQL_DOT + FWD_SUPERVISOR);
        final String fwdWorkTeamId = MaintenanceMobileUtility.getFieldStringValueOrEmpty(record,
            WR_SYNC_TABLE + SQL_DOT + FWD_WORK_TEAM_ID);

        new RequestHandler().updateRequest(MaintenanceMobileUtility.getActivityLogId(wrId), ZERO,
            ZERO, ZERO, fwdSupervisor, ZERO, fwdWorkTeamId, jsonRecord);

        // Add any comments to the cf_notes field
        final String previousCfNotes = record.getString(WR_SYNC_TABLE + SQL_DOT + CF_NOTES);

        if (StringUtil.notNullOrEmpty(mobStepComments)) {
            String newCfNotes = mobStepComments;
            if (StringUtil.notNullOrEmpty(previousCfNotes)) {
                newCfNotes = previousCfNotes + "\n" + mobStepComments;
            }
            SqlUtils.executeUpdate("wr", "UPDATE wr SET cf_notes = "
                    + SqlUtils.formatValueForSql(newCfNotes) + " WHERE wr_id = " + wrId);
        }

    }

    /**
     * Reject work request.
     *
     * @param record record
     * @param wrId wrId
     * @param mobStepAction mobStepAction
     * @param mobStepComments mobStepComments
     */
    private static void rejectWorkRequest(final DataRecord record, final int wrId,
            final String mobStepAction, final String mobStepComments) {
        final WorkRequestHandler handler = new WorkRequestHandler();
        final String[] stepActions = mobStepAction.split(ACTION_NAME_SPLIT);
        if (stepActions.length > 1) {
            final JSONArray rejectToOptionArray = handler.getRejectReturnToOptionsArray(wrId);
            int index = rejectToOptionArray.length() - 1;
            if (Integer.parseInt(stepActions[1]) != -1) {
                index = Integer.parseInt(stepActions[1]);
            }
            final JSONObject rejectStep = rejectToOptionArray.getJSONObject(index);
            handler.rejectWorkRequestToPreviousStep(
                MaintenanceMobileUtility.buildJSONRecordForRejection(record),
                rejectStep.getString("rejected_step"), rejectStep.getString("user_name"));
        } else {
            handler.rejectWorkRequest(MaintenanceMobileUtility.buildJSONRecordForRejection(record),
                mobStepComments);
        }
    }

    /**
     * Return WorkRequest from supervisor.
     *
     * @param wrId work request code
     * @param mobStepAction mobile step action name
     * @param mobStepComments mobile step comments
     */
    private static void returnWorkRequestFromSupervisor(final int wrId, final String mobStepAction,
            final String mobStepComments) {
        final WorkRequestHandler handler = new WorkRequestHandler();
        final String[] stepActions = mobStepAction.split(ACTION_NAME_SPLIT);
        if (stepActions.length > 1) {
            int index = 0;
            if (Integer.parseInt(stepActions[2]) != -1) {
                index = Integer.parseInt(stepActions[2]);
            }

            handler.returnWorkRequestFromSupervisor(wrId, stepActions[1], index, mobStepComments);
        } else {
            handler.returnWorkRequestFromSupervisorBaseOnCurrentStep(wrId, mobStepComments);
        }
    }

}