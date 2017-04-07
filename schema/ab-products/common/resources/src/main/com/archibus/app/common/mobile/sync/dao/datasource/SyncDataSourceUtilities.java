package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import junit.framework.Assert;

import org.springframework.util.StringUtils;

import com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames;
import com.archibus.app.common.mobile.sync.service.*;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.config.Database.Immutable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.*;
import com.archibus.schema.*;
import com.archibus.utility.*;

/**
 * Utilities for SyncDataSource.
 * <p>
 * Provides access to "mob_is_changed" and "mob_locked_by" fields in DataRecord.
 *
 * @author Valery Tydykov
 * @since 21.1 S
 *        <p>
 *        Suppress Warning "PMD.TooManyMethods". Justification: This is a utility class, and the
 *        methods here belong together.
 *        <p>
 *        Suppress Warning "PMD.AvoidUsingSql". Justification: SQL is required to generate the
 *        modified records query.
 */
@SuppressWarnings({ "PMD.TooManyMethods", "PMD.AvoidUsingSql" })
public final class SyncDataSourceUtilities {
    /**
     * Constant: ".".
     */
    public static final String DOT = ".";

    /**
     * Constant: Name of the field "Changed by Mobile User".
     */
    public static final String CHANGED_BY_MOBILE_USER = "mob_is_changed";

    /**
     * Constant: Name of the field "Locked by Mobile User".
     */
    public static final String LOCKED_BY_MOBILE_USER = "mob_locked_by";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private SyncDataSourceUtilities() {
    }

    /**
     * Creates DataSource, which will include specified fieldNames.
     *
     * @param fieldNames to be included in the DataSource.
     * @param tableDef of the sync table.
     * @param isSyncTable true if the table the DataSource is created for is a sync table.
     * @return created DataSource.
     * @throws ExceptionBase if creation fails.
     */
    static DataSource createDataSource(final List<String> fieldNames,
            final TableDef.ThreadSafe tableDef, final boolean isSyncTable) throws ExceptionBase {
        final List<String> fieldNamesForDataSource =
                prepareFieldNamesForDataSource(fieldNames, tableDef, isSyncTable);

        final String tableName = tableDef.getName();
        // Create DataSource for the tableName
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(tableName,
                    fieldNamesForDataSource.toArray(new String[fieldNamesForDataSource.size()]));
        dataSource.enableIdLookup(false);
        dataSource.setContext();

        return dataSource;
    }

    /**
     * Extracts field names from the first record in the list. Separates field names into two lists:
     * document and non-document fields. Excludes fields with names that have "_contents" postfix.
     *
     * @param records the list to extract the field names from.
     * @param tableDef of the sync table.
     * @return field names separated into two lists.
     */
    static FieldNames extractFieldNamesFromFirstRecord(final List<Record> records,
            final TableDef.ThreadSafe tableDef) {

        Assert.assertTrue(!records.isEmpty());
        final Record firstRecord = records.get(0);

        final List<String> fieldNames = new ArrayList<String>();
        for (final FieldNameValue nameValue : firstRecord.getFieldValues()) {
            fieldNames.add(nameValue.getFieldName());
        }

        return DocumentFieldsDataSourceUtilities.separateFieldNames(fieldNames, tableDef);
    }

    /**
     * Returns true if user is allowed to lock the record for check-in.
     *
     * @param tableName name of the table from which the record is coming.
     * @param username of the user.
     * @param record to be locked.
     * @return true if user is allowed to lock the record for check-in.
     */
    static boolean isUserAllowedLockRecordForCheckin(final String tableName, final String username,
            final DataRecord record) {
        // check if the Locked by Mobile User field matches the username.
        return username.equals(record.getValue(tableName + DOT + LOCKED_BY_MOBILE_USER));
    }

    /**
     * Returns true if user is allowed to lock the record for check-out.
     *
     * @param tableName name of the table from which the record is coming.
     * @param username of the user.
     * @param record to be locked.
     * @return true if user is allowed to lock the record for check-out.
     */
    static boolean isUserAllowedLockRecordForCheckout(final String tableName,
            final String username, final DataRecord record) {
        boolean isUserAllowedLockRecordForCheckout = false;
        if (isUserAllowedLockRecordForCheckin(tableName, username, record)) {
            // Locked by Mobile User field matches the username
            isUserAllowedLockRecordForCheckout = true;
        } else if (StringUtil.isNullOrEmpty(record
            .getValue(tableName + DOT + LOCKED_BY_MOBILE_USER))) {
            // Locked by Mobile User field is blank
            isUserAllowedLockRecordForCheckout = true;
        }

        return isUserAllowedLockRecordForCheckout;
    }

