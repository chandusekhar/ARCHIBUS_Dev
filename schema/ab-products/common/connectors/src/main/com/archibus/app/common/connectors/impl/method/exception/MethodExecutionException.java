package com.archibus.app.common.connectors.impl.method.exception;

import com.archibus.app.common.connectors.exception.StepException;

/**
 * A wrapper for an InvocationTargetException thrown during the execution of a java method
 * associated with a MethodStep.
 * 
 * @author cole
 * 
 */
public class MethodExecutionException extends StepException {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = 6569188748184145754L;
    
    /**
     * Create a configuration exception from another exception with the given localized message.
     * 
     * @param localizedMessage describes the reason this exception occurred.
     * @param cause the exception (if any) that justified this exception.
     */
    public MethodExecutionException(final String localizedMessage, final Throwable cause) {
        super();
        super.setLocalizedMessage(localizedMessage);
        super.setNested(cause);
    }
}
