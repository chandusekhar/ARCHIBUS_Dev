package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * This is an abstract class for steps that use confirm and reject commands.
 * 
 * <p>
 * Use this class as the base class when implementing steps with responses, except for Acceptance
 * step.
 * 
 */

public abstract class Action extends StepImpl {
    
    /**
     * Constructor setting basic and extra information from values map
     * 
     * @param context Workflow rule execution context
     * @param activity_id activity as defined in the afm_activities table
     * @param id Primary key value
     * @param values Map with step
     *            {@link com.archibus.eventhandler.steps.StepImpl#setProperties(Map) properties}
     * @param stepType step type
     * @param stepName step name
     */
    public Action(final EventHandlerContext context, final String activity_id, final int id,
            final Map values, final String stepType, final String stepName) {
        super(context, activity_id, id, values);
        this.type = stepType;
        this.stepName = stepName;
    }
    
    /**
     * Constructor setting basic information
     * 
     * @param context Workflow rule execution context
     * @param activity_id activity as defined in the afm_activities table
     * @param id Primary key value
     * @param stepType steptype (afm_wf_steps.step_type)
     * @param stepName step (afm_wf_steps.step)
     */
    public Action(final EventHandlerContext context, final String activity_id, final int id,
            final String stepType, final String stepName) {
        super(context, activity_id, id, stepType, stepName);
    }
    
    /**
     * Constructor setting steptype
     * 
     * @param step_type
     */
    public Action(final String step_type) {
        this.type = step_type;
    }
    
