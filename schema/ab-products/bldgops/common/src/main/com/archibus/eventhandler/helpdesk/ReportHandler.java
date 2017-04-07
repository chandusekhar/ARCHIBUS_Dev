package com.archibus.eventhandler.helpdesk;

import java.math.BigDecimal;
import java.sql.Date;
import java.text.SimpleDateFormat;
import java.util.Iterator;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Handles all workflow rules concerning reporting, for the flex dashboard
 * 
 */

public class ReportHandler extends HelpdeskEventHandlerBase {

    /**
     * 
     * Get JSONExpression with all accounts.
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray with JSONObject for all accounts<br />
     * <code>[{ac_id:?, description: ?}]</code> </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get all accounts from database</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void getAccounts(EventHandlerContext context) {
        List recs = selectDbRecords(context, "ac", new String[] { "ac_id", "description" }, "");

        JSONArray accounts = new JSONArray();

        for (Iterator it = recs.iterator(); it.hasNext();) {
            Object[] rec = (Object[]) it.next();

            String ac_id = notNull(rec[0]);
            String description = notNull(rec[1]);

            JSONObject ac = new JSONObject();
            ac.put("ac_id", ac_id);
            ac.put("description", description);

            accounts.put(ac);
        }

        context.addResponseParameter("jsonExpression", accounts.toString());
    }

    /**
     * 
     * Get all Helpdesk request types (name starting with HELPDESK).
     * 
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray with helpdesk request types without 'SERVICE DESK -'<br />
     * <code>[<i>activitytype</i>]</code> </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get all activitytypes from database</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void getActivityTypes(EventHandlerContext context) {
        List recs = selectDbRecords(context, "activitytype", new String[] { "activity_type" },
            "activity_type LIKE 'SERVICE DESK -%'");

        JSONArray activityTypes = new JSONArray();

        for (Iterator it = recs.iterator(); it.hasNext();) {
            Object[] rec = (Object[]) it.next();

            String activityType = StringUtil.replace(notNull(rec[0]), "SERVICE DESK - ", "");
            activityTypes.put(activityType);
        }

        context.addResponseParameter("jsonExpression", activityTypes.toString());
    }

    /**
     * 
     * Retrieve all sites and buildings.
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray with JSONObject for all sites with JSONArray of JSONObjects
     * for all buildings of the site<br />
     * <code>[{site_id : ?, name : ?, buildings: [{bl_id: ?, name:? }]}]</code> </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get all building codes from database</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void getBuildings(EventHandlerContext context) {
        List recs = selectDbRecords(context, "site", new String[] { "site_id", "name" }, "");

        JSONArray sites = new JSONArray();

        for (Iterator it = recs.iterator(); it.hasNext();) {
            Object[] rec = (Object[]) it.next();
            String site_id = notNull(rec[0]);
            String name = notNull(rec[1]);
            JSONObject site = new JSONObject();
            site.put("site_id", site_id);
            site.put("name", name);

            List records = selectDbRecords(context, "bl", new String[] { "bl_id", "name" },
                "site_id = " + literal(context, site_id));
            JSONArray buildings = new JSONArray();

            Iterator itbl = records.iterator();
            while (itbl.hasNext()) {
                Object[] recbl = (Object[]) itbl.next();
                String bl_id = notNull(recbl[0]);
                String blname = notNull(recbl[1]);
                JSONObject bl = new JSONObject();
                bl.put("bl_id", bl_id);
                bl.put("name", blname);
                buildings.put(bl);
            }
            site.put("buildings", buildings);
            sites.put(site);
        }
        context.addResponseParameter("jsonExpression", sites.toString());
    }

    /**
     * 
     * Retrieves all divisions with their departments.
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray with JSONObjects for each division with JSONArray of
     * JSONObjects for their departments<br />
     * <code>[{dv_id : ?, name : ?, departments: [{dp_id: ?, name:? }]}]</code> </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get all division and their departments from database</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void getDepartments(EventHandlerContext context) {
        // selectDbRecords(EventHandlerContext context, java.lang.String tableName,
        // java.lang.String[] fieldNames, java.lang.String[] standardTables, java.lang.String[][]
        // standardFields, java.lang.String whereExpression, boolean formatValues, int recordLimit)
        List recs = selectDbRecords(context, "dv", new String[] { "dv_id", "name" }, "");

        JSONArray divisions = new JSONArray();

        for (Iterator it = recs.iterator(); it.hasNext();) {
            Object[] record = (Object[]) it.next();
            String dv_id = notNull(record[0]);
            String dv_name = notNull(record[1]);
            JSONObject dv = new JSONObject();
            dv.put("dv_id", dv_id);
            dv.put("name", dv_name);

            List records = selectDbRecords(context, "dp", new String[] { "dp_id", "name" },
                "dv_id = " + literal(context, dv_id));

            JSONArray departments = new JSONArray();

            for (Iterator it2 = records.iterator(); it2.hasNext();) {
                Object[] rec = (Object[]) it2.next();
                String dp_id = notNull(rec[0]);
                String dp_name = notNull(rec[1]);
                JSONObject dp = new JSONObject();
                dp.put("bl_id", dp_id);
                dp.put("name", dp_name);
                departments.put(dp);
            }
            dv.put("departments", departments);
            divisions.put(dv);
        }
        context.addResponseParameter("jsonExpression", divisions.toString());
    }

    /**
     * Get different statistics about requests (for given site and building).
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>slicing : period for slicing (year, month, week, day-week or day)</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with JSONObjects for metadata and statistics<br />
     * <code>
     * 			{requests: {<br />
     * 			&nbsp;&nbsp;problemTypes : [{Label : <i>prob_type</i>, Slice: ?, Count: ?, ActualCost: ?, EstimatedCost: ?}],<br />
     * 			&nbsp;&nbsp;activityTypes : [{Label : <i>activity_type</i>, Slice: ?, Count: ?, ActualCost: ?, EstimatedCost: ?}],<br />
     * 			&nbsp;&nbsp;states : [{Label : <i>status</i>, Slice: ?, Count: ?, ActualCost: ?, EstimatedCost: ?}],<br />
     * 			&nbsp;&nbsp;departments : [{Label : <i>dp_id</i>, Slice: ?, Count: ?, ActualCost: ?, EstimatedCost: ?}]<br />
     * 			&nbsp;},<br />
     * 			satisfactionRates : [{Type : ?, Count: ?, Slice: ?}],<br />
     * 			slaRates : [{Type : <i>Yes or No</i>, Count : ?}],<br />
     * 			history : [{Date: ?, Total: ?, Closed: ?, Open: ?}] 			
     * 			}
     * 			</code> </li>
     * </ul>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void getChartData(EventHandlerContext context) {
        // get filter parameters
        String slicing = context.parameterExists("slicing") ? context.getString("slicing") : "";

        String slice = null;

        /*
         * DATEPART : Ms for Milliseconds Yy for Year Qq for Quarter of the Year Mm for Month Dy for
         * the Day of the Year Dd for Day of the Month Wk for Week Dw for the Day of the Week Hh for
         * Hour Mi for Minute Ss for Second
         */

