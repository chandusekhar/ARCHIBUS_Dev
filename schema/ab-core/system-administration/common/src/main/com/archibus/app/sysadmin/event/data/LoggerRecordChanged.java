package com.archibus.app.sysadmin.event.data;

import java.util.List;

import com.archibus.app.common.event.domain.*;
import com.archibus.context.DatabaseRole;
import com.archibus.core.dao.IDao;
import com.archibus.core.event.data.*;
import com.archibus.datasource.data.DataValue;
import com.archibus.schema.Formatting;
import com.archibus.utility.CoreUserSessionTemplate;

/**
 * Event listener which is configured to be notified by the core when there is a RecordChanged
 * DataEvent.
 * <p>
 * Logs all event parameters to afm_data_event_log table.
 * <p>
 * Configured as prototype Spring bean, defined in
 * WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * @author Valery Tydykov
 * 
 *         Suppress PMD warning "DoNotUseThreads".
 *         <p>
 *         Justification: False positive: We use here Runnable interface, but do not use threads.
 */
@SuppressWarnings("PMD.DoNotUseThreads")
class LoggerRecordChanged implements ILoggerRecordChanged {
    /**
     * Accumulated results of the processing of the fields in data record.
     */
    // CHECKSTYLE:OFF Justification: Suppress "Hide utility class constructor" warning: False
    // positive: This is not a utility class.
    static class Result {
        // CHECKSTYLE:ON
        /**
         * Concatenated field names, separated by "|".
         */
        private String fields;
        
        /**
         * True if concatenated values need separator for the next value.
         */
        private boolean needsSeparator;
        
        /**
         * Concatenated new field values, separated by "|".
         */
        private String newValues;
        
        /**
         * Concatenated old field values, separated by "|".
         */
        private String oldValues;
        
        /**
         * True if all old values are nulls.
         */
        private boolean oldValuesAllNulls;
    }
    
    /**
     * Constant: document field value placeholder (value that will be logged instead of document
     * field value).
     */
    private static final String DOC_FIELD_CONTENT = "docFieldContent";
    
    /**
     * Constant: maximal number of characters to use from the memo field value.
     */
    private static final int MAX_MEMO_CHARACTERS = 100;
    
    /**
     * Constant: value to be reported for null: "null".
     */
    private static final String NULL = "null";
    
    /**
     * Constant: separator for the field names and values in the log.
     */
    private static final String SEPARATOR = "|";
    
    /**
     * Dao for RecordChanged.
     */
    private IDao<RecordChanged> recordChangedDao;
    
    /**
     * Gets first 100 characters of the supplied string value.
     * 
     * @param value to be truncated.
     * @return truncated value, or null if the value is null.
     */
    protected static String getFirst100Characters(final String value) {
        String result = null;
        if (value != null) {
            result = value.substring(0, Math.min(MAX_MEMO_CHARACTERS, value.length()));
        }
        
        return result;
    }
    
    /**
     * Populates field names, old and new field values in recordChanged, using fields and values
     * from the record in the recordChangedDataChangeEvent.
     * 
     * @param recordChangedEvent the event to take values from.
     * @param recordChanged the domain object to be populated.
     */
    protected static void populateFieldsAndValues(final RecordChangedEvent recordChangedEvent,
            final RecordChanged recordChanged) {
        // concatenate field names, old values, new values
        final Result result = new Result();
        result.fields = "";
        result.oldValues = "";
        result.newValues = "";
        result.needsSeparator = false;
        result.oldValuesAllNulls = true;
        // for each field in the record
        for (final DataValue dataValue : recordChangedEvent.getRecord().getFields()) {
            if (result.needsSeparator) {
                result.fields += SEPARATOR;
                result.oldValues += SEPARATOR;
                result.newValues += SEPARATOR;
            }
            
            result.fields += dataValue.getName();
            
            // if document field, ignore document field value, put a placeholder ""docFieldContent""
            // instead
            if (dataValue.getFieldDef().isDocument()) {
                // document field
                result.oldValues += DOC_FIELD_CONTENT;
                result.newValues += DOC_FIELD_CONTENT;
            } else {
                final Object oldValue = dataValue.getOldValue();
                final Object value = dataValue.getValue();
                if (dataValue.getFieldDef().getFormatting().equals(Formatting.Memo)) {
                    processMemoFieldValues(oldValue, value, result);
                } else {
                    // regular field, just concatenate value
                    processRegularFieldValues(oldValue, value, result);
                }
            }
            
            result.needsSeparator = true;
        }
        
        recordChanged.setFields(result.fields);
        recordChanged.setNewValues(result.newValues);
        
        // if old values are all nulls or the change type was not UPDATE, set oldValues to empty
        // string
        if (result.oldValuesAllNulls
                || !ChangeType.UPDATE.equals(recordChangedEvent.getChangeType())) {
            result.oldValues = "";
        }
        
        recordChanged.setOldValues(result.oldValues);
    }
    
