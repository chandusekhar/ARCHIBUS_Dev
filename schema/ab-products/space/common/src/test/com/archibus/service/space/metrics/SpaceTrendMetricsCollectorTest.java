package com.archibus.service.space.metrics;

import com.archibus.datasource.DataSourceTestBase;

/**
 * <p>
 * Class for calculating Trend Metric values for Space Transaction application.<br>
 * 
 * <p>
 * Justification: constant name "BL" reflects table name.
 * 
 */
@SuppressWarnings({ "PMD.ShortVariable" })
public final class SpaceTrendMetricsCollectorTest extends DataSourceTestBase {
    
    /**
     * Test method collectMetrics of class SpaceTrendMetricsCollector.
     * 
     */
    public void testCollectMetrics() {
        
        // Call ForecastDatesGenerator to create forecast records in database.
        final SpaceTrendMetricsCollector spaceTrendMetricsCollecter =
                new SpaceTrendMetricsCollector("0", "1");
        
        spaceTrendMetricsCollecter.run();
        
    }
    
}