    /**
     * An action cannot be accepted.
     */
    @Override
    public void accept(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
    /**
     * 
     * Confirm step.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the current user is allowed to execute this step</li>
     * <li>Update step record</li>
     * <li>{@link com.archibus.eventhandler.steps.StatusManager#updateStepStatus(String) Update step
     * status} of request record</li>
     * </ol>
     * </p>
     * 
     * @param stepLogId Step log id (helpdesk_step_log.step_log_id)
     * @param comment Comments from confirming manager
     * @param user Name of confirming user (afm_users.user_name)
     * 
     * @see StatusManager
     */
    @Override
    public void confirm(final int stepLogId, String comment, final String user) {
        // KB 3023429 - update comments if step is ended by substitute (EC 2012/07/10)
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        
        updateStep(stepLogId, this.stepStatusResult, comment);
        
        final StatusManager statusManager =
                WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
        statusManager.updateStepStatus(this.stepStatusResult);
    }
    
    /**
     * An action cannot be declined.
     */
    @Override
    public void decline(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
    /**
     * 
     * Invoke this step.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check condition, if not end step</li>
     * <li>If role is given,
     * {@link com.archibus.eventhandler.steps.HelpdeskRoles#getEmployeesFromHelpdeskRole(EventHandlerContext, String, String, String, int)
     * get employees for this role} and send request to each</li>
     * <li>If employee, vendor or craftsperson is given, send request</li>
     * <li>Otherwise throw exception</li>
     * </ol>
     * </p>
     * 
     */
    @Override
    public void invoke() {
        super.invoke();
        
        setStepEnded(false); // waiting for response
        
    }
    
    /**
     * An action cannot be reissued.
     */
    @Override
    public void reissue(final int stepLogId, final String comment, final String user) {
        // @translatable
        final String errorMessage = localizeString(this.context, "Illegal action");
        throw new ExceptionBase(errorMessage, true);
    }
    
    /**
     * 
     * Reject step
     * <p>
     * 
     * @param stepLogId Step log id (helpdesk_step_log.step_log_id)
     * @param comment Comments from rejecting manager
     * @param user Name of rejecting user (afm_users.user_name)
     *            </p>
     * 
     *            <p>
     *            <b>Pseudo-code:</b>
     *            <ol>
     *            <li>Check if the current user is allowed to execute this step</li>
     *            <li>Update step record</li>
     *            <li>{@link com.archibus.eventhandler.steps.StatusManager#updateStepStatus(String)
     *            Update step status} of request record</li>
     *            <li>{@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String)
     *            Update status} of request record to Rejected</li>
     *            </ol>
     *            </p>
     * 
     */
    @Override
    public void reject(final int stepLogId, String comment, final String user) {
        // KB 3023429 - update comments if step is ended by substitute (EC 2012/07/10)
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        
        updateStep(stepLogId, this.stepStatusRejected, comment);
        
        final StatusManager statusManager =
                WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
        statusManager.rejectRequest();
    }
    
    /**
     * Check if other people should execute the step also, otherwise notify them and remove the
     * steprecords
     * 
     * @return
     */
    // 18.2 step assigned to role
    protected boolean checkMultiple(final boolean multipleRequired) {
        final String[] fields =
                { "user_name", "step_order", "em_id", "vn_id", "date_response", "cf_id" };
        
        final String where =
                "step_order = (SELECT step_order FROM helpdesk_step_log WHERE step_log_id = "
                        + this.stepLogId + ") AND table_name = "
                        + literal(this.context, this.tableName) + " AND pkey_value = " + this.id
                        + " AND status = " + literal(this.context, this.statusBefore);
        
        final List stepRecords =
                selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        if (stepRecords.isEmpty()) {
            this.log.error("Step record not found with step_log_id " + this.stepLogId);
        } else {
            if (stepRecords.size() == 1) {
                return false;
            } else if (stepRecords.size() > 1 && !multipleRequired) {
                notifyAndRemoveSimilar();
                return false;
            }
        }
        return true;
    }
    
    // 18.2 Estimation step assigned to role
    protected void notifyAndRemoveSimilar() {
        final String[] fields = { "user_name", "step_code", "em_id", "cf_id", "vn_id" };
        final String where =
                "table_name="
                        + literal(this.context, this.tableName)
                        + " AND pkey_value = "
                        + this.id
                        + " AND step_type="
                        + literal(this.context, this.getType())
                        + " AND step ="
                        + literal(this.context, this.stepName)
                        + " AND date_response IS NULL"
                        + " AND step_order = (SELECT step_order FROM helpdesk_step_log WHERE step_log_id = "
                        + this.stepLogId + ")";
        
        final List records = selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        final Message message = new Message(this.context);
        message.setActivityId(this.activity_id);
        message.setReferencedBy("SENDEMAIL_" + this.type.toUpperCase() + "_STEPMGR");
        message.setSubjectMessageId("SENDEMAIL_CANCEL_TITLE");
        message.setBodyMessageId("SENDEMAIL_CANCEL_TEXT");
        
        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
            message.setDataModel(getDataModel());
        }
        message.format();
        
        if (!records.isEmpty()) {
            final Iterator it = records.iterator();
            
            while (it.hasNext()) {
                final Object[] record = (Object[]) it.next();
                final String user = notNull(record[0]);
                final String step_code = notNull(record[1]);
                
                if (this.isNotifyResponsible()) {
                    String to = null;
                    if (StringUtil.notNullOrEmpty(user)) {
                        to =
                                notNull(selectDbValue(this.context, "afm_users", "email",
                                    "user_name =" + literal(this.context, user)));
                    } else if (StringUtil.notNullOrEmpty(this.em_id)) {
                        to = getEmailAddress(this.context, this.em_id);
                    } else if (StringUtil.notNullOrEmpty(this.vn_id)) {
                        to = getEmailAddressForVendor(this.context, this.vn_id);
                    } else if (StringUtil.notNullOrEmpty(this.cf_id)) {
                        to = getEmailAddressForCraftsperson(this.context, this.cf_id);
                    }
                    message.setMailTo(to);
                    message.sendMessage();
                }
                
                // delete record
                final String delete =
                        "DELETE FROM " + Constants.STEP_LOG_TABLE + " WHERE step_code = "
                                + literal(this.context, step_code);
                executeDbSql(this.context, delete, true);
                
            }
        }
        
    }
    
}
