package com.archibus.eventhandler.sla;

import java.text.*;
import java.util.*;

import org.dom4j.*;
import org.json.*;

import com.archibus.app.common.util.SchemaUtils;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.db.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.ext.report.ReportUtility;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.schema.*;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.*;

/**
 * 
 * Handles all workflow rules concerning Service Level Agreements.
 * 
 * @see ServiceLevelAgreement
 */
public class ServiceLevelAgreementHandler extends HelpdeskEventHandlerBase {
    
    /**
     * 
     * Check for conflicts (blocks) between SLA rules.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>ordering seq: SLA ordering sequence</li>
     * <li>activity_type: SLA activity type or XML record for select SLA rule including the activity
     * type</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with conflict information<br />
     * <code>{conflict: ? , ordseq : ?, conflict2 : ?, ord2 : ?, old_ord : ?}</code>
     * <ul>
     * <li>conflict : boolean, true if more general rule with higher ordering sequence found</li>
     * <li>ordseq : ordering sequence of conflicting rule</li>
     * <li>conflict2 : boolean, true if more specific rule with lower ordering sequence found</li>
     * <li>ord2 : ordering sequence of conflicting rule for conflict2</li>
     * <li>old_ord : ordering sequence from input</li>
     * </ul>
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Check if the activity_type is an XML record and parse if so</li>
     * <li>Search for more general rules with a higher ordering sequence</li>
     * <li>Search for more specific rules with a lower ordering sequence</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> (Examples for SLA with activity_type = 'SERVICE DESK - MAINTENANCE' and
     * site_id='MARKET'
     * <ul>
     * <li>More general rules are rules with less request parameters filled in:<br />
     * SELECT activity_type, ordering_seq FROM helpdesk_sla_request <br />
     * WHERE 0=0 AND (activity_type = 'SERVICE DESK - MAINTENANCE' OR activity_type IS NULL)<br />
     * AND (site_id = 'MARKET' OR site_id IS NULL)<br />
     * AND bl_id IS NULL <br />
     * AND ... IS NULL (<i>for all other request parameters</i>) <br />
     * ORDER BY ordering_seq</li>
     * <li>More specific rules are rules with more request parameters filled in:<br />
     * SELECT activity_type, ordering_seq FROM helpdesk_sla_request<br />
     * WHERE 0=0 AND (activity_type = 'SERVICE DESK - MAINTENANCE' AND site_id = 'MARKET'<br />
     * AND NOT (bl_id IS NULL AND ... IS NULL) (<i>... IS NULL for all other request parameters</i>)
     * <br />
     * ORDER BY ordering_seq DESC</li>
     * </ul>
     * </p>
     * 
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     * @param EventHandlerContext context
     * @param String activityType
     * @param int ordering_seq
     */
    public boolean checkConflicts(final EventHandlerContext context, final String activityType,
            final int match_ordering_seq) {
        
        String match_ordering_seq_field = getMatchOrderingSeqField();
        
        
        // search for more general rules with a higher ordering_seq
        final Object[] sla_record =
                selectDbValues(context, Constants.SLA_REQUEST_TABLE, Constants.SLA_REQUEST_FIELDS,
                    "activity_type = " + literal(context, activityType) + " AND " + match_ordering_seq_field + " = "
                            + match_ordering_seq);
        
        String sql =
                "SELECT " + match_ordering_seq_field + " FROM " + Constants.SLA_REQUEST_TABLE
                        + " WHERE activity_type = " + literal(context, activityType);
        for (int i = 0; i < Constants.SLA_REQUEST_FIELDS.length; i++) {
            if (!Constants.SLA_REQUEST_FIELDS.equals("activity_type")) {
                if (sla_record[i] != null) {
                    final String parameter = notNull(sla_record[i]);
                    sql +=
                            " AND (" + Constants.SLA_REQUEST_FIELDS[i] + " = "
                                    + literal(context, parameter) + " OR "
                                    + Constants.SLA_REQUEST_FIELDS[i] + " IS NULL) ";
                } else {
                    sql += " AND " + Constants.SLA_REQUEST_FIELDS[i] + " IS NULL";
                }
            }
        }
        sql += " ORDER BY "+ match_ordering_seq_field;
        
        final List records = selectDbRecords(context, sql);
        final JSONObject results = new JSONObject();
        results.put("activity_type", activityType);
        
        if (records.size() > 0) {
            final Iterator it = records.iterator();
            while (it.hasNext()) {
                final Object[] rec = (Object[]) it.next();
                
                final Integer ordseq = getIntegerValue(context, rec[0]);
                
                if (ordseq.intValue() > match_ordering_seq) {
                    return true;
                }
            }
        }
        // search for more specific rules with a lower ordering_seq
        String sql_ =
                "SELECT "+ match_ordering_seq_field +" FROM " + Constants.SLA_REQUEST_TABLE
                        + " WHERE activity_type = " + literal(context, activityType);
        String not = null;
        for (int i = 0; i < Constants.SLA_REQUEST_FIELDS.length; i++) {
            if (!Constants.SLA_REQUEST_FIELDS.equals("activity_type")) {
                if (sla_record[i] != null) {
                    final String parameter = notNull(sla_record[i]);
                    sql_ +=
                            " AND " + Constants.SLA_REQUEST_FIELDS[i] + " = "
                                    + literal(context, parameter);
                } else {
                    if (not == null) {
                        not = Constants.SLA_REQUEST_FIELDS[i] + " IS NULL ";
                    } else {
                        not += " AND " + Constants.SLA_REQUEST_FIELDS[i] + " IS NULL";
                    }
                }
            }
        }
        if (not == null) {
            sql_ += " ORDER BY "+ match_ordering_seq_field +" DESC";
        } else {
            sql_ += " AND NOT(" + not + ") ORDER BY "+ match_ordering_seq_field +" DESC";
        }
        
        final List recs = selectDbRecords(context, sql_);
        if (!recs.isEmpty()) {
            final Iterator its = recs.iterator();
            while (its.hasNext()) {
                final Object[] rec = (Object[]) its.next();
                
                final Integer ordseq = getIntegerValue(context, rec[0]);
                if (ordseq.intValue() < match_ordering_seq) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 
     * Copy rule to create new rules with same template.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray with JSONObject of SLA rule to copy</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with activitytype and ordering sequence of new rule<br />
     * <code>{activity_type : ?, ordering_seq : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Create new record in <code>helpdesk_sla_request</code> with ordering sequence higher than
     * all other rules with the same activitytype</li>
     * <li>Create records in <code>helpdesk_sla_response</code> for every priority level</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void copyRule(final EventHandlerContext context) {
        final JSONArray records = context.getJSONArray("records");
        
        final JSONObject record = records.getJSONObject(0);
        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        
        final Integer ordering_seq = getIntegerValue(context, values.get("ordering_seq"));
        final String activity_type = notNull(values.get("activity_type"));
        
        // get max order sequence for this request type
        final List recs =
                selectDbRecords(context,
                    "SELECT max(ordering_seq) FROM " + Constants.SLA_REQUEST_TABLE
                            + " WHERE activity_type = " + literal(context, activity_type));
        
        if (recs.size() == 0) {
            return;
        }
        
        final Object[] rec = (Object[]) recs.get(0);
        int new_ordering_seq = getIntegerValue(context, rec[0]).intValue();
        // increase max order for new order value
        new_ordering_seq++;
        
        String sql =
                "INSERT INTO " + Constants.SLA_REQUEST_TABLE + " (ordering_seq, "
                        + Constants.SQL_SLA_REQUEST_FIELDS + ") " + " SELECT " + new_ordering_seq
                        + "," + Constants.SQL_SLA_REQUEST_FIELDS + " FROM "
                        + Constants.SLA_REQUEST_TABLE + " WHERE activity_type = "
                        + literal(context, activity_type) + " AND ordering_seq = " + ordering_seq;
        
        executeDbSql(context, sql, false);
        
        // make copy of every priority level
        sql =
                " INSERT INTO " + Constants.SLA_RESPONSE_TABLE
                        + " (activity_type,ordering_seq,priority,"
                        + Constants.SQL_SLA_PARAMETER_NAMES + ") " + " SELECT activity_type,"
                        + new_ordering_seq + ",priority," + Constants.SQL_SLA_PARAMETER_NAMES
                        + " FROM " + Constants.SLA_RESPONSE_TABLE + " WHERE activity_type = "
                        + literal(context, activity_type) + " AND ordering_seq = " + ordering_seq;
        
        executeDbSql(context, sql, false);
        
        final JSONObject result = new JSONObject();
        result.put("activity_type", activity_type);
        result.put("ordering_seq", new_ordering_seq);
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * 
     * Delete SLA rules.
     * 
     * <p>
     * Delete rules from the database. This will cascade all other dependent records, not the
     * <code>helpdesk_step_log</code> records.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray with JSONObjects for records to delete</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Convert each JSONObject to a map</li>
     * <li>Get primary key values from the record</li>
     * <li>Delete corresponding records from <code>helpdesk_sla_steps</code> and
     * <code>helpdesk_sla_response</code></li>
     * <li>Delete record from <code>helpdesk_sla_request</code></li>
     * </ol>
     * </p>
     * 
     * @param JSONArray records
     */
    public void deleteRules(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                final String activity_type = (String) values.get("activity_type");
                final Integer ordering = (Integer) values.get("ordering_seq");
                
                deleteSlaRule(context, activity_type, ordering.intValue());
            }
            
        }
    }
    
    /**
     * 
     * Determine priority of a request based on a date (and time) required.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSONObject which includes the form values submitted</li>
     * <li>ord_seq : SLA ordering sequence</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with possible (0 or 1) and priority<br />
     * <code>{possible : <i>0 or 1 </i>, priority : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Convert the JSON record value into Map type</li>
     * <li>Check date_required with current date</li>
     * <li>Get different priority levels (responses) from the database</li>
     * <li>Calculate escalation dates for response and completion for each priority level</li>
     * <li>Compare results and select best matching priority (smallest difference between escalation
     * date and date required)</li>
     * </ol>
     * </p>
     * <p>
     * 
     * </p>
     * 
     * @param JSONObject record
     * @param String ord_seq
     */
    public void determinePriority(final JSONObject record, final String ord_seq) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        final Map<String, String> blSiteMap =
                Common.getSiteBuildingIds("activity_log", "activity_log_id",
                    notNull(values.get("activity_log_id")));
        
        final Calendar now = new GregorianCalendar();
        final Calendar required = new GregorianCalendar();
        required.setTime((Date) values.get("date_required"));
        
        final JSONObject results = new JSONObject();
        
        // execute only if date requested is today or later
        if (required.after(now)
                || (required.get(Calendar.YEAR) == now.get(Calendar.YEAR)
                        && required.get(Calendar.MONTH) == now.get(Calendar.MONTH) && required
                    .get(Calendar.DATE) == now.get(Calendar.DATE))) {
            results.put("possible", 1);
            
            // get ordering sequence from context
            // int ordering_sequence = context.getInt("ord_seq");
            final int ordering_sequence = Integer.parseInt(ord_seq.trim());
            final String activity_type = (String) values.get("activity_type");
            // get different priorities of SLA rule
            final String where =
                    "ordering_seq = " + ordering_sequence + " AND activity_type = "
                            + literal(context, activity_type) + " AND priority IS NOT NULL";
            final String[] fields =
                    { "priority", "time_to_complete", "interval_to_complete", "time_to_respond",
                            "interval_to_respond", "serv_window_start", "serv_window_end",
                            "serv_window_days", "allow_work_on_holidays" };
            // List records = selectDbRecords(context, Constants.SLA_RESPONSE_TABLE, fields, where);
            final DataSource slaDs =
                    DataSourceFactory.createDataSource()
                        .addTable(Constants.SLA_RESPONSE_TABLE, DataSource.ROLE_MAIN)
                        .addField(Constants.SLA_RESPONSE_TABLE, fields)
                        .addRestriction(Restrictions.sql(where));
            
            final List<DataRecord> records = slaDs.getAllRecords();
            
            long min_diff_response = -1;
            long min_diff_completion = -1;
            int priority_resp = -1;
            final int priority_comp = -1;
            long diff_completion = 0;
            long diff_response = 0;
            // check every possible priority
            final Iterator it = records.iterator();
            while (it.hasNext()) {
                final DataRecord dataRecord = (DataRecord) it.next();
                
                // no decimals !!!!
                final Integer time_to_complete =
                        (Integer) dataRecord.getValue("helpdesk_sla_response.time_to_complete");
                final String interval_to_complete =
                        notNull(dataRecord.getString("helpdesk_sla_response.interval_to_complete"));
                // no decimals !!!!
                final Integer time_to_respond =
                        (Integer) dataRecord.getValue("helpdesk_sla_response.time_to_respond");
                final String interval_to_respond =
                        notNull(dataRecord.getString("helpdesk_sla_response.interval_to_respond"));
                
                final java.sql.Time start =
                        (java.sql.Time) dataRecord
                            .getValue("helpdesk_sla_response.serv_window_start");
                final java.sql.Time end =
                        (java.sql.Time) dataRecord
                            .getValue("helpdesk_sla_response.serv_window_end");
                
                final String days =
                        notNull(dataRecord.getString("helpdesk_sla_response.serv_window_days"));
                
                boolean allow_work_on_holidays = false;
                if (dataRecord.getValue("helpdesk_sla_response.allow_work_on_holidays") != null) {
                    allow_work_on_holidays =
                            dataRecord.getInt("helpdesk_sla_response.allow_work_on_holidays") > 0;
                }
                final String site =
                        notNull(selectDbValue(context, Constants.SLA_REQUEST_TABLE, "site_id",
                            "ordering_seq = " + ordering_sequence + " AND activity_type = "
                                    + literal(context, activity_type)));
                final ServiceWindow serv_window =
                        new ServiceWindow(context, start, end, days, allow_work_on_holidays, site);
                Map response = new HashMap();
                Map completion = new HashMap();
                
                if (time_to_respond != null) { // time to respond given
                    if (time_to_respond != null && interval_to_respond != null) {
                        response =
                                serv_window.calculateEscalationDate(
                                    LocalDateTimeStore.get().currentLocalDate(null, null,
                                        blSiteMap.get("siteId"), blSiteMap.get("blId")),
                                    LocalDateTimeStore.get().currentLocalTime(null, null,
                                        blSiteMap.get("siteId"), blSiteMap.get("blId")),
                                    time_to_respond.intValue(), interval_to_respond);
                        final Calendar resp = (Calendar) response.get("calendar");
                        /*
                         * resp.setTime((Date) response.get("date")); Time resp_time = (Time)
                         * response.get("time");
                         * resp.set(Calendar.HOUR_OF_DAY,resp_time.getHours());
                         * resp.set(Calendar.MINUTE,resp_time.getMinutes());
                         * resp.set(Calendar.SECOND,resp_time.getSeconds());
                         */
                        diff_response =
                                Math.abs(required.getTimeInMillis() - resp.getTimeInMillis());
                        if (min_diff_response == -1 || diff_response < min_diff_response) {
                            min_diff_response = diff_response;
                            if (dataRecord.getValue("helpdesk_sla_response.priority") != null) {
                                final int new_priority =
                                        dataRecord.getInt("helpdesk_sla_response.priority");
                                if (priority_resp < new_priority) {
                                    priority_resp = new_priority;
                                }
                            }
                        }
                    }
                }
                if (time_to_complete != null) { // time to complete given
                    if (time_to_complete != null && interval_to_complete != null) {
                        completion =
                                serv_window.calculateEscalationDate(
                                    LocalDateTimeStore.get().currentLocalDate(null, null,
                                        blSiteMap.get("siteId"), blSiteMap.get("blId")),
                                    LocalDateTimeStore.get().currentLocalTime(null, null,
                                        blSiteMap.get("siteId"), blSiteMap.get("blId")),
                                    time_to_complete.intValue(), interval_to_complete);
                        /*
                         * Date comp_date = (Date) completion.get("date"); Time comp_time = (Time)
                         * completion.get("time");
                         */
                        final Calendar comp = (Calendar) completion.get("calendar");
                        /*
                         * comp.setTime(comp_date);
                         * comp.set(Calendar.HOUR_OF_DAY,comp_time.getHours());
                         * comp.set(Calendar.MINUTE,comp_time.getMinutes());
                         * comp.set(Calendar.SECOND,comp_time.getSeconds());
                         */
                        diff_completion =
                                Math.abs(required.getTimeInMillis() - comp.getTimeInMillis());
                        if (min_diff_completion == -1 || diff_completion < min_diff_completion) {
                            min_diff_completion = diff_completion;
                            if (dataRecord.getValue("helpdesk_sla_response.time_to_complete") != null) {
                                final int new_priority =
                                        dataRecord.getInt("helpdesk_sla_response.priority");
                                if (priority_comp < new_priority) {
                                    priority_resp = new_priority;
                                }
                            }
                        }
                    }
                }
            }
            if (priority_comp != -1) {
                results.put("priority", priority_comp);
            } else if (priority_resp != -1) {
                results.put("priority", priority_resp);
            } else {
                results.put("possible", -1);
            }
        } else {
            results.put("possible", 0);
            context.addResponseParameter("jsonExpression", results.toString());
            return;
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * 
     * Retrieves steps for SLA response.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>orderingSeq : SLA ordering sequence</li>
     * <li>priority : SLA priority</li>
     * <li>activity_type : SLA activity type</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression: JSONArray with JSONObjects for each step<br />
     * <code>[{step_type : ?, step : ?, status : ?, step_status : ?, condition : ?, em_id : ?, vn_id : ?, cf_id : ?, role : ?, step_order : ?, activity_id : ?}]
     * 			</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>check the input and convert the String type to int type for the parameters :orderingSeq
     * and priority</li>
     * <li>Retrieve records from helpdesk_sla_steps for given SLA (primary keys)</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT * FROM helpdesk_sla_steps<br />
     * WHERE ordering_seq = ? AND activity_type = ? AND priority = ?<br />
     * ORDER BY status, step_order</div>
     * </p>
     * 
     * @param String orderingSeq
     * @param String priority
     * @param final String activity_type
     */
    public void getHelperRules(final String orderingSeq, final String priority,
            final String activity_type) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        int ordering_seq = -1;
        if (!orderingSeq.equals("null") && !orderingSeq.equals("") && !orderingSeq.equals("-1")) {
            ordering_seq = Integer.parseInt(orderingSeq.trim());
        }
        int sla_priority = -1;
        if (!priority.equals("null") && !priority.equals("") && !priority.equals("-1")) {
            sla_priority = Integer.parseInt(priority.trim());
        }
        
        final JSONArray helperRules = new JSONArray();
        
        final String[] fields =
                { "step_type", "step", "status", "step_status", "condition", "em_id", "vn_id",
                        "cf_id", "role", "step_order", "activity_id", "multiple_required",
                        "notify_responsible" };
        final String sql_fields =
                "step_type,step,status,step_status,condition,em_id,vn_id,cf_id,"
                        + "role,step_order,activity_id,multiple_required,notify_responsible";
        
        final List records =
                selectDbRecords(
                    context,
                    "SELECT " + sql_fields + " FROM " + Constants.SLA_STEPS_TABLE
                            + " WHERE ordering_seq = " + ordering_seq + " AND priority = "
                            + sla_priority + " AND activity_type = "
                            + literal(context, activity_type) + " ORDER BY status, step_order");
        
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] values = (Object[]) it.next();
            final JSONObject stepMap = new JSONObject();
            
            for (int i = 0; i < fields.length; i++) {
                stepMap.put(fields[i], notNull(values[i]).trim());
            }
            
            helperRules.put(stepMap);
        }
        
        context.addResponseParameter("jsonExpression", helperRules.toString());
    }
    
    /**
     * 
     * Get priority levels for given ordering_seq and activity_type.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>orderingSeq: SLA ordering sequence</li>
     * <li>activity_type: SLA activity type</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with level-priority_label pairs<br />
     * <code>{priority_level_1 : ?, priority_level_2 : ?, priority_level_3: ?, priority_level_4 : ?, priority_level_5 : ?}</code>
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Check the input parameter and convert the orderingSeq into int type</li>
     * <li>Select priority labels from <code>helpdesk_sla_responsev</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * </p>
     * 
     * @param String orderingSeq
     * @param final String activity_type
     */
    public void getPriorityLevels(final String orderingSeq, final String activity_type) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        int ordering_seq = 0;
        if (!orderingSeq.equals("null") && !orderingSeq.equals("-1") && !orderingSeq.equals("")) {
            ordering_seq = Integer.parseInt(orderingSeq.trim());
        }
        // final String activity_type = context.getString("activity_type");
        final JSONObject json = new JSONObject();
        if (ordering_seq != 0) {
            final String where =
                    "ordering_seq = " + ordering_seq + " AND activity_type ="
                            + literal(context, activity_type);
            
            final List labels =
                    selectDbRecords(context, Constants.SLA_RESPONSE_TABLE, new String[] {
                            "priority_label", "priority" }, where);
            
            final Iterator it = labels.iterator();
            while (it.hasNext()) {
                final Object[] label = (Object[]) it.next();
                final String level = "priority_level_" + label[1];
                json.put(level, label[0]);
            }
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * 
     * Retrieves service window start for SLA, next working day for this SLA after today.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>table: table of request record</li>
     * <li>field: primary key field</li>
     * <li>pkey_value: primary key value</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with date_start and time_start <br />
     * <code>{date_start : ? , time_start : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Create service level agreement for given request</li>
     * <li>Get start of service window of current SLA</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * </p>
     * 
     * @param String table
     * @param String field
     * @param String pkey_value
     */
    public void getServiceWindowStartFromSLA(final String table, final String field,
            final String pkey_value) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int pkey = Integer.parseInt(pkey_value);
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, table, field, pkey);
        final ServiceWindow serv_window = sla.getServiceWindow();
        
        final Map<String, String> map =
                Common.getSiteBuildingIds(table, field, String.valueOf(pkey));
        
        final JSONObject start = new JSONObject();
        
        start.put(
            "date_start",
            "'"
                    + serv_window.getNextServiceDay(LocalDateTimeStore.get().currentLocalDate(null,
                        null, map.get("siteId"), map.get("blId"))) + "'");
        start.put("time_start", "'" + serv_window.getServiceWindowStartTime() + "'");
        
        context.addResponseParameter("jsonExpression", start.toString());
    }
    
    /**
     * 
     * Get response parameters of an SLA with given request parameters.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tableName : the table name</li>
     * <li>primaryKeyName : the field name of the primary Key</li>
     * <li>record : JSONObject which includes the form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with all response parameters, primary key values of rule
     * found<br />
     * <code>{serv_window_start : ?, serv_window_end : ?, serv_window_days : ?, allow_work_on_holidays : ?, 
     * 			priority_level_1 : ?, priority_level_2 : ?, priority_level_3 : ?, priority_level_4 : ?, priority_level_5 : ?, 
     * 			autocreate_wr : ?, autoschedule : ?, autoissue : ?, autoapprove : ?, autodispatch : ?, notify_requestor : ?, autoaccept : ?, 
     * 			em_id : ?, vn_id : ?, work_team_id : ?, cf_id : ?, dispatcher : ?, 
     * 			time_to_complete : ?, time_to_respond : ?, interval_to_complete : ?, interval_to_respond : ?, manager : ?, supervisor : ?,  
     * 			activity_type : ?, ordering_seq : ?, priority : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Convert the parameter record to a map</li>
     * <li>Check the parameter primaryKeyName and get the primaryKey value</li>
     * <li>Create new {@link ServiceLevelAgreement ServiceLevelAgreement object}</li>
     * <li>{@link ServiceLevelAgreement#getSlaResponseWithPriorityLevelsAsJson() Get Response
     * parameters as json}</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * 
     * @param String tableName
     * @param String primaryKeyName
     * @param JSONObject record
     */
    public void getSLAConditionParameters(final String tableName, final String primaryKeyName,
            final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        ServiceLevelAgreement sla = null;
        int pkeyValue = 0;
        if (!primaryKeyName.equalsIgnoreCase("null") && !tableName.equalsIgnoreCase("null")) {
            if (values.containsKey(primaryKeyName) && values.get(primaryKeyName) != null) {
                pkeyValue = getIntegerValue(context, values.get(primaryKeyName)).intValue();
            }
        }
        if (pkeyValue > 0) {
            sla = ServiceLevelAgreement.getInstance(context, tableName, primaryKeyName, pkeyValue);
        } else {
            sla = new ServiceLevelAgreement(context, values);
        }
        
        JSONObject results = new JSONObject();
        
        results = sla.getSlaResponseWithPriorityLevelsAsJson();
        
        results.put("activity_type", sla.getActivity_type());
        results.put("priority", sla.getPriority());
        results.put("ordering_seq", sla.getOrdering_seq());
        if (sla.getDefaultPriority() != null) {
            results.put("default_priority", sla.getDefaultPriority());
        }
        
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * 
     * Get SLA condition parameters, starting from XML for request record.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : XML for request record</li>
     * </ul>
     * </p>
     * <p>
     * Outputs:
     * <ul>
     * <li>jsonExpression : JSONObject with all response parameters, primary key values of rule
     * found<br />
     * <code>{serv_window_start : ?, serv_window_end : ?, serv_window_days : ?, allow_work_on_holidays : ?, ?
     * 			priority_level_1 : ?, priority_level_2 : ?, priority_level_3 : ?, priority_level_4 : ?, priority_level_5 : ?, 
     * 			autocreate_wr : ?, autoschedule : ?, autoissue : ?, autoapprove : ?, autodispatch : ?, notify_requestor : ?, autoaccept : ?, 
     * 			em_id : ?, vn_id : ?, work_team_id : ?, cf_id : ?, dispatcher : ?, 
     * 			time_to_complete : ?, time_to_respond : ?, interval_to_complete : ?, interval_to_respond : ?, manager : ?, supervisor : ?,  
     * 			activity_type : ?, ordering_seq : ?, priority : ?}</code>s</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Parse XML record</li>
     * <li>Create new {@link ServiceLevelAgreement ServiceLevelAgreement object}</li>
     * <li>{@link ServiceLevelAgreement#getSlaResponseWithPriorityLevelsAsJson() Get Response
     * parameters as json}</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void getSLAConditionParametersByRecord(final EventHandlerContext context) {
        final String record = (String) context.getParameter("record");
        final List recordElements = Common.selectXmlNodes(record, "descendant::record");
        final Element recordElement = (Element) recordElements.get(0);
        final Map fieldValues = parseRecord(context, recordElement);
        
        // Strip the "table"
        final Map values = stripPrefix(fieldValues);
        
        final ServiceLevelAgreement sla = new ServiceLevelAgreement(context, values);
        JSONObject results = new JSONObject();
        results = sla.getSlaResponseWithPriorityLevelsAsJson();
        results.put("activity_type", sla.getActivity_type());
        results.put("priority", sla.getPriority());
        results.put("ordering_seq", sla.getOrdering_seq());
        
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * 
     * Retrieves SLA response information (steps, timing, persons,...).
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>orderingSeq : SLA ordering sequence</li>
     * <li>priority_level : SLA priority</li>
     * <li>activity_type : SLA activity type</li>
     * <li>sWr : if activity table name is 'wr'</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with SLA information (including extra approval information
     * (parsed xml helper rules))<br />
     * <code>{serv_window_start : ?, serv_window_end : ?, serv_window_days : ?, allow_work_on_holidays : ?, ?
     * 			priority_level_1 : ?, priority_level_2 : ?, priority_level_3 : ?, priority_level_4 : ?, priority_level_5 : ?, 
     * 			autocreate_wr : ?, autoschedule : ?, autoissue : ?, autoapprove : ?, autodispatch : ?, notify_requestor : ?, autoaccept : ?, 
     * 			approvals : ?, em_id : ?, vn_id : ?, work_team_id : ?, cf_id : ?, dispatcher : ?, 
     * 			time_to_complete : ?, time_to_respond : ?, interval_to_complete : ?, interval_to_respond : ?, manager : ?, supervisor : ?  
     * 			}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Check the parameters 'orderingSeq' and 'priority_level' and convert them to int type,
     * convert the 'sWr' parameter to boolean type</li>
     * <li>Get step records for given SLA</li>
     * <li>Create approval information</li>
     * <li>{@link ServiceLevelAgreement#getSlaResponseAsJson() Get SLA response parameters}</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * 
     * @param String orderingSeq
     * @param String priority_level
     */
    public void getSLAInformation(final String orderingSeq, final String priority_level,
            final String activity_type, final String sWr) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        int ordering_seq = -1;
        if (!orderingSeq.equals("null") && !orderingSeq.equals("-1") && !orderingSeq.equals("")) {
            ordering_seq = Integer.parseInt(orderingSeq.trim());
        }
        int priority = -1;
        if (!priority_level.equals("null") && !priority_level.equals("-1")
                && !priority_level.equals("")) {
            priority = Integer.parseInt(priority_level.trim());
        }
        
        boolean wr = false;
        if (!sWr.equals("-1") && Integer.parseInt(sWr.trim()) > 0) {
            wr = true;
        }
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, priority, ordering_seq, activity_type);
        
        final String[] fields =
                { "step", "status", "condition", "em_id", "role", "activity_id", "step_type",
                        "multiple_required", "vn_id", "cf_id","role_name" };
        final StringBuffer sql = new StringBuffer("SELECT ");
        for (int i = 0; i < fields.length; i++) {
            if (i == 0) {
                sql.append(fields[i]);
            } else {
                sql.append("," + fields[i]);
            }
        }
        
        if (activity_type.equals(Constants.ON_DEMAND_WORK)) {
            if (wr) {
                sql.append(", "
                        + Common.formatSqlStatusOrder(context,
                            new String[] { Constants.ONDEMAND_ACTIVITY_ID }));
            } else {
                sql.append(", "
                        + Common.formatSqlStatusOrder(context, new String[] {
                                Constants.HELPDESK_ACTIVITY_ID, Constants.ONDEMAND_ACTIVITY_ID }));
            }
        } else {
            sql.append(", "
                    + Common.formatSqlStatusOrder(context,
                        new String[] { Constants.HELPDESK_ACTIVITY_ID }));
        }
        sql.append(" AS status_order ");
        //KB3043173 - support step name translatable
        sql.append(" , (select "+ Common.getLocalizedStepFieldName(getLocale(context))+ " from afm_wf_steps " +
                "where afm_wf_steps.activity_id = helpdesk_sla_steps.activity_id and afm_wf_steps.step = helpdesk_sla_steps.step " +
                "and afm_wf_steps.status = helpdesk_sla_steps.status ) AS step_localized ");
        
        sql.append(" FROM " + Constants.SLA_STEPS_TABLE);
        sql.append(" WHERE ordering_seq = "
                + ordering_seq
                + " AND priority = "
                + priority
                + " AND activity_type = "
                + literal(context, activity_type)
                + " AND step_type IN ('review','approval','acceptance','estimation','scheduling','dispatch')");
        if (wr) {
            sql.append(" AND status NOT IN ('R','Rev','Rej','A') AND activity_id = "
                    + literal(context, Constants.ONDEMAND_ACTIVITY_ID));
        }
        sql.append(" ORDER BY status_order, step_order");
        final List records = selectDbRecords(context, sql.toString());
        
        final StringBuffer approvals = new StringBuffer();
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final String table = Common.getActivityWorkflowTable(context, notNull(record[5]));
            final String status =
                    com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(context,
                        table, "status", notNull(record[1]));
            //KB3043173 - support step name translatable
            final String type = notNull(record[12]);
            String approval = null;
            String condition = null;
            if (record[2] != null) {
                condition = notNull(record[2]);
                final String[] tmp = condition.split(" ");
                final String field = tmp[0].trim();
                final String title =
                        com.archibus.eventhandler.EventHandlerBase
                            .getFieldMultiLineHeadingsAsString(context, table, field, " ");
                condition = title + " " + tmp[1] + " " + tmp[2];
            }
            if (record[3] != null) {// em
                final String em_id = notNull(record[3]);
                if (condition != null) {
                    final String[] args = { status, type, em_id, condition };
                    approval =
                            prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                "SLA_INFORMATION_WFR", "STEP_TEXT_COND", null, args);
                } else {
                    final String[] args = { status, type, em_id };
                    approval =
                            prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                "SLA_INFORMATION_WFR", "STEP_TEXT", null, args);
                }
            } else if (record[8] != null) {// vn
                final String vn_id = notNull(record[8]);
                if (condition != null) {
                    final String[] args = { status, type, vn_id, condition };
                    approval =
                            prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                "SLA_INFORMATION_WFR", "STEP_TEXT_COND", null, args);
                } else {
                    final String[] args = { status, type, vn_id };
                    approval =
                            prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                "SLA_INFORMATION_WFR", "STEP_TEXT", null, args);
                }
            } else if (record[4] != null) {// role
                final String role = notNull(record[4]);
                if ((notNull(record[6])).equals("approval")
                        && (getIntegerValue(context, record[7])).intValue() == 1) {
                    if (condition != null) {
                        final String[] args = { status, type, role, condition };
                        approval =
                                prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                    "SLA_INFORMATION_WFR", "STEP_TEXT_ROLE_ALL_COND", null, args);
                    } else {
                        final String[] args = { status, type, role };
                        approval =
                                prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                    "SLA_INFORMATION_WFR", "STEP_TEXT_ROLE_ALL", null, args);
                    }
                } else {
                    if (condition != null) {
                        final String[] args = { status, type, role, condition };
                        approval =
                                prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                    "SLA_INFORMATION_WFR", "STEP_TEXT_ROLE_COND", null, args);
                    } else {
                        final String[] args = { status, type, role };
                        approval =
                                prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                    "SLA_INFORMATION_WFR", "STEP_TEXT_ROLE", null, args);
                    }
                }
            } else if (record[9] != null) {// cf
                final String cf_id = notNull(record[9]);
                if (condition != null) {
                    final String[] args = { status, type, cf_id, condition };
                    approval =
                            prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                "SLA_INFORMATION_WFR", "STEP_TEXT_COND", null, args);
                } else {
                    final String[] args = { status, type, cf_id };
                    approval =
                            prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                "SLA_INFORMATION_WFR", "STEP_TEXT", null, args);
                }
            } else if (record[10] != null) {// afm role
                final String afmRole = notNull(record[10]);
                if (condition != null) {
                    final String[] args = { status, type, afmRole, condition };
                    approval =
                            prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                "SLA_INFORMATION_WFR", "STEP_TEXT_COND", null, args);
                } else {
                    final String[] args = { status, type, afmRole };
                    approval =
                            prepareMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                                "SLA_INFORMATION_WFR", "STEP_TEXT", null, args);
                }
            }else {
                // @translatable
                final String errorMessage = localizeString(context, "Step Manager missing");
                throw new ExceptionBase(errorMessage, true);
            }
            
            approvals.append(approval + "<br />");
        }
        
        StringBuffer approvalInfo = null;
        if (approvals.length() > 0) {
            approvalInfo =
                    new StringBuffer(localizeMessage(context, Constants.HELPDESK_ACTIVITY_ID,
                        "SLA_INFORMATION_WFR", "STEP_TEXT_TITLE", null) + "<br />");
            approvalInfo.append(approvals);
        }
        final JSONObject json = sla.getSlaResponseAsJson();
        if (approvalInfo != null) {
            json.put("approvals", approvalInfo.toString());
        } else {
            json.put(
                "approvals",
                localizeMessage(context, Constants.HELPDESK_ACTIVITY_ID, "SLA_INFORMATION_WFR",
                    "STEP_TEXT_NONE", null));
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * 
     * Move SLA rule (one step).
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSONObject which includes the values submitted</li>
     * <li>direction : direction to move (up or down)</li>
     * <li>force : false means checking conflict, true means not checking conflict</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with new ordering sequence of the rule<br />
     * <code>{ordering_seq : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Convert the parameter record into map type</li>
     * <li>Update rules table (ordering sequences)</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * 
     * @param JSONObject record
     * @param String direction
     * @param String force
     */
    public void moveRule(final JSONObject record, final String direction, final String force) {
final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        
        String match_ordering_seq_field = getMatchOrderingSeqField();
        
        final Integer match_ordering_seq = getIntegerValue(context, values.get(match_ordering_seq_field));
        final String activity_type = (String) values.get("activity_type");
        
        // String direction = (String) context.getParameter("dir");
        
        if (direction.equals("null") || match_ordering_seq == null) {
            // @translatable
            final String errorMessage = localizeString(context, "Parameter dir or record missing");
            throw new ExceptionBase(errorMessage, true);
        }
        
        String sql = null;
        // search ordering_seq of next/previous rule
        if (direction.equalsIgnoreCase("up")) {
            sql =
                    "SELECT MIN("+match_ordering_seq_field+") FROM helpdesk_sla_request WHERE activity_type = "
                            + literal(context, activity_type) + " AND "+match_ordering_seq_field+" > "
                            + match_ordering_seq;
        } else {
            sql =
                    "SELECT MAX("+match_ordering_seq_field+") FROM helpdesk_sla_request WHERE activity_type = "
                            + literal(context, activity_type) + " AND "+match_ordering_seq_field+" < "
                            + match_ordering_seq;
        }
        final List records = selectDbRecords(context, sql);
        if (records.isEmpty()) {
            return;
        }
        final Object[] rec = (Object[]) records.get(0);
        if (rec[0] != null) {
            final int new_match_ord = getIntegerValue(context, rec[0]).intValue();
            
            updateMatchOrderingSequence(context, activity_type, new_match_ord, -new_match_ord);
            
            updateMatchOrderingSequence(context, activity_type, match_ordering_seq.intValue(), new_match_ord);
            
            updateMatchOrderingSequence(context, activity_type, -new_match_ord, match_ordering_seq.intValue());
            
            boolean conflict = false;
            if (!force.equals("true")) {
                conflict = checkConflicts(context, activity_type, new_match_ord);
            }
            final JSONObject json = new JSONObject();
            json.put("conflict", conflict);
            json.put("ordering_seq", new_match_ord);
            json.put("activity_type", activity_type);
            context.addResponseParameter("jsonExpression", json.toString());
        } else {
            if (direction.equalsIgnoreCase("up")) {
                // @translatable
                final String errorMessage =
                        localizeString(context,
                            "You cannot move the rule with the highest ordering sequence up.");
                throw new ExceptionBase(errorMessage, true);
            } else {
                // @translatable
                final String errorMessage =
                        localizeString(context,
                            "You cannot move the rule with the lowest ordering sequence down.");
                throw new ExceptionBase(errorMessage, true);
            }
        }
    }
    
    /**
     * 
     * Save response parameters for a priority level of an SLA.
     * 
     * <p>
     * When the user local is not English the translated field for the priority label is updated.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSONObject which includes the form values submitted</li>
     * <li>sPriorities : JSON String with priority-label pairs</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Parse the parameter record into a map</li>
     * <li>Parse priority levels</li>
     * <li>Insert records for new priority levels or delete records for removed priority levels</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record
     * @param String sPriorities
     * @throws ExceptionBase
     * @throws ParseException </p>
     */
    public void saveSLAPriorityLevels(final JSONObject record, final String sPriorities)
            throws ExceptionBase, ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map<String, Object> fieldValues = parseJSONObject(context, record);
        final Map<String, Object> values = stripPrefix(fieldValues);
        
        final JSONArray priorities = new JSONArray(sPriorities);
        
        final Integer ordering_seq = getIntegerValue(context, values.get("ordering_seq"));
        final String activity_type = (String) values.get("activity_type");
        
        if (ordering_seq == null) {
            return;
        }
        
        // array with priority labels, always starting at index 0
        final String[] priorityLevels = new String[Constants.PRIORITY_LEVELS];
        
        for (int i = 0; i < priorities.length(); i++) {
            if (priorities.getJSONObject(i) != null) {
                final int level =
                        priorities.getJSONObject(i).getInt("priority") - Constants.MINIMAL_PRIORITY;
                priorityLevels[level] = priorities.getJSONObject(i).getString("label");
            }
        }
        if (priorityLevels[0] == null || priorityLevels[0].equals("")) {
            priorityLevels[0] = "default";
        }
        
        final String lang = getUserLanguage(context);
        
        // insert records for priority levels if they do not exist
        for (int i = 0; i < Constants.PRIORITY_LEVELS; i++) {
            final int priority = Constants.MINIMAL_PRIORITY + i;
            if (priorityLevels[i] != null && !priorityLevels[i].equals("")) {
                
                final Map<String, Object> new_values = new HashMap<String, Object>();
                new_values.put("ordering_seq", ordering_seq);
                new_values.put("activity_type", activity_type);
                new_values.put("priority", new Integer(priority));
                new_values.put("status", "Created");
                // when adding always save the default value
                new_values.put("priority_label", priorityLevels[i]);
                if (!lang.equals("en")) {
                    new_values.put("priority_label_" + lang, priorityLevels[i]);
                }
                
                try {
                    executeDbAdd(context, Constants.SLA_RESPONSE_TABLE, new_values);
                } catch (final Exception e) {
                    new_values.remove("status"); // remove the status value
                    if (!lang.equals("en")) {
                        new_values.remove("priority_label"); // do not update the default
                        // translation (English)
                    }
                    
                    executeDbSave(context, Constants.SLA_RESPONSE_TABLE, new_values);
                }
                
                // executeDbCommit(context);
            } else { // delete existing record when description is empty
                executeDbSql(context, "DELETE FROM " + Constants.SLA_STEPS_TABLE
                        + " WHERE activity_type = " + literal(context, activity_type)
                        + " AND ordering_seq = " + ordering_seq + " AND priority = " + priority,
                    false);
                executeDbSql(context, "DELETE FROM " + Constants.SLA_RESPONSE_TABLE
                        + " WHERE activity_type = " + literal(context, activity_type)
                        + " AND ordering_seq = " + ordering_seq + " AND priority = " + priority,
                    false);
            }
        }
    }
    
    /**
     * 
     * Save problem (request) parameters of an SLA rule. Check if rule already exists with other
     * priority.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSONObject which includes the form values submitted</li>
     * <li>activity_type_copy <i>optional</i> : activity type (if rule is being copied)</li>
     * <li>ord_seq_copy <i>optional</i> : ordering sequence (if rule is being copied)</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with boolean found (rule already exists or not) and (new)
     * ordering sequence<br />
     * <code>{activity_type : ?, ordering_seq : ?, found : <i>0 or 1</i>}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Check if this rule already exists</li>
     * <li>If not create new rule with a ordering sequence depending on given request parameters</li>
     * <li>If necessary move other rules</li>
     * </ol>
     * </p>
     * 
     * @param JSONObject record
     * @param String activity_type_copy
     * @param String ord_seq_copy
     */
    public void saveSLAProblemParameters(final JSONObject record, final String activity_type_copy,
            final String ord_seq_copy) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String match_ordering_seq_field = getMatchOrderingSeqField();
        
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        
        final String activity_type = (String) values.get("activity_type");
        
        final JSONObject results = new JSONObject();
        // return activity_type
        results.put("activity_type", activity_type);
        
        // do lookup for request parameters
        int ordering_seq = getOrderingSequenceForDefaultPriority(context, values);
        // ordering sequence submitted when edit action
        int existing_seq = 0;
        
        int ordering_seq_copy = 0;
        boolean isCopiedOrderSeqMoved = false;
        
        if (!activity_type_copy.equals("null") && !activity_type_copy.equals("0")
                && !ord_seq_copy.equalsIgnoreCase("null") && !ord_seq_copy.equalsIgnoreCase("-1")
                && !ord_seq_copy.equals("0")) {
            ordering_seq_copy = Integer.parseInt(ord_seq_copy.trim());
        } else {
            if (values.get("ordering_seq") != null) {
                existing_seq = getIntegerValue(context, values.get("ordering_seq")).intValue();
            }
        }
        
        if (ordering_seq > 0) {// existing rule found
            results.put("found", 1);
            results.put("ordering_seq", ordering_seq);
            if (ordering_seq != existing_seq) {// edit rule, request parameters changed, but now
                // matching other existing rule
                results.put("conflict", 1);
            } else {// else nothing to do because request parameters were not changed
                results.put("conflict", 0);
            }
        } else if (existing_seq > 0 && ordering_seq == 0) {
            // this is an edit rule and request parameters are changed
            executeDbSave(context, Constants.SLA_REQUEST_TABLE, values);
            //executeDbCommit(context);
            
            results.put("found", 0);
            results.put("ordering_seq", existing_seq);
            
        } else {
            // completely new rule => ordering_seq has to be determined
            results.put("found", 0);
            
            int maxOrdering_seq = DataStatistics.getIntWithoutVpa("helpdesk_sla_request", "ordering_seq", "MAX","helpdesk_sla_request.activity_type='"+activity_type+"'");
            int matchOrderingSequence = getMatchOrderingSequenceForNewRule(context, values);
            values.put(match_ordering_seq_field, new Integer(matchOrderingSequence));
            if (SchemaUtils.fieldExistsInSchema(Constants.SLA_REQUEST_TABLE, "match_ordering_seq")) {
                values.put("ordering_seq", new Integer(maxOrdering_seq+1));
                // return ordering_seq
                results.put("ordering_seq", maxOrdering_seq+1);
            }else {
                // return ordering_seq
                results.put("ordering_seq", matchOrderingSequence);
            }
            
           
            
            final List records =
                    selectDbRecords(context,
                        "SELECT "+match_ordering_seq_field+" FROM " + Constants.SLA_REQUEST_TABLE
                                + " WHERE activity_type= " + literal(context, activity_type)
                                + " AND "+match_ordering_seq_field+" >= " + matchOrderingSequence
                                + " ORDER BY "+match_ordering_seq_field+" DESC ");
            
            if (!records.isEmpty()) {
                int gapPosition = matchOrderingSequence;
                
                for (int i = records.size() - 1; i >= 0; i--) {
                    final Object[] recordValues = (Object[]) records.get(i);
                    final Integer ordering = getIntegerValue(context, recordValues[0]);
                    if (gapPosition != ordering) {
                        break;
                    }
                    
                    gapPosition++;
                }
                
                final Object[] first = (Object[]) records.get(records.size() - 1);
                final Integer check = getIntegerValue(context, first[0]);
                // only update all records if a rule with the new ordering sequence already existed
                if (check.intValue() == matchOrderingSequence) {
                    for (final Iterator it = records.iterator(); it.hasNext();) {
                        final Object[] recordValues = (Object[]) it.next();
                        final Integer ordering = getIntegerValue(context, recordValues[0]);
                        if(gapPosition>ordering) {
                            /*
                             * String update = "UPDATE " + Constants.SLA_REQUEST_TABLE + " SET
                             * ordering_seq = ordering_seq + 1 " + " WHERE activity_type = "+
                             * literal(context,activity_type) +" AND ordering_seq = " + ordering;
                             * 
                             * executeDbSql(context, update, false);
                             */
                            
                            if (ordering_seq_copy == ordering.intValue()) {
                                isCopiedOrderSeqMoved = true;
                            }
                            
                            updateMatchOrderingSequence(context, activity_type, ordering.intValue(),
                                ordering.intValue() + 1);
                        }
                      
                    }
                }
            }
            
            executeDbAdd(context, Constants.SLA_REQUEST_TABLE, values);
            //executeDbCommit(context);
            
            if (ordering_seq_copy > 0) {
                if (isCopiedOrderSeqMoved) {
                    ordering_seq_copy = ordering_seq_copy + 1;
                }

                if (SchemaUtils.fieldExistsInSchema(Constants.SLA_REQUEST_TABLE,
                    "match_ordering_seq")) {
                    copyResponseParameters(context, activity_type, activity_type_copy,
                        maxOrdering_seq + 1, ordering_seq_copy);
                } else {
                    // return ordering_seq
                    results.put("ordering_seq", matchOrderingSequence);
                    copyResponseParameters(context, activity_type, activity_type_copy,
                        matchOrderingSequence, ordering_seq_copy);
                }
            }
        }
        
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * 
     * Save SLA response parameters.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>record : JSONObject which includes the form values submitted</li>
     * <li>xmlHelperRules : xml string</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with priority of saved record <br />
     * <code>{priority : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Save record to database</li>
     * <li>Create {@link ServiceLevelAgreement SLA object},
     * {@link ServiceLevelAgreement#parseHelperRules() parse} and
     * {@link ServiceLevelAgreement#saveHelperRules() save helper rules}</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @throws DocumentException </p>
     * @param JSONObject record
     * @param String xmlHelperRules
     */
    public void saveSLAResponseParameters(final JSONObject record, final String xmlHelperRules)
            throws DocumentException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(filterWithPrefix(fieldValues, Constants.SLA_RESPONSE_TABLE));
        // make sure this record is saved as active
        values.put("status", "Active");
        
        executeDbSave(context, Constants.SLA_RESPONSE_TABLE, values);
        //executeDbCommit(context);
        
        final Integer ordering_seq = getIntegerValue(context, values.get("ordering_seq"));
        final Integer priority = getIntegerValue(context, values.get("priority"));
        
        final String activity_type = (String) values.get("activity_type");
        
        // String xmlHelperRules = context.getString("xml_helper_rules");
        
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, priority.intValue(),
                    ordering_seq.intValue(), activity_type);
        sla.setXmlHelperRules(xmlHelperRules);
        sla.parseHelperRules();
        sla.saveHelperRules();
        
        sla.checkAutomation();
        
        if (ordering_seq != null && priority != null) {
            // update response parameters for next levels, if status = 'Created'
            for (int i = priority.intValue() + 1; i < Constants.PRIORITY_LEVELS
                    + Constants.MINIMAL_PRIORITY; i++) {
                final Object recordFound =
                        selectDbValue(context, Constants.SLA_RESPONSE_TABLE, "priority",
                            "activity_type = " + literal(context, activity_type)
                                    + " AND status = 'Created' AND ordering_seq = " + ordering_seq
                                    + " AND priority = " + i);
                // if not exist in database insert new record
                if (recordFound != null) {
                    values.put("priority", new Integer(i));
                    values.put("status", "Active"); // make status 'Active' for all !!!
                    executeDbSave(context, Constants.SLA_RESPONSE_TABLE, values);
                    //executeDbCommit(context);
                }
            }
        }
        
        final JSONObject result = new JSONObject();
        result.put("priority", priority);
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * 
     * Copy Response parameters of an SLA rule (given by its primary key) to another.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_type_copy : Activity type of rule to copy</li>
     * <li>ordering_seq_copy : Ordering sequence of rule to copy</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Make a copy of the response parameters for each priority in
     * <code>helpdesk_sla_response</code></li>
     * <li>Make a copy of all steps (for all priorities) in <code>helpdesk_sla_steps</code></li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> INSERT INTO helpdesk_sla_response
     * (activity_type,ordering_seq,priority,em_id
     * ,vn_id,work_team_id,cf_id,dispatcher,cost,time_to_complete,time_to_respond,
     * interval_to_complete,interval_to_respond,serv_window_start,serv_window_end,serv_window_days,
     * allow_work_on_holidays,manager,supervisor,
     * priority_label,autocreate_wr,autoschedule,autoissue
     * ,autoapprove,autodispatch,notify_requestor,ondemand_workflow,autoaccept)<br />
     * SELECT <i>given activity type</i>,<i>given ordering
     * sequence</i>,priority,em_id,vn_id,work_team_id
     * ,cf_id,dispatcher,cost,time_to_complete,time_to_respond,
     * interval_to_complete,interval_to_respond
     * ,serv_window_start,serv_window_end,serv_window_days,allow_work_on_holidays
     * ,manager,supervisor,
     * priority_label,autocreate_wr,autoschedule,autoissue,autoapprove,autodispatch
     * ,notify_requestor,ondemand_workflow,autoaccept <br />
     * FROM helpdesk_sla_response <br />
     * WHERE activity_type = <i>activity_type_copy</i> AND ordering_seq = <i>ordering_seq_copy</i>
     * </div>
     * </p>
     * 
     * 
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param activity_type Activity type of rule to copy to
     * @param activity_type_copy
     * @param int ordering_seq
     * @param int ordering_seq_copy
     *        </p>
     */
    private void copyResponseParameters(final EventHandlerContext context,
            final String activity_type, final String activity_type_copy, final int ordering_seq,
            final int ordering_seq_copy) {
        
        // make copy of every priority level
        String sql =
                "INSERT INTO " + Constants.SLA_RESPONSE_TABLE
                        + " (activity_type,ordering_seq,priority,"
                        + Constants.SQL_SLA_PARAMETER_NAMES + ") " + " SELECT "
                        + literal(context, activity_type) + "," + ordering_seq + ",priority,"
                        + Constants.SQL_SLA_PARAMETER_NAMES + " FROM "
                        + Constants.SLA_RESPONSE_TABLE + " WHERE activity_type = "
                        + literal(context, activity_type_copy) + " AND ordering_seq = "
                        + ordering_seq_copy;
        
        this.log.debug(sql);
        
        executeDbSql(context, sql, false);
        //executeDbCommit(context);
        
        // copy optional steps
        sql =
                "INSERT INTO "
                        + Constants.SLA_STEPS_TABLE
                        + " (activity_type ,ordering_seq, priority, activity_id, status, step_order, step_type, step, step_status, vn_id, em_id, cf_id, role, condition, multiple_required) "
                        + " SELECT "
                        + literal(context, activity_type)
                        + ","
                        + ordering_seq
                        + ", priority, activity_id, status, step_order, step_type, step, step_status, vn_id, em_id, cf_id, role, condition, multiple_required "
                        + " FROM " + Constants.SLA_STEPS_TABLE + " WHERE activity_type = "
                        + literal(context, activity_type_copy) + " AND ordering_seq = "
                        + ordering_seq_copy;
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(sql);
        }
        
        executeDbSql(context, sql, false);
        //executeDbCommit(context);
    }
    
    /**
     * Delete SLA rule.
     * 
     * Oracle doesn't support cascade delete. We must delete records in all tables.
     * 
     * @param EventHandlerContext context
     * @param String activity_type
     * @param int ordering
     */
    private void deleteSlaRule(final EventHandlerContext context, final String activity_type,
            final int ordering) {
        final Vector<String> commands = new Vector<String>();
        commands.add("DELETE FROM " + Constants.SLA_STEPS_TABLE + " WHERE activity_type = "
                + literal(context, activity_type) + " AND ordering_seq = " + ordering);
        commands.add("DELETE FROM " + Constants.SLA_RESPONSE_TABLE + " WHERE activity_type = "
                + literal(context, activity_type) + " AND ordering_seq = " + ordering);
        commands.add("DELETE FROM " + Constants.SLA_REQUEST_TABLE + " WHERE activity_type = "
                + literal(context, activity_type) + " AND ordering_seq = " + ordering);
        
        executeDbSqlCommands(context, commands, false);
        //executeDbCommit(context);
    }
    
    private int getMaxMatchOrderSeqWithSameForm(final EventHandlerContext context, final Map values) {
        StringBuffer sql;
        List records;
        
        String match_ordering_seq_field = getMatchOrderingSeqField();
        // if no rule found with similar content, look for rules with similar form (same
        // fields filled in)
        sql =
                new StringBuffer("SELECT " + formatSqlIsNull(context, "MAX("+match_ordering_seq_field+"),0")
                        + " FROM " + Constants.SLA_REQUEST_TABLE + " WHERE 0=0");
        for (final String fieldName : Constants.SLA_REQUEST_FIELDS) {
            final String fieldValue = String.valueOf(values.get(fieldName)==null?"":values.get(fieldName));
            if (fieldName.equals("activity_type")) { // activity_type is part of the primary
                                                     // key, so only rules with the same
                                                     // activity_type should be taken into
                                                     // account
                sql.append(" AND activity_type = " + literal(context, fieldValue));
            } else if (!fieldName.equals("default_priority")) {
                if (StringUtil.notNullOrEmpty(fieldValue)) {
                    sql.append(" AND " + fieldName + " IS NOT NULL");
                }
            }
        }
        records = selectDbRecords(context, sql.toString());
        final Object[] record = (Object[]) records.get(0);
        final int ordering_seq = getIntegerValue(context, record[0]).intValue();
        return ordering_seq;
    }
    
    private int getMaxMatchOrderSeqWithSimilarParameter(final EventHandlerContext context,
            final Map values) {
        
        String match_ordering_seq_field = getMatchOrderingSeqField();
        
        // get max ordering sequence
        final StringBuffer sql =
                new StringBuffer("SELECT " + formatSqlIsNull(context, "MAX("+match_ordering_seq_field+"),0")
                        + " FROM " + Constants.SLA_REQUEST_TABLE + " WHERE 0=0");
        for (final String fieldName : Constants.SLA_REQUEST_FIELDS) {
            final String fieldValue = String.valueOf(values.get(fieldName)==null?"":values.get(fieldName));
            if (fieldName.equals("activity_type")) {// activity_type is part of the primary
                                                    // key, so only rules with the same
                                                    // activity_type should be taken into
                                                    // account
                sql.append(" AND activity_type = " + literal(context, fieldValue));
            } else if (!fieldName.equals("default_priority")) {
                if (fieldValue != null && !fieldValue.equals("")) {
                    sql.append(" AND (" + fieldName + " = " + literal(context, fieldValue) + " OR "
                            + fieldName + " IS NULL ) ");
                } else {
                    sql.append(" AND " + fieldName + " IS NULL ");
                }
            }
        }
        final List records = selectDbRecords(context, sql.toString());
        final Object[] record = (Object[]) records.get(0);
        final int ordering_seq = getIntegerValue(context, record[0]).intValue();
        return ordering_seq;
    }
    
    private String getMatchOrderingSeqField() {
        
        String match_ordering_seq_field = "ordering_seq";
        if (SchemaUtils.fieldExistsInSchema(Constants.SLA_REQUEST_TABLE, "match_ordering_seq")) {
            match_ordering_seq_field = "match_ordering_seq";
        }
        
        return match_ordering_seq_field;
    }
    
    private int getMinMatchOrderSeqWithMoreSpecificRule(final EventHandlerContext context,
            final Map values) {
        StringBuffer sql;
        String match_ordering_seq_field = getMatchOrderingSeqField();
        // check if there a more specific rule with a lower ordering sequence (which
        // may not be 'overruled')
        
        // search for more specific rules with a lower ordering_seq
        sql =
                new StringBuffer("SELECT " + formatSqlIsNull(context, "MIN("+match_ordering_seq_field+"),0")
                        + " FROM " + Constants.SLA_REQUEST_TABLE + " WHERE activity_type = "
                        + literal(context, values.get("activity_type").toString()));
        final StringBuffer not = new StringBuffer();
        for (final String fieldName : Constants.SLA_REQUEST_FIELDS) {
            if (!fieldName.equals("activity_type")) {
                if (StringUtil.notNullOrEmpty(values.get(fieldName))) {
                    //KB3046169 - check second tier problem type as more specific rule if input top tier problem type
                    if("prob_type".equals(fieldName)) {
                        final String parameter = notNull(values.get(fieldName));
                        if(parameter.indexOf("|")==-1) {
                            sql.append(" AND (" + fieldName + " = " + literal(context, parameter)+" OR "+ fieldName + " LIKE " + literal(context, parameter + "|%")+")");
                        }else {
                            sql.append(" AND " + fieldName + " = " + literal(context, parameter));
                        }
                        
                        
                    }else if (!fieldName.equals("default_priority")) {
                        final String parameter = notNull(values.get(fieldName));
                        sql.append(" AND " + fieldName + " = " + literal(context, parameter));
                    }
                    
                }
            } else {
                if (not.length() == 0) {
                    not.append(fieldName + " IS NULL");
                } else {
                    not.append(" AND " + fieldName + " IS NULL");
                }
            }
        }
        if (not.length() > 0) {
            sql.append(" AND NOT(" + not.toString() + ")");
        }
        
        final List<Object[]> records = selectDbRecords(context, sql.toString());
        final Object[] record = records.get(0);
        final int ordering_seq = getIntegerValue(context, record[0]).intValue();
        return ordering_seq;
    }
    
    private int getMinMatchOrderSeqWithSameActivityType(final EventHandlerContext context,
            final Map values) {
        String match_ordering_seq_field = getMatchOrderingSeqField();
        final int minOrderingSeq =
                retrieveStatistic(
                    context,
                    "MIN",
                    "SELECT " + formatSqlIsNull(context, "MIN("+match_ordering_seq_field+"),0")
                            + " FROM helpdesk_sla_request WHERE activity_type="
                            + literal(context, values.get("activity_type").toString()),
                    "helpdesk_sla_request", match_ordering_seq_field).intValue();
        return minOrderingSeq;
    }
    
    /**
     * 
     * Determine ordering sequence for SLA with default priority.
     * 
     * <p>
     * The default priority (always 1) is used when no priority levels are used. When a new rule is
     * added, the <code>ordering_seq</code> is looked for the the <code>helpdesk_sla_request</code>
     * table, using the request parameters submitted.<br/>
     * For every value in the <code>values</code> where clause is checked. For parameters not
     * available in the <code>values</code> check IS NULL.
     * </p>
     * <p>
     * When not found, 0 is returned !
     * </p>
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select ordering sequence of record with given values for request parameters and other
     * parameter NULL</li>
     * <li>return retrieved value</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param values request parameters of SLA rule
     * @return determined ordering sequence
     *         </p>
     */
    private int getOrderingSequenceForDefaultPriority(final EventHandlerContext context,
            final Map values) {
        
        final StringBuffer sql =
                new StringBuffer("SELECT ordering_seq FROM " + Constants.SLA_REQUEST_TABLE
                        + " WHERE 0 = 0 ");
        
        for (int i = 0; i < Constants.SLA_REQUEST_FIELDS.length; i++) {
            if (!Constants.SLA_REQUEST_FIELDS[i].equals("default_priority")) {
                if (values.containsKey(Constants.SLA_REQUEST_FIELDS[i])
                        && values.get(Constants.SLA_REQUEST_FIELDS[i]) != null
                        && !values.get(Constants.SLA_REQUEST_FIELDS[i]).equals("")) {
                    sql.append(" AND "
                            + Constants.SLA_REQUEST_FIELDS[i]
                            + " = "
                            + literal(context, (String) values.get(Constants.SLA_REQUEST_FIELDS[i])));
                } else {
                    sql.append(" AND " + Constants.SLA_REQUEST_FIELDS[i] + " IS NULL");
                }
            }
        }
        
        final List records = selectDbRecords(context, sql.toString());
        
        if (records.size() > 0) {
            final Object[] record = (Object[]) records.get(0);
            return getIntegerValue(context, record[0]).intValue();
        } else {
            return 0;
        }
    }
    
    /**
     * 
     * Get Ordering Sequence for a new Rule starting from Request Parameters.
     * 
     * <p>
     * This algorithm will search for a new <code>ordering_seq</code>.
     * </p>
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * 
     * -first of all check if other rules with the same activity_type exist if not return 1 as new
     * ordering sequence else select the maximal ordering sequence of a rule with the same
     * activity_type and similar content similar content meaning: rules with the same value or null
     * for fields entered in the new rule and null for all other fields e.g. if the new rule has the
     * following content: activity_type = SERVICE DESK - COPY SERVICE, site_id=MARKET, bl_id=HQ The
     * where clause of the query will be the following: activity_type='SERVICE DESK - COPY SERVICE'
     * AND (site_id IS NULL or site_id='MARKET') AND (bl_id='HQ' OR bl_id IS NULL) AND fl_id IS NULL
     * AND rm_id IS NULL AND dp_id IS NULL AND dv_id IS NULL AND eq_std IS NULL AND eq_id IS NULL
     * AND prob_type IS NULL AND em_std IS NULL AND requestor IS NULL AND pmp_id IS NULL If such a
     * rule exists the new rule should be placed just above this rule Else select the maximal
     * ordering sequence of a rule with the same activity_type and similar form Similar form
     * meaning: rules with the same fields filled in (with other values) e.g. if the new rule has
     * the following content: activity_type = SERVICE DESK - COPY SERVICE, site_id=MARKET, bl_id=HQ
     * The where clause of the query will be the following: activity_type='SERVICE DESK - COPY
     * SERVICE' AND site_id IS NOT NULL AND bl_id IS NOT NULL If such a rule does not exist the new
     * rule can be placed just above the first rule with the same activity_type (return
     * minOrderingSeq +1) Else check if the new rule won't overrule another more specific rule with
     * a lower ordering sequence E.g. this query might return the ordering_seq of the SLA with
     * activity_type='SERVICE DESK - COPY SERVICE' AND site_id ='MARKET' AND bl_id ='HQ' AND
     * fl_id='01' ; but the rule with activity_type='SERVICE DESK - COPY SERVICE' AND site_id
     * ='MARKET' AND bl_id ='HQ' AND fl_id='02' ; might have a lower ordering_seq so then we need to
     * put the new rule just beneath this last rule.
     * 
     * @param context Workflow rule execution context
     * @param values request parameters
     * @return new ordering sequence
     */
    private int getMatchOrderingSequenceForNewRule(final EventHandlerContext context, final Map values) {
        // the default value of the new rule order sequence is 1
        int newRuleOrderSeq = 1;
        
        // get minimum order sequence of the same activity type
        final int minOrderingSeqWithSameActivityType =
                getMinMatchOrderSeqWithSameActivityType(context, values);
        
        // if exist other rules with the same activity type, compare the rules with similar request
        // parameters
        if (minOrderingSeqWithSameActivityType != 0) {
            // get maximum order sequence of the rules that with similar request parameters
            final int maxOrderSeqWithSimilarParameter =
                    getMaxMatchOrderSeqWithSimilarParameter(context, values);
            
            // if no rule with the similar request parameters or max similar rule is the minimum
            // one, then compare the rules with same form fields
            if (maxOrderSeqWithSimilarParameter == 0
                    || maxOrderSeqWithSimilarParameter == minOrderingSeqWithSameActivityType) {
                // get maximum order sequence of the rules with same form fields
                final int maxOrderSeqWithSameForm = getMaxMatchOrderSeqWithSameForm(context, values);
                // if exist rules with same form fields, then compare rules with more specific
                if (maxOrderSeqWithSameForm != 0) {
                    newRuleOrderSeq = maxOrderSeqWithSameForm + 1;
                    if (maxOrderSeqWithSameForm > minOrderingSeqWithSameActivityType + 1) {
                        final int minOrderSeqWithMoreSpecificRule =
                                getMinMatchOrderSeqWithMoreSpecificRule(context, values);
                        //KB3046694 - change < to <= to chose the min more specific rule as new ordering seq if minOrderSeqWithMoreSpecificRule = maxOrderSeqWithSameForm 
                        if (minOrderSeqWithMoreSpecificRule > 0
                                && minOrderSeqWithMoreSpecificRule <= maxOrderSeqWithSameForm) {
                            // place new rule right beneath more specific rule with lowest ordering
                            // seq
                            newRuleOrderSeq = minOrderSeqWithMoreSpecificRule;
                        }
                    }
                } else {// if not exist rules with same form fields, then get minimum order sequence
                        // of the same activity type +1
                    newRuleOrderSeq = minOrderingSeqWithSameActivityType + 1;
                }
            } else {// if exist rules with similar request parameters, then get maximum order
                    // sequence of similar rules + 1
                newRuleOrderSeq = maxOrderSeqWithSimilarParameter + 1;
            }
        }
        
        return newRuleOrderSeq;
    }
    
    
    /**
     * Update ordering sequence by Grouping.
     * 
     * @param EventHandlerContext context
     * @param String activity_type
     * @param int ordering
     * @param int newOrdering
     */
    private List<Integer> getGroupingOrderingList(final EventHandlerContext context,
            final String activityType, final int ordering) {
        final List<Integer> groupingOrderingList= new ArrayList<Integer>();
        
        int grouping =
                getIntegerValue(
                    context,
                    selectDbValue(context, Constants.SLA_REQUEST_TABLE, "grouping",
                        "activity_type = " + literal(context, activityType)
                                + " AND ordering_seq = " + ordering));
        
        if(grouping == 0) {
            groupingOrderingList.add(ordering);
        }else {
            final List<Object[]> records = selectDbRecords(context, "select ordering_seq from helpdesk_sla_request where grouping="+grouping+" order by ordering_seq");
            for(Object[] record : records) {
                int groupOrdering = getIntegerValue(context,record[0]);
                groupingOrderingList.add(groupOrdering);
            }
        }
        
        return groupingOrderingList;
        
    }
    
    /**
     * Update ordering sequence.
     * 
     * Oracle doesn't support cascading update. When the ordering is changed, first a new record in
     * the request table is inserted and other tables are updated. Afterwards the original record is
     * deleted.
     * 
     * @param EventHandlerContext context
     * @param String activity_type
     * @param int ordering
     * @param int newOrdering
     */
    private void updateMatchOrderingSequence(final EventHandlerContext context,
            final String activity_type, final int matchOrdering, final int newMatchOrdering) {
        
        if (SchemaUtils.fieldExistsInSchema(Constants.SLA_REQUEST_TABLE, "match_ordering_seq")) {
            final String updateSql =
                    "UPDATE " + Constants.SLA_REQUEST_TABLE + " SET match_ordering_seq = "
                            + newMatchOrdering + " WHERE match_ordering_seq = " + matchOrdering
                            + " and activity_type = " + literal(context, activity_type);
            SqlUtils.executeUpdate(Constants.SLA_REQUEST_TABLE, updateSql);
        } else {
            updateOrderingSequence(context, activity_type, matchOrdering, newMatchOrdering);
        }
       
    }
    
    /**
     * Update ordering sequence.
     * 
     * Oracle doesn't support cascading update. When the ordering is changed, first a new record in
     * the request table is inserted and other tables are updated. Afterwards the original record is
     * deleted.
     * 
     * @param EventHandlerContext context
     * @param String activity_type
     * @param int ordering
     * @param int newOrdering
     */
    private void updateOrderingSequence(final EventHandlerContext context,
            final String activity_type, final int ordering, final int newOrdering) {
        
        //KB3042872 - copy workflow_name,service_name when update ordering sequence
        // int newOrdering = ordering+1;
        final String insert1 =
                "INSERT INTO " + Constants.SLA_REQUEST_TABLE + " ("
                        + Constants.SQL_SLA_REQUEST_FIELDS + ", grouping, ordering_seq) " + " SELECT "
                        + Constants.SQL_SLA_REQUEST_FIELDS + ", grouping, " + newOrdering + " FROM "
                        + Constants.SLA_REQUEST_TABLE + " WHERE activity_type = "
                        + literal(context, activity_type) + " AND ordering_seq = " + ordering;
        
        final String insert2 =
                "INSERT INTO " + Constants.SLA_RESPONSE_TABLE + " ("
                        + Constants.SQL_SLA_PARAMETER_NAMES
                        + ", activity_type, priority, ordering_seq,workflow_name,service_name,workflow_template, service_template) " + " SELECT "
                        + Constants.SQL_SLA_PARAMETER_NAMES + ", activity_type, priority, "
                        + newOrdering + ",workflow_name,service_name,workflow_template, service_template FROM " + Constants.SLA_RESPONSE_TABLE
                        + " WHERE activity_type = " + literal(context, activity_type)
                        + " AND ordering_seq = " + ordering;
        
        // String update1 = "UPDATE " + Constants.SLA_RESPONSE_TABLE + " SET ordering_seq =" +
        // newOrdering +
        // " WHERE activity_type = "+ literal(context,activity_type) +" AND ordering_seq = " +
        // ordering;
        
        final String update =
                "UPDATE " + Constants.SLA_STEPS_TABLE + " SET ordering_seq = " + newOrdering
                        + " WHERE activity_type = " + literal(context, activity_type)
                        + " AND ordering_seq = " + ordering;
        
        final String delete1 =
                "DELETE FROM " + Constants.SLA_RESPONSE_TABLE + " WHERE activity_type = "
                        + literal(context, activity_type) + " AND ordering_seq = " + ordering;
        
        final String delete2 =
                "DELETE FROM " + Constants.SLA_REQUEST_TABLE + " WHERE activity_type = "
                        + literal(context, activity_type) + " AND ordering_seq = " + ordering;
        
        final Vector<String> commands = new Vector<String>();
        commands.add(insert1);
        commands.add(insert2);
        commands.add(update);
        commands.add(delete1);
        commands.add(delete2);
        
        executeDbSqlCommands(context, commands, false);
        executeDbCommit(context);
    }
    
    /**
     * This method served as a custom refresh WFR new SLA interface grid
     * 
     * By Guo Jiangtao
     * 
     * @param Map<String, Object> parameters
     * 
     */
    public void getRequestParaters(final Map<String, Object> parameters) {
        
        // load grouping data source form the view
        final DataSource groupingDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw",
                    "slaRquestGroupingDS");
        // initialize the data source
        groupingDataSource.setContext();
        
        int recordLimit = 100;
        if(parameters.get("recordLimit")!=null) {
            recordLimit = (Integer)parameters.get("recordLimit");
        }
        
        //query all data go get all grouping code
        parameters.put("recordLimit", -1);
        
        // apply grid parameters to the data source
        if (parameters != null) {
            ReportUtility.handleParameters(groupingDataSource, parameters);
        }
        
        final List<DataRecord> requestParaters = new ArrayList<DataRecord>();
        final List<DataRecord> groupingList = groupingDataSource.getRecords();
        
        int targetPage = 1;
        if(parameters.get("targetPage")!=null) {
            targetPage = (Integer)parameters.get("targetPage");
        }
        
        int count = 0;
        for (int i = (targetPage - 1) * recordLimit; i < groupingList.size(); i++) {
            if (count < recordLimit) {
                final int group = groupingList.get(i).getInt("helpdesk_sla_request.grouping");
                requestParaters.add(this.getRequestParametersByGrouping(group));
                count++;
            }
        }
        
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(requestParaters);
        
        final JSONObject result = dataSet.toJSON();
        result.put("allCount",  groupingList.size());
        ContextStore.get().getEventHandlerContext().addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Get request parameter by grouping code.
     * 
     * By Guo Jiangtao
     * 
     * @param group grouping code
     */
    public DataRecord getRequestParametersByGrouping(final int group) {
        // load the request source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaRquestListDS");
        // load response data source form the view
        final DataSource responseDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaResponseDS");
        
        final List<DataRecord> requestSlaRecords =
                requestDataSource.getRecords("helpdesk_sla_request.grouping=" + group);
        
        final DataRecord requestParameters = requestDataSource.createRecord();
        requestParameters.setValue("helpdesk_sla_request.grouping", group);
        requestParameters.setValue("helpdesk_sla_request.prob_type",
            getMultipleFieldValues("helpdesk_sla_request.prob_type", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.site_id",
            getMultipleFieldValues("helpdesk_sla_request.site_id", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.bl_id",
            getMultipleFieldValues("helpdesk_sla_request.bl_id", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.fl_id",
            getMultipleFieldValues("helpdesk_sla_request.fl_id", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.rm_id",
            getMultipleFieldValues("helpdesk_sla_request.rm_id", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.requestor",
            getMultipleFieldValues("helpdesk_sla_request.requestor", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.em_std",
            getMultipleFieldValues("helpdesk_sla_request.em_std", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.dv_id",
            getMultipleFieldValues("helpdesk_sla_request.dv_id", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.dp_id",
            getMultipleFieldValues("helpdesk_sla_request.dp_id", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.eq_std",
            getMultipleFieldValues("helpdesk_sla_request.eq_std", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.eq_id",
            getMultipleFieldValues("helpdesk_sla_request.eq_id", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.pmp_id",
            getMultipleFieldValues("helpdesk_sla_request.pmp_id", requestSlaRecords));
        requestParameters.setValue("helpdesk_sla_request.default_priority", 
            requestSlaRecords.get(0).getInt("helpdesk_sla_request.default_priority"));
        
        final int order = requestSlaRecords.get(0).getInt("helpdesk_sla_request.ordering_seq");
        final List<DataRecord> responseSlaRecords =
                responseDataSource
                    .getRecords("helpdesk_sla_response.activity_type='SERVICE DESK - MAINTENANCE' AND helpdesk_sla_response.ordering_seq="
                            + order);
        if (responseSlaRecords.size() > 1) {
            requestParameters.setValue("helpdesk_sla_response.service_name", "Multiple Priorities");
            requestParameters
                .setValue("helpdesk_sla_response.workflow_name", "Multiple Priorities");
        } else if (responseSlaRecords.size() == 1) {
            requestParameters.setValue("helpdesk_sla_response.workflow_name", responseSlaRecords
                .get(0).getString("helpdesk_sla_response.workflow_name"));
            requestParameters.setValue("helpdesk_sla_response.service_name", responseSlaRecords
                .get(0).getString("helpdesk_sla_response.service_name"));
        }
        
        return requestParameters;
        
    }  
    
    /**
     * Get response parameters by grouping code
     * 
     * By Guo Jiangtao
     * 
     * @param group grouping code
     */
    public DataSetList getResponseParametersByGrouping(final int group) {
        // load the request data source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaRquestDS");
        // load the response data source form the view
        final DataSource responseDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaResponseDS");
        
        final List<DataRecord> requestSlaRecords =
                requestDataSource.getRecords("helpdesk_sla_request.grouping=" + group);
        
        final int order = requestSlaRecords.get(0).getInt("helpdesk_sla_request.ordering_seq");
        final List<DataRecord> responseSlaRecords =
                responseDataSource
                    .getRecords("helpdesk_sla_response.activity_type='SERVICE DESK - MAINTENANCE' AND helpdesk_sla_response.ordering_seq="
                            + order);
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(responseSlaRecords);
        
        return dataSet;
        
    }
    
    /**
     * Get response parameters by template.
     * 
     * By Guo Jiangtao
     * 
     * @param template template name
     * @param templateType template type
     */
    public DataSetList getResponseParametersByTemplate(final String template, final String templateType) {
        // load the response data source form the view
        final DataSource responseDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaResponseDS");
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("helpdesk_sla_response","activity_type", "SERVICE DESK - MAINTENANCE",Operation.EQUALS);
        restriction.addClause("helpdesk_sla_response",templateType+"_template", 1,Operation.EQUALS);
        restriction.addClause("helpdesk_sla_response",templateType+"_name", template,Operation.EQUALS);
        
        final List<DataRecord> responseSlaRecords = responseDataSource.getRecords(restriction);
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(responseSlaRecords);
        
        return dataSet;
    }
    
    /**
     * Get workflow steps by grouping.
     * 
     * By Guo Jiangtao
     * 
     * @param group grouping code
     */
    public DataSetList getWorkflowStepsByGrouping(final int group) {
        // load the request data source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaRquestDS");
        // load the workflow steps data source form the view
        final DataSource workflowStepsDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw",
                    "slaWorkflowStepsDS");
        
        final List<DataRecord> requestSlaRecords =
                requestDataSource.getRecords("helpdesk_sla_request.grouping=" + group);
        
        final int order = requestSlaRecords.get(0).getInt("helpdesk_sla_request.ordering_seq");
        final List<DataRecord> workflowStepsRecords =
                workflowStepsDataSource
                    .getRecords("helpdesk_sla_steps.activity_type='SERVICE DESK - MAINTENANCE' AND helpdesk_sla_steps.ordering_seq="
                            + order);
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(workflowStepsRecords);
        
        return dataSet;
        
    }
    
    /**
     * Get workflow steps by template 
     * 
     * By Guo Jiangtao
     * 
     * @param template template name
     * @param templateType template type
     */
    public DataSetList getWorkflowStepsByTemplate(final String template, final String templateType) {
        // load the response data source form the view
        final DataSource responseDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaResponseDS");
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("helpdesk_sla_response","activity_type", "SERVICE DESK - MAINTENANCE",Operation.EQUALS);
        restriction.addClause("helpdesk_sla_response",templateType+"_template", 1,Operation.EQUALS);
        restriction.addClause("helpdesk_sla_response",templateType+"_name", template,Operation.EQUALS);
        
        final List<DataRecord> responseSlaRecords = responseDataSource.getRecords(restriction);
        
        // load the workflow steps data source form the view
        final DataSource workflowStepsDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw",
                    "slaWorkflowStepsDS");
        
        final int order = responseSlaRecords.get(0).getInt("helpdesk_sla_response.ordering_seq");
        final int priority = responseSlaRecords.get(0).getInt("helpdesk_sla_response.priority");
        
        final String stepsRestriction = "helpdesk_sla_steps.activity_type='SERVICE DESK - MAINTENANCE' AND helpdesk_sla_steps.ordering_seq="
                + order+" AND helpdesk_sla_steps.priority="+priority;
        
        final List<DataRecord> workflowStepsRecords = workflowStepsDataSource.getRecords(stepsRestriction);
        
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(workflowStepsRecords);
        
        return dataSet;
        
    }
    
    /**
     * Get multiple field values from records 
     * 
     * By Guo Jiangtao
     * 
     * @param fieldName field name
     * @param records  records from database
     */
    private String getMultipleFieldValues(final String fieldName, final List<DataRecord> records) {
        final String SEPARATOR = ", \u200C";
        String fieldValues = "";
        for (final DataRecord record : records) {
            final String fieldValue = record.getString(fieldName);
            if (StringUtil.notNullOrEmpty(fieldValue)
                    && (fieldValues + SEPARATOR).indexOf(SEPARATOR + fieldValue + SEPARATOR) == -1) {
                fieldValues += SEPARATOR + fieldValue;
            }
        }
        
        if (StringUtil.notNullOrEmpty(fieldValues)) {
            fieldValues = fieldValues.substring(SEPARATOR.length());
        }
        
        return fieldValues;
    }
    
    /**
     * Check sla requst parameters conflict in existing rules 
     * 
     * By Guo Jiangtao
     * 
     * @param records records from user interface
     * @param grouping  grouping code
     */
    public boolean checkExistingRules(final JSONArray records, final int grouping, JobStatus status) {
        // @translatable
        final String checkConfictMessage = "Checking Conflict.";
        status.setMessage(EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
            checkConfictMessage, "com.archibus.eventhandler.sla.ServiceLevelAgreementHandler"));
        
        boolean isExisting = false;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        List orderSeqList = new ArrayList();
        if (grouping!=0) {
            orderSeqList = this.getOrderSeqListByGrouping(grouping);
        }
        status.setCurrentNumber(0);
        status.setTotalNumber(records.length());
        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {
                status.incrementCurrentNumber();
                final JSONObject record = records.getJSONObject(i);
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                final int ordering_seq = getOrderingSequenceForDefaultPriority(context, values);
                if (ordering_seq > 0 && !orderSeqList.contains(ordering_seq)) {
                    isExisting = true;
                    break;
                }
            }
        }
        
        return isExisting;
    }
    
    /**
     * Get order list by grouping code 
     * 
     * By Guo Jiangtao
     * 
     * @param grouping  grouping code
     */
    public List getOrderSeqListByGrouping(final int grouping) {
        final List orderSeqList = new ArrayList();
        // load the data source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaRquestDS");
        final List<DataRecord> slaRecords =
                requestDataSource.getRecords("helpdesk_sla_request.grouping=" + grouping);
        for (final DataRecord slaRecord : slaRecords) {
            orderSeqList.add(slaRecord.getInt("helpdesk_sla_request.ordering_seq"));
        }
        return orderSeqList;
    }
    
    /**
     * Get max grouping code in database.
     * 
     * By Guo Jiangtao
     */
    public int getMaxGrouping() {
        return DataStatistics.getIntWithoutVpa("helpdesk_sla_request", "grouping", "MAX");
    }
    
    
    /**
     * Save SLA object to databse.
     * 
     * By Guo Jiangtao
     * 
     * @param sla  SLA object
     */
    public void saveSLA(final JSONObject sla, JobStatus status) {
       
        final JSONObject requestParameters = sla.getJSONObject("requestParameters");
        final JSONArray slaRecords = getMultipleSlaRecords(requestParameters, status, true);
        
        if(!this.checkExistingRules(slaRecords, requestParameters.getInt("grouping"), status)) {
            if(slaRecords.length()>0) {
                saveRequestParameters(slaRecords, status);
                saveResponseParameters(sla, slaRecords.getJSONObject(0).getInt("helpdesk_sla_request.grouping"), status);
            }
           
        }else {
            // @translatable
            final String conflictMessage = "A rule with these request parameters already exists. The selected rule will not be changed.";
            status.setMessage(EventHandlerBase.localizeString(ContextStore.get()
                .getCurrentContext(), conflictMessage,
                "com.archibus.eventhandler.sla.ServiceLevelAgreementHandler"));
            
            status.setCode(JobStatus.JOB_FAILED);
        }
    }
    
    /**
     * Get multiple request parameter records from client input
     * 
     * By Guo Jiangtao
     * 
     * @param requestParameters  request parameters
     * @param validateField  do validate field or not
     */
    private JSONArray getMultipleSlaRecords(final JSONObject requestParameters, JobStatus status, final boolean validateField) {
        JSONArray records = new JSONArray();
        String[] siteIdArray = parseMultipleFieldValues(requestParameters.getString("siteId"));
        String[] blIdArray = parseMultipleFieldValues(requestParameters.getString("blId"));
        String[] flIdArray = parseMultipleFieldValues(requestParameters.getString("flId"));
        String[] rmIdArray = parseMultipleFieldValues(requestParameters.getString("rmId"));
        String[] requestorArray = parseMultipleFieldValues(requestParameters.getString("requestor"));
        String[] emStdArray = parseMultipleFieldValues(requestParameters.getString("emStd"));
        String[] dvIdArray = parseMultipleFieldValues(requestParameters.getString("dvId"));
        String[] dpIdArray = parseMultipleFieldValues(requestParameters.getString("dpId"));
        String[] probTypeArray = parseMultipleFieldValues(requestParameters.getString("probType"));
        String[] eqStdArray = parseMultipleFieldValues(requestParameters.getString("eqStd"));
        String[] eqIdArray = parseMultipleFieldValues(requestParameters.getString("eqId"));
        String[] pmpIdArray = parseMultipleFieldValues(requestParameters.getString("pmpId"));
        
        int grouping = requestParameters.getInt("grouping");
        List orderSeqList = null;
        if(grouping==0) {
            orderSeqList = new ArrayList();
            grouping = this.getMaxGrouping()+1;
        }else {
            orderSeqList = getOrderSeqListByGrouping(grouping);
        }
        
        int count = 0;
        status.setTotalNumber(siteIdArray.length*blIdArray.length*flIdArray.length*rmIdArray.length*requestorArray.length*emStdArray.length*dvIdArray.length*dpIdArray.length*probTypeArray.length*eqStdArray.length*eqIdArray.length*pmpIdArray.length);
        for (int siteIndex = 0; siteIndex < siteIdArray.length; siteIndex++) {
            for (int blIndex = 0; blIndex < blIdArray.length; blIndex++) {
                for (int flIndex = 0; flIndex < flIdArray.length; flIndex++) {
                    for (int rmIndex = 0; rmIndex < rmIdArray.length; rmIndex++) {
                        for (int requestorIndex = 0; requestorIndex < requestorArray.length; requestorIndex++) {
                            for (int emStdIndex = 0; emStdIndex < emStdArray.length; emStdIndex++) {
                                for (int dvIndex = 0; dvIndex < dvIdArray.length; dvIndex++) {
                                    for (int dpIndex = 0; dpIndex < dpIdArray.length; dpIndex++) {
                                        for (int probTypeIndex = 0; probTypeIndex < probTypeArray.length; probTypeIndex++) {
                                            for (int eqStdIndex = 0; eqStdIndex < eqStdArray.length; eqStdIndex++) {
                                                for (int eqIndex = 0; eqIndex < eqIdArray.length ; eqIndex++) {
                                                    for (int pmpIndex = 0; pmpIndex < pmpIdArray.length; pmpIndex++) {
                                                        status.incrementCurrentNumber();                                                        
                                                        JSONObject record = new JSONObject();
                                                        record.put("helpdesk_sla_request.site_id", siteIdArray[siteIndex]);
                                                        record.put("helpdesk_sla_request.bl_id", blIdArray[blIndex]);
                                                        record.put("helpdesk_sla_request.fl_id", flIdArray[flIndex]);
                                                        record.put("helpdesk_sla_request.rm_id", rmIdArray[rmIndex]);
                                                        record.put("helpdesk_sla_request.requestor", requestorArray[requestorIndex]);
                                                        record.put("helpdesk_sla_request.em_std", emStdArray[emStdIndex]);
                                                        record.put("helpdesk_sla_request.dv_id", dvIdArray[dvIndex]);
                                                        record.put("helpdesk_sla_request.dp_id", dpIdArray[dpIndex]);
                                                        record.put("helpdesk_sla_request.prob_type", probTypeArray[probTypeIndex]);
                                                        record.put("helpdesk_sla_request.eq_std", eqStdArray[eqStdIndex]);
                                                        record.put("helpdesk_sla_request.eq_id", eqIdArray[eqIndex]);
                                                        record.put("helpdesk_sla_request.pmp_id", pmpIdArray[pmpIndex]);
                                                        record.put("helpdesk_sla_request.default_priority", requestParameters.getString("defaultPriority"));
                                                        record.put("helpdesk_sla_request.activity_type", "SERVICE DESK - MAINTENANCE");
                                                        if(!validateField || validateSlaRecord(record)) {
                                                            if(count< orderSeqList.size()) {
                                                                record.put("helpdesk_sla_request.ordering_seq", orderSeqList.get(count));
                                                            }else {
                                                                record.put("helpdesk_sla_request.ordering_seq", 0);
                                                            }
                                                            
                                                            record.put("helpdesk_sla_request.grouping", grouping);
                                                            records.put(record);
                                                            count++;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return records;
    }
    
    /**
     * Valide sla record before saveing to the database
     * 
     * By Guo Jiangtao
     * 
     * @param record  field value
     * @return is validate true, else false
     */
    private boolean validateSlaRecord(final JSONObject record) {
        final String siteId = record.getString("helpdesk_sla_request.site_id");
        final String blId = record.getString("helpdesk_sla_request.bl_id");
        final String flId = record.getString("helpdesk_sla_request.fl_id");
        final String rmId = record.getString("helpdesk_sla_request.rm_id");
        
        
        if(StringUtil.notNullOrEmpty(blId)) {
            if(StringUtil.notNullOrEmpty(siteId)) {
                if(DataStatistics.getInt("bl", "bl_id", "count", "bl_id='"+SqlUtils.makeLiteralOrBlank(blId)+"' AND site_id='"+SqlUtils.makeLiteralOrBlank(siteId)+"'")==0) {
                    return false;
                }
            }else {
                if(DataStatistics.getInt("bl", "bl_id", "count", "bl_id='"+SqlUtils.makeLiteralOrBlank(blId)+"' AND site_id IS NULL")==0) {
                    return false;
                }
            }
           
        }
        
        
        if(StringUtil.notNullOrEmpty(blId) && StringUtil.notNullOrEmpty(flId)) {
            if(DataStatistics.getInt("fl", "fl_id", "count", "bl_id='"+SqlUtils.makeLiteralOrBlank(blId)+"' AND fl_id='"+SqlUtils.makeLiteralOrBlank(flId)+"'")==0) {
                return false;
            }
        }
        
        if(StringUtil.notNullOrEmpty(blId) && StringUtil.notNullOrEmpty(flId) && StringUtil.notNullOrEmpty(rmId)) {
            if(DataStatistics.getInt("rm", "rm_id", "count", "bl_id='"+SqlUtils.makeLiteralOrBlank(blId)+"' AND fl_id='"+SqlUtils.makeLiteralOrBlank(flId)+"'"+" AND rm_id='"+SqlUtils.makeLiteralOrBlank(rmId)+"'")==0) {
                return false;
            }
        }
        
        final String dvId = record.getString("helpdesk_sla_request.dv_id");
        final String dpId = record.getString("helpdesk_sla_request.dp_id");
        
        if(StringUtil.notNullOrEmpty(dvId) && StringUtil.notNullOrEmpty(dpId)) {
            if(DataStatistics.getInt("dp", "dp_id", "count", "dv_id='"+SqlUtils.makeLiteralOrBlank(dvId)+"' AND dp_id='"+SqlUtils.makeLiteralOrBlank(dpId)+"'")==0) {
                return false;
            }
        }
        
        final String requestor = record.getString("helpdesk_sla_request.requestor");
        final String emStd = record.getString("helpdesk_sla_request.em_std");
        
        if(StringUtil.notNullOrEmpty(requestor)) {
            if(StringUtil.notNullOrEmpty(emStd)) {
                if(DataStatistics.getInt("em", "em_id", "count", "em_id='"+SqlUtils.makeLiteralOrBlank(requestor)+"' AND em_std='"+SqlUtils.makeLiteralOrBlank(emStd)+"'")==0) {
                    return false;
                }
            }else {
                if(DataStatistics.getInt("em", "em_id", "count", "em_id='"+SqlUtils.makeLiteralOrBlank(requestor)+"' AND em_std is NULL")==0) {
                    return false;
                }
            }
        }
        
        final String eqId = record.getString("helpdesk_sla_request.eq_id");
        final String eqStd = record.getString("helpdesk_sla_request.eq_std");
        
        if(StringUtil.notNullOrEmpty(eqId)) {
            if(StringUtil.notNullOrEmpty(eqStd)) {
                if(DataStatistics.getInt("eq", "eq_id", "count", "eq_id='"+SqlUtils.makeLiteralOrBlank(eqId)+"' AND eq_std='"+SqlUtils.makeLiteralOrBlank(eqStd)+"'")==0) {
                    return false;
                }
            }else {
                if(DataStatistics.getInt("eq", "eq_id", "count", "eq_id='"+SqlUtils.makeLiteralOrBlank(eqId)+"' AND eq_std IS NULL")==0) {
                    return false;
                }
            }
        }
        
        return true;    
    }
    
    /**
     * Parse multiple values and store the max length of the values
     * 
     * By Guo Jiangtao
     * 
     * @param fieldValue  field value
     */
    private String[] parseMultipleFieldValues(final String fieldValue) {
        final String SEPARATOR = ", \u200C";
        String[] values = new String[0];
        if (fieldValue.indexOf(SEPARATOR) != -1) {
            values = fieldValue.split(SEPARATOR);
            if (values.length == 1) {
                values = new String[] { values[0], "" };
            }
        } else {
            if (StringUtil.isNullOrEmpty(fieldValue)) {
                values = new String[] { "" };
            } else {
                values = new String[] { fieldValue };
            }
        }
        
        return values;
    }
    
    /**
     * Save request paramters
     * 
     * By Guo Jiangtao
     * 
     * @param records  request paramters records
     */
    private void saveRequestParameters(final JSONArray records, JobStatus status) {
        // @translatable
        final String message = "Saving Request Parameters.";
        status.setMessage(EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
            message, "com.archibus.eventhandler.sla.ServiceLevelAgreementHandler"));
        
        status.setCurrentNumber(0);
        status.setTotalNumber(records.length());
        if(records.length()>0) {
            String match_ordering_seq_field = getMatchOrderingSeqField();
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            List orderSeqList = getOrderSeqListByGrouping(records.getJSONObject(0).getInt("helpdesk_sla_request.grouping"));
            
            // load the request data source form the view
            final DataSource requestDataSource =
                    DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaRquestDS");
            
            boolean isNewMatchField = SchemaUtils.fieldExistsInSchema(Constants.SLA_REQUEST_TABLE, "match_ordering_seq");
            if (SchemaUtils.fieldExistsInSchema(Constants.SLA_REQUEST_TABLE, "match_ordering_seq")) {
                requestDataSource.addField("helpdesk_sla_request", "match_ordering_seq");
            }
            
            
            for ( int i = 0; i < records.length(); i++) {
                status.incrementCurrentNumber();
                JSONObject record =  records.getJSONObject(i);
                DataRecord requestRecord = requestDataSource.createNewRecord();
                requestRecord.setValue("helpdesk_sla_request.site_id", record.getString("helpdesk_sla_request.site_id"));
                requestRecord.setValue("helpdesk_sla_request.bl_id", record.getString("helpdesk_sla_request.bl_id"));
                requestRecord.setValue("helpdesk_sla_request.fl_id", record.getString("helpdesk_sla_request.fl_id"));
                requestRecord.setValue("helpdesk_sla_request.rm_id", record.getString("helpdesk_sla_request.rm_id"));
                requestRecord.setValue("helpdesk_sla_request.requestor", record.getString("helpdesk_sla_request.requestor"));
                requestRecord.setValue("helpdesk_sla_request.em_std", record.getString("helpdesk_sla_request.em_std"));
                requestRecord.setValue("helpdesk_sla_request.dv_id", record.getString("helpdesk_sla_request.dv_id"));
                requestRecord.setValue("helpdesk_sla_request.dp_id", record.getString("helpdesk_sla_request.dp_id"));
                requestRecord.setValue("helpdesk_sla_request.prob_type", record.getString("helpdesk_sla_request.prob_type"));
                requestRecord.setValue("helpdesk_sla_request.eq_std", record.getString("helpdesk_sla_request.eq_std"));
                requestRecord.setValue("helpdesk_sla_request.eq_id", record.getString("helpdesk_sla_request.eq_id"));
                requestRecord.setValue("helpdesk_sla_request.pmp_id", record.getString("helpdesk_sla_request.pmp_id"));
                requestRecord.setValue("helpdesk_sla_request.default_priority", record.getInt("helpdesk_sla_request.default_priority"));
                requestRecord.setValue("helpdesk_sla_request.grouping", record.getInt("helpdesk_sla_request.grouping"));
                requestRecord.setValue("helpdesk_sla_request.activity_type", "SERVICE DESK - MAINTENANCE");
               
                
                if(record.getInt("helpdesk_sla_request.ordering_seq")==0) {
                    final Map fieldValues = parseJSONObject(context, record);
                    final Map values = stripPrefix(fieldValues);
                    //KB3046694 - for SLA console, call same method getOrderingSequenceForNewRule() with legecy SLA interface to get the new rule ordering sequence 
                    values.remove("default_priority");
                    int newMatchOrderSeq = getMatchOrderingSequenceForNewRule(context, values);
                    int maxOrderSeq = DataStatistics.getIntWithoutVpa("helpdesk_sla_request", "ordering_seq", "MAX","helpdesk_sla_request.activity_type='SERVICE DESK - MAINTENANCE'");
                    
                    final List checkGapRecords =
                            selectDbRecords(context,
                                "SELECT "+match_ordering_seq_field+" FROM " + Constants.SLA_REQUEST_TABLE
                                        + " WHERE activity_type= 'SERVICE DESK - MAINTENANCE' AND "+match_ordering_seq_field+" >= " + newMatchOrderSeq
                                        + " ORDER BY "+match_ordering_seq_field+" DESC ");
                    
                    int gapPosition = newMatchOrderSeq;
                    for (int index = checkGapRecords.size() - 1; index >= 0; index--) {
                        final Object[] recordValues = (Object[]) checkGapRecords.get(index);
                        final Integer ordering = getIntegerValue(context, recordValues[0]);
                        if (gapPosition != ordering) {
                            break;
                        }
                        
                        gapPosition++;
                    }
                    
                    for(int index = gapPosition-1; index >= newMatchOrderSeq; index--) {
                        this.updateMatchOrderingSequence(context, "SERVICE DESK - MAINTENANCE", index, index + 1);
                    }
                    
                    if(isNewMatchField) {
                        requestRecord.setValue("helpdesk_sla_request.match_ordering_seq",  newMatchOrderSeq);
                        requestRecord.setValue("helpdesk_sla_request.ordering_seq",  maxOrderSeq+1);
                    }else {
                        requestRecord.setValue("helpdesk_sla_request.ordering_seq",  newMatchOrderSeq);
                    }
                  
                    requestDataSource.saveRecord(requestRecord);
                    
                }else {
                    requestRecord.setNew(false);
                    requestRecord.setValue("helpdesk_sla_request.ordering_seq", record.getInt("helpdesk_sla_request.ordering_seq"));
                    requestDataSource.updateRecord(requestRecord);
                }
            }
            
            if(orderSeqList.size()>records.length()) {
                JSONArray deleteRecords = new JSONArray();
                for ( int i = records.length(); i < orderSeqList.size(); i++) {
                    JSONObject record = new JSONObject();
                    record.put("helpdesk_sla_request.activity_type","SERVICE DESK - MAINTENANCE");
                    record.put("helpdesk_sla_request.ordering_seq",orderSeqList.get(i));
                    deleteRecords.put(record);
                }
                
                this.deleteRules(deleteRecords);
            }
            
            SqlUtils.executeUpdate("helpdesk_sla_request", "UPDATE helpdesk_sla_request SET default_priority = NULL WHERE default_priority = 0");
        }
    }
    
    /**
     * Save response paramters
     * 
     * By Guo Jiangtao
     * 
     * @param sla  SLA object
     * @param group grouping code
     */
    private void saveResponseParameters(final JSONObject sla, final int grouping, JobStatus status) {
        // @translatable
        final String message = "Saving Response Parameters.";
        status.setMessage(EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
            message, "com.archibus.eventhandler.sla.ServiceLevelAgreementHandler"));
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // load the request data source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaRquestDS");
        // load the response data source form the view
        final DataSource responseDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaResponseDS");
        
        // load the workflow steps data source form the view
        final DataSource workflowStepsDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw",
                    "slaWorkflowStepsDS");
        
        final List<DataRecord> requestSlaRecords =
                requestDataSource.getRecords("helpdesk_sla_request.grouping=" + grouping);
        final JSONArray responseParameters = sla.getJSONArray("responseParameters");
        final String lang = getUserLanguage(context);
        
        status.setCurrentNumber(0);
        status.setTotalNumber(requestSlaRecords.size());
        for(DataRecord requestSlaRecord : requestSlaRecords) {
            status.incrementCurrentNumber();
            final int order = requestSlaRecord.getInt("helpdesk_sla_request.ordering_seq");
            final List<DataRecord> responseSlaRecords =
                    responseDataSource
                        .getRecords("helpdesk_sla_response.activity_type='SERVICE DESK - MAINTENANCE' AND helpdesk_sla_response.ordering_seq="
                                + order);
            
            for(DataRecord responseSlaRecord : responseSlaRecords) {
                responseDataSource.deleteRecord(responseSlaRecord);
            }
            
            for(int i=0; i<responseParameters.length();i++) {
                JSONObject responseParameter =  responseParameters.getJSONObject(i);
                DataRecord responseSlaRecord = responseDataSource.createNewRecord();
                responseSlaRecord.setValue("helpdesk_sla_response.activity_type","SERVICE DESK - MAINTENANCE");
                responseSlaRecord.setValue("helpdesk_sla_response.ordering_seq",requestSlaRecord.getInt("helpdesk_sla_request.ordering_seq"));
                responseSlaRecord.setValue("helpdesk_sla_response.priority",responseParameter.getInt("priorityLevel"));
                responseSlaRecord.setValue("helpdesk_sla_response.priority_label",responseParameter.getString("priorityLevelLabel"));
                
                //KB3046517 - keep the translate string for priority labels
                if(i<responseSlaRecords.size()) {
                    setPriorityLabel(responseSlaRecord,responseSlaRecords.get(i));
                }
                
                if (!lang.equals("en")) {
                    responseSlaRecord.setValue("helpdesk_sla_response.priority_label_"+lang,responseParameter.getString("priorityLevelLabel"));
                }
                
                responseSlaRecord.setValue("helpdesk_sla_response.autocreate_wr",1);
                responseSlaRecord.setValue("helpdesk_sla_response.autoapprove",responseParameter.getBoolean("autoApprove")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.autocreate_wo",responseParameter.getBoolean("autoCreateWo")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.autoissue",responseParameter.getBoolean("autoIssue")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.autoschedule",responseParameter.getBoolean("autoSchedule")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.autodispatch",responseParameter.getBoolean("autoDispatch")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.supervisor",responseParameter.getString("supervisor"));
                responseSlaRecord.setValue("helpdesk_sla_response.work_team_id",responseParameter.getString("workTeam"));
                responseSlaRecord.setValue("helpdesk_sla_response.cf_id",responseParameter.getString("cfId"));
                if(SchemaUtils.fieldExistsInSchema(Constants.SLA_RESPONSE_TABLE, "cf_role")) {
                    responseSlaRecord.setValue("helpdesk_sla_response.cf_role",responseParameter.getString("cfRole"));
                }
                
                responseSlaRecord.setValue("helpdesk_sla_response.default_duration",responseParameter.getInt("duration"));
                
                //KB3025102 -  allow for configurable craftsperson assignment on autoscheduling 
                if(SchemaUtils.fieldExistsInSchema("helpdesk_sla_response", "schedule_immediately")) {
                    responseSlaRecord.setValue("helpdesk_sla_response.schedule_immediately",responseParameter.getBoolean("scheduleimmediately")?1:0);
                }
                
                //KB3047456 - add new field enforce_new_workflow for v22.1
                if(SchemaUtils.fieldExistsInSchema("helpdesk_sla_response", "enforce_new_workflow")) {
                    responseSlaRecord.setValue("helpdesk_sla_response.enforce_new_workflow",responseParameter.getBoolean("enforceNewWorkflow")?1:0);
                }
                
                responseSlaRecord.setValue("helpdesk_sla_response.notify_requestor",responseParameter.getBoolean("notifyRequestor")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.notify_service_provider",responseParameter.getBoolean("notifySupervisor")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.notify_craftsperson",responseParameter.getBoolean("notifyCraftsperson")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.serv_window_start",getTimeValueFromNeutral(context, 
                    responseParameter.getString("servWindowStart").trim()));
                responseSlaRecord.setValue("helpdesk_sla_response.serv_window_end",getTimeValueFromNeutral(context, 
                    responseParameter.getString("servWindowEnd").trim()));
                responseSlaRecord.setValue("helpdesk_sla_response.serv_window_days",responseParameter.getString("servWindoDays"));
                responseSlaRecord.setValue("helpdesk_sla_response.allow_work_on_holidays",responseParameter.getBoolean("allowWorkOnHoliday")?1:0);
                responseSlaRecord.setValue("helpdesk_sla_response.manager",responseParameter.getString("manager"));
                responseSlaRecord.setValue("helpdesk_sla_response.servcont_id",responseParameter.getString("contractId"));
                responseSlaRecord.setValue("helpdesk_sla_response.time_to_respond",responseParameter.getInt("timeToRespond"));
                responseSlaRecord.setValue("helpdesk_sla_response.interval_to_respond",responseParameter.getString("intervalToRespond"));
                responseSlaRecord.setValue("helpdesk_sla_response.time_to_complete",responseParameter.getInt("timeToComplete"));
                responseSlaRecord.setValue("helpdesk_sla_response.interval_to_complete",responseParameter.getString("intervalToComplete"));
                responseSlaRecord.setValue("helpdesk_sla_response.workflow_name",responseParameter.getString("workflowName"));
                responseSlaRecord.setValue("helpdesk_sla_response.workflow_template",responseParameter.getInt("workflowTemplate"));
                responseSlaRecord.setValue("helpdesk_sla_response.service_name",responseParameter.getString("serviceName"));
                responseSlaRecord.setValue("helpdesk_sla_response.service_template",responseParameter.getInt("serviceTemplate"));
                responseSlaRecord.setValue("helpdesk_sla_response.status","Active");
                responseDataSource.saveRecord(responseSlaRecord);
                
                final JSONArray workflowSteps = responseParameter.getJSONArray("workflowSteps");
                for(int j=0; j<workflowSteps.length();j++) {
                    JSONObject workflowStep =  workflowSteps.getJSONObject(j);
                    DataRecord workflowStepRecord = workflowStepsDataSource.createNewRecord();
                    workflowStepRecord.setValue("helpdesk_sla_steps.activity_id","AbBldgOpsOnDemandWork");
                    workflowStepRecord.setValue("helpdesk_sla_steps.activity_type","SERVICE DESK - MAINTENANCE");
                    workflowStepRecord.setValue("helpdesk_sla_steps.ordering_seq",requestSlaRecord.getInt("helpdesk_sla_request.ordering_seq"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.priority",responseParameter.getInt("priorityLevel"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.status",workflowStep.getString("basicStatus"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.step_order",workflowStep.getInt("stepOrder"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.cf_id",workflowStep.getString("cfId"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.condition",workflowStep.getString("sqlCondition"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.em_id",workflowStep.getString("emId"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.multiple_required",workflowStep.getBoolean("multipleRequired")?1:0);
                    workflowStepRecord.setValue("helpdesk_sla_steps.notify_responsible",workflowStep.getBoolean("notifyResponse")?1:0);
                    workflowStepRecord.setValue("helpdesk_sla_steps.role",workflowStep.getString("roleId"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.role_name",workflowStep.getString("afmRole"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.step",workflowStep.getString("stepName"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.step_status","");
                    workflowStepRecord.setValue("helpdesk_sla_steps.step_type",workflowStep.getString("stepType"));
                    workflowStepRecord.setValue("helpdesk_sla_steps.vn_id",workflowStep.getString("vnId"));
                    workflowStepsDataSource.saveRecord(workflowStepRecord);
                }
            }
        }
        
        SqlUtils.executeUpdate("helpdesk_sla_response", "UPDATE helpdesk_sla_response SET default_duration = NULL WHERE default_duration = 0");
        SqlUtils.executeUpdate("helpdesk_sla_response", "UPDATE helpdesk_sla_response SET time_to_respond = NULL WHERE time_to_respond = 0");
        SqlUtils.executeUpdate("helpdesk_sla_response", "UPDATE helpdesk_sla_response SET time_to_complete = NULL WHERE time_to_complete = 0");
    }
    
    /**
     * Set Priority Lable
     * 
     * By Guo Jiangtao
     * 
     * @param newResponseRecord  newResponseRecord
     * @param oldResponseRecord  oldResponseRecord
     */
    private void setPriorityLabel(final DataRecord newResponseRecord,final DataRecord oldResponseRecord) {
        //newResponseRecord.setValue("helpdesk_sla_response.priority_label",oldResponseRecord.getValue("helpdesk_sla_response.priority_label"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_ch", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_ch"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_de", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_de"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_es", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_es"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_fr", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_fr"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_it", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_it"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_jp", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_jp"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_ko", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_ko"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_nl", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_nl"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_no", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_no"));
        newResponseRecord.setValue("helpdesk_sla_response.priority_label_zh", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_zh"));
		newResponseRecord.setValue("helpdesk_sla_response.priority_label_01", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_01"));
		newResponseRecord.setValue("helpdesk_sla_response.priority_label_02", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_02"));
		newResponseRecord.setValue("helpdesk_sla_response.priority_label_03", oldResponseRecord.getValue("helpdesk_sla_response.priority_label_03"));
        
    }
    
    /**
     * Check valid foreign keys fro request parameters
     * 
     * By Guo Jiangtao
     * 
     * @param table  table name
     * @param record json record
     */
    private JSONObject getResponseJsonRecord(final JSONObject responseParameter) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        JSONObject record =  new JSONObject();
        record.put("helpdesk_sla_response.priority",responseParameter.getInt("priorityLevel"));
        record.put("helpdesk_sla_response.priority",responseParameter.getInt("priorityLevel"));
        record.put("helpdesk_sla_response.priority_label",responseParameter.getString("priorityLevelLabel"));
        record.put("helpdesk_sla_response.autocreate_wr",1);
        record.put("helpdesk_sla_response.autoapprove",responseParameter.getBoolean("autoApprove")?1:0);
        record.put("helpdesk_sla_response.autocreate_wo",responseParameter.getBoolean("autoCreateWo")?1:0);
        record.put("helpdesk_sla_response.autoissue",responseParameter.getBoolean("autoIssue")?1:0);
        record.put("helpdesk_sla_response.autoschedule",responseParameter.getBoolean("autoSchedule")?1:0);
        record.put("helpdesk_sla_response.autodispatch",responseParameter.getBoolean("autoDispatch")?1:0);
        record.put("helpdesk_sla_response.supervisor",responseParameter.getString("supervisor"));
        record.put("helpdesk_sla_response.work_team_id",responseParameter.getString("workTeam"));
        record.put("helpdesk_sla_response.cf_id",responseParameter.getString("cfId"));
        if(SchemaUtils.fieldExistsInSchema(Constants.SLA_RESPONSE_TABLE, "cf_role")) {
            record.put("helpdesk_sla_response.cf_role",responseParameter.getString("cfRole"));
        }
        
        record.put("helpdesk_sla_response.default_duration",responseParameter.getInt("duration"));
        record.put("helpdesk_sla_response.notify_requestor",responseParameter.getBoolean("notifyRequestor")?1:0);
        record.put("helpdesk_sla_response.notify_service_provider",responseParameter.getBoolean("notifySupervisor")?1:0);
        record.put("helpdesk_sla_response.notify_craftsperson",responseParameter.getBoolean("notifyCraftsperson")?1:0);
        record.put("helpdesk_sla_response.serv_window_start",getTimeValueFromNeutral(context, 
            responseParameter.getString("servWindowStart").trim()));
        record.put("helpdesk_sla_response.serv_window_end",getTimeValueFromNeutral(context, 
            responseParameter.getString("servWindowEnd").trim()));
        record.put("helpdesk_sla_response.serv_window_days",responseParameter.getString("servWindoDays"));
        record.put("helpdesk_sla_response.allow_work_on_holidays",responseParameter.getBoolean("allowWorkOnHoliday")?1:0);
        record.put("helpdesk_sla_response.manager",responseParameter.getString("manager"));
        record.put("helpdesk_sla_response.servcont_id",responseParameter.getString("contractId"));
        record.put("helpdesk_sla_response.time_to_respond",responseParameter.getInt("timeToRespond"));
        record.put("helpdesk_sla_response.interval_to_respond",responseParameter.getString("intervalToRespond"));
        record.put("helpdesk_sla_response.time_to_complete",responseParameter.getInt("timeToComplete"));
        record.put("helpdesk_sla_response.interval_to_complete",responseParameter.getString("intervalToComplete"));
        record.put("helpdesk_sla_response.workflow_name",responseParameter.getString("workflowName"));
        record.put("helpdesk_sla_response.workflow_template",responseParameter.getInt("workflowTemplate"));
        record.put("helpdesk_sla_response.service_name",responseParameter.getString("serviceName"));
        record.put("helpdesk_sla_response.service_template",responseParameter.getInt("serviceTemplate"));
        record.put("helpdesk_sla_response.status","Active");
        return record;
    }
    
    /**
     * Check valid foreign keys fro request parameters
     * 
     * By Guo Jiangtao
     * 
     * @param table  table name
     * @param record json record
     */
    private JSONObject getStepJsonRecord(final JSONObject workflowStep) {
        JSONObject record =  new JSONObject();
        record.put("helpdesk_sla_steps.activity_id","AbBldgOpsOnDemandWork");
        record.put("helpdesk_sla_steps.activity_type","SERVICE DESK - MAINTENANCE");
        record.put("helpdesk_sla_steps.status",workflowStep.getString("basicStatus"));
        record.put("helpdesk_sla_steps.step_order",workflowStep.getInt("stepOrder"));
        record.put("helpdesk_sla_steps.cf_id",workflowStep.getString("cfId"));
        record.put("helpdesk_sla_steps.condition",workflowStep.getString("sqlCondition"));
        record.put("helpdesk_sla_steps.em_id",workflowStep.getString("emId"));
        record.put("helpdesk_sla_steps.multiple_required",workflowStep.getBoolean("multipleRequired")?1:0);
        record.put("helpdesk_sla_steps.notify_responsible",workflowStep.getBoolean("notifyResponse")?1:0);
        record.put("helpdesk_sla_steps.role",workflowStep.getString("roleId"));
        record.put("helpdesk_sla_steps.role_name",workflowStep.getString("afmRole"));
        record.put("helpdesk_sla_steps.step",workflowStep.getString("stepName"));
        record.put("helpdesk_sla_steps.step_status","");
        record.put("helpdesk_sla_steps.step_type",workflowStep.getString("stepType"));
        record.put("helpdesk_sla_steps.vn_id",workflowStep.getString("vnId"));
        return record;
    }
    
    /**
     * Check valid foreign keys fro request parameters
     * 
     * By Guo Jiangtao
     * 
     * @param requestParameters json record
     */
    public void checkValidForeignKeysForRequestParameters(final JSONObject requestParameters) {
        //redesign the validation logic for request parameters for performance issues (KB3045699) 2014-11-05
        String[] tableNames =
                { "site", "bl", "fl", "rm", "em", "emstd", "dv", "dp", "probtype", "eqstd", "eq",
                        "pmp" };
        String[] fieldNames =
                { "site_id", "bl_id", "fl_id", "rm_id", "em_id", "em_std", "dv_id", "dp_id",
                        "prob_type", "eq_std", "eq_id", "pmp_id" };
        String[] parameterNames =
                { "siteId", "blId", "flId", "rmId", "requestor", "emStd", "dvId", "dpId",
                        "probType", "eqStd", "eqId", "pmpId" };
        for (int i = 0; i < tableNames.length; i++) {
            String tableName = tableNames[i];
            String fieldName = fieldNames[i];
            String parameterValues = requestParameters.getString(parameterNames[i]);
            final List<String> fieldValues = new ArrayList<String>();
            
            final String SEPARATOR = ", \u200C";
            
            if (parameterValues.indexOf(SEPARATOR) != -1) {
                String[] values = parameterValues.split(SEPARATOR);
                for(String value : values) {
                    fieldValues.add(value);
                }
            } else {
                if (!StringUtil.isNullOrEmpty(parameterValues)) {
                    fieldValues.add(parameterValues);
                }
            }
            
            if (fieldValues.size() > 0) {
                DataSource ds =
                        DataSourceFactory.createDataSource().addTable(tableName)
                            .addField(fieldName);
                if ("fl".equals(tableName)) {
                    ds.addField("bl_id");
                } else if ("rm".equals(tableName)) {
                    ds.addField("bl_id");
                    ds.addField("fl_id");
                } else if ("dp".equals(tableName)) {
                    ds.addField("dv_id");
                }
                
                final ParsedRestrictionDef restricition = new ParsedRestrictionDef();
                if(fieldValues.size() == 1) {
                    restricition.addClause(tableName, fieldName, fieldValues.get(0), Operation.EQUALS);
                }else {
                    restricition.addClause(tableName, fieldName, fieldValues, Operation.IN);
                }
                
                if ("fl".equals(tableName)) {
                    restricition.addClause("fl", "bl_id", requestParameters.getString("blId"),
                        Operation.EQUALS);
                } else if ("rm".equals(tableName)) {
                    restricition.addClause("rm", "bl_id", requestParameters.getString("blId"),
                        Operation.EQUALS);
                    restricition.addClause("rm", "fl_id", requestParameters.getString("flId"),
                        Operation.EQUALS);
                } else if ("dp".equals(tableName)) {
                    restricition.addClause("dp", "dv_id", requestParameters.getString("dvId"),
                        Operation.EQUALS);
                }
                
                if (ds.getRecords(restricition).size() != fieldValues.size()) {
                    // @translatable
                    String errorMessage =
                            "A value for one of the fields, [{0}] is not correct. The value must exist in [{1}] table.";
                    
                    final ExceptionBase exception = new ExceptionBase();
                    exception.setPattern(errorMessage);
                    exception.setTranslatable(true);
                    
                    ArchibusFieldDefBase.Immutable fieldDef = ContextStore.get().getProject().loadTableDef(tableName).findFieldDef(fieldName);
                    String title = "";
                    for (Iterator it = fieldDef.getMultiLineHeadings(ContextStore.get().getLocale()).iterator(); it.hasNext();) {
                        title += (it.next());
                        if (it.hasNext()) {
                            title += (" ");
                        }
                    }
                    
                    final Object[] args =
                            {
                                    title,
                                    ContextStore.get().getProject().loadTableDef(tableName)
                                        .getHeading(ContextStore.get().getLocale()) };
                    exception.setArgs(args);

                    throw exception;
                }
            }
        }
    }
    
    /**
     * Check valid foreign keys fro response parameters
     * 
     * By Guo Jiangtao
     * 
     * @param responseParameter json record
     */
    public void checkValidForeignKeysForResponseParameters(final JSONObject responseParameter) {
        String[] fields = { "cf_id", "work_team_id", "supervisor", "servcont_id","manager"};
        JSONObject responserecord = this.getResponseJsonRecord(responseParameter);
        checkValidForeignKeys("helpdesk_sla_response", fields, stripPrefix(EventHandlerBase.fromJSONObject(responserecord)));
        
        final JSONArray workflowSteps = responseParameter.getJSONArray("workflowSteps");
        for(int i=0; i<workflowSteps.length();i++) {
            checkValidForeignKeysForStep(workflowSteps.getJSONObject(i));
        }
    }
    
    /**
     * Check valid foreign keys fro Step
     * 
     * By Guo Jiangtao
     * 
     * @param responseParameter json record
     */
    public void checkValidForeignKeysForStep(final JSONObject workflowStep) {
        String[] fields = { "em_id", "cf_id", "vn_id", "role_name"};
        JSONObject workflowStepRecord =  this.getStepJsonRecord(workflowStep);
        checkValidForeignKeys("helpdesk_sla_steps",fields, stripPrefix(EventHandlerBase.fromJSONObject(workflowStepRecord)));
    }
    
    public void checkValidForeignKeys(final String tableName, final String[] fields, final Map fieldValues) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final TableDef.ThreadSafe tableDef =
                ContextStore.get().getProject().loadTableDef(tableName);
        ArrayList<ForeignKey.Immutable> fieldList = new ArrayList<ForeignKey.Immutable>();
        for(final String field : fields) {
            for (ForeignKey.Immutable foreignKey : tableDef.getForeignKeys()) {
                if(field.equals(foreignKey.getLastField())) {
                    fieldList.add(foreignKey);
                    break;
                }
            }
        }
        
        // loop through all the foreign keys
        for (ForeignKey.Immutable foreignKey : fieldList) {
            // get the foreign key set - this could be a composite fk, i.e. dv_id-dp_id

            // get the reference table, i.e. dp
            String referenceTable = foreignKey.getReferenceTable();

            // record the fk field name in format of dv_id - dp_id
            String fullFieldName = "";

            boolean isValid = true; // if validate against db
            boolean isFKEmpty = false; // if the non-last FK is empty while last is not
            HashMap filterValues = new HashMap(); // hold the field values set
            String lastFieldName = foreignKey.getLastField();
            Object lastFieldValue = fieldValues.get(lastFieldName);

            // iterate through each fk set
            for (String fieldName : foreignKey.getForeignFields()) {
                Object fieldValue = fieldValues.get(fieldName);

                ArchibusFieldDefBase.Immutable fieldDef = tableDef.findFieldDef(fieldName);
                String title = "";
                for (Iterator i = fieldDef.getMultiLineHeadings(ContextStore.get().getLocale()).iterator(); i.hasNext();) {
                    title += (i.next());
                    if (i.hasNext()) {
                        title += (" ");
                    }
                }

                // added to check if we needs to validate the data
                if (!fieldDef.isValidateData()) {
                    continue;
                }

                // if the field value is primary, we do not have to validate its value
                if (!fieldDef.isPrimaryKey()) {
                    // if the last FK field is not empty but other FK is, then this is not valid
                    if (!StringUtil.notNull(lastFieldValue).equals("")
                            && StringUtil.notNull(fieldValue).equals("")
                            && fieldName.compareToIgnoreCase(lastFieldName) != 0) {
                        isValid = false;
                        isFKEmpty = true;
                       
                        fullFieldName = title;
                        break;
                    } else {
                        // add the restriction if:
                        // (1) last foreign key field is NOT NULL

                        if ((!StringUtil.notNull(lastFieldValue).equals(""))) {
                            filterValues.put(foreignKey.getReferenceTable() + "." + foreignKey.findPrimaryColumn(fieldName),
                                fieldValue);

                            // used in error messgage
                            if (StringUtil.notNull(fullFieldName).compareToIgnoreCase("") == 0) {
                                fullFieldName += title;
                            } else {
                                fullFieldName += "," + title;
                            }
                        }
                    }
                }
            }

            if (!filterValues.isEmpty() && isValid) {
                // set database
                RecordsPersistenceImpl records = new RecordsPersistenceImpl();
                records.setDatabase(this.getDatabase(context));

                // set querydef
                records.setQueryDef(new QueryDefImpl(records.getDatabase(), referenceTable));

                // try to find if the pk values are valid in db
                RetrievedRecords.Immutable retrievedRecords = records.searchAndRetrieve(false,
                    filterValues, null, null);

                // if the values do not exist in db, throw an error
                if (retrievedRecords.getRecordset().getRecords().isEmpty()) {
                    isValid = false;
                }
            }

            if (!isValid) {
                // @translatable
                String errorMessage = "A value for one of the fields, [{0}] is not correct. The value must exist in [{1}] table.";

                // @translatable
                String errorMessageFKEmpty = "A value for one of the fields, [{0}] is empty. The value must not be empty and exist in [{1}] table.";

                if (isFKEmpty) {
                    errorMessage = errorMessageFKEmpty;
                }

                final ExceptionBase exception = new ExceptionBase();
                exception.setPattern(errorMessage);
                exception.setTranslatable(true);
                final Object[] args = { fullFieldName, ContextStore.get().getProject().loadTableDef(referenceTable).getHeading(ContextStore.get().getLocale()) };
                exception.setArgs(args);

                throw exception;
            }
        }
    }
    
    public void updateExistingSlaSummaryFields() {
        try {
            final SimpleDateFormat timeFormatter =
                    new SimpleDateFormat("hh:mm a", Locale.ENGLISH);
            
            // load the response data source form the view
            final DataSource responseDataSource =
                    DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaResponseDS");
            // load the workflow steps data source form the view
            final DataSource workflowStepsDataSource =
                    DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw",
                        "slaWorkflowStepsDS");
            
            List<DataRecord> responseRecordList = responseDataSource.getAllRecords();
            List<DataRecord> responseStepsRecordList = workflowStepsDataSource.getAllRecords();
            
            boolean isUpdate = false;
            for (final DataRecord responseRecord : responseRecordList) {
                isUpdate = false;
                if (StringUtil.isNullOrEmpty(responseRecord
                    .getString("helpdesk_sla_response.workflow_name"))) {
                    responseRecord.setValue("helpdesk_sla_response.workflow_name",
                        getWorkflowSummary(responseRecord, responseStepsRecordList));
                    isUpdate = true;
                }
                
                if (StringUtil.isNullOrEmpty(responseRecord
                    .getString("helpdesk_sla_response.service_name"))) {
                    responseRecord.setValue("helpdesk_sla_response.service_name",
                        getServiceSummary(responseRecord, responseStepsRecordList,timeFormatter));
                    isUpdate = true;
                }
                
                if (isUpdate) {
                    responseDataSource.saveRecord(responseRecord);
                }
            }
        }catch(final Exception e) {
            //to avoid interrupt the upgrade precess in Use Building Ops Console view
        }
       
    }
    
    private String getWorkflowSummary(final DataRecord responseRecord,
            final List<DataRecord> responseStepsRecordList) {
        String workflowSummary = "";
        
        if (responseRecord.getInt("helpdesk_sla_response.autoapprove") == 1) {
            workflowSummary += "Auto-Approved";
        } else {
            String approver = null;
            for (DataRecord step : responseStepsRecordList) {
                if (responseRecord.getString("helpdesk_sla_response.activity_type").equals(
                    step.getString("helpdesk_sla_steps.activity_type"))
                        && responseRecord.getInt("helpdesk_sla_response.ordering_seq") == step
                            .getInt("helpdesk_sla_steps.ordering_seq")
                        && responseRecord.getInt("helpdesk_sla_response.priority") == step
                            .getInt("helpdesk_sla_steps.priority")
                        && "R".equals(step.getString("helpdesk_sla_steps.status"))
                        && ("approval".equals(step.getString("helpdesk_sla_steps.step_type")) || "review"
                            .equals(step.getString("helpdesk_sla_steps.step_type")))) {
                    if (!StringUtil.isNullOrEmpty(step
                        .getString("helpdesk_sla_steps.em_id"))) {
                        approver = step.getString("helpdesk_sla_steps.em_id");
                    } else if (!StringUtil.isNullOrEmpty(step
                        .getString("helpdesk_sla_steps.vn_id"))) {
                        approver = step.getString("helpdesk_sla_steps.vn_id");
                    } else if (!StringUtil.isNullOrEmpty(step
                        .getString("helpdesk_sla_steps.role"))) {
                        approver = step.getString("helpdesk_sla_steps.role");
                    } else if (!StringUtil.isNullOrEmpty(step
                        .getString("helpdesk_sla_steps.role_name"))) {
                        approver = step.getString("helpdesk_sla_steps.role_name");
                    } else if (!StringUtil.isNullOrEmpty(step
                        .getString("helpdesk_sla_steps.cf_id"))) {
                        approver = step.getString("helpdesk_sla_steps.cf_id");
                    }
                    
                    if (!StringUtil.isNullOrEmpty(approver)) {
                        workflowSummary += "Approved by " + approver;
                        break;
                    }
                    
                }
            }
        }
        
        if (responseRecord.getInt("helpdesk_sla_response.autoissue") == 1) {
            workflowSummary += "; Auto Issue";
        }
        
        if (!StringUtil.isNullOrEmpty(responseRecord
            .getString("helpdesk_sla_response.work_team_id"))) {
            workflowSummary +=
                    "; Work Team " + responseRecord.getString("helpdesk_sla_response.work_team_id");
        } else if (!StringUtil.isNullOrEmpty(responseRecord
            .getString("helpdesk_sla_response.supervisor"))) {
            workflowSummary +=
                    "; Supervisor " + responseRecord.getString("helpdesk_sla_response.supervisor");
        } else {
            workflowSummary += "; Dispatcher ";
        }
        
        return workflowSummary;
    }
    
    private String getServiceSummary(final DataRecord responseRecord,
            final List<DataRecord> responseStepsRecordList, SimpleDateFormat timeFormatter) {
        
        // get service window days
        String[] days =
                responseRecord.getString("helpdesk_sla_response.serv_window_days").split(",");
        String[] dayTitle = { "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat" };
        String servWindoDays = "";
        
        // get service window days like Mon-Fri if consecutive,
        // If non-consecutive, list out those days individually and separated by commas
        boolean consecutive = false;
        for (int i = 0; i < 7; i++) {
            if ("1".equals(days[i])) {
                if (i > 0 && "1".equals(days[i - 1])) {
                    if (!consecutive) {
                        servWindoDays += "-";
                    }
                    consecutive = true;
                    
                    if (i < 6 && "1".equals(days[i + 1])) {
                        
                    } else {
                        servWindoDays += dayTitle[i];
                        consecutive = false;
                        continue;
                    }
                }
                
                if (!consecutive) {
                    servWindoDays += "," + dayTitle[i];
                }
            } else {
                consecutive = false;
            }
        }
        
        servWindoDays = servWindoDays.substring(1);
        
        // get service window time
        String serviceWindowTime =
                timeFormatter.format((java.sql.Time) responseRecord
                    .getValue("helpdesk_sla_response.serv_window_start"))
                        + '-'
                        + timeFormatter.format((java.sql.Time) responseRecord
                            .getValue("helpdesk_sla_response.serv_window_end"));
        
        // get time to complete
        String timeToComplete = "";
        if (responseRecord.getInt("helpdesk_sla_response.time_to_complete") > 0) {
            timeToComplete =
                    "Complete in "
                            + responseRecord.getInt("helpdesk_sla_response.time_to_complete")
                            + " "
                            + com.archibus.eventhandler.EventHandlerBase
                                .getEnumFieldDisplayedValue(ContextStore.get()
                                    .getEventHandlerContext(), "helpdesk_sla_response",
                                    "interval_to_complete", responseRecord
                                        .getString("helpdesk_sla_response.interval_to_complete"));
        }
        
        // concat service window days, service window time and time to complete together as the
        // service name
        return servWindoDays + "; " + serviceWindowTime + "; " + timeToComplete;
    }
    
    /**
     * Split Group.
     * 
     * By Guo Jiangtao
     * KB3043660 - provide a way to split SLAs that have been grouped together
     * 
     * @param group grouping code
     */
    public void splitGroup(final int group) {
        // load the request data source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-bldgops-sla-ds.axvw", "slaRquestDS");
        final List<DataRecord> requestSlaRecords =
                requestDataSource.getRecords("helpdesk_sla_request.grouping=" + group);
        
        if (requestSlaRecords.size() > 1) {
            for (int i = 1; i < requestSlaRecords.size(); i++) {
                DataRecord requestSlaRecord = requestSlaRecords.get(i);
                requestSlaRecord.setValue("helpdesk_sla_request.grouping",
                    this.getMaxGrouping() + 1);
                requestDataSource.saveRecord(requestSlaRecord);
            }
        }
    }
    
    
    /**
     * Start save SLA WFR job.
     * 
     * By Guo Jiangtao
     * 
     * @param sla  SLA object
     */
    public String startSaveSLAJob(final JSONObject sla) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        Job job = new SaveServiceLevelAgreementJob(sla);
        return jobManager.startJob(job);
    }
    
    /**
     * This method served as a custom refresh WFR new SLA interface grid.
     *
     * By Guo Jiangtao
     *
     * @param parameters Map<String, Object>
     *
     */
    public void identifySLAGroups(final Map<String, Object> parameters) {
        ServiceLevelAgreementTools.identifySLAGroups(parameters);
    }

    
    /**
     * Create groupings.
     *
     * By Guo Jiangtao
     *
     * @param groupings grouping array
     */
    public void createGroupings(final JSONArray groupings) {
        ServiceLevelAgreementTools.createGroupings(groupings);
    }
    

    /**
     * Create all groupings.
     *
     * By Guo Jiangtao
     */
    public void createAllGroupings() {
        ServiceLevelAgreementTools.createAllGroupings();
    }

    /**
     * Get request parameters by ordering sequences group.
     *
     * By Guo Jiangtao
     *
     * @param orderingSeqs grouping code
     * @return Request Parameters record
     */
    public DataRecord getRequestParametersByOrderingSeqs(final String orderingSeqs) {
        return ServiceLevelAgreementTools.getRequestParametersByOrderingSeqs(orderingSeqs);
    }
    
    /**
     * Get response parameters by ordering sequence.
     *
     * By Guo Jiangtao
     *
     * @param orderingSeq orderingSeq
     * @return response data set
     */
    public DataSetList getResponseParametersByOrderingSeq(final int orderingSeq) {
        return ServiceLevelAgreementTools.getResponseParametersByOrderingSeq(orderingSeq);
    }
    
    /**
     * Get workflow steps by ordering sequence.
     *
     * @param orderingSeq orderingSeq
     * @return workflow steps data set
     */
    public DataSetList getWorkflowStepsByOrderingSeq(final int orderingSeq) {
        return ServiceLevelAgreementTools.getWorkflowStepsByOrderingSeq(orderingSeq);
        
    }
}

/**
 * Save Service Level Agreement Job.
 * 
 * By Guo Jiang Tao
 */
class SaveServiceLevelAgreementJob extends JobBase {
    
    private final JSONObject sla;
    
    // @translatable
    private String JOB_TITLE = "Save Service Level Agreements";
    
    public SaveServiceLevelAgreementJob(final JSONObject sla) {
        this.sla = sla;
        this.JOB_TITLE =
                EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(),
                    this.JOB_TITLE, "com.archibus.eventhandler.sla.ServiceLevelAgreementHandler");
    }
    
    @Override
    public void run() {
        this.status.setResult(new JobResult(this.JOB_TITLE));
        try {
            ServiceLevelAgreementHandler handler = new ServiceLevelAgreementHandler();
            handler.saveSLA(sla, this.status);
            if (this.status.getCode() != JobStatus.JOB_FAILED) {
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
            
        } catch (final ExceptionBase e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            throw new ExceptionBase(null, e);
        }
    }
}