package com.archibus.app.common.finanal.metrics;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.AssetType;

/**
 * Interface for financial metric bean.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public interface MetricProvider {

    /**
     * Calculate and return metric value(s) for specified asset and time range.
     *
     * @param financialParameter financial analysis parameter
     * @param dateFrom time range date start
     * @param dateTo time range date end
     * @return Map<Date, Double>
     */
    Map<Date, Double> getValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo);

    /**
     * Calculate and update metric value(s) for specified asset and time range.
     *
     * @param financialParameter financial analysis parameter
     * @param dateFrom time range date start
     * @param dateTo time range date end
     */
    void calculateValues(final FinancialAnalysisParameter financialParameter, final Date dateFrom,
            final Date dateTo);

    /**
     * Setter for metric.
     *
     * @param metric financial metric.
     */
    void setMetric(final FinancialMetric metric);

    /**
     * Returns true if financial is applicable for specified asset type.
     *
     * @param assetType asset type
     * @return boolean
     */
    boolean isApplicableForAssetType(final AssetType assetType);

    /**
     * Returns true if financial is applicable for all asset types.
     *
     * @return boolean
     */
    boolean isApplicableForAllAssetTypes();

    /**
     * Returns an sql string with asset type restriction for finanal_pa.
     *
     * @return String
     */
    String getAssetTypeRestriction();

    /**
     * Returns error message string.
     * 
     * @return String
     */
    String getErrorMessage();

}
