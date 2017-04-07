package com.archibus.eventhandler.energy;

import com.archibus.datasource.DataSourceTestBase;

public class TestCalculateVarianceValues extends DataSourceTestBase {
    static String billID = "666";

    static String vnId = "ELECTRICAL CO-OP";

    public void testRun() {
        try {
            assertTrue(CalculateVarianceValuesService.run(billID, vnId));
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcIncomeVarianceAvgSQL() {
        try {
            CalculateVarianceValuesService.calcIncomeVarianceAvgSQL(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcIncomeVarianceMonthSQL() {
        try {
            CalculateVarianceValuesService.calcIncomeVarianceMonthSQL(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcIncomeVarianceYearSQL() {
        try {
            CalculateVarianceValuesService.calcIncomeVarianceYearSQL(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcExpenseVarianceAvgSQL() {
        try {
            CalculateVarianceValuesService.calcExpenseVarianceAvgSQL(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcExpenseVarianceMonthSQL() {
        try {
            CalculateVarianceValuesService.calcExpenseVarianceMonthSQL(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcExpenseVarianceYearSQL() {
        try {
            CalculateVarianceValuesService.calcExpenseVarianceYearSQL(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcIncomeVarianceAvgORACLE() {
        try {
            CalculateVarianceValuesService.calcIncomeVarianceAvgORACLE(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcIncomeVarianceMonthORACLE() {
        try {
            CalculateVarianceValuesService.calcIncomeVarianceMonthORACLE(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcIncomeVarianceYearORACLE() {
        try {
            CalculateVarianceValuesService.calcIncomeVarianceYearORACLE(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcExpenseVarianceAvgORACLE() {
        try {
            CalculateVarianceValuesService.calcExpenseVarianceAvgORACLE(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcExpenseVarianceMonthORACLE() {
        try {
            CalculateVarianceValuesService.calcExpenseVarianceMonthORACLE(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testCalcExpenseVarianceYearORACLE() {
        try {
            CalculateVarianceValuesService.calcExpenseVarianceYearORACLE(billID, vnId);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            releaseTestContext(this.c);
        }
    }
}
