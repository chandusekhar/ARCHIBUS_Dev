package com.archibus.app.common.mobile.sync.service;

/**
 * DTO for DataValue.
 * <p>
 * Contains field name and value.
 *
 * Used by IMobileSyncService to transfer data.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class FieldNameValue {
    /**
     * Property: fieldName. Does not include table name.
     */
    private String fieldName;

    /**
     * Property: fieldValue.
     */
    private Object fieldValue;

    /**
     * Getter for the fieldName property.
     *
     * @see fieldName
     * @return the fieldName property.
     */
    public String getFieldName() {
        return this.fieldName;
    }

    /**
     * Setter for the fieldName property.
     *
     * @see fieldName
     * @param fieldName the fieldName to set
     */

    public void setFieldName(final String fieldName) {
        this.fieldName = fieldName;
    }

    /**
     * Getter for the fieldValue property.
     *
     * @see fieldValue
     * @return the fieldValue property.
     */
    public Object getFieldValue() {
        return this.fieldValue;
    }

    /**
     * Setter for the fieldValue property.
     *
     * @see fieldValue
     * @param fieldValue the fieldValue to set
     */

    public void setFieldValue(final Object fieldValue) {
        this.fieldValue = fieldValue;
    }
}
