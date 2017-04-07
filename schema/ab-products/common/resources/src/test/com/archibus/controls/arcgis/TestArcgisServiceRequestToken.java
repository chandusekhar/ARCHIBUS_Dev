package com.archibus.controls.arcgis;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test ArcGIS Service Request Token method.
 */
public class TestArcgisServiceRequestToken extends DataSourceTestBase {
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml",
                "context\\reports\\reports.xml", "appContext-test.xml", "appContext-arcgis.xml" };
    }
    
    /**
     * Request token.
     */
    public void testArcgisServiceRequestToken() {
        
        final ArcgisService ags = new ArcgisService();
        final String token = ags.requestArcgisOnlineAccessToken();
        
        assertNotNull(token);
    }
    
}
