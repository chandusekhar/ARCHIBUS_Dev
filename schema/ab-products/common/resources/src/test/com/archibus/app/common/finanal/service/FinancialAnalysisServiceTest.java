package com.archibus.app.common.finanal.service;

import java.util.*;

import com.archibus.app.common.finanal.dao.IFinancialMetricDao;
import com.archibus.app.common.finanal.dao.datasource.FinancialMetricDataSource;
import com.archibus.app.common.finanal.domain.FinancialMetric;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for Strategic Financial Analysis.
 *
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialAnalysisServiceTest extends DataSourceTestBase {

    /**
     * Test method for aggregateOpEx
     *
     */
    public void testAggregateOperatingCosts() {
        final String type = "all";
        final Calendar startFrom = Calendar.getInstance();
        startFrom.set(Calendar.YEAR, 2015);
        startFrom.set(Calendar.MONTH, 3);
        startFrom.set(Calendar.MONTH, 15);

        final Calendar endTo = Calendar.getInstance();
        endTo.set(Calendar.YEAR, 2015);
        endTo.set(Calendar.MONTH, 10);
        endTo.set(Calendar.MONTH, 16);

        final FinancialAnalysisService service = new FinancialAnalysisService();
        service.aggregateOperatingCosts(type, startFrom.getTime(), endTo.getTime());

    }

    public void testAssetTypeMethods() {

        assertEquals("bl", AssetType.BUILDING.getAssetTableName());
        assertEquals("bl_id", AssetType.BUILDING.getAssetFieldName());

    }

    /**
     * Test method for updateCapitalAndExpenseMatrix
     *
     */
    public void testUpdateCapitalAndExpenseMatrix() {
        final FinancialAnalysisScheduledJob scheduledJob = new FinancialAnalysisScheduledJob();
        scheduledJob.updateCapitalAndExpenseMatrix();

    }

    /**
     * Test method for update analysis metrics.
     *
     */
    public void testUpdateAnalysisMetric() {
        final String metricName = "fin_anlys_RealEstateOpEx_lifecycle_an";
        final IFinancialMetricDao<FinancialMetric> finMetricDao = new FinancialMetricDataSource();
        final FinancialMetric metric = finMetricDao.getByName(metricName);

        final AnalysisMetricsProcessor metricsProcessor = new AnalysisMetricsProcessor();
        final Date fiscalYearStart = DateUtils.getCurrentFiscalYearStartDate();
        final Date fiscalYearEnd = DateUtils.getCurrentFiscalYearEndDate();

        metricsProcessor.processMetric(metric, fiscalYearStart, fiscalYearEnd);

    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "financialMetricDataSource.xml" };
    }
}
