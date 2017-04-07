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
 * Summarize cost per one year using cash flow projection.
 * <p>
 *
 * <li>Metric Name: leas_Costs-Rent_an_fy
 * <li>Bean Name : leas_Costs_Rent_an_fy
 *
 * <p>
 *
 * Used by Financial Analysis service. Managed by Spring. Configured in
 * financialMetrics-definition.xml file.
 *
 * @author Ioan Draghici
 * @since 23.1
 */

public class SummarizeCostsPerYear implements MetricProvider {

    /**
     * Map with activity parameter for asset type.
     */
    private Map<String, String> activityParameterByAssetType;

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
     * Include recurring , scheduled or actual cost.
     */
    private String includeCostFrom;

    /**
     * Calculation type.
     */
    private String calculationType;

    /**
     * Error message string.
     */
    private String errorMessage;

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
        this.errorMessage = "";
        final String activityParameterId = getActivityParameter(financialParameter.getAssetType());
        final List<String> costCategories =
                ActivityParameterUtils.getAllCostCategories(activityParameterId);
        final Map<String, String> cashFlowParams =
                getCashFlowParameters(financialParameter, dateFrom, dateTo, costCategories);
        final CostProjection costProjection =
                CashFlowProjection.getCashFlowProjection(cashFlowParams);
        final double[] costValues = CashFlowProjection
            .projectionToDoubleArray(financialParameter.getAssetId(), costProjection);
        double metricValue = 0.0;
        if (costValues != null && costValues.length > 0) {
            for (final double costValue : costValues) {
                metricValue = metricValue + costValue;
            }
        }

        metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
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

    /**
     * Getter for the includeCostFrom property.
     *
     * @see includeCostFrom
     * @return the includeCostFrom property.
     */
    public String getIncludeCostFrom() {
        return this.includeCostFrom;
    }

    /**
     * Setter for the includeCostFrom property.
     *
     * @see includeCostFrom
     * @param includeCostFrom the includeCostFrom to set
     */

    public void setIncludeCostFrom(final String includeCostFrom) {
        this.includeCostFrom = includeCostFrom;
    }

    /**
     * Getter for the calculationType property.
     *
     * @see calculationType
     * @return the calculationType property.
     */
    public String getCalculationType() {
        return this.calculationType;
    }

    /**
     * Setter for the calculationType property.
     *
     * @see calculationType
     * @param calculationType the calculationType to set
     */

    public void setCalculationType(final String calculationType) {
        this.calculationType = calculationType;
    }

    /**
     * Getter for the activityParameterByAssetType property.
     *
     * @see activityParameterByAssetType
     * @return the activityParameterByAssetType property.
     */
    public Map<String, String> getActivityParameterByAssetType() {
        return this.activityParameterByAssetType;
    }

    /**
     * Setter for the activityParameterByAssetType property.
     *
     * @see activityParameterByAssetType
     * @param activityParameterByAssetType the activityParameterByAssetType to set
     */

    public void setActivityParameterByAssetType(
            final Map<String, String> activityParameterByAssetType) {
        this.activityParameterByAssetType = activityParameterByAssetType;
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
        if (includeCategories.length() > 0) {
            includeCategories = includeCategories.substring(0,
                includeCategories.lastIndexOf(DbConstants.COMMA));
        }

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
        parameters.put("cost_type_of", this.calculationType);
        parameters.put("cost_from", this.includeCostFrom);
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
     * Returns activity parameter for asset type.
     *
     * @param assetType asset type
     * @return String
     */
    private String getActivityParameter(final AssetType assetType) {
        String result = "";
        if (StringUtil.notNullOrEmpty(this.activityParameterByAssetType)) {
            result = this.activityParameterByAssetType.get(assetType.toString());
        } else {
            result = this.activityParameter;
        }
        return result;
    }
}
