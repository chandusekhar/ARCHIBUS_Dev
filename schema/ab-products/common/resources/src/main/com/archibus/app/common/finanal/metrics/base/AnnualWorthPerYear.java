package com.archibus.app.common.finanal.metrics.base;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.service.cost.CostProjection;
import com.archibus.utility.*;

/**
 * Annual Worth per year.
 * <p>
 *
 * <li>Metric Name: cap_AnnualWorth_an_fy
 * <li>Bean Name : cap_AnnualWorth_an_fy
 *
 * <p>
 *
 * Used by Financial Analysis service. Managed by Spring. Configured in
 * financialMetrics-definition.xml file.
 *
 * @author Ioan Draghici
 * @since 23.1
 */
public class AnnualWorthPerYear implements MetricProvider {

    /**
     * Activity parameter.
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
        // used when must return metric values
        return null;
    }

    /** {@inheritDoc} */

    @Override
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        if (isValidFinancialParameter(financialParameter)) {
            final List<String> activityParameters =
                    ActivityParameterUtils.getValuesFromActivityParameter(this.activityParameter,
                        Constants.RPLM_SFA_ACTIVITY_ID);
            final List<String> costCategories =
                    ActivityParameterUtils.getActivityParameterValues(activityParameters);
            final int fiscalYearStart =
                    DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());

            final double metricValue =
                    getMetricValue(financialParameter, fiscalYearStart, costCategories);

            MetricProviderUtils.saveToFinancialSummary(financialParameter, dateFrom,
                this.metric.getResultField(), metricValue);
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

    /** {@inheritDoc} */

    @Override
    public String getErrorMessage() {
        return this.errorMessage;
    }

    /**
     * Calculate metric value.
     *
     * @param financialParameter financial parameter
     * @param fiscalYearStart fiscal year start
     * @param costCategories cost categories
     * @return double
     */
    private double getMetricValue(final FinancialAnalysisParameter financialParameter,
            final int fiscalYearStart, final List<String> costCategories) {
        double metricValue = 0.0;
        final int plannedLife = financialParameter.getPlannedLife();
        if (plannedLife > 0) {
            final Date dateStart = DateUtils.getFiscalYearStartDate(fiscalYearStart);
            final Date dateEnd = DateUtils.incrementDate(
                DateUtils.incrementDate(dateStart, Calendar.YEAR, plannedLife), Calendar.DATE, -1);

            final Map<String, String> cashFlowParams =
                    getCashFlowParameters(financialParameter, dateStart, dateEnd, costCategories);
            final CostProjection costProjection =
                    CashFlowProjection.getCashFlowProjection(cashFlowParams);
            final double[] costValues = CashFlowProjection
                .projectionToDoubleArray(financialParameter.getAssetId(), costProjection);

            for (final double costValue : costValues) {
                metricValue = metricValue + costValue;
            }
            metricValue = metricValue / plannedLife;
            metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
        }
        return metricValue;
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

        if (!isValid) {
            this.errorMessage = message;
        }
        return isValid;
    }
}
