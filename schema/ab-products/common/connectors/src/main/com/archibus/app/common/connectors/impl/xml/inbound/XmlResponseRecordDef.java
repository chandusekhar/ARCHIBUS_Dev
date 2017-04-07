package com.archibus.app.common.connectors.impl.xml.inbound;

import java.io.InputStream;
import java.util.*;

import org.dom4j.Node;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.ArchibusResponseTxDef;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * A record definition for records from an XML structure based on a configuration from the
 * afm_connector table.
 *
 * @author cole
 *
 */
public class XmlResponseRecordDef extends
        ArchibusResponseTxDef<InputStream, Node, XmlResponseFieldDefinition> {
    /**
     * Create record definition for records from an XML source that provides a list of fields based
     * on a configuration from the afm_connector table.
     *
     * @param connector the configuration from the afm_connector table.
     * @param dataTable a method for accessing the data table.
     * @param recordParser method for parsing records from the file.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    public XmlResponseRecordDef(final ConnectorConfig connector, final ArchibusDataTable dataTable,
            final IRecordParser<InputStream, Node> recordParser) throws ConfigurationException {
        super(connector.getConnectorId(), dataTable, recordParser,
            createXmlFieldDefinitions(connector), connector.getSkipFirstRow());
    }
    
    /**
     * @param connector the configuration from the afm_connector table.
     * @return a list of field definitions corresponding to the connectorFields.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    private static List<XmlResponseFieldDefinition> createXmlFieldDefinitions(
            final ConnectorConfig connector) throws ConfigurationException {
        final List<XmlResponseFieldDefinition> foreignFieldDefinitions =
                new ArrayList<XmlResponseFieldDefinition>();
        final DataSourceFieldDefLoader fieldDefLoader = new DataSourceFieldDefLoader();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            foreignFieldDefinitions.add(new XmlResponseFieldDefinition(connectorField,
                fieldDefLoader));
        }
        return foreignFieldDefinitions;
    }
}
