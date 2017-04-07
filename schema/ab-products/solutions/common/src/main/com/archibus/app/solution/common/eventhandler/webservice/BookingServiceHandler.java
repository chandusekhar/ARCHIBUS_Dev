package com.archibus.app.solution.common.eventhandler.webservice;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * This is just a skeleton of the event handler. This event handler is called from the Web Service.
 * It demonstrates how method names and parameters can be passed.
 * 
 * @author tydykov
 * @created November 21, 2006
 */
public class BookingServiceHandler extends EventHandlerBase {

    /**
     * Handle the event.
     * 
     * @param context Workflow rule execution context.
     * @exception ExceptionBase If there is writeXmlToResponse exception.
     */
    public void handle(EventHandlerContext context) throws ExceptionBase {
        {
            // TODO string constants

            // extract method and arguments from the request
            final String method = (String) context.getParameter("method");
            if ("addBooking".equals(method)) {
                final Booking booking = (Booking) context.getParameter("booking");

                System.out.println("addBooking: " + booking);
            } else if ("editBooking".equals(method)) {
                final Booking booking = (Booking) context.getParameter("booking");

                System.out.println("editBooking: " + booking);
            } else if ("deleteBooking".equals(method)) {
                final String bookingId = (String) context.getParameter("bookingId");

                System.out.println("deleteBooking: " + bookingId);
            } else if ("getBookings".equals(method)) {
                final String roomId = (String) context.getParameter("roomId");
                final java.util.Date start = (java.util.Date) context.getParameter("start");
                final java.util.Date end = (java.util.Date) context.getParameter("end");

                System.out.println("getBookings: " + roomId + ";" + start + ";" + end);

                // return a Booking
                Booking booking = new Booking();
                booking.setBookingId("789");
                booking.setConfidential(true);
                booking.setRoomId(roomId);
                booking.setStart(start);
                booking.setEnd(end);
                context.addResponseParameter("bookings", new Booking[] { booking });
            } else if ("getRooms".equals(method)) {
                JSONObject data = new JSONObject();
                JSONArray rooms = toJSONArray(retrieveDbRecords(context,
                                                                "SELECT rm_id,rm_std,bl_id,fl_id,dp_id,dv_id,rm_type FROM rm"));
                data.put("rooms", rooms);
                context.addResponseParameter("rooms", data.toString());
            }
        }
    }
}