        // date_start and date_end should be in the same year....
        if (slicing.equals("year")) {
            slice = ", year(date_requested) as slice ";
        } else if (slicing.equals("quarter")) {
            if (isOracle(context)) {
                slice = ", TO_CHAR('Q', date_requested) as slice ";
            } else {
                slice = ", DATEPART(Qq, date_requested) as slice ";
            }
        } else if (slicing.equals("month")) {
            slice = ", month(date_requested) as slice ";
        } else if (slicing.equals("week")) {
            if (isOracle(context)) {
                slice = ", TO_CHAR('IW', date_requested) as slice ";
            } else {
                slice = ", DATEPART(Wk, date_requested) as slice ";
            }
        } else if (slicing.equals("day_week")) {
            if (isOracle(context)) {
                slice = ", TO_CHAR('D', date_requested) as slice ";
            } else {
                slice = ", DATEPART(Dw, date_requested) as slice ";
            }
        } else if (slicing.equals("day")) {
            slice = ", date_requested as slice ";
        } else {
            slice = ", 'total' as slice"; // no slicing
        }
        
        // use getCurrentLocalDate to instead of getCurrentDate
        // all null means the server's current date.
        String today = formatSqlFieldValue(context, Utility.currentDate(), "java.sql.Date", "current_date");

        // create chart data object, including all results
        JSONObject chartData = new JSONObject();
        // request information
        JSONObject requests = new JSONObject();

