package com.archibus.eventhandler.steps;

import java.sql.*;
import java.sql.Date;
import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * 
 * Handles all workflow rules concerning steps.
 * 
 */
public class StepHandler extends HelpdeskEventHandlerBase {
    
    /**
     * Workflow substitutes table name
     */
    static final String WF_SUBSTITUTES_TABLE = "workflow_substitutes";
    
    /**
     * Get a list of employees for which the given user is substitute for the given role
     * 
     * @param context
     * @param emId employee who might be substitute
     * @param role steptype or role to check
     * @return list of employees
     */
    public static List<String> getWorkflowEmSubstituted(final EventHandlerContext context,
            final String emId, final String role) {
        final List<String> result = new ArrayList<String>();
        
        final DataSource wfSubstitutesDS =
                DataSourceFactory.createDataSourceForFields(WF_SUBSTITUTES_TABLE, new String[] {
                        "em_id", "substitute_em_id" });
        final Restrictions.Restriction.Clause[] restrictions =
                { Restrictions.eq(WF_SUBSTITUTES_TABLE, "substitute_em_id", emId),
                        Restrictions.eq(WF_SUBSTITUTES_TABLE, "steptype_or_role", role) };
        
        wfSubstitutesDS.addRestriction(Restrictions.and(restrictions));
        final Restrictions.Restriction.Clause[] dateStartRestrictions =
                {
                        Restrictions.isNull(WF_SUBSTITUTES_TABLE, "start_date_unavailable"),
                        Restrictions.lte(WF_SUBSTITUTES_TABLE, "start_date_unavailable",
                            Utility.currentDate()) };
        final Restrictions.Restriction.Clause[] dateEndRestrictions =
                {
                        Restrictions.isNull(WF_SUBSTITUTES_TABLE, "end_date_unavailable"),
                        Restrictions.gte(WF_SUBSTITUTES_TABLE, "end_date_unavailable",
                            Utility.currentDate()) };
        wfSubstitutesDS.addRestriction(Restrictions.or(dateStartRestrictions));
        wfSubstitutesDS.addRestriction(Restrictions.or(dateEndRestrictions));
        
        final List<DataRecord> records = wfSubstitutesDS.getRecords();
        if (!records.isEmpty()) {
            for (final DataRecord record : records) {
                if (record.valueExists(WF_SUBSTITUTES_TABLE + ".em_id")
                        && !result.contains(record.getString(WF_SUBSTITUTES_TABLE + ".em_id"))) {
                    result.add(record.getString(WF_SUBSTITUTES_TABLE + ".em_id"));
                }
            }
        }
        return result;
    }
    
    /**
     * Get a list of craftspersons for which the given user is substitute for the given role
     * 
     * @param context
     * @param cfId craftspersib who might be substitute
     * @param role steptype or role to check
     * @return list of craftspersons
     */
    public static List<String> getWorkflowCfSubstituted(final EventHandlerContext context,
            final String cfId, final String role) {
        final List<String> result = new ArrayList<String>();
        
        final DataSource wfSubstitutesDS =
                DataSourceFactory.createDataSourceForFields(WF_SUBSTITUTES_TABLE, new String[] {
                        "cf_id", "substitute_cf_id" });
        final Restrictions.Restriction.Clause[] restrictions =
                { Restrictions.eq(WF_SUBSTITUTES_TABLE, "substitute_cf_id", cfId),
                        Restrictions.eq(WF_SUBSTITUTES_TABLE, "steptype_or_role", role) };
        
        wfSubstitutesDS.addRestriction(Restrictions.and(restrictions));
        final Restrictions.Restriction.Clause[] dateStartRestrictions =
                {
                        Restrictions.isNull(WF_SUBSTITUTES_TABLE, "start_date_unavailable"),
                        Restrictions.lte(WF_SUBSTITUTES_TABLE, "start_date_unavailable",
                            Utility.currentDate()) };
        final Restrictions.Restriction.Clause[] dateEndRestrictions =
                {
                        Restrictions.isNull(WF_SUBSTITUTES_TABLE, "end_date_unavailable"),
                        Restrictions.gte(WF_SUBSTITUTES_TABLE, "end_date_unavailable",
                            Utility.currentDate()) };
        wfSubstitutesDS.addRestriction(Restrictions.or(dateStartRestrictions));
        wfSubstitutesDS.addRestriction(Restrictions.or(dateEndRestrictions));
        
        final List<DataRecord> records = wfSubstitutesDS.getRecords();
        if (!records.isEmpty()) {
            for (final DataRecord record : records) {
                if (record.valueExists(WF_SUBSTITUTES_TABLE + ".cf_id")
                        && !result.contains(record.getString(WF_SUBSTITUTES_TABLE + ".cf_id"))) {
                    result.add(record.getString(WF_SUBSTITUTES_TABLE + ".cf_id"));
                }
            }
        }
        return result;
    }
    
