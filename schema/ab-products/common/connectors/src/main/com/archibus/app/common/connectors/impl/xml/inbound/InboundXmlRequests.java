package com.archibus.app.common.connectors.impl.xml.inbound;

import java.util.Collections;

import org.dom4j.Node;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.file.inbound.AbstractInboundFileRequests;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.xml.inbound.XmlRecordParser;

/**
 * A series of requests to a file system to produce records from XML.
 *
 * @author cole
 *
 */
public class InboundXmlRequests extends AbstractInboundFileRequests<Node, XmlResponseRecordDef> {

    /**
     * Generate a series of requests to a file system to produce records from XML.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated, or if a connection can't be opened to an FTP server.
     */
    public InboundXmlRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {

        /*
         * Create requests.
         */
        super(stepName, createTemplateParameters(connector), Collections
            .singletonList(new XmlResponseRecordDef(connector, new ConnectorDataTable(connector),
                new XmlRecordParser(Collections.singletonList(connector.getForeignTxPath())))),
            connector, log);
    }
}
