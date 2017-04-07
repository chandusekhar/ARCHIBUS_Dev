package com.archibus.eventhandler.AssetDepreciation;

import com.archibus.datasource.DataSourceTestBase;

public class AssetServiceTest extends DataSourceTestBase {
    /*
     * calculate equipment depreciation
     */
    public void testCalculateEquipmentDepreciation() {
        AssetService handler = new AssetService();
        handler.calculateEquipmentDepreciation();
    }

    /*
     * calculate tagged furniture depreciation
     */
    public void testCalculateTaggedFurnitureDepreciation() {
        AssetService handler = new AssetService();
        handler.calculateTaggedFurnitureDepreciation();
    }

}
