package com.archibus.app.common.connectors.translation.common.inbound.impl;

import java.util.*;

import com.archibus.app.common.connectors.exception.DatabaseException;
import com.archibus.app.common.connectors.translation.common.DateUtil;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.common.inbound.ForeignTxMetadata.Status;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.schema.*;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.ExceptionBase;

/**
 * A method for persisting records in an ARCHIBUS table.
 *
 * @author cole
 */
public class ArchibusDataTable implements IForeignTxDataTable {

    /**
     * The ARCHIBUS table definition for this data table.
     */
    private final ThreadSafe tableDefinition;

    /**
     * Field definitions for primary key fields for this table.
     */
    private final Map<String, Immutable> primaryKeyFieldDefs;

    /**
     * Field definitions for primary key fields for this table that have no default value (e.g.
     * autoincrement)
     */
    private final Map<String, Immutable> requiredPrimaryKeyFieldDefs;

    /**
     * Whether to support inserts.
     */
    private final boolean supportInsert;

    /**
     * Whether to support updates.
     */
    private final boolean supportUpdate;

    /**
     * Whether to compare field values.
     */
    private final boolean compareFieldValues;

    /**
     * Create a representation of an ARCHIBUS data table for use by Connectors.
     *
     * @param tableName the name of the ARCHIBUS data table in the database.
     * @param supportInsert whether to support inserts.
     * @param supportUpdate whether to support updates.
     * @param compareFieldValues whether to compare field values and only set values on the data
     *            record that have changed.
     */
    public ArchibusDataTable(final String tableName, final boolean supportInsert,
            final boolean supportUpdate, final boolean compareFieldValues) {
        this.supportInsert = supportInsert;
        this.supportUpdate = supportUpdate;
        this.compareFieldValues = compareFieldValues;
        this.tableDefinition = ContextStore.get().getProject().loadTableDef(tableName);
        this.primaryKeyFieldDefs = new Hashtable<String, Immutable>();
        this.requiredPrimaryKeyFieldDefs = new Hashtable<String, Immutable>();
        for (final Immutable field : this.tableDefinition.getPrimaryKey().getFields()) {
            this.primaryKeyFieldDefs.put(field.getName(), field);
            if (field.getDefaultValue() == null && !field.getAllowNull() && !field.isAutoNumber()) {
                this.requiredPrimaryKeyFieldDefs.put(field.getName(), field);
            }
        }
    }

    /**
     * Create a representation of an ARCHIBUS data table for use by Connectors.
     *
     * @param tableName the name of the ARCHIBUS data table in the database.
     */
    public ArchibusDataTable(final String tableName) {
        this(tableName, true, true, false);
    }

    /**
     * @return field definitions for fields that may be persisted in this table.
     */
    public Map<String, Immutable> getFieldDefs() {
        return this.tableDefinition.getFields();
    }

    /**
     * @return field definitions for fields that should uniquely identify a record on this table.
     */
    public Map<String, Immutable> getPrimaryKeyFieldDefs() {
        return this.primaryKeyFieldDefs;
    }

    /**
     * @return field definitions for fields that should uniquely identify a record on this table and
     *         must be specified.
     */
    public Map<String, Immutable> getRequiredPrimaryKeyFieldDefs() {
        return this.requiredPrimaryKeyFieldDefs;
    }

    /**
     * @param fieldNames names of fields that may be in a record on this table.
     * @return field definitions for field names provided, where present.
     */
    public Map<String, Immutable> getFieldDefs(final Set<String> fieldNames) {
        final Map<String, Immutable> presentFieldDefs = new HashMap<String, Immutable>();
        for (final String fieldName : getFieldDefs().keySet()) {
            if (fieldNames.contains(fieldName)) {
                presentFieldDefs.put(fieldName, getFieldDefs().get(fieldName));
            }
        }
        return presentFieldDefs;
    }

    /**
     * Since this method doesn't support persistent, stateful transactions, it removes all the data
     * from the database.
     *
     * @throws DatabaseException due to any issues that prevent the data from being removed.
     */
    @Override
    public void resetTable() throws DatabaseException {
        final DataSource dataSource = DataSourceFactory.createDataSource();
        final String schema =
                ContextStore.get().getTransactionInfos()
                    .getTransactionInfo(com.archibus.context.DatabaseRole.DATA).getDatabase()
                    .getConfigJDBC().getLogin();
        dataSource.addTable(this.tableDefinition.getName());
        dataSource
            .addQuery("truncate table " + schema + "." + this.tableDefinition.getName() + ";");
        dataSource.executeUpdate();
    }

