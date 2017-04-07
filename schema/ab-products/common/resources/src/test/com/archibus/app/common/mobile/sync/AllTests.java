package com.archibus.app.common.mobile.sync;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTest(com.archibus.app.common.mobile.sync.service.AllTests.suite());
        suite.addTest(com.archibus.app.common.mobile.sync.dao.datasource.AllTests.suite());
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
