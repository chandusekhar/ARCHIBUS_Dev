package com.archibus.eventhandler.helpdesk;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test HelpdeskBase
 * 
 */
public class TestHelpdeskBase extends DataSourceTestBase {
    
    /**
     * test method getCfIdForCurrentUser().
     */
    public void testGetCfIdForCurrentUser() {
        final String cfId = HelpdeskEventHandlerBase.getCfIdForCurrentUser();
        assertNull(cfId);
    }
    
    /**
     * test method notNull().
     */
    public void testNotNull() {
        final String result = HelpdeskEventHandlerBase.notNull(null);
        assertEquals(result, "");
    }
}
