package com.archibus.app.common.metrics;

/**
 * Public constants for Metric Domain implementation.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public final class Constants {

    /**
     * Constant: metric active.
     */
    // CHECKSTYLE:OFF : Justification: different fields with same values
    public static final String STATUS_ACTIVE = "A";

    /**
     * Constant: metric deactivated.
     */
    public static final String STATUS_DEACTIVATED = "D";

    // CHECKSTYLE:ON

    /**
     * Constant: metric test passed.
     */
    public static final String TEST_PASSED = "T";

    /**
     * Constant: metric test failed.
     */
    public static final String TEST_FAILED = "TF";

    /**
     * Constant: metric not tested.
     */
    public static final String NOT_TESTED = "XT";

    /**
     * Constant: collect frequency daily.
     */
    public static final String FREQUENCY_DAILY = "d";

    /**
     * Constant: collect frequency weekly.
     */
    public static final String FREQUENCY_WEEKLY = "w";

    /**
     * Constant: collect frequency monthly.
     */
    public static final String FREQUENCY_MONTHLY = "m";

    /**
     * Constant: collect frequency quarterly.
     */
    public static final String FREQUENCY_QUARTERLY = "q";

    /**
     * Constant: collect frequency semi-annually.
     */
    public static final String FREQUENCY_SEMIANNUALLY = "s";

    /**
     * Constant: collect frequency yearly.
     */
    public static final String FREQUENCY_YEARLY = "y";

    /**
     * Constant: aggregate function.
     */
    public static final String AGGREGATE_AS_SUM = "SUM";

    /**
     * Constant: aggregate function.
     */
    public static final String AGGREGATE_AS_AVG = "AVG";

    /**
     * Constant: aggregate function.
     */
    public static final String AGGREGATE_AS_MIN = "MIN";

    /**
     * Constant: aggregate function.
     */
    public static final String AGGREGATE_AS_MAX = "MAX";

    /**
     * Constant: aggregate function.
     */
    public static final String AGGREGATE_AS_COUNT = "COUNT";

    /**
     * Constant: value NONE.
     */
    public static final String NONE = "NONE";

    /**
     * Constant: previous values number.
     */
    public static final String PREVIOUS_VAL_NUMBER = "19";

    /**
     * Constant: SEMICOLON.
     */
    public static final String SEMICOLON = ";";

    /**
     * Constant.
     */
    public static final String DOT = ".";

    /**
     * Constant.
     */
    public static final String COMMA = ",";

    /**
     * Constant: field label.
     */
    public static final String FIELD = "field:";

    /**
     * Constant: bean label.
     */
    public static final String BEAN = "bean:";

    /**
     * Constant: PORTFOLIO (former TOTAL).
     */
    public static final String PORTFOLIO = "all";

    /**
     * Constant: NULL.
     */
    public static final String NULL = "NULL";

    /**
     * Constant: EXAMPLE.
     */
    public static final String EXAMPLE = "example";

    /**
     * Remove method archive.
     */
    public static final String REMOVE_METHOD_ARCHIVE = "A";

    /**
     * Remove method delete.
     */
    public static final String REMOVE_METHOD_DELETE = "D";

    /**
     * Numeric format.
     */
    public static final String NUMERIC_FORMAT_PERCENT = "P";

    /**
     * Constant.
     */
    public static final String REGEX_FIELD_PATTERN_TEMPLATE =
            "(^%s[^\\w])|([^\\w]%s[^\\w])|([^\\w]%s$)";

    /**
     * Constant for calc_type field value for metrics currently supported by the Performance Metrics
     * Framework.
     */
    public static final String TRACKING_METRICS = "Tracking Metrics";

    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private Constants() {

    }
}
