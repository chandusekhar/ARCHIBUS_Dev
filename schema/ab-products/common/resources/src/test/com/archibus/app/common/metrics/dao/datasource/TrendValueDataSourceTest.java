package com.archibus.app.common.metrics.dao.datasource;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test for TrendValueDataSource.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class TrendValueDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test for getValue method.
     * 
     */
    public void testGetValue() {
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "trendValueDataSource.xml" };
    }
}
