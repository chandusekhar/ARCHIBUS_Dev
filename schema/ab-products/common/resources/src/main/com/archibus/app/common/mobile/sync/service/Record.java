package com.archibus.app.common.mobile.sync.service;

import java.util.*;

/**
 * DTO for DataRecord.
 * <p>
 * Contains list of field name/value pairs.
 * 
 * Used by IMobileSyncService to transfer data.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class Record {
    /**
     * Constant: "]".
     */
    private static final String SQUARE_BRACKET_CLOSE = "]";
    
    /**
     * Constant: "[".
     */
    private static final String SQUARE_BRACKET_OPEN = "[";
    
    /**
     * Property: fieldValues. List of field name/value pairs.
     */
    private List<FieldNameValue> fieldValues = new ArrayList<FieldNameValue>();
    
    /**
     * Setter for the fieldValues property.
     * 
     * @see fieldValues
     * @param fieldValues the fieldValues to set
     */
    
    public void setFieldValues(final List<FieldNameValue> fieldValues) {
        this.fieldValues = fieldValues;
    }
    
    /**
     * Adds fieldValue for the fieldName if fieldName does not exist, or sets fieldValue for the
     * fieldName if fieldName exists. No duplicates for fieldName.
     * 
     * @param fieldName to be added or set.
     * @param fieldValue to be added or set.
     */
    public void addOrSetFieldValue(final String fieldName, final Object fieldValue) {
        FieldNameValue fieldNameValue = this.findFieldNameValueForFieldName(fieldName);
        if (fieldNameValue == null) {
            // FieldNameValue not found, create new FieldNameValue
            fieldNameValue = new FieldNameValue();
        }
        
        fieldNameValue.setFieldName(fieldName);
        fieldNameValue.setFieldValue(fieldValue);
        
        this.fieldValues.add(fieldNameValue);
    }
    
    /**
     * Finds field value for the given field name.
     * 
     * @param fieldName to find.
     * @return field value if found, or null.
     */
    public Object findValueForFieldName(final String fieldName) {
        Object result = null;
        
        final FieldNameValue fieldNameValue = this.findFieldNameValueForFieldName(fieldName);
        if (fieldNameValue != null) {
            result = fieldNameValue.getFieldValue();
        }
        
        return result;
    }
    
    /**
     * Finds FieldNameValue for the given field name.
     * 
     * @param fieldName to find.
     * @return FieldNameValue if found, or null.
     */
    public FieldNameValue findFieldNameValueForFieldName(final String fieldName) {
        FieldNameValue result = null;
        for (final FieldNameValue fieldNameValue : Collections.unmodifiableList(this.fieldValues)) {
            if (fieldNameValue.getFieldName().equals(fieldName)) {
                result = fieldNameValue;
            }
        }
        
        return result;
    }
    
    /**
     * Getter for the fieldValues property.
     * 
     * @see fieldValues
     * @return the fieldValues property.
     */
    public List<FieldNameValue> getFieldValues() {
        return Collections.unmodifiableList(this.fieldValues);
    }
    
    /** {@inheritDoc} */
    @Override
    public String toString() {
        final StringBuilder stringBuilder = new StringBuilder();
        
        for (final FieldNameValue fieldNameValue : this.fieldValues) {
            stringBuilder.append(SQUARE_BRACKET_OPEN);
            stringBuilder.append(fieldNameValue.getFieldName());
            stringBuilder.append(SQUARE_BRACKET_CLOSE);
            stringBuilder.append("=");
            stringBuilder.append(SQUARE_BRACKET_OPEN);
            stringBuilder.append(fieldNameValue.getFieldValue());
            stringBuilder.append(SQUARE_BRACKET_CLOSE);
            stringBuilder.append(";");
        }
        
        return stringBuilder.toString();
    }
}
