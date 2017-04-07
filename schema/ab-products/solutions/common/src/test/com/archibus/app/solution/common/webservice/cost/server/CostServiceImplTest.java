package com.archibus.app.solution.common.webservice.cost.server;

import com.archibus.app.common.finance.domain.ActualCost;
import com.archibus.datasource.DataSourceTestBase;

public class CostServiceImplTest extends DataSourceTestBase {
    private CostService costService;
    
    public CostService getCostService() {
        return this.costService;
    }
    
    public void setCostService(final CostService costService) {
        this.costService = costService;
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/com/archibus/webservice/cost/server/costService.xml" };
    }
    
    public void testGetActualCostsByCategoryAndMonth() {
        
        final String costCategoryId = "RENT - BASE RENT";
        final int month = 3;
        final int year = 2009;
        final ActualCost[] costs =
                this.costService.getActualCostsByCategoryAndMonth(costCategoryId, month, year);
        
        assertEquals(2, costs.length);
        
        final ActualCost actualCost = costs[0];
        assertEquals(null, actualCost.getAccountId());
        assertEquals(0.0, actualCost.getAmountExpense());
        assertEquals(2000.0, actualCost.getAmountIncome());
        assertEquals(18, actualCost.getId());
        assertEquals(2005000006, actualCost.getInvoiceId().intValue());
        assertEquals(35, actualCost.getRecurCostId());
    }
}
