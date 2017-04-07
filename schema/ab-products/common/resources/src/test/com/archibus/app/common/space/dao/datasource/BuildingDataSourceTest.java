package com.archibus.app.common.space.dao.datasource;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.common.space.domain.Building;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataRecord;

/**
 * Test class for BuildingDataSource.
 * 
 * @author Yorik Gerlo
 */
public class BuildingDataSourceTest extends DataSourceTestBase {
    
    /** Building ID used for testing. */
    private static final String BL_ID = "HQ";
    
    /** Site ID used for testing. */
    private static final String SITE_ID = "MARKET";
    
    /** The building data source being tested. */
    private BuildingDataSource buildingDataSource;
    
    /**
     * Test getting buildings.
     */
    public void testGetBuildings() {
        final List<DataRecord> records = this.buildingDataSource.getRecords();
        Assert.assertNotNull(records);
        
        final List<Building> buildings = this.buildingDataSource.find(null);
        Assert.assertNotNull(buildings);
        
        final Building building = this.buildingDataSource.get(BL_ID);
        Assert.assertNotNull(building);
        Assert.assertEquals(BL_ID, building.getBuildingId());
        Assert.assertEquals(SITE_ID, building.getSiteId());
    }
    
    /**
     * Sets the building data source for this test.
     * 
     * @param buildingDataSource the building data source for this test
     */
    public final void setBuildingDataSource(final BuildingDataSource buildingDataSource) {
        this.buildingDataSource = buildingDataSource;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    protected final String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "buildingDatasource.xml" };
    }
    
}
