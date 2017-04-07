package com.archibus.app.common.finanal.metrics.summary;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.SqlUtils;
import com.archibus.service.Period;
import com.archibus.utility.StringUtil;

/**
 * Market Minus Book Value. For current asset subtract the fin_anlys_MarketBook_an from the
 * fin_anlys_MarketValue_an.
 * <li>Metric Name: fin_anlys_MarketMinusBookValue_an
 * <li>Bean Name : fin_anlys_MarketMinusBookValue_an
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
public class MarketMinusBookValue implements MetricProvider {

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
        // update metric values using sql updates
        final String resultField = this.metric.getResultField();
        final FinancialMetric marketBookMetric =
                MetricProviderUtils.getMetricByName("fin_anlys_BookValue_an");
        final FinancialMetric marketValueMetric =
                MetricProviderUtils.getMetricByName("fin_anlys_MarketValue_an");
        final AssetType assetType = financialParameter.getAssetType();
        final String assetId = financialParameter.getAssetId();

        final String sqlUpdate = "UPDATE finanal_sum SET finanal_sum." + resultField
                + Constants.OPERATOR_EQUAL + marketValueMetric.getResultField()
                + Constants.OPERATOR_MINUS + marketBookMetric.getResultField() + " WHERE "
                + Constants.NO_RESTRICTION + " AND finanal_sum.asset_type = "
                + SqlUtils.formatValueForSql(assetType.toString()) + " AND finanal_sum."
                + assetType.getAssetFieldName() + Constants.OPERATOR_EQUAL
                + SqlUtils.formatValueForSql(assetId);

        final Period recurringPeriod = new Period(Constants.YEAR_PATTERN, dateFrom, dateTo);
        MetricProviderUtils.executeSql(Constants.FINANAL_SUM, sqlUpdate, recurringPeriod, dateFrom,
            dateTo);
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
}
