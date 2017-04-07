package com.archibus.app.common.connectors.impl.ldap.inbound;

import java.util.*;

import javax.naming.NamingEnumeration;
import javax.naming.directory.SearchResult;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.ArchibusResponseTxDef;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * A mapping between an ARCHIBUS database record and and an LDAP search result.
 *
 * @author cole
 *
 */
public class LdapResponseRecordDef
        extends
        ArchibusResponseTxDef<NamingEnumeration<SearchResult>, SearchResult, LdapResponseFieldDefinition> {
    /**
     * Create record definition for records from a source that provides a map of fields based on a
     * configuration from the afm_connector table.
     *
     * @param connector the configuration from the afm_connector table.
     * @param dataTable a method for accessing the data table.
     * @param recordParser method for parsing records from the file.
     * @param numberOfRecordsToSkip the number of records to ignore starting with the first.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    public LdapResponseRecordDef(final ConnectorConfig connector,
            final ArchibusDataTable dataTable,
            final IRecordParser<NamingEnumeration<SearchResult>, SearchResult> recordParser,
            final int numberOfRecordsToSkip) throws ConfigurationException {
        super(connector.getConnectorId(), dataTable, recordParser, LdapResponseRecordDef
            .createFieldDefinitions(connector), numberOfRecordsToSkip);
    }
    
    /**
     * @param connector the configuration from the afm_connector table.
     * @return a list of field definitions corresponding to the connectorFields.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    private static List<LdapResponseFieldDefinition> createFieldDefinitions(
            final ConnectorConfig connector) throws ConfigurationException {
        final List<LdapResponseFieldDefinition> foreignFieldDefinitions =
                new ArrayList<LdapResponseFieldDefinition>();
        final DataSourceFieldDefLoader fieldDefLoader = new DataSourceFieldDefLoader();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            foreignFieldDefinitions.add(new LdapResponseFieldDefinition(connectorField,
                fieldDefLoader));
        }
        return foreignFieldDefinitions;
    }
}
