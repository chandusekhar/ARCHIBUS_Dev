package com.archibus.app.common.finanal.dao.datasource;

import java.util.*;

import com.archibus.app.common.finanal.dao.*;
import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for financial analysis parameters data source.
 * <p>
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialAnalysisParametersDataSourceTest extends DataSourceTestBase {

    public void testGetFinancialParametersForMetric() {
        final String metricName = "cap_irr_lifecycle_an";
        final IFinancialMetricDao<FinancialMetric> financialMetricDAO =
                new FinancialMetricDataSource();
        final FinancialMetric financialMetric = financialMetricDAO.getByName(metricName);
        final MetricProvider financialMetricProvider =
                MetricProviderLoader.loadMetricProvider(financialMetric);

        final IFinancialAnalysisParametersDao<FinancialAnalysisParameter> financialAnalysisParametersDao =
                new FinancialAnalysisParametersDataSource();
        final Calendar calendarStart = Calendar.getInstance();
        calendarStart.set(2015, Calendar.JULY, 1);

        final Calendar calendarEnd = Calendar.getInstance();
        calendarEnd.set(2016, Calendar.JUNE, 30);

        final List<FinancialAnalysisParameter> financialAnalysisParameters =
                financialAnalysisParametersDao.getFinancialParametersForMetric(
                    financialMetricProvider, calendarStart.getTime(), calendarEnd.getTime());

        assertEquals(true, !financialAnalysisParameters.isEmpty());

    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "financialMetricDataSource.xml" };
    }
}
