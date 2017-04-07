package com.archibus.controls.arcgis;

import com.archibus.datasource.DataSourceTestBase;

public class TestArcgisService extends DataSourceTestBase {
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml",
                "context\\reports\\reports.xml", "appContext-test.xml",
                // "context\\applications\\applications.xml" };
                "context\\applications\\appContext-services.xml" };
    }
    
    public void testRequestArcgisOnlineAccessToken() {
        
        final ArcgisService ags = new ArcgisService();
        ags.requestArcgisOnlineAccessToken();
        
    }
    
}
