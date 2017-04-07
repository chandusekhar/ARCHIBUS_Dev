package com.archibus.service.space.mobile.survey;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTest(com.archibus.service.space.mobile.survey.start.AllTests.suite());
        suite.addTest(com.archibus.service.space.mobile.survey.close.AllTests.suite());
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
