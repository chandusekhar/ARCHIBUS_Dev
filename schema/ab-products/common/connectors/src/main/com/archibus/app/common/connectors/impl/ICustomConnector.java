package com.archibus.app.common.connectors.impl;

import com.archibus.app.common.connectors.IStep;
import com.archibus.app.common.connectors.domain.ConnectorConfig;

/**
 * A custom connector should include a public default constructor. Any instantiation should be
 * through the init method. A custom connector may perform any operation, but is intended for the
 * exchange of data with a system foreign to ARCHIBUS.
 * 
 * @author cole
 * 
 * @param <ResultType>
 */
public interface ICustomConnector<ResultType> extends IStep<ResultType> {
    /**
     * This method is called once to instantiate the custom connector.
     * 
     * @param connector the custom connector's configuration.
     */
    void init(final ConnectorConfig connector);
}
