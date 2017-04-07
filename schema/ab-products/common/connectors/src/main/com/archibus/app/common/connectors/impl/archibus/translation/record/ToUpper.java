package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.util.Map;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;

/**
 * Changes the value of a field to upper case and converts it to a string if necessary.
 * 
 * @author cole
 * 
 */
public class ToUpper implements IRecordTranslator {
    /**
     * The field whose case needs to be made uppercase.
     */
    private String fieldKey;
    
    /**
     * Instantiate this rule, completely resetting it's state.
     * 
     * @param connectorField ignored.
     */
    public void init(final ConnectorFieldConfig connectorField) {
        this.fieldKey = connectorField.getFieldId();
    }
    
    /**
     * Convert the value to an upper case string.
     * 
     * @param record the record to be modified (may already be modified by other rules).
     * @param originalRecord the record prior to translation by other record level rules.
     */
    public void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord) {
        final Object value = record.get(this.fieldKey);
        record.put(this.fieldKey, value == null ? null : value.toString().toUpperCase());
    }
    
    /**
     * @return true as there should be a value to convert to upper case.
     */
    public boolean requiresExistingValue() {
        return true;
    }
}
