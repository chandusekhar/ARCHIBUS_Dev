package com.archibus.app.reservation.exchange.service;

import java.util.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.app.reservation.service.RoomReservationServiceTestBase;
import com.archibus.app.reservation.util.ReservationUtils;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.LocalDateTimeUtil;

/**
 * Base class containing test cases for the Exchange Listener.
 *
 * @author Yorik Gerlo
 */
public class ExchangeListenerTestBase extends RoomReservationServiceTestBase {

    /** Table + field name of the unique id field. */
    protected static final String RESERVE_OUTLOOK_UNIQUE_ID = "reserve.outlook_unique_id";

    /** Message included when cancelling an appointment. */
    protected static final String CANCEL_MESSAGE = "Cancel for listener test.";

    /** Users table. */
    private static final String AFM_USERS = "afm_users";

    /** Constant: slack time to allow the email server to process messages. */
    private static final int SLEEP_MILLIS = 5000;

    /** The constant 30. */
    private static final int THIRTY = 30;

    /** The user name that corresponds with the email address of the meeting organizer. */
    protected String usernameForEmail;

    /** The Exchange Listener under test. */
    protected ExchangeListener exchangeListener;

    /** Calendar service to modify the appointments directly. */
    protected ExchangeCalendarService calendarService;

    /** The location time zone. */
    protected String locationTimeZone;

    /**
     * Set up for an Exchange Listener test case.
     *
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        final DataSource userDs =
                DataSourceFactory.createDataSourceForFields(AFM_USERS, new String[] { "user_name",
                        Constants.EMAIL_FIELD_NAME });
        userDs.addRestriction(Restrictions.eq(AFM_USERS, Constants.EMAIL_FIELD_NAME, this.email));
        final DataRecord record = userDs.getRecord();
        this.usernameForEmail = record.getString("afm_users.user_name");
        this.locationTimeZone = LocalDateTimeUtil.getLocationTimeZone(null, null, null, BL_ID);
    }

    /**
     * Test processing the update and cancellation of an entire recurring appointment series.
     */
    public void testProcessRecurringAppointment() {
        final List<RoomReservation> createdReservations = setupRecurringMeeting();

        final ExchangeService resourceExchangeService =
                this.serviceHelper.initializeService(this.serviceHelper.getResourceAccount());

        // Update the subject and attendees.
        final RoomReservation firstReservation = createdReservations.get(0);
        firstReservation.setReservationName("Update series subject via Exchange");
        firstReservation
            .setAttendees("jason.matthews@mailinator.com;joan.mitch@mailinator.com;kim.sim@mailinator.com");
        firstReservation
            .setTimeZone(LocalDateTimeUtil.getLocationTimeZone(null, null, null, BL_ID));
        this.calendarService.updateAppointment(firstReservation);

        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);
        this.verifySubjectAndAttendees(createdReservations, firstReservation);

        // Allow some additional time for the accept to reach the organizer.
        sleep();
        // Cancel the meeting via ExchangeCalendarService.
        this.calendarService.cancelAppointment(createdReservations.get(0), CANCEL_MESSAGE, true);

