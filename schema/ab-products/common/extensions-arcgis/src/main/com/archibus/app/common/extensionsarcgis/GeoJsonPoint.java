package com.archibus.app.common.extensionsarcgis;

import java.awt.geom.Point2D.Double;
import java.text.*;
import java.util.Locale;

/**
 *
 * Defines a point specified in double precision.
 *
 * @author knight
 *
 */
public class GeoJsonPoint extends Double {
    
    /**
     * The serial version ID.
     */
    private static final long serialVersionUID = 1L;
    
    /**
     * The maximum number of fractional digits (to suppress scientific notation).
     */
    private static final int INT_THREE_HUNDRED_FORTY = 340;
    
    /**
     *
     * Constructs and initializes a Point2DExt with coordinates (0,0).
     */
    public GeoJsonPoint() {
        super();
    }
    
    /**
     *
     * Constructs and initializes a Point2DExt with specified coordinates.
     *
     * @param arg0 The X coordinate of the point.
     * @param arg1 The Y coordinate of the point.
     */
    public GeoJsonPoint(final double arg0, final double arg1) {
        super(arg0, arg1);
    }
    
    /**
     * Return a String representing the value of this Point2DExt.
     *
     * @return A String that represents the value of this Point2DExt.
     */
    @Override
    public String toString() {
        final DecimalFormat decimalFormatter =
                new DecimalFormat("0", DecimalFormatSymbols.getInstance(Locale.ENGLISH));
        decimalFormatter.setMaximumFractionDigits(INT_THREE_HUNDRED_FORTY);
        return "[" + decimalFormatter.format(this.x) + ", " + decimalFormatter.format(this.y) + "]";
    }
}