    /**
     * Check if the current user is a substitute of the given craftsperson for the given step type.
     * 
     * @param context
     * @param cfId craftsperson code
     * @param role steptype or role to check substitute for
     * @return true if the current user is a substitute of the given craftsperson for the given step
     *         type or role
     */
    public static boolean checkWorkflowCfSubstitute(final EventHandlerContext context,
            final String cfId, final String role) {
        final DataSource wfSubstitutesDS =
                DataSourceFactory.createDataSourceForFields(WF_SUBSTITUTES_TABLE, new String[] {
                        "cf_id", "substitute_cf_id" });
        
        final String currentCfId = getCfIdForCurrentUser();
        if (currentCfId != null) {
            final Restrictions.Restriction.Clause[] restrictions =
                    { Restrictions.eq(WF_SUBSTITUTES_TABLE, "cf_id", cfId),
                            Restrictions.eq(WF_SUBSTITUTES_TABLE, "steptype_or_role", role),
                            Restrictions.eq(WF_SUBSTITUTES_TABLE, "substitute_cf_id", currentCfId) };
            wfSubstitutesDS.addRestriction(Restrictions.and(restrictions));
            final Restrictions.Restriction.Clause[] dateStartRestrictions =
                    {
                            Restrictions.isNull(WF_SUBSTITUTES_TABLE, "start_date_unavailable"),
                            Restrictions.lte(WF_SUBSTITUTES_TABLE, "start_date_unavailable",
                                Utility.currentDate()) };
            final Restrictions.Restriction.Clause[] dateEndRestrictions =
                    {
                            Restrictions.isNull("workflow_substitutes", "end_date_unavailable"),
                            Restrictions.gte("workflow_substitutes", "end_date_unavailable",
                                Utility.currentDate()) };
            wfSubstitutesDS.addRestriction(Restrictions.or(dateStartRestrictions));
            wfSubstitutesDS.addRestriction(Restrictions.or(dateEndRestrictions));
            
            return !wfSubstitutesDS.getAllRecords().isEmpty();
        } else {
            return false;
        }
    }
    
    /**
     * Check if the current user is a substitute of the given employee for the given step type
     * 
     * @param context
     * @param emId employee code
     * @param role steptype or role to check substitute for
     * @return true if the current user is a substitute of the given employee for the given step
     *         type or role
     */
    public static boolean checkWorkflowEmSubstitute(final EventHandlerContext context,
            final String emId, final String role) {
        final DataSource wfSubstitutesDS =
                DataSourceFactory.createDataSourceForFields(WF_SUBSTITUTES_TABLE, new String[] {
                        "em_id", "substitute_em_id" });
        final Restrictions.Restriction.Clause[] restrictions =
                {
                        Restrictions.eq(WF_SUBSTITUTES_TABLE, "em_id", emId),
                        Restrictions.eq(WF_SUBSTITUTES_TABLE, "steptype_or_role", role),
                        Restrictions.eq(WF_SUBSTITUTES_TABLE, "substitute_em_id", ContextStore
                            .get().getUser().getEmployee().getId()) };
        wfSubstitutesDS.addRestriction(Restrictions.and(restrictions));
        final Restrictions.Restriction.Clause[] dateStartRestrictions =
                {
                        Restrictions.isNull(WF_SUBSTITUTES_TABLE, "start_date_unavailable"),
                        Restrictions.lte(WF_SUBSTITUTES_TABLE, "start_date_unavailable",
                            Utility.currentDate()) };
        final Restrictions.Restriction.Clause[] dateEndRestrictions =
                {
                        Restrictions.isNull(WF_SUBSTITUTES_TABLE, "end_date_unavailable"),
                        Restrictions.gte(WF_SUBSTITUTES_TABLE, "end_date_unavailable",
                            Utility.currentDate()) };
        wfSubstitutesDS.addRestriction(Restrictions.or(dateStartRestrictions));
        wfSubstitutesDS.addRestriction(Restrictions.or(dateEndRestrictions));
        
        return !wfSubstitutesDS.getAllRecords().isEmpty();
        
    }
    
    /**
     * @deprecated of release 20.2 replaced by checkWorkflowCfSubstitute and
     *             checkWorkflowEmSubstitute (KB 3023429 - EC 2012/07/10) Check workflow substitute
     * 
     * @param context
     * @param em_id
     * @return
     */
    @Deprecated
    public static String checkWorkflowSubstitute(final EventHandlerContext context,
            final String em_id) {
        String substitute = null;
        String sub = getSubstitute(context, em_id);
        final List<String> substitutes = new ArrayList<String>();
        
        while (sub != null) {
            if (substitute != null) {
                substitutes.add(substitute);
            }
            substitute = sub;
            sub = getSubstitute(context, substitute);
            if (substitutes.contains(sub)) {
                return sub;
            }
        }
        return substitute;
    }
    
    /**
     * Get all workflow substitute craftspersons for the given craftperson and role/steptype.
     * 
     * @param context
     * @param cfId craftsperson code
     * @param role role or step type
     * @return list of all cf_id's of substitutes of the given craftsperson for the given role
     */
    public static List<String> getWorkflowCfSubstitutes(final EventHandlerContext context,
            final String cfId, final String role) {
        final List<String> result = new ArrayList<String>();
        
        final DataSource wfSubstitutesDS =
                DataSourceFactory.createDataSourceForFields(WF_SUBSTITUTES_TABLE, new String[] {
                        "cf_id", "substitute_cf_id", "steptype_or_role" });
        
        final Restrictions.Restriction.Clause[] restrictions =
                { Restrictions.eq(WF_SUBSTITUTES_TABLE, "cf_id", cfId),
                        Restrictions.eq(WF_SUBSTITUTES_TABLE, "steptype_or_role", role) };
        wfSubstitutesDS.addRestriction(Restrictions.and(restrictions));
        
        final Restrictions.Restriction.Clause[] dateStartRestrictions =
                {
                        Restrictions.isNull(WF_SUBSTITUTES_TABLE, "start_date_unavailable"),
                        Restrictions.lte(WF_SUBSTITUTES_TABLE, "start_date_unavailable",
                            Utility.currentDate()) };
        final Restrictions.Restriction.Clause[] dateEndRestrictions =
                {
                        Restrictions.isNull("workflow_substitutes", "end_date_unavailable"),
                        Restrictions.gte("workflow_substitutes", "end_date_unavailable",
                            Utility.currentDate()) };
        wfSubstitutesDS.addRestriction(Restrictions.or(dateStartRestrictions));
        wfSubstitutesDS.addRestriction(Restrictions.or(dateEndRestrictions));
        
        final List<DataRecord> records = wfSubstitutesDS.getAllRecords();
        for (final DataRecord record : records) {
            result.add(record.getString(WF_SUBSTITUTES_TABLE + ".substitute_cf_id"));
        }
        
        return result;
    }
    
