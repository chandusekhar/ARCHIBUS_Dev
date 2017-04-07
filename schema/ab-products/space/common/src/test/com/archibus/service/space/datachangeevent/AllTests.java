package com.archibus.service.space.datachangeevent;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(DeleteRoomTransactionRecorderTest.class);
        suite.addTestSuite(InsertRoomTransactionRecorderTest.class);
        suite.addTestSuite(UpdateRoomTransactionRecorderTest.class);
        suite.addTestSuite(RoomTransactionDataEventListenerTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
