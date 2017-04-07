package com.archibus.app.common.finanal.dao.datasource;

import java.util.List;

import com.archibus.app.common.finanal.dao.IFinancialMetricDao;
import com.archibus.app.common.finanal.domain.FinancialMetric;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for financial metric data source.
 * <p>
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialMetricDataSourceTest extends DataSourceTestBase {

    public void testGetActiveMetrics() {
        final IFinancialMetricDao<FinancialMetric> financialMetricDAO =
                new FinancialMetricDataSource();
        final List<FinancialMetric> activeMetrics = financialMetricDAO.getActiveMetrics();

        assertEquals(true, !activeMetrics.isEmpty());
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "financialMetricDataSource.xml" };
    }
}
