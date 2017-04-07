package com.archibus.app.common.depreciation.service;

import java.util.Date;

import com.archibus.datasource.data.DataSet;

/**
 * Depreciation service interface. Provides methods for depreciation calculation. Implemented in
 * DepreciationService.java
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public interface IDepreciationService {

    /**
     * Calculate and update depreciation for all asset types and active depreciation report. Is
     * called from view and run as long running job.
     *
     */
    void updateDepreciation();

    /**
     * Calculate and update equipment depreciation. Defined to run the old depreciation job.
     */
    void updateEquipmentDepreciation();

    /**
     * Calculate and update furniture depreciation. Defined to run the old depreciation job.
     */
    void updateFurnitureDepreciation();

    /**
     * Calculate and update depreciation for asset type and active depreciation report. Is called
     * from view and run as long running job.
     *
     * @param assetType asset type (use database table name as asset type).
     */
    void updateDepreciationForAssetType(final String assetType);

    /**
     * Calculate and update depreciation for asset type and depreciation report. Is called from view
     * and run as long running job.
     *
     * @param assetType asset type (use database table name as asset type).
     * @param reportId depreciation report id
     */
    void updateDepreciationForAssetTypeAndReport(final String assetType, final String reportId);

    /**
     * Calculate and returns depreciation value for specified financial parameter on specified time
     * range. Calculate depreciation on yearly base.
     *
     * @param finParamId financial parameter id (auto number from finanal_params)
     * @param dateStart time range start date
     * @param dateEnd time range end date
     * @param timeSpan time span; values (year, month)
     * @return double
     */
    double calculateDepreciationForFinParamAndPeriodAndTimeSpan(final int finParamId,
            final Date dateStart, final Date dateEnd, final String timeSpan);

    /**
     * Calculate and returns depreciation for specified financial parameter on time range with
     * specified time span.
     *
     * @param finParamId financial parameter id (auto number from finanal_params)
     * @param dateStart time range start date
     * @param dateEnd time range end date
     * @param timeSpan time span; values (year, month)
     * @return DataSet
     */
    DataSet calculateDepreciationValuesForFinParamAndPeriodAndTimeSpan(final int finParamId,
            final Date dateStart, final Date dateEnd, final String timeSpan);
}
