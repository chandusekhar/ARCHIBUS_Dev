package com.archibus.app.common.finanal.impl;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.finanal.dao.IFinancialAnalysisParametersDao;
import com.archibus.app.common.finanal.dao.datasource.FinancialAnalysisParametersDataSource;
import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.SqlUtils;
import com.archibus.utility.StringUtil;

/**
 * Helper class for Analysis Metrics job. Perform update analysis metric process. Collect metrics
 * value and save the value to corresponding table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class AnalysisMetricsProcessor {
    /**
     * Logger for this class.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Start the update process for financial metric.
     *
     * @param metric financial metric
     * @param collectStartDate collect period start date.
     * @param collectEndDate collect period end date.
     */
    public void processMetric(final FinancialMetric metric, final Date collectStartDate,
            final Date collectEndDate) {
        // load the provider
        final MetricProvider metricProvider = MetricProviderLoader.loadMetricProvider(metric);
        // load financial parameters
        final IFinancialAnalysisParametersDao<FinancialAnalysisParameter> financialParametersDao =
                new FinancialAnalysisParametersDataSource();
        final List<FinancialAnalysisParameter> financialParameters = financialParametersDao
            .getFinancialParametersForMetric(metricProvider, collectStartDate, collectEndDate);
        final Iterator<FinancialAnalysisParameter> itFinancialParameter =
                financialParameters.iterator();
        while (itFinancialParameter.hasNext()) {
            final FinancialAnalysisParameter financialParameter = itFinancialParameter.next();
            // check financial parameter definition
            financialParameter.checkParameterDefinition();
            metricProvider.calculateValues(financialParameter, collectStartDate, collectEndDate);
            final String errorMessage = metricProvider.getErrorMessage();
            if (StringUtil.notNullOrEmpty(errorMessage)) {
                this.logger.info(errorMessage);
            }
        }
    }

    /**
     * Delete sample data from finanal_sum and finanal_sum_life.
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2.3. Statements with DELETE FROM ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteSampleData() {
        String deleteSqlStatement = "DELETE FROM finanal_sum WHERE collect_err_msg = 'example'";
        SqlUtils.executeUpdate(DbConstants.FINANAL_SUM_TABLE, deleteSqlStatement);
        deleteSqlStatement = "DELETE FROM finanal_sum_life WHERE collect_err_msg = 'example'";
        SqlUtils.executeUpdate(DbConstants.FINANAL_SUM_LIFE_TABLE, deleteSqlStatement);
    }

}
