package com.archibus.app.common.connectors.impl.text.inbound;

import java.util.*;

import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.domain.ConnectorTypes.DelimiterType;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.CharEncodingUtil;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.archibus.inbound.ListResponseTxDef;
import com.archibus.app.common.connectors.impl.file.inbound.AbstractInboundFileRequests;
import com.archibus.app.common.connectors.impl.text.TextCharSequenceSet;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.text.inbound.*;

/**
 * A series of requests to a file system to produce records delimited text.
 *
 * @author cole
 *
 */
public class InboundTextRequests extends
        AbstractInboundFileRequests<List<String>, ListResponseTxDef<String>> {

    /**
     * If this connector parameter is present, and there is a trailing record delimiter, the record
     * following it will be ignored.
     */
    public static final String IGNORE_LAST_RECORD_IF_EMPTY = "ignoreLastRecordIfEmpty";
    
    /**
     * Generate a series of requests to a file system to produce records from delimited text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated, or if a connection can't be opened to an FTP server.
     */
    public InboundTextRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        
        /*
         * Create requests.
         */
        super(stepName, createTemplateParameters(connector), Collections
            .singletonList(new ListResponseTxDef<String>(connector, new ConnectorDataTable(
                connector),
                connector.getDelimeter() == DelimiterType.FIXED_LENGTH ? new FixedWidthTextParser(
                    getFieldWidths(connector), new TextCharSequenceSet(connector), CharEncodingUtil
                        .getCharacterEncoding(connector)) : new DelimitedTextRecordParser(
                    new TextCharSequenceSet(connector), CharEncodingUtil
                        .getCharacterEncoding(connector), connector.getConnParams().optBoolean(
                        IGNORE_LAST_RECORD_IF_EMPTY, false)), connector.getSkipFirstRow())),
            connector, log);
        
    }
    
    /**
     * @param connector the afm_connector record to use as configuration
     * @return the widths of fields in the order they appear in the file.
     * @throws ConfigurationException if the fields don't all have widths.
     */
    public static List<Integer> getFieldWidths(final ConnectorConfig connector)
            throws ConfigurationException {
        final List<Integer> fieldWidths = new ArrayList<Integer>();
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            if (connectorField.getRule().getInstance().requiresExistingValue()) {
                try {
                    fieldWidths.add(Integer.valueOf(connectorField.getResult()));
                } catch (final NumberFormatException e) {
                    throw new ConfigurationException(connectorField.getForeignFieldPath()
                            + " requires a field width to be specified.", e);
                }
            }
        }
        return fieldWidths;
    }
    
}
