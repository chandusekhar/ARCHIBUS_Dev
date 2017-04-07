package com.archibus.app.common.depreciation.functions;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Utility class. Provides methods to test depreciation calculation.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class DepreciationUtilsTest extends DataSourceTestBase {

    /**
     * Test straight line depreciation.
     */
    public void straightLineDepreciationTest() {
        final double purchasePrice = 60000.00;
        final double salvageValue = 10000.00;
        final int totalNumberOfDepreciationPeriods = 5;

        final double depreciation = DepreciationUtils.straightLineDepreciationForNthPeriod(3,
            purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        assertEquals(10000.00, depreciation, 0.1);
    }

    /**
     * Test straight line accumulated depreciation.
     */
    public void straightLineAccumulatedDepreciationTest() {
        final double purchasePrice = 60000.00;
        final double salvageValue = 10000.00;
        final int totalNumberOfDepreciationPeriods = 5;

        final double depreciation =
                DepreciationUtils.straightLineAccumulatedDepreciationForNthPeriod(3, purchasePrice,
                    salvageValue, totalNumberOfDepreciationPeriods);
        assertEquals(30000.00, depreciation, 0.1);
    }

    /**
     * Test sum of year digits depreciation.
     */
    public void sumOfYearDigitsDepreciationTest() {
        final double purchasePrice = 1000.00;
        final double salvageValue = 0.00;
        final int totalNumberOfDepreciationPeriods = 3;

        final double depreciation1 = DepreciationUtils.sumOfYearDigitsDepreciationForNthPeriod(1,
            purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        final double depreciation2 = DepreciationUtils.sumOfYearDigitsDepreciationForNthPeriod(2,
            purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        final double depreciation3 = DepreciationUtils.sumOfYearDigitsDepreciationForNthPeriod(3,
            purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        assertEquals(500.00, depreciation1, 0.1);
        assertEquals(333.33, depreciation2, 0.1);
        assertEquals(166.67, depreciation3, 0.1);
    }

    /**
     * Test sum of year digits accumulated depreciation.
     */
    public void sumOfYearDigitsAccumulatedDepreciationTest() {
        final double purchasePrice = 1000.00;
        final double salvageValue = 0.00;
        final int totalNumberOfDepreciationPeriods = 3;

        final double depreciation1 =
                DepreciationUtils.sumOfYearDigitsAccumulatedDepreciationForNthPeriod(1,
                    purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        final double depreciation2 =
                DepreciationUtils.sumOfYearDigitsAccumulatedDepreciationForNthPeriod(2,
                    purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        final double depreciation3 =
                DepreciationUtils.sumOfYearDigitsAccumulatedDepreciationForNthPeriod(3,
                    purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        assertEquals(500.00, depreciation1, 0.1);
        assertEquals(833.33, depreciation2, 0.1);
        assertEquals(1000.00, depreciation3, 0.1);
    }

    /**
     * Test double declining balance depreciation.
     *
     */
    public void doubleDecliningBalanceDepreciationTest() {
        final double purchasePrice = 1000.00;
        final double salvageValue = 0.00;
        final int totalNumberOfDepreciationPeriods = 3;

        final double depreciation1 =
                DepreciationUtils.doubleDecliningBalanceDepreciationForNthPeriod(1, purchasePrice,
                    salvageValue, totalNumberOfDepreciationPeriods);
        final double depreciation2 =
                DepreciationUtils.doubleDecliningBalanceDepreciationForNthPeriod(2, purchasePrice,
                    salvageValue, totalNumberOfDepreciationPeriods);
        final double depreciation3 =
                DepreciationUtils.doubleDecliningBalanceDepreciationForNthPeriod(3, purchasePrice,
                    salvageValue, totalNumberOfDepreciationPeriods);
        assertEquals(666.66, depreciation1, 0.1);
        assertEquals(222.24, depreciation2, 0.1);
        assertEquals(74.07, depreciation3, 0.1);

    }

    /**
     * Test double declining balance depreciation.
     *
     */
    public void doubleDecliningBalanceAccumulatedDepreciationTest() {
        final double purchasePrice = 1000.00;
        final double salvageValue = 0.00;
        final int totalNumberOfDepreciationPeriods = 3;

        final double depreciation1 =
                DepreciationUtils.doubleDecliningBalanceAccumulatedDepreciationForNthPeriod(1,
                    purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        final double depreciation2 =
                DepreciationUtils.doubleDecliningBalanceAccumulatedDepreciationForNthPeriod(2,
                    purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        final double depreciation3 =
                DepreciationUtils.doubleDecliningBalanceAccumulatedDepreciationForNthPeriod(3,
                    purchasePrice, salvageValue, totalNumberOfDepreciationPeriods);
        assertEquals(666.66, depreciation1, 0.1);
        assertEquals(888.9, depreciation2, 0.1);
        assertEquals(962.97, depreciation3, 0.1);

    }
}
