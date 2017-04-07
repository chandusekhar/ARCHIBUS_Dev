package com.archibus.app.hoteling.service.mobile.impl;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;

import java.text.ParseException;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.app.hoteling.service.mobile.IWorkplacePortalHotelingMobileService;
import com.archibus.eventhandler.hoteling.HotelingBookingService;

/**
 * Implementation of the WorkplacePortal Hoteling Workflow Rule Service for Workplace Services
 * Portal mobile application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as
 * 'AbWorkplacePortal-WorkplacePortalHotelingMobileService'.
 * <p>
 * Provides methods for find, book and cancel rooms. Uses HotelingBookingService class
 * <p>
 * Invoked by mobile client.
 * 
 * @author Cristina Moldovan
 * @since 21.2
 * 
 */
public class WorkplacePortalHotelingMobileService implements IWorkplacePortalHotelingMobileService {
    /** The logger. */
    private final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * {@inheritDoc}
     */
    public void searchAvailableSpaces(final JSONObject searchParameter, final String recurringRule) {
        HotelingBookingService.searchAvailableSpaces(searchParameter, recurringRule);
    }
    
    /**
     * {@inheritDoc}
     */
    public void createBooking(final Map<String, Object> requestParameters) {
        final String userDvId = (String) requestParameters.get(DV_ID);
        final String userDpId = (String) requestParameters.get(DP_ID);
        final String dayPart = (String) requestParameters.get(DAY_PART);
        final String recurringRule = (String) requestParameters.get(RECURRING_RULE);
        Date dateStart = null;
        Date dateEnd = null;
        final DateAndTimeUtilities util = new DateAndTimeUtilities();
        final JSONArray bookings = (JSONArray) requestParameters.get(BOOKINGS);
        
        try {
            dateStart = util.createDate((String) requestParameters.get(DATE_START));
            dateEnd = util.createDate((String) requestParameters.get(DATE_END));
        } catch (final ParseException e) {
            this.logger.error("Invalid date", e);
        }
        
        HotelingBookingService.createBookings(userDvId, userDpId, dayPart, dateStart, dateEnd,
            recurringRule, bookings);
    }
    
    /**
     * {@inheritDoc}
     */
    public void cancelBooking(final String operationLevel, final JSONArray pctIDs,
            final String parentId, final JSONArray emIDs, final JSONArray visitorIDs,
            final JSONArray blIDs, final String activityLogId) {
        final JSONArray activityLogIds = new JSONArray();
        activityLogIds.put(activityLogId);
        HotelingBookingService.cancelBookings(operationLevel, pctIDs, parentId, emIDs, visitorIDs,
            blIDs, activityLogIds);
    }
    
    /**
     * {@inheritDoc}
     */
    public void checkInBooking(final String userName, final Map<String, String> requestParameters) {
        
        final List<Integer> pctIds = new ArrayList<Integer>();
        pctIds.add(Integer.valueOf(requestParameters.get("pct_id")));
        HotelingBookingService.confirmBookings(pctIds);
        
    }
}
