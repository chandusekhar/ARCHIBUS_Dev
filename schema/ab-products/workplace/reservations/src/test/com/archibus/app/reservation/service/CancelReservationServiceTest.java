package com.archibus.app.reservation.service;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.datasource.data.DataRecord;

/**
 * Test for the Cancelling reservation service class.
 */
public class CancelReservationServiceTest extends RoomReservationServiceTestBase {

    /** HQ time zone id. */
    private static final String TIME_ZONE_ID = "America/New_York";

    /** The conference reservation handler. */
    protected ConferenceCallReservationService conferenceCallReservationService;

    /** The cancel reservation service. */
    protected CancelReservationService cancelReservationService;

    /**
     * Test cancelling a single conference call.
     */
    public void testCancelSingleConferenceCall() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        this.conferenceCallReservationService.saveReservation(reservation, createRoomAllocations(),
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final RoomReservation roomReservation = this.reservationDataSource.get(reservationId);

        final List<RoomReservation> failures =
                this.cancelReservationService.cancelRoomReservationsByUniqueId(
                    roomReservation.getUniqueId(), roomReservation.getEmail(), reservationId, true);
        Assert.assertTrue(failures.isEmpty());
        Assert.assertTrue(this.reservationDataSource.getByUniqueId(roomReservation.getUniqueId(),
            null, null).isEmpty());
    }

    /**
     * Test cancelling a recurring conference call.
     */
    public void testCancelRecurringConferenceCall() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        this.conferenceCallReservationService.saveReservation(reservation, createRoomAllocations(),
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final RoomReservation roomReservation = this.reservationDataSource.get(reservationId);

        List<RoomReservation> failures =
                this.cancelReservationService.cancelRoomReservationsByUniqueId(
                    roomReservation.getUniqueId(), roomReservation.getEmail(), reservationId, true);
        Assert.assertTrue(failures.isEmpty());
        Assert.assertFalse(this.reservationDataSource.getByUniqueId(roomReservation.getUniqueId(),
            null, null).isEmpty());

        failures =
                this.cancelReservationService.cancelRoomReservationsByUniqueId(
                    roomReservation.getUniqueId(), roomReservation.getEmail(), null, true);
        Assert.assertTrue(failures.isEmpty());
        Assert.assertTrue(this.reservationDataSource.getByUniqueId(roomReservation.getUniqueId(),
            null, null).isEmpty());
    }

    /**
     * Sets the reservation service for cancelling.
     *
     * @param cancelReservationService the new cancelling service
     */
    public void setCancelReservationService(final CancelReservationService cancelReservationService) {
        this.cancelReservationService = cancelReservationService;
    }

    /**
     * Sets the conference calls service.
     *
     * @param conferenceCallReservationService the new conference call reservation service
     */
    public void setConferenceCallReservationService(
            final ConferenceCallReservationService conferenceCallReservationService) {
        this.conferenceCallReservationService = conferenceCallReservationService;
    }

}
