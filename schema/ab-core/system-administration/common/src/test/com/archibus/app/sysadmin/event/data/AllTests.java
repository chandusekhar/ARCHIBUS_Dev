package com.archibus.app.sysadmin.event.data;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public AllTests(String s) {
        super(s);
    }
    
    public static Test suite() {
        TestSuite suite = new TestSuite();
        suite.addTestSuite(LoggerDataEventListenerTest.class);
        suite.addTestSuite(LoggerRecordChangedTest.class);
        suite.addTestSuite(LoggerSqlExecutedTest.class);
        suite.addTestSuite(WorkflowRuleInvokerDataEventListenerTest.class);
        suite.addTestSuite(LoggerUtilitiesTest.class);
        return suite;
    }
}
