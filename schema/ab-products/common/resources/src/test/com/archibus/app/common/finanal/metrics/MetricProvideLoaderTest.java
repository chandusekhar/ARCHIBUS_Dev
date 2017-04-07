package com.archibus.app.common.finanal.metrics;

import com.archibus.app.common.finanal.dao.IFinancialMetricDao;
import com.archibus.app.common.finanal.dao.datasource.FinancialMetricDataSource;
import com.archibus.app.common.finanal.domain.FinancialMetric;
import com.archibus.app.common.finanal.impl.AssetType;
import com.archibus.app.common.finanal.metrics.lifecycle.IRR;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for metric provider loader.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class MetricProvideLoaderTest extends DataSourceTestBase {

    /**
     * Test method for loadMetricProvider
     */
    public void loadMetricProviderTest() {
        final String metricName = "fin_tc_occ_an_fy";
        final IFinancialMetricDao<FinancialMetric> metricDao = new FinancialMetricDataSource();
        final FinancialMetric metric = metricDao.getByName(metricName);
        final MetricProvider provider = MetricProviderLoader.loadMetricProvider(metric);

        provider.getAssetTypeRestriction();

        assertEquals(true, provider.isApplicableForAssetType(AssetType.BUILDING));
        assertEquals(true, provider.isApplicableForAssetType(AssetType.PROPERTY));
        assertEquals("AbRPLMStrategicFinancialAnalysis-UpdateTCO-OccupancyCosts",
            provider.getAssetTypeRestriction());

    }

    public void testMetricCalculation() {
        new IRR();
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "financialMetrics.xml" };
    }

}
