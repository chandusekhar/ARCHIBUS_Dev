package com.archibus.app.common.extensionsarcgis;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

public class TestUpdateArcgisBuildingFeatureData extends DataSourceTestBase {

    public void testUpdateArcgisBuildingFeatureData() {
        final EventHandlerContext c = ContextStore.get().getEventHandlerContext();

        final String whereClause = "bl_id='marriottharborbeach-floorplan-level1'";
        // final String whereClause = "1=1";

        c.addInputParameter("whereClause", whereClause);

        // ArcgisExtensionsService.updateArcgisFeatureDataWithRestriction("bl", whereClause);
    }

}
