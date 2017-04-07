package com.archibus.eventhandler.helpdesk;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test ActivityHandler
 * 
 */
public class TestActivityHandler extends DataSourceTestBase {
    
    /**
     * test save activity
     * 
     * check if questionnaire is created
     */
    public void testSaveActivity() {
        
        try {
            final JSONObject fields = new JSONObject();
            fields.put("activitytype.activity_type", "SERVICE DESK - TESTinsert");
            fields.put("activitytype.description", "Testing");
            fields.put("activitytype.hide_fields", "eq_id");
            
            final JSONObject record = new JSONObject();
            record.put("fields", fields);
            
            final ActivityHandler handler = new ActivityHandler();
            handler.saveActivity(fields, "false");
        } catch (final Exception e) {
            e.printStackTrace();
            fail(" Global Exception " + e);
        }
        
    }
    
}
