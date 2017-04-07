package com.archibus.app.common.connectors.impl.text.inbound.controller;

import java.io.InputStream;
import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.*;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;

/**
 * Represents the definition of a transaction provided from an text document with multiple related
 * record types.
 *
 * @author cole
 * @since 22.1
 *
 */
public class RelatedTextResponseTxDef extends ListResponseTxDef<String> {

    /**
     * The leading values for the record type this definition applies to.
     */
    private final List<String> prefixes;

    /**
     * Create record definition for records from an text source based on a configuration from the
     * afm_connector table.
     *
     * @param connector the configuration from the afm_connector table.
     * @param dataTable a method for accessing the data table.
     * @param parser method for parsing transaction records from the file.
     * @param numberOfTransactionsToSkip the number of transactions to ignore starting with the
     *            first.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    public RelatedTextResponseTxDef(final ConnectorConfig connector,
            final ArchibusDataTable dataTable,
            final IRecordParser<InputStream, List<String>> parser,
            final int numberOfTransactionsToSkip) throws ConfigurationException {
        super(connector, dataTable, parser, numberOfTransactionsToSkip);
        this.prefixes = Arrays.asList(connector.getForeignTxPath().split("\\|"));
    }

    /**
     * Create record definition for records from an text source based on a configuration from the
     * afm_connector table.
     *
     * @param connectorId the identifier for the configuration from the afm_connector table.
     * @param dataTable a method for accessing the data table.
     * @param recordParser method for parsing records from the file.
     * @param responseFieldDefinitions methods for extracting and translating field values from a
     *            list of Strings.
     * @param numberOfRecordsToSkip the number of records to ignore, starting with the first.
     * @param prefixes leading values that identify this record type.
     * @throws ConfigurationException if the configuration of field definitions isn't valid.
     */
    public RelatedTextResponseTxDef(final String connectorId, final ArchibusDataTable dataTable,
            final IRecordParser<InputStream, List<String>> recordParser,
            final List<ListResponseFieldDefinition<String>> responseFieldDefinitions,
            final int numberOfRecordsToSkip, final List<String> prefixes)
            throws ConfigurationException {
        super(connectorId, dataTable, recordParser, responseFieldDefinitions, numberOfRecordsToSkip);
        this.prefixes = new ArrayList<String>(prefixes);
    }
    
    @Override
    public boolean handles(final List<String> transaction) {
        return transaction.size() > this.prefixes.size()
                && transaction.subList(0, this.prefixes.size()).equals(this.prefixes);
    }
}
