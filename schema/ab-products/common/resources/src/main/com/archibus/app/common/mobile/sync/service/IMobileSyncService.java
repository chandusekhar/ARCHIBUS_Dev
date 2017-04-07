package com.archibus.app.common.mobile.sync.service;

import java.util.List;

import com.archibus.model.schema.TableDef;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.utility.ExceptionBase;

/**
 * API of the sync service for mobile applications.
 * <p>
 * Only authenticated users are allowed to invoke methods in this service.
 *
 * @author Valery Tydykov
 *
 * @since 21.1
 */
public interface IMobileSyncService {
    /**
     * Returns list of AppInfo DTOs - properties of mobile applications enabled for the current
     * user. AppInfo is localized according to the locale of the user session.
     *
     * @return list of AppInfo DTOs - properties of mobile applications enabled for the current
     *         user.
     * @throws ExceptionBase if DataSource throws an exception.
     */
    List<AppConfig> getEnabledApplications() throws ExceptionBase;

    /**
     * Returns the table definition DTO for specified table. Contains localized strings and enums
     * according to the locale of the current user session.
     *
     * @param tableName name of the table to return the definition for.
     * @return TableDef DTO for the specified tableName.
     * @throws ExceptionBase if DataSource throws an exception.
     */
    TableDef getTableDef(String tableName) throws ExceptionBase;

    /**
     * Checks-in specified records into the specified sync table. Check-in means that this method
     * will try to insert or update each record (if the user is allowed to update the record) and
     * will lock the inserted records for the current user.
     * <p>
     * If all values of the inventoryKeyNames fields in the record are populated and if the record
     * exists in the sync table update the record; otherwise insert the record.
     * <p>
     * If content of a document field is "MARK_DELETED", marks the document as deleted.
     *
     * @param tableName the name of the sync table to check the records in.
     * @param inventoryKeyNames names of the inventory key fields in the sync table. Names of the
     *            primary key fields of the inventory table (e.g. "wr" table) associated with the
     *            sync table (e.g. "wr_sync" table). Used to create restriction for each record to
     *            be checked-in; the restriction is used to check if the record already exists in
     *            the sync table.
     * @param records to be checked-in.
     * @throws ExceptionBase if DataSource throws an exception.
     */
    void checkInRecords(final String tableName, final List<String> inventoryKeyNames,
            final List<Record> records) throws ExceptionBase;

    /**
     * Checks-out records from the specified sync table, locks the checked-out records for the
     * current user. Applies the specified restriction and VPA restrictions for the current user to
     * select the records.
     *
     * @param tableName the name of the sync table to check the records out.
     * @param fieldNames the names of the fields in the sync table to be included in the checked-out
     *            the records.
     * @param restrictionDef restriction to be applied to the sync table.
     * @return list of checked-out records. The list might be empty if user is not allowed to lock
     *         the record.
     * @throws ExceptionBase if the DataSource throws exception.
     */
    List<Record> checkOutRecords(final String tableName, final List<String> fieldNames,
        final ParsedRestrictionDef restrictionDef) throws ExceptionBase;

    /**
     * Retrieves records from the specified table. Applies the specified restriction and VPA
     * restrictions for the current user to select the records.
     *
     * @param tableName the name of the table to retrieve records from.
     * @param fieldNames the names of the fields in the table to be included in the the records.
     * @param restrictionDef restriction to be applied to the table.
     * @return list of records.
     * @throws ExceptionBase if the DataSource throws exception.
     * @deprecated Use {@link #retrieveRecords(String, java.util.List, ParsedRestrictionDef, int)}
     *             method instead.
     */
    @Deprecated
    List<Record> retrieveRecords(final String tableName, final List<String> fieldNames,
        final ParsedRestrictionDef restrictionDef) throws ExceptionBase;

    /**
     * Retrieves records from the specified table. Applies the specified restriction and VPA
     * restrictions for the current user to select the records.
     *
     * @param tableName the name of the table to retrieve records from.
     * @param fieldNames the names of the fields in the table to be included in the the records.
     * @param restrictionDef restriction to be applied to the table.
     * @param pageSize restricts number of records retrieved.
     * @return list of records in the order defined by the primary key of the table.
     * @throws ExceptionBase if the DataSource throws exception.
     */
    @Deprecated
    List<Record> retrievePagedRecords(final String tableName, final List<String> fieldNames,
        final ParsedRestrictionDef restrictionDef, int pageSize) throws ExceptionBase;

    /**
     * Retrieves records from the specified table. Applies the specified restriction and VPA
     * restrictions for the current user to select the records.
     *
     * @param tableName the name of the table to retrieve records from.
     * @param fieldNames the names of the fields in the table to be included in the the records.
     * @param restrictionDef restriction to be applied to the table.
     * @param pageSize restricts number of records retrieved.
     * @param includeDocumentData when true, document data is populated in the doc_contents field.
     *            When false, the 'doc_contents' field contains null.
     * @return list of records in the order defined by the primary key of the table.
     * @throws ExceptionBase if the DataSource throws exception.
     */
    List<Record> retrievePagedRecords(final String tableName, final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef, int pageSize, boolean includeDocumentData)
            throws ExceptionBase;

    /**
     * Records the last download timestamp for a mobile client database table.
     * <p>
     * The timestamp value is the current server time when the method is executed.
     * <p>
     *
     * @param userName the username of the Mobile Client user
     * @param deviceId the device id of the device the table was downloaded to
     * @param clientTableName the name of the client database table
     * @param serverTableName the name of the Web Central database table that is the source of the
     *            data
     * @throws ExceptionBase if the DataSource throws exception.
     */
    void recordTableDownloadTime(final String userName, final String deviceId,
            final String clientTableName, final String serverTableName) throws ExceptionBase;

    /**
     * Retrieves the last download timestamp for a user, device and client table.
     *
     * @param userName the name of the user that performed the last update
     * @param deviceId the device id used during the last download
     * @param clientTableName the name of the Mobile Client database table
     * @return The timestamp of the last table download. The timestamp is Epoch time.
     *
     * @throws ExceptionBase if the DataSource throws exception.
     */
    java.sql.Timestamp retrieveTableDownloadTime(final String userName, final String deviceId,
            final String clientTableName) throws ExceptionBase;

    /**
     * Retrieves the records for the table that have been modified or deleted.
     *
     * @param tableName of the table to retrieve the records from
     * @param fieldNames of the fields to retrieve from the table
     * @param restrictionDef restriction to apply to the result.
     * @param pageSize the number of records to return
     * @param includeDocumentData true to include the document data in the returned records. A value
     *            of false returns the record without the contents of the document fields populated.
     * @param timestamp of the last successful sync.
     *
     * @return records meeting the supplied criteria
     * @throws ExceptionBase if the DataSource throws exception.
     */
    List<Record> retrieveModifiedRecords(final String tableName, final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef, int pageSize, boolean includeDocumentData,
        double timestamp) throws ExceptionBase;

    /**
     * Retrieves records that have been recorded as being deleted.
     *
     * @param tableName of the table the records where deleted from
     * @param timestamp of the last successful sync
     * @return list of records meeting the deleted criteria
     * @throws ExceptionBase if the DataSource throws exception.
     */
    List<Record> retrieveDeletedRecords(final String tableName, final double timestamp)
            throws ExceptionBase;
}
