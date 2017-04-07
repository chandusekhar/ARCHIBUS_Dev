package com.archibus.service.space.mobile.survey.start;

import junit.framework.*;

public class AllTests extends TestCase {
    public AllTests(final String name) {
        super(name);
    }
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(TestPopulateSyncTables.class);
        return suite;
    }
}
