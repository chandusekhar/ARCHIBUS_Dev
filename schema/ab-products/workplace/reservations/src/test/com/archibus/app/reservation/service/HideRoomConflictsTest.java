package com.archibus.app.reservation.service;

import java.util.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.app.reservation.service.helpers.ActivityParameterHelper;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

import junit.framework.Assert;

/**
 * The Class HideRoomConflictsTest.
 */
public class HideRoomConflictsTest extends ReservationServiceTestBase {

    /** Parameter id field name. */
    private static final String PARAM_ID = "param_id";

    /** Parameter value field name. */
    private static final String PARAM_VALUE = "param_value";

    /** Activity id field name. */
    private static final String ACTIVITY_ID = "activity_id";

    /** Alternative time zone. */
    private static final String AMSTERDAM_TIMEZONE = "Europe/Amsterdam";

    /** The number 5 (for 5 attendees). */
    private static final int FIVE = 5;

    /** Activity parameters data source, used to update the HideRoomConflicts parameter. */
    private DataSource paramDs;

    /** Recurrence pattern used for testing. */
    private Recurrence recurrence;

    /** Number of occurrences in the saved reservation. */
    private int numberOfOccurrences;

    /**
     * {@inheritDoc}
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
        withoutWorkRequests();

        this.paramDs = DataSourceFactory.createDataSourceForFields("afm_activity_params",
            new String[] { ACTIVITY_ID, PARAM_ID, PARAM_VALUE });
        this.paramDs.addRestriction(Restrictions.eq(this.paramDs.getMainTableName(), ACTIVITY_ID,
            ActivityParameterHelper.RESERVATIONS_ACTIVITY));
        this.paramDs.addRestriction(
            Restrictions.eq(this.paramDs.getMainTableName(), PARAM_ID, "HideRoomConflicts"));
    }

    /**
     * Prepare for testing a specific conflict handling mode.
     *
     * @param conflictsMode the mode to test
     * @return the reservation object to use for finding available rooms
     */
    private RoomReservation prepare(final RoomConflictsMode conflictsMode) {
        // change the parameter to only show rooms with less than 50% conflicts
        final DataRecord record = this.paramDs.getRecord();
        record.setValue(this.paramDs.getMainTableName() + Constants.DOT + PARAM_VALUE,
            String.valueOf(conflictsMode.getMode()));
        this.paramDs.updateRecord(record);

        this.recurrence = createRecurrence();
        final RoomReservation roomReservation = createReservationForRecurrenceTest(
            AMSTERDAM_TIMEZONE, this.recurrence.getStartDate());
        this.reservationService.saveRecurringReservation(roomReservation, this.recurrence, null);

        final Calendar startDate = Calendar.getInstance();
        startDate.setTime(this.recurrence.getStartDate());
        startDate.add(Calendar.DATE, 1);
        if (this.recurrence instanceof WeeklyPattern) {
            final List<DayOfTheWeek> daysOfTheWeek =
                    ((WeeklyPattern) this.recurrence).getDaysOfTheWeek();
            daysOfTheWeek.remove(DayOfTheWeek.Friday);
            daysOfTheWeek.add(DayOfTheWeek.Saturday);
        }

        this.numberOfOccurrences = this.recurrence.getNumberOfOccurrences();
        this.recurrence.setStartDate(startDate.getTime());
        this.recurrence.setEndDate(null);
        return createReservationForRecurrenceTest(AMSTERDAM_TIMEZONE,
            this.recurrence.getStartDate());
    }

