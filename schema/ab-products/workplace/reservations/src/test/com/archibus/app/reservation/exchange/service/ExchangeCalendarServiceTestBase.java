package com.archibus.app.reservation.exchange.service;

import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.app.reservation.service.ReservationServiceTestBase;

import junit.framework.Assert;

/**
 * Base class for testing the Exchange Calendar Service.
 *
 * @author Yorik Gerlo
 * @since 23.1
 *
 *        <p>
 *        Suppress warning "PMD.TestClassWithoutTestCases".
 *        <p>
 *        Justification: this is a base class for other tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class ExchangeCalendarServiceTestBase extends ReservationServiceTestBase {

    /** Dummy reservation ID used for testing. */
    protected static final int DUMMY_RESERVATION_ID = 354;

    /** First email address used for testing (must exist on Exchange). */
    private static final String EMAIL1 = "unittest1@procos1.onmicrosoft.com";

    /** Second email address used for testing (must exist on Exchange). */
    private static final String EMAIL2 = "unittest2@procos1.onmicrosoft.com";

    /** The calendar service under test. */
    protected ExchangeCalendarService calendarService;

    /** The Exchange Service helper used for verification. */
    protected ExchangeServiceHelper serviceHelper;

    /** The appointment binder. */
    protected AppointmentBinder appointmentBinder;

    /** The appointment helper. */
    protected AppointmentHelper appointmentHelper;

    /**
     * Set the Calendar Service used in this test.
     *
     * @param calendarService the calendar service
     */
    public void setCalendarService(final ExchangeCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    /**
     * Set the Exchange service helper used in this test.
     *
     * @param serviceHelper the new service helper
     */
    public void setServiceHelper(final ExchangeServiceHelper serviceHelper) {
        this.serviceHelper = serviceHelper;
    }

    /**
     * Sets the appointment binder used in this test.
     *
     * @param appointmentBinder the new appointment binder
     */
    public void setAppointmentBinder(final AppointmentBinder appointmentBinder) {
        this.appointmentBinder = appointmentBinder;
    }

    /**
     * Sets the appointment helper used in this test.
     *
     * @param appointmentHelper the new appointment helper
     */
    public void setAppointmentHelper(final AppointmentHelper appointmentHelper) {
        this.appointmentHelper = appointmentHelper;
    }

    /**
     * Create an appointment in the calendar.
     *
     * @param reservation the reservation to create in the calendar
     */
    protected void createAppointment(final RoomReservation reservation) {
        final String uniqueId = this.calendarService.createAppointment(reservation);
        Assert.assertNotNull(uniqueId);
    }

    /**
     * Populate the given reservation object with properties for this test.
     *
     * @param reservation the reservation to populate
     */
    protected void populateReservation(final RoomReservation reservation) {
        reservation.setReservationName("brainstorm");
        reservation.setEmail(EMAIL1);
        reservation
            .setAttendees("jason.matthews@mailinator.com;tom.jones@mailinator.com;" + EMAIL2);
        reservation.setComments("We will hold a brainstorm session.");

        reservation.setTimeZone("America/New_York");
        reservation.setReserveId(DUMMY_RESERVATION_ID);
    }

}