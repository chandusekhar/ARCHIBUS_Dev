package com.archibus.app.sysadmin.updatewizard.script.parser;

import java.util.*;

/**
 *
 * Utility class for text messages.
 *
 * @author Catalin Purice
 * @since 23.1
 *
 */
public final class TextUtil {
    
    /**
     * Message.
     */
    public static final String TRANSFER_IN_SUCCESS = "%d file(s) imported successfully";

    /**
     * Message.
     */
    public static final String TRANSFER_IN_ERROR = "%d file(s) imported with errors/warnings";

    /**
     * Message.
     */
    public static final String SQL_SUCCESS = "%d SQL command(s) executed successfully";

    /**
     * Message.
     */
    public static final String SQL_ERROR = "%d SQL command(s) executed with error";

    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private TextUtil() {
        
    }
    
    /**
     *
     * Builds the final message.
     *
     * @param messages all messages
     * @param separator message separator
     * @return message
     */
    public static String join(final List<String> messages, final String separator) {
        final StringBuffer mess = new StringBuffer();
        final Iterator<String> iter = messages.iterator();
        while (iter.hasNext()) {
            mess.append(iter.next());
            if (iter.hasNext()) {
                mess.append(separator);
            }
        }
        return mess.toString();
    }

}
