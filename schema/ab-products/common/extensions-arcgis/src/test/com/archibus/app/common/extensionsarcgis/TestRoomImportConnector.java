package com.archibus.app.common.extensionsarcgis;

import com.archibus.datasource.DataSourceTestBase;

public class TestRoomImportConnector extends DataSourceTestBase {
    
    public void testRoomImportConnector() {
        
        ArcgisConnectorManager
            .runJsonImportConnector(
                "00-ArcGIS Import Rooms",
                "/usr/local/apache-tomcat-7-9300/webapps/archibus/ai-projects/gds_v2/enterprise-graphics/geo/rm-import-arcgis.json");
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "com/archibus/app/common/extensionsarcgis/connectorDataSource.xml" };
    }
}
