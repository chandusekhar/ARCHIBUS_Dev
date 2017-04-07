package com.archibus.app.common.connectors.impl.archibus.translation;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * A connector rule translation.
 * 
 * @author cole
 * 
 */
public interface IConnectorRule {
    /**
     * Instantiate this rule, completely resetting it's state.
     * 
     * @param connectorField the field this rule applies to.
     * @throws ConfigurationException if there is a problem instantiating the rule.
     */
    void init(final ConnectorFieldConfig connectorField) throws ConfigurationException;
    
    /**
     * @return true if the field_id is a valid field in the source.
     */
    boolean requiresExistingValue();
}
