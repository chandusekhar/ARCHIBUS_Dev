package com.archibus.app.common.mobile.sync.service;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(RecordTest.class);
        suite.addTest(com.archibus.app.common.mobile.sync.service.impl.AllTests.suite());
        suite.addTest(com.archibus.app.common.mobile.sync.service.dwr.AllTests.suite());
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
