package com.archibus.eventhandler.helpdesk;

import java.sql.*;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * <p>
 * Handles common workflowrules for helpdesk, such as saving and deleting a record.
 * 
 */

public class CommonHandler extends HelpdeskEventHandlerBase {

    /**
     * <p>
     * Save record given in fields.
     * </p>
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * <li>tableName : table</li>
     * <li>pkeyName : primary key field</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>message: primary key value of saved record</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save record to database in the given table</li>
     * <li>if pkeyName is given, retrieve pkey value for saved record</li>
     * <li>Create and return message with pkey value</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void saveRecord(EventHandlerContext context) {
        // get input parameters from context
        String tableName = (String) context.getParameter("tableName");
        String pkeyName = null;
        if (context.parameterExists("pkeyName")) {
            pkeyName = (String) context.getParameter("pkeyName");
        }
        Map fieldValues = context.getParameters("fields");
        Map values = stripPrefix(fieldValues);

        // create or update record
        executeDbSave(context, tableName, values);
        //executeDbCommit(context);
        // if requested, retrieve new object pkey value and attach it to the response as "message"
        if (pkeyName != null) {
            Double pkeyDouble = retrieveStatistic(context, "max", null, tableName, pkeyName);
            Integer pkeyInt = new Integer(pkeyDouble.intValue());
            context.addResponseParameter("message", pkeyInt);
        }
    }

    /**
     * <p>
     * Retrieve statistic from the database.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>field: field in statistic</li>
     * <li>table: table to retrieve record from</li>
     * <li>stat: statistic(max,count,min,...)</li>
     * <li>whereSql: where condition</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression: JSONObject with statistic<br />
     * <code>{statistic : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object for using in the selectDbRecords method</li>
     * <li>Create sql query</li>
     * <li>Get query results</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT <i>stat</i>(<i>field</i>) FROM <i>table</i> WHERE <i>sql</i></div>
     * </p>
     * @param String field
     * @param String table
     * @param String stat
     * @param String whereSql
     */
    public void getStatistic(String field,String table,String stat,String whereSql) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // select
        String sql = "SELECT " + stat + "(" + field + ")" + " FROM " + table + " WHERE "
                + whereSql;

        List statistics = selectDbRecords(context, sql);
        Object[] rec = (Object[]) statistics.get(0);

        JSONObject result = new JSONObject();
        result.put("statistic", rec[0]);

        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * 
     * <p>
     * Retrieve single value from the database.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>table: table to retrieve record from</li>
     * <li>field_name: field to select</li>
     * <li>sql: where condition</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression: JSONObject with field name-value pair<br />
     * <code>{<i>field</i>:?}</code> </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Select value from database</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> SELECT <i>field</i> FROM <i>table</i> WHERE <i>sql</i> </div>
     * </p>
     * <p>
     * @param String table
     * @param String field_name
     * @param String sql
     */
    public void getValue(String table,String field_name,String sql) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        //KB3051080 - check sql injection 
        final SqlInjectionHandler handler =
                (SqlInjectionHandler) ContextStore.get().getBean("sqlInjectionHandler");
        if (StringUtil.notNullOrEmpty(sql)) {
            handler.checkString(sql);
        }

        // SELECT field FROM table WHERE sql;
        Object value = selectDbValue(context, table, field_name, sql);

        JSONObject results = new JSONObject();
        try {
            String field_value = notNull(value);
            results.put(field_name, field_value);
        } catch (NullPointerException e) {
            results.put(field_name, "");
        }

