package com.archibus.app.common.space.dao.datasource;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.common.space.domain.Floor;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataRecord;

/**
 * Test for FloorDataSource.
 * 
 * @author Yorik Gerlo
 */
public class FloorDataSourceTest extends DataSourceTestBase {
    
    /** Building ID used for testing. */
    private static final String BL_ID = "HQ";
    
    /** The floor datasource being tested. */
    private FloorDataSource floorDataSource;
    
    /**
     * Test getting all floors from the database.
     */
    public void testGetAllFloors() {
        final List<DataRecord> records = this.floorDataSource.getRecords();
        Assert.assertNotNull(records);
        
        final List<Floor> floors = this.floorDataSource.find(null);
        Assert.assertNotNull(floors);
        
        Assert.assertEquals(records.size(), floors.size());
    }
    
    /**
     * Test finding floor by building.
     */
    public void testFindByBuilding() {
        final List<Floor> floors = this.floorDataSource.findByBuilding(BL_ID);
        Assert.assertNotNull(floors);
        Assert.assertFalse(floors.isEmpty());
        for (Floor floor : floors) {
            Assert.assertEquals(BL_ID, floor.getBuildingId());
        }
    }
    
    /**
     * Sets the floor data source for this test.
     * 
     * @param floorDataSource the floor data source for this test
     */
    public final void setFloorDataSource(final FloorDataSource floorDataSource) {
        this.floorDataSource = floorDataSource;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    protected final String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "floorDatasource.xml" };
    }
    
}
