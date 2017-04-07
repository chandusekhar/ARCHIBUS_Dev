package com.archibus.app.common.extensionsarcgis;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

public class TestPublishFeaturesToArcgisServer extends DataSourceTestBase {
    
    public void testPublishFeaturesToArcgisServer() {
        
        // Create the context/
        final EventHandlerContext c = ContextStore.get().getEventHandlerContext();

        // Create the dwgname context parameters.

        // Revit dwgname
        // final String dwgname = "bed-1004-level 1";

        // AutoCAD dwgname
        final String dwgname = "bed-1002_1";

        // Add the parameter to the context.
        c.addInputParameter("dwgname", dwgname);

        // Call publish features.
        ArcgisExtensionsPublisher.publishFeatures();

    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "appContext-services.xml" };
    }
    
}
