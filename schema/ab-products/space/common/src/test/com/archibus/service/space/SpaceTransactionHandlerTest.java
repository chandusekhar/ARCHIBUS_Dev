package com.archibus.service.space;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.service.space.helper.SpaceTransactionCommon;

/**
 * Make unit test for class SpaceTransactionHandler.
 * 
 * @since 20.1
 * 
 */
public class SpaceTransactionHandlerTest extends DataSourceTestBase {
    
    /**
     * 
     * Test Archive Rmpct Records.
     */
    public void testArchiveRmpctRecords() {
        final SpaceTransactionHandler s = new SpaceTransactionHandler();
        s.archiveRmpctRecords();
    }
    
    /**
     * Test CheckRmstdEmstd.
     */
    public void testCheckRmstdEmstd() {
        final SpaceTransactionHandler s = new SpaceTransactionHandler();
        s.checkRmstdEmstd("AI", "HQ", "18", "101");
    }
    
    /**
     * 
     * Test CollectMetrics.
     */
    public void testCollectMetrics() {
        final SpaceTransactionHandler s = new SpaceTransactionHandler();
        s.collectMetrics();
    }
    
    /**
     * 
     * Test EnableOrDisableRoomTransaction.
     */
    public void testEnableOrDisableRoomTransaction() {
        final SpaceTransactionHandler s = new SpaceTransactionHandler();
        s.enableOrDisableRoomTransaction(true);
    }
    
    /**
     * 
     * Test GetDateValByActivityLogId.
     */
    public void testGetDateValByActivityLogId() {
        
        SpaceTransactionCommon.getDateValByActivityLogId(1024);
    }
    
    /**
     * 
     * Test SetResyncWorkspaceTransactionsTable.
     */
    public void testSetResyncWorkspaceTransactionsTable() {
        
        final SpaceTransactionHandler s = new SpaceTransactionHandler();
        s.setResyncWorkspaceTransactionsTable();
    }
    
    /**
     * 
     * Test UpdatePercentageOfSpaceWithoutHistory.
     */
    public void testUpdatePercentageOfSpaceWithoutHistory() {
        final java.util.Date d = new java.util.Date("2012-12-03");
        final SpaceTransactionHandler s = new SpaceTransactionHandler();
        s.updatePercentageOfSpaceWithoutHistory(d, "HQ", "18", "101");
    }
    
    /**
     * Test UpdateRmAndEmRecordsFromRmpct.
     */
    public void testUpdateRmAndEmRecordsFromRmpct() {
        final SpaceTransactionHandler s = new SpaceTransactionHandler();
        
        s.updateRmAndEmRecordsFromRmpct();
    }
    
}