package com.archibus.eventhandler.msds;

import java.sql.Time;
import java.util.List;

import org.springframework.context.ApplicationEvent;

import com.archibus.context.ContextStore;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.Utility;

/**
 * Listener which is configured to be notified by the core when there is a DataEvent. Records any
 * MSDS data changes to according historical tables.
 * 
 * 
 * @author Zhang Yi
 * 
 */
public class MsdsDataEventListener implements IDataEventListener {
    
    /**
     * Constant: Table-Field name: "msds_chemical.chemical_id".
     */
    private static String[] msdsTables = { MsdsConstants.MSDS_DATA, MsdsConstants.MSDS_LOCATION,
            MsdsConstants.MSDS_HAZ_CLASSIFICATION, MsdsConstants.MSDS_CONSTITUENT,
            MsdsConstants.MSDS_CHEMICAL };
    
    /**
     * Constant: Table-Field name: "msds_chemical.chemical_id".
     */
    private static String[] msdsHistoryTables = { MsdsConstants.MSDS_H_DATA,
            MsdsConstants.MSDS_H_LOCATION, MsdsConstants.MSDS_H_HAZ_CLASSIFICATION,
            MsdsConstants.MSDS_H_CONSTITUENT, MsdsConstants.MSDS_H_CHEMICAL };
    
    /** {@inheritDoc} */
    public void onApplicationEvent(final ApplicationEvent event) {
        if (event instanceof RecordChangedEvent) {
            final RecordChangedEvent recordChangedEvent = (RecordChangedEvent) event;
            
            onApplicationEventRecordChanged(recordChangedEvent);
        }
    }
    
    /**
     * Handles ApplicationEvent "RecordChanged".
     * 
     * @param recordChangedEvent the event to respond to.
     */
    private void onApplicationEventRecordChanged(final RecordChangedEvent recordChangedEvent) {
        
        final String tableName = recordChangedEvent.getTableName();
        
        // if table is one of tables that need to log the msds change
        for (final String msdsTable : msdsTables) {
            if (msdsTable.equalsIgnoreCase(tableName)) {
                this.recordMsdsHistoryInfo(recordChangedEvent, tableName);
            }
        }
    }
    
    /**
     * Handles ApplicationEvent "RecordChanged".
     * 
     * @param recordChangedEvent the event to respond to.
     * @param tableName the table need to log history info.
     */
    private void recordMsdsHistoryInfo(final RecordChangedEvent recordChangedEvent,
            final String tableName) {
        
        // boolean indicates if current event is fired after Update or Insert record
        final boolean afterInsertOrUpdate =
                recordChangedEvent.getBeforeOrAfter().equals(BeforeOrAfter.AFTER)
                        && (recordChangedEvent.getChangeType().equals(ChangeType.INSERT) || recordChangedEvent
                            .getChangeType().equals(ChangeType.UPDATE));
        
        // boolean indicates if current event is fired before Delete
        final boolean beforeDelete =
                recordChangedEvent.getBeforeOrAfter().equals(BeforeOrAfter.BEFORE)
                        && recordChangedEvent.getChangeType().equals(ChangeType.DELETE);
        
        if (afterInsertOrUpdate || beforeDelete) {
            
            this.insertMsdsHistoryRecord(recordChangedEvent.getRecord(), tableName);
        }
    }
    
    /**
     * Insert or Update historical msds record according to current record.
     * 
     * @param eventRecord the event record.
     * @param tableName the table need to log history info.
     */
    private void insertMsdsHistoryRecord(final DataRecord eventRecord, final String tableName) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // get according historical table name of current changed table
        final String hisTableName = this.getHistoryTableName(tableName);
        
