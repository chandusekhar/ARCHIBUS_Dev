package com.archibus.eventhandler.eam.dao.datasource;

import java.sql.Time;
import java.util.*;

import com.archibus.config.Project;
import com.archibus.core.event.data.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.eam.dao.IAssetTransactionDao;
import com.archibus.eventhandler.eam.datachangeevent.*;
import com.archibus.eventhandler.eam.domain.*;
import com.archibus.schema.*;
import com.archibus.utility.ListWrapper.Immutable;
import com.archibus.utility.*;

/**
 * Data source for asset transaction.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class AssetTransactionDataSource extends ObjectDataSourceImpl<AssetTransaction> implements
IAssetTransactionDao<AssetTransaction> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "auto_number", "transactionId" },
            { "trans_type", "transactionType" }, { "change_type", "actionType" },
            { "value_new", "newValue" }, { "value_old", "oldValue" }, { "mod_table", "tableName" },
            { "mod_field", "fieldName" }, { "asset_id", "assetId" }, { "user_name", "userName" },
        { "date_trans", "transactionDate" }, { "time_trans", "transactionTime" } };
    
    /**
     * Map with table field names and transaction types. Map<field_name, transaction_type>.
     */
    private Map<String, String> transactionFields;
    
    /**
     * Project, required to get table definition.
     */
    private Project.Immutable project;
    
    /**
     * Constructs AssetTransactionDataSource, mapped to <code>asset_trans</code> table, using
     * <code>assetTransaction</code> bean.
     *
     */
    public AssetTransactionDataSource() {
        super("assetTransaction", "asset_trans");
    }

    /**
     * Getter for the transactionFields property.
     *
     * @see transactionFields
     * @return the transactionFields property.
     */
    public Map<String, String> getTransactionFields() {
        return this.transactionFields;
    }
    
    /**
     * Setter for the transactionFields property.
     *
     * @see transactionFields
     * @param transactionFields the transactionFields to set
     */

    public void setTransactionFields(final Map<String, String> transactionFields) {
        this.transactionFields = transactionFields;
    }
    
    /**
     * Getter for the project property.
     *
     * @see project
     * @return the project property.
     */
    public Project.Immutable getProject() {
        return this.project;
    }
    
    /**
     * Setter for the project property.
     *
     * @see project
     * @param project the project to set
     */

    public void setProject(final Project.Immutable project) {
        this.project = project;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void logAssetTransactions(final RecordChangedEvent recordChangedEvent) {
        final DataRecord record = recordChangedEvent.getRecord();
        final ChangeType changeType = recordChangedEvent.getChangeType();
        final Immutable<ArchibusFieldDefBase.Immutable> primaryKeyFields =
                getPrimaryKeyForTable(recordChangedEvent.getTableName());
        
        final Map<String, Object> pKeys = getPrimaryKeyValues(primaryKeyFields, record);

        final boolean isInsertOrDelete =
                ChangeType.DELETE.equals(changeType) || ChangeType.INSERT.equals(changeType);
        final boolean isInsertOrUpdate =
                ChangeType.UPDATE.equals(changeType) || ChangeType.INSERT.equals(changeType);
        
        // when is insert or delete add ownership transaction for Pk field.
        if (isInsertOrDelete) {
            addOwnershipTransaction(recordChangedEvent, pKeys);
        }
        // when is insert or update add per field transaction
        if (isInsertOrUpdate) {
            addPerFieldTransactions(recordChangedEvent, pKeys);
        }

    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /**
     * Add ownership transaction when is insert or delete.
     *
     * @param recordChangedEvent record changed event
     * @param pKeys primary key values
     */
    private void addOwnershipTransaction(final RecordChangedEvent recordChangedEvent,
            final Map<String, Object> pKeys) {
        final String tableName = recordChangedEvent.getTableName();
        final String pkName = DataChangeEventHelper.getPrimaryKeyFieldName(tableName, pKeys);
        final Object pkValue = pKeys.get(pkName);
        addTransaction(recordChangedEvent, TransactionType.OWNERSHIP, pkValue, pkName, null, null);

    }

    /**
     * Add per field transactions for log fields.
     *
     * @param recordChangedEvent record changed event
     * @param pKeys primary key values
     */
    private void addPerFieldTransactions(final RecordChangedEvent recordChangedEvent,
            final Map<String, Object> pKeys) {
        final String tableName = recordChangedEvent.getTableName();
        final DataRecord record = recordChangedEvent.getRecord();
        final String pkName = DataChangeEventHelper.getPrimaryKeyFieldName(tableName, pKeys);
        final Object pkValue = pKeys.get(pkName);
        // read current record from database
        final DataRecord crtRecord = getCurrentRecord(tableName, pKeys);
        
        // iterate on fields
        final Iterator<String> itFields = this.transactionFields.keySet().iterator();
        while (itFields.hasNext()) {
            final String fullFieldName = itFields.next();
            final boolean hasField = record.valueExists(fullFieldName);
            Object oldValue = null;
            Object newValue = null;
            if (hasField) {
                newValue = record.getValue(fullFieldName);
            }
            if (hasField && StringUtil.notNullOrEmpty(crtRecord)) {
                oldValue = crtRecord.getValue(fullFieldName);
            }
            final boolean isChanged =
                    DataChangeEventHelper.valueIsChanged(hasField, newValue, oldValue);
            if (isChanged) {
                final TransactionType transactionType =
                        TransactionType.fromString(this.transactionFields.get(fullFieldName));
                final String fieldName =
                        fullFieldName.substring(fullFieldName.indexOf(DbConstants.DOT) + 1);
                addTransaction(recordChangedEvent, transactionType, pkValue, fieldName, oldValue,
                    newValue);
            }
        }

    }

    /**
     * Add asset transaction for changed record field.
     *
     * @param recordChangedEvent record changed event
     * @param transactionType transaction type
     * @param pkValue primary key value - asset id
     * @param fieldName changed field name
     * @param oldValue old value
     * @param newValue new value
     */
    private void addTransaction(final RecordChangedEvent recordChangedEvent,
            final TransactionType transactionType, final Object pkValue, final String fieldName,
            final Object oldValue, final Object newValue) {
        final AssetTransaction transaction = createTransaction(recordChangedEvent);
        transaction.setActionType(recordChangedEvent.getChangeType());
        transaction.setTransactionType(transactionType);
        transaction.setAssetId(pkValue.toString());
        transaction.setFieldName(fieldName);
        if (oldValue != null) {
            transaction.setOldValue(oldValue.toString());
        }
        if (newValue != null) {
            transaction.setNewValue(newValue.toString());
        }
        save(transaction);
    }

    /**
     * Create asset transaction for record changed event. Set some properties for new transaction -
     * user name, transaction date and time, modified tabel name
     *
     * @param recordChangedEvent record changed event
     * @return {@link AssetTransaction}
     */
    private AssetTransaction createTransaction(final RecordChangedEvent recordChangedEvent) {
        final AssetTransaction transaction = new AssetTransaction();
        // set user name, transaction date and time
        transaction.setUserName(recordChangedEvent.getUser().getName());
        final long transactionTimestamp = recordChangedEvent.getTimestamp();
        transaction.setTransactionDate(new Date(transactionTimestamp));
        transaction.setTransactionTime(new Time(transactionTimestamp));
        transaction.setTableName(recordChangedEvent.getTableName());
        return transaction;
    }

    /**
     * Return current record.
     *
     * @param tableName table name
     * @param pKeys primary keys field values
     * @return {@link DataRecord}
     */
    private DataRecord getCurrentRecord(final String tableName, final Map<String, Object> pKeys) {
        DataRecord record = null;
        if (DbConstants.EQUIPMENT_DEPRECIATION_TABLE.equals(tableName)
                || DbConstants.FURNITURE_DEPRECIATION_TABLE.equals(tableName)) {
            record = getCurrentDepreciationRecord(tableName, pKeys);
        } else {
            final DataSource dataSource = DataSourceFactory.createDataSourceForTable(tableName);
            final Iterator<String> itPkField = pKeys.keySet().iterator();
            while (itPkField.hasNext()) {
                final String pkField = itPkField.next();
                dataSource.addRestriction(Restrictions.eq(tableName, pkField, pKeys.get(pkField)));
            }
            record = dataSource.getRecord();
        }
        return record;
    }
    
    /**
     * Return current depreciation record.
     *
     * @param tableName table name
     * @param pKeys primary keys field values
     * @return DataRecord
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this class.
     *         <p>
     *         Justification: Case #1: Restriction with SELECT pattern .
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private DataRecord getCurrentDepreciationRecord(final String tableName,
            final Map<String, Object> pKeys) {
        final DataSource dataSource = DataSourceFactory.createDataSourceForTable(tableName);
        String sqlReports = "SELECT report_id FROM " + tableName + " WHERE ";
        if (DbConstants.EQUIPMENT_DEPRECIATION_TABLE.equals(tableName)) {
            dataSource.addRestriction(Restrictions.eq(tableName, DbConstants.EQ_ID,
                pKeys.get(DbConstants.EQ_ID)));
            sqlReports +=
                    DbConstants.EQ_ID + "  = "
                            + SqlUtils.formatValueForSql(pKeys.get(DbConstants.EQ_ID));
        } else {
            dataSource.addRestriction(Restrictions.eq(tableName, DbConstants.TA_ID,
                pKeys.get(DbConstants.TA_ID)));
            sqlReports +=
                    DbConstants.TA_ID + " = "
                            + SqlUtils.formatValueForSql(pKeys.get(DbConstants.TA_ID));
        }
        final String sqlReportRestriction =
                "report_id = (SELECT dep_reports.report_id FROM dep_reports WHERE dep_reports.last_date "
                        + " = (SELECT MAX(dep_reports.last_date) FROM dep_reports WHERE dep_reports.report_id IN ( "
                        + sqlReports + " )))";
        dataSource.addRestriction(Restrictions.sql(sqlReportRestriction));
        
        return dataSource.getRecord();
    }

    /**
     * Returns archibus field definition for primary keys of specified table.
     *
     * @param tableName table name
     * @return Immutable<ArchibusFieldDefBase.Immutable>
     */
    private Immutable<ArchibusFieldDefBase.Immutable> getPrimaryKeyForTable(final String tableName) {
        final TableDef.ThreadSafe tableDef = this.project.loadTableDef(tableName);
        final PrimaryKey.Immutable primaryKey = tableDef.getPrimaryKey();
        return primaryKey.getFields();
    }

    /**
     * Get primary keys field names and values.
     *
     * @param primaryKeyFields primary key fields definition
     * @param record data record
     * @return Map<String, Object>
     */
    private Map<String, Object> getPrimaryKeyValues(
        final Immutable<ArchibusFieldDefBase.Immutable> primaryKeyFields,
        final DataRecord record) {
        final Map<String, Object> result = new HashMap<String, Object>();
        final Iterator<com.archibus.schema.ArchibusFieldDefBase.Immutable> itPkFields =
                primaryKeyFields.iterator();
        while (itPkFields.hasNext()) {
            final ArchibusFieldDefBase.Immutable fieldDef = itPkFields.next();
            result.put(fieldDef.getName(), record.getValue(fieldDef.fullName()));
        }
        return result;
    }
}
