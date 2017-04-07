package com.archibus.eventhandler.sla;

import java.io.ByteArrayInputStream;
import java.util.*;

import org.dom4j.*;
import org.dom4j.io.SAXReader;
import org.json.JSONObject;

import com.archibus.app.common.util.SchemaUtils;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Service Level Agreement object<br />
 * Keeps track of all SLA parameters
 * 
 * @see ServiceWindow
 */
public class ServiceLevelAgreement extends HelpdeskEventHandlerBase {

    /**
     * Workflow rule execution context
     */
    private final EventHandlerContext context;

    /**
     * Service window defining working days and hours and time to respond/complete
     */
    private ServiceWindow serviceWindow;

    // Primary key
    /**
     * Activity type
     */
    private String activity_type;

    /**
     * Ordering sequence
     */
    private int ordering_seq;

    /**
     * Priority, the default priority is 1, start counting with 1 to 5
     */
    private int priority = 1;

    private Integer default_priority;

    // automation booleans
    /**
     * Automatically create work request
     */
    private boolean autocreate_wr;

    /**
     * Automatically create work request
     */
    private boolean autocreate_wo;

    /**
     * Automatically schedule request
     */
    private boolean autoschedule;

    /**
     * Automatically issue request
     */
    private boolean autoissue;

    /**
     * Automatically approve request
     */
    private boolean autoapprove;

    /**
     * Automatically dispatch request
     */
    private boolean autodispatch;

    /**
     * Automatically accept request
     */
    private boolean autoaccept;

    /**
     * Notify Requestor (on status change)
     */
    private boolean notifyRequestor;

    /**
     * Notify Service Provider (supervisor/workteam or employee/vendor) if work assigned
     */
    private boolean notifyServiceProvider;

    /**
     * Notify Craftsperson (if work assigned)
     */
    private boolean notifyCraftsperson;

    /**
     * Request Parameters.
     * 
     * <p>
     * The request parameters are stored in a <code>Map</code>. This makes it easy to extend.
     * 
     * <p>
     * The <code>activity_id</code> and <code>priority</code> are not stored in the request
     * parameters Map. These make up the primary key in the table and are always required and not
     * null.
     * <p>
     * The original request parameters are:
     * <ul>
     * <li>site_id</li>
     * <li>bl_id</li>
     * <li>fl_id</li>
     * <li>rm_id</li>
     * <li>dp_id</li>
     * <li>dv_id</li>
     * <li>eq_std</li>
     * <li>eq_id</li>
     * <li>prob_type</li>
     * <li>em_std</li>
     * <li>requestor</li>
     * </ul>
     * 
     */
    private Map<String, Object> requestParameters = new HashMap<String, Object>();

    /**
     * Response Parameters.
     * 
     * <p>
     * The response parameters are stored in a <code>Map</code>. This makes it easy to extend.
     * <br />
     * The priority labels, helperrules (steps), service window and automation parameters (booleans)
     * are not stored in this map.
     * <p>
     * The original response parameters are:
     * <ul>
     * <li>em_id</li>
     * <li>vn_id</li>
     * <li>work_team_id</li>
     * <li>cf_id</li>
     * <li>dispatcher</li>
     * <li>time_to_complete</li>
     * <li>time_to_respond</li>
     * <li>interval_to_complete</li>
     * <li>interval_to_respond</li>
     * <li>manager</li>
     * <li>supervisor</li>
     * <li>default_duration</li>
     * </ul>
     * 
     */
    private final Map<String, Object> responseParameters = new HashMap<String, Object>();

    /**
     * Priority level labels
     * 
     * <p>
     * There are 5 (<code>Constants.PRIORITY_LEVELS</code>) priority levels. <br>
     * The array index starts from 0, the database values start from 1.
     * 
     */
    private final String[] priority_levels = new String[Constants.PRIORITY_LEVELS];

    /**
     * XML representation for the <code>Steps</code> applied for the SLA.
     * 
     * <p>
     * This is an XML string received from the form when creating a SLA. For each basic status a
     * step sequence is defined.
     * 
     */
    private String xmlHelperRules;

    /**
     * List of steps.
     * 
     * <p>
     * The XML string for <code>Steps</code> can be transformed to a <code>List</code>
     * 
     */
    private List<Map<String, Object>> helperRules;

    /**
     * Get the sla for a request. If present in context, return it. Otherwise create new one. The
     * lookup key = "sla." + tableName + "." + fieldName + "." + pkValue
     * 
     * @param context
     * @param tableName
     * @param fieldName
     * @param pkValue
     * @return
     */
    public static ServiceLevelAgreement getInstance(EventHandlerContext context, String tableName,
            String fieldName, int pkValue) {

        String key = "sla." + tableName + "." + fieldName + "." + pkValue;

        if (context.parameterExists(key)
                && context.getParameter(key) instanceof ServiceLevelAgreement) {
            return (ServiceLevelAgreement) context.getParameter(key);
        }
        return new ServiceLevelAgreement(context, tableName, fieldName, pkValue);
    }

    /**
     * Get the sla for a request. If present in context, return it. Otherwise create new one. The
     * lookup key = "sla." + activity_type + "." + ordering_seq + "." + priority
     * 
     * @param context
     * @param priority
     * @param ordering_seq
     * @param activity_type
     * @return
     */
    public static ServiceLevelAgreement getInstance(EventHandlerContext context, int priority,
            int ordering_seq, String activity_type) {

        String key = "sla." + activity_type + "." + ordering_seq + "." + priority;

        if (context.parameterExists(key)
                && context.getParameter(key) instanceof ServiceLevelAgreement) {
            return (ServiceLevelAgreement) context.getParameter(key);
        }
        return new ServiceLevelAgreement(context, priority, ordering_seq, activity_type);
    }

    /**
     * Constructor with request parameters values.
     * 
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Set context, activity type and priority</li>
     * <li>Put given request parameters in the {@link #requestParameters request parameters map}</li>
     * <li>{@link #lookupStandardParameters() equipment standard and employee standard}</li>
     * <li>{@link com.archibus.eventhandler.sla.ServiceLevelAgreement#lookupResponseParameters() Look up response parameters}</li>
     * </ol>
     * 
     * @param context Workflow rule execution context
     * @param values problem parameters
     */
    public ServiceLevelAgreement(EventHandlerContext context, Map values) {
        super();
        this.context = context;
        // set the primary key fields
        this.activity_type = notNull(values.get("activity_type"));
        if (values.get("priority") != null) {
            try {
                this.priority = getIntegerValue(context, values.get("priority")).intValue();
            } catch (Exception e) {
                this.priority = 1;
            }
        }

        this.requestParameters = values;

        lookupStandardParameters();

        lookupResponseParameters();

        String key = "sla." + this.activity_type + "." + this.ordering_seq + "." + this.priority;

        context.addResponseParameter(key, this);
    }

