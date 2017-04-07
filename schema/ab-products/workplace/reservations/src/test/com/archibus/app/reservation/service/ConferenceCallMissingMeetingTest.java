package com.archibus.app.reservation.service;

import java.util.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.app.reservation.exchange.service.ExchangeCalendarVerifier;
import com.archibus.datasource.data.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

/**
 * Test for the ConferenceCallReservationService class for handling occurrence missing on the
 * calendar.
 * <p>
 * Suppress warning "PMD.TooManyMethods".
 * <p>
 * Justification: the JUnit tests for handling missing Exchange meetings for conference call
 * reservations should be kept in one test class.
 */
@SuppressWarnings("PMD.TooManyMethods")
public class ConferenceCallMissingMeetingTest extends ConferenceCallReservationServiceTestBase {

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

        // Ignore work requests for testing missing conference call meetings.
        withoutWorkRequests();
    }

    /**
     * Test editing a single occurrence of a recurring conference call reservation, while the
     * occurrence no longer exists in Exchange.
     */
    public void testUpdateMissingOccurrence() {
        Assert.assertNotNull(this.updateFullOccurrence(false));
    }

    /**
     * Test editing a single occurrence of a recurring conference call reservation, while the
     * occurrence no longer exists in Exchange.
     */
    public void testUpdateTwoMissingOccurrences() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        // take the primary room from the second occurrence
        final RoomReservation secondRes =
                this.reservationDataSource.getActiveReservation(reservationId + 1);
        final RoomReservation thirdRes =
                this.reservationDataSource.getActiveReservation(reservationId + 2);

        this.conferenceCallReservationService.calendarServiceWrapper.cancelCalendarEvent(secondRes,
            "cancel second occurrence");
        this.conferenceCallReservationService.calendarServiceWrapper.cancelCalendarEvent(thirdRes,
            "cancel third occurrence");

        roomAllocations = getSavedAllocations(secondRes.getParentId(), secondRes.getReserveId(),
            roomAllocations.getRecords().size());
        reservation.setValue(RESERVE_RES_ID, secondRes.getReserveId());
        reservation.setValue(
            Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_CONFERENCE,
            secondRes.getConferenceId());
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            secondRes.getParentId());
        reservation.setValue(RESERVE_DATE_START, secondRes.getStartDate());
        reservation.setValue(RESERVE_DATE_END, thirdRes.getEndDate());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, secondRes.getOccurrenceIndex());

        // Indicate a different time by changing the time zone.
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            ALTERNATIVE_TIME_ZONE_ID);

        // verify the occurrences were removed from the recurrence
        final List<RoomReservation> modifiedReservations2 =
                this.reservationDataSource.getByConferenceId(secondRes.getConferenceId(), false);
        assertRemovedFromRecurrence(modifiedReservations2, secondRes);

        // verify the occurrences were removed from the recurrence
        final List<RoomReservation> modifiedReservations3 =
                this.reservationDataSource.getByConferenceId(thirdRes.getConferenceId(), false);
        assertRemovedFromRecurrence(modifiedReservations3, secondRes);
    }

    /**
     * Test editing a single occurrence of a recurring conference call reservation, while the
     * occurrence no longer exists in Exchange.
     */
    public void testUpdateSeriesWithMissingOccurrence() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        // take the primary room of the second occurrence
        final RoomReservation primaryReservation =
                this.reservationDataSource.getActiveReservation(reservationId + 1);

        this.conferenceCallReservationService.calendarServiceWrapper.cancelCalendarEvent(
            primaryReservation,
            "cancel second occurrence to test separation while updating series");

        roomAllocations = getSavedAllocations(reservationId, reservationId,
            roomAllocations.getRecords().size());
        reservation.setValue(
            Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_CONFERENCE, reservationId);
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            reservationId);
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, 1);

        // Indicate a different time by changing the time zone.
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            ALTERNATIVE_TIME_ZONE_ID);

        final List<RoomReservation> modifiedReservations =
                this.reservationDataSource.getByConferenceId(reservationId + 1, false);

        // also verify the occurrence was removed from the recurrence
        assertRemovedFromRecurrence(modifiedReservations, primaryReservation);
    }

    /**
     * Test editing a single room on a single occurrence of a recurring conference call reservation,
     * while the occurrence no longer exists in Exchange.
     */
    public void testEditSingleRoomReservationMissingOccurrence() {
        Assert.assertNotNull(this.updateSingleLocationOccurrence(false));
    }

    /**
     * Test updating a single occurrence when the entire series is missing.
     */
    public void testUpdateOccurrenceMissingSeries() {
        Assert.assertNotNull(this.updateFullOccurrence(true));
    }

    /**
     * Test updating a full series starting from the second occurrence when the sereis no longer
     * exists in Exchange.
     */
    public void testUpdateMissingSeries() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        Assert.assertTrue(reservationId > 0);

        // take the primary room of the second occurrence
        final RoomReservation primaryReservation =
                this.reservationDataSource.getActiveReservation(reservationId + 1);

        this.conferenceCallReservationService.calendarServiceWrapper.cancelRecurringCalendarEvent(
            primaryReservation, "cancel series to test creating a new series");

        roomAllocations = getSavedAllocations(reservationId, primaryReservation.getReserveId(),
            roomAllocations.getRecords().size());
        reservation.setValue(RESERVE_RES_ID, primaryReservation.getReserveId());
        reservation.setValue(
            Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_CONFERENCE,
            primaryReservation.getConferenceId());
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            primaryReservation.getParentId());
        reservation.setValue(RESERVE_DATE_START, primaryReservation.getStartDate());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, primaryReservation.getOccurrenceIndex());
        final int numberOfOccurrences =
                this.reservationDataSource.getByParentId(reservationId, null, null, true).size();

        // Indicate a different time by changing the time zone.
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            ALTERNATIVE_TIME_ZONE_ID);

        this.checkNewSeriesFromSecondOccurrence(reservation, roomAllocations.getRecords().size(),
            primaryReservation, numberOfOccurrences);

        try {
            // check the master appointment exists in Exchange
            this.checkUpdatedMaster(
                this.reservationDataSource.getActiveReservation(primaryReservation.getReserveId()));
        } catch (final ServiceLocalException exception) {
            Assert.fail("Error reading updated master appointment. " + exception);
        }
    }

    /**
     * Check whether the new series is saved correctly staring from the second occurrence.
     *
     * @param reservation the reservation data record used for editing the reservations
     * @param numberOfRooms the number of rooms per occurrence
     * @param secondRes the primary room reservation
     * @param numberOfOccurrences the original number of occurrences
     */
    private void checkNewSeriesFromSecondOccurrence(final DataRecord reservation,
            final int numberOfRooms, final RoomReservation secondRes,
            final int numberOfOccurrences) {
        final SortedMap<Integer, List<RoomReservation>> modifiedReservations =
                this.reservationDataSource
                    .getAllReservationsInConferenceSeries(secondRes.getConferenceId(), false);
        Assert.assertEquals(numberOfOccurrences - 1, modifiedReservations.size());

        // check that all modified reservations have a new unique id, occurrence index and parent id
        final String newUniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        int expectedOccurrenceIndex = 1;
        for (final Integer conferenceId : modifiedReservations.keySet()) {
            final List<RoomReservation> reservationsOnDate = modifiedReservations.get(conferenceId);
            Assert.assertEquals(numberOfRooms, reservationsOnDate.size());
            for (final RoomReservation reservationOnDate : reservationsOnDate) {
                Assert.assertEquals(newUniqueId, reservationOnDate.getUniqueId());
                Assert.assertEquals(expectedOccurrenceIndex,
                    reservationOnDate.getOccurrenceIndex());
                /*
                 * The parent id should equal the reservation id of the first occurrence for this
                 * location. Reservations are numbered per location so the expected parent id can be
                 * calculated based on the reservation id.
                 */
                Assert.assertEquals(
                    Integer.valueOf(reservationOnDate.getReserveId() - expectedOccurrenceIndex + 1),
                    reservationOnDate.getParentId());
            }
            ++expectedOccurrenceIndex;
        }
    }

    /**
     * Test editing one location on one date when the series is missing.
     */
    public void testEditSingleRoomReservationMissingSeries() {
        Assert.assertNotNull(this.updateSingleLocationOccurrence(true));
    }

    /**
     * Test editing multiple occurrences of a single location when the entire series is missing.
     */
    public void testEditSingleRoomRecurringMissingSeries() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        Assert.assertTrue(reservationId > 0);

        // Get the third room on the second occurrence.
        final RoomReservation reservationToEdit =
                this.reservationDataSource.getByConferenceId(reservationId + 1, false).get(2);

        this.conferenceCallReservationService.calendarServiceWrapper.cancelRecurringCalendarEvent(
            reservationToEdit, "cancel to test creating a new series for editing single room");

        roomAllocations = getSavedAllocations(reservationId, reservationToEdit.getConferenceId(),
            roomAllocations.getRecords().size());
        reservation.setValue(RESERVE_RES_ID, reservationToEdit.getReserveId());
        reservation.setValue(
            Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_CONFERENCE,
            reservationToEdit.getConferenceId());
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            reservationToEdit.getParentId());
        reservation.setValue(RESERVE_DATE_START, reservationToEdit.getStartDate());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, reservationToEdit.getOccurrenceIndex());
        final int numberOfOccurrences =
                this.reservationDataSource.getByParentId(reservationId, null, null, true).size();

        final DataRecord roomAllocation =
                this.getModifiedRoomAllocation(roomAllocations, reservationToEdit);
        this.conferenceCallReservationService.editSingleRoomReservation(reservation, roomAllocation,
            null, null);

        this.checkNewSeriesFromSecondOccurrence(reservation, roomAllocations.getRecords().size(),
            reservationToEdit, numberOfOccurrences);

        try {
            // check the master appointment exists in Exchange
            this.checkUpdatedMaster(this.reservationDataSource
                .getActiveReservation(reservationToEdit.getConferenceId()));
        } catch (final ServiceLocalException exception) {
            Assert.fail("Error reading appointment. " + exception);
        }
    }

    /**
     * Actual test code to update an occurrence when either the occurrence or the series is not
     * found in Exchange.
     *
     * @param cancelSeries true to test with missing series, false to test with missing occurrence
     * @return unique id of the meeting generated to replace the missing occurrence / series
     */
    private String updateFullOccurrence(final boolean cancelSeries) {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        // take the primary room from the second occurrence
        final RoomReservation primaryReservation =
                this.reservationDataSource.getActiveReservation(reservationId + 1);

        if (cancelSeries) {
            this.conferenceCallReservationService.calendarServiceWrapper
                .cancelRecurringCalendarEvent(primaryReservation,
                    "cancel series to test separation");
        } else {
            this.conferenceCallReservationService.calendarServiceWrapper.cancelCalendarEvent(
                primaryReservation, "cancel second occurrence to test separation");
        }

        roomAllocations = getSavedAllocations(reservationId, primaryReservation.getReserveId(),
            roomAllocations.getRecords().size());
        reservation.setValue(RESERVE_RES_ID, primaryReservation.getReserveId());
        reservation.setValue(
            Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_CONFERENCE,
            primaryReservation.getConferenceId());
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            primaryReservation.getParentId());
        reservation.setValue(RESERVE_DATE_START, primaryReservation.getStartDate());
        reservation.setValue(RESERVE_DATE_END, primaryReservation.getEndDate());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, primaryReservation.getOccurrenceIndex());

        // Indicate a different time by changing the time zone.
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            ALTERNATIVE_TIME_ZONE_ID);

        final List<RoomReservation> modifiedReservations =
                this.reservationDataSource.getByConferenceId(reservationId + 1, false);

        // also verify the occurrence was removed from the recurrence
        assertRemovedFromRecurrence(modifiedReservations, primaryReservation);
        return reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
    }

    /**
     * Actual test code to update a single location of an occurrence when either the occurrence or
     * the series is not found in Exchange.
     *
     * @param cancelSeries true to test with missing series, false to test with missing occurrence
     * @return unique id of the meeting generated to replace the missing occurrence / series
     */
    private String updateSingleLocationOccurrence(final boolean cancelSeries) {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        // Get the third room on the second occurrence.
        final RoomReservation originalReservation =
                this.reservationDataSource.getByConferenceId(reservationId + 1, false).get(2);

        if (cancelSeries) {
            this.conferenceCallReservationService.calendarServiceWrapper
                .cancelRecurringCalendarEvent(originalReservation,
                    "cancel full series to test separation from a single location");
        } else {
            this.conferenceCallReservationService.calendarServiceWrapper
                .cancelCalendarEvent(originalReservation, "cancel occurrence to test separation");
        }

        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            originalReservation.getParentId());
        final List<RoomReservation> modifiedReservations =
                this.editSingleRoom(reservation, roomAllocations, originalReservation);

        // also verify the occurrence was removed from the recurrence
        assertRemovedFromRecurrence(modifiedReservations, originalReservation);
        return reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
    }

    /**
     * Verify the given conference call reservations are no longer marked recurring and are
     * currently linked to a single meeting in Exchange.
     *
     * @param confCallReservations the conference call reservations to check
     * @param originalReservation the original reservation on that date before it was removed from
     *            the recurrence series
     */
    private void assertRemovedFromRecurrence(final List<RoomReservation> confCallReservations,
            final RoomReservation originalReservation) {
        for (final RoomReservation confCallReservation : confCallReservations) {
            Assert.assertNull(confCallReservation.getParentId());
            Assert.assertNull(confCallReservation.getRecurringRule());
            Assert.assertEquals(0, confCallReservation.getOccurrenceIndex());
            Assert.assertNotSame(originalReservation.getUniqueId(),
                confCallReservation.getUniqueId());
        }

        // and the corresponding meeting is now a single meeting
        final Appointment appointment = this.appointmentBinder.bindToAppointment(
            originalReservation.getEmail(), confCallReservations.get(0).getUniqueId());
        try {
            Assert.assertEquals(AppointmentType.Single, appointment.getAppointmentType());
            ExchangeCalendarVerifier.checkExchangeEquivalence(confCallReservations.get(0),
                this.appointmentBinder, this.appointmentHelper, this.serviceHelper);
        } catch (final ServiceLocalException exception) {
            Assert.fail(exception.toString());
        }

    }

    /**
     * Test cancelling a single location of a missing occurrence of a recurring conference call.
     */
    public void testCancelOneLocationOfMissingOccurrence() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);
        // Get the primary room on the last occurrence.
        final RoomReservation originalReservation =
                primaryReservations.get(primaryReservations.size() - 1);
        Assert.assertNotNull(originalReservation);

        // remove the last occurrence from the calendar
        this.conferenceCallReservationService.calendarServiceWrapper
            .cancelCalendarEvent(originalReservation, "cancel last occurrence to test separation");

        // now cancel one room of the last occurrence
        this.roomReservationService.cancelRoomReservation(originalReservation.getReserveId(),
            "cancelling room of last occurrence");

        // verify the remaining reservations on that occurrence still exist but are no longer
        // recurring
        final List<RoomReservation> confCallReservations = this.reservationDataSource
            .getByConferenceId(originalReservation.getConferenceId(), false);
        Assert.assertEquals(roomAllocations.getRecords().size() - 1, confCallReservations.size());
        this.assertRemovedFromRecurrence(confCallReservations, originalReservation);
    }

    /**
     * Get all room allocations created for a single occurrence.
     *
     * @param parentId parent id of the primary reservation on that occurrence
     * @param reservationId id of the primary reservation on that occurrence
     * @param numberOfAllocations number of allocations per occurrence
     * @return list of room allocations on that occurrence
     */
    private DataSetList getSavedAllocations(final int parentId, final int reservationId,
            final int numberOfAllocations) {
        /*
         * We get the saved room allocations from db. First count the number of occurrences. The
         * reservation id's for the other reservations on the same occurrence can be calculated
         * based on the number of occurrences and number of allocations.
         */
        final int numberOfOccurrences =
                this.reservationDataSource.getByParentId(parentId, null, null, true).size();
        final List<DataRecord> replacementAllocations = new ArrayList<DataRecord>();
        for (int i = 0; i < numberOfAllocations; ++i) {
            replacementAllocations.add(this.roomAllocationDataSource
                .getRecord("res_id = " + (reservationId + i * numberOfOccurrences)));
        }
        return new DataSetList(replacementAllocations);
    }

}
