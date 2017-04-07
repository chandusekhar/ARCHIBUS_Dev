package com.archibus.app.common.space.dao.datasource;

import junit.framework.*;

public class AllTests extends TestCase {
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(RoomDataSourceTest.class);
        suite.addTestSuite(RoomTransactionDataSourceTest.class);
        suite.addTestSuite(ArchivedRoomTransactionDataSourceTest.class);
        suite.addTestSuite(BuildingDataSourceTest.class);
        suite.addTestSuite(FloorDataSourceTest.class);
        suite.addTestSuite(SiteDataSourceTest.class);
        return suite;
    }
    
    public AllTests(final String s) {
        super(s);
    }
}
