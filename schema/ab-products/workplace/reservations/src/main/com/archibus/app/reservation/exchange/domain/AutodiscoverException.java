package com.archibus.app.reservation.exchange.domain;

import com.archibus.app.reservation.domain.CalendarException;

/**
 * Specific exception to signal auto-discover errors.
 * 
 * @author Yorik Gerlo
 */
public class AutodiscoverException extends CalendarException {
    
    /** Generated serial ID. */
    private static final long serialVersionUID = 3931188618208007847L;
    
    /**
     * Create a reservation exception with localization based on the provided class.
     * 
     * @param message the message (to translate)
     * @param clazz the class where the message was defined
     */
    public AutodiscoverException(final String message, final Class<?> clazz) {
        super(message, clazz);
    }
    
    /**
     * Create a reservation exception with localization based on the provided class. The additional
     * arguments are used for formatting the translated string.
     * 
     * @param message the message (to translate)
     * @param clazz the class where the message was defined
     * @param args additional arguments used for formatting the localized message
     */
    public AutodiscoverException(final String message, final Class<?> clazz, final Object... args) {
        super(message, clazz, args);
    }
    
    /**
     * Create a reservation exception with localization based on the provided class.
     * 
     * @param message the message (to translate)
     * @param cause the causing exception
     * @param clazz the class where the message was defined
     */
    public AutodiscoverException(final String message, final Exception cause, final Class<?> clazz) {
        super(message, cause, clazz);
    }
    
    /**
     * Create an autodiscover exception with localization based on the provided class. The additional
     * arguments are used for formatting the translated string.
     * 
     * @param message the message (to translate)
     * @param cause the causing exception
     * @param clazz the class where the message was defined
     * @param args additional arguments used for formatting the localized message
     */
    public AutodiscoverException(final String message, final Exception cause, final Class<?> clazz,
            final Object... args) {
        super(message, cause, clazz, args);
    }
    
}
