package com.archibus.eventhandler.hoteling;

import java.text.SimpleDateFormat;
import java.util.*;

import org.json.*;

import com.archibus.datasource.*;

/**
 * Junit test class for HotelingHandler.
 * 
 * @since 20.3
 */
public class TestHotelingHandler extends DataSourceTestBase {
    
    /**
     * date start.
     */
    private static Date dateStart;
    
    /**
     * date end .
     */
    private static Date dateEnd;
    
    /**
     * search parameters.
     */
    private static String[][] searchParameterArray;
    
    /**
     * booking values.
     */
    private static String[][] bookingValueArray;
    
    /**
     * constructor.
     */
    public TestHotelingHandler() {
        // Prepare start date and end date
        dateStart = new Date();
        final Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_YEAR, 1);
        dateEnd = c.getTime();
        
        // CHECKSTYLE:OFF Unit test code.
        // Prepare parameter values for searching available spaces
        searchParameterArray =
                new String[][] { { "duration", "1" }, { "minBlSpace", "" }, { "minFlSpace", "" },
                        { "emId", "" }, { "dayPart", "0" }, { "bl_id", "" }, { "fl_id", "" },
                        { "rm_id", "" }, { "rm_cat", "" }, { "rm_type", "" }, { "rm_std", "" },
                        { "dv_id", "" }, { "dp_id", "" } };
        