    /**
     * Loads record from the specified DataSource. Uses restriction created from inventoryKeyNames
     * in the supplied record. The restriction will be created if at least one non-null
     * inventoryKeyNames value exists in the record; otherwise no record is loaded.
     *
     * @param dataSource to be used to load record.
     * @param tableName name of the table from which the record is loaded.
     * @param inventoryKeyNames to create restriction. Names of the primary key fields of the
     *            inventory table (e.g. "wr" table) associated with the sync table (e.g. "wr_sync"
     *            table).
     * @param record with inventoryKeyNames from which the restriction will be created.
     * @return loaded record, or null, if no record for the restriction exists.
     * @throws ExceptionBase if loading record fails.
     */
    static DataRecord loadRecord(final DataSource dataSource, final String tableName,
            final List<String> inventoryKeyNames, final DataRecord record) throws ExceptionBase {
        final ParsedRestrictionDef restrictionDef =
                createRestriction(tableName, inventoryKeyNames, record);

        DataRecord recordToReturn = null;
        if (restrictionDef != null) {
            final List<DataRecord> records = dataSource.getRecords(restrictionDef);
            if (records.size() == 1) {
                recordToReturn = records.get(0);
            }
        }

        return recordToReturn;
    }

    /**
     * Creates restriction using values of inventoryKeyNames in the record. The restriction will be
     * created if at least one non-null inventoryKeyNames value exists in the record; otherwise no
     * restriction is created.
     *
     * @param tableName name of the table from which the record is loaded.
     * @param inventoryKeyNames to create restriction. Names of the primary key fields of the
     *            inventory table (e.g. "wr" table) associated with the sync table (e.g. "wr_sync"
     *            table).
     * @param record with inventoryKeyNames from which the restriction will be created.
     * @return created restriction or null if no non-null inventoryKeyNames value exists in the
     *         record.
     */
    static ParsedRestrictionDef createRestriction(final String tableName,
            final List<String> inventoryKeyNames, final DataRecord record) {
        ParsedRestrictionDef restrictionDef = null;

        // add restriction by inventoryKeyNames
        for (final String keyName : inventoryKeyNames) {
            final Object value = record.getValue(tableName + SyncDataSourceUtilities.DOT + keyName);
            // if non-null value exists, create restriction
            if (value != null) {
                // create restrictionDef if not
                if (restrictionDef == null) {
                    restrictionDef = new ParsedRestrictionDef();
                }

                restrictionDef.addClause(tableName, keyName, value, ClauseDef.Operation.EQUALS);
            }
        }

        return restrictionDef;
    }

    /**
     * Locks and saves record, using supplied dataSource. Locks the record for the supplied
     * username.
     *
     * @param dataSource to save the record.
     * @param username to lock the record for.
     * @param record to be locked and saved. Might be an existing or new record.
     * @param tableName name of the table the record is coming from.
     * @return DataRecord containing saved field values, or null if the table PK is not
     *         autonumbered.
     */
    static DataRecord lockAndSaveRecord(final DataSource dataSource, final String username,
            final DataRecord record, final String tableName) {
        SyncDataSourceUtilities.lockRecord(record, username, tableName);
        SyncDataSourceUtilities.setChangedByMobileUser(record, tableName);

        return dataSource.saveRecord(record);
    }

    /**
     * Locks the record for the username.
     *
     * @param record to be locked.
     * @param username to lock the record for.
     * @param tableName name of the table the record is coming from.
     */
    static void lockRecord(final DataRecord record, final String username, final String tableName) {
        record.setValue(tableName + DOT + LOCKED_BY_MOBILE_USER, username);
    }

    /**
     * Prepares field names for DataSource: the result contains both document and non-document
     * fields.
     *
     * @param fieldNames source of the field names.
     * @return both document and non-document field names.
     */
    static List<String> prepareFieldNamesForDataSource(final FieldNames fieldNames) {
        final List<String> nonDocumentAndDocumentFieldNames = new ArrayList<String>();
        nonDocumentAndDocumentFieldNames.addAll(fieldNames.getDocumentFieldNames());
        nonDocumentAndDocumentFieldNames.addAll(fieldNames.getNonDocumentFieldNames());

        return nonDocumentAndDocumentFieldNames;
    }

    /**
     * Prepares field names for DataSource.
     * <p>
     * - Adds fieldNames;
     * <p>
     * - Adds required for sync table fields;
     * <p>
     * - Adds primary key fields;
     *
     * @param fieldNames to be added.
     * @param tableDef to get primary keys names from.
     * @param isSyncTable true if the table the DataSource is created for is a sync table.
     * @return field names.
     */
    static List<String> prepareFieldNamesForDataSource(final List<String> fieldNames,
            final com.archibus.schema.TableDef.ThreadSafe tableDef, final boolean isSyncTable) {
        // add fields passed by the caller
        final List<String> fieldNamesForDatasource = new ArrayList<String>(fieldNames);

        if (isSyncTable) {
            // add required for sync table fields
            fieldNamesForDatasource.add(SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER);
            fieldNamesForDatasource.add(SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER);
        }

        // add PK fields
        {
            for (final ArchibusFieldDefBase.Immutable fieldDef : tableDef.getPrimaryKey()
                .getFields()) {
                // no duplicates
                if (!fieldNamesForDatasource.contains(fieldDef.getName())) {
                    fieldNamesForDatasource.add(fieldDef.getName());
                }
            }
        }

        return fieldNamesForDatasource;
    }

