package com.archibus.eventhandler.rplm;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 *
 * Helper class for calculating lease area.
 * <p>
 *
 * @author Qiang
 * @since 22.1
 *
 */
public final class LeaseAreaHelper {

    /** ROOM SUITE lease area method. */
    public static final String LEASE_AREA_METHOD_ROOM_SUITE = "su";
    
    /** group lease area method. */
    public static final String LEASE_AREA_METHOD_ROOM_GROUP = "gp";

    /** room composite lease area method. */
    public static final String LEASE_AREA_METHOD_ROOM_COMPOSITE = "cr";
    
    /** all room lease area method. */
    public static final String LEASE_AREA_METHOD_ROOM_ALLROOM = "ar";
    
    // ----------------------- business methods --------------------------------
    
    /** The preference table name. */
    private static final String PREFERENCE_TBL_NAME = "afm_scmpref";
    
    /** The parameter of the building id. */
    private static final String INVENTORY_BL_ID = "inventoryBlId";

    /** The parameter of the floor id. */
    private static final String INVENTORY_FL_ID = "inventoryFlId";

    /** The parameter of the lease id. */
    private static final String INVENTORY_LS_ID = "inventoryLsId";

    /**
     *
     * Default conctructor non-instantiable.
     */
    private LeaseAreaHelper() {
    }

    /**
     * Get the lease area for the building and floor.
     *
     * @param blId building id
     * @param flId floor id
     * @param lsId lease id
     * @return the lease area.
     */
    public static double getLeaseAreaFromInventory(final String lsId, final String blId,
            final String flId) {
        final String leaseAreaMethod = getLeaseAreaMethod();
        double area = 0;
        DataSource inventoryDs =
                DataSourceFactory.loadDataSourceFromFile(
                    GroupSpaceAllocationHandlers.CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                    "calculateSuLeasedAreaDs");
        if (LEASE_AREA_METHOD_ROOM_GROUP.equalsIgnoreCase(leaseAreaMethod)) {
            inventoryDs =
                    DataSourceFactory.loadDataSourceFromFile(
                        GroupSpaceAllocationHandlers.CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                            "calculateGpLeasedAreaDs");
        } else if (LEASE_AREA_METHOD_ROOM_COMPOSITE.equalsIgnoreCase(leaseAreaMethod)
                || LEASE_AREA_METHOD_ROOM_ALLROOM.equalsIgnoreCase(leaseAreaMethod)) {
            inventoryDs =
                    DataSourceFactory.loadDataSourceFromFile(
                        GroupSpaceAllocationHandlers.CREATE_GROUP_INVENTORY_DS_FILE_NAME,
                        "calculateRoomCompositeOrAllLeasedAreaDs");
        }
        inventoryDs.addParameter(INVENTORY_BL_ID, blId, DataSource.DATA_TYPE_TEXT);
        inventoryDs.addParameter(INVENTORY_FL_ID, flId, DataSource.DATA_TYPE_TEXT);
        inventoryDs.addParameter(INVENTORY_LS_ID, lsId, DataSource.DATA_TYPE_TEXT);
        final List<DataRecord> records = inventoryDs.getRecords();
        if (!records.isEmpty()) {
            final DataRecord areaRecord = inventoryDs.getRecords().get(0);
            area = areaRecord.getDouble("gp.area");
        }
        return area;
    }
    
    /**
     * Get the method of lease area.
     *
     * @return the method
     */
    public static String getLeaseAreaMethod() {
        final DataRecord record = getLeasePreferences();
        return record.getString("afm_scmpref.lease_area_type");
    }
    
    /**
     * Get lease preference data record.
     *
     * @return data record.
     */
    private static DataRecord getLeasePreferences() {
        final String[] fieldNames = { "lease_area_type", "lease_proration_method" };
        final DataSource leasePrefDs =
                DataSourceFactory.createDataSourceForFields(PREFERENCE_TBL_NAME, fieldNames);
        return leasePrefDs.getRecord();
    }
}
