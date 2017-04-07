package com.archibus.app.reservation.dao.datasource;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.reservation.domain.ResourceStandard;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.StringUtil;

/**
 * Test for ResourceStandardDataSource.
 */
public class ResourceStandardDataSourceTest extends DataSourceTestBase {
    
    /**
     * The data source under test.
     */
    private ResourceStandardDataSource resourceStandardDataSource;
    
    /**
     * Test getting all arrange types.
     */
    public final void testGetFixedResourceStandards() {
        final List<ResourceStandard> objects =
                this.resourceStandardDataSource.getFixedResourceStandards();
        Assert.assertNotNull(objects);
        Assert.assertFalse(objects.isEmpty());
        for (final ResourceStandard standard : objects) {
            Assert.assertTrue(StringUtil.notNullOrEmpty(standard.getId()));
            Assert.assertTrue(StringUtil.notNullOrEmpty(standard.getName()));
        }
    }
    
    /**
     * Sets the resource standards data source.
     * 
     * @param resourceStandardDataSource the new resource standards data source
     */
    public final void setResourceStandardDataSource(
            final ResourceStandardDataSource resourceStandardDataSource) {
        this.resourceStandardDataSource = resourceStandardDataSource;
    }
    
    /**
     * {@inheritDoc}
     * Configuration file locations for ResourceStandardDataSource test.
     */
    @Override
    protected final String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "reservation-datasources.xml" };
    }
    
}
