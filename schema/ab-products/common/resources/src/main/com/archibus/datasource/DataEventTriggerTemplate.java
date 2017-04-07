package com.archibus.datasource;

import java.util.List;

import org.apache.log4j.Category;
import org.springframework.util.Assert;

import com.archibus.context.Context;
import com.archibus.core.event.data.*;
import com.archibus.utility.ExceptionHandlerBase;

/**
 * Provides functionality for DataEvent triggering.
 * 
 * @author Valery Tydykov
 * 
 *         <p>
 *         Suppress "rawtypes" warnings for the class to be disabled.
 *         <p>
 *         Justification: Supplying particular class/interface for class to be disabled gives
 *         compiler error.
 */
@SuppressWarnings("rawtypes")
public class DataEventTriggerTemplate {
    
    /**
     * Logger for this class and subclasses.
     */
    protected Category logger;
    
    /**
     * Constructor specifying logger.
     * 
     * @param logger to log exceptions and debug level messages.
     */
    public DataEventTriggerTemplate(final Category logger) {
        this.logger = logger;
        Assert.notNull(this.logger, "Logger must already exist.");
    }
    
    /**
     * Triggers specified dataEvent.
     * 
     * @param context to be used to get dataEventListeners from.
     * @param dataEvent to be triggered.
     */
    public void triggerDataEvent(final Context context, final DataEvent dataEvent) {
        Assert.notNull(context, "context must be not null.");
        Assert.notNull(dataEvent, "dataEvent must be not null.");
        
        // get dataEventListeners bean from Project
        final List<IDataEventListener> dataEventListeners =
                context.getProject().getDataEventListeners();
        
        if (dataEventListeners != null && !dataEventListeners.isEmpty()) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Triggering DataEvent");
            }
            
            triggerDataEvent(context, dataEvent, dataEventListeners);
        }
    }
    
    /**
     * Returns true if type of dataEventListener is disabled in the context.
     * 
     * @param context in which the dataEventListener might be disabled.
     * @param dataEventListener to check.
     * @return true if type of dataEventListener is disabled in the context.
     */
    private boolean isEventListenerDisabled(final Context context,
            final IDataEventListener dataEventListener) {
        boolean disabled = false;
        for (final Class disabledClass : context.getDisabledEventListenerClasses()) {
            if (disabledClass.isInstance(dataEventListener)) {
                disabled = true;
                break;
            }
        }
        
        return disabled;
    }
    
    /**
     * Triggers specified dataEvent.
     * 
     * @param context to be used to enable/disable dataEventListeners.
     * @param dataEvent to be triggered.
     * @param dataEventListeners to be notified about the event.
     */
    private void triggerDataEvent(final Context context, final DataEvent dataEvent,
            final List<IDataEventListener> dataEventListeners) {
        
        for (final IDataEventListener dataEventListener : dataEventListeners) {
            // don't trigger event if type of EventListener is disabled
            if (!this.isEventListenerDisabled(context, dataEventListener)) {
                try {
                    // disable type of dataEventListener, so that it will not be
                    // triggered again inside of this try/finally block
                    context.addDisabledEventListenerClass(dataEventListener.getClass());
                    
                    // delegate event to the Listener
                    dataEventListener.onApplicationEvent(dataEvent);
                    // CHECKSTYLE:OFF Justification: Suppress "Catching Throwable is not allowed"
                    // warning: We can not let the exception propagate here, it should be reported
                    // and continue triggering events for other listeners
                } catch (final Throwable throwable) {
                    // CHECKSTYLE: ON
                    // log the exception
                    final String errorReport = ExceptionHandlerBase.prepareErrorReport(throwable);
                    this.logger.error(errorReport);
                    
                    // continue triggering events for other listeners
                } finally {
                    // clear type of EventListener in disabled types in the context
                    context.removeDisabledEventListenerClass(dataEventListener.getClass());
                }
            }
        }
    }
}
