package com.archibus.eventhandler.msds.mobile.impl;

import com.archibus.eventhandler.msds.mobile.IMsdsMobileService;

/**
 *
 * Provides services for mobile app Materials Inventory.
 *
 * @author Ana Paduraru
 * @since 22.1
 *
 */
public class MsdsMobileService implements IMsdsMobileService {
    
    /** {@inheritDoc} */
    @Override
    public void copyMaterialLocationToSyncTable(final String userName, final String siteId) {
        // remove the material location sync records from msds_location_sync table
        DataSourceUtilities.removeMaterialLocationSyncRecords(userName, siteId);
        
        // copy records from msds_location table to the msds_location_sync table
        DataSourceUtilities.copyMaterialLocationRecordsToSyncTable(userName, siteId);

    }
    
    /** {@inheritDoc} */
    @Override
    public void updateMaterialLocationFromSyncTable(final String userName, final String siteId) {
        DataSourceUtilities.updateMaterialLocationFromSyncTable(userName, siteId);

    }
    
    /** {@inheritDoc} */
    @Override
    public void removeMaterialLocationFromSyncRecords(final String userName, final String siteId) {
        // remove the material location sync records from msds_location_sync table
        DataSourceUtilities.removeMaterialLocationSyncRecords(userName, siteId);
    }

}
