package com.archibus.app.common.finance.dao.datasource;

import java.util.Date;

import com.archibus.app.common.finance.domain.ScheduledCost;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for ScheduledCostDataSource.
 * 
 * @author Valery Tydykov
 * 
 */
public class ScheduledCostDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test method for {@link ScheduledCostDataSource#save(ScheduledCost).
     */
    public void testSave() {
        final ScheduledCostDataSource dao = new ScheduledCostDataSource();
        ScheduledCost scheduledCost = new ScheduledCost();
        scheduledCost.setBuildingId("HQ");
        scheduledCost.setCostCategoryId("RENT - BASE RENT");
        scheduledCost.setAmountExpenseBaseBudget(123.45);
        scheduledCost.setCtryId("USA");
        scheduledCost.setDateAssessed(new Date());
        scheduledCost.setDepartmentId("MANAGEMENT");
        scheduledCost.setDivisionId("EXECUTIVE");
        dao.save(scheduledCost);
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "scheduledCostDataSource.xml" };
    }
}
