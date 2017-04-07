package com.archibus.app.common.connectors.impl.json.inbound;

import java.util.Collections;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.CharEncodingUtil;
import com.archibus.app.common.connectors.impl.archibus.ConnectorDataTable;
import com.archibus.app.common.connectors.impl.file.inbound.AbstractInboundFileRequests;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.json.inbound.JsonRecordParser;

/**
 * A series of requests to a file system to produce records from JSON.
 *
 * @author cole
 *
 */
public class InboundJsonRequests extends AbstractInboundFileRequests<Object, JsonResponseRecordDef> {
    
    /**
     * Generate a series of requests to a file system to produce records from JSON.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a rule cannot be instantiated due to configuration, or if
     *             configured to use FTP and the FTP service cannot be reached.
     */
    public InboundJsonRequests(final String stepName, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        
        /*
         * Create requests.
         */
        super(stepName, createTemplateParameters(connector), Collections
            .singletonList(new JsonResponseRecordDef(connector, new ConnectorDataTable(connector),
                new JsonRecordParser(connector.getForeignTxPath().replace("#", "*"), true,
                    CharEncodingUtil.getCharacterEncoding(connector)))), connector, log);
    }
}
