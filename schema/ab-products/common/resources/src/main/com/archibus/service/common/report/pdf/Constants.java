package com.archibus.service.common.report.pdf;

/**
 *
 * Constants for the classes in this package.
 *
 * @author shao
 * @since 21.1
 *
 */
public final class Constants {
    /**
     * Constant: LEGEND_TABLE.
     */
    public static final String LEGEND_TABLE = "LEGENDTABLE";
    
    /**
     * Constant: PIXEL to POINT.
     */
    public static final double PIXEL_TO_POINT = 0.75;
    
    /**
     * Constant: dash separator.
     */
    public static final String DASH_SEPARATOR = "-";
    
    /**
     * Constant: metric unit.
     */
    public static final String METRIC = "metric";
    
    /**
     * Constant: imperial unit.
     */
    public static final String IMPERIAL = "imperial";
    
    /**
     * Constant: Imperial standard scale names for displaying.
     */
    public static final String[] SCALE_IMPERIAL = { "1", "3/4", "1/2", "3/8", "1/4", "3/16", "1/8",
            "3/32", "1/16", "1/32", "1/64", "1/128" };
    
    /**
     * Constant: Metric standard scale names for displaying.
     */
    public static final String[] SCALE_METRIC = { "1:1", "1:2", "1:5", "1:10", "1:20", "1:25",
            "1:50", "1:100", "1:200", "1:250", "1:500", "1:1000", "1:2000" };
    
    // CHECKSTYLE:OFF Justification: Suppress
    /**
     * Constant: Imperial standard scale fractions for calculation .
     */
    public static final double[] SCALES_FACTORS_IMPERIAL = { 12.00, 16.00, 24.00, 32.00, 48.00,
            64.00, 96.00, 128.00, 192.00, 384.00, 768.00, 1536.00 };
    
    /**
     * Constant: Metric standard scale fractions for calculation .
     */
    public static final double[] SCALES_FACTORS_METRIC =
            { 100.00, 200.00, 500.00, 1000.00, 2000.00, 2500.00, 5000.00, 10000.00, 20000.00,
                    25000.00, 50000.00, 100000.00, 200000.00 };
    
    /**
     * Constant: imperial scale bar displayed numbers.
     */
    public static final String[] SCALE_BAR_IMPERIAL = { "1;2", "1.3;2.7", "2;4", "2.7;5.3", "4;8",
            "5.3;10.7", "8;16", "10.7;21.3", "16;32", "32;64", "64;128", "128;256" };
    
    /**
     * Constant: metric scale bar displayed numbers.
     */
    public static final String[] SCALE_BAR_METRIC = { "1;2;6", "2;4;12", "5;10;30", "10;20;60",
            "20;40;120", "25;50;150", "50;100;300", "100;200;600", "200;400;1200", "250;500;1500",
            "500;1000;3000", "1000;2000;6000", "2000;4000;12000" };
    
    /**
     * INCHE_TO_POINTS.
     */
    public static final double INCHE_TO_POINTS = 72.00;
    
    /**
     * CM_TO_POINTS.
     */
    public static final double CM_TO_POINTS = 28.3464567;
    
    /**
     * M_TO_POINTS.
     */
    public static final double M_TO_POINTS = 2834.64567;
    
    /**
     * MM_TO_POINTS.
     */
    public static final double MM_TO_POINTS = 2.83464567;
    
    // CHECKSTYLE:ON
    
    /**
     * SCALE_DISPLAYED_PATTERN_IMPERIAL.
     */
    public static final String SCALE_DISPLAYED_PATTERN_IMPERIAL = "%s\"=1'-0\"";
    
    /**
     * SCALE_DISPLAYED_PATTERN_METRIC.
     */
    public static final String SCALE_DISPLAYED_PATTERN_METRIC = "%s";
    
    /**
     * SCALE_PREDEFINED.
     */
    public static final String SCALE_PREDEFINED_CONSISTENT = "consistent";
    
    /**
     * NULL_VALUE.
     */
    public static final String NULL_VALUE = "null";
    
    /**
     * FONTSIZE.
     */
    public static final int FONTSIZE = 8;
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private Constants() {
    }
}
