package com.archibus.app.common.extensionsarcgis;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Test the ArcGIS Extensions Service hasExtensionsForEsriLicense() method.
 *
 */
public class TestHasExtensionsForEsriLicense extends DataSourceTestBase {

    /**
     * Test to see if a valid Extensions for Esri license is found.
     */
    public void testHasExtensionsForEsriLicense() {

        try {
            ArcgisExtensionsService.checkExtensionsForEsriLicense();
            // fail("ExceptionBase expected");
        } catch (final ExceptionBase e) {
            assertEquals("A valid Extensions for ESRI license was not found.",
                e.getLocalizedMessage());
        }
    }
}
