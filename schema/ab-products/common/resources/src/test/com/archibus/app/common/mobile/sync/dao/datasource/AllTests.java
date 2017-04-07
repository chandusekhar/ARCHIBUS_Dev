package com.archibus.app.common.mobile.sync.dao.datasource;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(SyncDataSourceIntegrationTest.class);
        suite.addTestSuite(SyncDataSourceUtilitiesTest.class);
        suite.addTestSuite(ConverterIntegrationTest.class);
        suite.addTestSuite(MobileAppConfigDataSourceIntegrationTest.class);
        suite.addTestSuite(DocumentFieldsDataSourceUtilitiesIntegrationTest.class);
        suite.addTestSuite(DocumentFieldsDataSourceUtilitiesTest.class);
        suite.addTestSuite(DocumentFieldsDataSourceIntegrationTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