    /**
     * Selects record with primary key values from the recordSaved and recordToSave.
     *
     * @param recordToSave record to be saved if the table is not autonumbered.
     * @param recordSaved record saved by the DataSource if the table is autonumbered, or null.
     * @return selected record with primary key values.
     */
    static DataRecord selectRecordWithPrimaryKeyValues(final DataRecord recordToSave,
            final DataRecord recordSaved) {
        DataRecord recordWithPrimaryKeyValues;
        if (recordSaved == null) {
            // not autonumbered table
            recordWithPrimaryKeyValues = recordToSave;
        } else {
            // autonumbered table
            recordWithPrimaryKeyValues = recordSaved;
        }

        Assert.assertNotNull("recordWithPrimaryKeyValues must not be null",
            recordWithPrimaryKeyValues);

        return recordWithPrimaryKeyValues;
    }

    /**
     * Sets value of field ChangedByMobileUser to true.
     *
     * @param record with the field value to be set.
     * @param tableName name of the table the record is coming from.
     */
    static void setChangedByMobileUser(final DataRecord record, final String tableName) {
        record.setValue(tableName + DOT + CHANGED_BY_MOBILE_USER, 1);
    }

    /**
     * Creates a DataSource for the table that the modified records are retrieved from.
     *
     * @param fieldNames of the fields to include in the datasource.
     * @param tableDef of the table.
     * @param timestamp of the last sync.
     * @return DataSource for the table.
     * @throws ExceptionBase if the DataSource throws an exception.
     */
    static DataSource createDataSourceForModifiedRecords(final List<String> fieldNames,
            final TableDef.ThreadSafe tableDef, final double timestamp) throws ExceptionBase {

        final List<String> fieldNamesForDataSource =
                prepareFieldNamesForDataSource(fieldNames, tableDef, false);

        final String tableName = tableDef.getName();

        final String generatedSql = generateModifiedRecordQuery(tableDef, fieldNames, timestamp);
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(tableDef.getName(),
                    fieldNamesForDataSource.toArray(new String[fieldNamesForDataSource.size()]));

        dataSource.addField(createPkeyAlias(tableName));
        dataSource.addQuery(generatedSql);

        dataSource.enableIdLookup(false);
        dataSource.setContext();

        return dataSource;
    }

    /**
     * Creates the primary key selection field used in the query to select the modified records.
     *
     * @param tableDef of the table.
     * @return primary field name to be used in the query.
     */
    private static String createPrimaryKeySelectField(final TableDef.ThreadSafe tableDef) {
        final List<String> primaryKeys = new ArrayList<String>();
        final String concatOperator = SyncDataSourceUtilities.getConcatOperator();

        for (final ArchibusFieldDefBase.Immutable fieldDef : tableDef.getPrimaryKey().getFields()) {
            primaryKeys.add(fieldDef.fullName());
        }

        return StringUtils.collectionToDelimitedString(primaryKeys, concatOperator + " '|' "
                + concatOperator);

    }

    /**
     * Appends '_pkey' to the table name.
     * <p>
     * Used to create the column alias in the modified records query.
     *
     * @param tableName of the table.
     * @return the column alias name, i.e. fl_pkey for the fl table.
     */
    private static String createPkeyAlias(final String tableName) {
        return tableName + "_pkey";
    }

    /**
     * Generates the query to retrieve the modified records from the table.
     * <p>
     * Uses the transactions recorded in the afm_table_trans table to determine the modified
     * records.
     *
     * @param tableDef of the table.
     * @param fieldNames to include in the query.
     * @param timestamp of the last sync.
     * @return the modified record query.
     */
    private static String generateModifiedRecordQuery(final TableDef.ThreadSafe tableDef,
            final List<String> fieldNames, final double timestamp) {
        final String tableName = tableDef.getName();
        final String pkeyAlias = createPkeyAlias(tableName);

        final String primaryKeySelectField = createPrimaryKeySelectField(tableDef);

        String sql = "SELECT ";
        final String whereClause =
                " WHERE "
                        + primaryKeySelectField
                + " IN(SELECT pkey_value FROM afm_mobile_table_trans WHERE event_timestamp > "
                + timestamp + " AND deleted=0 AND table_name='" + tableName + "')";

        final List<String> qualifiedFieldNames = new ArrayList<String>();

        for (final String fieldName : fieldNames) {
            qualifiedFieldNames.add(tableName + DOT + fieldName);
        }

        // Add the primary key field
        qualifiedFieldNames.add(primaryKeySelectField + " ${sql.as}" + pkeyAlias);

        final String qualifiedFields =
                StringUtils.collectionToCommaDelimitedString(qualifiedFieldNames);

        // Construct the final query
        sql += qualifiedFields + " FROM " + tableName + whereClause;

        return sql;

    }

    /**
     * Returns the database concatenation operator.
     *
     * @return || if Oracle + otherwise.
     */
    public static String getConcatOperator() {
        final Immutable databaseContext = ContextStore.get().getDatabase();
        String operator = " + ";
        if ("ORACLE".equalsIgnoreCase(databaseContext.getDataSource().getDatabaseEngineType())) {
            operator = " || ";
        }
        return operator;
    }
}
