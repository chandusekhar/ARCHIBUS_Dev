package com.archibus.app.common.connectors.impl.archibus.inbound;

import java.io.InputStream;
import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * A definition for the interpretation of a transaction in the form of a list for the purpose of
 * updating the ARCHIBUS database.
 *
 * @author cole
 *
 * @param <ListItemType> the type of item in the list response.
 */
public class ListResponseTxDef<ListItemType> extends
        ArchibusResponseTxDef<InputStream, List<ListItemType>, ListResponseFieldDefinition<ListItemType>> {
    /**
     * Create a definition for the interpretation of a transaction in the form of a list for the
     * purpose of updating the ARCHIBUS database. *
     *
     * @param connector the configuration from the afm_connector table.
     * @param dataTable a method for accessing the data table.
     * @param parser method for parsing transaction records from the file.
     * @param numberOfTransactionsToSkip the number of transactions to ignore starting with the
     *            first.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    public ListResponseTxDef(final ConnectorConfig connector, final ArchibusDataTable dataTable,
            final IRecordParser<InputStream, List<ListItemType>> parser,
            final int numberOfTransactionsToSkip) throws ConfigurationException {
        this(connector.getConnectorId(), dataTable, parser,
            ListResponseTxDef.<ListItemType>createFieldDefinitions(connector),
            numberOfTransactionsToSkip);
    }

    /**
     * Create record definition for records from a source that provides a list of fields based on a
     * configuration from the afm_connector table.
     *
     * @param txDefId a unique identifier for this transaction definition.
     * @param dataTable a method for accessing the data table.
     * @param recordParser method for parsing records from the file.
     * @param responseFieldDefinitions methods for extracting and translating field values from a
     *            list of Strings.
     * @param numberOfRecordsToSkip the number of records to ignore, starting with the first.
     * @throws ConfigurationException if a rule manager cannot be instantiated.
     */
    public ListResponseTxDef(final String txDefId, final ArchibusDataTable dataTable,
            final IRecordParser<InputStream, List<ListItemType>> recordParser,
            final List<ListResponseFieldDefinition<ListItemType>> responseFieldDefinitions,
            final int numberOfRecordsToSkip) throws ConfigurationException {
        super(txDefId, dataTable, recordParser, responseFieldDefinitions, numberOfRecordsToSkip);
    }

    /**
     * @param connector the configuration from the afm_connector table.
     * @param <ListItemType> the type of item in the list response.
     * @return a list of field definitions corresponding to the connecorFields.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    private static <ListItemType> List<ListResponseFieldDefinition<ListItemType>> createFieldDefinitions(
            final ConnectorConfig connector) throws ConfigurationException {
        final List<ListResponseFieldDefinition<ListItemType>> foreignFieldDefinitions =
                new ArrayList<ListResponseFieldDefinition<ListItemType>>();
        final DataSourceFieldDefLoader fieldDefLoader = new DataSourceFieldDefLoader();
        int fieldPosition = 0;
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            foreignFieldDefinitions.add(new ListResponseFieldDefinition<ListItemType>(
                connectorField, fieldDefLoader, fieldPosition));
            fieldPosition++;
        }
        return foreignFieldDefinitions;
    }
}
