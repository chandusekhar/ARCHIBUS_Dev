package com.archibus.app.common.connectors.translation.exception;

import com.archibus.app.common.connectors.exception.StepException;

/**
 * An exception thrown during the execution of a Connector's steps to indicate that data handling
 * wasn't supported.
 *
 * @author cole
 *
 */
public class TranslationException extends StepException {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = -5922601010890113801L;

    /**
     * Create a translation exception from another exception with the given localized message.
     *
     * @param localizedMessage describes the reason this exception occurred.
     * @param cause the exception (if any) that justified this exception.
     */
    public TranslationException(final String localizedMessage, final Throwable cause) {
        super();
        super.setLocalizedMessage(localizedMessage);
        super.setNested(cause);
    }
}
