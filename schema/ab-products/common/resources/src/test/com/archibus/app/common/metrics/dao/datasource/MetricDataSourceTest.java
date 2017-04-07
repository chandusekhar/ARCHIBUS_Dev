package com.archibus.app.common.metrics.dao.datasource;

import java.util.List;

import com.archibus.app.common.metrics.DbConstants;
import com.archibus.app.common.metrics.dao.IMetricDao;
import com.archibus.app.common.metrics.domain.Metric;
import com.archibus.datasource.DataSourceTestBase;

/**
 *
 * Test for MetricDataSource.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public class MetricDataSourceTest extends DataSourceTestBase {

    /**
     * The number of active metrics in the canonic database.
     */
    private static final int EXPECTED_METRICS = 128;

    /**
     * Test for getActiveMetrics method.
     */
    public void testGetActiveMetrics() {
        final IMetricDao<Metric> metricDao =
                new MetricDataSource<Metric>("metric", DbConstants.AFM_METRIC_DEFINITIONS);
        final List<Metric> activeMetrics = metricDao.getActiveMetrics();

        assertEquals("Expected five metrics", EXPECTED_METRICS, activeMetrics.size());

        final Metric secondMetric = activeMetrics.get(1);
        assertNotNull("Missing numeric format", secondMetric.getNumericFormat());
        assertNotNull("Missing display format", secondMetric.getDisplayFormat());
        assertNotNull("Missing decimals", secondMetric.getDecimals());

        assertEquals("Invalid display format", "{0}", secondMetric.getDisplayFormat());
        assertEquals("Invalid report trend dir", 0, secondMetric.getReportTrendDir());
    }

    /**
     * Test get active metrics with parameter.
     */
    public void testGetActiveMetricsForSampleData() {
        final IMetricDao<Metric> metricDao =
                new MetricDataSource<Metric>("metric", DbConstants.AFM_METRIC_DEFINITIONS);
        final String metricName = "ehs_Costs-EmergencyAndDisasterPlanning_perRentableArea";
        final List<Metric> activeMetrics = metricDao.getActiveMetrics(metricName);
        assertEquals(3, activeMetrics.size());

    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "metricDataSource.xml" };
    }
}