    /**
     * Apply the transaction to the ARCHIBUS database table.
     *
     * @param transactionRecord the transaction record to apply.
     * @throws DatabaseException if the transaction may not have been applied.
     */
    @Override
    public void persist(final ForeignTxRecord transactionRecord) throws DatabaseException {
        if (transactionRecord.getFields().keySet().isEmpty()) {
            throw new DatabaseException("No fields to persist.", null);
        }
        /*
         * Create the data source for this table.
         */
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(this.tableDefinition.getName());
        for (final String fieldName : transactionRecord.getFields().keySet()) {
            dataSource.addField(fieldName);
        }

        /*
         * Find the old record or create a new one.
         */
        final Collection<String> primaryKeyFieldNames = this.primaryKeyFieldDefs.keySet();
        for (final String primaryKeyFieldName : primaryKeyFieldNames) {
            final Object transactionValue = transactionRecord.getFields().get(primaryKeyFieldName);
            if (transactionValue == null) {
                dataSource.addRestriction(Restrictions.isNull(this.tableDefinition.getName(),
                    primaryKeyFieldName));
            } else {
                dataSource.addRestriction(Restrictions.eq(this.tableDefinition.getName(),
                    primaryKeyFieldName, transactionValue));
            }
        }
        DataRecord archibusDataRecord = dataSource.getRecord();
        boolean saveRequired = false;
        if (archibusDataRecord == null) {
            if (this.supportInsert) {
                archibusDataRecord = dataSource.createNewRecord();
                applyTransaction(transactionRecord, archibusDataRecord, primaryKeyFieldNames,
                    dataSource);
                saveRequired = true;
            }
        } else {
            if (this.supportUpdate) {
                saveRequired =
                        applyTransaction(transactionRecord, archibusDataRecord,
                            primaryKeyFieldNames, dataSource);
            }
        }
        if (saveRequired) {
            saveRecord(dataSource, archibusDataRecord, transactionRecord);
        }
    }
    
    /**
     * Apply the transaction to the ARCHIBUS database table.
     *
     * @param transactionRecord the transaction record to apply.
     * @param archibusDataRecord the ARCHIBUS record to apply it to.
     * @param primaryKeyFieldNames the names of primary key fields in the transaction.
     * @param dataSource the data source through which to update the record.
     * @return whether any changes were made.
     * @throws DatabaseException if the transaction may not have been applied.
     */
    private boolean applyTransaction(final ForeignTxRecord transactionRecord,
            final DataRecord archibusDataRecord, final Collection<String> primaryKeyFieldNames,
            final DataSource dataSource) throws DatabaseException {
        /*
         * Update the record from the parameter dataRecord.
         */
        boolean valueChanged = false;
        for (final String fieldName : transactionRecord.getFields().keySet()) {
            if (archibusDataRecord.isNew() || !primaryKeyFieldNames.contains(fieldName)) {
                final String qualifiedFieldName = this.tableDefinition.getName() + '.' + fieldName;
                final Object newValue =
                        getNewFieldValue(dataSource, transactionRecord, archibusDataRecord,
                            fieldName);
                if (this.compareFieldValues
                        && !archibusDataRecord.isNew()
                        && valuesEquivalent(archibusDataRecord.getValue(qualifiedFieldName),
                            newValue)) {
                    archibusDataRecord
                        .removeField(archibusDataRecord.findField(qualifiedFieldName));
                } else {
                    archibusDataRecord.setValue(qualifiedFieldName, newValue);
                    valueChanged = true;
                }
            }
        }
        return valueChanged;
    }
    
    /**
     * Save the record to the database after the transaction has been applied.
     *
     * @param dataSource the method used to save the record.
     * @param archibusDataRecord record to be saved.
     * @param transactionRecord record of transaction, which is updated as the record is saved.
     */
    private void saveRecord(final DataSource dataSource, final DataRecord archibusDataRecord,
            final ForeignTxRecord transactionRecord) {
        try {
            DataRecord updatedDataRecord = null;
            if (!(this.compareFieldValues && containsOnlyPrimaryKeys(archibusDataRecord))) {
                updatedDataRecord = dataSource.saveRecord(archibusDataRecord);
                dataSource.commit();
            }
            
            /*
             * Copy values from after saving, for example auto numbered fields.
             */
            final Map<String, Object> fields = transactionRecord.getFields();
            fields.clear();
            for (final DataValue dataValue : archibusDataRecord.getFields()) {
                fields.put(dataValue.getName(), dataValue.getValue());
            }
            if (updatedDataRecord != null) {
                for (final DataValue dataValue : updatedDataRecord.getFields()) {
                    fields.put(dataValue.getName(), dataValue.getValue());
                }
            }
        } catch (final ExceptionBase e) {
            transactionRecord.getMetadata().setStatus(Status.ERROR);
            transactionRecord.getMetadata().getStatusMessage().append(e.toStringForLogging());
        }
    }

    /**
     * @param oldValue the value currently in the ARCHIBUS record.
     * @param newValue the value to be set in the ARCHIBUS record.
     * @return whether the values are different.
     */
    private boolean valuesEquivalent(final Object oldValue, final Object newValue) {
        boolean changed = false;
        if (oldValue == null) {
            changed = newValue == null;
        } else {
            changed = oldValue.equals(newValue);
        }
        return changed;
    }
    
    /**
     * @param dataRecord the record to search for non-primary keys.
     * @return true if the record contains only primary key values.
     */
    private boolean containsOnlyPrimaryKeys(final DataRecord dataRecord) {
        boolean onlyPrimaryKeys = true;
        for (final DataValue value : dataRecord.getFields()) {
            if (!value.getFieldDef().isPrimaryKey()) {
                onlyPrimaryKeys = false;
                break;
            }
        }
        return onlyPrimaryKeys;
    }
    
