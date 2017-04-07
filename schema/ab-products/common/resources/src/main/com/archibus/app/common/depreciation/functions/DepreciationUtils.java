package com.archibus.app.common.depreciation.functions;

import com.archibus.utility.EnumTemplate;

/**
 * Utility class. Provides methods to calculate depreciation. Methods:
 * <li>Straight Line Rent
 * <li>Sum of years digits
 * <li>Fixed Percentage
 * <li>Double-declining Balance
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 * @see <a href="http://en.wikipedia.org/wiki/Depreciation">http://en .wikipedia.org/wiki/
 *      Depreciation</a>
 */
public final class DepreciationUtils {
    /**
     * Depreciation methods enumeration.
     * <p>
     *
     *
     * @author Ioan Draghici
     * @since 23.1
     *
     */
    public enum CalculationMethod {
        /**
         * Methods.
         */
        STRAIGHT_LINE, SUM_OF_YEAR_DIGITS, FIXED_PERCENTAGE, DOUBLE_DECLINING_BALANCE;
        /**
         * Asset type defintion.
         */
        private static final Object[][] STRINGS_TO_ENUMS =
                { { "SL", STRAIGHT_LINE }, { "SYD", SUM_OF_YEAR_DIGITS },
                        { "PCT", FIXED_PERCENTAGE }, { "DDB", DOUBLE_DECLINING_BALANCE } };

