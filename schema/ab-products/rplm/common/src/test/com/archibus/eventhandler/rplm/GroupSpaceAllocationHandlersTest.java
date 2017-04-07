package com.archibus.eventhandler.rplm;

import com.archibus.datasource.DataSourceTestBase;

public class GroupSpaceAllocationHandlersTest extends DataSourceTestBase {
    
    GroupSpaceAllocationHandlers serviceClass = new GroupSpaceAllocationHandlers();
    
    public void testGetGroupSpaceAllocationData() {
        this.serviceClass.getGroupSpaceAllocationData();
    }
    
    public void testCopyGroupInventoryToScenario() {
        String date_start = "2010-01-01";
        String date_end = "2010-12-31";
        String to_portfolio_scenario_id = "Baseline";
        
        this.serviceClass.copyGroupInventoryToScenario(date_start, date_end,
            to_portfolio_scenario_id);
    }
    
    public void testCopyScenario() {
        
        String to_portfolio_scenario_id = "NewPortfolio";
        String from_portfolio_scenario_id = "Baseline";
        String scenario_exists = "N";
        
        this.serviceClass.copyScenario(from_portfolio_scenario_id, to_portfolio_scenario_id,
            scenario_exists);
    }
    
    public void testDeleteScenario() {
        String portfolio_scenario_id = "Baseline";
        
        this.serviceClass.deleteScenario(portfolio_scenario_id);
    }
    
    public void testUpdateGroupAllocationCosts() {
        String bl_id = "HQ";
        String date_report = "2010-03-03";
        String portfolio_scenario_id = "Baseline";
        String bl_annual_cost = "100";
        
        this.serviceClass.updateGroupAllocationCosts(bl_id, date_report, portfolio_scenario_id,
            bl_annual_cost);
    }
    
    public void testUpdateGroupAllocationCostsAll() {
        String date_report = "2010-03-03";
        String portfolio_scenario_id = "Baseline";
        String site_id = "WEST";
        
        this.serviceClass
            .updateGroupAllocationCostsAll(date_report, portfolio_scenario_id, site_id);
    }
}
