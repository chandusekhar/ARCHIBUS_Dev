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
 * Remaining Lease Commitment.
 * <p>
 *
 * <li>Metric Name: leas_Costs-RemainingCommitment_an
 * <li>Bean Name : leas_Costs_RemainingCommitment_an
 *
 * <p>
 *
 * Used by Financial Analysis service. Managed by Spring. Configured in
 * financialMetrics-definition.xml file.
 *
 * @author Ioan Draghici
 * @since 23.1
 */
public class RemainingLeaseCommitment implements MetricProvider {
    /**
     * Constant.
     */
    private static final String COSTCATEGORY_RENTALL =
            "AbRPLMStrategicFinancialAnalysis-CostCategory_RentAll";

    /**
     * List with asset types.
     */
    private List<String> assetTypes;

    /**
     * Financial metric object.
     */
    private FinancialMetric metric;

    /**
     * Error message.
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
                ActivityParameterUtils.getAllCostCategories(COSTCATEGORY_RENTALL);

        // final int fiscalYearStart =
        // DateUtils.getFiscalYearForDate(financialParameter.getDatePurchased());
        // final Date dateStart = DateUtils.getFiscalYearStartDate(fiscalYearStart);
        final Date dateStart = dateFrom;
        Date dateEnd = getEndDate(financialParameter.getAssetType(),
            financialParameter.getAssetId(), costCategories);
        if (dateEnd == null) {
            dateEnd = dateTo;
        }
        final int fiscalYearEnd = DateUtils.getFiscalYearForDate(dateEnd);
        dateEnd = DateUtils.getFiscalYearEndDate(fiscalYearEnd);
        final Map<String, String> cashFlowParams =
                getCashFlowParameters(financialParameter, dateStart, dateEnd, costCategories);
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
        parameters.put(DbConstants.DATE_END, DateTime.dateToString(
            (java.sql.Date) SqlUtils.normalizeValueForSql(dateTo), Constants.DATE_NEUTRAL_FORMAT));

        parameters.put("multipleValueSeparator", DbConstants.COMMA);
        return parameters;
    }

    /**
     * Get max end date from recurring and scheduled costs.
     *
     * @param assetType asset tyoe
     * @param assetId asset id
     * @param costCategories list with cost categories
     * @return Date
     */
    private Date getEndDate(final AssetType assetType, final String assetId,
            final List<String> costCategories) {
        // prepare cost restriction
        String sqlAssetAndCostCategory = "";
        for (final String costCategory : costCategories) {
            sqlAssetAndCostCategory +=
                    (sqlAssetAndCostCategory.length() > 0 ? Constants.OPERATOR_OR : "")
                            + "cost_cat_id LIKE '" + costCategory + "' ";

        }
        sqlAssetAndCostCategory = assetType.getAssetFieldName() + " = "
                + SqlUtils.formatValueForSql(assetId) + " AND ( " + sqlAssetAndCostCategory + " ) ";
        String sqlRestriction =
                "cost_tran_recur.date_end IS NOT NULL AND " + sqlAssetAndCostCategory;
        final Date maxDateEndRecurring = DataStatistics.getDate("cost_tran_recur",
            DbConstants.DATE_END, Constants.FORMULA_MAX, sqlRestriction);
        sqlRestriction = "cost_tran_sched.date_due IS NOT NULL AND " + sqlAssetAndCostCategory;
        final Date maxDateDueSched = DataStatistics.getDate(DbConstants.COST_TRAN_SCHED, "date_due",
            Constants.FORMULA_MAX, sqlRestriction);
        sqlRestriction = "cost_tran_sched.date_paid IS NOT NULL AND " + sqlAssetAndCostCategory;
        final Date maxDatePaidSched = DataStatistics.getDate(DbConstants.COST_TRAN_SCHED,
            "date_paid", Constants.FORMULA_MAX, sqlRestriction);
        Date dateEnd = maxDateDueSched;
        if (dateEnd != null && maxDatePaidSched != null && maxDatePaidSched.after(dateEnd)) {
            dateEnd = maxDatePaidSched;
        }
        if (dateEnd != null && maxDateEndRecurring != null && maxDateEndRecurring.after(dateEnd)) {
            dateEnd = maxDateEndRecurring;
        }
        return dateEnd;
    }
}
