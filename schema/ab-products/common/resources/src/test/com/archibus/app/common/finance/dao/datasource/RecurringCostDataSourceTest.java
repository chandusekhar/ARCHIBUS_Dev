package com.archibus.app.common.finance.dao.datasource;

import java.util.*;

import com.archibus.app.common.finance.domain.RecurringCost;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for RecurringCostDataSource.
 * 
 * @author Valery Tydykov
 * 
 */
public class RecurringCostDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test method for
     * {@link RecurringCostDataSource#findByAssetKeyAndDateRange(String, Date, Date, String)} .
     */
    public void testFindByAssetKeyAndDateRange() {
        final Date dateStart = new GregorianCalendar(2007, 1, 1).getTime();
        final RecurringCostDataSource dao = new RecurringCostDataSource();
        final List<RecurringCost> recurringCosts =
                dao.findByAssetKeyAndDateRange("pr_id", dateStart, null, null);
        
        assertEquals(34, recurringCosts.size());
        
        final RecurringCost recurringCost = recurringCosts.get(0);
        assertEquals("1997-OVERHEAD", recurringCost.getAccountId());
        assertEquals(350.0, recurringCost.getAmountExpense());
        assertEquals(0.0, recurringCost.getAmountIncome());
        assertEquals(1, recurringCost.getId());
        assertEquals(0.0, recurringCost.getVatAmountOverride());
        assertEquals(0.0, recurringCost.getAmountExpenseVatBudget());
    }
    
    public void testRecurrringCost() {
        final int recurringCostId = 558;
        final RecurringCostDataSource dao = new RecurringCostDataSource();
        final RecurringCost recurrCost = dao.getRecord(recurringCostId);
        
        final Date costDate = recurrCost.getDateForOccurence(15);
        final Calendar result = Calendar.getInstance();
        result.set(2014, 1, 28, 0, 0, 0);
        
        assertEquals(result, costDate);
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "recurringCostDataSource.xml" };
    }
}
