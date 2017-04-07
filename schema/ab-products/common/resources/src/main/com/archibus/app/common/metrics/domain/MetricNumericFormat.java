package com.archibus.app.common.metrics.domain;

import com.archibus.utility.EnumTemplate;

/**
 * Defines possible values of the afm_metric_definitions.value_disp_numeric field.
 * 
 * @author Sergey Kuramshin
 */

public enum MetricNumericFormat {
    
    /**
     * Supported values defined in the schema.
     */
    NUMBER, PERCENTAGE, BASE_UNIT_AREA, BUDGET_CURRENCY;
    
    /**
     * Maps database values to enumeration values.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "N", NUMBER }, { "P", PERCENTAGE },
            { "A", BASE_UNIT_AREA }, { "B", BUDGET_CURRENCY } };
    
    /**
     * Converts a string to enumeration value.
     * 
     * @param source The string.
     * @return The enumeration value.
     */
    public static MetricNumericFormat fromString(final String source) {
        return (MetricNumericFormat) EnumTemplate.fromString(source, STRINGS_TO_ENUMS,
            MetricNumericFormat.class);
    }
    
    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