    /**
     * Get all workflow substitute employees for the given employee and role/steptype.
     * 
     * @param context
     * @param emId
     * @param role
     * @return list of em_id's of substitutes of given employee
     */
    public static List<String> getWorkflowEmSubstitutes(final EventHandlerContext context,
            final String emId, final String role) {
        final List<String> result = new ArrayList<String>();
        
        final DataSource wfSubstitutesDS =
                DataSourceFactory.createDataSourceForFields(WF_SUBSTITUTES_TABLE, new String[] {
                        "em_id", "substitute_em_id", "steptype_or_role" });
        
        final Restrictions.Restriction.Clause[] restrictions =
                { Restrictions.eq(WF_SUBSTITUTES_TABLE, "em_id", emId),
                        Restrictions.eq(WF_SUBSTITUTES_TABLE, "steptype_or_role", role) };
        wfSubstitutesDS.addRestriction(Restrictions.and(restrictions));
        
        final Restrictions.Restriction.Clause[] dateStartRestrictions =
                {
                        Restrictions.isNull(WF_SUBSTITUTES_TABLE, "start_date_unavailable"),
                        Restrictions.lte(WF_SUBSTITUTES_TABLE, "start_date_unavailable",
                            Utility.currentDate()) };
        final Restrictions.Restriction.Clause[] dateEndRestrictions =
                {
                        Restrictions.isNull("workflow_substitutes", "end_date_unavailable"),
                        Restrictions.gte("workflow_substitutes", "end_date_unavailable",
                            Utility.currentDate()) };
        wfSubstitutesDS.addRestriction(Restrictions.or(dateStartRestrictions));
        wfSubstitutesDS.addRestriction(Restrictions.or(dateEndRestrictions));
        
        final List<DataRecord> records = wfSubstitutesDS.getAllRecords();
        for (final DataRecord record : records) {
            result.add(record.getString(WF_SUBSTITUTES_TABLE + ".substitute_em_id"));
        }
        
        return result;
    }
    
    /**
     * @deprecated of release 20.2 replaced by getWorkflowCfSubstitute and getWorkflowEmSubstitute
     *             (KB 3023429 - EC 2012/07/10)
     * 
     *             Get Substitute.
     * 
     * @param context
     * @param em_id
     * @return
     */
    @Deprecated
    private static String getSubstitute(final EventHandlerContext context, final String em_id) {
        final String sql =
                "SELECT substitute_em_id FROM workflow_substitutes WHERE " + "em_id = "
                        + literal(context, em_id) + " AND "
                        + Common.getCurrentLocalDate(null, null, null, null)
                        + " BETWEEN start_date_unavailable AND end_date_unavailable";
        final List records = selectDbRecords(context, sql);
        if (!records.isEmpty()) {
            final Object[] tmp = (Object[]) records.get(0);
            if (StringUtil.notNullOrEmpty(tmp[0])) {
                return (String) tmp[0];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    
    /**
     * Checks if a user may approve a given request.<br/>
     * When the user can approve a request, it is logged in the step log table and the date_response
     * should be empty
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log_id : primary key of request record</li>
     * <li>table_name : request table</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>Message: ok or nok</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Extract inputs from context</li>
     * <li>Get current user id</li>
     * <li>Retrieve approval records for given request from activity_log_step_waiting</li>
     * <li>Check if one of these records is for current user</li>
     * <li>Create context message and return</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> SELECT em_id <br />
     * FROM helpdesk_step_log <br />
     * WHERE table_name = ? AND field_name = ? AND pkey_value = ? AND step = 'approval' AND
     * date_response IS NULL </div>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void checkApprovalManager(final EventHandlerContext context) {
        final int id = Integer.parseInt(context.getString("activity_log_id"));
        final String table_name = context.getString("table_name");
        
        // get current user em_id
        final String em_id = getParentContextAttributeXPath(context, "/*/preferences/@em_em_id");
        
        final String[] fields = { "em_id" };
        final String where =
                "table_name = " + literal(context, table_name) + " AND field_name = "
                        + literal(context, table_name + "_id") + " AND pkey_value = " + id
                        + " AND step = 'approval' AND date_response IS NULL";
        
        final List records = selectDbRecords(context, Constants.STEP_LOG_TABLE, fields, where);
        
        if (records.size() > 0) {
            // Iterator it = records.iterator();
            // boolean found = false;
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] rec = (Object[]) it.next();
                final String manager = notNull(rec[0]);
                if (manager.equals(em_id)) {
                    // found=true;
                    context.addResponseParameter("message", "ok");
                    final JSONObject restriction = new JSONObject();
                    restriction.put("table", table_name);
                    restriction.put("field", table_name + "_id");
                    restriction.put("value", id);
                    context.addResponseParameter("jsonExpression", restriction.toString());
                    return;
                }
            }
            // if(!found){
            context.addResponseParameter("message", "nok");
            // }
        } else {
            context.addResponseParameter("message", "nok");
        }
    }
    
