package com.archibus.app.common.connectors.exception;

/**
 * An exception thrown during the execution of a Connector's steps to indicate that a SQL error
 * occurred.
 * 
 * @author cole
 * 
 */
public class DatabaseException extends StepException {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = -9064125458041521935L;
    
    /**
     * Create an database exception from another exception with the given localized message.
     * 
     * @param localizedMessage describes the reason this exception occurred.
     * @param cause the exception (if any) that justified this exception.
     */
    public DatabaseException(final String localizedMessage, final Throwable cause) {
        super();
        super.setLocalizedMessage(localizedMessage);
        super.setNested(cause);
    }
}