        // counts and costs per problem types
        JSONArray problemTypes = new JSONArray();
        StringBuffer sql = new StringBuffer(
            "SELECT prob_type, COUNT(activity_log_id), SUM(cost_actual), SUM(cost_estimated) "
                    + slice + " FROM activity_log ");

        addWhereClause(context, sql);
        sql.append(" AND prob_type IS NOT NULL ");
        sql.append(" GROUP BY activity_type, prob_type, slice ");
        sql.append(" ORDER BY activity_type, prob_type, slice ");

        List records = selectDbRecords(context, sql.toString());

        for (Iterator it = records.iterator(); it.hasNext();) {
            Object[] record = (Object[]) it.next();

            String label = notNull(record[0]);
            Integer reqs = getIntegerValue(context, record[1]);
            BigDecimal actcosts = (BigDecimal) record[2];
            BigDecimal estcosts = (BigDecimal) record[3];
            String sliceValue = notNull(record[4]);

            JSONObject prob = new JSONObject();
            prob.put("Label", label);
            prob.put("Slice", sliceValue);
            prob.put("Count", reqs);
            prob.put("ActualCost", actcosts);
            prob.put("EstimatedCost", estcosts);

            problemTypes.put(prob);
        }

        requests.put("problemTypes", problemTypes);

        // activitytypes
        JSONArray activityTypes = new JSONArray();
        sql = new StringBuffer(
            "SELECT activity_type, COUNT(activity_log_id), SUM(cost_actual), SUM(cost_estimated) "
                    + slice + " FROM activity_log ");

        addWhereClause(context, sql);
        sql.append(" GROUP BY activity_type, slice ");
        sql.append(" ORDER BY activity_type, slice ");

        records = selectDbRecords(context, sql.toString());
        // String prev_act_type = "";
        // data=null;

        for (Iterator it = records.iterator(); it.hasNext();) {
            Object[] record = (Object[]) it.next();
            String act_type = notNull(record[0]);

            Integer reqs = getIntegerValue(context, record[1]);
            BigDecimal actcosts = (BigDecimal) record[2];
            BigDecimal estcosts = (BigDecimal) record[3];
            String sliceValue = notNull(record[4]);

            JSONObject act = new JSONObject();
            act.put("Label", act_type);
            act.put("Slice", sliceValue);
            act.put("Count", reqs);
            act.put("ActualCost", actcosts);
            act.put("EstimatedCost", estcosts);

            activityTypes.put(act);
        }
        requests.put("activityTypes", activityTypes);

        // states
        JSONArray states = new JSONArray();
        sql = new StringBuffer(
            "SELECT status, COUNT(activity_log_id), SUM(cost_actual), SUM(cost_estimated) " + slice
                    + " FROM activity_log ");

        addWhereClause(context, sql);
        sql.append(" GROUP BY status, slice");
        sql.append(" ORDER BY status, slice");

        records = selectDbRecords(context, sql.toString());

        for (Iterator it = records.iterator(); it.hasNext();) {
            Object[] rec = (Object[]) it.next();
            String status = notNull(rec[0]);
            Integer reqs = getIntegerValue(context, rec[1]);
            BigDecimal actcosts = (BigDecimal) rec[2];
            BigDecimal estcosts = (BigDecimal) rec[3];
            String sliceValue = notNull(rec[4]);

            JSONObject stat = new JSONObject();
            stat.put("Label", status);
            stat.put("Count", reqs);
            stat.put("ActualCost", actcosts);
            stat.put("EstimatedCost", estcosts);
            stat.put("Slice", sliceValue);

            states.put(stat);
        }
        requests.put("states", states);

        // departments
        JSONArray departments = new JSONArray();
        sql = new StringBuffer(
            "SELECT dv_id, dp_id, COUNT(activity_log_id), SUM(cost_actual), SUM(cost_estimated) "
                    + slice + " FROM activity_log ");

        addWhereClause(context, sql);
        sql.append(" GROUP BY dv_id, dp_id, slice");
        sql.append(" ORDER BY dv_id, dp_id, slice");

        records = selectDbRecords(context, sql.toString());

