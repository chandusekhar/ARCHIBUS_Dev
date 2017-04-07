package com.archibus.app.common.finance.dao.datasource;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(ActualCostDataSourceTest.class);
        suite.addTestSuite(RecurringCostDataSourceTest.class);
        suite.addTestSuite(ScheduledCostDataSourceTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
