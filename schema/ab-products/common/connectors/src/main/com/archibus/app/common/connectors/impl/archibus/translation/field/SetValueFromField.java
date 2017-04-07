package com.archibus.app.common.connectors.impl.archibus.translation.field;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * Set value from the connector field (also through the field, from the connector).
 * 
 * @author cole
 * 
 */
public class SetValueFromField extends AbstractSetValueFromBean {
    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        super.init(connectorField.getParameter(), connectorField);
    }
}