    /**
     * Processes memo field old and new values, uses those values to modify result.
     * 
     * @param oldValue Old field value.
     * @param value New field value.
     * @param result with concatenated field values.
     */
    protected static void processMemoFieldValues(final Object oldValue, final Object value,
            final Result result) {
        // memo field
        // use first 100 characters of memo field
        // process old value
        if (oldValue == null) {
            // old value is null
            result.oldValues += NULL;
        } else {
            // old value is not null
            result.oldValuesAllNulls = false;
            final String memoFieldValue = oldValue.toString();
            result.oldValues += getFirst100Characters(memoFieldValue);
        }
        
        // process new value
        if (value == null) {
            // value is null
            result.newValues += NULL;
        } else {
            // value is not null
            final String memoFieldValue = value.toString();
            result.newValues += getFirst100Characters(memoFieldValue);
        }
    }
    
    /**
     * Processes old and new values of a regular field, uses those values to modify result.
     * 
     * @param oldValue Old field value.
     * @param value New field value.
     * @param result with concatenated field values.
     */
    protected static void processRegularFieldValues(final Object oldValue, final Object value,
            final Result result) {
        // process old value
        result.oldValues += oldValue;
        
        if (oldValue != null) {
            result.oldValuesAllNulls = false;
        }
        
        // process new value
        result.newValues += value;
    }
    
    /**
     * @return the recordChangedDao
     */
    public IDao<RecordChanged> getRecordChangedDao() {
        return this.recordChangedDao;
    }
    
    /** {@inheritDoc} */
    public void onRecordChanged(final RecordChangedEvent recordChangedEvent,
            final List<String> tablesToLog) {
        
        final String tableName = recordChangedEvent.getTableName();
        if (LoggerUtilities.isTableInList(tableName, tablesToLog)) {
            logEvent(recordChangedEvent);
        }
    }
    
    /**
     * @param recordChangedDao the recordChangedDao to set
     */
    public void setRecordChangedDao(final IDao<RecordChanged> recordChangedDao) {
        this.recordChangedDao = recordChangedDao;
    }
    
    /**
     * Logs recordChangedEvent, using recordChangedDao.
     * 
     * @param recordChangedEvent the event to be logged.
     */
    private void logEvent(final RecordChangedEvent recordChangedEvent) {
        // populate recordChanged from recordChangedEvent
        final RecordChanged recordChanged = new RecordChanged();
        recordChanged.setDate(new java.sql.Date(recordChangedEvent.getTimestamp()));
        recordChanged.setTime(new java.sql.Time(recordChangedEvent.getTimestamp()));
        recordChanged.setEventType(EventType.RECORD_CHANGED);
        recordChanged.setTableName(recordChangedEvent.getTableName());
        recordChanged.setUserName(recordChangedEvent.getUser().getName());
        recordChanged.setChangeType(recordChangedEvent.getChangeType());
        
        populateFieldsAndValues(recordChangedEvent, recordChanged);
        
        // prepare core UserSession context
        final CoreUserSessionTemplate template = new CoreUserSessionTemplate();
        // use DATA database
        template.setDatabaseRole(DatabaseRole.DATA);
        template.execute(new Runnable() {
            public void run() {
                LoggerRecordChanged.this.recordChangedDao.save(recordChanged);
            }
        });
    }
}
