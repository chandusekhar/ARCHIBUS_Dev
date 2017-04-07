package com.archibus.eventhandler.helpdesk;

import java.util.List;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Test Common
 * 
 */
public class TestCommon extends DataSourceTestBase {
    
    /**
     * Test getStatusValue.
     */
    public void testGetStatusValue() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String status = Common.getStatusValue(context, "activity_log", "activity_log_id", 1);
        assertNotNull(status);
    }
    
    /**
     * Test getValue().
     */
    public void testGetValue() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int result =
                HelpdeskEventHandlerBase.getIntegerValue(context, Common.getValue(context,
                    "activity_log", "activity_log_id", "activity_log_id = 1"));
        assertTrue(result == 1);
    }
    
    /**
     * Test getMaxId().
     */
    public void testGetMaxId() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int maxId = Common.getMaxId(context, "activity_log", "activity_log_id");
        assertTrue(maxId > 0);
    }
    
    /**
     * Test selectXmlNodes().
     */
    public void testSelectXmlNodes() {
        final List<Object> notes =
                Common.selectXmlNodes("<records><record/><record/><record/></records>",
                    "descendant::record");
        assertTrue(notes.size() == 3);
    }
    
    /**
     * Test getCurrentDate().
     */
    public void testGetCurrentDate() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String dsteString = Common.getCurrentDate(context);
        assertNotNull(dsteString);
    }
    
    /**
     * Test getCurrentTime().
     */
    public void testGetCurrentTime() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String timeString = Common.getCurrentTime(context);
        assertNotNull(timeString);
    }
    
    /**
     * Test getActivityWorkflowTable().
     */
    public void testGetActivityWorkflowTable() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String table = Common.getActivityWorkflowTable(context, "AbBldgOpsHelpDesk");
        assertEquals(table, "activity_log");
    }
    
    /**
     * Test formatSqlStatusOrder().
     */
    public void testFormatSqlStatusOrder() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                Common.formatSqlStatusOrder(context, new String[] { "AbBldgOpsHelpDesk" });
        assertNotNull(sql);
    }
    
    /**
     * Test generateUUID().
     */
    public void testGenerateUUID() {
        final String uuid = Common.generateUUID();
        assertNotNull(uuid);
    }
    
    /**
     * Test stringArrayToString().
     */
    public void testStringArrayToString() {
        final String result = Common.stringArrayToString(new String[] { "1", "2", "3", "4", "5" });
        assertEquals(result, "1,2,3,4,5");
    }
}
