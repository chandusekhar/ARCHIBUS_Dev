package com.archibus.app.common.mobile.sync.service.impl;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(MobileSyncServiceIntegrationTest.class);
        suite.addTestSuite(MobileSyncServiceTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
