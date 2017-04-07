package com.archibus.app.bldgops.express;

import com.archibus.datasource.DataStatistics;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.eventhandler.sla.ServiceLevelAgreementHandler;
import com.archibus.jobmanager.*;
import com.archibus.utility.StringUtil;

/**
 * Job Class for Upgrade to using Building Operation Console.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 * 
 */
public class BldgopsExpressUpgrade extends JobBase {
    
    /**
     * Constant number 100.
     */
    private static final int ONE_HUNDRED = 100;
    
    /**
     * Constant number 10.
     */
    private static final int TEN = 5;
    
    /**
     * Constant number 50.
     */
    private static final int FIFTY = 50;
    
    /**
     * Constant number 60.
     */
    private static final int SIXTY = 60;
    
    /**
     * Constant number 80.
     */
    private static final int EIGHTY = 60;
    
    /**
     * Constant part_id.
     */
    private static final String PART_ID = "part_id";
    
    /**
     * Constant COUNT.
     */
    private static final String COUNT = "COUNT";
    
    /**
     * Activity Parameter WorkRequestOnly.
     */
    private final int workRequestOnly;
    
    /**
     * Indicate if Activity Parameter WorkRequestOnly chagned.
     */
    private final int isWorkRequestOnlyChanged;
    
    /**
     * Indicate if need to run UpdateSLAStepsToWorkRequest.
     */
    private final int needUpdateSLAStepsToWorkRequest;
    
    /**
     * Constructor.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     * @param isWorkRequestOnlyChanged int '1' or '0' to indicate if passed in workRequestsOnly is
     *            different with original stored one in DataBase.
     * @param needUpdateSLAStepsToWorkRequest int '1' or '0' to indicate need to execute logics for
     *            transferring SLA data from HelpDesk to OnDemand.
     */
    public BldgopsExpressUpgrade(final int workRequestsOnly, final int isWorkRequestOnlyChanged,
            final int needUpdateSLAStepsToWorkRequest) {
        
        super();
        
        this.workRequestOnly = workRequestsOnly;
        this.isWorkRequestOnlyChanged = isWorkRequestOnlyChanged;
        this.needUpdateSLAStepsToWorkRequest = needUpdateSLAStepsToWorkRequest;
    }
    
