package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Escalation step (Response and Completion)
 * 
 * 
 * @author bv
 * 
 */
public class Escalation extends StepImpl {
    
    public static final String STEP_ESCALATION_FOR_COMPLETION = "Escalation for Completion";
    
    // step names
    public static final String STEP_ESCALATION_FOR_RESPONSE = "Escalation for Response";
    
    private static final String STEP_TYPE = "escalation";
    
    /**
     * Constructor setting step type
     * 
     */
    public Escalation() {
        super(STEP_TYPE);
    }
    
    /**
     * Constructor setting basic step information.
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value
     */
    public Escalation(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    /**
     * 
     * Basic step ends directly after invoke.
     * 
     * @return true
     * 
     */
    @Override
    public boolean hasEnded() {
        return true;
    }
    
    /**
     * 
     * Basic step is never in progress
     * 
     * @return false
     * 
     */
    @Override
    public boolean inProgress() {
        return false;
    }
    
    /**
     * 
     * Invoke this step.<br />
     * This step only creates a record in the database
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #setStepEnded(boolean) Set step ended}</li>
     * <li>{@link #logStep() Log step}</li>
     * </ol>
     * </p>
     */
    @Override
    public void invoke() {
        // update request table
        final String[] fields =
                new String[] { "manager", "date_escalation_response", "date_escalation_completion",
                        "vn_id", "assigned_to", "cf_id", "activity_type" };
        final Object[] record =
                selectDbValues(this.context, this.tableName, fields, this.fieldName + " = "
                        + this.id);
        
        if (record == null) {
            return;
        }
        
        // the assignee
        this.vn_id = getStringValue(record[3]);
        this.em_id = getStringValue(record[4]);
        this.cf_id = getStringValue(record[5]);
        
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put("activity_log_id", this.id);
        if (this.stepName.equals(STEP_ESCALATION_FOR_RESPONSE)) {
            values.put("escalated_response", 1);
        } else if (this.stepName.equals(STEP_ESCALATION_FOR_COMPLETION)) {
            values.put("escalated_completion", 1);
        }
        executeDbSave(this.context, "activity_log", values);
        //executeDbCommit(this.context);
        
        //KB3043843 - Fill in escalation flags on the wr table from activity_log table
        String activity_type = getStringValue(record[6]);
        if (Constants.ON_DEMAND_WORK.equals(activity_type)) {
            SqlUtils
                .executeUpdate(
                    "wr",
                    "UPDATE wr SET escalated_response = (SELECT escalated_response FROM activity_log WHERE activity_log.activity_log_id = "
                            + this.id
                            + ")"
                            + ",escalated_completion = (SELECT escalated_completion FROM activity_log WHERE activity_log.activity_log_id = "
                            + this.id + ") WHERE wr.activity_log_id=" + this.id);
        }
        
        // save step
        setStepEnded(true); // ended true, action date and time
        this.stepCode = logStep(); // save to log table
        
        // send mail
        final Message message = new Message(this.context);
        final String manager = notNull(record[0]);
        message.setNameto(manager);
        final String email = getEmailAddress(this.context, manager);
        message.setMailTo(email);
        
        message.setActivityId(this.activity_id);
        message.setReferencedBy("SENDEMAIL_ESCALATION_STEPMGR");
        message.setSubjectMessageId("SENDEMAIL_TITLE");
        message.setBodyMessageId("SENDEMAIL_TEXT");
        
        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
            message.setDataModel(getDataModel());
        }
        if (!message.isBodyRichFormatted()) {// only original body contained {?} parameters
            final String link =
                    getWebCentralPath(this.context)
                            + "/"
                            + getActivityParameterString(this.context,
                                Constants.HELPDESK_ACTIVITY_ID, "ESCALATION_VIEW");
            final Object[] args = new Object[] { this.stepName, link };
            message.setBodyArguments(args);
        }
        message.format();
        
        message.sendMessage();
        
        // KB 3023429 - also notify substitute(s) of the service desk manager (EC 2012/07/10)
        final List<String> substitutes =
                StepHandler.getWorkflowEmSubstitutes(this.context, manager, "manager");
        if (!substitutes.isEmpty()) {
            for (final String substitute : substitutes) {
                message.setNameto(substitute);
                message.setMailTo(getEmailAddress(this.context, substitute));
                
                message.format();
                message.sendMessage();
            }
        }
    }
    
}
