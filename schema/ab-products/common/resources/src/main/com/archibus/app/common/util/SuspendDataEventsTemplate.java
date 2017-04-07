package com.archibus.app.common.util;

import org.springframework.util.Assert;

import com.archibus.context.*;
import com.archibus.utility.ExceptionBase;

/**
 * SuspendDataEventsTemplate simplifies suspension of Data Events (and the use of Context): it
 * handles context preparation and cleanup.
 * 
 * Code using the SuspendDataEventsTemplate only need to implement callback interface, giving them a
 * clearly defined contract.
 * 
 * 
 * @author Valery Tydykov
 *         <p>
 *         Suppress "rawtypes" warnings for the class to be disabled.
 *         <p>
 *         Justification: Supplying particular class/interface for class to be disabled gives
 *         compiler error.
 */
@SuppressWarnings("rawtypes")
public class SuspendDataEventsTemplate {
    /**
     * Class to be disabled.
     */
    private Class classToDisable;
    
    /**
     * Constructs an <code>SuspendDataEventsTemplate</code> with the specified class to be disabled.
     * 
     * @param classToDisable class to be disabled.
     */
    public SuspendDataEventsTemplate(final Class classToDisable) {
        this.setClassToDisable(classToDisable);
    }
    
    /**
     * Invokes the callback with the prepared context.
     * <p>
     * Before invoking the callback, disables event listeners of type classToDisable, so that they
     * will not be triggered. After invoking the callback, removes type classToDisable from the
     * disabled types.
     * 
     * @param callback to be invoked.
     * @return return value of the callback.
     * @throws ExceptionBase if the callback throws exception.
     */
    public Object doWithContext(final Callback callback) throws ExceptionBase {
        final Context context = ContextStore.get();
        
        Object result;
        try {
            // Disable event listeners of type classToDisable, so that they
            // will not be triggered inside of this try/finally block.
            context.addDisabledEventListenerClass(this.classToDisable);
            
            // perform the actual operation with the prepared context
            result = callback.doWithContext(context);
        } finally {
            // Remove type classToDisable from the disabled types.
            context.removeDisabledEventListenerClass(this.classToDisable);
        }
        
        return result;
    }
    
    /**
     * @return the classToDisable
     */
    public Class getClassToDisable() {
        return this.classToDisable;
    }
    
    /**
     * @param classToDisable the classToDisable to set
     */
    private void setClassToDisable(final Class classToDisable) {
        Assert.notNull(classToDisable);
        this.classToDisable = classToDisable;
    }
}
