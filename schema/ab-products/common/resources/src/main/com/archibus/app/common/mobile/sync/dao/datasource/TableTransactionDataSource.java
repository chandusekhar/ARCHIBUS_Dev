package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import org.springframework.util.StringUtils;

import com.archibus.app.common.mobile.sync.dao.ITableTransactionDao;
import com.archibus.app.common.mobile.sync.domain.TableTransaction;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.config.Project;
import com.archibus.core.event.data.*;
import com.archibus.datasource.ObjectDataSourceImpl;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.schema.*;
import com.archibus.utility.*;
import com.archibus.utility.ListWrapper.Immutable;

/**
 * DataSource for TableTransacton.
 * <p>
 * A bean class named as "tableTransactionDao".
 * <p>
 * configured in
 * schema/ab-products/common/resources/src/main/com/archibus/app/common/mobile/services.xml
 *
 * <p>
 * Designed to have prototype scope.
 *
 * @author Jeff Martin
 * @since 23.1
 *
 */

public class TableTransactionDataSource extends ObjectDataSourceImpl<TableTransaction> implements
        ITableTransactionDao {

    /**
     * Constant: field name: "table_name".
     */
    private static final String TABLE_NAME = "table_name";

    /**
     * Constant: field name: "pkey_value".
     */
    private static final String PKEY_VALUE = "pkey_value";

    /**
     * Constant: field name: "event_timestamp".
     */
    private static final String EVENT_TIMESTAMP = "event_timestamp";

    /**
     * Constant: field name: "deleted".
     */
    private static final String DELETED = "deleted";

    /**
     * Constant: table name: "afm_table_trans".
     */
    private static final String AFM_TABLE_TRANS_NAME = "afm_mobile_table_trans";

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { TABLE_NAME, "tableName" },
            { PKEY_VALUE, "pkeyValue" }, { EVENT_TIMESTAMP, "eventTimestamp" },
        { DELETED, DELETED }, { "auto_number", "autoNumber" } };

    /**
     * Project, required to get TableDef.
     */
    private Project.Immutable project;

    /**
     * Constructs TableTransactionDataSource, mapped to <code>afm_mobile_table_trans</code> table.
     */
    public TableTransactionDataSource() {
        super("tableTransaction", AFM_TABLE_TRANS_NAME);
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

    @Override
    public void recordTransactionEvent(final RecordChangedEvent recordChangedEvent) {
        final DataRecord record = recordChangedEvent.getRecord();
        final ChangeType changeType = recordChangedEvent.getChangeType();
        final Immutable<ArchibusFieldDefBase.Immutable> primaryKeyFields =
                getPrimaryKeyForTable(recordChangedEvent.getTableName());

        final String pkeyValues = getPrimaryKeyValues(primaryKeyFields, record);

        final boolean isDelete = ChangeType.DELETE.equals(changeType);
        final boolean isInsertOrUpdate =
                ChangeType.UPDATE.equals(changeType) || ChangeType.INSERT.equals(changeType);

        if (isInsertOrUpdate || isDelete) {
            insertTransaction(recordChangedEvent.getTableName(), pkeyValues, isDelete);
        }

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

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /**
     * Records an event in the afm_table_trans table.
     * <p>
     * Inserts a new record if a record for the table does not exist.
     * <p>
     * Sets the deleted flag if the event is the result of a DELETE action and the record was not
     * previously marked as deleted.
     *
     * @param tableName of the table the INSERT, UPDATE or DELETE action occurred on.
     * @param pkeyValues of the modified record.
     * @param isDeleteAction true when the event is the result of a DELETE action, false for INSERT
     *            and UPDATE actions.
     */
    private void insertTransaction(final String tableName, final String pkeyValues,
            final boolean isDeleteAction) {

        // Check if the record already exists for this table and pkey combination
        this.addRestriction(Restrictions.eq(AFM_TABLE_TRANS_NAME, PKEY_VALUE, pkeyValues));
        this.addRestriction(Restrictions.eq(AFM_TABLE_TRANS_NAME, TABLE_NAME, tableName));

        final DataRecord record = this.getRecord();
        if (record == null) {
            this.insertTransactionRecord(null, tableName, pkeyValues, isDeleteAction ? 1 : 0);
        } else {
            final int deletedValue = record.getInt(AFM_TABLE_TRANS_NAME + DOT + DELETED);
            if ((deletedValue == 1 && isDeleteAction) || (deletedValue == 0 && !isDeleteAction)) {
                this.updateTransactionRecord(record, tableName, pkeyValues, isDeleteAction ? 1 : 0);
            } else {
                this.insertTransactionRecord(record, tableName, pkeyValues, isDeleteAction ? 1 : 0);
            }
        }
    }

    /**
     * Inserts an event record into the afm_table_trans table.
     *
     * @param record to insert.
     * @param tableName of the table the event occurred on.
     * @param pkeyValues of the record the event occurred on.
     * @param deleted set to 1 when the event is the result of a DELETE action, 0 otherwise.
     */
    private void insertTransactionRecord(final DataRecord record, final String tableName,
            final String pkeyValues, final int deleted) {

        if (record != null) {
            this.deleteRecord(record);
        }

        final DataRecord newRecord = this.createNewRecord();
        newRecord.setValue(AFM_TABLE_TRANS_NAME + DOT + TABLE_NAME, tableName);
        newRecord.setValue(AFM_TABLE_TRANS_NAME + DOT + PKEY_VALUE, pkeyValues);
        newRecord.setValue(AFM_TABLE_TRANS_NAME + DOT + DELETED, deleted);
        newRecord
            .setValue(AFM_TABLE_TRANS_NAME + DOT + EVENT_TIMESTAMP, System.currentTimeMillis());
        this.saveRecord(newRecord);
    }

    /**
     * Updates the transaction record.
     * <p>
     * Removes any recorded deleted events for the event record.
     *
     * @param recordToUpdate record to update.
     * @param tableName of the table the event occurred on.
     * @param pkeyValues of the event record.
     * @param deleted 1 when the transaction is a result of a DELETED event, otherwise 0.
     */
    private void updateTransactionRecord(final DataRecord recordToUpdate, final String tableName,
            final String pkeyValues, final int deleted) {

        // Check for existing records that should be deleted before updating
        final int delete = deleted == 1 ? 0 : 1;
        this.addRestriction(Restrictions.eq(AFM_TABLE_TRANS_NAME, PKEY_VALUE, pkeyValues));
        this.addRestriction(Restrictions.eq(AFM_TABLE_TRANS_NAME, TABLE_NAME, tableName));
        this.addRestriction(Restrictions.eq(AFM_TABLE_TRANS_NAME, DELETED, delete));

        final DataRecord recordToDelete = this.getRecord();
        if (recordToDelete != null) {
            this.deleteRecord(recordToDelete);
        }

        recordToUpdate.setValue(AFM_TABLE_TRANS_NAME + DOT + EVENT_TIMESTAMP,
            System.currentTimeMillis());
        this.saveRecord(recordToUpdate);

    }

    /**
     * Returns the ARCHIBUS field definition for primary keys of specified table.
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
    private String getPrimaryKeyValues(
            final Immutable<ArchibusFieldDefBase.Immutable> primaryKeyFields,
            final DataRecord record) {
        final List<String> pkeyList = new ArrayList<String>();
        final Iterator<com.archibus.schema.ArchibusFieldDefBase.Immutable> itPkFields =
                primaryKeyFields.iterator();
        while (itPkFields.hasNext()) {
            final ArchibusFieldDefBase.Immutable fieldDef = itPkFields.next();
            pkeyList.add(record.getValue(fieldDef.fullName()).toString());
        }

        return StringUtils.collectionToDelimitedString(pkeyList, "|");

    }

    @Override
    public List<Record> retrieveDeletedRecords(final String tableName, final double timestamp)
            throws ExceptionBase {

        final List<String> fieldNames = new ArrayList<String>();
        fieldNames.add(PKEY_VALUE);
        this.addRestriction(Restrictions.eq(AFM_TABLE_TRANS_NAME, TABLE_NAME, tableName));
        this.addRestriction(Restrictions.gt(AFM_TABLE_TRANS_NAME, EVENT_TIMESTAMP, timestamp));
        this.addRestriction(Restrictions.eq(AFM_TABLE_TRANS_NAME, DELETED, 1));

        final List<DataRecord> dataRecords = this.getRecords();
        final List<Record> dtoRecords = new ArrayList<Record>();
        for (final DataRecord record : dataRecords) {
            // Add the record to the array to return
            final Record recordDto =
                    Converter.convertRecordToDto(record, AFM_TABLE_TRANS_NAME, fieldNames);
            dtoRecords.add(recordDto);
        }

        return dtoRecords;
    }

}
