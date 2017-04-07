package com.archibus.app.common.connectors.impl.archibus.translation.field;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.context.ContextStore;

/**
 * Set value from the logged in user.
 * 
 * @author cole
 * 
 */
public class SetValueFromUser extends AbstractSetValueFromBean {
    @Override
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        super.init(connectorField.getParameter(), ContextStore.get().getUser());
    }
}
