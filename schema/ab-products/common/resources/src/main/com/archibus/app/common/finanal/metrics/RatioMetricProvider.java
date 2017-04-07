package com.archibus.app.common.finanal.metrics;

import java.util.*;

import com.archibus.app.common.finanal.dao.datasource.FinancialSummaryDataSource;
import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.service.Period;
import com.archibus.utility.StringUtil;

/**
 * Metric provider for ratio metrics.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class RatioMetricProvider implements MetricProvider {

    /**
     * Activity parameter that specify related metrics.
     */
    private String activityParameter;

    /**
     * List with asset types.
     */
    private List<String> assetTypes;

    /**
     * Current metric that is processed.
     */
    private FinancialMetric metric;

    /**
     * Error message.
     */
    private String errorMessage;

    /**
     * {@inheritDoc}
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification Case 2.2 Bulk Update; Statements with UPDATE ..WHERE pattern.
     */

    @Override
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        this.errorMessage = "";
        // calculate in database

        // load dependend metrics
        final FinancialMetric denominator =
                MetricProviderUtils.getMetricByName(this.metric.getDenominator());
        final FinancialMetric numerator =
                MetricProviderUtils.getMetricByName(this.metric.getNumerator());

        final String resultField = this.metric.getResultField();
        final String denominatorField = denominator.getResultField();
        final String numeratorField = numerator.getResultField();

        String sqlUpdate = "UPDATE finanal_sum SET finanal_sum." + resultField + " = finanal_sum."
                + numeratorField + " / ${sql.replaceZero('finanal_sum." + denominatorField
                + "')} WHERE 1 = 1 ";

        final AssetType assetType = financialParameter.getAssetType();
        final String assetId = financialParameter.getAssetId();
        if (StringUtil.notNullOrEmpty(assetType)) {
            sqlUpdate += " AND finanal_sum.asset_type = "
                    + SqlUtils.formatValueForSql(assetType.toString());
        }

        if (StringUtil.notNullOrEmpty(assetId)) {
            sqlUpdate += " AND finanal_sum." + assetType.getAssetFieldName() + " = "
                    + SqlUtils.formatValueForSql(assetId);
        }

        final Period recurringPeriod = new Period(Constants.YEAR_PATTERN, dateFrom, dateTo);

        MetricProviderUtils.executeSql(DbConstants.FINANAL_SUM_TABLE, sqlUpdate, recurringPeriod,
            dateFrom, dateTo);

    }

    /** {@inheritDoc} */

    @Override
    public Map<Date, Double> getValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        final Map<Date, Double> metricValues = new HashMap<Date, Double>();
        final FinancialSummaryDataSource financialSummaryDataSource =
                new FinancialSummaryDataSource();
        // load dependend metrics
        final FinancialMetric denominator =
                MetricProviderUtils.getMetricByName(this.metric.getDenominator());
        final FinancialMetric numerator =
                MetricProviderUtils.getMetricByName(this.metric.getNumerator());
        final AssetType assetType = financialParameter.getAssetType();
        final String assetId = financialParameter.getAssetId();

        final Period recurringPeriod = new Period(Constants.YEAR_PATTERN, dateFrom, dateTo);

        recurringPeriod.iterate2(dateFrom, dateTo, new Period.Callback() {
            @Override
            public boolean call(final Date currentDate) {
                final Calendar calendar = Calendar.getInstance();
                calendar.setTime(currentDate);
                final int currentYear = calendar.get(Calendar.YEAR);

                final Restriction restriction = Restrictions.and(
                    Restrictions.eq(DbConstants.FINANAL_SUM_TABLE, Constants.ASSET_TYPE,
                        assetType.toString()),
                    Restrictions.eq(DbConstants.FINANAL_SUM_TABLE, Constants.FISCAL_YEAR,
                        currentYear),
                    Restrictions.eq(DbConstants.FINANAL_SUM_TABLE, assetType.getAssetFieldName(),
                        assetId));

                final DataRecord financialSummaryRecord =
                        financialSummaryDataSource.getRecordForRestriction(restriction, false);
                final double denominatorValue = financialSummaryRecord.getDouble(
                    DbConstants.FINANAL_SUM_TABLE + Constants.DOT + denominator.getResultField());
                final double numeratorValue = financialSummaryRecord.getDouble(
                    DbConstants.FINANAL_SUM_TABLE + Constants.DOT + numerator.getResultField());
                double ratioValue = 0.0;
                if (denominatorValue != 0) {
                    ratioValue = numeratorValue / denominatorValue;
                    // save the record directly from here
                    financialSummaryRecord.setValue(DbConstants.FINANAL_SUM_TABLE + Constants.DOT
                            + RatioMetricProvider.this.metric.getResultField(),
                        ratioValue);
                    financialSummaryDataSource.saveRecord(financialSummaryRecord);
                    metricValues.put(currentDate, ratioValue);
                }
                return true;
            }
        });

        return metricValues;
    }

    /** {@inheritDoc} */

    @Override
    public void setMetric(final FinancialMetric metric) {
        this.metric = metric;
    }

    /** {@inheritDoc} */

    @Override
    public boolean isApplicableForAssetType(final AssetType assetType) {
        // Until decide how to implement is applicable for all asset types.
        return true;
    }

    /** {@inheritDoc} */

    @Override
    public boolean isApplicableForAllAssetTypes() {
        return StringUtil.isNullOrEmpty(this.assetTypes);
    }

    /** {@inheritDoc} */

    @Override
    public String getAssetTypeRestriction() {
        return Constants.NO_RESTRICTION;
    }

    /**
     * Getter for the activityParameter property.
     *
     * @see activityParameter
     * @return the activityParameter property.
     */
    public String getActivityParameter() {
        return this.activityParameter;
    }

    /**
     * Setter for the activityParameter property.
     *
     * @see activityParameter
     * @param activityParameter the activityParameter to set
     */

    public void setActivityParameter(final String activityParameter) {
        this.activityParameter = activityParameter;
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

    /** {@inheritDoc} */

    @Override
    public String getErrorMessage() {
        return this.errorMessage;
    }
}
