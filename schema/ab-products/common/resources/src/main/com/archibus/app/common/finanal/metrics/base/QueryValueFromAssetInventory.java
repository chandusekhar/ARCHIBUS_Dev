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
 * Generic metric value provider. Used to copy field value from inventory table to financial summary
 * table.
 *
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

public class QueryValueFromAssetInventory implements MetricProvider {
    /**
     * List with asset types.
     */
    private List<String> assetTypes;

    /**
     * Financial metric object.
     */
    private FinancialMetric metric;

    /**
     * Field name.
     */
    private String tableName;

    /**
     * Field name.
     */
    private String fieldName;

    /**
     * Field names by asset type.
     */
    private Map<String, String> fieldsByAssetType;

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

    /** {@inheritDoc} */

    @Override
    public void calculateValues(final FinancialAnalysisParameter financialParameter,
            final Date dateFrom, final Date dateTo) {
        this.errorMessage = "";
        final AssetType assetType = financialParameter.getAssetType();
        final String assetId = financialParameter.getAssetId();

        final String collectFromTable = this.getTableForAssetType(assetType);
        final String collectFromField = this.getFieldForAssetType(assetType);

        final DataSource assetDataSource =
                DataSourceFactory.createDataSourceForFields(collectFromTable, new String[] {
                        financialParameter.getAssetType().getAssetFieldName(), collectFromField });
        assetDataSource.addRestriction(
            Restrictions.eq(collectFromTable, assetType.getAssetFieldName(), assetId));
        final DataRecord record = assetDataSource.getRecord();
        Object metricValue = record.getValue(collectFromTable + Constants.DOT + collectFromField);
        // different fields definition generate error
        if ("occ_occupants".equals(this.metric.getResultField())) {
            // source is double and destination is integer
            final Integer tempValue = ((Double) metricValue).intValue();
            metricValue = tempValue;
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

    /**
     * Getter for the tableName property.
     *
     * @see tableName
     * @return the tableName property.
     */
    public String getTableName() {
        return this.tableName;
    }

    /**
     * Setter for the tableName property.
     *
     * @see tableName
     * @param tableName the tableName to set
     */

    public void setTableName(final String tableName) {
        this.tableName = tableName;
    }

    /**
     * Getter for the fieldName property.
     *
     * @see fieldName
     * @return the fieldName property.
     */
    public String getFieldName() {
        return this.fieldName;
    }

    /**
     * Setter for the fieldName property.
     *
     * @see fieldName
     * @param fieldName the fieldName to set
     */

    public void setFieldName(final String fieldName) {
        this.fieldName = fieldName;
    }

    /**
     * Getter for the fieldsByAssetType property.
     *
     * @see fieldsByAssetType
     * @return the fieldsByAssetType property.
     */
    public Map<String, String> getFieldsByAssetType() {
        return this.fieldsByAssetType;
    }

    /**
     * Setter for the fieldsByAssetType property.
     *
     * @see fieldsByAssetType
     * @param fieldsByAssetType the fieldsByAssetType to set
     */

    public void setFieldsByAssetType(final Map<String, String> fieldsByAssetType) {
        this.fieldsByAssetType = fieldsByAssetType;
    }

    /** {@inheritDoc} */

    @Override
    public String getErrorMessage() {
        return this.errorMessage;
    }

    /**
     * Returns field name for asset type.
     *
     * @param assetType asset type
     * @return String
     */
    private String getFieldForAssetType(final AssetType assetType) {
        String result = "";
        if (StringUtil.notNullOrEmpty(this.fieldsByAssetType)) {
            final String field = this.fieldsByAssetType.get(assetType.toString());
            result = field.substring(field.indexOf(Constants.DOT) + 1);
        } else {
            result = this.fieldName;
        }
        return result;
    }

    /**
     * Returns field name for asset type.
     *
     * @param assetType asset type
     * @return String
     */
    private String getTableForAssetType(final AssetType assetType) {
        String result = "";
        if (StringUtil.notNullOrEmpty(this.fieldsByAssetType)) {
            final String field = this.fieldsByAssetType.get(assetType.toString());
            result = field.substring(0, field.indexOf(Constants.DOT));
        } else {
            result = this.tableName;
        }
        return result;
    }

}
