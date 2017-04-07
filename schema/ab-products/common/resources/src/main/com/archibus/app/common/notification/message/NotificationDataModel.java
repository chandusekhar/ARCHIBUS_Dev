package com.archibus.app.common.notification.message;

import java.util.*;

import com.archibus.app.common.notification.domain.Notification;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * 
 * Notification DataModel Class.
 * 
 * @author Zhang Yi
 * 
 */
public class NotificationDataModel {
    
    /**
     * Constant: table name.
     */
    public static final String ACTIVITY_LOG = "activity_log";
    
    /**
     * Constant: table field name.
     */
    public static final String ACTIVITY_LOG_ACTIVITY_LOG_ID = "activity_log.activity_log_id";
    
    /**
     * Constant: table field name.
     */
    public static final String ACTIVITY_LOG_REG_PROGRAM = "activity_log.reg_program";
    
    /**
     * Constant: table field name.
     */
    public static final String ACTIVITY_LOG_REGULATION = "activity_log.regulation";
    
    /**
     * Constant: table name.
     */
    public static final String COMPLIANCE_LOCATIONS = "compliance_locations";
    
    /**
     * Constant: table name 'project'.
     */
    public static final String PROJECT = "project";
    
    /**
     * Constant: table name.
     */
    public static final String REGPROGRAM = "regprogram";
    
    /**
     * Constant: table name.
     */
    public static final String REGREQUIREMENT = "regrequirement";
    
    /**
     * Constant: field name.
     */
    public static final String REGULATION = "regulation";
    
    /**
     * Fields/Values Map for DataModel for notification.
     */
    protected Map<String, Object> dataModel;
    
    /**
     * Map of DataSources by table names as key.
     */
    protected Map<String, DataSource> dataSources;
    
    /**
     * Tables fields for DataModel for notifications.
     */
    protected List<String> fieldNames;
    
    /**
     * Map store table names and their primary key values Map.
     */
    protected Map<String, Map<String, Object>> keyValues;
    
    /**
     * Records containing fields for each table.
     */
    protected Map<String, DataRecord> records;
    
    /**
     * Tables name for DataModel for compliance notifications.
     */
    protected String[] tableNames;
    
    /**
     * DataSource of table activity_log.
     */
    private DataSource dsEvent;
    
    /**
     * Prepare data model used for notification.
     * 
     * @param notification the notification to create data model from
     */
    public void generateDataModel(final Notification notification) {
        
        this.loadRecords(notification);
        
        this.createDataModel();
        
    }
    
    /**
     * Getter for the dataModel property.
     * 
     * @see dataModel
     * @return the dataModel property.
     */
    public Map<String, Object> getDataModel() {
        return this.dataModel;
    }
    
    /**
     * Getter for the fieldNames property.
     * 
     * @see fieldNames
     * @return the fieldNames property.
     */
    public List<String> getFieldNames() {
        return this.fieldNames;
    }
    
    /**
     * Getter for the keyValues property.
     * 
     * @see keyValues
     * @return the keyValues property.
     */
    public Map<String, Map<String, Object>> getKeyValues() {
        return this.keyValues;
    }
    
    /**
     * Getter for the records property.
     * 
     * @see records
     * @return the records property.
     */
    public Map<String, DataRecord> getRecords() {
        return this.records;
    }
    
    /**
     * Setter for the dataModel property.
     * 
     * @see dataModel
     * @param dataModel the dataModel to set
     */
    
    public void setDataModel(final Map<String, Object> dataModel) {
        this.dataModel = dataModel;
    }
    
    /**
     * Setter for the fieldNames property.
     * 
     * @see fieldNames
     * @param fieldNames the fieldNames to set
     */
    
    public void setFieldNames(final List<String> fieldNames) {
        this.fieldNames = fieldNames;
    }
    
    /**
     * Setter for the keyValues property.
     * 
     * @see keyValues
     * @param keyValues the keyValues to set
     */
    
    public void setKeyValues(final Map<String, Map<String, Object>> keyValues) {
        this.keyValues = keyValues;
    }
    
    /**
     * Setter for the records property.
     * 
     * @see records
     * @param records the records to set
     */
    
    public void setRecords(final Map<String, DataRecord> records) {
        this.records = records;
    }
    
    /**
     * Initial table names list for Compliance Notification Data Model.
     * 
     * @param notification the notification to create data model from
     */
    protected void initial(final Notification notification) {
        
        // initial table name array
        this.tableNames =
                new String[] { ACTIVITY_LOG, REGULATION, REGPROGRAM, REGREQUIREMENT,
                        COMPLIANCE_LOCATIONS, PROJECT };
        
        this.dsEvent = DataSourceFactory.createDataSource();
        this.dsEvent.addTable(ACTIVITY_LOG);
        this.dsEvent.addField(new String[] { "activity_log_id", REGULATION, "reg_program",
                "reg_requirement", "project_id", "location_id" });
        
        this.dataSources = new HashMap<String, DataSource>();
        
        // initial DataSource map
        for (final String table : this.tableNames) {
            
            final DataSource tableDs =
                    DataSourceFactory.createDataSourceForFields(table, EventHandlerBase
                        .getAllFieldNames(ContextStore.get().getEventHandlerContext(), table));
            this.dataSources.put(table, tableDs);
            
        }
        
    }
    
