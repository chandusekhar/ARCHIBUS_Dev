package com.archibus.app.reservation.service;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.datasource.data.*;

import junit.framework.Assert;

/**
 * Test class for ConferenceReservationService.
 *
 * @author Yorik Gerlo
 *         <p>
 *         Suppress warning "PMD.TooManyMethods".
 *         <p>
 *         Justification: the JUnit tests for this class should be kept in one test class.
 */
@SuppressWarnings("PMD.TooManyMethods")
public class ConferenceReservationServiceTest extends ConferenceCallReservationServiceTestBase {

    /** Configuration id for room 109. */
    private static final String CONF_A = "CONF-A";

    /** Room id for room 109. */
    private static final String RM_109 = "109";

    /** Floor id for room 109. */
    private static final String FL_17 = "17";

    /** Unique id used for testing. */
    private static final String UNIQUE_ID = "12345678";

    /**
     * Test saving and editing a conference call reservation.
     */
    public void testSaveConferenceCall() {
        List<RoomReservation> reservations = createConfCallReservations();

        SavedConferenceCall result =
                this.reservationService.saveConferenceCall(reservations, null, false);
        Assert.assertTrue(result.isCompleted());
        Assert.assertEquals(reservations.size(), result.getSavedReservations().size());

        reservations = result.getSavedReservations();
        // ensure the result contains all relevant parameters
        for (final RoomReservation reservation : reservations) {
            Assert.assertNotNull(reservation.getConferenceId());
            Assert.assertNull(reservation.getParentId());
            Assert.assertNotNull(reservation.getUniqueId());
            Assert.assertEquals(0, reservation.getOccurrenceIndex());
        }

        // change the date
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(reservations.get(0).getStartDate());
        calendar.add(Calendar.DATE, 1);
        for (final RoomReservation reservation : reservations) {
            reservation.setStartDate(calendar.getTime());
            reservation.setEndDate(calendar.getTime());
        }

        result = this.reservationService.saveConferenceCall(reservations, null, false);
        Assert.assertTrue(result.isCompleted());
        Assert.assertEquals(reservations.size(), result.getSavedReservations().size());
        Assert.assertEquals(reservations.size(),
            this.reservationDataSource.getByUniqueId(UNIQUE_ID, null, null).size());

        reservations = result.getSavedReservations();

        // remove a room
        reservations.remove(0);
        result = this.reservationService.saveConferenceCall(reservations, null, false);
        Assert.assertTrue(result.isCompleted());
        Assert.assertEquals(reservations.size(), result.getSavedReservations().size());
        Assert.assertEquals(reservations.size(),
            this.reservationDataSource.getByUniqueId(UNIQUE_ID, null, null).size());
    }

    /**
     * Test saving a recurring conference call.
     */
    public void testSaveRecurringConferenceCall() {
        final List<RoomReservation> reservations = createConfCallReservations();
        final Recurrence recurrence = createRecurrence();

        final SavedConferenceCall result =
                this.reservationService.saveConferenceCall(reservations, recurrence, false);
        Assert.assertEquals(reservations.size() * (FIVE + 1), result.getSavedReservations().size());
        final List<RoomReservation> savedReservations =
                this.reservationService.getByUniqueId(UNIQUE_ID, null, null);
        Assert.assertEquals(reservations.size() * (FIVE + 1), savedReservations.size());

        // ensure the result contains all relevant parameters
        for (final RoomReservation reservation : result.getSavedReservations()) {
            Assert.assertNotNull(reservation.getConferenceId());
            Assert.assertNotNull(reservation.getParentId());
            Assert.assertNotNull(reservation.getUniqueId());
            Assert.assertTrue(reservation.getOccurrenceIndex() > 0);
        }
    }

