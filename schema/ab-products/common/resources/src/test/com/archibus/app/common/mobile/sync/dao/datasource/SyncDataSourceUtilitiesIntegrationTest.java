package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.mobile.sync.*;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.ViewField;
import com.archibus.schema.TableDef;

/**
 * Integration tests for SyncDataSourceUtilities.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class SyncDataSourceUtilitiesIntegrationTest extends AbstractIntegrationTest {
    private static final String FIELD_NAME_FROM_PARAMETER = "FieldNameFromParameter";
    
    /**
     * Test method for {@link SyncDataSource#extractFieldNamesFromFirstRecord(List)} .
     */
    public final void testCreateDataSource() {
        final TableDef.ThreadSafe tableDef = prepareTableDef();
        final List<String> fieldNames = prepareFieldNames();
        
        final DataSource actual =
                SyncDataSourceUtilities.createDataSource(fieldNames, tableDef, true);
        
        assertEquals(Constants.WR_SYNC, actual.getMainTableName());
        assertEquals(10, actual.getFieldNames().size());
        assertEquals(Constants.WR_SYNC_WR_ID, actual.getFieldNames().get(0));
        assertEquals("wr_sync.bl_id", actual.getFieldNames().get(1));
        assertEquals("wr_sync.fl_id", actual.getFieldNames().get(2));
        assertEquals("wr_sync.rm_id", actual.getFieldNames().get(3));
        assertEquals("wr_sync.description", actual.getFieldNames().get(4));
        assertEquals("wr_sync.status", actual.getFieldNames().get(5));
        assertEquals("wr_sync.doc1", actual.getFieldNames().get(6));
        assertEquals("wr_sync." + SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER, actual
            .getFieldNames().get(7));
        assertEquals("wr_sync." + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, actual
            .getFieldNames().get(8));
    }
    
    /**
     * Test method for {@link SyncDataSource#extractFieldNamesFromFirstRecord(List)} .
     */
    public final void testExtractFieldNamesFromFirstRecord() {
        final List<Record> records = new ArrayList<Record>();
        
        // first record
        {
            final Record record = new Record();
            record.addOrSetFieldValue("JUNK", null);
            record.addOrSetFieldValue(Constants.WR_ID, null);
            record.addOrSetFieldValue(Constants.DOC1, null);
            records.add(record);
        }
        
        // second record
        {
            final Record record = new Record();
            records.add(record);
        }
        
        final DocumentFieldsDataSource.FieldNames actual =
                SyncDataSourceUtilities
                    .extractFieldNamesFromFirstRecord(records, prepareTableDef());
        
        {
            final List<String> nonDocumentFieldNames = actual.getNonDocumentFieldNames();
            assertEquals(1, nonDocumentFieldNames.size());
            assertEquals(Constants.WR_ID, nonDocumentFieldNames.get(0));
        }
        
        {
            final List<String> documentFieldNames = actual.getDocumentFieldNames();
            assertEquals(1, documentFieldNames.size());
            assertEquals(Constants.DOC1, documentFieldNames.get(0));
        }
    }
    
    /**
     * Test method for {@link SyncDataSource#loadRecord(DataSource, String, List, DataRecord)} .
     */
    public final void testLoadRecordDoesNotExist() {
        // record does not exist in wr_sync table
        final TableDef.ThreadSafe tableDef = prepareTableDef();
        
        final List<String> fieldNames = prepareFieldNames();
        
        final List<String> inventoryKeyNames = prepareInventoryKeyNames();
        
        final String tableName = Constants.WR_SYNC;
        final DataRecord record = new DataRecord();
        {
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(tableName + Constants.DOT + Constants.WR_ID,
                        false, false);
            record.addField(viewField);
            
            record.setValue(Constants.WR_SYNC_WR_ID, new Integer(Constants.WR_ID_DOES_NOT_EXIST_1));
        }
        
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(fieldNames, tableDef, true);
        final DataRecord actual =
                SyncDataSourceUtilities
                    .loadRecord(dataSource, tableName, inventoryKeyNames, record);
        
        assertEquals(null, actual);
    }
    
    /**
     * Test method for {@link SyncDataSource#loadRecord(DataSource, String, List, DataRecord)} .
     */
    public final void testLoadRecordExists() {
        // record exists in wr_sync table
        final TableDef.ThreadSafe tableDef = prepareTableDef();
        
        final List<String> fieldNames = prepareFieldNames();
        
        final List<String> inventoryKeyNames = prepareInventoryKeyNames();
        
        final String tableName = Constants.WR_SYNC;
        final DataRecord record = new DataRecord();
        {
            final ViewField.Immutable viewField =
                    MockUtilities.createMockViewField(tableName + Constants.DOT + Constants.WR_ID,
                        false, false);
            record.addField(viewField);
            
            record.setValue(Constants.WR_SYNC_WR_ID, new Integer(
                Constants.WR_ID_EXISTING_NOT_LOCKED));
        }
        
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(fieldNames, tableDef, true);
        final DataRecord actual =
                SyncDataSourceUtilities
                    .loadRecord(dataSource, tableName, inventoryKeyNames, record);
        
        assertEquals(new Integer(Constants.WR_ID_EXISTING_NOT_LOCKED),
            actual.getValue(Constants.WR_SYNC_WR_ID));
        assertEquals("HQ", actual.getValue("wr_sync.bl_id"));
        assertEquals("19", actual.getValue("wr_sync.fl_id"));
        assertEquals("109", actual.getValue("wr_sync.rm_id"));
    }
    
    /**
     * Test method for
     * {@link SyncDataSource#lockAndSaveRecord(DataSource, String, DataRecord, String)} .
     */
    public final void testLockAndSaveRecordDoesNotExist() {
        final TableDef.ThreadSafe tableDef = prepareTableDef();
        
        final List<String> fieldNames = prepareFieldNames();
        
        final String tableName = Constants.WR_SYNC;
        
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(fieldNames, tableDef, true);
        
        // record does not exist in wr_sync table
        final DataRecord record = dataSource.createNewRecord();
        record.setValue(Constants.WR_SYNC_WR_ID, new Integer(Constants.WR_ID_DOES_NOT_EXIST_1));
        record.setValue(Constants.WR_SYNC + SyncDataSourceUtilities.DOT + Constants.STATUS,
            Constants.STATUS_TST);
        
        SyncDataSourceUtilities.lockAndSaveRecord(dataSource, Constants.AI, record, tableName);
        
        verifyRecordIsLocked(tableName, dataSource, Constants.WR_ID_DOES_NOT_EXIST_1);
    }
    
    /**
     * Test method for
     * {@link SyncDataSource#lockAndSaveRecord(DataSource, String, DataRecord, String)} .
     */
    public final void testLockAndSaveRecordExists() {
        final TableDef.ThreadSafe tableDef = prepareTableDef();
        
        final List<String> fieldNames = prepareFieldNames();
        
        prepareInventoryKeyNames();
        
        final String tableName = Constants.WR_SYNC;
        
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(fieldNames, tableDef, true);
        
        // record exists in wr_sync table
        final DataRecord record =
                dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS
                        + Constants.WR_ID_EXISTING_NOT_LOCKED);
        record.setValue(Constants.WR_SYNC + SyncDataSourceUtilities.DOT + Constants.STATUS,
            Constants.STATUS_TST);
        
        SyncDataSourceUtilities.lockAndSaveRecord(dataSource, Constants.AI, record, tableName);
        
        verifyRecordIsLocked(tableName, dataSource, Constants.WR_ID_EXISTING_NOT_LOCKED);
    }
    
    /**
     * Test method for
     * {@link SyncDataSource#prepareFieldNamesForDataSource(List, TableDef.ThreadSafe, boolean)} .
     */
    public final void testPrepareFieldNamesForDataSource() {
        final TableDef.ThreadSafe tableDef = prepareTableDef();
        final List<String> fieldNames = prepareFieldNames();
        
        // case #1: isSyncTable=true
        {
            final List<String> actual =
                    SyncDataSourceUtilities.prepareFieldNamesForDataSource(fieldNames, tableDef,
                        true);
            
            assertEquals(10, actual.size());
            assertEquals(Constants.WR_ID, actual.get(0));
            assertEquals("bl_id", actual.get(1));
            assertEquals("fl_id", actual.get(2));
            assertEquals("rm_id", actual.get(3));
            assertEquals("description", actual.get(4));
            assertEquals(Constants.STATUS, actual.get(5));
            assertEquals(Constants.DOC1, actual.get(6));
            assertEquals(SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER, actual.get(7));
            assertEquals(SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER, actual.get(8));
        }
        
        // case #2: isSyncTable=false
        {
            final List<String> actual =
                    SyncDataSourceUtilities.prepareFieldNamesForDataSource(fieldNames, tableDef,
                        false);
            
            assertEquals(8, actual.size());
            assertEquals(Constants.WR_ID, actual.get(0));
            assertEquals("bl_id", actual.get(1));
            assertEquals("fl_id", actual.get(2));
            assertEquals("rm_id", actual.get(3));
            assertEquals("description", actual.get(4));
            assertEquals(Constants.STATUS, actual.get(5));
        }
    }
    
    /**
     * Test method for
     * {@link SyncDataSourceUtilities#prepareFieldNamesForDataSource(java.util.List, com.archibus.schema.TableDef.ThreadSafe, boolean)}
     * .
     */
    public final void testPrepareFieldNamesForDataSourceListOfStringThreadSafe() {
        final List<String> fieldNames = new ArrayList<String>();
        fieldNames.add(FIELD_NAME_FROM_PARAMETER);
        
        final TableDef.ThreadSafe tableDef = this.prepareTableDef();
        
        final List<String> actual =
                SyncDataSourceUtilities.prepareFieldNamesForDataSource(fieldNames, tableDef, true);
        
        assertEquals(FIELD_NAME_FROM_PARAMETER, actual.get(0));
        assertEquals("mob_is_changed", actual.get(1));
        assertEquals("mob_locked_by", actual.get(2));
        assertEquals("auto_number", actual.get(3));
    }
}
