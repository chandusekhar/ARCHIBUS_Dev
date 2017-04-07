package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * 
 * Approval Step.
 */

public class Approval extends Action {
    
    /**
     * Step Type.
     */
    private static final String STEP_TYPE = "approval";
    
    /**
     * Constructor setting step_type.
     * 
     */
    public Approval() {
        super(STEP_TYPE);
    }
    
    /**
     * Constructor setting basic step information and extra properties.
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param values Map with step
     *            {@link com.archibus.eventhandler.steps.StepImpl#setProperties(Map) properties}
     * @param stepName step (afm_wf_steps.step) with step type 'approval'
     */
    public Approval(final EventHandlerContext context, final String activity_id, final int id,
            final Map values, final String stepName) {
        super(context, activity_id, id, values, STEP_TYPE, stepName);
    }
    
    /**
     * Constructor setting basic step information.
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param stepName Step name (afm_wf_steps.step) with step type 'approval'
     */
    public Approval(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    /**
     * 
     * Check if the approval manager is the requestor or request-creator, if so and this is 1st
     * approval, then this approval is not required.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check if the request has status 'REQUESTED', no steps taken yet</li>
     * <li>Lookup the Service Level Agreement for the current request and check if this approval
     * belongs to the first approval round</li>
     * <li>If so, check if the approval manager is the requestor or creator of the current request</li>
     * <li>If so, this approval is not required</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT step,em_id,role FROM helpdesk_sla_steps<br />
     * WHERE activity_type = ? AND ordering_seq = ? AND priority = ? AND step_order = <br/>
     * &nbsp; (SELECT MIN(step_order FROM helpdesk_sla_steps<br />
     * &nbsp;&nbsp; WHERE activity_type = ? AND ordering_seq = ? AND priority = ? AND
     * step_type='approval' AND status = ? AND activity_id = ?) </div>
     * </p>
     * 
     * @return Approval required or not
     */
    @Override
    public boolean checkRequired() {
        if (this.statusBefore.equals("REQUESTED") || this.statusBefore.equals("R")) {// only for
                                                                                     // first
            // approvals
            // check if extra form fields should be filled in by the manager
            final String form_fields =
                    (String) selectDbValue(this.context, "afm_wf_steps", "form_fields",
                        "status = '"+this.statusBefore+"' AND step =" + literal(this.context, this.stepName));
            if (form_fields != null) {
                //return true;
            }
            
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(this.context, this.tableName, this.fieldName,
                        this.id);
            
            String requestor;
            String created_by = null;
            
            String requestor_email = null;
            String created_by_email = null;
            
            if (this.tableName.equals(Constants.ACTION_ITEM_TABLE)) {
                final Object[] record =
                        selectDbValues(this.context, this.tableName, new String[] { "requestor",
                                "created_by" }, this.fieldName + "=" + this.id);
                requestor = notNull(record[0]);
                created_by = notNull(record[1]);
                requestor_email = getEmailAddress(this.context, requestor);
                created_by_email = getEmailAddress(this.context, created_by);
            } else {
                final Object[] record =
                        selectDbValues(this.context, this.tableName, new String[] { "requestor" },
                            this.fieldName + "=" + this.id);
                requestor = notNull(record[0]);
                requestor_email = getEmailAddress(this.context, requestor);
            }
            final String activity_type = sla.getActivity_type();
            final int ordering_seq = sla.getOrdering_seq();
            final int priority = sla.getPriority();
            
            final String where =
                    "activity_type =" + literal(this.context, activity_type)
                            + " AND ordering_seq = " + ordering_seq + " AND priority = " + priority;
            
            // select step_order of first approval/review step for this status
            final String sqlOrder =
                    "SELECT MIN(step_order) FROM helpdesk_sla_steps "
                            + " WHERE step_type IN ('review','approval') AND status = "
                            + literal(this.context, this.statusBefore) + " AND activity_id = "
                            + literal(this.context, this.activity_id) + " AND " + where;
            
            final List orderRecords = selectDbRecords(this.context, sqlOrder);
            int firstStepOrder = 1;
            if (!orderRecords.isEmpty()) {
                final Object[] orderRec = (Object[]) orderRecords.get(0);
                firstStepOrder = getIntegerValue(this.context, orderRec[0]).intValue();
                if (firstStepOrder > this.stepOrder) {
                    return true;
                }
            }
            // first approval/review step
            final StringBuffer sql =
                    new StringBuffer(
                        "SELECT step,em_id,role,vn_id,cf_id,role_name FROM helpdesk_sla_steps WHERE ");
            sql.append(where);
            sql.append(" AND step_order = " + firstStepOrder
                    + " AND step_type IN ('approval','review') AND status = "
                    + literal(this.context, this.statusBefore) + " AND activity_id = "
                    + literal(this.context, this.activity_id));
            
            final List records = selectDbRecords(this.context, sql.toString());
            if (!records.isEmpty()) {
                if (sla.getDefaultPriority() != null && sla.getDefaultPriority() != 0 ) {
                    //return true;// manager will have to specify priority
                }
                
                final Object[] rec = (Object[]) records.get(0);
                
                final String step = notNull(rec[0]);
                if (!this.stepName.equals(step)) {
                    return true;
                }
                
                final String em_id = notNull(rec[1]);
                final String vn_id = notNull(rec[3]);
                final String vn_email = getEmailAddress(this.context, "vn", "vn_id", vn_id);
                final String cf_id = notNull(rec[4]);
                final String cf_email = getEmailAddress(this.context, "cf", "cf_id", cf_id);
                final String afm_role = notNull(rec[5]);
                
                // role should only be checked if the current step (name) is the same of the first
                // approval/review
                if (this.stepName.equals(step) && rec[2] != null) {
                    String role = "";
                    if (rec[2] != null) {
                        role = notNull(rec[2]);
                        if (this.em_id == null) {// step not yet distributed to different employees
                            final List ems =
                                    HelpdeskRoles.getEmployeesFromHelpdeskRole(this.context, role,
                                        this.tableName, this.fieldName, this.id);
                            
                            if (ems == null || ems.isEmpty()) {
                                // @translatable
                                final String errorMessage = "No employees found for role [{0}]";
                                final Object[] args = { role };
                                throw new ExceptionBase(errorMessage, args, true);
                            }
                            
                            if (ems.size() > 1) {
                                if (!this.multiple) {
                                    for (final Iterator it = ems.iterator(); it.hasNext();) {
                                        final String em = notNull(it.next());
                                        if (em.equals(requestor)
                                                || (created_by != null && em.equals(created_by))) {
                                            return false;
                                        }
                                    }
                                    return true;
                                } else {
                                    return true;
                                }
                            } else { // only 1 em in role, check if it's requestor or request
                                     // creator
                                final String em = notNull(ems.get(0));
                                if (em.equals(requestor)
                                        || (created_by != null && em.equals(created_by))) {
                                    return false;
                                } else {
                                    return true;
                                }
                            }
                        } else {
                            if (this.stepName.equals(step) && this.em_id.equals(em_id)
                                    && this.role.equals(role)) {
                                if (this.em_id.equals(requestor)
                                        || (created_by != null && this.em_id.equals(created_by))) {
                                    return false;
                                } else {
                                    return true;
                                }
                            } else {
                                return true;
                            }
                        }
                    }
                }
                //if afm role not null, check the afm role of requestor and created by, if same role, this approve is not required 
                if (this.stepName.equals(step) && StringUtil.notNullOrEmpty(afm_role) ) {
                    final List ems = this.getEmployeesFromAfmRole(afm_role);
                    
                    if (ems == null || ems.isEmpty()) {
                        // @translatable
                        final String errorMessage = "No employees found for role [{0}]";
                        final Object[] args = { role };
                        throw new ExceptionBase(errorMessage, args, true);
                    }
                    
                    for (final Iterator it = ems.iterator(); it.hasNext();) {
                        final String em = notNull(it.next());
                        if (em.equals(requestor)
                                || (created_by != null && em.equals(created_by))) {
                            return false;
                        }
                    }
                }
                
                if (this.stepName.equals(step)
                        && ((this.em_id != null && this.em_id.equals(em_id))
                                || (this.vn_id != null && this.vn_id.equals(vn_id)) || (this.cf_id != null && this.cf_id
                            .equals(cf_id)))) {
                    // manager for current step = request creator or requestor?
                    if (this.em_id != null
                            && (this.em_id.equals(requestor) || (created_by != null && this.em_id
                                .equals(created_by)))) {
                        return false;
                    } else if (vn_email != null
                            && (requestor_email.equals(vn_email) || (created_by_email != null && created_by_email
                                .equals(vn_email)))) {
                        return false;
                    } else if (cf_email != null
                            && (requestor_email.equals(cf_email) || (created_by_email != null && created_by_email
                                .equals(cf_email)))) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
                
            } else {
                // @translatable
                final String errorMessage =
                        localizeString(this.context, "No approvals for this request");
                throw new ExceptionBase(errorMessage, true);
            }
        } else {
            return true;
        }
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
     * Forward this approval to another manager.
     * 
     * @param stepLogId
     * @param comment
     * @param em_id
     */
    public void forward(final int stepLogId, final String comment, final String em_id) {
        this.em_id = em_id;
        
        // add second approval record to log forwarded approval
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
    
    public boolean isMultiple() {
        return this.multiple;
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
    
    public void setMultiple(final boolean multiple) {
        this.multiple = multiple;
    }
    
    /**
     * 
     * Execute approval or rejection.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get all records for this approval step</li>
     * <li>Find record for this approver, identified by user name</li>
     * <li>If more approvals to come, log this one as approved and wait for others</li>
     * <li>If only one of many approvals required, log this one as approved,
     * {@link #notifyAndRemoveSimilar(boolean, int) notify others (remove records)} and go to next
     * step</li>
     * <li>If simple approval, log this one as approved and go to next step</li>
     * </ol>
     * </p>
     * 
     * <p>
     * 
     * @param stepLogId Step log id (helpdesk_step_log.step_log_id)
     * @param comment Comments from approval manager
     * @param user Name of approval manager (afm_users.user_name)
     * @param stepStatus New step_status for the request record
     * @param approved True if approval, false if rejection
     *            </p>
     * 
     */
    private void executeStep(final int stepLogId, String comment, final String user,
            final String stepStatus, final boolean approved) {
        this.stepLogId = stepLogId;
        // KB 3023429 - update comments if step is ended by substitute (EC 2012/07/10)
        final int check = checkUser(user, stepLogId);
        comment = formatCommentPrefix(check, comment);
        
        final String[] fields =
                { "user_name", "step_order", "em_id", "vn_id", "date_response", "cf_id" };
        final String where =
                "step_order = (SELECT step_order FROM helpdesk_step_log WHERE step_log_id = "
                        + stepLogId + ")" + " AND table_name = "
                        + literal(this.context, this.tableName) + " AND pkey_value = " + this.id
                        + " AND status = " + literal(this.context, this.statusBefore);
        final List records = selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        final String manager =
                (String) selectDbValue(this.context, "afm_users", "user_name",
                    "email IN (SELECT email FROM em WHERE em_id IN (SELECT manager FROM "
                            + this.tableName + " WHERE " + this.fieldName + " = " + this.id + "))");
        final StatusManager statusManager =
                WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
        
        if (records.isEmpty()) {
            this.log.error("Approval record not found");
        } else {
            if (records.size() > 1) {
                updateStep(stepLogId, stepStatus, comment);
                
                if (!approved) {
                    statusManager.rejectRequest();
                    notifyAndRemoveSimilar(approved, this.stepOrder);
                    return;
                }
                if (!this.multiple) {// approval required from only 1 approver
                    // notify other approvers and remove the records
                    final Object[] record = (Object[]) records.get(0);
                    final int stepOrder = getIntegerValue(this.context, record[1]).intValue();
                    notifyAndRemoveSimilar(approved, stepOrder);
                    statusManager.updateStepStatus(stepStatus);
                } else {
                    // check if all approvers did approve
                    for (final Iterator it = records.iterator(); it.hasNext();) {
                        final Object[] record = (Object[]) it.next();
                        final String user_name = notNull(record[0]);
                        if (record[4] == null) {
                            if (user.equals(manager)) {
                                if (!((this.em_id != null && notNull(record[2]).equals(this.em_id))
                                        || (this.vn_id != null && notNull(record[3]).equals(
                                            this.vn_id)) || (this.cf_id != null && notNull(
                                    record[5]).equals(this.cf_id)))) {
                                    return;
                                }
                            } else {
                                if (!user_name.equals(user)) {
                                    return;
                                }
                            }
                        }
                    }
                    statusManager.updateStepStatus(stepStatus);
                }
                
            } else if (records.size() == 1) { // last person to approve for this type
                updateStep(stepLogId, stepStatus, comment);
                if (approved) {
                    statusManager.updateStepStatus(stepStatus);
                }
                if (!approved) {
                    statusManager.rejectRequest();
                }
            }
        }
    }
    
    /**
     * 
     * Notify managers for approvals of the same type if single approval was required and is given.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Prepare message to send</li>
     * <li>Get users from open steps of the same type and with the given step order</li>
     * <li>Send mail and remove step records</li>
     * </ol>
     * </p>
     * 
     * <p>
     * 
     * @param approved Request approved or rejected
     * @param stepOrder Step Order (helpdesk_step_log.step_order) or step record
     *            </p>
     * 
     */
    private void notifyAndRemoveSimilar(final boolean approved, final int stepOrder) {
        final String[] fields = { "user_name", "step_code", "em_id", "cf_id", "vn_id" };
        final String where =
                "table_name=" + literal(this.context, this.tableName) + " AND pkey_value = "
                        + this.id + " AND step_type='approval' AND step ="
                        + literal(this.context, this.stepName)
                        + " AND date_response IS NULL AND step_order = " + stepOrder;
        
        final List<Object[]> records =
                selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        final Message message = new Message(this.context);
        message.setActivityId(this.activity_id);
        message.setReferencedBy("SENDEMAIL_APPROVAL_STEPMGR");
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
