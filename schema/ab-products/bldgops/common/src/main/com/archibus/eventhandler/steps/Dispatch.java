package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Dispatch step
 * 
 */
public class Dispatch extends Action {
    
    /**
     * Steptype
     */
    private static final String STEP_TYPE = "dispatch";
    
    /**
     * Constructor setting step_type
     * 
     */
    public Dispatch() {
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
     * @param stepName step (afm_wf_steps.step) with step type 'dispatch'
     */
    public Dispatch(final EventHandlerContext context, final String activity_id, final int id,
            final Map values, final String stepName) {
        super(context, activity_id, id, values, STEP_TYPE, stepName);
    }
    
    /**
     * Constructor setting basic step information
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     * @param stepName Step name (afm_wf_steps.step) with step type 'dispatch'
     */
    public Dispatch(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    /**
     * @param int stepLogId
     * @param String comment
     * @param String user
     */
    @Override
    public void confirm(final int stepLogId, final String comment, final String user) {
        executeStep(stepLogId, comment, user, this.stepStatusResult, true);
    }
    
    @Override
    public void invoke() {
        super.invoke();
        if (this.role == null) {
            // save dispatcher in request record
            final Map<String, Object> values = new HashMap<String, Object>();
            values.put("dispatcher", this.em_id);
            values.put(this.fieldName, new Integer(this.id));
            
            executeDbSave(this.context, this.tableName, values);
        }
    }
    
    /**
     * @param int stepLogId
     * @param String comment
     * @param String user
     */
    @Override
    public void reject(final int stepLogId, final String comment, final String user) {
        executeStep(stepLogId, comment, user, this.stepStatusRejected, false);
        final StatusManager statusManager =
                WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
        statusManager.updateStatus(statusManager.getRejectedStatus());
    }
    
    /**
     * @param stepLogId
     * @param comment
     * @param user
     * @param stepStatus
     * @param dispatched
     */
    private void executeStep(final int stepLogId, String comment, final String user,
            final String stepStatus, final boolean dispatched) {
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
        final List stepRecords =
                selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        final StatusManager statusManager =
                WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
        
        if (stepRecords.isEmpty()) {
            this.log.error("Dispatch record not found");
        } else {
            if (dispatched) {
                final Object[] record =
                        selectDbValues(this.context, this.tableName, new String[] { "supervisor",
                                "work_team_id" }, this.fieldName + "=" + this.id);
                if (StringUtil.notNullOrEmpty(record[0]) || StringUtil.notNullOrEmpty(record[1])) {
                    super.confirm(stepLogId, comment, user);
                    final ServiceLevelAgreement sla =
                            new ServiceLevelAgreement(this.context, this.tableName, this.fieldName,
                                this.id);
                    if (sla.isNotifyServiceProvider()) {
                        final WorkRequestHandler handler = new WorkRequestHandler();
                        handler.notifySupervisor(this.context, "APPROVED", this.tableName, this.id);
                    }
                } else {
                    // @translatable
                    final String errorMessage =
                            localizeString(this.context,
                                "No supervisor or work team found to dispatch the request to");
                    throw new ExceptionBase(errorMessage, true);
                }
            } else {
                updateStep(stepLogId, stepStatus, comment);
            }
            if (stepRecords.size() > 1) {
                notifyAndRemoveSimilar(this.stepOrder, dispatched);
            }
            if (!dispatched) {
                statusManager.rejectRequest();
            }
        }
    }
    
    /**
     * @param int stepOrder
     * @param boolean dispatched
     */
    private void notifyAndRemoveSimilar(final int stepOrder, final boolean dispatched) {
        final String[] fields = { "user_name", "step_code", "em_id", "cf_id", "vn_id" };
        final String where =
                "table_name=" + literal(this.context, this.tableName) + " AND pkey_value = "
                        + this.id + " AND step_type='dispatch' AND step ="
                        + literal(this.context, this.stepName)
                        + " AND date_response IS NULL AND step_order = " + stepOrder;
        
        final List records = selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        final Message message = new Message(this.context);
        message.setActivityId(this.activity_id);
        message.setReferencedBy("SENDEMAIL_DISPATCH_STEPMGR");
        message.setSubjectMessageId("SENDEMAIL_CANCEL_TITLE");
        message.setBodyMessageId("SENDEMAIL_CANCEL_TEXT");
        
        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
            message.setDataModel(getDataModel());
        }
        if (!message.isBodyRichFormatted()) {// only original body contained {?} parameters
            String strDispatched = dispatched ? "dispatched" : "rejected";
            if (dispatched) {
                strDispatched =
                        getEnumFieldDisplayedValue(this.context, Constants.STEP_TABLE,
                            "step_status_result", strDispatched);
            } else {
                strDispatched =
                        getEnumFieldDisplayedValue(this.context, Constants.STEP_TABLE,
                            "step_status_rejected", strDispatched);
            }
            final String requestInfo =
                    MessageHelper.getRequestInfo(this.context, this.tableName, this.fieldName,
                        this.id);
            final Object[] args = new Object[] { strDispatched, requestInfo };
            
            message.setBodyArguments(args);
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
