package com.archibus.app.common.metrics;

import com.archibus.utility.EnumTemplate;

/**
 * Metric calculation type.
 *
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public enum CalculationType {

    /**
     * Metric calculation type.
     */
    LEGACY, TRACKING, ANALYSIS;

    /**
     * Calculation type definition.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "Legacy Metrics", LEGACY },
            { "Tracking Metrics", TRACKING }, { "Analysis Metrics", ANALYSIS } };

    /**
     *
     * Convert from string.
     *
     * @param source string value
     * @return vat type
     */
    public static CalculationType fromString(final String source) {
        return (CalculationType) EnumTemplate.fromString(source, STRINGS_TO_ENUMS,
            CalculationType.class);
    }

    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