        for (Iterator it = records.iterator(); it.hasNext();) {
            Object[] rec = (Object[]) it.next();
            String dp_id = notNull(rec[0]);
            String dv_id = notNull(rec[1]);
            Integer reqs = getIntegerValue(context, rec[2]);
            BigDecimal actcosts = (BigDecimal) rec[3];
            BigDecimal estcosts = (BigDecimal) rec[4];
            String sliceValue = notNull(rec[5]);

            JSONObject dp = new JSONObject();
            dp.put("Label", dp_id);
            dp.put("Division", dv_id);
            dp.put("Count", reqs);
            dp.put("ActualCost", actcosts);
            dp.put("EstimatedCost", estcosts);
            dp.put("Slice", sliceValue);
            departments.put(dp);
        }
        requests.put("departments", departments);
        chartData.put("requests", requests);

        // satisfaction ratings
        JSONArray satisfactionRates = new JSONArray();
        sql = new StringBuffer("SELECT satisfaction, COUNT(activity_log_id) " + slice
                + " FROM activity_log ");

        addWhereClause(context, sql);
        sql.append(" GROUP BY satisfaction, slice");
        sql.append(" ORDER BY satisfaction, slice");

        records = selectDbRecords(context, sql.toString());

        for (Iterator it = records.iterator(); it.hasNext();) {
            Object[] rec = (Object[]) it.next();
            String sat = com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(
                context, "activity_log", "satisfaction", notNull(rec[0]));
            Integer reqs = getIntegerValue(context, rec[1]);
            String sliceValue = notNull(rec[2]);

            JSONObject satisfaction = new JSONObject();

            satisfaction.put("Type", sat);
            satisfaction.put("Count", reqs);
            satisfaction.put("Slice", sliceValue);

            satisfactionRates.put(satisfaction);
        }
        chartData.put("satisfactionRates", satisfactionRates);

        // sla completion, no slicing
        JSONArray slaRates = new JSONArray();
        sql = new StringBuffer("SELECT COUNT(activity_log_id) FROM activity_log");

        addWhereClause(context, sql);
        sql.append(" AND date_completed <= date_escalation_completion OR " + today
                + " <= date_escalation_completion ");

        List in_recs = selectDbRecords(context, sql.toString());

        Object[] rec = (Object[]) in_recs.get(0);
        Integer in = getIntegerValue(context, rec[0]);

        // SLA results on time
        JSONObject sla_in = new JSONObject();
        sla_in.put("Type", "Yes");
        sla_in.put("Count", in);
        slaRates.put(sla_in);

        sql = new StringBuffer("SELECT COUNT(activity_log_id) FROM activity_log ");

        addWhereClause(context, sql);
        sql.append(" AND date_completed > date_escalation_completion OR " + today
                + " > date_escalation_completion ");

        List out_recs = selectDbRecords(context, sql.toString());

        Object[] rec_out = (Object[]) out_recs.get(0);
        Integer out = getIntegerValue(context, rec_out[0]);

        // SLA results escalation completion
        JSONObject sla_out = new JSONObject();
        sla_out.put("Type", "No");
        sla_out.put("Count", out);
        slaRates.put(sla_out);

        chartData.put("slaRates", slaRates);

        // history, no slicing
        JSONArray history = new JSONArray();

        String where = addWhereClause(context, new StringBuffer("")).toString();

        sql = new StringBuffer(
            "SELECT a.date_requested, "
                    + " (SELECT COUNT(*) FROM activity_log "
                    + where
                    + " AND date_requested <= a.date_requested ) AS total_count, "
                    + " (SELECT COUNT(*) FROM activity_log "
                    + where
                    + " AND date_completed <= a.date_requested ) AS completed_count, "
                    + " (SELECT COUNT(*) FROM activity_log "
                    + where
                    + " AND date_requested <= a.date_requested  AND date_completed IS NULL) AS open_count "
                    + "  FROM activity_log a " + where);

        sql.append(" GROUP BY date_requested "); // group by day
        sql.append(" ORDER BY date_requested ");

        List hist_recs = selectDbRecords(context, sql.toString());

        for (Iterator hist_it = hist_recs.iterator(); hist_it.hasNext();) {
            Object[] record = (Object[]) hist_it.next();
            Date date_requested = getDateValue(context, record[0]);

            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            String date = formatter.format(date_requested);

            Integer total = getIntegerValue(context, record[1]);
            Integer completed = getIntegerValue(context, record[2]);
            Integer open = getIntegerValue(context, record[3]);

            JSONObject hist = new JSONObject();
            hist.put("date", date);
            hist.put("Total", total);
            hist.put("Closed", completed);
            hist.put("Open", open);
            history.put(hist);
        }
        chartData.put("history", history);

