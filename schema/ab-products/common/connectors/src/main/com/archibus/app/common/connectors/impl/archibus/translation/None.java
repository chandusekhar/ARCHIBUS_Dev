package com.archibus.app.common.connectors.impl.archibus.translation;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;

/**
 * Indicates no connector rule is to be applied.
 * 
 * @author cole
 * 
 */
public class None implements IConnectorRule {
    
    /**
     * Do nothing.
     * 
     * @param connectorField ignored.
     */
    public void init(final ConnectorFieldConfig connectorField) {
        /*
         * No initialization required.
         */
    }
    
    /**
     * @return true
     */
    public boolean requiresExistingValue() {
        return true;
    }
    
}