    /**
     * Test adding recurrence to a conference call reservation.
     */
    public void testAddRecurrence() {
        List<RoomReservation> reservations = createConfCallReservations();
        SavedConferenceCall result =
                this.reservationService.saveConferenceCall(reservations, null, false);
        reservations = result.getSavedReservations();
        for (final RoomReservation reservation : reservations) {
            Assert.assertEquals(0, reservation.getOccurrenceIndex());
            Assert.assertEquals(com.archibus.app.reservation.dao.datasource.Constants.TYPE_REGULAR,
                reservation.getReservationType().toLowerCase());
            Assert.assertEquals(1, reservation.getRoomAllocations().size());
        }

        final Recurrence recurrence = createRecurrence();
        result = this.reservationService.saveConferenceCall(reservations, recurrence, false);
        Assert.assertEquals(reservations.size() * (FIVE + 1), result.getSavedReservations().size());
        for (final RoomReservation reservation : result.getSavedReservations()) {
            Assert.assertNotSame(0, reservation.getOccurrenceIndex());
            Assert.assertEquals(
                com.archibus.app.reservation.dao.datasource.Constants.TYPE_RECURRING,
                reservation.getReservationType().toLowerCase());
            Assert.assertNotNull(reservation.getParentId());
            Assert.assertNotNull(reservation.getConferenceId());
            Assert.assertEquals(1, reservation.getRoomAllocations().size());
        }
    }

    /**
     * Test removing a room from a recurring conference call.
     */
    public void testRemoveRoomFromRecurringConferenceCall() {
        List<RoomReservation> reservations = createConfCallReservations();
        final Recurrence recurrence = createRecurrence();

        final SavedConferenceCall result =
                this.reservationService.saveConferenceCall(reservations, recurrence, false);

        // now remove one of the rooms and change the time
        final RoomReservation primaryReservationToCancel =
                result.getSavedReservations().get(reservations.size() - 1);
        reservations = result.getSavedReservations().subList(0, reservations.size() - 1);
        applyChangesAndVerify(reservations, recurrence);
        // also check that the others are cancelled
        Assert.assertTrue(this.reservationDataSource
            .getByParentId(primaryReservationToCancel.getParentId(), null, null, true).isEmpty());
    }

    /**
     * Test saving a conference call on 2 single occurrences of a recurring meeting. Save first on
     * the first occurrence and then on the second occurrence.
     */
    public void testSaveSingleOccurrence() {
        createRecurrence();
        saveSingleOccurrence(this.startDate, 1);

        // now save also on the second occurrence
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        final List<RoomReservation> results = saveSingleOccurrence(calendar.getTime(), 2);
        Assert.assertNotNull(results);
    }

    /**
     * Save a conference call on a single occurrence and verify all reservations have their own
     * parent id.
     *
     * @param date the date to save on
     * @param occurrenceIndex the occurrence index for this date
     * @return the saved reservations
     */
    private List<RoomReservation> saveSingleOccurrence(final Date date, final int occurrenceIndex) {
        final List<RoomReservation> reservations = createConfCallReservations();
        final Recurrence recurrence = createRecurrence();
        for (final RoomReservation reservation : reservations) {
            reservation.setRecurrence(recurrence);
            reservation.setStartDate(TimePeriod.clearTime(date));
            reservation.setEndDate(reservation.getStartDate());
            reservation.setOriginalDate(reservation.getStartDate());
        }

        final SavedConferenceCall result =
                this.reservationService.saveConferenceCall(reservations, null, false);
        final List<RoomReservation> savedReservations = result.getSavedReservations();
        Assert.assertEquals(reservations.size(), savedReservations.size());
        for (final RoomReservation reservation : savedReservations) {
            Assert.assertEquals(reservation.getReserveId(), reservation.getParentId());
            Assert.assertEquals(occurrenceIndex, reservation.getOccurrenceIndex());
        }
        return savedReservations;
    }

    /**
     * Test saving a single occurrence twice in a row, first on the second occurrence and then on
     * the first occurrence. Verify the parent id's.
     */
    public void testSaveSingleOccurrenceBackwards() {
        createRecurrence();
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        saveSingleOccurrence(calendar.getTime(), 2);

        // now save on the first occurrence
        this.endDate = this.startDate;
        final List<RoomReservation> results = saveSingleOccurrence(this.startDate, 1);
        Assert.assertNotNull(results);
    }

