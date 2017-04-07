package com.archibus.app.bldgops.express;

import com.archibus.jobmanager.*;

/**
 * Job Class for Upgrade to using Building Operation Console.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 * 
 */
public class BldgopsExpressWorkRequestOnly extends JobBase {
    
    /**
     * Constant number 100.
     */
    private static final int ONE_HUNDRED = 100;
    
    /**
     * Constant number 5.
     */
    private static final int FIVE = 5;
    
    /**
     * Constant number 30.
     */
    private static final int THIRTY = 30;
    
    /**
     * Constant number 40.
     */
    private static final int FOURTY = 40;
    
    /**
     * Constant number 50.
     */
    private static final int FIFTY = 50;
    
    /**
     * Constant number 60.
     */
    private static final int SIXTY = 60;
    
    /**
     * Constant number 70.
     */
    private static final int SEVENTY = 70;
    
    /**
     * Constant number 80.
     */
    private static final int EIGHTY = 80;
    
    /**
     * Activity Parameter WorkRequestOnly.
     */
    private final int workRequestOnly;
    
    /**
     * Constructor.
     * 
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public BldgopsExpressWorkRequestOnly(final int workRequestsOnly) {
        
        super();
        
        this.workRequestOnly = workRequestsOnly;
    }
    
    @Override
    public void run() {
        
        this.status.setTotalNumber(ONE_HUNDRED);
        
        // kb#3044161: pass a parameter to method insertWorkflowStepsFromXls() so that when
        // WorkRequestOnly=1, insert two afm_wf_step records when row's status is 'A': those two
        // records have different status 'A' and 'AA'.
        BldgopsExpressInsert.insertWorkflowStepsFromXls(this.workRequestOnly);
        this.status.setCurrentNumber(FIVE);
        
        // kb#3044156: when workRequest=1, create Work Order for existing requests since the status
        // of pending steps is converted from 'A' to 'AA'.
        if (this.workRequestOnly == 1) {
            BldgopsExpressCreate.createWorkOrderIfNotExistsForServiceRequest();
        }
        this.status.setCurrentNumber(THIRTY);
        
        // Update current work request records that are in the 'A' status to the 'AA' status.
        BldgopsExpressUpdate.updateOpenRequestStatus(this.workRequestOnly);
        this.status.setCurrentNumber(FOURTY);
        
        // Update the enum list of field status according to value of WorkRequestsOnl
        new BldgopsExpressStatusEnumUpdate().updateEnumListOfStatusField(this.workRequestOnly);
        this.status.setCurrentNumber(FIFTY);
        
        // If WorkRequestsOnly application parameter is 1, convert status of sla steps and
        // pending steps from 'A' to 'AA'.
        BldgopsExpressSqlHelper.convertSlaStepStatusToAA();
        this.status.setCurrentNumber(SIXTY);
        
        // kb#3043547: un-comment below line since now the logic is changed to allow pending
        // steps exist when upgrading.
        // kb#3042142: Since pending steps must be complete before upgrading, the upgrading logic to
        // add/change helpdesk_step_log data can be commented out
        BldgopsExpressSqlHelper.convertPendingSlaStepStatus(this.workRequestOnly);
        this.status.setCurrentNumber(SEVENTY);
        
        // Move 'Dispatch' step to the AA status when WorkReqeustOnly=1, else move it back to status
        // A.
        BldgopsExpressUpdate.updateDsipatchStepByWorkRequestsOnly(this.workRequestOnly);
        this.status.setCurrentNumber(EIGHTY);
        
        // Update the field value 'autocreate_wo' to 1 when workRequestsOnly is 1.
        BldgopsExpressUpdate.updateSlaToAutoCreateWo(this.workRequestOnly);
        this.status.setCurrentNumber(ONE_HUNDRED);
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
}
