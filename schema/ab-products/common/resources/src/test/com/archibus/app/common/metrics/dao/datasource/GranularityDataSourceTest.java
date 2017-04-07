package com.archibus.app.common.metrics.dao.datasource;

import java.util.List;

import com.archibus.app.common.metrics.dao.IGranularityDao;
import com.archibus.app.common.metrics.domain.Granularity;
import com.archibus.datasource.DataSourceTestBase;

/**
 * 
 * Test for GranularityDataSource.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class GranularityDataSourceTest extends DataSourceTestBase {
    /**
     * Test for GetGranularities method. Require AreaLeasedToOwned metric
     * 
     */
    public void testGetGranularities() {
        final IGranularityDao granularityDataSource = new GranularityDataSource();
        final String metricCode = "AreaLeasedToOwned";
        
        final List<Granularity> granularities =
                granularityDataSource.getGranularitiesForMetric(metricCode);
        assertEquals(2, granularities.size());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "granularityDataSource.xml" };
    }
    
}
