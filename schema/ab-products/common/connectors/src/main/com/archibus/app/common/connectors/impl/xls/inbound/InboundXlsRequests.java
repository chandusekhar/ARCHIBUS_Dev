package com.archibus.app.common.connectors.impl.xls.inbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.archibus.inbound.*;
import com.archibus.app.common.connectors.impl.file.inbound.AbstractInboundFileRequests;
import com.archibus.app.common.connectors.impl.xls.XlsUtil;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.xls.inbound.*;
import com.archibus.datasource.DataSourceFieldDefLoader;

/**
 * /** A series of requests to a file system to produce records from XLS.
 *
 * @author Catalin Purice
 * @since 21.3
 *
 */
public class InboundXlsRequests extends
        AbstractInboundFileRequests<List<Object>, ListResponseTxDef<Object>> {

    /**
     * Generate a series of requests to a file system to produce records from delimited text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated, or if a connection can't be opened to an FTP server.
     */
    public InboundXlsRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        /*
         * Create requests.
         */
        super(stepName, createTemplateParameters(connector), Collections
            .singletonList(new ListResponseTxDef<Object>(connector.getConnectorId(),
                new ConnectorDataTable(connector), new XlsRecordParser(Collections
                    .singletonList(new XlsSheetRequest(connector.getForeignTxPath(), 0, 0)),
                    XlsUtil.getFileType(connector.getConnString())), createFieldDefinitions(
                    connector, false), connector.getSkipFirstRow())), connector, log);
    }

    /**
     * Create field definitions for columns in the XLS spreadsheet.
     *
     * @param connector the configuration from the afm_connector table.
     * @param sheetFieldPresent whether the first field is the sheet name. If it is, field
     *            definitions start with the second field returned from the parser.
     * @return a list of field definitions corresponding to the connecorFields.
     * @throws ConfigurationException if a connector rule associated with a field of this record
     *             cannot be instantiated.
     */
    public static List<ListResponseFieldDefinition<Object>> createFieldDefinitions(
            final ConnectorConfig connector, final boolean sheetFieldPresent)
            throws ConfigurationException {
        final List<ListResponseFieldDefinition<Object>> foreignFieldDefinitions =
                new ArrayList<ListResponseFieldDefinition<Object>>();
        final DataSourceFieldDefLoader fieldDefLoader = new DataSourceFieldDefLoader();
        int fieldPosition = sheetFieldPresent ? 1 : 0;
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            foreignFieldDefinitions.add(new XlsResponseFieldDefinition(connectorField,
                fieldDefLoader, fieldPosition));
            fieldPosition++;
        }
        return foreignFieldDefinitions;
    }
}
