package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.app.common.mobile.sync.dao.*;
import com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.*;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.schema.*;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.ExceptionBase;

/**
 * DataSource for sync operations.
 * <p>
 * Can be used with prototype or singleton scope. Designed to have singleton scope in order to be
 * dependency of a singleton bean: public methods to be called from singleton bean use new instance
 * of DataSource object on each call.
 *
 * @author Valery Tydykov, Jeff Martin
 * @since 21.1
 */
public class SyncDataSource implements ISyncDao {
    /**
     * Property: documentFieldsDao. Optional: used if sync table contains document fields.
     */
    private IDocumentFieldsDao documentFieldsDao;
    
    /**
     * {@inheritDoc}
     */
    @Override
    public List<Record> checkInRecords(final List<String> inventoryKeyNames,
            final List<Record> records, final TableDef.ThreadSafe tableDef, final String username)
            throws ExceptionBase {
        final FieldNames fieldNamesFromRecord =
                SyncDataSourceUtilities.extractFieldNamesFromFirstRecord(records, tableDef);
        
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(
                    fieldNamesFromRecord.getNonDocumentFieldNames(), tableDef, true);
        
        final String tableName = tableDef.getName();
        
        final Map<DataRecord, Record> recordsToCheckin =
                Converter.convertDtosToRecords(records, dataSource);
        
        final List<DataRecord> failedRecords = new ArrayList<DataRecord>();
        // For each record:
        for (final Entry<DataRecord, Record> entry : recordsToCheckin.entrySet()) {
            final DataRecord recordToCheckin = entry.getKey();
            final Record recordDto = entry.getValue();
            
            if (!checkInRecord(username, new IDocumentFieldsDao.RecordAndDto(recordToCheckin,
                recordDto), tableDef, fieldNamesFromRecord, inventoryKeyNames, dataSource)) {
                // check-in failed
                failedRecords.add(recordToCheckin);
            }
        }
        
        // recordsToReturn will be reported in a log file
        final List<Record> recordsToReturn =
                Converter.convertRecordsToDtos(tableName,
                    fieldNamesFromRecord.getNonDocumentFieldNames(), failedRecords);
        
        return recordsToReturn;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public List<Record> checkOutRecords(final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef, final TableDef.ThreadSafe tableDef,
            final String username, final boolean includeDocumentData) throws ExceptionBase {
        
        final String tableName = tableDef.getName();
        final FieldNames fieldNamesSeparated =
                DocumentFieldsDataSourceUtilities.separateFieldNames(fieldNames, tableDef);
        
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(
                    SyncDataSourceUtilities.prepareFieldNamesForDataSource(fieldNamesSeparated),
                    tableDef, true);
        
        // Retrieve records from the DataSource
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        final List<Record> recordsToReturn = new ArrayList<Record>();
        for (final DataRecord recordToSave : records) {
            // Check if the user is allowed to lock the record
            if (SyncDataSourceUtilities.isUserAllowedLockRecordForCheckout(tableName, username,
                recordToSave)) {
                final Record recordDto =
                        checkOutRecord(username, tableDef, fieldNames, fieldNamesSeparated,
                            dataSource, recordToSave, includeDocumentData);
                
                recordsToReturn.add(recordDto);
            }
        }
        
        return recordsToReturn;
    }
    
    /**
     * Getter for the documentFieldsDao property.
     *
     * @see documentFieldsDao
     * @return the documentFieldsDao property.
     */
    public IDocumentFieldsDao getDocumentFieldsDao() {
        return this.documentFieldsDao;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public List<Record> retrieveRecords(final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef, final ThreadSafe tableDef,
            final int pageSize, final boolean includeDocumentData) throws ExceptionBase {
        final FieldNames fieldNamesSeparated =
                DocumentFieldsDataSourceUtilities.separateFieldNames(fieldNames, tableDef);
        
        // DataSource should include fields like "doc1" but exclude fields like "doc1_contents".
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(
                    SyncDataSourceUtilities.prepareFieldNamesForDataSource(fieldNamesSeparated),
                    tableDef, false);
        
        // order by primary key
        for (final ArchibusFieldDefBase.Immutable fieldDef : tableDef.getPrimaryKey().getFields()) {
            dataSource.addSort(fieldDef.getName());
        }
        
        // Retrieve records from the DataSource
        // limit number of records by pageSize
        dataSource.setMaxRecords(pageSize);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        final List<Record> recordsToReturn = new ArrayList<Record>();
        // For each record:
        for (final DataRecord record : records) {
            final Record recordDto =
                    retrieveRecord(fieldNames, tableDef, fieldNamesSeparated, record,
                        includeDocumentData);
            
            recordsToReturn.add(recordDto);
        }
        
        return recordsToReturn;
    }
    
    /**
     * Setter for the documentFieldsDao property.
     *
     * @see documentFieldsDao
     * @param documentFieldsDao the documentFieldsDao to set
     */
    
    public void setDocumentFieldsDao(final IDocumentFieldsDao documentFieldsDao) {
        this.documentFieldsDao = documentFieldsDao;
    }
    
    /**
     * Checks-in specified record into the specified sync table. Check-in means that this method
     * will try to insert or update the record (if the user is allowed to update the record) and
     * will lock the inserted records for the specified user.
     * <p>
     * If all values of the inventoryKeyNames fields in the record are populated and if the record
     * exists in the sync table update the record; otherwise insert the record.
     * <p>
     * If the content of a document field is "MARK_DELETED", marks the document as deleted.
     *
     * @param username of the current user.
     * @param recordAndDto record to be checked-in, and DTO with field values.
     * @param tableDef of the sync table.
     * @param fieldNamesFromRecord names of the fields from the DTO.
     * @param inventoryKeyNames names of the inventory key fields in the sync table.
     * @param dataSource for the sync table.
     * @return true if check-in was successful, or false if it failed.
     */
    boolean checkInRecord(final String username,
            final IDocumentFieldsDao.RecordAndDto recordAndDto, final TableDef.ThreadSafe tableDef,
            final FieldNames fieldNamesFromRecord, final List<String> inventoryKeyNames,
            final DataSource dataSource) {
        DataRecord recordToSave = null;
        // Check if the record exists in the sync table:
        final DataRecord existingRecord =
                SyncDataSourceUtilities.loadRecord(dataSource, tableDef.getName(),
                    inventoryKeyNames, recordAndDto.getRecord());
        
        boolean lockAndSaveRecord = false;
        boolean checkInSuccessful = true;
        if (existingRecord == null) {
            // record does not exist
            // Insert the record into the sync table:
            lockAndSaveRecord = true;
            recordToSave = recordAndDto.getRecord();
            recordToSave.setNew(true);
        } else {
            // record exists
            // Check if the user is allowed to lock the record
            if (SyncDataSourceUtilities.isUserAllowedLockRecordForCheckin(tableDef.getName(),
                username, existingRecord)) {
                // user is allowed to lock the record
                // prepare updates of the existing record in the sync table
                lockAndSaveRecord = true;
                recordToSave = existingRecord;
                
                // apply new values from recordToCheckin
                for (final DataValue value : recordAndDto.getRecord().getFields()) {
                    recordToSave.setValue(value.getName(), value.getValue());
                }
            } else {
                // user is not allowed to lock the record, fail the record
                checkInSuccessful = false;
            }
        }
        
        if (lockAndSaveRecord) {
            lockAndSaveRecord(username, tableDef, fieldNamesFromRecord, dataSource,
                new IDocumentFieldsDao.RecordAndDto(recordToSave, recordAndDto.getRecordDto()));
        }
        
        return checkInSuccessful;
    }
    
    /**
     * Checks-out record from the specified sync table, locks the checked-out record for the
     * specified user.
     *
     * @param username of the current user.
     * @param tableDef of the sync table.
     * @param fieldNames the names of the fields in the sync table to be included in the list of
     *            checked-out records.
     * @param fieldNamesSeparated field names separated into two lists: document and non-document
     *            fields.
     * @param dataSource for the sync table.
     * @param recordToSave record to be saved using dataSource.
     * @param includeDocumentData when true, document data is populated in the doc_contents field.
     *            When false, the 'doc_contents' field contains null.
     * @return checked-out record.
     */
    Record checkOutRecord(final String username, final TableDef.ThreadSafe tableDef,
            final List<String> fieldNames, final FieldNames fieldNamesSeparated,
            final DataSource dataSource, final DataRecord recordToSave,
            final boolean includeDocumentData) {
        SyncDataSourceUtilities.lockRecord(recordToSave, username, tableDef.getName());
        // save the updated record
        final DataRecord recordSaved = dataSource.saveRecord(recordToSave);
        
        // Add the record to the array to return
        final Record recordDto =
                Converter.convertRecordToDto(recordToSave, tableDef.getName(), fieldNames);
        
        if (!fieldNamesSeparated.getDocumentFieldNames().isEmpty()) {
            final DataRecord recordWithPrimaryKeyValues =
                    SyncDataSourceUtilities.selectRecordWithPrimaryKeyValues(recordToSave,
                        recordSaved);
            
            // sets document field values in recordDto
            this.documentFieldsDao.checkOutDocumentFields(tableDef,
                new IDocumentFieldsDao.RecordAndDto(recordWithPrimaryKeyValues, recordDto),
                includeDocumentData);
        }
        
        return recordDto;
    }
    
    /**
     * Locks and saves record from recordAndDto. Checks-in document field values contained in DTO in
     * recordAndDto. If the content of a document field is "MARK_DELETED", marks the document as
     * deleted.
     *
     * @param username of the current user.
     * @param tableDef of the sync table.
     * @param fieldNamesFromRecord names of the fields from the record DTO.
     * @param dataSource for the sync table.
     * @param recordAndDto to be saved and checked-in.
     */
    void lockAndSaveRecord(final String username, final TableDef.ThreadSafe tableDef,
            final FieldNames fieldNamesFromRecord, final DataSource dataSource,
            final IDocumentFieldsDao.RecordAndDto recordAndDto) {
        final DataRecord recordSaved =
                SyncDataSourceUtilities.lockAndSaveRecord(dataSource, username,
                    recordAndDto.getRecord(), tableDef.getName());
        
        if (!fieldNamesFromRecord.getDocumentFieldNames().isEmpty()) {
            final DataRecord recordWithPrimaryKeyValues =
                    SyncDataSourceUtilities.selectRecordWithPrimaryKeyValues(
                        recordAndDto.getRecord(), recordSaved);
            
            this.documentFieldsDao.checkInDocumentFields(
                tableDef,
                new IDocumentFieldsDao.RecordAndDto(recordWithPrimaryKeyValues, recordAndDto
                    .getRecordDto()));
        }
    }
    
    /**
     * Retrieves Record: converts record to DTO and checks-out document fields of the record, if
     * fieldNamesSeparated contains document fields.
     *
     * @param fieldNames names of the fields in the record to be converted.
     * @param tableDef of the sync table.
     * @param fieldNamesSeparated field names separated into two lists: document and non-document
     *            fields.
     * @param record to be converted to DTO and to get the primary key values from.
     * @param includeDocumentData when true, document data is populated in the doc_contents field.
     *            When false, the 'doc_contents' field contains null.
     * @return DTO of the retrieved record.
     */
    Record retrieveRecord(final List<String> fieldNames, final TableDef.ThreadSafe tableDef,
            final FieldNames fieldNamesSeparated, final DataRecord record,
            final boolean includeDocumentData) {
        // Add the record to the array to return
        final Record recordDto =
                Converter.convertRecordToDto(record, tableDef.getName(), fieldNames);
        
        if (!fieldNamesSeparated.getDocumentFieldNames().isEmpty()) {
            // sets document field values in recordDto
            this.documentFieldsDao.checkOutDocumentFields(tableDef,
                new IDocumentFieldsDao.RecordAndDto(record, recordDto), includeDocumentData);
        }
        
        return recordDto;
    }

    @Override
    public List<Record> retrieveModifiedRecords(final List<String> fieldNames,
            final ParsedRestrictionDef restrictionDef, final ThreadSafe tableDef,
            final int pageSize, final boolean includeDocumentData, final double timestamp)
            throws ExceptionBase {

        final FieldNames fieldNamesSeparated =
                DocumentFieldsDataSourceUtilities.separateFieldNames(fieldNames, tableDef);

        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSourceForModifiedRecords(fieldNames, tableDef,
                    timestamp);

        final List<DataRecord> records = dataSource.getRecords(restrictionDef);

        final List<Record> recordsToReturn = new ArrayList<Record>();
        // For each record:
        for (final DataRecord record : records) {
            final Record recordDto =
                    retrieveRecord(fieldNames, tableDef, fieldNamesSeparated, record, true);

            recordsToReturn.add(recordDto);
        }

        return recordsToReturn;
    }

}
