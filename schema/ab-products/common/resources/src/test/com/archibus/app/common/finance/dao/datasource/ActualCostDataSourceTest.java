package com.archibus.app.common.finance.dao.datasource;

import java.util.List;

import com.archibus.app.common.finance.domain.ActualCost;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for ActualCostDataSource.
 * 
 * @author Valery Tydykov
 * 
 */
public class ActualCostDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test method for
     * {@link com.archibus.core.dao.financial.impl.CostDataSourceBaseImpl#getActualCostsByCategoryAndMonth(java.lang.String, int)}
     * .
     */
    public void testGetActualCostsByCategoryAndMonth() {
        final ActualCostDataSource dao = new ActualCostDataSource();
        
        final String costCategoryId = "RENT - BASE RENT";
        final int month = 3;
        final int year = 2009;
        final List<ActualCost> actualCosts =
                dao.getActualCostsByCategoryAndMonth(costCategoryId, month, year);
        
        assertEquals(2, actualCosts.size());
        
        final ActualCost actualCost = actualCosts.get(0);
        assertEquals(null, actualCost.getAccountId());
        assertEquals(0.0, actualCost.getAmountExpense());
        assertEquals(2000.0, actualCost.getAmountIncome());
        assertEquals(18, actualCost.getId());
        assertEquals(2005000006, actualCost.getInvoiceId().intValue());
        assertEquals(35, actualCost.getRecurCostId());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "actualCostDataSource.xml" };
    }
}
