package com.archibus.app.common.extensionsarcgis;

import com.archibus.datasource.DataSourceTestBase;

public class TestRoomExportConnector extends DataSourceTestBase {

    /**
     * Test the room export connector to see if it exports data correctly
     */
    public void testRoomExportConnector() {

        ArcgisConnectorManager.runJsonExportConnector("00-ArcGIS Export Rooms",
            "//becks/ai-projects/hq/enterprise-graphics/geo/rm-export-arcgis.json",
            "bl_id = 'bed-1002'");

    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "appContext-services.xml" };
    }
}
