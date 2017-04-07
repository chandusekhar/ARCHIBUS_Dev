package com.archibus.app.common.mobile.security.service.impl;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(MobileSecurityServiceIntegrationTest.class);
        suite.addTestSuite(MobileSecurityServiceSsoIntegrationTest.class);
        suite.addTestSuite(MobileSecurityServiceTest.class);
        suite.addTestSuite(MobileSecurityServiceUtilitiesTest.class);
        suite.addTestSuite(CoreUserSessionPopulatingContextInterceptorTest.class);
        suite.addTestSuite(ProjectPopulatingContextInterceptorTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
