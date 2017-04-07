package com.archibus.app.common.extensionsarcgis;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

public class TestUpdateArcgisRoomFeatureData extends DataSourceTestBase {

    public void testUpdateArcgisRoomFeatureData() {
        final EventHandlerContext c = ContextStore.get().getEventHandlerContext();

        try {
            // Create the dwgname context parameters.
            final String dwgname = "B-US-MA-1002-LEVEL 1";
            // final String dwgname = "B-US-MA-DEMO-LEVEL 1";
            // Add the parameter to the context.
            c.addInputParameter("dwgname", dwgname);

            // ArcgisExtensionsService.updateArcgisFeatureDataForDrawing();

        } catch (final NullPointerException e) {
            System.out.println(e.getStackTrace());

        }
    }

}
