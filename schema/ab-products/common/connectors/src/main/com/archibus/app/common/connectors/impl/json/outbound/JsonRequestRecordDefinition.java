package com.archibus.app.common.connectors.impl.json.outbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.outbound.ArchibusRequestRecordDef;

/**
 * A request record definition created from an afm_connectors record of type JSON.
 *
 * @author cole
 *
 */
public class JsonRequestRecordDefinition extends ArchibusRequestRecordDef {
    /**
     * Create a request record definition created from an afm_connectors record of type JSON.
     *
     * @param fieldDefinitions the definitions for fields on this record.
     * @throws ConfigurationException if a connector rule cannot be instantiated due to
     *             configuration.
     */
    public JsonRequestRecordDefinition(final List<JsonRequestFieldDefinition> fieldDefinitions)
            throws ConfigurationException {
        super(fieldDefinitions);
    }
    
    /**
     *
     * @param connector the afm_connector record to use as configuration.
     * @param fieldPath JSONPath to the object to which a field's value should be assigned.
     * @throws ConfigurationException if a connector rule associated with the fields on this record
     *             cannot be instantiated.
     */
    public JsonRequestRecordDefinition(final ConnectorConfig connector, final String fieldPath)
            throws ConfigurationException {
        this(createFieldDefinitions(connector, fieldPath));
    }
    
    /**
     * Create a field definition for every field associated with the connector.
     *
     * @param connector the afm_connector record to use as configuration.
     * @param fieldPath JSONPath to the object to which a field's value should be assigned.
     * @return A list of field definitions based on the connectorFields and ARCHIBUS field
     *         definitions.
     * @throws ConfigurationException if a connector rule associated with the fields on this record
     *             cannot be instantiated.
     */
    private static List<JsonRequestFieldDefinition> createFieldDefinitions(
            final ConnectorConfig connector, final String fieldPath) throws ConfigurationException {
        final List<JsonRequestFieldDefinition> fieldDefinitions =
                new ArrayList<JsonRequestFieldDefinition>();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            fieldDefinitions.add(new JsonRequestFieldDefinition(connectorField, fieldPath));
        }
        return fieldDefinitions;
    }
}