    /**
     * Constructor based on database record.
     * 
     * <p>
     * The values are first looked up using the table name, primary key field name and primary key
     * value
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get all request parameters fields from the given record in the database</li>
     * <li>Set context, activity type and priority</li>
     * <li>Put given request parameters in the {@link #requestParameters request parameters map}</li>
     * <li>{@link #lookupStandardParameters() equipment standard and employee standard}</li>
     * <li>{@link com.archibus.eventhandler.sla.ServiceLevelAgreement#lookupResponseParameters() Look up response parameters}</li>
     * </ol>
     * 
     * @param context Workflow rule execution context
     * @param tableName table of request record
     * @param fieldName primary key field
     * @param pkValue primary key value
     */
    public ServiceLevelAgreement(EventHandlerContext context, String tableName, String fieldName,
            int pkValue) {
        this.context = context;

        if (pkValue > 0) {
            // get problem parameters from activity log or wr table

            Object[] record = selectDbValues(context, tableName, Constants.REQUEST_PARAMETER_NAMES,
                fieldName + "=" + pkValue);

            if (record == null) {
                // @translatable
                final Object[] args = { tableName, Integer.toString(pkValue) };
                String errorMessage = prepareMessage(context,
                    "No record found for table [{0}] with id = [{1}]", args);
                throw new ExceptionBase(errorMessage, true);
            }

            for (int i = 0; i < Constants.REQUEST_PARAMETER_NAMES.length; i++) {
                if (Constants.REQUEST_PARAMETER_NAMES[i].equals("activity_type")) {
                    this.activity_type = notNull(record[i]);
                } else if (Constants.REQUEST_PARAMETER_NAMES[i].equals("priority")) {
                    this.priority = getIntegerValue(context, record[i]).intValue();
                } else {
                    this.requestParameters.put(Constants.REQUEST_PARAMETER_NAMES[i],
                        notNull(record[i]));
                }
            }

            // get the SLA
            lookupStandardParameters();

            lookupResponseParameters();

            String key = "sla." + tableName + "." + fieldName + "." + pkValue;

            context.addResponseParameter(key, this);
        }
    }

    /**
     * Constructor with request parameters in JSON format.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Set context, activity type and priority</li>
     * <li>Put given request parameters in the {@link #requestParameters request parameters map}</li>
     * <li>{@link #lookupStandardParameters() equipment standard and employee standard}</li>
     * <li>{@link com.archibus.eventhandler.sla.ServiceLevelAgreement#lookupResponseParameters() Look up response parameters}</li>
     * </ol>
     * 
     * @param context Workflow rule execution context
     * @param json JSONObject with problem parameters
     */
    public ServiceLevelAgreement(EventHandlerContext context, JSONObject json) {
        this.context = context;

        this.activity_type = json.getString("activity_type");

        if (json.getInt("priority") < 1) {
            throw new ServiceLevelAgreementException("Priority level must be at least 1, value= "
                    + json.getInt("priority"));
        }

        this.priority = json.getInt("priority");

        this.requestParameters.put("site_id", json.getString("site_id"));
        this.requestParameters.put("bl_id", json.getString("bl_id"));
        this.requestParameters.put("fl_id", json.getString("fl_id"));
        this.requestParameters.put("rm_id", json.getString("rm_id"));

        this.requestParameters.put("dp_id", json.getString("dp_id"));
        this.requestParameters.put("dv_id", json.getString("dv_id"));

        this.requestParameters.put("eq_id", json.getString("eq_id"));

        this.requestParameters.put("prob_type", json.getString("prob_type"));
        this.requestParameters.put("requestor", json.getString("requestor"));
        
        if(json.has("pmp_id")){
            this.requestParameters.put("pmp_id", json.getString("pmp_id"));
        }
        else{
            this.requestParameters.put("pmp_id", null);            
        }
            

        lookupStandardParameters();
        lookupResponseParameters();

        // we use a different kind of key if we don't know the table name
        String key = "sla." + this.activity_type + "." + this.ordering_seq + "." + this.priority;

        context.addResponseParameter(key, this);
    }

    /**
     * Constructor with SLA primary key.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Set context, activity type, ordering sequence and priority</li>
     * <li>{@link com.archibus.eventhandler.sla.ServiceLevelAgreement#lookupSLAforPKeys() Look up other parameters in the database}</li>
     * </ol>
     * 
     * @param context Workflow rule execution context
     * @param priority Priority
     * @param ordering_seq Ordering sequence
     * @param activity_type Activity type
     */
    public ServiceLevelAgreement(EventHandlerContext context, int priority, int ordering_seq,
            String activity_type) {
        this.context = context;
        // set the primary key
        this.activity_type = activity_type;
        this.priority = priority;
        this.ordering_seq = ordering_seq;

        lookupSLAforPKeys();

        String key = "sla." + this.activity_type + "." + this.ordering_seq + "." + this.priority;

        context.addResponseParameter(key, this);
    }

    /**
     * Lookup the default priority when the first approver will assign a priority
     */
    private void lookupDefaultPriority() {
        Object tmp = selectDbValue(this.context, Constants.SLA_REQUEST_TABLE, "default_priority",
            "activity_type = " + literal(this.context, this.activity_type) + " AND ordering_seq = "
                    + this.ordering_seq);
        if (tmp != null) {
            this.default_priority = (Integer) tmp;
        }

    }

    /**
     * Look up SLA Request and response parameters for given primary key.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select request parameters for the given activity type and ordering sequence from
     * <code>helpdesk_sla_request</code></li>
     * <li>Put request parameters in the {@link #requestParameters request parameters map}</li>
     * <li>{@link #lookupStandardParameters() equipment standard and employee standard}</li>
     * <li>{@link #getResponseParametersFromPrimaryKey() Lookup response parameters for the primary key}</li>
     * </ol>
     * 
     */
    private void lookupSLAforPKeys() {
        // request parameters
        String where = " ordering_seq =" + this.ordering_seq + " AND activity_type = "
                + literal(this.context, this.activity_type);
        Object[] record = selectDbValues(this.context, Constants.SLA_REQUEST_TABLE,
            Constants.SLA_REQUEST_FIELDS, where);

        if (record == null) {
            // @translatable
            String errorMessage = "No SLA Request parameters found for type [{0}] AND ordering seq [{1}]";
            final Object[] args = { this.activity_type, Integer.toString(this.ordering_seq) };
            throw new ExceptionBase(errorMessage, args, true);
        }

        for (int i = 0; i < Constants.SLA_REQUEST_FIELDS.length; i++) {
            if (Constants.SLA_REQUEST_FIELDS[i].equals("activity_type")) {
                this.activity_type = notNull(record[i]);
            } else {
                this.requestParameters.put(Constants.SLA_REQUEST_FIELDS[i], notNull(record[i]));
            }
        }
        lookupDefaultPriority();
        lookupStandardParameters();

        getResponseParametersFromPrimaryKey();
    }