        // Prepare a booking's value for create a new booking
        bookingValueArray =
                new String[][] { { "rmpct.bl_id", "HQ" }, { "rmpct.fl_id", "19" },
                        { "rmpct.rm_id", "101" }, { "rmpct.em_id", "AI" }, { "rmpct.dv_id", "" },
                        { "rmpct.dp_id", "" } };
        // CHECKSTYLE:ON.
        
    }
    
    /**
     * test method for HotelingHandler.searchAvailableSpaces().
     */
    public void testSearchAvailableSpaces() {
        
        final HotelingHandler handler = new HotelingHandler();
        
        final JSONObject filterParameters = new JSONObject();
        
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        filterParameters.put("date_start", dateFormat.format(dateStart));
        filterParameters.put("date_end", dateFormat.format(dateEnd));
        
        for (final String[] pName : searchParameterArray) {
            filterParameters.put(pName[0], pName[1]);
        }
        
        try {
            handler.searchAvailableSpaces(filterParameters, "");
        } catch (final Throwable e) {
            fail(" Global Exception " + e);
        }
    }
    
    /**
     * test method for HotelingHandler.createBookings().
     */
    public void testCreateBookings() {
        final HotelingHandler handler = new HotelingHandler();
        
        final JSONArray bookings = new JSONArray();
        final JSONObject booking = new JSONObject();
        final JSONObject values = new JSONObject();
        for (final String[] bValue : bookingValueArray) {
            values.put(bValue[0], bValue[1]);
        }
        booking.put("values", values);
        bookings.put(booking);
        
        try {
            handler.createBookings("", "", "0", dateStart, dateEnd, "", bookings);
        } catch (final Throwable e) {
            fail(" Global Exception " + e);
        }
        
    }
    
    /**
     * test method for HotelingHandler.cancelBookings().
     */
    public void testCancelBookings() {
        testCreateBookings();
        final int pctId =
                DataStatistics
                    .getInt("rmpct", "pct_id", "MAX",
                        "exists(select 1 from activity_log where activity_type='SERVICE DESK - HOTELING')");
        
        final int activityLogId =
                DataStatistics.getInt("activity_log", "activity_log_id", "MAX",
                    "activity_type='SERVICE DESK - HOTELING'");
        
        final HotelingHandler handler = new HotelingHandler();
        final JSONArray pctIds = new JSONArray();
        pctIds.put(pctId);
        final JSONArray emIds = new JSONArray();
        emIds.put("AI");
        final JSONArray visitorIds = new JSONArray();
        visitorIds.put("");
        final JSONArray blIds = new JSONArray();
        blIds.put("HQ");
        final JSONArray activityLogIds = new JSONArray();
        activityLogIds.put(activityLogId);
        try {
            handler.cancelBookings("0", pctIds, "", emIds, visitorIds, blIds, activityLogIds);
        } catch (final Throwable e) {
            fail(" Global Exception " + e);
        }
    }
    
    /**
     * test method for HotelingHandler.approveBookings().
     */
    public void testApproveBookings() {
        testCreateBookings();
        final int pctId =
                DataStatistics
                    .getInt("rmpct", "pct_id", "MAX",
                        "exists(select 1 from activity_log where activity_type='SERVICE DESK - HOTELING')");
        
        final int activityLogId =
                DataStatistics.getInt("activity_log", "activity_log_id", "MAX",
                    "activity_type='SERVICE DESK - HOTELING'");
        final JSONArray activityLogIds = new JSONArray();
        activityLogIds.put(activityLogId);
        
        final HotelingHandler handler = new HotelingHandler();
        final JSONArray pctIds = new JSONArray();
        pctIds.put(pctId);
        final JSONArray emIds = new JSONArray();
        emIds.put("AI");
        final JSONArray visitorIds = new JSONArray();
        visitorIds.put("");
        
        try {
            handler.approveBookings("0", pctIds, "", emIds, visitorIds, activityLogIds);
        } catch (final Throwable e) {
            fail(" Global Exception " + e);
        }
        
    }
    
    /**
     * test method for HotelingHandler.rejectBookings().
     */
    public void testRejectBookings() {
        testCreateBookings();
        final int pctId =
                DataStatistics
                    .getInt("rmpct", "pct_id", "MAX",
                        "exists(select 1 from activity_log where activity_type='SERVICE DESK - HOTELING')");
        final int activityLogId =
                DataStatistics.getInt("activity_log", "activity_log_id", "MAX",
                    "activity_type='SERVICE DESK - HOTELING'");
        final JSONArray activityLogIds = new JSONArray();
        activityLogIds.put(activityLogId);
        final HotelingHandler handler = new HotelingHandler();
        
        final JSONArray pctIds = new JSONArray();
        pctIds.put(pctId);
        final JSONArray emIds = new JSONArray();
        emIds.put("AI");
        final JSONArray visitorIds = new JSONArray();
        visitorIds.put("");
        
        try {
            handler.rejectBookings("0", pctIds, "", emIds, visitorIds, activityLogIds);
        } catch (final Throwable e) {
            fail(" Global Exception " + e);
        }
        
    }
    
    /**
     * test method for HotelingHandler.makeHotelable().
     */
    public void testMakeHotelable() {
        final JSONArray rmIds = new JSONArray();
        rmIds.put("101");
        rmIds.put("102");
        rmIds.put("103");
        final HotelingHandler handler = new HotelingHandler();
        try {
            handler.makeHotelable("HQ", "19", "1", rmIds);
        } catch (final Throwable e) {
            fail(" Global Exception " + e);
        }
    }
    
    /**
     * test method for HotelingHandler.checkIsDatePassed().
     */
    public void testCheckIsDatePassed() {
        
        final HotelingHandler handler = new HotelingHandler();
        
        final JSONArray bookings = new JSONArray();
        final JSONObject booking = new JSONObject();
        final JSONObject values = new JSONObject();
        for (final String[] bValue : bookingValueArray) {
            values.put(bValue[0], bValue[1]);
        }
        booking.put("values", values);
        bookings.put(booking);
        
        try {
            handler.checkIsDatePassed(dateStart, dateEnd, "", bookings);
        } catch (final Throwable e) {
            fail(" Global Exception " + e);
        }
        
    }
    
    /**
     * test method for HotelingHandler.checkRmstdEmstd().
     */
    public void testCheckRmstdEmstd() {
        
        final HotelingHandler handler = new HotelingHandler();
        
        final JSONArray bookings = new JSONArray();
        final JSONObject booking = new JSONObject();
        final JSONObject values = new JSONObject();
        for (final String[] bValue : bookingValueArray) {
            values.put(bValue[0], bValue[1]);
        }
        booking.put("values", values);
        bookings.put(booking);
        
        try {
            handler.checkRmstdEmstd(bookings);
        } catch (final Throwable e) {
            fail(" Global Exception " + e);
        }
        
    }
}
