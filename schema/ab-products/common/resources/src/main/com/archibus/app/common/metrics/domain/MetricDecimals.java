package com.archibus.app.common.metrics.domain;

import com.archibus.utility.EnumTemplate;

/**
 * Defines possible values of the afm_metric_definitions.value_disp_decimals field.
 * 
 * @author Sergey Kuramshin
 */

public enum MetricDecimals {
    
    /**
     * Supported values defined in the schema.
     */
    TWO_PLACES, ONE_PLACE, ZERO_PLACES, HUNDREDS, THOUSANDS, MILLIONS, BILLIONS;
    
    /**
     * Maps database values to enumeration values.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "2", TWO_PLACES }, { "1", ONE_PLACE },
            { "0", ZERO_PLACES }, { "H", HUNDREDS }, { "K", THOUSANDS }, { "M", MILLIONS },
            { "B", BILLIONS } };
    
    /**
     * Converts a string to enumeration value.
     * 
     * @param source The string.
     * @return The enumeration value.
     */
    public static MetricDecimals fromString(final String source) {
        return (MetricDecimals) EnumTemplate.fromString(source, STRINGS_TO_ENUMS,
            MetricDecimals.class);
    }
    
    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
