package com.archibus.app.reservation.exchange.util;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.ConfiguredDataSourceTestBase;
import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.exchange.domain.UpdateType;
import com.archibus.app.reservation.util.ReservationUtils;

/**
 * Test class for AppointmentEquivalenceChecker.
 *
 * @author Yorik Gerlo
 * @since 22.1
 */
public class AppointmentEquivalenceCheckerTest extends ConfiguredDataSourceTestBase {

    /** A semicolon used to separate email addresses. */
    private static final String SEMICOLON = ";";

    /** An attendee's email address. */
    private static final String EMAIL1 = "abbot@tgd.com";

    /**
     * Test comparing the body of an appointment with the corresponding reservation comments.
     */
    public void testCompareBody() {
        final IReservation reservation = new RoomReservation();
        reservation.setComments("Test body with some newlines\nand text.");
        final ICalendarEvent event = new CalendarEvent();
        event.setBody(reservation.getComments());

        Assert.assertTrue(AppointmentEquivalenceChecker.compareBody(reservation, event));

        // add some whitespace
        event.setBody(event.getBody() + "\n\r\t  \n");
        reservation.setComments("\n" + reservation.getComments() + "  \r\n");

        Assert.assertTrue(AppointmentEquivalenceChecker.compareBody(reservation, event));
    }

    /**
     * Test comparing date and time of an appointment to a reservation.
     */
    public void testCompareDateTime() {
        final IReservation reservation = new RoomReservation();
        reservation.setStartDateTime(new Date());
        reservation.setEndDateTime(new Date(new Date().getTime() + TimePeriod.HOUR_MILLISECONDS));
        reservation.setTimeZone("America/New_York");

        final ICalendarEvent event = new CalendarEvent();
        event.setTimeZone(Constants.TIMEZONE_UTC);
        final TimePeriod utcPeriod =
                ReservationUtils.getTimePeriodInTimeZone(reservation, event.getTimeZone());
        event.setStartDateTime(utcPeriod.getStartDateTime());
        event.setEndDateTime(utcPeriod.getEndDateTime());

        Assert.assertTrue(AppointmentEquivalenceChecker.compareDateTime(reservation, event));

        // Change the time zone to something different so the times no longer match.
        reservation.setTimeZone("Europe/Brussels");
        Assert.assertFalse(AppointmentEquivalenceChecker.compareDateTime(reservation, event));
    }

    /**
     * Test comparing the appointment subject and reservation name.
     */
    public void testCompareSubject() {
        final IReservation reservation = new RoomReservation();
        reservation.setReservationName("This is the reservation name");
        final ICalendarEvent event = new CalendarEvent();
        event.setSubject(reservation.getReservationName());
        Assert.assertTrue(AppointmentEquivalenceChecker.compareSubject(reservation, event));

        reservation.setReservationName(" with some trailing white space   ");
        event.setSubject(reservation.getReservationName().trim() + "\r\n  ");
        Assert.assertTrue(AppointmentEquivalenceChecker.compareSubject(reservation, event));

        event.setSubject(event.getSubject() + "hello");
        Assert.assertFalse(AppointmentEquivalenceChecker.compareSubject(reservation, event));
    }

    /**
     * Test comparing event attendees to appointment attendees.
     */
    public void testCompareToReservationAttendees() {
        final RoomReservation reservation = new RoomReservation();
        reservation.setAttendees(EMAIL1 + ";abernathy@tgd.com;jones@tgd.com");
        reservation.setEmail("organizer@tgd.com");
        final SortedSet<String> attendees = new TreeSet<String>();
        attendees.addAll(Arrays.asList(reservation.getAttendees().split(SEMICOLON)));
        Assert.assertTrue(AppointmentEquivalenceChecker.compareToReservationAttendees(reservation,
            attendees));

        attendees.remove(EMAIL1);
        Assert.assertFalse(AppointmentEquivalenceChecker.compareToReservationAttendees(reservation,
            attendees));

        attendees.add(EMAIL1);
        attendees.add("dummy@tgd.com");
        Assert.assertFalse(AppointmentEquivalenceChecker.compareToReservationAttendees(reservation,
            attendees));
    }

    /**
     * Test getting the update type for an appointment.
     */
    public void testGetUpdateType() {
        final RoomReservation reservation = new RoomReservation();
        reservation.setReservationName("My subject");
        reservation.setComments("Some body text");
        reservation.setStartDateTime(new Date());
        reservation.setEndDateTime(new Date(new Date().getTime() + TimePeriod.HOUR_MILLISECONDS));
        reservation.setTimeZone("America/Denver");
        reservation.setAttendees("someone@tgd.com");
        reservation.setEmail("organizer2@tgd.com");

        final ICalendarEvent event = new CalendarEvent();
        event.setSubject(reservation.getReservationName());
        event.setBody(reservation.getComments());
        event.setOrganizerEmail(reservation.getEmail());
        event.setTimeZone(Constants.TIMEZONE_UTC);
        final TimePeriod utcPeriod =
                ReservationUtils.getTimePeriodInTimeZone(reservation, event.getTimeZone());
        event.setStartDateTime(utcPeriod.getStartDateTime());
        event.setEndDateTime(utcPeriod.getEndDateTime());
        event.setEmailAddresses(new TreeSet<String>(Arrays.asList(reservation.getAttendees().split(
            SEMICOLON))));

        Assert.assertEquals(UpdateType.NONE,
            AppointmentEquivalenceChecker.getUpdateType(reservation, event));

        // change the attendees
        reservation.setAttendees(reservation.getAttendees() + SEMICOLON + EMAIL1);
        Assert.assertEquals(UpdateType.ATTENDEES_ONLY,
            AppointmentEquivalenceChecker.getUpdateType(reservation, event));

        // change the body
        reservation.setReservationName("a completely different body");
        Assert.assertEquals(UpdateType.SUBJECT_LOCATION_BODY,
            AppointmentEquivalenceChecker.getUpdateType(reservation, event));

        // change the time also
        reservation.setTimeZone("Europe/Athens");
        Assert.assertEquals(UpdateType.FULL,
            AppointmentEquivalenceChecker.getUpdateType(reservation, event));
    }

}
