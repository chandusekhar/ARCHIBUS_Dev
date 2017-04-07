package com.archibus.app.common.connectors.impl.xls.inbound.controller;

import java.io.InputStream;
import java.util.List;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.*;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.common.inbound.impl.ArchibusDataTable;

/**
 * Represents the definition of a transaction provided from an XLS document with multiple related
 * sheets.
 *
 * @author cole
 * @since 22.1
 *
 */
public class XlsSheetResponseTxDef extends ListResponseTxDef<Object> {
    
    /**
     * The name of the XLS spreadsheet this definition applies to.
     */
    private final String sheetName;
    
    /**
     * Create record definition for records from an XLS source based on a configuration from the
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
    public XlsSheetResponseTxDef(final ConnectorConfig connector,
            final ArchibusDataTable dataTable,
            final IRecordParser<InputStream, List<Object>> parser,
            final int numberOfTransactionsToSkip) throws ConfigurationException {
        super(connector, dataTable, parser, numberOfTransactionsToSkip);
        this.sheetName = connector.getForeignTxPath();
    }
    
    /**
     * Create record definition for records from an XLS source based on a configuration from the
     * afm_connector table.
     *
     * @param connectorId the identifier for the configuration from the afm_connector table.
     * @param dataTable a method for accessing the data table.
     * @param recordParser method for parsing records from the file.
     * @param responseFieldDefinitions methods for extracting and translating field values from a
     *            list of Strings.
     * @param numberOfRecordsToSkip the number of records to ignore, starting with the first.
     * @param sheetName the name of the XLS spreadsheet this definition applies to.
     * @throws ConfigurationException if the configuration of field definitions isn't valid.
     */
    public XlsSheetResponseTxDef(final String connectorId, final ArchibusDataTable dataTable,
            final IRecordParser<InputStream, List<Object>> recordParser,
            final List<ListResponseFieldDefinition<Object>> responseFieldDefinitions,
            final int numberOfRecordsToSkip, final String sheetName) throws ConfigurationException {
        super(connectorId, dataTable, recordParser, responseFieldDefinitions, numberOfRecordsToSkip);
        this.sheetName = sheetName;
    }

    @Override
    public boolean handles(final List<Object> transaction) {
        return this.sheetName.equals(transaction.get(0)) && super.handles(transaction);
    }
}
