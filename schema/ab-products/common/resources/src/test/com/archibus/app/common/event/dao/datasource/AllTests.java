package com.archibus.app.common.event.dao.datasource;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(RecordChangedDataSourceTest.class);
        suite.addTestSuite(SqlExecutedDataSourceTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
