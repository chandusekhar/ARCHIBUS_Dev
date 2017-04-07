/**
 * 
 */
package com.archibus.eventhandler.steps;

import com.archibus.jobmanager.EventHandlerContext;

/**
 * Scheduling is used in On Demand Work when scheduling Work Request Trade Assignments (Tasks)
 * 
 */
public class Scheduling extends Action {
    
    private static final String STEP_TYPE = "scheduling";
    
    public Scheduling() {
        super(STEP_TYPE);
    }
    
    /**
     * Constructor
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param stepName Step name
     */
    public Scheduling(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    // 18.2 step assigned to role
    /**
     * @param int stepLogId
     * @param String comment
     * @param String user
     */
    @Override
    public void confirm(final int stepLogId, String comment, final String user) {
        this.stepLogId = stepLogId;
        // KB 3023429 - update comments if step is ended by substitute (EC 2012/07/10)
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        
        updateStep(stepLogId, this.stepStatusResult, comment);
        if (!checkMultiple(false)) {
            final StatusManager statusManager =
                    WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
            statusManager.updateStepStatus(this.stepStatusResult);
        }
    }
    
}
