package com.archibus.app.common;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTest(com.archibus.app.common.event.dao.datasource.AllTests.suite());
        suite.addTest(com.archibus.app.common.finance.dao.datasource.AllTests.suite());
        suite.addTest(com.archibus.app.common.organization.dao.datasource.AllTests.suite());
        suite.addTest(com.archibus.app.common.space.dao.datasource.AllTests.suite());
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
