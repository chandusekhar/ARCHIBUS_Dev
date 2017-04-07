package com.archibus.eventhandler.hoteling;

import java.text.SimpleDateFormat;
import java.util.*;

import org.json.*;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * Helper class for create booking.
 * <p>
 * 
 * @author Guo
 * @since 20.3
 */
public final class HotelingBookingCreateAction {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private HotelingBookingCreateAction() {
    }
    
    /**
     * Crete recurring bookings.
     * 
     * @param bookings booking list
     * @param userDvId user division
     * @param userDpId user department
     * @param dayPart day part
     * @param recurringRule recurring rule
     * @param dateStart date start
     * @param dateEnd date end
     * @return booking record
     */
    public static List<DataRecord> createRecurringBookings(final JSONArray bookings,
            final String userDvId, final String userDpId, final String dayPart,
            final String recurringRule, final Date dateStart, final Date dateEnd) {
        
        final List<DataRecord> rmpctList = new ArrayList<DataRecord>();
        
        final JSONArray unavailableBookings = new JSONArray();
        final JSONArray createdBookings = new JSONArray();
        
        // FOR send email
        final HotelingNotifyService notifyService = new HotelingNotifyService();
        notifyService.addParametertoContextForNotify();
        
        // Generate the dates list
        final RecurringScheduleService recurringScheduleService = new RecurringScheduleService();
        recurringScheduleService.setRecurringSchedulePattern(dateStart, dateEnd, recurringRule);
        final List<Date> datesList = recurringScheduleService.getDatesList();
        
        for (int j = 0; j < bookings.length(); j++) {
            
            final List<DataRecord> rmpctRecordList = new ArrayList<DataRecord>();
            
            final JSONObject booking =
                    bookings.getJSONObject(j).getJSONObject(HotelingConstants.VALUES);
            if (!checkRoomAvailability(booking, dateStart, dateEnd, dayPart, recurringRule)) {
                addToUnavailableBookings(booking, unavailableBookings);
                continue;
            }
            
            booking.put(HotelingConstants.PARENT_PCT_ID, -1);
            for (int i = 0; i < datesList.size(); i++) {
                final DataRecord rmpctRecord =
                        createBooking(booking, datesList.get(i), datesList.get(i), userDvId,
                            userDpId, dayPart, recurringRule);
                if (rmpctRecord != null) {
                    if (i == 0) {
                        booking.put(
                            HotelingConstants.PARENT_PCT_ID,
                            rmpctRecord.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                                    + HotelingConstants.PCT_ID));
                    }
                    
                    rmpctList.add(rmpctRecord);
                    
                    createdBookings.put(rmpctRecord.getInt(HotelingConstants.RMPCT
                            + HotelingConstants.DOT + HotelingConstants.PCT_ID));
                    
                    rmpctRecordList.add(rmpctRecord);
                }
            }
            notifyService.prepareEmailNotificationList(booking, rmpctRecordList);
        }
        
