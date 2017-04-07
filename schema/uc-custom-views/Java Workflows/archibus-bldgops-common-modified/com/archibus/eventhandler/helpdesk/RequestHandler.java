package com.archibus.eventhandler.helpdesk;

import java.sql.*;
import java.sql.Date;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.db.DbConnection;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.ondemandwork.*;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.eventhandler.steps.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;
import com.archibus.app.common.util.SchemaUtils;

/**
 * <p>
 * Handles all workflow rules for requests used by the Helpdesk application.<br>
 * Event handler save and fetch data. Complex logic is passed to helpers<br>
 * 
 * <p>
 * 
 * @see ServiceLevelAgreement
 * @see StepManager
 * @see StatusManager
 */

public class RequestHandler extends HelpdeskEventHandlerBase {
    
    /**
     * Accept request by assignee.<br />
     * The assignee can have an optional acceptance step, where he can accept or decline a help
     * request. This does not change the basic status of the help request.<br>
     * <p>
     * <b>Inputs:</b>
     * <li>record : JSONObject which includes the form values submitted</li>
     * <li>comments : step comments</li>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get help request values</li>
     * <li>Get step values</li>
     * <li>Save updated help request</li>
     * <li>
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#acceptStep(EventHandlerContext, int, String, int)
     * Accept step}</li>
     * </ol>
     * </p>
     */
    public void acceptRequest(final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        // fields of activity_log
        final Map values =
                stripPrefix(filterWithPrefix(fieldValues, Constants.ACTION_ITEM_TABLE + "."));
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        final int stepLogId =
                getIntegerValue(context, fieldValues.get("activity_log_step_waiting.step_log_id"))
                    .intValue();
        
        acceptStep(context, activity_log_id, comments, stepLogId);
    }
    
    /**
     * Approve request. The manager can approve a help request when an approval step is active
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSONObject which includes the form values submitted</li>
     * <li>comments : step comments</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Convert the inputs to map type from JSONObject</li>
     * <li>Get help request values from record</li>
     * <li>Get step values from inputs</li>
     * <li>Save help request</li>
     * <li>
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Confirm approval}</li>
     * </ol>
     * </p>
     */
    public void approveRequest(final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        // fields of activity_log
        final Map values =
                stripPrefix(filterWithPrefix(fieldValues, Constants.ACTION_ITEM_TABLE + "."));
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        //executeDbCommit(context);
        
        final int stepLogId =
                ((Integer) fieldValues.get("activity_log_step_waiting.step_log_id")).intValue();
        confirmStep(context, stepLogId, activity_log_id, comments);
    }
    
    /**
     * 
     * Archive help request.<br />
     * The help request is copied to the history table
     * <code>hactivity_log<code> and removed from the <code>activity_log</code> table.<br />
     * A request can be archived by the assignee after it is closed. This can also happen
     * automatically based on the activity parameter AUTO_ARCHIVE.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sActivityLogId : 'activity_log.activity_log_id ' Service Request Id</li>
     * <li>record : the Service request will be archived</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Check if the help request to be archived has the maximal activity_log_id</li>
     * <li>Use the {@link #archiveHelper(EventHandlerContext, int, String) archiveHelper} to archive
     * the request</li>
     * </ol>
     * </p>
     */
    public void archiveRequest(final String sActivityLogId, final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        int activity_log_id = 0;
        Map values = new HashMap();
        if (record.length() != 0) {
            final Map fieldValues = parseJSONObject(context, record);
            values = stripPrefix(fieldValues);
            
        }
        if (values.get("activity_log_id") != null) {
            activity_log_id = getIntegerValue(context, values.get("activity_log_id")).intValue();
        } else if (!sActivityLogId.equalsIgnoreCase("null") && !sActivityLogId.equals("")) {
            activity_log_id = Integer.parseInt(sActivityLogId);
        }
        
        // check if request with max id will be archived
        final int max_id = Common.getMaxId(context, "activity_log", "activity_log_id", null);
        if (activity_log_id == max_id) {
            archiveHelper(context, max_id, "activity_log_id = " + activity_log_id);
        } else {
            archiveHelper(context, 0, "activity_log_id = " + activity_log_id);
        }
        
    }
    
