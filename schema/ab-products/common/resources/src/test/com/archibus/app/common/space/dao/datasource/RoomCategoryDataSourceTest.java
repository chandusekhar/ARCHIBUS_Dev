package com.archibus.app.common.space.dao.datasource;

import com.archibus.app.common.space.dao.IRoomCategoryDao;
import com.archibus.app.common.space.domain.RoomCategory;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for RoomCategoryDataSource.
 * 
 * @author Zhang Yi
 * 
 */
public class RoomCategoryDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test for {@link RoomCategoryDataSourceTest#save(java.lang.Object)} and
     * {@link RoomCategoryDataSourceTest#get(java.lang.Object)}.
     */
    public void testSaveUpdateGet() {
        final IRoomCategoryDao dataSource = new RoomCategoryDataSource();
        
        // save new object to database
        final RoomCategory expected = new RoomCategory();
        expected.setId("TestCategory");
        expected.setOccupiable(1);
        expected.setSuperCategory("VERT");
        
        // saved has primary key valye only
        final RoomCategory saved = dataSource.save(expected);
        
        {
            // verify that new object can be retrieved from database
            final RoomCategory actual = dataSource.getByPrimaryKey("TestCategory");
            verify(expected, actual);
        }
        
        // set ID of the saved object
        expected.setId(saved.getId());
        // update existing object
        expected.setOccupiable(0);
        dataSource.update(expected);
        
        {
            // verify that updated object can be retrieved from database
            final RoomCategory actual = dataSource.getByPrimaryKey("TestCategory");
            verify(expected, actual);
        }
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "roomTransactionDataSource.xml" };
    }
    
    private void verify(final RoomCategory expected, final RoomCategory actual) {
        assertEquals(expected.getId(), actual.getId());
        assertEquals(expected.getOccupiable(), actual.getOccupiable());
        assertEquals(expected.getSuperCategory(), actual.getSuperCategory());
    }
}