        context.addResponseParameter("jsonExpression", chartData.toString());
    }

    /**
     * Add where clause with parameters in context to given sql query.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>site_id : site code</li>
     * <li>bl_id : building code</li>
     * <li>start_date : start date</li>
     * <li>end_id : end date</li>
     * <li>prob_type : problem type</li>
     * <li>activity_type : activity type</li>
     * <li>dv_id : division code</li>
     * <li>dp_id : department code</li>
     * <li>ac_id : account code</li>
     * <li>vn_id : vendor code</li>
     * <li>slicing : period for slicing (year, month, week, day-week or day)</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context <br />
     * &nbsp;&nbsp;Check for each input parameters if it exists in the context, otherwise set null</li>
     * <li>Check for each parameter if it is not null and append restriction to where clause <br />
     * &nbsp;&nbsp;If no specific activitytype is given, the activitytype should start with
     * 'HELPDESK' <br />
     * &nbsp;&nbsp;If slicing is per quarter or per month, add restriction to take records requested
     * in the current year <br />
     * &nbsp;&nbsp;If slicing is not per quarter, month or year and date start/end are given, these
     * are used, otherwise no restriction on time is used </li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param sql SQL query to complete
     * @return SQL query
     *         </p>
     */
    private StringBuffer addWhereClause(EventHandlerContext context, StringBuffer sql) {

        // filter on location
        String site_id = context.parameterExists("site_id") ? context.getString("site_id") : null;
        String bl_id = context.parameterExists("bl_id") ? context.getString("bl_id") : null;

        // filter on period, start and end (dates are in ISO format YYYY-MM-DD !!!)
        String start_date = context.parameterExists("start_date") ? context.getString("start_date")
                : null;
        String end_date = context.parameterExists("end_date") ? context.getString("end_date")
                : null;

        // filter on request type and problem type ?
        String activity_type = context.parameterExists("activity_type") ? context
            .getString("activity_type") : null;
        String prob_type = context.parameterExists("prob_type") ? context.getString("prob_type")
                : null;

        // filter on division and department
        String dv_id = context.parameterExists("dv_id") ? context.getString("dv_id") : null;
        String dp_id = context.parameterExists("dp_id") ? context.getString("dp_id") : null;

        String ac_id = context.parameterExists("ac_id") ? context.getString("ac_id") : null;
        String vn_id = context.parameterExists("vn_id") ? context.getString("vn_id") : null;

        if (activity_type != null && !activity_type.equals("")) {
            sql.append(" WHERE activity_type =  " + literal(context, activity_type));
        } else {
            sql.append(" WHERE activity_type LIKE 'SERVICE DESK%' ");
        }

        if (prob_type != null && !prob_type.equals("")) {
            sql.append(" AND prob_type = " + literal(context, prob_type));
        }

        String slicing = context.parameterExists("slicing") ? context.getString("slicing") : "year";

        SimpleDateFormat formatter = new SimpleDateFormat("yyyy");
        String year = formatter.format(new java.util.Date()); // take this year

        if (slicing.equals("year")) {
            // no restriction
        } else if (slicing.equals("quarter")) { // year of start
            sql.append(" AND year(date_requested) = " + year);
        } else if (slicing.equals("month")) {
            sql.append(" AND year(date_requested) = " + year);
        } else {
            if (start_date != null && end_date != null && !start_date.equals("")
                    && !end_date.equals("")) {
                sql.append(" AND date_requested BETWEEN "
                        + formatSqlIsoToNativeDate(context, start_date) + "  AND "
                        + formatSqlIsoToNativeDate(context, end_date));
            }
        }

        if (site_id != null && !site_id.equals("")) {
            sql.append(" AND site_id = " + literal(context, site_id));
            if (bl_id != null && !bl_id.equals("")) {
                sql.append(" AND bl_id = " + literal(context, bl_id));
            }
        }

        if (dv_id != null && !dv_id.equals("")) {
            sql.append(" AND dv_id = " + literal(context, dv_id));
            if (dp_id != null && !dp_id.equals("")) {
                sql.append(" AND dp_id = " + literal(context, dp_id));
            }
        }

        if (ac_id != null && !ac_id.equals("")) {
            sql.append(" AND ac_id = " + literal(context, ac_id));
        }

        if (vn_id != null && !vn_id.equals("")) {
            sql.append(" AND vn_id = " + literal(context, vn_id));
        }

        return sql;
    }

}
