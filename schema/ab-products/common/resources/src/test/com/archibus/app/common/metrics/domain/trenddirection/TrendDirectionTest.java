package com.archibus.app.common.metrics.domain.trenddirection;

import com.archibus.app.common.metrics.domain.Metric;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Test for trend direction classes.
 * <p>
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 */
public class TrendDirectionTest extends DataSourceTestBase {
    
    /**
     * Test limit.
     */
    private static final int LOW_CRITICAL = 10;
    
    /**
     * Test limit.
     */
    private static final int LOW_WARNING = 20;
    
    /**
     * Test limit.
     */
    private static final int HIGH_WARNING = 80;
    
    /**
     * Test limit.
     */
    private static final int HIGH_CRITICAL = 90;
    
    /**
     * Test value.
     */
    private static final double GREEN_VALUE = 50;
    
    /**
     * Test value.
     */
    private static final double HIGH_RED_VALUE = 90;
    
    /**
     * Test value.
     */
    private static final double HIGH_YELLOW_VALUE = 80;
    
    /**
     * Test value.
     */
    private static final double LOW_YELLOW_VALUE = 20;
    
    /**
     * Test value.
     */
    private static final double LOW_RED_VALUE = 10;
		
    /**
     * Test value.
     */
	private static final boolean IS_FOR_DRILLDOWN = true;
    
    /**
     * Test method.
     */
    public void testSmallerIsBetter() {
        final Metric metric = createTestMetric();
        metric.setReportTrendDir(0);
        
        assertEquals(StoplightColor.RED, metric.calculateStoplightColor(HIGH_RED_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.YELLOW, metric.calculateStoplightColor(HIGH_YELLOW_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.GREEN, metric.calculateStoplightColor(GREEN_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.GREEN, metric.calculateStoplightColor(LOW_YELLOW_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.GREEN, metric.calculateStoplightColor(LOW_RED_VALUE, IS_FOR_DRILLDOWN));
    }
    
    /**
     * Test method.
     */
    public void testLargerIsBetter() {
        final Metric metric = createTestMetric();
        metric.setReportTrendDir(1);
        
        assertEquals(StoplightColor.GREEN, metric.calculateStoplightColor(HIGH_RED_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.GREEN, metric.calculateStoplightColor(HIGH_YELLOW_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.GREEN, metric.calculateStoplightColor(GREEN_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.YELLOW, metric.calculateStoplightColor(LOW_YELLOW_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.RED, metric.calculateStoplightColor(LOW_RED_VALUE, IS_FOR_DRILLDOWN));
    }
    
    /**
     * Test method.
     */
    public void testOnTargetIsBetter() {
        final Metric metric = createTestMetric();
        metric.setReportTrendDir(2);
        
        assertEquals(StoplightColor.RED, metric.calculateStoplightColor(HIGH_RED_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.YELLOW, metric.calculateStoplightColor(HIGH_YELLOW_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.GREEN, metric.calculateStoplightColor(GREEN_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.YELLOW, metric.calculateStoplightColor(LOW_YELLOW_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.RED, metric.calculateStoplightColor(LOW_RED_VALUE, IS_FOR_DRILLDOWN));
    }
    
    /**
     * Test method.
     */
    public void testNoSignificance() {
        final Metric metric = createTestMetric();
        metric.setReportTrendDir(3);
        
        assertEquals(StoplightColor.BLACK, metric.calculateStoplightColor(HIGH_RED_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.BLACK, metric.calculateStoplightColor(HIGH_YELLOW_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.BLACK, metric.calculateStoplightColor(GREEN_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.BLACK, metric.calculateStoplightColor(LOW_YELLOW_VALUE, IS_FOR_DRILLDOWN));
        assertEquals(StoplightColor.BLACK, metric.calculateStoplightColor(LOW_RED_VALUE, IS_FOR_DRILLDOWN));
    }
    
    /**
     * Creates a test metric.
     * 
     * @return The metric.
     */
    private Metric createTestMetric() {
        final Metric metric = new Metric();
        
        metric.setReportLimitHighCritical(HIGH_CRITICAL);
        metric.setReportLimitHighWarning(HIGH_WARNING);
        metric.setReportLimitLowWarning(LOW_WARNING);
        metric.setReportLimitLowCritical(LOW_CRITICAL);
        
        return metric;
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "metricDataSource.xml" };
    }
}
