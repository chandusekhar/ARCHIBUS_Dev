package com.archibus.app.reservation.exchange.service;

import java.util.Calendar;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.exchange.util.AppointmentEquivalenceChecker;
import com.archibus.app.reservation.util.ReservationUtils;
import com.archibus.utility.ExceptionBase;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

/**
 * Test class for testing updates to recurring meeting series in Exchange.
 *
 * @author Yorik Gerlo
 * @since 23.1
 */
public class ExchangeUpdateRecurringTest extends ExchangeCalendarServiceTestBase {

    /** European time zone with different DST rules than Eastern Time. */
    private static final String EUROPE_TIMEZONE = "Europe/Brussels";

    /**
     * Test updating the time zone of a recurring meeting without changing anything else. See also
     * KB 3049352.
     */
    public void testUpdateSeriesTimeZone() {
        final RoomReservation reservation = createAppointmentSeries();
        Assert.assertNotNull(reservation.getUniqueId());
        updateSeriesTimeZone(reservation);
    }

    /**
     * Test updating the time zone of a recurring meeting series with a modified occurrence. See
     * also KB 3049352.
     */
    public void testUpdateModifiedSeriesTimeZone() {
        final RoomReservation reservation = createAppointmentSeries();
        Assert.assertNotNull(reservation.getUniqueId());

        // edit one occurrence (the last one)
        final RoomReservation lastOccurrence = reservation.getCreatedReservations()
            .get(reservation.getCreatedReservations().size() - 1);
        lastOccurrence.setReservationName("Modified subject for last occurrence");
        this.calendarService.updateAppointmentOccurrence(lastOccurrence, lastOccurrence);

        updateSeriesTimeZone(reservation);
    }

    /**
     * Test updating the full series while an occurrence is missing on the calendar. See also KB
     * 3050024.
     */
    public void testDetectMissingOccurrence() {
        final RoomReservation reservation = createAppointmentSeries();
        Assert.assertNotNull(reservation.getUniqueId());

        // cancel an occurrence on the calendar
        final RoomReservation occurrence = reservation.getCreatedReservations().get(2);
        this.calendarService.cancelAppointmentOccurrence(occurrence, "", false);

        Assert.assertEquals(reservation.getUniqueId(), occurrence.getUniqueId());

        reservation.setReservationName("Modified reservation name");
        reservation.setComments("Extra comments to add in each occurrence");

        this.calendarService.updateAppointmentSeries(reservation,
            reservation.getCreatedReservations());

        Assert.assertNotSame(reservation.getUniqueId(), occurrence.getUniqueId());
    }

    /**
     * Actual implementation of updating the time zone and verifying equivalence, after the meeting
     * series has been created (and optionally modified).
     *
     * @param reservation the parent reservation
     */
    private void updateSeriesTimeZone(final RoomReservation reservation) {
        checkOccurrenceTimes(reservation);

        reservation.setRequestedTimeZone(EUROPE_TIMEZONE);
        // update the reservations to match the new time zone
        ReservationUtils.convertToTimeZone(reservation, reservation.getRequestedTimeZone());
        for (final RoomReservation occurrence : reservation.getCreatedReservations()) {
            occurrence.setStartTime(reservation.getStartTime());
            occurrence.setEndTime(reservation.getEndTime());
            occurrence.setTimeZone(reservation.getTimeZone());
        }

        this.calendarService.updateAppointmentSeries(reservation,
            reservation.getCreatedReservations());

        checkOccurrenceTimes(reservation);
    }

    /**
     * Create an appointment series on every Tuesday next March.
     *
     * @return the parent reservation corresponding to the series
     */
    private RoomReservation createAppointmentSeries() {
        final Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.MONTH, Calendar.MARCH);
        calendar.set(Calendar.DATE, 1);
        if (calendar.getTime().before(this.startDate)) {
            calendar.add(Calendar.YEAR, 1);
        }
        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.TUESDAY) {
            calendar.add(Calendar.DATE, 1);
        }

        final RoomReservation reservation = createRoomReservation();
        reservation.setStartDate(TimePeriod.clearTime(calendar.getTime()));
        populateReservation(reservation);
        addRecurrence(reservation);
        createAppointment(reservation);

        // set common properties in all occurrences
        int occurrenceIndex = 0;
        for (final RoomReservation occurrence : reservation.getCreatedReservations()) {
            occurrence.setOccurrenceIndex(++occurrenceIndex);
            occurrence.setUniqueId(reservation.getUniqueId());
        }
        return reservation;
    }

    /**
     * Check whether the times of each occurrence match the times of the corresponding reservation.
     *
     * @param reservation parent reservation containing all children
     */
    private void checkOccurrenceTimes(final RoomReservation reservation) {
        // bind to each occurrence and check equivalence
        final Appointment master = this.appointmentBinder.bindToAppointment(reservation.getEmail(),
            reservation.getUniqueId());
        for (int i = 0; i < reservation.getCreatedReservations().size(); ++i) {
            final RoomReservation originalReservation = reservation.getCreatedReservations().get(i);
            originalReservation.setOccurrenceIndex(i + 1);
            final Appointment occurrence = this.appointmentBinder
                .bindToOccurrence(master.getService(), originalReservation, master);
            try {
                Assert.assertTrue(
                    "Occurrence on " + originalReservation.getStartDate() + " is equivalent",
                    AppointmentEquivalenceChecker.compareDateTime(originalReservation,
                        AppointmentEquivalenceChecker.toCalendarEvent(occurrence)));
            } catch (final ServiceLocalException exception) {
                throw new ExceptionBase("Error reading occurrence properties", exception);
            }
        }
    }

}
