package com.archibus.app.common.connectors.impl.text.inbound.controller;

import java.io.InputStream;
import java.util.List;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.DelimiterType;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.CharEncodingUtil;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.file.inbound.InboundFileController;
import com.archibus.app.common.connectors.impl.text.TextCharSequenceSet;
import com.archibus.app.common.connectors.impl.text.inbound.InboundTextRequests;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;
import com.archibus.app.common.connectors.translation.text.inbound.*;

/**
 * A series of requests to a file system to produce records from an text document with multiple
 * related records.
 *
 * @author cole
 * @since 22.1
 *
 */
public class InboundRelatedTextController extends
        InboundFileController<List<String>, RelatedTextResponseTxDef, List<String>> {
    
    /**
     * Generate a series of requests to a file system to produce records from delimited text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated, or if a connection can't be opened to an FTP server.
     */
    public InboundRelatedTextController(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        /*
         * Create requests.
         */
        super(stepName, connector, log,
            new ComponentFactory<List<String>, RelatedTextResponseTxDef, List<String>>() {

                @Override
                public RelatedTextResponseTxDef createResponseTxDef(
                        final ConnectorConfig responseTxDefConfig,
                        final IRecordParser<InputStream, List<String>> parser)
                        throws ConfigurationException {
                    return new RelatedTextResponseTxDef(responseTxDefConfig, new ConnectorDataTable(
                        responseTxDefConfig), parser, responseTxDefConfig.getSkipFirstRow());
                }

                @Override
                public IRecordParser<InputStream, List<String>> createParser() {
                    /*
                     * create parser for the file.
                     */
                    return connector.getDelimeter() == DelimiterType.FIXED_LENGTH ? new FixedWidthTextParser(
                        InboundTextRequests.getFieldWidths(connector), new TextCharSequenceSet(
                            connector), CharEncodingUtil.getCharacterEncoding(connector))
                            : new DelimitedTextRecordParser(new TextCharSequenceSet(connector),
                                CharEncodingUtil.getCharacterEncoding(connector), connector
                                    .getConnParams().optBoolean(
                                        InboundTextRequests.IGNORE_LAST_RECORD_IF_EMPTY, false));
                }
            });
    }
}
