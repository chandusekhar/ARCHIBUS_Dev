package com.archibus.eventhandler.steps;

import java.util.Map;

import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * Estimation step
 * 
 */

public class Estimation extends Action {
    
    /**
     * Steptype
     */
    private static final String STEP_TYPE = "estimation";
    
    /**
     * Constructor setting <code>step_type</code>
     * 
     */
    public Estimation() {
        super(STEP_TYPE);
    }
    
    /**
     * Constructor setting basic step information and extra properties
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param values Map with step
     *            {@link com.archibus.eventhandler.steps.StepImpl#setProperties(Map) properties}
     * @param stepName step (afm_wf_steps.step) with step type 'estimation'
     */
    public Estimation(final EventHandlerContext context, final String activity_id, final int id,
            final Map values, final String stepName) {
        super(context, activity_id, id, values, STEP_TYPE, stepName);
    }
    
    /**
     * Constructor setting basic step information
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param stepName Step name (afm_wf_steps.step) with step type 'estimation'
     */
    public Estimation(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    // 18.2 Estimation step assigned to role
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