    /**
     * Determine the new value for a field in an ARCHIBUS table after a transaction is applied.
     *
     * @param dataSource a data source for the table.
     * @param transactionRecord a transaction to be applied to this table.
     * @param archibusDataRecord a local data record from the table to be updated.
     * @param fieldName the name of the field (local).
     * @return the new field value.
     * @throws DatabaseException if the transaction may not have been applied.
     */
    private Object getNewFieldValue(final DataSource dataSource,
            final ForeignTxRecord transactionRecord, final DataRecord archibusDataRecord,
            final String fieldName) throws DatabaseException {
        Object value = transactionRecord.getFields().get(fieldName);
        if (value == null) {
            value = "";
        }
        final com.archibus.db.ViewField.Immutable fieldDef =
                dataSource.findField(this.tableDefinition.getName() + '.' + fieldName);
        if (fieldDef == null) {
            throw new DatabaseException("Field does not exist in ARCHIBUS: "
                    + this.tableDefinition.getName() + '.' + fieldName, null);
        }
        final DataValue dataValue = new DataValue(fieldDef);
        if (value instanceof String) {
            final String originalValue = (String) value;
            /*
             * KB 3048350: By default, some older versions of Sybase truncate strings with no error
             * (in violation of SQL92 specification). This means you can look for a record by
             * primary key, not find it, and then fail to do an insert because the truncated primary
             * key value matches an existing record. This validates the length beforehand to avoid
             * the scenario.
             */
            validateStringLength(originalValue, dataValue);
            dataValue.setUiValue(originalValue);
            value = dataValue.getValue();
        } else if (value instanceof Date) {
            final DataType dataType = DataType.get(dataValue.getFieldDef().getSqlType());
            switch (dataType) {
                case DATE:
                    value = DateUtil.getSqlDateFromDate((Date) value);
                    break;
                case TIME:
                    value = DateUtil.getSqlTimeFromDate((Date) value);
                    break;
                case TIMESTAMP:
                    value = DateUtil.getSqlTimestampFromDate((Date) value);
                    break;
                default:
                    break;
            }
        }
        final Map<String, IAggregateFunction> aggregateFunctions =
                transactionRecord.getMetadata().getAggregateFunctions();
        if (aggregateFunctions.containsKey(fieldName)) {
            value =
                    aggregateFunctions.get(fieldName).aggregate(
                        archibusDataRecord.getValue(this.tableDefinition.getName() + '.'
                                + fieldName), value);
        }
        return value;
    }

    /**
     * @param originalValue a string value.
     * @param dataValue the data definition for the field.
     * @throws DatabaseException if the value is too long.
     */
    public static void validateStringLength(final String originalValue, final DataValue dataValue)
            throws DatabaseException {
        if (originalValue.length() > dataValue.getFieldDef().getSize()) {
            throw new DatabaseException("Field value too long ( " + originalValue.length() + '>'
                    + dataValue.getFieldDef().getSize() + " ):" + dataValue.getName() + '='
                    + originalValue, null);
        }
    }

    /**
     * @param transactionRecord the transaction.
     * @param primaryKeyFields the fields to check for equivalence.
     * @return the ARCHIBUS record the transaction would apply to, or null if it applies to a new
     *         record.
     */
    @Override
    public ArchibusDataRecord lookup(final ForeignTxRecord transactionRecord,
            final Set<String> primaryKeyFields) {
        ArchibusDataRecord existingRecord = null;
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(this.tableDefinition.getName());
        final Map<String, Object> foreignFields = transactionRecord.getFields();
        for (final String fieldName : foreignFields.keySet()) {
            dataSource.addField(fieldName);
        }
        for (final String primaryFieldName : primaryKeyFields) {
            final Object foreignValue = foreignFields.get(primaryFieldName);
            if (!dataSource.getFieldNames().contains(primaryFieldName)) {
                dataSource.addField(primaryFieldName);
            }
            if (foreignValue == null) {
                dataSource.addRestriction(Restrictions.isNull(this.tableDefinition.getName(),
                    primaryFieldName));
            } else {
                dataSource.addRestriction(Restrictions.eq(this.tableDefinition.getName(),
                    primaryFieldName, foreignValue));
            }
        }
        final DataRecord archibusDataRecord = dataSource.getRecord();
        if (archibusDataRecord != null) {
            existingRecord = new ArchibusDataRecord();
            for (final DataValue dataValue : archibusDataRecord.getFields()) {
                existingRecord.putField(dataValue.getName(), dataValue.getValue());
            }
        }
        return existingRecord;
    }
    
    @Override
    public Set<String> getPrimaryKeyFields() {
        return this.primaryKeyFieldDefs.keySet();
    }

    @Override
    public Set<String> getRequiredPrimaryKeyFields() {
        return this.requiredPrimaryKeyFieldDefs.keySet();
    }
}
