package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.app.common.util.SchemaUtils;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * 
 * Review Step.
 * 
 * The review step is a first step after a request is made. The reviewer can ask for more details of
 * the requestor or can change request parameters or add more detailed parameters.
 * 
 * After the review step, the SLA is determined. Request parameters shouldn't change afterwards.
 * This can disturb the ongoing workflow.
 * 
 * <ul>
 * <li>Request Type (activity_type)</li>
 * <li>Problem Type (prob_type)</li>
 * <li>Priority (priority)</li>
 * 
 * <li>Equipment (eq_id)</li>
 * 
 * <li>Building (bl_id)</li>
 * <li>Floor (fl_id)</li>
 * <li>Room (rm_id)</li>
 * </ul>
 * 
 */

public class Review extends Action {
    
    /**
     * Step Type
     */
    private static final String STEP_TYPE = "review";
    
    /**
     * Constructor setting step_type
     * 
     */
    public Review() {
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
     * @param stepName step (afm_wf_steps.step) with step type 'approval'
     */
    public Review(final EventHandlerContext context, final String activity_id, final int id,
            final Map<String, Object> values, final String stepName) {
        super(context, activity_id, id, values, STEP_TYPE, stepName);
    }
    
    /**
     * Constructor setting basic step information
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param stepName Step name (afm_wf_steps.step) with step type 'approval'
     */
    public Review(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    @Override
    public boolean checkRequired() {
        
        boolean isRequied = false;
        
        if (Constants.ONDEMAND_ACTIVITY_ID.equals(this.activity_id)) {
            
            //always make the review step required in bali4 for Ops console because we add new feature to reject back 
            //and requestor may need re-sumit the request and invoke the review step again
            final boolean useBldgOpsConsole =
                    getActivityParameterInt(this.context, Constants.ONDEMAND_ACTIVITY_ID,
                        "UseBldgOpsConsole").intValue() > 0;
            if (useBldgOpsConsole && SchemaUtils.fieldExistsInSchema(Constants.STEP_LOG_TABLE, "rejected_step")) {
                isRequied = true;
            }
        }
        
        if (!isRequied) {
            // KB3045619 - add the step order to allow additional edit approval steps
            final String where =
                    "table_name=" + literal(this.context, this.tableName) + " AND field_name="
                            + literal(this.context, this.fieldName) + " AND pkey_value=" + this.id
                            + " AND date_response IS NOT NULL AND step_type = "
                            + literal(this.context, this.type) + " AND step_order = "
                            + this.stepOrder;
            
            isRequied =
                    selectDbRecords(this.context, Constants.STEP_LOG_TABLE,
                        new String[] { "step_type", "pkey_value" }, where).isEmpty();
        }
        
        return isRequied;
    }
    
    /**
     * A manager approves this request or action (e.g. estimation of schedule) for this request by
     * {@link #executeStep(int, String, String, String, boolean) executing the step}
     * 
     * @param stepLogId Step log id (helpdesk_step_log.step_log_id)
     * @param comment Comments from manager
     * @param user Name of approving user (afm_users.user_name)
     */
    @Override
    public void confirm(final int stepLogId, final String comment, final String user) {
        executeStep(stepLogId, comment, user, this.stepStatusResult, true);
    }
    
    /**
     * Forward this review to another manager.
     * 
     * @param stepLogId
     * @param comment
     * @param em_id
     */
    public void forward(final int stepLogId, final String comment, final String em_id) {
        this.em_id = em_id;
        
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put("em_id", this.em_id);
        final String user_name =
                (String) selectDbValue(this.context, "afm_users", "user_name", "email = "
                        + literal(this.context, getEmailAddress(this.context, this.em_id)));
        values.put("user_name", user_name);
        values.put("step_log_id", new Integer(this.stepLogId));
        values.put("comments", comment);
        executeDbSave(this.context, Constants.STEP_LOG_TABLE, values);
        
        final Message message = createMessage(this.stepCode);
        message.setMailTo(getEmailAddress(this.context, this.em_id));
        sendRequest(message);
    }
    
    /**
     * 
     * Invoke this step.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #checkCondition() Check condition} (specified for this step in the current SLA),
     * if false end step</li>
     * <li>If role is given,
     * {@link com.archibus.eventhandler.steps.HelpdeskRoles#getEmployeesFromHelpdeskRole(EventHandlerContext, String, String, String, int)
     * get employees for this role} and send request to each</li>
     * <li>If employee, vendor or craftsperson is given, send request</li>
     * <li>Before sending a request to an employee, {@link #checkRequired() check if the approval is
     * required}.</li>
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
     * A manager rejects this request or action (e.g. estimation of schedule) for this request by
     * {@link #executeStep(int, String, String, String, boolean) executing the step}
     * 
     * @param stepLogId Step log id (helpdesk_step_log.step_log_id)
     * @param comment Comments from rejecting manager
     * @param user Name of rejecting user (afm_users.user_name)
     */
    @Override
    public void reject(final int stepLogId, final String comment, final String user) {
        executeStep(stepLogId, comment, user, this.stepStatusRejected, false);
        final StatusManager statusManager =
                WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
        statusManager.updateStatus(statusManager.getRejectedStatus());
    }
    
    /**
     * Execute approval or rejection.
     * 
     * @param int stepLogId
     * @param String comment
     * @param String user
     * @param String stepStatus
     * @param boolean approved
     */
    private void executeStep(final int stepLogId, String comment, final String user,
            final String stepStatus, final boolean approved) {
        this.stepLogId = stepLogId;
        // KB 3023429 - update comments if step is ended by substitute (EC 2012/07/10)
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        
        final String[] fields = { "user_name", "step_order", "em_id", "vn_id", "date_response" };
        final String where =
                "step_order = (SELECT step_order FROM helpdesk_step_log WHERE step_log_id = "
                        + stepLogId + ")" + " AND table_name = "
                        + literal(this.context, this.tableName) + " AND pkey_value = " + this.id
                        + " AND status = " + literal(this.context, this.statusBefore);
        final List<Object[]> records =
                selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        final StatusManager statusManager =
                WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
        
        if (records.isEmpty()) {
            this.log.error("Review record not found");
            
        } else {
            updateStep(stepLogId, stepStatus, comment);
            
            if (records.size() > 1) {
                final Object[] record = records.get(0);
                final int stepOrder = getIntegerValue(this.context, record[1]).intValue();
                notifyAndRemoveSimilar(approved, stepOrder);
            }
            
            if (approved) {
                statusManager.updateStepStatus(stepStatus);
            }
            if (!approved) {
                statusManager.rejectRequest();
            }
        }
    }
    
    /**
     * Notify and remove similar record
     * 
     * @param approved
     * @param stepOrder
     */
    private void notifyAndRemoveSimilar(final boolean approved, final int stepOrder) {
        final String[] fields = { "user_name", "step_code", "em_id", "cf_id", "vn_id" };
        final String where =
                "table_name=" + literal(this.context, this.tableName) + " AND pkey_value = "
                        + this.id + " AND step_type='review' AND step ="
                        + literal(this.context, this.stepName)
                        + " AND date_response IS NULL AND step_order = " + stepOrder;
        
        final List<Object[]> records =
                selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        final Message message = new Message(this.context);
        message.setActivityId(this.activity_id);
        message.setReferencedBy("SENDEMAIL_REVIEW_STEPMGR");
        message.setSubjectMessageId("SENDEMAIL_CANCEL_TITLE");
        message.setBodyMessageId("SENDEMAIL_CANCEL_TEXT");
        
        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
            message.setDataModel(getDataModel());
        }
        if (!message.isBodyRichFormatted()) {// only original body contained {?} parameters
            String strApproved = approved ? "approved" : "rejected";
            if (approved) {
                strApproved =
                        getEnumFieldDisplayedValue(this.context, Constants.STEP_TABLE,
                            "step_status_result", strApproved);
            } else {
                strApproved =
                        getEnumFieldDisplayedValue(this.context, Constants.STEP_TABLE,
                            "step_status_rejected", strApproved);
            }
            final String requestInfo =
                    MessageHelper.getRequestInfo(this.context, this.tableName, this.fieldName,
                        this.id);
            final Object[] args = new Object[] { strApproved, requestInfo };
            
            message.setBodyArguments(args);
        }
        
        message.format();
        
        if (!records.isEmpty()) {
            final Iterator<Object[]> it = records.iterator();
            
            while (it.hasNext()) {
                final Object[] record = it.next();
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
