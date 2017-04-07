package com.archibus.app.common.connectors.exception;

import com.archibus.utility.ExceptionBase;

/**
 * A runtime exception where a class cannot be instantiated due to the way it is defined.
 *
 * @author cole
 * @since 22.1
 *
 */
public class ConnectorInstantiationException extends ExceptionBase {
    /**
     * Required version id for serialization.
     */
    private static final long serialVersionUID = -3618542990817823366L;
    
    /**
     * @param message explanation of what is expected.
     * @param cause the exception that was thrown when attempting to instantiate the class.
     */
    public ConnectorInstantiationException(final String message, final Throwable cause) {
        super();
        super.setLocalizedMessage(message);
        super.setNested(cause);
    }
}
