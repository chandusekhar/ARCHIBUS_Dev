package com.archibus.app.common.finanal.metrics.base;

import java.util.*;

import com.archibus.app.common.depreciation.impl.DepreciationService;
import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.utility.StringUtil;

/**
 * Book Value. for the given asset calculate the depreciated value
 * <p>
 * Steps:
 * <li>1. Find cost purchase for this asset - finanal_params.cost_purchase
 * <li>2. Calculate the depreciation to date
 * <li>3. Subtract the depreciation from cost purchase
 *
 * <p>
 * Settings:
 * <li>Metric Name: fin_anlys_BookValue_an
 * <li>Bean Name : fin_anlys_BookValue_an
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
public class BookValue implements MetricProvider {

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
        double metricValue = 0.0;
        if (isValidFinancialParameter(financialParameter)) {
            // run on fiscal year
            final DepreciationService depreciationService = new DepreciationService();
            final double depreciationValue =
                    depreciationService.calculateDepreciationForFinParamAndPeriodAndTimeSpan(
                        financialParameter.getParameterId(), dateFrom, dateTo, "year");

            metricValue = financialParameter.getCostPurchase() - depreciationValue;
            metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
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

    /** {@inheritDoc} */

    @Override
    public String getErrorMessage() {
        return this.errorMessage;
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
        if (financialAnalysisParameter.getCostPurchase() == 0) {
            isValid = false;
            message += " ; Undefined Cost Purchase!";
        }

        if (StringUtil.isNullOrEmpty(financialAnalysisParameter.getPropertyType())) {
            isValid = false;
            message += "; Undefined property type!";
        }

        if (!isValid) {
            this.errorMessage = message;
        }
        return isValid;
    }
}