    /**
     * Look up response parameters for current SLA (problem parameters).
     * 
     */
    public void lookupResponseParameters() {

        if (this.requestParameters.containsKey("prob_type")
                && this.requestParameters.get("prob_type").equals("PREVENTIVE MAINT")) {
            this.ordering_seq = retrieveSlaOfPM(this.requestParameters);

        } else {
            StringBuffer sql = new StringBuffer("SELECT " + Constants.SLA_REQUEST_PKEYS + " FROM "
                    + Constants.SLA_REQUEST_TABLE + " WHERE ");
            sql.append(" (activity_type = " + literal(this.context, this.activity_type) + ")");
            sql.append(appendResponseQueryParameter("site_id"));
            sql.append(appendResponseQueryParameter("bl_id"));
            sql.append(appendResponseQueryParameter("fl_id"));
            sql.append(appendResponseQueryParameter("rm_id"));
            sql.append(appendResponseQueryParameter("dv_id"));
            sql.append(appendResponseQueryParameter("dp_id"));
            sql.append(appendResponseQueryParameter("eq_id"));
            sql.append(appendResponseQueryParameter("eq_std"));
            sql.append(appendResponseQueryParameter("requestor"));
            sql.append(appendResponseQueryParameter("em_std"));
            sql.append(appendResponseQueryParameter("prob_type"));
            
            if (SchemaUtils.fieldExistsInSchema(Constants.SLA_REQUEST_TABLE, "match_ordering_seq")) {
                sql.append(" ORDER BY match_ordering_seq ASC");
            }else {
                sql.append(" ORDER BY ordering_seq ASC");
            }
            

            // get all matching records
            List<Object[]> records = selectDbRecords(this.context, sql.toString());

            if (records == null || records.size() <= 0) {
                return; // return null, not throw exception
            }

            // get the last record
            Object[] record = records.get(records.size() - 1);

            this.ordering_seq = getIntegerValue(this.context, record[1]).intValue();
        }

        // String where = "activity_type = " +
        // literal(context,this.activity_type) + " AND
        // ordering_seq =" + this.ordering_seq + " AND priority = " +
        // this.priority;

        lookupDefaultPriority();
        // get response parameters
        getResponseParametersFromPrimaryKey();
    }

    private int retrieveSlaOfPM(Map<String, Object> requestParameters2) {
        JSONObject fieldsValue = new JSONObject();
        fieldsValue.put("activity_type", "SERVICE DESK - MAINTENANCE");
        fieldsValue.put("prob_type", "PREVENTIVE MAINT");
        fieldsValue.put("pmp_id", this.requestParameters.get("pmp_id"));
        fieldsValue.put("site_id", this.requestParameters.get("site_id"));
        fieldsValue.put("bl_id", this.requestParameters.get("bl_id"));
        fieldsValue.put("fl_id", this.requestParameters.get("fl_id"));
        fieldsValue.put("rm_id", this.requestParameters.get("rm_id"));
        fieldsValue.put("eq_id", this.requestParameters.get("eq_id"));
        fieldsValue.put("eq_std", this.requestParameters.get("eq_std"));

        String fieldName = null;
        boolean isEqNull = !StringUtil.notNullOrEmpty(this.requestParameters.get("eq_id"));
        String[] currentFieldNameArray = isEqNull ? Constants.PM_REQUEST_PARAMETER_NAMES_HK
                : Constants.PM_REQUEST_PARAMETER_NAMES_EQ;

        // Construct match sql string
        String matchSql = getMatchSqlForPmSLA(fieldsValue, isEqNull);

        DataRecord slaRequest = null;
        List<DataRecord> slaRequestList = null;
        List<DataRecord> returnedSlaRequestList = new ArrayList<DataRecord>();
        DataSource slaRequestSelectDS = DataSourceFactory.createDataSourceForFields(
            "helpdesk_sla_request",
            new String[] { "activity_type", "prob_type", "pmp_id", "eq_std", "eq_id", "site_id",
                    "bl_id", "fl_id", "rm_id", "ordering_seq" });
        
        if (SchemaUtils.fieldExistsInSchema(Constants.SLA_REQUEST_TABLE, "match_ordering_seq")) {
            slaRequestSelectDS.addSort("match_ordering_seq");
        } else {
            slaRequestSelectDS.addSort("ordering_seq");
        }
        
        slaRequestSelectDS.setApplyVpaRestrictions(false);
        // KB3052074 - Remove record limit from match SLA PM generation query
        slaRequestSelectDS.setMaxRecords(0);
        slaRequestList = slaRequestSelectDS.getRecords(matchSql);

        // Go through records to delete unmatched record
        if (slaRequestList != null) {
            returnedSlaRequestList.addAll(slaRequestList);
            for (String element : currentFieldNameArray) {
                fieldName = element;
                for (DataRecord hsr : slaRequestList) {
                    String hsrFieldValue = hsr.getString("helpdesk_sla_request" + "." + fieldName);
                    if (hsrFieldValue != null
                            && (!fieldsValue.has(fieldName) || !fieldsValue.get(fieldName).equals(
                                hsrFieldValue))) {
                        returnedSlaRequestList.remove(hsr);
                    }
                }
            }
        }

        if (returnedSlaRequestList.size() == 0) {
            returnedSlaRequestList = slaRequestSelectDS.getRecords(" activity_type='"
                    + Constants.PM_ACTIVITY_TYPE + "' AND ordering_seq=1 ");
        }
        slaRequest = returnedSlaRequestList.get(returnedSlaRequestList.size() - 1);

        return slaRequest.getInt("helpdesk_sla_request.ordering_seq");
    }

