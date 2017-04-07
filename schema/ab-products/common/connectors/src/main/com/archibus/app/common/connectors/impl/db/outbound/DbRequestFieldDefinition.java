package com.archibus.app.common.connectors.impl.db.outbound;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.outbound.ArchibusRequestFieldDefinition;

/**
 * A request field definition created from an afm_conn_flds record whose associated afm_connectors
 * record is of type TEXT.
 * 
 * @author cole
 * 
 */
public class DbRequestFieldDefinition extends ArchibusRequestFieldDefinition {
    
    /**
     * Create a request field definition created from an afm_conn_flds record.
     * 
     * @param connectorField an afm_conn_fld associated with the connector that this definition
     *            represents.
     * @throws ConfigurationException if a connector rule associated with this field cannot be
     *             instantiated.
     */
    public DbRequestFieldDefinition(final ConnectorFieldConfig connectorField)
            throws ConfigurationException {
        super(connectorField);
    }
}
