package com.archibus.app.hoteling.service.mobile;

import java.util.Map;

import org.json.*;

/**
 * API of the Workplace Portal Hoteling Workflow Rule Service for mobile Workplace Services Portal
 * application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as
 * 'AbWorkplacePortal-WorkplacePortalHotelingMobileService'.
 * <p>
 * Provides methods for find, book and cancel rooms
 * <p>
 * Invoked by mobile client.
 * 
 * @author Cristina Moldovan
 * @since 21.2
 */
public interface IWorkplacePortalHotelingMobileService {
    
    /**
     * Calls HotelingBookingService.searchAvailableSpaces()
     * 
     * This method serve as a WFR to search all available spaces and return result as data records
     * list, by which the JS code will manually create a Building-Floor-Room tree.
     * 
     * @param searchParameter search parameter from the console in the client
     * @param recurringRule recurring rule
     */
    void searchAvailableSpaces(final JSONObject searchParameter, final String recurringRule);
    
    /**
     * Create booking.
     * 
     * @param requestParameters the booking request parameters
     */
    void createBooking(Map<String, Object> requestParameters);
    
    /**
     * cancel bookings for use selection.
     * 
     * @param operationLevel operationLevel
     * @param pctIDs the selected rmpct
     * @param parentId parent rmpct
     * @param emIDs employees
     * @param visitorIDs visitors
     * @param blIDs building codes
     * @param activityLogId request
     */
    void cancelBooking(final String operationLevel, final JSONArray pctIDs, final String parentId,
            final JSONArray emIDs, final JSONArray visitorIDs, final JSONArray blIDs,
            final String activityLogId);
    
    /**
     * Check-in bookings for use selection.
     * 
     * @param userName User Name
     * @param requestParameters the pct id
     */
    void checkInBooking(final String userName, Map<String, String> requestParameters);
    
}
