package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.LocalDateTimeStore;

/**
 * Forward a request to a different service provider.
 * 
 * 
 * @author bv
 * 
 */
public class Forward extends StepImpl {
    
    public static final String STEP_FORWARD_CRAFTSPERSON = "Forward to Craftsperson";
    
    public static final String STEP_FORWARD_DISPATCHER = "Forward to Dispatcher";
    
    public static final String STEP_FORWARD_EMPLOYEE = "Forward to Employee";
    
    public static final String STEP_FORWARD_SUPERVISOR = "Forward to Supervisor";
    
    public static final String STEP_FORWARD_VENDOR = "Forward to Vendor";
    
    // public static final String STEP_FORWARD_APPROVAL = "Forward Approval";
    // public static final String STEP_FORWARD_REVIEW = "Forward Review";
    public static final String STEP_FORWARD_WORKTEAM = "Forward to WorkTeam";
    
    private static final String STEP_TYPE = "forward";
    
    private String work_team_id;
    
    /**
     * Constructor setting step type
     * 
     */
    public Forward() {
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
     */
    public Forward(final EventHandlerContext context, final String activity_id, final int id,
            final Map values) {
        super(context, activity_id, id, values);
    }
    
    /**
     * @param context Workflow rule execution context
     * @param activity_id
     * @param id
     * @param stepName
     */
    public Forward(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName) {
        super(context, activity_id, id, STEP_TYPE, stepName);
    }
    
    /**
     * Constructor setting basic step information.
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param stepName
     * @param assignee
     */
    public Forward(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName, final String assignee, final String comments) {
        super(context, activity_id, id, STEP_TYPE, stepName);
        
        if (stepName.equals(STEP_FORWARD_VENDOR)) {
            this.vn_id = assignee;
        } else if (stepName.equals(STEP_FORWARD_CRAFTSPERSON)) {
            this.cf_id = assignee;
        } else if (stepName.equals(STEP_FORWARD_WORKTEAM)) {
            this.work_team_id = assignee;
        } else {
            this.em_id = assignee; // this can be supervisor/dispatcher or service provider
        }
        
        this.comments = comments;
    }
    
    
    /**
     * Constructor setting basic step information.
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param stepName
     * @param assignee
     */
    public Forward(final EventHandlerContext context, final String activity_id, final int id,
            final String stepName, final String assignee) {
        super(context, activity_id, id, STEP_TYPE, stepName);
        
        if (stepName.equals(STEP_FORWARD_VENDOR)) {
            this.vn_id = assignee;
        } else if (stepName.equals(STEP_FORWARD_CRAFTSPERSON)) {
            this.cf_id = assignee;
        } else if (stepName.equals(STEP_FORWARD_WORKTEAM)) {
            this.work_team_id = assignee;
        } else {
            this.em_id = assignee; // this can be supervisor/dispatcher or service provider
        }
    }
    
    public String getWork_team_id() {
        return this.work_team_id;
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
        // update the workflow table setting the new service provider and resetting escalation
        // dates/times
        
        // get the sla for this request
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(this.context, this.tableName, this.fieldName,
                    this.id);
        
        final Map<String, String> map =
                Common.getSiteBuildingIds(this.tableName, this.fieldName, String.valueOf(this.id));
        // calculate NEW escalation date and time from now
        final Map<String, Map<String, Object>> escalation =
                sla.calculateEscalation(
                    LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                        map.get("blId")),
                    LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                        map.get("blId")));
        
        final Map<String, Object> values = new HashMap<String, Object>();
        
        final Map<String, Object> response = escalation.get("response");
        if (response != null) {
            final java.sql.Date date_esc_response = (java.sql.Date) response.get("date");
            final java.sql.Time time_esc_response = (java.sql.Time) response.get("time");
            values.put("date_escalation_response", date_esc_response);
            values.put("time_escalation_response", time_esc_response);
        } else {
            values.put("date_escalation_response", null);
            values.put("time_escalation_response", null);
        }
        
        final Map<String, Object> completion = escalation.get("completion");
        if (completion != null) {
            final java.sql.Date date_esc_completion = (java.sql.Date) completion.get("date");
            final java.sql.Time time_esc_completion = (java.sql.Time) completion.get("time");
            
            values.put("date_escalation_completion", date_esc_completion);
            values.put("time_escalation_completion", time_esc_completion);
        } else {
            values.put("date_escalation_completion", null);
            values.put("time_escalation_completion", null);
        }
        
