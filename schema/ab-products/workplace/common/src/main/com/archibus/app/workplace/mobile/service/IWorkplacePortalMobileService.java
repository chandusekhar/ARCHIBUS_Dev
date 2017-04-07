package com.archibus.app.workplace.mobile.service;

import java.util.Map;

/**
 * API of the Workplace Portal Workflow Rule Service for mobile Workplace Services Portal
 * application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as
 * 'AbWorkplacePortal-WorkplacePortalMobileService'.
 * <p>
 * Provides methods for synchronization between sync table (activity_log_sync) and inventory table
 * (activity_log)
 * <p>
 * Invoked by mobile client.
 * 
 * @author Cristina Moldovan
 * @since 21.2
 */
public interface IWorkplacePortalMobileService {
    /**
     * Synchronizes service desk requests for the mobile Workplace Services Portal application.
     * 
     * @param userName User Name
     * @param userId User employee id from em table
     * @param activityType activity type. Empty if want to sync all types
     */
    void syncServiceDeskRequests(final String userName, final String userId,
            final String activityType);
    
    /**
     * Creates and submits a services desk request according to the passed request data.
     * 
     * @param userName User Name
     * @param requestParameters parameters of the request
     * @return the request id
     */
    Map<String, Object> createAndSubmitServiceDeskRequest(final String userName,
            Map<String, String> requestParameters);
    
}
