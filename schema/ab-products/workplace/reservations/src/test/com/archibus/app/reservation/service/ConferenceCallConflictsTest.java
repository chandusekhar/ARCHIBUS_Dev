package com.archibus.app.reservation.service;

import java.util.List;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.datasource.data.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

/**
 * Test for room conflicts with recurring conference call reservations.
 */
public class ConferenceCallConflictsTest extends ConferenceCallReservationServiceTestBase {

    /** First part of location string for conference call with conflicts. */
    private static final String CONFLICTS = "conflicts";

    /** First part of location string for conference call without conflicts. */
    private static final String MULTIPLE = "Multiple";

    /** Comments for cancellation. */
    private static final String CANCEL_COMMENTS1 = "cancelled one location ";

    /**
     * Test saving a recurring conference call reservation with room conflicts on the third and
     * fourth occurrence.
     */
    public void testSaveRecurringReservationWithConflicts() {
        try {
            this.saveRecurringReservationWithConflicts(2);
        } catch (final ServiceLocalException exception) {
            Assert.fail("Error saving with conflicts: " + exception);
        }
    }

    /**
     * Test saving a recurring conference call reservation with room conflicts on the first and
     * second occurrence.
     */
    public void testSaveRecurringReservationWithConflictOnFirstOccurrence() {
        try {
            this.saveRecurringReservationWithConflicts(0);
        } catch (final ServiceLocalException exception) {
            Assert.fail("Error saving with conflict on first occurrence: " + exception);
        }
    }

    /**
     * Save a recurring reservation with 2 conflicts starting from the given occurrence. Verify
     * results.
     *
     * @param firstConflictIndex first occurrence index to generate a conflict for
     * @throws ServiceLocalException when the appointment location cannot be read for verification
     */
    private void saveRecurringReservationWithConflicts(final int firstConflictIndex)
            throws ServiceLocalException {
        this.createConflicts(firstConflictIndex);

        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);

        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt("reserve.res_id");

        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);
        final RoomReservation primaryReservation = primaryReservations.get(0);

        // bind to series, check location
        final Appointment master = this.appointmentBinder
            .bindToAppointment(primaryReservation.getEmail(), primaryReservation.getUniqueId());
        Assert.assertEquals(this.spaceService.getLocationString(
            primaryReservations.get(primaryReservations.size() - 1)), master.getLocation());

        // bind to first several occurrences, check location
        for (int i = 0; i < primaryReservations.size(); ++i) {
            final RoomReservation primaryOccurrence = primaryReservations.get(i);
            final Appointment occurrence = this.appointmentBinder
                .bindToOccurrence(master.getService(), primaryOccurrence, master);
            if (i == firstConflictIndex || i == firstConflictIndex + 1) {
                Assert.assertTrue(occurrence.getLocation(),
                    occurrence.getLocation().contains(CONFLICTS));
                primaryOccurrence.setRoomConflictInConferenceCall(true);
            }
            Assert.assertEquals(this.spaceService.getLocationString(primaryOccurrence),
                occurrence.getLocation());
        }
    }

    /**
     * Test editing a single room on a single occurrence of a recurring conference call reservation.
     */
    public void testEditSingleRoomOccurrenceWithConflicts() {
        this.createConflicts(1);
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        // Get the first room on the second occurrence.
        final RoomReservation originalReservation =
                this.reservationDataSource.getActiveReservation(reservationId + 1);
        Assert.assertNotNull(originalReservation);
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            originalReservation.getParentId());
        this.editSingleRoom(reservation, roomAllocations, originalReservation);

        checkModifiedLocation(originalReservation, null);
    }

    /**
     * Check that the meeting location was modified to no longer indicate a conflict.
     *
     * @param reservation the reservation for the occurrence to check
     * @param master the master appointment
     */
    private void checkModifiedLocation(final RoomReservation reservation,
            final Appointment master) {
        // Verify the location still indicates conflicts.
        final Appointment occurrence = this.appointmentBinder.bindToOccurrence(
            this.serviceHelper.initializeService(this.email), reservation, master);
        try {
            Assert.assertTrue(occurrence.getLocation().startsWith(MULTIPLE));
        } catch (final ServiceLocalException exception) {
            Assert.fail("Location could not be verified");
        }
    }

    /**
     * Test editing a single room on a single occurrence of a recurring conference call reservation.
     */
    public void testEditSingleRoomReservationRecurring() {
        this.createConflicts(1);
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        // Get the first room on the first occurrence.
        final RoomReservation originalReservation =
                this.reservationDataSource.getActiveReservation(reservationId);
        Assert.assertNotNull(originalReservation);
        editSingleRoomRecurring(reservation, roomAllocations, originalReservation);

        checkModifiedLocation(originalReservation, null);
    }

    /**
     * Test cancelling a single location of a recurring conference call.
     */
    public void testCancelOneLocationInRecurringConferenceReservation() {
        createConflicts(1);
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);

        this.roomReservationService.cancelRecurringRoomReservation(reservationId, CANCEL_COMMENTS1);

        try {
            // Verify the location for all occurrences
            final Appointment master = this.appointmentBinder.bindToAppointment(this.email,
                primaryReservations.get(0).getUniqueId());
            Assert.assertTrue(master.getLocation().startsWith(MULTIPLE));

            for (final RoomReservation primaryReservation : primaryReservations) {
                final List<RoomReservation> confCallReservations = this.reservationDataSource
                    .getByConferenceId(primaryReservation.getConferenceId(), true);
                Assert.assertEquals(2, confCallReservations.size());
                for (final RoomReservation confCallReservation : confCallReservations) {
                    Assert.assertTrue(confCallReservation.getComments().contains(CANCEL_COMMENTS1));
                }
                this.checkModifiedLocation(primaryReservation, master);
            }
        } catch (final ServiceLocalException exception) {
            Assert.fail("Couldn't verify master location" + exception);
        }
    }

    /**
     * Test cancelling a single location of a single occurrence of a recurring conference call.
     */
    public void testRemoveRoomSingleOccurrence() {
        createConflicts(1);
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);
        Assert.assertFalse(primaryReservations.isEmpty());

        // Cancel the 3rd occurrence of the second room.
        final RoomReservation primaryReservation = primaryReservations.get(2);
        final int reservationIdToCancel =
                primaryReservation.getReserveId() + primaryReservations.size();

        this.roomReservationService.cancelRoomReservation(reservationIdToCancel, CANCEL_COMMENTS1);

        try {
            // check the 3rd occurrence still indicates a conflict
            final Appointment occurrence = this.appointmentBinder.bindToOccurrence(
                this.serviceHelper.initializeService(this.email), primaryReservation, null);
            Assert.assertTrue(occurrence.getLocation().startsWith(CONFLICTS));
        } catch (final ServiceLocalException exception) {
            Assert.fail("Could not verify location" + exception);
        }
    }

    /**
     * Test cancelling a conflict in a single occurrence of a recurring conference call.
     */
    public void testCancelConflictSingleOccurrence() {
        createConflicts(1);
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);
        Assert.assertFalse(primaryReservations.isEmpty());

        // Cancel the 3rd occurrence of the first room.
        final RoomReservation primaryReservation = primaryReservations.get(2);
        final int reservationIdToCancel = primaryReservation.getReserveId();

        this.roomReservationService.cancelRoomReservation(reservationIdToCancel, CANCEL_COMMENTS1);
        this.checkModifiedLocation(primaryReservation, null);
    }

}
