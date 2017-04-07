package com.archibus.eventhandler.energy;

import com.archibus.datasource.DataSourceTestBase;

public class TestProcessRegressionModel extends DataSourceTestBase {
    public void testCalculateRegressionModel() {
        try {
            ProcessRegressionModel prm = new ProcessRegressionModel();
            prm.run();
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }
}
