package com.archibus.eventhandler.msds.mobile;

/**
 *
 * Interface to be implemented by classes that provide services for Materials Inventory mobile app.
 *
 * @author Ana Paduraru
 * @since 22.1
 *
 */
public interface IMsdsMobileService {
    /**
     * Copy msds_location records for current site into msds_location_sync table and sets tier2
     * field value.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param siteId site code
     */
    void copyMaterialLocationToSyncTable(final String userName, final String siteId);
    
    /**
     * Update msds_location table based on msds_location_sync records by adding new records and
     * updating existing records.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param siteId site code
     */
    void updateMaterialLocationFromSyncTable(final String userName, final String siteId);

    /**
     * Remove msds_location_sync table records locked by userName for the siteId.
     *
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param siteId site code
     */
    void removeMaterialLocationFromSyncRecords(final String userName, final String siteId);
}
