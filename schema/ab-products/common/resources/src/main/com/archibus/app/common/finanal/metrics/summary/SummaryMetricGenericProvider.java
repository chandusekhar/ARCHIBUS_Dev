package com.archibus.app.common.finanal.metrics.summary;

import java.util.*;

import com.archibus.app.common.finanal.dao.datasource.FinancialSummaryDataSource;
import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.SqlUtils;
import com.archibus.service.Period;
import com.archibus.utility.StringUtil;

/**
 * Generic summary metric data provider. Calculate sum of metric values for metrics defined in
 * activity parameter id
 *
 * <p>
 *
 * Used by Financial Analysis service. Managed by Spring. Configured in
 * financialMetrics-definition.xml file.
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */

public class SummaryMetricGenericProvider implements MetricProvider {
    /**
     * Activity parameter that specify related metrics.
     */
    private String activityParameter;

    /**
     * List with asset types.
     */
    private List<String> assetTypes;

    /**
     * Financial metric object.
     */
    private FinancialMetric metric;

    /**
     * Error message string.
     */
    private String errorMessage = "";

    /** {@inheritDoc} */

    @Override
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {

        if (Constants.ANALYSIS_CALC_ORDER_0 == this.metric.getCalculationOrder()
                && isValidFinancialParameter(financialParameter)) {
            calculateFinancialSummaryLifecycleValues(financialParameter, dateFrom);
        } else if (Constants.ANALYSIS_CALC_ORDER_2 == this.metric.getCalculationOrder()) {
            calculateFinancialSummaryValues(financialParameter, dateFrom, dateTo);
        }
    }

    /** {@inheritDoc} */

    @Override
    public Map<Date, Double> getValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        // used to return calculated values if necessary
        return null;
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

    /**
     * Calculate financial summary values.
     *
     * @param financialParameter financial parameter
     * @param dateFrom start date
     * @param dateTo end date
     *
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification Case 2.2 Bulk Update; Statements with UPDATE ..WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void calculateFinancialSummaryValues(
            final FinancialAnalysisParameter financialParameter, final Date dateFrom,
            final Date dateTo) {
        // update metric values using sql updates
        final String resultField = this.metric.getResultField();
        final String sqlSumFormula = getSumFormulaSql();

        final AssetType assetType = financialParameter.getAssetType();
        final String assetId = financialParameter.getAssetId();

        final String sqlUpdate = "UPDATE finanal_sum SET finanal_sum." + resultField
                + Constants.OPERATOR_EQUAL + sqlSumFormula + " WHERE " + Constants.NO_RESTRICTION
                + " AND finanal_sum.asset_type = "
                + SqlUtils.formatValueForSql(assetType.toString()) + " AND finanal_sum."
                + assetType.getAssetFieldName() + Constants.OPERATOR_EQUAL
                + SqlUtils.formatValueForSql(assetId);

        final Period recurringPeriod = new Period(Constants.YEAR_PATTERN, dateFrom, dateTo);
        MetricProviderUtils.executeSql(Constants.FINANAL_SUM, sqlUpdate, recurringPeriod, dateFrom,
            dateTo);
    }

    /**
     * Calculate financial summary lifecycle values.
     *
     * @param financialParameter financial parameter
     * @param calculationDate calculation date
     */
    private void calculateFinancialSummaryLifecycleValues(
            final FinancialAnalysisParameter financialParameter, final Date calculationDate) {
        final int startYear = DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        final int period = financialParameter.getPlannedLife();
        // final int yearDiff = DateUtils.getFieldFromDate(Calendar.YEAR, calculationDate)
        // - DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        // if (financialParameter.getPlannedLife() > yearDiff) {
        // period = yearDiff;
        // }
        final String sqlSumFormula = getSumFormulaSql();
        final FinancialSummaryDataSource financialSummaryDataSource =
                new FinancialSummaryDataSource();

        for (int index = 0; index < period; index++) {
            final int fiscalYear = startYear + index;
            double metricValue = financialSummaryDataSource.getSummaryValueForFormula(
                financialParameter.getAssetType(), financialParameter.getAssetId(), fiscalYear,
                sqlSumFormula);

            if (Double.isNaN(metricValue)) {
                metricValue = 0.0;
            } else {
                metricValue =
                        MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
            }
            MetricProviderUtils.saveToFinancialSummaryLifecycle(financialParameter,
                DateUtils.getFiscalYearStartDate(fiscalYear), this.metric.getName(), metricValue);
        }

    }

    /**
     * Validate financial parameter settings.
     *
     * @param financialAnalysisParameter financial parameter
     * @return boolean
     */
    private boolean isValidFinancialParameter(
            final FinancialAnalysisParameter financialAnalysisParameter) {
        String message = "Metric Name: " + this.metric.getName() + "; Asset Type: "
                + financialAnalysisParameter.getAssetType().toString() + "; Asset Id: "
                + financialAnalysisParameter.getAssetId();
        boolean isValid = true;
        if (StringUtil.isNullOrEmpty(financialAnalysisParameter.getDatePurchased())) {
            isValid = false;
            message += " ; Undefined Purchase Date !";
        }

        if (financialAnalysisParameter.getPlannedLife() == 0) {
            isValid = false;
            message += "; Undefined planned life!";
        }

        if (!isValid) {
            this.errorMessage = message;
        }
        return isValid;
    }

    /**
     * Returns the sql for sum formula.
     *
     * @return String
     */
    private String getSumFormulaSql() {
        final List<String> metrics =
                ActivityParameterUtils.getValuesFromActivityParameter(this.activityParameter);
        final List<String> calculationFields = MetricProviderUtils.getCalculationFields(metrics);
        return MetricProviderUtils.getSumFormulaForFields(Constants.FINANAL_SUM, calculationFields);
    }

}