    /**
     * Initial load records by table names and their primary key values .
     * 
     * @param notification the notification to create data model from
     */
    protected void loadRecords(final Notification notification) {
        
        this.initial(notification);
        
        this.createKeyValuesMap(notification);
        
        this.records = new HashMap<String, DataRecord>();
        
        // Loop through table names
        for (final String tableName : this.tableNames) {
            
            final List<DataRecord> results = this.getRecordsByPrimaryKey(tableName);
            
            // Only add single record to records list
            if (results != null && !results.isEmpty()) {
                this.records.put(tableName, results.get(0));
            }
            
        }
    }
    
    /**
     * Prepare data model used for notification.
     * 
     */
    private void createDataModel() {
        
        this.dataModel = new HashMap<String, Object>();
        
        for (final String tableName : this.tableNames) {
            
            final Map<String, Object> values = new HashMap<String, Object>();
            
            if (this.records.containsKey(tableName)) {
                
                final DataRecord record = this.records.get(tableName);
                final Map<String, DataValue> fields = record.getFieldsByName();
                
                for (final String fieldName : fields.keySet()) {
                    
                    final String shorFieldName = fieldName.split("\\.")[1];
                    
                    if ((fieldName.indexOf("date") >= 0 || fieldName.indexOf("time") >= 0)
                            && fields.get(fieldName).getValue() != null) {
                        values.put(shorFieldName,
                            SqlUtils.normalizeValueForSql(fields.get(fieldName).getValue())
                                .toString());
                        
                    } else {
                        
                        values.put(shorFieldName, fields.get(fieldName).getValue());
                    }
                }
                
                this.dataModel.put(tableName, values);
                
            }
            
        }
        
    }
    
    /**
     * Get all key values by Notification for getting records related to Compliance Notification.
     * 
     * @param notification the notification to create data model from
     */
    private void createKeyValuesMap(final Notification notification) {
        
        this.keyValues = new HashMap<String, Map<String, Object>>();
        
        final int eventId = notification.getEventId();
        
        final DataRecord record = this.dsEvent.getRecord(" activity_log_id=" + eventId);
        
        Map<String, Object> keyValue;
        if (record != null) {
            
            // put primary key and value of activity_log record to keyValues
            keyValue = new HashMap<String, Object>();
            keyValue.put(ACTIVITY_LOG_ACTIVITY_LOG_ID,
                record.getValue(ACTIVITY_LOG_ACTIVITY_LOG_ID));
            this.getKeyValues().put(ACTIVITY_LOG, keyValue);
            
            // put primary key and value of regulation record to keyValues
            keyValue = new HashMap<String, Object>();
            keyValue.put("regulation.regulation", record.getValue(ACTIVITY_LOG_REGULATION));
            this.getKeyValues().put(REGULATION, keyValue);
            
            // put primary key and value of program record to keyValues
            keyValue = new HashMap<String, Object>();
            keyValue.put("regprogram.regulation", record.getValue(ACTIVITY_LOG_REGULATION));
            keyValue.put("regprogram.reg_program", record.getValue(ACTIVITY_LOG_REG_PROGRAM));
            this.getKeyValues().put(REGPROGRAM, keyValue);
            
            // put primary key and value of requirement record to keyValues
            keyValue = new HashMap<String, Object>();
            keyValue.put("regrequirement.regulation", record.getValue(ACTIVITY_LOG_REGULATION));
            keyValue.put("regrequirement.reg_program", record.getValue(ACTIVITY_LOG_REG_PROGRAM));
            keyValue.put("regrequirement.reg_requirement",
                record.getValue("activity_log.reg_requirement"));
            this.getKeyValues().put(REGREQUIREMENT, keyValue);
            
            // put primary key and value of project record to keyValues
            keyValue = new HashMap<String, Object>();
            keyValue.put("project.project_id", record.getValue("activity_log.project_id"));
            this.getKeyValues().put(PROJECT, keyValue);
            
            // put primary key and value of project record to keyValues
            keyValue = new HashMap<String, Object>();
            keyValue.put("compliance_locations.location_id",
                record.getValue("activity_log.location_id"));
            this.getKeyValues().put(COMPLIANCE_LOCATIONS, keyValue);
            
        }
        
    }
    
    /**
     * @return records by given table names and its primary key values .
     * 
     * @param tableName table name
     */
    private List<DataRecord> getRecordsByPrimaryKey(final String tableName) {
        
        List<DataRecord> results = null;
        
        // get primary key values Map for table name
        final Map<String, Object> pkey = this.getKeyValues().get(tableName);
        
        if (pkey != null && !pkey.isEmpty()) {
            
            // construct SQL restriction of String format
            final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
            
            final int startIndex = tableName.length();
            
            // For each primary key and its value, add them "EQUAL" clause to restriction
            for (final String keyName : pkey.keySet()) {
                
                if (pkey.get(keyName) == null) {
                    continue;
                }
                final String fieldName = keyName.substring(startIndex + 1);
                restriction.addClause(tableName, fieldName, pkey.get(keyName), Operation.EQUALS);
                
            }
            // Query records
            results = this.dataSources.get(tableName).getRecords(restriction);
        }
        return results;
    }
    
}
