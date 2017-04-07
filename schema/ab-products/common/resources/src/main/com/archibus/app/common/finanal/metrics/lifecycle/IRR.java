package com.archibus.app.common.finanal.metrics.lifecycle;

import java.util.*;

import org.apache.poi.ss.formula.functions.Irr;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.service.cost.CostProjection;
import com.archibus.utility.*;

/**
 * Internal Rate Of Return (IRR) metric.
 *
 * <li>Metric Name: cap_irr_lifetime_an; cap_irr_3years_an
 * <li>Bean Name : cap_irr_lifetime_an
 * <li>Result field: finanal_sum.cap_irr_lifetime; finanal_sum.cap_irr_3years
 * <p>
 *
 *
 * Managed by Spring. Configured in financialMetrics-definition.xml file.
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class IRR implements MetricProvider {

    /**
     * Constant.
     */
    private static final String CAP_IRR_3YEARS_AN = "cap_irr_3years_an";

    /**
     * Constant.
     */
    private static final String CAP_IRR_LIFECYCLE_AN = "cap_irr_lifecycle_an";

    /**
     * Constant.
     */
    private static final String CAP_IRR_LIFETIME_AN = "cap_irr_lifetime_an";

    /**
     * Guess factor for irr function.
     */
    private static final double IRR_GUESS_FACTOR = 0.05;

    /**
     * Constant.
     */
    private static final int THREE = 3;

    /**
     * List with asset types.
     */
    private List<String> assetTypes;

    /**
     * Financial metric object.
     */
    private FinancialMetric metric;

    /**
     * Activity parameter that specify cost categories metrics.
     */
    private String activityParameter;

    /**
     * Error message string.
     */
    private String errorMessage = "";

    /** {@inheritDoc} */

    @Override
    public Map<Date, Double> getValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        // used if we need to return calculated values.
        return null;
    }

    /** {@inheritDoc} */

    @Override
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        this.errorMessage = "";
        if (isValidFinancialParameter(financialParameter)) {
            final List<String> activityParameters =
                    ActivityParameterUtils.getValuesFromActivityParameter(this.activityParameter,
                        Constants.RPLM_SFA_ACTIVITY_ID);
            final List<String> costCategories =
                    ActivityParameterUtils.getActivityParameterValues(activityParameters);
            final double[] costValues =
                    calculateCashFlowProjection(financialParameter, dateFrom, costCategories);

            if (CAP_IRR_LIFECYCLE_AN.equals(this.metric.getName())) {
                calculateFinancialSummaryLifecycleValues(costValues, financialParameter, dateFrom);
            } else {
                calculateFinancialSummaryValues(costValues, financialParameter, dateFrom);
            }
        }
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

    /** {@inheritDoc} */

    @Override
    public String getErrorMessage() {
        return this.errorMessage;
    }

    /**
     * Calculate cost projection.
     *
     * @param financialParameter financial parameter
     * @param calculationDate start date
     * @param costCategories include cost categories
     * @return double[]
     */
    private double[] calculateCashFlowProjection(
            final FinancialAnalysisParameter financialParameter, final Date calculationDate,
            final List<String> costCategories) {
        int fiscalYearStart = DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        int calculationPeriod = financialParameter.getPlannedLife();
        if (CAP_IRR_3YEARS_AN.equals(this.metric.getName())) {
            fiscalYearStart = DateUtils.getFiscalYearForDate(calculationDate);
            calculationPeriod = THREE;
        }
        final Date dateStart = DateUtils.getFiscalYearStartDate(fiscalYearStart);
        final Date dateEnd = DateUtils.incrementDate(dateStart, Calendar.YEAR, calculationPeriod);

        final Map<String, String> cashFlowParams =
                getCashFlowParameters(financialParameter, dateStart, dateEnd, costCategories);
        final CostProjection costProjection =
                CashFlowProjection.getCashFlowProjection(cashFlowParams);
        return CashFlowProjection.projectionToDoubleArray(financialParameter.getAssetId(),
            costProjection);
    }

    /**
     * Calculate and financial summary lifecycle values.
     *
     * @param costValues cost values
     * @param financialParameter financial parameter
     * @param calculationDate calculation date
     */
    private void calculateFinancialSummaryLifecycleValues(final double[] costValues,
            final FinancialAnalysisParameter financialParameter, final Date calculationDate) {
        final int startYear = DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        final int period = financialParameter.getPlannedLife();
        // final int yearDiff = DateUtils.getFieldFromDate(Calendar.YEAR, calculationDate)
        // - DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        // if (financialParameter.getPlannedLife() > yearDiff) {
        // period = yearDiff;
        // }
        final boolean isCostDefined = costValues != null && costValues.length > 0;
        if (isCostDefined) {
            costValues[0] = costValues[0] - financialParameter.getCostPurchase();
        }
        for (int index = 0; isCostDefined && index < period; index++) {
            final int fiscalYear = startYear + index;
            final Date intervalStart = DateUtils.getFiscalYearStartDate(fiscalYear);
            double metricValue = 0.0;
            double irrValue = 0.0;
            final double[] yearCostValues = new double[index + 1];
            for (int counter = 0; counter < index + 1; counter++) {
                yearCostValues[counter] = costValues[counter];
            }
            if (checkPaybackAndInvestment(yearCostValues)) {
                irrValue = Irr.irr(yearCostValues, IRR_GUESS_FACTOR);
            }
            if (!Double.isNaN(irrValue)) {
                metricValue = irrValue;
            }
            metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
            MetricProviderUtils.saveToFinancialSummaryLifecycle(financialParameter, intervalStart,
                this.metric.getName(), metricValue);
        }
    }

    /**
     * Calculate financial summary values.
     *
     * @param costValues cost values
     * @param financialParameter financial parameter
     * @param calculationDate start date
     */
    private void calculateFinancialSummaryValues(final double[] costValues,
            final FinancialAnalysisParameter financialParameter, final Date calculationDate) {
        double metricValue = 0.0;
        if (costValues != null && costValues.length > 0) {
            costValues[0] = costValues[0] - financialParameter.getCostPurchase();
            double irrValue = 0.0;
            if (checkPaybackAndInvestment(costValues)) {
                irrValue = Irr.irr(costValues, IRR_GUESS_FACTOR);
            }
            if (!Double.isNaN(irrValue)) {
                metricValue = irrValue;
            }
        }
        metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
        MetricProviderUtils.saveToFinancialSummary(financialParameter, calculationDate,
            this.metric.getResultField(), metricValue);
    }

    /**
     * Returns request parameters for cashflow.
     *
     * @param financialParameter financial parameter
     * @param dateFrom start date
     * @param dateTo end date
     * @param includeCostCategories list with cost categories
     * @return Map<String, String>
     */
    private Map<String, String> getCashFlowParameters(
            final FinancialAnalysisParameter financialParameter, final Date dateFrom,
            final Date dateTo, final List<String> includeCostCategories) {
        String includeCategories = "";
        final Iterator<String> itCostCategories = includeCostCategories.iterator();
        while (itCostCategories.hasNext()) {
            final String includeCategory = itCostCategories.next();
            includeCategories += includeCategory + DbConstants.COMMA;
        }

        includeCategories =
                includeCategories.substring(0, includeCategories.lastIndexOf(DbConstants.COMMA));

        final Map<String, String> parameters = new HashMap<String, String>();
        parameters.put("cost_assoc_with", financialParameter.getAssetType().getAssetTableName());
        parameters.put(financialParameter.getAssetType().getAssetFieldName(),
            financialParameter.getAssetId());
        parameters.put("isMcAndVatEnabled", Constants.FALSE);
        parameters.put("vat_cost_type", "total");
        parameters.put("exchange_rate", "Budget");
        parameters.put("is_budget_currency", Constants.TRUE);
        parameters.put("currency_code",
            ContextStore.get().getProject().getBudgetCurrency().getCode());
        parameters.put("cost_type_of", "NETINCOME");
        parameters.put("cost_from", "111");
        parameters.put("group_by_cost_categ", Constants.FALSE);
        parameters.put("include_cost_categ", includeCategories);
        parameters.put("exclude_cost_categ", "");

        parameters.put("is_fiscal_year", Constants.TRUE);
        parameters.put("period", "YEAR");

        parameters.put("date_start",
            DateTime.dateToString((java.sql.Date) SqlUtils.normalizeValueForSql(dateFrom),
                Constants.DATE_NEUTRAL_FORMAT));
        parameters.put("date_end", DateTime.dateToString(
            (java.sql.Date) SqlUtils.normalizeValueForSql(dateTo), Constants.DATE_NEUTRAL_FORMAT));

        parameters.put("multipleValueSeparator", ",");
        return parameters;
    }

    /**
     * Verify if at least one year that has a negative return (the investment) and one year with a
     * positive return (the payback).
     *
     * @param values cost values
     * @return boolean
     */
    private boolean checkPaybackAndInvestment(final double[] values) {
        boolean isPositive = false;
        boolean isNegative = false;
        for (final double value : values) {
            if (value > 0.0) {
                isPositive = true;
            }
            if (value < 0.0) {
                isNegative = true;
            }
        }
        return isPositive && isNegative;
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

        if (!CAP_IRR_3YEARS_AN.equals(this.metric.getName())
                && financialAnalysisParameter.getPlannedLife() == 0) {
            isValid = false;
            message += "; Undefined planned life!";
        }

        if (!isValid) {
            this.errorMessage = message;
        }
        return isValid;
    }
}
