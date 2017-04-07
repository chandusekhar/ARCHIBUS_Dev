package com.archibus.app.common.organization.dao.datasource;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(DepartmentDataSourceTest.class);
        suite.addTestSuite(DivisionDataSourceTest.class);
        suite.addTestSuite(EmployeeDataSourceTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
