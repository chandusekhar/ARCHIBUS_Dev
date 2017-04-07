package com.archibus.app.common.metrics;

/**
 * Contains localized messages for metrics.
 *
 * @author Ioan Draghici
 * @since v21.2
 */
public final class Messages {

    /**
     * Error message: no ratio definition.
     */
    // @translatable
    public static final String ERROR_RATIO_NO_DEF =
            "Metric '{0}' is ratio metric. Numerator and denominator must be defined.";

    /**
     * Error message: metric is not active.
     */
    // @translatable
    public static final String ERROR_METRIC_NOT_ACTIVE = "Metric {0} [{1}] must be activated.";

    /**
     * Error message: no granularities.
     */
    // @translatable
    public static final String ERROR_NO_GRANULARITIES =
            "Metric '{0}' must have at least one granularity assigned.";

    /**
     * Error message: invalid collect field or table.
     */
    // @translatable
    public static final String ERROR_COLLECT_FIELD_INVALID =
            "Metric '{0}' has an invalid collect field [{1}].";

    /**
     * Error message: invalid bean name.
     */
    // @translatable
    public static final String ERROR_BEAN_NAME_INVALID =
            "Metric '{0}' has an invalid workflow [{1}].";

    /**
     * Error message: invalid bean name.
     */
    // @translatable
    public static final String ERROR_GROUP_BY_FIELD_INVALID =
            "Metric '{0}' contains an invalid group by field [{1}]: not defined in collect (or required) table(s).";

    /**
     * Error message: missing required tables.
     */
    // @translatable
    public static final String ERROR_NO_REQUIRED_TABLES =
            "Metric '{0}' must have standard table(s).";

    /**
     * Error message: generic error message.
     */
    // @translatable
    public static final String ERROR_GENERIC_MESSAGE =
            "An error occurs for metric '{0}'. See application log for more details.";

    /**
     * Error message: no data available.
     */
    // @translatable
    public static final String ERROR_NO_DATA_AVAILABLE =
            "There is no data available for metric '{0}'";

    /**
     * Error message: undefined collect recurrence.
     */
    // @translatable
    public static final String ERROR_COLLECT_RECURRENCE_UNDEFINED =
            "Collect recurrence is not defined for metric '{0}'";

    /**
     * Error message: undefined collect recurrence.
     */
    // @translatable
    public static final String ERROR_UNASSIGNED_GRANULARITY =
            "Metric '{0}': granularity '{1}' must be assigned to numerator and denominator metrics.";

    /**
     * Error message: undefined collect recurrence.
     */
    // @translatable
    public static final String ERROR_SAMPLE_DATA =
            "Metric '{0}' has sample data created. Sample data must be deleted.";

    /**
     * Private constructor.
     */
    private Messages() {

    }

}