        if (this.stepName.equals(STEP_FORWARD_EMPLOYEE)) {
            values.put("assigned_to", this.em_id);
        } else if (this.stepName.equals(STEP_FORWARD_VENDOR)) {
            values.put("vn_id", this.vn_id);
        } else if (this.stepName.equals(STEP_FORWARD_DISPATCHER)) {
            values.put("dispatcher", this.em_id);
            values.put("supervisor", ""); // set supervisor to NULL
        } else if (this.stepName.equals(STEP_FORWARD_SUPERVISOR)) {
            values.put("supervisor", this.em_id);
            values.put("dispatcher", ""); // set dispatcher to NULL
        } else if (this.stepName.equals(STEP_FORWARD_CRAFTSPERSON)) {
            values.put("cf_id", this.cf_id);
        } else if (this.stepName.equals(STEP_FORWARD_WORKTEAM)) {
            values.put("dispatcher", "");
            values.put("work_team_id", this.work_team_id);
            values.put("supervisor", "");
        }
        // reset the escalation flags
        values.put("escalated_response", new Integer(0));
        values.put("escalated_completion", new Integer(0));
        
        values.put(this.fieldName, new Integer(this.id));
        
        executeDbSave(this.context, this.tableName, values);
        //executeDbCommit(this.context);
        
        setStepEnded(true); // ended true, action date and time
        logStep(); // save to log table
        
        // send e-mail to new service provider / assignee
        // notify assignee for requests in HelpDesk
        if (this.stepName.equals(STEP_FORWARD_EMPLOYEE)
                || this.stepName.equals(STEP_FORWARD_VENDOR)) {
            final RequestHandler handler = new RequestHandler();
            handler.notifyServiceProvider(this.context, this.id);
        } else if (this.stepName.equals(STEP_FORWARD_SUPERVISOR)
                || this.stepName.equals(STEP_FORWARD_WORKTEAM)) {
            // check if wr's or wo's attached to the service request
            if (this.tableName.equals("activity_log")) {
                final Object[] woWr =
                        selectDbValues(this.context, "activity_log", new String[] { "wo_id",
                                "wr_id" }, "activity_log_id = " + this.id);
                if (getIntegerValue(this.context, woWr[0]) != null) {
                    final int woId = getIntegerValue(this.context, woWr[0]);
                    
                    final Map<String, Object> woValues = new HashMap<String, Object>();
                    if (this.stepName.equals(STEP_FORWARD_SUPERVISOR)) {
                        woValues.put("supervisor", this.em_id);
                        woValues.put("work_team_id", "");
                    } else if (this.stepName.equals(STEP_FORWARD_WORKTEAM)) {
                        woValues.put("work_team_id", this.work_team_id);
                        woValues.put("supervisor", "");
                    }
                    woValues.put("wo_id", woId);
                    executeDbSave(this.context, "wo", woValues);
                    
                    final List records =
                            selectDbRecords(this.context, "wr", new String[] { "wr_id" },
                                "wo_id = " + woId);
                    
                    for (final Iterator it = records.iterator(); it.hasNext();) {
                        final Object[] record = (Object[]) it.next();
                        final int wrId = getIntegerValue(this.context, record[0]);
                        final Forward forwardWr =
                                new Forward(this.context, Constants.ONDEMAND_ACTIVITY_ID, wrId,
                                    this.stepName);
                        if (this.stepName.equals(STEP_FORWARD_SUPERVISOR)) {
                            forwardWr.setEmId(this.em_id);
                        } else if (this.stepName.equals(STEP_FORWARD_WORKTEAM)) {
                            forwardWr.setWork_team_id(this.work_team_id);
                        }
                        forwardWr.setComments(this.comments);
                        forwardWr.invoke();
                    }
                    
                } else if (getIntegerValue(this.context, woWr[1]) != null) {
                    final Forward forwardWr =
                            new Forward(this.context, Constants.ONDEMAND_ACTIVITY_ID,
                                getIntegerValue(this.context, woWr[1]), this.stepName);
                    if (this.stepName.equals(STEP_FORWARD_SUPERVISOR)) {
                        forwardWr.setEmId(this.em_id);
                    } else if (this.stepName.equals(STEP_FORWARD_WORKTEAM)) {
                        forwardWr.setWork_team_id(this.work_team_id);
                    }
                    
                    forwardWr.setComments(this.comments);
                    forwardWr.invoke();
                    
                } else {
                    // notify new supervisor(s) for request in OnDemandWork
                    final WorkRequestHandler handler = new WorkRequestHandler();
                    handler.notifySupervisor(this.context, this.statusBefore, this.tableName,
                        this.id);
                }
            } else {
                // notify new supervisor(s) for request in OnDemandWork
                final WorkRequestHandler handler = new WorkRequestHandler();
                handler.notifySupervisor(this.context, this.statusBefore, this.tableName, this.id);
            }
        }
    }
    
    /**
     * @param work_team_id
     */
    public void setWork_team_id(final String work_team_id) {
        this.work_team_id = work_team_id;
    }
}
