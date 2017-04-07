package com.archibus.app.reservation.util;

/**
 * Defines helper functions for unit tests.
 * @author Yorik Gerlo
 * @since 23.1
 */
public final class TestHelper {
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private TestHelper() {
    }
    
    /**
     * Flatten HTML text by removing all tags and newlines.
     * 
     * @param textObject an object that represents a HTML string
     * @return plain text
     */
    public static String flatten(final Object textObject) {
        final String text = textObject.toString();
        // remove all HTML tags and trim whitespace
        return text.replaceAll(" <br>", "").replaceAll("\\<[^>]*>", "").replaceAll("[\r\n]", "")
            .trim();
    }
    
}
