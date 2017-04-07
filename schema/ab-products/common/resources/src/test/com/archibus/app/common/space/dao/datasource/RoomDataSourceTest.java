package com.archibus.app.common.space.dao.datasource;

import com.archibus.app.common.space.dao.IRoomDao;
import com.archibus.app.common.space.dao.datasource.RoomDataSource;
import com.archibus.app.common.space.domain.Room;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Integration tests for RoomDataSource.
 * 
 * @author Valery Tydykov
 * 
 */
public class RoomDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test for {@link RoomDataSource#save(java.lang.Object)} and
     * {@link RoomDataSource#get(java.lang.Object)}.
     */
    public void testSaveUpdateGet() {
        final IRoomDao dataSource = new RoomDataSource();
        
        // save new object to database
        final Room expected = new Room();
        expected.setBuildingId("HQ");
        expected.setFloorId("17");
        expected.setId("TestId");
        expected.setCategory("PERS");
        expected.setDepartmentId("ENGINEERING");
        expected.setDivisionId("ELECTRONIC SYS.");
        expected.setProrate("NONE");
        expected.setType("WRKSTATION");
        
        dataSource.save(expected);
        
        {
            // verify that new object can be retrieved from database
            final Room actual = dataSource.getByPrimaryKey(expected);
            
            assertEquals(expected.getBuildingId(), actual.getBuildingId());
            assertEquals(expected.getCategory(), actual.getCategory());
            assertEquals(expected.getDepartmentId(), actual.getDepartmentId());
            assertEquals(expected.getDivisionId(), actual.getDivisionId());
            assertEquals(expected.getFloorId(), actual.getFloorId());
            assertEquals(expected.getId(), actual.getId());
            assertEquals(expected.getProrate(), actual.getProrate());
            assertEquals(expected.getType(), actual.getType());
        }
        
        // update existing object
        expected.setProrate("FLOOR");
        dataSource.update(expected);
        
        {
            // verify that updated object can be retrieved from database
            final Room actual = dataSource.getByPrimaryKey(expected);
            
            assertEquals(expected.getBuildingId(), actual.getBuildingId());
            assertEquals(expected.getCategory(), actual.getCategory());
            assertEquals(expected.getDepartmentId(), actual.getDepartmentId());
            assertEquals(expected.getDivisionId(), actual.getDivisionId());
            assertEquals(expected.getFloorId(), actual.getFloorId());
            assertEquals(expected.getId(), actual.getId());
            assertEquals(expected.getProrate(), actual.getProrate());
            assertEquals(expected.getType(), actual.getType());
        }
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "roomDataSource.xml" };
    }
}
