package com.archibus.app.common.depreciation.service;

import java.util.*;

import com.archibus.app.common.depreciation.impl.*;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataRecord;

/**
 * Test class for depreciation service.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class DepreciationServiceTest extends DataSourceTestBase {

    /**
     * Test method for update depreciation.
     *
     */
    public void updateDepreciationTest() {
        final DepreciationService depreciationService = new DepreciationService();
        depreciationService.updateDepreciation();

    }

    /**
     * Test method for update depreciation.
     *
     */
    public void updateDepreciationForAssetTypeTest() {
        final DepreciationService depreciationService = new DepreciationService();
        depreciationService.updateDepreciationForAssetType("ta");
        assertEquals(true, true);

    }

    public void createNewRecord() {
        final DataRecord record = DepreciationServiceHelper.createFinancialParameterRecord();
        assertEquals(true, record.findField("finanal_params.depreciation_date") != null);
    }

    /**
     * Test date diff calculation.
     *
     */
    public void testDateDiffCalculation() {

        final Calendar dateReceived = Calendar.getInstance();
        dateReceived.set(2012, 6, 15);
        final Calendar calculationDate = Calendar.getInstance();
        calculationDate.set(2013, 7, 16);

        final int dateDiff = DepreciationDatesHelper.getDateDiff(Calendar.MONTH,
            dateReceived.getTime(), calculationDate.getTime());

        final int dateDiff2 = getDatesDiff(calculationDate.getTime(), dateReceived.getTime());

        assertEquals(dateDiff, dateDiff2);
    }

    private int getDatesDiff(final Date lastDate, final Date receivedDate) {
        int monthDiff = 0;
        final Calendar cLastDate = Calendar.getInstance();
        cLastDate.setTime(lastDate);

        final Calendar cDateReceived = Calendar.getInstance();
        cDateReceived.setTime(receivedDate);

        monthDiff = (cLastDate.get(Calendar.MONTH) - cDateReceived.get(Calendar.MONTH));
        if (monthDiff < 0) {
            monthDiff = (cLastDate.get(Calendar.YEAR) - cDateReceived.get(Calendar.YEAR) - 1) * 12
                    + (cLastDate.get(Calendar.MONTH) - cDateReceived.get(Calendar.MONTH) + 12);
        } else {

            monthDiff = (cLastDate.get(Calendar.YEAR) - cDateReceived.get(Calendar.YEAR)) * 12
                    + (cLastDate.get(Calendar.MONTH) - cDateReceived.get(Calendar.MONTH));
        }
        return monthDiff;
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "DepreciationBeans.xml" };
    }
}
