package com.archibus.app.common.connectors.exception;


/**
 * An exception thrown attempting to execute a Connector's steps to indicate that the steps could
 * not not be executed due to improper configuration.
 * 
 * @author cole
 * 
 */
public class ConfigurationException extends StepException {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = -9064125458041521935L;
    
    /**
     * Create a configuration exception from another exception with the given localized message.
     * 
     * @param localizedMessage describes the reason this exception occurred.
     * @param cause the exception (if any) that justified this exception.
     */
    public ConfigurationException(final String localizedMessage, final Throwable cause) {
        super();
        super.setLocalizedMessage(localizedMessage);
        super.setNested(cause);
    }
    
}
