package com.archibus.app.common.space.dao.datasource;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.common.space.domain.Site;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataRecord;

/**
 * Test for SiteDataSource.
 * 
 * @author Yorik Gerlo
 */
public class SiteDataSourceTest extends DataSourceTestBase {
    
    /** The site data source being tested. */
    private SiteDataSource siteDataSource;
    
    /**
     * Test getting the list of existing sites.
     */
    public void testGetSites() {
        final List<DataRecord> records = this.siteDataSource.getRecords();
        Assert.assertNotNull(records);
        Assert.assertFalse(records.isEmpty());
        
        final List<Site> sites = this.siteDataSource.find(null);
        Assert.assertNotNull(sites);
        Assert.assertFalse(sites.isEmpty());
        
        Assert.assertEquals(records.size(), sites.size());
    }
    
    /**
     * Sets the site data source for this test.
     * 
     * @param siteDataSource the site data source for this test
     */
    public final void setSiteDataSource(final SiteDataSource siteDataSource) {
        this.siteDataSource = siteDataSource;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    protected final String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "siteDatasource.xml" };
    }
    
}
