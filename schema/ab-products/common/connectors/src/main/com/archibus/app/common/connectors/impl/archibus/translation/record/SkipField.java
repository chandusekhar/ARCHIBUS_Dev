package com.archibus.app.common.connectors.impl.archibus.translation.record;

import java.util.Map;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;

/**
 * Skip the field by setting it to null, and indicate that it shouldn't be extracted.
 * 
 * @author cole
 * 
 */
public class SkipField implements IRecordTranslator {
    
    /**
     * The name of the field in the record this rule is applied to (source field).
     */
    private String fieldKey;
    
    /**
     * @param record the record to be modified (may already be modified by other rules).
     * @param originalRecord ignored.
     */
    public void applyRule(final Map<String, Object> record, final Map<String, Object> originalRecord) {
        if (record.containsKey(this.fieldKey)) {
            record.remove(this.fieldKey);
        }
    }
    
    /**
     * @param connectorField ignored.
     */
    public void init(final ConnectorFieldConfig connectorField) {
        this.fieldKey = connectorField.getFieldId();
    }
    
    /**
     * @return false, if there is a value it's irrelevant.
     */
    public boolean requiresExistingValue() {
        return false;
    }
}
