package com.archibus.app.common.connectors.impl.xml.outbound;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.outbound.NullReplacementRequestRecordDef;
import com.archibus.app.common.connectors.impl.file.outbound.AbstractOutboundFileRequests;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.xml.outbound.XmlRequestTemplate;

/**
 * A series of requests to a file system to store records as XML.
 * 
 * @author cole
 * 
 */
public final class OutboundXmlRequests extends AbstractOutboundFileRequests {
    
    /**
     * The value to write to a file in place of nulls.
     */
    private static final String NULL_VALUE = "";
    
    /**
     * Generate a series of requests to a file system to produce records from XML.
     * 
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated or if the template for the requests cannot be parsed.
     */
    public OutboundXmlRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        /*
         * Create requests.
         */
        super(stepName, connector, new NullReplacementRequestRecordDef(connector, NULL_VALUE),
            new XmlRequestTemplate(DATA_SOURCE_PARAM, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><"
                    + connector.getForeignTxPath() + "></" + connector.getForeignTxPath()
                    + ">", connector.getDescription(), new RecordElementFinder(
                connector.getForeignTxPath())), log);
    }
}
