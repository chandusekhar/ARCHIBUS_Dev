package com.archibus.eventhandler.energy;

import java.math.BigDecimal;

/**
 * NumberUtil - contains a set of useful methods used for our mathematical calculations
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 */
public class NumberUtilService {

    /**
     * Rounds an integer to the amount of decimal places specified.
     * 
     * @param in
     * @param numDecimalPlaces
     * @return rounded number as String
     */
    public static String roundString(double in, int numDecimalPlaces) {
        BigDecimal bd;
        BigDecimal result;

        bd = new BigDecimal(in);
        result = bd.setScale(numDecimalPlaces, BigDecimal.ROUND_HALF_UP);

        return String.valueOf(result);
    }

    /**
     * Converts an integer to a string.
     * 
     * @param i
     * @return Integer provided as String
     */
    public static String convertToString(Integer i) {
        if (i == null) {
            return "";
        } else {
            return i.toString();
        }
    }

    /**
     * Changes a BigDecimal into a Double type
     * 
     * @param decimal
     * @return Double value
     */
    public static double getDouble(BigDecimal decimal) {
        double val = (decimal != null) ? decimal.doubleValue() : 0;
        return val;
    }

    /**
     * Changes an Integer into a Double type
     * 
     * @param i
     * @return Double value
     */
    public static double getDouble(Integer i) {
        double val = (i != null) ? i.doubleValue() : 0;
        return val;
    }

    /**
     * Changes a String into a Double type
     * 
     * @param str
     * @return Double value
     */
    public static double parseDouble(String str) {
        if (str == null) {
            return 0.0;
        } else {
            String strippedStr = str.replace(",", "");
            return Double.parseDouble(strippedStr);
        }
    }

}
