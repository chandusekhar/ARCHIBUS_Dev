package com.archibus.app.common.finanal.metrics.base;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Generic metric provider used to query values from trend metric.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 20.1
 *
 */
public class QueryValueFromTrendMetrics implements MetricProvider {

    /**
     * Constant.
     */
    private static final String SPAC_VACANCY_VARIANCE_CNG_AN = "spac_Vacancy_Variance_cng_an";

    /**
     * Constant.
     */
    private static final int ONE_HUNDRED = 100;

    /**
     * List with asset types.
     */
    private List<String> assetTypes;

    /**
     * Financial metric object.
     */
    private FinancialMetric metric;

    /**
     * Trend metric name.
     */
    private String trendMetricName;

    /**
     * Error message.
     */
    private String errorMessage;

    /** {@inheritDoc} */

    @Override
    public Map<Date, Double> getValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        // used when is required to return metric values
        return null;
    }

    /** {@inheritDoc} */

    @Override
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        this.errorMessage = "";
        final AssetType assetType = financialParameter.getAssetType();
        final String assetId = financialParameter.getAssetId();

        final DataSource trendValueDataSource =
                DataSourceFactory.createDataSourceForTable(Constants.AFM_METRIC_TREND_VALUES);
        trendValueDataSource.addRestriction(Restrictions.and(
            Restrictions.eq(Constants.AFM_METRIC_TREND_VALUES, "collect_group_by",
                assetType.getAssetFieldName()),
            Restrictions.eq(Constants.AFM_METRIC_TREND_VALUES, "collect_by_value", assetId)));
        trendValueDataSource.addRestriction(Restrictions.or(
            Restrictions.isNull(Constants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_ERR_MSG),
            Restrictions.ne(Constants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_ERR_MSG,
                DbConstants.VALUE_EXAMPLE)));
        trendValueDataSource.addRestriction(
            Restrictions.lte(Constants.AFM_METRIC_TREND_VALUES, Constants.METRIC_DATE, dateTo));
        trendValueDataSource.addSort(Constants.AFM_METRIC_TREND_VALUES, Constants.METRIC_DATE,
            DataSource.SORT_DESC);

        final DataRecord record = trendValueDataSource.getRecord();
        double metricValue = 0.0;
        if (record != null) {
            metricValue = getMetricValue(this.metric, record);
        }
        MetricProviderUtils.saveToFinancialSummary(financialParameter, dateFrom,
            this.metric.getResultField(), metricValue);
    }

    /** {@inheritDoc} */

    @Override
    public void setMetric(final FinancialMetric metric) {
        this.metric = metric;
    }

    /** {@inheritDoc} */

    @Override
    public boolean isApplicableForAssetType(final AssetType assetType) {
        return this.assetTypes.contains(assetType.toString());
    }

    /** {@inheritDoc} */

    @Override
    public boolean isApplicableForAllAssetTypes() {
        return StringUtil.isNullOrEmpty(this.assetTypes);
    }

    /** {@inheritDoc} */

    @Override
    public String getAssetTypeRestriction() {
        return MetricProviderUtils.getAssetTypeRestrictionForTable(Constants.FINANAL_PARAMS,
            this.assetTypes);
    }

    /**
     * Getter for the assetTypes property.
     *
     * @see assetTypes
     * @return the assetTypes property.
     */
    public List<String> getAssetTypes() {
        return this.assetTypes;
    }

    /**
     * Setter for the assetTypes property.
     *
     * @see assetTypes
     * @param assetTypes the assetTypes to set
     */

    public void setAssetTypes(final List<String> assetTypes) {
        this.assetTypes = assetTypes;
    }

    /**
     * Getter for the trendMetricName property.
     *
     * @see trendMetricName
     * @return the trendMetricName property.
     */
    public String getTrendMetricName() {
        return this.trendMetricName;
    }

    /**
     * Setter for the trendMetricName property.
     *
     * @see trendMetricName
     * @param trendMetricName the trendMetricName to set
     */

    public void setTrendMetricName(final String trendMetricName) {
        this.trendMetricName = trendMetricName;
    }

    /** {@inheritDoc} */

    @Override
    public String getErrorMessage() {
        return this.errorMessage;
    }

    /**
     * Get metric value.
     *
     * @param financialMetric financial metric
     * @param record trend value record
     * @return double
     */
    private double getMetricValue(final FinancialMetric financialMetric, final DataRecord record) {
        double metricValue = 0.0;
        if (SPAC_VACANCY_VARIANCE_CNG_AN.equals(financialMetric.getName())) {
            final double currentMonthValue =
                    record.getDouble("afm_metric_trend_values.metric_value");
            final double previousMonthValue =
                    record.getDouble("afm_metric_trend_values.metric_value_last");
            if (previousMonthValue == 0.0) {
                metricValue = 0.0;
            } else {
                metricValue = Double.valueOf(
                    ONE_HUNDRED * (currentMonthValue - previousMonthValue) / previousMonthValue);
            }
        } else {
            metricValue = record
                .getDouble(Constants.AFM_METRIC_TREND_VALUES + Constants.DOT + "metric_value");
        }
        metricValue = MetricProviderUtils.round(metricValue, financialMetric.getMetricDecimals());
        return metricValue;
    }
}