        /**
         *
         * Convert from string.
         *
         * @param source string value
         * @return vat type
         */
        public static CalculationMethod fromString(final String source) {
            return (CalculationMethod) EnumTemplate.fromString(source, STRINGS_TO_ENUMS,
                CalculationMethod.class);
        }

        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
        }
    }

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DepreciationUtils() {

    }

    /**
     * Calculate depreciation for N'th period using Straight Line Rent method.
     * <p>
     *
     *
     * @param nthPeriod period to calculate for
     * @param purchasePrice purchase price
     * @param salvageValue salvage value
     * @param totalNumberOfDepreciationPeriods depreciation life; total number of depreciation
     *            periods
     * @return double
     *
     * @see <a href="http://en.wikipedia.org/wiki/Depreciation#Straight-line_depreciation">http://en
     *      .wikipedia.org/wiki/ Depreciation - Straight-line_depreciation</a>
     */
    public static double straightLineDepreciationForNthPeriod(final int nthPeriod,
            final double purchasePrice, final double salvageValue,
            final int totalNumberOfDepreciationPeriods) {
        double depreciationValue = 0.00;
        if (nthPeriod > 0 && nthPeriod <= totalNumberOfDepreciationPeriods) {
            depreciationValue = (purchasePrice - salvageValue) / totalNumberOfDepreciationPeriods;
        }
        return depreciationValue;
    }

    /**
     * Calculate accumulated depreciation until N'th period using Straight Line Rent method.
     * <p>
     *
     *
     * @param nthPeriod period to calculate for
     * @param purchasePrice purchase price
     * @param salvageValue salvage value
     * @param totalNumberOfDepreciationPeriods depreciation life; total number of depreciation
     *            periods
     * @return double
     *
     * @see <a href="http://en.wikipedia.org/wiki/Depreciation#Straight-line_depreciation">http://en
     *      .wikipedia.org/wiki/ Depreciation - Straight-line_depreciation</a>
     */
    public static double straightLineAccumulatedDepreciationForNthPeriod(final int nthPeriod,
            final double purchasePrice, final double salvageValue,
            final int totalNumberOfDepreciationPeriods) {
        final double depreciationValue = straightLineDepreciationForNthPeriod(nthPeriod,
            purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        return depreciationValue * nthPeriod;
    }

    /**
     * Calculate depreciation for N'th period using Sum-of-year-digits method.
     *
     * @param nthPeriod period to calculate for
     * @param purchasePrice purchase price
     * @param salvageValue salvage value
     * @param totalNumberOfDepreciationPeriods depreciation life; total number of depreciation
     *            periods
     * @return double
     *
     * @see <a href="5">http://en .wikipedia.org/wiki/ Depreciation - Sum-of-years-digits</a>
     */
    public static double sumOfYearDigitsDepreciationForNthPeriod(final int nthPeriod,
            final double purchasePrice, final double salvageValue,
            final int totalNumberOfDepreciationPeriods) {
        final double depreciableBase = purchasePrice - salvageValue;
        final double usefullLife = totalNumberOfDepreciationPeriods;
        final double sumOfYearDigits = usefullLife * (usefullLife + 1) / 2;
        final int remainingUsefulLife = totalNumberOfDepreciationPeriods - (nthPeriod - 1);
        double depreciationValue = 0.00;
        if (nthPeriod > 0) {
            depreciationValue = depreciableBase * remainingUsefulLife / sumOfYearDigits;
        }
        return depreciationValue;
    }

    /**
     * Calculate accumulated depreciation until N'th period using Sum-of-year-digits method.
     *
     * @param nthPeriod period to calculate for
     * @param purchasePrice purchase price
     * @param salvageValue salvage value
     * @param totalNumberOfDepreciationPeriods depreciation life; total number of depreciation
     *            periods
     * @return double
     *
     * @see <a href="http://en.wikipedia.org/wiki/Depreciation#Sum-of-years-digits_method">http://en
     *      .wikipedia.org/wiki/ Depreciation - Sum-of-years-digits</a>
     */
    public static double sumOfYearDigitsAccumulatedDepreciationForNthPeriod(final int nthPeriod,
            final double purchasePrice, final double salvageValue,
            final int totalNumberOfDepreciationPeriods) {
        double accumulatedDepreciation = 0.00;
        final double depreciableBase = purchasePrice - salvageValue;
        final double usefullLife = totalNumberOfDepreciationPeriods;
        final double sumOfYearDigits = usefullLife * (usefullLife + 1) / 2;
        for (int index = 1; index <= nthPeriod; index++) {
            final int remainingUsefulLife = totalNumberOfDepreciationPeriods - (index - 1);
            double depreciationValue = 0.00;
            if (index > 0) {
                depreciationValue = depreciableBase * remainingUsefulLife / sumOfYearDigits;
                accumulatedDepreciation = accumulatedDepreciation + depreciationValue;
            }
        }

        return accumulatedDepreciation;
    }

    /**
     * Calculate depreciation for N'th period using Fixed Percentage method.
     *
     * @param nthPeriod period to calculate for
     * @param purchasePrice purchase price
     * @param depreciationPercentage depreciation percentage (higher than zero and lower than one 0
     *            < depreciationPercentage < 1)
     * @return double
     */
    public static double percentageDepreciationForNthPeriod(final int nthPeriod,
            final double purchasePrice, final double depreciationPercentage) {
        double depreciationValue = 0.00;
        if (depreciationPercentage > 0 && depreciationPercentage < 1 && nthPeriod > 0) {
            depreciationValue = purchasePrice * Math.pow(1 - depreciationPercentage, nthPeriod);
        }
        return depreciationValue;
    }

    /**
     * Calculate accumulated depreciation until N'th period using Fixed Percentage method.
     *
     * @param nthPeriod period to calculate for
     * @param purchasePrice purchase price
     * @param depreciationPercentage depreciation percentage (higher than zero and lower than one 0
     *            < depreciationPercentage < 1)
     * @return double
     */
    public static double percentageAccumulatedDepreciationForNthPeriod(final int nthPeriod,
            final double purchasePrice, final double depreciationPercentage) {
        final double depreciationValue = percentageDepreciationForNthPeriod(nthPeriod,
            purchasePrice, depreciationPercentage);
        return depreciationValue * nthPeriod;
    }

    /**
     * Calculate depreciation for N'th period using Double Declining Balance method.
     *
     * @param nthPeriod period to calculate for
     * @param purchasePrice purchase price
     * @param salvageValue salvage value
     * @param totalNumberOfDepreciationPeriods depreciation life; total number of depreciation
     *            periods
     * @return double
     *
     * @see <a href="http://en.wikipedia.org/wiki/Depreciation#Doubling_Declining_balance_method">
     *      http://en .wikipedia.org/wiki/ Depreciation - Doubling_Declining_balance</a>
     */
    public static double doubleDecliningBalanceDepreciationForNthPeriod(final int nthPeriod,
            final double purchasePrice, final double salvageValue,
            final int totalNumberOfDepreciationPeriods) {
        double depreciationValue = 0.00;
        if (nthPeriod > 0 && purchasePrice > salvageValue && totalNumberOfDepreciationPeriods > 0) {
            final double straightLineDepreciationRate = 1.00 / totalNumberOfDepreciationPeriods;
            double depreciableBase = purchasePrice;
            double remainingDepreciableValue = 0.00;
            double proposedDepreciationThisYear = 0.00;
            for (int index = 1; index <= nthPeriod; index++) {
                proposedDepreciationThisYear = 2 * depreciableBase * straightLineDepreciationRate;
                remainingDepreciableValue = depreciableBase - salvageValue;
                depreciableBase = depreciableBase - proposedDepreciationThisYear;
            }

            if (remainingDepreciableValue < 0.00) {
                remainingDepreciableValue = 0.00;
            }
            if (proposedDepreciationThisYear < remainingDepreciableValue) {
                depreciationValue = proposedDepreciationThisYear;
            } else {
                depreciationValue = remainingDepreciableValue;
            }
        }
        return depreciationValue;
    }

    /**
     * Calculate accumulated depreciation until N'th period using Double Declining Balance method.
     *
     * @param nthPeriod period to calculate for
     * @param purchasePrice purchase price
     * @param salvageValue salvage value
     * @param totalNumberOfDepreciationPeriods depreciation life; total number of depreciation
     *            periods
     * @return double
     *
     * @see <a href="http://en.wikipedia.org/wiki/Depreciation#Doubling_Declining_balance_method">
     *      http://en .wikipedia.org/wiki/ Depreciation - Doubling_Declining_balance</a>
     */
    public static double doubleDecliningBalanceAccumulatedDepreciationForNthPeriod(
            final int nthPeriod, final double purchasePrice, final double salvageValue,
            final int totalNumberOfDepreciationPeriods) {
        double depreciationValue = 0.00;
        double accumulatedDepreciation = 0.00;
        if (nthPeriod > 0 && purchasePrice > salvageValue && totalNumberOfDepreciationPeriods > 0) {
            final double straightLineDepreciationRate = 1.00 / totalNumberOfDepreciationPeriods;
            double depreciableBase = purchasePrice;
            double remainingDepreciableValue = 0.00;
            double proposedDepreciationThisYear = 0.00;
            for (int index = 1; index <= nthPeriod; index++) {
                proposedDepreciationThisYear = 2 * depreciableBase * straightLineDepreciationRate;
                remainingDepreciableValue = depreciableBase - salvageValue;
                depreciableBase = depreciableBase - proposedDepreciationThisYear;

                if (remainingDepreciableValue < 0.00) {
                    remainingDepreciableValue = 0.00;
                }
                if (proposedDepreciationThisYear < remainingDepreciableValue) {
                    depreciationValue = proposedDepreciationThisYear;
                } else {
                    depreciationValue = remainingDepreciableValue;
                }
                accumulatedDepreciation = accumulatedDepreciation + depreciationValue;
            }
        }
        return accumulatedDepreciation;
    }

}
