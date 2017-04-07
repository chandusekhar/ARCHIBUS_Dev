package com.archibus.app.common.finanal.metrics.base;

import java.util.*;

import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.finanal.metrics.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Vacant Area. Copy bl.area_usable field value.
 *
 * <li>Metric Name: spac_VacantArea_an
 * <li>Bean Name : spac_VacantArea_an
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
public class BuildingVacantArea implements MetricProvider {
    /**
     * Constant.
     */
    private static final String RM_TABLE = "rm";

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
        // used when is required to return metric values
        return null;
    }

    /**
     * {@inheritDoc}
     *
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification Case 1.1 Statements with SELECT WHERE EXISTS ... pattern.
     */

    @Override
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        this.errorMessage = "";
        final AssetType assetType = financialParameter.getAssetType();
        final String assetId = financialParameter.getAssetId();

        final DataSourceGroupingImpl roomDataSource = new DataSourceGroupingImpl();
        roomDataSource.addTable(RM_TABLE, DataSource.ROLE_MAIN);
        roomDataSource.addField(RM_TABLE, assetType.getAssetFieldName());
        roomDataSource.addGroupByField(RM_TABLE, assetType.getAssetFieldName(), null);
        roomDataSource.addCalculatedField(RM_TABLE, "vf_vacant_area", DataSource.DATA_TYPE_NUMBER,
            DataSourceGroupingImpl.FORMULA_SUM, "rm.area");
        roomDataSource.addRestriction(Restrictions.sql(
            "cap_em > 0 AND rm_cat IS NOT NULL AND rm_cat in (SELECT rm_cat from rmcat WHERE occupiable = 1) "
                    + "AND NOT EXISTS (SELECT * FROM em  WHERE  em.bl_id = rm.bl_id  AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id)"));
        roomDataSource
            .addRestriction(Restrictions.eq(RM_TABLE, assetType.getAssetFieldName(), assetId));

        final DataRecord record = roomDataSource.getRecord();
        if (record != null) {
            double metricValue = record.getDouble("rm.vf_vacant_area");
            metricValue = MetricProviderUtils.round(metricValue, this.metric.getMetricDecimals());
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

    /** {@inheritDoc} */

    @Override
    public String getErrorMessage() {
        return this.errorMessage;
    }
}
