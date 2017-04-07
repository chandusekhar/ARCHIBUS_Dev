package com.archibus.eventhandler.AssetDepreciation;

import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerTestBaseImpl;

/**
 * Unit test for AssetPaginatedReportGenerator.
 */
public class TestAssetPaginatedReportGenerator extends EventHandlerTestBaseImpl {
    /**
     * Test value for bl_id.
     */
    private static final String TEST_BL_ID = "HQ";
    
    /**
     * Test value for fl_id.
     */
    private static final String TEST_FL_ID = "17";
    
    /**
     * Test value for rm_id.
     */
    private static final String TEST_RM_ID = "118";
    
    /**
     * Test value for view title.
     */
    private static final String TEST_VIEW_TITLE = "Test Document";
    
    /**
     * Call the AssetPaginatedReportGenerator and test the getCurrentMoParameters method.
     */
    public void testGetCurrentMoParameters() {
        // call event-handler method
        final AssetPaginatedReportGenerator handler =
                new AssetPaginatedReportGenerator(null, null, null, TEST_VIEW_TITLE);
        
        final Map<String, Object> moParameters =
                handler.getCurrentMoParameters(TEST_BL_ID, TEST_FL_ID, TEST_RM_ID);
        assertEquals(moParameters.get("blId"), TEST_BL_ID);
    }
    
    /**
     * Call the AssetPaginatedReportGenerator and test the getCurrentMoRestriction method.
     */
    public void testGetCurrentMoRestriction() {
        // call event-handler method
        final AssetPaginatedReportGenerator handler =
                new AssetPaginatedReportGenerator(null, null, null, TEST_VIEW_TITLE);
        
        final Map<String, Object> moRestriction =
                handler.getCurrentMoRestriction(TEST_BL_ID, TEST_FL_ID, TEST_RM_ID);
        assertEquals(moRestriction.get("ds_abApFnstdByRm_bl"),
            "bl.bl_id=" + SqlUtils.formatValueForSql(TEST_BL_ID));
    }
    
    /**
     * Call the AssetPaginatedReportGenerator and test the getIterator method.
     */
    public void testGetIterator() {
        // call event-handler method
        final AssetPaginatedReportGenerator handler =
                new AssetPaginatedReportGenerator(null, null, null, TEST_VIEW_TITLE);
        
        Iterator<DataRecord> iterator = handler.getIterator("fl", TEST_BL_ID + "QQQQQ", null);
        assertFalse(iterator.hasNext());
        
        iterator = handler.getIterator("rm", TEST_BL_ID, TEST_FL_ID);
        assertTrue(iterator.hasNext());
    }
}
