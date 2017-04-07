package com.archibus.app.common.finanal.dao;

import java.util.*;

import com.archibus.app.common.finanal.metrics.MetricProvider;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.restriction.Restrictions.Restriction;

/**
 * DAO for financial analysis parameters. Mapped to finanal_params database table.
 *
 *
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <FinancialAnalysisParameter> type of the persistent object
 */
public interface IFinancialAnalysisParametersDao<FinancialAnalysisParameter>
        extends IDao<FinancialAnalysisParameter> {

    /**
     * Returns financial parameter for specified asset.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @return {@link com.archibus.app.common.finanal.domain.FinancialAnalysisParameter}
     */
    FinancialAnalysisParameter getFinancialParameterForAssetId(final String assetType,
            final String assetId);

    /**
     * Returns financial parameter for specified id.
     *
     * @param parameterId financial parameter id
     * @return {@link com.archibus.app.common.finanal.domain.FinancialAnalysisParameter}
     */
    FinancialAnalysisParameter getFinancialParameterById(final int parameterId);

    /**
     * Returns financial parameters for specified asset type.
     *
     * @param assetType asset type
     * @return List<{@link com.archibus.app.common.finanal.domain.FinancialAnalysisParameter}>
     */
    List<FinancialAnalysisParameter> getFinancialParameterByAssetType(final String assetType);

    /**
     * Returns financial parameters for specified asset types.
     *
     * @param assetTypes asset types
     * @return List<{@link com.archibus.app.common.finanal.domain.FinancialAnalysisParameter}>
     */
    List<FinancialAnalysisParameter> getFinancialParameterForAssetTypes(
            final List<String> assetTypes);

    /**
     * Returns financial parameters for restriction.
     *
     * @param restriction restriction
     * @return List<{@link com.archibus.app.common.finanal.domain.FinancialAnalysisParameter}>
     */
    List<FinancialAnalysisParameter> getFinancialParameters(final Restriction restriction);

    /**
     * Returns financial parameters for metric.
     *
     * @param metricProvider metric provider
     * @param collectStartDate start date for calculation period
     * @param collectEndDate end date for calculation period
     * @return List<{@link com.archibus.app.common.finanal.domain.FinancialAnalysisParameter}>
     */
    List<FinancialAnalysisParameter> getFinancialParametersForMetric(
            final MetricProvider metricProvider, final Date collectStartDate,
            final Date collectEndDate);
}