        sendCreateBookingNotification(notifyService);
        addResultToContextResponse(unavailableBookings, createdBookings);
        return rmpctList;
    }
    
    /**
     * Send create booking notification.
     * 
     * @param notifyService notifyService
     */
    private static void sendCreateBookingNotification(final HotelingNotifyService notifyService) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        try {
            notifyService.sendNotification(HotelingConstants.BOOKING_ACTION_CREATE, "");
        } catch (final ExceptionBase e) {
            context.addResponseParameter(HotelingConstants.MESSAGE, HotelingConstants.ERROR_1);
        }
    }
    
    /**
     * Create regular bookings.
     * 
     * @param bookings booking list
     * @param dateStart date start
     * @param dateEnd date end
     * @param userDvId user division
     * @param userDpId user department
     * @param dayPart day part
     * @return the booking record
     */
    public static List<DataRecord> createRegularBookings(final JSONArray bookings,
            final Date dateStart, final Date dateEnd, final String userDvId, final String userDpId,
            final String dayPart) {
        
        final JSONArray unavailableBookings = new JSONArray();
        final JSONArray createdBookings = new JSONArray();
        
        // FOR send email
        final HotelingNotifyService notifyService = new HotelingNotifyService();
        notifyService.addParametertoContextForNotify();
        
        final List<DataRecord> rmpctList = new ArrayList<DataRecord>();
        
        for (int j = 0; j < bookings.length(); j++) {
            final List<DataRecord> rmpctRecordList = new ArrayList<DataRecord>();
            final JSONObject booking =
                    bookings.getJSONObject(j).getJSONObject(HotelingConstants.VALUES);
            
            if (!checkRoomAvailability(booking, dateStart, dateEnd, dayPart, "")) {
                addToUnavailableBookings(booking, unavailableBookings);
                continue;
            }
            
            booking.put(HotelingConstants.PARENT_PCT_ID, -1);
            final DataRecord rmpctRecord =
                    createBooking(booking, dateStart, dateEnd, userDvId, userDpId, dayPart, null);
            
            if (rmpctRecord != null) {
                
                rmpctList.add(rmpctRecord);
                createdBookings.put(rmpctRecord.getInt(HotelingConstants.RMPCT
                        + HotelingConstants.DOT + HotelingConstants.PCT_ID));
                
                rmpctRecordList.add(rmpctRecord);
            }
            
            notifyService.prepareEmailNotificationList(booking, rmpctRecordList);
        }
        
        sendCreateBookingNotification(notifyService);
        
        addResultToContextResponse(unavailableBookings, createdBookings);
        
        return rmpctList;
    }
    
    /**
     * check auto approve for new booking list.
     * 
     * @param bookings booking list
     */
    public static void checkAutoApprove(final List<DataRecord> bookings) {
        
        // for all created rmpct if auto-approved , then call wfr approveBookings() to approve the
        // booking
        for (int i = 0; i < bookings.size(); i++) {
            final DataRecord record = bookings.get(i);
            // if not need approve step, then system will auto approve
            if (!HotelingUtility.isNeedApprove(
                record.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.EM_ID),
                record.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DV_ID),
                record.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DP_ID))) {
                final JSONArray rmpctId = new JSONArray();
                final JSONArray emId = new JSONArray();
                final JSONArray visitorID = new JSONArray();
                final JSONArray activityLogIds = new JSONArray();
                activityLogIds.put(record.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.ACTIVITY_LOG_ID));
                rmpctId.put(record.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.PCT_ID));
                emId.put(record.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.EM_ID));
                visitorID.put(record.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.VISITOR_ID));
                
                HotelingBookingService.approveBookings(
                    "1",
                    rmpctId,
                    String.valueOf(record.getInt(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.PARENT_PCT_ID)), emId, visitorID, activityLogIds);
            }
        }
        
    }
    
    /**
     * create single booking.
     * 
     * @param booking booking object
     * @param dateStart date start
     * @param dateEnd date end
     * @param userDvId user division
     * @param userDpId user department
     * @param dayPart day part
     * @param recurringRule recurring rule
     * @return new booking record
     */
    public static DataRecord createBooking(final JSONObject booking, final Date dateStart,
            final Date dateEnd, final String userDvId, final String userDpId, final String dayPart,
            final String recurringRule) {
        
        final String emId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.EM_ID);
        String visitorId = null;
        if (booking.has(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.VISITOR_ID)) {
            visitorId =
                    booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.VISITOR_ID);
        }
        
        final DataRecord acLogRecord =
                HotelingBookingCreateActionHelper.createActivityLogRecord(emId, visitorId,
                    recurringRule, userDvId, userDpId, HotelingConstants.ACTIVITY_LOG_REQUESTED);
        
        DataRecord rmpctRecord = null;
        if (acLogRecord != null) {
            final int activityLogId =
                    acLogRecord.getInt(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                            + HotelingConstants.ACTIVITY_LOG_ID);
            rmpctRecord =
                    HotelingBookingCreateActionHelper.createRmpctRecord(booking, activityLogId,
                        booking.getInt(HotelingConstants.PARENT_PCT_ID), dayPart, dateStart,
                        dateEnd);
            
        }
        
        return rmpctRecord;
    }
    
    /**
     * check room availability.
     * 
     * @param booking booking
     * @param dateStart dateStart
     * @param dateEnd dateEnd
     * @param dayPart dayPart
     * @param recurringRule recurringRule
     * @return true or false
     */
    private static boolean checkRoomAvailability(final JSONObject booking, final Date dateStart,
            final Date dateEnd, final String dayPart, final String recurringRule) {
        
        final JSONObject searchParameter = new JSONObject();
        searchParameter.put(
            HotelingConstants.BL_ID,
            booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.BL_ID));
        searchParameter.put(
            HotelingConstants.FL_ID,
            booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.FL_ID));
        searchParameter.put(
            HotelingConstants.RM_ID,
            booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.RM_ID));
        searchParameter.put(
            "emId",
            booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.EM_ID));
        
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        searchParameter.put(HotelingConstants.DATE_START, dateFormat.format(dateStart));
        searchParameter.put(HotelingConstants.DATE_END, dateFormat.format(dateEnd));
        searchParameter.put("dayPart", dayPart);
        
        final DataSetList dataSetList =
                HotelingBookingSearchAction.searchAvailableSpaces(searchParameter, recurringRule);
        
        boolean isAvailable = true;
        if (dataSetList.getRecords().isEmpty()) {
            isAvailable = false;
        }
        
        return isAvailable;
    }
    
    /**
     * add booking to unavailable booking array.
     * 
     * @param booking booking
     * @param unavailableBookings unavailableBookings
     */
    private static void addToUnavailableBookings(final JSONObject booking,
            final JSONArray unavailableBookings) {
        final JSONObject object = new JSONObject();
        object.put(
            "rmId",
            booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.RM_ID));
        object.put(
            "flId",
            booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.FL_ID));
        object.put(
            "blId",
            booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                    + HotelingConstants.BL_ID));
        unavailableBookings.put(booking);
    }
    
    /**
     * add result to context response.
     * 
     * @param unavailableBookings unavailableBookings
     * @param createdBookings createdBookings
     */
    private static void addResultToContextResponse(final JSONArray unavailableBookings,
            final JSONArray createdBookings) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONObject result = new JSONObject();
        result.put("unavailableBookings", unavailableBookings);
        result.put("createdBookings", createdBookings);
        context.setResponse(result);
    }
}
