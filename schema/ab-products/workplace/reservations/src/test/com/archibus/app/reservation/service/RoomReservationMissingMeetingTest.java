package com.archibus.app.reservation.service;

import java.util.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

/**
 * Test for the RoomReservationService class for handling missing meetings.
 */
public class RoomReservationMissingMeetingTest extends RoomReservationServiceTestBase {

    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        // Ignore work requests when testing missing meetings.
        withoutWorkRequests();
    }

    /**
     * Test updating a room reservation occurrence that no longer has a corresponding meeting
     * occurrence.
     */
    public void testUpdateMissingOccurrence() {
        final DataRecord reservation = createAndSaveRoomReservation(true);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(uniqueId);

        final List<RoomReservation> reservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);

        final RoomReservation secondRes = reservations.get(1);
        // cancel the second occurrence on the calendar
        this.roomReservationService.calendarServiceWrapper.cancelCalendarEvent(secondRes,
            "cancel occurrence to test separation");

        updateOccurrence(reservation, uniqueId, secondRes);
    }

    /**
     * Test updating a room reservation series that has a missing occurrence.
     */
    public void testUpdateSeriesWithMissingOccurrence() {
        final DataRecord reservation = createAndSaveRoomReservation(true);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(uniqueId);

        final List<RoomReservation> reservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);

        final RoomReservation secondRes = reservations.get(1);
        // cancel the second occurrence on the calendar
        this.roomReservationService.calendarServiceWrapper.cancelCalendarEvent(secondRes,
            "cancel second occurrence to test updating full series");

        /*
         * Start the update from the first occurrence so the application will update the full series
         * in a single operation.
         */
        reservation.setValue(RESERVE_RES_PARENT, reservation.getValue(RESERVE_RES_ID));
        reservation.setValue(RESERVE_DATE_END,
            reservations.get(reservations.size() - 1).getStartDate());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, 1);
        // create a new room allocation object, link it to the reservation
        final DataRecord roomAllocation = createRoomAllocation();
        roomAllocation.setValue(RESERVE_RM_RMRES_ID,
            reservations.get(0).getRoomAllocations().get(0).getId());
        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);
        Assert.assertEquals(uniqueId, reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID));

        final List<RoomReservation> updatedReservations = this.reservationDataSource
            .getByParentId(secondRes.getParentId(), null, null, false);
        Assert.assertEquals(reservations.size() - 1, updatedReservations.size());

        final RoomReservation updatedSecondRes =
                this.reservationDataSource.getActiveReservation(secondRes.getReserveId());
        Assert.assertNotSame(uniqueId, updatedSecondRes.getUniqueId());
    }

    /**
     * Test updating part of a room reservation series that has 2 missing occurrences.
     */
    public void testUpdateTwoMissingOccurrences() {
        final DataRecord reservation = createAndSaveRoomReservation(true);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(uniqueId);

        final List<RoomReservation> reservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);

        final RoomReservation secondRes = reservations.get(1);
        final RoomReservation thirdRes = reservations.get(2);
        // cancel the second occurrence on the calendar
        this.roomReservationService.calendarServiceWrapper.cancelCalendarEvent(secondRes,
            "cancel second occurrence to test separation");
        this.roomReservationService.calendarServiceWrapper.cancelCalendarEvent(thirdRes,
            "cancel third occurrence to test separation");

        /*
         * Start the update from the second occurrence so the application will update each
         * occurrence separately.
         */
        reservation.setValue(RESERVE_RES_PARENT, reservation.getValue(RESERVE_RES_ID));
        reservation.setValue(RESERVE_RES_ID, secondRes.getReserveId());
        reservation.setValue(RESERVE_DATE_START, secondRes.getStartDate());
        reservation.setValue(RESERVE_DATE_END,
            reservations.get(reservations.size() - 1).getStartDate());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, 2);
        // create a new room allocation object, link it to the reservation
        final DataRecord roomAllocation = createRoomAllocation();
        roomAllocation.setValue(RESERVE_RM_RMRES_ID, secondRes.getRoomAllocations().get(0).getId());
        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);
        Assert.assertEquals(uniqueId, reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID));

        final List<RoomReservation> updatedReservations = this.reservationDataSource
            .getByParentId(secondRes.getParentId(), null, null, false);
        Assert.assertEquals(reservations.size() - 2, updatedReservations.size());

        this.verifyRemovedFromRecurrence(secondRes, this.reservationService
            .getActiveReservation(secondRes.getReserveId(), Constants.TIMEZONE_UTC));
        this.verifyRemovedFromRecurrence(thirdRes, this.reservationService
            .getActiveReservation(thirdRes.getReserveId(), Constants.TIMEZONE_UTC));
    }

    /**
     * Verify the given reservation has been removed from the recurrence and linked to a new single
     * meeting.
     *
     * @param originalReservation the original reservation
     * @param updatedReservation the updated reservation (converted to UTC)
     */
    private void verifyRemovedFromRecurrence(final RoomReservation originalReservation,
            final RoomReservation updatedReservation) {
        Assert.assertNotSame(originalReservation.getUniqueId(), updatedReservation.getUniqueId());
        Assert.assertNull(updatedReservation.getParentId());
        Assert.assertEquals(0, updatedReservation.getOccurrenceIndex());

        final Appointment appointment = this.appointmentBinder
            .bindToAppointment(updatedReservation.getEmail(), updatedReservation.getUniqueId());
        Assert.assertNotNull(appointment);

        // Check that the occurrence is now a single meeting
        try {
            Assert.assertEquals(AppointmentType.Single, appointment.getAppointmentType());
            checkEquivalence(updatedReservation, appointment);
        } catch (final ServiceLocalException exception) {
            throw new ExceptionBase(exception.toString(), exception);
        }
    }

    /**
     * Test updating a room reservation occurrence for which the meeting series is not found in
     * Exchange.
     */
    public void testUpdateOccurrenceMissingSeries() {
        final DataRecord reservation = createAndSaveRoomReservation(true);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(uniqueId);

        final List<RoomReservation> reservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);

        final RoomReservation secondRes = reservations.get(1);
        // cancel the series on the calendar
        this.roomReservationService.calendarServiceWrapper.cancelRecurringCalendarEvent(secondRes,
            "cancel series to test separating an occurrence");

        updateOccurrence(reservation, uniqueId, secondRes);
    }

    /**
     * Test updating a room reservation series for which the meeting series is not found in
     * Exchange.
     */
    public void testUpdateMissingSeries() {
        final DataRecord reservation = createAndSaveRoomReservation(true);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(uniqueId);

        final List<RoomReservation> reservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);

        final List<RoomReservation> updatedReservations =
                updateSeriesFromSecondOccurrence(reservation, uniqueId, reservations);

        Assert.assertEquals(reservations.size() - 1, updatedReservations.size());
    }

    /**
     * Update a recurring meeting starting from the second occurrence to create a new series in
     * Exchange.
     *
     * @param reservation the reservation record to modify so it matches the second occurrence
     * @param uniqueId the previous unique id
     * @param reservations the reservations originally part of the series
     * @return the reservations part of the new series
     */
    private List<RoomReservation> updateSeriesFromSecondOccurrence(final DataRecord reservation,
            final String uniqueId, final List<RoomReservation> reservations) {
        final RoomReservation secondRes = reservations.get(1);
        // cancel the series on the calendar
        this.roomReservationService.calendarServiceWrapper.cancelRecurringCalendarEvent(secondRes,
            "cancel series to test creating a new series");

        // Adjust the data record to match the second reservation
        reservation.setValue(RESERVE_RES_PARENT, reservation.getValue(RESERVE_RES_ID));
        reservation.setValue(RESERVE_RES_ID, secondRes.getReserveId());
        reservation.setValue(RESERVE_DATE_START, secondRes.getStartDate());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, 2);
        // create a new room allocation object, link it to the reservation
        final DataRecord roomAllocation = createRoomAllocation();
        roomAllocation.setValue(RESERVE_RM_RMRES_ID, secondRes.getRoomAllocations().get(0).getId());
        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);
        Assert.assertNotSame(uniqueId, reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID));

        final List<RoomReservation> updatedReservations = this.reservationDataSource
            .getByParentId(secondRes.getReserveId(), null, null, false);
        try {
            this.checkUpdatedMaster(updatedReservations.get(0));
        } catch (final ServiceLocalException exception) {
            Assert.fail("Error reading updated master appointment. " + exception);
        }
        return updatedReservations;
    }

    /**
     * Test updating a room reservation series for which the meeting series is not found in Exchange
     * and one reservation in the series was already cancelled.
     */
    public void testUpdateMissingSeriesWithCancelledOccurrence() {
        final DataRecord reservation = createAndSaveRoomReservation(true);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(uniqueId);

        final List<RoomReservation> reservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);

        final RoomReservation thirdRes = reservations.get(2);
        this.roomReservationService.cancelRoomReservation(thirdRes.getReserveId(),
            "cancel an occurrence to keep cancelled in new series");

        final List<RoomReservation> updatedReservations =
                updateSeriesFromSecondOccurrence(reservation, uniqueId, reservations);

        Assert.assertEquals(reservations.size() - 2, updatedReservations.size());

        final RoomReservation cancelledReservation = updatedReservations.get(1);
        cancelledReservation.setOccurrenceIndex(2);
        Assert.assertNull(this.appointmentBinder.bindToOccurrence(
            this.appointmentBinder.getInitializedService(cancelledReservation),
            cancelledReservation, null));
    }

    /**
     * Update the given occurrence which should then be linked to a new meeting on the calendar.
     *
     * @param reservation the data record used to create the initial recurring meeting
     * @param uniqueId the unique id of the initial meeting series
     * @param secondRes the second reservation in the meeting series, which will be updated
     */
    private void updateOccurrence(final DataRecord reservation, final String uniqueId,
            final RoomReservation secondRes) {
        // Adjust the data record to match the second reservation
        reservation.setValue(RESERVE_RES_PARENT, reservation.getValue(RESERVE_RES_ID));
        reservation.setValue(RESERVE_RES_ID, secondRes.getReserveId());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, 2);

        // move the reservation 1 day so theoretically recurring_date_modified would be set
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(secondRes.getStartDate());
        calendar.add(Calendar.DATE, 1);
        reservation.setValue(RESERVE_DATE_START, calendar.getTime());
        reservation.setValue(RESERVE_DATE_END, calendar.getTime());

        // create a new room allocation object, link it to the reservation
        final DataRecord roomAllocation = createRoomAllocation();
        roomAllocation.setValue(RESERVE_RM_RMRES_ID, secondRes.getRoomAllocations().get(0).getId());
        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);
        Assert.assertNotSame(uniqueId, reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID));

        final RoomReservation updatedSecondRes = this.reservationService
            .getActiveReservation(secondRes.getReserveId(), Constants.TIMEZONE_UTC);

        Assert.assertNull(updatedSecondRes.getParentId());
        Assert.assertNull(updatedSecondRes.getRecurringRule());
        Assert.assertEquals(0, updatedSecondRes.getOccurrenceIndex());
        Assert.assertEquals(0, updatedSecondRes.getRecurringDateModified());

        final Appointment appointment = this.appointmentBinder
            .bindToAppointment(updatedSecondRes.getEmail(), updatedSecondRes.getUniqueId());
        Assert.assertNotNull(appointment);

        // Check that the occurrence is now a single meeting
        try {
            Assert.assertEquals(AppointmentType.Single, appointment.getAppointmentType());
            checkEquivalence(updatedSecondRes, appointment);
        } catch (final ServiceLocalException exception) {
            throw new ExceptionBase(exception.toString(), exception);
        }
    }

}
