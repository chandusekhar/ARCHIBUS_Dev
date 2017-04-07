package com.archibus.app.common.metrics.domain.trenddirection;

import com.archibus.utility.EnumTemplate;

/**
 * Defines possible values of stoplight colors.
 * 
 * @author Sergey Kuramshin
 */

public enum StoplightColor {
    
    /**
     * Supported colors.
     */
    BLACK, GREEN, YELLOW, RED;
    
    /**
     * Maps database values to enumeration values.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "black", BLACK }, { "green", GREEN },
            { "yellow", YELLOW }, { "red", RED } };
    
    /**
     * Converts a string to enumeration value.
     * 
     * @param source The string.
     * @return The enumeration value.
     */
    public static StoplightColor fromString(final String source) {
        return (StoplightColor) EnumTemplate.fromString(source, STRINGS_TO_ENUMS,
            StoplightColor.class);
    }
    
    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