    @Override
    public void run() {
        
        String feebackMessage = "";
        
        this.status.setTotalNumber(ONE_HUNDRED);
        // kb#3044161: pass a parameter to method insertWorkflowStepsFromXls() so that when
        // WorkRequestOnly=1, insert two afm_wf_step records when row's status is 'A': those two
        // records have different status 'A' and 'AA'.
        // kb#3042102: always insert steps from file afm_wf_steps_UPGRADE.xlsx when user chooses to
        // use building console.
        // kb#3042983: Instead of copying all the AbBldgOpsHelpDesk records in afm_wf_steps,
        // only create the necessary AbBldgOpsOnDemandWork records individually based on the
        // attached spreadsheet.
        BldgopsExpressInsert.insertWorkflowStepsFromXls(this.workRequestOnly);
        // BldgopsExpressSqlHelper.copyWfrStepsFromHelpDeskToOnDemand();
        
        // KB#3044424: move the data-prerequisite step to front from behind.
        // KB3016857 - when upgrade, coly cf.work_team_id as record of cf_work_team
        final WorkRequestHandler handler = new WorkRequestHandler();
        if (handler.checkSchemaExisting("cf_work_team", "cf_id")) {
            BldgopsExpressSqlHelper.copyCfWorkTeam();
        }
        
        // KB#3047670:change matching logic to use new ordering sequence field that is not part of the primary key.
        if (handler.checkSchemaExisting("helpdesk_sla_request", "match_ordering_seq")) {
            BldgopsExpressSqlHelper.copyMatchOrderingSeq();
        }
        
        if (DataStatistics.getInt("pt", PART_ID, COUNT) > 0
                && DataStatistics.getInt("pt_store_loc_pt", PART_ID, COUNT) == 0) {
            BldgopsExpressInsert.associatePartToMainLocation();
        }
        
        // Make necessary Data changes so that only support On Demand requests.
        if (this.needUpdateSLAStepsToWorkRequest == 1) {
            
            feebackMessage = processSteps();
        }
        
        if (this.isWorkRequestOnlyChanged == 1) {
            
            processingForWorkRequestOnly();
            
        }
        this.status.setCurrentNumber(EIGHTY);
        
        processingOfOtherData();
        
        this.status.setCurrentNumber(ONE_HUNDRED);
        
        // set error message to response
        if (StringUtil.notNullOrEmpty(feebackMessage)) {
            
            this.status.addProperty("errorMessage", feebackMessage);
        }
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Perform other related data processing for Building Console upgrade.
     * 
     */
    private void processingOfOtherData() {
        // kb#3042629: manually set Value for field 'step_status_result'/'step_status_rejected' of
        // Dispatch step ('step_status_result'= 'Dispatched' and 'step_status_rejected' =
        // 'Rejected') while upgrade.
        BldgopsExpressSqlHelper.setValueOfDispatchWrStep();
        
        // Run update logics also including:
        // Update problem class to 'On Demand Work' of existing data.
        BldgopsExpressSqlHelper.updateProblemClass();
        
        // KB3042114 -Update notification view link in application parameters table.
        BldgopsExpressSqlHelper.updateNotificationLink();
        
        // kb#3043202:Change "Use Bldg Ops Console" upgrade logic to enable new processes rather
        // than insert new tasks
        // Change certain afm_ptasks entries to be compatible with the new Building Operations
        // Console and SLA interface.
        // BldgopsExpressInsert.insertPtasksForBldgopsConsole();
        BldgopsExpressTasksSwitch.enableBuildingOperationConsoleTasks();
        BldgopsExpressSqlHelper.updateAfmPtaskEntryForBldgopsConsole();
        
        // Update the grouping field for the existed SLAs of 'SERVICE DESK - MAINTENANCE'.
        BldgopsExpressUpdate.updateSlaGrouping();
        
        // KB3041176 - For existing SLAs, the Workflow Summary and Service Summary fields appear
        // blank, so when upgrade, fill the values.
        final ServiceLevelAgreementHandler slaHandler = new ServiceLevelAgreementHandler();
        slaHandler.updateExistingSlaSummaryFields();
    }
    
    /**
     * Perform status converting according to the workRequestOnly.
     * 
     */
    private void processingForWorkRequestOnly() {
        // Update current work request records that are in the 'A' status to the 'AA' status.
        BldgopsExpressUpdate.updateOpenRequestStatus(this.workRequestOnly);
        
        // Update the enum list of field status according to value of WorkRequestsOnl
        new BldgopsExpressStatusEnumUpdate().updateEnumListOfStatusField(this.workRequestOnly);
        
        // Move 'Dispatch' step to the AA status when WorkReqeustOnly=1, else move it back to
        // status A.
        BldgopsExpressUpdate.updateDsipatchStepByWorkRequestsOnly(this.workRequestOnly);
        
        // Update the field value 'autocreate_wo' to 1 when workRequestsOnly is 1.
        BldgopsExpressUpdate.updateSlaToAutoCreateWo(this.workRequestOnly);
    }
    
    /**
     * Perform workflow step and sla step related processing.
     * 
     * @return possible feedback message
     */
    private String processSteps() {
        
        String feebackMessage;
        BldgopsExpressSlaStepUpdate.updateSlaStepsFromHelpDeskToOnDemand();
        this.status.setCurrentNumber(TEN);
        
        feebackMessage = BldgopsExpressCreate.createWorkRequestIfNotExistsForServiceRequest();
        this.status.setCurrentNumber(FIFTY);
        
        // kb#3043547: un-comment below line since now the logic is changed to allow pending
        // steps exist when upgrading.
        // kb#3042142: Since pending steps must be complete before upgrading, the upgrading
        // logic to add/change helpdesk_step_log data can be commented out
        BldgopsExpressSqlHelper.attachPendingStepsOfServiceRequestToWorkRequest();
        
        // kb#3043398: If more than one step shows as pending for a work request status, then
        // remove the one with the higher step ordering sequence
        BldgopsExpressDelete.deleteDuplicatedPendingSteps();
        
        // If WorkRequestsOnly application parameter is 1, convert status of sla steps and
        // pending steps from 'A' to 'AA'.
        if (this.workRequestOnly == 1) {
            
            BldgopsExpressSqlHelper.convertSlaStepStatusToAA();
        }
        
        // kb#3044244: only convert or restore status of pending steps bwtween 'A' and 'AA' when
        // WorkRequestOnly is
        // changed.
        // kb#3043690: when workRequest=0 also to restore the status of pending steps from 'AA'
        // to 'A'.
        // kb#3043547: un-comment below line since now the logic is changed to allow pending
        // steps exist when upgrading.
        // kb#3042142: Since pending steps must be complete before upgrading, the upgrading
        // logic to add/change helpdesk_step_log data can be commented out
        if (this.isWorkRequestOnlyChanged == 1) {
            BldgopsExpressSqlHelper.convertPendingSlaStepStatus(this.workRequestOnly);
        }
        
        // kb#3044156: when workRequest=1, create Work Order for existing requests since the status
        // of pending steps is converted from 'A' to 'AA'.
        if (this.isWorkRequestOnlyChanged == 1 && this.workRequestOnly == 1) {
            BldgopsExpressCreate.createWorkOrderIfNotExistsForServiceRequest();
        }
        
        // kb#3044070: insert new helpdesk_step_log records for final existed pending steps at the
        // end of the upgrade progress to make their step_log_id bigger than any not pending steps;
        // meanwhile to remove the original ones for avoiding duplication.
        BldgopsExpressSqlHelper.adjustPendingSteps();
        
        this.status.setCurrentNumber(SIXTY);
        
        return feebackMessage;
    }
}
