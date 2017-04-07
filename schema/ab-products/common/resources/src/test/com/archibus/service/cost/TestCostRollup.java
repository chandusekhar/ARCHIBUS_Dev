package com.archibus.service.cost;

import com.archibus.datasource.DataSourceTestBase;

public class TestCostRollup extends DataSourceTestBase {

    public void testRollupBuildingProperty() {
        new CostRollup(CostRollup.ROLLUP_BUILDING_PROPERTY).calculate(null);
    }

    public void testRollupLeaseBuilding() {
        new CostRollup(CostRollup.ROLLUP_LEASE_BUILDING).calculate(null);
    }

    public void testRollupLeaseProperty() {
        new CostRollup(CostRollup.ROLLUP_LEASE_PROPERTY).calculate(null);
    }
}
