package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Survey step
 * 
 */
public class Survey extends Action {
    
    /**
     * step type
     */
    private static final String STEP_TYPE = "survey";
    
    public Survey() {
        super(STEP_TYPE);
    }
    
    public Survey(final EventHandlerContext context, final String activity_id, final int id,
            final Map values, final String stepName) {
        super(context, activity_id, id, values, STEP_TYPE, stepName);
    }
    
    public Survey(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    /**
     * 
     * Invoke this step
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #checkCondition() Check condition} for this step</li>
     * <li>If em_id is not given in step record, fill in with requestor of current request</li>
     * <li>{@link #logStep() Log step} and send request to requestor</li>
     * </ol>
     * </p>
     * 
     */
    @Override
    public void invoke() {
        if (!checkCondition()) {
            setStepEnded(true);
            return;
        }
        setStepEnded(false);
        if (this.afmRole != null) {
            final List<String> ems = this.getEmployeesFromAfmRole(this.afmRole);
            final String stepCode = logStep();
            for (final String string : ems) {
                this.em_id = string;
                if (this.isNotifyResponsible()) {
                    final Message message = createMessage(stepCode);
                    message.setMailTo(getEmailAddress(this.context, this.em_id));
                    sendRequest(message);
                }
            }
        } else if (this.role != null) {
            final List<String> ems =
                    HelpdeskRoles.getEmployeesFromHelpdeskRole(this.context, this.role,
                        this.tableName, this.fieldName, this.id);
            for (final String string : ems) {
                this.em_id = string;
                final String stepCode = logStep();
                if (this.isNotifyResponsible()) {
                    final Message message = createMessage(stepCode);
                    message.setMailTo(getEmailAddress(this.context, this.em_id));
                    sendRequest(message);
                    
                    // KB 3023429 - also notify substitute(s) of the responsible (EC 2012/07/10)
                    final List<String> substitutes =
                            StepHandler.getWorkflowEmSubstitutes(this.context, this.em_id,
                                this.type);
                    if (!substitutes.isEmpty()) {
                        notifyEmSubstitutes(substitutes);
                    }
                }
            }
        } else if (this.em_id != null || this.vn_id != null || this.cf_id != null) {
            setStepEnded(false);
            final String stepCode = logStep();
            if (this.isNotifyResponsible()) {
                final Message message = createMessage(stepCode);
                if (this.em_id != null) {
                    message.setMailTo(getEmailAddress(this.context, this.em_id));
                    
                    // KB 3023429 - also notify substitute(s) of the responsible (EC 2012/07/10)
                    final List<String> substitutes =
                            StepHandler.getWorkflowEmSubstitutes(this.context, this.em_id,
                                this.type);
                    if (!substitutes.isEmpty()) {
                        notifyEmSubstitutes(substitutes);
                    }
                    
                } else if (this.vn_id != null) {
                    message.setMailTo(getEmailAddress(this.context, "vn", "vn_id", this.vn_id));
                } else if (this.cf_id != null) {
                    message.setMailTo(getEmailAddress(this.context, "cf", "cf_id", this.cf_id));
                    
                    // KB 3023429 - also notify substitute(s) of the responsible (EC 2012/07/10)
                    final List<String> substitutes =
                            StepHandler.getWorkflowCfSubstitutes(this.context, this.cf_id,
                                this.type);
                    if (!substitutes.isEmpty()) {
                        notifyCfSubstitutes(substitutes);
                    }
                } else {
                }
                sendRequest(message);
            }
        } else {
            // default role
            final String role =
                    getActivityParameterString(this.context, this.activity_id, "SurveyRole");
            if (role != null) {
                this.role = role;
                final List<String> ems =
                        HelpdeskRoles.getEmployeesFromHelpdeskRole(this.context, role,
                            this.tableName, this.fieldName, this.id);
                for (final String string : ems) {
                    this.em_id = string;
                    this.stepCode = logStep();
                    
                    if (this.isNotifyResponsible()) {
                        final Message message = createMessage(this.stepCode);
                        message.setMailTo(getEmailAddress(this.context, this.em_id));
                        sendRequest(message);
                        
                        // KB 3023429 - also notify substitute(s) of the responsible (EC 2012/07/10)
                        final List<String> substitutes =
                                StepHandler.getWorkflowEmSubstitutes(this.context, this.em_id,
                                    this.type);
                        if (!substitutes.isEmpty()) {
                            notifyEmSubstitutes(substitutes);
                        }
                    }
                }
            } else {
                // @translatable
                final String errorMessage =
                        localizeString(this.context, "No SurveyRole found for [{0}]");
                final Object[] args = { this.activity_id };
                throw new ExceptionBase(errorMessage, args, true);
            }
        }
    }
    
    // 21.2 survey step assigned to role
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
    
    /**
     * A satisfaction survey cannot be rejected.
     * 
     */
    @Override
    public void reject(final int id, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
}
