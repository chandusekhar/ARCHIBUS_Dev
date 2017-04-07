package com.archibus.eventhandler.helpdesk;

import java.text.ParseException;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Tester
 */
public class Tester extends DataSourceTestBase {
    
    /**
     * test CopyRequest.
     * 
     * @throws ParseException
     */
    public void testCopyRequest() throws ParseException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final JSONObject record = new JSONObject();
        record.put("activity_log.requestor", "AFM");
        record.put("activity_log.site_id", "MARKET");
        record.put("activity_log.bl_id", "HQ");
        record.put("activity_log.priority", new Integer(3));
        record.put("activity_log.activity_type", "SERVICE DESK - COPY SERVICE");
        
        final RequestHandler hanlder = new RequestHandler();
        hanlder.submitRequest("", record);
        
        assertNotNull(context.getResponse().get("jsonExpression"));
        
        final JSONObject jsonObject =
                new JSONObject((String) context.getResponse().get("jsonExpression"));
        final int activity_log_id = jsonObject.getInt("activity_log_id");
        assertTrue(activity_log_id > 0);
        
    }
}
