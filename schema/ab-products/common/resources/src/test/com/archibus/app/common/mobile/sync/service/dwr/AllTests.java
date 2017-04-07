package com.archibus.app.common.mobile.sync.service.dwr;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(CustomTypeConverterTest.class);
        suite.addTestSuite(CustomTypeConverterUtilitiesTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
