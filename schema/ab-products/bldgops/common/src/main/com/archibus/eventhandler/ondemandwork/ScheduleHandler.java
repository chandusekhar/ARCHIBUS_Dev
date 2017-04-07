package com.archibus.eventhandler.ondemandwork;

import java.sql.Time;
import java.text.*;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.ViewHandlers;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.sla.CalendarManager;
import com.archibus.eventhandler.steps.StepHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Handles all workflow rules for requests used by the Planning Board.
 * 
 */
public class ScheduleHandler extends HelpdeskEventHandlerBase {
    
    public static final int CHAR_TYPE = 1;
    
    public static final int DATE_TYPE = 9;
    
    public static final int DOUBLE_TYPE = 2;
    
    public static final int INT_TYPE = 4;
    
    // limit the maximum of work requests that can be loaded.
    public static final int MAX_RECORDS = 40;
    
    public static final int SHORT_TYPE = 5;
    
    public static final int TIME_TYPE = 10;
    
    public static final int VARCHAR_TYPE = 12;
    
    // Web Central ISO date and time format.
    private static final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd");
    
    private static final SimpleDateFormat dateTimeFormatter = new SimpleDateFormat(
        "yyyy-MM-dd HH:mm:ss.SSS");
    
    private static final SimpleDateFormat simpleTimeFormatter = new SimpleDateFormat("HH:mm:ss");
    
    private static final SimpleDateFormat timeFormatter = new SimpleDateFormat("HH:mm.ss.SSS");
    
    private static final String[] WORK_REQUEST_FIELD_NAMES =
            { "wr_id", "wo_id", "site_id", "bl_id", "fl_id", "rm_id", "dp_id", "dv_id", "eq_id",
                    "prob_type", "requestor", "priority", "phone", "description", "location",
                    "status", "step_status", "supervisor", "manager", "requestor",
                    "serv_window_days", "serv_window_start", "serv_window_end",
                    "allow_work_on_holidays", "date_requested", "date_assigned", "time_requested",
                    "time_assigned", "cost_est_labor", "cost_est_other", "cost_est_parts",
                    "cost_est_total", "cost_est_tools", "date_escalation_response",
                    "time_escalation_response", "date_escalation_completion",
                    "time_escalation_completion" };
    
    /**
     * Get the supervisor, workteam and substitutes for the current user for supervisor and
     * scheduling to use in the planningboard queries to avoid complicated subqueries
     * 
     */
    public void getSupervisorAndWorkteamForPlanning() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String currentEmId = ContextStore.get().getUser().getEmployee().getId();
        
        final JSONObject result = new JSONObject();
        
