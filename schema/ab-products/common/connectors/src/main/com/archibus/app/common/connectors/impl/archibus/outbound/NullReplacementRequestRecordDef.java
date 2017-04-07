package com.archibus.app.common.connectors.impl.archibus.outbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * A request record definition based on records from an ARCHIBUS data source where null values
 * should be replaced with a particular value.
 *
 * @author cole
 *
 */
public class NullReplacementRequestRecordDef extends ArchibusRequestRecordDef {
    /**
     * Create a request record definition created from an afm_connectors.
     *
     * @param fieldDefinitions the definitions for fields on this record.
     * @throws ConfigurationException if a connector rule cannot be instantiated due to
     *             configuration.
     */
    public NullReplacementRequestRecordDef(
            final List<NullReplacementRequestFieldDef> fieldDefinitions)
            throws ConfigurationException {
        super(fieldDefinitions);
    }
    
    /**
     *
     * @param connector the afm_connector record to use as configuration.
     * @param nullValue the value to write to a file in place of nulls.
     * @throws ConfigurationException if a connector rule is present that cannot be instantiated.
     */
    public NullReplacementRequestRecordDef(final ConnectorConfig connector, final String nullValue)
            throws ConfigurationException {
        this(createFieldDefinitions(connector, nullValue));
    }
    
    /**
     * Create a field definition for every field associated with the connector.
     *
     * @param connector the afm_connector record to use as configuration.
     * @param nullValue the value write to the file when a field is null.
     * @return A list of field definitions based on the connectorFields and ARCHIBUS field
     *         definitions.
     * @throws ConfigurationException if a connector rule is present that cannot be instantiated.
     */
    private static List<NullReplacementRequestFieldDef> createFieldDefinitions(
            final ConnectorConfig connector, final String nullValue) throws ConfigurationException {
        final List<NullReplacementRequestFieldDef> fieldDefinitions =
                new ArrayList<NullReplacementRequestFieldDef>();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            fieldDefinitions.add(new NullReplacementRequestFieldDef(connectorField, nullValue));
        }
        return fieldDefinitions;
    }
}
