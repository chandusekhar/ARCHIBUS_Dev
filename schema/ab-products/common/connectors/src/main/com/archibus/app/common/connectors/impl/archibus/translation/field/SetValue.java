package com.archibus.app.common.connectors.impl.archibus.translation.field;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * A connector rule to set the value of the field to a provided value.
 * 
 * @author cole
 * 
 */
public class SetValue implements IFieldTranslator {
    
    /**
     * The value to replace the value of the field with.
     */
    private Object replacementValue;
    
    /**
     * Instantiate the translator with the replacement value in connector field's parameters.
     * 
     * @param connectorField the configuration for the field whose value is to be replaced.
     * @throws ConfigurationException if the value is invalid.
     */
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        this.replacementValue = connectorField.getParameter();
    }
    
    /**
     * Instantiate the translator with the replacement value in connector field's parameters.
     * 
     * @param parameter the value to set on the field.
     */
    protected void init(final Object parameter) {
        this.replacementValue = parameter;
    }
    
    /**
     * @param value ignored.
     * @return the replacement value.
     */
    public Object applyRule(final Object value) {
        return this.replacementValue;
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