    /**
     * Test adding a non-conference call reservation to a series that already has a conference call
     * reservation. This should link up the primary reservation of the conference call.
     */
    public void testMixedRecurrence() {
        createRecurrence();

        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        List<RoomReservation> confCallReservations = saveSingleOccurrence(calendar.getTime(), 2);

        final RoomReservation reservation = createExtraReservation();
        reservation.setEndDate(reservation.getStartDate());
        final Recurrence recurrence = createRecurrence();
        reservation.setRecurrence(recurrence);
        reservation.setOriginalDate(reservation.getStartDate());
        reservation.setUniqueId(UNIQUE_ID);
        this.reservationService.saveReservation(reservation);
        final RoomReservation savedReservation =
                this.reservationService.getActiveReservation(reservation.getReserveId(), null);
        Assert.assertEquals(savedReservation.getReserveId(), savedReservation.getParentId());
        Assert.assertNull(savedReservation.getConferenceId());

        confCallReservations = this.reservationService.getByUniqueId(UNIQUE_ID, null, null);

        for (final RoomReservation confCallReservation : confCallReservations) {
            if (confCallReservation.getReserveId().equals(confCallReservation.getConferenceId())) {
                Assert.assertEquals(savedReservation.getParentId(),
                    confCallReservation.getParentId());
            } else {
                // also verify the other reservations in the conf call still have their own parent
                Assert.assertEquals(confCallReservation.getReserveId(),
                    confCallReservation.getParentId());
            }
        }

    }

    /**
     * Change the time of the reservations, save the changes and verify the correct number of
     * reservations.
     *
     * @param reservations the reservations to change and save
     * @param recurrence the recurrence pattern
     */
    private void applyChangesAndVerify(final List<RoomReservation> reservations,
            final Recurrence recurrence) {
        SavedConferenceCall result;
        for (final RoomReservation reservation : reservations) {
            final Calendar calendar = Calendar.getInstance();
            calendar.setTime(reservation.getEndTime());
            calendar.add(Calendar.HOUR, 1);
            reservation.setEndTime(new Time(calendar.getTimeInMillis()));
        }
        result = this.reservationService.saveConferenceCall(reservations, recurrence, false);

        Assert.assertEquals(reservations.size() * (FIVE + 1), result.getSavedReservations().size());
        Assert.assertEquals(reservations.size() * (FIVE + 1),
            this.reservationService.getByUniqueId(UNIQUE_ID, null, null).size());
    }

    /**
     * Test adding a room to a recurring conference call.
     */
    public void testAddRoomToRecurringConferenceCall() {
        List<RoomReservation> reservations = createConfCallReservations();
        final Recurrence recurrence = createRecurrence();

        final SavedConferenceCall result =
                this.reservationService.saveConferenceCall(reservations, recurrence, false);
        Assert.assertTrue(result.isCompleted());

        // now add a room and change the time
        final RoomReservation newReservation = createExtraReservation();
        reservations = result.getSavedReservations().subList(0, reservations.size());
        reservations.get(0).copyTo(newReservation, true);
        reservations.add(newReservation);
        applyChangesAndVerify(reservations, recurrence);
    }

    /**
     * Test changing a room in a recurring conference call by a different room.
     */
    public void testChangeRoomInRecurringConferenceCall() {
        List<RoomReservation> reservations = createConfCallReservations();
        final Recurrence recurrence = createRecurrence();

        final SavedConferenceCall result =
                this.reservationService.saveConferenceCall(reservations, recurrence, false);
        Assert.assertTrue(result.isCompleted());

        // now change 1 of the rooms to a different arrangement and change the time
        reservations = result.getSavedReservations().subList(0, reservations.size());
        final RoomAllocation allocation = reservations.get(0).getRoomAllocations().get(0);
        allocation.setFlId(FL_17);
        allocation.setRmId(RM_109);
        allocation.setConfigId(CONF_A);
        allocation.setArrangeTypeId(CONFERENCE);

        applyChangesAndVerify(reservations, recurrence);
    }

