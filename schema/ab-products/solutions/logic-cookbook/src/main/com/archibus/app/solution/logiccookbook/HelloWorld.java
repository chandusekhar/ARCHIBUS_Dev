package com.archibus.app.solution.logiccookbook;

import java.text.MessageFormat;
import java.util.Date;

import org.apache.log4j.Logger;

/**
 * Minimal event handler example.
 * 
 * @author Valery Tydykov
 */
/**
 * Suppress PMD warning "SystemPrintln" in this class.
 * <p>
 * Justification: This is a simplified example. Don't do this in production code.
 */
@SuppressWarnings("PMD.SystemPrintln")
public class HelloWorld {
    
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * The message to return. Can be configured in
     * schema/ab-products/solutions/logic-cookbook/appContext-services.xml.
     */
    private String message = "Hello World!";
    
    /**
     * Getter for the message property.
     * 
     * @see message
     * @return the message property.
     */
    public String getMessage() {
        return this.message;
    }
    
    /**
     * Setter for the message property.
     * 
     * @see message
     * @param message the message to set
     */
    
    public void setMessage(final String message) {
        this.message = message;
    }
    
    /**
     * Returns a message containing current date and time to the view.
     * 
     * @return Message to the calling view.
     */
    public String sayHello() {
        // get current date and time
        final Date now = new Date();
        
        // format the message
        final String formattedMessage = MessageFormat.format("{0} -- Invoked at: {1}", getMessage(), now);
        
        // Don't do this in real application!
        System.out.println(formattedMessage);
        
        // This is the right way to output debug messages.
        // To enable debug-level logging in this class: in afm-logging.xml, set priority
        // to 'debug' for com.archibus.eventhandler.cookbook.HelloWorld category.
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(formattedMessage);
        }
        
        // return the message to the calling view
        return formattedMessage;
    }
}