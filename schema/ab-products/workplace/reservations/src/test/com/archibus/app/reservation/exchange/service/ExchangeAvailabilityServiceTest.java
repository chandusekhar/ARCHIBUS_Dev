package com.archibus.app.reservation.exchange.service;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.service.ReservationServiceTestBase;
import com.archibus.app.reservation.util.ReservationUtils;

/**
 * Test class for ExchangeAvailabilityService.
 *
 * @author Yorik Gerlo
 * @since 21.2
 */
public class ExchangeAvailabilityServiceTest extends ReservationServiceTestBase {

    /** External email address not accessible by Exchange. */
    private static final String EXTERNAL_EMAIL = "thomas.jones@mailinator.com";
    
    /** First email address used for testing (must exist on Exchange). */
    private static final String EMAIL1 = "unittest1@procos1.onmicrosoft.com";

    /** Second email address used for testing (must exist on Exchange). */
    private static final String EMAIL2 = "unittest2@procos1.onmicrosoft.com";

    /** Internal email address of a mailbox that doesn't exist. */
    private static final String EMAIL3 = "tom.marx@procos1.onmicrosoft.com";

    /** Dummy reservation ID used for testing. */
    private static final int DUMMY_RESERVATION_ID = 354;

    /** The calendar service. */
    private ExchangeCalendarService calendarService;

    /** The Availability service being tested. */
    private ExchangeAvailabilityService availabilityService;
    
    /**
     * Test finding attendee availability information.
     */
    public void testFindAttendeeAvailability() {
        final TimeZone timeZone = TimeZone.getTimeZone(Constants.TIMEZONE_UTC);

        // Create an event.
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        this.calendarService.createAppointment(reservation);

        // Check availability.
        final Date startDate = TimePeriod.clearTime(this.startDate);
        AttendeeAvailability freeBusy =
                this.availabilityService.findAttendeeAvailability(reservation, startDate, timeZone,
                    EMAIL1, Arrays.asList(new String[] { EMAIL1 })).get(EMAIL1);
        Assert.assertTrue(freeBusy.isSuccessful());
        List<ICalendarEvent> events = freeBusy.getCalendarEvents();
        Assert.assertFalse(events.isEmpty());
        final Date startDateTime =
                ReservationUtils.getTimePeriodInTimeZone(reservation, Constants.TIMEZONE_UTC)
                .getStartDateTime();
        boolean eventFound = false;
        for (final ICalendarEvent event : events) {
            if (event.getStartDateTime().equals(startDateTime)
                    && event.getEventId().equals(reservation.getUniqueId())) {
                eventFound = true;
                break;
            }
        }
        Assert.assertTrue(eventFound);

        // Also check availability for one of the attendees.
        freeBusy =
                this.availabilityService.findAttendeeAvailability(reservation, startDate, timeZone,
                    EMAIL1, Arrays.asList(new String[] { EMAIL2 })).get(EMAIL2);
        Assert.assertTrue(freeBusy.isSuccessful());
        events = freeBusy.getCalendarEvents();
        Assert.assertFalse(events.isEmpty());
        eventFound = false;
        for (final ICalendarEvent event : events) {
            if (event.getStartDateTime().equals(startDateTime)
                    && event.getEventId().equals(reservation.getUniqueId())) {
                eventFound = true;
                break;
            }
        }
        Assert.assertTrue(eventFound);
    }

    /**
     * Test finding attendee availability information.
     */
    public void testFindAttendeeAvailabilityInvalidInternal() {
        final TimeZone timeZone = TimeZone.getTimeZone(Constants.TIMEZONE_UTC);
        final Date startDate = TimePeriod.clearTime(this.startDate);

        // Check availability for only an invalid internal email address.
        AttendeeAvailability freeBusy =
                this.availabilityService.findAttendeeAvailability(null, startDate, timeZone,
                    EMAIL1, Arrays.asList(new String[] { EMAIL3 })).get(EMAIL3);
        Assert.assertFalse(freeBusy.isSuccessful());
        Assert.assertNotNull(freeBusy.getErrorDetails());

        // Check availability for 2 internal addresses where one doesn't exist.
        freeBusy =
                this.availabilityService.findAttendeeAvailability(null, startDate, timeZone,
                    EMAIL1, Arrays.asList(new String[] { EMAIL2, EMAIL3 })).get(EMAIL3);
        Assert.assertFalse(freeBusy.isSuccessful());
        Assert.assertNotNull(freeBusy.getErrorDetails());
    }

    /**
     * Test finding attendee availability information.
     */
    public void testFindAttendeeAvailabilityExternal() {
        final TimeZone timeZone = TimeZone.getTimeZone(Constants.TIMEZONE_UTC);
        final Date startDate = TimePeriod.clearTime(this.startDate);

        // Check availability for only someone Exchange doesn't know with an external
        // email address.
        AttendeeAvailability freeBusy =
                this.availabilityService.findAttendeeAvailability(null, startDate, timeZone,
                    EMAIL1, Arrays.asList(new String[] { EXTERNAL_EMAIL })).get(EXTERNAL_EMAIL);
        Assert.assertFalse(freeBusy.isSuccessful());
        Assert.assertNotNull(freeBusy.getErrorDetails());

        // Check availability for an internal address and an external one.
        freeBusy =
                this.availabilityService.findAttendeeAvailability(null, startDate, timeZone,
                    EMAIL1, Arrays.asList(new String[] { EMAIL2, EXTERNAL_EMAIL })).get(
                        EXTERNAL_EMAIL);
        Assert.assertFalse(freeBusy.isSuccessful());
        Assert.assertNotNull(freeBusy.getErrorDetails());
    }

    /**
     * Set the Calendar Service used for this free-busy test.
     *
     * @param calendarService the calendar service
     */
    public void setCalendarService(final ExchangeCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    /**
     * Set the Availability Service for this test.
     * 
     * @param availabilityService the availability service
     */
    public void setAvailabilityService(final ExchangeAvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    /**
     * Populate the reservation object with properties for this test.
     *
     * @param reservation the reservation object to populate
     */
    private void populateReservation(final RoomReservation reservation) {
        reservation.setReservationName("brainstorm");
        reservation.setComments("We will have a brainstorm session.");
        reservation.setEmail(EMAIL1);
        reservation.setAttendees("tom.jones@mailinator.com;" + EMAIL2);
        reservation.setTimeZone("America/New_York");
        reservation.setReserveId(DUMMY_RESERVATION_ID);
    }

}