        context.addResponseParameter("jsonExpression", results.toString());
    }

    /**
     * 
     * <p>
     * Retrieve values from the database.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>table: table to retrieve record from</li>
     * <li>fieldnames: ;-separated list of fields to select</li>
     * <li>sql: where condition</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression: JSONObject with field name-value pairs<br />
     * <code>{<i>field</i>:?}</code> </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Select value from database</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> SELECT <i>fields</i> FROM <i>table</i> WHERE <i>sql</i> </div>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void getValues(EventHandlerContext context) {
        String tmp = context.getString("fieldnames");
        String[] field_names = tmp.split(";");

        // SELECT fields FROM table WHERE sql;
        Object[] values = selectDbValues(context, context.getString("table"), field_names, context
            .getString("sql"));

        JSONObject results = new JSONObject();
        for (int i = 0; i < field_names.length; i++) {
            try {
                String field_value = notNull(values[i]);
                results.put(field_names[i], field_value);
            } catch (NullPointerException e) {
                results.put(field_names[i], "");
            }
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }

    /**
     * 
     * <p>
     * Get a list to populate a select drop down field in a form.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     *   <li>tableName : table to retrieve records from</li>
     *   <li>valueField : field of table for (html) value attribute in select list</li>
     *   <li>textField : field of table for (html) text attribute in select list</li>
     *   <li>where : sql where condition</li>
     * </ul>
     * </p>
     * <p>
     *  <b>Outputs:</b>
     *  <ul>
     *    <li>jsonExpression : JSONObject with JSONArray of JSONObjects with value-text
     *     pairs<br />
     *     <code>{items : [{value: ?, text: ?}]}</code> </li>
     *  </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     *   <ol>
     *    <li>Get context object</li>
     *    <li>Retrieve records from database</li>
     *    <li>Create and return jsonExpression</li>
     *   </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT <i>valueField</i> as value, <i>textField</i> as text
     *   FROM <i>tableName</i> WHERE <i>where</i></div>
     * </p>
     * @param String tableName
     * @param String valueField
     * @param String textField
     * @param String where
     * 
     */
    public void getSelectList(String tableName,String valueField,String textField,String where) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (isOracle(context)) {
            valueField = StringUtil.replace(valueField, "+", "||");
            textField = StringUtil.replace(textField, "+", "||");
        }

        JSONArray items = new JSONArray();

        List<DataRecord> records = null;

        final DataSource ds =
                DataSourceFactory.createDataSourceForFields(tableName, new String[] { valueField,
                        textField });
        
        //KB3050920  for mssql, add top to make sure 'order by' in where work 
        if(SqlUtils.isSqlServer()) {
            ds.addQuery("SELECT DISTINCT TOP 99999" + valueField + " AS value, " + textField + " as text from "
                    + tableName + " where (${sql.vpaRestriction}) AND " + where);
        }else {
            ds.addQuery("SELECT DISTINCT " + valueField + " AS value, " + textField + " as text from "
                    + tableName + " where (${sql.vpaRestriction}) AND " + where);
        }
        
        ds.addVirtualField(tableName, "value", DataSource.DATA_TYPE_TEXT);
        ds.addVirtualField(tableName, "text", DataSource.DATA_TYPE_TEXT);
        ds.setApplyVpaRestrictions(false);
        records = ds.getRecords();

        for (final DataRecord record : records) {

            final JSONObject json = new JSONObject();
            json.put("value", notNull(record.getValue(tableName + ".value")));
            json.put("text", notNull(record.getValue(tableName + ".text" )));
            items.put(json);
        }

        JSONObject result = new JSONObject();
        result.put("items", items);

        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * 
     * <p>
     * Get a year list to populate a select drop down field in a form.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tableName : table to retrieve records from</li>
     * <li>dateField : field to retrieve values </li>
     * <li>where : sql where condition</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Create SQL statement according to the input parameters</li>
     * <li>Get the records and assemble the results</li>
     * </ol>
     * </p>
     * @param final String tableName
     * @param final String dateField
     * @param final String where
     */
    public void getYearSelectList(final String tableName,final String dateField,final String where) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        JSONArray items = new JSONArray();

        List records = null;
        StringBuffer query = new StringBuffer("SELECT DISTINCT ");

        String selectField = dateField;
        if (isOracle(context)) {
            selectField = "TO_CHAR(" + dateField + ", 'YYYY')";
        } else {
            selectField = "datepart(year," + dateField + ")";
        }
        query.append(selectField);
        query.append(" FROM " + tableName);

        if (!where.equals("") && !where.equals("null")) {
            query.append(" WHERE " + where);
        }
        query.append(" ORDER BY " + selectField);
        records = selectDbRecords(context, query.toString());

        if (!records.isEmpty()) {
            for (Iterator it = records.iterator(); it.hasNext();) {
                Object[] record = (Object[]) it.next();

                JSONObject json = new JSONObject();
                json.put("value", record[0]);
                json.put("text", record[0]);
                items.put(json);
            }
        }

        JSONObject result = new JSONObject();
        result.put("items", items);

        context.addResponseParameter("jsonExpression", result.toString());
    }

    /**
     * 
     * <p>
     * Delete selected records.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray of JSONObjects for records to delete</li>
     * <li>tableName : table to delete record from</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get context object</li>
     * <li>Get the JSONObject from array and convert it to a map </li>
     * <li>Delete records from the given table in the database</li>
     * </ol>
     * </p>
     * <p>
     *
     *            </p>
     * @param JSONArray records
     * @param String tableName       
     */
    public void deleteRecords(JSONArray records,String tableName) {
        //fix KB3031078 - Update Help Desk WFRs to use DataSource API instead of executeDbDelete(Guo 2011/4/18)
        //EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        DataSource dataSource = null;

        if (records.length() > 0) {
            dataSource =  DataRecord.createDataSourceForRecord(records.getJSONObject(0));
            dataSource.addTable(tableName);
            for (int i = 0; i < records.length(); i++) {
                JSONObject record = records.getJSONObject(i);
                Map values = fromJSONObject(record);
                dataSource.deleteRecord(values);
                //values = stripPrefix(values);
                //executeDbDelete(context, tableName, values);
                //executeDbCommit(context);
            }
        } // end if
    }
    
    /**
     * Get current local date and time.
     * @param tableName wo, wr, activity_log
     * @param fieldName wo_id, wr_id, activity_log_id
     * @param pkValue wo_id, wr_id, activity_log_id
     */
    public void getCurrentLocalDateTime(String tableName, String fieldName, String pkValue) {
        
        Map<String, String> siteBuildingMap = Common.getSiteBuildingIds(tableName, fieldName, pkValue);
        
        JSONObject json = new JSONObject();
        Date currentLocalDate = LocalDateTimeStore.get().currentLocalDate(null, null, siteBuildingMap.get("siteId"), siteBuildingMap.get("blId")); 
        Time currentLocalTime = LocalDateTimeStore.get().currentLocalTime(null, null, siteBuildingMap.get("siteId"), siteBuildingMap.get("blId"));
        
        json.put("date", currentLocalDate.toString());
        json.put("time", currentLocalTime.toString());
        
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * 
     * @param siteId site id
     * @param blId building id.
     */
    public void getCurrentLocalDateTimeSiteAndBl(String siteId, String blId) {
        
        JSONObject json = new JSONObject();
        Date currentLocalDate = LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId); 
        Time currentLocalTime = LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
        
        json.put("date", currentLocalDate.toString());
        json.put("time", currentLocalTime.toString());
        
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter("jsonExpression", json.toString());
    }
}
