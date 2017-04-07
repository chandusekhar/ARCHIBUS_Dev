package com.archibus.app.common.finanal.metrics.lifecycle;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.service.cost.CostProjection;
import com.archibus.utility.*;

/**
 * Net Present Value (NPV) metric. Calculates the result for each year of the Planned Life
 * (finanal_params.planned_life) starting from the Date Purchased (finanal_params.date_purchased)
 *
 * <li>Metric Name: cap_npv_lifetime_an, cap_irr_1year_an, cap_npv_3years_an
 * <li>Bean Name : cap_npv_lifetime_an
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
public class NPV implements MetricProvider {

    /**
     * Constant.
     */
    private static final String CAP_NPV_1YEAR_AN = "cap_npv_1year_an";

    /**
     * Constant.
     */
    private static final String CAP_NPV_3YEARS_AN = "cap_npv_3years_an";

    /**
     * Constant.
     */
    private static final String CAP_NPV_LIFETIME_AN = "cap_npv_lifetime_an";

    /**
     * Constant.
     */
    private static final String CAP_NPV_LIFECYCLE_AN = "cap_npv_lifecycle_an";

    /**
     * Constant.
     */
    private static final int ONE = 1;

    /**
     * Constant.
     */
    private static final int THREE = 3;

    /**
     * Activity parameter that specify cost categories metrics.
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
    public Map<Date, Double> getValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        // use when is required to return metric values
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
            final int fiscalYearStart =
                    DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
            final int calculationPeriod =
                    getCalculationPeriod(this.metric, financialParameter, dateFrom);

            final Date dateStart = DateUtils.getFiscalYearStartDate(fiscalYearStart);
            final Date dateEnd =
                    DateUtils.incrementDate(dateStart, Calendar.YEAR, calculationPeriod);
            final Map<String, String> cashFlowParams =
                    getCashFlowParameters(financialParameter, dateStart, dateEnd, costCategories);
            final CostProjection costProjection =
                    CashFlowProjection.getCashFlowProjection(cashFlowParams);
            final double[] costValues = CashFlowProjection
                .projectionToDoubleArray(financialParameter.getAssetId(), costProjection);

            if (CAP_NPV_LIFECYCLE_AN.equals(this.metric.getName())) {
                calculateFinancialSummaryLifecycleValues(costValues, financialParameter,
                    calculationPeriod);

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

        parameters.put("multipleValueSeparator", DbConstants.COMMA);
        return parameters;
    }

    /**
     * Returns calculation period.
     *
     * @param financialMetric financial metric object
     * @param financialParameter financial parameter
     * @param calculationDate current calculation date
     * @return integer
     */
    private int getCalculationPeriod(final FinancialMetric financialMetric,
            final FinancialAnalysisParameter financialParameter, final Date calculationDate) {
        int period = financialParameter.getPlannedLife();
        if (CAP_NPV_1YEAR_AN.equals(financialMetric.getName())) {
            period = ONE;
        } else if (CAP_NPV_3YEARS_AN.equals(financialMetric.getName())) {
            period = THREE;
        } else if (CAP_NPV_LIFECYCLE_AN.equals(financialMetric.getName())) {
            period = financialParameter.getPlannedLife();
            // final int yearDiff = DateUtils.getFieldFromDate(Calendar.YEAR, calculationDate)
            // - DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
            // if (financialParameter.getPlannedLife() > yearDiff) {
            // period = yearDiff;
            // }
        }
        return period;
    }

    /**
     * Calculate and financial summary lifecycle values.
     *
     * @param costValues cost values
     * @param financialParameter financial parameter
     * @param calculationPeriod calculation period, number of years from purchase rate to
     *            calcukation date
     */
    private void calculateFinancialSummaryLifecycleValues(final double[] costValues,
            final FinancialAnalysisParameter financialParameter, final int calculationPeriod) {
        final double discountRate = getDiscountRate();
        final int startYear = DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        final boolean isCostDefined = costValues != null && costValues.length > 0;
        for (int index = 0; isCostDefined && index < calculationPeriod; index++) {
            final int fiscalYear = startYear + index;
            final Date intervalStart = DateUtils.getFiscalYearStartDate(fiscalYear);
            double metricValue = 0.0;
            for (int counter = 0; counter < index + 1; counter++) {
                metricValue =
                        metricValue + costValues[index] / Math.pow(1 + discountRate, counter + 1);
            }
            metricValue = metricValue - financialParameter.getCostPurchase();
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
        final double discountRate = getDiscountRate();
        if (costValues != null && costValues.length > 0) {
            // apply discount rate
            for (int index = 0; index < costValues.length; index++) {
                metricValue =
                        metricValue + costValues[index] / Math.pow(1 + discountRate, index + 1);
            }
            metricValue = metricValue - financialParameter.getCostPurchase();
        }
        metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
        MetricProviderUtils.saveToFinancialSummary(financialParameter, calculationDate,
            this.metric.getResultField(), metricValue);
    }

    /**
     * Returns discount rate from activity parameter.
     *
     * @return double
     */
    private double getDiscountRate() {
        return ActivityParameterUtils.getDouble("AbRPLMStrategicFinancialAnalysis-DiscountRate");
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

        if ((CAP_NPV_LIFECYCLE_AN.equals(this.metric.getName())
                || CAP_NPV_LIFETIME_AN.equals(this.metric.getName()))
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
