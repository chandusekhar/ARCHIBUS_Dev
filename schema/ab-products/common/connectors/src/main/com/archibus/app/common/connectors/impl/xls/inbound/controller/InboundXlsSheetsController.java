package com.archibus.app.common.connectors.impl.xls.inbound.controller;

import java.io.InputStream;
import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.file.inbound.InboundFileController;
import com.archibus.app.common.connectors.impl.xls.XlsUtil;
import com.archibus.app.common.connectors.impl.xls.inbound.InboundXlsRequests;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.xls.inbound.*;

/**
 * A series of requests to a file system to produce records from an XLS document with multiple
 * related sheets.
 *
 * @author cole
 * @since 22.1
 *
 */
public class InboundXlsSheetsController extends
        InboundFileController<List<Object>, XlsSheetResponseTxDef, List<Object>> {
    
    /**
     * Generate a series of requests to a file system to produce records from delimited text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated, or if a connection can't be opened to an FTP server.
     */
    public InboundXlsSheetsController(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        /*
         * Create requests.
         */
        super(stepName, connector, log,
            new ComponentFactory<List<Object>, XlsSheetResponseTxDef, List<Object>>() {
                
                @Override
                public XlsSheetResponseTxDef createResponseTxDef(
                        final ConnectorConfig responseTxDefConfig,
                        final IRecordParser<InputStream, List<Object>> parser)
                        throws ConfigurationException {
                    return new XlsSheetResponseTxDef(responseTxDefConfig.getConnectorId(),
                        new ConnectorDataTable(responseTxDefConfig), parser,
                        InboundXlsRequests.createFieldDefinitions(responseTxDefConfig, true),
                        responseTxDefConfig.getSkipFirstRow(),
                        responseTxDefConfig.getForeignTxPath());
                }
                
                @Override
                public IRecordParser<InputStream, List<Object>> createParser() {
                    final List<XlsSheetRequest> sheetRequests = new ArrayList<XlsSheetRequest>();
                    
                    String lastSheetName = null;
                    for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
                        final ConnectorConfig sheetConnector =
                                connectorField.getConnectorForFieldId();
                        final String sheetName = sheetConnector.getForeignTxPath();
                        if (!sheetName.equals(lastSheetName)) {
                            sheetRequests.add(new XlsSheetRequest(
                                sheetConnector.getForeignTxPath(), 0, 0));
                            lastSheetName = sheetName;
                        }
                    }
                    
                    /*
                     * create parser for workbook and transaction definitions for sheets.
                     */
                    return new XlsRecordParser(sheetRequests, XlsUtil.getFileType(connector
                        .getConnString()), true);
                }
            });
    }
}