    /**
     * 
     * Archive requests.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : selected help requests to archive</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Iterate over the selected records and check if the record with the maximal id will be
     * archived</li>
     * <li>Use the {@link #archiveHelper(EventHandlerContext, int, String) archiveHelper} to archive
     * the records</li>
     * </ol>
     * </p>
     */
    public void archiveRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        if (records.length() > 0) {
            int activity_log_id = 0;
            final StringBuffer record_list = new StringBuffer();
            final int max_id =
                    Common.getMaxId(context, Constants.ACTION_ITEM_TABLE, "activity_log_id", null);
            boolean max = false;
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                
                activity_log_id =
                        getIntegerValue(context, values.get("activity_log_id")).intValue();
                
                record_list.append("," + activity_log_id);
                if (activity_log_id == max_id) {
                    max = true;
                }
            }
            if (max) {
                archiveHelper(context, max_id, "activity_log_id IN ("
                        + record_list.substring(1).toString() + ")");
            } else {
                archiveHelper(context, 0, "activity_log_id IN ("
                        + record_list.substring(1).toString() + ")");
            }
        } // else nothing to archive
        
    }
    
    /**
     * Cancel help request (by employee) using the status manager. A help request can only be
     * cancelled if its status is 'REQUESTED' (before approvals are given)
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     *            <p>
     *            <b>Inputs:</b> record : the service request to cancel
     *            </p>
     *            <p>
     *            <b>Pseudo-code:</b>
     *            <ol>
     *            <li>Get help request values</li>
     *            <li>Save updated help request</li>
     *            <li>Update the status of the request with
     *            {@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) status
     *            manager} to 'Cancelled'</li>
     *            </ol>
     *            </p>
     */
    public void cancelRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        final String status =
                Common.getStatusValue(context, Constants.ACTION_ITEM_TABLE, "activity_log_id",
                    activity_log_id);
        
        if (status.equals("REQUESTED") || status.equals("APPROVED")) {
            final StatusManager statusManager = new HelpdeskStatusManager(context, activity_log_id);
            statusManager.updateStatus("CANCELLED");
        } else {
            // @translatable
            final String errorMessage =
                    localizeString(context,
                        "Cannot cancel service request with other status then 'REQUESTED' or 'APPROVED'");
            throw new ExceptionBase(errorMessage, true);
        }
    }
    
    /**
     * Check if a request should be approved automatically.<br />
     * This workflow rule is called by the {@link AutoRule auto rule} for autoapprove on status
     * 'REQUESTED'.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sla: Service Level Agreement</li>
     * <li>activity_log.activity_log_id : Help request id</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get SLA and id from context</li>
     * <li>Check SLA for auto-approval, or check if the current request status is REQUESTED and the
     * step status is null
     * </p>
     * <li>Change the status to 'APPROVED' using the
     * {@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) Status Manager} if
     * necessary </p> </ol> </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     */
    public void checkAutoApprove(final EventHandlerContext context) {
        
        final int activity_log_id = context.getInt("activity_log.activity_log_id");
        final Object[] states =
                selectDbValues(context, Constants.ACTION_ITEM_TABLE, new String[] { "step_status",
                        "status" }, "activity_log_id = " + activity_log_id);
        
        // involve the assessment item. if a Service Request is created and
        // it has a valid assessment_id (assessment_id > 0), so change the
        // status of the assessment item to 'IN PROGRESS'
        if ((notNull(states[1])).equals("REQUESTED")) {
            this.checkCondAssessmentInProgress(context);
        }
        
        // the sla should be in the context when calling the auto rules !
        final ServiceLevelAgreement sla = (ServiceLevelAgreement) context.getParameter("sla");
        
        // For v21.2, default isAutocreate_wr = true, always create work request when submit on
        // demand service request
        if (sla.getActivity_type().equals(Constants.ON_DEMAND_WORK) && sla.isAutocreate_wr()) {
            final WorkRequestHandler handler = new WorkRequestHandler();
            final int wrId = handler.createWorkRequestFromActionItem(context, activity_log_id, true);
            
            final Object[] wrStates =
                    selectDbValues(context, Constants.WORK_REQUEST_TABLE, new String[] { "step_status",
                            "status" }, "wr_id = " + wrId);
            
            ////if auto approve, or not auto approve but the approval step is not required for the approver(wr.step_status is 'none' and activity_log.step_status is 'none') 
            if (sla.isAutoapprove() || (((wrStates[0] == null || notNull(wrStates[0]).equals(Constants.STEP_STATUS_NULL)) && (notNull(wrStates[1])).equals("R")) 
                    && ((states[0] == null || notNull(states[0]).equals(Constants.STEP_STATUS_NULL)) && (notNull(states[1])).equals("REQUESTED")))) {
                final StatusManager statusManager = new HelpdeskStatusManager(context, activity_log_id);
                statusManager.updateStatus("APPROVED");
            }
        }else {
            //if auto approve, or not auto approve but the approval step is not required for the approver(activity_log.step_status is 'none') 
            if (sla.isAutoapprove()
                    || ((states[0] == null || notNull(states[0]).equals(Constants.STEP_STATUS_NULL)) && (notNull(states[1]))
                        .equals("REQUESTED"))) {
                StatusManager statusManager = new HelpdeskStatusManager(context, activity_log_id);
                statusManager.updateStatus("APPROVED");
            }
        }
    }
    
    /**
     * 
     * Check if a request should be archived automatically.
     * <p>
     * Used after a request is closed. The activity parameter AUTO_ARCHIVE should be given in the
     * <code>afm_activity_params</code> table.
     * </p>
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : Help request ID</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get help request id from context</li>
     * <li>Check if the autoarchive parameter is set in the database</li>
     * <li>{@link #archiveRequest(EventHandlerContext) Archive the request} if necessary</li>
     * </ol>
     * </p>
     * 
     * @param context Workflow rule execution context
     */
    public void checkAutoArchive(final EventHandlerContext context) {
        if (!context.parameterExists("activity_log.activity_log_id")) {
            return;
        }
        final boolean autoarchive =
                getActivityParameterInt(context, Constants.HELPDESK_ACTIVITY_ID, "AUTO_ARCHIVE")
                    .intValue() > 0;
        if (autoarchive) {
            archiveRequest(context.getString("activity_log.activity_log_id"), new JSONObject());
        }
        
        // when Service Request is closed, the assmentId should be completed.
        checkConditionAssessmentStatus(context);
    }
    
    /**
     * Check AutoRules for status approved. This workflow rule is called by the {@link AutoRule auto
     * rule} on status 'APPROVED'.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sla : Service Level Agreement for current request</li>
     * <li>activity_log.activity_log_id : Help request id</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>wr.wr_id : Work Request Code (if work request is created automatically according to SLA)</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get SLA and id from context</li>
     * <li>Check if it is On Demand Work
     * <ul>
     * <li>Check auto dispatch</li>
     * <li>If so, dispatch request and check autocreate work request</li>
     * <li>If so,
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#createWorkOrderFromActionItem(EventHandlerContext, int)
     * create work order} with work request, and add work request code in context</li>
     * </ul>
     * </li>
     * <li>Else (Helpdesk) check auto accept</li>
     * <li>If so, assign request to employee or vendor specified by the SLA</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void checkAutoRulesStatusApproved(final EventHandlerContext context) {
        final ServiceLevelAgreement sla = (ServiceLevelAgreement) context.getParameter("sla");
        final int activity_log_id = context.getInt("activity_log.activity_log_id");
        
        // only for on demand requests
        if (sla.getActivity_type().equals(Constants.ON_DEMAND_WORK)) {
            final WorkRequestHandler handler = new WorkRequestHandler();
            if (sla.isAutoDispatch()) { // dispatch
                final boolean isDefaultSLA = isDefaultSLA(sla);
                // assign supervisor or work_team to request
                final Map<String, Object> values = new HashMap<String, Object>();
                values.put("activity_log_id", new Integer(activity_log_id));
                if (sla.getSupervisor() != null) {
                    values.put("supervisor", sla.getSupervisor());
                    
                    // get workteam of this supervisor
                    //KB3016857 - Allow craftspersons to be members of more than one team only in Operation console
                    final String workTeam = this.getWorkTeamFromSupervisor(sla.getSupervisor());
                    values.put("work_team_id", workTeam);
                    executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
                    //executeDbCommit(context);
                } else if (sla.getWorkTeam() != null) {
                    values.put("work_team_id", sla.getWorkTeam());
                    executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
                    //executeDbCommit(context);
                } else {
                    if (!isDefaultSLA) {
                        // @translatable
                        final String errorMessage =
                                localizeString(context,
                                    "Supervisor and Work Team missing in SLA for autodispatch");
                        throw new ExceptionBase(errorMessage, true);
                    }
                }
                
                context.addInputParameter("isDefaultSLA", isDefaultSLA);
                
                if (sla.isAutocreate_wr()) {
                    int wr_id = 0;
                    // For fixing kb3029391: if wo exists then don't create wo and wr again for
                    // given action item.
                    final int woId = handler.findWoIdFromActionItem(context, activity_log_id);
                    if (woId <= 0) {
                        wr_id =
                                handler.createWorkRequestFromActionItem(context,
                                    activity_log_id, true);
                        
                        final StatusManager statusManager =
                                new OnDemandWorkStatusManager(context, wr_id);
                        statusManager.updateStatus("A");
                        
                        if (sla.isAutocreate_wo()) {
                            handler.createWorkOrderFromActionItem(context, activity_log_id);
                            
                            final String wrStatus =
                                    Common.getStatusValue(context, "wr", "wr_id", wr_id);
                            if (wrStatus.equals("AA") && sla.isNotifyServiceProvider()) {
                                final Integer wo_id =
                                        getIntegerValue(
                                            context,
                                            selectDbValue(context, "wr", "wo_id", "wr_id = "
                                                    + wr_id));
                                handler.notifySupervisor(context, "AA", "wo", wo_id);
                            }
                        } else {
                            
                            if (sla.isNotifyServiceProvider()) {
                                handler.notifySupervisor(context, "A", "wr", wr_id);
                            }
                        }
                        context.addResponseParameter("wr.wr_id", new Integer(wr_id));
                    }else {
                        wr_id = handler.createWorkRequestFromActionItem(context,  activity_log_id, true);
                        final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
                        statusManager.updateStatus("A");
                        if (sla.isAutocreate_wo()) {
                            if (DataStatistics
                                .getInt(
                                    "wo",
                                    "wo_id",
                                    "count",
                                    "exists(select 1 from wr where wr.wo_id = wo.wo_id and wr.wr_id="
                                            + wr_id
                                            + ") and not exists(select 1 from wr where wr.wo_id = wo.wo_id and wr.wr_id!="
                                            + wr_id + ")") > 0) {
                                
                                statusManager.updateStatus("AA");
                                
                            }else {
                                handler.createWorkOrderFromActionItem(context, activity_log_id);
                            }
                        } 
                    }
                } else {
                    if (sla.isNotifyServiceProvider()) {
                        handler.notifySupervisor(context, "APPROVED", "activity_log",
                            activity_log_id);
                    }
                }
            }else {
                int wr_id = handler.createWorkRequestFromActionItem(context,  activity_log_id, true);
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
                statusManager.updateStatus("A");
                if (sla.isAutocreate_wo()) {
                    handler.createWorkOrderFromActionItem(context, activity_log_id);
                } 
            }
        } else {
            if (sla.isAutoaccept()) {
                final Map<String, Object> values = new HashMap<String, Object>();
                values.put("activity_log_id", new Integer(activity_log_id));
                if (sla.getAssignee("em") != null) {
                    values.put("assigned_to", sla.getAssignee("em"));
                    executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
                    //executeDbCommit(context);
                } else if (sla.getAssignee("vn") != null) {
                    values.put("vn_id", sla.getAssignee("vn"));
                    executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
                    //executeDbCommit(context);
                } else if (sla.getAssignee("activity") != null) {
                    // do nothing
                } else {
                    // @translatable
                    final String errorMessage =
                            localizeString(context,
                                "Employee or vendor missing in SLA for autoaccept");
                    throw new ExceptionBase(errorMessage, true);
                }
                if (sla.isNotifyServiceProvider()) {
                    notifyServiceProvider(context, activity_log_id);
                }
                
            }
        }
    }
    
    /**
     * When the original Service Request's status is updated, the associated Condition Assessment
     * item's status must also be updated. The only status that the associated Condition Assessment
     * item can change to is "COMPLETED", and it can only get that status if it is not in one of the
     * following statuses: 'COMPLETED-V','CLOSED' (this KB)
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : Help request id</li>
     * <li>activity_log.assessment_id : Condition Assessment Id</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get assessment_id and activity_log_id from context</li>
     * <li>check the assessment is not null and more than 0</li>
     * </p>
     * <li>Change the status of the assessment item (i.e, the assessment_id) to 'COMPLETED'</li>
     * </p> </ol> </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     */
    public void checkConditionAssessmentStatus(final EventHandlerContext context) {
        
        int assessmentId = 0;
        Map fieldValues = null;
        if (context.parameterExists("fields")) {
            fieldValues = context.getParameters("fields");
        }
        
        // search the assessment ID in the context.
        if (fieldValues != null && fieldValues.containsKey("activity_log.assessment_id")) {
            if (fieldValues.get("activity_log.assessment_id") != null) {
                assessmentId = (Integer) fieldValues.get("activity_log.assessment_id");
            }
        }
        
        // there is no assessment id in the context, so search it in DB.
        if (assessmentId < 1) {
            final Object objAssessmentId =
                    Common.getValue(context, "activity_log", "assessment_id", "activity_log_id = "
                            + context.getInt("activity_log.activity_log_id"));
            
            if (objAssessmentId != null && (Integer) objAssessmentId > 0) {
                assessmentId = (Integer) objAssessmentId;
            }
        }
        
        final Object[] states =
                selectDbValues(context, Constants.ACTION_ITEM_TABLE, new String[] { "step_status",
                        "status" },
                    "activity_log_id = " + context.getInt("activity_log.activity_log_id"));
        
        final String status = notNull(states[1]);
        if (status.equals("COMPLETED") || status.equals("COMPLETED-V") || status.equals("CLOSED")) {
            final String updateSql =
                    " UPDATE activity_log SET status = 'COMPLETED' "
                            + " WHERE status NOT IN ('COMPLETED','COMPLETED-V','CLOSED') "
                            + " AND activity_log_id ="
                            + assessmentId
                            + " AND NOT EXISTS "
                            + "   ("
                            + "       SELECT 1 FROM activity_log actlog_inner "
                            + "       WHERE "
                            + "           actlog_inner.assessment_id = activity_log.activity_log_id "
                            + "           AND actlog_inner.status NOT IN ('COMPLETED','COMPLETED-V','CLOSED')"
                            + "  )";
            executeDbSql(context, updateSql, false);
            //executeDbCommit(context);
        }
        /*
         * if ("".equals(status) || "COMPLETED-V".equals(status) || "CLOSED".equals(status)) { }
         */
    }
    
    /**
     * Check whether the service request is duplicate
     * 
     * @param record : the service request
     */
    public void checkRequestDuplicates(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        
        final String bl_id = notNull(values.get("bl_id"));
        final String siteId = notNull(values.get("site_id"));
        
        final String activity_type = notNull(values.get("activity_type"));
        
        final String sql =
                "SELECT activity_log_id, bl_id, fl_id, rm_id, prob_type, activity_type, priority, date_requested, requestor FROM activity_log "
                        + "WHERE status <> 'CREATED' AND date_requested = "
                        + formatSqlFieldValue(context,
                            LocalDateTimeStore.get().currentLocalDate(null, null, siteId, bl_id),
                            "java.sql.Date", "current_date")
                        + " AND activity_type = "
                        + literal(context, activity_type);
        
        final StringBuffer restriction = new StringBuffer();
        final JSONObject json = new JSONObject();
        if (values.get("activity_log_id") != null && !values.get("activity_log_id").equals("")) {
            restriction.append(" AND activity_log_id <> " + values.get("activity_log_id"));
        }
        
        if (StringUtil.notNullOrEmpty(values.get("eq_id"))) {
            final String eq_id = notNull(values.get("eq_id"));
            restriction.append(" AND eq_id = " + literal(context, eq_id));
        }
        
        // fix KB3029909 - make the duplicate check only for the location specified(Guo 2011/4/11)
        if (StringUtil.notNullOrEmpty(values.get("site_id"))) {
            restriction.append(" AND site_id = " + literal(context, siteId));
            if (StringUtil.notNullOrEmpty(values.get("bl_id"))) {
                restriction.append(" AND bl_id = " + literal(context, bl_id));
                if (StringUtil.notNullOrEmpty(values.get("fl_id"))) {
                    restriction.append(" AND fl_id = "
                            + literal(context, notNull(values.get("fl_id"))));
                    if (StringUtil.notNullOrEmpty(values.get("rm_id"))) {
                        restriction.append(" AND rm_id = "
                                + literal(context, notNull(values.get("rm_id"))));
                    }
                }
            }
        }
        
        if (StringUtil.notNullOrEmpty(values.get("prob_type"))) {
            final String prob_type = notNull(values.get("prob_type"));
            restriction.append(" AND prob_type = " + literal(context, prob_type));
        }
        
        final List records = selectDbRecords(context, sql + restriction);
        if (records.isEmpty()) {
            json.put("duplicates", Boolean.FALSE);
        } else {
            json.put("duplicates", Boolean.TRUE);
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * Checks tabs and fields to show for request form according to activitytype.<br>
     * This handler is called when a user makes a new request. The form lay-out will change<br>
     * depending on the activity (request) type, showing or hiding fields or panels<br>
     * The request type is selected from the catalog.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_type : request type</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSON object with booleans for questionnaire, equipment, location,
     * document tab, required (date/time), problem type
     * <code>{questionnaire : <i>true/false</i>,equipment : <i>true/false</i>,locatie : <i>true/false</i>,documents : <i>true/false</i>,required : <i>true/false</i>,prob_type : <i>true/false</i>}</code>
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select hide fields from the <code>activitytype</code> table</li>
     * <li>Check for questionnaire</li>
     * <li>Create jsonExpression and return</li>
     * </ol>
     * </p>
     * 
     */
    public void checkRequestForm(final String activity_type) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONObject json = new JSONObject();
        
        final Object[] record =
                selectDbValues(context, "activitytype", new String[] { "hide_fields" },
                    "activity_type = " + literal(context, activity_type));
        if (record != null) {
            // questionnaire (count questions)
            final String sql =
                    "SELECT COUNT(quest_name) FROM questions WHERE questionnaire_id = "
                            + literal(context, activity_type);
            final List records = selectDbRecords(context, sql);
            final Object[] rec = (Object[]) records.get(0);
            
            if ((getIntegerValue(context, rec[0])).intValue() > 0) {
                json.put("questionnaire", true);
            } else {
                json.put("questionnaire", false);
            }
            
            // fields to hide
            if (record[0] != null) {
                final String hide_fields = notNull(record[0]);
                
                json.put("equipment", hide_fields.indexOf("eq_id") < 0);
                json.put(
                    "locatie",
                    (hide_fields.indexOf("site_id") < 0 && hide_fields.indexOf("bl_id") < 0
                            && hide_fields.indexOf("fl_id") < 0 && hide_fields.indexOf("rm_id") < 0));
                json.put("documents",
                    (hide_fields.indexOf("doc1") < 0 && hide_fields.indexOf("doc2") < 0
                            && hide_fields.indexOf("doc3") < 0 && hide_fields.indexOf("doc4") < 0));
                json.put("required", (hide_fields.indexOf("date_required") < 0 && hide_fields
                    .indexOf("time_required") < 0));
            } else {
                json.put("equipment", true);
                json.put("locatie", true);
                json.put("documents", true);
                json.put("required", true);
            }
            
            // check problem type
            if (activity_type.equals(Constants.ON_DEMAND_WORK)) {
                json.put("prob_type", true);
            } else {
                json.put("prob_type", false);
            }
            context.addResponseParameter("jsonExpression", json.toString());
        } else {
            // @translatable
            final String errorMessage = localizeString(context, "Invalid request type [{0}]");
            final Object[] args = { activity_type };
            throw new ExceptionBase(errorMessage, args, true);
        }
    }
    
    /**
     * Check if the current user is allowed to view/update the given request.<br />
     * A user may view a request if he/she is the requestor or created the request.<br />
     * A user may update a request (costs etc) if the request is assigned to him as employee or
     * vendor.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sActivityLogId : id of the request</li>
     * <li>task : 'view' or 'update'</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSON with check true or false<br />
     * <code>{check : <i>true/false</i>}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get employee code for current user using macro xpath</li>
     * <li>If task = view : check current user as requestor or creator (<code>created_by</code></li>
     * <li>If task = update : check current as the assigned employee (<code>assigned_to</code>) or
     * vendor<br />
     * (for the vendor the email is checked against the email of the current user)</li>
     * <li>Return JSON expression with parameter check true or false</li>
     * </ol>
     * </p>
     */
    public void checkUserForRequest(final String sActivityLogId, final String task) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int activity_log_id = Integer.parseInt(sActivityLogId);
        
        final String currentUser =
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id");
        final String userEmail = getParentContextAttributeXPath(context, "/*/preferences/@email");
        
        final JSONObject json = new JSONObject();
        json.put("activity_log_id", activity_log_id);
        
        // a request can be viewed by the requestor and the creator
        if (task.equals("view")) {
            final Object[] record =
                    selectDbValues(context, Constants.ACTION_ITEM_TABLE, new String[] {
                            "requestor", "created_by" }, "activity_log_id=" + activity_log_id);
            if (record != null) {
                final String requestor = record[0] == null ? null : notNull(record[0]);
                final String created_by = record[1] == null ? null : notNull(record[1]);
                if ((requestor != null && requestor.equals(currentUser))
                        || (created_by != null && created_by.equals(currentUser))) {
                    json.put("check", true);
                } else {
                    json.put("check", false);
                }
            } else {
                final Object[] hRecord =
                        selectDbValues(context, "hactivity_log", new String[] { "requestor",
                                "created_by" }, "activity_log_id=" + activity_log_id);
                if (hRecord != null) {
                    final String requestor = hRecord[0] == null ? null : notNull(hRecord[0]);
                    final String created_by = hRecord[1] == null ? null : notNull(hRecord[1]);
                    if ((requestor != null && requestor.equals(currentUser))
                            || (created_by != null && created_by.equals(currentUser))) {
                        json.put("archived", true);
                    } else {
                        json.put("archived", false);
                    }
                }
            }
            
        } else if (task.equals("update")) {
            // a request can be updated by the person it is assigned to (assigned_to or vendor)
            final String em_id =
                    notNull(selectDbValue(context, Constants.ACTION_ITEM_TABLE, "assigned_to",
                        "activity_log_id=" + activity_log_id));
            final String where =
                    "vn_id = (SELECT vn_id FROM " + Constants.ACTION_ITEM_TABLE
                            + " WHERE activity_log_id =" + activity_log_id + ")";
            final String email = notNull(selectDbValue(context, "vn", "email", where));
            
            if (em_id.equals(currentUser) || email.equals(userEmail)) {
                json.put("check", true);
            } else {
                json.put("check", false);
            }
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * 
     * Close a help request.<br />
     * A request can be closed by the assignee (employee or vendor) after completion.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSONObject - the form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : Help request id</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Retrieve help request id from record</li>
     * <li>Add help request id to context</li>
     * <li>Use the {@link HelpdeskStatusManager status manager} to set the status of the given
     * request to 'CLOSED'</li>
     * </ol>
     * </p>
     */
    public void closeRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        final String status =
                Common.getStatusValue(context, Constants.ACTION_ITEM_TABLE, "activity_log_id",
                    activity_log_id);
        if (status.equals("CANCELLED") || status.equals("REJECTED")) {
            return;
        }
        final StatusManager manager = new HelpdeskStatusManager(context, activity_log_id);
        manager.updateStatus("CLOSED", StatusConverter.getActionDateField("CLOSED"),
            StatusConverter.getActionTimeField("CLOSED"));
        
        // check auto archive
        if (getActivityParameterInt(context, Constants.HELPDESK_ACTIVITY_ID, "AUTO_ARCHIVE")
            .intValue() > 0) {
            archiveRequest(Integer.toString(activity_log_id), record);
        }
    }
    
    /**
     * 
     * Close help request(s).<br />
     * Called when multiple requests are selected to be closed.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray with primary keys of help requests to be closed</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update the status of the selected records to 'CLOSED' in <code>activity_log</code></li>
     * <li>Check if the records should be archived automatically</li>
     * <li>{@link #archiveRequests(EventHandlerContext) Archive} help requests if necessary</li>
     * </ol>
     * </p>
     */
    public void closeRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        if (records.length() > 0) {
            int activity_log_id = 0;
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                
                activity_log_id =
                        getIntegerValue(context, values.get("activity_log_id")).intValue();
                
                final Map<String, String> map =
                        Common.getSiteBuildingIds("activity_log", "activity_log_id",
                            String.valueOf(activity_log_id));
                final String blId = map.get("blId");
                final String siteId = map.get("siteId");
                
                final String update =
                        "UPDATE activity_log SET status = 'CLOSED', date_closed = "
                                + formatSqlFieldValue(context, LocalDateTimeStore.get()
                                    .currentLocalDate(null, null, siteId, blId), "java.sql.Date",
                                    "current_date") + " WHERE activity_log_id = " + activity_log_id;
                
                executeDbSql(context, update, true);
                //executeDbCommit(context);
            }
            
            // check auto archive
            if (getActivityParameterInt(context, Constants.HELPDESK_ACTIVITY_ID, "AUTO_ARCHIVE")
                .intValue() > 0) {
                archiveRequests(records);
            }
        }
    }
    
    /**
     * Complete request.<br />
     * A request with status 'IN PROGRESS' and step status null can be completed by the assignee.
     * This sets the status of the request to 'COMPLETED'.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : help request -- the form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get help request values</li>
     * <li>Save updated help request</li>
     * <li>Update the status and date completion of the request with
     * {@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) status manager}</li>
     * </ol>
     * </p>
     */
    public void completeRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        //executeDbCommit(context);
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        final StatusManager manager = new HelpdeskStatusManager(context, activity_log_id);
        manager.updateStatus("COMPLETED");
    }
    
    /**
     * Decline request.<br />
     * The assignee (employee or vendor) can decline a request instead of accepting it. This does
     * not change the basic status of the request. If several employees or vendors were asked for
     * acceptance of the same request, only 1 has to accept. If they all decline the request an
     * escalation has to be fired.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : help request --the form values submitted</li>
     * <li>comments : help request comments</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get step values from record</li>
     * <li>Save updated help request</li>
     * <li>
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#declineStep(com.archibus.jobmanager.EventHandlerContext,int,java.lang.String,int)
     * Decline step}</li>
     * </ol>
     * </p>
     */
    public void declineRequest(final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        // fields of activity_log_step_waiting
        final Map stepValues =
                stripPrefix(filterWithPrefix(fieldValues, "activity_log_step_waiting"));
        // fields of activity_log
        final Map values =
                stripPrefix(filterWithPrefix(fieldValues, Constants.ACTION_ITEM_TABLE + "."));
        
        final int stepLogId = getIntegerValue(context, stepValues.get("step_log_id")).intValue();
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        
        declineStep(context, stepLogId, comments, activity_log_id);
    }
    
    /**
     * Delete given help request.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : help request --- the form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Convert the record to map type from JSONObject</li>
     * <li>Delete request from <code>activity_log</code></li>
     * </ol>
     * </p>
     * <p>
     * <p>
     */
    public void deleteRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        //KB3041839 - when cancel service request, remove work request as well
        final List<Object[]> records = selectDbRecords(context, "SELECT wr_id FROM wr WHERE activity_log_id =" + record.getInt("activity_log.activity_log_id"));
        for(Object[] rec : records) {
            if (rec[0] != null) {
                new WorkRequestHandler().archiveWorkRequest(getIntegerValue(context, rec[0]).intValue());
            }
        }
        
        // fix KB3031078 - Update Help Desk WFRs to use DataSource API instead of
        // executeDbDelete(Guo 2011/4/18)
        final DataSource dataSource = DataRecord.createDataSourceForRecord(record);
        final Map values = fromJSONObject(record);
        dataSource.deleteRecord(values);
        // EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // Map fieldValues = parseJSONObject(context, record);
        // Map values = stripPrefix(fieldValues);
        
        // executeDbDelete(context, Constants.ACTION_ITEM_TABLE, values);
        // executeDbCommit(context);
    }
    
    /**
     * Forward approval. forward by business mgr to someone else
     * 
     * 
     * @param record : service request to approval
     * @param comments : comments for the request
     * @param forwardTo : the approval manager
     */
    public void forwardApproval(final JSONObject record, final String comments,
            final String forwardTo) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        // fields of activity_log
        final Map values =
                stripPrefix(filterWithPrefix(fieldValues, Constants.ACTION_ITEM_TABLE + "."));
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        final int stepLogId =
                getIntegerValue(context, fieldValues.get("activity_log_step_waiting.step_log_id"))
                    .intValue();
        
        this.log.debug("Forward Approval for " + stepLogId + " to " + forwardTo);
        
        final StepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.forwardStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"), forwardTo);
    }
    
    /**
     * Forward Request to new Service Provider.
     * 
     * A forward step is invoked to re-assign the request to a new service provider.
     * 
     * @param context
     */
    public void forwardRequest(final EventHandlerContext context) {
        final int activity_log_id = context.getInt("activity_log_id");
        
        // save record values such as cost info etc.
        if (context.getParameters("fields") != null && !context.getParameters("fields").isEmpty()) {
            executeDbSave(context, Constants.ACTION_ITEM_TABLE,
                stripPrefix(context.getParameters("fields")));
            //executeDbCommit(context);
        }
        
        final String vn_id = context.getString("vn_id");
        final String em_id = context.getString("em_id");
        
        final String dispatcher = context.getString("dispatcher");
        final String supervisor = context.getString("supervisor");
        
        final String cf_id = context.getString("cf_id");
        
        Forward forwardStep = null;
        
        if (vn_id != null && !vn_id.equals("")) {
            forwardStep =
                    new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                        Forward.STEP_FORWARD_VENDOR, vn_id);
        } else if (em_id != null && !em_id.equals("")) {
            forwardStep =
                    new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                        Forward.STEP_FORWARD_EMPLOYEE, em_id);
        } else if (dispatcher != null && !dispatcher.equals("")) {
            forwardStep =
                    new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                        Forward.STEP_FORWARD_DISPATCHER, dispatcher);
        } else if (supervisor != null && !supervisor.equals("")) {
            forwardStep =
                    new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                        Forward.STEP_FORWARD_SUPERVISOR, supervisor);
        } else if (cf_id != null && !cf_id.equals("")) {
            forwardStep =
                    new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                        Forward.STEP_FORWARD_CRAFTSPERSON, cf_id);
        } else {
            
            final String msg = "Assignee missing in Forward Step";
            throw new HelpdeskException(msg);
        }
        
        if (forwardStep != null) {
            forwardStep.invoke();
        }
        
        
        Object wrObject =
                selectDbValue(context, Constants.WORK_REQUEST_TABLE, "wr_id","wr.activity_log_id = "+activity_log_id);
        if(wrObject!=null) {
            // add to fix KB3029391, update work team from supervisor
            final WorkRequestHandler handler = new WorkRequestHandler();
            handler.updateWorkTeamFromSupervisor();
            handler.syncDispatchValues(getIntegerValue(context, wrObject));
        }
    }
    
    /**
     * Get employee location: site_id, bl_id,fl_id,rm_id based on em_id
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     *            <p>
     *            <b>Inputs:</b>
     *            <ul>
     *            <li>em_id : employee code</li>
     *            </ul>
     *            </p>
     *            <p>
     *            <b>Outputs:</b>
     *            <ul>
     *            <li>jsonExpression : JSONObject with site_id, bl_id, fl_id, rm_id<br />
     *            <code>{site_id: ?, bl_id: ?, fl_id: ?, rm_id: ?}</code></li>
     *            </ul>
     *            </p>
     *            <p>
     *            <b>Pseudo-code:</b>
     *            <ol>
     *            <li>Get primary location parameters from employee table</li>
     *            <li>Get site code for the building</li>
     *            <li>Put results in a JSON expression and return</li>
     *            </ol>
     *            </p>
     */
    public void getEmployeeLocation(final String em_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        if (em_id.equalsIgnoreCase("null")) {
            // @translatable
            final String errorMessage = localizeString(context, "No employee in context found");
            throw new ExceptionBase(errorMessage, true);
        }
        
        final String[] fieldNames = { "bl_id", "fl_id", "rm_id" };
        final Object[] values =
                selectDbValues(context, "em", fieldNames, "em_id = " + literal(context, em_id));
        
        if (values != null) {
            final String bl_id = notNull(values[0]);
            final String fl_id = notNull(values[1]);
            final String rm_id = notNull(values[2]);
            
            final Object site =
                    selectDbValue(context, "bl", "site_id", "bl_id = " + literal(context, bl_id));
            
            final String site_id = notNull(site);
            
            // create JSON object
            final JSONObject location = new JSONObject();
            location.put("bl_id", bl_id);
            location.put("fl_id", fl_id);
            location.put("rm_id", rm_id);
            location.put("site_id", site_id);
            
            context.addResponseParameter("jsonExpression", location.toString());
        } // end if
        
    }
    
    /**
     * Retrieves information about the current requestor (em) from the database.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>em_id : employee code for requestor</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSON object with site_id, bl_id, fl_id, rm_id, phone, dv_id and dp_id<br />
     * <code>{em_id: <i>requestor</i>, phone: ?, dv_id: ?, dp_id: ?, em_std: ?, bl_id: ?, fl_id: ?,rm_id: ?,site_id: ?}</code>
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Retrieve parameters from employee table</li>
     * <li>Retrieve site code using the building code</li>
     * <li>Create jsonExpression and return</li>
     * </ol>
     * </p>
     * <p>
     * 
     */
    public void getRequestorInformation(final String em_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String[] fields =
                { "em_id", "phone", "dv_id", "dp_id", "em_std", "bl_id", "fl_id", "rm_id" };
        
        // get employee parameters
        final Object[] record =
                selectDbValues(context, "em", fields, "em_id = " + literal(context, em_id));
        final JSONObject json = new JSONObject();
        if (record != null) {
            for (int i = 0; i < fields.length; i++) {
                json.put(fields[i], record[i]);
            }
            if (json.has("bl_id") && json.getString("bl_id") != null) {
                // get the site id
                final String site_id =
                        notNull(selectDbValue(context, "bl", "site_id",
                            "bl_id = " + literal(context, json.getString("bl_id"))));
                json.put("site_id", site_id);
            }
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * This method serve as a WFR to check to get Service Provider.
     * 
     * @param context: Event handler context.
     * 
     */
    public void getServiceProvider(final int activityLogId) {
        String serviceProvider = "";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, "activity_log", "activity_log_id",
                    activityLogId);
        
        if (sla != null) {
            if (StringUtil.notNullOrEmpty(sla.getResponseStringParameter("em_id"))) {
                serviceProvider = sla.getResponseStringParameter("em_id");
            } else if (StringUtil.notNullOrEmpty(sla.getResponseStringParameter("vn_id"))) {
                serviceProvider = sla.getResponseStringParameter("vn_id");
            } else if (StringUtil.notNullOrEmpty(sla.getResponseStringParameter("activity_id"))) {
                serviceProvider = sla.getResponseStringParameter("activity_id");
            }
        }
        
        final JSONObject returnObject = new JSONObject();
        returnObject.put("serviceProvider", serviceProvider);
        context.addResponseParameter("jsonExpression", returnObject.toString());
    }
    
    /**
     * Issue request.<br />
     * A request with status 'APPROVED' and step status null can be issued by the assignee (employee
     * or vendor). This sets the status of the request to 'IN PROGRESS'.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : help request --the form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get help request values</li>
     * <li>Save updated help request</li>
     * <li>Update the status and date issued of the request with
     * {@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) status manager}</li>
     * </ol>
     * </p>
     */
    public void issueRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        //executeDbCommit(context);
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        
        final StatusManager manager = new HelpdeskStatusManager(context, activity_log_id);
        manager.updateStatus("IN PROGRESS");
    }
    
    /**
     * Check if the request is from new Operation Console. 
     * @param activity_log_id
     */
    public boolean isOperationConsole(final int activity_log_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final boolean useBldgOpsConsole = getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID, "UseBldgOpsConsole").intValue() > 0;
        
        if(useBldgOpsConsole) {
            final String sql = "SELECT activity_log_id FROM " + Constants.ACTION_ITEM_TABLE 
                            + " WHERE activity_log_id = " + activity_log_id
                            + " AND activity_type = 'SERVICE DESK - MAINTENANCE'";
            
            final List records = selectDbRecords(context, sql);
            if (!records.isEmpty()) {
                return true;
            }else {
                return false;
            }
            
        }else {
            return false;
        }
    }
    
    /**
     * Notify requestor when request has been updated.<br />
     * This workflow rule is called by the {@link StatusManager statusmanager} if the status of a
     * request has been changed and the SLA indicates that the requestor should be notified.<br />
     * For the email subject and body translatable messages are used from the <code>messages</code>
     * table with <code>message_id</code> NOTIFY_REQUESTOR_TITLE or NOTIFY_REQUESTOR_TEXT,
     * <code>activity_id</code> AbBldgOpsHelpDesk and <code>referenced_by</code>
     * NOTIFY_REQUESTOR_WFR
     * <p>
     * <b>Inputs</b>
     * <ul>
     * <li>activity_log.activity_log_id : help request id</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get request id from context</li>
     * <li>Get requestor email from the database</li>
     * <li>Create and send message to the requestor</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void notifyRequestor(final EventHandlerContext context) {
        
        String sql = null;
        
        if (context.parameterExists("activity_log.activity_log_id")) {
            final int activity_log_id = context.getInt("activity_log.activity_log_id");
            
            // select requestor data
            sql =
                    "SELECT A.requestor, E.email, A.activity_log_id, A.status, A.wr_id FROM "
                            + Constants.ACTION_ITEM_TABLE + " A, em E "
                            + "WHERE A.activity_log_id = " + activity_log_id
                            + " AND E.em_id = A.requestor";
            
            final List records = selectDbRecords(context, sql);
            if (!records.isEmpty()) {
                final Object[] rec = (Object[]) records.get(0);
                if (StringUtil.notNullOrEmpty(rec[1])) {// check if email is not null
                    final Message message = new Message(context);
                    message.setMailTo(notNull(rec[1]));
                    
                    //V21.2 - for new Operation Console, notify user work request information 
                    if(this.isOperationConsole(activity_log_id)) {
                        //get activity_log.wr_id
                        Integer wrId = getIntegerValue(context, rec[4]);
                        if(wrId == null) {
                            //KB3042457 - if no activity_log.wr_id, get wr.wr_id where wr.activity_log_id = [activity_log_id]
                            wrId = this.getWrIdByActivityLogId(activity_log_id);
                        }
                        
                        if(wrId != null) {
                            final StringBuffer link = new StringBuffer(getWebCentralPath(context));
                            if("CLOSED".equals(rec[3])) {
                                link.append("/"
                                        + getActivityParameterString(context,
                                            Constants.ONDEMAND_ACTIVITY_ID, "Closed_View"));
                            }else {
                                link.append("/ab-bldgops-console.axvw");
                                link.append("?wr_id=" + wrId);
                            }
                            
                            message.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
                            message.setReferencedBy("NOTIFY_REQUESTOR_WFR");
                            message.setBodyMessageId("NOTIFY_REQUESTOR_TEXT");
                            message.setSubjectMessageId("NOTIFY_REQUESTOR_TITLE");
                            
                            if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                                final Map<String, Object> dataModel =
                                        MessageHelper.getRequestDatamodel(context, "wr",
                                            "wr_id", wrId);
                                dataModel.put("link", link);
                                message.setDataModel(dataModel);
                            }
                            
                            if (!message.isBodyRichFormatted()) {
                                message.setBodyArguments(new Object[] { link });
                            }
                            
                            if (!message.isSubjectRichFormatted()) {
                                message.setSubjectArguments(new Object[] { Common.getStatusValue(context,
                                    Constants.WORK_REQUEST_TABLE, "wr_id", wrId) });
                            }
                        }
                        
                    }else {
                        final StringBuffer link = new StringBuffer(getWebCentralPath(context));
                        link.append("/"
                                + getActivityParameterString(context, Constants.HELPDESK_ACTIVITY_ID,
                                    "VIEW_VIEW"));
                        link.append("?activity_log_id=" + activity_log_id);
                        
                        message.setActivityId(Constants.HELPDESK_ACTIVITY_ID);
                        message.setReferencedBy("NOTIFY_REQUESTOR_WFR");
                        message.setBodyMessageId("NOTIFY_REQUESTOR_TEXT");
                        message.setSubjectMessageId("NOTIFY_REQUESTOR_TITLE");
                        
                        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                            final Map<String, Object> dataModel =
                                    MessageHelper.getRequestDatamodel(context, "activity_log",
                                        "activity_log_id", activity_log_id);
                            dataModel.put("link", link);
                            message.setDataModel(dataModel);
                        }
                        if (!message.isBodyRichFormatted()) {
                            message.setBodyArguments(new Object[] { link });
                        }
                        if (!message.isSubjectRichFormatted()) {
                            message.setSubjectArguments(new Object[] { Common.getStatusValue(context,
                                Constants.ACTION_ITEM_TABLE, "activity_log_id", activity_log_id) });
                        }
                    }
                    
                    message.format();
                    message.sendMessage();
                }
            }
            
        } else {
            // @translatable
            final String errorMessage = localizeString(context, "no activity_log_id in context");
            throw new ExceptionBase(errorMessage, true);
        }
    }
    
    /**
     * Get work request code base on given activity log code.
     * 
     * @param activityLogId activity log code
     */
    private Integer getWrIdByActivityLogId(final int activityLogId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String sql = "SELECT wr.wr_id FROM wr WHERE wr.activity_log_id = " + activityLogId;
        
        final List records = selectDbRecords(context, sql);
        if (!records.isEmpty()) {
            final Object[] rec = (Object[]) records.get(0);
            return getIntegerValue(context, rec[0]);
        }else {
            return null;
        }
    }
    
    /**
     * Notify service providers if a request is assigned to them.
     * 
     * @param context
     * @param activity_log_id id of the request assigned to them
     */
    public void notifyServiceProvider(final EventHandlerContext context, final int activity_log_id) {
        final Message message = new Message(context);
        
        message.setActivityId(Constants.HELPDESK_ACTIVITY_ID);
        message.setReferencedBy("UPDATEREQUEST_WFR");
        message.setBodyMessageId("NOTIFY_ASSIGNEE_TEXT");
        message.setSubjectMessageId("NOTIFY_ASSIGNEE_TITLE");
        
        final String link =
                getWebCentralPath(context)
                        + "/"
                        + getActivityParameterString(context, Constants.HELPDESK_ACTIVITY_ID,
                            "UPDATE_VIEW");
        final Map<String, Object> datamodel =
                MessageHelper.getRequestDatamodel(context, "activity_log", "activity_log_id",
                    activity_log_id);
        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
            datamodel.put("link", link);
            message.setDataModel(datamodel);
        }
        if (!message.isBodyRichFormatted()) {
            message.setBodyArguments(new Object[] { link });
        }
        
        message.format();
        
        String email = null;
        final Object[] serviceProviders =
                selectDbValues(context, "activity_log", new String[] { "assigned_to", "vn_id" },
                    "activity_log_id = " + activity_log_id);
        if (serviceProviders != null) {
            if (StringUtil.notNullOrEmpty(serviceProviders[0])) {
                final String assignedTo = notNull(serviceProviders[0]);
                email =
                        (String) selectDbValue(context, "em", "email",
                            "em_id = " + literal(context, assignedTo));
                message.setMailTo(email);
                message.setNameto(assignedTo);
                
                // fix KB 3023429 - also notify substitutes of the service provider (EC 2012/7/10)
                // create a different message for these substitutes
                final List<String> substitutes =
                        StepHandler.getWorkflowEmSubstitutes(context, assignedTo, "acceptance");
                if (!substitutes.isEmpty()) {
                    final Message messageForSubstitutes = new Message(context);
                    
                    messageForSubstitutes.setActivityId(Constants.HELPDESK_ACTIVITY_ID);
                    messageForSubstitutes.setReferencedBy("UPDATEREQUEST_WFR_SUBSTITUTE");
                    messageForSubstitutes.setBodyMessageId("NOTIFY_ASSIGNEE_TEXT");
                    messageForSubstitutes.setSubjectMessageId("NOTIFY_ASSIGNEE_TITLE");
                    
                    if (messageForSubstitutes.isBodyRichFormatted()
                            || messageForSubstitutes.isSubjectRichFormatted()) {
                        messageForSubstitutes.setDataModel(datamodel);
                    }
                    if (!messageForSubstitutes.isBodyRichFormatted()) {
                        messageForSubstitutes.setBodyArguments(new Object[] { link });
                    }
                    
                    messageForSubstitutes.format();
                    
                    for (final String substitute : substitutes) {
                        messageForSubstitutes.setNameto(substitute);
                        messageForSubstitutes.setMailTo(getEmailAddress(context, substitute));
                        messageForSubstitutes.sendMessage();
                        
                    }
                }
            } else if (StringUtil.notNullOrEmpty(serviceProviders[1])) {
                email = getEmailAddressForVendor(context, (String) serviceProviders[1]);
                message.setMailTo(email);
                message.setNameto((String) serviceProviders[1]);
            }
        }
        message.sendMessage();
    }
    
    /**
     * Reject the help request by manager when approval step is active.<br/>
     * Rejection of a request will always change the basic status to 'REJECTED' <br/>
     * This will end the process flow of the request.<br/>
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : help request -- the form values submitted</li>
     * <li>comments : request comments</li>
     * </ul>
     * </p>
     * <b>Outputs:</b>
     * <ul>
     * <li>activity_log_id : Service Request Id of rejected request (to archive)</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get help request values</li>
     * <li>Get step values</li>
     * <li>Save help request</li>
     * <li>
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#rejectStep(EventHandlerContext, int, int, String)
     * Reject approval step}</li>
     * <li>{@link #archiveRequest(EventHandlerContext) Archive rejected request}</li>
     * </ol>
     * </p>
     */
    public void rejectRequest(final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        // fields of activity_log_step_waiting
        final Map stepValues =
                stripPrefix(filterWithPrefix(fieldValues, "activity_log_step_waiting"));
        // fields of activity_log
        final Map values =
                stripPrefix(filterWithPrefix(fieldValues, Constants.ACTION_ITEM_TABLE + "."));
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        //executeDbCommit(context);
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        
        final int stepLogId = getIntegerValue(context, stepValues.get("step_log_id")).intValue();
        
        rejectStep(context, activity_log_id, stepLogId, comments);
        
        //KB3041840 - when reject service request, remove work request as well
        final List<Object[]> records = selectDbRecords(context, "SELECT wr_id FROM wr WHERE activity_log_id =" + activity_log_id);
        for(Object[] rec : records) {
            if (rec[0] != null) {
                new WorkRequestHandler().archiveWorkRequest(getIntegerValue(context, rec[0]).intValue());
            }
        }
        
        context.addResponseParameter("activity_log_id", new Integer(activity_log_id));
        archiveRequest(Integer.toString(activity_log_id), record);
    }
    
    /**
     * Return request as incomplete (on verification).<br />
     * Set status back to issued.<br />
     * The requestor can verify the result and re-issue the request if needed
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSONObject of field values for action item -- form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Convert the record to map type from JSONObject</li>
     * <li>Update the <code>activity_log</code> table with updated values</li>
     * <li>Set the status back to 'IN PROGRESS' to return request to assignee with
     * {@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) status manager}</li>
     * </ol>
     * </p>
     */
    public void returnRequestIncomplete(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        // reject the verification step
        final int activity_log_id =
                getIntegerValue(context,
                    fieldValues.get("activity_log_step_waiting.activity_log_id")).intValue();
        final int stepLogId =
                ((Integer) fieldValues.get("activity_log_step_waiting.step_log_id")).intValue();
        final String comments = notNull(fieldValues.get("activity_log_step_waiting.comments"));
        
        final HelpdeskStepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.reissueStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }
    
    /**
     * Review request. The manager can review a help request when an review step is active
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Get help request values from inputs</li>
     * <li>Get step values from inputs</li>
     * <li>Save help request</li>
     * <li>
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Confirm approval}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void reviewRequest(final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        // fields of activity_log
        final Map values =
                stripPrefix(filterWithPrefix(fieldValues, Constants.ACTION_ITEM_TABLE + "."));
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        
        // translate to labels?
        final List changedFields = checkRequestChanged(context,Constants.ACTION_ITEM_TABLE,"activity_log_id", activity_log_id, values);
        
        if (!changedFields.isEmpty()) {
            // get the existing SLA on database values
            final ServiceLevelAgreement oldSla =
                    ServiceLevelAgreement.getInstance(context, Constants.ACTION_ITEM_TABLE,
                        "activity_log_id", activity_log_id);
            // overwrite values with new values
            executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
            //executeDbCommit(context);
            
            // get new SLA, by using the constructor we are sure to reload the new SLA
            final ServiceLevelAgreement sla =
                    new ServiceLevelAgreement(context, Constants.ACTION_ITEM_TABLE,
                        "activity_log_id", activity_log_id);
            
            // if sla's are different
            if (!(sla.equals(oldSla))) {
                //KB3032155 - update Escalation times base on the new sla
                context.addResponseParameter("activity_log.activity_log_id", new Integer(activity_log_id));
                updateRequestParametersFromSLA(context);
                // KB3046950 - approved service request does not update the associated wr record.
                final String activityType = notNull(values.get("activity_type"));
                if ("SERVICE DESK - MAINTENANCE".equals(activityType)) {
                    updateWorkRequestFromServiceRequestRecord(activity_log_id);
                }
                
                // changed request matches other service level agreement
                final HelpdeskStepManager stepmgr =
                        new HelpdeskStepManager(context, activity_log_id);
                
                final String user_name =
                        getParentContextAttributeXPath(context, "/*/preferences/@user_name");
                
                // @translatable
                String message =
                        prepareMessage(context, "Request has been reviewed for fields {0}",
                            new String[] { changedFields.toString() });
                
                //KB3040465 - add user comments to the end
                if(StringUtil.notNullOrEmpty(comments)) {
                    message += " Comments: " + comments;
                }
                
                if (sla.isAutoapprove()) {// end pending approval steps and set status to approved
                    stepmgr.endAllPendingSteps(message, user_name);
                    final HelpdeskStatusManager statusmgr =
                            new HelpdeskStatusManager(context, activity_log_id);
                    statusmgr.updateStatus("APPROVED");
                } else {
                    // TODO check if the new SLA has an Edit & Approve step
                    // if so, start the new SLA from the first step after this Edit & Approve step,
                    // otherwise start new SLA from first step
                    // restart (new) workflow with new SLA
                    stepmgr.endAllPendingSteps(message, user_name);
                    
                    final Map step = sla.hasStepOfType("REQUESTED", "review");
                    if (step != null) {
                        // get step order of Edit & Approve step
                        final int stepOrder = (Integer) step.get("step_order");
                        stepmgr.setStepOrder(stepOrder);
                        
                        // start first step after Edit & Approve step
                        stepmgr.invokeNextStep();
                    } else {
                        stepmgr.invokeFirstStep();
                    }
                }
            } else { // sla not changed, just approve
                final int stepLogId =
                        ((Integer) fieldValues.get("activity_log_step_waiting.step_log_id"))
                            .intValue();
                confirmStep(context, stepLogId, activity_log_id, comments);
            }
        } else { // request parameters are not changed
            executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
            //executeDbCommit(context);
            final int stepLogId =
                    ((Integer) fieldValues.get("activity_log_step_waiting.step_log_id")).intValue();
            confirmStep(context, stepLogId, activity_log_id, comments);
        }
    }
    
    /**
     * Update work request from service request record. 
     * @param activityLogId  activityLogId
     */
    private void updateWorkRequestFromServiceRequestRecord(final int activityLogId) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String[] fields =
                { "wr_id", "site_id", "bl_id", "fl_id", "rm_id", "dv_id", "dp_id", "ac_id",
                        "location", "eq_id", "prob_type", "priority", "description", "manager",
                        "supervisor", "dispatcher", "work_team_id", "date_escalation_completion",
                        "time_escalation_completion", "date_escalation_response",
                        "time_escalation_response", "escalated_response", "escalated_completion" };
        
        final Object[] object =
                selectDbValues(context, Constants.ACTION_ITEM_TABLE, fields, "activity_log_id = "
                        + activityLogId);
        if (getIntegerValue(context, object[0]).intValue() > 0) {
            final Map values = new HashMap();
            for (int i = 0; i < fields.length; i++) {
                values.put(fields[i], object[i]);
            }
            
            // overwrite values with new values
            executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);
            //executeDbCommit(context);
        }
    }
    
    /**
     * Save request record.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : help request --the form fields submitted</li>
     * </ul>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : Id of saved record</li>
     * </ul>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>If the record already has an id, just save in <code>activity_log</code> <br />
     * &nbsp;&nbsp;Else put <code>date_requested</code> on current date, <code>status</code> on
     * 'CREATED' and <code>created_by</code> on current user and save the new record in
     * <code>activity_log</code></li>
     * <li>Put activity_log_id of new or updated record in context and return</li>
     * </ol>
     * <p>
     */
    public void saveRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        Map values = stripPrefix(fieldValues);
        Integer activity_log_id;
        
        // save (update or insert)
        if (values.get("activity_log_id") != null) {
            activity_log_id = getIntegerValue(context, values.get("activity_log_id"));
            executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
            //executeDbCommit(context);
            context.addResponseParameter("activity_log.activity_log_id", activity_log_id);
            
            //KB3032155 - update Escalation times base on the new sla
            updateRequestParametersFromSLA(context);
            
        } else { // create new record
            final String blId = notNull(values.get("bl_id"));
            final String siteId = notNull(values.get("site_id"));
            
            final Date currentLocalDate =
                    LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
            final Time currentLocalTime =
                    LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
            
            values.put("date_requested", currentLocalDate);
            values.put("time_requested", currentLocalTime);
            
            values.put("status", "CREATED");
            values.put("created_by",
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
            
            executeDbAdd(context, Constants.ACTION_ITEM_TABLE, values);
            //executeDbCommit(context);
            
            values = new HashMap();
            values.put("date_requested", currentLocalDate);
            values.put("created_by",
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
            activity_log_id =
                    new Integer(Common.getMaxId(context, "activity_log", "activity_log_id",
                        getRestrictionFromValues(context, values)));
            context.addResponseParameter("activity_log.activity_log_id", activity_log_id);
        }
        
        final JSONObject json = new JSONObject();
        json.put("activity_log_id", activity_log_id);
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * Save satisfaction survey.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : the form values submitted</li>
     * </ul>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get field values</li>
     * <li>Set date verified</li>
     * <li>Save request</li>
     * <li>Get email and employee code of current user using macro xpath</li>
     * <li>
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Confirm survey step} using step manager</li>
     * </ol>
     * <p>
     */
    public void saveSatisfaction(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        // save satisfaction fields of activity_log
        final Map values =
                stripPrefix(filterWithPrefix(fieldValues, Constants.ACTION_ITEM_TABLE + "."));
        if (fieldValues.get("activity_log_step_waiting.activity_log_id") == null) {
            values.put("activity_log_id", fieldValues.get("activity_log.activity_log_id"));
        } else {
            values.put("activity_log_id",
                fieldValues.get("activity_log_step_waiting.activity_log_id"));
        }
        
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        //executeDbCommit(context);
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        final int stepLogId =
                getIntegerValue(context, fieldValues.get("activity_log_step_waiting.step_log_id"))
                    .intValue();
        
        confirmStep(context, stepLogId, activity_log_id, notNull(values.get("satisfaction_notes")));
    }
    
    /**
     * searchServiceRequests
     * 
     * @param filter : search restriction object
     */
    public void searchServiceRequests(final JSONObject filter) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String[] fields =
                { "activity_log_id", "activity_type", "prob_type", "priority", "date_requested",
                        "date_completed", "requestor", "priority", "ac_id", "dv_id", "dp_id",
                        "status", "site_id", "bl_id", "fl_id", "rm_id", "eq_id", "assigned_to",
                        "vn_id", "date_escalation_response", "date_escalation_completion",
                        "escalated_response", "escalated_completion", "wr_id", "wo_id",
                        "description", "manager" };
        
        // KB 3023429 - take substitutes into account,the substitute of the Service
        // Desk Manager should also see the request of the person he's substitute for (EC 2012/7/10)
        final StringBuffer sql =
                new StringBuffer(
                    "SELECT DISTINCT a.* "
                            + " FROM activity_log_hactivity_log a LEFT OUTER JOIN wrhwr w ON a.wr_id = w.wr_id or a.wo_id = w.wo_id "
                            + " WHERE a.activity_type like 'SERVICE DESK%' AND a.status != 'N/A' AND a.status != 'CREATED'"
                            + " AND (a.manager = "
                            + literal(context,
                                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"))
                            + " OR a.manager IN (SELECT em_id FROM workflow_substitutes WHERE "
                            + " workflow_substitutes.em_id = a.manager AND workflow_substitutes.substitute_em_id = "
                            + literal(context,
                                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"))
                            + " AND workflow_substitutes.steptype_or_role='manager'"
                            + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                            + Common.getCurrentLocalDate(null, null, null, null)
                            + ")"
                            + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                            + Common.getCurrentLocalDate(null, null, null, null) + ")))");
        
        appendRestriction(context, sql, filter, "activity_type");
        appendRestriction(context, sql, filter, "prob_type");
        appendRestriction(context, sql, filter, "requestor");
        
        appendStatusRestriction(context, sql, filter); // activity_log status ??
        
        appendRestriction(context, sql, filter, "site_id");
        appendRestriction(context, sql, filter, "bl_id");
        appendRestriction(context, sql, filter, "fl_id");
        appendRestriction(context, sql, filter, "rm_id");
        
        appendRestriction(context, sql, filter, "eq_id");
        
        appendRestriction(context, sql, filter, "vn_id");
        appendRestriction(context, sql, filter, "assigned_to");
        
        appendRestriction(context, sql, filter, "w", "supervisor");
        appendRestriction(context, sql, filter, "w", "work_team_id");
        
        // use alias of activity_log table (as used in the query)
        appendRestrictionDateInterval(context, sql, filter, "a", "date_requested");
        appendRestrictionDateInterval(context, sql, filter, "a", "date_escalation_response");
        appendRestrictionDateInterval(context, sql, filter, "a", "date_escalation_completion");
        
        if (filter.has("escalated_response")) {
            sql.append(" AND a.escalated_response = 1");
        }
        
        if (filter.has("escalated_completion")) {
            sql.append(" AND a.escalated_completion = 1");
        }
        
        if (filter.has("activity_log_id")) {
            sql.append(" AND a.activity_log_id = " + filter.getInt("activity_log_id"));
        }
        
        if (filter.has("wr_id")) {
            sql.append(" AND w.wr_id = " + filter.getInt("wr_id"));
        }
        
        if (filter.has("wo_id")) {
            sql.append(" AND w.wo_id = " + filter.getInt("wo_id"));
        }
        
        if (filter.has("eq.eq_std")) {
            sql.append(" AND EXISTS (SELECT eq_id FROM eq WHERE a.eq_id = eq.eq_id AND eq_std =  "
                    + literal(context, filter.getString("eq.eq_std")) + ")");
        }
        
        if (filter.has("wrcf.cf_id")) {
            sql.append(" AND EXISTS (SELECT cf_id FROM wrcf WHERE w.wr_id = wrcf.wr_id AND wrcf.cf_id = "
                    + literal(context, filter.getString("wrcf.cf_id")) + ")");
        }
        
        if (filter.has("tr_id")) {
            sql.append(" AND (w.tr_id = " + literal(context, filter.getString("tr_id"))
                    + " OR EXISTS (SELECT tr_id FROM wrtr WHERE w.wr_id = wrtr.wr_id "
                    + " AND wrtr.tr_id = " + literal(context, filter.getString("tr_id")) + ") "
                    + " OR EXISTS (SELECT cf_id FROM wrcf WHERE w.wr_id = wrcf.wr_id "
                    + " AND ( wrcf.scheduled_from_tr_id = "
                    + literal(context, filter.getString("tr_id"))
                    + " OR wrcf.cf_id IN (SELECT cf_id FROM cf WHERE tr_id = "
                    + literal(context, filter.getString("tr_id")) + ") " + ") ) )");
        }
        
        if (filter.has("open_steps")) {
            sql.append(" AND ( a.activity_log_id IN (SELECT activity_log_id FROM activity_log_step_waiting)"
                    + " OR w.wr_id IN (SELECT wr_id FROM wr_step_waiting))");
        }
        
        if (filter.has("not_closed")) {
            sql.append(" AND a.status != 'CLOSED'");
        }
        
        // sql.append(" ORDER BY a.activity_type, a.activity_log_id ");
        
        // KB3023737
        final DataSource searchDS = DataSourceFactory.createDataSource();
        searchDS.addTable("activity_log_hactivity_log");
        searchDS.addField(fields);
        searchDS.addSort("activity_type");
        searchDS.addSort("activity_log_id");
        searchDS.addQuery(sql.toString());
        // fix KB3030760 - set record limit to 100 to improve the performance(Guo 2011/4/12)
        searchDS.setMaxRecords(100);
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(searchDS.getRecords());
        dataSet.setHasMoreRecords(searchDS.hasMoreRecords());
        context.setResponse(dataSet);
    }
    
    /**
     * Stop help request (by employee) using the status manager.
     * 
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     *            <p>
     *            <b>Inputs:</b> record : help request -- the form values submitted
     *            </p>
     *            <p>
     *            <b>Pseudo-code:</b>
     *            <ol>
     *            <li>Get help request values</li>
     *            <li>Save updated help request</li>
     *            <li>Update the status of the request with
     *            {@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) status
     *            manager} to 'Stopped'</li>
     *            </ol>
     *            </p>
     */
    public void stopRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        //executeDbCommit(context);
        
        final int activity_log_id =
                getIntegerValue(context, values.get("activity_log_id")).intValue();
        
        final StatusManager statusManager = new HelpdeskStatusManager(context, activity_log_id);
        statusManager.updateStatus("STOPPED");
    }
    
    /**
     * Save and submit request.<br />
     * Saves the record, updates it according to the SLA it matches and sets the status to
     * 'REQUESTED'
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * <li>sActivityLogId <i>optional</i> : id of record (if already saved)</li>
     * <ul>
     * </p>
     * 
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : id of new or updated record</li>
     * <li>jsonExpression : JSONObject with id of new or updated record<br />
     * <code>{activity_log_id : <i>id</i>}</code></li>
     * </ul>
     * </p>
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from record</li>
     * <li>If context contains <code>activity_log.activity_log_id</code> and this is not 0, save
     * record in <code>activity_log</code> <br />
     * &nbsp;&nbsp;Else set <code>created_by</code> to current user and add record to
     * <code>activity_log</code></li>
     * <li>Add parameters to context</li>
     * <li>
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#updateRequestParametersFromSLA(com.archibus.jobmanager.EventHandlerContext)
     * Update request parameters from SLA }</li>
     * <li>Update status to 'REQUESTED' with the
     * {@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) Statusmanager}</li>
     * </ol>
     * </p>
     */
    public void submitRequest(final String sActivityLogId, final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // save form
        final Map fieldValues = parseJSONObject(context, record);
        Map values = stripPrefix(fieldValues);
        
        // kb3026417 -- kevin added, this param used in checkCondAssessmentInProgress method
        context.addInputParameter("fields", values);
        
        int activity_log_id = 0;
        if (!sActivityLogId.equals("null") && !sActivityLogId.equals("")) {
            activity_log_id = Integer.parseInt(sActivityLogId);
        }
        
        if (activity_log_id == 0) { // add
            values.remove("activity_log_id");
            
            final String siteId = notNull(values.get("site_id"));
            final String blId = notNull(values.get("bl_id"));
            
            final Date currentLocalDate =
                    LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
            final Time currentLocalTime =
                    LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
            
            values.put("date_requested", currentLocalDate);
            values.put("time_requested", currentLocalTime);
            values.put("status", "CREATED");
            values.put("created_by",
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
            executeDbAdd(context, Constants.ACTION_ITEM_TABLE, values);
            //executeDbCommit(context); // always commit when add
            
            values = new HashMap();
            values.put("date_requested", currentLocalDate);
            values.put("created_by",
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
            activity_log_id =
                    Common.getMaxId(context, Constants.ACTION_ITEM_TABLE, "activity_log_id",
                        getRestrictionFromValues(context, values));
        } else { // update
        
            executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
            //executeDbCommit(context);
        }
        
        context.addResponseParameter("activity_log.activity_log_id", new Integer(activity_log_id));
        
        final JSONObject json = new JSONObject();
        json.put("activity_log_id", activity_log_id);
        context.addResponseParameter("jsonExpression", json.toString());
        
        updateRequestParametersFromSLA(context);
        // update status
        final StatusManager statusManager = new HelpdeskStatusManager(context, activity_log_id);
        statusManager.updateStatus("REQUESTED");
    }
    
    /**
     * Submit mobile request.<br />
     * Updates the request according to the SLA it matches and sets the status to 'REQUESTED'
     * Variation of SubmitRequest method. Added by Constantine Kriezis for Maintenance Mobile
     * Application. <li>Add parameters to context</li> <li>
     * {@link com.archibus.eventhandler.helpdesk.RequestHandler#updateRequestParametersFromSLA(com.archibus.jobmanager.EventHandlerContext)
     * Update request parameters from SLA }</li> <li>Update status to 'REQUESTED' with the
     * {@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) Statusmanager}</li>
     * </ol> </p>
     */
    public void submitMobileRequest(final int activity_log_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        context.addResponseParameter("activity_log.activity_log_id", activity_log_id);
        
        final JSONObject json = new JSONObject();
        json.put("activity_log_id", activity_log_id);
        context.addResponseParameter("jsonExpression", json.toString());
        
        updateRequestParametersFromSLA(context);
        
        // update status
        final StatusManager statusManager = new HelpdeskStatusManager(context, activity_log_id);
        statusManager.updateStatus("REQUESTED");
    }
    
    /**
     * 
     * Update request after escalation (by FIM).<br />
     * If an escalation has been fired for a request the FIM can change the status of the request
     * and/or the service provider: employee or vendor for helpdesk, dispatcher, supervisor,
     * craftsperson for on demand
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sActivityLogId : help request id</li>
     * <li>status : help request status</li>
     * <li>assignedTo : help request employee</li>
     * <li>vendorId : help request vendor</li>
     * <li>supervisor1 : work request supervisor</li>
     * <li>dispatcher1 : help request dispatcher</li>
     * <li>workTeam1 : help request work team</li>
     * <li>record : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from record, and same fields from activity log record</li>
     * <li>If the status is changed : use the {@link StatusManager status manager} to update the
     * request status</li>
     * <li>If assigned_to or vendor is changed : reassign the help request</li>
     * <li>If dispatcher is changed : start new dispatch step</li>
     * </ol>
     * </p>
     */
    
    public void updateRequest(final String sActivityLogId, final String status,
            final String assignedTo, final String vendorId, final String supervisor1,
            final String dispatcher1, final String workTeam1, final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        int activity_log_id = 0;
        if (!sActivityLogId.equals("") && !sActivityLogId.equals("null")) {
            activity_log_id = Integer.parseInt(sActivityLogId);
        }
        
        final String[] fields =
                { "status", "assigned_to", "vn_id", "supervisor", "dispatcher", "activity_type",
                        "wr_id", "wo_id", "work_team_id", "prob_type" };
        final Object[] object =
                selectDbValues(context, Constants.ACTION_ITEM_TABLE, fields, "activity_log_id = "
                        + activity_log_id);
        
        final Map values = new HashMap();
        for (int i = 0; i < fields.length; i++) {
            values.put(fields[i], object[i]);
        }
        
        String comments =
                localizeMessage(context, Constants.HELPDESK_ACTIVITY_ID, "UPDATEREQUEST_WFR",
                    "COMMENTS", null);
        final String user_name =
                getParentContextAttributeXPath(context, "/*/preferences/@user_name");
        
        // check if status has changed and update help request or work request status
        // if a work request is linked to the help request, the status of the help request will be
        // changed together with the work request status
        if (!status.equals("0")) {
            // String status = context.getString("status");
            
            if (values.get("activity_type").equals(Constants.ON_DEMAND_WORK)
                    && StatusConverter.getWorkRequestStatus(status) != null
                    && values.get("wr_id") != null) {
                final int wr_id = ((Integer) values.get("wr_id")).intValue();
                
                // kb#3038372: should use converted status of activity_log
                final String convertedStatus = StatusConverter.getWorkRequestStatus(status);
                
                final String curr_status = Common.getStatusValue(context, "wr", "wr_id", wr_id);
                if (!convertedStatus.equals(curr_status)
                // kb#3038372:exclude below condition for updating work request status from
                // acitvity_log's status since "Approved" of activity_log should not be considered
                // same as "Assigned To WorkOrder" of work request
                        && !(convertedStatus.equals("A") && curr_status.equals("AA") && Constants.PM
                            .equals(values.get("prob_type")))) {
                    final OnDemandWorkStepManager stepmgr =
                            new OnDemandWorkStepManager(context, wr_id);
                    stepmgr.endAllPendingSteps(comments, user_name);
                    
                    final OnDemandWorkStatusManager onDemandWorkStatusManager =
                            new OnDemandWorkStatusManager(context, wr_id);
                    onDemandWorkStatusManager.updateStatus(convertedStatus);
                }
            } else {
                if (!status.equals(values.get("status"))) {
                    final HelpdeskStepManager stepmgr =
                            new HelpdeskStepManager(context, activity_log_id);
                    stepmgr.endAllPendingSteps(comments, user_name);
                    
                    final HelpdeskStatusManager helpdeskStatusManager =
                            new HelpdeskStatusManager(context, activity_log_id);
                    helpdeskStatusManager.updateStatus(status);
                }
            }
        }
        
        
        String forwardComments = record.optString("forwardComments");
        record.remove("forwardComments");
        final Map fieldValues = parseJSONObject(context, record);
        final Map values1 = stripPrefix(fieldValues);
        if (values1 != null && !values1.isEmpty()) {
            executeDbSave(context, Constants.ACTION_ITEM_TABLE, values1);
            //executeDbCommit(context);
        }
        
        if (values.get("activity_type").equals(Constants.ON_DEMAND_WORK)) {
            String dispatcher = null;
            String supervisor = null;
            String workTeam = null;
            if (!dispatcher1.equals("0")) {
                dispatcher = dispatcher1;
            }
            if (!supervisor1.equals("0")) {
                supervisor = supervisor1;
            }
            if (!workTeam1.equals("0")) {
                workTeam = workTeam1;
            }
            
            final HelpdeskStepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
            // @translatable
            comments = localizeString(context, "Step ended by Service Desk Manager");
            
            if (StringUtil.notNullOrEmpty(dispatcher)
                    && !dispatcher.equals(values.get("dispatcher"))) {
                stepmgr.endAllPendingSteps(comments, user_name);
                final Forward forward =
                        new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                            Forward.STEP_FORWARD_DISPATCHER, dispatcher,forwardComments);
                forward.invoke();
                
                stepmgr.insertStep("dispatch", "Dispatch", dispatcher);
                
            } else if (StringUtil.notNullOrEmpty(supervisor)
                    && !supervisor.equals(values.get("supervisor"))) {
                stepmgr.endAllPendingSteps(comments, user_name);
                final Forward forward =
                        new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                            Forward.STEP_FORWARD_SUPERVISOR, supervisor,forwardComments);
                forward.invoke();
                // add to fix KB3029391, update work team from supervisor
                final WorkRequestHandler handler = new WorkRequestHandler();
                handler.updateWorkTeamFromSupervisor();
            } else if (StringUtil.notNullOrEmpty(workTeam)
                    && !workTeam.equals(values.get("work_team_id"))) {
                stepmgr.endAllPendingSteps(comments, user_name);
                final Forward forward =
                        new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                            Forward.STEP_FORWARD_WORKTEAM, workTeam,forwardComments);
                forward.invoke();
            }
            
            Object wrObject =
                    selectDbValue(context, Constants.WORK_REQUEST_TABLE, "wr_id","wr.activity_log_id = "+activity_log_id);
            if(wrObject!=null) {
                // add to fix KB3029391, update work team from supervisor
                final WorkRequestHandler handler = new WorkRequestHandler();
                handler.updateWorkTeamFromSupervisor();
                handler.syncDispatchValues(getIntegerValue(context, wrObject));
            }
        } else {
            if (StringUtil.notNullOrEmpty(assignedTo)) {
                final String assigned_to = assignedTo;
                if (assigned_to != null && !assigned_to.equals(values.get("assigned_to"))) {
                    final Forward forward =
                            new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                                Forward.STEP_FORWARD_EMPLOYEE, assigned_to);
                    forward.invoke();
                }
            } else if (StringUtil.notNullOrEmpty(vendorId)) {
                final String vendor = vendorId;
                if (vendor != null && !vendor.equals(values.get("vn_id"))) {
                    final Forward forward =
                            new Forward(context, Constants.HELPDESK_ACTIVITY_ID, activity_log_id,
                                Forward.STEP_FORWARD_VENDOR, vendor);
                    forward.invoke();
                }
            }
        }
    }
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN updateServiceRequestStatusFromWorkRequest WFR
    // Added for 19.2 Bldgops
    // ---------------------------------------------------------------------------------------------
    /**
     * To make the Date to Perform more relevant in On Demand Work, this scheduled workflow rule
     * updates wr.date_assigned for On Demand Work Requests based on the earliest date that any
     * trade, craftsperson, or resource is assigned.
     * 
     * By Zhang Yi 2010-08-23
     */
    public void updateServiceRequestStatusFromWorkRequest() {
        
        // Field name arrays used for insert record into table 'hactivity_log'
        final String[] fields =
                { "activity_log_id", "activity_type", "prob_type", "date_requested",
                        "date_completed", "requestor", "priority", "ac_id", "dv_id", "dp_id",
                        "status", "site_id", "bl_id", "fl_id", "rm_id", "eq_id", "assigned_to",
                        "vn_id", "date_escalation_response", "date_escalation_completion",
                        "escalated_response", "escalated_completion", "wr_id", "wo_id",
                        "description" };
        
        // Hash map: key is work request status and value is activity log status
        final HashMap<String, String> statusMap = new HashMap<String, String>();
        // Initial status map
        final String[][] statusMappingArray =
                new String[][] {
                        { "R", "Rej", "A", "AA", "I", "S", "Can", "Com", "Clo", "HP", "HA", "HL" },
                        { "REQUESTED", "REJECTED", "APPROVED", "APPROVED", "IN PROGRESS",
                                "STOPPED", "CLOSED", "COMPLETED", "CLOSED", "IN PROGRESS",
                                "IN PROGRESS", "IN PROGRESS" } };
        for (int i = 0; i < statusMappingArray[0].length; i++) {
            statusMap.put(statusMappingArray[0][i], statusMappingArray[1][i]);
        }
        
        // Prepare datasouce for reteriving activity log, work request(s) and history work
        // request(s)
        final DataSource acLogDS =
                DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                        "activity_log_id", "wr_id", "wo_id", "status" });
        
        final DataSource wrDS =
                DataSourceFactory.createDataSourceForFields("wr",
                    new String[] { "wr_id", "wo_id", "status" }).addSort("wr_id");
        
        final DataSource hwrDS =
                DataSourceFactory.createDataSourceForFields("hwr",
                    new String[] { "wr_id", "wo_id", "status", "activity_log_id" })
                    .addSort("wr_id");
        
        // SQL Server JDBC driver requires either autoCommit=true, or SelectMethod=cursor
        // if multiple Statements are used within a single Connection
        // SelectMethod=cursor imposes severe performance penalty,
        // so we use autoCommit=true
        //if (wrDS.isSqlServer()) {
        //    final EventHandlerContext eventHandlerContext =
        //            ContextStore.get().getEventHandlerContext();
        //    final DbConnection.ThreadSafe connection =
        //            EventHandlerBase.getDbConnection(eventHandlerContext);
        //    connection.setAutoCommit(true);
        //}
        
        // Loop through activity_log records in an inner class RecordHandler object
        acLogDS.queryRecords(" activity_type = 'SERVICE DESK - MAINTENANCE' ", new RecordHandler() {
            
            public boolean handleRecord(final DataRecord acLogRec) {
                // get field values of current record
                final int acLogId = acLogRec.getInt("activity_log.activity_log_id");
                final int wrId = acLogRec.getInt("activity_log.wr_id");
                final int woId = acLogRec.getInt("activity_log.wo_id");
                
                if (wrId > 0) {
                    // IF activity_log.wr_id IS NOT NULL
                    final DataRecord wrRec = wrDS.getRecord("wr_id=" + wrId);
                    // IF EXISTS (SELECT 1 FROM wr WHERE wr_id = activity_log.wr_id)
                    if (wrRec != null) {
                        
                        // Get <activity_log_status> from corresponding <work_request_status>
                        final String wrStatus = wrRec.getString("wr.status");
                        final String acLogStatus = statusMap.get(wrStatus);
                        // UPDATE activity_log status
                        acLogRec.setValue("activity_log.status", acLogStatus);
                        acLogDS.saveRecord(acLogRec);
                        
                    } else {
                        // ELSE IF activity_log.wr_id IS NULL
                        final DataRecord hwrRec = hwrDS.getRecord("wr_id=" + wrId);
                        // IF EXISTS (SELECT 1 FROM hwr WHERE wr_id = activity_log.wr_id).wr_id)
                        if (hwrRec != null) {
                            // Get <activity_log_status> from corresponding
                            // <work_request_status>
                            final String hwrStatus = hwrRec.getString("hwr.status");
                            final String acLogStatus = statusMap.get(hwrStatus);
                            // UPDATE activity_log status
                            acLogRec.setValue("activity_log.status", acLogStatus);
                            acLogDS.saveRecord(acLogRec);
                            // MOVE activity_log record to hactivity_log
                            insertHActivityLog(acLogId, fields);
                            acLogDS.deleteRecord(acLogRec);
                        }
                    }
                    
                } else if (woId > 0) {
                    // ELSE IF activity_log.wo_id IS NOT NULL
                    final List<DataRecord> wrList = wrDS.getRecords("wo_id=" + woId);
                    // IF EXISTS (SELECT 1 FROM wr WHERE wo_id = activity_log.wo_id)
                    if (wrList != null && wrList.size() > 0) {
                        // Get <activity_log_status> from MIN (wr_id) record FROM wr WHERE wo_id
                        // =
                        // activity_log.wo_id
                        final String wrStatus = wrList.get(0).getString("wr.status");
                        final String acLogStatus = statusMap.get(wrStatus);
                        // UPDATE activity_log status
                        acLogRec.setValue("activity_log.status", acLogStatus);
                        acLogDS.saveRecord(acLogRec);
                        
                    } else {
                        // IF DOES NOT EXISTS (SELECT 1 FROM wr WHERE wo_id =
                        // activity_log.wo_id)
                        final List<DataRecord> hwrList = hwrDS.getRecords("wo_id=" + woId);
                        // IF EXISTS (SELECT 1 FROM hwr WHERE wo_id = activity_log.wo_id)
                        if (hwrList != null && hwrList.size() > 0) {
                            // Get <activity_log_status> from MIN (wr_id) record FROM hwr WHERE
                            // wo_id =
                            // activity_log.wo_id
                            final String hwrStatus = hwrList.get(0).getString("hwr.status");
                            final String acLogStatus = statusMap.get(hwrStatus);
                            // UPDATE activity_log status
                            acLogRec.setValue("activity_log.status", acLogStatus);
                            acLogDS.saveRecord(acLogRec);
                            // MOVE activity_log record to hactivity_log
                            insertHActivityLog(acLogId, fields);
                            acLogDS.deleteRecord(acLogRec);
                        }
                    }
                }
                // Added by ZY for fixing kb3029389
                else {// wo and wr of activity_log are both null
                      // find the wo_id from the hwr table
                    final DataRecord hwrRec = hwrDS.getRecord("activity_log_id=" + acLogId);
                    if (hwrRec != null) {
                        // Get wo_id
                        final int woIdOfHwr = hwrRec.getInt("hwr.wo_id");
                        // Get <activity_log_status> from corresponding <work_request_status>
                        final String hwrStatus = hwrRec.getString("hwr.status");
                        final String acLogStatus = statusMap.get(hwrStatus);
                        // UPDATE activity_log status
                        acLogRec.setValue("activity_log.status", acLogStatus);
                        acLogDS.saveRecord(acLogRec);
                        // UPDATE hactivity_log to SET wo_id
                        // MOVE activity_log record to hactivity_log
                        insertHActivityLog(acLogId, fields);
                        acLogDS.deleteRecord(acLogRec);
                        
                        final String sqlStr =
                                " update hactivity_log set wo_id=" + woIdOfHwr
                                        + " where activity_log_id=" + acLogId;
                        EventHandlerBase.executeDbSql(ContextStore.get().getEventHandlerContext(),
                            sqlStr, false);
                        // acLogRec.setValue("activity_log.wo_id", woIdOfHwr);
                    }
                }
                //executeDbCommit(ContextStore.get().getEventHandlerContext());
                return true;
            }
            
        });
    }
    
    /**
     * This method serve as a WFR to check to get Service Provider.
     * 
     * @param context: Event handler context.
     * 
     */
    public void updateStatus(final int activityLogId, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final StatusManager manager = new HelpdeskStatusManager(context, activityLogId);
        manager.updateStatus(status);
    }
    
    /**
     * Verify Request.<br />
     * The requestor can verify the result of his request
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSOBObject of field values for activity_log and activity_log_step_waiting</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Convert the record to map type from JSONObject</li>
     * <li>Update the <code>activity_log</code> table with updated values</li>
     * <li>{@link #confirmStep(EventHandlerContext, int, int, String) Confirm verification step}</li>
     * </ol>
     * </p>
     */
    
    public void verifyRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        final int activity_log_id =
                getIntegerValue(context,
                    fieldValues.get("activity_log_step_waiting.activity_log_id")).intValue();
        // fields of activity_log
        final Map values = new HashMap();
        values.put("activity_log_id", new Integer(activity_log_id));
        
        final Map<String, String> map =
                Common.getSiteBuildingIds("activity_log", "activity_log_id",
                    String.valueOf(activity_log_id));
        
        values.put(
            "date_verified",
            LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                map.get("blId")));
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        //executeDbCommit(context);
        
        final int stepLogId =
                getIntegerValue(context, fieldValues.get("activity_log_step_waiting.step_log_id"))
                    .intValue();
        
        final String comments = notNull(fieldValues.get("activity_log_step_waiting.comments"));
        
        confirmStep(context, stepLogId, activity_log_id, comments);
    }
    
    /**
     * if a Service Request is created and it has a valid assessment_id (assessment_id > 0), so
     * change the status of the assessment item to 'IN PROGRESS'
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : Help request id</li>
     * <li>activity_log.assessment_id : Condition Assessment Id</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get assessment_id and activity_log_id from context</li>
     * <li>check the assessment is not null and more than 0</li>
     * </p>
     * <li>Change the status of the assessment item (i.e, the assessment_id) to 'IN PROGRESS'</li>
     * </p> </ol> </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     */
    protected void checkCondAssessmentInProgress(final EventHandlerContext context) {
        
        int assessmentId = 0;
        Map fieldValues = null;
        
        if (context.parameterExists("fields")) {
            fieldValues = context.getParameters("fields");
        }
        
        // search the assessment ID in the context.
        if (fieldValues != null && fieldValues.containsKey("activity_log.assessment_id")) {
            if (fieldValues.get("activity_log.assessment_id") != null) {
                assessmentId = (Integer) fieldValues.get("activity_log.assessment_id");
            }
        }
        
        // there is no assessment id in the context, so search it in DB.
        if (assessmentId < 1) {
            final Object objAssessmentId =
                    Common.getValue(context, "activity_log", "assessment_id", "activity_log_id = "
                            + context.getInt("activity_log.activity_log_id"));
            
            if (objAssessmentId != null && (Integer) objAssessmentId > 0) {
                assessmentId = (Integer) objAssessmentId;
            }
        }
        
        if (assessmentId > 0) {
            // update the assessment item's status when its sub-service request
            // is created and submited.
            final String updateSql =
                    "UPDATE activity_log SET status = 'IN PROGRESS' WHERE activity_log_id ="
                            + assessmentId;
            
            executeDbSql(context, updateSql, false);
            //executeDbCommit(context);
        }
    }
    
    /**
     * Accept step using {@link com.archibus.eventhandler.steps.StepManager step manager}
     * 
     * @param context Workflow rule execution context
     * @param activity_log_id ID of help request to accept
     * @param comments Acceptance comments
     * @param stepLogId Step log id of step to accept
     */
    private void acceptStep(final EventHandlerContext context, final int activity_log_id,
            final String comments, final int stepLogId) {
        final StepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.acceptStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }
    
    private StringBuffer appendRestriction(final EventHandlerContext context,
            final StringBuffer sql, final JSONObject filter, final String fieldName) {
        if (filter.has(fieldName)) {
            return sql.append(" AND a." + fieldName + " = "
                    + literal(context, filter.getString(fieldName)));
        } else {
            return sql;
        }
    }
    
    private StringBuffer appendRestriction(final EventHandlerContext context,
            final StringBuffer sql, final JSONObject filter, final String tableName,
            final String fieldName) {
        if (filter.has(fieldName)) {
            return sql.append(" AND " + tableName + "." + fieldName + " = "
                    + literal(context, filter.getString(fieldName)));
        } else {
            return sql;
        }
    }
    
    private StringBuffer appendRestrictionDateInterval(final EventHandlerContext context,
            final StringBuffer sql, final JSONObject filter, final String tableName,
            final String fieldName) {
        if (filter.has(fieldName + ".from") && filter.has(fieldName + ".to")) {
            final String dateFrom = filter.getString(fieldName + ".from");
            final String dateTo = filter.getString(fieldName + ".to");
            return sql.append(" AND " + tableName + "." + fieldName + " BETWEEN "
                    + formatSqlIsoToNativeDate(context, dateFrom) + " AND "
                    + formatSqlIsoToNativeDate(context, dateTo));
        } else if (filter.has(fieldName + ".from")) {
            final String dateFrom = filter.getString(fieldName + ".from");
            return sql.append(" AND " + tableName + "." + fieldName + " >= "
                    + formatSqlIsoToNativeDate(context, dateFrom));
        } else if (filter.has(fieldName + ".to")) {
            final String dateTo = filter.getString(fieldName + ".to");
            return sql.append(" AND " + tableName + "." + fieldName + " <= "
                    + formatSqlIsoToNativeDate(context, dateTo));
        } else {
            return sql;
        }
    }
    
    private StringBuffer appendStatusRestriction(final EventHandlerContext context,
            final StringBuffer sql, final JSONObject filter) {
        if (filter.has("status")) {
            final String wrStatus = filter.getString("status");
            final String actionItemStatus = StatusConverter.getActionStatus(wrStatus);
            if (actionItemStatus != null && !actionItemStatus.equals("N/A")) {
                sql.append(" AND (a.status = " + literal(context, actionItemStatus));
                sql.append(" OR w.status = " + literal(context, wrStatus) + ")");
            } else {
                sql.append(" AND w.status = " + literal(context, wrStatus));
            }
        }
        return sql;
    }
    
    /**
     * 
     * Helper function to archive one or more requests.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>If max_id > 0 (help request with maximal id will be archived) add new dummy record and
     * delete previous (to retain the numbering sequence)</li>
     * <li>Get a list of all fields of <code>activity_log</code></li>
     * <li>Insert a copy of the selected records (given in where) into the
     * <code>hactivity_log</code></li>
     * <li>Update records in <code>helpdesk_step_log</code> (set table_name to
     * <code>hactivity_log</code>)</li>
     * <li>Delete the selected records</li>
     * </ol>
     * </p>
     * 
     * @param context Workflow rule execution context
     * @param max_id Maximal id of all action items, or 0 if request with maximal id is not archived
     * @param where SQL where clause specifying the action items to archive (e.g. 'activity_log_id =
     *            ?' OR 'activity_log_id IN (?,?,...)')
     */
    private void archiveHelper(final EventHandlerContext context, final int max_id, String where) {
        // fix KB3029197-comment out below code because the dummy record do not need in latest
        // sybase 9, mssql2005,
        // the numbering sequence work well if max record is deleted(Guo 2011/5/4)
        /*
         * if (max_id > 0) {// help request with maximal id will be archived, so update dummy record
         * String activity_type = (String) selectDbValue(context, Constants.ACTION_ITEM_TABLE,
         * "activity_type", "activity_log_id = " + max_id); // insert dummy record Map values = new
         * HashMap(); String description = localizeMessage(context, Constants.HELPDESK_ACTIVITY_ID,
         * "ARCHIVEREQUEST_WFR", "ARCHIVE_REQUEST_DESCRIPTION", null); values.put("description",
         * description); values.put("activity_type", activity_type); executeDbAdd(context,
         * Constants.ACTION_ITEM_TABLE, values); executeDbCommit(context);
         * 
         * // delete previous dummy record String delete =
         * "DELETE FROM activity_log WHERE description = " + literal(context, description) +
         * " AND activity_log_id < " + max_id; executeDbSql(context, delete, false);
         * executeDbCommit(context); }
         */
        // copy request to hactivity_log
        final String[] fields_list =
                com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context,
                    Constants.ACTION_ITEM_TABLE);
        final StringBuffer fields = new StringBuffer();

		// Added test to exclude the questionnaire_id field from the fields copied to hactivity_log
        // if that field is not in the table.
        // KB 3045774
		boolean questionnaireIdInArchive = false;

		if (SchemaUtils.fieldExistsInSchema(Constants.ACTION_ITEM_TABLE, "questionnaire_id")
			&& SchemaUtils.fieldExistsInSchema("hactivity_log", "questionnaire_id")) {
			questionnaireIdInArchive = true;
		}

		for (final String element : fields_list) {
			if (questionnaireIdInArchive || !"questionnaire_id".equals(element)) {
				if (fields.length() > 0) {
					fields.append(",");
				}
				fields.append(notNull(element));
			}
        }

        try {
            // format insert query
            final String insert =
                    "INSERT into h" + Constants.ACTION_ITEM_TABLE + "(" + fields.toString() + ") "
                            + "SELECT " + fields.toString() + " FROM "
                            + Constants.ACTION_ITEM_TABLE + " WHERE " + where;
            executeDbSql(context, insert, false);
            // delete requests from activity_log
            final String delete = "DELETE FROM " + Constants.ACTION_ITEM_TABLE + " WHERE " + where;
            executeDbSql(context, delete, true);
            //executeDbCommit(context);
            
            // update records in helpdesk_step_log
            where = where.replaceFirst("activity_log_id", "pkey_value");
            final String update =
                    "UPDATE " + Constants.STEP_LOG_TABLE + " SET table_name= 'hactivity_log' "
                            + "WHERE table_name='activity_log' AND " + where;
            executeDbSql(context, update, false);
            //executeDbCommit(context);
            
            //archive data in helpdesk_step_log to hhelpdesk_step_log - KB3034237(Create an archive table for helpdesk_step_log) 
            archiveStepLog();
            
            // fix KB3031189- use DataSource API to excute update to support cascaded update(Guo
            // 2011/5/4)
            // update records in docs tables
            // String updateDocs = "UPDATE afm_docs SET table_name='hactivity_log' "
            // + "WHERE table_name='activity_log' AND " + where;
            // executeDbSql(context, updateDocs, false);
            // executeDbCommit(context);
            final String[] fieldNames = { "table_name", "field_name", "pkey_value" };
            final DataSource docDs =
                    DataSourceFactory.createDataSourceForFields("afm_docs", fieldNames);
            final List<DataRecord> docRecords =
                    docDs.getRecords("table_name='activity_log' AND " + where);
            for (final DataRecord docRecord : docRecords) {
                docRecord.setValue("afm_docs.table_name", "hactivity_log");
                docDs.saveRecord(docRecord);
            }
        } catch (final Exception e) {
            e.printStackTrace();
        }
    }
    
    /**
     * Use {@link com.archibus.eventhandler.steps.StepManager#confirmStep(int, String, String) Step
     * manager} to confirm step
     * 
     * @param context Workflow rule execution context
     * @param stepLogId Step log id
     * @param activity_log_id Help request id
     * @param comments confirmation comments
     */
    private void confirmStep(final EventHandlerContext context, final int stepLogId,
            final int activity_log_id, final String comments) {
        final StepManager stepManager = new HelpdeskStepManager(context, activity_log_id);
        stepManager.confirmStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }
    
    /**
     * Decline step using {@link com.archibus.eventhandler.steps.StepManager step manager}
     * 
     * @param context Workflow rule execution context
     * @param stepLogId Step log id of step to decline
     * @param comments Declining comments
     * @param activity_log_id Id of help request to decline
     */
    private void declineStep(final EventHandlerContext context, final int stepLogId,
            final String comments, final int activity_log_id) {
        final StepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.declineStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }
    
    /**
     * Restriction from values to get proper last inserted id value. Restricted to creator.
     * 
     * @param context
     * @param values
     * @return
     */
    private String getRestrictionFromValues(final EventHandlerContext context, final Map values) {
        final StringBuffer sb = new StringBuffer();
        // sb.append("created_by = " + literal(context, notNull(values.get("created_by"))));
        sb.append(" 0=0");
        for (final Iterator it = values.keySet().iterator(); it.hasNext();) {
            final String key = (String) it.next();
            sb.append(" AND " + key);
            if (values.get(key) != null) {
                if (values.get(key) instanceof java.lang.String) {
                    if (StringUtil.notNullOrEmpty(values.get(key))) {
                        sb.append("=" + literal(context, (String) values.get(key)));
                    } else {
                        sb.append(" IS NULL");
                    }
                } else if (values.get(key) instanceof java.lang.Integer) {
                    sb.append("=" + values.get(key));
                } else if (values.get(key) instanceof java.lang.Double) {
                    sb.append("=" + values.get(key));
                } else if (values.get(key) instanceof java.sql.Date) {
                    sb.append("="
                            + formatSqlFieldValue(context, values.get(key), "java.sql.Date", key));
                } else {
                    sb.append("= "
                            + formatSqlFieldValue(context, values.get(key), values.get(key)
                                .getClass().toString(), key));
                }
            } else {
                sb.append(" IS NULL");
            }
        }
        
        return sb.toString();
    }
    
    private void insertHActivityLog(final int acLogId, final String[] fields) {
        String fieldStr = fields[0];
        for (int i = 1; i < fields.length; i++) {
            fieldStr += "," + fields[i];
        }
        final String insert =
                "INSERT into hactivity_log (" + fieldStr + ") " + "SELECT " + fieldStr
                        + " FROM activity_log WHERE activity_log_id=" + acLogId;
        executeDbSql(ContextStore.get().getEventHandlerContext(), insert, false);
    }
    
    /**
     * When I say "default" SLA, I mean the records in helpdesk_sla_response where activity_type =
     * 'SERVICE DESK - MAINTENANCE' and ordering_seq = 1 and priority IN (0, 1, 2, 3, 4, 5, 25, 50,
     * 75, 99).
     * 
     * @param sla
     * @return true/false
     */
    private boolean isDefaultSLA(final ServiceLevelAgreement sla) {
        if (!Constants.ON_DEMAND_WORK.equals(sla.getActivity_type())) {
            return false;
        }
        
        if (sla.getOrdering_seq() != 1) {
            return false;
        }
        
        final int priority = sla.getPriority();
        if ((priority >= 0 && priority <= 5) || priority == 25 || priority == 50 || priority == 75
                || priority == 99) {
            return true;
        }
        return false;
    }
    
    // ---------------------------------------------------------------------------------------------
    // END updateServiceRequestStatusFromWorkRequest WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN getServiceDeskManager WFR - Added by Guo for 20.1 Space Transaction
    // ---------------------------------------------------------------------------------------------
    
    /**
     * Use {@link com.archibus.eventhandler.steps.StepManager#rejectStep(int, String, String) Step
     * manager} to reject step
     * 
     * @param context Workflow rule execution context
     * @param stepLogId Step log id
     * @param activity_log_id Help request id
     * @param comments rejection comments
     */
    private void rejectStep(final EventHandlerContext context, final int activity_log_id,
            final int stepLogId, final String comments) {
        final HelpdeskStepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.rejectStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }
    
    // ---------------------------------------------------------------------------------------------
    // END getServiceProvider WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN updateStatus WFR - Added by Guo for 20.1 Space Transaction
    // ---------------------------------------------------------------------------------------------
    
    /**
     * Update request record according to matching SLA configuration.<br />
     * After a request is submitted by a user some fields are set in the request record according to
     * the SLA which matches the request. These parameters are:
     * <ul>
     * <li>SLA Manager</li>
     * <li>Date and time the escalation for response will occur, if the SLA specifies a time to
     * respond</li>
     * <li>Date and time the escalation for completion will occur, if the SLA specifies a time to
     * complete</li>
     * </ul>
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : id of request record to update</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get request id from context</li>
     * <li>Look up {@link ServiceLevelAgreement Service Level Agreement} for the current request</li>
     * <li>Put SLA manager in request record</li>
     * <li>{@link ServiceLevelAgreement#calculateEscalation(java.sql.Date, java.sql.Time) Calculate
     * escalation dates and times} based on found SLA</li>
     * <li>If escalation time are empty or 0, fill in NULL values</li>
     * <li>Save updated record to <code>activity_log</code></li>
     * </ol>
     * </p>
     * 
     * @param context Workflow rule execution context
     * 
     * @see ServiceLevelAgreement
     */
    private void updateRequestParametersFromSLA(final EventHandlerContext context) {
        final int activity_log_id = context.getInt("activity_log.activity_log_id");
        // copy SLA parameters to action table (manager, escalation dates)
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, "activity_log", "activity_log_id",
                    activity_log_id);
        
        final Map values = new HashMap();
        values.put("activity_log_id", new Integer(activity_log_id));
        values.put("manager", sla.getSLAManager());
        
        // calculate escalation date and time
        final Object[] datetimeValues =
                selectDbValues(context, Constants.ACTION_ITEM_TABLE, new String[] {
                        "date_requested", "time_requested", "site_id", "bl_id" },
                    " activity_log_id=" + activity_log_id);
        
        java.sql.Date dateRequested = Utility.currentDate();
        java.sql.Time timeRequested = Utility.currentTime();
        
        if (datetimeValues != null) {
            final String siteId = notNull(datetimeValues[2]);
            final String blId = notNull(datetimeValues[3]);
            
            if (datetimeValues[0] != null) {
                dateRequested = getDateValue(context, datetimeValues[0]);
            } else {
                dateRequested = LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
            }
            
            if (datetimeValues[1] != null) {
                timeRequested = getTimeValue(context, datetimeValues[1]);
            } else {
                timeRequested = LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
            }
        }
        final Map escalation = sla.calculateEscalation(dateRequested, timeRequested);
        
        if (escalation.get("response") != null) {
            final Map response = (Map) escalation.get("response");
            
            final java.sql.Date date_esc_response = (java.sql.Date) response.get("date");
            final java.sql.Time time_esc_response = (java.sql.Time) response.get("time");
            values.put("date_escalation_response", date_esc_response);
            values.put("time_escalation_response", time_esc_response);
        } else {
            values.put("date_escalation_response", null);
            values.put("time_escalation_response", null);
        }
        
        if (escalation.get("completion") != null) {
            final Map completion = (Map) escalation.get("completion");
            final java.sql.Date date_esc_completion = (java.sql.Date) completion.get("date");
            final java.sql.Time time_esc_completion = (java.sql.Time) completion.get("time");
            
            values.put("date_escalation_completion", date_esc_completion);
            values.put("time_escalation_completion", time_esc_completion);
        } else {
            values.put("date_escalation_completion", null);
            values.put("time_escalation_completion", null);
        }
        
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        
        if (SchemaUtils.fieldExistsInSchema("activity_log", "date_esc_comp_orig")) {
            
            final String updateSql =
                    "UPDATE activity_log set date_esc_comp_orig = date_escalation_completion,"
                            + " date_esc_resp_orig = date_escalation_response,time_esc_comp_orig = time_escalation_completion, "
                            + " time_esc_resp_orig = time_escalation_response WHERE date_esc_comp_orig is null and date_esc_resp_orig is null and activity_log_id = " + activity_log_id;
            SqlUtils.executeUpdate("activity_log", updateSql);
            
        } 
       
        
        //executeDbCommit(context);
    }
    
    // ---------------------------------------------------------------------------------------------
    // END updateStatus WFR


    /**
     * Close Completed Request, this is a scheduled WFR.
     * 
     * @param context
     */
    public void closeCompletedRequests(EventHandlerContext context) {
        final boolean autoCloseWorkRequests =
                getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "AutoCloseWorkRequests").intValue() > 0;
        
        if (autoCloseWorkRequests) {
            final int closeDaysAfterWrDateCompleted =
                    getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
                        "CloseDaysAfterWrDateCompleted").intValue();
                        
            final DataSource wrDS =
                    DataSourceFactory.createDataSource().addTable("wr").addField("wr_id")
                        .addField("status").addField("wo_id");
            
            wrDS.addRestriction(Restrictions
                .sql("activity_type = 'SERVICE DESK - MAINTENANCE' AND status = 'Com' AND step_status != 'waiting' AND not exists(select 1 from wr a where a.wo_id = wr.wo_id and a.status IN ('R','A','AA','I','Rev','HP', 'HA', 'HL')) AND ${sql.daysBeforeCurrentDate('wr.date_completed')} &gt;="+closeDaysAfterWrDateCompleted));
            List<DataRecord> wrRecords = wrDS.getAllRecords();
            final WorkRequestHandler handler = new WorkRequestHandler();
            for (DataRecord wrRecord : wrRecords) {
                handler.closeWorkRequest(EventHandlerBase.toJSONObject(wrRecord.getValues())
                    .toString());
            }
        }
        
        final boolean autoCloseServiceRequests =
                getActivityParameterInt(context, Constants.HELPDESK_ACTIVITY_ID,
                    "AutoCloseServiceRequests").intValue() > 0;
        
        if (autoCloseServiceRequests) {
            final int closeDaysAfterSrDateCompleted =
                    getActivityParameterInt(context, Constants.HELPDESK_ACTIVITY_ID,
                        "CloseDaysAfterSrDateCompleted").intValue();
            
            final DataSource activityLogDS =
                    DataSourceFactory.createDataSource().addTable("activity_log")
                        .addField("activity_log_id");
            activityLogDS
                .addRestriction(Restrictions
                    .sql("activity_type LIKE 'SERVICE DESK%' AND activity_type != 'SERVICE DESK - MAINTENANCE' AND status = 'COMPLETED' AND step_status != 'waiting' AND ${sql.daysBeforeCurrentDate('activity_log.date_completed')} &gt;="+closeDaysAfterSrDateCompleted));
            List<DataRecord> activityLogRecords = activityLogDS.getAllRecords();
            for (DataRecord activityLogRecord : activityLogRecords) {
                closeRequest(EventHandlerBase.toJSONObject(activityLogRecord.getValues()));
            }
            
        }
        
    }
    
    /**
     * Get workflow substitutes.
     *
     * @param fieldName
     * @param stepTypeOrRole
     * @return
     */
    public String getWorkflowSubstitutes(final String fieldName) {
        return super.getWorkflowSubstitutes(fieldName);
    }
    
    /**
     * Get localized field name of field afm_wf_steps.step.
     * 
     * Add for KB3046327- Localization: Workflow Steps are not translated in Step History form of the new Search & Manage view
     * 
     *  @param Locale locale 
     */
    public String getLocalizedStepFieldName(){
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        return Common.getLocalizedStepFieldName(getLocale(context));
    }
}
