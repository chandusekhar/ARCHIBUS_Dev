package com.archibus.app.common.finanal.dao.datasource;

import java.util.*;

import com.archibus.app.common.finanal.dao.ILifecycleSummaryDao;
import com.archibus.app.common.finanal.domain.LifecycleSummary;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * Financial analysis lifecycle summary data source object. Mapped to finanal_sum_life database
 * table.
 * <p>
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class LifecycleSummaryDataSource extends ObjectDataSourceImpl<LifecycleSummary>
        implements ILifecycleSummaryDao<LifecycleSummary> {
    /**
     * Constant.
     */
    private static final int FOUR = 4;

    /**
     * Constant.
     */
    private static final int THREE = 3;

    /**
     * Constant : table name.
     */
    private static final String TABLE_NAME = "finanal_sum_life";

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Fields common for all Cost DataSources are specified here.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "auto_number", "summaryId" },
            { "asset_type", "assetType" }, { "bl_id", "buildingCode" },
            { "ctry_id", "countryCode" }, { "eq_id", "equipmentCode" },
            { "fiscal_year", "fiscalYear" }, { "metric_name", "metricName" },
            { "pr_id", "propertyCode" }, { "project_id", "projectCode" }, { "site_id", "siteCode" },
            { Constants.VALUE, Constants.VALUE } };

    /**
     * {@link FinancialAnalysisParametersDataSource}.
     *
     */
    public LifecycleSummaryDataSource() {
        super("lifecycleSummary", TABLE_NAME);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /** {@inheritDoc} */

    @Override
    public double getValueForAssetAndYear(final AssetType assetType, final String assetId,
            final String metricName, final int fiscalYear, final String fieldName) {
        final Clause[] clauses = new Clause[FOUR];
        clauses[0] = Restrictions.eq(TABLE_NAME, Constants.ASSET_TYPE, assetType.toString());
        clauses[1] = Restrictions.eq(TABLE_NAME, Constants.FISCAL_YEAR, String.valueOf(fiscalYear));
        clauses[2] = Restrictions.eq(TABLE_NAME, assetType.getAssetFieldName(), assetId);
        clauses[THREE] = Restrictions.eq(TABLE_NAME, DbConstants.METRIC_NAME, metricName);
        final Restriction restriction = Restrictions.and(clauses);
        final DataRecord record = getRecordForRestriction(restriction, false);
        double fieldValue = 0.0;
        if (record != null) {
            fieldValue = record.getDouble(TABLE_NAME + Constants.DOT + fieldName);
        }
        return fieldValue;

    }

    /** {@inheritDoc} */

    @Override
    public void saveValueForAssetAndYear(final AssetType assetType, final String assetId,
            final String metricName, final int fiscalYear, final Map<String, Object> values) {
        final DataSource dataSource = this.createCopy();
        final Clause[] clauses = new Clause[FOUR];
        clauses[0] = Restrictions.eq(TABLE_NAME, Constants.ASSET_TYPE, assetType.toString());
        clauses[1] = Restrictions.eq(TABLE_NAME, Constants.FISCAL_YEAR, String.valueOf(fiscalYear));
        clauses[2] = Restrictions.eq(TABLE_NAME, assetType.getAssetFieldName(), assetId);
        clauses[THREE] = Restrictions.eq(TABLE_NAME, DbConstants.METRIC_NAME, metricName);
        final Restriction restriction = Restrictions.and(clauses);

        DataRecord record = getRecordForRestriction(restriction, false);

        if (record == null) {
            record = createNewRecordForAssetAndYear(assetType, assetId, metricName, fiscalYear);
        }

        final Iterator<String> itFields = values.keySet().iterator();
        while (itFields.hasNext()) {
            final String fieldName = itFields.next();
            final boolean isUpdatableField = !Constants.AUTO_NUMBER.equals(fieldName);
            if (isUpdatableField) {
                final Object fieldValue = values.get(fieldName);
                record.setValue(TABLE_NAME + Constants.DOT + fieldName, fieldValue);
            }
        }
        dataSource.saveRecord(record);
    }

    /** {@inheritDoc} */

    @Override
    public List<DataRecord> getRecordsForRestriction(final Restriction restriction) {
        final DataSource dataSource = this.createCopy();
        if (restriction != null) {
            dataSource.addRestriction(restriction);
        }
        dataSource.addSort(TABLE_NAME, Constants.AUTO_NUMBER, DataSource.SORT_DESC);
        return dataSource.getRecords();
    }

    /** {@inheritDoc} */

    @Override
    public DataRecord getRecordForRestriction(final Restriction restriction,
            final boolean isSampleData) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(restriction);
        if (isSampleData) {
            dataSource.addRestriction(Restrictions.eq(TABLE_NAME, DbConstants.COLLECT_ERR_MSG,
                DbConstants.VALUE_EXAMPLE));
        } else {
            dataSource.addRestriction(Restrictions.or(
                Restrictions.ne(TABLE_NAME, DbConstants.COLLECT_ERR_MSG, DbConstants.VALUE_EXAMPLE),
                Restrictions.isNull(TABLE_NAME, DbConstants.COLLECT_ERR_MSG)));
        }
        return dataSource.getRecord();
    }

    /**
     * Create new record for asset and fiscal year.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param metricName metric name
     * @param fiscalYear fiscal year
     * @return {@link DataRecord}
     */
    public DataRecord createNewRecordForAssetAndYear(final AssetType assetType,
            final String assetId, final String metricName, final int fiscalYear) {
        final DataSource dataSource = this.createCopy();
        final DataRecord record = dataSource.createNewRecord();
        record.setValue(TABLE_NAME + Constants.DOT + Constants.ASSET_TYPE, assetType.toString());
        record.setValue(TABLE_NAME + Constants.DOT + Constants.FISCAL_YEAR,
            String.valueOf(fiscalYear));
        record.setValue(TABLE_NAME + Constants.DOT + assetType.getAssetFieldName(), assetId);
        record.setValue(TABLE_NAME + Constants.DOT + DbConstants.METRIC_NAME, metricName);
        return record;
    }
}
