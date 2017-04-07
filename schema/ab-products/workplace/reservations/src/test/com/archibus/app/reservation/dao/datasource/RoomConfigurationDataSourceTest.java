package com.archibus.app.reservation.dao.datasource;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.reservation.domain.*;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataRecord;

/**
 * Test for Room Configuration Data Source.
 * 
 * @author Yorik Gerlo
 * @since 21.3
 */
public class RoomConfigurationDataSourceTest extends DataSourceTestBase {
    
    /** The bl id. */
    protected static final String BL_ID = "HQ";
    /** The fl id. */
    protected static final String FL_ID = "17";
    /** The rm id. */
    protected static final String RM_ID = "101";
    /** The config id. */
    protected static final String CONFIG_ID = "A";
    
    /** The number of configurations defined for the given room. */
    private static final int CONFIG_COUNT = 6;
    
    /**
     * The data source under test.
     */
    private RoomConfigurationDataSource roomConfigurationDataSource;
    
    /**
     * Test getting all room configurations.
     */
    public final void testGetAll() {
        final List<DataRecord> records = this.roomConfigurationDataSource.getRecords();
        final List<RoomConfiguration> objects = this.roomConfigurationDataSource.find(null);
        
        Assert.assertEquals(records.size(), objects.size());
    }
    
    /**
     * Test getting room configurations by primary key.
     */
    public final void testGetPkey() {
        final RoomConfiguration pkeys = new RoomConfiguration();
        pkeys.setBuildingId(BL_ID);
        pkeys.setFloorId(FL_ID);
        pkeys.setRoomId(RM_ID);
        pkeys.setConfigId(CONFIG_ID);
        
        List<RoomConfiguration> configurations = this.roomConfigurationDataSource.get(pkeys);
        Assert.assertNotNull(configurations);
        Assert.assertEquals(1, configurations.size());
        final RoomConfiguration configuration = configurations.get(0);
        Assert.assertNotNull(configuration.getExcludedConfigs());
        Assert.assertTrue(configuration.getExcludedConfigs().contains("'AB'"));
        Assert.assertTrue(configuration.getExcludedConfigs().contains("'ABC'"));
        Assert.assertFalse(configuration.getExcludedConfigs().contains("'BC'"));
        
        pkeys.setConfigId(null);
        configurations = this.roomConfigurationDataSource.get(pkeys);
        Assert.assertEquals(CONFIG_COUNT, configurations.size());
        
        for (final RoomConfiguration config : configurations) {
            Assert.assertEquals(BL_ID, config.getBuildingId());
            Assert.assertEquals(FL_ID, config.getFloorId());
            Assert.assertEquals(RM_ID, config.getRoomId());
        }
    }
    
    /**
     * Sets the room configuration data source.
     * 
     * @param roomConfigurationDataSource the new room configuration data source
     */
    public final void setRoomConfigurationDataSource(final RoomConfigurationDataSource roomConfigurationDataSource) {
        this.roomConfigurationDataSource = roomConfigurationDataSource;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    protected final String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "reservation-datasources.xml" };
    }
    
}