    /**
     * Test finding available rooms showing only filtered conflicts.
     */
    public void testShowFilteredIfOnlyConflicts() {
        // change the parameter to only show rooms with less than 50% conflicts
        final RoomReservation roomReservation2 =
                prepare(RoomConflictsMode.SHOW_FILTERED_IF_ONLY_CONFLICTS);

        // check that no rooms are returned when conflicts are > 50%
        this.recurrence.setNumberOfOccurrences(this.numberOfOccurrences - 1);
        List<RoomArrangement> rooms = this.reservationService.findAvailableRoomsRecurrence(
            roomReservation2, FIVE, false, null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertNotNull(rooms);
        Assert.assertTrue(rooms.isEmpty());

        // now increase the number of occurrences so conflicts < 50%
        this.recurrence.setNumberOfOccurrences(this.numberOfOccurrences + 2);
        // reset the reservation date, it's modified when finding rooms
        roomReservation2.setStartDate(this.recurrence.getStartDate());
        roomReservation2.setEndDate(this.recurrence.getStartDate());

        rooms = this.reservationService.findAvailableRoomsRecurrence(roomReservation2, FIVE, false,
            null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());
        // 4 conflicts should have been detected on Mondays and Wednesdays.
        for (final RoomArrangement room : rooms) {
            // CHECKSTYLE:OFF Justification: this magic number is used for testing.
            Assert.assertEquals(Integer.valueOf(4), room.getNumberOfConflicts());
            // CHECKSTYLE:ON
        }
    }

    /**
     * Test finding available rooms showing filtered conflicts and available rooms.
     */
    public void testShowFiltered() {
        // change the parameter to only show rooms with less than 50% conflicts
        final RoomReservation roomReservation2 = prepare(RoomConflictsMode.SHOW_FILTERED);
        final String roomId = roomReservation2.getRoomAllocations().get(0).getRmId();
        this.removeRoomFromFilter(roomReservation2);

        // check how many rooms are returned when conflicts are > 50%
        this.recurrence.setNumberOfOccurrences(this.numberOfOccurrences - 1);
        final List<RoomArrangement> rooms = this.reservationService.findAvailableRoomsRecurrence(
            roomReservation2, FIVE, false, null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());

        // now increase the number of occurrences so conflicts < 50%
        this.recurrence.setNumberOfOccurrences(this.numberOfOccurrences + 2);
        // reset the reservation date, it's modified when finding rooms
        roomReservation2.setStartDate(this.recurrence.getStartDate());
        roomReservation2.setEndDate(this.recurrence.getStartDate());

        final List<RoomArrangement> moreRooms =
                this.reservationService.findAvailableRoomsRecurrence(roomReservation2, FIVE, false,
                    null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertTrue(moreRooms.size() > rooms.size());
        // 4 conflicts should have been detected on Mondays and Wednesdays.
        for (final RoomArrangement room : rooms) {
            if (room.getRmId().equals(roomId)) {
                // CHECKSTYLE:OFF Justification: this magic number is used for testing.
                Assert.assertEquals(Integer.valueOf(4), room.getNumberOfConflicts());
                // CHECKSTYLE:ON
            } else {
                Assert.assertEquals(Integer.valueOf(0), room.getNumberOfConflicts());
            }
        }
    }

    /**
     * Test finding available rooms without any conflicts.
     */
    public void testShowNoConflicts() {
        // change the parameter to show no conflicts
        final RoomReservation roomReservation2 = prepare(RoomConflictsMode.SHOW_NONE);
        final List<RoomArrangement> rooms = this.reservationService.findAvailableRoomsRecurrence(
            roomReservation2, FIVE, false, null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertTrue(rooms.isEmpty());

        this.removeRoomFromFilter(roomReservation2);
        // reset the reservation date, it's modified when finding rooms
        roomReservation2.setStartDate(this.recurrence.getStartDate());
        roomReservation2.setEndDate(this.recurrence.getStartDate());

        final List<RoomArrangement> moreRooms =
                this.reservationService.findAvailableRoomsRecurrence(roomReservation2, FIVE, false,
                    null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertFalse(moreRooms.isEmpty());
    }

    /**
     * Test finding all rooms including all conflicted rooms.
     */
    public void testShowAll() {
        // change the parameter to show all conflicts
        final RoomReservation roomReservation2 = prepare(RoomConflictsMode.SHOW_ALL);

        final List<RoomArrangement> rooms = doTestManyConflicts(roomReservation2);

        this.removeRoomFromFilter(roomReservation2);
        final List<RoomArrangement> moreRooms =
                this.reservationService.findAvailableRoomsRecurrence(roomReservation2, FIVE, false,
                    null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertTrue(moreRooms.size() > rooms.size());
        Assert.assertTrue(moreRooms.contains(rooms.get(0)));
    }

    /**
     * Test finding all conflicted rooms if only conflicted rooms are available.
     */
    public void testShowAllIfOnlyConflicts() {
        // change the parameter to show all conflicts if no rooms are available
        final RoomReservation roomReservation2 =
                prepare(RoomConflictsMode.SHOW_ALL_IF_ONLY_CONFLICTS);

        final List<RoomArrangement> rooms = doTestManyConflicts(roomReservation2);

        this.removeRoomFromFilter(roomReservation2);
        final List<RoomArrangement> moreRooms =
                this.reservationService.findAvailableRoomsRecurrence(roomReservation2, FIVE, false,
                    null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertFalse(moreRooms.contains(rooms.get(0)));
    }

    /**
     * Actual test for finding the room when it has a lot of conflicts.
     *
     * @param roomReservation2 the room reservation used as filter
     * @return the list of rooms found
     */
    private List<RoomArrangement> doTestManyConflicts(final RoomReservation roomReservation2) {
        // make the number of conflicts > 50%
        this.recurrence.setNumberOfOccurrences(this.numberOfOccurrences - 1);
        final List<RoomArrangement> rooms = this.reservationService.findAvailableRoomsRecurrence(
            roomReservation2, FIVE, false, null, false, this.recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertFalse(rooms.isEmpty());

        // reset the reservation date, it's modified when finding rooms
        roomReservation2.setStartDate(this.recurrence.getStartDate());
        roomReservation2.setEndDate(this.recurrence.getStartDate());
        return rooms;
    }

    /**
     * Remove the floor and room filtering from the filter.
     *
     * @param filter the room reservation object used as filter
     */
    private void removeRoomFromFilter(final RoomReservation filter) {
        // remove the filter by room
        final RoomAllocation roomAllocation = filter.getRoomAllocations().get(0);
        roomAllocation.setRmId(null);
        roomAllocation.setConfigId(null);
        roomAllocation.setArrangeTypeId(null);
        roomAllocation.setFlId(null);
    }

}
