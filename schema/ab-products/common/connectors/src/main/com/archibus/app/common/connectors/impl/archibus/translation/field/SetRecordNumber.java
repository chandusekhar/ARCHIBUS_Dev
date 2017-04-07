package com.archibus.app.common.connectors.impl.archibus.translation.field;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;

/**
 * A connector rule to set the value of the field to the order in which the transaction was
 * received, using an index that begins at 1.
 * 
 * @author cole
 * 
 */
public class SetRecordNumber implements IFieldTranslator {
    
    /**
     * The index of the next record.
     */
    private long nextIndex;
    
    /**
     * Instantiate this translator by setting the index to 1.
     * 
     * @param connectorField ignored.
     */
    public void init(final ConnectorFieldConfig connectorField) {
        this.nextIndex = 1;
    }
    
    /**
     * @param value ignored.
     * @return the next index.
     */
    public Object applyRule(final Object value) {
        return String.valueOf(this.nextIndex++);
    }
    
    /**
     * Sets the value, so no existing value is required.
     * 
     * @return false.
     */
    public boolean requiresExistingValue() {
        return false;
    }
}