    /**
     * Test finding available rooms for a conference call, including or not including rooms with
     * conflicts.
     */
    public void testFindAvailableRooms() {
        final RoomReservation blocker1 = createExtraReservation();
        final RoomReservation blocker2 = createExtraReservation();
        final List<RoomReservation> reservations = createConfCallReservations();
        final Recurrence recurrence = createRecurrence();

        blocker1.setStartDate(recurrence.getStartDate());
        blocker1.setEndDate(recurrence.getStartDate());
        this.reservationService.saveReservation(blocker1);

        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(recurrence.getStartDate());
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        blocker2.setStartDate(calendar.getTime());
        blocker2.setEndDate(blocker2.getStartDate());

        // Put the room with conflict in the conference call and retain the other one.
        final RoomAllocation allocation1 = reservations.get(0).getRoomAllocations().remove(0);
        final RoomAllocation allocation2 = blocker2.getRoomAllocations().remove(0);
        reservations.get(0).getRoomAllocations().add(allocation2);
        blocker2.getRoomAllocations().add(allocation1);

        final SavedConferenceCall result =
                this.reservationService.saveConferenceCall(reservations, recurrence, false);
        this.reservationService.saveReservation(blocker2);

        List<RoomArrangement> rooms = this.reservationService.findAvailableRoomsRecurrence(
            result.getSavedReservations().get(reservations.size()), null, false, null, false,
            recurrence, null);
        Assert.assertFalse("Already booked rooms with conflicts should appear available",
            rooms.isEmpty());

        final RoomReservation searcher = new RoomReservation(
            result.getSavedReservations().get(0).getTimePeriod(), BL_ID, FL_ID, RM_ID, null, null);
        rooms = this.reservationService.findAvailableRoomsRecurrence(searcher, null, false, null,
            false, recurrence, null);
        Assert.assertFalse("Other room with conflict should appear available for new reservation",
            rooms.isEmpty());

        searcher.setConferenceId(result.getSavedReservations().get(0).getConferenceId());
        rooms = this.reservationService.findAvailableRoomsRecurrence(searcher, null, false, null,
            false, recurrence, null);
        Assert.assertTrue("Should not find rooms with conflicts to add to a conference call",
            rooms.isEmpty());
    }

    /**
     * Create reservation objects for a conference call.
     *
     * @return conference call reservation objects
     */
    private List<RoomReservation> createConfCallReservations() {
        final DataSetList roomAllocations = this.createRoomAllocations();
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        this.createReservation(reservation, false);
        final List<RoomReservation> reservations = new ArrayList<RoomReservation>();
        for (final DataRecord allocation : roomAllocations.getRecords()) {
            final RoomReservation roomReservation =
                    this.reservationDataSource.convertRecordToObject(reservation, allocation, null);
            roomReservation.setUniqueId(UNIQUE_ID);
            reservations.add(roomReservation);
        }
        return reservations;
    }

    /**
     * Create an extra reservation object that can be added to a conference call.
     *
     * @return the extra reservation
     */
    private RoomReservation createExtraReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        this.createReservation(reservation, false);

        final DataRecord allocation = this.createRoomAllocation();
        allocation.setValue(RESERVE_RM_FL_ID, FL_17);
        allocation.setValue(RESERVE_RM_RM_ID, RM_109);
        allocation.setValue(RESERVE_RM_CONFIG_ID, CONF_A);
        allocation.setValue(RESERVE_RM_RM_ARRANGE_TYPE_ID, CONFERENCE);

        return this.reservationDataSource.convertRecordToObject(reservation, allocation, null);
    }

    /**
     * Create a recurrence pattern for conference call reservations.
     *
     * @return the recurrence pattern
     */
    private Recurrence createRecurrence() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.WEDNESDAY) {
            calendar.add(Calendar.DATE, 1);
        }
        this.startDate = calendar.getTime();
        calendar.add(Calendar.DATE, DAYS_IN_WEEK * FIVE);
        this.endDate = calendar.getTime();

        final List<DayOfTheWeek> daysOfTheWeek = Arrays.asList(DayOfTheWeek.Wednesday);
        return new WeeklyPattern(this.startDate, this.endDate, 1, daysOfTheWeek);
    }

}
