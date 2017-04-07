package com.archibus.app.reservation.exchange.service;

import java.util.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.ReservationUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.Utility;

/**
 * Test class for ExchangeListener.
 *
 * @author Yorik Gerlo
 */
public class ExchangeListenerTest extends ExchangeListenerTestBase {

    /**
     * Test processing the update and cancellation of a single appointment.
     */
    public void testProcessSingleAppointment() {
        final ExchangeService resourceExchangeService =
                this.serviceHelper.initializeService(this.serviceHelper.getResourceAccount());

        final RoomReservation reservation = createAndProcessReservation(resourceExchangeService);
        changeReservationViaExchange(reservation, resourceExchangeService);
        checkAgainstDatabase(reservation);

        // Allow time for the accept message to reach the organizer's mailbox.
        sleep();

        // Cancel the meeting via ExchangeCalendarService.
        final RoomReservation roomReservation = new RoomReservation();
        roomReservation.setEmail(reservation.getEmail());
        roomReservation.setUniqueId(reservation.getUniqueId());
        roomReservation.setRoomAllocations(reservation.getRoomAllocations());
        this.calendarService.cancelAppointment(roomReservation, CANCEL_MESSAGE, true);

        // Allow for some slack time.
        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);

        // Check that the reservation was cancelled by the creator.
        final RoomReservation cancelledReservation =
                this.reservationDataSource.get(reservation.getReserveId());
        Assert.assertEquals(Constants.STATUS_CANCELLED, cancelledReservation.getStatus());
        Assert.assertEquals(this.usernameForEmail, cancelledReservation.getLastModifiedBy());
    }

    /**
     * Test whether the exchange listener accepts a recurring appointment.
     */
    public void testAcceptRecurringAppointment() {
        final List<RoomReservation> createdReservations = setupRecurringMeeting();
        final RoomReservation firstReservation = createdReservations.get(0);
        Assert.assertFalse(TimePeriod.clearTime(Utility.currentDate()).after(
            firstReservation.getStartDate()));

        // Slack time for the listener's reply to reach the organizer's mailbox.
        sleep();
        sleep();

        final Appointment master =
                this.appointmentBinder.bindToAppointment(firstReservation.getEmail(),
                    firstReservation.getUniqueId());
        try {
            Assert.assertEquals(this.startDate, TimePeriod.clearTime(master.getStart()));
            Assert.assertEquals(MeetingResponseType.Accept, master.getResources()
                .getPropertyAtIndex(0).getResponseType());
        } catch (final ServiceLocalException e) {
            Assert.fail("Could not verify resource account response. " + e.toString());
        }
    }

    /**
     * Test whether the exchange listener accepts a recurring appointment that starts in the past
     * and has no reservations for the past occurrences.
     */
    public void testAcceptRecurringAppointmentStartingInThePast() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        // CHECKSTYLE:OFF Justification: this magic number is used for testing.
        calendar.add(Calendar.DATE, -3 * DAYS_IN_WEEK);
        // CHECKSTYLE:ON
        this.startDate = calendar.getTime();
        Assert.assertTrue(this.startDate.before(Utility.currentDate()));
        this.testAcceptRecurringAppointment();
    }

    /**
     * Test the scenario where the Exchange listener declines an update because the reservation
     * could not be updated.
     */
    public void testUpdateViaExchangeFailed() {
        final ExchangeService resourceExchangeService =
                this.serviceHelper.initializeService(this.serviceHelper.getResourceAccount());
        final RoomReservation reservation = createAndProcessReservation(resourceExchangeService);
        changeReservationViaExchange(reservation, resourceExchangeService);
        // Check that the reservation was updated.
        checkAgainstDatabase(reservation);

        // Create a second reservation.
        final RoomReservation secondReservation =
                createAndProcessReservation(resourceExchangeService);
        final RoomReservation unmodifiedReservation =
                this.reservationDataSource.getActiveReservation(secondReservation.getReserveId());
        changeReservationViaExchange(secondReservation, resourceExchangeService);
        // Check that the reservation was not updated and the resource account has declined.
        // Allow time for the decline message to reach the organizer's mailbox.
        sleep();
        sleep();

        final Appointment appointment =
                this.appointmentBinder.bindToAppointment(secondReservation.getEmail(),
                    secondReservation.getUniqueId());
        try {
            Assert.assertEquals(MeetingResponseType.Decline, appointment.getResources()
                .getPropertyAtIndex(0).getResponseType());
        } catch (final ServiceLocalException exception) {
            Assert.fail(exception.toString());
        }
        checkAgainstDatabase(unmodifiedReservation);

        // Cancel the meeting that could not be updated via ExchangeCalendarService.
        final RoomReservation roomReservation = new RoomReservation();
        roomReservation.setEmail(secondReservation.getEmail());
        roomReservation.setUniqueId(secondReservation.getUniqueId());
        roomReservation.setRoomAllocations(secondReservation.getRoomAllocations());
        this.calendarService.cancelAppointment(roomReservation, CANCEL_MESSAGE, true);

        // Allow for some slack time.
        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);

        // Check that the reservation was cancelled by the creator.
        final RoomReservation cancelledReservation =
                this.reservationDataSource.get(secondReservation.getReserveId());
        Assert.assertEquals(Constants.STATUS_CANCELLED, cancelledReservation.getStatus());
        Assert.assertEquals(this.usernameForEmail, cancelledReservation.getLastModifiedBy());
    }

    /**
     * Test declining a recurring meeting.
     */
    public void testDeclineRecurringMeeting() {
        // create a recurring meeting but cancel a reservation occurrence before processing
        final DataRecord record = createAndSaveRoomReservation(true);
        final String uniqueId = record.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        final List<RoomReservation> createdReservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);
        final RoomReservation firstReservation = createdReservations.get(0);
        this.reservationDataSource.cancel(createdReservations.get(2));

        // Allow for some slack time.
        sleep();
        sleep();

        this.exchangeListener.processInbox(this.serviceHelper.initializeService(this.serviceHelper
            .getResourceAccount()));

        // Allow for some slack time.
        sleep();

        // verify the resource account declined the meeting request
        final Appointment master =
                this.appointmentBinder.bindToAppointment(firstReservation.getEmail(), uniqueId);
        try {
            Assert.assertEquals(1, master.getResources().getCount());
            Assert.assertEquals(MeetingResponseType.Decline, master.getResources()
                .getPropertyAtIndex(0).getResponseType());
        } catch (final ServiceLocalException exception) {
            Assert.fail(exception.toString());
        }
    }

    /**
     * Create a regular reservation and process it with the Exchange Listener.
     *
     * @param resourceExchangeService the ExchangeService to use for processing Exchange events
     * @return the created reservation object
     */
    private RoomReservation createAndProcessReservation(
            final ExchangeService resourceExchangeService) {
        final Integer reservationId = this.createSingleReservation();
        // Check that the meeting is present in the database.
        final RoomReservation reservation =
                this.reservationService.getActiveReservation(reservationId, this.locationTimeZone);
        Assert.assertNotNull(reservation);
        // Allow for some slack time.
        sleep();

        this.exchangeListener.processInbox(resourceExchangeService);

        Assert.assertNotNull(this.appointmentBinder.bindToAppointment(
            this.serviceHelper.getResourceAccount(), reservation.getUniqueId()));

        return reservation;
    }

    /**
     * Create a single reservation.
     *
     * @return reservation id
     */
    protected int createSingleReservation() {
        final DataRecord record = createAndSaveRoomReservation(false);
        return record.getInt("reserve.res_id");
    }

    /**
     * Change the given reservation via Exchange.
     *
     * @param reservation the reservation to modify
     * @param resourceExchangeService the service to use for processing Exchange events
     */
    private void changeReservationViaExchange(final RoomReservation reservation,
            final ExchangeService resourceExchangeService) {
        // Change the meeting via Exchange.
        reservation.setReservationName("test update via Exchange");
        reservation.setComments("Updated appointment body.");
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(reservation.getStartDateTime());
        calendar.add(Calendar.DATE, 1);
        reservation.setStartDate(calendar.getTime());
        reservation.setEndDate(reservation.getStartDate());
        ReservationUtils.convertToTimeZone(reservation, this.locationTimeZone);
        this.calendarService.updateAppointment(reservation);

        // Allow for some slack time.
        sleep();
        this.exchangeListener.processInbox(resourceExchangeService);
    }

    /**
     * Check the given reservation object against the same reservation in the database.
     *
     * @param reservation the reservation to compare with the stored copy
     */
    protected void checkAgainstDatabase(final RoomReservation reservation) {
        final RoomReservation updatedReservation =
                this.reservationService.getActiveReservation(reservation.getReserveId(),
                    Constants.TIMEZONE_UTC);
        ReservationUtils.convertToTimeZone(reservation, Constants.TIMEZONE_UTC);
        Assert.assertEquals(reservation.getReservationName(),
            updatedReservation.getReservationName());
        Assert.assertEquals(reservation.getStartDateTime(), updatedReservation.getStartDateTime());
        Assert.assertEquals(reservation.getEndDateTime(), updatedReservation.getEndDateTime());
        Assert.assertEquals(reservation.getComments(), updatedReservation.getComments());
    }

}
