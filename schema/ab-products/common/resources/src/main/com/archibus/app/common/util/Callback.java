package com.archibus.app.common.util;

import com.archibus.context.Context;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Callback interface to be used with SuspendDataEventsTemplate.
 * 
 * @author Valery
 * 
 */
public interface Callback {
    /**
     * Performs an operation with the prepared context.
     * 
     * @param context to be used by the operation.
     * @return result of the operation.
     * @throws ExceptionBase if the operation throws exception.
     */
    Object doWithContext(final Context context) throws ExceptionBase;
}
