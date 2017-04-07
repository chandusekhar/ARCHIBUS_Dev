package com.archibus.app.common.connectors.service.exception;

import com.archibus.app.common.connectors.exception.ConfigurationException;

/**
 * This exception indicates that a connector's constructor is either poorly defined or improperly
 * registered.
 *
 * @author cole
 * @since 20.1
 *
 */
public class ConnectorConstructorException extends ConfigurationException {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = -6633991768287559945L;

    /**
     * @param cause the cause for believing the constructor is poorly defined.
     */
    public ConnectorConstructorException(final Throwable cause) {
        super(
            "The constructor for the given connector type must be public and must accept parameters of the types: String, ConnectorConfig, IUserLog.",
            cause);
    }
}
