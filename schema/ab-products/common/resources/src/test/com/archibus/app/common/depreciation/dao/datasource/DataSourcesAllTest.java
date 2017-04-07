package com.archibus.app.common.depreciation.dao.datasource;

import java.util.List;

import com.archibus.app.common.depreciation.dao.*;
import com.archibus.app.common.depreciation.domain.*;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class DataSourcesAllTest extends DataSourceTestBase {

    /**
     * testGetDepreciableEquipment.
     */
    public void testGetDepreciableEquipment() {
        final IEquipmentDao<Equipment> equipmentDao = new EquipmentDataSource();
        final List<Equipment> equipmentList = equipmentDao.getDepreciableEquipmentList();

        assertEquals(true, !equipmentList.isEmpty());

    }

    /**
     * testGetCountOfDepreciableEquipment.
     */
    public void testGetCountOfDepreciableEquipment() {
        final IEquipmentDao<Equipment> equipmentDao = new EquipmentDataSource();
        final int depreciableEquipmentNo = equipmentDao.getCountOfDepreciableEquipment();

        assertEquals(true, depreciableEquipmentNo > 0);

    }

    /**
     * testGetDepreciableFurniture.
     */
    public void testGetDepreciableFurniture() {
        final IFurnitureDao<Furniture> furnitureDao = new FurnitureDataSource();
        final List<Furniture> furnitureList = furnitureDao.getDepreciableFurnitureList();

        assertEquals(true, !furnitureList.isEmpty());

    }

    /**
     * testGetCountOfDepreciableEquipment.
     */
    public void testGetCountOfDepreciableFurniture() {
        final IFurnitureDao<Furniture> furnitureDao = new FurnitureDataSource();
        final int depreciableFurnitureNo = furnitureDao.getCountOfDepreciableFurniture();

        assertEquals(true, depreciableFurnitureNo > 0);

    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "depreciationDataSources.xml" };
    }

}