        // get workteam
        List<String> workTeams = new ArrayList<String>();
        final DataSource cfDS =
                DataSourceFactory.createDataSourceForFields("cf", new String[] { "work_team_id",
                        "email", "cf_id" });
        DataRecord cfRecord =
                cfDS.getRecord("email = (SELECT email FROM em WHERE em_id="
                        + literal(context, currentEmId) + ")");
        if (cfRecord != null && !cfRecord.isNew()) {
            
            //KB3016857 -  Allow craftspersons to be members of more than one team 
            if(getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID, "UseBldgOpsConsole").intValue() > 0 && schemaFieldExists("cf_work_team","cf_id")) {
                final DataSource cfWorkTeamDS =
                        DataSourceFactory.createDataSourceForFields("cf_work_team", new String[] { "work_team_id","cf_id" });
                List<DataRecord> cfWorkTeamRecords =
                        cfWorkTeamDS.getRecords("cf_work_team.cf_id IN(select cf.cf_id from cf where email = (SELECT email FROM em WHERE em_id="
                                + literal(context, currentEmId) + "))");
                for(DataRecord cfWorkTeamRecord : cfWorkTeamRecords) {
                    workTeams.add(cfWorkTeamRecord.getString("cf_work_team.work_team_id"));
                }
                
            }else {
                if (cfRecord.valueExists("cf.work_team_id")
                        && StringUtil.notNullOrEmpty(cfRecord.getString("cf.work_team_id"))) {
                    workTeams.add(cfRecord.getString("cf.work_team_id"));
                }
            }
            
        }
        
        // supervisor substitutes
        final List<String> supervisorSubstitutes =
                StepHandler.getWorkflowEmSubstituted(context, currentEmId, "supervisor");
        
        final StringBuffer supervisorRestriction = new StringBuffer("supervisor");
        StringBuffer workTeamRestriction = new StringBuffer("work_team_id");
        
        // workteams of substitutes
        final List<String> workteamSubstitutes = new ArrayList<String>();
        if (!supervisorSubstitutes.isEmpty()) {
            
            supervisorRestriction.append(" IN (" + literal(context, currentEmId));
            
            for (final String supervisor : supervisorSubstitutes) {
                cfRecord =
                        cfDS.getRecord("email = (SELECT email FROM em WHERE em_id="
                                + literal(context, supervisor) + ")");
                if (cfRecord != null && !cfRecord.isNew()) {
                    if (cfRecord.valueExists("cf.work_team_id")
                            && StringUtil.notNullOrEmpty(cfRecord.getString("cf.work_team_id"))) {
                        final String subworkTeam = cfRecord.getString("cf.work_team_id");
                        if (!workteamSubstitutes.contains(subworkTeam)) {
                            workteamSubstitutes.add(subworkTeam);
                        }
                    }
                }
                
                if (!supervisor.equalsIgnoreCase(currentEmId)) {
                    supervisorRestriction.append("," + literal(context, supervisor));
                }
            }
            supervisorRestriction.append(")");
            
            final StringBuffer workteamList = new StringBuffer();
            if (!workTeams.isEmpty()) {
                for (final String wt : workTeams) {
                    workteamList.append("," + literal(context, wt));
                }
            }
            
            if (!workteamSubstitutes.isEmpty()) {
                for (final String wtsub : workteamSubstitutes) {
                    workteamList.append("," + literal(context, wtsub));
                }
                
                workTeamRestriction.append(" IN (" + workteamList.substring(1) + ")");
            }
        } else {
            supervisorRestriction.append("=" + literal(context, currentEmId));
            
            final StringBuffer workteamList = new StringBuffer();
            if (!workTeams.isEmpty()) {
                for (final String wt : workTeams) {
                    workteamList.append("," + literal(context, wt));
                }
                
                workTeamRestriction.append(" IN (" + workteamList.substring(1) + ")");
            }else {
                workTeamRestriction = new StringBuffer("0=1");
            }
        }
        
        // scheduling substituted
        final List<String> schedulingSubstitutes =
                StepHandler.getWorkflowEmSubstituted(context, currentEmId, "scheduling");
        
        final StringBuffer scheduleRestriction = new StringBuffer("em_id");
        if (schedulingSubstitutes.isEmpty()) {
            scheduleRestriction.append("=" + literal(context, currentEmId));
        } else {
            scheduleRestriction.append("IN (" + currentEmId);
            for (final String scheduleSub : schedulingSubstitutes) {
                scheduleRestriction.append("," + literal(context, scheduleSub));
            }
            
            scheduleRestriction.append(")");
        }
        
        result.put("supervisorrestriction", supervisorRestriction.toString());
        result.put("workteamrestriction", workTeamRestriction.toString());
        result.put("schedulingrestriction", scheduleRestriction.toString());
        
        context.addResponseParameter("jsonExpression", result.toString());
        
    }
    
    /**
     * Get the list of work requests for a supervisor or a planner.
     * 
     * The values don't return correct time values, due to an bug in Web Central.
     * 
     * @param String filter
     */
    public void filterWorkRequests(final String filter, final String supervisorRestriction,
            final String workteamRestriction, final String schedulingRestriction) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        context.addInputParameter("filter", filter);
        
        // restrict list to work requests to be planned for this user
        // KB 3023429 - also select work requests assigned to the current user as substitute of the
        // original supervisor (EC 2012/7/10)
        final StringBuffer where =
                new StringBuffer(
                    " prob_type IS NOT NULL AND site_id IS NOT NULL AND status IN ('A','AA','I')  "
                            + " AND ( "
                            + supervisorRestriction
                            + " OR "
                            + workteamRestriction
                            + " OR (  step_status IS NOT NULL AND step_status !="
                            + literal(context, Constants.STEP_STATUS_NULL)
                            + " AND wr_id IN (select wr_id from wr_step_waiting where step_type='scheduling' AND "
                            + schedulingRestriction + ")))");
        
        where.append(this.getRestrictionFromContext(context));
        
        final String orderBy = "prob_type, site_id, wr_id ASC";
        
        final List recs =
                selectDbRecords(context, "wr", WORK_REQUEST_FIELD_NAMES, where.toString(), orderBy);
        
        final JSONArray results = new JSONArray();
        final Map dataTypes = getFieldDataTypes(context, "wr");
        
        for (final Iterator it = recs.iterator(); it.hasNext();) {
            final Object[] recordValues = (Object[]) it.next();
            final JSONObject json =
                    toJSONObject(context, "wr", WORK_REQUEST_FIELD_NAMES, dataTypes, recordValues);
            
            final String[] wrtrFieldNames =
                    { "wr_id", "tr_id", "hours_est", "hours_sched", "hours_total", "comments" };
            
            final List wrtrRecs =
                    selectDbRecords(context, "wrtr", wrtrFieldNames,
                        "wr_id = " + json.getInt("wr.wr_id"), "tr_id");
            final JSONArray tasks = toJSONArray(context, "wrtr", wrtrFieldNames, wrtrRecs);
            
            json.put("tasks", tasks);
            results.put(json);
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * Get assignments within a specific time period.
     * 
     * Start Date and End Date are always required and should be passed as ISO format strings. (e.g.
     * 2007-11-23)
     * 
     * Assignments can belong to the planner or not.
     * 
     * @param String filter
     */
    public void getAssignments(final String filter) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        JSONObject o = null;
        try {
            o = new JSONObject("" + filter + "");
        } catch (final Exception e) {
        }
        
        context.addInputParameter("startDate", o.getString("startDate"));
        context.addInputParameter("endDate", o.getString("endDate"));
        // we select only entries of our work team, only these are displayed on the planning board
        final String email = ContextStore.get().getUser().getEmail();
        final String work_team_id =
                notNull(selectDbValue(context, "cf", "work_team_id",
                    "email = " + literal(context, email)));
        
        // get active craftspersons that can assign work to
        String where =
                " cf_id IN (select cf_id from cf where cf.status = 'A' AND cf.assign_work = 1 AND (cf.date_contract_exp IS NULL OR cf.date_contract_exp > "
                        + Common.getCurrentLocalDate(null, null, null, null) + " ) ";
        
        //KB3016857 -  Allow craftspersons to be members of more than one team 
        if(getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID, "UseBldgOpsConsole").intValue() > 0 && schemaFieldExists("cf_work_team","cf_id")) {
            where +=
                    " AND (not exists(select 1 from cf_work_team where cf_work_team.cf_id = cf.cf_id) " +
                    "or exists(select 1 from cf_work_team where cf_work_team.cf_id = cf.cf_id " +
                    "and cf_work_team.work_team_id IN (select cf_work_team.work_team_id from cf_work_team,cf " +
                    "where cf_work_team.cf_id = cf.cf_id and cf.email = " + literal(context, email)+")))";
            
        }else {
            // if we use a work team filter on work team
            if (work_team_id != null && !work_team_id.equals("")) {
                where +=
                        " AND (cf.work_team_id IS NULL OR cf.work_team_id = "
                                + literal(context, work_team_id) + ") ";
            }
        }
        
        // make sure dates are passed as iso dates
        if (context.parameterExists("startDate") && context.parameterExists("endDate")) {
            final String startDate = context.getString("startDate");
            final String endDate = context.getString("endDate");
            where +=
                    " AND wrcf.date_assigned BETWEEN "
                            + formatSqlIsoToNativeDate(context, startDate) + " AND "
                            + formatSqlIsoToNativeDate(context, endDate);
        }
        
        where += " )";
        
        final String orderBy = "wr_id, cf_id, date_assigned, time_assigned";
        
        /*
         * String[] fieldNames =
         * {"wrcf.wr_id","wrcf.cf_id","wrcf.date_assigned","wrcf.time_assigned"
         * ,"wrcf.hours_est","wrcf.hours_total",
         * "wrcf.date_start","wrcf.date_end","wrcf.time_start",
         * "wrcf.time_end","wrcf.work_type","wrcf.cost_estimated","wrcf.cost_total","wrcf.comments",
         * "wrcf.scheduled_from_tr_id", "wr.wr_id",
         * "wr.prob_type","wr.site_id","wr.bl_id","wr.fl_id","wr.rm_id", "wr.supervisor",
         * "wr.status", "wr.description"};
         */
        final String[] fieldNames =
                { "wr_id", "cf_id", "date_assigned", "time_assigned", "hours_est", "hours_total",
                        "date_start", "date_end", "time_start", "time_end", "work_type",
                        "cost_estimated", "cost_total", "comments", "scheduled_from_tr_id" };
        
        final String sql = "SELECT " + Common.stringArrayToString(fieldNames) + " FROM wrcf ";
        
        final DataSource wrcfDs =
                DataSourceFactory.createDataSource().addTable("wrcf").addField(fieldNames)
                    .addQuery(sql).addRestriction(Restrictions.sql(where)).addSort(orderBy);
        
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(wrcfDs.getRecords());
        dataSet.setHasMoreRecords(wrcfDs.hasMoreRecords());
        context.setResponse(dataSet);
    }
    
    /**
     * Get list of available craftspersons.
     * 
     * Craftspersons are filter with following criteria:
     * 
     * <ul>
     * <li>Belonging to the same work team as planner/supervisor</li>
     * <li>Status active</li>
     * <li>Can be work assigned</li>
     * <li>Contract not expired</li>
     * </ul>
     * 
     * 2008-7-23 bv: removed restriction on contract expire to be consistent with javascript
     * restriction
     * 
     */
    
    public void getCraftspersons() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // sort by trade and cf code
        final String orderBy = "tr_id, cf_id";
        
        final String[] fieldNames =
                { "cf_id", "tr_id", "name", "in_house", "skills", "email", "date_contract_exp",
                        "std_hours_avail", "work_team_id" };
        
        final List recs = selectDbRecords(context, "cf", fieldNames, getCraftspersonsRestriction(), orderBy);
        final JSONArray results = toJSONArray(context, "cf", fieldNames, recs);
        
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    public String getCraftspersonsRestriction() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // get my work team
        final String email = ContextStore.get().getUser().getEmail();
        final String work_team_id =
                notNull(selectDbValue(context, "cf", "work_team_id",
                    "email = " + literal(context, email)));
        
        // get active craftspersons that can assign work to
        String where =
                " status = 'A' AND assign_work = 1 AND (date_contract_exp IS NULL OR date_contract_exp > "
                        + Common.getCurrentLocalDate(null, null, null, null) + " ) ";
        
        //KB3016857 -  Allow craftspersons to be members of more than one team 
        if(getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID, "UseBldgOpsConsole").intValue() > 0 && schemaFieldExists("cf_work_team","cf_id")) {
            where +=
                    " AND (not exists(select 1 from cf_work_team where cf_work_team.cf_id = cf.cf_id) " +
                    "or exists(select 1 from cf_work_team where cf_work_team.cf_id = cf.cf_id " +
                    "and cf_work_team.work_team_id IN (select cf_work_team.work_team_id from cf_work_team,cf " +
                    "where cf_work_team.cf_id = cf.cf_id and cf.email = " + literal(context, email)+")))";
            
        }else {
            // if we use a work team filter on work team
            if (work_team_id != null && !work_team_id.equals("")) {
                where +=
                        " AND (work_team_id IS NULL OR work_team_id = "
                                + literal(context, work_team_id) + ")";
            }
        }
        
        // maybe we need a filter on trade
        if (context.parameterExists("tr_id") && !context.getString("tr_id").equals("0")) {
            where += " AND tr_id = " + literal(context, context.getString("tr_id"));
        }
        
        return where;
        
    }
    
    /**
     * Get holidays for given site and year.
     * 
     * If the year is not provided, the current year is used. If the country and region and site are
     * not provided, the user location is used.
     * 
     * @param String siteId
     * @param String year1
     * @see CalendarManager
     */
    public void getHolidays(final String siteId, final String year1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("site_id", siteId);
        context.addInputParameter("year", year1);
        int year;
        if (context.parameterExists("year")) {
            year = context.getInt("year");
        } else {
            final SimpleDateFormat yearFormat = new SimpleDateFormat("yyyy");
            year = Integer.parseInt(yearFormat.format(new java.util.Date()));
        }
        String ctry_id = null;
        String regn_id = null;
        
        if (context.parameterExists("ctry_id") && !context.getString("ctry_id").equals("0")) {
            ctry_id = context.getString("ctry_id");
        }
        
        if (context.parameterExists("regn_id") && !context.getString("regn_id").equals("0")) {
            regn_id = context.getString("regn_id");
        }
        
        if (ctry_id == null && regn_id == null) {
            String site_id;
            if (context.parameterExists("site_id") && !context.getString("site_id").equals("0")) {
                site_id = context.getString("site_id");
            } else {
                site_id = getParentContextAttributeXPath(context, "/*/preferences/@em_site_id");
            }
            
            final String[] fields = { "site_id", "ctry_id", "regn_id" };
            final Object[] values =
                    selectDbValues(context, "site", fields, "site_id = "
                            + literal(context, site_id));
            
            if (values != null) {
                ctry_id = notNull(values[1]);
                regn_id = notNull(values[2]);
            } else {
                ctry_id = getParentContextAttributeXPath(context, "/*/preferences/@em_ctry_id");
            }
        }
        
        final CalendarManager calendarManager =
                new CalendarManager(context, ctry_id, regn_id, year);
        final Map holidays = calendarManager.getHolidays();
        
        context.addResponseParameter("jsonExpression", toJSONObject(holidays).toString());
    }
    
    /**
     * 
     * @param context
     */
    public void getTasks(final EventHandlerContext context) {
        if (!context.parameterExists("wr_id")) {
            // @translatable
            final String errorMessage = localizeString(context, "No wr_id in context found");
            throw new ExceptionBase(errorMessage, true);
        }
        
        final int wr_id = context.getInt("wr_id");
        final JSONArray results = new JSONArray();
        
        // KB 3024852
        // XXX It is need tested carefully.
        final String[] wrtrFieldNames =
                { "wr_id", "tr_id", "date_assigned", "time_assigned", "hours_est", "hours_sched",
                        "hours_total" };
        
        final DataSource wrtrDs =
                DataSourceFactory.createDataSource().addTable("wrtr", DataSource.ROLE_MAIN)
                    .addField("wrtr", wrtrFieldNames)
                    .addRestriction(Restrictions.eq("wrtr", "wr_id", wr_id))
                    .addSort("wrtr", "tr_id");
        
        final List<DataRecord> listRecords = wrtrDs.getAllRecords();
        
        if (listRecords != null && !listRecords.isEmpty()) {
            for (final DataRecord record : listRecords) {
                final Map<String, Object> values = record.getOldValues(true);
                final JSONObject jsonObject = new JSONObject();
                for (final Map.Entry<String, Object> entry : values.entrySet()) {
                    jsonObject.put(entry.getKey(), entry.getValue());
                }
                results.put(jsonObject);
            }
        }
        
        /*
         * String[] wrtrFieldNames = { "wr_id", "tr_id", "date_assigned", "time_assigned",
         * "hours_est", "hours_sched", "hours_total" };
         * 
         * String sql = "SELECT " + Common.stringArrayToString(wrtrFieldNames) +
         * " FROM wrtr WHERE wr_id " + wr_id + " ORDER BY tr_id";
         * 
         * List recs = selectDbRecords(context, sql); JSONArray results = toJSONArray(context,
         * "wrtr", wrtrFieldNames, recs);
         */
        
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * Get work request details, sla and estimation values, scheduled values
     * 
     * @param String wrId
     */
    public void getWorkRequestDetails(final String wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("wr_id", wrId);
        if (!context.parameterExists("wr_id")) {
            // @translatable
            final String errorMessage = localizeString(context, "No wr_id in context found");
            throw new ExceptionBase(errorMessage, true);
        }
        
        final int wr_id = context.getInt("wr_id");
        final String where = " wr_id = " + wr_id;
        
        final Object[] values = selectDbValues(context, "wr", WORK_REQUEST_FIELD_NAMES, where);
        
        final JSONObject result = new JSONObject();
        final Map dataTypes = getFieldDataTypes(context, "wr");
        final JSONObject details =
                toJSONObject(context, "wr", WORK_REQUEST_FIELD_NAMES, dataTypes, values);
        result.put("details", details);
        
        final String[] wrtrFieldNames =
                { "wr_id", "tr_id", "hours_est", "hours_sched", "hours_total", "comments" };
        
        final List recs = selectDbRecords(context, "wrtr", wrtrFieldNames, where, "tr_id");
        final JSONArray results = toJSONArray(context, "wrtr", wrtrFieldNames, recs);
        
        result.put("tasks", results);
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Remove assignments
     * 
     * @param String tableName
     * @param JSONArray records, table wrcf record
     */
    public void removeAssignments(final String tableName, final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("tableName", tableName);
        context.addInputParameter("records", records);
        final CommonHandler commonHandler = new CommonHandler();
        
        commonHandler.deleteRecords(records, tableName);
        
        final JSONArray results = new JSONArray();
        
        for (int i = 0; i < records.length(); i++) {
            final JSONObject record = records.getJSONObject(i);
            final int wr_id = record.getInt("wrcf.wr_id");
            final String tr_id = record.getString("wrcf.scheduled_from_tr_id");
            
            // KB3023929
            final WorkRequestHandler workRequestHandler = new WorkRequestHandler();
            workRequestHandler.recalculateEstCosts(context, wr_id);
            
            final double hours_sched = recalculateTrade(context, wr_id, tr_id);
            
            final JSONObject result = new JSONObject();
            result.put("wrtr.wr_id", wr_id);
            result.put("wrtr.tr_id", tr_id);
            result.put("wrtr.hours_sched", hours_sched);
            
            results.put(result);
        }
        
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * Save assignment.
     * 
     * <ul>
     * <li>Save the new values</li>
     * <li>Calculate the estimation cost and update</li>
     * <li>Update the scheduled hours for this trade</li>
     * </ul>
     * 
     * @param String tableName
     * @param JSONArray fieldNames
     * @param JSONObject fieldValues
     * @throws ParseException
     */
    public void saveAssignment(final String tableName, final JSONArray fieldNames,
            final JSONObject fieldValues, final JSONObject oldFieldValues, final boolean isNewRecord)
            throws ParseException {
        // first save the record, use ViewHandlers, since the primary key may have been changed
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map mapFieldValues = parseJSONObject(context, fieldValues);
        final Map tableFieldValues = stripPrefix(filterWithPrefix(mapFieldValues, tableName + "."));
        final int wr_id = fieldValues.getInt("wrcf.wr_id");
        final String cf_id = fieldValues.getString("wrcf.cf_id");
        
        final String str_date_assigned = fieldValues.getString("wrcf.date_assigned");
        final String str_time_assigned = fieldValues.getString("wrcf.time_assigned");
        
        final Date date_assigned =
                new java.sql.Date(dateFormatter.parse(str_date_assigned).getTime());
        final Time time_assigned = new Time(timeFormatter.parse(str_time_assigned).getTime());
        
        context.addInputParameter("tableName", tableName);
        context.addInputParameter("fieldNames", fieldNames);
        context.addInputParameter("fieldValues", fieldValues);
        context.addInputParameter("oldFieldValues", oldFieldValues);
        context.addInputParameter("isNewRecord", isNewRecord);
        if (isNewRecord) {
            executeDbSave(context, tableName, tableFieldValues);
        } else {
            final ViewHandlers viewHandlers = new ViewHandlers();
            viewHandlers.saveDataRecord(context);
        }
        //executeDbCommit(context); // commit new record for Oracle
        
        final double hours_est = fieldValues.getDouble("wrcf.hours_est");
        final Object rate_hourly =
                selectDbValue(context, "cf", "rate_hourly", "cf_id=" + literal(context, cf_id));
        final double cost_estimated = Double.parseDouble(rate_hourly.toString()) * hours_est;
        
        // save the estimated cost
        
        if (cost_estimated > 0) {
            final Map values = new HashMap();
            values.put("wr_id", new Integer(wr_id));
            values.put("cf_id", cf_id);
            values.put("date_assigned", date_assigned);
            values.put("time_assigned", time_assigned);
            values.put("cost_estimated", new Double(cost_estimated));
            executeDbSave(context, "wrcf", values);
            //executeDbCommit(context);
        }
        
        final JSONArray results = new JSONArray();
        
        // recalculate the total scheduled hours for this trade and return it to the client
        final String scheduled_from_tr_id = fieldValues.getString("wrcf.scheduled_from_tr_id");
        // if the craftsperson has changed to a cf of a new trade both have to be recalculated
        final double hours_sched = recalculateTrade(context, wr_id, scheduled_from_tr_id);
        
        // KB3023929
        final WorkRequestHandler workRequestHandler = new WorkRequestHandler();
        workRequestHandler.recalculateEstCosts(context, wr_id);
        
        final JSONObject result = new JSONObject();
        result.put("wrtr.wr_id", wr_id);
        result.put("wrtr.tr_id", scheduled_from_tr_id);
        result.put("wrtr.hours_sched", hours_sched);
        results.put(result);
        
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * Return field data types
     * 
     * @param context
     * @param tableName
     * @return
     */
    private Map getFieldDataTypes(final EventHandlerContext context, final String tableName) {
        final Map dataTypes = new HashMap();
        
        final String[] fieldNames =
                com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, tableName);
        
        for (final String fieldName : fieldNames) {
            final Integer type =
                    com.archibus.eventhandler.EventHandlerBase.getFieldSqlType(context, tableName,
                        fieldName);
            dataTypes.put(fieldName, type);
        }
        
        return dataTypes;
    }
    
    /**
     * Get the restriction parameter from the context and translate in a SQL where clause.
     * 
     * @param EventHandlerContext context
     * @return SQL where clause
     */
    private String getRestrictionFromContext(final EventHandlerContext context) {
        final String filterStr = context.getString("filter");
        JSONObject filter = null;
        try {
            final JSONObject o = new JSONObject("" + filterStr + "");
            filter = o.getJSONObject("restriction");
        } catch (final Exception e) {
            
        }
        if (!context.parameterExists("restriction")) {
            return "";
            // Object temp = context.getParameter("restriction");
        }
        
        try {
            final StringBuffer where = new StringBuffer("");
            if (filter != null && filter.length() > 0) {
                for (final Iterator it = filter.keys(); it.hasNext();) {
                    final String key = notNull(it.next());
                    final String value = filter.getString(key);
                    // all values as strings
                    where.append(" AND " + key + " = " + literal(context, value));
                }
            }
            return where.toString();
        } catch (final Exception e) {
            return "";
        }
    }
    
    /**
     * Recalculate the scheduled hours for a trade
     * 
     * @param context
     * @param wr_id
     * @param tr_id
     */
    private double recalculateTrade(final EventHandlerContext context, final int wr_id,
            final String tr_id) {
        final String from =
                " FROM wrcf WHERE wr_id = " + wr_id + " AND scheduled_from_tr_id = "
                        + literal(context, tr_id);
        
        final String where = "wr_id = " + wr_id + " AND tr_id = " + literal(context, tr_id);
        
        final String updateSql =
                "UPDATE wrtr SET " + " hours_sched = (SELECT "
                        + formatSqlIsNull(context, "SUM(hours_est),0") + from + ") WHERE " + where;
        
        executeDbSql(context, updateSql, false);
        
        final Double hours_sched = (Double) selectDbValue(context, "wrtr", "hours_sched", where);
        
        return hours_sched == null ? 0 : hours_sched.doubleValue();
    }
    
    /***********************************************************************************************
     * Select records with ordering.
     * 
     * @param context
     * @param tableName
     * @param fieldNames
     * @param where
     * @param orderBy
     * @return List of Object[] array
     */
    private List selectDbRecords(final EventHandlerContext context, final String tableName,
            final String[] fieldNames, final String where, final String orderBy) {
        
        final String sql =
                "SELECT " + Common.stringArrayToString(fieldNames) + " FROM " + tableName
                        + " WHERE " + where + " ORDER BY " + orderBy;
        
        return selectDbRecords(context, sql);
    }
    
    /**
     * Convert Object Array to a JSON Object.
     * 
     * @param EventHandlerContext context
     * @param String tableName
     * @param String[] fieldNames
     * @param List records
     */
    private JSONArray toJSONArray(final EventHandlerContext context, final String tableName,
            final String[] fieldNames, final List records) {
        
        final JSONArray results = new JSONArray();
        final Map dataTypes = getFieldDataTypes(context, tableName);
        
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] recordValues = (Object[]) it.next();
            final JSONObject json =
                    toJSONObject(context, tableName, fieldNames, dataTypes, recordValues);
            results.put(json);
        }
        
        return results;
        
    }
    
    /**
     * Converts record values to a JSON Object
     * 
     * @param EventHandlerContext context
     * @param String tableName
     * @param String[] fieldNames
     * @param Map dataTypes
     * @param Object[] recordValues
     * @return JSON Object presentation of a record
     */
    private JSONObject toJSONObject(final EventHandlerContext context, final String tableName,
            final String[] fieldNames, final Map dataTypes, final Object[] recordValues) {
        final JSONObject json = new JSONObject();
        if (recordValues == null) {
            return json;
        }
        
        for (int i = 0; i < recordValues.length; i++) {
            final String fieldName =
                    (fieldNames[i].indexOf(".") != -1) ? fieldNames[i] : tableName + "."
                            + fieldNames[i];
            final String shortFieldName =
                    (fieldNames[i].indexOf(".") != -1) ? fieldNames[i].substring(fieldNames[i]
                        .indexOf('.') + 1) : fieldNames[i];
            
            final Integer dataType = (Integer) dataTypes.get(shortFieldName);
            
            if (recordValues[i] == null) { // Strings that are null
                json.put(fieldName, "");
                
            } else if (dataType != null && dataType.intValue() == DATE_TYPE) {
                final Date theDate = getDateValue(context, recordValues[i]);
                json.put(fieldName, dateFormatter.format(theDate));
                
            } else if (dataType != null && dataType.intValue() == TIME_TYPE) {
                final java.sql.Time theTime = getTimeValue(context, recordValues[i]);
                json.put(fieldName, timeFormatter.format(theTime));
                
            } else if (dataType != null
                    && (dataType.intValue() == CHAR_TYPE || dataType.intValue() == VARCHAR_TYPE)) {
                json.put(fieldName, ((String) recordValues[i]).trim());
                
            } else { // numeric
                json.put(fieldName, recordValues[i]);
            }
            
        }
        return json;
    }
}
