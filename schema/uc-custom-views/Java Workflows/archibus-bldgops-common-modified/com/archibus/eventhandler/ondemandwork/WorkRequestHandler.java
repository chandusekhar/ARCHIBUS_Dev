package com.archibus.eventhandler.ondemandwork;

import static com.archibus.app.bldgops.partinv.BldgopsPartInventoryConstant.*;

import java.sql.Date;
import java.sql.Time;
import java.util.*;

import org.dom4j.DocumentException;
import org.json.*;

import com.archibus.app.bldgops.partinv.*;
import com.archibus.app.common.util.SchemaUtils;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.sla.*;
import com.archibus.eventhandler.steps.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.*;

/**
 * Handles all workflow rules for requests used by the On Demand Work application.
 *
 */
public class WorkRequestHandler extends HelpdeskEventHandlerBase {

    /**
     * Check which work orders are assigned to the current user as supervisor/verification
     * substitute.
     */
    public void checkWoSupervisorSubstitutes(final JSONArray records,
            final boolean includeVerification) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray result = new JSONArray();

        if (records.length() > 0) {
            final StringBuffer woIds = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject json = records.getJSONObject(i);
                woIds.append("," + json.getInt("wo.wo_id"));
            }

            final DataSource cfDS = DataSourceFactory.createDataSourceForFields("cf",
                new String[] { "cf_id", "email", "work_team_id" });
            cfDS.addRestriction(
                Restrictions.eq("cf", "email", ContextStore.get().getUser().getEmail()));
            final DataRecord cfRecord = cfDS.getRecord();
            if (cfRecord != null) {
                cfRecord.getString("cf.work_team_id");
            }
            final String emWorkflowSubstitutes = this.getWorkflowSubstitutes("em_id");

            final StringBuffer sql = new StringBuffer(
                "SELECT wo_id FROM wo WHERE wo_id IN (" + woIds.substring(1) + ") ");

            sql.append(" AND ( wo.supervisor " + formatSqlConcat(context) + " 'supervisor' IN ("
                    + emWorkflowSubstitutes + ")"
                    + " OR wo.work_team_id IN (SELECT work_team_id FROM cf WHERE email IN (SELECT email FROM em WHERE em_id  "
                    + formatSqlConcat(context) + "'supervisor' IN" + " (" + emWorkflowSubstitutes
                    + ")))");
            if (includeVerification) {
                sql.append(
                    " OR wo.wo_id IN (SELECT wo_id FROM wr WHERE wr_id IN (SELECT wr_id FROM wr_step_waiting WHERE step_type='verification' AND wr_step_waiting.em_id "
                            + formatSqlConcat(context) + "step_type IN (" + emWorkflowSubstitutes
                            + ")))");
            }
            sql.append(")");

            final List<Object[]> woRecords = selectDbRecords(context, sql.toString());
            if (woRecords != null && !woRecords.isEmpty()) {
                for (final Object[] record : woRecords) {
                    result.put(record[0]);
                }
            }
        }

        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * Check which work orders are assigned to the current user as supervisor/verification
     * substitute
     */
    public void checkWrSupervisorSubstitutes(final JSONArray records,
            final boolean includeVerification) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray result = new JSONArray();

        if (records.length() > 0) {
            final StringBuffer wrIds = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject json = records.getJSONObject(i);
                wrIds.append("," + json.getInt("wr.wr_id"));
            }

            final String emWorkflowSubstitutes = this.getWorkflowSubstitutes("em_id");

            final StringBuffer sql = new StringBuffer(
                "SELECT wr_id FROM wr WHERE wr_id IN (" + wrIds.substring(1) + ") ");
            sql.append(" AND ( wr.supervisor " + formatSqlConcat(context) + " 'supervisor' IN ("
                    + emWorkflowSubstitutes
                    + ") OR wr.work_team_id IN (SELECT work_team_id FROM cf WHERE email IN (SELECT email FROM em WHERE em_id "
                    + formatSqlConcat(context) + " 'supervisor' IN (" + emWorkflowSubstitutes
                    + " )))");
            if (includeVerification) {
                sql.append(
                    " OR wr.wr_id IN (SELECT wr_id FROM wr_step_waiting WHERE step_type='verification' AND wr_step_waiting.em_id "
                            + formatSqlConcat(context) + " step_type IN (" + emWorkflowSubstitutes
                            + "))");
            }
            sql.append(")");

            final List<Object[]> wrRecords = selectDbRecords(context, sql.toString());
            if (wrRecords != null && !wrRecords.isEmpty()) {
                for (final Object[] record : wrRecords) {
                    result.put(record[0]);
                }
            }
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * Check if the current user is allowed to do a verification for the given work request (as
     * workflow substitute)
     *
     * @param strWrId work request id
     */
    public void checkVerificationSubstitute(final String strWrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wrId = Integer.parseInt(strWrId);

        // get open verification steps for the given work request
        final DataSource stepWaitingDS = DataSourceFactory.createDataSourceForFields(
            "wr_step_waiting",
            new String[] { "user_name", "wr_id", "step_type", "em_id", "cf_id", "step_log_id" });
        final List<DataRecord> records =
                stepWaitingDS.getRecords("step_type='verification' AND wr_id = " + wrId);

        boolean isSubstitute = false;
        int stepLogId = 0;

        if (!records.isEmpty()) {
            for (final DataRecord record : records) {
                if (StringUtil.notNullOrEmpty(record.getString("wr_step_waiting.em_id"))) {
                    if (StepHandler.checkWorkflowEmSubstitute(context,
                        record.getString("wr_step_waiting.em_id"), "verification")) {
                        isSubstitute = true;
                        stepLogId = record.getInt("wr_step_waiting.step_log_id");
                        break;
                    }
                } else if (StringUtil.notNullOrEmpty(record.getString("wr_step_waiting.cf_id"))) {
                    if (StepHandler.checkWorkflowCfSubstitute(context,
                        record.getString("wr_step_waiting.cf_id"), "verification")) {
                        isSubstitute = true;
                        stepLogId = record.getInt("wr_step_waiting.step_log_id");
                        break;
                    }
                }
            }
        }
        final JSONObject result = new JSONObject();
        result.put("isSubstitute", isSubstitute);
        result.put("step_log_id", stepLogId);
        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * check which work order(s) are assigned to the current user (craftsperson) as substitute.
     *
     * @param woRecords work order records to check
     */
    public void checkWoCfSubstitutes(final JSONArray woRecords) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final StringBuffer woIds = new StringBuffer();
        for (int i = 0; i < woRecords.length(); i++) {
            final JSONObject json = woRecords.getJSONObject(i);
            woIds.append("," + json.getInt("wo.wo_id"));
        }

        final JSONArray result = new JSONArray();

        final DataSource cfDS = DataSourceFactory.createDataSourceForFields("cf",
            new String[] { "cf_id", "email" });
        cfDS.addRestriction(
            Restrictions.eq("cf", "email", ContextStore.get().getUser().getEmail()));
        final DataRecord cfRecord = cfDS.getRecord();
        if (cfRecord != null) {
            final String cfWorkflowSubstitutes = this.getWorkflowSubstitutes("cf_id");
            final String sql =
                    "SELECT wo_id FROM wo WHERE wo_id IN (" + woIds.substring(1) + ") AND "
                            + " EXISTS (SELECT wr_id FROM wr WHERE wr.wo_id = wo.wo_id AND wr_id IN "
                            + " (SELECT wr_id FROM wrcf WHERE cf_id " + formatSqlConcat(context)
                            + "'craftsperson' IN (" + cfWorkflowSubstitutes + ")))";

            final List<Object[]> records = selectDbRecords(context, sql);
            if (records != null && !records.isEmpty()) {
                for (final Object[] record : records) {
                    result.put(record[0]);
                }
            }
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * Check which of the given work requests are assigned to the current user (craftsperson) as
     * substitute.
     *
     * @param wrRecords work request records to check
     */
    public void checkWrCfSubstitutes(final JSONArray wrRecords) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final StringBuffer wrIds = new StringBuffer();
        for (int i = 0; i < wrRecords.length(); i++) {
            final JSONObject json = wrRecords.getJSONObject(i);
            wrIds.append("," + json.getInt("wr.wr_id"));
        }

        final JSONArray result = new JSONArray();

        final DataSource cfDS = DataSourceFactory.createDataSourceForFields("cf",
            new String[] { "cf_id", "email" });
        cfDS.addRestriction(
            Restrictions.eq("cf", "email", ContextStore.get().getUser().getEmail()));
        final DataRecord cfRecord = cfDS.getRecord();
        if (cfRecord != null) {
            final String cfWorkflowSubstitutes = this.getWorkflowSubstitutes("cf_id");

            final String sql =
                    "SELECT wr_id FROM wr WHERE wr_id IN (" + wrIds.substring(1) + ") AND "
                            + " EXISTS (SELECT wr_id FROM wrcf WHERE wrcf.wr_id = wr.wr_id AND cf_id "
                            + formatSqlConcat(context) + " 'craftsperson' IN ("
                            + cfWorkflowSubstitutes + "))";

            final List<Object[]> records = selectDbRecords(context, sql);
            if (records != null && !records.isEmpty()) {
                for (final Object[] record : records) {
                    result.put(record[0]);
                }
            }
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * Get list of help requests linked for a list of work requests.
     *
     * Returns a JSON array of help request ids.
     *
     * @param JSONArray records,wr.wr_id json array
     */
    public void getHelpRequestsForWorkRequests(final JSONArray records) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray helpRequests = new JSONArray();

        if (records.length() > 0) {
            final StringBuffer in = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                final int wr_id = record.getInt("wr.wr_id");
                in.append("," + wr_id);
            }
            final String sql = "SELECT DISTINCT activity_log_id FROM activity_log WHERE wr_id IN ("
                    + in.substring(1).toString() + ")";
            final List recs = selectDbRecords(context, sql);

            for (final Iterator it = recs.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final Integer activity_log_id = getIntegerValue(context, record[0]);
                helpRequests.put(activity_log_id.intValue());
            }
        }
        context.addResponseParameter("jsonExpression", helpRequests.toString());
    }

    /**
     * Update Craftsperson costs.
     *
     * Calculate the costs, total hours and total cost of the wrcf. Recalculate the work request
     * costs.
     *
     * @param record,table 'wrcf' JSONObject
     */
    public void updateCraftspersonCosts(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // JSONObject record = context.getJSONObject("record");
        final int wr_id = record.getInt("wrcf.wr_id");
        final String cf_id = record.getString("wrcf.cf_id");

        double cost_over = 0;
        double cost_double = 0;
        double hours_over = 0;
        double hours_double = 0;
        final double hours_straight = record.getDouble("wrcf.hours_straight");

        final Object[] cf_record = selectDbValues(context, "cf",
            new String[] { "tr_id", "rate_hourly", "rate_double", "rate_over" },
            "cf_id = " + literal(context, cf_id));
        final double cost_straight = hours_straight * ((Double) cf_record[1]).doubleValue();
        // Guo changed for KB3021191 2009-01-04
        if (record.get("wrcf.hours_over") != null) {
            hours_over = record.getDouble("wrcf.hours_over");
            cost_over = hours_over * ((Double) cf_record[3]).doubleValue();
        }
        if (record.get("wrcf.hours_double") != null) {
            hours_double = record.getDouble("wrcf.hours_double");
            cost_double = hours_double * ((Double) cf_record[2]).doubleValue();
        }
        final double cost_total = cost_straight + cost_over + cost_double;
        final double hours_total = hours_over + hours_double + hours_straight;

        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        values.put("cost_over", new Double(cost_over));
        values.put("cost_double", new Double(cost_double));
        values.put("cost_straight", new Double(cost_straight));
        values.put("cost_total", new Double(cost_total));
        values.put("hours_total", new Double(hours_total));
        // Guo changed for KB3021194 2009-01-05
        if (record.get("wrcf.hours_est") != null) {
            final double hours_diff = hours_total - record.getDouble("wrcf.hours_est");
            values.put("hours_diff", new Double(hours_diff));
        } else {
            values.put("hours_diff", new Double(hours_total));
        }

        executeDbSave(context, "wrcf", values);
        // executeDbCommit(context);

        recalculateCosts(context, wr_id);
    }

    /**
     * Reject help request by dispatcher.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>comments: comments given by dispatcher when rejecting a request</li>
     * <li>activity_log.activity_log_id: identifier for this request</li>
     * </ul>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>activity_log_id: Help request id of rejected request (to archive)</li>
     * </ul>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get input parameters from context</li>
     * <li>Save the request record to <code>activity_log</code></li>
     * <li>{@link com.archibus.eventhandler.steps.StepManager#rejectStep(int, String, String) Reject
     * dispatch step}</li>
     * <li>{@link RequestHandler#archiveRequest(EventHandlerContext) Archive rejected request}</li>
     * </ol>
     * <p>
     *
     * @param String tableName
     * @param String fieldName
     * @param String activity_log_id2
     * @param JSONObject record
     * @param String comments
     * @throws DocumentException
     *
     */
    public void rejectDispatchRequest(final String tableName, final String fieldName,
            final String activity_log_id2, final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final Map fieldValues = parseJSONObject(context, record);

        final int stepId =
                getIntegerValue(context, fieldValues.get("activity_log_step_waiting.step_log_id"))
                    .intValue();
        final int activity_log_id =
                getIntegerValue(context, fieldValues.get("activity_log.activity_log_id"))
                    .intValue();
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "activity_log."));

        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        // executeDbCommit(context);

        final StepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.rejectStep(stepId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));

        // archive rejected request
        context.addResponseParameter("activity_log_id", new Integer(activity_log_id));
        // KB3042602 - archive service request and work request when reject dispatch
        final int wr_id = findWrIdFromActionItem(context, activity_log_id);
        archiveWorkRequest(wr_id);

        final RequestHandler requestHandler = new RequestHandler();
        requestHandler.archiveRequest(activity_log_id2, record);
    }

    /**
     *
     * Dispatch a help request.<br />
     * The dispatcher can select a supervisor or a trade to dispatch the help request to. If a trade
     * is selected all supervisors of this trade are notified, but the request is assigned to only 1
     * of them. This is the first one reviewing the request (linking it to a work request or work
     * order) or the first one accepting the request if acceptance is required.
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
     * <li>Save request record (with supervisor or trade)</li>
     * <li>{@link com.archibus.eventhandler.steps.StepManager#confirmStep(int, String, String)
     * Confirm dispatch step}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String activity_log
     * @param String activity_log_id1
     * @param String id
     * @param JSONObject record
     * @param String comments
     *            </p>
     * @throws DocumentException
     */
    public void dispatchRequest(final String activity_log, final String activity_log_id1,
            final String id, final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        int stepId = 0;
        int activity_log_id = 0;
        Map values = null;
        // save trade or supervisor in activity_log

        stepId = getIntegerValue(context, fieldValues.get("activity_log_step_waiting.step_log_id"))
            .intValue();
        activity_log_id = getIntegerValue(context, fieldValues.get("activity_log.activity_log_id"))
            .intValue();
        values = stripPrefix(filterWithPrefix(fieldValues, "activity_log."));

        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        // executeDbCommit(context);

        // update work request dispatch values from activtiy_log
        SqlUtils.executeUpdate("wr",
            "UPDATE wr SET wr.supervisor = (select activity_log.supervisor from activity_log where activity_log.activity_log_id="
                    + activity_log_id
                    + "), wr.work_team_id =(select activity_log.work_team_id from activity_log where activity_log.activity_log_id="
                    + activity_log_id + ") where wr.activity_log_id=" + activity_log_id);

        final StepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.confirmStep(stepId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));

        // add to fix KB3029391, update work team from supervisor
        updateWorkTeamFromSupervisor();
    }

    /**
     *
     * Dispatch a work request.<br />
     *
     * @param String stepId
     * @param String comments
     */
    public void dispatchWorkRequest(final JSONObject wrRecord, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final Map fieldValues = parseJSONObject(context, wrRecord);
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));

        executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);

        final int wrId = wrRecord.getInt("wr.wr_id");

        // update activtiy_log dispatch values from work request
        SqlUtils.executeUpdate("activity_log",
            "UPDATE activity_log SET activity_log.supervisor = (select wr.supervisor from wr where wr.wr_id="
                    + wrId
                    + "), activity_log.work_team_id =(select wr.work_team_id from wr where wr.wr_id="
                    + wrId
                    + ") where exists(select 1 from wr where wr.activity_log_id = activity_log.activity_log_id and wr.wr_id="
                    + wrId + ")");

        final StepManager stepmgr = new OnDemandWorkStepManager(context, wrId);
        stepmgr.confirmStep(wrRecord.getInt("wr_step_waiting.step_log_id"), comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));

        updateWorkTeamFromSupervisor();
    }

    /**
     *
     * Reject Dispatch a work request.<br />
     *
     * @param String stepId
     * @param String comments
     */
    public void rejectDispatchWorkRequest(final JSONObject wrRecord, final String comments) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final StepManager stepmgr =
                new OnDemandWorkStepManager(context, wrRecord.getInt("wr.wr_id"));
        stepmgr.rejectStep(wrRecord.getInt("wr_step_waiting.step_log_id"), comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));

        archiveWorkRequest(wrRecord.getInt("wr.wr_id"));
    }

    /**
     *
     * Save Work Request Verification.<br />
     * A supervisor can verify the work after a request has been completed by the craftsperson(s).
     * Confirming the verification step does not change the basic status of the work request, but
     * changes the step status to Verified
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
     * <li>{@link com.archibus.eventhandler.steps.StepManager#confirmStep(int, String, String)
     * Confirm verification}</li>
     * <li>{@link #checkWorkorder(EventHandlerContext, String, int) Check if work order
     * date_completed can be set}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record,wr_step_waiting JSONObject record
     *            </p>
     */
    public void verifyWorkRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);

        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final int wr_id =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.wr_id")).intValue();

        final String comments = notNull(fieldValues.get("wr_step_waiting.comments"));
        confirmStep(context, wr_id, stepId, comments);

        checkWorkorder(context, "Com", wr_id);
    }

    /**
     *
     * Save Rejection of work request verification.<br/>
     * A supervisor can verify the work after a request has been completed by the craftsperson(s).
     * If he thinks the work is not completed succesfully, he can reject the verification and send
     * the work request back to the craftsperson(s). This sets the status of the work request back
     * to 'Issued'
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
     * <li>{@link com.archibus.eventhandler.steps.StepManager#rejectStep(int, String, String) Reject
     * verification}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record,wr_step_waiting JSONObject record
     *            </p>
     */
    public void returnWorkRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);

        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final int wr_id =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.wr_id")).intValue();
        final String comments = notNull(fieldValues.get("wr_step_waiting.comments"));

        final StepManager stepmgr = new OnDemandWorkStepManager(context, wr_id);
        stepmgr.reissueStep(stepId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));

        checkWorkorder(context, "Com", wr_id);
        // Back out inventory.
        backOutInventory(context, wr_id);
    }

    /**
     * Save satisfaction survey.
     */
    public void saveSatisfaction(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);

        // save satisfaction fields of activity_log
        final Map activityLogValues =
                stripPrefix(filterWithPrefix(fieldValues, Constants.ACTION_ITEM_TABLE + "."));

        // save satisfaction fields of activity_log
        final Map wrValues =
                stripPrefix(filterWithPrefix(fieldValues, Constants.WORK_REQUEST_TABLE + "."));

        executeDbSave(context, Constants.ACTION_ITEM_TABLE, activityLogValues);
        executeDbSave(context, Constants.WORK_REQUEST_TABLE, wrValues);

        confirmStep(context, record.getInt("wr.wr_id"),
            record.getInt("wr_step_waiting.step_log_id"),
            notNull(record.getString("wr.satisfaction_notes")));
    }

    /**
     *
     * Complete work request scheduling.<br/>
     * After the supervisor has assigned craftspersons and tools to a work request he can complete
     * the scheduling. This sets the stepstatus of the work request to scheduled and possibly
     * triggers approval and/or notification steps.
     *
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
     * <li>{@link com.archibus.eventhandler.steps.StepManager#confirmStep(int, String, String)
     * Confirm schedule completion}</li>
     * <li>{@link #checkWorkOrderScheduling(EventHandlerContext, int) Check Work Order Scheduling}
     * </li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record,table wr_step_waiting JSONObject record
     *            </p>
     * @throws DocumentException
     */
    public void completeScheduling(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);

        final int step_log_id =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();

        // fields of wr
        final Map wrValues = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        if (wrValues.get("status") != null) {
            executeDbSave(context, "wr", wrValues);
            // executeDbCommit(context);
        }

        final int wr_id = getIntegerValue(context, fieldValues.get("wr.wr_id")).intValue();
        confirmStep(context, wr_id, step_log_id, null);

        final Object wo = selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id);
        if (wo != null) {
            final int wo_id = getIntegerValue(context, wo);
            checkWorkOrderScheduling(context, wo_id);
        }
    }

    /**
     *
     * Check if all work requests of the work order to which the given work request belongs are
     * scheduled. <br/>
     * If all work requests of a work order are scheduled the date_assigned of a work order is set
     * to the first start date of all craftsperson assignments for the work requests attached to
     * this work order. If the date_assigned of a work order is filled in the work order can be
     * issued.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select work order the given work request belongs to</li>
     * <li>Get scheduling records from helpdesk_step_log for work requests attached to this work
     * order</li>
     * <li>If all work requests are scheduled, update date_assigned of the work order to the first
     * start date in wrcf for these work requests</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> Query to check if all work requests are scheduled (if scheduling is required):
     * <br />
     * (This query returns records for the work requests which are still waiting for a schedule)
     * <div> SELECT step_code, step FROM helpdesk_step_log<br />
     * WHERE step_type='scheduling' AND table_name='wr' AND field_name='wr_id'<br />
     * AND pkey_value IN (SELECT wr_id FROM wr WHERE wo_id = <i>wo_id</i>)<br />
     * AND date_response IS NULL AND time_response IS NULL. </div> Query to update the work order
     * date assigned: <div>UPDATE wo SET date_assigned =<br />
     * (SELECT MIN(date_start) FROM wrcf WHERE wr_id IN <br />
     * &nbsp;&nbsp;(SELECT wr_id FROM wr WHERE wo_id = "+ wo_id+")<br />
     * ) WHERE wo_id = " + wo_id;
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Work Request (recently scheduled)
     *            </p>
     */
    private void checkWorkOrderScheduling(final EventHandlerContext context, final int wo_id) {
        final String[] fields = { "step_code", "step" };
        final String where = "step_type='scheduling' AND table_name = 'wr' AND field_name='wr_id' "
                + "AND pkey_value IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id + ")"
                + "AND date_response IS NULL AND time_response IS NULL";
        final List records = selectDbRecords(context, Constants.STEP_LOG_TABLE, fields, where);
        if (records.isEmpty()) {
            // if all wr's are scheduled wo.date_assigned is set to the
            // first date work starts
            final String sql =
                    "UPDATE wo SET date_assigned = (SELECT MIN(date_start) FROM wrcf WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = "
                            + wo_id + ")) WHERE wo_id = " + wo_id;
            executeDbSql(context, sql, true);
            // executeDbCommit(context);
        }

    }

    /**
     *
     * Complete work request estimation.<br />
     * After the supervisor has added trades, tooltypes and other resources and has reserved parts
     * for a work request. He can complete the estimation of the work request. This sets the step
     * status to 'Estimated' and does not change the basic status of the work request.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted (for <code>wr</code> and <code>wr_step_waiting</code>)
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Confirm estimation completion}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String wr
     * @param String wrId
     * @param String wrId1
     * @param JSONObject record,table wr_step_waiting JSONObject record
     *            </p>
     * @throws DocumentException
     */
    public void completeEstimation(final String wr, final String wrId, final String wrId1,
            final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final int step_log_id =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final int wr_id = getIntegerValue(context, fieldValues.get("wr.wr_id")).intValue();

        // fields of wr
        final Map wrValues = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        if (wrValues.get("status") != null) {
            executeDbSave(context, "wr", wrValues);
            // executeDbCommit(context);
        }

        confirmStep(context, wr_id, step_log_id, null);
    }

    /**
     *
     * Edit and Approve Work Request.
     *
     * @param JSONObject record,table wr_step_waiting JSONObject record
     * @param String comments
     */
    public void editAndApproveWorkRequest(final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // @translatable
        final String localizedString_Comments = localizeString(context, "Comments");
        final Map fieldValues = parseJSONObject(context, record);
        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        // overwrite values with new values
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        final int wrId = getIntegerValue(context, values.get("wr_id")).intValue();

        final String currentStatus =
                notNull(selectDbValue(context, "wr", "status", " wr_id = " + wrId));
        // for Edit and Approve - Rejected step, we need update the status to original status
        // to make sure the sla work in the correct order
        if ("Rej".equals(currentStatus)) {
            final String rejectedStep = notNull(selectDbValue(context, "helpdesk_step_log",
                "rejected_step", " step_log_id = " + stepId));
            if (rejectedStep.indexOf(";") != -1) {
                final String status = rejectedStep.split(";")[0];
                final Map wrValues = new HashMap();
                wrValues.put("wr_id", wrId);
                wrValues.put("status", status);
                executeDbSave(context, Constants.WORK_REQUEST_TABLE, wrValues);
            }
        }

        final List changedFields =
                checkRequestChanged(context, Constants.WORK_REQUEST_TABLE, "wr_id", wrId, values);

        if (!changedFields.isEmpty()) {

            final String[] fields = { "priority", "site_id", "bl_id", "fl_id", "rm_id", "eq_id",
                    "prob_type", "pmp_id", "dv_id", "dp_id" };

            final Object[] oldRecord = selectDbValues(context, "wr", fields, " wr_id = " + wrId);
            final Map oldValues = new HashMap();
            for (int i = 0; i < fields.length; i++) {
                oldValues.put(fields[i], notNull(oldRecord[i]));
            }

            // get the existing SLA on database values
            final ServiceLevelAgreement oldSla = ServiceLevelAgreement.getInstance(context,
                Constants.WORK_REQUEST_TABLE, "wr_id", wrId);

            executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);
            // executeDbCommit(context);
            syncWoBuildingCode(wrId);

            // get new SLA, by using the constructor we are sure to reload the new SLA
            final ServiceLevelAgreement newSla =
                    new ServiceLevelAgreement(context, Constants.WORK_REQUEST_TABLE, "wr_id", wrId);

            // if sla's are different
            if (!(newSla.equals(oldSla))) {
                // KB3047677 - Remove the old CF or trade since the old SLA no longer applies.
                SqlUtils.executeUpdate("wrcf", "delete from wrcf where wrcf.wr_id = " + wrId);
                SqlUtils.executeUpdate("wrtr", "delete from wrtr where wrtr.wr_id = " + wrId);

                // KB3032155 - update Escalation times base on the new sla
                updateWorkRequestFromSLA(context, wrId);

                // changed request matches other service level agreement
                final OnDemandWorkStepManager stepmgr = new OnDemandWorkStepManager(context, wrId);
                final String userName = ContextStore.get().getUser().getName();
                final String changeComments =
                        getRequestParametersChangeComments(changedFields, oldValues, values, false);
                String message = changeComments;

                // KB3040465 - add user comments to the end
                if (StringUtil.notNullOrEmpty(comments)) {
                    message += " " + localizedString_Comments + ": " + comments;
                }
                stepmgr.endAllPendingSteps(message, userName);

                final OnDemandWorkStatusManager statusmgr =
                        new OnDemandWorkStatusManager(context, wrId);

                if (newSla.isAutoapprove()) {// end pending approval steps and set status to
                                             // approved
                    statusmgr.updateStatus("A");
                } else {
                    final Map step = newSla.hasStepOfType("R", "review");
                    String currentEmId = "";
                    if (ContextStore.get().getUser().getEmployee() != null) {
                        currentEmId = ContextStore.get().getUser().getEmployee().getId();
                    }
                    if (step != null && step.get("em_id") != null
                            && step.get("em_id").equals(currentEmId)) {
                        final int stepOrder = (Integer) step.get("step_order");
                        stepmgr.setStepOrder(stepOrder);

                        // start first step after Edit & Approve step if the approver is same
                        stepmgr.invokeNextStep();
                    } else {
                        // start first step for the new SLA
                        stepmgr.invokeFirstStep();
                    }
                }

                // KB3044963 - add new field wr.priority_label and update wr.priority_label value
                // when change the new sla in Edit and Approve step
                updatePriorityLabelOfWorkRequest(wrId);

            } else {
                final String changeComments =
                        getRequestParametersChangeComments(changedFields, oldValues, values, true);
                String message = changeComments;

                // KB3040465 - add user comments to the end
                if (StringUtil.notNullOrEmpty(comments)) {
                    message += " " + localizedString_Comments + ": " + comments;
                }
                // if the sla is same, just approve the step
                confirmStep(context, wrId, stepId, message);
            }
        } else {
            executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);
            // executeDbCommit(context);
            // if the request parameter not change, just approve the step
            confirmStep(context, wrId, stepId, comments);
        }
    }

    /**
     *
     * Approve Work Request.<br/>
     * A supervisor can be asked to approve the estimation, schedule or completion of a work
     * request. This does not change the basic status of the work request.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted (for <code>wr</code> and <code>wr_step_waiting</code>)
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save work request (extra fields from approval)</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Confirm approval}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record,table wr_step_waiting JSONObject record
     * @param String comments
     *            </p>
     * @throws DocumentException
     */
    public void approveWorkRequest(final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        // fields of wr
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        executeDbSave(context, "wr", values);
        // executeDbCommit(context);

        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        confirmStep(context, wr_id, stepId, comments);
    }

    /**
     *
     * Reject work request.<br />
     * This sets the basic status of the work request to 'Rejected'.
     *
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
     * <li>Save work request record in <code>wr</code>(extra fields from approval)</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Reject approval}</li>
     * <li>{@link #archiveWorkRequest(EventHandlerContext, int) Archive rejected work request}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject recordWr,table wr_step_waiting JSONObject record
     * @param String comments
     */
    public void rejectWorkRequest(final JSONObject recordWr, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, recordWr);

        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        executeDbSave(context, "wr", values);
        // executeDbCommit(context);

        final int wr_id = getIntegerValue(context, fieldValues.get("wr.wr_id")).intValue();

        rejectStep(context, wr_id, stepId, comments);
        checkPartsRejectedWr(context, wr_id);

        final List woRecords = selectDbRecords(context, "wo", new String[] { "wo_id" },
            "exists(select 1 from wr where wr.wo_id=wo.wo_id and wr.wr_id=" + wr_id + ")");

        // v21.2, work order may not create for status 'R', so add a check befor call logic related
        // to work order
        if (!woRecords.isEmpty()) {
            checkWorkorder(context, "Rej", wr_id);
            // select all wr of the wo
            final List records = selectDbRecords(context,
                "SELECT wo_id FROM wr WHERE wo_id = (select wo_id from wr where wr_id = " + wr_id
                        + ")");
            if (records.size() == 1) {
                final Object[] rec = (Object[]) records.get(0);
                if (rec[0] != null) {
                    context.addResponseParameter("wo_id", rec[0]);

                    final int wo_id = getIntegerValue(context, rec[0]).intValue();
                    recalculateWorkOrderCosts(context, wo_id);

                    archiveWorkOrder(context);
                } else {
                    archiveWorkRequest(wr_id);
                }
            } else { // records.size() == 0 or records.size() > 1
                archiveWorkRequest(wr_id);
                if (!records.isEmpty()) {
                    final Object[] record = (Object[]) records.get(0);
                    if (record != null) {
                        final int wo_id = getIntegerValue(context, record[0]).intValue();
                        recalculateWorkOrderCosts(context, wo_id);
                    }
                }
            }
            checkWorkorder(context, null, wr_id);
        } else {
            archiveWorkRequest(wr_id);
        }
    }

    /**
     *
     * Update work request status.<br/>
     * After a work request is issued the basic status can change to different values:
     * <ul>
     * <li>On Hold for Access (HA)</li>
     * <li>On Hold for Parts (HP)</li>
     * <li>On Hold for Labor (HL)</li>
     * <li>Stopped (S)</li>
     * <li>Completed (Com)</li>
     * </ul>
     * These statuses can be set by the supervisor or the craftsperson. When the work is put on
     * hold, it can also be reissued setting the status back to Issued (I).
     *
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
     * <li>Save work request</li>
     * <li>{@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) Update work
     * request status}</li>
     * <li>{@link #checkWorkorder(EventHandlerContext, String, int) Check if the work order needs to
     * be updated}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String wr
     * @param String wr_id1
     * @param String wr_id2
     * @param JSONObject record
     * @param String status
     *            </p>
     * @throws DocumentException
     */
    public void updateWorkRequestStatus(final JSONObject record, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);

        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final String old_status = Common.getStatusValue(context, "wr", "wr_id", wr_id);

        executeDbSave(context, "wr", values);
        updateServiceRequestFromWorkRequestRecord(wr_id);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);

        if (!status.equals(old_status)) {
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus(status);
            this.endBasicSteps(wr_id);
            checkWorkorder(context, status, wr_id);
            if ("Com".equals(status) || "S".equals(status)) {
                SqlUtils.executeUpdate("wrcf",
                    "update wrcf set status = 'Complete' where wrcf.wr_id = " + wr_id);
                // KB#3050988 Part inventory is not updated by parts added after estimation step
                updateInventory(context, wr_id);
            }
        }
    }

    /**
     *
     * Updates the status of a mobile work request - Derived from updateWorkRequestStatus -
     * Constantine Kriezis
     *
     * @param wrId
     * @param status
     */
    public void updateMobileWorkRequestStatus(final int wrId, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final StatusManager statusManager = new OnDemandWorkStatusManager(context, wrId);
        statusManager.updateStatus(status);

        checkWorkorder(context, status, wrId);

        if ("Com".equals(status) || "S".equals(status)) {
            SqlUtils.executeUpdate("wrcf",
                "update wrcf set status = 'Complete' where wrcf.wr_id = " + wrId);
            // KB#3050988 Part inventory is not updated by parts added after estimation step
            updateInventory(context, wrId);
        }
    }

    /**
     * Checks if all work requests of a work order have the same status and updates the work order
     * if so.<br />
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select work order to which the given work request is attached</li>
     * <li>Select all work request records from <code>wr</code> attached to the selected work order
     * with another status than the given status or with the given status and step status not null.
     * (e.g. completed, but waiting for verification)
     * <li>If this query does not return records and the given status is 'Completed', update the
     * date and time_completed in the work order table</li>
     * </ol>
     * </p>
     *
     * @param context Workflow rule execution context
     * @param status current status of given work request
     * @param wr_id recently updated work request
     */
    private void checkWorkorder(final EventHandlerContext context, final String status,
            final int wr_id) {
        // update open wr in wo(open = approved but not yet closed)
        // KB3042435 - use wrhwr view to query work order to make sure it still can get the work
        // order if work request was archived
        final Object result = selectDbValue(context, "wrhwr", "wo_id", "wr_id=" + wr_id);

        final Integer wo_id = getIntegerValue(context, result);
        if (wo_id != null) {
            // update open work request number of work order
            updateOpenWrNumOfWo(wo_id.toString());

            if (status != null) {
                // KB3044653 - the Date_Completed fields in the WO table are not always populated
                // when
                // one work request status is closed, and the other work request is completed
                if (status.equals("Com")) {
                    final String where = "wo_id = " + wo_id + " AND "
                            + "(status NOT IN ('Rej','Can','Com','Clo','S'))";
                    final List records = selectDbRecords(context, "wr",
                        new String[] { "wo_id", "wr_id", "status" }, where);
                    if (records.isEmpty()) { // all wr's of the wo have the same
                        // last wr completed => set wo complete
                        final Map<String, String> map =
                                Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
                        final Map values = new HashMap();
                        values.put("date_completed", LocalDateTimeStore.get().currentLocalDate(null,
                            null, map.get("siteId"), map.get("blId")));
                        values.put("time_completed", LocalDateTimeStore.get().currentLocalTime(null,
                            null, map.get("siteId"), map.get("blId")));
                        values.put("wo_id", wo_id);
                        executeDbSave(context, "wo", values);
                        // Guo changed 2009-01-15 for KB3021405
                        // executeDbCommit(context);
                    }

                }

                // KB 3016544 default step status 'none'
                final String where = "wo_id = " + wo_id + " AND " + "(status != "
                        + literal(context, status) + " OR (status = " + literal(context, status)
                        + " AND NOT step_status IS NULL AND step_status != "
                        + literal(context, Constants.STEP_STATUS_NULL) + "))";
                final List records = selectDbRecords(context, "wr",
                    new String[] { "wo_id", "wr_id", "status" }, where);
                if (records.isEmpty()) { // all wr's of the wo have the same
                    // status

                    final String helpRequestStatus = StatusConverter.getActionStatus(status);
                    final Object tmp =
                            selectDbValue(context, Constants.ACTION_ITEM_TABLE, "activity_log_id",
                                "wo_id = (SELECT wo_id FROM wr WHERE wr_id = " + wr_id + ")");
                    if (helpRequestStatus != null && tmp != null) {
                        final Integer activity_log_id = getIntegerValue(context, tmp);
                        final StatusManager manager =
                                new HelpdeskStatusManager(context, activity_log_id.intValue());
                        manager.updateStatus(helpRequestStatus);
                        return;
                    }
                }
            }

            // KB 3016544 default step status 'none'
            final String where = " wo_id =  " + wo_id + " AND "
                    + "(status NOT IN ('Com', 'Can', 'S','Rej') OR (status IN ('Com', 'Can', 'S','Rej') AND step_status IS NOT NULL AND step_status != "
                    + literal(context, Constants.STEP_STATUS_NULL) + "))";
            final List records = selectDbRecords(context, "wr",
                new String[] { "wo_id", "wr_id", "status" }, where);
            if (records.isEmpty()) {// wo contains no open wrs
                // check if help request exists for wo
                final String helpRequestStatus = StatusConverter.getActionStatus(status);
                final Object tmp = selectDbValue(context, Constants.ACTION_ITEM_TABLE,
                    "activity_log_id", "wo_id = " + wo_id);
                if (tmp != null) {// update help request status to completed
                    final Integer activity_log_id = getIntegerValue(context, tmp);
                    final StatusManager manager =
                            new HelpdeskStatusManager(context, activity_log_id);
                    manager.updateStatus(helpRequestStatus,
                        StatusConverter.getActionDateField(helpRequestStatus),
                        StatusConverter.getActionTimeField(helpRequestStatus));
                }
            }
        }
    }

    /**
     * Update open work requests number of selected work order---field wo.qty_open_wr.
     *
     * @param context Workflow rule execution context
     * @param status current status of given work request
     * @param wr_id recently updated work request
     */
    private void updateOpenWrNumOfWo(final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        executeDbSql(context,
            "UPDATE wo SET qty_open_wr = " + "(SELECT COUNT(wr_id) FROM wr WHERE wo_id = " + woId
                    + " AND wr.status NOT IN ('S','Can','Com','Clo','Rej') AND wo.date_issued IS NOT NULL)"
                    + " WHERE wo_id = " + woId,
            false);

        // executeDbCommit(context);
    }

    /**
     *
     * Retrieves remaining hours to schedule the given tool type for the work request. This is the
     * difference between hours estimated and hours scheduled.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tool_type : Tool type</li>
     * <li>wr_id : Work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with estimation<br />
     * <code>{estimation : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Select difference between hours estimated and hours scheduled for given tooltype from
     * table <code>wrtt</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT hours_est - hours_sched FROM wrtt WHERE wr_id = ? AND tool_type =
     * ?</div>
     * </p>
     * <p>
     *
     * @param String tool_type
     * @param String wr_id1
     *            </p>
     */
    public void getEstimationFromToolType(final String tool_type, final String wr_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wr_id = Integer.parseInt(wr_id1);

        final JSONObject results = new JSONObject();
        final String est = formatSqlIsNull(context, "hours_est,0");
        final String sched = formatSqlIsNull(context, "hours_sched,0");
        final String sql = "SELECT " + est + "-" + sched + " FROM wrtt WHERE wr_id = " + wr_id
                + " AND tool_type = " + literal(context, tool_type);
        final List records = selectDbRecords(context, sql);

        if (!records.isEmpty()) {
            final Object[] rec = (Object[]) records.get(0);
            results.put("estimation", rec[0]);
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }

    /**
     *
     * Retrieves worktype and remaining hours to schedule the given trade for the work request. This
     * is the difference between hours estimated and hours scheduled.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tr_id : Trade Code</li>
     * <li>wr_id : Work request Code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with estimation and work_type<br />
     * <code>{estimation : ?, work_type: ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Select difference between hours estimated and hours scheduled for given trade and work
     * request</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT hours_est - hours_sched FROM wrtr WHERE wr_id = ? AND tr_id = ?</div>
     * </p>
     * <p>
     *
     * @param String tr_id
     * @param String wrId
     *            </p>
     */
    public void getEstimationFromTrade(final String tr_id, final String wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final int wr_id = Integer.parseInt(wrId);

        final JSONObject results = new JSONObject();
        final String est = formatSqlIsNull(context, "hours_est,0");
        final String sched = formatSqlIsNull(context, "hours_sched,0");
        final String sql = "SELECT " + est + "-" + sched + ", work_type FROM wrtr WHERE wr_id = "
                + wr_id + " AND tr_id = " + literal(context, tr_id);

        final List recs = selectDbRecords(context, sql);

        if (!recs.isEmpty()) {
            final Object[] rec = (Object[]) recs.get(0);
            results.put("estimation", rec[0]);
            results.put("work_type", rec[1]);
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }

    /**
     * Link the given help request to an existing work request.<br />
     * This sets the <code>wr_id</code> field in the <code>activity_log</code> table to the work
     * request code of the given work request and the <code>supervisor</code> to the current user.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wr_id : work request code</li>
     * <li>activity_log_id : help request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Update help request record in <code>activity_log</code> with wr_id and supervisor</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String wr_id1
     * @param String activity_log_id1
     *            </p>
     */
    public void linkHelpRequestToWorkRequest(final String wr_id1, final String activity_log_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final int wr_id = Integer.parseInt(wr_id1);
        final int activity_log_id = Integer.parseInt(activity_log_id1);

        final Map values = new HashMap();
        values.put("activity_log_id", new Integer(activity_log_id));
        values.put("wr_id", new Integer(wr_id));

        // current user becomes supervisor of this request
        values.put("supervisor",
            getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);
    }

    /**
     *
     * Create new work request based on given help request.<br />
     * This creates a new record in <code>wr</code> with values copied from the given record in the
     * <code>activity_log</code> table.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray with JSONObjects with activity_log_id of requests to create a work
     * request for</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#createWorkRequestFromActionItem(EventHandlerContext, int, boolean)
     * Create Work Request from Action Item} for each action item in the records array</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONArray records
     * @param JSONArray documents1
     *            </p>
     */
    public void createWorkRequestFromHelpRequest(final JSONArray records,
            final JSONArray documents1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("records", records);
        context.addInputParameter("documents", documents1);
        int wr_id = 0;
        int activity_log_id = 0;
        final JSONArray result = new JSONArray();

        // No records need to create Work Request.
        if (records == null || records.length() == 0) {
            return;
        }

        JSONObject record = new JSONObject();
        JSONObject tmp = new JSONObject();

        for (int i = 0; i < records.length(); i++) {
            record = records.getJSONObject(i);
            activity_log_id = record.getInt("activity_log.activity_log_id");
            wr_id = createWorkRequestFromActionItem(context, activity_log_id, true);

            tmp = new JSONObject();
            tmp.put("wr_id", wr_id);
            result.put(tmp);
        }

        context.addResponseParameter("jsonExpression", result.toString());

    }

    /**
     *
     * Check if a work request should be automatically scheduled.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sla : Service Level Agreement for current request</li>
     * <li>wr_id : Work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>{@link ServiceLevelAgreement#isAutoschedule() Check autoschedule in SLA}</li>
     * <li>If autoschedule create new record in <code>wrtr</code> and <code>wrcf</code> for given
     * work request and craftsperson from the SLA</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#checkWorkOrderScheduling(EventHandlerContext, int)
     * Check if workorder needs to be updated} and if
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#checkAutoIssue(EventHandlerContext)
     * work request should be autoissued}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @return autoschedule
     *         </p>
     */
    public boolean checkAutoSchedule(final EventHandlerContext context) {
        final ServiceLevelAgreement sla = (ServiceLevelAgreement) context.getParameter("sla");
        final int wr_id = context.getInt("wr.wr_id");

        if (sla.isAutoschedule()) {
            // issued
            createDefaultEstimationAndScheduling(context, wr_id, sla);
            final Integer wo_id = getIntegerValue(context,
                selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id));
            checkWorkOrderScheduling(context, wo_id);
            if (!checkAutoIssue(context)) {
                // KB3044557 - only notify supervisor when Notify supervisor(s) = Yes
                if (sla.isNotifyServiceProvider()) {
                    notifySupervisor(context, "Sch", "wo", wo_id);
                }
            }

            return true;
        } else {
            return false;
        }

    }

    /**
     *
     * Check if a work request should be automatically issued.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sla : Service Level Agreement for current request</li>
     * <li>wr.wr_id : Work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Get work order for current work request</li>
     * <li>{@link ServiceLevelAgreement#isAutoissue() Check SLA for autoissue}</li>
     * <li>If autoissue,
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#issueWorkorder(EventHandlerContext)
     * issue workorder}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @return autoissue
     *         </p>
     */
    public boolean checkAutoIssue(final EventHandlerContext context) {
        final ServiceLevelAgreement sla = (ServiceLevelAgreement) context.getParameter("sla");
        final int wr_id = context.getInt("wr.wr_id");
        final Integer wo_id =
                getIntegerValue(context, selectDbValue(context, "wr", "wo_id", "wr_id =" + wr_id));

        final String sql = "SELECT COUNT (wr_id) FROM wr WHERE wo_id = " + wo_id;
        final List<Object[]> statistics = selectDbRecords(context, sql);
        final Object[] rec = statistics.get(0);
        final Integer countWr = getIntegerValue(context, rec[0]);
        if (countWr.intValue() > 1) {
            return false;
        }

        context.addResponseParameter("wo_id", wo_id);
        if (sla.isAutoissue()) {
            issueWorkorder(String.valueOf(wo_id));
            if (sla.isNotifyServiceProvider()) {
                notifySupervisor(context, "I", "wo", wo_id);
            }
            return true;
        }
        return false;
    }

    /**
     *
     * Close work order.<br />
     * A work order can be closed if all its work requests are completed, so if its date completed
     * is filled in (by {@link #checkWorkorder(EventHandlerContext, String, int)}). All attached
     * work requests will also be closed, setting the status to 'Clo' using the {@link StatusManager
     * status manager}.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wo_id : work order code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Close all work request attached to given workorder (except the rejected) with the
     * {@link com.archibus.eventhandler.steps.StatusManager status manager}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateWorkOrderCosts(EventHandlerContext, int)
     * Update work order costs}</li>
     * <li>Set work order <code>date_closed</code> in <code>wo</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#updateInventory(EventHandlerContext, int)
     * Update parts inventory}</li>
     * <li>Check if the work order should be {@link #archiveWorkOrder(EventHandlerContext) archived}
     * , and do if so</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String woId
     *            </p>
     */
    public void closeWorkOrder(final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("wo_id", woId);
        final int wo_id = Integer.parseInt(woId);

        // KB3037603 - if work order has been closed, do nothing
        final List woRecords =
                selectDbRecords(context, "wo", new String[] { "wo_id" }, "wo_id=" + wo_id);
        if (woRecords.isEmpty()) {
            return;
        }

        // make sure all records are Completed, Cancelled, Stopped or Rejected
        List records = selectDbRecords(context, "wr", new String[] { "wr_id", "status" },
            // KB 3016544 default step status 'none'
            "wo_id = " + wo_id + " AND (status IN ('R','A','AA','I','Rev','HP', 'HA', 'HL')"
                    + " OR (status = 'Com' AND step_status != "
                    + literal(context, Constants.STEP_STATUS_NULL) + "))");
        if (records != null && records.size() > 0) {
            final String errorMessage = localizeString(context,
                "Complete all work requests before closing the work order with id [{0}]");
            final Object[] args = { Integer.toString(wo_id) };
            throw new ExceptionBase(errorMessage, args, true);
        }

        // close all work requests and update inventory
        records = selectDbRecords(context, "wr", new String[] { "wr_id", "status" },
            "wo_id = " + wo_id);

        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final Integer wr_id = getIntegerValue(context, record[0]);
            final String status = notNull(record[1]);

            if (!status.equals("Rej") && !status.equals("Can")) {// don't close rejected work
                                                                 // requests
                final StatusManager statusManager =
                        new OnDemandWorkStatusManager(context, wr_id.intValue());
                statusManager.updateStatus("Clo");
            }

            updateInventory(context, wr_id.intValue());
        }

        // update wo costs + date/time_closed
        recalculateWorkOrderCosts(context, wo_id);
        final Map<String, String> map =
                Common.getSiteBuildingIds("wo", "wo_id", String.valueOf(wo_id));

        final Map values = new HashMap();
        values.put("wo_id", new Integer(wo_id));
        values.put("date_closed", LocalDateTimeStore.get().currentLocalDate(null, null,
            map.get("siteId"), map.get("blId")));
        values.put("time_closed", LocalDateTimeStore.get().currentLocalTime(null, null,
            map.get("siteId"), map.get("blId")));
        executeDbSave(context, "wo", values);
        // executeDbCommit(context);

        // check if help request exists for wo
        final Object tmp = selectDbValue(context, Constants.ACTION_ITEM_TABLE, "activity_log_id",
            "wo_id = " + wo_id);
        if (tmp != null) {// update help request status to completed
            final Integer activity_log_id = getIntegerValue(context, tmp);
            final StatusManager manager =
                    new HelpdeskStatusManager(context, activity_log_id.intValue());
            manager.updateStatus("CLOSED");
        }

        /*
         * boolean autoArchive = false; if(getActivityParameterInt(context,
         * Constants.ONDEMAND_ACTIVITY_ID, "AUTO_ARCHIVE") != null) autoArchive =
         * getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
         * "AUTO_ARCHIVE").intValue() > 0;
         *
         * //archive work order + work requests if (autoArchive) archiveWorkOrder(context);
         */

        // when closing a workorder the auto-archive is always performed to
        // be compatible with the work wizard
        archiveWorkOrder(context);
    }

    /**
     * Close work orders.
     *
     * JSONArray records,wo_id record array
     */
    public void closeWorkOrders(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        int wo_id = 0;
        if (records.length() > 0) {
            final StringBuffer inWo = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                wo_id = getIntegerValue(context, values.get("wo_id")).intValue();
                inWo.append("," + wo_id);
            }

            // check if all given WO's can be closed
            final List wo_records = selectDbRecords(context, "wr",
                new String[] { "wr_id", "status" }, "wo_id IN (" + inWo.substring(1)
                // KB 3016544 default step status 'none'
                        + ") AND (status IN ('R','A','AA','I','Rev','HP', 'HA', 'HL') OR (status = 'Com' AND step_status != "
                        + literal(context, Constants.STEP_STATUS_NULL) + "))");
            if (wo_records != null && wo_records.size() > 0) {
                final String errorMessage = localizeString(context,
                    "Close Failed: Not all Work Orders selected can be closed. Please select only the Work Orders that can be closed and try again.");
                throw new ExceptionBase(errorMessage, true);
            }

            // close WO's one by one
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                wo_id = getIntegerValue(context, values.get("wo_id")).intValue();

                context.addResponseParameter("wo_id", new Integer(wo_id));
                closeWorkOrder(String.valueOf(wo_id));
            }
        }
    }

    /**
     * Close Work Request.
     *
     * @param record ,record string that contain jsonobject
     */
    public void closeWorkRequest(final String record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map fieldValues = new HashMap();
        try {
            final JSONObject o = new JSONObject("" + record + "");
            fieldValues = parseJSONObject(context, o);

        } catch (final Exception e) {

        }
        final Map values = stripPrefix(fieldValues);
        executeDbSave(context, "wr", values);

        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final Integer wo_id = getIntegerValue(context, values.get("wo_id"));

        final String status = (String) values.get("status");
        if (!status.equals("Rej") && !status.equals("Can")) {// don't close
            // rejected work
            // requests
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus("Clo");
        }
        // recalculateCosts(context, wr_id);
        // KB#3050988 Part inventory is not updated by parts added after estimation step
        // updateInventory(context, wr_id);

        final Set woToClose = new TreeSet();
        woToClose.add(wo_id);

        checkWoClose(context, woToClose);
    }

    /**
     * Close Work Request from Mobile App.
     *
     * If the work order is empty, it is also closed and archived.
     *
     * @param String wrId
     */
    public void closeWorkRequestMobile(final String wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wr_id = Integer.parseInt(wrId);

        final Object[] tmp = selectDbValues(context, "wr", new String[] { "status", "wo_id" },
            "wr_id = " + wrId);

        final String status = (String) tmp[0];
        final Integer wo_id = getIntegerValue(context, tmp[1]);

        if (!status.equals("Rej") && !status.equals("Can")) {
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus("Clo");
        }
        // KB#3050988 Part inventory is not updated by parts added after estimation step
        // updateInventory(context, wr_id);

        final Set woToClose = new TreeSet();
        woToClose.add(wo_id);

        checkWoClose(context, woToClose);
    }

    /**
     * Cancel Work Requests.
     *
     *
     * @param JSONArray records
     */
    public void cancelWorkRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final List<Integer> closedWOs = new ArrayList();

        int wr_id = 0;

        if (records.length() > 0) {
            final Set<Integer> woToClose = new TreeSet<Integer>();

            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                wr_id = getIntegerValue(context, record.get("wr.wr_id")).intValue();
                // when cancel rejected work request, the pending basic step need end
                endBasicSteps(wr_id);

                final Object[] tmp = selectDbValues(context, "wr",
                    new String[] { "status", "wo_id" }, "wr_id = " + wr_id);
                final String status = notNull(tmp[0]);

                // if (!status.equals("AA") && !status.equals("R") && !status.equals("A")
                // && !status.equals("Rej")) {
                // @translatable
                // final String errorMessage = localizeString(context,
                // "Cancel Failed: Only Work Requests not yet issued can be cancelled.");
                // throw new ExceptionBase(errorMessage, true);
                // }

                if (status.equals("I") || status.equals("Com") || DataStatistics.getDouble("wr",
                    "cost_total", "sum", "wr.wr_id=" + wr_id) > 0) {
                    final StatusManager statusManager =
                            new OnDemandWorkStatusManager(context, wr_id);
                    statusManager.updateStatus("S");
                    SqlUtils.executeUpdate("wrcf",
                        "update wrcf set status = 'Complete' where wrcf.wr_id = " + wr_id);

                    updateInventory(context, wr_id);

                } else {
                    final StatusManager statusManager =
                            new OnDemandWorkStatusManager(context, wr_id);
                    statusManager.updateStatus("Can");
                    SqlUtils.executeUpdate("wrcf",
                        "update wrcf set status = 'Complete' where wrcf.wr_id = " + wr_id);
                    updateInventoryAfterCancel(context, wr_id);

                    final Integer wo_id = getIntegerValue(context, tmp[1]);
                    if (wo_id != null) {
                        woToClose.add(wo_id);
                    } else {
                        this.archiveWorkRequest(wr_id);
                    }
                }
            }

            if (!woToClose.isEmpty()) {
                closedWOs.addAll(checkWoClose(context, woToClose));
            }

        }
        final JSONObject result = new JSONObject();
        if (!closedWOs.isEmpty()) {
            result.put("WOclosed", true);
        } else {
            result.put("WOclosed", false);
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * Cancel Work Request.
     *
     *
     * @param String activityLogId
     */
    public void cancelWorkRequest(final int activityLogId) {
        final DataSource ds = DataSourceFactory.createDataSource()
            .addTable("wr", DataSource.ROLE_MAIN).addField("wr_id").addField("activity_log_id");
        final List<DataRecord> records = ds.getRecords("wr.activity_log_id = " + activityLogId);
        for (final DataRecord record : records) {
            cancelWorkRequest(record.getInt("wr.wr_id") + "");
        }

    }

    /**
     * Cancel Work Request.
     *
     *
     * @param String wrId
     */
    public void cancelWorkRequest(final String wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wr_id = Integer.parseInt(wrId);
        // when cancel rejected work request, the pending basic step need end
        endBasicSteps(wr_id);

        final Object[] tmp = selectDbValues(context, "wr", new String[] { "status", "wo_id" },
            "wr_id = " + wr_id);
        // final String status = notNull(tmp[0]);
        // if (!status.equals("AA") && !status.equals("R") && !status.equals("A")
        // && !status.equals("Rej")) {
        // // @translatable
        // final String errorMessage = localizeString(context,
        // "Cancel Failed: Only Work Requests not yet issued can be cancelled.");
        // throw new ExceptionBase(errorMessage, true);
        // }

        final String status = notNull(tmp[0]);
        final Integer wo_id = getIntegerValue(context, tmp[1]);
        final Set<Integer> woToClose = new TreeSet<Integer>();
        if (wo_id != null) {
            woToClose.add(wo_id);
        }

        if (status.equals("I") || status.equals("Com")
                || DataStatistics.getDouble("wr", "cost_total", "sum", "wr.wr_id=" + wrId) > 0) {
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus("S");
            SqlUtils.executeUpdate("wrcf",
                "update wrcf set status = 'Complete' where wrcf.wr_id = " + wr_id);
            updateInventory(context, wr_id);

        } else {
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus("Can");
            SqlUtils.executeUpdate("wrcf",
                "update wrcf set status = 'Complete' where wrcf.wr_id = " + wr_id);
            updateInventoryAfterCancel(context, wr_id);

            if (wo_id == null) {
                this.archiveWorkRequest(wr_id);
            }

            final JSONObject result = new JSONObject();
            result.put("WOclosed", false);

            if (!woToClose.isEmpty()) {
                final List<Integer> closedWOs = checkWoClose(context, woToClose);
                if (!closedWOs.isEmpty()) {
                    final int closedWo = closedWOs.get(0);
                    if (closedWo == wo_id) {// should be
                        result.put("WOclosed", true);
                    }
                } else {
                    result.put("WOclosed", false);
                }
            }

            context.addResponseParameter("jsonExpression", result.toString());
        }

    }

    /**
     * Close Work Requests.
     *
     * If the work order is empty, it is also closed and archived.
     *
     * @param JSONArray records
     */
    public void closeWorkRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        int wr_id = 0;
        if (records.length() > 0) {
            final StringBuffer inWr = new StringBuffer();

            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                inWr.append("," + record.get("wr.wr_id"));
            }

            // check if all given WO's can be closed
            final List wr_records = selectDbRecords(context, "wr",
                new String[] { "wr_id", "status" }, "wr_id IN (" + inWr.substring(1)
                        + ") AND status IN ('R','A','AA','I','Rev','HP', 'HA', 'HL')");
            if (wr_records != null && wr_records.size() > 0) {
                // @translatable
                final String errorMessage = localizeString(context,
                    "Close Failed: Only Completed Work Requests can be closed.");
                throw new ExceptionBase(errorMessage, true);
            }

            final Set woToClose = new TreeSet();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                wr_id = getIntegerValue(context, record.get("wr.wr_id")).intValue();
                final Object[] tmp = selectDbValues(context, "wr",
                    new String[] { "status", "wo_id" }, "wr_id = " + wr_id);
                final String status = (String) tmp[0];

                if (!status.equals("Rej") && !status.equals("Can")) {// don't
                    // close
                    // rejected
                    // work
                    // requests
                    final StatusManager statusManager =
                            new OnDemandWorkStatusManager(context, wr_id);
                    statusManager.updateStatus("Clo");
                }
                // KB#3050988 Part inventory is not updated by parts added after estimation step
                // updateInventory(context, wr_id);
                final Integer wo_id = getIntegerValue(context, tmp[1]);
                woToClose.add(wo_id);
            }

            checkWoClose(context, woToClose);
        }
    }

    /**
     * Check for Work Orders to Close.
     *
     * When closing, rejecting or cancelling work requests, the work order can become empty. Then
     * the work order is closed and archived.
     *
     *
     * @param context
     * @param Set woToClose
     */
    private List<Integer> checkWoClose(final EventHandlerContext context,
            final Set<Integer> woToClose) {
        final List<Integer> closedWo = new ArrayList<Integer>();
        for (final Integer integer : woToClose) {
            final int wo_id = (integer).intValue();
            recalculateWorkOrderCosts(context, wo_id);

            // if all wr's of a work order are closed, the wo can also be closed
            final List testWrs = selectDbRecords(context, "wr", new String[] { "wr_id" },
                "wo_id = " + wo_id + " AND status NOT IN ('Clo','Can')");
            if (testWrs.isEmpty()) {

                final Map<String, String> map =
                        Common.getSiteBuildingIds("wo", "wo_id", String.valueOf(wo_id));

                // update the work orders date and time for close
                final Map<String, Object> values = new HashMap<String, Object>();
                values.put("wo_id", new Integer(wo_id));
                values.put("date_closed", LocalDateTimeStore.get().currentLocalDate(null, null,
                    map.get("siteId"), map.get("blId")));
                values.put("time_closed", LocalDateTimeStore.get().currentLocalTime(null, null,
                    map.get("siteId"), map.get("blId")));
                executeDbSave(context, "wo", values);
                // Guo added to fix KB3020817
                // executeDbCommit(context);

                // check if help request exists for wo
                final Object tmp = selectDbValue(context, Constants.ACTION_ITEM_TABLE,
                    "activity_log_id", "wo_id = " + wo_id);
                if (tmp != null) {// update help request status to completed
                    final Integer activity_log_id = getIntegerValue(context, tmp);
                    final StatusManager manager =
                            new HelpdeskStatusManager(context, activity_log_id.intValue());
                    manager.updateStatus("CLOSED");
                }
                context.addResponseParameter("wo_id", new Integer(wo_id));
                archiveWorkOrder(context);
                closedWo.add(wo_id);
            }
        }
        return closedWo;
    }

    /**
     * Check parts inventory for rejected work requests.<br />
     * If parts are reserved when a work request is rejected the status in <code>wrpt</code> has to
     * be set on 'N' (new request) so the parts can be reserved for another work request. The
     * quantity on hand and on reserve in the parts table <code>pt</code> are also updated.
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from <code>wrpt</code> for rejected work requests, with parts reserved for
     * and attached to the given work order</li>
     * <li>Update the parts inventory</li>
     * <li>Update the status of the records in <code>wrpt</code></li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> Select inventory records for rejected work requests with reserved parts
     * <div> SELECT wrpt.wr_id, wrpt.part_id,wrpt.date_assigned,
     * wrpt.time_assigned,wrpt.qty_estimated<br />
     * FROM wrpt, wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wr.status = 'Rej' AND wrpt.qty_estimated > 0 AND wrpt.status
     * = 'R'<br />
     * AND wr_id =<i>wr_id</i> </div> Update parts inventory <div> UPDATE pt SET <br />
     * qty_on_hand = qty_on_hand +<i>wrpt.qty_estimated</i>,<br />
     * qty_on_reserve = qty_on_reserve -<i>wrpt.qty_estimated</i><br />
     * WHERE part_id = <i>part_id</i>; </div> Update parts reservation <div> UPDATE wrpt SET status
     * = 'N'<br />
     * WHERE wr_id = <i>wr_id</i> AND part_id = <i>part_id</i><br />
     * AND date_assigned = <i>date_assigned</i> AND time_assigned = <i>time_assigned</i> </div>
     * </p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Work Request to check
     */
    private void checkPartsRejectedWr(final EventHandlerContext context, final int wr_id) {

        final String[] wrptFields =
                { "wr_id", "part_id", "date_assigned", "time_assigned", "qty_estimated", "status" };
        final String[] wrFields = { "wr_id", "status" };
        final String sqlRestriction =
                "wr.wr_id = wrpt.wr_id AND wr.status = 'Rej' AND wrpt.qty_estimated > 0"
                        + " AND wrpt.status = 'R' AND wr.wr_id = " + wr_id;

        final DataSource wrptDs =
                DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                    .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFields)
                    .addField("wr", wrFields).addRestriction(Restrictions.sql(sqlRestriction));

        final String[] ptFields = { "part_id", "qty_on_hand", "qty_on_reserve" };
        final DataSource ptDs = DataSourceFactory.createDataSource()
            .addTable("pt", DataSource.ROLE_MAIN).addField("pt", ptFields);

        final List<DataRecord> wrptRecords = wrptDs.getAllRecords();

        if (!wrptRecords.isEmpty()) {
            for (final DataRecord wrptRecord : wrptRecords) {
                final String partId = wrptRecord.getString("wrpt.part_id");
                final double qty_est = wrptRecord.getDouble("wrpt.qty_estimated");

                ptDs.clearRestrictions();
                ptDs.addRestriction(Restrictions.eq("pt", "part_id", partId));

                final List<DataRecord> ptRecords = ptDs.getAllRecords();

                if (!ptRecords.isEmpty()) {
                    for (final DataRecord ptRecord : ptRecords) {
                        double qty_on_hand = ptRecord.getDouble("pt.qty_on_hand");
                        double qty_on_reserve = ptRecord.getDouble("pt.qty_on_reserve");

                        qty_on_hand = qty_on_hand + qty_est;
                        qty_on_reserve = qty_on_reserve - qty_est;

                        ptRecord.setValue("pt.qty_on_hand", qty_on_hand);
                        ptRecord.setValue("pt.qty_on_reserve", qty_on_reserve);

                        ptDs.saveRecord(ptRecord);
                    }

                    // update batch
                    // ptDs.commit();
                }

                wrptRecord.setValue("wrpt.status", "N");
                wrptDs.saveRecord(wrptRecord);

                // KB#3042273: modified for Bali3 Part Inventory Improvement
                if (BldgopsPartInventoryUtility.isSchemaChanged()) {
                    final BldgopsPartInventory partInv = new BldgopsPartInventory(partId);
                    partInv.updateStatusForRequestReject(wrptRecord);
                }
            }

            // update batch.
            // wrptDs.commit();
        }
    }

    /**
     * Archive work orders param context Workflow rule execution context
     */
    public void archiveWorkOrders(final EventHandlerContext context) {
        JSONArray records = null;

        if (context.parameterExists("records")) {
            try {
                records = context.getJSONArray("records");
            } catch (final Exception e) {
                // @translatable
                final String errorMessage =
                        localizeString(context, "Error parsing records JSON object");
                throw new ExceptionBase(errorMessage, true);
            }
            if (records != null && records.length() > 0) {
                for (int i = 0; i < records.length(); i++) {
                    final JSONObject record = records.getJSONObject(i);
                    final int wo_id = record.getInt("wo.wo_id");
                    context.addResponseParameter("wo_id", new Integer(wo_id));
                    archiveWorkOrder(context);
                }
            }
        } else if (context.parameterExists("date_from") && context.parameterExists("date_to")) {
            final Date dateFrom = getDateValue(context, context.getString("date_from"));
            final Date dateTo = getDateValue(context, context.getString("date_to"));

            final String isoDateFrom =
                    formatSqlFieldValue(context, dateFrom, "java.sql.Date", "date_from");
            final String isoDateTo =
                    formatSqlFieldValue(context, dateTo, "java.sql.Date", "date_to");

            final List recs =
                    selectDbRecords(context, "SELECT wo_id FROM wo WHERE date_closed BETWEEN "
                            + isoDateFrom + " AND " + isoDateTo);

            for (final Iterator it = recs.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                context.addResponseParameter("wo_id", record[0]);
                archiveWorkOrder(context);
            }
        }

    }

    /**
     * Archive Work Order.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wo_id : Code of work order to archive</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #archiveTable(EventHandlerContext, String, int, int) Archive} the given work order
     * </li>
     * <li>{@link #checkPartsRejectedWr(EventHandlerContext, int) Update the parts inventory if this
     * work order contains rejected work requests.}</li>
     * <li>{@link #archiveTable(EventHandlerContext, String, int, int) Archive} all records linked
     * to this work order or its work requests in the tables:
     * <ul>
     * <li><code>wr</code></li>
     * <li><code>wrtt</code></li>
     * <li><code>wrtr</code></li>
     * <li><code>wrpt</code></li>
     * <li><code>wrtl</code></li>
     * <li><code>wrcf</code></li>
     * <li><code>wr_other</code></li>
     * </ul>
     * </li>
     * <li>Remove all archived records from the database, by deleting the work order record
     * (cascading delete)</li>
     * <li>Check if help requests are linked to the selected work order or to a work request
     * assigned to this work order</li>
     * <li>{@link RequestHandler#archiveRequests(EventHandlerContext) Archive help requests} if
     * found</li>
     * </ol>
     * </p>
     *
     * @param context Workflow rule execution context
     */
    public void archiveWorkOrder(final EventHandlerContext context) {
        // select work requests
        // wo
        if (!context.parameterExists("wo_id")) {
            return;
        }

        final int wo_id = context.getInt("wo_id");

        archiveTable(context, "wo", wo_id, 0);
        // check for rejected work requests to update inventory
        final List records = selectDbRecords(context, "wr", new String[] { "wr_id" },
            "wo_id = " + wo_id + " AND status = 'Rej'");
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final int wr_id = getIntegerValue(context, record[0]).intValue();
                checkPartsRejectedWr(context, wr_id);
            }
        }
        // wr
        archiveTable(context, "wr", wo_id, 0);

        archiveWorkRequestDocument("wo", wo_id);
        // wrtt
        archiveTable(context, "wrtt", wo_id, 0);
        // wrtr
        archiveTable(context, "wrtr", wo_id, 0);
        // wrpt
        archiveTable(context, "wrpt", wo_id, 0);
        // wrtl
        archiveTable(context, "wrtl", wo_id, 0);
        // wrcf
        archiveTable(context, "wrcf", wo_id, 0);
        // wr_other
        archiveTable(context, "wr_other", wo_id, 0);

        final String deleteWr_other =
                "DELETE FROM wr_other WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrcf =
                "DELETE FROM wrcf WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrtl =
                "DELETE FROM wrtl WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrpt =
                "DELETE FROM wrpt WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrtr =
                "DELETE FROM wrtr WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrtt =
                "DELETE FROM wrtt WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWr = "DELETE FROM wr WHERE wo_id = " + wo_id;

        // cascade delete all
        final Vector commands = new Vector();
        commands.add(deleteWr_other);
        commands.add(deleteWrcf);
        commands.add(deleteWrtl);
        commands.add(deleteWrpt);
        commands.add(deleteWrtr);
        commands.add(deleteWrtt);
        commands.add(deleteWr);

        executeDbSqlCommands(context, commands, false);

        // archive help requests linked to the selected work order or to a work
        // request assigned to
        // this work order
        final List helpRequests = selectDbRecords(context, Constants.ACTION_ITEM_TABLE,
            new String[] { "activity_log_id" },
            "wo_id = " + wo_id + " OR wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                    + ") OR wr_id IN (SELECT wr_id FROM hwr WHERE wo_id = " + wo_id + ")");
        if (!helpRequests.isEmpty()) {
            final JSONArray json = new JSONArray();
            for (final Iterator it = helpRequests.iterator(); it.hasNext();) {
                final Object[] request = (Object[]) it.next();
                final JSONObject object = new JSONObject();
                object.put("activity_log.activity_log_id", request[0]);
                json.put(object);
            }

            context.addResponseParameter("records", json.toString());
            final RequestHandler requestHandler = new RequestHandler();
            requestHandler.archiveRequests(json);
        }
        final String deleteWo = "DELETE FROM wo WHERE wo_id = " + wo_id;
        executeDbSql(context, deleteWo, true);
        // executeDbCommit(context);
    }

    /**
     * Archive records in a table for a given work order.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>If a work order or work request is archived check if the record with maximal id will be
     * archived</li>
     * <li>If so create new dummy record to retain the numbering sequence and delete the previous
     * </li>
     * <li>Update records in <code>helpdesk_step_log</code> (set table_name to <code>hwr</code>)
     * </li>
     * <li>Create a query to copy all records linked to the given work order or its work requests
     * from the given table to its archive table (table name preceeded by 'h')</li>
     * <li>Execute the query</li>
     * </ol>
     * </p>
     *
     * @param context Workflow rule execution context
     * @param table_name table to archive
     * @param wo_id id of work order to archive (or 0)
     * @param wr_id id of work request to archive (or 0)
     */
    private void archiveTable(final EventHandlerContext context, final String table_name,
            final int wo_id, final int wr_id) {
        // create comma-separated list of all fields of the given table
        final String[] fields_list = com.archibus.eventhandler.EventHandlerBase
            .getAllFieldNames(context, "h" + table_name);
        final StringBuffer fields = new StringBuffer();
        for (final String element : fields_list) {
            if (fields.length() > 0) {
                fields.append(",");
            }
            fields.append(notNull(element));
        }

        String where = null;
        if (wo_id != 0 && table_name.equals("wo")) {
            where = " wo_id = " + wo_id;
            // fix KB3029197-comment out below code because the dummy record do not need in latest
            // sybase 9, mssql2005,
            // the numbering sequence work well if max record is deleted(Guo 2011/5/4)
            /*
             * // check if work order to be deleted is record with maximal id int max_wo_id =
             * Common.getMaxId(context, "wo", "wo_id", null); if (wo_id == max_wo_id) { // insert
             * dummy record and delete previous Map values = new HashMap(); String description =
             * localizeMessage(context, Constants.ONDEMAND_ACTIVITY_ID, "ARCHIVE_WFR",
             * "ARCHIVE_DESCRIPTION", null); values.put("description", description);
             * executeDbAdd(context, "wo", values); executeDbCommit(context);
             *
             * // delete previous dummy record String delete = "DELETE FROM wo WHERE description = "
             * + literal(context, description) + " AND wo_id < " + max_wo_id; executeDbSql(context,
             * delete, false); executeDbCommit(context); }
             */
        } else if (table_name.equals("wr")) {
            // Guo added 2010-11-3 to fix KB3029091
            calculateDiffHour(wo_id, wr_id);
            // check if work request to be deleted is record with maximal id
            // int max_wr_id = Common.getMaxId(context, "wr", "wr_id", null);
            // boolean max = false;
            if (wo_id != 0) {
                where = "wo_id = " + wo_id;

                // List records = selectDbRecords(context, "wr", new String[] { "wr_id" }, where);

                /*
                 * if (!records.isEmpty()) { for (Iterator record_it = records.iterator();
                 * record_it.hasNext();) { Object[] record = (Object[]) record_it.next(); Integer wr
                 * = getIntegerValue(context, record[0]); if (wr.intValue() == max_wr_id) { max =
                 * true; break; } } }
                 */

                // update records in helpdesk_step_log
                final String update =
                        "UPDATE " + Constants.STEP_LOG_TABLE + "  SET table_name='hwr' "
                                + " WHERE table_name='wr' AND pkey_value IN (SELECT wr_id FROM wr WHERE wo_id = "
                                + wo_id + ")";
                executeDbSql(context, update, false);
                // executeDbCommit(context);

            } else if (wr_id != 0) {
                where = "wr_id = " + wr_id;
                /*
                 * if (wr_id == max_wr_id) { max = true; }
                 */

                // update records in helpdesk_step_log
                final String update =
                        "UPDATE " + Constants.STEP_LOG_TABLE + "  SET table_name='hwr' "
                                + " WHERE table_name='wr' AND pkey_value = " + wr_id;
                executeDbSql(context, update, true);
                // executeDbCommit(context);
            }
            // fix KB3029197-comment out below code because the dummy record do not need in latest
            // sybase 9, mssql2005,
            // the numbering sequence work well if max record is deleted(Guo 2011/5/4)
            /*
             * if (max) { // insert dummy record and delete previous Map values = new HashMap();
             * String description = localizeMessage(context, Constants.ONDEMAND_ACTIVITY_ID,
             * "ARCHIVE_WFR", "ARCHIVE_DESCRIPTION", null); values.put("description", description);
             * executeDbAdd(context, "wr", values); executeDbCommit(context);
             *
             * // delete previous dummy record String delete = "DELETE FROM wr WHERE description = "
             * + literal(context, description) + " AND wr_id < " + max_wr_id; executeDbSql(context,
             * delete, false); executeDbCommit(context); }
             */

        } else {
            if (wr_id != 0) {
                where = "wr_id = " + wr_id;
            } else if (wo_id != 0) {
                where = "wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id + ")";
            }
        }
        // format insert query
        final String insert = "INSERT into h" + table_name + "(" + fields.toString() + ") SELECT "
                + fields.toString() + " FROM " + table_name + " WHERE " + where;
        executeDbSql(context, insert, false);
        // executeDbCommit(context);
    }

    /**
     * calculate the difference hour related to wr table when hours_total = 0;
     *
     * @param wo_id Work order request
     * @param wr_id Work request
     */
    private void calculateDiffHour(final int wo_id, final int wr_id) {
        if (wo_id != 0 || wr_id != 0) {
            String where = " WHERE hours_total = 0";

            if (wo_id != 0) {
                where += " AND wr_id IN (SELECT wr_id FROM wr WHERE wo_id =" + wo_id + ")";
            }

            if (wr_id != 0) {
                where += " AND wr_id =" + wr_id;
            }

            final String updateWrcfSql =
                    "UPDATE wrcf SET hours_diff = hours_total - hours_est " + where;
            final String updateWrtrSql =
                    "UPDATE wrtr SET hours_diff = hours_total - hours_est " + where;
            final String updateWrttSql =
                    "UPDATE wrtt SET hours_diff = hours_total - hours_est " + where;
            final String updateWrtlSql =
                    "UPDATE wrtl SET hours_diff = hours_total - hours_est " + where;
            SqlUtils.executeUpdate("wrcf", updateWrcfSql);
            SqlUtils.executeUpdate("wrtr", updateWrtrSql);
            SqlUtils.executeUpdate("wrtt", updateWrttSql);
            SqlUtils.executeUpdate("wrtl", updateWrtlSql);
            // SqlUtils.commit();
        }
    }

    /**
     * Close Stopped Work Requests.KB3042511 - Add close action for stopped work requests
     *
     * The Close action can archive the work request (and associated activity_log record) and keep
     * the status as 'S' for 'Stopped' (and 'STOPPED' for the activity_log record)..
     *
     * @param JSONArray records
     */
    public void closeStoppedWorkRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        int wr_id = 0;
        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                wr_id = getIntegerValue(context, record.get("wr.wr_id")).intValue();

                // kb#3044751: consider the update for part estimations when closing the stopped
                // work requests
                updateInventory(context, wr_id);

                archiveWorkRequest(wr_id);
                final Set woToClose = new TreeSet();
                woToClose.add(getIntegerValue(context, record.get("wr.wo_id")));

                checkWoClose(context, woToClose);
            }
        }
    }

    /**
     * Archive a single work request (e.g. after rejection).
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Use {@link #archiveTable(EventHandlerContext, String, int, int)} to archive all records
     * linked to the given work request from the tables
     * <code>wr, wrtt, wrtr, wrpt, wrtl, wrcf, wr_other</code></li>
     * <li>If archived wr is record with maximal id, insert dummy record</li>
     * <li>Delete the record from <code>wr</code> (cascade delete records from all other tables)
     * </li>
     * <li>Update records in <code>helpdesk_step_log</code> (set table_name to <code>hwr</code>)
     * </li>
     * </ol>
     * </p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Work request to archive
     */
    public void archiveWorkRequest(final int wr_id) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // wr
        archiveTable(context, "wr", 0, wr_id);
        // wrtt
        archiveTable(context, "wrtt", 0, wr_id);
        // wrtr
        archiveTable(context, "wrtr", 0, wr_id);
        // wrpt
        archiveTable(context, "wrpt", 0, wr_id);
        // wrtl
        archiveTable(context, "wrtl", 0, wr_id);
        // wrcf
        archiveTable(context, "wrcf", 0, wr_id);
        // wr_other
        archiveTable(context, "wr_other", 0, wr_id);

        // fix KB3029197-comment out below code because the dummy record do not need in latest
        // sybase 9, mssql2005,
        // the numbering sequence work well if max record is deleted(Guo 2011/5/4)
        /*
         * int max_wr_id = Common.getMaxId(context, "wr", "wr_id", null); if (wr_id == max_wr_id) {
         * // insert dummy record and delete previous Map values = new HashMap(); String description
         * = localizeMessage(context, Constants.ONDEMAND_ACTIVITY_ID, "ARCHIVE_WFR",
         * "ARCHIVE_DESCRIPTION", null); values.put("description", description);
         * executeDbAdd(context, "wr", values); executeDbCommit(context);
         *
         * // delete previous dummy record String delete = "DELETE FROM wr WHERE description = " +
         * literal(context, description) + " AND wr_id < " + max_wr_id; executeDbSql(context,
         * delete, false); executeDbCommit(context); }
         */

        final String deleteWr_other = "DELETE FROM wr_other WHERE wr_id  = " + wr_id;
        final String deleteWrcf = "DELETE FROM wrcf WHERE wr_id = " + wr_id;
        final String deleteWrtl = "DELETE FROM wrtl WHERE wr_id = " + wr_id;
        final String deleteWrpt = "DELETE FROM wrpt WHERE wr_id = " + wr_id;
        final String deleteWrtr = "DELETE FROM wrtr WHERE wr_id = " + wr_id;
        final String deleteWrtt = "DELETE FROM wrtt WHERE wr_id = " + wr_id;
        final String deleteWr = "DELETE FROM wr WHERE wr_id = " + wr_id;

        // cascade delete all
        final Vector commands = new Vector();
        commands.add(deleteWr_other);
        commands.add(deleteWrcf);
        commands.add(deleteWrtl);
        commands.add(deleteWrpt);
        commands.add(deleteWrtr);
        commands.add(deleteWrtt);
        commands.add(deleteWr);

        executeDbSqlCommands(context, commands, false);

        // archive help requests linked to the selected work order or to a work
        // request assigned to
        // this work order
        final List helpRequests = selectDbRecords(context, Constants.ACTION_ITEM_TABLE,
            new String[] { "activity_log_id" }, "wr_id = " + wr_id);
        if (!helpRequests.isEmpty()) {
            final JSONArray json = new JSONArray();
            for (final Iterator it = helpRequests.iterator(); it.hasNext();) {
                final Object[] request = (Object[]) it.next();
                final JSONObject object = new JSONObject();
                object.put("activity_log.activity_log_id", request[0]);
                json.put(object);
            }

            context.addResponseParameter("records", json.toString());
            final RequestHandler requestHandler = new RequestHandler();
            requestHandler.archiveRequests(json);
        }

        // update records in afm_docs
        // KB3036749 - use dasource API to update afm_docs.table_name to support casecade update in
        // MSSQL AND Oracle
        archiveWorkRequestDocument("wr", wr_id);

        // update records in helpdesk_step_log
        final String update = "UPDATE " + Constants.STEP_LOG_TABLE + "  SET table_name='hwr' "
                + " WHERE table_name='wr' AND pkey_value = " + wr_id;
        executeDbSql(context, update, false);
        // executeDbCommit(context);

        // archive data in helpdesk_step_log to hhelpdesk_step_log - KB3034237(Create an archive
        // table for helpdesk_step_log)
        archiveStepLog();
    }

    /**
     * archive work request documents;
     *
     * @param tableName wo or wr
     * @param id wo_id value or wr_id value
     */
    public void archiveWorkRequestDocument(final String tableName, final int id) {

        final String[] fieldNames = { "table_name", "field_name", "pkey_value" };
        final DataSource docDs =
                DataSourceFactory.createDataSourceForFields("afm_docs", fieldNames);

        String restriction = "table_name='wr'";
        if ("wo".equals(tableName)) {
            restriction +=
                    " and pkey_value IN (select wr.wr_id from wr where wr.wo_id =" + id + ")";
        } else {
            restriction += " and pkey_value =" + id;
        }

        final List<DataRecord> docRecords = docDs.getRecords(restriction);
        for (final DataRecord docRecord : docRecords) {
            docRecord.setValue("afm_docs.table_name", "hwr");
            docDs.saveRecord(docRecord);
        }
    }

    /**
     *
     * Save work request.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with wr_id of new record<br />
     * <code>{wr_id : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>If wr_id is given in the inputs, save (update) the record in <code>wr</code></li>
     * <li>Else
     * <ul>
     * <li>Save new record in <code>wr</code></li>
     * <li>{@link #updateWorkRequestFromSLA(EventHandlerContext, int) Update work request according
     * to SLA}</li>
     * <li>Check if workorder code is given, if so put status on AA, else on R</li>
     * <li>Put work request code in a jsonobject and return</li>
     * </ul>
     * </li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject fields,wo table record
     *            </p>
     */
    public void saveWorkRequest(final JSONObject fields) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, fields);
        final Map values = stripPrefix(fieldValues);

        if (values.get("wr_id") == null) { // new record
            values.put("supervisor",
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
            executeDbAdd(context, "wr", values);
            // executeDbCommit(context);

            final int wr_id = Common.getMaxId(context, "wr", "wr_id",
                getRestrictionFromValues(context, values));

            updateWorkRequestFromSLA(context, wr_id);

            // Create work request datasource and add restriction
            final DataSource wrDS = DataSourceFactory.createDataSourceForFields("wr",
                new String[] { "wr_id", "activity_log_id", "pmp_id", "eq_id", "status", "site_id",
                        "bl_id", "fl_id", "rm_id", "dv_id", "dp_id", "prob_type", "priority",
                        "date_requested", "time_requested", "supervisor", "work_team_id", "manager",
                        "requestor", "serv_window_days", "serv_window_start", "serv_window_end",
                        "allow_work_on_holidays" });
            wrDS.addRestriction(
                Restrictions.sql("wr.activity_log_id IS NULL AND wr.wr_id = " + wr_id));

            // get record list and invoke sla for every matched work request
            final DataRecord wrRecord = wrDS.getRecord();
            if (wrRecord != null) {
                // create Activity Log and update wr.activity_log_id
                final DataRecord alRecord = createNewActivityLog(wrRecord);
                final int activityLogId = alRecord.getInt("activity_log.activity_log_id");
                wrRecord.setValue("wr.activity_log_id", activityLogId);
                wrDS.saveRecord(wrRecord);
            }

            final StatusManager manager = new OnDemandWorkStatusManager(context, wr_id);
            if (values.get("wo_id") != null) {
                manager.updateStatus("AA");
            } else {
                manager.updateStatus("R");
            }

            final JSONObject result = new JSONObject();
            result.put("wr_id", wr_id);

            context.addResponseParameter("jsonExpression", result.toString());

        } else { // update, don't change status !!!
            executeDbSave(context, "wr", values);
            // Guo changed 2009-01-15 for KB3021405
            // executeDbCommit(context);
        }
    }

    /**
     * Update (new) work request according to the SLA it matches.
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create a {@link ServiceLevelAgreement SLA} with the given work request id</li>
     * <li>Calculate the escalation dates/times and get the manager from the SLA</li>
     * <li>Save this values to the record in <code>wr</code></li>
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Work request to update
     */
    private void updateWorkRequestFromSLA(final EventHandlerContext context, final int wr_id) {
        // copy SLA parameters to work request table (manager, escalation dates)
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wr_id);

        final Map values = new HashMap();
        values.put("wr_id", new Integer(wr_id));
        values.put("manager", sla.getSLAManager());
        values.put("supervisor", sla.getSupervisor());
        values.put("work_team_id", sla.getWorkTeam());

        // calculate escalation date and time
        final Object[] datetimeValues = selectDbValues(context, "wr",
            new String[] { "date_requested", "time_requested" }, " wr_id=" + wr_id);

        final java.sql.Date dateRequested = getDateValue(context, datetimeValues[0]);
        final java.sql.Time timeRequested = getTimeValue(context, datetimeValues[1]);

        final Map escalation = sla.calculateEscalation(dateRequested, timeRequested);
        final Map response = (Map) escalation.get("response");
        if (response != null) {
            final java.sql.Date date_esc_response = (java.sql.Date) response.get("date");
            final java.sql.Time time_esc_response = (java.sql.Time) response.get("time");
            values.put("date_escalation_response", date_esc_response);
            values.put("time_escalation_response", time_esc_response);
        }

        final Map completion = (Map) escalation.get("completion");
        if (completion != null) {
            final java.sql.Date date_esc_completion = (java.sql.Date) completion.get("date");
            final java.sql.Time time_esc_completion = (java.sql.Time) completion.get("time");

            values.put("date_escalation_completion", date_esc_completion);
            values.put("time_escalation_completion", time_esc_completion);
        }

        final ServiceWindow serviceWindow = sla.getServiceWindow();
        if (serviceWindow != null) {
            values.put("serv_window_days", serviceWindow.getServiceWindowDaysAsString());
            values.put("serv_window_start", serviceWindow.getServiceWindowStartTime());
            values.put("serv_window_end", serviceWindow.getServiceWindowEndTime());
            values.put("allow_work_on_holidays",
                serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
        }

        executeDbSave(context, "wr", values);
        // executeDbCommit(context);

        // not issued
        createDefaultEstimationAndScheduling(context, wr_id, sla);
    }

    /**
     * Update (new) work request according to the SLA it matches. C. Kriezis based on
     * updateWorkRequestFromSLA. Skip estimation and scheduling step.
     *
     * @param context Workflow rule execution context
     * @param wr_id Work request to update
     */
    private void updateWorkRequestFromSLAMobile(final EventHandlerContext context,
            final int wr_id) {
        // copy SLA parameters to work request table (manager, escalation dates)
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wr_id);

        final Map values = new HashMap();
        values.put("wr_id", new Integer(wr_id));
        values.put("manager", sla.getSLAManager());

        // calculate escalation date and time
        final Object[] datetimeValues = selectDbValues(context, "wr",
            new String[] { "date_requested", "time_requested" }, " wr_id=" + wr_id);

        final java.sql.Date dateRequested = getDateValue(context, datetimeValues[0]);
        final java.sql.Time timeRequested = getTimeValue(context, datetimeValues[1]);

        final Map escalation = sla.calculateEscalation(dateRequested, timeRequested);
        final Map response = (Map) escalation.get("response");
        if (response != null) {
            final java.sql.Date date_esc_response = (java.sql.Date) response.get("date");
            final java.sql.Time time_esc_response = (java.sql.Time) response.get("time");
            values.put("date_escalation_response", date_esc_response);
            values.put("time_escalation_response", time_esc_response);
        }

        final Map completion = (Map) escalation.get("completion");
        if (completion != null) {
            final java.sql.Date date_esc_completion = (java.sql.Date) completion.get("date");
            final java.sql.Time time_esc_completion = (java.sql.Time) completion.get("time");

            values.put("date_escalation_completion", date_esc_completion);
            values.put("time_escalation_completion", time_esc_completion);
        }

        final ServiceWindow serviceWindow = sla.getServiceWindow();
        if (serviceWindow != null) {
            values.put("serv_window_days", serviceWindow.getServiceWindowDaysAsString());
            values.put("serv_window_start", serviceWindow.getServiceWindowStartTime());
            values.put("serv_window_end", serviceWindow.getServiceWindowEndTime());
            values.put("allow_work_on_holidays",
                serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
        }

        executeDbSave(context, "wr", values);
        // executeDbCommit(context);
    }

    /**
     *
     * Issue work request.<br />
     * Called by {@link #issueWorkorder(EventHandlerContext)}. Updates the basic status of the work
     * request to 'I' using the {@link StatusManager status manager}
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wr_id : Work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get wr_id from context</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager#updateStatus(String)
     * Update work request status}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     *            </p>
     */
    public void issueWorkRequest(final EventHandlerContext context) {
        final int wr_id = context.getInt("wr.wr_id");

        // KB3040755 - check if exists pending workflow steps before issue
        final List recs =
                selectDbRecords(context, "wr_step_waiting", new String[] { "step_log_id" },
                    "wr_step_waiting.step_type != 'basic' and  wr_step_waiting.wr_id = " + wr_id);

        if (recs.isEmpty()) {
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus("I");
			
			 /* UofC Customized 10/2009: Added in checkWorkorder so that the work order is correctly updated. */
            checkWorkorder(context, "I", wr_id);
			
            this.endBasicSteps(wr_id);
        } else {
            // @translatable
            final String errorMessage = localizeString(context,
                "Please complete all pending workflow steps before issuing the work request.");
            throw new ExceptionBase(errorMessage, true);
        }
    }

    /**
     *
     * Issue work order.<br/>
     * When a work order is issued its date_issued is set to the current date,
     * {@link #issueWorkRequest(EventHandlerContext) all work request attached to the work order are
     * also issued} and all craftspersons and supervisors the work requests are assigned to are
     * notified.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wo_id : work order code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get wo_id from context</li>
     * <li>Set work order date_issued</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#issueWorkRequest(EventHandlerContext)
     * Issue work requests attached to this work order}</li>
     * <li>Notify
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#notifyCraftspersons(EventHandlerContext, int)
     * craftspersons} and
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#notifySupervisor(EventHandlerContext, String)
     * supervisor}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String woId
     *            </p>
     */
    public void issueWorkorder(final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wo_id = Integer.parseInt(woId);

        // change date_issued of workorder
        final Map values = new HashMap();
        values.put("wo_id", new Integer(wo_id));

        final Map<String, String> map =
                Common.getSiteBuildingIds("wo", "wo_id", String.valueOf(wo_id));

        values.put("date_issued", LocalDateTimeStore.get().currentLocalDate(null, null,
            map.get("siteId"), map.get("blId")));
        values.put("time_issued", LocalDateTimeStore.get().currentLocalTime(null, null,
            map.get("siteId"), map.get("blId")));

        executeDbSave(context, "wo", values);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);

        // change status of work requests
        // List records = selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " +
        // wo_id);
        final List records = selectDbRecords(context, "wr", new String[] { "wr_id" },
            "wo_id = " + wo_id + " AND status = 'AA'");
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final Integer wr_id = getIntegerValue(context, record[0]);
            context.addResponseParameter("wr.wr_id", wr_id);
            issueWorkRequest(context);
        }

        // notify craftsperson(s)
        notifyCraftspersons(context, wo_id);

        // check if help requests are linked to this work order and change their
        // status
        final List recs = selectDbRecords(context, Constants.ACTION_ITEM_TABLE,
            new String[] { "activity_log_id" }, "wo_id = " + wo_id);
        if (recs != null && !recs.isEmpty()) {
            for (final Iterator it = recs.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final Integer activity_log_id = getIntegerValue(context, record[0]);
                final HelpdeskStatusManager statusManager =
                        new HelpdeskStatusManager(context, activity_log_id.intValue());
                statusManager.updateStatus("IN PROGRESS");
            }
        }

        // KB3037179 - update wo.qty_open_wr
        updateOpenWrNumOfWo(woId);
    }

    /**
     *
     * Issue work order for mobile. By C. Kriezis based on issueWorkOrder.
     *
     * @param String woId
     *
     */
    public void issueWorkorderMobile(final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wo_id = Integer.parseInt(woId);

        // change date_issued of workorder
        final Map values = new HashMap();
        values.put("wo_id", new Integer(wo_id));

        final Map<String, String> map =
                Common.getSiteBuildingIds("wo", "wo_id", String.valueOf(wo_id));

        values.put("date_issued", LocalDateTimeStore.get().currentLocalDate(null, null,
            map.get("siteId"), map.get("blId")));
        values.put("time_issued", LocalDateTimeStore.get().currentLocalTime(null, null,
            map.get("siteId"), map.get("blId")));

        executeDbSave(context, "wo", values);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);

        // change status of work requests
        // List records = selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " +
        // wo_id);
        final List records =
                selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " + wo_id);

        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final Integer wr_id = getIntegerValue(context, record[0]);
            context.addResponseParameter("wr.wr_id", wr_id);
            issueWorkRequest(context);
        }

        // notify craftsperson(s) - commented for mobile
        // notifyCraftspersons(context, wo_id);

        // check if help requests are linked to this work order and change their
        // status
        final List recs = selectDbRecords(context, Constants.ACTION_ITEM_TABLE,
            new String[] { "activity_log_id" }, "wo_id = " + wo_id);
        if (recs != null && !recs.isEmpty()) {
            for (final Iterator it = recs.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final Integer activity_log_id = getIntegerValue(context, record[0]);
                final HelpdeskStatusManager statusManager =
                        new HelpdeskStatusManager(context, activity_log_id.intValue());
                statusManager.updateStatus("IN PROGRESS");
            }
        }

        // KB3037179 - update wo.qty_open_wr
        updateOpenWrNumOfWo(woId);
    }

    /**
     * Issue work orders
     *
     * @param JSONArray records ,wo_id value
     */
    public void issueWorkOrders(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (records.length() > 0) {
            int wo_id = 0;
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);

                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);

                wo_id = getIntegerValue(context, values.get("wo_id")).intValue();

                context.addResponseParameter("wo_id", new Integer(wo_id));
                issueWorkorder(Integer.toString(wo_id));
            }
        }
    }

    /**
     * Issue work requests
     *
     * @param JSONArray records
     */
    public void issueWorkRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Integer wo_id = null;
        Integer wr_id = null;
        if (records.length() > 0) {
            final Map woWrMap = new HashMap();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                wo_id = new Integer(record.getInt("wr.wo_id"));
                wr_id = new Integer(record.getInt("wr.wr_id"));
                if (woWrMap.containsKey(wo_id)) {
                    final List wrs = (ArrayList) woWrMap.get(wo_id);
                    wrs.add(wr_id);
                } else {
                    final List wrs = new ArrayList();
                    wrs.add(wr_id);
                    woWrMap.put(wo_id, wrs);
                }
            }
            for (final Iterator it = woWrMap.keySet().iterator(); it.hasNext();) {
                wo_id = (Integer) it.next();
                final ArrayList wrs = (ArrayList) woWrMap.get(wo_id);
                for (final Iterator wr_it = wrs.iterator(); wr_it.hasNext();) {
                    // KB3043902 - Changing associated WO status when the last grouped WR status is
                    // changed
                    context.addResponseParameter("wr.wr_id", wr_it.next());
                    issueWorkRequest(context);
                }

                // KB3044653 - the Date_Issued fields in the WO table are not always populated when
                // one work request status is closed, and the other work request is issued
                final List missingWrs = selectDbRecords(context, "wr", new String[] { "wr_id" },
                    "wo_id = " + wo_id
                            + " AND status NOT IN ('Rej','Can','I','Com','Clo','HA','HL','HP')");
                if (missingWrs.isEmpty()) {
                    context.addResponseParameter("wo_id", wo_id);
                    issueWorkorder(String.valueOf(wo_id));
                }
            }
        }
    }

    /**
     *
     * Notify craftsperson(s) of a work request assigned.<br/>
     * Called by {@link #issueWorkorder(EventHandlerContext)}.<br />
     * The body and subject for the message send to the craftsperson are stored in the
     * <code>messages</code> table with the ondemand activity and referenced by 'NOTIFY_CF_WFR'.
     * <br />
     * The link to the view file the craftsperson needs is stored as activity parameter 'CF_VIEW'.
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from wrcf for all work requests in given work order</li>
     * <li>Prepare message to send</li>
     * <li>Notify selected craftspersons</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wo_id issued work order
     *            </p>
     */
    private void notifyCraftspersons(final EventHandlerContext context, final int wo_id) {
        final List workRequests =
                selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " + wo_id);
        for (final Iterator wrIt = workRequests.iterator(); wrIt.hasNext();) {
            final Object[] wrRecord = (Object[]) wrIt.next();
            final Integer wr_id = getIntegerValue(context, wrRecord[0]);
            final ServiceLevelAgreement sla =
                    new ServiceLevelAgreement(context, "wr", "wr_id", wr_id);

            if (sla.isNotifyCraftsperson()) {
                final String select = "SELECT DISTINCT cf_id FROM wrcf WHERE wr_id =" + wr_id;
                final List wrcf = selectDbRecords(context, select);

                final Message message = new Message(context);
                message.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
                message.setReferencedBy("NOTIFY_CF_WFR");

                final String link =
                        getWebCentralPath(context) + "/" + getActivityParameterString(context,
                            Constants.ONDEMAND_ACTIVITY_ID, "CF_VIEW");
                final Map dataModel =
                        MessageHelper.getRequestDatamodel(context, "wr", "wr_id", wr_id);
                dataModel.put("link", link);

                // KB 3023429 - also send a message (with different content) to the substitute(s) of
                // the craftsperson(s) (EC 2012/7/10)
                final Message messageForSubstitute = new Message(context);
                messageForSubstitute.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
                messageForSubstitute.setReferencedBy("NOTIFY_CF_SUBSTITUTE_WFR");
                messageForSubstitute.setSubjectMessageId("NOTIFY_CF_TITLE");
                messageForSubstitute.setBodyMessageId("NOTIFY_CF_TEXT");
                if (messageForSubstitute.isBodyRichFormatted()
                        || messageForSubstitute.isSubjectRichFormatted()) {
                    messageForSubstitute.setDataModel(dataModel);
                }
                if (!messageForSubstitute.isBodyRichFormatted()) {
                    messageForSubstitute.setBodyArguments(new Object[] { link });
                }

                for (final Iterator it = wrcf.iterator(); it.hasNext();) {
                    final Object[] record = (Object[]) it.next();

                    final String cf_id = notNull(record[0]);
                    final String email = notNull(selectDbValue(context, "cf", "email",
                        "cf_id = " + literal(context, cf_id)));

                    if (email != null && !email.equals("")) {
                        message.setBodyMessageId("NOTIFY_CF_TEXT");
                        message.setSubjectMessageId("NOTIFY_CF_TITLE");

                        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                            message.setDataModel(dataModel);
                        }
                        if (!message.isBodyRichFormatted()) {
                            message.setBodyArguments(new Object[] { link });
                        }
                        message.format();

                        message.setMailTo(email);
                        message.setNameto(cf_id);
                    } else {
                        message.setBodyMessageId("NOTIFY_MGR_TEXT");
                        message.setSubjectMessageId("NOTIFY_MGR_TITLE");

                        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                            dataModel.put("cf_id", cf_id);
                            message.setDataModel(dataModel);
                        }
                        if (!message.isBodyRichFormatted()) {
                            message.setBodyArguments(new Object[] { cf_id, link });
                        }
                        message.format();

                        final String managerEmail = notNull(selectDbValue(context, "em", "email",
                            "em_id = (SELECT manager FROM wr WHERE wr_id = " + wr_id + ")"));
                        message.setMailTo(managerEmail);
                    }
                    message.sendMessage();

                    // KB 3023429 - also send a message (with different content) to the
                    // substitute(s) of
                    // the craftsperson(s) (EC 2012/7/10)
                    final List<String> substitutes =
                            StepHandler.getWorkflowCfSubstitutes(context, cf_id, "craftsperson");
                    if (!substitutes.isEmpty()) {
                        for (final String substitute : substitutes) {
                            if (messageForSubstitute.isBodyRichFormatted()
                                    || messageForSubstitute.isSubjectRichFormatted()) {
                                dataModel.put("cf_id", cf_id);
                                messageForSubstitute.setDataModel(dataModel);
                            }
                            messageForSubstitute.format();
                            messageForSubstitute
                                .setMailTo(getEmailAddressForCraftsperson(context, substitute));
                            messageForSubstitute.setNameto(substitute);
                            messageForSubstitute.sendMessage();
                        }
                    }
                }
            }
        }
    }

    private void notifyCraftspersonAfterIssue(final EventHandlerContext context, final int wrId,
            final String cfId) {
        final ServiceLevelAgreement sla = new ServiceLevelAgreement(context, "wr", "wr_id", wrId);

        if (sla.isNotifyCraftsperson()) {

            final Message message = new Message(context);
            message.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
            message.setReferencedBy("NOTIFY_CF_WFR");

            final String link =
                    getWebCentralPath(context) + "/" + getActivityParameterString(context,
                        Constants.ONDEMAND_ACTIVITY_ID, "CF_VIEW");
            final Map dataModel = MessageHelper.getRequestDatamodel(context, "wr", "wr_id", wrId);
            dataModel.put("link", link);

            // KB 3023429 - also send a message (with different content) to the substitute(s) of
            // the craftsperson(s) (EC 2012/7/10)
            final Message messageForSubstitute = new Message(context);
            messageForSubstitute.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
            messageForSubstitute.setReferencedBy("NOTIFY_CF_SUBSTITUTE_WFR");
            messageForSubstitute.setSubjectMessageId("NOTIFY_CF_TITLE");
            messageForSubstitute.setBodyMessageId("NOTIFY_CF_TEXT");
            if (messageForSubstitute.isBodyRichFormatted()
                    || messageForSubstitute.isSubjectRichFormatted()) {
                messageForSubstitute.setDataModel(dataModel);
            }
            if (!messageForSubstitute.isBodyRichFormatted()) {
                messageForSubstitute.setBodyArguments(new Object[] { link });
            }

            final String cf_id = notNull(cfId);
            final String email = notNull(
                selectDbValue(context, "cf", "email", "cf_id = " + literal(context, cf_id)));

            if (email != null && !email.equals("")) {
                message.setBodyMessageId("NOTIFY_CF_TEXT");
                message.setSubjectMessageId("NOTIFY_CF_TITLE");

                if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                    message.setDataModel(dataModel);
                }
                if (!message.isBodyRichFormatted()) {
                    message.setBodyArguments(new Object[] { link });
                }
                message.format();

                message.setMailTo(email);
                message.setNameto(cf_id);
            } else {
                message.setBodyMessageId("NOTIFY_MGR_TEXT");
                message.setSubjectMessageId("NOTIFY_MGR_TITLE");

                if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                    dataModel.put("cf_id", cf_id);
                    message.setDataModel(dataModel);
                }
                if (!message.isBodyRichFormatted()) {
                    message.setBodyArguments(new Object[] { cf_id, link });
                }
                message.format();

                final String managerEmail = notNull(selectDbValue(context, "em", "email",
                    "em_id = (SELECT manager FROM wr WHERE wr_id = " + wrId + ")"));
                message.setMailTo(managerEmail);
            }
            message.sendMessage();

            // KB 3023429 - also send a message (with different content) to the
            // substitute(s) of
            // the craftsperson(s) (EC 2012/7/10)
            final List<String> substitutes =
                    StepHandler.getWorkflowCfSubstitutes(context, cf_id, "craftsperson");
            if (!substitutes.isEmpty()) {
                for (final String substitute : substitutes) {
                    if (messageForSubstitute.isBodyRichFormatted()
                            || messageForSubstitute.isSubjectRichFormatted()) {
                        dataModel.put("cf_id", cf_id);
                        messageForSubstitute.setDataModel(dataModel);
                    }
                    messageForSubstitute.format();
                    messageForSubstitute
                        .setMailTo(getEmailAddressForCraftsperson(context, substitute));
                    messageForSubstitute.setNameto(substitute);
                    messageForSubstitute.sendMessage();
                }
            }
        }

    }

    /**
     *
     * Delete records from the given table in the database.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tablename : table to delete from</li>
     * <li>records : JSONArray with records to delete</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Delete records from database</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Recalculate costs for work requests}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String tableName
     * @param JSONArray records
     *            </p>
     */
    public void deleteItems(final String tableName, final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String tr = null;
        String tooltype = null;
        int wr_id = 0;
        // fix KB3031078 - Update Help Desk WFRs to use DataSource API instead of
        // executeDbDelete(Guo 2011/4/18)
        DataSource dataSource = null;

        final boolean isSchemaChanged = BldgopsPartInventoryUtility.isSchemaChanged();
        if (records.length() > 0) {
            dataSource = DataRecord.createDataSourceForRecord(records.getJSONObject(0));
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                Object[] wrptrecord = null;
                wr_id = record.getInt(tableName + ".wr_id");

                if (tableName.equals("wrcf")) {
                    if (record.has("wrcf.scheduled_from_tr_id")) {
                        tr = record.getString("wrcf.scheduled_from_tr_id");
                    } else {
                        tr = notNull(selectDbValue(context, "cf", "tr_id",
                            "cf_id= " + literal(context, record.getString("wrcf.cf_id"))));
                    }
                } else if (tableName.equals("wrtl")) {
                    tooltype = notNull(selectDbValue(context, "tl", "tool_type",
                        "tool_id= " + literal(context, record.getString("wrtl.tool_id"))));
                } else if (tableName.equals("wrpt")) {
                    // KB3042727 - when delete wrpt, restore pt inventory
                    final String partId = record.getString("wrpt.part_id");
                    final String date_assigned = formatSqlFieldValue(context,
                        getDateValue(context, record.getString("wrpt.date_assigned")),
                        "java.sql.Date", "date_assigned");
                    final String time_assigned = formatSqlFieldValue(context,
                        getTimeValueFromNeutral(context, record.getString("wrpt.time_assigned")),
                        "java.sql.Time", "time_assigned");

                    String[] fields = new String[] { "part_id", "qty_estimated", "status",
                            "date_assigned", "time_assigned", "wr_id" };
                    if (getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
                        "UseBldgOpsConsole").intValue() > 0) {
                        fields = new String[] { "part_id", "qty_estimated", "status",
                                "date_assigned", "time_assigned", "wr_id", "pt_store_loc_id" };
                    }
                    final StringBuffer sql = new StringBuffer();
                    sql.append("wr_id = " + wr_id + " AND part_id = " + literal(context, partId));
                    sql.append(" AND date_assigned = " + date_assigned);
                    sql.append(" AND time_assigned = " + time_assigned);

                    wrptrecord = selectDbValues(context, "wrpt", fields, sql.toString());
                    if (wrptrecord != null) {
                        final String status = getStringValue(wrptrecord[2]);
                        if ("R".equals(status)) {

                            final double qty_estimated = (Double) wrptrecord[1];

                            final Object[] partRecord = selectDbValues(context, "pt",
                                new String[] { "qty_on_hand", "qty_on_reserve" },
                                "part_id=" + literal(context, partId));

                            final double parts_on_hand = (Double) partRecord[0];
                            final double parts_on_reserve = (Double) partRecord[1];

                            final Map pt_values = new HashMap();
                            pt_values.put("part_id", partId);
                            pt_values.put("qty_on_hand", new Double(parts_on_hand + qty_estimated));
                            pt_values.put("qty_on_reserve",
                                new Double(parts_on_reserve - qty_estimated));

                            executeDbSave(context, "pt", pt_values);

                            if (getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
                                "UseBldgOpsConsole").intValue() > 0) {
                                final Object[] partLocRecord =
                                        selectDbValues(context, "pt_store_loc_pt",
                                            new String[] { "qty_on_hand", "qty_on_reserve" },
                                            "part_id=" + literal(context, partId)
                                                    + " and pt_store_loc_id = '"
                                                    + getStringValue(wrptrecord[6]) + "'");
                                final double partLocAvailabled = (Double) partLocRecord[0];
                                final double partLocReserved = (Double) partLocRecord[1];

                                final Map ptLocValues = new HashMap();
                                ptLocValues.put("part_id", partId);
                                ptLocValues.put("pt_store_loc_id", getStringValue(wrptrecord[6]));
                                ptLocValues.put("qty_on_hand",
                                    new Double(partLocAvailabled + qty_estimated));
                                ptLocValues.put("qty_on_reserve",
                                    new Double(partLocReserved - qty_estimated));

                                executeDbSave(context, "pt_store_loc_pt", ptLocValues);
                            }
                        }
                    }
                }

                final Map values = fromJSONObject(record);
                dataSource.deleteRecord(values);
                markMobileSyncRecordDeleted(tableName, record);

                // KB#3042273: modified for Bali3 Part Inventory Improvement
                if (wrptrecord != null && isSchemaChanged) {

                    final String status = getStringValue(wrptrecord[2]);
                    final int qty_estimated = getIntegerValue(context, wrptrecord[1]).intValue();
                    if ("R".equals(status) && qty_estimated > 0) {
                        if (getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
                            "UseBldgOpsConsole").intValue() > 0) {
                            new BldgopsPartInventoryMultiplePartStorageLocation(
                                record.getString("wrpt.part_id"), getStringValue(wrptrecord[6]))
                                    .updateStatusForQuantityIncreaseForMpsl(0);

                        } else {
                            new BldgopsPartInventory(record.getString("wrpt.part_id"))
                                .updateStatusForQuantityIncrease(0);
                        }

                    }
                }

                // Map values = parseJSONObject(context, record);
                // values = stripPrefix(values);
                // executeDbDelete(context, tableName, values);
                if (tableName.equals("wrcf") && tr != null) {
                    recalculateTrade(context, wr_id, tr);
                }
                if (tableName.equals("wrtl") && tooltype != null) {
                    recalculateToolType(context, wr_id, tooltype);
                }
            }
        }
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
    }

    private void markMobileSyncRecordDeleted(final String tableName, final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wrId = record.getInt(tableName + ".wr_id");
        String updateSql = "";

        if ("wrcf".equalsIgnoreCase(tableName)) {
            final String date_assigned = formatSqlFieldValue(context,
                getDateValue(context, record.getString(tableName + ".date_assigned")),
                "java.sql.Date", "date_assigned");
            final String time_assigned = formatSqlFieldValue(context,
                getTimeValueFromNeutral(context, record.getString(tableName + ".time_assigned")),
                "java.sql.Time", "time_assigned");
            updateSql = "UPDATE " + tableName + "_sync " + " SET deleted = 1 WHERE wr_id=" + wrId
                    + " AND date_assigned=" + date_assigned + " AND time_assigned=" + time_assigned;
            updateSql += " AND cf_id = '" + record.getString("wrcf.cf_id") + "'";
        } else if ("wrpt".equalsIgnoreCase(tableName)) {
            final String date_assigned = formatSqlFieldValue(context,
                getDateValue(context, record.getString(tableName + ".date_assigned")),
                "java.sql.Date", "date_assigned");
            final String time_assigned = formatSqlFieldValue(context,
                getTimeValueFromNeutral(context, record.getString(tableName + ".time_assigned")),
                "java.sql.Time", "time_assigned");
            updateSql = "UPDATE " + tableName + "_sync " + " SET deleted = 1 WHERE wr_id=" + wrId
                    + " AND date_assigned=" + date_assigned + " AND time_assigned=" + time_assigned;
            updateSql += " AND part_id = '" + record.getString("wrpt.part_id") + "'";
        } else if ("wrtl".equalsIgnoreCase(tableName)) {
            final String date_assigned = formatSqlFieldValue(context,
                getDateValue(context, record.getString(tableName + ".date_assigned")),
                "java.sql.Date", "date_assigned");
            final String time_assigned = formatSqlFieldValue(context,
                getTimeValueFromNeutral(context, record.getString(tableName + ".time_assigned")),
                "java.sql.Time", "time_assigned");
            updateSql = "UPDATE " + tableName + "_sync " + " SET deleted = 1 WHERE wr_id=" + wrId
                    + " AND date_assigned=" + date_assigned + " AND time_assigned=" + time_assigned;
            updateSql += " AND tool_id = '" + record.getString("wrtl.tool_id") + "'";
        } else if ("wrtr".equalsIgnoreCase(tableName)) {
            updateSql = "UPDATE " + tableName + "_sync " + " SET deleted = 1 WHERE wr_id=" + wrId
                    + " AND tr_id = '" + record.getString("wrtr.tr_id") + "'";
        } else if ("wr_other".equalsIgnoreCase(tableName)) {
            final String date_used = formatSqlFieldValue(context,
                getDateValue(context, record.getString(tableName + ".date_used")), "java.sql.Date",
                "date_used");
            updateSql = "UPDATE " + tableName + "_sync " + " SET deleted = 1 WHERE wr_id=" + wrId
                    + " AND other_rs_type = '" + record.getString("wr_other.other_rs_type") + "'"
                    + " AND date_used = " + date_used;
        }

        SqlUtils.executeUpdate(tableName, updateSql);
    }

    /**
     *
     * Save a Work Order.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with code of saved workorder<br />
     * <code>{wo_id: ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Add/Update work order record in <code>wo</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record
     *            </p>
     */
    public void saveWorkorder(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        executeDbSave(context, "wo", values);
        // executeDbCommit(context);

        final JSONObject json = new JSONObject();
        if (values.get("wo_id") == null) {
            final int wo_id = Common.getMaxId(context, "wo", "wo_id", null);
            json.put("wo_id", new Integer(wo_id));
        } else {
            json.put("wo_id", values.get("wo_id"));
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }

    /**
     *
     * Save Workorder and attach work request(s) to it.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * <li>wr_id : code of work request to attach to workorder</li>
     * <li><i>or</i> records : JSONArray of JSONObjects with work request codes to attach to work
     * order</li>
     * <li><i>or</i> activity_log_id : id of help request to create a work request from to attach to
     * the work order</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save work order (with current user as supervisor)</li>
     * <li>If context contains wr_id,
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager#updateStatus(String)
     * update work request status} to AA</li>
     * <li>If context contains records,
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#assignWorkRequestToWorkorder(EventHandlerContext, int, int)
     * attach work requests to workorder}</li>
     * <li>If context contains activity_log_id,
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#createWorkRequestFromActionItem(EventHandlerContext, int, boolean)
     * create work request from help request} and
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#assignWorkRequestToWorkorder(EventHandlerContext, int, int)
     * assign work request to work order}
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject fields1
     * @param JSONArray records1
     * @param String link_to1
     * @param String activity_log_id1
     *            </p>
     */
    public void saveNewWorkorder(final JSONObject fields1, final JSONArray records1,
            final String link_to1, final String activity_log_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("fields", fields1);
        context.addInputParameter("records", records1);
        context.addInputParameter("link_to", link_to1);
        context.addInputParameter("activity_log_id", activity_log_id1);
        Map fieldValues = new HashMap();
        try {
            fieldValues = parseJSONObject(context, fields1);

        } catch (final Exception e) {

        }
        Map values = stripPrefix(fieldValues);

        // set supervisor to employee logged in
        final String supervisor =
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id");
        if (StringUtil.notNullOrEmpty(supervisor)) {
            values.put("supervisor",
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
        }

        Date currentLocalDate = null;
        Time currentLocalTime = null;

        if (values.containsKey("bl_id")) {
            final String blId = (String) values.get("bl_id");

            currentLocalDate = LocalDateTimeStore.get().currentLocalDate(null, null, null, blId);
            currentLocalTime = LocalDateTimeStore.get().currentLocalTime(null, null, null, blId);
        }

        if (context.parameterExists("activity_log_id")
                && !context.getString("activity_log_id").equals("")) {
            final String activity_log_id = notNull(activity_log_id1);
            if (!"".equals(activity_log_id) && currentLocalDate == null
                    && currentLocalTime == null) {
                final Map<String, String> mapSiteAndBlId = Common.getSiteBuildingIds("activity_log",
                    "activity_log_id", notNull(activity_log_id1));
                final String siteId = mapSiteAndBlId.get("siteId");
                final String blId = mapSiteAndBlId.get("blId");

                if (siteId != null && blId != null) {
                    currentLocalDate =
                            LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
                    currentLocalTime =
                            LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
                }
            }
        }

        if (currentLocalDate == null && currentLocalTime == null) {
            if (records1.length() > 0) {
                final int wr_id = records1.getJSONObject(0).getInt("wr.wr_id");
                final Map<String, String> mapSiteAndBlId =
                        Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
                final String siteId = mapSiteAndBlId.get("siteId");
                final String blId = mapSiteAndBlId.get("blId");

                currentLocalDate =
                        LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
                currentLocalTime =
                        LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);

                // KB3040081 - get supervisor and work team from work request
                final List recs = selectDbRecords(context, Constants.WORK_REQUEST_TABLE,
                    new String[] { "supervisor", "work_team_id" }, "wr_id = " + wr_id);
                if (recs != null && !recs.isEmpty()) {
                    final Object[] record = (Object[]) recs.get(0);
                    values.put("supervisor", notNull(getStringValue(record[0])));
                    values.put("work_team_id", notNull(getStringValue(record[1])));
                }
            }
        }

        values.put("date_created", currentLocalDate);
        values.put("time_created", currentLocalTime);

        executeDbAdd(context, "wo", values);
        // executeDbCommit(context);

        final int wo_id =
                Common.getMaxId(context, "wo", "wo_id", getRestrictionFromValues(context, values));

        if (context.parameterExists("wr_id") && context.getInt("wr_id") > 0) {
            final int wr_id = context.getInt("wr_id");
            if (wr_id != 0) {
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
                statusManager.updateStatus("AA");
            }
        }

        if (context.parameterExists("records")) {
            final JSONArray records = context.getJSONArray("records");
            int link_to = 0;

            if (context.parameterExists("link_to") && !context.getString("link_to").equals("")) {
                link_to = Integer.parseInt(context.getString("link_to"));

                final String update = "UPDATE activity_log SET wr_id = NULL, wo_id = " + wo_id
                        + " WHERE activity_log_id = " + link_to;
                executeDbSql(context, update, true);
                // executeDbCommit(context);
            }
            if (records.length() > 0) {
                for (int i = 0; i < records.length(); i++) {
                    final JSONObject record = records.getJSONObject(i);
                    final int wr_id = record.getInt("wr.wr_id");
                    assignWorkRequestToWorkorder(context, wr_id, wo_id);
                    if (link_to > 0) {
                        values = new HashMap();
                        values.put("wr_id", new Integer(wr_id));
                        values.put("activity_log_id", new Integer(link_to));
                        executeDbSave(context, "wr", values);
                        // executeDbCommit(context);
                    }
                }

            }
        }

        if (context.parameterExists("activity_log_id")
                && !context.getString("activity_log_id").equals("")) {
            final int activity_log_id = Integer.parseInt(context.getString("activity_log_id"));
            if (activity_log_id != 0) {
                values = new HashMap();
                values.put("activity_log_id", new Integer(activity_log_id));
                values.put("wo_id", new Integer(wo_id));
                executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
                // executeDbCommit(context);

                final Integer wr_id = new Integer(
                    createWorkRequestFromActionItem(context, activity_log_id, false));
                assignWorkRequestToWorkorder(context, wr_id.intValue(), wo_id);
            }
        }
        final JSONObject result = new JSONObject();
        result.put("wo_id", new Integer(wo_id));
        context.addResponseParameter("jsonExpression", result.toString());

    }

    /**
     *
     * Save craftsperson assignment.
     *
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
     * <li>Check if inputs contain work request code (else throw exception)</li>
     * <li>If estimated time is given and no end date/time, calculate end date/time</li>
     * <li>If date/time assigned are given, update record in <code>wrcf</code></li>
     * <li>Else create new record in <code>wrcf</code></li>
     * <li>Update hours and costs in <code>wrcf</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for the work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateTrade(EventHandlerContext, int, String)
     * Update hours and costs for trade}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject fields
     *            </p>
     *
     */
    public void saveWorkRequestCraftsperson(final JSONObject fields) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, fields);
        values = stripPrefix(values);

        final Integer wr_id = getIntegerValue(context, values.get("wr_id"));
        if (wr_id == null) {
            // @translatable
            final String errorMessage =
                    localizeString(context, "Work Request Code missing in context");
            throw new ExceptionBase(errorMessage, true);
        }

        // normally estimated time is submitted not end time
        if (values.get("date_end") == null && values.get("time_end") == null
                && values.get("date_start") != null && values.get("time_start") != null
                && values.get("hours_est") != null) {

            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wr_id.intValue());
            final ServiceWindow serviceWindow = sla.getServiceWindow();

            final java.sql.Date startDate = getDateValue(context, values.get("date_start"));
            final java.sql.Time startTime = getTimeValue(context, values.get("time_start"));
            final Double estimatedTime = (Double) values.get("hours_est");
            final Map endDateTime = serviceWindow.calculateEscalationDate(startDate, startTime,
                estimatedTime.intValue(), "h");
            if (endDateTime != null) {
                values.put("date_end", endDateTime.get("date"));
                values.put("time_end", endDateTime.get("time"));
            }
        }

        final String cf_id = notNull(values.get("cf_id"));
        final String date = formatSqlFieldValue(context, values.get("date_assigned"),
            "java.sql.Date", "date_assigned");
        final String time = formatSqlFieldValue(context, values.get("time_assigned"),
            "java.sql.Time", "time_assigned");

        final List records = selectDbRecords(context, "wrcf", new String[] { "wr_id", "cf_id" },
            " cf_id = " + literal(context, cf_id) + " AND wr_id = " + wr_id
                    + " AND date_assigned = " + date + " AND time_assigned = " + time);
        boolean isNewCf = false;
        if (records.isEmpty()) {
            isNewCf = true;
        }

        executeDbSave(context, "wrcf", values);
        // executeDbCommit(context);

        final String wrStatus = (String) selectDbValue(context, "wr", "status", "wr_id=" + wr_id);
        if (isNewCf && ("I".equals(wrStatus) || "Com".equals(wrStatus))) {
            this.notifyCraftspersonAfterIssue(context, wr_id, cf_id);
        }

        // update wrcf (hours and costs)
        final StringBuffer sql = new StringBuffer("UPDATE wrcf SET");
        sql.append(" hours_total = hours_double + hours_over + hours_straight");
        sql.append(
            ", cost_estimated = hours_est * (SELECT cf.rate_hourly FROM cf WHERE cf.cf_id = wrcf.cf_id)");
        sql.append(
            ", cost_straight = hours_straight * (SELECT cf.rate_hourly FROM cf WHERE cf.cf_id = wrcf.cf_id)");
        sql.append(
            ", cost_double = hours_double * (SELECT cf.rate_double FROM cf WHERE cf.cf_id = wrcf.cf_id)");
        sql.append(
            ", cost_over = hours_over * (SELECT cf.rate_over FROM cf WHERE cf.cf_id = wrcf.cf_id)");
        sql.append(" WHERE cf_id = " + literal(context, cf_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time);
        executeDbSql(context, sql.toString(), true);

        final StringBuffer sql_ = new StringBuffer("UPDATE wrcf SET");
        sql_.append(" cost_total = cost_double + cost_over + cost_straight");
        sql_.append(" , hours_diff = hours_total - hours_est");
        sql_.append(" WHERE cf_id = " + literal(context, cf_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time);

        executeDbSql(context, sql_.toString(), true);
        // executeDbCommit(context);
        // update wr
        recalculateCosts(context, wr_id.intValue());
        recalculateEstCosts(context, wr_id.intValue());

        // update wrtr
        final String tr_scheduled = (String) selectDbValue(context, "wrcf", "scheduled_from_tr_id",
            "cf_id = " + literal(context, cf_id) + " AND wr_id = " + wr_id + " AND date_assigned = "
                    + date + " AND time_assigned = " + time);
        if (tr_scheduled != null) {
            recalculateTrade(context, wr_id.intValue(), tr_scheduled);
        } else {
            final String tr_id = notNull(
                selectDbValue(context, "cf", "tr_id", "cf_id = " + literal(context, cf_id)));
            values.put("scheduled_from_tr_id", tr_id);

            executeDbSave(context, "wrcf", values);
            // executeDbCommit(context);
            recalculateTrade(context, wr_id.intValue(), tr_id);
        }

        updateWrStatusFromWrcf(wr_id.intValue());

    }

    /**
     *
     * Update hours and costs in for trade estimations in <code>wrtr</code>.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update hours and costs in wrtr</li>
     * <li>Select in minimal start date/time and maximal end date/time in wrcf for craftspersons of
     * given trade</li>
     * <li>Update start and end date/time in wrtr</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wrtr SET <br />
     * hours_sched = (SELECT ISNULL(SUM(hours_est),0) FROM wrcf WHERE wr_id = ? AND cf_id IN (SELECT
     * cf_id FROM cf WHERE tr_id = ?)),<br />
     * hours_straight = (SELECT ISNULL(SUM(hours_straight),0) FROM wrcf WHERE wr_id = ? AND cf_id IN
     * (SELECT cf_id FROM cf WHERE tr_id = ?)),<br />
     * hours_over = (SELECT ISNULL(SUM(hours_over),0) FROM wrcf WHERE wr_id = ? AND cf_id IN (SELECT
     * cf_id FROM cf WHERE tr_id = ?)),<br />
     * cost_straight = (SELECT ISNULL(SUM(cost_straight),0) FROM wrcf WHERE wr_id = ? AND cf_id IN
     * (SELECT cf_id FROM cf WHERE tr_id = ?)),<br />
     * cost_over = (SELECT ISNULL(SUM(cost_over),0) FROM wrcf WHERE wr_id = ? AND cf_id IN (SELECT
     * cf_id FROM cf WHERE tr_id = ?))<br />
     * WHERE wr_id = " + wr_id + " AND tr_id = " + literal(context, tr_id); </div>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     * @param tr_id Trade code
     *            </p>
     */
    public void recalculateTrade(final EventHandlerContext context, final int wr_id,
            final String tr_id) {

        final String from = " FROM wrcf WHERE wr_id = " + wr_id
                + " AND cf_id IN (SELECT cf_id FROM cf WHERE tr_id = " + literal(context, tr_id)
                + ")";

        /*
         * String startSql = "SELECT date_start, time_start FROM wrcf WHERE wr_id = " + wr_id + "
         * AND cf_id IN (SELECT cf_id FROM cf WHERE tr_id = " + literal(context, tr_id) + ")" + "
         * ORDER BY date_start ASC, time_start ASC ";
         *
         * String endSql = "SELECT date_end, time_end FROM wrcf WHERE wr_id = " + wr_id + " AND
         * cf_id IN (SELECT cf_id FROM cf WHERE tr_id = " + literal(context, tr_id) + ")" + " ORDER
         * BY date_end DESC, time_end DESC ";
         */
        // Guo changed 2008-12-22 to fix KB3021005
        String updateSql = "UPDATE wrtr SET " + " hours_sched = (SELECT "
                + formatSqlIsNull(context, "SUM(hours_est),0") + from +
                /*
                 * "), hours_straight = (SELECT "+ formatSqlIsNull(context,"SUM(hours_straight),0")
                 * + from + "), hours_over = (SELECT "+ formatSqlIsNull(context,"SUM(hours_over),0")
                 * + from + "), cost_straight = (SELECT "+
                 * formatSqlIsNull(context,"SUM(cost_straight),0") + from +
                 * "), cost_over = (SELECT "+ formatSqlIsNull(context,"SUM(cost_over),0") + from +
                 */
                ") , hours_total = (SELECT " + formatSqlIsNull(context, "SUM(hours_total),0") + from
                + ")" + " WHERE wr_id = " + wr_id + " AND tr_id = " + literal(context, tr_id);

        executeDbSql(context, updateSql, false);

        updateSql = "UPDATE wrtr SET " + " hours_diff = hours_total - hours_est" + " WHERE wr_id = "
                + wr_id + " AND tr_id = " + literal(context, tr_id);

        executeDbSql(context, updateSql, false);
        // executeDbCommit(context);

        /*
         * List startRecs = selectDbRecords(context, startSql); List endRecs =
         * selectDbRecords(context, endSql);
         *
         * if (!startRecs.isEmpty() && !endRecs.isEmpty()) { Object[] start = (Object[])
         * startRecs.get(0); Object[] end = (Object[]) endRecs.get(0);
         *
         * Date date_start = start[0] != null ? getDateValue(context, start[0]) : null; Time
         * time_start = start[1] != null ? getTimeValue(context,start[1]): null; Date date_end =
         * end[0] != null ? getDateValue(context, end[0]): null; Time time_end = end[1] != null ?
         * getTimeValue(context,end[1]):null;
         *
         * Map values = new HashMap(); values.put("date_start", date_start);
         * values.put("time_start", time_start); values.put("date_end", date_end);
         * values.put("time_end", time_end); values.put("wr_id", new Integer(wr_id));
         * values.put("tr_id",tr_id); executeDbSave(context, "wrtr", values); }
         */
    }

    /**
     *
     * Save part reservation for a work request.
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
     * <li>If date/time assigned are given, update record in <code>wrpt</code></li>
     * <li>Else create new record in <code>wrpt</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#updateInventoryAfterEstimation(EventHandlerContext...)
     * Update inventory}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record
     *            </p>
     *
     */
    public void saveWorkRequestPart(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        int difference = 0;
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final String part_id = (String) values.get("part_id");
        String date = null;
        String time = null;

        date = formatSqlFieldValue(context, values.get("date_assigned"), "java.sql.Date",
            "date_assigned");
        time = formatSqlFieldValue(context, values.get("time_assigned"), "java.sql.Time",
            "time_assigned");
        int currEst = 0;
        if (values.get("qty_estimated") != null) {
            currEst = getIntegerValue(context, values.get("qty_estimated")).intValue();
        }
        final String where = "part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time;

        // KB#3050988 Part inventory is not updated by parts added after estimation step

        Double preQtyActual = 0.00;
        final Object ActualTmp = selectDbValue(context, "wrpt", "qty_actual", where);
        if (ActualTmp != null) {
            preQtyActual = (Double) ActualTmp;
        }

        final Double newQtyActual = Double.parseDouble(values.get("qty_actual").toString());

        final Object tmp = selectDbValue(context, "wrpt", "qty_estimated", where);
        boolean isNew = false;
        if (tmp != null) {
            final int prevEst = ((Double) tmp).intValue();
            difference = currEst - prevEst;
            executeDbSave(context, "wrpt", values);

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            if (BldgopsPartInventoryUtility.isSchemaChanged()) {
                if (difference != 0) {
                    new BldgopsPartInventory(part_id).adjustPartEstimationQuantity(wr_id, date,
                        time, difference);
                }
            }

        } else {

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            final double availQty = this.setNewWrptStatus(context, part_id, values, currEst);

            isNew = true;
            executeDbAdd(context, "wrpt", values);
            // executeDbCommit(context);

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            if (BldgopsPartInventoryUtility.isSchemaChanged()) {
                if (availQty >= currEst) {
                    new BldgopsPartInventory(part_id).updateWRPTStatus(-currEst);
                }
            }
        }

        final StringBuffer sql = new StringBuffer("UPDATE wrpt SET ");
        sql.append(
            " cost_estimated = qty_estimated * (SELECT pt.cost_unit_avg FROM pt WHERE pt.part_id = wrpt.part_id) ,");
        sql.append(
            " cost_actual = qty_actual * (SELECT pt.cost_unit_avg FROM pt WHERE pt.part_id = wrpt.part_id)");
        sql.append(" WHERE part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time);

        executeDbSql(context, sql.toString(), true);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);

        // KB#3042273: modified for Bali3 Part Inventory Improvement
        if (!BldgopsPartInventoryUtility.isSchemaChanged()) {
            updateInventoryAfterEstimation(context, values, difference, isNew);
        }

        // KB#3050988 Part inventory is not updated by parts added after estimation step.

        final String wrStatus = selectDbValue(context, "wr", "status",
            "wr_id=" + literal(context, String.valueOf(wr_id))).toString();

        if ("Com".equals(wrStatus)) {
            final String updateWrptSql = "update wrpt set debited='1',status='C' where part_id = "
                    + literal(context, part_id) + " AND wr_id = " + wr_id + " AND date_assigned = "
                    + date + " AND time_assigned = " + time;

            executeDbSql(context, updateWrptSql, true);

            final Double qtyActualDiff = newQtyActual - preQtyActual;

            if (qtyActualDiff > 0) {
                new BldgopsPartInventory(part_id).updateStatusForQuantityDecrease(-qtyActualDiff);
            }

            if (qtyActualDiff < 0) {
                new BldgopsPartInventory(part_id).updateStatusForQuantityIncrease(-qtyActualDiff);
            }
        }
    }

    /**
     *
     * Save part reservation for a work request - Multiple Part Inventory Storage Location
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
     * <li>If date/time assigned are given, update record in <code>wrpt</code></li>
     * <li>Else create new record in <code>wrpt</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#updateInventoryAfterEstimation(EventHandlerContext...)
     * Update inventory}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record
     *            </p>
     *
     */
    public void saveWorkRequestPartForMPSL(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        Double difference = 0.00;
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final String part_id = (String) values.get("part_id");
        final String partLoc = (String) values.get("pt_store_loc_id");
        BldgopsPartInventorySupplyRequisition.addNewPartToStoreLocIfNotExists(partLoc, part_id);

        String date = null;
        String time = null;

        date = formatSqlFieldValue(context, values.get("date_assigned"), "java.sql.Date",
            "date_assigned");
        time = formatSqlFieldValue(context, values.get("time_assigned"), "java.sql.Time",
            "time_assigned");
        Double currEst = 0.00;
        // KB#3051363 Part inventory calculations drop/round decimals
        if (values.get("qty_estimated") != null) {
            currEst = Double.parseDouble(values.get("qty_estimated").toString());
        }
        final String where = "pt_store_loc_id = " + literal(context, partLoc) + " and part_id = "
                + literal(context, part_id) + " AND wr_id = " + wr_id + " AND date_assigned = "
                + date + " AND time_assigned = " + time;

        final Object tmp = selectDbValue(context, "wrpt", "qty_estimated", where);

        // KB#3050988 Part inventory is not updated by parts added after estimation step

        Double preQtyActual = 0.00;
        final Object ActualTmp = selectDbValue(context, "wrpt", "qty_actual", where);
        if (ActualTmp != null) {
            preQtyActual = (Double) ActualTmp;
        }

        final Double newQtyActual = Double.parseDouble(values.get("qty_actual").toString());

        if (tmp != null) {

            final Double prevEst = ((Double) tmp);
            difference = currEst - prevEst;
            executeDbSave(context, "wrpt", values);

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            if (BldgopsPartInventoryUtility.isSchemaChanged()) {
                if (difference != 0) {
                    new BldgopsPartInventoryMultiplePartStorageLocation(part_id, partLoc)
                        .adjustPartEstimationQuantityForMpsl(wr_id, date, time, difference);
                }
            }

        } else {
            final String res = " part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                    + " AND date_assigned = " + date + " AND time_assigned = " + time;

            final Object wrptRecord = selectDbValue(context, "wrpt", "qty_estimated", res);
            if (wrptRecord != null) {
                final JSONArray wrptRecords = new JSONArray();
                final JSONObject wrptValues = new JSONObject();
                wrptValues.put("wrpt.part_id", part_id);
                wrptValues.put("wrpt.wr_id", values.get("wr_id").toString());
                wrptValues.put("wrpt.pt_store_loc_id", partLoc);
                wrptValues.put("wrpt.date_assigned", record.getString("wrpt.date_assigned"));
                wrptValues.put("wrpt.time_assigned", record.getString("wrpt.time_assigned"));

                wrptRecords.put(wrptValues);
                deleteItems("wrpt", wrptRecords);

            }

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            final double availQty =
                    this.setNewWrptStatusForMPSL(context, part_id, partLoc, values, currEst);

            executeDbAdd(context, "wrpt", values);
            // executeDbCommit(context);

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            if (BldgopsPartInventoryUtility.isSchemaChanged()) {
                if (availQty >= currEst) {
                    new BldgopsPartInventoryMultiplePartStorageLocation(part_id, partLoc)
                        .updateWrptStatusForMpsl(-currEst);
                }
            }
        }

        final StringBuffer sql = new StringBuffer("UPDATE wrpt SET ");
        sql.append(
            " cost_estimated = qty_estimated * (SELECT pt_store_loc_pt.cost_unit_avg FROM pt_store_loc_pt WHERE pt_store_loc_pt.part_id = wrpt.part_id and pt_store_loc_pt.pt_store_loc_id = wrpt.pt_store_loc_id) ,");
        sql.append(
            " cost_actual = qty_actual * (SELECT pt_store_loc_pt.cost_unit_avg FROM pt_store_loc_pt WHERE pt_store_loc_pt.part_id = wrpt.part_id and pt_store_loc_pt.pt_store_loc_id = wrpt.pt_store_loc_id)");
        sql.append(" WHERE part_id = " + literal(context, part_id) + " and wrpt.pt_store_loc_id = "
                + literal(context, partLoc) + " AND wr_id = " + wr_id + " AND date_assigned = "
                + date + " AND time_assigned = " + time);

        executeDbSql(context, sql.toString(), true);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);

        // KB#3050988 Part inventory is not updated by parts added after estimation step.

        final String wrStatus = selectDbValue(context, "wr", "status",
            "wr_id=" + literal(context, String.valueOf(wr_id))).toString();

        if ("Com".equals(wrStatus)) {
            final String updateWrptSql = "update wrpt set debited='1',status='C' where part_id = "
                    + literal(context, part_id) + " AND wr_id = " + wr_id + " AND date_assigned = "
                    + date + " AND time_assigned = " + time;

            executeDbSql(context, updateWrptSql, true);

            final Double qtyActualDiff = newQtyActual - preQtyActual;

            if (qtyActualDiff > 0) {
                new BldgopsPartInventoryMultiplePartStorageLocation(part_id, partLoc)
                    .updateStatusForQuantityDecreaseForMpsl(-qtyActualDiff);
            }

            if (qtyActualDiff < 0) {
                new BldgopsPartInventoryMultiplePartStorageLocation(part_id, partLoc)
                    .updateStatusForQuantityIncreaseForMpsl(-qtyActualDiff);
            }
        }

    }

    /**
     *
     * for the KB#3026552, REMOVE code that adjusts part inventory from the Supervisor / Update Work
     * Orders and Work Requests / Resources tab. The part's Quantity Availalbe and Quantity on
     * Reserve should only be adjusted on the Work Order Close process..
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
     * <li>If date/time assigned are given, update record in <code>wrpt</code></li>
     * <li>Else create new record in <code>wrpt</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#updateInventoryAfterEstimation(EventHandlerContext...)
     * Update inventory}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record
     *            </p>
     *
     */
    public void saveWorkRequestPartWithoutPt(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        Double difference = 0.00;
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final String part_id = (String) values.get("part_id");
        String date = null;
        String time = null;

        date = formatSqlFieldValue(context, values.get("date_assigned"), "java.sql.Date",
            "date_assigned");
        time = formatSqlFieldValue(context, values.get("time_assigned"), "java.sql.Time",
            "time_assigned");
        Double currEst = 0.00;
        // KB#3051363 Part inventory calculations drop/round decimals
        if (values.get("qty_estimated") != null) {
            currEst = Double.parseDouble(values.get("qty_estimated").toString());
        }
        final String where = "part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time;

        final Object tmp = selectDbValue(context, "wrpt", "qty_estimated", where);
        if (tmp != null) {
            final Double prevEst = ((Double) tmp);
            difference = currEst - prevEst;
            executeDbSave(context, "wrpt", values);

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            if (BldgopsPartInventoryUtility.isSchemaChanged()) {
                if (difference != 0) {
                    new BldgopsPartInventory(part_id).adjustPartEstimationQuantity(wr_id, date,
                        time, difference);
                }

            }

        } else {

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            final double availQty = this.setNewWrptStatus(context, part_id, values, currEst);

            executeDbAdd(context, "wrpt", values);
            // executeDbCommit(context);

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            if (BldgopsPartInventoryUtility.isSchemaChanged()) {
                if (availQty >= currEst) {
                    new BldgopsPartInventory(part_id).updateWRPTStatus(-currEst);
                }
            }
        }

        final StringBuffer sql = new StringBuffer("UPDATE wrpt SET ");
        sql.append(
            " cost_estimated = qty_estimated * (SELECT pt.cost_unit_avg FROM pt WHERE pt.part_id = wrpt.part_id) ,");
        sql.append(
            " cost_actual = qty_actual * (SELECT pt.cost_unit_avg FROM pt WHERE pt.part_id = wrpt.part_id)");
        sql.append(" WHERE part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time);

        executeDbSql(context, sql.toString(), true);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);

        // KB#3042273: modified for Bali3 Part Inventory Improvement
        if (!BldgopsPartInventoryUtility.isSchemaChanged()) {
            updateInventoryAfterEstimationWithoutPt(context, values, difference);
        }
    }

    /**
     *
     * Update parts inventory after reservation of a part for a work request.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select new parts reservations for the given work request</li>
     * <li>If the reservation status is 'R' update the quantity on reserve and the quantity on hand
     * in the <code>pt</code>table</li>
     * <li>Else only update the quantity on hand in the <code>pt</code> table. (Parts used without
     * reservation)</li>
     * <li>Update the reservation record in <code>wrpt</code>: set status to 'C' and debited to 1
     * </li>
     * </ol>
     * <p>
     * <b>SQL:</b> Select records from wrpt: <div>SELECT
     * wrpt.part_id,wrpt.qty_estimated,wrpt.status,
     * wrpt.qty_actual,wrpt.date_assigned,wrpt.time_assigned,wrpt.wr_id<br />
     * FROM wrpt,wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wrpt.debited != 1 AND wr.wr_id = ?</div> Update reserved
     * parts: (for each selected record with status='R') <div> UPDATE pt SET<br />
     * qty_on_reserve = qty_on_reserve - <i>wrpt.qty_estimated</i>,<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_estimated</i> - <i>wrpt.qty_actual</i><br />
     * WHERE part_id = <i>wrpt.part_id</i> </div> Update other parts: (for each selected record with
     * status !='R') <div> UPDATE pt SET<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_actual</i><br />
     * WHERE part_id = <i>wrpt.part_id</i> </div>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Updated work request
     *
     */
    public void updateInventory(final EventHandlerContext context, final int wr_id) {
        if (getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID, "UseBldgOpsConsole")
            .intValue() > 0) {
            updateInventoryForMPSL(context, wr_id);
        } else {
            final String[] wrptFieldNames = { "part_id", "qty_estimated", "status", "qty_actual",
                    "date_assigned", "time_assigned", "wr_id", "debited" };

            final String sqlRestriction =
                    "wr.wr_id = wrpt.wr_id AND wrpt.debited != 1 AND wr.wr_id = " + wr_id;

            final DataSource wrptDs =
                    DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                        .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFieldNames)
                        .addField("wr", "wr_id").addRestriction(Restrictions.sql(sqlRestriction));

            final String[] ptFieldNames = { "qty_on_hand", "qty_on_reserve", "part_id" };
            final DataSource ptDs = DataSourceFactory.createDataSource()
                .addTable("pt", DataSource.ROLE_MAIN).addField("pt", ptFieldNames);

            final List<DataRecord> listRecords = wrptDs.getAllRecords();

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            final boolean isSchemaChanged = BldgopsPartInventoryUtility.isSchemaChanged();

            if (listRecords != null && !listRecords.isEmpty()) {
                for (final DataRecord dataRecord : listRecords) {
                    final String status = dataRecord.getString("wrpt.status");
                    final String partId = dataRecord.getString("wrpt.part_id");

                    final double qty_estimated = dataRecord.getDouble("wrpt.qty_estimated");
                    final double qty_actual = dataRecord.getDouble("wrpt.qty_actual");

                    ptDs.clearRestrictions();
                    ptDs.addRestriction(Restrictions.eq("pt", "part_id", partId));

                    final DataRecord ptDataRecord = ptDs.getRecord();

                    // KB#3042273: modified for Bali3 Part Inventory Improvement
                    if (isSchemaChanged) {

                        dataRecord.setValue("wrpt.status", "C");
                        dataRecord.setValue("wrpt.debited", 1);
                        wrptDs.updateRecord(dataRecord);
                        // wrptDs.commit();

                        new BldgopsPartInventory(partId).updateStatusForRequestClose(dataRecord,
                            status);

                    } else {

                        final double qty_on_reserve = ptDataRecord.getDouble("pt.qty_on_reserve");
                        final double qty_on_hand = ptDataRecord.getDouble("pt.qty_on_hand");

                        if ("R".equals(status)) {
                            ptDataRecord.setValue("pt.qty_on_reserve",
                                qty_on_reserve - qty_estimated);
                            ptDataRecord.setValue("pt.qty_on_hand",
                                qty_on_hand - qty_actual + qty_estimated);
                        } else {
                            ptDataRecord.setValue("pt.qty_on_hand", qty_on_hand - qty_actual);
                        }

                        ptDs.updateRecord(ptDataRecord);
                        // ptDs.commit();
                        dataRecord.setValue("wrpt.status", "C");
                        dataRecord.setValue("wrpt.debited", 1);
                        wrptDs.updateRecord(dataRecord);
                    }
                }
                // KB#3042273: modified for Bali3 Part Inventory Improvement
                if (!isSchemaChanged) {
                    // wrptDs.commit();
                }

            }

        }
    }

    /**
     *
     * Back out inventory.
     *
     * @param context Workflow rule execution context
     * @param wr_id Updated work request
     *
     */
    public void backOutInventory(final EventHandlerContext context, final int wr_id) {
        if (getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID, "UseBldgOpsConsole")
            .intValue() > 0) {
            backOutInventoryForMPSL(context, wr_id);
        } else {
            final String[] wrptFieldNames = { "part_id", "qty_estimated", "status", "qty_actual",
                    "date_assigned", "time_assigned", "wr_id", "debited", "pt_store_loc_id" };

            final String sqlRestriction =
                    "wr.wr_id = wrpt.wr_id AND wrpt.debited != 0 and wrpt.status='C' AND wr.wr_id = "
                            + wr_id;

            final DataSource wrptDs =
                    DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                        .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFieldNames)
                        .addField("wr", "wr_id").addRestriction(Restrictions.sql(sqlRestriction));

            final List<DataRecord> wrptRecords = wrptDs.getAllRecords();

            if (wrptRecords != null && !wrptRecords.isEmpty()) {

                // back out part inventory.
                for (final DataRecord wrptRecord : wrptRecords) {
                    final String partId = wrptRecord.getString("wrpt.part_id");

                    final double qtyActual = wrptRecord.getDouble("wrpt.qty_actual");

                    // Add Quantity Actual to current Available.
                    new BldgopsPartInventory(partId).updateStatusForQuantityIncrease(qtyActual);

                }
                // Compare current quantity available with estimate quantity, reset status.
                for (final DataRecord wrptRecord : wrptRecords) {

                    final String partId = wrptRecord.getString("wrpt.part_id");
                    wrptRecord.getString("wrpt.pt_store_loc_id");
                    final double qtyEstimate = wrptRecord.getDouble("wrpt.qty_estimated");

                    final DataSource partDS = DataSourceFactory.createDataSourceForFields(PT_TABLE,
                        new String[] { "part_id", "qty_on_hand" });

                    final DataRecord ptRecord = partDS.getRecord("part_id='" + partId + "'");

                    final double currentQtyAvailable = ptRecord.getDouble("pt.qty_on_hand");

                    if (qtyEstimate <= currentQtyAvailable) {
                        // kb#3050988 Part inventory is not updated by parts added after estimation
                        // step
                        // Set part reservation=Reserved if there are enough part on avaliable when
                        // backing out the request to re-issued.
                        this.autoReservedPartsAfterBackout(wrptRecord);
                        // wrptRecord.setValue("wrpt.status", "NR");
                    } else {
                        wrptRecord.setValue("wrpt.status", "NI");
                    }

                    wrptRecord.setValue("wrpt.debited", 0);
                    wrptDs.updateRecord(wrptRecord);

                }

            }

        }
    }

    /**
     * Auto Reserved part after back out work request. TODO autoReservedPartsAfterBackout.
     *
     * @param wrptRecord
     */
    public void autoReservedPartsAfterBackout(final DataRecord wrptRecord) {
        final String partId = wrptRecord.getString("wrpt.part_id");
        final double qtyEstimated = wrptRecord.getDouble("wrpt.qty_estimated");
        // Create pt dataSource.
        final String[] ptFieldNames = { "part_id", "qty_on_reserve", "qty_on_hand" };
        final String ptSqlRestriction = "pt.part_id='" + partId + "'";
        final DataSource ptDs = DataSourceFactory.createDataSource()
            .addTable("pt", DataSource.ROLE_MAIN).addField("pt", ptFieldNames)
            .addRestriction(Restrictions.sql(ptSqlRestriction));

        // Create wrpt dataSource.
        final String[] wrptFieldNames = { "part_id", "qty_estimated", "status", "qty_actual",
                "date_assigned", "time_assigned", "wr_id" };
        final String wrptSqlRestriction = "wr.wr_id = wrpt.wr_id";
        final DataSource wrptDs =
                DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                    .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFieldNames)
                    .addField("wr", "wr_id").addRestriction(Restrictions.sql(wrptSqlRestriction));

        final DataRecord ptRecord = ptDs.getRecord();

        if (ptRecord != null && !ptRecord.isNew()) {
            final double currentReservedQty =
                    Double.parseDouble(ptRecord.getValue("pt.qty_on_reserve").toString())
                            + qtyEstimated;
            final double currentAvailQty =
                    Double.parseDouble(ptRecord.getValue("pt.qty_on_hand").toString())
                            - qtyEstimated;
            // If parts quantity enough, then reserve part.
            if (currentAvailQty > 0) {
                ptRecord.setValue("pt.qty_on_reserve", currentReservedQty);
                ptRecord.setValue("pt.qty_on_hand", currentAvailQty);
                ptDs.saveRecord(ptRecord);

                wrptRecord.setValue("wrpt.status", "R");
                wrptDs.saveRecord(wrptRecord);

                // Get other work request part with status 'In Stock,Not Reserved', if quantity
                // availiable is not enough,then change status to be 'Not In Stock'.
                final String reservedWrptSqlRestriction =
                        "wrpt.part_id='" + partId + "' and wrpt.status='NR'";
                wrptDs.addRestriction(Restrictions.sql(reservedWrptSqlRestriction));
                final List<DataRecord> notReservedRecords = wrptDs.getAllRecords();

                for (final DataRecord notReservedRecord : notReservedRecords) {
                    final double estimated = notReservedRecord.getDouble("wrpt.qty_estimated");

                    if (estimated > currentAvailQty) {
                        notReservedRecord.setValue("wrpt.status", "NI");

                        wrptDs.saveRecord(notReservedRecord);
                    }
                }

            }
        }
    }

    /**
     *
     * Update parts inventory after reservation of a part for a work request.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select new parts reservations for the given work request</li>
     * <li>If the reservation status is 'R' update the quantity on reserve and the quantity on hand
     * in the <code>pt</code>table</li>
     * <li>Else only update the quantity on hand in the <code>pt</code> table. (Parts used without
     * reservation)</li>
     * <li>Update the reservation record in <code>wrpt</code>: set status to 'C' and debited to 1
     * </li>
     * </ol>
     * <p>
     * <b>SQL:</b> Select records from wrpt: <div>SELECT
     * wrpt.part_id,wrpt.qty_estimated,wrpt.status,
     * wrpt.qty_actual,wrpt.date_assigned,wrpt.time_assigned,wrpt.wr_id<br />
     * FROM wrpt,wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wrpt.debited != 1 AND wr.wr_id = ?</div> Update reserved
     * parts: (for each selected record with status='R') <div> UPDATE pt SET<br />
     * qty_on_reserve = qty_on_reserve - <i>wrpt.qty_estimated</i>,<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_estimated</i> - <i>wrpt.qty_actual</i><br />
     * WHERE part_id = <i>wrpt.part_id</i> </div> Update other parts: (for each selected record with
     * status !='R') <div> UPDATE pt SET<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_actual</i><br />
     * WHERE part_id = <i>wrpt.part_id</i> </div>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Updated work request
     *
     */
    public void updateInventoryForMPSL(final EventHandlerContext context, final int wr_id) {

        final String[] wrptFieldNames = { "part_id", "qty_estimated", "status", "qty_actual",
                "date_assigned", "time_assigned", "wr_id", "debited", "pt_store_loc_id" };

        final String sqlRestriction =
                "wr.wr_id = wrpt.wr_id AND wrpt.debited != 1 AND wr.wr_id = " + wr_id;

        final DataSource wrptDs =
                DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                    .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFieldNames)
                    .addField("wr", "wr_id").addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> listRecords = wrptDs.getAllRecords();

        if (listRecords != null && !listRecords.isEmpty()) {
            for (final DataRecord dataRecord : listRecords) {
                final String status = dataRecord.getString("wrpt.status");
                final String partId = dataRecord.getString("wrpt.part_id");
                final String partLoc = dataRecord.getString("wrpt.pt_store_loc_id");

                dataRecord.getDouble("wrpt.qty_estimated");
                dataRecord.getDouble("wrpt.qty_actual");

                dataRecord.setValue("wrpt.status", "C");
                dataRecord.setValue("wrpt.debited", 1);
                wrptDs.updateRecord(dataRecord);
                new BldgopsPartInventoryMultiplePartStorageLocation(partId, partLoc)
                    .updateStatusForRequestCloseForMpsl(dataRecord, status);
            }
        }
    }

    /**
     * Back out inventory for multiple storage location.
     *
     * @param context Workflow rule execution context
     * @param wr_id Updated work request
     */
    public void backOutInventoryForMPSL(final EventHandlerContext context, final int wr_id) {

        final String[] wrptFieldNames = { "part_id", "qty_estimated", "status", "qty_actual",
                "date_assigned", "time_assigned", "wr_id", "debited", "pt_store_loc_id" };

        final String sqlRestriction =
                "wr.wr_id = wrpt.wr_id AND wrpt.debited != 0 and wrpt.status='C' AND wr.wr_id = "
                        + wr_id;

        final DataSource wrptDs =
                DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                    .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFieldNames)
                    .addField("wr", "wr_id").addRestriction(Restrictions.sql(sqlRestriction));

        final List<DataRecord> wrptRecords = wrptDs.getAllRecords();

        if (wrptRecords != null && !wrptRecords.isEmpty()) {

            // back out part inventory.
            for (final DataRecord wrptRecord : wrptRecords) {
                final String partId = wrptRecord.getString("wrpt.part_id");
                final String partLoc = wrptRecord.getString("wrpt.pt_store_loc_id");

                final double qtyActual = wrptRecord.getDouble("wrpt.qty_actual");

                // Add Quantity Actual to current Available.
                new BldgopsPartInventoryMultiplePartStorageLocation(partId, partLoc)
                    .updateStatusForQuantityIncreaseForMpsl(qtyActual);

            }
            // Compare current quantity available with estimate quantity, reset status.
            for (final DataRecord wrptRecord : wrptRecords) {

                final String partId = wrptRecord.getString("wrpt.part_id");
                final String partLoc = wrptRecord.getString("wrpt.pt_store_loc_id");
                final double qtyEstimate = wrptRecord.getDouble("wrpt.qty_estimated");

                final DataSource partLocDS =
                        DataSourceFactory.createDataSourceForFields(PT_STORE_LOC_PT_TABLE,
                            new String[] { "part_id", "qty_on_hand", "pt_store_loc_id" });

                final DataRecord ptStoreLocRecord = partLocDS
                    .getRecord("part_id='" + partId + "' and pt_store_loc_id='" + partLoc + "'");

                final double currentQtyAvailable =
                        ptStoreLocRecord.getDouble("pt_store_loc_pt.qty_on_hand");

                if (qtyEstimate <= currentQtyAvailable) {
                    // wrptRecord.setValue("wrpt.status", "NR");
                    // kb#3050988 Part inventory is not updated by parts added after estimation
                    // step
                    // Set part reservation=Reserved if there are enough part on avaliable when
                    // backing out the request to re-issued.
                    this.autoReservedPartsAfterBackoutForMPSL(wrptRecord);
                } else {
                    wrptRecord.setValue("wrpt.status", "NI");
                }

                // Re-set the debited field value to 0.
                wrptRecord.setValue("wrpt.debited", 0);
                wrptDs.updateRecord(wrptRecord);

            }
        }

    }

    /**
     * Auto Reserved part after back out work request. TODO autoReservedPartsAfterBackout.
     *
     * @param wrptRecord
     */
    public void autoReservedPartsAfterBackoutForMPSL(final DataRecord wrptRecord) {
        final String partId = wrptRecord.getString("wrpt.part_id");
        final String partLoc = wrptRecord.getString("wrpt.pt_store_loc_id");
        final double qtyEstimated = wrptRecord.getDouble("wrpt.qty_estimated");
        // Create pt dataSource.
        final String[] ptFieldNames = { "part_id", "qty_on_reserve", "qty_on_hand" };
        final String ptSqlRestriction = "pt.part_id='" + partId + "'";
        final DataSource ptDs = DataSourceFactory.createDataSource()
            .addTable("pt", DataSource.ROLE_MAIN).addField("pt", ptFieldNames)
            .addRestriction(Restrictions.sql(ptSqlRestriction));

        // Create wrpt dataSource.
        final String[] wrptFieldNames = { "part_id", "pt_store_loc_id", "qty_estimated", "status",
                "qty_actual", "date_assigned", "time_assigned", "wr_id" };
        final String wrptSqlRestriction = "wr.wr_id = wrpt.wr_id";
        final DataSource wrptDs =
                DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                    .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFieldNames)
                    .addField("wr", "wr_id").addRestriction(Restrictions.sql(wrptSqlRestriction));

        // Create pt_store_loc_pt dataSource
        final String[] ptStoreLocFieldNames =
                { "part_id", "pt_store_loc_id", "qty_on_reserve", "qty_on_hand" };
        final String ptStoreLocSqlRestriction =
                "part_id='" + partId + "' and pt_store_loc_id='" + partLoc + "'";
        final DataSource ptStoreLocDs = DataSourceFactory.createDataSource()
            .addTable("pt_store_loc_pt", DataSource.ROLE_MAIN)
            .addField("pt_store_loc_pt", ptStoreLocFieldNames)
            .addRestriction(Restrictions.sql(ptStoreLocSqlRestriction));

        final DataRecord ptRecord = ptDs.getRecord();

        if (ptRecord != null && !ptRecord.isNew()) {
            final double currentReservedQty =
                    Double.parseDouble(ptRecord.getValue("pt.qty_on_reserve").toString())
                            + qtyEstimated;
            final double currentAvailQty =
                    Double.parseDouble(ptRecord.getValue("pt.qty_on_hand").toString())
                            - qtyEstimated;
            // If parts quantity enough, then reserve part.
            if (currentAvailQty > 0) {
                // Adjust quantity reserved and quantity available of Part table.
                ptRecord.setValue("pt.qty_on_reserve", currentReservedQty);
                ptRecord.setValue("pt.qty_on_hand", currentAvailQty);
                ptDs.saveRecord(ptRecord);

                wrptRecord.setValue("wrpt.status", "R");
                wrptDs.saveRecord(wrptRecord);
                // Adjust quantity reserved and quantity available of part storage location table.
                final DataRecord ptStoreLocRecord = ptStoreLocDs.getRecord();

                final double currentLocReservedQty = Double.parseDouble(
                    ptStoreLocRecord.getValue("pt_store_loc_pt.qty_on_reserve").toString())
                        + qtyEstimated;
                final double currentLocAvailQty = Double.parseDouble(
                    ptStoreLocRecord.getValue("pt_store_loc_pt.qty_on_hand").toString())
                        - qtyEstimated;
                ptStoreLocRecord.setValue("pt_store_loc_pt.qty_on_reserve", currentLocReservedQty);
                ptStoreLocRecord.setValue("pt_store_loc_pt.qty_on_hand", currentLocAvailQty);
                ptStoreLocDs.saveRecord(ptStoreLocRecord);

                // Get other work request part with status 'In Stock,Not Reserved', if quantity
                // availiable is not enough,then change status to be 'Not In Stock'.
                final String reservedWrptSqlRestriction = "wrpt.part_id='" + partId
                        + "' and wrpt.pt_store_loc_id='" + partLoc + "' and wrpt.status='NR'";
                wrptDs.addRestriction(Restrictions.sql(reservedWrptSqlRestriction));
                final List<DataRecord> notReservedRecords = wrptDs.getAllRecords();

                for (final DataRecord notReservedRecord : notReservedRecords) {
                    final double estimated = notReservedRecord.getDouble("wrpt.qty_estimated");

                    if (estimated > currentLocAvailQty) {
                        notReservedRecord.setValue("wrpt.status", "NI");

                        wrptDs.saveRecord(notReservedRecord);
                    }
                }

            }
        }
    }

    /**
     * Update newly created part estimation's status by comparing the estimated quantity with
     * available quantity, meanwhile return tha part's avialable quantity.
     *
     * @param context
     * @param part_id
     */
    private double setNewWrptStatus(final EventHandlerContext context, final String part_id,
            final Map values, final double currEst) {

        final String[] ptFieldNames = { "qty_on_hand", "qty_on_reserve", "part_id" };
        final DataSource ptDs = DataSourceFactory.createDataSource()
            .addTable("pt", DataSource.ROLE_MAIN).addField("pt", ptFieldNames);

        ptDs.addRestriction(Restrictions.eq("pt", "part_id", part_id));

        final DataRecord part = ptDs.getRecord();

        final double availQty = part.getDouble("pt.qty_on_hand");
        part.getDouble("pt.qty_on_reserve");
        if (availQty >= currEst) {
            values.put("status", "R");

        } else {
            values.put("status", "NI");
        }

        return availQty;

    }

    /**
     * Update newly created part estimation's status by comparing the estimated quantity with
     * available quantity, meanwhile return tha part's avialable quantity.
     *
     * @param context
     * @param part_id
     */
    private double setNewWrptStatusForMPSL(final EventHandlerContext context, final String part_id,
            final String partLoc, final Map values, final double currEst) {

        final String[] ptFieldNames = { "qty_on_hand", "qty_on_reserve", "part_id" };
        final DataSource ptLocDs = DataSourceFactory.createDataSource()
            .addTable("pt_store_loc_pt", DataSource.ROLE_MAIN)
            .addField("pt_store_loc_pt", ptFieldNames);

        ptLocDs.addRestriction(Restrictions.eq("pt_store_loc_pt", "part_id", part_id));
        ptLocDs.addRestriction(Restrictions.eq("pt_store_loc_pt", "pt_store_loc_id", partLoc));

        final DataRecord partLocRecord = ptLocDs.getRecord();

        final double availQty = partLocRecord.getDouble("pt_store_loc_pt.qty_on_hand");
        if (availQty >= currEst) {
            values.put("status", "R");

        } else {
            values.put("status", "NI");
        }

        return availQty;

    }

    /**
     * Update inventory after cancel action excude
     *
     * @param context
     * @param wr_id
     */
    private void updateInventoryAfterCancel(final EventHandlerContext context, final int wr_id) {
        if (getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID, "UseBldgOpsConsole")
            .intValue() > 0) {
            updateInventoryAfterCancelForMPSL(context, wr_id);
        } else {
            final String[] fieldNames = { "part_id", "qty_estimated", "status", "date_assigned",
                    "time_assigned", "wr_id" };
            final DataSource wrptDs = DataSourceFactory.createDataSource()
                .addTable("wrpt", DataSource.ROLE_MAIN).addField("wrpt", fieldNames)
                .addRestriction(Restrictions.eq("wrpt", "wr_id", wr_id));

            final String[] ptFieldNames = { "qty_on_hand", "qty_on_reserve", "part_id" };
            final DataSource ptDs = DataSourceFactory.createDataSource()
                .addTable("pt", DataSource.ROLE_MAIN).addField("pt", ptFieldNames);

            final List<DataRecord> listRecords = wrptDs.getAllRecords();

            // KB#3042273: modified for Bali3 Part Inventory Improvement
            final boolean isSchemaChanged = BldgopsPartInventoryUtility.isSchemaChanged();

            for (final DataRecord dataRecord : listRecords) {

                final String status = notNull(dataRecord.getString("wrpt.status"));
                final String partId = notNull(dataRecord.getString("wrpt.part_id"));
                final double qtyEstimated = dataRecord.getDouble("wrpt.qty_estimated");

                dataRecord.setValue("wrpt.status", "C");
                wrptDs.updateRecord(dataRecord);

                if (status.equals("R") && qtyEstimated != 0.0) {// put reserved
                    ptDs.clearRestrictions();
                    ptDs.addRestriction(Restrictions.eq("pt", "part_id", partId));

                    final DataRecord ptDataRecord = ptDs.getRecord();

                    final double qtyOnHand = ptDataRecord.getDouble("pt.qty_on_hand");
                    final double qtyOnReserve = ptDataRecord.getDouble("pt.qty_on_reserve");

                    // KB#3042273: modified for Bali3 Part Inventory Improvement
                    if (!isSchemaChanged) {
                        ptDataRecord.setValue("pt.qty_on_hand", qtyOnHand + qtyEstimated);
                    }
                    ptDataRecord.setValue("pt.qty_on_reserve", qtyOnReserve - qtyEstimated);

                    ptDs.updateRecord(ptDataRecord);
                    // ptDs.commit();

                    // KB#3042273: modified for Bali3 Part Inventory Improvement
                    if (isSchemaChanged) {
                        if (qtyEstimated != 0) {
                            new BldgopsPartInventory(partId).updateWRPTStatus(qtyEstimated);
                        }
                    }
                }
            }
        }

        // wrptDs.commit();

    }

    /**
     * Update inventory after cancel action excute for multiple storage location.
     *
     * @param context EventHandler context.
     * @param wr_id Work Request code.
     */
    public void updateInventoryAfterCancelForMPSL(final EventHandlerContext context,
            final int wr_id) {
        final String[] fieldNames = { "part_id", "qty_estimated", "status", "date_assigned",
                "time_assigned", "wr_id", "pt_store_loc_id" };
        final DataSource wrptDs = DataSourceFactory.createDataSource()
            .addTable("wrpt", DataSource.ROLE_MAIN).addField("wrpt", fieldNames)
            .addRestriction(Restrictions.eq("wrpt", "wr_id", wr_id));

        final String[] ptFieldNames = { "qty_on_hand", "qty_on_reserve", "part_id" };
        final String[] ptStoreFieldNames =
                { "qty_on_hand", "qty_on_reserve", "part_id", "pt_store_loc_pt_id" };
        final DataSource ptDs = DataSourceFactory.createDataSource()
            .addTable("pt", DataSource.ROLE_MAIN).addField("pt", ptFieldNames);
        final DataSource ptStoreLocDs = DataSourceFactory.createDataSource()
            .addTable("pt_store_loc_pt", DataSource.ROLE_MAIN)
            .addField("pt_store_loc_pt", ptStoreFieldNames);

        final List<DataRecord> listRecords = wrptDs.getAllRecords();

        // KB#3042273: modified for Bali3 Part Inventory Improvement
        final boolean isSchemaChanged = BldgopsPartInventoryUtility.isSchemaChanged();

        for (final DataRecord dataRecord : listRecords) {
            final String storeLocId = notNull(dataRecord.getString("wrpt.pt_store_loc_id"));
            final String status = notNull(dataRecord.getString("wrpt.status"));
            final String partId = notNull(dataRecord.getString("wrpt.part_id"));
            final double qtyEstimated = dataRecord.getDouble("wrpt.qty_estimated");

            dataRecord.setValue("wrpt.status", "C");
            wrptDs.updateRecord(dataRecord);

            if (status.equals("R") && qtyEstimated != 0.0) {// put reserved
                ptDs.clearRestrictions();
                ptDs.addRestriction(Restrictions.eq("pt", "part_id", partId));

                ptStoreLocDs.clearRestrictions();
                ptStoreLocDs.addRestriction(Restrictions.eq("pt_store_loc_pt", "part_id", partId));
                ptStoreLocDs.addRestriction(
                    Restrictions.eq("pt_store_loc_pt", "pt_store_loc_pt_id", storeLocId));

                final DataRecord ptDataRecord = ptDs.getRecord();
                final DataRecord ptStoreLocDataRecord = ptStoreLocDs.getRecord();

                final double qtyOnHand = ptDataRecord.getDouble("pt.qty_on_hand");
                final double qtyOnReserve = ptDataRecord.getDouble("pt.qty_on_reserve");

                // KB#3042273: modified for Bali3 Part Inventory Improvement
                if (!isSchemaChanged) {
                    ptDataRecord.setValue("pt.qty_on_hand", qtyOnHand + qtyEstimated);
                    ptStoreLocDataRecord.setValue("pt_store_loc_pt.qty_on_hand",
                        ptStoreLocDataRecord.getDouble("pt_store_loc_pt.qty_on_hand")
                                + qtyEstimated);
                }
                ptDataRecord.setValue("pt.qty_on_reserve", qtyOnReserve - qtyEstimated);
                ptStoreLocDataRecord.setValue("pt_store_loc_pt.qty_on_reserve",
                    ptStoreLocDataRecord.getDouble("pt_store_loc_pt.qty_on_reserve")
                            - qtyEstimated);

                ptDs.updateRecord(ptDataRecord);

                ptStoreLocDs.updateRecord(ptStoreLocDataRecord);
                // ptDs.commit();

                // KB#3042273: modified for Bali3 Part Inventory Improvement
                if (isSchemaChanged) {
                    if (qtyEstimated != 0) {
                        new BldgopsPartInventoryMultiplePartStorageLocation(partId, storeLocId)
                            .updateWrptStatusForMpsl(qtyEstimated);
                    }
                }
            }
        }
    }

    /**
     *
     * for the KB#3026552, REMOVE code that adjusts part inventory from the Supervisor / Update Work
     * Orders and Work Requests / Resources tab. The part's Quantity Availalbe and Quantity on
     * Reserve should only be adjusted on the Work Order Close process..
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from <code>wrpt</code> for parts which are not yet reserved for the given
     * work request</li>
     * <li>If enough parts are in stock, update the inventory and set the status in
     * <code>wrpt</code> to 'R' (Reserved)</li>
     * <li>Else set the status in <code>wrpt</code> to 'NI' (Not in stock)
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> Select reservation records from wrpt <div> SELECT
     * wrpt.part_id,wrpt.qty_estimated,wrpt.status,wrpt.date_assigned,wrpt.time_assigned,wrpt.wr_id
     * <br />
     * FROM wrpt, wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wr.wr_id = ? <br />
     * AND wrpt.qty_estimated > 0 AND wrpt.status <> 'R' </div> Update inventory if parts are in
     * stock <div> UPDATE pt SET<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_estimated</i>,<br />
     * qty_on_reserve = qty_on_reserve + <i>wrpt.qty_estimated</i><br />
     * WHERE part_id = ? </div> <div>UPDATE wrpt SET status='R' WHERE part_id =?</div> Update
     * reservation if parts are not in stock <div>UPDATE wrpt SET status='NI' WHERE part_id =?</div>
     * </p>
     *
     * @param context Workflow rule execution context
     * @param Map partEstimation
     * @param int difference
     */
    private void updateInventoryAfterEstimationWithoutPt(final EventHandlerContext context,
            final Map partEstimation, final Double difference) {
        final int wr_id = getIntegerValue(context, partEstimation.get("wr_id")).intValue();
        final Date date_assigned = getDateValue(context, partEstimation.get("date_assigned"));
        final Time time_assigned = getTimeValue(context, partEstimation.get("time_assigned"));
        final String part_id = notNull(partEstimation.get("part_id"));

        final String[] fields = new String[] { "part_id", "qty_estimated", "status",
                "date_assigned", "time_assigned", "wr_id" };
        final StringBuffer sql = new StringBuffer();
        sql.append("wr_id = " + wr_id + " AND part_id = " + literal(context, part_id));
        sql.append(" AND date_assigned = "
                + formatSqlFieldValue(context, date_assigned, "java.sql.Date", "date_assigned"));
        sql.append(" AND time_assigned = "
                + formatSqlFieldValue(context, time_assigned, "java.sql.Time", "time_assigned"));

        final Object[] record = selectDbValues(context, "wrpt", fields, sql.toString());

        final Object[] part_record =
                selectDbValues(context, "pt", new String[] { "qty_on_hand", "qty_on_reserve" },
                    "part_id=" + literal(context, part_id));
        final int parts_on_hand = getIntegerValue(context, part_record[0]).intValue();
        getIntegerValue(context, part_record[1]).intValue();

        if (record != null) {
            final Map values = new HashMap();
            for (int i = 0; i < fields.length; i++) {
                if (fields[i].startsWith("time")) {
                    values.put(fields[i], getTimeValue(context, record[i]));
                } else if (fields[i].startsWith("date")) {
                    values.put(fields[i], getDateValue(context, record[i]));
                } else if (fields[i].equals("wr_id")) {
                    values.put(fields[i], getIntegerValue(context, record[i]));
                } else {
                    values.put(fields[i], record[i]);
                }
            }
            final int qty_estimated =
                    getIntegerValue(context, values.get("qty_estimated")).intValue();
            values.remove("qty_estimated");// preventing class cast errors when
            // saving
            final String status = notNull(values.get("status")).trim();

            if (difference == 0) { // new estimation
                if (qty_estimated <= parts_on_hand) {
                    // update parts inventory

                    values.put("status", "R");
                    executeDbSave(context, "wrpt", stripPrefix(values));
                    // executeDbCommit(context);
                } else {
                    values.put("status", "NI");
                    executeDbSave(context, "wrpt", stripPrefix(values));
                    // executeDbCommit(context);
                }
            } else if (difference < 0) {// less parts estimated then before
                if (status.equals("NI")) {
                    if (qty_estimated <= parts_on_hand) {

                        values.put("status", "R");
                        executeDbSave(context, "wrpt", stripPrefix(values));
                        // executeDbCommit(context);
                    } // else leave status in NI
                } else if (status.equals("R")) {// put difference back in stock

                }
            } else if (difference > 0) {
                if (status.equals("R")) {
                    if (parts_on_hand < difference) {// not enough in stock
                        // anymore, put reserved
                        // stuff back
                        values.put("status", "NI");
                        executeDbSave(context, "wrpt", stripPrefix(values));
                        // executeDbCommit(context);
                    } else {
                    }
                } // status = NI => nothing to change
            }
        }
    }

    /**
     *
     * Update parts inventory after the estimation of a work request.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from <code>wrpt</code> for parts which are not yet reserved for the given
     * work request</li>
     * <li>If enough parts are in stock, update the inventory and set the status in
     * <code>wrpt</code> to 'R' (Reserved)</li>
     * <li>Else set the status in <code>wrpt</code> to 'NI' (Not in stock)
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> Select reservation records from wrpt <div> SELECT
     * wrpt.part_id,wrpt.qty_estimated,wrpt.status,wrpt.date_assigned,wrpt.time_assigned,wrpt.wr_id
     * <br />
     * FROM wrpt, wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wr.wr_id = ? <br />
     * AND wrpt.qty_estimated > 0 AND wrpt.status <> 'R' </div> Update inventory if parts are in
     * stock <div> UPDATE pt SET<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_estimated</i>,<br />
     * qty_on_reserve = qty_on_reserve + <i>wrpt.qty_estimated</i><br />
     * WHERE part_id = ? </div> <div>UPDATE wrpt SET status='R' WHERE part_id =?</div> Update
     * reservation if parts are not in stock <div>UPDATE wrpt SET status='NI' WHERE part_id =?</div>
     * </p>
     *
     * @param context Workflow rule execution context
     * @param Map partEstimation
     * @param int difference
     */
    private void updateInventoryAfterEstimation(final EventHandlerContext context,
            final Map partEstimation, final int difference, final boolean isNew) {
        final int wr_id = getIntegerValue(context, partEstimation.get("wr_id")).intValue();
        final Date date_assigned = getDateValue(context, partEstimation.get("date_assigned"));
        final Time time_assigned = getTimeValue(context, partEstimation.get("time_assigned"));
        final String part_id = notNull(partEstimation.get("part_id"));

        final String[] fields = new String[] { "part_id", "qty_estimated", "status",
                "date_assigned", "time_assigned", "wr_id" };
        final StringBuffer sql = new StringBuffer();
        sql.append("wr_id = " + wr_id + " AND part_id = " + literal(context, part_id));
        sql.append(" AND date_assigned = "
                + formatSqlFieldValue(context, date_assigned, "java.sql.Date", "date_assigned"));
        sql.append(" AND time_assigned = "
                + formatSqlFieldValue(context, time_assigned, "java.sql.Time", "time_assigned"));

        final Object[] record = selectDbValues(context, "wrpt", fields, sql.toString());

        final Object[] part_record =
                selectDbValues(context, "pt", new String[] { "qty_on_hand", "qty_on_reserve" },
                    "part_id=" + literal(context, part_id));
        final int parts_on_hand = getIntegerValue(context, part_record[0]).intValue();
        final int parts_on_reserve = getIntegerValue(context, part_record[1]).intValue();

        if (record != null) {
            final Map values = new HashMap();
            for (int i = 0; i < fields.length; i++) {
                if (fields[i].startsWith("time")) {
                    values.put(fields[i], getTimeValue(context, record[i]));
                } else if (fields[i].startsWith("date")) {
                    values.put(fields[i], getDateValue(context, record[i]));
                } else if (fields[i].equals("wr_id")) {
                    values.put(fields[i], getIntegerValue(context, record[i]));
                } else {
                    values.put(fields[i], record[i]);
                }
            }
            final int qty_estimated =
                    getIntegerValue(context, values.get("qty_estimated")).intValue();
            values.remove("qty_estimated");// preventing class cast errors when
            // saving
            final String status = notNull(values.get("status")).trim();

            if (difference == 0 && isNew) { // new estimation KB3042727 - only update pt inventory
                                            // when new estimation if difference == 0
                if (qty_estimated <= parts_on_hand) {
                    // update parts inventory
                    final Map pt_values = new HashMap();
                    pt_values.put("part_id", part_id);
                    pt_values.put("qty_on_hand", new Double(parts_on_hand - qty_estimated));
                    pt_values.put("qty_on_reserve", new Double(parts_on_reserve + qty_estimated));
                    executeDbSave(context, "pt", pt_values);

                    values.put("status", "R");
                    executeDbSave(context, "wrpt", stripPrefix(values));
                    // executeDbCommit(context);
                } else {
                    values.put("status", "NI");
                    executeDbSave(context, "wrpt", stripPrefix(values));
                    // executeDbCommit(context);
                }
            } else if (difference < 0) {// less parts estimated then before
                if (status.equals("NI")) {
                    if (qty_estimated <= parts_on_hand) {
                        // update parts inventory
                        final Map pt_values = new HashMap();
                        pt_values.put("part_id", part_id);
                        pt_values.put("qty_on_hand", new Double(parts_on_hand - qty_estimated));
                        pt_values.put("qty_on_reserve",
                            new Double(parts_on_reserve + qty_estimated));
                        executeDbSave(context, "pt", pt_values);

                        values.put("status", "R");
                        executeDbSave(context, "wrpt", stripPrefix(values));
                        // executeDbCommit(context);
                    } // else leave status in NI
                } else if (status.equals("R")) {// put difference back in stock
                    final Map pt_values = new HashMap();
                    pt_values.put("part_id", part_id);
                    pt_values.put("qty_on_hand", new Double(parts_on_hand - difference));
                    pt_values.put("qty_on_reserve", new Double(parts_on_reserve + difference));
                    executeDbSave(context, "pt", pt_values);
                    // Guo changed 2009-01-15 for KB3021405
                    // executeDbCommit(context);
                }
            } else if (difference > 0) {
                if (status.equals("R")) {
                    if (parts_on_hand < difference) {// not enough in stock
                        // anymore, put reserved
                        // stuff back
                        final Map pt_values = new HashMap();
                        pt_values.put("part_id", part_id);
                        pt_values.put("qty_on_hand",
                            new Double(parts_on_hand + qty_estimated - difference));
                        pt_values.put("qty_on_reserve",
                            new Double(parts_on_reserve - qty_estimated + difference));
                        executeDbSave(context, "pt", pt_values);

                        values.put("status", "NI");
                        executeDbSave(context, "wrpt", stripPrefix(values));
                        // executeDbCommit(context);
                    } else {
                        final Map pt_values = new HashMap();
                        pt_values.put("part_id", part_id);
                        pt_values.put("qty_on_hand", new Double(parts_on_hand - difference));
                        pt_values.put("qty_on_reserve", new Double(parts_on_reserve + difference));
                        executeDbSave(context, "pt", pt_values);
                        // Guo changed 2009-01-15 for KB3021405
                        // executeDbCommit(context);
                    }
                } // status = NI => nothing to change
            }
        }
    }

    /**
     *
     * Check if new tool assignments conflict with existing.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create SQL query to check if existing assignment records overlap with the new one</li>
     * <li>Execute SQL query</li>
     * <li>Return result</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT wr_id, tool_id <br />
     * FROM wrtl <br />
     * WHERE tool_id = ?<br />
     * AND (( <i>startDateTime</i> BETWEEN date_start + time_start AND date_end + time_end)<br />
     * OR (<i>endDateTime</i> BETWEEN date_start + time_start AND date_end + time_end)<br />
     * OR (<i>startDateTime</i> < date_start + time_start AND <i>endDateTime</i> > date_end +
     * time_end)<br />
     * );</div>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param tool_id Tool code to check assigment for
     * @param date_start Start date of new assignment
     * @param time_start Start time of new assignment
     * @param date_end End date of new assignment
     * @param time_end End time of new assignment
     * @param int wr_id
     * @return Conflict or not
     */
    private boolean checkReservationConflicts(final EventHandlerContext context,
            final String tool_id, final Date date_start, final Time time_start, final Date date_end,
            final Time time_end, final int wr_id) {
        final StringBuffer where = new StringBuffer("tool_id = " + literal(context, tool_id));
        if (isOracle(context)) {
            final String dateTimeStart =
                    "TO_DATE ( TO_CHAR(date_start, 'YYYY/MM/DD') || ' ' || TO_CHAR(time_start, 'HH24:MI') , 'YYYY/MM/DD HH24:MI')";
            final String dateTimeEnd =
                    "TO_DATE ( TO_CHAR(date_end, 'YYYY/MM/DD') || ' ' || TO_CHAR(time_end, 'HH24:MI') , 'YYYY/MM/DD HH24:MI'  )";
            where.append(
                " AND ((" + formatSqlDateTime(context, date_start.toString(), time_start.toString())
                        + " between " + dateTimeStart + " AND " + dateTimeEnd + ")" + " OR ("
                        + formatSqlDateTime(context, date_end.toString(), time_end.toString())
                        + " between " + dateTimeStart + " AND " + dateTimeEnd + ")" + " OR ("
                        + formatSqlDateTime(context, date_start.toString(), time_start.toString())
                        + " < " + dateTimeStart + " AND "
                        + formatSqlDateTime(context, date_end.toString(), time_end.toString())
                        + " > " + dateTimeEnd + "))");
        } else {
            where.append(
                " AND ((" + formatSqlDateTime(context, date_start.toString(), time_start.toString())
                        + " between date_start + time_start AND date_end + time_end)" + " OR ("
                        + formatSqlDateTime(context, date_end.toString(), time_end.toString())
                        + " between date_start + time_start and date_end + time_end)" + " OR ("
                        + formatSqlDateTime(context, date_start.toString(), time_start.toString())
                        + "< date_start + time_start AND "
                        + formatSqlDateTime(context, date_end.toString(), time_end.toString())
                        + " > date_end+time_end))");
        }

        where.append(" AND wr_id<>" + wr_id);

        final List records = selectDbRecords(context, "wrtl", new String[] { "wr_id", "tool_id" },
            where.toString());
        return !records.isEmpty();
    }

    /**
     *
     * Save tool assignment for a work request.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with boolean (true if new assignment conflicts with existing)
     * <br />
     * {conflict : <i>true or false</i>}</li>
     * <li>message : Error message for conflicting assignments</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save tool assigment</li>
     * <li>{@link #checkReservationConflicts(EventHandlerContext, String, Date, Time, Date, Time)
     * Check for conflicts}</li>
     * <li>If no conflicts: Update actual, estimated and total costs for this tool assignment</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateToolType(EventHandlerContext, int, String)
     * Update hours and costs for tool type}</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wrtl SET<br />
     * cost_estimated = hours_est * (SELECT ISNULL(rate_hourly,0) FROM tt WHERE tool_type = (SELECT
     * tool_type FROM tl where tool_id = ?))<br />
     * WHERE tool_id = ? AND wr_id = ? AND date_assigned = ? AND time_assigned = ?;</div>
     * <div> UPDATE wrtl SET<br />
     * hours_total = hours_over + hours_straight, <br />
     * cost_over = hours_over * (SELECT ISNULL(rate_over,0) FROM tt WHERE tool_type = (SELECT
     * tool_type from tl WHERE tool_id = ?)),<br />
     * cost_straight = hours_straight * (SELECT ISNULL(rate_hourly,0) FROM tt WHERE tool_type =
     * (SELECT tool_type FROM tl WHERE tool_id = ?))<br />
     * WHERE tool_id = ? AND wr_id = ? AND date_assigned = ? AND time_assigned = ?; </div>
     * <div>UPDATE wrtl SET<br />
     * cost_total = cost_over + cost_straight,<br />
     * hours_diff = hours_total - hours_est,<br />
     * WHERE tool_id = ? AND wr_id = ? AND date_assigned = ? AND time_assigned = ?; </div>
     * </p>
     * <p>
     *
     * @param JSONObject fields
     *            </p>
     *
     */
    public void saveWorkRequestTool(final JSONObject fields) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, fields);
        values = stripPrefix(filterWithPrefix(values, "wrtl."));
        final JSONObject conflict = new JSONObject();
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();

        if (!values.containsKey("date_assigned")) {
            final Map<String, String> map =
                    Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
            values.put("date_assigned", LocalDateTimeStore.get().currentLocalDate(null, null,
                map.get("siteId"), map.get("blId")));
            values.put("time_assigned", LocalDateTimeStore.get().currentLocalTime(null, null,
                map.get("siteId"), map.get("blId")));
        }

        // executeDbAdd(context, "wrtl", values);
        executeDbSave(context, "wrtl", values);
        // executeDbCommit(context);

        // normally estimated time is submitted not end time
        if (values.get("date_start") != null && values.get("time_start") != null
                && values.get("hours_est") != null) {
            final java.sql.Date startDate = getDateValue(context, values.get("date_start"));
            final java.sql.Time startTime = getTimeValue(context, values.get("time_start"));
            final Double estimatedTime = (Double) values.get("hours_est");

            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wr_id);
            final ServiceWindow serv_window = sla.getServiceWindow();

            final Map endDateTime = serv_window.calculateEscalationDate(startDate, startTime,
                estimatedTime.intValue(), "h");
            if (endDateTime != null) {
                final Date endDate = (Date) endDateTime.get("date");
                final Time endTime = (Time) endDateTime.get("time");
                values.put("date_end", endDate);
                values.put("time_end", endTime);

                executeDbSave(context, "wrtl", values);
                // executeDbCommit(context);

                final String tool_id = notNull(values.get("tool_id"));

                if (checkReservationConflicts(context, tool_id, startDate, startTime, endDate,
                    endTime, wr_id)) {

                    // remove if it has conflicts.
                    // fix KB3031078 - Update Help Desk WFRs to use DataSource API instead of
                    // executeDbDelete(Guo 2011/4/18)
                    final DataSource dataSource = DataRecord.createDataSourceForRecord(fields);
                    final Map record = fromJSONObject(fields);
                    dataSource.deleteRecord(record);
                    // EventHandlerBase.executeDbDelete(context, "wrtl", values);
                    // executeDbCommit(context);

                    context.addResponseParameter("message",
                        "Tool Assignment overlaps with other assigment(s) for this tool");
                    conflict.put("conflict", true);
                    context.addResponseParameter("jsonExpression", conflict.toString());
                    return;
                }
            }
        }

        final String tool_id = notNull(values.get("tool_id"));

        final String date = formatSqlFieldValue(context, values.get("date_assigned"),
            "java.sql.Date", "date_assigned");
        final String time = formatSqlFieldValue(context, values.get("time_assigned"),
            "java.sql.Time", "time_assigned");

        // update estimated costs
        final String sql = "UPDATE wrtl SET" + " cost_estimated = hours_est * (SELECT "
                + formatSqlIsNull(context, "rate_hourly,0") + " FROM tt WHERE tool_type = "
                + " (SELECT tool_type FROM tl where tool_id = " + literal(context, tool_id) + ") )"
                + " WHERE tool_id = " + literal(context, tool_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time;

        // update hours + costs over/straight
        final String sql_ = "UPDATE wrtl SET" + " hours_total = hours_over + hours_straight"
                + " , cost_over = hours_over * (SELECT " + formatSqlIsNull(context, "rate_over,0")
                + " FROM tt WHERE tool_type = " + " (SELECT tool_type from tl WHERE tool_id = "
                + literal(context, tool_id) + ") )" + " , cost_straight = hours_straight * (SELECT "
                + formatSqlIsNull(context, "rate_hourly,0") + " FROM tt WHERE tool_type = "
                + " (SELECT tool_type FROM tl WHERE tool_id = " + literal(context, tool_id) + ") )"
                + " WHERE tool_id = " + literal(context, tool_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time;

        // update total costs,diff hours
        final String sql_total = "UPDATE wrtl SET" + " cost_total = cost_over + cost_straight"
                + " , hours_diff = hours_total - hours_est" + " WHERE tool_id = "
                + literal(context, tool_id) + " AND wr_id = " + wr_id + " AND date_assigned = "
                + date + " AND time_assigned = " + time;

        final Vector commands = new Vector();
        commands.add(sql);
        commands.add(sql_);
        commands.add(sql_total);

        executeDbSqlCommands(context, commands, true);
        // executeDbCommit(context);

        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);

        // update wrtt
        final String tool_type = notNull(
            selectDbValue(context, "tl", "tool_type", "tool_id = " + literal(context, tool_id)));
        recalculateToolType(context, wr_id, tool_type);

        conflict.put("conflict", false);
        context.addResponseParameter("jsonExpression", conflict.toString());
    }

    /**
     *
     * Update hours and costs for tool type (after new tool assignment).
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update hours and costs for tool type in <code>wrtt</code></li>
     * <li>Select minimal start date/time and maximal end date/time for tool assignments of this
     * tool type</li>
     * <li>Update start and end date/time for given tooltype in <code>wrtt</code></li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wrtt SET <br />
     * hours_sched = (SELECT ISNULL(SUM(hours_est),0) FROM wrtl WHERE wr_id = ? AND tool_id IN
     * (SELECT tool_id FROM tl WHERE tool_type = ?)),<br />
     * hours_straight = (SELECT ISNULL(SUM(hours_straight),0) FROM wrtl WHERE wr_id = ? AND tool_id
     * IN (SELECT tool_id FROM tl WHERE tool_type = ?)),<br />
     * hours_over = (SELECT ISNULL(SUM(hours_over),0) FROM wrtl WHERE wr_id = ? AND tool_id IN
     * (SELECT tool_id FROM tl WHERE tool_type = ? )),<br />
     * cost_straight = (SELECT ISNULL(SUM(cost_straight),0) FROM wrtl WHERE wr_id = ? AND tool_id IN
     * (SELECT tool_id FROM tl WHERE tool_type = ?)),<br />
     * cost_over = (SELECT ISNULL(SUM(cost_over),0) FROM wrtl WHERE wr_id = ? AND tool_id IN (SELECT
     * tool_id FROM tl WHERE tool_type = ?)) <br />
     * WHERE wr_id = ? AND tool_type = ?; </div>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     * @param tool_type Tool type
     *            </p>
     */
    private void recalculateToolType(final EventHandlerContext context, final int wr_id,
            final String tool_type) {
        final String from = " FROM wrtl WHERE wr_id = " + wr_id
                + " AND tool_id IN (SELECT tool_id FROM tl WHERE tool_type = "
                + literal(context, tool_type) + ")";

        /*
         * String startSql = "SELECT date_start, time_start FROM wrtl WHERE wr_id = " + wr_id + "
         * AND tool_id IN (select tool_id from tl where tool_type = " + literal(context, tool_type)
         * + ")" + " ORDER BY date_start ASC, time_start ASC ";
         *
         * String endSql = "SELECT date_end, time_end FROM wrtl WHERE wr_id = " + wr_id + " AND
         * tool_id IN (select tool_id from tl where tool_type = " + literal(context, tool_type) +
         * ")" + " ORDER BY date_end DESC, time_end DESC ";
         */
        final String updateSql = "UPDATE wrtt SET " + " hours_sched = (SELECT "
                + formatSqlIsNull(context, "SUM(hours_est),0") + from +
                /*
                 * "), hours_straight = (SELECT "+ formatSqlIsNull(context,"SUM(hours_straight),0")
                 * + from + "), hours_over = (SELECT "+ formatSqlIsNull(context,"SUM(hours_over),0")
                 * + from + "), cost_straight = (SELECT "+
                 * formatSqlIsNull(context,"SUM(cost_straight),0") + from +
                 * "), cost_over = (SELECT "+ formatSqlIsNull(context,"SUM(cost_over),0") + from +
                 */
                ") WHERE wr_id = " + wr_id + " AND tool_type = " + literal(context, tool_type);

        executeDbSql(context, updateSql, false);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);

        /*
         * List startRecs = selectDbRecords(context, startSql); List endRecs =
         * selectDbRecords(context, endSql);
         *
         * if (!startRecs.isEmpty() && !endRecs.isEmpty() && startRecs.get(0) != null &&
         * endRecs.get(0) != null) { Object[] start = (Object[]) startRecs.get(0); Object[] end =
         * (Object[]) endRecs.get(0);
         *
         * String date_start = start[0] != null ? formatSqlFieldValue(context,
         * getDateValue(context,start[0]), "java.sql.Date", "date_start") : "NULL"; String
         * time_start = start[1] != null ? formatSqlFieldValue(context,
         * getTimeValue(context,start[1]), "java.sql.Time", "time_start") : "NULL";
         *
         * String date_end = end[0] != null ? formatSqlFieldValue(context,
         * getDateValue(context,end[0]), "java.sql.Date", "date_end") : "NULL"; String time_end =
         * end[1] != null ? formatSqlFieldValue(context, getTimeValue(context,end[1]),
         * "java.sql.Time", "time_end") : "NULL";
         *
         * String updateDatesSql = "UPDATE wrtt SET " + " date_start = " + date_start +
         * ", date_end = " + date_end + ", time_start = " + time_start + ", time_end = " + time_end
         * + " WHERE wr_id = " + wr_id + " AND tool_type = " + literal(context, tool_type);
         *
         * executeDbSql(context, updateDatesSql, false); }
         */
    }

    /**
     *
     * Save other resource assigment for a work request.
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
     * <li>Save record in <code>wr_other</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record
     *            </p>
     * @throws DocumentException
     */
    public void saveOtherCosts(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        executeDbSave(context, "wr_other", values);
        // executeDbCommit(context);
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();

        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
    }

    /**
     *
     * Save a trade for a work request estimation.
     *
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
     * <li>Save record in <code>wrtr</code></li>
     * <li>Update estimated costs in <code>wrtr</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONObject record
     *            </p>
     *
     */
    public void saveWorkRequestTrade(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldsValue = parseJSONObject(context, record);
        final Map values = stripPrefix(filterWithPrefix(fieldsValue, "wrtr."));

        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();

        final String tr_id = notNull(values.get("tr_id"));
        final Double rate_hourly = (Double) selectDbValue(context, "tr", "rate_hourly",
            "tr_id = " + literal(context, tr_id));

        values.put("cost_estimated", 0.0);
        if (rate_hourly != null && values.get("hours_est") != null) {
            final Double hours_est = (Double) values.get("hours_est");
            final Double cost_est = new Double(hours_est.doubleValue() * rate_hourly.doubleValue());
            values.put("cost_estimated", cost_est);
        }

        final Map<String, String> mapSiteAndBlId =
                Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));

        final String siteId = mapSiteAndBlId.get("siteId");
        final String blId = mapSiteAndBlId.get("blId");

        final Date currentLocalDate =
                LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
        final Time currentLocalTime =
                LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);

        values.put("date_assigned", currentLocalDate);
        values.put("time_assigned", currentLocalTime);

        executeDbSave(context, "wrtr", values);
        // executeDbCommit(context);

        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
    }

    /**
     *
     * Save a tooltype for a work request (estimation).
     *
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
     * <li>Save record in <code>wrtt</code></li>
     * <li>Update estimated costs in <code>wrtt</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wrtt SET<br />
     * cost_estimated = hours_est * (SELECT ISNULL(rate_hourly,0) FROM tt WHERE tool_type = ?)<br />
     * WHERE tool_type = ? AND wr_id = ?; </div>
     * </p>
     * <p>
     *
     * @param JSONObject record
     *            </p>
     *
     */
    public void saveWorkRequestToolType(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldsValue = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldsValue);

        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();

        final Map<String, String> mapSiteAndBlId =
                Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));

        final String siteId = mapSiteAndBlId.get("siteId");
        final String blId = mapSiteAndBlId.get("blId");

        final Date currentLocalDate =
                LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
        final Time currentLocalTime =
                LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);

        values.put("date_assigned", currentLocalDate);
        values.put("time_assigned", currentLocalTime);

        executeDbSave(context, "wrtt", values);
        // executeDbCommit(context);

        final String tt = notNull(values.get("tool_type"));

        final String sql = "UPDATE wrtt SET " + " cost_estimated = hours_est * (SELECT "
                + formatSqlIsNull(context, "rate_hourly,0") + " FROM tt WHERE tool_type = "
                + literal(context, tt) + ")" + " WHERE tool_type = " + literal(context, tt)
                + " AND wr_id = " + wr_id;

        executeDbSql(context, sql, true);
        // Guo changed 2009-01-15 for KB3021405
        // executeDbCommit(context);
        recalculateEstCosts(context, wr_id);
        recalculateCosts(context, wr_id);
    }

    /**
     *
     * Get a list of all trades in <code>tr</code>. This function is used to create a selection list
     * with all trades in the dispatch form.
     *
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray of JSONObjects with a trade code<br />
     * <code>[{tr_id : ?}]</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select all trades from <code>tr</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * </p>
     */
    public void getTrades() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray results = new JSONArray();
        final List records = selectDbRecords(context, "SELECT tr_id FROM tr ORDER BY tr_id");

        JSONObject trade = new JSONObject();
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final String tr_id = notNull(record[0]);

                trade = new JSONObject();
                trade.put("tr_id", tr_id);
                results.put(trade);
            }
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }

    /**
     *
     * Get tooltypes assigned to a work request.<br/>
     * This eventhandler is used to create a selection list of tooltypes for a tool assignment for
     * the given work request.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wr_id : work request to get tooltypes for</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray of JSONObjects with a tooltype<br />
     * <code>[{tool_type : ?}]</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get wr_id from context</li>
     * <li>Select all tool types for given work request (from <code>wrtt</code>)</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String wr_id1
     *            </p>
     */
    public void getToolTypesForWorkRequest(final String wr_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray results = new JSONArray();
        final int wr_id = Integer.parseInt(wr_id1);

        final String[] fieldNames = { "tool_type" };

        final List records = selectDbRecords(context, "wrtt", fieldNames, "wr_id = " + wr_id);
        JSONObject json = new JSONObject();
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final String toolType = notNull(record[0]);

                json = new JSONObject();
                json.put("tool_type", toolType);
                results.put(json);
            }
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }

    /**
     *
     * Get trades assigned to a work request.<br/>
     * This eventhandler is used to create a selection list of trades for a craftsperson assignment
     * for the given work request.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wr_id : work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray of JSONObjects with trade<br />
     * [{tr_id : ?}]</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get wr_id from context</li>
     * <li>Get trades assigned to work request in <code>wrtr</code>/li>
     * <li>Get primary trade from work request in <code>wr</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param String wrId
     *            </p>
     */
    public void getTradesForWorkRequest(final String wrId) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray results = new JSONArray();
        final int wr_id = Integer.parseInt(wrId);
        final String[] fieldNames = { "tr_id" };

        final List records = selectDbRecords(context, "wrtr", fieldNames, "wr_id = " + wr_id);
        JSONObject trade = new JSONObject();
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final String trid = notNull(record[0]);

                trade = new JSONObject();
                trade.put("tr_id", trid);
                results.put(trade);
            }
        } else {
            // primary trade assigned to work request?
            final String pr_tr = notNull(selectDbValue(context, "wr", "tr_id", "wr_id = " + wr_id));
            trade = new JSONObject();
            trade.put("tr_id", pr_tr);
            results.put(trade);
        }

        context.addResponseParameter("jsonExpression", results.toString());
    }

    /**
     *
     * Complete work request(s).<br />
     * A supervisor or craftsperson can set the status of multiple work requests of the same work
     * order at once to completed.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray of JSONObjects with work request data</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>tableName : wr</li>
     * <li>fieldName : wr_id</li>
     * <li>wr.wr_id : code of completed work request</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get records from context</li>
     * <li>Update context (set wr.wr_id)</li>
     * <li>Update work request status to Com with the
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager statusmanager}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#checkWorkorder(EventHandlerContext, String, int)
     * Check if workorder should be updated}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONArray records
     *            </p>
     */
    public void setComplete(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (records.length() > 0) {
            int wr_id = 0;
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);

                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);

                wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
                final String status = Common.getStatusValue(context, "wr", "wr_id", wr_id);
                if (status.equals("Can") || status.equals("S") || status.equals("Rej")
                        || status.equals("Clo")) {
                    return;
                }
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
                statusManager.updateStatus("Com");

                values = new HashMap();
                values.put("wr_id", new Integer(wr_id));
                values.put("completed_by",
                    getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
                executeDbSave(context, "wr", values);
                // executeDbCommit(context);

                // change to fix KB3030018
                checkWorkorder(context, "Com", wr_id);
                // TODO: to preserve compatibility with work wizard auto-archive
                // is checked when
                // completing work requests
                /*
                 * boolean autoArchive = false; if(getActivityParameterInt(context,
                 * Constants.ONDEMAND_ACTIVITY_ID, "AUTO_ARCHIVE") != null) autoArchive =
                 * getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
                 * "AUTO_ARCHIVE").intValue() > 0;
                 *
                 * //archive work order + work requests if (autoArchive) archiveWorkRequest(context,
                 * wr_id);
                 */

                // From bali5, add new field wrcf.status, for legacy view, add code to set
                // wrcf.status to complete
                SqlUtils.executeUpdate("wrcf",
                    "update wrcf set status = 'Complete' where wrcf.wr_id = " + wr_id);

            }
        }
    }

    /**
     * Complete work request craftsperson assignment.
     *
     * @param records work request records
     */
    public void completeCf(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final DataSource cfDS = DataSourceFactory.createDataSourceForFields("cf",
            new String[] { "cf_id", "email" });
        cfDS.addRestriction(Restrictions.sql("email= '"
                + SqlUtils.makeLiteralOrBlank(ContextStore.get().getUser().getEmail()) + "'"));

        final DataRecord cfRecord = cfDS.getRecord();
        if (cfRecord != null) {
            final String cfId = cfRecord.getString("cf.cf_id");
            if (records.length() > 0) {
                int wr_id = 0;
                for (int i = 0; i < records.length(); i++) {
                    final JSONObject record = records.getJSONObject(i);

                    Map values = parseJSONObject(context, record);
                    values = stripPrefix(values);
                    wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
                    SqlUtils.executeUpdate("wrcf",
                        "update wrcf set status = 'Complete' where status = 'Active' and wrcf.wr_id = "
                                + wr_id
                                + " and ((1=(select count(wrcf.wr_id) from wrcf where wrcf.status = 'Active' and wrcf.wr_id = "
                                + wr_id + ")) or (wrcf.cf_id ='" + SqlUtils.makeLiteralOrBlank(cfId)
                                + "') OR (wrcf.cf_id IN ( select workflow_substitutes.cf_id from workflow_substitutes where (workflow_substitutes.start_date_unavailable IS NULL "
                                + " OR workflow_substitutes.start_date_unavailable &lt;= ${sql.currentDate}) "
                                + " AND (workflow_substitutes.end_date_unavailable IS NULL "
                                + " OR workflow_substitutes.end_date_unavailable &gt;= ${sql.currentDate}) "
                                + "and steptype_or_role = 'craftsperson' and  workflow_substitutes.substitute_cf_id = '"
                                + SqlUtils.makeLiteralOrBlank(cfId) + "'))) ");
                    updateWrStatusFromWrcf(wr_id);
                }
            }
        }

    }

    /**
     * Complete work request craftsperson assignment.
     *
     * @param records work request records
     */
    public void completeReturnedWrcfRecords(final String wrId) {
        SqlUtils.executeUpdate("wrcf",
            "update wrcf set status = 'Complete' where status = 'Returned' and wrcf.wr_id = "
                    + wrId);
    }

    /**
     * Updae work request status base on wrcf.status.
     *
     * @param wrId work reuqest code
     */
    public void updateWrStatusFromWrcf(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (DataStatistics.getInt("wr", "wr_id", "COUNT",
            "wr.status IN('I','HA','HP','HL') "
                    + "and exists(select 1 from wrcf where wrcf.wr_id = wr.wr_id and wrcf.status = 'Returned') "
                    + "and not exists(select 1 from wrcf where wrcf.wr_id = wr.wr_id and wrcf.status = 'Active') "
                    + "and wr.wr_id = " + wrId) > 0) {

            // Get reutrn comments
            final String returnComments = getReturnFromCfComments(wrId);

            // Create Return step
            final Return returnStep =
                    new Return(context, Constants.ONDEMAND_ACTIVITY_ID, wrId, returnComments);
            // invoke the step to create helpdesk_step_log to note the return in step log
            returnStep.invoke();

            // Update work reqeust status to AA
            final Map values = new HashMap();
            values.put("wr_id", wrId);
            values.put("status", "AA");
            executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);

            // create a new helpdesk_steo_log record to show basic status change, because the return
            // from cf action will now deviate from its SLA base on the spec
            final DataSource stepLogDS =
                    DataSourceFactory.createDataSourceForFields("helpdesk_step_log",
                        new String[] { "pkey_value", "field_name", "user_name", "step_type",
                                "status", "activity_id", "role_name", "multiple_required",
                                "step_order", "rejected_step", "step_log_id", "date_response",
                                "table_name", "condition", "step_code", "rejected_step",
                                "date_response", "time_response", "step_status_result", "step",
                                "em_id", "vn_id", "cf_id", "date_created", "time_created" });
            final DataRecord newStep = stepLogDS.createNewRecord();
            newStep.setValue("helpdesk_step_log.activity_id", Constants.ONDEMAND_ACTIVITY_ID);
            newStep.setValue("helpdesk_step_log.table_name", Constants.WORK_REQUEST_TABLE);
            newStep.setValue("helpdesk_step_log.field_name", "wr_id");
            newStep.setValue("helpdesk_step_log.pkey_value", wrId);
            newStep.setValue("helpdesk_step_log.step_order", 0);
            newStep.setValue("helpdesk_step_log.step_type", "basic");
            newStep.setValue("helpdesk_step_log.step", "Basic");
            newStep.setValue("helpdesk_step_log.status", "AA");
            newStep.setValue("helpdesk_step_log.user_name", ContextStore.get().getUser().getName());
            newStep.setValue("helpdesk_step_log.date_response", Utility.currentDate());
            newStep.setValue("helpdesk_step_log.time_response", Utility.currentTime());
            newStep.setValue("helpdesk_step_log.step_code", Common.generateUUID());
            newStep.setValue("helpdesk_step_log.date_created", Utility.currentDate());
            newStep.setValue("helpdesk_step_log.time_created", Utility.currentTime());
            stepLogDS.saveRecord(newStep);

        } else if (DataStatistics.getInt("wr", "wr_id", "COUNT",
            "wr.status IN('I','HA','HP','HL') "
                    + "and exists(select 1 from wrcf where wrcf.wr_id = wr.wr_id and wrcf.status = 'Complete') "
                    + "and not exists(select 1 from wrcf where wrcf.wr_id = wr.wr_id and wrcf.status IN ('Active', 'Returned')) "
                    + "and wr.wr_id = " + wrId) > 0) {

            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wrId);
            statusManager.updateStatus("Com");

            // KB#3050988 Part inventory is not updated by parts added after estimation step
            updateInventory(context, wrId);

        }
    }

    /**
     * Get return from craftsperson comments
     *
     * @param wrId work reuqest code
     */
    public String getReturnFromCfComments(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // @translatable
        final String localizedString_returnComments_prefix1 =
                localizeString(context, "Returned from Craftsperson");
        // @translatable
        final String localizedString_returnComments_prefix2 = localizeString(context, "Comment");

        final List wrcfRecordds = selectDbRecords(context, "wrcf",
            new String[] { "cf_id", "comments" }, "status='Returned' and wr_id = " + wrId);
        String returnComments = "";
        final HashSet<String> cfSet = new HashSet<String>();
        for (final Iterator it = wrcfRecordds.iterator(); it.hasNext();) {
            final Object[] wrcfRecord = (Object[]) it.next();
            final String cfId = notNull(wrcfRecord[0]);
            if (!cfSet.contains(cfId)) {
                final String comments = notNull(wrcfRecord[1]);
                if (StringUtil.notNullOrEmpty(returnComments)) {
                    returnComments = returnComments + "  | "
                            + localizedString_returnComments_prefix1 + " ( " + cfId + " );"
                            + localizedString_returnComments_prefix2 + ":" + comments;
                } else {
                    returnComments = localizedString_returnComments_prefix1 + " ( " + cfId + " );"
                            + localizedString_returnComments_prefix2 + ":" + comments;
                }

                cfSet.add(cfId);
            }

        }

        return returnComments;

    }

    /**
     *
     * Notify a supervisor when a request is assigned to him.<br />
     * The subjects and bodies to use for the emails are put in the <code>messages</code> table with
     * activity_id AbBldgOpsOnDemandWork and referenced_by
     * "NOTIFY_SUPERVISOR_"+status.toUpperCase()+"_WFR"
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : (if status = 'A') help request code</li>
     * <li>wr.wr_id : (for other statuses) work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>If status = 'A' (Approved) get supervisor and send email</li>
     * <li>Else send email (content depends on status)</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param status Status of request
     * @param tableName
     * @param int pkeyValue
     *            </p>
     */
    public void notifySupervisor(final EventHandlerContext context, final String status,
            final String tableName, final int pkeyValue) {
		
		 /* UofC Customized 10/2009: Bypass email notifications. */
        return;
		/*
        final Message message = new Message(context);
        message.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);

        // KB 3023429 - also send a message (with different content) to the supervisor's
        // substitute(s) (EC 2012/7/10)
        final Message messageForSubstitute = new Message(context);
        messageForSubstitute.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);

        if (tableName.equals("activity_log")) { // approved request should be reviewed
            final String link = getWebCentralPath(context) + "/"
                    + getActivityParameterString(context, "AbBldgOpsOnDemandWork", "REVIEW_VIEW");

            message.setReferencedBy("NOTIFY_SUPERVISOR_APPROVED_WFR");
            message.setBodyMessageId("NOTIFY_SUPERVISOR_APPROVED_TEXT");
            message.setSubjectMessageId("NOTIFY_SUPERVISOR_APPROVED_TITLE");

            messageForSubstitute.setReferencedBy("NOTIFY_SUPERVISOR_SUBSTITUTE_APPROVED_WFR");
            messageForSubstitute.setBodyMessageId("NOTIFY_SUPERVISOR_APPROVED_TEXT");
            messageForSubstitute.setSubjectMessageId("NOTIFY_SUPERVISOR_APPROVED_TITLE");

            final Map<String, Object> datamodel = MessageHelper.getRequestDatamodel(context,
                "activity_log", "activity_log_id", pkeyValue);
            datamodel.put("link", link);

            if (messageForSubstitute.isBodyRichFormatted()
                    || messageForSubstitute.isSubjectRichFormatted()) {
                messageForSubstitute.setDataModel(datamodel);
            }
            if (!messageForSubstitute.isBodyRichFormatted()) {
                messageForSubstitute.setBodyArguments(new Object[] { link });
            }
            messageForSubstitute.format();

            if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                message.setDataModel(datamodel);
            }
            if (!message.isBodyRichFormatted()) {// only original body contained {?} parameters
                message.setBodyArguments(new Object[] { link });
            }
            message.format();

            sendMailToSupervisors(context, "activity_log", "activity_log_id", pkeyValue, message,
                messageForSubstitute);

        } else {
            final StringBuffer link = new StringBuffer(getWebCentralPath(context) + "/");
            message.setReferencedBy("NOTIFY_SUPERVISOR_" + status.toUpperCase() + "_WFR");
            message.setBodyMessageId("NOTIFY_SUPERVISOR_" + status.toUpperCase() + "_TEXT");
            message.setSubjectMessageId("NOTIFY_SUPERVISOR_" + status.toUpperCase() + "_TITLE");

            // KB 3023429 - also send a message (with different content) to the supervisor's
            // substitute(s) (EC 2012/7/10)
            messageForSubstitute
                .setReferencedBy("NOTIFY_SUPERVISOR_SUBSTITUTE_" + status.toUpperCase() + "_WFR");
            messageForSubstitute
                .setBodyMessageId("NOTIFY_SUPERVISOR_" + status.toUpperCase() + "_TEXT");
            messageForSubstitute
                .setSubjectMessageId("NOTIFY_SUPERVISOR_" + status.toUpperCase() + "_TITLE");
            Object[] args = new Object[] { link };
            if (status.equals("A")) {// approved (autocreated) work requests should be assigned to a
                                     // work order
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "ASSIGN_VIEW"));
            } else if (status.equals("AA")) { // new WR's should be managed
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "MANAGE_VIEW"));
                args = new Object[] { pkeyValue, link };
            } else if (status.equals("Sch")) { // scheduled WR's should be
                // Issued
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "ISSUE_VIEW"));
                args = new Object[] { pkeyValue, link };
            } else if (status.equals("I")) { // issued WR's should be
                // updated
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "UPDATE_VIEW"));
                args = new Object[] { pkeyValue, link };
            } else {
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "ASSIGN_VIEW"));
                args = new Object[] { pkeyValue, link };
            }

            final Map datamodel = MessageHelper.getRequestDatamodel(context, tableName,
                tableName + "_id", pkeyValue);
            datamodel.put("link", link.toString());

            if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                message.setDataModel(datamodel);
            }

            if (!message.isBodyRichFormatted()) {
                message.setBodyArguments(args);
            }

            message.format();

            messageForSubstitute.setDataModel(datamodel);
            if (!messageForSubstitute.isBodyRichFormatted()) {
                messageForSubstitute.setBodyArguments(args);
            }
            messageForSubstitute.format();

            sendMailToSupervisors(context, tableName, tableName + "_id", pkeyValue, message,
                messageForSubstitute);
        }
		*/
    }

    /**
     * Notify supervisor for craftsperson return action.
     *
     * @param wrcfRecord
     */
    public void notifySupervisorForCfReturn(final DataRecord wrcfRecord) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Message message = new Message(context);
        message.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);

        message.setReferencedBy("SENDEMAIL_RETURN_STEP");
        message.setBodyMessageId("NOTIFY_CRAFTSPERSON_RETURN_TEXT");
        message.setSubjectMessageId("NOTIFY_CRAFTSPERSON_RETURN_TITLE");

        final Map<String, Object> datamodel = new HashMap<String, Object>();
        final Map<String, Object> wrModel = new HashMap<String, Object>();
        final Map<String, Object> wrCfModel = new HashMap<String, Object>();

        wrModel.put("wr_id", wrcfRecord.getValue("wrcf.wr_id"));
        wrCfModel.put("cf_id", wrcfRecord.getValue("wrcf.cf_id"));
        wrCfModel.put("comments", wrcfRecord.getValue("wrcf.comments"));
        datamodel.put("wr", wrModel);
        datamodel.put("wrcf", wrCfModel);
        datamodel.put("link", getWebCentralPath(context) + "/"
                + getActivityParameterString(context, "AbBldgOpsOnDemandWork", "REVIEW_VIEW"));

        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
            message.setDataModel(datamodel);
        }

        message.format();
        sendMailToSupervisors(context, "wr", "wr_id", wrcfRecord.getInt("wrcf.wr_id"), message,
            null);
    }

    /**
     * Send mail to supervisors.
     *
     * @param context
     * @param tableName
     * @param fieldName
     * @param pkeyValue
     * @param message
     * @param messageForSubstitute - Message to be sent to the substitute(s) of the supervisor(s)
     */
    public void sendMailToSupervisors(final EventHandlerContext context, final String tableName,
            final String fieldName, final int pkeyValue, final Message message,
            final Message messageForSubstitute) {

        String supervisor = null;
        String workTeam = null;
        String manager = null;

        if (tableName.equals("wo")) {
            final Object[] tmp = selectDbValues(context, tableName,
                new String[] { "supervisor", "work_team_id" }, fieldName + "=" + pkeyValue);

            supervisor = notNull(tmp[0]);
            workTeam = notNull(tmp[1]);
        } else {
            final Object[] tmp = selectDbValues(context, tableName,
                new String[] { "supervisor", "work_team_id", "manager" },
                fieldName + "=" + pkeyValue);
            supervisor = notNull(tmp[0]);
            workTeam = notNull(tmp[1]);
            manager = notNull(tmp[2]);
        }

        if (StringUtil.notNullOrEmpty(supervisor)) {
            final String email = notNull(
                selectDbValue(context, "em", "email", "em_id = " + literal(context, supervisor)));
            if (StringUtil.notNullOrEmpty(email)) {
                message.setMailTo(email);
                message.setNameto(supervisor);
                message.sendMessage();

                // KB 3023429 - also send a message (with different content) to the supervisor's
                // substitute(s) (EC 2012/7/10)
                if (messageForSubstitute != null) {
                    final List<String> substitutes =
                            StepHandler.getWorkflowEmSubstitutes(context, supervisor, "supervisor");
                    if (!substitutes.isEmpty()) {
                        for (final String substitute : substitutes) {
                            messageForSubstitute.getDataModel().put("supervisor", supervisor);
                            messageForSubstitute.setMailTo(getEmailAddress(context, substitute));
                            messageForSubstitute.setNameto(substitute);
                            messageForSubstitute.sendMessage();
                        }
                    }
                }

            } else {
                if (StringUtil.notNullOrEmpty(manager)) {
                    message.setReferencedBy("NOTIFY_SUPERVISOR_WFR");
                    message.setSubjectMessageId("NOTIFY_MGR_TITLE");
                    message.setBodyMessageId("NOTIFY_MGR_TEXT");

                    // message should already contain datamodel for rich formatting,
                    // only arguments for old-formatted body should be changed
                    if (!message.isBodyRichFormatted()) {
                        message.setBodyArguments(
                            new Object[] { supervisor, message.getDataModel().get("link") });
                    }
                    message.format();

                    message.setNameto(manager);
                    message.setMailTo(getEmailAddress(context, manager));
                    message.sendMessage();
                }
            }
        } else if (StringUtil.notNullOrEmpty(workTeam)) {
            // KB3044478 - get supervisors from cf_work_team table if cf_work_team exists in the
            // database schema
            String supervisorSeletionRes =
                    "email IN (SELECT email FROM cf WHERE is_supervisor = 1 AND work_team_id = "
                            + literal(context, workTeam) + ")";
            if (getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
                "UseBldgOpsConsole").intValue() > 0
                    && ContextStore.get().getProject().tableDefExists("cf_work_team")) {
                supervisorSeletionRes =
                        "email IN (SELECT cf.email FROM cf_work_team,cf WHERE cf_work_team.cf_id = cf.cf_id and cf.is_supervisor = 1 AND cf_work_team.work_team_id = "
                                + literal(context, workTeam) + ")";
            }
            final List supers = selectDbRecords(context, "em", new String[] { "email", "em_id" },
                supervisorSeletionRes);
            for (final Iterator it = supers.iterator(); it.hasNext();) {
                final Object[] tmp2 = (Object[]) it.next();
                final String name = notNull(tmp2[1]);
                final String email = notNull(tmp2[0]);
                if (StringUtil.notNullOrEmpty(email)) {
                    message.setMailTo(email);
                    message.setNameto(notNull(tmp2[1]));
                    message.sendMessage();
                }

                // KB 3023429 - also send a message (with different content) to the supervisor's
                // substitute(s) (EC 2012/7/10)
                if (messageForSubstitute != null) {
                    final List<String> substitutes =
                            StepHandler.getWorkflowEmSubstitutes(context, name, "supervisor");
                    if (!substitutes.isEmpty()) {
                        for (final String substitute : substitutes) {
                            messageForSubstitute.getDataModel().put("supervisor", name);
                            messageForSubstitute.setMailTo(getEmailAddress(context, substitute));
                            messageForSubstitute.setNameto(substitute);
                            messageForSubstitute.sendMessage();
                        }
                    }
                }
            }
        } else {
            final boolean isDefaultSLA = (Boolean) context.getParameter("isDefaultSLA");

            if (!isDefaultSLA) {
                // @translatable
                final String errorMessage =
                        localizeString(context, "No supervisor or work team to notify");
                throw new ExceptionBase(errorMessage, true);
            }
        }
    }

    /**
     *
     * Update costs for a work request.
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update (labor/parts/tools/other) costs for work request</li>
     * <li>Update total costs for work request</li>
     * <li>Update all costs for workorder the work request is assigned to</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wr SET<br />
     * cost_labor = (SELECT ISNULL(SUM(cost_total),0) FROM wrcf WHERE wr_id = ?),<br />
     * cost_other = (SELECT ISNULL(SUM(cost_total),0) FROM wr_other WHERE wr_id ?),<br />
     * cost_parts = (SELECT ISNULL(SUM(cost_actual),0) FROM wrpt WHERE wr_id = ?),<br />
     * cost_tools = (SELECT ISNULL(SUM(cost_total),0) FROM wrtl WHERE wr_id = ?)<br />
     * WHERE wr_id = ? </div> <div>UPDATE wr SET <br />
     * cost_total = cost_labor + cost_other + cost_parts + cost_tools<br />
     * WHERE wr_id = ?;</div> <div>UPDATE wo SET <br />
     * cost_labor = (SELECT ISNULL(SUM(cost_labor),0) FROM wr WHERE wo_id = ?),<br />
     * cost_tools = (SELECT ISNULL(SUM(cost_tools),0)FROM wr WHERE wo_id = ?),<br />
     * cost_parts = (SELECT ISNULL(SUM(cost_parts),0)FROM wr WHERE wo_id = ?),<br />
     * cost_other = (SELECT ISNULL(SUM(cost_other),0)FROM wr WHERE wo_id = ?),<br />
     * cost_total = (SELECT ISNULL(SUM(cost_total),0)FROM wr WHERE wo_id = ?)<br />
     * WHERE wo_id = " + wo_id; </div>
     * </p>
     * <p>
     * Switched from private to public to support the Mobile Application - C. Kriezis
     *
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     *            </p>
     */
    public void recalculateCosts(final EventHandlerContext context, final int wr_id) {
        final String sql = "UPDATE wr SET " + " est_labor_hours = (SELECT "
                + formatSqlIsNull(context, "SUM(hours_est),0") + " FROM wrcf WHERE wr_id = " + wr_id
                + ")" + " , act_labor_hours = (SELECT "
                + formatSqlIsNull(context, "SUM(hours_total),0") + " FROM wrcf WHERE wr_id = "
                + wr_id + ")" + " , cost_labor = (SELECT "
                + formatSqlIsNull(context, "SUM(cost_total),0") + " FROM wrcf WHERE wr_id = "
                + wr_id + ")" + " , cost_other = (SELECT "
                + formatSqlIsNull(context, "SUM(cost_total),0") + " FROM wr_other WHERE wr_id = "
                + wr_id + ")" + " , cost_parts = (SELECT "
                + formatSqlIsNull(context, "SUM(cost_actual),0") + " FROM wrpt WHERE wr_id = "
                + wr_id + ")" + " , cost_tools = (SELECT "
                + formatSqlIsNull(context, "SUM(cost_total),0") + " FROM wrtl WHERE wr_id = "
                + wr_id + ")" + " WHERE wr_id = " + wr_id;

        executeDbSql(context, sql, true);

        final String sql_ =
                "UPDATE wr SET " + "cost_total = cost_labor + cost_other + cost_parts + cost_tools"
                        + " WHERE wr_id = " + wr_id;
        executeDbSql(context, sql_, true);

        // update work order costs
        final Integer wo_id =
                getIntegerValue(context, selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id));
        if (wo_id != null) {
            recalculateWorkOrderCosts(context, wo_id.intValue());
        }

        final String update = "UPDATE activity_log SET " + " cost_actual = (SELECT "
                + formatSqlIsNull(context, "cost_total,0") + " FROM wr WHERE wr_id = " + wr_id
                + ")," + " hours_actual = (SELECT " + formatSqlIsNull(context, "SUM(hours_total),0")
                + " FROM wrcf WHERE wr_id =" + wr_id + ")"
                + " WHERE activity_log_id = (SELECT activity_log_id FROM wr WHERE wr_id = " + wr_id
                + ")";
        executeDbSql(context, update, false);
        // executeDbCommit(context);
    }

    /**
     *
     * Update work order costs.
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update actual costs for work order</li>
     * <li>Update estimated costs for work order</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wo SET <br />
     * cost_labor = (SELECT ISNULL(SUM(cost_labor),0) FROM wr WHERE wo_id = ?),<br />
     * cost_tools = (SELECT ISNULL(SUM(cost_tools),0) FROM wr WHERE wo_id = ?),<br />
     * cost_parts = (SELECT ISNULL(SUM(cost_parts),0) FROM wr WHERE wo_id = ?),<br />
     * cost_other = (SELECT ISNULL(SUM(cost_other),0) FROM wr WHERE wo_id = ?),<br />
     * cost_total = (SELECT ISNULL(SUM(cost_total),0) FROM wr WHERE wo_id = ?)<br />
     * WHERE wo_id = ?;</div> <div>UPDATE wo SET <br />
     * cost_estimated = (SELECT ISNULL(SUM(cost_est_total),0)* FROM wr WHERE wo_id = ?)<br />
     * WHERE wo_id = ?; </div>
     * </p>
     * <p>
     *
     * bv: refactoring spltting a complex query in simple select and update queries to improve
     * performance.
     *
     * @param context Workflow rule execution context
     * @param wo_id Work order code
     *            </p>
     */
    private void recalculateWorkOrderCosts(final EventHandlerContext context, final int wo_id) {

        // actual costs only for wr that are not rejected or cancelled.
        final String select =
                "SELECT " + formatSqlIsNull(context, "SUM(cost_labor),0") + " as cost_labor, "
                        + formatSqlIsNull(context, "SUM(cost_tools),0") + " as cost_tools, "
                        + formatSqlIsNull(context, "SUM(cost_parts),0") + " as cost_parts, "
                        + formatSqlIsNull(context, "SUM(cost_other),0") + " as cost_other, "
                        + formatSqlIsNull(context, "SUM(cost_total),0") + " as cost_total "
                        + " FROM wr WHERE status NOT IN ('Rej','Can') AND wo_id = " + wo_id;

        final List totals = selectDbRecords(context, select);

        // estimation cost for all wr, also rejected and cancelled
        final String select2 = "SELECT " + formatSqlIsNull(context, "SUM(cost_est_total),0")
                + "FROM wr WHERE wo_id = " + wo_id;
        final List estimation = selectDbRecords(context, select2);

        // actual hours and estimation hours both ????
        // TODO: check status for estimation hours
        final String select3 = "SELECT " + formatSqlIsNull(context, "SUM(wrcf.hours_est),0")
                + " as hours_est, " + formatSqlIsNull(context, "SUM(wrcf.hours_total),0")
                + " as hours_total " + " FROM wrcf LEFT OUTER JOIN wr on wrcf.wr_id = wr.wr_id "
                + " WHERE wr.status NOT IN ('Rej','Can') AND wr.wo_id = " + wo_id;

        final List hours = selectDbRecords(context, select3);

        if (!totals.isEmpty()) {
            final Object[] values = (Object[]) totals.get(0);
            final Object[] values2 = (Object[]) estimation.get(0);

            final String sql = "UPDATE wo SET cost_labor = " + values[0] + ", cost_tools = "
                    + values[1] + ", cost_parts = " + values[2] + ", cost_other = " + values[3]
                    + ", cost_total = " + values[4] + ", cost_estimated = " + values2[0]
                    + " WHERE wo_id = " + wo_id;
            executeDbSql(context, sql, false);
            // Guo changed 2009-01-15 for KB3021405
            // executeDbCommit(context);
            if (!hours.isEmpty()) {
                final Object[] values3 = (Object[]) hours.get(0);

                final String update = "UPDATE activity_log SET cost_estimated = " + values2[0]
                        + ", cost_actual = " + values[3] + ", hours_est_baseline = " + values3[0]
                        + ", hours_actual = " + values3[1] + " WHERE activity_log.wo_id = " + wo_id;

                executeDbSql(context, update, false);
                // executeDbCommit(context);
            }

            // KB3023582 edit by Weijie on 20090722
            final String updateActualCost = " update activity_log set cost_actual = " + values[4]
                    + " where  activity_log.wo_id = " + wo_id;
            executeDbSql(context, updateActualCost, false);
            // executeDbCommit(context);
        }

        /*
         * String sql = "UPDATE wo SET " + "cost_labor = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_labor),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))," + "cost_tools = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_tools),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))," + "cost_parts = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_parts),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))," + "cost_other = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_other),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))," + "cost_total = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_total),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))" + "WHERE wo_id = " + wo_id; executeDbSql(context, sql, false);
         */

        /*
         * String sql = "UPDATE wo SET cost_estimated = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_est_total),0") + "FROM wr WHERE wo_id = " + wo_id + ") WHERE wo_id = " + wo_id;
         * executeDbSql(context, sql, false);
         */

        // update costs for help request
        /*
         * String update = "UPDATE activity_log SET " + "cost_estimated = (SELECT " +
         * formatSqlIsNull(context, "cost_estimated,0") + " FROM wo WHERE wo.wo_id = " + wo_id +
         * ")," + " cost_actual = (SELECT " + formatSqlIsNull(context, "cost_total,0") + " FROM wo
         * WHERE wo.wo_id = " + wo_id + ")," + " hours_est_baseline = (SELECT " +
         * formatSqlIsNull(context, "SUM(hours_est),0") + " FROM wrcf WHERE wr_id IN (SELECT wr_id
         * FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN ('Rej','Can')))," + " hours_actual
         * = (SELECT " + formatSqlIsNull(context, "SUM(hours_total),0") + " FROM wrcf WHERE wr_id IN
         * (SELECT wr_id FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN ('Rej','Can')))" + "
         * WHERE activity_log.wo_id = " + wo_id;
         */

    }

    /**
     *
     * Recalculate estimated costs for a work request.
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update (labor/parts/tools/other) estimated costs</li>
     * <li>Update total estimated costs</li>
     * <li>Update estimated costs of the work order the work request is attached to</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>UPDATE wr SET <br />
     * cost_est_labor = (SELECT ISNULL(SUM(cost_estimated),0") FROM wrtr WHERE wr_id = ?)<br />
     * cost_est_other = (SELECT ISNULL(SUM(cost_estimated),0") FROM wr_other WHERE wr_id = ?)<br />
     * cost_est_parts = (SELECT ISNULL(SUM(cost_estimated),0") FROM wrpt WHERE wr_id = ?)<br />
     * cost_est_tools = (SELECT ISNULL(SUM(cost_estimated),0") FROM wrtt WHERE wr_id = ?)<br />
     * WHERE wr_id = ?;</div> <div>UPDATE wr SET<br />
     * cost_est_total = cost_est_labor + cost_est_other + cost_est_parts + cost_est_tools<br />
     * WHERE wr_id = ?</div> <div>UPDATE wo SET<br />
     * cost_estimated = (SELECT ISNULL(SUM(cost_est_total),0) FROM wr WHERE wo_id = ?)</div>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     *            </p>
     */
    public void recalculateEstCosts(final EventHandlerContext context, final int wr_id) {

        // KB3042845,3039027 - Estimated cost come from wrtl.cost_estimated after tools are assigned
        String toolsEstCostSql = "(SELECT " + formatSqlIsNull(context, "SUM(cost_estimated),0")
                + " FROM wrtt WHERE wr_id = " + wr_id + ")";

        final List toolList =
                selectDbRecords(context, "select wr_id from wrtl where wr_id = " + wr_id);

        if (toolList != null && toolList.size() > 0) {
            toolsEstCostSql = "(SELECT " + formatSqlIsNull(context, "SUM(cost_estimated),0")
                    + " FROM wrtl WHERE wr_id = " + wr_id + ")";
        }

        final List cfList =
                selectDbRecords(context, "select wr_id from wrcf where wr_id = " + wr_id);

        String sql;
        // KB3023929
        if (cfList != null && cfList.size() > 0) {

            sql = "UPDATE wr SET " + " est_labor_hours = (SELECT "
                    + formatSqlIsNull(context, "SUM(hours_est),0") + " FROM wrcf WHERE wr_id = "
                    + wr_id + ")" + " , cost_est_labor = (SELECT "
                    + formatSqlIsNull(context, "SUM(cost_estimated),0")
                    + " FROM wrcf WHERE wr_id = " + wr_id + ")" + " , cost_est_other = (SELECT "
                    + formatSqlIsNull(context, "SUM(cost_estimated),0")
                    + " FROM wr_other WHERE wr_id = " + wr_id + ")" + " , cost_est_parts = (SELECT "
                    + formatSqlIsNull(context, "SUM(cost_estimated),0")
                    + " FROM wrpt WHERE wr_id = " + wr_id + ")" + " , cost_est_tools = "
                    + toolsEstCostSql + " WHERE wr_id = " + wr_id;

        } else {

            sql = "UPDATE wr SET " + " est_labor_hours = (SELECT "
                    + formatSqlIsNull(context, "SUM(hours_est),0") + " FROM wrtr WHERE wr_id = "
                    + wr_id + ")" + " , cost_est_labor = (SELECT "
                    + formatSqlIsNull(context, "SUM(cost_estimated),0")
                    + " FROM wrtr WHERE wr_id = " + wr_id + ")" + " , cost_est_other = (SELECT "
                    + formatSqlIsNull(context, "SUM(cost_estimated),0")
                    + " FROM wr_other WHERE wr_id = " + wr_id + ")" + " , cost_est_parts = (SELECT "
                    + formatSqlIsNull(context, "SUM(cost_estimated),0")
                    + " FROM wrpt WHERE wr_id = " + wr_id + ")" + " , cost_est_tools = "
                    + toolsEstCostSql + " WHERE wr_id = " + wr_id;
        }

        executeDbSql(context, sql, true);

        final String sql_ = "UPDATE wr SET"
                + " cost_est_total = cost_est_labor + cost_est_other + cost_est_parts + cost_est_tools"
                + " WHERE wr_id = " + wr_id;
        executeDbSql(context, sql_, true);

        final Integer wo_id =
                getIntegerValue(context, selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id));
        if (wo_id != null) {
            recalculateWorkOrderCosts(context, wo_id.intValue());
        }

        final String update = "UPDATE activity_log SET " + " cost_estimated = (SELECT "
                + formatSqlIsNull(context, "cost_est_total,0") + " FROM wr WHERE wr_id = " + wr_id
                + ")," + " hours_est_baseline = (SELECT "
                + formatSqlIsNull(context, "SUM(hours_est),0") + " FROM wrcf WHERE wr_id = " + wr_id
                + ")" + " WHERE activity_log_id = (SELECT activity_log_id FROM wr WHERE wr_id = "
                + wr_id + ")";
        executeDbSql(context, update, false);
        // executeDbCommit(context);
    }

    /**
     *
     * Create work order with work request from help request.
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select building, description, supervisor and trade of given help request</li>
     * <li>Create new work order record with selected data</li>
     * <li>{@link #createWorkRequestFromActionItem(EventHandlerContext, int, boolean) Create new
     * work request based on given help request}</li>
     * <li>{@link #assignWorkRequestToWorkorder(EventHandlerContext, int, int) Assign new work
     * request to new work order}</li>
     * <li>Return new work request code</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param activity_log_id help request code
     * @return new work request code
     *         </p>
     */
    public int createWorkOrderFromActionItem(final EventHandlerContext context,
            final int activity_log_id) {
        final String[] fields =
                { "bl_id", "description", "supervisor", "tr_id", "work_team_id", "site_id" };
        final Object[] record = selectDbValues(context, Constants.ACTION_ITEM_TABLE, fields,
            "activity_log_id =" + activity_log_id);

        final String blId = notNull(record[0]);
        final String siteId = notNull(record[5]);
        // create new Work Order
        final Map values = new HashMap();
        values.put("bl_id", blId);
        values.put("description", notNull(record[1]));
        if (StringUtil.notNullOrEmpty(record[2])) {
            values.put("supervisor", notNull(record[2]));
        }
        values.put("tr_id", notNull(record[3]));
        values.put("name_of_contact", notNull(record[2]));
        values.put("work_team_id", notNull(record[4]));

        // add local time, timezone issue.
        values.put("date_created",
            LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId));
        values.put("time_created",
            LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId));

        executeDbAdd(context, "wo", values);
        // executeDbCommit(context); // always commit when added

        final int wo_id =
                Common.getMaxId(context, "wo", "wo_id", getRestrictionFromValues(context, values));

        // put wo_id in help request
        final Map act_values = new HashMap();
        act_values.put("activity_log_id", new Integer(activity_log_id));
        act_values.put("wo_id", new Integer(wo_id));
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, act_values);
        // executeDbCommit(context);

        final int wr_id = createWorkRequestFromActionItem(context, activity_log_id, false);
        assignWorkRequestToWorkorder(context, wr_id, wo_id);

        checkWorkorder(context, null, wr_id);
        // create new WR attached to this WO
        return wr_id;
    }

    /**
     *
     * Create work request from help request.
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create a new work request record with data from help request</li>
     * <li>Set supervisor on current user</li>
     * <li>Use the status manager to
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager#updateStatus(String)
     * update the work request status} to the status of the help request</li>
     * <li>Link to work request to the help request if linkToWr is true (set wr_id in the
     * <code>activity_log</code> table)
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param activity_log_id Id of help request to create work request from
     * @param linkToWr Link help request to work request or not
     * @return new work request code
     *         </p>
     */
    public int createWorkRequestFromActionItem(final EventHandlerContext context,
            final int activity_log_id, final boolean linkToWr) {
        // fix KB3029735, to aviod create duplicate work request
        int wr_id = findWrIdFromActionItem(context, activity_log_id);

        if (wr_id == 0) {
			 /* UofC Customized 09/2009: Added block_id, unit_id to fields. */
            /* 02/2010: Added tr_id to fields. */
            String[] fields = { "activity_log_id", "requestor", "phone_requestor", "site_id",
                    "bl_id", "fl_id", "rm_id", "dv_id", "dp_id", "ac_id", "location", "eq_id",
                    "prob_type", "priority", "description", "date_requested", "date_scheduled",
                    "manager", "supervisor", "dispatcher", "status", "work_team_id",
                    "date_escalation_completion", "time_escalation_completion",
                    "date_escalation_response", "time_escalation_response", "escalated_response",
					 "block_id", "unit_id", "tr_id",
                    "escalated_completion" };

            if (SchemaUtils.fieldExistsInSchema("wr", "date_esc_comp_orig")) {
                fields = new String[] { "activity_log_id", "requestor", "phone_requestor",
                        "site_id", "bl_id", "fl_id", "rm_id", "dv_id", "dp_id", "ac_id", "location",
                        "eq_id", "prob_type", "priority", "description", "date_requested",
                        "date_scheduled", "manager", "supervisor", "dispatcher", "status",
                        "work_team_id", "date_escalation_completion", "time_escalation_completion",
                        "date_escalation_response", "time_escalation_response",
                        "escalated_response", "escalated_completion", "date_esc_comp_orig",
                        "date_esc_resp_orig", "time_esc_comp_orig", "time_esc_resp_orig" };
            }

            final Object[] activity_log_values = selectDbValues(context,
                Constants.ACTION_ITEM_TABLE, fields, "activity_log_id = " + activity_log_id);

            final Map wr_values = new HashMap();
            wr_values.put("activity_log_id", new Integer(activity_log_id));

            for (int j = 1; j < fields.length; j++) {
                if (fields[j].equals("phone_requestor")) {
                    wr_values.put("phone", activity_log_values[j]);
                } else if ("date_scheduled".equals(fields[j])) {
                    wr_values.put("date_assigned", activity_log_values[j]);
                } else {
                    wr_values.put(fields[j], activity_log_values[j]);
                }
            }

            // add Local Time
            wr_values.put("date_requested", LocalDateTimeStore.get().currentLocalDate(null, null,
                notNull(activity_log_values[3]), notNull(activity_log_values[4])));
            // add Local Time
            wr_values.put("time_requested", LocalDateTimeStore.get().currentLocalTime(null, null,
                notNull(activity_log_values[3]), notNull(activity_log_values[4])));

            // update Work Request from SLA
            final ServiceLevelAgreement sla = ServiceLevelAgreement.getInstance(context,
                "activity_log", "activity_log_id", activity_log_id);
            final ServiceWindow serviceWindow = sla.getServiceWindow();
            if (serviceWindow != null) {
                wr_values.put("serv_window_days", serviceWindow.getServiceWindowDaysAsString());
                wr_values.put("serv_window_start", serviceWindow.getServiceWindowStartTime());
                wr_values.put("serv_window_end", serviceWindow.getServiceWindowEndTime());
                wr_values.put("allow_work_on_holidays",
                    serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
            }

            final String status =
                    StatusConverter.getWorkRequestStatus(notNull(wr_values.get("status")));

            // v21.2 change the default value to 'C' to invoke steps for status 'R' when call
            // statusManager.updateStatus(status);
            wr_values.put("status", "C"); // set default status Requested
            // if (wr_values.get("supervisor") == null) {
            // wr_values.put("supervisor",
            // getParentContextAttributeXPath(context,"/*/preferences/@em_em_id"));
            // }

            // save the work request
            executeDbAdd(context, "wr", wr_values);
            // executeDbCommit(context); // always commit when added

            wr_id = Common.getMaxId(context, "wr", "wr_id",
                getRestrictionFromValues(context, wr_values));

            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus(status);

            final Map values = new HashMap();
            if (linkToWr) {
                values.put("wr_id", new Integer(wr_id));
                values.put("activity_log_id", new Integer(activity_log_id));

                // update the help request
                executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
                // executeDbCommit(context);
            }

            // not issued
            createDefaultEstimationAndScheduling(context, wr_id, sla);

            this.copyDocumentsFromServiceRequestToWr(activity_log_id, wr_id);

            // KB3044963 - add new field wr.priority_label and update wr.priority_label value
            updatePriorityLabelOfWorkRequest(wr_id);

        } else {
            final String[] fields = { "activity_log_id", "supervisor", "work_team_id" };
            final Object[] activity_log_values = selectDbValues(context,
                Constants.ACTION_ITEM_TABLE, fields, "activity_log_id = " + activity_log_id);

            // save the work request supervisor and work team from service request
            final Map wr_values = new HashMap();
            wr_values.put("wr_id", new Integer(wr_id));
            wr_values.put("supervisor", notNull(activity_log_values[1]));
            wr_values.put("work_team_id", notNull(activity_log_values[2]));
            executeDbSave(context, "wr", wr_values);
            // executeDbCommit(context);
        }

        return wr_id;
    }

    /**
     *
     * copy documents from Service request to Work request. the method will be called in the method
     * createWorkRequestFromActionItem()
     *
     *
     * @param context Workflow rule execution context
     * @param activity_log_id Id of help request to create work request from
     * @param wr_id Work Request Id
     *            </p>
     */
    public void copyDocumentsFromServiceRequestToWr(final int activity_log_id, final int wr_id) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (!(wr_id > 0 && activity_log_id > 0)) {
            return;
        }

        final Vector sqlCommands = new Vector();
        // create the work reqeust from detail tab (grid list)
        if (context.parameterExists("documents")) {
            final JSONArray documents = context.getJSONArray("documents");

            // if documents to copy only one Service Request is submitted
            if (documents != null && documents.length() > 0) {
                for (int i = 0; i < documents.length(); i++) {
                    final String doc_field = documents.getString(i);
                    this.generateSqlsForCopyDocuments(sqlCommands, doc_field, activity_log_id,
                        wr_id);
                } // end for
            }
        } else {
            final String[] fields = { "doc1", "doc2", "doc3", "doc4" };
            final Object[] activity_log_values = selectDbValues(context,
                Constants.ACTION_ITEM_TABLE, fields, "activity_log_id = " + activity_log_id);

            final Object[] wr_values = selectDbValues(context, Constants.WORK_REQUEST_TABLE, fields,
                "wr_id = " + wr_id);

            for (int j = 0; j < fields.length; j++) {
                final String activityLogDocName = (String) activity_log_values[j];
                final String wrDocName = (String) wr_values[j];
                // the doc is valid.
                if (activityLogDocName != null && activityLogDocName.length() > 1
                        && wrDocName == null) {
                    final String doc_field = fields[j];
                    this.generateSqlsForCopyDocuments(sqlCommands, doc_field, activity_log_id,
                        wr_id);
                }
            }
        }

        if (sqlCommands.size() > 0) {
            executeDbSqlCommands(context, sqlCommands, true);
            // Guo changed 2009-01-15 for KB3021405
            // executeDbCommit(context);
        }
    }

    /**
     * generate sqls for copying the documents from Service Request to Work Request.
     *
     * @param sqlCommands
     * @param doc_field
     * @param activity_log_id
     * @param wr_id
     */
    private void generateSqlsForCopyDocuments(final Vector sqlCommands, final String doc_field,
            final int activity_log_id, final int wr_id) {

        sqlCommands.add(
            "INSERT INTO afm_docs (table_name, field_name, pkey_value, locked, locked_by, lock_date, lock_time, description, deleted) "
                    + " SELECT 'wr', '" + doc_field + "', " + wr_id
                    + ", locked, locked_by, lock_date, lock_time, description, deleted FROM afm_docs "
                    + " WHERE table_name = 'activity_log' AND field_name = '" + doc_field
                    + "' AND pkey_value = " + activity_log_id);

        sqlCommands.add(
            "INSERT INTO afm_docvers (table_name, field_name, pkey_value, version, file_contents, doc_file, doc_size, comments, checkin_date, checkin_time) "
                    + " SELECT 'wr', '" + doc_field + "', " + wr_id
                    + ",  version, file_contents, doc_file, doc_size, comments, checkin_date, checkin_time FROM afm_docvers "
                    + " WHERE table_name = 'activity_log' AND field_name = '" + doc_field
                    + "' AND pkey_value = " + activity_log_id + " AND version = "
                    + " (select max(version) from afm_docvers where table_name = 'activity_log' AND field_name = '"
                    + doc_field + "' AND pkey_value = " + activity_log_id + " )");

        sqlCommands.add("UPDATE wr SET " + doc_field + " = (SELECT " + doc_field
                + " FROM activity_log  WHERE activity_log_id = " + activity_log_id
                + ") WHERE wr_id = " + wr_id);
    }

    /**
     *
     * Assign work request to work order (eventhandler).
     *
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray of JSONObjects with a work request</li>
     * <li>wo_id : Work order code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#assignWorkRequestToWorkorder(EventHandlerContext, int, int)
     * Assign work requests to workorder}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param JSONArray records
     * @param String woId
     *            </p>
     */
    public void assignWrToWo(final JSONArray records, final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final int wo_id = Integer.parseInt(woId);

        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {
                final JSONObject rec = records.getJSONObject(i);
                final int wr_id = rec.getInt("wr.wr_id");
                assignWorkRequestToWorkorder(context, wr_id, wo_id);
            }
        }
    }

    /**
     *
     * Update work request status to AA.
     */
    public void updateWorkRequestStatusToAA(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {
                final JSONObject rec = records.getJSONObject(i);
                final int wr_id = rec.getInt("wr.wr_id");
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
                statusManager.updateStatus("AA");
            }
        }
    }

    /**
     *
     * Assign work request to work order (helper).
     *
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Save work request record (with wo_id)</li>
     * <li>Update context (work request code and SLA)</li>
     * <li>Update work request status to AA with the
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager#updateStatus(String)
     * statusmanager}</li>
     * </ol>
     * </p>
     * <p>
     *
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     * @param wo_id Work order code
     *            </p>
     */
    private void assignWorkRequestToWorkorder(final EventHandlerContext context, final int wr_id,
            final int wo_id) {

        int oldWoId = 0;
        final Object oldWo = selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id);
        if (oldWo != null) {
            oldWoId = getIntegerValue(context, oldWo);
        }

        /*
         * KB 3051214: wr.wo_id has security group CALCULATED so it cannot be updated directly if
         * the current user isn't in that group. Use SqlUtils.executeUpdate to work around the
         * security check.
         */
        SqlUtils.executeUpdate("wr",
            "UPDATE wr SET wo_id = " + literal(context, String.valueOf(wo_id)) + " WHERE wr_id = "
                    + literal(context, String.valueOf(wr_id)));

        syncWoBuildingCode(wr_id);

        final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
        statusManager.updateStatus("AA");

        recalculateWorkOrderCosts(context, wo_id);
        checkWorkorder(context, "AA", wr_id);

        // add to fix KB3027975(When assigning a work request to a work order, transfer account code
        // of work order to work request)
        updateAcIdOfWr(wr_id);

        // KB3048463 - delete the old work order if assign to new order
        // and there is no other work request assigned to the old work order
        if (oldWoId != 0) {
            final int wrCount =
                    DataStatistics.getInt("wr", "wr_id", "COUNT", "wr.wo_id = " + oldWoId);
            if (wrCount == 0) {
                final DataSource woDs =
                        DataSourceFactory.createDataSourceForFields("wo", new String[] { "wo_id" });
                final DataRecord wrRecord = woDs.getRecord("wo.wo_id=" + oldWoId);
                woDs.deleteRecord(wrRecord);
            }
        }
    }

    /**
     * update account code of work request according the linked work order's account when wr.ac_id
     * is null
     *
     * @param wr_id ID of work request
     */
    private void updateAcIdOfWr(final int wr_id) {
        final String updateSql =
                "UPDATE wr SET wr.ac_id = (SELECT wo.ac_id FROM wo WHERE wo.wo_id = wr.wo_id) WHERE wr.ac_id IS NULL AND wr.wr_id = "
                        + wr_id;
        SqlUtils.executeUpdate("wr", updateSql);
        // SqlUtils.commit();
    }

    /**
     * Confirm step using {@link com.archibus.eventhandler.steps.StepManager step manager}
     *
     * @param context Workflow rule execution context
     * @param wr_id ID of work request to confirm
     * @param comments confirmation comments
     * @param stepLogId Step log id of step to confirm
     */
    private void confirmStep(final EventHandlerContext context, final int wr_id,
            final int stepLogId, final String comments) {
        final StepManager stepmgr = new OnDemandWorkStepManager(context, wr_id);
        stepmgr.confirmStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }

    /**
     * Reject step using {@link com.archibus.eventhandler.steps.StepManager step manager}
     *
     * @param context Workflow rule execution context
     * @param wr_id ID of work request to confirm
     * @param comments confirmation comments
     * @param stepLogId Step log id of step to confirm
     */
    private void rejectStep(final EventHandlerContext context, final int wr_id, final int stepLogId,
            final String comments) {
        final StepManager stepmgr = new OnDemandWorkStepManager(context, wr_id);
        stepmgr.rejectStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }

    /**
     *
     * Get work request similar to a given help request.
     * <p>
     * Retrieve open work requests with the same problem type, location and equipment of the given
     * help request
     * </p>
     *
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log_id : Help request id</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray with JSONObjects for work request records<br />
     * <code>[{wr.wr_id : ?, wr.prob_type : ?, wr.bl_id : ?, wr.fl_id : ?, wr.rm_id : ?, wr.eq_id : ?, wr.status : ?, wr.description : ?}]</code>
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from <code>wr</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     *
     * @param String activity_log_id1
     */
    public void getSimilarWorkRequests(final String activity_log_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("activity_log_id", activity_log_id1);
        final int activity_log_id = context.getInt("activity_log_id");
        final Object[] record = selectDbValues(context, "activity_log",
            new String[] { "prob_type", "bl_id", "fl_id", "rm_id", "eq_id" },
            "activity_log_id = " + activity_log_id);

        final String[] fields = new String[] { "wr_id", "prob_type", "bl_id", "fl_id", "rm_id",
                "eq_id", "status", "description" };
        final StringBuffer where =
                new StringBuffer("prob_type= " + literal(context, notNull(record[0])));
        if (record[1] != null) {
            where.append(" AND bl_id = " + literal(context, notNull(record[1])));
        }
        if (record[2] != null) {
            where.append(" AND fl_id = " + literal(context, notNull(record[2])));
        }
        if (record[3] != null) {
            where.append(" AND rm_id = " + literal(context, notNull(record[3])));
        }
        if (record[4] != null) {
            where.append(" AND eq_id = " + literal(context, notNull(record[4])));
        }
        where.append(" AND status IN ('A','AA','I') ");
        final List records = selectDbRecords(context, "wr", fields, where.toString());
        final JSONArray json = new JSONArray();
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] rec = (Object[]) it.next();
                final JSONObject object = new JSONObject();
                for (int i = 0; i < fields.length; i++) {
                    if (fields[i].equals("status")) {
                        object.put("wr." + fields[i],
                            getEnumFieldDisplayedValue(context, "wr", "status", (String) rec[i]));
                    } else {
                        object.put("wr." + fields[i], rec[i]);
                    }

                }
                json.put(object);
            }
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }

    /**
     * Create Estimation (wrtr) and Schedule (wrcf) record when auto-schedule
     *
     * This works conform the planning board scheduling.
     *
     * @param context
     * @param wr_id
     * @param sla
     * @param issue
     */
    private void createDefaultEstimationAndScheduling(final EventHandlerContext context,
            final int wr_id, final ServiceLevelAgreement sla) {
        // first check if SLA requires auto-schedule
        if (sla.getCraftsperson() != null) {
            // assign to single craftsperson
            final String cfId = sla.getCraftsperson();
            createDefaultCfAssignments(context, wr_id, sla, cfId);

        } else if (sla.getResponseStringParameter("cf_role") != null) {
            // assign to cf role
            final String cfRole = sla.getResponseStringParameter("cf_role");
            final List<String> cfs = HelpdeskRoles.getEmployeesFromHelpdeskRole(context, cfRole,
                "wr", "wr_id", wr_id);
            for (final String cfId : cfs) {
                createDefaultCfAssignments(context, wr_id, sla, cfId);
            }
        }
    }

    private void createDefaultCfAssignments(final EventHandlerContext context, final int wr_id,
            final ServiceLevelAgreement sla, final String cf_id) {

        final List records =
                selectDbRecords(context, "wrcf", new String[] { "date_assigned", "time_assigned" },
                    "wr_id = " + wr_id + " AND cf_id = " + literal(context, cf_id));

        // if already scheduled we don't change anything in wrcf
        if (records.isEmpty()) {
            // get the trade from the craftsperson
            final Object[] cf_values = selectDbValues(context, "cf",
                new String[] { "tr_id", "std_hours_avail", "rate_hourly" },
                "cf_id = " + literal(context, cf_id));
            final String tr_id = notNull(cf_values[0]);
            // get the trade rate for estimation
            final Object tr_value = selectDbValue(context, "tr", "rate_hourly",
                "tr_id = " + literal(context, tr_id));
            final double trade_rate_hourly = ((Double) tr_value).doubleValue();

            final double std_hours_avail = ((Double) cf_values[1]).doubleValue(); // standardHours
            // for
            // this craftsperson
            final double rate_hourly = ((Double) cf_values[2]).doubleValue();

            final ServiceWindow serviceWindow = sla.getServiceWindow();

            final Map<String, String> map =
                    Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));

            final Date currrentLocalDate = LocalDateTimeStore.get().currentLocalDate(null, null,
                map.get("siteId"), map.get("blId"));
            final Time currrentLocalTime = LocalDateTimeStore.get().currentLocalTime(null, null,
                map.get("siteId"), map.get("blId"));

            final Date startDate = LocalDateTimeStore.get().currentLocalDate(null, null,
                map.get("siteId"), map.get("blId"));

            final Time startTime = serviceWindow.getServiceWindowStartTime();

            final long milliseconds = serviceWindow.getServiceWindowEndTime().getTime()
                    - serviceWindow.getServiceWindowStartTime().getTime();
            final double serviceWindowHours = (milliseconds * 1.0) / (60 * 60 * 1000);
            double hoursToScheduleForDay = serviceWindowHours;

            if (std_hours_avail > 0) {
                hoursToScheduleForDay = Math.min(std_hours_avail, serviceWindowHours);
            }

            // new record in wrtr

            final Map trvalues = new HashMap();
            trvalues.put("wr_id", new Integer(wr_id));
            trvalues.put("tr_id", tr_id);

            double duration = 0;

            // KB3043492 - Instead of requiring Default Duration to be populated, let's allow
            // the field to be 0 or null,
            // but still create the WRCF record to add the craftsperson to the work request.
            // Estimated Hours will be 0.
            if (sla.getResponseIntegerParameter("default_duration") != null) {
                final double default_duration =
                        sla.getResponseIntegerParameter("default_duration").doubleValue();

                duration = default_duration;

                trvalues.put("hours_est", new Double(default_duration));
                // we will auto-schedule complete task
                trvalues.put("hours_sched", new Double(default_duration));
                // we use the trade rate hourly to do the estimation
                trvalues.put("cost_estimated", new Double(trade_rate_hourly * default_duration));
            }

            trvalues.put("date_assigned", currrentLocalDate);
            trvalues.put("time_assigned", currrentLocalTime);

            executeDbSave(context, "wrtr", trvalues);
            // executeDbCommit(context);

            // KB3025102 - allow for configurable craftsperson assignment on autoscheduling
            if (SchemaUtils.fieldExistsInSchema("helpdesk_sla_response", "schedule_immediately")
                    && isScheduleImmediately(sla) && isRequestSubmitWithinServiceWindow(
                        serviceWindow, currrentLocalDate, currrentLocalTime)) {

                // create wrcf records in next service day
                createWrcfRecordImmediately(context, wr_id, cf_id, tr_id, rate_hourly,
                    serviceWindow, startDate, startTime, hoursToScheduleForDay, duration,
                    currrentLocalTime);

            } else {
                // create wrcf records in next service day
                createWrcfRecordNextServiceDay(context, wr_id, cf_id, tr_id, rate_hourly,
                    serviceWindow, startDate, startTime, hoursToScheduleForDay, duration,
                    currrentLocalTime);
            }

            recalculateEstCosts(context, wr_id);

            // calculate the scheduled hours
            recalculateTrade(context, wr_id, tr_id);

            final Object tmp = selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id);
            if (tmp != null) {
                final Integer wo_id = getIntegerValue(context, tmp);
                recalculateWorkOrderCosts(context, wo_id.intValue());
            }

        }
    }

    /**
     * Check SLA ScheduleImmediately.
     *
     * @param sla ServiceLevelAgreement object
     * @return is scheduleImmediately
     */
    private boolean isScheduleImmediately(final ServiceLevelAgreement sla) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final Integer scheduleimmediately = getIntegerValue(context,
            selectDbValue(context, "helpdesk_sla_response", "schedule_immediately",
                "helpdesk_sla_response.activity_type='SERVICE DESK - MAINTENANCE' and helpdesk_sla_response.ordering_seq =  "
                        + sla.getOrdering_seq() + " and helpdesk_sla_response.priority ="
                        + sla.getPriority()));

        return scheduleimmediately == 1;
    }

    /**
     * Check work request time is within ServiceWindow.
     *
     * @param serviceWindow ServiceWindow object
     * @param currentLocalTime current local request time
     * @return is wintin service window
     */
    private boolean isRequestSubmitWithinServiceWindow(final ServiceWindow serviceWindow,
            final Date currentLocaDate, final Time currentLocalTime) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        if (serviceWindow.getServiceDay(currentLocaDate)
            .equals(currentLocaDate) && ((serviceWindow.getServiceWindowStartTime().toString()
                .equals(serviceWindow.getServiceWindowEndTime()
                    .toString())) || (!getTimeValue(context, currentLocalTime)
                        .before(serviceWindow.getServiceWindowStartTime())
                        && !getTimeValue(context, currentLocalTime)
                            .after(serviceWindow.getServiceWindowEndTime())))) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * create wrcf records Immediately.
     *
     * @param context Event handler context
     * @param wr_id work requst code
     * @param cf_id craftsperson code
     * @param tr_id trade code
     * @param rate_hourly craftsperson rate hourly
     * @param serviceWindow serviceWindow
     * @param startDate startDate
     * @param startTime startTime
     * @param hoursToScheduleForDay hoursToScheduleForDay
     * @param duration duration
     */
    private void createWrcfRecordImmediately(final EventHandlerContext context, final int wr_id,
            final String cf_id, final String tr_id, final double rate_hourly,
            final ServiceWindow serviceWindow, Date startDate, final Time startTime,
            double hoursToScheduleForDay, double duration, final Time currentLocalTime) {

        final Map wrcf_values = new HashMap();
        wrcf_values.put("wr_id", new Integer(wr_id));
        wrcf_values.put("cf_id", cf_id);
        wrcf_values.put("scheduled_from_tr_id", tr_id);

        if (duration == 0) {
            // start at current time
            wrcf_values.put("date_assigned", startDate);
            wrcf_values.put("time_assigned", currentLocalTime);

            // create wrcf records, with defualt hours_est = 0
            executeDbSave(context, "wrcf", wrcf_values);
        } else {
            // calculate remaining service window hours of Today
            final long milliseconds = serviceWindow.getServiceWindowEndTime().getTime()
                    - getTimeValue(context, currentLocalTime).getTime();
            final double remainingServiceWindowHoursOfToday =
                    (milliseconds * 1.0) / (60 * 60 * 1000);

            double hoursToScheduleForToday =
                    Math.min(remainingServiceWindowHoursOfToday, hoursToScheduleForDay);
            // if duration is smaller than the remaining service window time and
            // cf.cf.std_hours_avail, pick the duration as the scheudle hours
            if (duration < hoursToScheduleForToday) {
                hoursToScheduleForToday = duration;
            }

            // start at current time
            wrcf_values.put("date_assigned", startDate);
            wrcf_values.put("time_assigned", currentLocalTime);
            wrcf_values.put("hours_est", new Double(hoursToScheduleForToday));
            // use the crafsperson rate to calculate the cost

            final double cost_est_todat = rate_hourly * hoursToScheduleForToday;
            wrcf_values.put("cost_estimated", new Double(cost_est_todat));

            // create wrcf record for today
            executeDbSave(context, "wrcf", wrcf_values);

            // calculate duraiton time remaining
            duration = duration - hoursToScheduleForToday;
            // if there still duration remaining, schedle from next serve day when the service
            // window start
            // and split the duration to multiple wrcf recors if the remaining duraiton is bigger
            // that service window hours and cf.std_hours_avail
            while (duration > 0) {
                startDate = serviceWindow.getNextServiceDay(startDate);
                if (duration < hoursToScheduleForDay) {
                    hoursToScheduleForDay = duration;
                }

                wrcf_values.put("date_assigned", startDate);
                // Start at the Service Window start time
                wrcf_values.put("time_assigned", startTime);
                wrcf_values.put("hours_est", new Double(hoursToScheduleForDay));

                // use the crafsperson rate for assignment
                final double cost_est = rate_hourly * hoursToScheduleForDay;
                wrcf_values.put("cost_estimated", new Double(cost_est));

                // create wrcf records
                executeDbSave(context, "wrcf", wrcf_values);

                // calculate time remaining
                duration = duration - hoursToScheduleForDay;
            } // end while
        }
    }

    /**
     * create wrcf records in next service day.
     *
     * @param context Event handler context
     * @param wr_id work requst code
     * @param cf_id craftsperson code
     * @param tr_id trade code
     * @param rate_hourly craftsperson rate hourly
     * @param serviceWindow serviceWindow
     * @param startDate startDate
     * @param startTime startTime
     * @param hoursToScheduleForDay hoursToScheduleForDay
     * @param duration duration
     */
    private void createWrcfRecordNextServiceDay(final EventHandlerContext context, final int wr_id,
            final String cf_id, final String tr_id, final double rate_hourly,
            final ServiceWindow serviceWindow, Date startDate, final Time startTime,
            double hoursToScheduleForDay, double duration, final Time currentLocalTime) {

        // KB3042588 - Time should also be counted when schedule craftsperson
        // if request time before service window start time, then next service day is today.
        if (getTimeValue(context, currentLocalTime)
            .before(serviceWindow.getServiceWindowStartTime())) {
            final Calendar calendar = new GregorianCalendar();
            calendar.setTime(startDate);
            calendar.add(Calendar.DATE, -1);
            startDate = new java.sql.Date(calendar.getTimeInMillis());
        }

        final Map wrcf_values = new HashMap();
        wrcf_values.put("wr_id", new Integer(wr_id));
        wrcf_values.put("cf_id", cf_id);
        wrcf_values.put("scheduled_from_tr_id", tr_id);

        if (duration == 0) {
            // start at the next service day
            wrcf_values.put("date_assigned", serviceWindow.getNextServiceDay(startDate));
            // always start at the Service Window start time
            wrcf_values.put("time_assigned", startTime);

            // create wrcf records
            executeDbSave(context, "wrcf", wrcf_values);
        } else {
            // if the duration is bigger that service window times and cf.std_hours_avail, split the
            // duration to multiple wrcf records
            while (duration > 0) {
                startDate = serviceWindow.getNextServiceDay(startDate);
                if (duration < hoursToScheduleForDay) {
                    hoursToScheduleForDay = duration;
                }

                // start at Service Window start time
                wrcf_values.put("date_assigned", startDate);
                wrcf_values.put("time_assigned", startTime);
                wrcf_values.put("hours_est", new Double(hoursToScheduleForDay));

                // use the crafsperson rate for assignment
                final double cost_est = rate_hourly * hoursToScheduleForDay;
                wrcf_values.put("cost_estimated", new Double(cost_est));

                // create wrcf record
                executeDbSave(context, "wrcf", wrcf_values);

                // calculate time remaining
                duration = duration - hoursToScheduleForDay;
            } // end while
        }
    }

    /**
     * Restriction from values to get proper last inserted id value. Restricted to requestor,
     * supervisor and/or building
     *
     *
     * @param context
     * @param values
     * @return
     */
    private String getRestrictionFromValues(final EventHandlerContext context, final Map values) {
        final StringBuffer sb = new StringBuffer();
        if (values.containsKey("requestor") && StringUtil.notNullOrEmpty(values.get("requestor"))) {
            sb.append("requestor = " + literal(context, notNull(values.get("requestor"))));
        } else if (values.containsKey("supervisor")
                && StringUtil.notNullOrEmpty(values.get("supervisor"))) {
            sb.append("supervisor = " + literal(context, notNull(values.get("supervisor"))));
        } else if (values.containsKey("bl_id") && StringUtil.notNullOrEmpty(values.get("bl_id"))) {
            sb.append("bl_id = " + literal(context, notNull(values.get("bl_id"))));
        } else {
            return null;
        }

        return sb.toString();
    }

    /**
     * This scheduled workflow rule is for users who insert Work Request records (wr records) from
     * sources other than Web Central to invoke the SLA process By Guo Jiangtao 2010-08-23
     *
     * @param context
     */
    public void invokeSLAForWorkRequests(final EventHandlerContext context) {
        // Create work request datasource and add restriction
        final DataSource wrDS = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "activity_log_id", "pmp_id", "eq_id", "status", "site_id",
                    "bl_id", "fl_id", "rm_id", "dv_id", "dp_id", "prob_type", "priority",
                    "date_requested", "time_requested", "supervisor", "work_team_id", "manager",
                    "requestor", "serv_window_days", "serv_window_start", "serv_window_end",
                    "allow_work_on_holidays" });
        // EC - KB 3040420 - exclude work requests created by room reservations
        wrDS.addRestriction(Restrictions.sql(
            "wr.activity_log_id IS NULL AND wr.status IN ('A','AA','I') AND wr.prob_type NOT IN ('RES. SETUP','RES. CLEANUP')"));

        // get record list and invoke sla for every matched work request
        final List<DataRecord> wrList = wrDS.getAllRecords();
        for (final DataRecord wrRecord : wrList) {
            final int wrId = wrRecord.getInt("wr.wr_id");
            final int priority = wrRecord.getInt("wr.priority");
            final String status = wrRecord.getString("wr.status");
            if (priority >= 1 && priority <= 5) {
                wrRecord.setValue("wr.priority", priority);
            } else {
                // set the priority default to 1
                wrRecord.setValue("wr.priority", 1);
            }
            // set back the status to "R" to updadte the status to current status by calling
            // OnDemandWorkStatusManager.updateStatus(status);
            wrRecord.setValue("wr.status", "R");
            wrDS.saveRecord(wrRecord);
            // wrDS.commit();

            // update Work Request values from SLA
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wrId);
            final ServiceWindow serviceWindow = sla.getServiceWindow();
            if (serviceWindow != null) {
                wrRecord.setValue("wr.serv_window_days",
                    serviceWindow.getServiceWindowDaysAsString());
                wrRecord.setValue("wr.serv_window_start",
                    serviceWindow.getServiceWindowStartTime());
                wrRecord.setValue("wr.serv_window_end", serviceWindow.getServiceWindowEndTime());
                wrRecord.setValue("wr.allow_work_on_holidays",
                    serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
            }

            wrRecord.setValue("wr.manager", sla.getSLAManager());
            wrRecord.setValue("wr.supervisor", sla.getSupervisor());
            wrRecord.setValue("wr.work_team_id", sla.getWorkTeam());
            // create Activity Log and update wr.activity_log_id
            final DataRecord alRecord = createNewActivityLog(wrRecord);
            final int activityLogId = alRecord.getInt("activity_log.activity_log_id");
            wrRecord.setValue("wr.activity_log_id", activityLogId);
            wrDS.saveRecord(wrRecord);
            // wrDS.commit();
            createDefaultEstimationAndScheduling(context, wrId, sla);

            // update status and invoke sla steps
            try {
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wrId);
                statusManager.updateStatus(status);
            } catch (final Exception e) {
                wrRecord.setValue("wr.status", status);
                wrDS.saveRecord(wrRecord);
                // wrDS.commit();
                this.log.info("update status error for work request: " + wrId);
            }
        }
    }

    /**
     * Invoke SLA for a mobile work request created after Sync. Started using the
     * invokeSLAForWorkRequests method as a prototype. Constantine Kriezis 2013-03-11.
     *
     * @param context
     * @param wrId
     */
    public void invokeSLAForMobileWorkRequest(final EventHandlerContext context, final int wrId) {
        // Create the work request datasource and add the restriction to find the current record.
        final DataSource wrDS = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "activity_log_id", "pmp_id", "eq_id", "status", "site_id",
                    "bl_id", "fl_id", "rm_id", "dv_id", "dp_id", "prob_type", "description",
                    "priority", "date_requested", "time_requested", "supervisor", "work_team_id",
                    "manager", "tr_id", "requestor", "serv_window_days", "serv_window_start",
                    "serv_window_end", "allow_work_on_holidays", "wo_id" });

        wrDS.addRestriction(Restrictions.eq("wr", "wr_id", wrId));

        // Get the new work request record and invoke the required SLA
        final DataRecord wrRecord = wrDS.getRecord();

        if (wrRecord != null) {
            wrRecord.getString("wr.status");

            // set back the status to "R" to update the status to current status by calling
            // OnDemandWorkStatusManager.updateStatus(status);
            wrRecord.setValue("wr.status", "R");
            wrDS.saveRecord(wrRecord);
            // wrDS.commit();

            // update Work Request values from SLA
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wrId);

            final ServiceWindow serviceWindow = sla.getServiceWindow();

            if (serviceWindow != null) {
                wrRecord.setValue("wr.serv_window_days",
                    serviceWindow.getServiceWindowDaysAsString());
                wrRecord.setValue("wr.serv_window_start",
                    serviceWindow.getServiceWindowStartTime());
                wrRecord.setValue("wr.serv_window_end", serviceWindow.getServiceWindowEndTime());
                wrRecord.setValue("wr.allow_work_on_holidays",
                    serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
            }

            wrRecord.setValue("wr.manager", sla.getSLAManager());
            wrRecord.setValue("wr.supervisor", sla.getSupervisor());
            wrRecord.setValue("wr.work_team_id", sla.getWorkTeam());

            // Create new Work Order
            final Map values = new HashMap();
            values.put("bl_id", wrRecord.getString("wr.bl_id"));
            values.put("description", wrRecord.getString("wr.description"));
            values.put("supervisor", wrRecord.getString("wr.supervisor"));
            values.put("name_of_contact", wrRecord.getString("wr.supervisor"));
            values.put("work_team_id", wrRecord.getString("wr.work_team_id"));
            values.put("tr_id", wrRecord.getString("wr.tr_id"));
            values.put("date_created", wrRecord.getDate("wr.date_requested"));
            values.put("time_created", wrRecord.getDate("wr.time_requested"));

            executeDbAdd(context, "wo", values);
            // executeDbCommit(context);

            final int woId = Common.getMaxId(context, "wo", "wo_id",
                getRestrictionFromValues(context, values));

            wrRecord.setValue("wr.wo_id", woId);
            wrDS.saveRecord(wrRecord);
            // wrDS.commit();

            // Create activity log and also update activity_log.wo_id
            final DataRecord alRecord = createNewActivityLogForMobile(wrRecord);
            final int activityLogId = alRecord.getInt("activity_log.activity_log_id");

            // Update wr.activity_log_id
            wrRecord.setValue("wr.activity_log_id", activityLogId);
            wrDS.saveRecord(wrRecord);
            // wrDS.commit();

            updateWorkRequestFromSLAMobile(context, wrId);

            // Commenting the estimating and scheduling step as the tehcnician assigns work to
            // complete directly.
            // createDefaultEstimationAndScheduling(context, wrId, sla);

            // We make sure we issue the work request
            issueWorkorderMobile(String.valueOf(woId));

            // // update status and invoke sla steps
            // try {
            // final StatusManager statusManager = new OnDemandWorkStatusManager(context, wrId);
            // statusManager.updateStatus(status);
            // } catch (final Exception e) {
            // wrRecord.setValue("wr.status", status);
            // wrDS.saveRecord(wrRecord);
            // wrDS.commit();
            // this.log.info("update status error for work request: " + wrId);
            // }
        }
    }

    /**
     * This method create a new service request record by filling information from work request.
     *
     * By Guo Jiangtao 2010-08-23
     *
     * @param wrRecord : Work request record
     */
    private DataRecord createNewActivityLog(final DataRecord wrRecord) {
        final DataSource alDS = DataSourceFactory.createDataSourceForFields("activity_log",
            new String[] { "activity_log_id", "activity_type", "autocreate_wr", "site_id", "bl_id",
                    "fl_id", "pmp_id", "eq_id", "rm_id", "dv_id", "dp_id", "prob_type", "status",
                    "date_issued", "date_requested", "time_requested", "supervisor", "work_team_id",
                    "manager", "requestor", "wr_id" });
        wrRecord.getString("wr.status");
        final String status = "REQUESTED";
        DataRecord alRecord = alDS.createNewRecord();
        alRecord.setValue("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
        alRecord.setValue("activity_log.prob_type", wrRecord.getString("wr.prob_type"));
        alRecord.setValue("activity_log.pmp_id", wrRecord.getString("wr.pmp_id"));
        alRecord.setValue("activity_log.eq_id", wrRecord.getString("wr.eq_id"));
        alRecord.setValue("activity_log.site_id", wrRecord.getString("wr.site_id"));
        alRecord.setValue("activity_log.bl_id", wrRecord.getString("wr.bl_id"));
        alRecord.setValue("activity_log.fl_id", wrRecord.getString("wr.fl_id"));
        alRecord.setValue("activity_log.rm_id", wrRecord.getString("wr.rm_id"));
        alRecord.setValue("activity_log.dv_id", wrRecord.getString("wr.dv_id"));
        alRecord.setValue("activity_log.dp_id", wrRecord.getString("wr.dp_id"));
        alRecord.setValue("activity_log.status", status);
        alRecord.setValue("activity_log.date_requested", wrRecord.getDate("wr.date_requested"));
        alRecord.setValue("activity_log.time_requested", wrRecord.getValue("wr.time_requested"));
        alRecord.setValue("activity_log.supervisor", wrRecord.getString("wr.supervisor"));
        alRecord.setValue("activity_log.work_team_id", wrRecord.getString("wr.work_team_id"));
        alRecord.setValue("activity_log.manager", wrRecord.getValue("wr.manager"));
        alRecord.setValue("activity_log.requestor", wrRecord.getValue("wr.requestor"));
        alRecord.setValue("activity_log.wr_id", wrRecord.getInt("wr.wr_id"));
        alRecord = alDS.saveRecord(alRecord);
        // alDS.commit();

        return alRecord;
    }

    /**
     * This method create a new service request record by filling information from work request.
     *
     * By Guo Jiangtao 2010-08-23, C. Kriezis added description,wo_id 2013-06-07
     *
     * @param wrRecord : Work request record
     */
    private DataRecord createNewActivityLogForMobile(final DataRecord wrRecord) {
        final DataSource alDS = DataSourceFactory.createDataSourceForFields("activity_log",
            new String[] { "activity_log_id", "activity_type", "autocreate_wr", "site_id", "bl_id",
                    "fl_id", "pmp_id", "eq_id", "rm_id", "dv_id", "dp_id", "prob_type",
                    "description", "status", "date_issued", "date_requested", "time_requested",
                    "supervisor", "work_team_id", "manager", "requestor", "wr_id", "wo_id" });

        final String status = "REQUESTED";
        DataRecord alRecord = alDS.createNewRecord();
        alRecord.setValue("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
        alRecord.setValue("activity_log.prob_type", wrRecord.getString("wr.prob_type"));
        alRecord.setValue("activity_log.description", wrRecord.getString("wr.description"));
        alRecord.setValue("activity_log.pmp_id", wrRecord.getString("wr.pmp_id"));
        alRecord.setValue("activity_log.eq_id", wrRecord.getString("wr.eq_id"));
        alRecord.setValue("activity_log.site_id", wrRecord.getString("wr.site_id"));
        alRecord.setValue("activity_log.bl_id", wrRecord.getString("wr.bl_id"));
        alRecord.setValue("activity_log.fl_id", wrRecord.getString("wr.fl_id"));
        alRecord.setValue("activity_log.rm_id", wrRecord.getString("wr.rm_id"));
        alRecord.setValue("activity_log.dv_id", wrRecord.getString("wr.dv_id"));
        alRecord.setValue("activity_log.dp_id", wrRecord.getString("wr.dp_id"));
        alRecord.setValue("activity_log.status", status);
        alRecord.setValue("activity_log.date_requested", wrRecord.getDate("wr.date_requested"));
        alRecord.setValue("activity_log.time_requested", wrRecord.getValue("wr.time_requested"));
        alRecord.setValue("activity_log.supervisor", wrRecord.getString("wr.supervisor"));
        alRecord.setValue("activity_log.work_team_id", wrRecord.getString("wr.work_team_id"));
        alRecord.setValue("activity_log.manager", wrRecord.getValue("wr.manager"));
        alRecord.setValue("activity_log.requestor", wrRecord.getValue("wr.requestor"));
        alRecord.setValue("activity_log.wr_id", wrRecord.getInt("wr.wr_id"));
        alRecord.setValue("activity_log.wo_id", wrRecord.getInt("wr.wo_id"));
        alRecord = alDS.saveRecord(alRecord);
        // alDS.commit();

        return alRecord;
    }

    // ---------------------------------------------------------------------------------------------
    // BEGIN updateWrDateAssigned WFR
    // Added for 19.2 Bldgops
    // ---------------------------------------------------------------------------------------------
    /**
     * To make the Date to Perform more relevant in On Demand Work, this scheduled workflow rule
     * updates wr.date_assigned for On Demand Work Requests based on the earliest date that any
     * trade, craftsperson, or resource is assigned.
     *
     * By Zhang Yi 2010-08-23
     */

    public void updateDateAssignedOfWorkRequest() {

        final StringBuilder updateWrSql = new StringBuilder();
        updateWrSql.append("update wr set wr.date_assigned=(");
        updateWrSql.append(
            "    case when not exists( select  wrtr.date_assigned from wrtr where wrtr.wr_id=wr.wr_id  )");
        updateWrSql.append(
            "          and not exists( select  wrcf.date_assigned from wrcf where wrcf.wr_id=wr.wr_id  )");
        updateWrSql.append(
            "          and not exists( select  wrtl.date_assigned from wrtl where wrtl.wr_id=wr.wr_id  )");
        updateWrSql.append(
            "          and not exists( select  wrtt.date_assigned from wrtt where wrtt.wr_id=wr.wr_id  )");
        updateWrSql.append(
            "          and not exists( select  wrpt.date_assigned from wrpt where wrpt.wr_id=wr.wr_id  )");
        updateWrSql.append(
            "    then (                                                                      ");
        updateWrSql.append(
            "            case when  wr.date_assigned is null                                 ");
        updateWrSql.append(
            "            then wr.date_requested    else wr.date_assigned                     ");
        updateWrSql.append(
            "            end                                                                 ");
        updateWrSql.append(
            "         )                                                                      ");
        updateWrSql.append(
            "    else                                                                            ");
        updateWrSql
            .append("        (SELECT min(wrRes.minDATRASSIGNED) from (                           ");
        updateWrSql.append(
            "            select min( wrtr.date_assigned ) ${sql.as} minDATRASSIGNED from wrtr where wrtr.wr_id=wr.wr_id and  exists( select  wrtr.date_assigned from wrtr where wrtr.wr_id=wr.wr_id)");
        updateWrSql.append("            union all ");
        updateWrSql.append(
            "            select min ( wrcf.date_assigned) ${sql.as} minDATRASSIGNED from wrcf where wrcf.wr_id=wr.wr_id and  exists( select  wrcf.date_assigned from wrcf where wrcf.wr_id=wr.wr_id)");
        updateWrSql.append("            union all ");
        updateWrSql.append(
            "            select min ( wrpt.date_assigned) ${sql.as} minDATRASSIGNED from wrpt where wrpt.wr_id=wr.wr_id and  exists( select  wrpt.date_assigned from wrpt where wrpt.wr_id=wr.wr_id)");
        updateWrSql.append("            union all ");
        updateWrSql.append(
            "            select min ( wrtt.date_assigned) ${sql.as} minDATRASSIGNED from wrtt where wrtt.wr_id=wr.wr_id and  exists( select  wrtt.date_assigned from wrtt where wrtt.wr_id=wr.wr_id)");
        updateWrSql.append("            union all ");
        updateWrSql.append(
            "            select min ( wrtl.date_assigned) ${sql.as} minDATRASSIGNED from wrtl where wrtl.wr_id=wr.wr_id and  exists( select  wrtl.date_assigned from wrtl where wrtl.wr_id=wr.wr_id)");
        updateWrSql.append(
            "            ) ${sql.as} wrRes                                                       ");
        updateWrSql.append(
            "         )                                                                          ");
        updateWrSql.append(
            "    end                                                                                                                                                                                                            ");
        updateWrSql
            .append(") where  wr.prob_type IS NOT NULL AND wr.prob_type !='PREVENTIVE MAINT'  ");

        final StringBuilder updateWrSqlOracle = new StringBuilder();
        updateWrSqlOracle.append("update wr set wr.date_assigned=(");
        updateWrSqlOracle.append(
            "    case when not exists( select  wrtr.date_assigned from wrtr where wrtr.wr_id=wr.wr_id  )");
        updateWrSqlOracle.append(
            "          and not exists( select  wrcf.date_assigned from wrcf where wrcf.wr_id=wr.wr_id  )");
        updateWrSqlOracle.append(
            "          and not exists( select  wrtl.date_assigned from wrtl where wrtl.wr_id=wr.wr_id  )");
        updateWrSqlOracle.append(
            "          and not exists( select  wrtt.date_assigned from wrtt where wrtt.wr_id=wr.wr_id  )");
        updateWrSqlOracle.append(
            "          and not exists( select  wrpt.date_assigned from wrpt where wrpt.wr_id=wr.wr_id  )");
        updateWrSqlOracle.append(
            "    then (                                                                      ");
        updateWrSqlOracle.append(
            "            case when  wr.date_assigned is null                                 ");
        updateWrSqlOracle.append(
            "            then wr.date_requested  else wr.date_assigned                       ");
        updateWrSqlOracle.append(
            "            end                                                                 ");
        updateWrSqlOracle.append(
            "         )                                                                      ");
        updateWrSqlOracle.append(
            "    else                                                                            ");
        updateWrSqlOracle
            .append("        (SELECT min(wrRes.date_assigned) from (                           ");
        updateWrSqlOracle.append(
            "            select  wrtr.wr_id, min(wrtr.date_assigned)  date_assigned from wrtr   group by wrtr.wr_id ");
        updateWrSqlOracle.append("            union all ");
        updateWrSqlOracle.append(
            "            select  wrtt.wr_id, min(wrtt.date_assigned)  date_assigned from wrtt   group by wrtt.wr_id ");
        updateWrSqlOracle.append("            union all ");
        updateWrSqlOracle.append(
            "            select  wrtl.wr_id, min(wrtl.date_assigned)  date_assigned from wrtl   group by wrtl.wr_id ");
        updateWrSqlOracle.append("            union all ");
        updateWrSqlOracle.append(
            "            select  wrpt.wr_id, min(wrpt.date_assigned)  date_assigned from wrpt   group by wrpt.wr_id ");
        updateWrSqlOracle.append("            union all ");
        updateWrSqlOracle.append(
            "            select  wrcf.wr_id, min(wrcf.date_assigned)  date_assigned from wrcf   group by wrcf.wr_id ");
        updateWrSqlOracle.append(
            "            ) ${sql.as} wrRes  where wrRes.wr_id=wr.wr_id                                              ");
        updateWrSqlOracle.append(
            "         )                                                                          ");
        updateWrSqlOracle.append(
            "    end                                                                                                                                                                                                            ");
        updateWrSqlOracle
            .append(")  where  wr.prob_type IS NOT NULL AND wr.prob_type !='PREVENTIVE MAINT'   ");

        final DataSource wrUpdateDS = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "prob_type", "date_assigned", "date_requested" });
        if (!wrUpdateDS.isOracle()) {
            wrUpdateDS.addQuery(updateWrSql.toString());
        } else {
            wrUpdateDS.addQuery(updateWrSqlOracle.toString());

        }
        wrUpdateDS.executeUpdate();

        final StringBuilder updateWrTimeAssignedSql = new StringBuilder();
        updateWrTimeAssignedSql.append("update wr set wr.time_assigned=(");
        updateWrTimeAssignedSql.append(
            "    case when not exists( select  wrtr.time_assigned from wrtr where wrtr.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSql.append(
            "          and not exists( select  wrcf.time_assigned from wrcf where wrcf.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSql.append(
            "          and not exists( select  wrtl.time_assigned from wrtl where wrtl.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSql.append(
            "          and not exists( select  wrtt.time_assigned from wrtt where wrtt.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSql.append(
            "          and not exists( select  wrpt.time_assigned from wrpt where wrpt.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSql.append(
            "    then (                                                                      ");
        updateWrTimeAssignedSql.append(
            "            case when  wr.time_assigned is null                                 ");
        updateWrTimeAssignedSql.append(
            "            then wr.time_requested    else wr.time_assigned                     ");
        updateWrTimeAssignedSql.append(
            "            end                                                                 ");
        updateWrTimeAssignedSql.append(
            "         )                                                                      ");
        updateWrTimeAssignedSql.append(
            "    else                                                                            ");
        updateWrTimeAssignedSql
            .append("        (SELECT min(wrRes.minDATRASSIGNED) from (                           ");
        updateWrTimeAssignedSql.append(
            "            select min( wrtr.time_assigned ) ${sql.as} minDATRASSIGNED from wrtr where wrtr.wr_id=wr.wr_id and wrtr.date_assigned = wr.date_assigned and  exists( select  wrtr.time_assigned from wrtr where wrtr.wr_id=wr.wr_id and wrtr.date_assigned = wr.date_assigned)");
        updateWrTimeAssignedSql.append("            union all ");
        updateWrTimeAssignedSql.append(
            "            select min ( wrcf.time_assigned) ${sql.as} minDATRASSIGNED from wrcf where wrcf.wr_id=wr.wr_id and wrcf.date_assigned = wr.date_assigned and  exists( select  wrcf.time_assigned from wrcf where wrcf.wr_id=wr.wr_id and wrcf.date_assigned = wr.date_assigned)");
        updateWrTimeAssignedSql.append("            union all ");
        updateWrTimeAssignedSql.append(
            "            select min ( wrpt.time_assigned) ${sql.as} minDATRASSIGNED from wrpt where wrpt.wr_id=wr.wr_id and wrpt.date_assigned = wr.date_assigned and  exists( select  wrpt.time_assigned from wrpt where wrpt.wr_id=wr.wr_id and wrpt.date_assigned = wr.date_assigned)");
        updateWrTimeAssignedSql.append("            union all ");
        updateWrTimeAssignedSql.append(
            "            select min ( wrtt.time_assigned) ${sql.as} minDATRASSIGNED from wrtt where wrtt.wr_id=wr.wr_id and wrtt.date_assigned = wr.date_assigned and  exists( select  wrtt.time_assigned from wrtt where wrtt.wr_id=wr.wr_id and wrtt.date_assigned = wr.date_assigned)");
        updateWrTimeAssignedSql.append("            union all ");
        updateWrTimeAssignedSql.append(
            "            select min ( wrtl.time_assigned) ${sql.as} minDATRASSIGNED from wrtl where wrtl.wr_id=wr.wr_id and wrtl.date_assigned = wr.date_assigned and  exists( select  wrtl.time_assigned from wrtl where wrtl.wr_id=wr.wr_id and wrtl.date_assigned = wr.date_assigned)");
        updateWrTimeAssignedSql.append(
            "            ) ${sql.as} wrRes                                                       ");
        updateWrTimeAssignedSql.append(
            "         )                                                                          ");
        updateWrTimeAssignedSql.append(
            "    end                                                                                                                                                                                                            ");
        updateWrTimeAssignedSql
            .append(") where  wr.prob_type IS NOT NULL AND wr.prob_type !='PREVENTIVE MAINT'  ");

        final StringBuilder updateWrTimeAssignedSqlOracle = new StringBuilder();
        updateWrTimeAssignedSqlOracle.append("update wr set wr.time_assigned=(");
        updateWrTimeAssignedSqlOracle.append(
            "    case when not exists( select  wrtr.time_assigned from wrtr where wrtr.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSqlOracle.append(
            "          and not exists( select  wrcf.time_assigned from wrcf where wrcf.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSqlOracle.append(
            "          and not exists( select  wrtl.time_assigned from wrtl where wrtl.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSqlOracle.append(
            "          and not exists( select  wrtt.time_assigned from wrtt where wrtt.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSqlOracle.append(
            "          and not exists( select  wrpt.time_assigned from wrpt where wrpt.wr_id=wr.wr_id  )");
        updateWrTimeAssignedSqlOracle.append(
            "    then (                                                                      ");
        updateWrTimeAssignedSqlOracle.append(
            "            case when  wr.time_assigned is null                                 ");
        updateWrTimeAssignedSqlOracle.append(
            "            then wr.time_requested  else wr.time_assigned                       ");
        updateWrTimeAssignedSqlOracle.append(
            "            end                                                                 ");
        updateWrTimeAssignedSqlOracle.append(
            "         )                                                                      ");
        updateWrTimeAssignedSqlOracle.append(
            "    else                                                                            ");
        updateWrTimeAssignedSqlOracle
            .append("        (SELECT min(wrRes.time_assigned) from (                           ");
        updateWrTimeAssignedSqlOracle.append(
            "            select  wrtr.wr_id, wrtr.date_assigned, min(wrtr.time_assigned)  time_assigned from wrtr  group by wrtr.wr_id, wrtr.date_assigned");
        updateWrTimeAssignedSqlOracle.append("            union all ");
        updateWrTimeAssignedSqlOracle.append(
            "            select  wrtt.wr_id, wrtt.date_assigned, min(wrtt.time_assigned)  time_assigned from wrtt   group by wrtt.wr_id, wrtt.date_assigned ");
        updateWrTimeAssignedSqlOracle.append("            union all ");
        updateWrTimeAssignedSqlOracle.append(
            "            select  wrtl.wr_id, wrtl.date_assigned, min(wrtl.time_assigned)  time_assigned from wrtl  group by wrtl.wr_id, wrtl.date_assigned");
        updateWrTimeAssignedSqlOracle.append("            union all ");
        updateWrTimeAssignedSqlOracle.append(
            "            select  wrpt.wr_id, wrpt.date_assigned, min(wrpt.time_assigned)  time_assigned from wrpt group by wrpt.wr_id, wrpt.date_assigned ");
        updateWrTimeAssignedSqlOracle.append("            union all ");
        updateWrTimeAssignedSqlOracle.append(
            "            select  wrcf.wr_id, wrcf.date_assigned, min(wrcf.time_assigned)  time_assigned from wrcf group by wrcf.wr_id, wrcf.date_assigned ");
        updateWrTimeAssignedSqlOracle.append(
            "            ) ${sql.as} wrRes  where wrRes.wr_id=wr.wr_id and wrRes.date_assigned = wr.date_assigned                                             ");
        updateWrTimeAssignedSqlOracle.append(
            "         )                                                                          ");
        updateWrTimeAssignedSqlOracle.append(
            "    end                                                                                                                                                                                                            ");
        updateWrTimeAssignedSqlOracle
            .append(")  where  wr.prob_type IS NOT NULL AND wr.prob_type !='PREVENTIVE MAINT'   ");

        if (!wrUpdateDS.isOracle()) {
            wrUpdateDS.addQuery(updateWrTimeAssignedSql.toString());
        } else {
            wrUpdateDS.addQuery(updateWrTimeAssignedSqlOracle.toString());

        }
        wrUpdateDS.executeUpdate();

    }

    // ---------------------------------------------------------------------------------------------
    // END updateWrDateAssigned WFR
    // ---------------------------------------------------------------------------------------------

    /**
     *
     * Find work order from help request.
     *
     *
     * @param context Workflow rule execution context
     * @param activity_log_id Id of help request to create work request from
     * @return found work request code
     *
     */
    public int findWoIdFromActionItem(final EventHandlerContext context,
            final int activity_log_id) {
        int wo_id = 0;

        final DataSource activityLogDS = DataSourceFactory.createDataSourceForFields("activity_log",
            new String[] { "wo_id", "activity_log_id" });
        final DataRecord activityLogRec =
                activityLogDS.getRecord(" activity_log.activity_log_id=" + activity_log_id);
        if (activityLogRec != null) {
            wo_id = activityLogRec.getInt("activity_log.wo_id");
        }

        return wo_id;
    }

    /**
     *
     * Find work request from help request.
     *
     *
     * @param context Workflow rule execution context
     * @param activity_log_id Id of help request to create work request from
     * @return found work request code
     *
     */
    public int findWrIdFromActionItem(final EventHandlerContext context,
            final int activity_log_id) {
        int wr_id = 0;

        final DataSource wrDS = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "activity_log_id" });
        final DataRecord wrRec = wrDS.getRecord(" wr.activity_log_id=" + activity_log_id);
        if (wrRec != null) {
            wr_id = wrRec.getInt("wr.wr_id");
        }

        return wr_id;
    }

    // ---------------------------------------------------------------------------------------------
    // BEGIN Update Work Team Code by Supervisor
    // ---------------------------------------------------------------------------------------------
    /**
     *
     * INSERT the Work Team Code in the activity_log, wr, and wo tables if the assigned Supervisor
     * belongs to a work team
     *
     */
    private DataSource wrDS = null;

    private DataSource woDS = null;

    private DataSource activityLogDS = null;

    public void updateWorkTeamFromSupervisor() {
        // Prepare datasouce
        this.wrDS = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "supervisor", "work_team_id" });

        this.woDS = DataSourceFactory.createDataSourceForFields("wo",
            new String[] { "wo_id", "supervisor", "work_team_id" });

        this.activityLogDS = DataSourceFactory.createDataSourceForFields("activity_log",
            new String[] { "activity_log_id", "supervisor", "work_team_id" });

        // SQL Server JDBC driver requires either autoCommit=true, or SelectMethod=cursor
        // if multiple Statements are used within a single Connection
        // SelectMethod=cursor imposes severe performance penalty,
        // so we use autoCommit=true
        // if (this.wrDS.isSqlServer()) {
        // final EventHandlerContext eventHandlerContext =
        // ContextStore.get().getEventHandlerContext();
        // final DbConnection.ThreadSafe connection =
        // EventHandlerBase.getDbConnection(eventHandlerContext);
        // connection.setAutoCommit(true);
        // }

        // kb3032768 - only process supervisor do have work teams
        final String supervisorRes =
                "EXISTS (SELECT 1 FROM cf where cf.work_team_id IS NOT NULL AND email = (SELECT email FROM em WHERE em_id = supervisor))";

        final String workTeamRes =
                "(work_team_id IS NULL OR work_team_id NOT IN (SELECT cf.work_team_id FROM cf WHERE email = (SELECT email FROM em WHERE em_id = supervisor)))";

        // Query all data records matching condition from wrDS and handle each of them in an inner
        // class RecordHandler object
        this.wrDS.queryRecords(
            " wr.supervisor IS NOT NULL AND " + supervisorRes + " AND " + workTeamRes,
            new RecordHandler() {

                @Override
                public boolean handleRecord(final DataRecord wrRec) {
                    fillWorkTeamIdBySupervisor(wrRec, WorkRequestHandler.this.wrDS, "wr");
                    return true;
                }
            });

        // Query all data records matching condition from work order and handle each of them in an
        // inner
        // class RecordHandler object
        this.woDS.queryRecords(
            " wo.supervisor IS NOT NULL AND " + supervisorRes + " AND " + workTeamRes,
            new RecordHandler() {

                @Override
                public boolean handleRecord(final DataRecord woRec) {
                    fillWorkTeamIdBySupervisor(woRec, WorkRequestHandler.this.woDS, "wo");
                    return true;
                }
            });

        // Query all data records matching condition from wrDS and handle each of them in an inner
        // class RecordHandler object
        this.activityLogDS.queryRecords(
            " activity_log.supervisor IS NOT NULL AND " + supervisorRes + " AND " + workTeamRes,
            new RecordHandler() {

                @Override
                public boolean handleRecord(final DataRecord acRec) {
                    fillWorkTeamIdBySupervisor(acRec, WorkRequestHandler.this.activityLogDS,
                        "activity_log");
                    return true;
                }
            });
    }

    public void fillWorkTeamIdBySupervisor(final DataRecord rec, final DataSource ds,
            final String tableName) {
        final String supervisor = rec.getString(tableName + ".supervisor");
        // KB3016857 - Allow craftspersons to be members of more than one team only in Operation
        // console
        final String workTeamId = getWorkTeamFromSupervisor(supervisor);
        // If the supervisor has attached work_team_id, then fill it to work request
        if (StringUtil.notNullOrEmpty(workTeamId)) {
            rec.setValue(tableName + ".work_team_id", workTeamId);
            ds.saveRecord(rec);
        }
    }

    // ---------------------------------------------------------------------------------------------
    // END Update Work Team Code by Supervisor
    // ---------------------------------------------------------------------------------------------

    public boolean existsApprovedRequests() {
        final int approvedRequestCounts =
                DataStatistics.getInt("helpdesk_step_log", "step_log_id", "COUNT",
                    " (table_name='wr' OR table_name='hwr') AND (user_name =${sql.literal(user.name)} OR em_id =${sql.literal(user.employee.id)})"
                            + " AND helpdesk_step_log.step_type IN ('review','approval')");
        if (approvedRequestCounts > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Get priority label of work request.
     *
     * @param wrId work request id
     *
     */
    public String getPriorityLable(final int wrId) {
        String priorityLabel = "";

        ServiceLevelAgreement sla;
        try {
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

            sla = ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wrId);

            priorityLabel = sla.getPriorityLevel(sla.getPriority());
        } catch (final Exception e) {
            // do nothing
        }

        return priorityLabel;
    }

    public boolean isEstimateOrSchedulingCompleted(final String wrId, final String stepType) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        boolean isEstimateOrSchedulingCompleted = false;
        final ServiceLevelAgreement sla = ServiceLevelAgreement.getInstance(context, "wr", "wr_id",
            getIntegerValue(context, wrId).intValue());

        final int stepCounts = DataStatistics.getInt("helpdesk_sla_steps", "step_order", "COUNT",
            " activity_type = '" + sla.getActivity_type() + "' and ordering_seq = "
                    + sla.getOrdering_seq() + " and priority = " + sla.getPriority()
                    + " and step_type = '" + stepType + "'");
        if (stepCounts > 0) {
            final String currentUserName = ContextStore.get().getUser().getName();
            final String sql = "select 1 from helpdesk_step_log where "
                    + "helpdesk_step_log.table_name='wr' and helpdesk_step_log.date_response is not null and helpdesk_step_log.pkey_value="
                    + wrId + " and helpdesk_step_log.step_type='" + stepType
                    + "' and not exists(select 1 from wr_step_waiting where wr_step_waiting.user_name='"
                    + currentUserName + "' and wr_step_waiting.step_type='" + stepType
                    + "' and wr_step_waiting.wr_id=" + wrId + ")"
                    + " and exists(select 1 from wr where wr.status IN('A','AA')"
                    + "  and wr.wr_id=" + wrId + ")";
            final List<Object[]> records = selectDbRecords(context, sql.toString());

            if (records.size() > 0) {
                isEstimateOrSchedulingCompleted = true;
            }
        }

        return isEstimateOrSchedulingCompleted;
    }

    public boolean checkSchemaExisting(final String tableName, final String fieldName) {
        return this.schemaFieldExists(tableName, fieldName);
    }

    /**
     * Get current user role name.
     *
     * @return role name
     */
    public String getCurrentUserRoleName() {
        String roleName = "";
        final List<DataRecord> cfRecords = SqlUtils.executeQuery("cf",
            new String[] { "cf_id", "is_supervisor" },
            "SELECT cf_id,  is_supervisor FROM cf WHERE cf.email = ${sql.literal(user.email)}");

        if (cfRecords.size() > 0) {
            // if user e-mail is in the cf table and is_supervisor is 1, then the user is a
            // supervisor
            if (cfRecords.get(0).getInt("cf.is_supervisor") == 1) {
                roleName = "supervisor";
            } else {

                final List supervisorSubstituteRecords = SqlUtils.executeQuery(
                    "workflow_substitutes", new String[] { "substitute_em_id" },
                    "select workflow_substitutes.substitute_em_id from workflow_substitutes where workflow_substitutes.steptype_or_role='supervisor' AND workflow_substitutes.substitute_em_id=${sql.literal(user.employee.id)}"
                            + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable &lt;= ${sql.currentDate})"
                            + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable &gt;= ${sql.currentDate})");

                // if current user is supervisor substitute, then the role name is supervisor
                if (supervisorSubstituteRecords.size() > 0) {
                    roleName = "supervisor";
                } else {
                    // for the other case, then current user is a common craftsperson
                    roleName = "craftsperson";
                }
            }

        } else {
            final List supervisorSubstituteRecords = SqlUtils.executeQuery("workflow_substitutes",
                new String[] { "substitute_em_id" },
                "select workflow_substitutes.substitute_em_id from workflow_substitutes where workflow_substitutes.steptype_or_role='supervisor' AND workflow_substitutes.substitute_em_id=${sql.literal(user.employee.id)}"
                        + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable &lt;= ${sql.currentDate})"
                        + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable &gt;= ${sql.currentDate})");

            // if current user is supervisor substitute, then the role name is supervisor
            if (supervisorSubstituteRecords.size() > 0) {
                roleName = "supervisor";
            } else {
                final List cfSubstituteRecords = SqlUtils.executeQuery("workflow_substitutes",
                    new String[] { "substitute_em_id" },
                    "select workflow_substitutes.substitute_em_id from workflow_substitutes where workflow_substitutes.steptype_or_role='craftsperson' AND workflow_substitutes.substitute_em_id=${sql.literal(user.employee.id)}"
                            + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable &lt;= ${sql.currentDate})"
                            + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable &gt;= ${sql.currentDate})");
                if (cfSubstituteRecords.size() > 0) {
                    roleName = "craftsperson";
                } else {
                    roleName = "client";
                    final String emWorkflowSubstitutes = this.getWorkflowSubstitutes("em_id");
                    final List<DataRecord> waitingSteps =
                            SqlUtils.executeQuery("wr_step_waiting", new String[] { "step_type" },
                                "select step_type from wr_step_waiting where wr_step_waiting.user_name = ${sql.literal(user.name)} "
                                        + " OR wr_step_waiting.role_name = ${sql.literal(user.role)} "
                                        + " OR wr_step_waiting.em_id = ${sql.literal(user.employee.id)}"
                                        + " OR wr_step_waiting.em_id ${sql.concat} wr_step_waiting.step_type IN ("
                                        + emWorkflowSubstitutes + ")");
                    if (waitingSteps.size() > 0) {
                        final String stepType =
                                waitingSteps.get(0).getString("wr_step_waiting.step_type");
                        // If the user name is in wr_step_waiting, in the Response by User Name
                        // field or the Response by User Role field (new), for a Step Type of
                        // approval, then
                        // the user is an approver (Business Manager)
                        if ("approval".equals(stepType) || "review".equals(stepType)) {
                            roleName = "approver";
                        } else {
                            // If the user name is in wr_step_waiting, in the Response by User
                            // Name field or the Response by User Role field (new), for a Step Type
                            // other
                            // than approval, then the user is a step completer
                            roleName = "step completer";
                        }
                    }
                }
            }
        }

        return roleName;
    }

    /**
     * Check if step ended.
     *
     * @param steLogId
     * @return
     */
    public boolean isStepEnded(final String steLogId) {
        final int stepCounts = DataStatistics.getInt("wr_step_waiting", "step_log_id", "COUNT",
            " step_log_id = " + steLogId);
        if (stepCounts == 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Forward approval. forward by business mgr to someone else
     *
     *
     * @param record : work request to approval
     * @param comments : comments for the request
     * @param forwardTo : the approval manager
     */
    public void forwardApproval(final JSONObject record, final String comments,
            final String forwardTo) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);

        // fields of activity_log
        final Map values =
                stripPrefix(filterWithPrefix(fieldValues, Constants.WORK_REQUEST_TABLE + "."));

        final int wrId = getIntegerValue(context, values.get("wr_id")).intValue();
        final int stepLogId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();

        this.log.debug("Forward Approval for " + stepLogId + " to " + forwardTo);

        final StepManager stepmgr = new OnDemandWorkStepManager(context, wrId);
        stepmgr.forwardStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"), forwardTo);
    }

    /**
     * Update Priority Label of work request.
     *
     * @param wrId : work request code
     */
    private void updatePriorityLabelOfWorkRequest(final int wrId) {
        if (checkSchemaExisting("wr", "priority_label")) {
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wrId);
            final int orderingSeq = sla.getOrdering_seq();
            final int priority = sla.getPriority();

            String localName = null;

            // if there is a approver, use appover's local to get the localized priority_label value
            String whoseLocaleToUse = (String) selectDbValue(context, "wr_step_waiting",
                "user_name", "step_type IN ('review','approval') and wr_id = " + wrId);
            if (whoseLocaleToUse == null) {
                // if no appover, use requestor's locale to get the localized priority_label value
                whoseLocaleToUse =
                        (String) selectDbValue(context, "wr", "requestor", "wr_id = " + wrId);

                localName = (String) selectDbValue(context, "afm_users", "locale",
                    "email = (select email from em where em_id = "
                            + literal(context, whoseLocaleToUse) + ")");
            } else {
                // KB3047745 - get correct locale for step responder
                localName = (String) selectDbValue(context, "afm_users", "locale",
                    "user_name = " + literal(context, whoseLocaleToUse));
            }

            final String field_priority_label_localized =
                    getLocalizedPriorityLabelFieldName(localName);
            String priority_label_localized = (String) selectDbValue(context,
                "helpdesk_sla_response", field_priority_label_localized,
                "helpdesk_sla_response.activity_type='SERVICE DESK - MAINTENANCE' and helpdesk_sla_response.ordering_seq =  "
                        + orderingSeq + " and helpdesk_sla_response.priority =" + priority);
            if (priority_label_localized == null) {
                priority_label_localized =
                        (String) selectDbValue(context, "helpdesk_sla_response", "priority_label",
                            "helpdesk_sla_response.activity_type='SERVICE DESK - MAINTENANCE' and helpdesk_sla_response.ordering_seq =  "
                                    + orderingSeq + " and helpdesk_sla_response.priority ="
                                    + priority);
            }
            final String updateSql = "update wr set priority_label = "
                    + literal(context, priority_label_localized) + " where wr.wr_id = " + wrId;
            SqlUtils.executeUpdate("wr", updateSql);
        }
    }

    /**
     * Get localized field name of field helpdesk_sla_response.priority_label.
     *
     * @param Locale locale
     */
    private static String getLocalizedPriorityLabelFieldName(final String locale) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final ArchibusFieldDefBase.Immutable fieldDef = getParentContext(context).findProject()
            .loadTableDef("helpdesk_sla_response").getFieldDef("priority_label");

        String fieldName = "";
        if (locale != null) {
            fieldName = (String) fieldDef.getTranslatableFieldNames().get(locale);
        }

        if (StringUtil.notNull(fieldName).equals("")) {
            fieldName = "priority_label";
        }

        return fieldName;
    }

    /**
     * Edit request parameter.
     */
    public void editRequestParameters(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        final int wrId = getIntegerValue(context, values.get("wr_id")).intValue();
        final Object[] oldValuesObject = selectDbValues(context, "wr",
            new String[] { "status", "supervisor", "work_team_id" }, " wr_id = " + wrId);
        final String oldStatus = notNull(oldValuesObject[0]);
        final String oldSupervisor = notNull(oldValuesObject[1]);
        final String oldWorkTeamId = notNull(oldValuesObject[2]);
        // KB3048015 - It is not necessary to log a Change step in the log when the Approver makes a
        // change on the R status
        if (!"R".equals(oldStatus)) {

            final List changedFields = checkRequestChanged(context, Constants.WORK_REQUEST_TABLE,
                "wr_id", wrId, values);

            if (!changedFields.isEmpty()) {
                final String[] fields = { "priority", "site_id", "bl_id", "fl_id", "rm_id", "eq_id",
                        "prob_type", "pmp_id", "dv_id", "dp_id" };

                final Object[] oldRecord =
                        selectDbValues(context, "wr", fields, " wr_id = " + wrId);
                final Map oldValues = new HashMap();
                for (int i = 0; i < fields.length; i++) {
                    oldValues.put(fields[i], notNull(oldRecord[i]));
                }

                final String changeComments =
                        getRequestParametersChangeComments(changedFields, oldValues, values, true);

                // get sla from context
                final ServiceLevelAgreement oldSla = ServiceLevelAgreement.getInstance(context,
                    Constants.WORK_REQUEST_TABLE, "wr_id", wrId);

                values.put("escalated_completion", 0);
                values.put("escalated_response", 0);
                executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);

                final String updateSql =
                        "UPDATE wr set request_params_updated = 1 WHERE wr.wr_id = " + wrId;
                SqlUtils.executeUpdate("wr", updateSql);

                // check the enforce_new_workflow of the NEW SLA
                final boolean isEnforceNewWorkflow = this.isEnforceNewWorkflow(record);

                // load new SLA based on saved request parameters
                final ServiceLevelAgreement newSla = new ServiceLevelAgreement(context,
                    Constants.WORK_REQUEST_TABLE, "wr_id", wrId);

                if (isEnforceNewWorkflow) {

                    // update wrcf.status = Completed
                    SqlUtils.executeUpdate("wrcf",
                        "update wrcf set status = 'Complete' where wrcf.wr_id = " + wrId);

                    // delete any pending workflow steps
                    SqlUtils.executeUpdate("helpdesk_step_log",
                        "delete from helpdesk_step_log where helpdesk_step_log.date_response IS NULL AND helpdesk_step_log.pkey_value = "
                                + wrId);

                    // Update work request from new SLA
                    updateWorkRequestFromSLA(context, wrId);
                    updateWorkTeamFromSupervisor();
                    updateServiceRequestFromWorkRequestRecord(wrId);

                    // Create Change step
                    final Change step = new Change(context, Constants.ONDEMAND_ACTIVITY_ID, wrId,
                        changeComments);
                    // invoke the step to create helpdesk_step_log to note the change in step log
                    step.invoke();

                    // update the work request status to R
                    final OnDemandWorkStatusManager statusmgr =
                            new OnDemandWorkStatusManager(context, wrId);
                    statusmgr.updateStatus("R");
                } else {

                    // Update work request from new SLA
                    updateWorkRequestFromSLA(context, wrId);
                    updateWorkTeamFromSupervisor();
                    updateServiceRequestFromWorkRequestRecord(wrId);

                    // Create Change step
                    final Change step = new Change(context, Constants.ONDEMAND_ACTIVITY_ID, wrId,
                        changeComments);
                    // invoke the step to create helpdesk_step_log to note the change in step log
                    step.invoke();

                    if (oldStatus.equals("Rej")) {
                        this.changeStatusWhenEditRejRequest(wrId, newSla);

                    } else {
                        // if SLA changed and the new SLA contain different steps on current status
                        final boolean isStepDifferent = checkSlaSteps(oldSla, newSla, oldStatus);
                        if (isStepDifferent || ("A".equals(oldStatus) && newSla.isAutocreate_wo())
                                || ("AA".equals(oldStatus) && newSla.isAutoissue())) {
                            // Delete the current pending step
                            SqlUtils.executeUpdate("helpdesk_step_log",
                                "delete from helpdesk_step_log where helpdesk_step_log.date_response IS NULL AND helpdesk_step_log.pkey_value = "
                                        + wrId);

                            // KB3047653 - enforce_new_workflow = No: update the status using
                            // statusmgr.updateStatus(oldStatus) to make sure the auto-issue auto-wo
                            // of
                            // the new SLA work.
                            // update the work request status again to invoke the steps base on the
                            // new
                            // SLA( first update the status to R to make sure the
                            // statusmgr.updateStatus() work )
                            SqlUtils.executeUpdate("wr",
                                "update wr set status = 'R' where wr.wr_id = " + wrId);

                            final String actionStatus = StatusConverter.getActionStatus(oldStatus);
                            if (actionStatus != null) {
                                // update the activity_log status again to invoke the steps base on
                                // the
                                // new SLA( first update the status to Requested to make sure the
                                // statusmgr.updateStatus() work )
                                SqlUtils.executeUpdate("activity_log",
                                    "update activity_log set activity_log.status = 'REQUESTED' where exists(select 1 from wr where wr.activity_log_id = activity_log.activity_log_id and wr.wr_id = "
                                            + wrId + ")");
                            }

                            final OnDemandWorkStatusManager statusmgr =
                                    new OnDemandWorkStatusManager(context, wrId);
                            statusmgr.updateStatus(oldStatus);
                        }
                    }

                }

                // KB3047512 check dispatch values to avoid dispath missing when the work reuqest is
                // after issued and new SLA is not auto dispatch
                checkDispatch(wrId, oldSupervisor, oldWorkTeamId);

                // delete all wr_sync reords of current work request because they all out of sync
                // now, if not delete them, they will change back the old values
                SqlUtils.executeUpdate("wr_sync",
                    "delete from wr_sync where wr_sync.wr_id= " + wrId);

            } else {
                executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);
            }

        } else {
            executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);
        }

        syncWoBuildingCode(wrId);
    }

    /**
     * Change status when edit rejected work requests.
     */
    private void changeStatusWhenEditRejRequest(final int wrId,
            final ServiceLevelAgreement newSla) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String rejectedStep = notNull(
            selectDbValue(context, "wr_step_waiting", "rejected_step", "wr_id = " + wrId));
        final String rejectStatus = rejectedStep.split(";")[0];
        String status = rejectStatus;
        if ("A".equals(rejectStatus) || "AA".equals(rejectStatus)) {
            if (newSla.isAutoissue()) {
                status = "I";
            } else if (newSla.isAutocreate_wo()) {
                status = "AA";
            } else {
                status = rejectStatus;
            }
        }

        if ("I".equals(rejectStatus)) {
            if (newSla.isAutoissue()) {
                status = "I";
            } else {
                status = "AA";
            }
        }

        if ("Com".equals(rejectStatus)) {
            status = "I";
        }

        // Delete the current pending step
        SqlUtils.executeUpdate("helpdesk_step_log",
            "delete from helpdesk_step_log where helpdesk_step_log.date_response IS NULL AND helpdesk_step_log.pkey_value = "
                    + wrId);

        final OnDemandWorkStatusManager statusmgr = new OnDemandWorkStatusManager(context, wrId);
        statusmgr.updateStatus(status);

    }

    /**
     * Check SLA steps.
     */
    private boolean checkSlaSteps(final ServiceLevelAgreement oldSla,
            final ServiceLevelAgreement newSla, final String status) {
        boolean isStepDifferent = false;

        if ((oldSla.getOrdering_seq() != newSla.getOrdering_seq()
                || oldSla.getPriority() != newSla.getPriority())
                && !stepToString(oldSla, status).equals(stepToString(newSla, status))) {
            isStepDifferent = true;
        }

        return isStepDifferent;
    }

    /**
     * Check SLA steps.
     */
    private String stepToString(final ServiceLevelAgreement sla, final String status) {

        String stepString = "";
        final String[] stepFields = new String[] { "status", "step_order", "cf_id", "condition",
                "em_id", "multiple_required", "vn_id", "role_name", "role", "notify_responsible",
                "step_type" };

        final DataSource workflowStepsDataSource =
                DataSourceFactory.createDataSourceForFields("helpdesk_sla_steps", stepFields);
        final List<DataRecord> responseStepsRecordList =
                workflowStepsDataSource.getRecords("activity_type='" + sla.getActivity_type()
                        + "' and ordering_seq=" + sla.getOrdering_seq() + " and priority = "
                        + sla.getPriority() + " and status='" + status + "'");
        for (final DataRecord record : responseStepsRecordList) {
            for (final String field : stepFields) {
                if (record.getValue("helpdesk_sla_steps." + field) != null) {
                    stepString += record.getValue("helpdesk_sla_steps." + field);
                } else {
                    stepString += "NULL";
                }
            }
        }

        return stepString;

    }

    /**
     * Get Request parameters chasnged comments.
     */
    private String getRequestParametersChangeComments(final List changedFields, final Map oldValues,
            final Map values, final boolean prefixCurrentUser) {
        final String currentUser = ContextStore.get().getUser().getName();
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        String changeText = "";
        // @translatable
        final String localizedString_Changed = localizeString(context, "Changed");
        // @translatable
        final String localizedString_from = localizeString(context, "from");
        // @translatable
        final String localizedString_to = localizeString(context, "to");

        for (final Object fieldName : changedFields) {
            changeText +=
                    localizedString_Changed + " "
                            + getFieldMultiLineHeadingsAsString(context, "wr", notNull(fieldName),
                                " ")
                            + " " + localizedString_from + " " + oldValues.get(fieldName) + " "
                            + localizedString_to + " " + values.get(fieldName) + ";";
        }

        if (prefixCurrentUser) {
            changeText = currentUser + "::" + changeText;
        }

        return changeText;
    }

    /**
     * Is enforce new workflow.
     */
    public boolean isEnforceNewWorkflow(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));

        final Object eqStd =
                selectDbValue(context, "eq", "eq_std", "eq_id = '" + values.get("eq_id") + "'");
        values.put("eq_std", eqStd);

        final Object emStd =
                selectDbValue(context, "em", "em_std", "em_id = '" + values.get("requestor") + "'");
        values.put("em_std", emStd);

        // get the existing SLA on database values
        final ServiceLevelAgreement sla = new ServiceLevelAgreement(context, values);

        final String where = "activity_type = " + literal(context, sla.getActivity_type())
                + " AND ordering_seq =" + sla.getOrdering_seq() + " AND priority = "
                + sla.getPriority();

        final Object response =
                selectDbValue(context, Constants.SLA_RESPONSE_TABLE, "enforce_new_workflow", where);

        final boolean enforceNewWorkflow = getIntegerValue(context, response).intValue() > 0;

        return enforceNewWorkflow;
    }

    /**
     * Is Request parameter Change.
     */
    public boolean isRequestParameterChanged(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        final int wrId = getIntegerValue(context, values.get("wr_id")).intValue();
        final List changedFields =
                checkRequestChanged(context, Constants.WORK_REQUEST_TABLE, "wr_id", wrId, values);
        return !changedFields.isEmpty();
    }

    /**
     * Update work request from service request record.
     *
     * @param activityLogId activityLogId
     */
    private void updateServiceRequestFromWorkRequestRecord(final int wrId) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final String[] fields = { "activity_log_id", "wr_id", "site_id", "bl_id", "fl_id", "rm_id",
                "dv_id", "dp_id", "ac_id", "location", "eq_id", "prob_type", "priority",
                "description", "manager", "supervisor", "dispatcher", "work_team_id",
                "date_escalation_completion", "time_escalation_completion",
                "date_escalation_response", "time_escalation_response", "escalated_response",
                "escalated_completion" };

        final Object[] object =
                selectDbValues(context, Constants.WORK_REQUEST_TABLE, fields, "wr_id = " + wrId);
        if (object[0] != null && object[1] != null
                && getIntegerValue(context, object[0]).intValue() > 0
                && getIntegerValue(context, object[1]).intValue() > 0) {
            final Map values = new HashMap();
            for (int i = 0; i < fields.length; i++) {
                values.put(fields[i], object[i]);
            }

            // overwrite values with new values
            executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
            // executeDbCommit(context);
        }
    }

    /**
     * Check dispatch.
     *
     * @param wrId wrId
     */
    private void checkDispatch(final int wrId, final String oldSupervisor,
            final String oldWorkTeamId) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final boolean isWorkRequestOnly =
                getActivityParameterInt(context, "AbBldgOpsOnDemandWork", "WorkRequestsOnly") == 1
                        ? true : false;

        final Object[] values = selectDbValues(context, "wr",
            new String[] { "status", "supervisor", "work_team_id" }, " wr_id = " + wrId);
        final String status = notNull(values[0]);
        final Object supervisor = values[1];
        final Object workTeamId = values[2];

        // if the new SLA contain Dispatch step and status if after dispatch, keep the old
        // supervisor and old work_team_id
        if (supervisor == null && workTeamId == null) {
            if (isWorkRequestOnly) {
                if (!"R".equals(status) && !"A".equals(status) && !"AA".equals(status)) {
                    final Map newValues = new HashMap();
                    newValues.put("wr_id", wrId);
                    newValues.put("supervisor", oldSupervisor);
                    newValues.put("work_team_id", oldWorkTeamId);
                    executeDbSave(context, Constants.WORK_REQUEST_TABLE, newValues);
                }
            } else {
                if (!"R".equals(status) && !"A".equals(status)) {
                    final Map newValues = new HashMap();
                    newValues.put("wr_id", wrId);
                    newValues.put("supervisor", oldSupervisor);
                    newValues.put("work_team_id", oldWorkTeamId);
                    executeDbSave(context, Constants.WORK_REQUEST_TABLE, newValues);
                }
            }
        } else {
            if ("R".equals(status)) {
                final Map newValues = new HashMap();
                newValues.put("wr_id", wrId);
                newValues.put("supervisor", "");
                newValues.put("work_team_id", "");
                executeDbSave(context, Constants.WORK_REQUEST_TABLE, newValues);
            }
        }

        syncDispatchValues(wrId);
    }

    /**
     * Sync diapatch values.
     */
    public void syncDispatchValues(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object[] values = selectDbValues(context, "wr",
            new String[] { "status", "supervisor", "work_team_id" }, " wr_id = " + wrId);
        notNull(values[0]);
        final Object supervisor = values[1];
        final Object workTeamId = values[2];

        String superRes = " 1=1 ";
        if (supervisor == null && workTeamId == null) {
            superRes = "(wr.supervisor IS NOT NULL OR wr.work_team_id IS NOT NULL)";
        } else if (supervisor == null && workTeamId != null) {
            superRes =
                    "(wr.supervisor IS NOT NULL OR wr.work_team_id IS NULL OR wr.work_team_id !='"
                            + workTeamId + "')";
        } else if (supervisor != null && workTeamId == null) {
            superRes = "(wr.work_team_id IS NOT NULL OR wr.supervisor IS NULL OR wr.supervisor !='"
                    + supervisor + "')";
        } else if (supervisor != null && workTeamId != null) {
            superRes = "(wr.work_team_id IS NULL OR wr.work_team_id  !='" + workTeamId
                    + "' OR wr.supervisor IS NULL OR wr.supervisor !='" + supervisor + "')";
        }

        // update wo reords if only work request contain in this work order
        SqlUtils.executeUpdate("wo",
            "update wo set wo.supervisor = (select wr.supervisor from wr where wr.wr_id=" + wrId
                    + "), wo.work_team_id = (select wr.work_team_id from wr where wr.wr_id=" + wrId
                    + ") where exists(select 1 from wr where wr.wo_id = wo.wo_id and wr.wr_id = "
                    + wrId
                    + ") and not exists(select 1 from wr where wr.wo_id = wo.wo_id and wr.wr_id !="
                    + wrId + " and " + superRes + ")");

        // update activity_log reords if only work request contain in this work order
        SqlUtils.executeUpdate("activity_log",
            "update activity_log set activity_log.supervisor = (select wr.supervisor from wr where wr.wr_id="
                    + wrId
                    + "), activity_log.work_team_id = (select wr.work_team_id from wr where wr.wr_id="
                    + wrId
                    + ") where exists(select 1 from wr where wr.activity_log_id = activity_log.activity_log_id and wr.wr_id="
                    + wrId + ")");
    }

    /**
     * Sync building value.
     */
    private void syncWoBuildingCode(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object[] values =
                selectDbValues(context, "wr", new String[] { "bl_id" }, " wr_id = " + wrId);
        final String blId = notNull(values[0]);
        final String blrRes = " wr.bl_id != '" + blId + "'";
        // update wo reords if only work request contain in this work order
        SqlUtils.executeUpdate("wo",
            "update wo set wo.bl_id = (select wr.bl_id from wr where wr.wr_id=" + wrId
                    + ") where exists(select 1 from wr where wr.wo_id = wo.wo_id and wr.wr_id = "
                    + wrId
                    + ") and not exists(select 1 from wr where wr.wo_id = wo.wo_id and wr.wr_id !="
                    + wrId + " and " + blrRes + ")");
    }

    /**
     * Get Reject Return To Options.
     */
    public void getRejectReturnToOptions(final int wrId) {
        final JSONArray optionArray = getRejectReturnToOptionsArray(wrId);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("jsonExpression", optionArray.toString());
    }

    /**
     * Get Reject Return To Options.
     */
    public JSONArray getRejectReturnToOptionsArray(final int wrId) {
        final DataSource wrDS = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "status" });
        wrDS.addRestriction(Restrictions.eq("wr", "wr_id", wrId));
        final DataRecord wrRecord = wrDS.getRecord();
        final String wrStatus = wrRecord.getString("wr.status");

        final DataSource stepLogDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_step_log", new String[] { "pkey_value", "field_name", "user_name",
                    "step_type", "status", "step_order", "step_log_id" });
        stepLogDS.addRestriction(Restrictions.isNotNull("helpdesk_step_log", "time_response"))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId + ""))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId + ""))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "field_name", "wr_id"))
            .addRestriction(Restrictions.ne("helpdesk_step_log", "status", "Rej"))
            .addRestriction(Restrictions.ne("helpdesk_step_log", "user_name",
                ContextStore.get().getConfigManager()
                    .getAttribute("descendant::preferences/core/@userId")))
            .addRestriction(Restrictions
                .sql("helpdesk_step_log.step_type IN('basic','estimation','scheduling','review')"));

        stepLogDS.addSort("helpdesk_step_log", "step_log_id", DataSource.SORT_ASC);

        final DataSource stepWaitingDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_step_log", new String[] { "pkey_value", "step_log_id", "step_order" });
        stepWaitingDS.addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId))
            .addRestriction(Restrictions.isNull("helpdesk_step_log", "date_response"));
        final DataRecord currentStep = stepWaitingDS.getRecord();
        if (wrStatus != null && currentStep != null) {
            final int stepOrder = currentStep.getInt("helpdesk_step_log.step_order");
            if ("R".equals(wrStatus)) {
                stepLogDS.addRestriction(Restrictions.sql(
                    "helpdesk_step_log.status ='R' AND helpdesk_step_log.step_order<" + stepOrder));
            } else if ("A".equals(wrStatus)) {
                stepLogDS.addRestriction(Restrictions.sql(
                    "(helpdesk_step_log.status ='R' or (helpdesk_step_log.status ='A' and helpdesk_step_log.step_order<"
                            + stepOrder + "))"));
            } else if ("AA".equals(wrStatus)) {
                stepLogDS.addRestriction(Restrictions.sql(
                    "(helpdesk_step_log.status IN ('R','A') or (helpdesk_step_log.status ='AA' and helpdesk_step_log.step_order<"
                            + stepOrder + "))"));
            } else if ("I".equals(wrStatus)) {
                stepLogDS.addRestriction(Restrictions.sql(
                    "(helpdesk_step_log.status IN ('R','A','AA') or (helpdesk_step_log.status ='I' and helpdesk_step_log.step_order<"
                            + stepOrder + "))"));
            } else if ("Com".equals(wrStatus)) {
                stepLogDS.addRestriction(Restrictions.sql(
                    "(helpdesk_step_log.status IN ('R','A','AA','I') or (helpdesk_step_log.status ='Com' and helpdesk_step_log.step_order<"
                            + stepOrder + "))"));
            }

        }

        final List<DataRecord> optionRecords = stepLogDS.getRecords();
        JSONArray optionArray = new JSONArray();
        for (final DataRecord optionRecord : optionRecords) {
            if ("basic".equals(optionRecord.getString("helpdesk_step_log.step_type"))
                    && "R".equals(optionRecord.getString("helpdesk_step_log.status"))) {
                final JSONObject option = new JSONObject();
                option.put("role", "requestor");
                option.put("user_name", optionRecord.getString("helpdesk_step_log.user_name"));
                option.put("rejected_step", "R");
                optionArray.put(option);
                break;
            }
        }

        if ("R".equals(wrStatus)) {
            for (final DataRecord optionRecord : optionRecords) {
                if ("review".equals(optionRecord.getString("helpdesk_step_log.step_type"))) {
                    final JSONObject option = new JSONObject();
                    option.put("role", "approver");
                    setUserNameForReturnWorkflowStep(option, optionRecord);
                    option.put("rejected_step", optionRecord.getString("helpdesk_step_log.status")
                            + ";" + optionRecord.getInt("helpdesk_step_log.step_order"));
                    optionArray.put(option);
                }
            }
        }

        for (final DataRecord optionRecord : optionRecords) {
            if ("estimation".equals(optionRecord.getString("helpdesk_step_log.step_type"))
                    && "A".equals(optionRecord.getString("helpdesk_step_log.status"))) {
                final JSONObject option = new JSONObject();
                option.put("role", "estimator");
                setUserNameForReturnWorkflowStep(option, optionRecord);
                option.put("rejected_step", optionRecord.getString("helpdesk_step_log.status") + ";"
                        + optionRecord.getInt("helpdesk_step_log.step_order"));
                optionArray.put(option);
            }

            if ("scheduling".equals(optionRecord.getString("helpdesk_step_log.step_type"))
                    && "A".equals(optionRecord.getString("helpdesk_step_log.status"))) {
                final JSONObject option = new JSONObject();
                option.put("role", "scheduler");
                setUserNameForReturnWorkflowStep(option, optionRecord);
                option.put("rejected_step", optionRecord.getString("helpdesk_step_log.status") + ";"
                        + optionRecord.getInt("helpdesk_step_log.step_order"));
                optionArray.put(option);
            }
        }

        for (final DataRecord optionRecord : optionRecords) {
            if ("estimation".equals(optionRecord.getString("helpdesk_step_log.step_type"))
                    && "AA".equals(optionRecord.getString("helpdesk_step_log.status"))) {
                final JSONObject option = new JSONObject();
                option.put("role", "estimator");
                setUserNameForReturnWorkflowStep(option, optionRecord);
                option.put("rejected_step", optionRecord.getString("helpdesk_step_log.status") + ";"
                        + optionRecord.getInt("helpdesk_step_log.step_order"));
                optionArray.put(option);
            }

            if ("scheduling".equals(optionRecord.getString("helpdesk_step_log.step_type"))
                    && "AA".equals(optionRecord.getString("helpdesk_step_log.status"))) {
                final JSONObject option = new JSONObject();
                option.put("role", "scheduler");
                setUserNameForReturnWorkflowStep(option, optionRecord);
                option.put("rejected_step", optionRecord.getString("helpdesk_step_log.status") + ";"
                        + optionRecord.getInt("helpdesk_step_log.step_order"));
                optionArray.put(option);
            }
        }

        if ("I".equals(wrStatus) || "Com".equals(wrStatus)) {
            for (final DataRecord optionRecord : optionRecords) {
                if ("basic".equals(optionRecord.getString("helpdesk_step_log.step_type"))
                        && "I".equals(optionRecord.getString("helpdesk_step_log.status"))) {
                    final JSONObject option = new JSONObject();
                    option.put("role", "issuer");
                    option.put("user_name", optionRecord.getString("helpdesk_step_log.user_name"));
                    option.put("rejected_step", "I");
                    optionArray.put(option);
                    break;
                }
            }

            if ("Com".equals(wrStatus)) {
                for (final DataRecord optionRecord : optionRecords) {
                    if ("basic".equals(optionRecord.getString("helpdesk_step_log.step_type"))
                            && "Com".equals(optionRecord.getString("helpdesk_step_log.status"))) {
                        final JSONObject option = new JSONObject();
                        option.put("role", "completer");
                        option.put("user_name",
                            optionRecord.getString("helpdesk_step_log.user_name"));
                        option.put("rejected_step", "Com");
                        optionArray.put(option);
                        break;
                    }
                }
            }
        }

        optionArray = remveDuplicateRejectToOptions(optionArray);
        return optionArray;
    }

    /**
     * Get Dispatch Reject Return To Options.
     */
    public void getDispatchRejectReturnToOptions(final int wrId) {
        final DataSource stepLogDS = DataSourceFactory
            .createDataSourceForFields("helpdesk_step_log", new String[] { "pkey_value",
                    "field_name", "user_name", "step_type", "status", "step_order" });
        stepLogDS.addRestriction(Restrictions.isNotNull("helpdesk_step_log", "time_response"))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId + ""))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId + ""))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "field_name", "wr_id"))
            .addRestriction(Restrictions.sql("helpdesk_step_log.step_type IN('basic','review')"))
            .addRestriction(Restrictions.sql("helpdesk_step_log.status ='R'"));

        final List<DataRecord> optionRecords = stepLogDS.getRecords();
        JSONArray optionArray = new JSONArray();
        for (final DataRecord optionRecord : optionRecords) {
            if ("basic".equals(optionRecord.getString("helpdesk_step_log.step_type"))) {
                final JSONObject option = new JSONObject();
                option.put("role", "requestor");
                option.put("user_name", optionRecord.getString("helpdesk_step_log.user_name"));
                option.put("rejected_step", "R");
                optionArray.put(option);
                break;
            }
        }

        for (final DataRecord optionRecord : optionRecords) {
            if ("review".equals(optionRecord.getString("helpdesk_step_log.step_type"))) {
                final JSONObject option = new JSONObject();
                option.put("role", "approver");
                setUserNameForReturnWorkflowStep(option, optionRecord);
                option.put("rejected_step", optionRecord.getString("helpdesk_step_log.status") + ";"
                        + optionRecord.getInt("helpdesk_step_log.step_order"));
                optionArray.put(option);
            }
        }

        optionArray = remveDuplicateRejectToOptions(optionArray);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("jsonExpression", optionArray.toString());
    }

    /**
     * Remove duplicate reject to options.
     *
     * @param optionArray option JSON array
     */
    private JSONArray remveDuplicateRejectToOptions(final JSONArray optionArray) {
        final HashSet<String> optionSet = new HashSet<String>();
        final JSONArray newOptionArray = new JSONArray();
        for (int i = 0; i < optionArray.length(); i++) {
            final JSONObject option = optionArray.getJSONObject(i);
            final String key = option.getString("role") + option.getString("user_name")
                    + option.getString("rejected_step");
            if (!optionSet.contains(key)) {
                optionSet.add(key);
                newOptionArray.put(option);
            }
        }

        return newOptionArray;
    }

    /**
     * Reject work request to previous step.
     *
     * @param wrRecord work request reocrd
     * @param rejectedStep rejected step
     */
    public void rejectWorkRequestToPreviousStep(final JSONObject wrRecord,
            final String rejectedStep, final String responseUser) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, wrRecord);

        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final int wrId = getIntegerValue(context, fieldValues.get("wr.wr_id")).intValue();
        final String comments = (String) fieldValues.get("wr_step_waiting.comments");
        rejectStep(context, wrId, stepId, comments);

        final DataSource stepLogDS =
                DataSourceFactory.createDataSourceForFields("helpdesk_step_log",
                    new String[] { "pkey_value", "field_name", "user_name", "step_type", "status",
                            "step_order", "rejected_step", "step_log_id", "date_response",
                            "time_response", "step_status_result", "step", "role_name", "em_id" });
        stepLogDS.addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId + ""))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "field_name", "wr_id"))
            .addRestriction(Restrictions
                .sql("helpdesk_step_log.step_type IN('basic','estimation','scheduling','review')"))
            .addSort("helpdesk_step_log", "step_log_id", DataSource.SORT_DESC);

        if (rejectedStep.indexOf(";") != -1) {
            final String stepOrder = rejectedStep.split(";")[1];
            final String status = rejectedStep.split(";")[0];
            final DataRecord stepRecord = getStepRecord(wrId, status, Integer.valueOf(stepOrder));
            final String stepType = stepRecord.getString("helpdesk_sla_steps.step_type");
            // invoke this step again (update status back to make sure stepmgr.getStep() work, after
            // the step invoke, change the status back to Rej )
            SqlUtils.executeUpdate("helpdesk_step_log",
                "update wr set status='" + status + "'" + " where wr_id=" + wrId);
            final OnDemandWorkStepManager stepmgr = new OnDemandWorkStepManager(context, wrId);
            stepmgr.setStepOrder(Integer.valueOf(stepOrder));
            final Step step = stepmgr.getStep();
            if (step != null) {
                step.invoke();
                SqlUtils.executeUpdate("helpdesk_step_log",
                    "update wr set status='Rej' where wr_id=" + wrId);
                String rejectedStepName = "";
                String stepResult = "";
                if ("estimation".equals(stepType)) {
                    rejectedStepName = "Estimation - Rejected";
                    stepResult = "estimated";
                } else if ("scheduling".equals(stepType)) {
                    rejectedStepName = "Scheduling - Rejected";
                    stepResult = "scheduled";
                } else if ("review".equals(stepType)) {
                    rejectedStepName = "Edit and Approve - Rejected";
                    stepResult = "approved";
                }

                if (StringUtil.notNullOrEmpty(rejectedStepName)) {

                    SqlUtils.executeUpdate("helpdesk_step_log",
                        "update helpdesk_step_log set helpdesk_step_log.status='Rej', helpdesk_step_log.step='"
                                + rejectedStepName + "'"
                                + ", helpdesk_step_log.step_status_result='" + stepResult
                                + "', helpdesk_step_log.rejected_step='" + rejectedStep + "' "
                                + "where helpdesk_step_log.date_response is null and helpdesk_step_log.field_name='wr_id' and helpdesk_step_log.pkey_value="
                                + wrId);
                }
            }

        } else {
            final List<DataRecord> rejectedRecords =
                    stepLogDS.getRecords("helpdesk_step_log.status = 'Rej'");
            final DataRecord rejectedRecord = rejectedRecords.get(0);
            rejectedRecord.setValue("helpdesk_step_log.rejected_step", rejectedStep);
            rejectedRecord.setValue("helpdesk_step_log.date_response", null);
            rejectedRecord.setValue("helpdesk_step_log.time_response", null);
            rejectedRecord.setValue("helpdesk_step_log.user_name", responseUser);
            if (responseUser != null) {
                final String emId = notNull(selectDbValue(context, "em", "em_id",
                    "em.email  =  (select afm_users.email from afm_users where afm_users.user_name='"
                            + responseUser + "')"));
                if (!"".equals(emId)) {
                    // save em_id to support supervisor Substitutes
                    rejectedRecord.setValue("helpdesk_step_log.em_id", emId);
                }

            }

            stepLogDS.saveRecord(rejectedRecord);
            if ("R".equals(rejectedStep)) {
                final Map values = new HashMap();
                values.put("wr_id", wrId);
                values.put("supervisor", "");
                values.put("work_team_id", "");
                // remove the dispatch value if reject to requestor
                executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);
                syncDispatchValues(wrId);
            }
        }
    }

    /**
     * End all basic steps.
     *
     * @param wrId work request code
     */
    private void endBasicSteps(final int wrId) {
        SqlUtils.executeUpdate("helpdesk_step_log",
            "update helpdesk_step_log set date_response = ${sql.currentDate}, time_response = ${sql.currentTime} "
                    + "where helpdesk_step_log.date_response is null and helpdesk_step_log.step_type='basic' and helpdesk_step_log.field_name='wr_id' and helpdesk_step_log.pkey_value="
                    + wrId);
    }

    /**
     * Get related work requests.
     */
    public void getRelatedWorkRequests(final int wrId) {
        final DataSource wrDS = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "parent_wr_id" });
        final DataSource hwrDS = DataSourceFactory.createDataSourceForFields("hwr",
            new String[] { "wr_id", "parent_wr_id" });
        wrDS.addRestriction(Restrictions.eq("wr", "parent_wr_id", wrId));
        hwrDS.addRestriction(Restrictions.eq("hwr", "parent_wr_id", wrId));
        final List<DataRecord> relatedWorkRequests = wrDS.getRecords();
        final List<DataRecord> h_relatedWorkRequests = hwrDS.getRecords();

        final JSONArray relatedWorkRequestsArray = new JSONArray();
        for (final DataRecord relatedRequest : relatedWorkRequests) {
            relatedWorkRequestsArray.put(relatedRequest.getInt("wr.wr_id"));
        }
        for (final DataRecord relatedRequest : h_relatedWorkRequests) {
            relatedWorkRequestsArray.put(relatedRequest.getInt("hwr.wr_id"));
        }

        wrDS.clearRestrictions();
        wrDS.addRestriction(Restrictions.eq("wr", "wr_id", wrId));
        hwrDS.clearRestrictions();
        hwrDS.addRestriction(Restrictions.eq("hwr", "wr_id", wrId));
        final DataRecord curentWorkRequest = wrDS.getRecord();
        final DataRecord h_curentWorkRequest = hwrDS.getRecord();
        if (curentWorkRequest != null && curentWorkRequest.getInt("wr.parent_wr_id") != 0) {
            relatedWorkRequestsArray.put(curentWorkRequest.getInt("wr.parent_wr_id"));
        }
        if (h_curentWorkRequest != null && h_curentWorkRequest.getInt("hwr.parent_wr_id") != 0) {
            relatedWorkRequestsArray.put(h_curentWorkRequest.getInt("hwr.parent_wr_id"));
        }

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("jsonExpression", relatedWorkRequestsArray.toString());
    }

    /**
     * Save parent work request.
     */
    public void saveParentWorkRequest(final int wrId, final int parentWrId) {
        final Map values = new HashMap();
        values.put("wr_id", wrId);
        values.put("parent_wr_id", parentWrId);

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);
        // executeDbCommit(context);
    }

    /**
     * Check cf change work reuqest value.
     */
    public boolean checCfChangeWorkRequest() {

        return DataStatistics.getInt("cf", "cf_id", "count", "cf.cf_change_wr = 1 and cf.email ='"
                + ContextStore.get().getUser().getEmail() + "'") > 0;
    }

    /**
     * Get Return options for mobile.
     */
    public void getReturnOptionsForMobile(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("jsonExpression",
            getReturnOptionsArrayForMobile(wrId).toString());
    }

    /**
     * Get Return options for mobile array.
     */
    public JSONArray getReturnOptionsArrayForMobile(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object statusObject = selectDbValue(context, "wr", "status", "wr_id = " + wrId);
        final JSONArray statusAndStepArray = new JSONArray();
        if (statusObject != null) {
            final String currentStatus = notNull(statusObject);
            final boolean isRequestStatusHavingOptionalSteps =
                    isRequestStatusHavingOptionalSteps(wrId);
            String[] previousStatusArray = {};
            if (isRequestStatusHavingOptionalSteps) {
                if ("AA".equals(currentStatus)) {
                    previousStatusArray = new String[] { "R", "AA", "Rej" };
                } else if ("I".equals(currentStatus)) {
                    previousStatusArray = new String[] { "R", "AA", "Rej", "I" };
                } else if ("HA".equals(currentStatus)) {
                    previousStatusArray = new String[] { "R", "AA", "Rej", "I" };
                } else if ("HP".equals(currentStatus)) {
                    previousStatusArray = new String[] { "R", "AA", "Rej", "I" };
                } else if ("HL".equals(currentStatus)) {
                    previousStatusArray = new String[] { "R", "AA", "Rej", "I" };
                } else if ("Com".equals(currentStatus)) {
                    previousStatusArray = new String[] { "R", "AA", "Rej", "I", "Com" };
                }
            } else {
                if ("AA".equals(currentStatus)) {
                    previousStatusArray = new String[] { "AA", "Rej" };
                } else if ("I".equals(currentStatus)) {
                    previousStatusArray = new String[] { "AA", "Rej", "I" };
                } else if ("HA".equals(currentStatus)) {
                    previousStatusArray = new String[] { "AA", "Rej", "I" };
                } else if ("HP".equals(currentStatus)) {
                    previousStatusArray = new String[] { "AA", "Rej", "I" };
                } else if ("HL".equals(currentStatus)) {
                    previousStatusArray = new String[] { "AA", "Rej", "I" };
                } else if ("Com".equals(currentStatus)) {
                    previousStatusArray = new String[] { "AA", "Rej", "I", "Com" };
                }
            }

            for (final String status : previousStatusArray) {

                final JSONArray stepArrayByStatus = getReturnWorkflowStepsArray(wrId, status);
                if (status.equals(currentStatus) && stepArrayByStatus.length() == 0) {
                    // do not add option if current status not having steps
                } else {
                    final JSONObject step = new JSONObject();
                    step.put("status", status);
                    step.put("step", "");
                    step.put("user_name", "");
                    step.put("step_order", 0);
                    statusAndStepArray.put(step);

                    for (int i = 0; i < stepArrayByStatus.length(); i++) {
                        statusAndStepArray.put(stepArrayByStatus.getJSONObject(i));
                    }
                }

            }

        }

        return statusAndStepArray;
    }

    /**
     * Get Return workflow steps Reject Return To Options.
     */
    public void getReturnWorkflowSteps(final int wrId, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("jsonExpression",
            getReturnWorkflowStepsArray(wrId, status).toString());
    }

    /**
     * Get Return workflow steps array.
     */
    private JSONArray getReturnWorkflowStepsArray(final int wrId, final String status) {
        JSONArray workflowStepArray = new JSONArray();
        if (!"Rej".equals(status)) {
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            final Object statusObject = selectDbValue(context, "wr", "status", "wr_id = " + wrId);
            String currentStatus = null;
            if (statusObject != null) {
                currentStatus = notNull(statusObject);
            }

            final DataSource stepLogDS = DataSourceFactory
                .createDataSourceForFields("helpdesk_step_log", new String[] { "pkey_value",
                        "field_name", "user_name", "step_type", "status", "step", "step_order" });
            stepLogDS.addTable("afm_wf_steps", DataSource.ROLE_STANDARD);
            stepLogDS.addField("afm_wf_steps", "step");
            stepLogDS.addRestriction(Restrictions.isNotNull("helpdesk_step_log", "time_response"))
                .addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId + ""))
                .addRestriction(Restrictions.eq("helpdesk_step_log", "field_name", "wr_id"))
                .addRestriction(Restrictions.sql(
                    "helpdesk_step_log.step_type IN('approval','review','scheduling','estimation','dispatch')"))
                .addRestriction(Restrictions.eq("helpdesk_step_log", "status", status))
                .addSort("step_order");

            if (currentStatus != null && currentStatus.equals(status)) {
                final int latestStepOrder =
                        DataStatistics.getIntWithoutVpa("helpdesk_step_log", "step_order", "MAX",
                            "helpdesk_step_log.date_response is null and helpdesk_step_log.pkey_value="
                                    + wrId);
                if (latestStepOrder > 0) {
                    stepLogDS.addRestriction(
                        Restrictions.lt("helpdesk_step_log", "step_order", latestStepOrder));
                }
            }

            final List<DataRecord> workflowStepsRecords = stepLogDS.getRecords();
            for (final DataRecord stepRecord : workflowStepsRecords) {
                final JSONObject step = new JSONObject();
                step.put("status", status);
                step.put("step", stepRecord.getString("afm_wf_steps.step"));
                setUserNameForReturnWorkflowStep(step, stepRecord);
                step.put("step_order", stepRecord.getInt("helpdesk_step_log.step_order"));
                workflowStepArray.put(step);
            }
        }

        workflowStepArray = remveDuplicateReturnWorkflowSteps(workflowStepArray);
        return workflowStepArray;
    }

    /**
     * Set user name for return workflow step.
     */
    private void setUserNameForReturnWorkflowStep(final JSONObject step,
            final DataRecord stepLogRecord) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wrId = stepLogRecord.getInt("helpdesk_step_log.pkey_value");
        // get the SLA
        final ServiceLevelAgreement sla = ServiceLevelAgreement.getInstance(context,
            Constants.WORK_REQUEST_TABLE, "wr_id", wrId);

        final DataSource stepDS = DataSourceFactory.createDataSourceForFields("helpdesk_sla_steps",
            new String[] { "role_name", "priority", "user_name", "step_type", "status", "step",
                    "em_id", "cf_id", "vn_id", "step_order", "activity_id", "activity_type",
                    "ordering_seq", "role" });
        stepDS
            .addRestriction(Restrictions.eq("helpdesk_sla_steps", "activity_id",
                Constants.ONDEMAND_ACTIVITY_ID))
            .addRestriction(
                Restrictions.eq("helpdesk_sla_steps", "activity_type", Constants.ON_DEMAND_WORK))
            .addRestriction(Restrictions.eq("helpdesk_sla_steps", "status",
                stepLogRecord.getString("helpdesk_step_log.status")))
            .addRestriction(
                Restrictions.eq("helpdesk_sla_steps", "ordering_seq", sla.getOrdering_seq()))
            .addRestriction(Restrictions.eq("helpdesk_sla_steps", "priority", sla.getPriority()))
            .addRestriction(Restrictions.eq("helpdesk_sla_steps", "step_order",
                stepLogRecord.getInt("helpdesk_step_log.step_order")));

        final DataRecord stepRecord = stepDS.getRecord();
        if (stepRecord != null && stepRecord.getString("helpdesk_sla_steps.role_name") != null) {
            step.put("user_name", stepRecord.getString("helpdesk_sla_steps.role_name"));
        } else if (stepRecord != null && stepRecord.getString("helpdesk_sla_steps.role") != null) {
            step.put("user_name", stepRecord.getString("helpdesk_sla_steps.role"));
        } else if (stepRecord != null && stepRecord.getString("helpdesk_sla_steps.em_id") != null) {
            step.put("user_name", stepRecord.getString("helpdesk_sla_steps.em_id"));
        } else if (stepRecord != null && stepRecord.getString("helpdesk_sla_steps.cf_id") != null) {
            step.put("user_name", stepRecord.getString("helpdesk_sla_steps.cf_id"));
        } else if (stepRecord != null && stepRecord.getString("helpdesk_sla_steps.vn_id") != null) {
            step.put("user_name", stepRecord.getString("helpdesk_sla_steps.vn_id"));
        } else {
            step.put("user_name", stepLogRecord.getString("helpdesk_step_log.user_name"));
        }
    }

    /**
     * Remove duplicate return workflow steps.
     *
     * @param workflowStepArray option JSON array
     */
    private JSONArray remveDuplicateReturnWorkflowSteps(final JSONArray workflowStepArray) {
        final HashSet<String> workflowStep = new HashSet<String>();
        final JSONArray newWorkflowStepArray = new JSONArray();
        for (int i = 0; i < workflowStepArray.length(); i++) {
            final JSONObject option = workflowStepArray.getJSONObject(i);
            final String key = option.getString("step") + option.getString("user_name")
                    + option.getInt("step_order");
            if (!workflowStep.contains(key)) {
                workflowStep.add(key);
                newWorkflowStepArray.put(option);
            }
        }

        return newWorkflowStepArray;
    }

    /**
     * Return work request from supervisor base on current step.
     */
    public void returnWorkRequestFromSupervisorBaseOnCurrentStep(final int wrId,
            final String comments) {
        final DataSource stepLogDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_step_log", new String[] { "pkey_value", "field_name", "user_name",
                    "step_type", "status", "step", "step_log_id", "step_order" });
        stepLogDS.addRestriction(Restrictions.isNotNull("helpdesk_step_log", "time_response"))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId + ""))
            .addRestriction(Restrictions.eq("helpdesk_step_log", "field_name", "wr_id"))
            .addSort("helpdesk_step_log", "step_log_id", DataSource.SORT_DESC);

        final List<DataRecord> stepLogRecords = stepLogDS.getRecords();
        if (stepLogRecords.size() > 0) {
            final DataRecord previousStep = stepLogRecords.get(0);
            returnWorkRequestFromSupervisor(wrId,
                previousStep.getString("helpdesk_step_log.status"),
                previousStep.getInt("helpdesk_step_log.step_order"), comments);
        }

    }

    /**
     * Return work request from craftsperson.
     */
    public void returnWorkRequestsFromCf(final JSONArray records) {
        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {
                final JSONObject rec = records.getJSONObject(i);
                final int wrId = rec.getInt("wr.wr_id");
                final String cfComment = rec.getString("wr.cf_comments");
                returnWorkRequestFromCf(wrId, cfComment);
            }

        }
    }

    /**
     * Return work request from craftsperson.
     */
    public void returnWorkRequestFromCf(final int wrId, final String comments) {
        final DataSource cfDS = DataSourceFactory.createDataSourceForFields("cf",
            new String[] { "cf_id", "email" });
        cfDS.addRestriction(Restrictions.sql("email= '"
                + SqlUtils.makeLiteralOrBlank(ContextStore.get().getUser().getEmail()) + "'"));

        final DataRecord cfRecord = cfDS.getRecord();
        if (cfRecord != null) {
            final String cfId = cfRecord.getString("cf.cf_id");
            final DataSource wrcfDS =
                    DataSourceFactory.createDataSourceForFields("wrcf", new String[] { "cf_id",
                            "wr_id", "date_assigned", "time_assigned", "comments", "status" });

            wrcfDS.addRestriction(Restrictions.sql("wrcf.status = 'Active' and wrcf.wr_id = " + wrId
                    + " and (wrcf.cf_id = '" + SqlUtils.makeLiteralOrBlank(cfId)
                    + "' or wrcf.cf_id IN ( select workflow_substitutes.cf_id from workflow_substitutes where (workflow_substitutes.start_date_unavailable IS NULL"
                    + " OR workflow_substitutes.start_date_unavailable &lt;= ${sql.currentDate}) "
                    + " AND (workflow_substitutes.end_date_unavailable IS NULL "
                    + " OR workflow_substitutes.end_date_unavailable &gt;= ${sql.currentDate}) "
                    + "and steptype_or_role = 'craftsperson' and  workflow_substitutes.substitute_cf_id = '"
                    + SqlUtils.makeLiteralOrBlank(cfId) + "')) "));
            wrcfDS.addSort("wrcf", "date_assigned", DataSource.SORT_DESC);
            wrcfDS.addSort("wrcf", "time_assigned", DataSource.SORT_DESC);

            final List<DataRecord> wrcfRecords = wrcfDS.getRecords();

            for (final DataRecord wrcfRecord : wrcfRecords) {
                wrcfRecord.setValue("wrcf.comments", comments);
                wrcfRecord.setValue("wrcf.status", "Returned");
                wrcfDS.saveRecord(wrcfRecord);
            }

            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wrId);

            if (sla.isNotifyServiceProvider() && wrcfRecords.size() > 0) {
                notifySupervisorForCfReturn(wrcfRecords.get(0));
            }

            // Update work request status based on wrcf records status
            this.updateWrStatusFromWrcf(wrId);

        }
    }

    /**
     * Return work request from supervisor.
     */
    public void returnWorkRequestFromSupervisor(final int wrId, final String status,
            final int stepOrder, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        final Object[] oldValuesObject =
                selectDbValues(context, "wr", new String[] { "status" }, " wr_id = " + wrId);
        final String oldStatus = notNull(oldValuesObject[0]);

        // Delete the current pending step
        SqlUtils.executeUpdate("helpdesk_step_log",
            "delete from helpdesk_step_log where helpdesk_step_log.date_response IS NULL AND helpdesk_step_log.pkey_value = "
                    + wrId);

        // Create Return step
        final Return returnStep =
                new Return(context, Constants.ONDEMAND_ACTIVITY_ID, wrId, comments);
        // invoke the step to create helpdesk_step_log to note the return in step log
        returnStep.invoke();

        // update the status of activity_log(KB3048364)
        final Object activityLogObject =
                selectDbValue(context, "wr", "activity_log_id", "wr_id = " + wrId);
        if (activityLogObject != null) {
            String actionStatus = StatusConverter.getActionStatus(status);
            if ("AA".equals(status)) {
                actionStatus = "APPROVED";
            }

            if (actionStatus != null) {
                final Map values = new HashMap();
                values.put("activity_log_id", getIntegerValue(context, activityLogObject));
                values.put("status", actionStatus);
                executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
            }
        }

        // update the status
        final Map values = new HashMap();
        values.put("wr_id", wrId);
        values.put("status", status);
        values.put("step_status", Constants.STEP_STATUS_NULL);

        if ("Rej".equals(status) || "R".equals(status)) {
            values.put("supervisor", "");
            values.put("work_team_id", "");
        }

        final DataSource stepLogDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_step_log",
            new String[] { "pkey_value", "field_name", "user_name", "step_type", "status",
                    "activity_id", "role_name", "multiple_required", "step_order", "rejected_step",
                    "step_log_id", "date_response", "table_name", "condition", "step_code",
                    "rejected_step", "date_response", "time_response", "step_status_result", "step",
                    "em_id", "vn_id", "cf_id", "date_created", "time_created" });

        if (stepOrder == 0) {
            final DataRecord newStep = stepLogDS.createNewRecord();
            newStep.setValue("helpdesk_step_log.activity_id", Constants.ONDEMAND_ACTIVITY_ID);
            newStep.setValue("helpdesk_step_log.table_name", Constants.WORK_REQUEST_TABLE);
            newStep.setValue("helpdesk_step_log.field_name", "wr_id");
            newStep.setValue("helpdesk_step_log.pkey_value", wrId);
            newStep.setValue("helpdesk_step_log.step_order", stepOrder);
            newStep.setValue("helpdesk_step_log.step_type", "basic");
            newStep.setValue("helpdesk_step_log.step", "Basic");
            newStep.setValue("helpdesk_step_log.status", status);

            if (!"Rej".equals(status)) {
                newStep.setValue("helpdesk_step_log.user_name",
                    ContextStore.get().getUser().getName());
                newStep.setValue("helpdesk_step_log.date_response", Utility.currentDate());
                newStep.setValue("helpdesk_step_log.time_response", Utility.currentTime());
            } else {
                newStep.setValue("helpdesk_step_log.user_name", getRequestorUserName(wrId));
                newStep.setValue("helpdesk_step_log.rejected_step", "R");
                // update step_stauts to waiting
                values.put("step_status", Constants.STEP_STATUS_WAITING);
            }

            newStep.setValue("helpdesk_step_log.step_code", Common.generateUUID());
            newStep.setValue("helpdesk_step_log.date_created", Utility.currentDate());
            newStep.setValue("helpdesk_step_log.time_created", Utility.currentTime());
            stepLogDS.saveRecord(newStep);
            // update the work request status and step_status
            executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);
            // invoke this step again
            if (!oldStatus.equals(status)) {
                final OnDemandWorkStepManager stepmgr = new OnDemandWorkStepManager(context, wrId);
                stepmgr.notifyRequestor();
            }

        } else {
            final DataRecord stepRecord = getStepRecord(wrId, status, stepOrder);
            if (stepRecord != null) {
                if ("dispatch".equals(stepRecord.getString("helpdesk_sla_steps.step_type"))) {
                    values.put("supervisor", "");
                    values.put("work_team_id", "");
                }

                // update the work request status and step_status
                executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);

                // invoke this step again
                final OnDemandWorkStepManager stepmgr = new OnDemandWorkStepManager(context, wrId);
                if (!oldStatus.equals(status)) {
                    stepmgr.notifyRequestor();
                }
                stepmgr.setStepOrder(stepOrder);
                final Step step = stepmgr.getStep();
                if (step != null) {
                    step.invoke();
                }

            }

        }

        syncDispatchValues(wrId);
        // KB#3050988 Part inventory is not updated by parts added after estimation step
        if (!oldStatus.equals(status)) {
            if ("Com".equals(oldStatus)) {
                backOutInventory(context, wrId);
            }
        }
    }

    /**
     * Get requestor user name of the work request.
     */
    private String getRequestorUserName(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object requestorObject = selectDbValue(context, "wr", "requestor", "wr_id = " + wrId);
        final String requestor = notNull(requestorObject);
        final String userName = notNull(selectDbValue(context, "afm_users", "user_name",
            "email = (select email from em where em_id = " + literal(context, requestor) + ")"));
        return userName;

    }

    /**
     * get step record.
     */
    private DataRecord getStepRecord(final int wrId, final String status, final int stepOrder) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // get the SLA
        final ServiceLevelAgreement sla = ServiceLevelAgreement.getInstance(context,
            Constants.WORK_REQUEST_TABLE, "wr_id", wrId);

        final DataSource stepDS =
                DataSourceFactory
                    .createDataSourceForFields("helpdesk_sla_steps",
                        new String[] { "role_name", "priority", "user_name", "step_type", "status",
                                "step", "step_order", "activity_id", "activity_type",
                                "ordering_seq" });
        stepDS
            .addRestriction(Restrictions.eq("helpdesk_sla_steps", "activity_id",
                Constants.ONDEMAND_ACTIVITY_ID))
            .addRestriction(
                Restrictions.eq("helpdesk_sla_steps", "activity_type", Constants.ON_DEMAND_WORK))
            .addRestriction(Restrictions.eq("helpdesk_sla_steps", "status", status))
            .addRestriction(
                Restrictions.eq("helpdesk_sla_steps", "ordering_seq", sla.getOrdering_seq()))
            .addRestriction(Restrictions.eq("helpdesk_sla_steps", "priority", sla.getPriority()))
            .addRestriction(Restrictions.eq("helpdesk_sla_steps", "step_order", stepOrder));

        return stepDS.getRecord();
    }

    /**
     * Check cf change work reuqest value.
     */
    public boolean isRequestStatusHavingOptionalSteps(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // get the current SLA
        final ServiceLevelAgreement currentSla = ServiceLevelAgreement.getInstance(context,
            Constants.WORK_REQUEST_TABLE, "wr_id", wrId);
        String requestor = "";
        final Object requestorObject = selectDbValue(context, "wr", "requestor", "wr_id = " + wrId);
        if (requestorObject != null) {
            requestor = notNull(requestorObject);
        }

        return DataStatistics.getInt(Constants.SLA_STEPS_TABLE, "step", "count",
            "status ='R' and activity_id='" + Constants.ONDEMAND_ACTIVITY_ID + "'"
                    + " and priority=" + currentSla.getPriority() + " and ordering_seq = "
                    + currentSla.getOrdering_seq() + " and (em_id is null or em_id !="
                    + literal(context, requestor) + ")") > 0;
    }

    /**
     * Get site code base on the building code.
     */
    public String getSiteCodeBasedOnBlCode(final String blId) {
        String site = "";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object siteObject = selectDbValue(context, "bl", "site_id", "bl_id = '" + blId + "'");
        if (site != null) {
            site = notNull(siteObject);
        }

        return site;
    }

    public boolean checkExistingWo(final JSONArray records) {
        boolean existingWo = false;
        if (records.length() > 0) {
            String restriction = "";
            for (int i = 0; i < records.length(); i++) {
                final JSONObject rec = records.getJSONObject(i);
                final int wrId = rec.getInt("wr.wr_id");
                if (i != records.length() - 1) {
                    restriction += wrId + ",";
                } else {
                    restriction += wrId;

                }
            }

            existingWo = DataStatistics.getInt(Constants.WORK_REQUEST_TABLE, "wr_id", "count",
                "wr.wo_id IS NOT NULL AND wr.wr_id IN(" + restriction + ")") > 0;
        }

        return existingWo;
    }

    /**
     * Create new wrcf record when reissue work reuest in verification step. In 21.3, this returns
     * the request back to the Issued status, and any craftspersons who were assigned to the request
     * will see the request back in their queue. With the introduction of the WRCF.status field,
     * those craftspersons would no longer see the request back in their queue because the
     * WRCF.status would be set to Complete. To overcome this, when a Verifier returns a request as
     * incomplete, the system will create a new WRCF record for the craftsperson who is associated
     * with the Completed status of the work request
     *
     * @param wrId work request code
     */
    public void createNewWrcfForReissueRequest(final int wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID, "UseBldgOpsConsole")
            .intValue() > 0) {
            final DataSource stepLogDS = DataSourceFactory.createDataSourceForFields(
                "helpdesk_step_log", new String[] { "pkey_value", "field_name", "user_name",
                        "step_type", "status", "step_order", "step_log_id" });
            stepLogDS.addSort("helpdesk_step_log", "step_log_id", DataSource.SORT_DESC);
            stepLogDS.addRestriction(Restrictions.isNotNull("helpdesk_step_log", "user_name"))
                .addRestriction(Restrictions.eq("helpdesk_step_log", "pkey_value", wrId + ""))
                .addRestriction(Restrictions.eq("helpdesk_step_log", "status", "Com"))
                .addRestriction(Restrictions.eq("helpdesk_step_log", "step_type", "basic"));

            final DataRecord stepLogRecord = stepLogDS.getRecord();
            if (stepLogRecord != null) {
                final DataSource cfDS = DataSourceFactory.createDataSourceForFields("cf",
                    new String[] { "cf_id", "email" });
                cfDS.addRestriction(
                    Restrictions
                        .sql("email= (select email from afm_users where user_name = '"
                                + SqlUtils.makeLiteralOrBlank(
                                    stepLogRecord.getString("helpdesk_step_log.user_name"))
                            + "')"));

                final DataRecord cfRecord = cfDS.getRecord();
                if (cfRecord != null) {
                    final DataSource wrcfDS = DataSourceFactory.createDataSourceForFields("wrcf",
                        new String[] { "cf_id", "wr_id", "date_assigned", "time_assigned" });
                    final DataRecord wrcfRecord = wrcfDS.createNewRecord();
                    wrcfRecord.setValue("wrcf.cf_id", cfRecord.getValue("cf.cf_id"));
                    wrcfRecord.setValue("wrcf.wr_id", wrId);
                    wrcfRecord.setValue("wrcf.date_assigned",
                        Common.currentLocalDate(null, null, null, null));
                    wrcfRecord.setValue("wrcf.time_assigned",
                        Common.currentLocalTime(null, null, null, null));
                    wrcfDS.saveRecord(wrcfRecord);

                }
            }
        }
    }

    /**
     * Forward issued work request
     *
     * @param wrId work request code
     */
    public void forwardIssuedWorkRequests(final JSONArray wrIdList, final String supervisor,
            final String workTeam, final String comments) {
        if (wrIdList.length() > 0) {
            for (int i = 0; i < wrIdList.length(); i++) {
                forwardIssuedWorkRequest(wrIdList.getInt(i), supervisor, workTeam, comments);
            }
        }
    }

    /**
     * Forward issued work request
     *
     * @param wrId work request code
     */
    private void forwardIssuedWorkRequest(final int wrId, final String supervisor,
            final String workTeam, final String comments) {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        // Update work reqeust status to AA
        final Map values = new HashMap();
        values.put("wr_id", wrId);
        values.put("status", "AA");
        executeDbSave(context, Constants.WORK_REQUEST_TABLE, values);

        // create a new helpdesk_steo_log record to show basic status change, because the return
        // from cf action will now deviate from its SLA base on the spec
        final DataSource stepLogDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_step_log",
            new String[] { "pkey_value", "field_name", "user_name", "step_type", "status",
                    "activity_id", "role_name", "multiple_required", "step_order", "rejected_step",
                    "step_log_id", "date_response", "table_name", "condition", "step_code",
                    "rejected_step", "date_response", "time_response", "step_status_result", "step",
                    "em_id", "vn_id", "cf_id", "date_created", "time_created" });
        final DataRecord newStep = stepLogDS.createNewRecord();
        newStep.setValue("helpdesk_step_log.activity_id", Constants.ONDEMAND_ACTIVITY_ID);
        newStep.setValue("helpdesk_step_log.table_name", Constants.WORK_REQUEST_TABLE);
        newStep.setValue("helpdesk_step_log.field_name", "wr_id");
        newStep.setValue("helpdesk_step_log.pkey_value", wrId);
        newStep.setValue("helpdesk_step_log.step_order", 0);
        newStep.setValue("helpdesk_step_log.step_type", "basic");
        newStep.setValue("helpdesk_step_log.step", "Basic");
        newStep.setValue("helpdesk_step_log.status", "AA");
        newStep.setValue("helpdesk_step_log.user_name", ContextStore.get().getUser().getName());
        newStep.setValue("helpdesk_step_log.date_response", Utility.currentDate());
        newStep.setValue("helpdesk_step_log.time_response", Utility.currentTime());
        newStep.setValue("helpdesk_step_log.step_code", Common.generateUUID());
        newStep.setValue("helpdesk_step_log.date_created", Utility.currentDate());
        newStep.setValue("helpdesk_step_log.time_created", Utility.currentTime());
        stepLogDS.saveRecord(newStep);

        final DataSource wrDS = DataSourceFactory.createDataSourceForFields("wr",
            new String[] { "wr_id", "activity_log_id" });
        final DataRecord wrRecord = wrDS.getRecord("wr.wr_id=" + wrId);
        final int activityLogId = wrRecord.getInt("wr.activity_log_id");

        final JSONObject forwardJson = new JSONObject();
        forwardJson.put("forwardComments", comments);

        new RequestHandler().updateRequest(activityLogId + "", "0", "0", "0", supervisor, "0",
            workTeam, forwardJson);

        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wrId);
        if (sla.isAutoissue()) {
            final OnDemandWorkStatusManager statusmgr =
                    new OnDemandWorkStatusManager(context, wrId);
            statusmgr.updateStatus("I");
        }
    }

    /**
     * Check if part associate location.
     *
     * @return
     */
    public boolean checkPtAssociateLocation() {
        return DataStatistics.getInt("pt", "part_id", "COUNT") > 0
                && DataStatistics.getInt("pt_store_loc_pt", "part_id", "COUNT") == 0;
    }

    /**
     * Check if craftsperson associate work teams.
     *
     * @return
     */
    public boolean checkCfAssociateTeams() {
        return DataStatistics.getInt("cf", "cf_id", "COUNT", "cf.work_team_id IS NOT NULL") > 0
                && DataStatistics.getInt("cf_work_team", "cf_id", "COUNT") == 0;
    }

}