    /**
     * Check which fields should be shown
     * 
     * @param step : step name (afm_wf_steps)
     * @param status : step status
     */
    public void checkFormFieldsForStep(final String step, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // get the form_fields and the activity of the given step
        final Object[] record =
                selectDbValues(context, Constants.STEP_TABLE, new String[] { "form_fields",
                        "activity_id" },
                    "step_type IN ('approval','review') AND step=" + literal(context, step)
                            + " AND status = " + literal(context, status));
        
        final JSONObject result = new JSONObject();
        if (record != null) {
            final String activityId = notNull(record[1]);
            // get all possible form fields for the activity
            final String all_form_fields =
                    getActivityParameterString(context, activityId,
                        Constants.ACTIVITY_PARAMETER_STEPS_FORM_FIELDS);
            final List<String> allFormFields = Arrays.asList(all_form_fields.split(";"));
            
            // put all form fields in 2 arrays, toHide or toShow
            final JSONArray toHide = new JSONArray();
            final JSONArray toShow = new JSONArray();
            if (StringUtil.notNullOrEmpty(record[0])) {
                final String form_fields = notNull(record[0]);
                final List<String> formFields = Arrays.asList(form_fields.split(";"));
                for (final String field : allFormFields) {
                    if (formFields.contains(field)) {
                        toShow.put(field);
                    } else {
                        toHide.put(field);
                    }
                }
            } else {
                for (final String field : allFormFields) {
                    toHide.put(field);
                }
            }
            result.put("toHide", toHide);
            result.put("toShow", toShow);
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Forward step by Service Desk Manager to other employee
     * 
     * @param activityId : activity name like 'AbBldgOpsOnDemandWork'
     * @param sActivityLogId : the primary key value of the table :'activity_log' or 'wr'
     * @param sStepLogId : the value of the step log id ('activity_log_step_waiting.step_log_id' or
     *            'wr_step_waiting.step_log_id'
     * @param comments : the comments of step
     * @param forwardTo : the user who will deal with the step
     */
    public void forwardStep(final String activityId, final String sActivityLogId,
            final String sStepLogId, final String comments, final String forwardTo) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        int id = -1;
        if (!sActivityLogId.equals("null") && !sActivityLogId.equals("")
                && !sActivityLogId.equals("-1")) {
            id = Integer.parseInt(sActivityLogId);
        }
        int stepLogId = -1;
        if (!sStepLogId.equals("null") && !sStepLogId.equals("") && !sStepLogId.equals("-1")) {
            stepLogId = Integer.parseInt(sStepLogId);
        }
        
        final String currentUser =
                getParentContextAttributeXPath(context, "/*/preferences/@user_name");
        // translatable
        final StringBuffer fwComments =
                new StringBuffer(localizeString(context, "Step forwarded by ") + currentUser);
        if (StringUtil.notNullOrEmpty(comments)) {
            fwComments.append(" :: " + comments);
        }
        
        final StepManager stepManager = WorkflowFactory.getStepManager(context, activityId, id);
        stepManager.forwardStep(stepLogId, fwComments.toString(), currentUser, forwardTo);
    }
    
    /**
     * Retrieves form fields required for a given step type.<br/>
     * In case of an approval step, the requester might have to fill in some additional required
     * fields, defining the account code etc.<br/>
     * The fields required are looked up in the afm_wf_steps table for a given approval type.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>app_type : step</li>
     * <li>status : step status</li>
     * </ul>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray with JSONObject for every field<br />
     * <code>[{field : <i>field_name</i>}]</code></li>
     * </ul>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Retrieve form_fields from <code>afm_wf_steps</code></li>
     * <li>Create and return jsonExpression with form fields
     * </ol>
     * <p>
     * 
     * @param final String app_type
     * @param final String status
     * 
     * @throws ParseException
     */
    public void getRequiredFieldsForStep(final String app_type, final String status)
            throws ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object fields =
                selectDbValue(context, Constants.STEP_TABLE, "form_fields",
                    "step_type IN ('approval','review') AND step=" + literal(context, app_type)
                            + " AND status = " + literal(context, status));
        JSONArray json = new JSONArray();
        if (fields != null) {
            final String form_fields = notNull(fields);
            if (form_fields.indexOf(";") != -1) {
                final String[] temp = form_fields.split(";");
                for (final String element : temp) {
                    final JSONObject field = new JSONObject();
                    field.put("field", element);
                    json.put(field);
                }
            } else {
                json = new JSONArray("[{field:" + literal(context, form_fields) + "}]");
            }
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * 
     * Get the table and field to be used in the select value dialog for the given condition field
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_id : afm activity</li>
     * <li>condition_field : field_name of the field selected in the step information dialog to
     * create a select value dialog for</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with table and field to be used in the select value dialog<br />
     * <code>{table : ?, field : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Get the workflow table for the given activity</li>
     * <li>Select ref_table and dep_cols for the given condition field from the database</li>
     * <li>If the ref_table exists</li>
     * <ul>
     * <li>Add it to the jsonExpression</li>
     * <li>Select the primary key fields of this table and put them in a map <index,field_name></li>
     * <li>If the dep_cols for the condition field are given</li>
     * <ul>
     * <li>If there's only 1 field in dep_cols, put the first primary key field in the
     * jsonExpression</li>
     * <li>Put the primary key field in the jsonExpression which has the same index as the condition
     * field in dep_cols</li>
     * </ul>
     * <li>Else put the condition_field in the json expression</li>
     * </ul>
     * <li>Else add the workflow table and condition field to the jsonExpression</li>
     * <li>Return jsonExpression</li>
     * </ol>
     * </p>
     * 
     * @param String activity_id
     * @param String condition_field
     */
    public void getSelectValueForConditionField(final String activity_id,
            final String condition_field) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String table = Common.getActivityWorkflowTable(context, activity_id);
        
        final JSONObject json = new JSONObject();
        // set up json's default values
        json.put("table", table);
        json.put("field", condition_field);
        
        // get validate table name
        final String validateTableName =
                (String) selectDbValue(context, "afm_flds", "ref_table",
                    "field_name=" + literal(context, condition_field) + " AND table_name="
                            + literal(context, table));
        
        // if there are validate fields, use validate table and its corresponding PK field to
        // overwrite json's default values
        if (StringUtil.notNullOrEmpty(validateTableName)) {
            // use validate table to overwrite json's default table value
            json.put("table", validateTableName);
            // get validate field names
            final String[] validateFields =
                    com.archibus.eventhandler.EventHandlerBase.getForeignFieldNames(context, table,
                        condition_field);
            // get validate table's PK fields
            final String[] validateTablePks =
                    com.archibus.eventhandler.EventHandlerBase.getTablePkFieldNames(context,
                        validateTableName);
            if (validateFields != null && validateFields.length > 0) {
                // find corresponding PK field in validate table against condition_field
                for (int i = 0; i < validateFields.length; i++) {
                    if (condition_field.equals(validateFields[i])) {
                        // get corresponding PK field name from validate table and use it to
                        // overwrite json's default field value
                        json.put("field", validateTablePks[i]);
                        break;
                    }
                }
            } else {
                boolean found = false;
                for (final String validateTablePk : validateTablePks) {
                    if (validateTablePk.equals(condition_field)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    json.put("table", table);
                }
            }
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * 
     * Get the possible status values and form fields (activity param StepsFormFields) for the given
     * activity<br/>
     * Used while creating or editing a workflow step
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_id : afm activity</li>
     * <li>newStep : boolean set true if a new step is being created</li>
     * <li>pStep : edited step</li>
     * <li>pStatus : workflow status of edited step</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with 2 JSONArrays of JSONObjects<br />
     * fieldList containing text (heading), value(field_name) and check (when editing a step) for
     * each field<br />
     * statusList containing text and value (according to the enumlist) for each possible workflow
     * status for the given activity
     * <code>{statusList:[{text : ?, value : ?}],fieldList:[{text:?,value:?,check:?}]}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Get the workflow table and workflow_status_field for the given activity</li>
     * <li>Get the enum list of the workflow_status_field and put the possible statusses in the
     * statusList</li>
     * <li>If an approval step is edited or a new step is created, get the possible form fields from
     * the database</li>
     * <li>For each field put field_name and sl_heading (or if null ml_heading) in the fieldList</li>
     * <li>If editing a step, set check to true for the fields already assigned as form fields for
     * the edited step</li>
     * <li>Create and Return jsonExpression</li>
     * </ol>
     * </p>
     * 
     * @param String activity_id
     * @param String newStep
     * @param String pStep
     * @param String pStatus
     * @param String activity_id
     */
    public void getStatusValuesAndFormFieldsForActivity(final String activity_id,
            final String newStep, final String pStep, final String pStatus) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String step = null;
        String status = null;
        String form_fields = null;
        String stepType = null;
        
        String subjectMessageId = null;
        String bodyMessageId = null;
        String attachments = null;
        
        final boolean bNewStep = newStep.equalsIgnoreCase("true") ? true : false;
        if (!bNewStep) {
            step = pStep;
            status = pStatus;
            final Object[] tmp =
                    selectDbValues(
                        context,
                        "afm_wf_steps",
                        new String[] { "form_fields", "step_type", "body_message_id",
                                "subject_message_id", "attachments" },
                        "activity_id = " + literal(context, activity_id) + " AND step = "
                                + literal(context, step) + " AND status = "
                                + literal(context, status));
            if (tmp != null) { // activity,step or status value changed in form
                form_fields = notNull(tmp[0]);
                stepType = notNull(tmp[1]);
                
                bodyMessageId = notNull(tmp[2]);
                subjectMessageId = notNull(tmp[3]);
                attachments = notNull(tmp[4]);
            }
        }
        
        final JSONObject result = new JSONObject();
        
        // get status values
        final String[] fields = { "workflow_table", "workflow_status_field" };
        final Object[] tmp =
                selectDbValues(context, "afm_activities", fields,
                    "activity_id = " + literal(context, activity_id));
        if (tmp == null) {
            // @translatable
            final String errorMessage =
                    localizeString(context, "No workflow table linked with this activity");
            throw new ExceptionBase(errorMessage, true);
        }
        final Map values = new HashMap();
        for (int i = 0; i < tmp.length; i++) {
            values.put(fields[i], tmp[i]);
        }
        final String tableName = (String) values.get("workflow_table");
        final String fieldName = (String) values.get("workflow_status_field");
        final String[] statusEnum =
                com.archibus.eventhandler.EventHandlerBase.getEnumFieldStoredValues(context,
                    tableName, fieldName);
        result.put("tableName", tableName);
        
        if (statusEnum != null && statusEnum.length != 0) {
            
            final JSONArray enumArray = new JSONArray();
            for (final String value : statusEnum) {
                final JSONObject json = new JSONObject();
                json.put("value", notNull(value));
                final String text =
                        com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(
                            context, tableName, fieldName, value);
                json.put("text", notNull(text));
                enumArray.put(json);
            }
            result.put("statusList", enumArray);
        }
        
        // get form fields to enter (for approvals or new steps)
        if ((stepType != null && stepType.equals("approval")) || bNewStep) {
            final String formFields =
                    getActivityParameterString(context, activity_id,
                        Constants.ACTIVITY_PARAMETER_STEPS_FORM_FIELDS);
            final String[] fieldList = formFields.split(";");
            
            final JSONArray fieldsArray = new JSONArray();
            for (final String element : fieldList) {
                final String field_name = notNull(element);
                final JSONObject json = new JSONObject();
                json.put("value", field_name);
                final String text =
                        com.archibus.eventhandler.EventHandlerBase
                            .getFieldMultiLineHeadingsAsString(context, tableName, field_name, " ");
                json.put("text", notNull(text));
                if (bNewStep || form_fields == null) {
                    json.put("check", "false");
                } else {
                    if (form_fields.indexOf(field_name) > -1) {
                        json.put("check", "true");
                    } else {
                        json.put("check", "false");
                    }
                }
                fieldsArray.put(json);
            }
            result.put("fieldList", fieldsArray);
        } else {
            result.put("fieldList", new JSONArray());
        }
        
        // get possible attachments for notifications
        if ((stepType != null && stepType.equals("notification")) || bNewStep) {
            final List records =
                    selectDbRecords(context, "afm_flds", new String[] { "field_name" },
                        "table_name = " + literal(context, tableName) + " AND afm_type = "
                                + Constants.DOCUMENT_TYPE_FIELD);
            final JSONArray documents = new JSONArray();
            if (!records.isEmpty()) {
                for (final Iterator it = records.iterator(); it.hasNext();) {
                    final Object[] record = (Object[]) it.next();
                    final String docFieldName = (String) record[0];
                    final String docMLHeading =
                            getFieldMultiLineHeadingsAsString(context, tableName, docFieldName, " ");
                    final JSONObject document = new JSONObject();
                    document.put("value", docFieldName);
                    document.put("text", docMLHeading);
                    
                    if (bNewStep) {
                        document.put("check", "false");
                    } else {
                        if (attachments.indexOf(docFieldName + ";") > -1
                                || attachments.endsWith(docFieldName)
                                || attachments.equals(docFieldName)) {
                            document.put("check", "true");
                        } else {
                            document.put("check", "false");
                        }
                    }
                    
                    documents.put(document);
                }
            }
            result.put("documents", documents);
        }
        
        // get subject and body for notification
        if (stepType != null && stepType.equals("notification")) {
            final Object[] subject =
                    selectDbValues(context, "messages", new String[] { "message_text",
                            "message_text_nl", "message_text_fr", "is_rich_msg_format" },
                        "activity_id = " + literal(context, activity_id)
                                + " AND referenced_by = 'NOTIFICATION_STEP' AND message_id = "
                                + literal(context, subjectMessageId));
            if (subject != null) {
                final JSONObject subjectMsgs = new JSONObject();
                if (StringUtil.notNullOrEmpty(subject[3])) {
                    subjectMsgs.put("is_rich_msg_format", notNull(subject[3]));
                }
                if (StringUtil.notNullOrEmpty(subject[2])) {
                    subjectMsgs.put("message_fr", notNull(subject[2]));
                }
                if (StringUtil.notNullOrEmpty(subject[1])) {
                    subjectMsgs.put("message_nl", notNull(subject[1]));
                }
                if (StringUtil.notNullOrEmpty(subject[0])) {
                    subjectMsgs.put("message", notNull(subject[0]));
                }
                result.put("subject", subjectMsgs);
            }
            
            final Object[] body =
                    selectDbValues(context, "messages", new String[] { "message_text",
                            "message_text_nl", "message_text_fr", "is_rich_msg_format" },
                        "activity_id = " + literal(context, activity_id)
                                + " AND referenced_by = 'NOTIFICATION_STEP' AND message_id = "
                                + literal(context, bodyMessageId));
            
            if (body != null) {
                final JSONObject bodyMsgs = new JSONObject();
                if (StringUtil.notNullOrEmpty(body[3])) {
                    bodyMsgs.put("is_rich_msg_format", notNull(body[3]));
                }
                if (StringUtil.notNullOrEmpty(body[2])) {
                    bodyMsgs.put("message_fr", notNull(body[2]));
                }
                if (StringUtil.notNullOrEmpty(body[1])) {
                    bodyMsgs.put("message_nl", notNull(body[1]));
                }
                if (StringUtil.notNullOrEmpty(body[0])) {
                    bodyMsgs.put("message", notNull(body[0]));
                }
                result.put("body", bodyMsgs);
            }
            
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * 
     * Get the possible fields that can be used to create a condition in the step information dialog
     * for the given activity These fields are saved as a ;separated list in afm_activity_params
     * with param_id StepConditionFields
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_id : afm activity</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray of JSONObjects with value (field_name), text(heading) pairs
     * for each field<br />
     * <code>[{text : ?, value : ?}]</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Get the workflow table for the given activity</li>
     * <li>Get the list of condition fields for the given activity</li>
     * <li>For each field get single- (or if null) multi-line heading from the database according to
     * the current locale</li>
     * <li>Return jsonExpression</li>
     * </ol>
     * </p>
     * 
     * @param String activity_id
     */
    
    public void getStepConditionFieldsForActivity(final String activity_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // String activity_id = context.getString("activity_id");
        
        final String workflow_table = Common.getActivityWorkflowTable(context, activity_id);
        if (!StringUtil.notNullOrEmpty(workflow_table)) {
            // @translatable
            final String errorMessage =
                    localizeString(context, "No workflow table linked with this activity");
            throw new ExceptionBase(errorMessage, true);
        }
        
        final String fieldList =
                getActivityParameterString(context, activity_id, "StepConditionFields");
        final String[] fieldArray = fieldList.split(";");
        
        // get field definition for the status field
        final JSONArray fieldsArray = new JSONArray();
        for (final String field_name : fieldArray) {
            final JSONObject json = new JSONObject();
            json.put("value", field_name);
            final String text =
                    com.archibus.eventhandler.EventHandlerBase.getFieldMultiLineHeadingsAsString(
                        context, workflow_table, field_name, " ");
            json.put("text", text);
            fieldsArray.put(json);
        }
        context.addResponseParameter("jsonExpression", fieldsArray.toString());
    }
    
    /**
     * 
     * Get Information about a step with the given code.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>code : code of step to select</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with step information<br />
     * <code>{pkey_value : ?, table_name : ?, field_name : ?, step : ?, em_id : ?, step_code : ?, accepted : <i>true/false</i>}</code>
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Select step record from database</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * 
     * @param String code
     */
    public void getStepForCode(final String code) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // String code = context.getString("step_code");
        
        final String[] fields =
                { "table_name", "field_name", "pkey_value", "em_id", "step_type", "step",
                        "date_response", "time_response" };
        final Object[] values =
                selectDbValues(context, Constants.STEP_LOG_TABLE, fields,
                    "step_code = " + literal(context, code));
        final JSONObject json = new JSONObject();
        if (values != null) {
            json.put("pkey_value", getIntegerValue(context, values[2]));
            json.put("table_name", notNull(values[0]));
            json.put("field_name", notNull(values[1]));
            json.put("step", notNull(values[5]));
            json.put("em_id", notNull(values[3]));
            json.put("step_code", code);
            json.put("step_type", notNull(values[4]));
            
            if (values[6] != null) {
                json.put("accepted", true);
            }
        } else {
            // @translatable
            final String errorMessage = localizeString(context, "Step record not found");
            throw new ExceptionBase(errorMessage, true);
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * Retrieves step information for a request.
     * 
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tableName : request table</li>
     * <li>fieldName: primary key field</li>
     * <li>pkey_value: primary key value</li>
     * </ul>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression: JSONArray with step information (JSONObject for each record)<br />
     * <code>[{step_type : ?, step : ?, multiple_required : ?, condition : ?, em_id : ?, vn_id : ?, step_status_result : ?, status : ?, step_order : ?, date_response : ?, time_response : ?, step_code : ?, user_name : ?, comments : ?}]</code>
     * </li>
     * </ul>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Retrieve step records from database</li>
     * <li>Create json expression and return</li>
     * </ol>
     * 
     * @param final String tableName
     * @param final String fieldName
     * @param String pkey_value
     */
    public void getStepInformation(final String tableName, final String fieldName,
            final String pkey_value) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (pkey_value.equals("null") || pkey_value.equals("")) {
            throw new ExceptionBase("Primary key value missing");
        }
        final int id = getIntegerValue(context, pkey_value).intValue();
        
        final JSONArray steps = new JSONArray();
        final List records = getStepRecords(context, tableName, fieldName, id);
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final JSONObject json = new JSONObject();
                for (int i = 0; i < record.length; i++) {
                    if (Constants.STEP_LOG_FIELDS[i].startsWith("date")) {
                        final Date date = getDateValue(context, record[i]);
                        if (date == null) {
                            json.put(Constants.STEP_LOG_FIELDS[i], "");
                        } else {
                            json.put(Constants.STEP_LOG_FIELDS[i], date.toString());
                        }
                    } else if (Constants.STEP_LOG_FIELDS[i].startsWith("time")) {
                        final Time time = getTimeValue(context, record[i]);
                        if (time == null) {
                            json.put(Constants.STEP_LOG_FIELDS[i], "");
                        } else {
                            json.put(Constants.STEP_LOG_FIELDS[i], time.toString());
                        }
                    } else if (Constants.STEP_LOG_FIELDS[i].equals("status")) {
                        json.put(Constants.STEP_LOG_FIELDS[i],
                            com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(
                                context, tableName, "status", notNull(record[i])));
                    } else if (Constants.STEP_LOG_FIELDS[i].equals("step_status_result")) {
                        json.put(Constants.STEP_LOG_FIELDS[i],
                            com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(
                                context, Constants.STEP_LOG_TABLE, "step_status_result",
                                notNull(record[i])));
                    } else {
                        json.put(Constants.STEP_LOG_FIELDS[i], notNull(record[i]));
                    }
                }
                steps.put(json);
            }
        }
        context.addResponseParameter("jsonExpression", steps.toString());
    }
    
    /**
     * 
     * Get all steps in <code>afm_wf_steps</code>
     * 
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : state JSONArray of JSONObjects with step_type JSONArray of JSONObjects
     * with step JSONArrays<br />
     * <code>[{state: ?, types : [{type : ?, steps : [<i>stepNames</i>]}]}]
     * 			</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select all records from afm_wf_steps</li>
     * <li>Create and return hierarchical array of states - step_types - steps</li>
     * </ol>
     * </p>
     */
    public void getSteps() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // this is the result array containing state objects
        final JSONArray json = new JSONArray();
        
        final List records =
                selectDbRecords(
                    context,
                    "SELECT step, step_type, activity_id, status FROM "
                            + Constants.STEP_TABLE
                            + " WHERE step_type NOT IN ('forward','escalation') ORDER BY activity_id, status, step_type");
        
        String status = "CREATED";
        String type = "";
        JSONObject stateObject = new JSONObject();
        JSONObject typeObject = new JSONObject();
        stateObject.put("state", "CREATED");
        
        /*
         * state -> step_types -> steps
         */
        
        if (records.size() > 0) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final String step = notNull(record[0]);
                final String step_type = notNull(record[1]);
                final String text =
                        com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(
                            context, Constants.STEP_TABLE, "step_type", step_type);
                
                final String status_before = notNull(record[3]);
                // check if this is the same state as previous record
                if (!status.equals(status_before)) { // create new object
                    stateObject = new JSONObject();
                    stateObject.put("state", status_before);
                    stateObject.put("types", new JSONArray());
                    // put it in the return array
                    json.put(stateObject);
                    status = status_before;
                    type = "";
                }
                // check if this is the same step_type as previous record
                if (!type.equals(step_type)) {
                    typeObject = new JSONObject();
                    final JSONObject temp = new JSONObject();
                    temp.put("value", notNull(step_type));
                    temp.put("text", notNull(text));
                    typeObject.put("type", temp);
                    typeObject.put("steps", new JSONArray());
                    final JSONArray stepTypes = stateObject.getJSONArray("types");
                    stepTypes.put(typeObject);
                    type = step_type;
                }
                // get the steps array form the current step type object
                final JSONArray array = typeObject.getJSONArray("steps");
                final Object step_text =
                        selectDbValue(context, Constants.STEP_TABLE, "step",
                            "step = " + literal(context, step));
                final JSONObject steps = new JSONObject();
                steps.put("step", step);
                steps.put("text", step_text);
                array.put(steps); // append
            }
            
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * Get step list
     * 
     * @param context
     * @param tableName
     * @param fieldName
     * @param id
     * @return
     */
    public List<Map<String, Object>> getStepsList(final EventHandlerContext context,
            final String tableName, final String fieldName, final int id) {
        final List records = getStepRecords(context, tableName, fieldName, id);
        if (records.isEmpty()) {
            return null;
        }
        final List<Map<String, Object>> steps = new ArrayList<Map<String, Object>>();
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final Map<String, Object> step = new HashMap<String, Object>();
            
            for (int i = 0; i < record.length; i++) {
                if (Constants.STEP_LOG_FIELDS[i].startsWith("date")) {
                    final Date date = getDateValue(context, record[i]);
                    if (date == null) {
                        step.put(Constants.STEP_LOG_FIELDS[i], "");
                    } else {
                        step.put(Constants.STEP_LOG_FIELDS[i], date.toString());
                    }
                } else if (Constants.STEP_LOG_FIELDS[i].startsWith("time")) {
                    final Time time = getTimeValue(context, record[i]);
                    if (time == null) {
                        step.put(Constants.STEP_LOG_FIELDS[i], "");
                    } else {
                        step.put(Constants.STEP_LOG_FIELDS[i], time.toString());
                    }
                } else if (Constants.STEP_LOG_FIELDS[i].equals("status")) {
                    final Map<String, String> valueText = new HashMap<String, String>();
                    valueText.put("value", (String) record[i]);
                    valueText.put(
                        "text",
                        getEnumFieldDisplayedValue(context, tableName,
                            Constants.STEP_LOG_FIELDS[i], (String) record[i]));
                    step.put(Constants.STEP_LOG_FIELDS[i], valueText);
                } else if (Constants.STEP_LOG_FIELDS[i].equals("step_status_result")
                        || Constants.STEP_LOG_FIELDS[i].equals("step_type")) {
                    final Map<String, String> valueText = new HashMap<String, String>();
                    valueText.put("value", (String) record[i]);
                    valueText.put(
                        "text",
                        getEnumFieldDisplayedValue(context, Constants.STEP_LOG_TABLE,
                            Constants.STEP_LOG_FIELDS[i], (String) record[i]));
                    step.put(Constants.STEP_LOG_FIELDS[i], valueText);
                } else {
                    step.put(Constants.STEP_LOG_FIELDS[i], notNull(record[i]));
                }
            }
            steps.add(step);
        }
        return steps;
    }
    
    /**
     * Get step record
     * 
     * @param context
     * @param tableName
     * @param fieldName
     * @param id
     * @return
     */
    private List<Object[]> getStepRecords(final EventHandlerContext context,
            final String tableName, final String fieldName, final int id) {
        final StringBuffer where = new StringBuffer("table_name ");
        if (tableName.equals("hactivity_log") || tableName.equals("activity_log_hactivity_log")) {
            where.append(" IN ('activity_log','hactivity_log')");
        } else {
            where.append("=" + literal(context, tableName));
        }
        where.append(" AND field_name=" + literal(context, fieldName) + " " + "AND pkey_value = "
                + id + " AND step_type != 'notification'");
        final StringBuffer sql = new StringBuffer("SELECT ");
        final StringBuffer selectFields = new StringBuffer();
        for (final String element : Constants.STEP_LOG_FIELDS) {
            // kb# 3021924
            if (isOracle(context) && element.startsWith("time")) {
                selectFields.append(",to_char(" + element + ", 'HH24:MI:SS')");
            } else {
                selectFields.append("," + element);
            }
        }
        sql.append(selectFields.substring(1));
        if("hactivity_log".equals(tableName) || "hwr".equals(tableName)) {
            sql.append(" FROM " + "h"+Constants.STEP_LOG_TABLE);
        }else {
            sql.append(" FROM " + Constants.STEP_LOG_TABLE);
        }
        sql.append(" WHERE " + where);
        sql.append(" ORDER BY step_log_id DESC");
        
        return selectDbRecords(context, sql.toString());
    }
}
