package com.archibus.app.common.connectors.transfer.exception;

import com.archibus.app.common.connectors.exception.StepException;

/**
 * An exception thrown during the execution of a Connector's steps to indicate that communication
 * with a foreign system broke down.
 * 
 * @author cole
 * 
 */
public class AdaptorException extends StepException {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = 4164546170382416804L;
    
    /**
     * Create an adaptor exception from another exception with the given localized message.
     * 
     * @param localizedMessage describes the reason this exception occurred.
     * @param cause the exception (if any) that justified this exception.
     */
    public AdaptorException(final String localizedMessage, final Throwable cause) {
        super();
        super.setLocalizedMessage(localizedMessage);
        super.setNested(cause);
    }
}