    /**
     * Return sql string with @param fieldValues data
     * 
     * @param fieldValues ,An JSON Object contains fields value used to match the Sla Response
     * @param isEqNull,boolean value for search match sla with eq_id or not
     */
    public static String getMatchSqlForPmSLA(JSONObject fieldValues, boolean isEqNull) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String matchSql =
                " activity_type='" + Constants.PM_ACTIVITY_TYPE + "' AND ( prob_type='"
                        + Constants.PM_PROB_TYPE + "' ";
        if (fieldValues.has("pmp_id")) {
            matchSql +=
                    " OR pmp_id="
                            + EventHandlerBase.literal(context, fieldValues.getString("pmp_id"));
        }
        // For kb#3024571, change code to include location fields into match sql even for equipment
        // procedure.
        if (fieldValues.has("site_id") && !"".equals(fieldValues.get("site_id"))) {
            matchSql +=
                    " OR site_id="
                            + EventHandlerBase.literal(context, fieldValues.getString("site_id"));
        }
        if (fieldValues.has("bl_id") && !"".equals(fieldValues.get("bl_id"))) {
            matchSql +=
                    " OR bl_id="
                            + EventHandlerBase.literal(context, fieldValues.getString("bl_id"));
        }
        if (fieldValues.has("fl_id") && !"".equals(fieldValues.get("fl_id"))) {
            matchSql +=
                    " OR ( bl_id="
                            + EventHandlerBase.literal(context, fieldValues.getString("bl_id"))
                            + " AND fl_id="
                            + EventHandlerBase.literal(context, fieldValues.getString("fl_id"))
                            + ")";
        }
        if (fieldValues.has("rm_id") && !"".equals(fieldValues.get("rm_id"))) {
            matchSql +=
                    " OR ( bl_id="
                            + EventHandlerBase.literal(context, fieldValues.getString("bl_id"))
                            + " AND fl_id="
                            + EventHandlerBase.literal(context, fieldValues.getString("fl_id"))
                            + " AND rm_id="
                            + EventHandlerBase.literal(context, fieldValues.getString("rm_id"))
                            + ")";
        }
        if (!isEqNull) {
            if (fieldValues.has("eq_id") && !"".equals(fieldValues.get("eq_id"))) {
                matchSql +=
                        " OR eq_id="
                                + EventHandlerBase.literal(context, fieldValues.getString("eq_id"));
            }
            if (fieldValues.has("eq_std") && !"".equals(fieldValues.get("eq_std"))) {
                matchSql +=
                        " OR eq_std="
                                + EventHandlerBase
                                    .literal(context, fieldValues.getString("eq_std"));
            }
            matchSql +=" )";
        }
        else{
            matchSql += " ) AND eq_id IS NULL AND eq_std IS NULL ";
        }
        matchSql =
                matchSql
                        + "  AND requestor IS NULL AND em_std IS NULL AND dp_id IS NULL AND dv_id IS NULL ";
        return matchSql;
        
    }

    /**
     * Get the response parameters using the primary key value of the sla response.
     * 
     * <p>
     * When the <code>activity_id</code> and <code>ordering_seq</code> and <code>priority</code>
     * is known the response parameters can be retrieved.
     * </p>
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get response parameters for the given primary key from
     * <code>helpdesk_sla_response</code></li>
     * <li>Put response parameters in the {@link #responseParameters map} or set automation
     * booleans and create the {@link ServiceWindow service window}</li>
     * <li>{@link #lookupSlaPriorityLevels() Lookup the priority levels}</li>
     * </ol>
     * 
     * 
     */
    private void getResponseParametersFromPrimaryKey() {
        String where = "activity_type = " + literal(this.context, this.activity_type)
                + " AND ordering_seq =" + this.ordering_seq + " AND priority = " + this.priority;

        String[] SLA_PARAMETER_NAMES = Constants.SLA_PARAMETER_NAMES_BEFORE_V23;
        if(SchemaUtils.fieldExistsInSchema(Constants.SLA_RESPONSE_TABLE, "cf_role")) {
            SLA_PARAMETER_NAMES = Constants.SLA_PARAMETER_NAMES_V23;
        }
                
        Object[] response = selectDbValues(this.context, Constants.SLA_RESPONSE_TABLE,
            SLA_PARAMETER_NAMES, where);

        if (response == null) {
            // @translatable
            String errorMessage = "No matching SLA found for [{0}]";
            final Object[] args = { where };
            throw new ExceptionBase(errorMessage, args, true);
        }

        JSONObject json = new JSONObject();
        for (int i = 0; i < SLA_PARAMETER_NAMES.length; i++) {
            // booleans
            if (SLA_PARAMETER_NAMES[i].startsWith("auto")
                    || SLA_PARAMETER_NAMES[i].startsWith("time")
                    || SLA_PARAMETER_NAMES[i].equals("ordering_seq")
                    || SLA_PARAMETER_NAMES[i].equals("allow_work_on_holidays")
                    || SLA_PARAMETER_NAMES[i].equals("notify_requestor")
                    || SLA_PARAMETER_NAMES[i].equals("default_duration")) {
                if (response[i] == null) {
                    json.put(SLA_PARAMETER_NAMES[i], 0);
                } else {
                    json.put(SLA_PARAMETER_NAMES[i], response[i]);
                }
            } else { // other response parameters
                if (response[i] == null) {
                    json.put(SLA_PARAMETER_NAMES[i], "");
                } else {
                    json.put(SLA_PARAMETER_NAMES[i], response[i]);
                }
            }
        }

        this.autoapprove = json.getInt("autoapprove") > 0;
        // this.autocreate_wr = json.getInt("autocreate_wr") > 0;
        this.autocreate_wr = true;// v21.1 need always autocreate_wr to true
        this.autoschedule = json.getInt("autoschedule") > 0;
        this.autoissue = json.getInt("autoissue") > 0;
        this.autodispatch = json.getInt("autodispatch") > 0;
        this.autoaccept = json.getInt("autoaccept") > 0;
        this.autocreate_wo = json.getInt("autocreate_wo") > 0;

        // notify service provider and/or craftsperson??
        this.notifyCraftsperson = json.getInt("notify_craftsperson") > 0;
        this.notifyServiceProvider = json.getInt("notify_service_provider") > 0;

        // get this to be used in the service window
        boolean allow_work_on_holidays = json.getInt("allow_work_on_holidays") > 0;

        this.notifyRequestor = json.getInt("notify_requestor") > 0;

        this.responseParameters.put("em_id", json.getString("em_id"));
        this.responseParameters.put("vn_id", json.getString("vn_id"));
        this.responseParameters.put("activity_id", json.getString("activity_id"));
        this.responseParameters.put("work_team_id", json.getString("work_team_id"));
        this.responseParameters.put("cf_id", json.getString("cf_id"));
        
        if(SchemaUtils.fieldExistsInSchema(Constants.SLA_RESPONSE_TABLE, "cf_role")) {
            this.responseParameters.put("cf_role", json.getString("cf_role"));
        }else {
            this.responseParameters.put("cf_role", null);
        }
        
        this.responseParameters.put("dispatcher", json.getString("dispatcher"));
        this.responseParameters.put("time_to_complete",
            new Integer(json.getInt("time_to_complete")));
        this.responseParameters.put("time_to_respond", new Integer(json.getInt("time_to_respond")));
        this.responseParameters.put("interval_to_complete", json.getString("interval_to_complete"));
        this.responseParameters.put("interval_to_respond", json.getString("interval_to_respond"));
        this.responseParameters.put("manager", json.getString("manager"));
        this.responseParameters.put("supervisor", json.getString("supervisor"));
        this.responseParameters.put("default_duration",
            new Integer(json.getInt("default_duration")));

        // this is set at lookupSlaPriorityLevels()
        // this.responseParameters.put("priority_label",json.getString("priority_label"));

        this.serviceWindow = new ServiceWindow(this.context, getTimeValue(this.context, json
            .get("serv_window_start")), getTimeValue(this.context, json.get("serv_window_end")),
            json.getString("serv_window_days"), allow_work_on_holidays,
            notNull(this.requestParameters.get("site_id")));

        lookupSlaPriorityLevels();
    }

    /**
     * 
     * Prepare (a part of) a where clause for the given field.<br />
     * If the value for the given field is null return <code>AND (<i>field</i> IS NULL)</code><br />
     * Else return <code>AND (<i>field</i> = <i>value</i> OR <i>field</i> IS NULL)</code>
     * 
     * @param field field name
     * @return where clause
     */
    private String appendResponseQueryParameter(String field) {
        String parameter = getRequestStringParameter(field);
        String sql = " AND ( ";
        if (parameter != null && !parameter.equals("")) {
            //KB3033898 - Allow SLAs to match to problem types according to hierarchy
            if("prob_type".equals(field) &&  parameter.split("\\|").length>1) {
                sql += field + " = " + literal(this.context, parameter.split("\\|")[0]) + " OR ";
                sql += field + " = " + literal(this.context, parameter) + " OR ";
            }else {
                sql += field + " = " + literal(this.context, parameter) + " OR ";
            }
            
        }
        sql += field + " IS NULL) ";
        return sql;
    }

    /**
     * Lookup the two standard fields <code>em_std</code> and <code>eq_std</code> from the
     * equipment and requestor request parameters.
     * 
     */
    private void lookupStandardParameters() {
        this.requestParameters.put("eq_std", notNull(selectDbValue(this.context, "eq", "eq_std",
            "eq_id = " + literal(this.context, getRequestStringParameter("eq_id")))));
        this.requestParameters.put("em_std", notNull(selectDbValue(this.context, "em", "em_std",
            "em_id = " + literal(this.context, getRequestStringParameter("requestor")))));

    }

    /**
     * 
     * Save steps in the database.
     */
    public void saveHelperRules() {
        // first delete all helper rules

        executeDbSql(this.context, "DELETE FROM " + Constants.SLA_STEPS_TABLE + " WHERE priority="
                + this.priority + " AND activity_type=" + literal(this.context, this.activity_type)
                + " AND ordering_seq=" + this.ordering_seq, false);

        // add all of them
        for (Map<String, Object> stepMap : this.helperRules) {
            executeDbAdd(this.context, Constants.SLA_STEPS_TABLE, stepMap);
        }
    }

    /**
     * Calculate Escalation date/time to respond/complete.
     * 
     * @param dateRequested Date requested
     * @param timeRequested Time requested
     * @return Map with escalation for response and escalation for completion (maps with date and
     *         time)
     */
    public Map<String, Map<String, Object>> calculateEscalation(java.sql.Date dateRequested,
            java.sql.Time timeRequested) {
        debugInfo("Calculate Escalation");
        Map<String, Map<String, Object>> escalation = new HashMap<String, Map<String, Object>>();

        if (dateRequested == null) {
            dateRequested = Utility.currentDate();
        }

        if (timeRequested == null) {
            // timeRequested = Utility.currentTime();
            timeRequested = Utility.currentTime();
        }

        Map<String, Object> response = calculateEscalationResponse(dateRequested, timeRequested);
        Map<String, Object> completion = calculateEscalationCompletion(dateRequested, timeRequested);

        escalation.put("response", response);
        escalation.put("completion", completion);
        return escalation;
    }

    /**
     * Calculate escalation date/time to complete.
     * 
     * @param dateRequested Date requested
     * @param timeRequested Time requested
     * @return map with escalation date and time
     */
    private Map<String, Object> calculateEscalationCompletion(java.sql.Date dateRequested,
            java.sql.Time timeRequested) {
        if (getResponseIntegerParameter("time_to_complete") != null
                && getResponseStringParameter("interval_to_complete") != null) {
            return this.serviceWindow.calculateEscalationDate(dateRequested, timeRequested,
                getResponseIntegerParameter("time_to_complete").intValue(),
                getResponseStringParameter("interval_to_complete"));
        } else {
            return null;
        }
    }

    /**
     * Calculate escalation date/time to respond.
     * 
     * @param dateRequested Date requested
     * @param timeRequested Time requested
     * @return map with escalation date and time
     */
    private Map<String, Object> calculateEscalationResponse(java.sql.Date dateRequested,
            java.sql.Time timeRequested) {
        if (getResponseIntegerParameter("time_to_respond") != null
                && getResponseStringParameter("interval_to_respond") != null) {
            return this.serviceWindow.calculateEscalationDate(dateRequested, timeRequested,
                getResponseIntegerParameter("time_to_respond").intValue(),
                getResponseStringParameter("interval_to_respond"));
        } else {
            return null;
        }
    }

    /**
     * Parse Steps XML string.
     * 
     * <p>
     * This is a helper rule for parsing an XML presentation for the SLA Steps workflow. The steps
     * are transformed in a List of HashMap respresentation <code>helperRules</code>. The XML
     * structure is used in the form submitted or can have another source.
     * </p>
     * 
     * <p>
     * The order sequence is generated for each step. The step order is the sequence in the basic
     * state.
     * </p>
     * 
     * <p>
     * After parsing the steps can be saved in the database.
     * </p>
     * 
     * <code> 
     * &lt;states&gt;<br />
     * 	&lt;state activity="AbBldOpsHelpDesk" value="REQUESTED"&gt;<br />
     * 		&lt;approval  type="Manager Approval" approval_by="AFM"/&gt;<br />
     * 		&lt;notification  notification_to="AFM"/&gt;<br />
     * 	&lt;/state&gt;<br />
     * 	&lt;state value="Approved"&gt;<br />
     * 	&lt;/state&gt;<br />
     * 	&lt;state value="Completed"&gt;<br />
     * 	&lt;/state&gt;<br />
     * &lt;/states&gt; 
     *	</code>
     * 
     * 
     * @throws DocumentException
     */
    public void parseHelperRules() throws DocumentException {
        // parse xml_helper_rules
        /*
         * <states> <state activity="AbBldOpsHelpDesk" value="REQUESTED"> <approval type="Manager
         * Approval" approval_by="AFM"/> <notification notification_to="AFM"/> </state> <state
         * value="Approved"> </state> <state value="Completed"> </state> </states>
         */

        if (this.xmlHelperRules == null || this.xmlHelperRules.equals("")) {
            return;
        }

        SAXReader reader = new SAXReader();
        Document document = reader.read(new ByteArrayInputStream(this.xmlHelperRules.getBytes()));

        // get root "states"
        Element root = document.getRootElement();
        if (root == null || !root.getName().equals("states")) {
            // @translatable
            String errorMessage = localizeString(this.context,
                "No matching root element 'states' in XML helper rules field");
            throw new ExceptionBase(errorMessage, true);
        }

        this.helperRules = new ArrayList<Map<String, Object>>();

        Map<String, Object> stepMap = new HashMap<String, Object>();
        for (Iterator<Element> j = root.elementIterator("state"); j.hasNext();) {
            Element state = j.next();
            String status = state.attributeValue("value");
            String activity_id = state.attributeValue("activity");

            int step_order = 1;
            String step_status = status;
            for (Iterator<Element> k = state.elementIterator(); k.hasNext();) {
                Element element = k.next();

                stepMap = new HashMap<String, Object>();
                stepMap.put("status", status);
                stepMap.put("step_order", new Integer(step_order));
                stepMap.put("step_type", element.getName());
                // set foreign key values
                stepMap.put("activity_type", this.activity_type);
                stepMap.put("ordering_seq", new Integer(this.ordering_seq));
                stepMap.put("priority", new Integer(this.priority));
                stepMap.put("activity_id", activity_id);

                if (element.attribute("step") != null) {
                    String step = (String) element.attribute("step").getData();
                    step = unescape(step);
                    stepMap.put("step", step);

                    // lookup step_status_result of this step, otherwise keep basic status of the
                    // step
                    stepMap.put("step_status", step_status);
                    step_status = notNull(selectDbValue(this.context, Constants.STEP_TABLE,
                        "step_status_result", "activity_id = " + literal(this.context, activity_id)
                                + " AND status = " + literal(this.context, status) + " AND step="
                                + literal(this.context, step)));
                }

                if (element.attribute("em_id") != null) {
                    String em_id = (String) element.attribute("em_id").getData();
                    stepMap.put("em_id", unescape(em_id));
                }

                if (element.attribute("vn_id") != null) {
                    String vn_id = (String) element.attribute("vn_id").getData();
                    stepMap.put("vn_id", unescape(vn_id));
                }
                if (element.attribute("cf_id") != null) {
                    String cf_id = (String) element.attribute("cf_id").getData();
                    stepMap.put("cf_id", unescape(cf_id));
                }

                if (element.attribute("role") != null) {
                    String role = (String) element.attribute("role").getData();
                    stepMap.put("role", unescape(role));
                }
                if (element.attribute("condition") != null) {
                    String condition = (String) element.attribute("condition").getData();
                    // TODO: check for quotes
                    /*
                     * String[] tmp = condition.split(" "); String value = tmp[2];
                     * if(value.startsWith("'")) value = value.substring(1); if(value.endsWith("'"))
                     * value = value.substring(0,value.length()-1); condition = tmp[0] + " " +
                     * tmp[1] + " " + literal(context,value);
                     */
                    stepMap.put("condition", condition);
                }
                if (element.attribute("multiple_required") != null) {
                    String multiple_required = (String) element.attribute("multiple_required")
                        .getData();
                    if (multiple_required.equals("true")) {
                        stepMap.put("multiple_required", new Integer(1));
                    } else {
                        stepMap.put("multiple_required", new Integer(0));
                    }
                } else {
                    stepMap.put("multiple_required", new Integer(0));
                }

                if (element.attribute("notify_responsible") != null) {
                    String notify_resp = (String) element.attribute("notify_responsible").getData();
                    if (notify_resp.equals("true")) {
                        stepMap.put("notify_responsible", new Integer(1));
                    } else {
                        stepMap.put("notify_responsible", new Integer(0));
                    }
                } else {
                    stepMap.put("notify_responsible", new Integer(0));
                }

                this.helperRules.add(stepMap);

                step_order++;
            }
        }

    }

    public void checkAutomation() {
        this.autoapprove = true;
        this.autoaccept = true;
        if (this.activity_type.equals(Constants.ON_DEMAND_WORK)) {
            this.autodispatch = true;
        }
        for (Map<String, Object> step : this.helperRules) {
            if ((((String) step.get("step_type")).equals("approval") || ((String) step
                .get("step_type")).equals("review"))
                    && ((String) step.get("status")).equals("REQUESTED")) {
                this.autoapprove = false;
            }
            if (((String) step.get("step_type")).equals("acceptance")) {
                this.autoaccept = false;
            }
            if (((String) step.get("step_type")).equals("dispatch")) {
                this.autodispatch = false;
            }
        }

        saveAutomation();
    }

    private void saveAutomation() {
        Map<String, Object> values = new HashMap<String, Object>();
        values.put("activity_type", this.activity_type);
        values.put("ordering_seq", new Integer(this.ordering_seq));
        values.put("priority", new Integer(this.priority));

        int autocreate_wr = this.autocreate_wr ? 1 : 0;
        values.put("autocreate_wr", new Integer(autocreate_wr));

        int autocreate_wo = this.autocreate_wo ? 1 : 0;
        values.put("autocreate_wo", new Integer(autocreate_wo));

        int autoschedule = this.autoschedule ? 1 : 0;
        values.put("autoschedule", new Integer(autoschedule));

        int autoissue = this.autoissue ? 1 : 0;
        values.put("autoissue", new Integer(autoissue));

        int approve = this.autoapprove ? 1 : 0;
        values.put("autoapprove", new Integer(approve));

        int dispatch = this.autodispatch ? 1 : 0;
        values.put("autodispatch", new Integer(dispatch));

        int accept = this.autoaccept ? 1 : 0;
        values.put("autoaccept", new Integer(accept));

        executeDbSave(this.context, Constants.SLA_RESPONSE_TABLE, values);
        //executeDbCommit(this.context);
    }

    /**
     * Get SLA response parameters and priority levels in JSON.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #lookupSlaPriorityLevels() Lookup the priority levels}</li>
     * <li>{@link #getSlaResponseAsJson() Get SLA response parameters}</li>
     * </ol>
     * 
     * @return JSONObject with SLA response parameters and priority labels
     */
    public JSONObject getSlaResponseWithPriorityLevelsAsJson() {

        lookupSlaPriorityLevels();

        return getSlaResponseAsJson();
    }

    /**
     * Put SLA response parameters in JSON.
     * 
     * <p>
     * Boolean values are translated as 0 or 1 values.
     * </p>
     * 
     * <p>
     * The priority levels are named priority_level_1 etc ...
     * </p>
     * 
     * @return JSONObject with SLA response parameters
     */
    public JSONObject getSlaResponseAsJson() {

        JSONObject json = new JSONObject(this.responseParameters);

        if (this.serviceWindow != null) { // SLA found, return null, not exception
            json.put("serv_window_start", "'" + this.serviceWindow.getServiceWindowStartTime()
                    + "'");
            json.put("serv_window_end", "'" + this.serviceWindow.getServiceWindowEndTime() + "'");
            json.put("serv_window_days", this.serviceWindow.getServiceWindowDaysAsString());

            int allow_work_on_holidays = this.serviceWindow.isAllowWorkOnHolidays() ? 1 : 0;
            json.put("allow_work_on_holidays", allow_work_on_holidays);

            for (int i = 0; i < this.priority_levels.length; i++) {
                int index = i + 1;
                json.put("priority_level_" + index, this.priority_levels[i]);
            }

            int autocreate_wr = this.autocreate_wr ? 1 : 0;
            json.put("autocreate_wr", autocreate_wr);

            int autocreate_wo = this.autocreate_wo ? 1 : 0;
            json.put("autocreate_wo", autocreate_wo);

            int autoschedule = this.autoschedule ? 1 : 0;
            json.put("autoschedule", autoschedule);

            int autoissue = this.autoissue ? 1 : 0;
            json.put("autoissue", autoissue);

            int approve = this.autoapprove ? 1 : 0;
            json.put("autoapprove", approve);

            int dispatch = this.autodispatch ? 1 : 0;
            json.put("autodispatch", dispatch);

            int notify = this.notifyRequestor ? 1 : 0;
            json.put("notify_requestor", notify);

            int accept = this.autoaccept ? 1 : 0;
            json.put("autoaccept", accept);

            int notifyCf = this.notifyCraftsperson ? 1 : 0;
            json.put("notify_craftsperson", notifyCf);

            int notifySp = this.notifyServiceProvider ? 1 : 0;
            json.put("notify_service_provider", notifySp);
        }

        return json;
    }

    /**
     * Lookup SLA priority levels.
     * 
     */
    private void lookupSlaPriorityLevels() {
        String where = "activity_type = " + literal(this.context, this.activity_type)
                + " AND ordering_seq = " + this.ordering_seq;

        List<Object[]> records = selectDbRecords(this.context, Constants.SLA_RESPONSE_TABLE,
            new String[] { "priority", "priority_label" }, where);

        if (records == null || records.size() <= 0) {
            return; // return null, not throw exception
        }
        for (Object[] rec : records) {
            int priority = (getIntegerValue(this.context, rec[0])).intValue();
            if (priority >= Constants.MINIMAL_PRIORITY && priority <= Constants.PRIORITY_LEVELS) {
                this.priority_levels[priority - Constants.MINIMAL_PRIORITY] = getStringValue(rec[1]); // the
                // array
                // starts
                // at 0
                if (this.priority == priority) {
                    this.responseParameters.put("priority_level", getStringValue(rec[1]));
                }
            }
        }
    }

    private void lookupHelperRules() {
        String SQL = "SELECT status, step_order, step_type, activity_id, step, step_status, em_id, vn_id, cf_id, role, condition, multiple_required, notify_responsible "
                + "FROM helpdesk_sla_steps WHERE activity_type = "
                + literal(this.context, this.activity_type)
                + " AND ordering_seq = "
                + this.ordering_seq + " AND priority= " + this.priority;
        String[] flds = { "status", "step_order", "step_type", "activity_id", "step",
                "step_status", "em_id", "vn_id", "cf_id", "role", "condition", "multiple_required",
                "notify_responsible" };

        List<DataRecord> steps = SqlUtils.executeQuery("helpdesk_sla_steps", flds, SQL);

        this.helperRules = new ArrayList<Map<String, Object>>();
        for (DataRecord step : steps) {
            Map<String, Object> stepMap = new HashMap<String, Object>();
            for (String element : flds) {
                stepMap.put(element, step.getValue("helpdesk_sla_steps." + element));
            }
            this.helperRules.add(stepMap);
        }

    }

    /*
     * Getters and Setters
     */
    /**
     * Retrieve activity_type
     * 
     * @return activity type
     */
    public String getActivity_type() {
        return this.activity_type;
    }

    /**
     * Set activity_type.
     * 
     * @param activity_type Activity type
     */
    public void setActivity_type(String activity_type) {
        this.activity_type = activity_type;
    }

    public boolean isAutoapprove() {
        return this.autoapprove;
    }

    public boolean isAutocreate_wr() {
        return this.autocreate_wr;
    }

    public boolean isAutocreate_wo() {
        return this.autocreate_wo;
    }

    public boolean isAutoissue() {
        return this.autoissue;
    }

    public boolean isAutoDispatch() {
        return this.autodispatch;
    }

    public boolean isAutoschedule() {
        return this.autoschedule;
    }

    public int getOrdering_seq() {
        return this.ordering_seq;
    }

    public void setOrdering_seq(int ordering_seq) {
        this.ordering_seq = ordering_seq;
    }

    public int getPriority() {
        return this.priority;
    }

    public void setPriority(int priority) {
        if (priority < Constants.MINIMAL_PRIORITY || priority > Constants.PRIORITY_LEVELS) {
            throw new ServiceLevelAgreementException("Priority level exceeding min or max "
                    + priority);
        }
        this.priority = priority;
    }

    /**
     * set the level 1 to 5
     * 
     * @param label Description
     * @param level level number
     */
    public void setPriorityLevel(String label, int level) {
        if (level >= Constants.MINIMAL_PRIORITY && level <= Constants.PRIORITY_LEVELS) {
            this.priority_levels[level - Constants.MINIMAL_PRIORITY] = label;
        }
    }

    public String[] getPriorityLevels() {
        return this.priority_levels;
    }

    /**
     * Get priority level label description. Starting from 1 to 5.
     * 
     * @param level level number
     * @return priority level label
     */
    public String getPriorityLevel(int level) {
        if (level > 0 && level <= this.priority_levels.length) {
            return this.priority_levels[level - 1];
        } else {
            return null;
        }
    }

    public ServiceWindow getServiceWindow() {
        return this.serviceWindow;
    }

    public void setServiceWindow(ServiceWindow serviceWindow) {
        this.serviceWindow = serviceWindow;
    }

    public boolean isAutodispatch() {
        return this.autodispatch;
    }

    public boolean isNotifyRequestor() {
        return this.notifyRequestor;
    }

    public boolean isNotifyCraftsperson() {
        return this.notifyCraftsperson;
    }

    public boolean isNotifyServiceProvider() {
        return this.notifyServiceProvider;
    }

    public boolean isAutoaccept() {
        return this.autoaccept;
    }

    public String getXmlHelperRules() {
        return this.xmlHelperRules;
    }

    public void setXmlHelperRules(String xmlHelperRules) {
        this.xmlHelperRules = xmlHelperRules;
    }

    public List<Map<String, Object>> getHelperRules() {
        if (this.helperRules == null) {
            lookupHelperRules();
        }
        return this.helperRules;

    }

    public void setHelperRules(List helperRules) {
        this.helperRules = helperRules;
    }

    /**
     * Retrieve a request parameter with type String.<br />
     * This checks if the parameter is given in the {@link #requestParameters request parameter map}
     * and if the value is of type String
     * 
     * @param parameter field to retrieve
     * @return field value (String) or null
     */
    protected String getRequestStringParameter(String parameter) {
        if (this.requestParameters.containsKey(parameter)
                && this.requestParameters.get(parameter) instanceof String) {
            return (String) this.requestParameters.get(parameter);
        } else {
            return null;
        }
    }

    /**
     * Retrieve a response parameter with type String.<br />
     * This checks if the parameter is given in the {@link #responseParameters response parameter
     * map} and if the value is of type String
     * 
     * @param parameter field to retrieve
     * @return field value (String) or null
     */
    public String getResponseStringParameter(String parameter) {
        if (this.responseParameters.containsKey(parameter)
                && this.responseParameters.get(parameter) instanceof String
                && !this.responseParameters.get(parameter).equals("")) {
            return (String) this.responseParameters.get(parameter);
        } else {
            return null;
        }
    }

    /**
     * Retrieve a response parameter with type Integer.<br />
     * This checks if the parameter is given in the
     * {@link #responseParameters response parameter map} and if the value is of type Integer
     * 
     * @param parameter field to retrieve
     * @return field value (Integer) or null
     */
    public Integer getResponseIntegerParameter(String parameter) {
        if (this.responseParameters.containsKey(parameter)
                && this.responseParameters.get(parameter) instanceof Integer) {
            return (Integer) this.responseParameters.get(parameter);
        } else {
            return null;
        }
    }

    /**
     * Retrieve SLA Manager from the {@link #responseParameters response parameter map}
     * 
     * @return manager
     */
    public String getSLAManager() {
        return getResponseStringParameter("manager");
    }

    /**
     * Retrieve supervisor from the {@link #responseParameters response parameter map}
     * 
     * @return supervisor
     */
    public String getSupervisor() {
        return getResponseStringParameter("supervisor");
    }

    /**
     * Retrieve work team from the {@link #responseParameters response parameter map}
     * 
     * @return work team id
     */
    public String getWorkTeam() {
        return getResponseStringParameter("work_team_id");
    }

    /**
     * Get assignee.
     * 
     * <p>
     * Use <code>em</code>, <code>vn</code> or <code>cf</code> as table name.
     * </p>
     * 
     * @param tableName (em,vn or cf)
     * @return assignee code
     */
    public String getAssignee(String tableName) {
        if (this.responseParameters.containsKey(tableName + "_id")) {
            return getResponseStringParameter(tableName + "_id");
        } else {
            // @translatable
            String errorMessage = "Illegal parameter for table [{0}] for assignee, only em, cf and vn";
            final Object[] args = { tableName };
            throw new ExceptionBase(errorMessage, args, true);
        }
    }

    public String getCraftsperson() {
        return getResponseStringParameter("cf_id");
    }

    public Integer getDefaultPriority() {
        return this.default_priority;
    }

    /**
     * Check if two sla's are equal, by using primary key of response table
     */
    @Override
    public boolean equals(Object object) {
        if (object == null) {
            return false;
        }
        if (object instanceof ServiceLevelAgreement) {
            ServiceLevelAgreement sla = (ServiceLevelAgreement) object;
            return (this.getActivity_type().equals(sla.getActivity_type())
                    && this.getOrdering_seq() == sla.getOrdering_seq() && this.getPriority() == sla
                .getPriority());

        } else {
            return false;
        }
    }

    /**
     * Unescape a string that has been passed by Ajax that has been escaped using encodeURIComponent
     * in javascript. To be used for non-standard UTF characters.
     * 
     * @param string to unescape
     * @return original unescaped string.
     */
    private String unescape(String s) {
        StringBuffer sbuf = new StringBuffer();
        int l = s.length();
        int ch = -1;
        int b, sumb = 0;
        for (int i = 0, more = -1; i < l; i++) {
            /* Get next byte b from URL segment s */
            switch (ch = s.charAt(i)) {
            case '%':
                ch = s.charAt(++i);
                int hb = (Character.isDigit((char) ch) ? ch - '0' : 10 + Character
                    .toLowerCase((char) ch) - 'a') & 0xF;
                ch = s.charAt(++i);
                int lb = (Character.isDigit((char) ch) ? ch - '0' : 10 + Character
                    .toLowerCase((char) ch) - 'a') & 0xF;
                b = (hb << 4) | lb;
                break;
            case '+':
                b = ' ';
                break;
            default:
                b = ch;
            }
            /* Decode byte b as UTF-8, sumb collects incomplete chars */
            if ((b & 0xc0) == 0x80) { // 10xxxxxx (continuation byte)
                sumb = (sumb << 6) | (b & 0x3f); // Add 6 bits to sumb
                if (--more == 0) {
                    sbuf.append((char) sumb); // Add char to sbuf
                }
            } else if ((b & 0x80) == 0x00) { // 0xxxxxxx (yields 7 bits)
                sbuf.append((char) b); // Store in sbuf
            } else if ((b & 0xe0) == 0xc0) { // 110xxxxx (yields 5 bits)
                sumb = b & 0x1f;
                more = 1; // Expect 1 more byte
            } else if ((b & 0xf0) == 0xe0) { // 1110xxxx (yields 4 bits)
                sumb = b & 0x0f;
                more = 2; // Expect 2 more bytes
            } else if ((b & 0xf8) == 0xf0) { // 11110xxx (yields 3 bits)
                sumb = b & 0x07;
                more = 3; // Expect 3 more bytes
            } else if ((b & 0xfc) == 0xf8) { // 111110xx (yields 2 bits)
                sumb = b & 0x03;
                more = 4; // Expect 4 more bytes
            } else /* if ((b & 0xfe) == 0xfc) */{ // 1111110x (yields 1 bit)
                sumb = b & 0x01;
                more = 5; // Expect 5 more bytes
            }
            /* We don't test if the UTF-8 encoding is well-formed */
        }
        return sbuf.toString();
    }

    public Map hasStepOfType(String status, String type) {
        for (Map step : this.getHelperRules()) {
            if (step.get("status").equals(status) && step.get("step_type").equals(type)) {
                return step;
            }
        }
        return null;
    }

}
