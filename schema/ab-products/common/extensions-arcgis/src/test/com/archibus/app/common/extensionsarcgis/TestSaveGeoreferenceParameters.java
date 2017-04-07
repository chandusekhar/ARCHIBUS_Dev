package com.archibus.app.common.extensionsarcgis;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;

public class TestSaveGeoreferenceParameters extends DataSourceTestBase {
    
    public void testSaveGeoreferenceParameters() {

        // Create the dwgname and geoInfo method parameters.
        final String dwgname = "b-us-ma-1002_1";
        final JSONObject geoInfo = new JSONObject();
        geoInfo.put("geoX", 716962.14292471);
        geoInfo.put("geoY", 3016326.61686288);
        geoInfo.put("geoScale", 0.08333333);
        geoInfo.put("geoRotate", 48.02869774);
        geoInfo.put("geoSRS", "EPSG:2249");
        geoInfo.put("geoLevel", 1);

        // Add input parameters to the context.
        this.c.addInputParameter("methodName", "saveGeoreferenceParameters");
        this.c.addInputParameter("dwgname", dwgname);
        this.c.addInputParameter("geoInfo", geoInfo.toString());

        // Call the workflow rule.
        final ArcgisExtensionsService service = new ArcgisExtensionsService();
        service.callWorkflowRuleFromSmartClientExtension();
        
    }
}
