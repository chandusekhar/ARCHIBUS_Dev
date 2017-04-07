package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Verification step
 */
public class Verification extends Action {
    
    private static final String STEP_TYPE = "verification";
    
    public Verification() {
        super(STEP_TYPE);
    }
    
    public Verification(final EventHandlerContext context, final String activity_id, final int id,
            final Map<String, Object> values, final String stepName) {
        super(context, activity_id, id, values, STEP_TYPE, stepName);
    }
    
    public Verification(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    /**
     * Invoke this step
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
            logStep();
            for (final String string : ems) {
                this.em_id = string;
                if (this.isNotifyResponsible()) {
                    final Message message = createMessage(null);
                    message.setMailTo(getEmailAddress(this.context, this.em_id));
                    sendRequest(message);
                }
            }
        } else if (this.role != null) {
            final List<String> ems =
                    HelpdeskRoles.getEmployeesFromHelpdeskRole(this.context, this.role,
                        this.tableName, this.fieldName, this.id);
            for (final Iterator<String> it = ems.iterator(); it.hasNext();) {
                this.em_id = it.next();
                logStep();
                
                if (this.isNotifyResponsible()) {
                    final Message message = createMessage(null);
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
            logStep();
            if (this.isNotifyResponsible()) {
                final Message message = createMessage(null);
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
            // default roles
            final String role =
                    getActivityParameterString(this.context, this.activity_id, "VerificationRole");
            if (role != null) {
                this.role = role;
                final List<String> ems =
                        HelpdeskRoles.getEmployeesFromHelpdeskRole(this.context, role,
                            this.tableName, this.fieldName, this.id);
                for (final Iterator<String> it = ems.iterator(); it.hasNext();) {
                    this.em_id = it.next();
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
                        localizeString(this.context, "No VerificationRole found for [{0}]");
                final Object[] args = { this.activity_id };
                throw new ExceptionBase(errorMessage, args, true);
            }
        }
    }
    
    // 21.2 Verification step assigned to role
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
     * 
     * Reissue.<br />
     * If a supervisor 'rejects' a verification, the request is sent back to the craftspersons or
     * assignee and the status is set back to Issued(I)
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #checkUser(String, int) Check if the user is authorized to execute this step}</li>
     * <li>{@link #updateStep(int, String, String) Update step record (sets step_status on
     * stepStatusRejected)}</li>
     * <li>Set status and step_status of request record with
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager statusmanager} to
     * Issued</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param stepLogId Step log id
     * @param comment Comments from user
     * @param user Name of verifying user (supervisor) (afm_users.user_name)
     *            </p>
     * 
     */
    @Override
    public void reissue(final int stepLogId, String comment, final String user) {
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        
        updateStep(stepLogId, this.stepStatusRejected, comment);
        
        final StatusManager statusManager =
                WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
        statusManager.issueRequest();
        // statusManager.updateStepStatus(Constants.STEP_STATUS_NULL);
        
        if (this.activity_id.equals(Constants.ONDEMAND_ACTIVITY_ID)) {
            final WorkRequestHandler handler = new WorkRequestHandler();
            handler.createNewWrcfForReissueRequest(this.id);
        } 
        
        final ServiceLevelAgreement sla =
                new ServiceLevelAgreement(this.context, this.tableName, this.fieldName, this.id);
        if (sla.isNotifyServiceProvider()) {
            if (this.activity_id.equals(Constants.HELPDESK_ACTIVITY_ID)) {
                final RequestHandler handler = new RequestHandler();
                handler.notifyServiceProvider(this.context, this.id);
            } else if (this.activity_id.equals(Constants.ONDEMAND_ACTIVITY_ID)) {
                final Message message = new Message(this.context);
                message.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
                message.setReferencedBy("NOTIFY_SUPERVISOR_WFR");
                message.setBodyMessageId("NOTIFY_VERIFICATION_RETURN_TEXT");
                message.setSubjectMessageId("NOTIFY_VERIFICATION_RETURN_TITLE");
                
                final StringBuffer link = new StringBuffer(getWebCentralPath(this.context) + "/");
                link.append(getActivityParameterString(this.context,
                    Constants.ONDEMAND_ACTIVITY_ID, "UPDATE_VIEW"));
                
                if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                    final Map<String, Object> datamodel = getDataModel();
                    datamodel.put("link", link.toString());
                    message.setDataModel(datamodel);
                }
                if (!message.isBodyRichFormatted()) {// only original body contained {?} parameters
                    final Object[] args =
                            new Object[] { this.id, this.em_id, comment, link.toString() };
                    message.setBodyArguments(args);
                }
                
                message.format();
                
                // KB 3023429 - also notify substitute(s) of the service provider (EC 2012/07/10)
                final Message messageForSubstitute = new Message(this.context);
                messageForSubstitute.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
                messageForSubstitute.setReferencedBy("NOTIFY_SUPERVISOR_SUBSTITUTE_WFR");
                messageForSubstitute.setBodyMessageId("NOTIFY_VERIFICATION_RETURN_TEXT");
                messageForSubstitute.setSubjectMessageId("NOTIFY_VERIFICATION_RETURN_TITLE");
                
                if (messageForSubstitute.isBodyRichFormatted()
                        || messageForSubstitute.isSubjectRichFormatted()) {
                    final Map<String, Object> datamodel = getDataModel();
                    datamodel.put("link", link.toString());
                    datamodel.put("supervisor",
                        getParentContextAttributeXPath(this.context, "/*/preferences/@em_em_id"));
                    messageForSubstitute.setDataModel(datamodel);
                }
                if (!messageForSubstitute.isBodyRichFormatted()) {
                    final Object[] args =
                            new Object[] { this.id, this.em_id, comment, link.toString() };
                    messageForSubstitute.setBodyArguments(args);
                }
                
                messageForSubstitute.format();
                
                final WorkRequestHandler handler = new WorkRequestHandler();
                handler.sendMailToSupervisors(this.context, this.tableName, this.fieldName,
                    this.id, message, messageForSubstitute);
            }
        }
    }
    
    @Override
    public void reject(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
}