        // get all fields name array of historical table, they don't contain table name prefix and
        // '.'
        final String[] hisFieldsNameList =
                com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, hisTableName);
        
        // create historical table datasource and add all fields
        final DataSource hisDs =
                DataSourceFactory.createDataSourceForFields(hisTableName, hisFieldsNameList);
        // create table datasource and add all fields
        final DataSource tableDs =
                DataSourceFactory.createDataSourceForFields(tableName,
                    EventHandlerBase.getAllFieldNames(context, tableName));
        
        // get original record if before delete
        final DataRecord record = getOriginalRecord(tableName, tableDs, eventRecord);
        
        // get a new or existed historical record
        final DataRecord hisRecord =
                getHistoryRecord(tableName, hisTableName, hisDs, tableDs, eventRecord);
        
        // store all existed field values from current changed record to according historical record
        for (final String hisFieldName : hisFieldsNameList) {
            
            if (record.valueExists(tableName + MsdsConstants.DOT + hisFieldName)) {
                
                hisRecord.setValue(hisTableName + MsdsConstants.DOT + hisFieldName,
                    record.getValue(tableName + MsdsConstants.DOT + hisFieldName));
            }
        }
        
        hisDs.saveRecord(hisRecord);
        
    }
    
    /**
     * @return new created or existed history record.
     * 
     * @param tableName the history table name.
     * @param tableDs the original table datasource.
     * @param record the original inserted, updated or deleted record.
     * 
     */
    private DataRecord getOriginalRecord(final String tableName, final DataSource tableDs,
            final DataRecord record) {
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        addPkClausesToRestriction(tableName, tableName, tableDs, record, restriction);
        
        final List<DataRecord> records = tableDs.getRecords(restriction);
        
        return records.isEmpty() ? record : records.get(0);
        
    }
    
    /**
     * @return new created or existed history record.
     * 
     * @param tableName the history table name.
     * @param hisTableName the history table name.
     * @param hisDs the history table datasource.
     * @param tableDs the original table datasource.
     * @param record the original inserted, updated or deleted record.
     * 
     */
    private DataRecord getHistoryRecord(final String tableName, final String hisTableName,
            final DataSource hisDs, final DataSource tableDs, final DataRecord record) {
        
        // reset second and millisecond of current time to 0 to only keep minute
        final Time currentTime = Utility.currentTime();
        currentTime.setTime(currentTime.getTime() / MsdsConstants.MILLISECONDS
                * MsdsConstants.MILLISECONDS);
        
        // construct a restriction from current date, time and other primary key values of current
        // record in Data Change Event
        final ParsedRestrictionDef hisRestriction =
                getPrimaryKeyRestriction(tableName, hisTableName, tableDs, record, currentTime);
        
        // if historical table contains no record then return an empty list, otherwise return a list
        // restricted by above generated restriction.
        final List<DataRecord> hisRecords =
                hisDs.getRecords().isEmpty() ? hisDs.getRecords() : hisDs
                    .getRecords(hisRestriction);
        
        DataRecord hisRecord;
        // if exists historical record that contains same primary key then return existed historical
        // record, else return a new historical record by setting archived date and time.
        if (hisRecords.isEmpty()) {
            hisRecord = hisDs.createNewRecord();
            hisRecord.setValue(hisTableName + ".date_archived", Utility.currentDate());
            hisRecord.setValue(hisTableName + ".time_archived", currentTime);
            
        } else {
            hisRecord = hisRecords.get(0);
        }
        return hisRecord;
    }
    
    /**
     * @return restriction composed of current date, time and primary key values of current record
     *         object.
     * 
     * @param tableName the history table name.
     * @param hisTableName the history table name.
     * @param tableDs the original table datasource.
     * @param record the original inserted, updated or deleted record.
     * @param currentTime the time only precise to minute.
     * 
     */
    private ParsedRestrictionDef getPrimaryKeyRestriction(final String tableName,
            final String hisTableName, final DataSource tableDs, final DataRecord record,
            final Time currentTime) {
        // construct a restriction from primary keys of historical table
        final ParsedRestrictionDef hisRestriction = new ParsedRestrictionDef();
        
        hisRestriction.addClause(hisTableName, MsdsConstants.DATE_ARCHIVED, Utility.currentDate(),
            Operation.EQUALS);
        hisRestriction.addClause(hisTableName, MsdsConstants.TIME_ARCHIVED, currentTime,
            Operation.EQUALS);
        
        addPkClausesToRestriction(tableName, hisTableName, tableDs, record, hisRestriction);
        
        return hisRestriction;
    }
    
    /**
     * add clauses from primary keys of given table to a restriction object object.
     * 
     * @param srcTableName the name of table holds the record.
     * @param destTableName the name of table that restriction applys.
     * @param srcTableDs the source table data-source.
     * @param record the record of source table.
     * @param restriction the restriction object.
     * 
     *            Justification: KB#3034281 will un-deprecate the method, or provide a replacement
     *            API.
     */
    @SuppressWarnings({ "deprecation" })
    private void addPkClausesToRestriction(final String srcTableName, final String destTableName,
            final DataSource srcTableDs, final DataRecord record,
            final ParsedRestrictionDef restriction) {
        
        // for each primary key of historical record, add corresponding restriction clause.
        final String[] pkNames =
                com.archibus.eventhandler.EventHandlerBase.getTablePkFieldNames(ContextStore.get()
                    .getEventHandlerContext(), srcTableName);
        
        for (final String keyFieldName : pkNames) {
            restriction.addClause(destTableName, keyFieldName,
                this.getPrimaryKeyValue(srcTableDs, srcTableName, keyFieldName, record),
                Operation.EQUALS);
        }
    }
    
    /**
     * @return according history table name by given msds table name.
     * 
     * @param tableName the table need to log history info.
     */
    private String getHistoryTableName(final String tableName) {
        
        String name = null;
        for (int i = 0; i < msdsTables.length; i++) {
            if (msdsTables[i].equalsIgnoreCase(tableName)) {
                name = msdsHistoryTables[i];
                break;
            }
        }
        return name;
    }
    
    /**
     * @return the list of primary key fields of the table from excludes date_archived and
     *         time_archived.
     * 
     * @param dataSource DataSource.
     * @param tableName the table name.
     * @param fieldName the primary key field name.
     * @param record the record from DataChange event.
     */
    private Object getPrimaryKeyValue(final DataSource dataSource, final String tableName,
            final String fieldName, final DataRecord record) {
        
        Object value = null;
        // if record contains the specified primary field value
        if (record.valueExists(tableName + MsdsConstants.DOT + fieldName)) {
            
            value = record.getValue(tableName + MsdsConstants.DOT + fieldName);
            
        } else {
            
            // if record doesn't specified primary field value
            // then construct a restriction from all field values in record of DataChange event
            final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
            for (final DataRecordField dbf : record.getFieldValues()) {
                
                restriction.addClause(tableName, dbf.getName().substring(tableName.length() + 1),
                    dbf.getValue(), Operation.EQUALS);
            }
            
            // get the only record(possible) and return its primary key value
            final List<DataRecord> records = dataSource.getRecords(restriction);
            if (!records.isEmpty()) {
                value = records.get(0).getValue(tableName + MsdsConstants.DOT + fieldName);
            }
            
        }
        
        return value;
    }
}
