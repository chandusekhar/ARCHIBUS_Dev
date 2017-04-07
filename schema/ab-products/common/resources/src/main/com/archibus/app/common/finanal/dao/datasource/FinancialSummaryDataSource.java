package com.archibus.app.common.finanal.dao.datasource;

import java.util.*;

import com.archibus.app.common.finanal.impl.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;

/**
 * Data source object for financial summary. Works with finanal_sum database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialSummaryDataSource extends DataSourceImpl {

    /**
     * Constant : table name.
     */
    private static final String TABLE_NAME = "finanal_sum";

    /**
     * Data source object for financial summary.
     */
    private final DataSource dataSource;

    /**
     * Default FinancialSummaryDataSource constructor. Initialize data source object.
     */
    public FinancialSummaryDataSource() {
        super();
        this.dataSource = DataSourceFactory.createDataSourceForTable(TABLE_NAME);
    }

    /**
     * Returns metric value for specified asset and fiscal year.
     *
     * @param assetType asset type
     * @param assetId asset code
     * @param fiscalYear fiscal year
     * @param fieldName field name
     * @return double
     */
    public double getValueForAssetAndYear(final AssetType assetType, final String assetId,
            final int fiscalYear, final String fieldName) {
        final Restriction restriction = Restrictions.and(
            Restrictions.eq(TABLE_NAME, Constants.ASSET_TYPE, assetType.toString()),
            Restrictions.eq(TABLE_NAME, Constants.FISCAL_YEAR, fiscalYear),
            Restrictions.eq(TABLE_NAME, assetType.getAssetFieldName(), assetId));
        final DataRecord record = getRecordForRestriction(restriction, false);
        double fieldValue = 0.0;
        if (record != null) {
            fieldValue = record.getDouble(TABLE_NAME + Constants.DOT + fieldName);
        }
        return fieldValue;

    }

    /**
     * Returns financial summary records for restriction.
     *
     * @param restriction restriction
     * @return List<DataRecord>
     */
    public List<DataRecord> getRecordsForRestriction(final Restriction restriction) {
        this.dataSource.clearRestrictions();
        if (restriction != null) {
            this.dataSource.addRestriction(restriction);
        }
        this.dataSource.addSort(TABLE_NAME, Constants.AUTO_NUMBER, DataSource.SORT_DESC);
        return this.dataSource.getRecords();
    }

    /**
     * Returns financial summary record for restriction or null if record is not found.
     *
     * @param restriction restriction
     * @param isSampleData if is sample data or not
     * @return DataRecord
     */
    public DataRecord getRecordForRestriction(final Restriction restriction,
            final boolean isSampleData) {
        this.dataSource.clearRestrictions();
        this.dataSource.addRestriction(restriction);
        if (isSampleData) {
            this.dataSource.addRestriction(Restrictions.eq(TABLE_NAME, DbConstants.COLLECT_ERR_MSG,
                DbConstants.VALUE_EXAMPLE));
        } else {
            this.dataSource.addRestriction(Restrictions.or(
                Restrictions.ne(TABLE_NAME, DbConstants.COLLECT_ERR_MSG, DbConstants.VALUE_EXAMPLE),
                Restrictions.isNull(TABLE_NAME, DbConstants.COLLECT_ERR_MSG)));
        }
        return this.dataSource.getRecord();
    }

    /**
     * Save summary record for asset and fiscal year.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param fiscalYear fiscal year
     * @param values records values Map<field_name, field_value>
     */
    public void saveValueForAssetAndYear(final AssetType assetType, final String assetId,
            final int fiscalYear, final Map<String, Object> values) {
        this.dataSource.clearRestrictions();
        final Restriction restriction = Restrictions.and(
            Restrictions.eq(TABLE_NAME, Constants.ASSET_TYPE, assetType.toString()),
            Restrictions.eq(TABLE_NAME, Constants.FISCAL_YEAR, fiscalYear),
            Restrictions.eq(TABLE_NAME, assetType.getAssetFieldName(), assetId));
        DataRecord record = getRecordForRestriction(restriction, false);

        if (record == null) {
            record = createNewRecordForAssetAndYear(assetType, assetId, fiscalYear);
        }

        final Iterator<String> itFields = values.keySet().iterator();
        while (itFields.hasNext()) {
            final String fieldName = itFields.next();
            final boolean isUpdatableField = !Constants.AUTO_NUMBER.equals(fieldName);
            if (isUpdatableField) {
                record.setValue(TABLE_NAME + Constants.DOT + fieldName, values.get(fieldName));
            }
        }

        this.dataSource.saveRecord(record);
    }

    /**
     * Create new record for asset and fiscal year.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param fiscalYear fiscal year
     * @return {@link DataRecord}
     */
    public DataRecord createNewRecordForAssetAndYear(final AssetType assetType,
            final String assetId, final int fiscalYear) {
        this.dataSource.clearRestrictions();
        final DataRecord record = this.dataSource.createNewRecord();
        record.setValue(TABLE_NAME + Constants.DOT + Constants.ASSET_TYPE, assetType.toString());
        record.setValue(TABLE_NAME + Constants.DOT + Constants.FISCAL_YEAR, fiscalYear);
        record.setValue(TABLE_NAME + Constants.DOT + assetType.getAssetFieldName(), assetId);

        return record;
    }

    /**
     * Calculate value specified by sql formula for asset and fiscal year.
     *
     * @param assetType asset type
     * @param assetId asset id
     * @param fiscalYear fiscal year
     * @param formulaSql sql formula
     * @return double
     */
    public double getSummaryValueForFormula(final AssetType assetType, final String assetId,
            final int fiscalYear, final String formulaSql) {
        this.dataSource.clearRestrictions();

        if (this.dataSource.findVirtualField(TABLE_NAME + ".vf_metric_value") == null) {
            final VirtualFieldDef calculatedField =
                    new VirtualFieldDef(TABLE_NAME, "vf_metric_value", DataSource.DATA_TYPE_NUMBER);
            final Map<String, String> sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put("generic", formulaSql);
            calculatedField.addSqlExpressions(sqlExpressions);
            this.dataSource.addCalculatedField(calculatedField);
        }

        this.dataSource.addRestriction(Restrictions.and(
            Restrictions.eq(TABLE_NAME, Constants.ASSET_TYPE, assetType.toString()),
            Restrictions.eq(TABLE_NAME, Constants.FISCAL_YEAR, fiscalYear),
            Restrictions.eq(TABLE_NAME, assetType.getAssetFieldName(), assetId)));
        final DataRecord record = this.dataSource.getRecord();
        double summValue = Double.NaN;
        if (record != null) {
            summValue = record.getDouble("finanal_sum.vf_metric_value");
        }

        return summValue;
    }
}
