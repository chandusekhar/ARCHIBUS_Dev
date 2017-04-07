package com.archibus.app.common.connectors.impl.json.inbound;

import java.io.InputStream;
import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.ArchibusResponseTxDef;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * A record definition for records from an JSON structure based on a configuration from the
 * afm_connector table.
 *
 * @author cole
 *
 */
public class JsonResponseRecordDef extends
        ArchibusResponseTxDef<InputStream, Object, JsonResponseFieldDefinition> {
    /**
     * Create record definition for records from an JSON source that provides a list of fields based
     * on a configuration from the afm_connector table.
     *
     * @param connector the configuration from the afm_connector table.
     * @param dataTable a method for accessing the data table.
     * @param recordParser method for parsing records from the file.
     * @throws ConfigurationException if a connector rule associated with the fields on this record
     *             cannot be instantiated.
     */
    public JsonResponseRecordDef(final ConnectorConfig connector,
            final ArchibusDataTable dataTable, final IRecordParser<InputStream, Object> recordParser)
                    throws ConfigurationException {
        super(connector.getConnectorId(), dataTable, recordParser,
            createJsonFieldDefinitions(connector), connector.getSkipFirstRow());
    }
    
    /**
     * @param connector the configuration from the afm_connector table.
     * @return a list of field definitions corresponding to the connectorFields.
     * @throws ConfigurationException if a connector rule associated with the fields on this record
     *             cannot be instantiated.
     */
    private static List<JsonResponseFieldDefinition> createJsonFieldDefinitions(
            final ConnectorConfig connector) throws ConfigurationException {
        final List<JsonResponseFieldDefinition> foreignFieldDefinitions =
                new ArrayList<JsonResponseFieldDefinition>();
        final DataSourceFieldDefLoader fieldDefLoader = new DataSourceFieldDefLoader();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            foreignFieldDefinitions.add(new JsonResponseFieldDefinition(connectorField,
                fieldDefLoader));
        }
        return foreignFieldDefinitions;
    }
}
