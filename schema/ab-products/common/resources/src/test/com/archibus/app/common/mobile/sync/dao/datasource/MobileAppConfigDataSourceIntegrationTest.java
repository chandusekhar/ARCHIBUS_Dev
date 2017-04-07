package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.List;

import com.archibus.app.common.mobile.sync.AbstractIntegrationTest;
import com.archibus.app.common.mobile.sync.domain.MobileAppConfig;

/**
 * Integration tests for MobileAppConfigDataSource.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class MobileAppConfigDataSourceIntegrationTest extends AbstractIntegrationTest {
    
    private MobileAppConfigDataSource dataSource;
    
    /**
     * Getter for the dataSource property.
     * 
     * @see dataSource
     * @return the dataSource property.
     */
    public MobileAppConfigDataSource getDataSource() {
        return this.dataSource;
    }
    
    /**
     * Setter for the dataSource property.
     * 
     * @see dataSource
     * @param dataSource the dataSource to set
     */
    
    public void setDataSource(final MobileAppConfigDataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    /**
     * Test method for {@link MobileAppConfigDataSource#MobileAppConfigDataSource()} .
     */
    public final void testMobileAppConfigDataSource() {
        assertEquals("afm_mobile_apps", this.dataSource.getMainTableName());
    }
    
    /**
     * Test method for {@link MobileAppConfigDataSource#find()} .
     */
    public final void testFind() {
        // get all records
        final List<MobileAppConfig> appConfigs = this.dataSource.find(null);
        
        assertEquals(7, appConfigs.size());
        assertEquals("WORKSVC-MOB", appConfigs.get(0).getSecurityGroup());
        assertEquals("Workplace Services Portal", appConfigs.get(0).getTitle());
        assertEquals("WorkplacePortal/index.html", appConfigs.get(0).getUrl());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "mobileAppConfigDataSource.xml" };
    }
}
