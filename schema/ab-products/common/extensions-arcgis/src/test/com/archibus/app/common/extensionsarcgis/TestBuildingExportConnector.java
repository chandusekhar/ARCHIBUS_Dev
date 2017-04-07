package com.archibus.app.common.extensionsarcgis;

import com.archibus.datasource.DataSourceTestBase;

public class TestBuildingExportConnector extends DataSourceTestBase {

    /**
     * Test the building export connector to see if it exports data correctly
     */
    public void testBuildingExportConnector() {

        ArcgisConnectorManager.runJsonExportConnector("00-ArcGIS Export Buildings",
            "//becks/ai-projects/hq/enterprise-graphics/geo/bl-export-arcgis.json", "1=1");

    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
        "appContext-services.xml" };
    }
}
