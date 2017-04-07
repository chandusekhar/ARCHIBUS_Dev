package com.archibus.eventhandler.AssetDepreciation;

import java.text.ParseException;
import java.util.Map;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Unit test for AssetHandler.
 */
public class TestAssetHandler extends DataSourceTestBase {
    
    /**
     * Call the asset handler to create the paginated report.
     * 
     * @throws ParseException from parsing JSONObject
     */
    public void testOnPaginatedReport() throws ParseException {
        // prepare the event handler context and start the transaction
        final EventHandlerContext context = createTestContext();
        try {
            // call event-handler method
            final AssetHandler handler = new AssetHandler();
            handler.onPaginatedReport("HQ", "17", "118", "Test Document");
            
            // verifies event-handler results
            final Map<Object, Object> response = context.getResponse();
            final JSONObject json = new JSONObject((String) response.get("jsonExpression"));
            assertNotNull(json);
            assertTrue(json.getString("jobId").startsWith("job_"));
        } finally {
            // roll back the transaction
            releaseTestContext(context);
        }
    }
}
