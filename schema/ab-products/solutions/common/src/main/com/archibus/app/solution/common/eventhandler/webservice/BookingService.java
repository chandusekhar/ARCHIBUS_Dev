package com.archibus.app.solution.common.eventhandler.webservice;

import javax.jws.*;

/**
 * BookingService interface, implemented by BookingServiceImpl.
 * <p>
 * 
 * Mainly targeted at usage as remote service interface.
 * 
 * @author Valery Tydykov
 * @created November 22, 2006
 * @see com.archibus.app.solution.common.eventhandler.webservice.BookingServiceImpl
 */
@WebService
public interface BookingService {
    Booking[] getBookings(@WebParam(name = "roomId") String roomId,
            @WebParam(name = "start") java.util.Date start,
            @WebParam(name = "end") java.util.Date end);

    void addBooking(@WebParam(name = "booking") Booking booking);

    void editBooking(@WebParam(name = "booking") Booking booking);

    String deleteBooking(@WebParam(name = "bookingId") String bookingId);

    String getRooms();
}
