package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * <p>
 * This is the default implementation for an Acceptance step. The acceptance step has two possible
 * outcomes {@link #accept(int, String, String)} and {@link #decline(int, String, String)}.
 * 
 * <p>
 * The basic status will not be affected by an Acceptance step, both accept and decline only
 * determine the assignee<br>
 * 
 * <p>
 * The Acceptance step is used in Helpdesk to assign an internal employee or external vendor
 * (contractor) to the request. The assignee is responsible for completion of the request.
 * 
 * <p>
 * For On Demand Work the acceptance is made by the supervisor and not the craftsperson. The
 * supervisor will assign craftspersons of different trades to the work requests to to complete the
 * tasks.
 * 
 * 
 */

public class Acceptance extends StepImpl {
    
    /**
     * Step type
     */
    private static final String STEP_TYPE = "acceptance";
    
    /**
     * Default constructor (only sets step type)
     */
    public Acceptance() {
        super(STEP_TYPE);
    }
    
    /**
     * Constructor with step properties
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Request record id
     * @param values step properties
     * @param stepName step name
     */
    public Acceptance(final EventHandlerContext context, final String activity_id, final int id,
            final Map values, final String stepName) {
        super(context, activity_id, id, values);
        this.stepName = stepName;
    }
    
    /**
     * Constructor when no property values are defined
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Request record id
     * @param stepName step name
     */
    public Acceptance(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    /**
     * 
     * Accept step and assign the request to employee, vendor or supervisor (depending on the SLA it
     * matches).
     * 
     * <p>
     * The assigned_to field in the workflow table has to be looked up for this activity<br>
     * When a vendor is used, the vn_id is used as assignee field
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the given user may accept the current step</li>
     * <li>Select open acceptance steps</li>
     * <li>Check if current user has one of these steps assigned</li>
     * <li>If more than 1 acceptance records exist, accept step, {@link #notifyAndRemoveSimilar()
     * notify other users and remove similar records}</li>
     * <li>{Update step record</li>
     * <li>{@link com.archibus.eventhandler.steps.StatusManager#updateStepStatus(String) Update step
     * status of request record}</li>
     * <li>Assign employee or vendor to request and save in <i>workflow table</i></li>
     * </ol>
     * 
     * <p>
     * 
     * @param stepLogId Step log id (helpdesk_step_log.step_log_id)
     * @param comment acceptance comment
     * @param user name of accepting user (afm_users.user_name)
     * 
     */
    @Override
    public void accept(final int stepLogId, String comment, final String user) {
        // KB 3023429 - update comments if step is ended by substitute (EC 2012/07/10)
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        
        // get open acceptance step or steps when using a role
        final String[] fields = { "user_name", "step_order", "em_id", "vn_id" };
        final String where =
                "table_name = " + literal(this.context, this.tableName) + " AND pkey_value="
                        + this.id + " AND status = " + literal(this.context, this.statusBefore)
                        + " AND step_order = (SELECT step_order FROM " + Constants.STEP_LOG_TABLE
                        + " WHERE step_log_id = " + stepLogId + ")";
        final List records = selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        if (records.isEmpty()) {
            this.log.error("Acceptance record not found");
        } else {
            if (records.size() > 1) {
                // notify other acceptors and remove the records
                notifyAndRemoveSimilar();
            }
            updateStep(stepLogId, this.stepStatusResult, comment);
            setServiceProvider(); // set the service provider in the workflow table
            
            final StatusManager statusManager =
                    WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
            statusManager.updateStepStatus(this.stepStatusResult);
        }
    }
    
    @Override
    public boolean checkRequired() {
        this.log.debug("Check for acceptance required");
        // return true;
        return !checkAccepted();
    }
    
    /**
     * This method is called when a user declines a request.
     * 
     * <p>
     * Instead of accepting a user can decline a request assigned to him. If this is the only or
     * last user who was received a request for acceptance, an escalation is sent to the SLA
     * manager.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the given user may accept the current step</li>
     * <li>Select open acceptance steps</li>
     * <li>Check if current user has one of these steps assigned</li>
     * <li>Update step record</li>
     * <li>{@link com.archibus.eventhandler.steps.StatusManager#updateStepStatus(String) Update step
     * status of request record}</li>
     * </ol>
     * 
     * <p>
     * 
     * @param stepLogId Step log id (helpdesk_step_log.step_log_id)
     * @param comment acceptance comment
     * @param user name of declining user (afm_users.user_name)
     * 
     */
    @Override
    public void decline(final int stepLogId, String comment, final String user) {
        // KB 3023429 - update comments if step is ended by substitute (EC 2012/07/10)
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        
        final String[] fields = { "user_name", "step_order", "em_id", "vn_id" };
        final String where =
                "table_name = " + literal(this.context, this.tableName) + " AND pkey_value="
                        + this.id + " AND status = " + literal(this.context, this.statusBefore)
                        + " AND step_order = (SELECT step_order FROM " + Constants.STEP_LOG_TABLE
                        + " WHERE step_log_id = " + stepLogId + ") "
                        + " AND (step_status_result IS NULL OR step_status_result = "
                        + literal(this.context, Constants.STEP_STATUS_NULL) + ")";
        // get step or all open steps log instances for multiple acceptance by role
        final List records = selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        if (records.isEmpty()) {
            // @translatable
            final String msg = localizeString(this.context, "Acceptance record not found");
            this.log.error(msg);
        } else {
            updateStep(stepLogId, this.stepStatusRejected, comment);
            
            // this is the only step or the last instance of the Acceptance step
            if (records.size() == 1) {
                final StatusManager statusManager =
                        WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
                statusManager.updateStepStatus(this.stepStatusRejected); // this will invoke the
                                                                         // next
                // step
            }
        }
        
    }
    
    /**
     * Invoke this step, start execution of the step.
     * 
     * <p>
     * This will make a log entry in the log table and send a invitation mail to the user(s). The
     * user can be an employee or a vendor, or defined by a role<br>
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Invoke step</li>
     * <li>Set step ended false (waiting for response)</li>
     * </ol>
     * <p>
     * 
     * 
     * @see Message
     * @see HelpdeskRoles
     * 
     */
    @Override
    public void invoke() {
        // check first if there was a previous acceptance step and accepted by someone
        if (checkAccepted()) { // skip this step
            setStepEnded(true);
        } else { // not yet accepted, invoke the step
            super.invoke();
            // service provider is only set at acceptance
            // if(this.role == null) setServiceProvider(); // set the service provider in the
            // workflow table
            setStepEnded(false); // waiting for response
        }
        
    }
    
    /**
     * Check if this request has been accepted
     * 
     * @return true if accepted or false no acceptance steps or all previous declined
     */
    private boolean checkAccepted() {
        final String[] fields =
                { "step_status_result", "user_name", "step_order", "em_id", "vn_id" };
        final String where =
                "table_name = " + literal(this.context, this.tableName) + " AND pkey_value="
                        + this.id + " AND status = " + literal(this.context, this.statusBefore)
                        + " AND step_type = " + literal(this.context, STEP_TYPE);
        final List records = selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final String stepStatus = notNull(record[0]);
                if (stepStatus.equals("accepted")) {
                    return true;
                }
            }
            
            return false;
        } else {
            return false;
        }
    }
    
    /**
     * Notify supervisor(s) who don't need to accept a request anymore because someone else did and
     * remove these acceptance record(s) from the database
     */
    private void notifyAndRemoveSimilar() {
        final String[] fields = { "em_id", "vn_id", "step_code" };
        final String where =
                formatWhere() + " AND step_type = " + literal(this.context, this.type)
                        + " AND date_response IS NULL";
        
        final List<Object[]> records =
                selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        if (records.size() > 0) {
            final Iterator<Object[]> it = records.iterator();
            
            while (it.hasNext()) {
                final Object[] record = it.next();
                final String em_id = notNull(record[0]);
                final String vn_id = notNull(record[1]);
                final String step_code = notNull(record[2]);
                
                if (!em_id.equals(this.em_id) && !vn_id.equals(this.vn_id)) {
                    
                    if (this.isNotifyResponsible()) {
                        final Message message = new Message(this.context);
                        message.setStepCode(this.stepCode);
                        String to = null;
                        
                        if (this.em_id != null) {
                            to = getEmailAddress(this.context, em_id);
                        } else if (this.vn_id != null) {
                            to = getEmailAddressForVendor(this.context, vn_id);
                        } else {
                            // @translatable
                            final String msg =
                                    localizeString(this.context,
                                        "No employee or vendor found for this acceptance step");
                            this.log.error(msg);
                            continue;
                        }
                        
                        message.setMailTo(to);
                        message.setReferencedBy("SENDEMAIL_ACCEPTANCE_STEPMGR");
                        message.setActivityId(this.activity_id);
                        message.setBodyMessageId("SENDEMAIL_CANCEL_TEXT");
                        message.setSubjectMessageId("SENDEMAIL_CANCEL_TITLE");
                        
                        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                            message.setDataModel(getDataModel());
                        }
                        if (!message.isBodyRichFormatted()) {// only original body contained {?}
                                                             // parameters
                            final Object[] args =
                                    new Object[] { MessageHelper.getRequestInfo(this.context,
                                        this.tableName, this.fieldName, this.id) };
                            message.setBodyArguments(args);
                        }
                        
                        message.format();
                        
                        sendRequest(message);
                    }
                    
                    // delete record
                    final String delete =
                            "DELETE FROM " + Constants.STEP_LOG_TABLE + " WHERE step_code = "
                                    + literal(this.context, step_code);
                    executeDbSql(this.context, delete, true);
                }
            } // end while
        } // end if
    }
    
    /**
     * Set the service provider in workflow table
     */
    private void setServiceProvider() {
        final Map values = new HashMap();
        values.put(this.fieldName, new Integer(this.id));
        
        final String assignee_field =
                notNull(selectDbValue(this.context, "afm_activities", "workflow_assignee_field",
                    "activity_id = " + literal(this.context, this.activity_id)));
        
        if (this.em_id != null) {
            values.put(assignee_field, this.em_id);
            values.put("vn_id", "");
        } else if (this.vn_id != null) {
            values.put("vn_id", this.vn_id);
            values.put(assignee_field, "");
        } else {
            // @translatable
            final String msg = "No employee or vendor found for this acceptance step";
            this.log.error(msg);
        }
        executeDbSave(this.context, this.tableName, values);
    }
    
}
