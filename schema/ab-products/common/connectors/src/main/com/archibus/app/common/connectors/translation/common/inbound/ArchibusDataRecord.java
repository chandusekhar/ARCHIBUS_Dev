package com.archibus.app.common.connectors.translation.common.inbound;

import java.util.*;

/**
 * A database record representation of a record in the ARCHIBUS database.
 * 
 * @author cole
 */
public class ArchibusDataRecord {
    
    /**
     * Data that represents the record organized in fields.
     */
    private final Map<String, Object> databaseRecordFields;
    
    /**
     * Create a database record representation of a record from a message for/from a foreign system.
     * The record starts with no fields and no errors.
     */
    public ArchibusDataRecord() {
        this.databaseRecordFields = new HashMap<String, Object>();
    }
    
    /**
     * @return field names and their values.
     */
    public Map<String, Object> getFields() {
        return this.databaseRecordFields;
    }
    
    /**
     * @param fieldNames names of fields to be returned.
     * @return field names and their values for field names passed in, where present.
     */
    public Map<String, Object> getFields(final Set<String> fieldNames) {
        final Map<String, Object> presentFields = new HashMap<String, Object>();
        final Map<String, Object> fields = this.getFields();
        for (final String fieldName : fields.keySet()) {
            if (fieldNames.contains(fieldName)) {
                presentFields.put(fieldName, fields.get(fieldName));
            }
        }
        return presentFields;
    }
    
    /**
     * Set the value of a field on this record.
     * 
     * @param fieldName the name of the field whose value is to be set.
     * @param fieldValue the value to set the field to.
     */
    public void putField(final String fieldName, final Object fieldValue) {
        this.databaseRecordFields.put(fieldName, fieldValue);
    }
    
    @Override
    public String toString() {
        final Map<String, Object> outputMap = new HashMap<String, Object>();
        for (final String fieldName : this.databaseRecordFields.keySet()) {
            outputMap.put(fieldName, this.databaseRecordFields.get(fieldName));
        }
        return outputMap.toString();
    }
}
