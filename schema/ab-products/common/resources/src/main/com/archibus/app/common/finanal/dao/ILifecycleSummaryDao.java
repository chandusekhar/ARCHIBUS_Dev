package com.archibus.app.common.finanal.dao;

import java.util.*;

import com.archibus.app.common.finanal.impl.AssetType;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions.Restriction;

/**
 * DAO for financial analysis life-cycle summary. Mapped to finanal_sum_life database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <LifecycleSummary> type of the persistent object
 */
public interface ILifecycleSummaryDao<LifecycleSummary> extends IDao<LifecycleSummary> {

    /**
     * Returns metric value for specified asset and fiscal year.
     *
     * @param assetType asset type
     * @param assetId asset code
     * @param metricName metric name
     * @param fiscalYear fiscal year
     * @param fieldName field name
     * @return double
     */
    double getValueForAssetAndYear(final AssetType assetType, final String assetId,
            final String metricName, final int fiscalYear, final String fieldName);

    /**
     * Save summary record for asset and fiscal year.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param metricName metric name
     * @param fiscalYear fiscal year
     * @param values records values Map<field_name, field_value>
     */
    void saveValueForAssetAndYear(final AssetType assetType, final String assetId,
            final String metricName, final int fiscalYear, final Map<String, Object> values);

    /**
     * Returns financial summary records for restriction.
     *
     * @param restriction restriction
     * @return List<DataRecord>
     */
    List<DataRecord> getRecordsForRestriction(final Restriction restriction);

    /**
     * Returns financial summary record for restriction or null if record is not found.
     *
     * @param restriction restriction
     * @param isSampleData if is sample data or not
     * @return DataRecord
     */
    DataRecord getRecordForRestriction(final Restriction restriction, final boolean isSampleData);
}
