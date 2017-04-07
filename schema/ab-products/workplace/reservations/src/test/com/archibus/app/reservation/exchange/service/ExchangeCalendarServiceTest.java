package com.archibus.app.reservation.exchange.service;

import java.util.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.DailyPattern;
import com.archibus.app.reservation.service.*;
import com.archibus.app.reservation.util.ReservationUtils;
import com.archibus.utility.ExceptionBase;

/**
 * Test class for ExchangeCalendarService.
 *
 * @author Yorik Gerlo
 * @since 21.2
 *        <p>
 *        Suppress warning "PMD.TooManyMethods".
 *        <p>
 *        Justification: the JUnit tests for this class should be kept in one test class.
 */
@SuppressWarnings("PMD.TooManyMethods")
public class ExchangeCalendarServiceTest extends ExchangeCalendarServiceTestBase {

    /** The constant three, which is used in date math and as a valid occurrence index. */
    private static final int THREE = 3;

    /** A large number of reservations, too large for Exchange. */
    private static final int THOUSAND = 1000;

    /**
     * Test creating an appointment via the calendar service.
     */
    public void testCreateAppointment() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        createAppointment(reservation);
        Assert.assertNotNull(reservation.getUniqueId());
        ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
            this.appointmentHelper, this.serviceHelper);

        try {
            this.calendarService.createAppointment(reservation);
            Assert.fail("Should not be able to use createAppointment when updating.");
        } catch (final ExceptionBase exception) {
            // correct
            Assert.assertNotNull(reservation.getUniqueId());
        }
    }

    /**
     * Test creating an appointment via the calendar service.
     */
    public void testCreateRecurringAppointment() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        addRecurrence(reservation);
        createAppointment(reservation);

        Assert.assertNotNull(reservation.getUniqueId());

        ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
            this.appointmentHelper, this.serviceHelper);

        // Create a new event with the same occurrence dates but a different pattern.
        reservation.setUniqueId(null);
        reservation.setRecurrence(new DailyPattern(reservation.getRecurrence().getStartDate(),
            reservation.getRecurrence().getEndDate(), DAYS_IN_WEEK));
        createAppointment(reservation);
        ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
            this.appointmentHelper, this.serviceHelper);
    }

    /**
     * Test creating a recurring appointment with a large number of occurrences, larger than the
     * supported count.
     */
    public void testLongRecurringAppointment() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        addDailyRecurrence(reservation, THOUSAND);

        try {
            createAppointment(reservation);
            Assert.fail("Creating recurring reservation with 1001 occurrences should fail.");
        } catch (final CalendarException exception) {
            Assert.assertTrue(exception.getCause() instanceof ServiceResponseException);
        }
    }

    /**
     * Test creating a recurring appointment with the maximum number of occurrences.
     */
    public void testMaxRecurringAppointment() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        addDailyRecurrence(reservation, RecurrenceService.getMaxOccurrences() - 1);

        try {
            createAppointment(reservation);
        } catch (final CalendarException exception) {
            Assert.fail(exception.toString());
        }
    }

    /**
     * Test updating an appointment via the calendar service.
     */
    public void testUpdateAppointment() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);

        createAppointment(reservation);
        final Date creationDate =
                ExchangeCalendarVerifier.getLastModifiedTime(this.appointmentBinder, reservation);

        final String uniqueId = reservation.getUniqueId();
        reservation.setReservationName("brainstorm session");
        reservation.setComments("We will meet for a brainstorm session regarding the new project.");

        // Change the meeting time.
        reservation.setStartTime(createTime("1899-12-30 13:00:00"));
        reservation.setEndTime(createTime("1899-12-30 21:00:00"));

        // Change the date.
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(reservation.getStartDate());
        calendar.add(Calendar.DATE, 2);
        final Date date2 = calendar.getTime();
        reservation.setStartDate(date2);
        reservation.setEndDate(date2);

        changeAttendees(reservation);

        // Modify the reservation ID.
        reservation.setReserveId(DUMMY_RESERVATION_ID + 1);

        this.calendarService.updateAppointment(reservation);
        final Date lastModifiedDate =
                ExchangeCalendarVerifier.getLastModifiedTime(this.appointmentBinder, reservation);
        Assert.assertEquals(uniqueId, reservation.getUniqueId());
        Assert.assertTrue(creationDate.before(lastModifiedDate));

        ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
            this.appointmentHelper, this.serviceHelper);

        this.calendarService.updateAppointment(reservation);
        Assert.assertEquals(lastModifiedDate,
            ExchangeCalendarVerifier.getLastModifiedTime(this.appointmentBinder, reservation));
    }

    /**
     * Test updating an appointment via the calendar service.
     */
    public void testUpdateRecurringAppointment() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        addRecurrence(reservation);
        createAppointment(reservation);

        final String uniqueId = reservation.getUniqueId();
        reservation.setReservationName("recurring brainstorm session");
        reservation
            .setComments("We will meet for a brainstorm session regarding the new project every week.");

        // Change the meeting time.
        reservation.setStartTime(createTime("1899-12-30 13:30:00"));
        reservation.setEndTime(createTime("1899-12-30 19:30:00"));

        changeAttendees(reservation);

        this.calendarService.updateAppointment(reservation);
        Assert.assertEquals(uniqueId, reservation.getUniqueId());

        ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
            this.appointmentHelper, this.serviceHelper);
    }

    /**
     * Test updating an appointment occurrence.
     */
    public void testUpdateAppointmentOccurrence() {
        try {
            // Create a simple recurring appointment.
            final RoomReservation reservation = createRoomReservation();
            populateReservation(reservation);
            addRecurrence(reservation);

            final String originalSubject = reservation.getReservationName();

            createAppointment(reservation);

            ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
                this.appointmentHelper, this.serviceHelper);

            // Update a single occurrence: the first one
            final RoomReservation originalReservation = new RoomReservation();
            reservation.copyTo(originalReservation, true);
            originalReservation.setRoomAllocations(reservation.getRoomAllocations());
            final Calendar calendar = Calendar.getInstance();
            calendar.setTime(reservation.getStartDate());
            // Move it to the next day and change the location and subject.
            calendar.add(Calendar.DATE, 1);
            reservation.setStartDate(calendar.getTime());
            reservation.setEndDate(reservation.getStartDate());
            reservation.getRoomAllocations().get(0).setRmId("somewhere else as a test");
            reservation.setReservationName("test update first occurrence");

            this.calendarService.updateAppointmentOccurrence(reservation, originalReservation);
            ExchangeCalendarVerifier.verifyModifiedOccurrence(this.appointmentBinder,
                this.appointmentHelper, reservation, 1, 1, originalSubject);

            // Update the third one.
            // Starting from the original date of the first occurrence, compute the original date of
            // the third occurrence (in UTC).
            calendar.setTime(originalReservation.getStartDateTime());
            calendar.add(Calendar.DATE, DAYS_IN_WEEK * 2);
            originalReservation.setStartDateTime(calendar.getTime());
            // Move the occurrence to the previous day and let it start one hour earlier.
            calendar.add(Calendar.DATE, -1);
            reservation.setStartDate(calendar.getTime());
            reservation.setEndDate(reservation.getStartDate());
            calendar.setTime(reservation.getStartDateTime());
            calendar.add(Calendar.HOUR_OF_DAY, -1);
            reservation.setStartDateTime(calendar.getTime());
            // Also change the subject of this occurrence.
            reservation.setReservationName("first update of third occurrence");
            this.calendarService.updateAppointmentOccurrence(reservation, originalReservation);
            ExchangeCalendarVerifier.verifyModifiedOccurrence(this.appointmentBinder,
                this.appointmentHelper, reservation, 2, THREE, originalSubject);

            // Update the same occurrence again by moving it three days further.
            originalReservation.setStartDateTime(reservation.getStartDateTime());
            calendar.setTime(reservation.getStartDateTime());
            calendar.add(Calendar.DATE, THREE);
            reservation.setStartDate(calendar.getTime());
            reservation.setEndDate(reservation.getStartDate());
            this.calendarService.updateAppointmentOccurrence(reservation, originalReservation);
            ExchangeCalendarVerifier.verifyModifiedOccurrence(this.appointmentBinder,
                this.appointmentHelper, reservation, 2, THREE, originalSubject);
        } catch (final ExceptionBase exception) {
            Assert.fail(exception.toStringForLogging());
        }
    }

    /**
     * Test updating the date of an occurrence, skipping over another occurrence.
     */
    public void testUpdateOccurrenceDate() {
        // Create a simple recurring appointment.
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        addRecurrence(reservation);
        createAppointment(reservation);

        // Cancel the first occurrence.
        this.calendarService.cancelAppointmentOccurrence(reservation, "Cancel for testing.", true);
        final Date firstStartDateTime = reservation.getStartDateTime();

        // Change the reservation to match the 2nd occurrence.
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(firstStartDateTime);
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        reservation.setStartDateTime(calendar.getTime());
        reservation.setEndDate(reservation.getStartDate());
        // Get a copy of the reservation for the original 2nd occurrence time.
        final RoomReservation originalReservation = new RoomReservation();
        reservation.copyTo(originalReservation, true);
        originalReservation.setRoomAllocations(reservation.getRoomAllocations());
        // Now change the date of the reservation to 8 days later.
        calendar.add(Calendar.DATE, DAYS_IN_WEEK + 1);
        reservation.setStartDateTime(calendar.getTime());
        reservation.setEndDate(reservation.getStartDate());
        reservation.setReservationName("Test update hop over other occurrence.");

        // Try to move the 2nd occurrence past the 3rd.
        try {
            this.calendarService.updateAppointmentOccurrence(reservation, originalReservation);
            Assert.fail("Crossing adjacent occurrence should fail.");
        } catch (final ReservationException exception) {
            // correct
            Assert.assertEquals("Occurrence cannot skip over another occurrence.",
                exception.getPattern());
        }

        // Move the 2nd occurrence before the 1st (1st is cancelled).
        calendar.setTime(firstStartDateTime);
        calendar.add(Calendar.DATE, -1);
        reservation.setStartDateTime(calendar.getTime());
        reservation.setEndDate(reservation.getStartDate());
        this.calendarService.updateAppointmentOccurrence(reservation, originalReservation);
    }

    /**
     * Test updating an occurrence that does not exist.
     */
    public void testUpdateOccurrenceNotExists() {
        // Create a simple recurring appointment.
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        addRecurrence(reservation);
        createAppointment(reservation);

        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(reservation.getStartDateTime());
        calendar.add(Calendar.MONTH, 1);
        reservation.setReservationName("should become a separate meeting");
        final RoomReservation originalReservation = new RoomReservation();
        reservation.copyTo(originalReservation, true);
        originalReservation.setRoomAllocations(reservation.getRoomAllocations());
        originalReservation.setStartDateTime(calendar.getTime());

        this.calendarService.updateAppointmentOccurrence(reservation, originalReservation);
        Assert.assertNotSame(originalReservation.getUniqueId(), reservation.getUniqueId());
        ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
            this.appointmentHelper, this.serviceHelper);
    }

    /**
     * Test cancelling an appointment.
     */
    public void testCancelAppointment() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        createAppointment(reservation);

        ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
            this.appointmentHelper, this.serviceHelper);
        this.calendarService.cancelAppointment(reservation,
            "This meeting is cancelled for testing.", true);
        Assert.assertNull(this.appointmentBinder.bindToAppointment(reservation.getEmail(),
            reservation.getUniqueId()));

        // Test cancelling a meeting that does not exist.
        final String uniqueId = "F" + reservation.getUniqueId().substring(1);
        reservation.setUniqueId(uniqueId);
        try {
            this.calendarService.cancelAppointment(reservation, "", true);
            Assert.fail("Cancelling non-exisisting appointment should fail.");
        } catch (final CalendarException exception) {
            // correct
            Assert.assertTrue(exception.getPattern()
                .contains(reservation.getReserveId().toString()));
        }
    }

    /**
     * Test cancelling an entire recurrence series.
     */
    public void testCancelRecurringAppointment() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        addRecurrence(reservation);
        createAppointment(reservation);

        ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
            this.appointmentHelper, this.serviceHelper);

        this.calendarService.cancelAppointment(reservation, "Recurring appointment cancel test.",
            true);
        Assert.assertNull(this.appointmentBinder.bindToAppointment(reservation.getEmail(),
            reservation.getUniqueId()));
    }

    /**
     * Test cancelling a single occurrence of a recurring meeting.
     */
    public void testCancelSingleOccurrence() {
        try {
            // Create a simple recurring appointment.
            final RoomReservation reservation = createRoomReservation();
            populateReservation(reservation);
            addRecurrence(reservation);
            createAppointment(reservation);
            ExchangeCalendarVerifier.checkExchangeEquivalence(reservation, this.appointmentBinder,
                this.appointmentHelper, this.serviceHelper);

            // Cancel a single occurrence: the first one
            this.calendarService.cancelAppointmentOccurrence(reservation,
                "Cancel the first occurrence as a test.", true);
            Appointment appointment =
                    this.appointmentBinder.bindToAppointment(reservation.getEmail(),
                        reservation.getUniqueId());
            Assert.assertEquals(AppointmentType.RecurringMaster, appointment.getAppointmentType());
            Assert.assertEquals(1, appointment.getDeletedOccurrences().getCount());
            Assert.assertEquals(
                ReservationUtils.getTimePeriodInTimeZone(reservation, Constants.TIMEZONE_UTC)
                    .getStartDateTime(), appointment.getDeletedOccurrences().getPropertyAtIndex(0)
                    .getOriginalStart());

            // Cancel the third one.
            final Calendar calendar = Calendar.getInstance();
            calendar.setTime(reservation.getStartDateTime());
            calendar.add(Calendar.DATE, DAYS_IN_WEEK * 2);
            reservation.setStartDateTime(calendar.getTime());
            reservation.setStartDate(new java.sql.Date(reservation.getStartDate().getTime()));
            reservation.setEndDate(reservation.getStartDate());
            this.calendarService.cancelAppointmentOccurrence(reservation,
                "Cancel the third occurrence for testing.", true);
            appointment =
                    this.appointmentBinder.bindToAppointment(reservation.getEmail(),
                        reservation.getUniqueId());
            Assert.assertEquals(AppointmentType.RecurringMaster, appointment.getAppointmentType());
            Assert.assertEquals(2, appointment.getDeletedOccurrences().getCount());
            ExchangeCalendarVerifier.verifyOccurrenceBindFails(appointment, THREE);

            // Cancel the same occurrence again
            try {
                this.calendarService.cancelAppointmentOccurrence(reservation,
                    "Recurring cancel test.", true);
                Assert.fail("Shouldn't be able to cancel the same occurrence twice.");
            } catch (final CalendarException exception) {
                Assert.assertTrue(exception.getPattern().contains(
                    reservation.getReserveId().toString()));
            }
            appointment =
                    this.appointmentBinder.bindToAppointment(reservation.getEmail(),
                        reservation.getUniqueId());
            Assert.assertEquals(AppointmentType.RecurringMaster, appointment.getAppointmentType());
            Assert.assertEquals(2, appointment.getDeletedOccurrences().getCount());

            // Cancel an occurrence that is out of range.
            calendar.add(Calendar.MONTH, 1);
            reservation.setStartDateTime(calendar.getTime());
            reservation.setStartDate(new java.sql.Date(reservation.getStartDate().getTime()));
            reservation.setEndDate(reservation.getStartDate());
            try {
                this.calendarService.cancelAppointmentOccurrence(reservation,
                    "Recurring cancel test out of range.", true);
                Assert.fail("Shouldn't be able to cancel an occurrence that doesn't exist.");
            } catch (final CalendarException exception) {
                Assert.assertTrue(exception.getPattern().contains(
                    reservation.getReserveId().toString()));
            }
            appointment =
                    this.appointmentBinder.bindToAppointment(reservation.getEmail(),
                        reservation.getUniqueId());
            Assert.assertEquals(AppointmentType.RecurringMaster, appointment.getAppointmentType());
            Assert.assertEquals(2, appointment.getDeletedOccurrences().getCount());
        } catch (final ExceptionBase exception) {
            Assert.fail(exception.toStringForLogging());
        } catch (final ServiceLocalException exception) {
            Assert.fail(exception.toString());
        }
    }

    /**
     * Test getting attendees' response status.
     */
    public void testGetAttendeesResponseStatus() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        createAppointment(reservation);
        final List<AttendeeResponseStatus> responses =
                this.calendarService.getAttendeesResponseStatus(reservation);
        Assert.assertEquals(reservation.getAttendees().split(SEMICOLON).length, responses.size());
        for (final AttendeeResponseStatus response : responses) {
            Assert.assertEquals(AttendeeResponseStatus.ResponseStatus.Unknown,
                response.getResponseStatus());
        }
    }

    /**
     * Test getting attendees' response status for an occurrence of a recurring reservation.
     */
    public void testGetAttendeeResponseStatusRecurring() {
        final RoomReservation reservation = createRoomReservation();
        populateReservation(reservation);
        addRecurrence(reservation);
        createAppointment(reservation);

        final List<AttendeeResponseStatus> responses =
                this.calendarService.getAttendeesResponseStatus(reservation);
        Assert.assertEquals(reservation.getAttendees().split(SEMICOLON).length, responses.size());
        for (final AttendeeResponseStatus response : responses) {
            Assert.assertEquals(AttendeeResponseStatus.ResponseStatus.Unknown,
                response.getResponseStatus());
        }
    }

}
