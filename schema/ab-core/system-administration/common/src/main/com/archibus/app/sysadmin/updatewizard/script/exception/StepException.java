package com.archibus.app.sysadmin.updatewizard.script.exception;

import com.archibus.utility.ExceptionBase;

/**
 * Exception for batch file step.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class StepException extends ExceptionBase {
    /**
     * A required serialVersionUID for identifying what version of this class was serialized.
     */
    private static final long serialVersionUID = -2627223105004281213L;

    /**
     *
     * Constructor.
     *
     * @param message message
     * @param cause cause
     */
    public StepException(final String message, final Throwable cause) {
        super();
        super.setLocalizedMessage(message);
        super.setNested(cause);
    }

}