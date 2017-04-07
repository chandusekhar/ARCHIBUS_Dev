package com.archibus.app.common.connectors.impl.db.outbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.outbound.ArchibusRequestRecordDef;

/**
 * A request record definition created from an afm_connectors record of type DB.
 *
 * @author cole
 *
 */
public class DbRequestRecordDefinition extends ArchibusRequestRecordDef {
    /**
     * Create a request record definition created from an afm_connectors record of type DB.
     *
     * @param fieldDefinitions the definitions for fields on this record.
     * @throws ConfigurationException if a connector rule cannot be instantiated due to
     *             configuration.
     */
    public DbRequestRecordDefinition(final List<DbRequestFieldDefinition> fieldDefinitions)
            throws ConfigurationException {
        super(fieldDefinitions);
    }
    
    /**
     *
     * @param connector the afm_connector record to use as configuration.
     * @throws ConfigurationException if a connector rule associated with the fields on this record
     *             cannot be instantiated.
     */
    public DbRequestRecordDefinition(final ConnectorConfig connector) throws ConfigurationException {
        this(createFieldDefinitions(connector));
    }
    
    /**
     * Create a field definition for every field associated with the connector.
     *
     * @param connector the afm_connector record to use as configuration.
     * @return A list of field definitions based on the connectorFields and ARCHIBUS field
     *         definitions.
     * @throws ConfigurationException if a connector rule associated with the fields on this record
     *             cannot be instantiated.
     */
    private static List<DbRequestFieldDefinition> createFieldDefinitions(
            final ConnectorConfig connector) throws ConfigurationException {
        final List<DbRequestFieldDefinition> fieldDefinitions =
                new ArrayList<DbRequestFieldDefinition>();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            fieldDefinitions.add(new DbRequestFieldDefinition(connectorField));
        }
        return fieldDefinitions;
    }
}