        // Allow for some slack time.
        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);

        // Check that all reservations were cancelled by the creator.
        for (final RoomReservation reservation : createdReservations) {
            final RoomReservation cancelledReservation =
                    this.reservationDataSource.get(reservation.getReserveId());
            Assert.assertEquals(Constants.STATUS_CANCELLED, cancelledReservation.getStatus());
            Assert.assertEquals(this.usernameForEmail, cancelledReservation.getLastModifiedBy());
        }
    }

    /**
     * Verify the Subject and Attendees stored in the database match the properties of the modified
     * reservation.
     *
     * @param createdReservations the reservations to retrieve from the database and compare with
     *            the modified reservation
     * @param modifiedReservation the modified reservation, having the properties as they should
     *            appear in the database
     */
    private void verifySubjectAndAttendees(final List<RoomReservation> createdReservations,
            final RoomReservation modifiedReservation) {
        // Check that all occurrences have the modified name and attendees.
        for (final RoomReservation reservation : createdReservations) {
            final RoomReservation updatedReservation =
                    this.reservationDataSource.get(reservation.getReserveId());
            Assert.assertEquals(modifiedReservation.getReservationName(),
                updatedReservation.getReservationName());
            Assert.assertEquals(modifiedReservation.getAttendees(),
                updatedReservation.getAttendees());
        }
    }

    /**
     * Test processing the update of an entire recurring appointment series where some occurrences
     * have been cancelled previously.
     */
    public void testProcessRecurringWithCancelledOccurrence() {
        final List<RoomReservation> createdReservations = setupRecurringMeeting();
        Assert.assertFalse(createdReservations.isEmpty());
        final ExchangeService resourceExchangeService =
                this.serviceHelper.initializeService(this.serviceHelper.getResourceAccount());

        // Cancel the second and last occurrence via ExchangeCalendarService.
        final List<RoomReservation> reservationsToCancel = new ArrayList<RoomReservation>();
        reservationsToCancel.add(createdReservations.remove(1));
        reservationsToCancel.add(createdReservations.remove(createdReservations.size() - 1));
        this.calendarService.cancelAppointmentOccurrence(reservationsToCancel.get(1),
            CANCEL_MESSAGE, true);
        this.calendarService.cancelAppointmentOccurrence(reservationsToCancel.get(0),
            CANCEL_MESSAGE, true);

        // Allow for some slack time.
        sleep();
        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);

        this.checkRecurringCancellations(createdReservations, reservationsToCancel);

        // Update the subject and attendees.
        final RoomReservation firstReservation = createdReservations.get(0);
        firstReservation
            .setReservationName("Update series with cancelled occurrences via Exchange");
        firstReservation
            .setAttendees("jason.matthews@mailinator.com;joan.mitch@mailinator.com;kim478@mailinator.com");
        firstReservation
            .setTimeZone(LocalDateTimeUtil.getLocationTimeZone(null, null, null, BL_ID));
        this.calendarService.updateAppointment(firstReservation);

        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);
        verifySubjectAndAttendees(createdReservations, firstReservation);
    }

    /**
     * Test processing the cancellation of a number of occurrences in a recurring appointment
     * series.
     */
    public void testCancelAppointmentOccurrence() {
        final List<RoomReservation> createdReservations = setupRecurringMeeting();
        Assert.assertFalse(createdReservations.isEmpty());
        final ExchangeService resourceExchangeService =
                this.serviceHelper.initializeService(this.serviceHelper.getResourceAccount());

        // Cancel three occurrences via ExchangeCalendarService.
        final List<RoomReservation> reservationsToCancel = new ArrayList<RoomReservation>();
        reservationsToCancel.add(createdReservations.remove(0));
        reservationsToCancel.add(createdReservations.remove(1));
        reservationsToCancel.add(createdReservations.remove(1));
        this.calendarService.cancelAppointmentOccurrence(reservationsToCancel.get(1),
            CANCEL_MESSAGE, true);
        this.calendarService.cancelAppointmentOccurrence(reservationsToCancel.get(0),
            CANCEL_MESSAGE, true);
        this.calendarService.cancelAppointmentOccurrence(reservationsToCancel.get(2),
            CANCEL_MESSAGE, true);

        // Allow for some slack time.
        sleep();
        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);

        this.checkRecurringCancellations(createdReservations, reservationsToCancel);
    }

    /**
     * Check whether the correct reservations are cancelled / not modified.
     *
     * @param createdReservations the reservation which should be still active
     * @param reservationsToCancel the reservation which should be cancelled
     */
    protected void checkRecurringCancellations(final List<RoomReservation> createdReservations,
            final List<RoomReservation> reservationsToCancel) {
        // Check that the three occurrences were cancelled by the creator.
        for (final RoomReservation reservation : reservationsToCancel) {
            final RoomReservation storedReservation =
                    this.reservationDataSource.get(reservation.getReserveId());
            Assert.assertEquals(Constants.STATUS_CANCELLED, storedReservation.getStatus());
            Assert.assertEquals(this.usernameForEmail, storedReservation.getLastModifiedBy());
        }

        // Check that the other reservations were not cancelled.
        for (final RoomReservation reservation : createdReservations) {
            final RoomReservation storedReservation =
                    this.reservationDataSource.get(reservation.getReserveId());
            if (storedReservation.getRoomAllocations().isEmpty()) {
                Assert.assertEquals(Constants.STATUS_ROOM_CONFLICT, storedReservation.getStatus());
            } else {
                Assert.assertTrue(Constants.STATUS_AWAITING_APP.equals(storedReservation
                    .getStatus())
                        || Constants.STATUS_CONFIRMED.equals(storedReservation.getStatus()));
            }
            Assert.assertNull("Unmodified reservation " + storedReservation.getReserveId()
                    + " should not have been modified by " + storedReservation.getLastModifiedBy(),
                storedReservation.getLastModifiedBy());
        }
    }

    /**
     * Test processing the update and cancellation of a number of occurrences in a recurring
     * appointment series.
     */
    public void testProcessAppointmentOccurrence() {
        final List<RoomReservation> createdReservations = setupRecurringMeeting();
        Assert.assertFalse(createdReservations.isEmpty());
        final ExchangeService resourceExchangeService =
                this.serviceHelper.initializeService(this.serviceHelper.getResourceAccount());
        // Update the first occurrence via Exchange.
        RoomReservation reservationToUpdate = createdReservations.get(0);
        final RoomReservation originalReservation = new RoomReservation();
        reservationToUpdate.copyTo(originalReservation, true);
        originalReservation.setOccurrenceIndex(reservationToUpdate.getOccurrenceIndex());
        originalReservation.setRoomAllocations(reservationToUpdate.getRoomAllocations());
        reservationToUpdate.setReservationName("First updated occurrence");
        reservationToUpdate.setAttendees("tom.winter@mailinator.com");
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(reservationToUpdate.getStartDateTime());
        calendar.add(Calendar.DATE, -1);
        calendar.add(Calendar.HOUR, 1);
        reservationToUpdate.setStartDateTime(calendar.getTime());
        reservationToUpdate.setEndDate(reservationToUpdate.getStartDate());
        reservationToUpdate.setTimeZone(LocalDateTimeUtil.getLocationTimeZone(null, null, null,
            BL_ID));
        this.calendarService.updateAppointmentOccurrence(reservationToUpdate, originalReservation);

        // Cancel the second occurrence via Exchange.
        this.calendarService.cancelAppointmentOccurrence(createdReservations.get(1),
            CANCEL_MESSAGE, true);
        createdReservations.get(1).setStatus(Constants.STATUS_CANCELLED);

        // Update the second last occurrence via Exchange.
        reservationToUpdate = createdReservations.get(createdReservations.size() - 2);
        reservationToUpdate.copyTo(originalReservation, true);
        originalReservation.setOccurrenceIndex(reservationToUpdate.getOccurrenceIndex());
        originalReservation.setRoomAllocations(reservationToUpdate.getRoomAllocations());
        reservationToUpdate.setReservationName("Second last updated occurrence");
        reservationToUpdate.setAttendees("joan.mitch@mailinator.com;tom.winters@mailinator.com");
        calendar.setTime(reservationToUpdate.getStartDateTime());
        calendar.add(Calendar.DATE, 1);
        calendar.add(Calendar.MINUTE, THIRTY);
        reservationToUpdate.setStartDateTime(calendar.getTime());
        reservationToUpdate.setEndDate(reservationToUpdate.getStartDate());
        reservationToUpdate.setTimeZone(LocalDateTimeUtil.getLocationTimeZone(null, null, null,
            BL_ID));
        this.calendarService.updateAppointmentOccurrence(reservationToUpdate, originalReservation);

        // Allow for some slack time.
        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);

        this.verifyOccurrenceChanges(createdReservations);
    }

    /**
     * Verify the changes to the occurrences are stored in the database as expected.
     *
     * @param createdReservations the in-memory reservations with modifications as applied via
     *            Exchange
     */
    protected void verifyOccurrenceChanges(final List<RoomReservation> createdReservations) {
        // Check that all reservations are now in the database as expected (i.e. matching the
        // objects changed locally).
        for (final RoomReservation reservation : createdReservations) {
            RoomReservation storedReservation =
                    this.reservationService.getActiveReservation(reservation.getReserveId(),
                        Constants.TIMEZONE_UTC);
            if (Constants.STATUS_CANCELLED.equals(reservation.getStatus())) {
                Assert.assertNull(storedReservation);
                storedReservation = this.reservationDataSource.get(reservation.getReserveId());
            } else {
                // This one has not been converted to UTC yet. Do it before comparing date/time.
                ReservationUtils.convertToTimeZone(reservation, Constants.TIMEZONE_UTC);
                Assert.assertEquals(reservation.getStartDateTime(),
                    storedReservation.getStartDateTime());
                Assert.assertEquals(reservation.getEndDateTime(),
                    storedReservation.getEndDateTime());
            }
            Assert.assertEquals(reservation.getStatus(), storedReservation.getStatus());
            Assert.assertEquals(reservation.getReservationName(),
                storedReservation.getReservationName());
            Assert.assertEquals(reservation.getAttendees(), storedReservation.getAttendees());
        }
    }

    /**
     * Test correcting the Exchange version for running the listener.
     */
    public void testCorrectExchangeVersion() {
        this.exchangeListener.setServiceHelper(this.serviceHelper);
        this.serviceHelper.setVersion(ExchangeVersion.Exchange2007_SP1.toString());
        this.exchangeListener.correctExchangeVersion();
        Assert.assertEquals(ExchangeVersion.Exchange2010_SP1.toString(),
            this.serviceHelper.getVersion());

        this.serviceHelper.setVersion(ExchangeVersion.Exchange2010.toString());
        this.exchangeListener.correctExchangeVersion();
        Assert.assertEquals(ExchangeVersion.Exchange2010_SP1.toString(),
            this.serviceHelper.getVersion());

        this.serviceHelper.setVersion(ExchangeVersion.Exchange2010_SP1.toString());
        this.exchangeListener.correctExchangeVersion();
        Assert.assertEquals(ExchangeVersion.Exchange2010_SP1.toString(),
            this.serviceHelper.getVersion());

        this.serviceHelper.setVersion(ExchangeVersion.Exchange2010_SP2.toString());
        this.exchangeListener.correctExchangeVersion();
        Assert.assertEquals(ExchangeVersion.Exchange2010_SP2.toString(),
            this.serviceHelper.getVersion());
    }

    /**
     * Set the Exchange listener service.
     *
     * @param exchangeListener the exchangeListener to set
     */
    public void setExchangeListener(final ExchangeListener exchangeListener) {
        this.exchangeListener = exchangeListener;
    }

    /**
     * Set the Calendar Service to test.
     *
     * @param calendarService the calendar service
     */
    public void setCalendarService(final ExchangeCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    /**
     * Specific Spring configuration for this test to avoid proxies. {@inheritDoc}
     */
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "exchange-listener.xml" };
    }

    /**
     * Set up a recurring meeting in the database and on the calendar.
     *
     * @return the list of created reservations (in building time)
     */
    protected List<RoomReservation> setupRecurringMeeting() {
        // Create a meeting with reservation via the RoomReservationService.
        final DataRecord record = createAndSaveRoomReservation(true);
        final String uniqueId = record.getString(RESERVE_OUTLOOK_UNIQUE_ID);

        final List<RoomReservation> createdReservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);
        Assert.assertTrue(createdReservations.size() > 2);
        // Allow for some slack time.
        sleep();
        sleep();

        this.exchangeListener.processInbox(this.serviceHelper.initializeService(this.serviceHelper
            .getResourceAccount()));

        Assert.assertNotNull(this.appointmentBinder.bindToAppointment(
            this.serviceHelper.getResourceAccount(), uniqueId));
        return createdReservations;
    }

    /**
     * Sleep for a short while to give the listener some time to respond.
     */
    protected void sleep() {
        try {
            Thread.sleep(SLEEP_MILLIS);
        } catch (final InterruptedException exception) {
            this.logger.warn("Sleep was interrupted.");
        }
    }

}