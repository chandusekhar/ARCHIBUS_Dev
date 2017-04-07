package com.archibus.app.common.mobile.security.dao.datasource;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(UserAccountDataSourceIntegrationTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
