package com.archibus.eventhandler.rplm.alerts;

import java.util.Locale;

import com.archibus.context.ContextStore;

/**
 * Contains localized messages for lease alerts.
 * 
 * @author Ioan Draghici
 * @since 21.2
 */
public final class Messages {
    /**
     * Constant.
     */
    // @translatable
    public static final String RED = "Red";
    
    /**
     * Constant.
     */
    // @translatable
    public static final String GREEN = "Green";
    
    /**
     * Constant.
     */
    // @translatable
    public static final String YELLOW = "Yellow";
    
    /**
     * Class name.
     */
    public static final String CLASS_NAME = "com.archibus.eventhandler.rplm.alerts.Messages";
    
    /**
     * Private constructor.
     */
    private Messages() {
    }
    
    /**
     * Returns localized string.
     * 
     * @param message message name
     * @param locale locale
     * @return string
     */
    public static String getLocalizedMessage(final String message, final Locale locale) {
        return ContextStore.get().getConfigManager()
            .loadLocalizedString(CLASS_NAME, "", message, locale, false);
    }
}
