package com.archibus.app.common.mobile.security;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTest(com.archibus.app.common.mobile.security.service.impl.AllTests.suite());
        suite.addTest(com.archibus.app.common.mobile.security.dao.datasource.AllTests.suite());
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
