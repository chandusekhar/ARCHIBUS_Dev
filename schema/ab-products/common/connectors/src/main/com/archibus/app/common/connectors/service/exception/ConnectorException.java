package com.archibus.app.common.connectors.service.exception;

import com.archibus.utility.ExceptionBase;

/**
 * Thrown from a ConnectorJob when a connector fails to execute properly.
 *
 * @author cole
 *
 */
public class ConnectorException extends ExceptionBase {
    /**
     * Required for serializing the exception.
     */
    private static final long serialVersionUID = -6980962733869317007L;

    /**
     * @param exceptionMessage the message to be displayed
     * @param exception the exception that occurred.
     */
    public ConnectorException(final String exceptionMessage, final Throwable exception) {
        super(exceptionMessage, exception);
    }

}
