package com.archibus.eventhandler.helpdesk;

import java.text.ParseException;
import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * Test CommonHandler
 * 
 */
public class TestCommonHandler extends DataSourceTestBase {
    
    /**
     * test saveRecord().
     */
    public void testSaveRecord() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("tableName", "activity_log");
        context.addInputParameter("pkeyName", "activity_log_id");
        
        final Map<String, String> fields = new HashMap<String, String>();
        fields.put("activity_type", "SERVICE DESK - MAINTENANCE");
        fields.put("site_id", "MARKET");
        context.addInputParameter("fields", fields);
        
        final CommonHandler commonHandler = new CommonHandler();
        commonHandler.saveRecord(context);
        
        assertNotNull(context.getResponse().get("message"));
        final int id = ((Integer) context.getResponse().get("message")).intValue();
        assertTrue(id > 0);
    }
    
    /**
     * test getStatistic.
     * 
     * @throws ParseException
     */
    public void testGetStatistic() throws ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final CommonHandler commonHandler = new CommonHandler();
        commonHandler.getStatistic("autoapprove", "helpdesk_sla_response", "MAX",
            "activity_type = 'SERVICE DESK - MAINTENANCE'");
        assertNotNull(context.getResponse().get("jsonExpression"));
        final JSONObject json =
                new JSONObject((String) context.getResponse().get("jsonExpression"));
        assertEquals(1, json.getInt("statistic"));
    }
    
    /**
     * test getSelectList().
     * 
     * @throws ExceptionBase
     */
    public void testGetSelectList() throws ExceptionBase {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final CommonHandler commonHandler = new CommonHandler();
        commonHandler.getSelectList(Constants.STEP_TABLE, "step", "step", "");
        assertNotNull(context.getResponse().get("jsonExpression"));
    }
    
    /**
     * test getValue.
     * 
     * @throws ParseException
     */
    public void testGetValue() throws ParseException {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final CommonHandler commonHandler = new CommonHandler();
        commonHandler.getValue("afm_flds", "field_name",
            "table_name='activity_log' AND field_name='activity_log_id'");
        
        assertNotNull(context.getResponse().get("jsonExpression"));
        final JSONObject json =
                new JSONObject((String) context.getResponse().get("jsonExpression"));
        assertEquals(json.getString("field_name"), "activity_log_id");
    }
    
    /**
     * test getValues.
     * 
     * @throws ParseException
     */
    public void testGetValues() throws ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("table", "afm_flds");
        context.addInputParameter("fieldnames", "field_name;table_name");
        context.addInputParameter("sql",
            "table_name='activity_log' AND field_name='activity_log_id'");
        final CommonHandler commonHandler = new CommonHandler();
        commonHandler.getValues(context);
        
        assertNotNull(context.getResponse().get("jsonExpression"));
        final JSONObject json =
                new JSONObject((String) context.getResponse().get("jsonExpression"));
        assertEquals(json.getString("field_name"), "activity_log_id");
        assertEquals(json.getString("table_name"), "activity_log");
    }
    
}
