package com.archibus.app.common.finanal.metrics.base;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.service.cost.CostProjection;
import com.archibus.utility.*;

/**
 * Query from approved projects.
 * <p>
 *
 * <li>Metric Name: cap_CapitalProjects-Approved_an_fy, ops_ExpensedProjects-Approved_an_fy
 * <li>Bean Name : cap_CapitalProjects_Approved_an_fy, ops_ExpensedProjects_Approved_an_fy
 *
 * <p>
 *
 * Used by Financial Analysis service. Managed by Spring. Configured in
 * financialMetrics-definition.xml file.
 *
 * @author Ioan Draghici
 * @since 23.1
 */
public class ApprovedProjects implements MetricProvider {
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
        final List<String> costCategories =
                ActivityParameterUtils.getAllCostCategories(this.activityParameter);
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

        if (metricValue == 0.0) {
            String sqlRestriction =
                    "( project.status LIKE 'Approved%' OR project.status LIKE 'Issued%' OR project.status  LIKE 'Completed%' OR project.status LIKE 'Closed%') "
                            + " AND (project.date_start >= " + SqlUtils.formatValueForSql(dateFrom)
                            + " AND project.date_start <= " + SqlUtils.formatValueForSql(dateTo)
                            + " ) AND project."
                            + financialParameter.getAssetType().getAssetFieldName() + " = "
                            + SqlUtils.formatValueForSql(financialParameter.getAssetId());
            if (AssetType.PROPERTY.equals(financialParameter.getAssetType())) {
                sqlRestriction += " AND project.bl_id IS NULL ";
            }

            metricValue = DataStatistics.getDouble(DbConstants.PROJECT_TABLE, DbConstants.COST_BUDGET,
                Constants.FORMULA_SUM, sqlRestriction);
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
        parameters.put("cost_from", "010");
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

}
