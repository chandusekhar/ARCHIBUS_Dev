package com.archibus.app.common.mobile.sync;

import java.util.*;

import com.archibus.app.common.mobile.sync.dao.datasource.SyncDataSourceUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.TableDef;

/**
 * Base class for integration tests in this package.
 * <p>
 * On set up inserts records into wr_sync table.
 * <p>
 * Provides prepare<...> and verify<...> convenience methods, related to preparing test data and
 * verifying test results in wr_sync table.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public abstract class AbstractIntegrationTest extends DataSourceTestBase {
    public static List<String> prepareFieldNames() {
        final List<String> fieldNames = prepareNonDocumentFieldNames();
        fieldNames.addAll(prepareDocumentFieldNames());
        
        return fieldNames;
    }
    
    protected static List<String> prepareDocumentFieldNames() {
        final List<String> fieldNames = new ArrayList<String>();
        fieldNames.add(Constants.DOC1);
        
        return fieldNames;
    }
    
    protected static List<String> prepareInventoryKeyNames() {
        final List<String> inventoryKeyNames = new ArrayList<String>();
        inventoryKeyNames.add(Constants.WR_ID);
        
        return inventoryKeyNames;
    }
    
    protected static List<String> prepareNonDocumentFieldNames() {
        final List<String> fieldNames = prepareInventoryKeyNames();
        fieldNames.add("bl_id");
        fieldNames.add("fl_id");
        fieldNames.add("rm_id");
        fieldNames.add("description");
        fieldNames.add(Constants.STATUS);
        
        return fieldNames;
    }
    
    static void insertWrSyncRecords() {
        {
            // existing record, not locked
            final String sql =
                    "INSERT INTO wr_sync (wr_id, bl_id, fl_id, rm_id, status) VALUES ("
                            + Constants.WR_ID_EXISTING_NOT_LOCKED + ",'HQ', '19', '109', 'H')";
            SqlUtils.executeUpdate(Constants.WR_SYNC, sql);
        }
        {
            // existing record, locked by user AFM
            final String sql =
                    "INSERT INTO wr_sync (wr_id, bl_id, fl_id, rm_id, status, "
                            + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER + ") VALUES ("
                            + Constants.WR_ID_EXISTING_LOCKED_BY_AFM
                            + ",'HQ', '19', '110', 'H', 'AFM')";
            SqlUtils.executeUpdate(Constants.WR_SYNC, sql);
        }
        {
            // existing record, locked by user AI
            final String sql =
                    "INSERT INTO wr_sync (wr_id, bl_id, fl_id, rm_id, status, "
                            + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER + ") VALUES ("
                            + Constants.WR_ID_EXISTING_LOCKED_BY_AI
                            + ",'HQ', '19', '111', 'Can', 'AI')";
            SqlUtils.executeUpdate(Constants.WR_SYNC, sql);
        }
    }
    
    /** {@inheritDoc} */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        
        // insert records that are assumed to exist in database
        insertWrSyncRecords();
    }
    
    protected TableDef.ThreadSafe prepareTableDef() {
        final TableDef.ThreadSafe tableDef =
                this.context.getProject().loadTableDef(Constants.WR_SYNC);
        
        return tableDef;
    }
    
    protected void verifyRecordIsLocked(final String tableName, final DataSource dataSource,
            final String wrId) {
        final DataRecord actual =
                dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS + wrId);
        
        assertEquals(new Integer(wrId), actual.getValue(Constants.WR_SYNC_WR_ID));
        assertEquals(
            Constants.AI,
            actual.getValue(tableName + SyncDataSourceUtilities.DOT
                    + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER));
        
        assertEquals(
            1,
            actual.getValue(tableName + SyncDataSourceUtilities.DOT
                    + SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER));
        
        assertEquals(Constants.STATUS_TST,
            actual.getValue(tableName + SyncDataSourceUtilities.DOT + Constants.STATUS));
    }
    
    protected void verifyRecordIsLocked(final String tableName, final String fieldName,
            final String fieldValue, final DataSource dataSource) {
        final DataRecord actual =
                dataSource.getRecord(fieldName + Constants.EQUALS + "'" + fieldValue + "'");
        
        assertEquals(
            Constants.AI,
            actual.getValue(tableName + SyncDataSourceUtilities.DOT
                    + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER));
        
        assertEquals(
            1,
            actual.getValue(tableName + SyncDataSourceUtilities.DOT
                    + SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER));
    }
}
