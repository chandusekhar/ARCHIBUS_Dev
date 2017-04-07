package com.archibus.app.reservation.service;

import java.sql.Time;
import java.text.ParseException;
import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.dao.datasource.Utils;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.app.reservation.util.ReservationUtils;

import junit.framework.Assert;

/**
 * The Class ReservationServiceTest.
 * <p>
 * Suppress warning "PMD.TooManyMethods".
 * <p>
 * Justification: the JUnit tests for this class should be kept in one test class.
 */
@SuppressWarnings("PMD.TooManyMethods")
public class ReservationServiceTest extends ReservationServiceTestBase {

    /** A later start time used for testing. */
    private static final String LATE_START_TIME = "1899-12-30 18:00:00";

    /** End time used for testing. */
    private static final String END_TIME = "1899-12-30 16:30:00";

    /** Start time used for testing. */
    private static final String START_TIME = "1899-12-30 15:00:00";

    /** Alternative time zone. */
    private static final String AMSTERDAM_TIMEZONE = "Europe/Amsterdam";

    /** The number 5 (for 5 attendees). */
    private static final int FIVE = 5;

    /**
     * Test find available rooms.
     */
    public final void testFindAvailableRooms() {
        final Date startDate = Utils.getDate(10);

        final TimePeriod timePeriod =
                new TimePeriod(startDate, startDate, this.startTime, this.endTime);

        final RoomReservation roomReservation =
                new RoomReservation(timePeriod, BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

        try {
            final List<RoomArrangement> rooms = this.reservationService
                .findAvailableRooms(roomReservation, FIVE, false, null, false, null);

            Assert.assertNotNull(rooms);

            Assert.assertFalse(rooms.isEmpty());
        } catch (final ReservationException exception) {
            Assert.fail(exception.toString());
        }
    }

    /**
     *
     * Test Find available Rooms No Results.
     *
     * @throws ParseException when parsing time strings failed
     */
    public final void testFindAvalaibleRoomsNoResults() throws ParseException {
        final Date startDate = Utils.getDate(10);

        final Time startTime2 = createTime("1899-12-30 07:00:00");
        final Time endTime2 = createTime("1899-12-30 11:10:00");
        final TimePeriod timePeriod = new TimePeriod(startDate, startDate, startTime2, endTime2);

        final RoomReservation roomReservation =
                new RoomReservation(timePeriod, BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

        final List<RoomArrangement> rooms = this.reservationService
            .findAvailableRooms(roomReservation, FIVE, false, null, false, null);

        Assert.assertNotNull(rooms);
        Assert.assertTrue(rooms.isEmpty());
    }

    /**
     * Test finding available rooms with recurrence.
     */
    public void testFindAvailableRoomsRecurrence() {
        final Recurrence recurrence = createRecurrence();
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(AMSTERDAM_TIMEZONE, recurrence.getStartDate());
        List<RoomArrangement> rooms = this.reservationService.findAvailableRoomsRecurrence(
            roomReservation, FIVE, false, null, false, recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());

        // reset the reservation date, it's modified when finding rooms
        roomReservation.setStartDate(recurrence.getStartDate());
        roomReservation.setEndDate(recurrence.getStartDate());

        // Now book the room.
        final List<RoomReservation> reservations =
                this.reservationService.saveRecurringReservation(roomReservation, recurrence, null);

        // The room should still appear available after booking.
        rooms = this.reservationService.findAvailableRoomsRecurrence(reservations.get(0), FIVE,
            false, null, false, recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());

        // no conflicts should have been detected
        for (final RoomArrangement room : rooms) {
            Assert.assertEquals(Integer.valueOf(0), room.getNumberOfConflicts());
        }

        // move the first occurrence to the date of the second occurrence
        reservations.get(0).setStartDate(reservations.get(1).getStartDate());
        reservations.get(0).setEndDate(reservations.get(1).getEndDate());
        rooms = this.reservationService.findAvailableRoomsRecurrence(reservations.get(0), FIVE,
            false, null, false, recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());

        // no conflicts should have been detected
        for (final RoomArrangement room : rooms) {
            Assert.assertEquals(Integer.valueOf(0), room.getNumberOfConflicts());
        }

        final Calendar startDate = Calendar.getInstance();
        startDate.setTime(recurrence.getStartDate());
        startDate.add(Calendar.DATE, 1);
        if (recurrence instanceof WeeklyPattern) {
            final List<DayOfTheWeek> daysOfTheWeek =
                    ((WeeklyPattern) recurrence).getDaysOfTheWeek();
            daysOfTheWeek.remove(DayOfTheWeek.Friday);
            daysOfTheWeek.add(DayOfTheWeek.Saturday);
        }

        final int numberOfOccurrences = recurrence.getNumberOfOccurrences();
        recurrence.setStartDate(startDate.getTime());
        recurrence.setEndDate(null);
        final RoomReservation roomReservation2 =
                createReservationForRecurrenceTest(AMSTERDAM_TIMEZONE, recurrence.getStartDate());

        // check that no rooms are returned when conflicts are > 50%
        recurrence.setNumberOfOccurrences(numberOfOccurrences - 1);
        rooms = this.reservationService.findAvailableRoomsRecurrence(roomReservation2, FIVE, false,
            null, false, recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertNotNull(rooms);
        Assert.assertTrue(rooms.isEmpty());

        // now increase the number of occurrences so conflicts < 50%
        recurrence.setNumberOfOccurrences(numberOfOccurrences + 2);
        // reset the reservation date, it's modified when finding rooms
        roomReservation2.setStartDate(recurrence.getStartDate());
        roomReservation2.setEndDate(recurrence.getStartDate());

        rooms = this.reservationService.findAvailableRoomsRecurrence(roomReservation2, FIVE, false,
            null, false, recurrence, AMSTERDAM_TIMEZONE);
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
     * Test finding available rooms with recurrence in a custom time zone.
     *
     * @throws ParseException when the times are invalid
     */
    public void testFindAvailableRoomsRecurrenceWithTimeZone() throws ParseException {
        this.startTime = createTime(START_TIME);
        this.endTime = createTime(END_TIME);
        this.timePeriod =
                new TimePeriod(this.startDate, this.endDate, this.startTime, this.endTime);
        final Recurrence recurrence = createRecurrence();
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(AMSTERDAM_TIMEZONE, recurrence.getStartDate());
        final RoomAllocation roomAllocation = roomReservation.getRoomAllocations().get(0);
        roomAllocation.setFlId(null);
        roomAllocation.setRmId(null);
        roomAllocation.setConfigId(null);
        roomAllocation.setArrangeTypeId(null);
        final List<RoomArrangement> rooms = this.reservationService.findAvailableRoomsRecurrence(
            roomReservation, FIVE, false, null, false, recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());
    }

    /**
     * Test finding available rooms with a custom time period defined for some occurrences.
     *
     * @throws ParseException when the times are invalid
     */
    public void testFindAvailableRoomsRecurrenceWithCustomTimePeriod() throws ParseException {
        this.startTime = createTime(START_TIME);
        this.endTime = createTime(END_TIME);
        this.timePeriod =
                new TimePeriod(this.startDate, this.endDate, this.startTime, this.endTime);
        final Recurrence recurrence = createRecurrence();
        final List<OccurrenceInfo> occurrenceInfos = new ArrayList<OccurrenceInfo>();

        // mark the last occurrence cancelled
        final OccurrenceInfo cancelledInfo = new OccurrenceInfo();
        cancelledInfo.setOriginalDate(recurrence.getEndDate());
        cancelledInfo.setCancelled(true);
        occurrenceInfos.add(cancelledInfo);

        RoomReservation roomReservation =
                createReservationForRecurrenceTest(AMSTERDAM_TIMEZONE, recurrence.getStartDate());
        RoomAllocation roomAllocation = roomReservation.getRoomAllocations().get(0);
        // find available rooms on any floor
        roomAllocation.setRmId(null);
        roomAllocation.setConfigId(null);
        roomAllocation.setFlId(null);

        // first find available rooms for the original time period, without conflicts
        List<RoomArrangement> rooms = this.reservationService.findAvailableRoomsRecurrence(
            roomReservation, FIVE, false, null, false, recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertFalse(rooms.isEmpty());

        // take the first available room
        roomReservation =
                createReservationForRecurrenceTest(AMSTERDAM_TIMEZONE, recurrence.getStartDate());
        roomAllocation = roomReservation.getRoomAllocations().get(0);
        roomAllocation.setRmId(rooms.get(0).getRmId());
        roomAllocation.setConfigId(rooms.get(0).getConfigId());
        roomAllocation.setFlId(rooms.get(0).getFlId());

        final Date thirdDate = RecurrenceService
            .getDateList(recurrence.getStartDate(), recurrence.getEndDate(), recurrence.toString())
            .get(2);

        // create a room reservation on the third date to generate a conflict
        this.timePeriod.setStartDate(thirdDate);
        this.timePeriod.setEndDate(thirdDate);
        final RoomReservation conflict = this.createRoomReservation();
        final RoomAllocation conflictAllocation = conflict.getRoomAllocations().get(0);
        conflictAllocation.setRmId(roomAllocation.getRmId());
        conflictAllocation.setConfigId(roomAllocation.getConfigId());
        conflictAllocation.setFlId(roomAllocation.getFlId());
        conflictAllocation.setArrangeTypeId(roomAllocation.getArrangeTypeId());
        this.reservationService.saveReservation(conflict);

        // find available rooms for the original time period, with one conflict
        roomReservation =
                createReservationForRecurrenceTest(AMSTERDAM_TIMEZONE, recurrence.getStartDate());
        roomAllocation = roomReservation.getRoomAllocations().get(0);
        roomAllocation.setRmId(rooms.get(0).getRmId());
        roomAllocation.setConfigId(rooms.get(0).getConfigId());
        roomAllocation.setFlId(rooms.get(0).getFlId());
        rooms = this.reservationService.findAvailableRoomsRecurrence(roomReservation, FIVE, false,
            null, false, recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertEquals(1, rooms.size());
        Assert.assertEquals(Integer.valueOf(1), rooms.get(0).getNumberOfConflicts());

        // move the conflicting occurrence to an earlier time so no more conflicts occur
        final OccurrenceInfo modifiedInfo = new OccurrenceInfo();
        modifiedInfo.setOriginalDate(thirdDate);
        modifiedInfo
            .setModifiedTimePeriod(new TimePeriod(thirdDate, thirdDate, createTime(LATE_START_TIME),
                createTime("1899-12-30 18:30:00"), Constants.TIMEZONE_UTC));
        occurrenceInfos.add(modifiedInfo);
        recurrence.setExceptions(occurrenceInfos);

        // find available rooms again, including the modified occurrence
        rooms = this.reservationService.findAvailableRoomsRecurrence(roomReservation, FIVE, false,
            null, false, recurrence, AMSTERDAM_TIMEZONE);
        Assert.assertEquals(1, rooms.size());
        Assert.assertEquals(Integer.valueOf(0), rooms.get(0).getNumberOfConflicts());
    }

    /**
     * Test save room reservation.
     */
    public final void testSaveRoomReservation() {

        final RoomReservation roomReservation = createRoomReservation();

        try {
            this.reservationService.saveReservation(roomReservation);
        } catch (final ReservationException exception) {
            Assert.fail(exception.toString());
        }
        Assert.assertNotNull(roomReservation.getReserveId());
    }

    /**
     * Test saving two reservations with the same unique id, to form a recurring series.
     */
    public void testSaveAndMakeRecurring() {
        RoomReservation firstReservation = createRoomReservation();
        RoomReservation secondReservation = createRoomReservation();
        firstReservation.setUniqueId(UNIQUE_ID);
        secondReservation.setUniqueId(UNIQUE_ID);
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(secondReservation.getStartDate());
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.WEDNESDAY);
        firstReservation.setStartDate(calendar.getTime());
        firstReservation.setEndDate(firstReservation.getStartDate());
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        secondReservation.setStartDate(calendar.getTime());
        secondReservation.setEndDate(secondReservation.getStartDate());

        final Recurrence recurrence =
                new WeeklyPattern(firstReservation.getStartDate(), 1, DayOfTheWeek.Wednesday);
        firstReservation.setRecurrence(recurrence);
        firstReservation.setOriginalDate(firstReservation.getStartDateTime());
        secondReservation.setRecurrence(recurrence);
        secondReservation.setOriginalDate(secondReservation.getStartDateTime());

        this.reservationService.saveReservation(firstReservation);
        firstReservation =
                this.reservationService.getActiveReservation(firstReservation.getReserveId(), null);
        this.reservationService.saveReservation(secondReservation);
        secondReservation = this.reservationService
            .getActiveReservation(secondReservation.getReserveId(), null);

        Assert.assertEquals(firstReservation.getReserveId(), firstReservation.getParentId());
        Assert.assertEquals(firstReservation.getParentId(), secondReservation.getParentId());
        Assert.assertEquals(com.archibus.app.reservation.dao.datasource.Constants.TYPE_RECURRING,
            firstReservation.getReservationType());
        Assert.assertEquals(com.archibus.app.reservation.dao.datasource.Constants.TYPE_RECURRING,
            secondReservation.getReservationType());
        Assert.assertEquals(recurrence.toString(), firstReservation.getRecurringRule());
        Assert.assertEquals(firstReservation.getRecurringRule(),
            secondReservation.getRecurringRule());
        Assert.assertEquals(1, firstReservation.getOccurrenceIndex());
        Assert.assertEquals(2, secondReservation.getOccurrenceIndex());
    }

    /**
     * Test adding recurrence to a reservation.
     */
    public void testAddRecurrence() {
        final RoomReservation roomReservation = createRoomReservation();
        this.reservationService.saveReservation(roomReservation);
        Assert.assertEquals(0, roomReservation.getOccurrenceIndex());

        final Recurrence recurrence = this.createRecurrence();
        final List<RoomReservation> reservations =
                this.reservationService.saveFullRecurringReservation(roomReservation, recurrence);
        Assert.assertEquals(roomReservation.getReserveId(), reservations.get(0).getReserveId());
        for (final RoomReservation reservation : reservations) {
            Assert.assertNotNull(reservation.getParentId());
            Assert.assertNotSame(0, reservation.getOccurrenceIndex());
            Assert.assertEquals(Constants.TYPE_RECURRING,
                reservation.getReservationType().toLowerCase());
        }
    }

    /**
     * Test save room reservation.
     */
    public final void testSaveRoomReservationWithResources() {

        final RoomReservation roomReservation = createRoomReservation();

        addResource(roomReservation);

        try {
            this.reservationService.saveReservation(roomReservation);
        } catch (final ReservationException exception) {
            Assert.fail(exception.toString());
        }
        Assert.assertNotNull(roomReservation.getReserveId());
        Assert.assertEquals(BL_ID, roomReservation.getResourceAllocations().get(0).getBlId());
        Assert.assertEquals(FL_ID, roomReservation.getResourceAllocations().get(0).getFlId());
        Assert.assertEquals(RM_ID, roomReservation.getResourceAllocations().get(0).getRmId());
        Assert.assertEquals(roomReservation.getStartDateTime(),
            roomReservation.getResourceAllocations().get(0).getStartDateTime());
        Assert.assertEquals(roomReservation.getEndDateTime(),
            roomReservation.getResourceAllocations().get(0).getEndDateTime());
    }

    /**
     * Test save room reservation failed.
     *
     * @throws ParseException ParseException
     */
    public final void testSaveRoomReservationFailed() throws ParseException {

        try {
            final Date startDate = Utils.getDate(10);

            // try to reserve before starting hour
            final Time startTime2 = createTime("1899-12-30 07:30:00");
            final Time endTime2 = createTime("1899-12-30 11:20:00");

            final TimePeriod timePeriod =
                    new TimePeriod(startDate, startDate, startTime2, endTime2);

            final RoomReservation roomReservation = new RoomReservation(timePeriod, BL_ID, FL_ID,
                RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

            final Employee creator = this.employeeService.findEmployee(AFM_EMAIL);
            ReservationUtils.setCreator(roomReservation, creator, creator.getId());

            roomReservation.setReservationName(TEST);
            roomReservation.setReservationType(TYPE_REGULAR);
            roomReservation.setStatus(CONFIRMED);

            // reservationService.saveReservation(roomReservation);
            // fail();

            roomReservation.setStartTime(createTime(START_TIME));
            roomReservation.setEndTime(createTime("1899-12-30 20:30:00"));

            // reservationService.saveReservation(roomReservation);
            // fail();

            roomReservation.setStartTime(createTime("1899-12-30 09:30:00"));
            roomReservation.setEndTime(createTime("1899-12-30 11:30:00"));

            this.reservationService.saveReservation(roomReservation);
            // ok

            final RoomReservation overlappingReservation = new RoomReservation(timePeriod, BL_ID,
                FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

            overlappingReservation.setStartTime(createTime("1899-12-30 10:00:00"));
            overlappingReservation.setEndTime(createTime("1899-12-30 12:30:00"));

            ReservationUtils.setCreator(roomReservation, creator, creator.getId());

            roomReservation.setReservationName(TEST);
            roomReservation.setReservationType(TYPE_REGULAR);
            roomReservation.setStatus(CONFIRMED);

            this.reservationService.saveReservation(overlappingReservation);
            // should fail
            fail();

        } catch (final ReservationException e) {
            Assert.assertEquals("The room HQ-19-110 is not available.", e.getPattern());
        }
    }

    /**
     * Test saving a recurring reservation.
     */
    public void testSaveRecurringRoomReservation() {
        final Recurrence recurrence = createRecurrence();
        Assert.assertNotNull(recurrence);
        doSaveRecurringRoomReservationTest(recurrence);
    }

    /**
     * Test saving a recurring reservation with the maximum number of occurrences.
     */
    public void testSaveMaxRecurringRoomReservation() {
        withoutWorkRequests();
        final Recurrence recurrence = createRecurrence();
        Assert.assertNotNull(recurrence);
        // set the maximum number of occurrences and correct the end date
        recurrence.setEndDate(null);
        recurrence.setNumberOfOccurrences(RecurrenceService.getMaxOccurrences());
        this.fixEndDate(recurrence);

        doSaveRecurringRoomReservationTest(recurrence);
    }

    /**
     * Actual test code to save a recurring room reservation.
     *
     * @param recurrence the recurrence pattern to use
     */
    private void doSaveRecurringRoomReservationTest(final Recurrence recurrence) {
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());
        final Time startTime = roomReservation.getStartTime();
        final Time endTime = roomReservation.getEndTime();
        addResource(roomReservation);

        try {
            final List<RoomReservation> reservations = this.reservationService
                .saveRecurringReservation(roomReservation, recurrence, null);
            Assert.assertNotNull(roomReservation.getReserveId());
            Assert.assertEquals(roomReservation.getReserveId(), reservations.get(0).getReserveId());
            verifySaveRecurringRoomReservation(reservations, recurrence, startTime, endTime);
        } catch (final ReservationException exception) {
            Assert.fail(exception.toString());
        }
    }

    /**
     * Test editing a recurring reservation without exceptions.
     *
     * @throws ParseException when a time string is invalid
     */
    public void testEditRecurringRoomReservation() throws ParseException {
        final Recurrence recurrence = createRecurrence();
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());
        addResource(roomReservation);

        List<RoomReservation> reservations =
                this.reservationService.saveRecurringReservation(roomReservation, recurrence, null);
        Assert.assertNotNull(roomReservation.getReserveId());

        final RoomReservation reservationForEdit = reservations.get(0);
        reservationForEdit.setStartTime(createTime("1899-12-30 09:00:00"));
        reservationForEdit.setEndTime(createTime("1899-12-30 11:40:00"));
        final Time startTime = reservationForEdit.getStartTime();
        final Time endTime = reservationForEdit.getEndTime();

        reservations = this.reservationService.saveRecurringReservation(reservationForEdit,
            recurrence, null);

        verifySaveRecurringRoomReservation(reservations, recurrence, startTime, endTime);
    }

    /**
     * Test editing a recurring reservation with 2 conflicts, solving one of them. Then move back to
     * the previous time which would cause a new conflict but that is not allowed.
     *
     * @throws ParseException when a time string is invalid
     */
    public void testEditRecurringRoomReservationWithConflicts() throws ParseException {
        final Recurrence recurrence = createRecurrence();
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());

        final List<Date> dateList = RecurrenceService.getDateList(recurrence.getStartDate(),
            recurrence.getEndDate(), recurrence.toString());

        // Create a conflict on the 3rd occurrence
        final RoomReservation conflict =
                createReservationForRecurrenceTest(HQ_TIMEZONE, dateList.get(2));
        conflict.setUniqueId("AFHDUEH");
        this.reservationService.saveReservation(conflict);

        // Create a conflict for the 2nd occurrence
        final RoomReservation conflict2 =
                createReservationForRecurrenceTest(HQ_TIMEZONE, dateList.get(1));
        conflict2.setUniqueId("HE45968E7");
        this.reservationService.saveReservation(conflict2);

        List<RoomReservation> reservations =
                this.reservationService.saveRecurringReservation(roomReservation, recurrence, null);
        Assert.assertNotNull(roomReservation.getReserveId());
        Assert.assertEquals(Constants.STATUS_ROOM_CONFLICT, reservations.get(2).getStatus());
        Assert.assertEquals(Constants.STATUS_ROOM_CONFLICT, reservations.get(1).getStatus());

        RoomReservation reservationForEdit = reservations.get(0);
        reservationForEdit.setStartTime(createTime("1899-12-30 13:00:00"));
        reservationForEdit.setEndTime(createTime("1899-12-30 14:20:00"));
        final Time startTime = reservationForEdit.getStartTime();
        final Time endTime = reservationForEdit.getEndTime();

        // Create a conflict for the 2nd occurrence in the new time frame
        final RoomReservation conflict2b =
                createReservationForRecurrenceTest(HQ_TIMEZONE, dateList.get(1));
        conflict2b.setUniqueId("HE45968A7");
        conflict2b.setStartTime(startTime);
        conflict2b.setEndTime(endTime);
        this.reservationService.saveReservation(conflict2b);

        reservations = this.reservationService.saveRecurringReservation(reservationForEdit,
            recurrence, null);
        Assert.assertEquals(Constants.STATUS_ROOM_CONFLICT, reservations.get(1).getStatus());
        Assert.assertTrue(reservations.get(1).getRoomAllocations().isEmpty());
        Assert.assertNotSame(Constants.STATUS_ROOM_CONFLICT, reservations.get(2).getStatus());

        Assert.assertEquals(recurrence.getNumberOfOccurrences().intValue(), reservations.size());
        assertTrue("Even conflicted reservations adhere to the recurrence pattern.",
            this.reservationService.verifyRecurrencePattern(UNIQUE_ID, recurrence, startTime,
                endTime, HQ_TIMEZONE));

        // try to move back to the original time, causing a new conflict on the 3rd occurrence
        reservationForEdit = reservations.get(0);
        reservationForEdit.setStartTime(conflict.getStartTime());
        reservationForEdit.setEndTime(conflict.getStartTime());
        try {
            reservations = this.reservationService.saveRecurringReservation(reservationForEdit,
                recurrence, null);
            Assert.fail("Should not be able to generate new conflicts when editing");
        } catch (final ReservableNotAvailableException exception) {
            Assert.assertEquals("The problem occurred in the 3rd occurrence",
                reservations.get(2).getReserveId(), exception.getReservationId());
        }
    }

    /**
     * Test completing a recurring room reservation where a room was already booked for some
     * occurrences.
     *
     * @throws ParseException when a time string is invalid
     */
    public void testCompleteRecurringRoomReservation() throws ParseException {
        final Recurrence recurrence = createRecurrence();
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());

        final List<Date> dateList = RecurrenceService.getDateList(recurrence.getStartDate(),
            recurrence.getEndDate(), recurrence.toString());

        // save the 2nd occurrence
        final RoomReservation secondRes =
                createReservationForRecurrenceTest(HQ_TIMEZONE, dateList.get(1));
        secondRes.setRecurrence(recurrence);
        secondRes.setOriginalDate(secondRes.getStartDate());
        this.reservationService.saveReservation(secondRes);

        // save the last occurrence
        final RoomReservation lastReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, dateList.get(dateList.size() - 1));
        lastReservation.setRecurrence(recurrence);
        lastReservation.setOriginalDate(lastReservation.getStartDate());
        this.reservationService.saveReservation(lastReservation);

        // verify that both occurrences have their parent id and occurrence index set
        RoomReservation storedSecondRes =
                this.reservationService.getActiveReservation(secondRes.getReserveId(), null);
        Assert.assertEquals(secondRes.getReserveId(), storedSecondRes.getParentId());
        Assert.assertEquals(2, storedSecondRes.getOccurrenceIndex());

        RoomReservation storedLastRes =
                this.reservationService.getActiveReservation(lastReservation.getReserveId(), null);
        Assert.assertEquals(secondRes.getReserveId(), storedLastRes.getParentId());
        Assert.assertEquals(recurrence.getNumberOfOccurrences().intValue(),
            storedLastRes.getOccurrenceIndex());

        // Use the second reservation as the basis to save the full series, updating the 2 existing
        // occurrences. The Outlook Plugin also uses that one's id's.
        roomReservation.setReserveId(secondRes.getReserveId());
        roomReservation.setParentId(secondRes.getParentId());
        roomReservation.setOccurrenceIndex(secondRes.getOccurrenceIndex());
        final List<RoomReservation> reservations =
                this.reservationService.saveRecurringReservation(roomReservation, recurrence, null);
        Assert.assertNotNull(roomReservation.getReserveId());

        // check that the 2 occurrences still have their original reservation id
        storedSecondRes = reservations.get(1);
        Assert.assertEquals(secondRes.getReserveId(), storedSecondRes.getReserveId());
        Assert.assertEquals(reservations.get(0).getReserveId(), storedSecondRes.getParentId());
        storedLastRes = reservations.get(reservations.size() - 1);
        Assert.assertEquals(lastReservation.getReserveId(), storedLastRes.getReserveId());
        Assert.assertEquals(reservations.get(0).getReserveId(), storedLastRes.getParentId());

        final Time startTime = roomReservation.getStartTime();
        final Time endTime = roomReservation.getEndTime();

        Assert.assertEquals(recurrence.getNumberOfOccurrences().intValue(), reservations.size());
        assertTrue("All reservations match to the recurrence pattern.", this.reservationService
            .verifyRecurrencePattern(UNIQUE_ID, recurrence, startTime, endTime, HQ_TIMEZONE));
    }

    /**
     * Test editing a recurring reservation with exceptions.
     *
     * @throws ParseException when a time string is invalid
     */
    public void testEditRecurringRoomReservationWithExceptions() throws ParseException {
        final Recurrence recurrence = createRecurrence();
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());
        addResource(roomReservation);

        List<RoomReservation> reservations =
                this.reservationService.saveRecurringReservation(roomReservation, recurrence, null);
        Assert.assertNotNull(roomReservation.getReserveId());

        // cancel the 2nd occurrence
        int modIndex = 1;
        this.cancelReservationService.cancelReservation(reservations.get(modIndex));
        final OccurrenceInfo cancelledInfo = new OccurrenceInfo();
        cancelledInfo.setOriginalDate(reservations.get(1).getStartDate());
        cancelledInfo.setCancelled(true);

        // edit the 3rd occurrence
        final RoomReservation occurrence = reservations.get(++modIndex);
        final OccurrenceInfo movedInfo = new OccurrenceInfo();
        movedInfo.setOriginalDate(occurrence.getStartDate());
        occurrence.setStartTime(createTime("1899-12-30 10:30:00"));
        occurrence.setEndTime(createTime("1899-12-30 14:00:00"));
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(occurrence.getStartDate());
        calendar.add(Calendar.DATE, 1);
        occurrence.setStartDate(calendar.getTime());
        occurrence.setEndDate(occurrence.getStartDate());

        // actually saving here is (should be) optional
        this.reservationService.saveReservation(occurrence);

        movedInfo.setModifiedStartDateTime(occurrence.getStartDateTime());
        movedInfo.setModifiedEndDateTime(occurrence.getEndDateTime());
        recurrence.setExceptions(Arrays.asList(new OccurrenceInfo[] { cancelledInfo, movedInfo }));

        // change the room for all occurrences
        final RoomReservation reservationForEdit = reservations.get(0);
        final RoomAllocation roomAllocation = reservationForEdit.getRoomAllocations().get(0);
        roomAllocation.setFlId("18");
        roomAllocation.setRmId("111");
        roomAllocation.setConfigId("CONF-SMALL");

        reservations = this.reservationService.saveRecurringReservation(reservationForEdit,
            recurrence, null);

        Assert.assertEquals(recurrence.getNumberOfOccurrences() - 1, reservations.size());

        // Check that each reservation is stored in the database with the resource allocation.
        final List<RoomReservation> savedReservations =
                this.reservationService.getByUniqueId(UNIQUE_ID, null, HQ_TIMEZONE);
        int occurrenceIndex = 1;
        for (final RoomReservation reservation : savedReservations) {
            final List<ResourceAllocation> resourceAllocations =
                    reservation.getResourceAllocations();
            Assert.assertEquals(1, resourceAllocations.size());
            Assert.assertEquals(reservation.getStartDateTime(),
                resourceAllocations.get(0).getStartDateTime());
            // resource time is not modified if it's still within the reservation time
            Assert.assertFalse(
                reservation.getEndDateTime().before(resourceAllocations.get(0).getEndDateTime()));

            if (occurrenceIndex == modIndex + 1) {
                Assert.assertEquals(movedInfo.getModifiedStartDateTime(),
                    reservation.getStartDateTime());
                Assert.assertEquals(movedInfo.getModifiedEndDateTime(),
                    reservation.getEndDateTime());
            }

            Assert.assertEquals(occurrenceIndex, reservation.getOccurrenceIndex());
            if (occurrenceIndex == 1) {
                // skip the second occurrence which was cancelled
                occurrenceIndex += 2;
            } else {
                occurrenceIndex++;
            }
        }
    }

    /**
     * Verify the recurring reservation after saving.
     *
     * @param reservations the saved reservation
     * @param recurrence the recurrence
     * @param startTime the start time of each occurrence
     * @param endTime the end time of each occurrence
     */
    private void verifySaveRecurringRoomReservation(final List<RoomReservation> reservations,
            final Recurrence recurrence, final Time startTime, final Time endTime) {
        Assert.assertEquals(recurrence.getNumberOfOccurrences().intValue(), reservations.size());
        assertTrue("All reservations adhere to the recurrence pattern.", this.reservationService
            .verifyRecurrencePattern(UNIQUE_ID, recurrence, startTime, endTime, HQ_TIMEZONE));

        // Check that each reservation is stored in the database with the added resource
        // allocation.
        final List<RoomReservation> savedReservations =
                this.reservationService.getByUniqueId(UNIQUE_ID, null, HQ_TIMEZONE);
        int counter = 0;
        for (final RoomReservation reservation : savedReservations) {
            final List<ResourceAllocation> resourceAllocations =
                    reservation.getResourceAllocations();
            Assert.assertEquals(1, resourceAllocations.size());
            Assert.assertEquals(reservation.getStartDateTime(),
                resourceAllocations.get(0).getStartDateTime());
            // resource time is not modified if it's still within the reservation time
            Assert.assertFalse(
                reservation.getEndDateTime().before(resourceAllocations.get(0).getEndDateTime()));
            Assert.assertEquals(RESOURCE_ID, resourceAllocations.get(0).getResourceId());
            Assert.assertEquals(++counter, reservation.getOccurrenceIndex());
        }
    }

    /**
     * Test saving a recurring room reservation with some custom time periods / cancelled
     * occurrences.
     *
     * @throws ParseException when the times are invalid
     */
    public void testSaveRecurringRoomReservationWithCustomTimePeriod() throws ParseException {
        final Recurrence recurrence = createRecurrence();
        final List<Date> dateList = RecurrenceService.getDateList(recurrence.getStartDate(),
            recurrence.getEndDate(), recurrence.toString());
        final List<OccurrenceInfo> occurrenceInfos = new ArrayList<OccurrenceInfo>();

        // mark the next-to-last occurrence cancelled
        final OccurrenceInfo cancelledInfo = new OccurrenceInfo();
        cancelledInfo.setOriginalDate(dateList.get(dateList.size() - 2));
        cancelledInfo.setCancelled(true);
        occurrenceInfos.add(cancelledInfo);

        // move the 3rd occurrence to a later time
        final Date thirdDate = dateList.get(2);
        final OccurrenceInfo modifiedInfo = new OccurrenceInfo();
        modifiedInfo.setOriginalDate(thirdDate);
        modifiedInfo.setModifiedTimePeriod(new TimePeriod(thirdDate, thirdDate,
            createTime("1899-12-30 14:30:00"), createTime("1899-12-30 15:30:00"), HQ_TIMEZONE));
        occurrenceInfos.add(modifiedInfo);

        // move the last occurrence to an earlier date
        final OccurrenceInfo movedInfo = new OccurrenceInfo();
        movedInfo.setOriginalDate(recurrence.getEndDate());
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(movedInfo.getOriginalDate());
        calendar.add(Calendar.DATE, -1);
        final Date movedDate = calendar.getTime();
        movedInfo.setModifiedTimePeriod(new TimePeriod(movedDate, movedDate, createTime(END_TIME),
            createTime(LATE_START_TIME), HQ_TIMEZONE));
        occurrenceInfos.add(movedInfo);

        // set the exceptions in the pattern
        recurrence.setExceptions(occurrenceInfos);

        // create a recurring reservation with the exceptions
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());
        final Time startTime = roomReservation.getStartTime();
        final Time endTime = roomReservation.getEndTime();
        this.reservationService.saveRecurringReservation(roomReservation, recurrence, null);

        final List<RoomReservation> savedReservations =
                this.reservationService.getByUniqueId(UNIQUE_ID, null, HQ_TIMEZONE);
        for (final RoomReservation reservation : savedReservations) {
            if (movedInfo.getOriginalDate()
                .equals(dateList.get(reservation.getOccurrenceIndex() - 1))) {
                Assert.assertEquals(movedInfo.getModifiedStartDateTime(),
                    reservation.getStartDateTime());
                Assert.assertEquals(movedInfo.getModifiedEndDateTime(),
                    reservation.getEndDateTime());
            } else if (cancelledInfo.getOriginalDate().equals(reservation.getStartDate())) {
                Assert.fail("No reservation should have been created on the cancelled date "
                        + cancelledInfo.getOriginalDate());
            } else if (modifiedInfo.getOriginalDate()
                .equals(dateList.get(reservation.getOccurrenceIndex() - 1))) {
                Assert.assertEquals(modifiedInfo.getModifiedStartDateTime(),
                    reservation.getStartDateTime());
                Assert.assertEquals(modifiedInfo.getModifiedEndDateTime(),
                    reservation.getEndDateTime());
            } else {
                Assert.assertEquals(dateList.indexOf(reservation.getStartDate()) + 1,
                    reservation.getOccurrenceIndex());
                Assert.assertEquals(startTime, reservation.getStartTime());
                Assert.assertEquals(endTime, reservation.getEndTime());
            }
        }
    }

    /**
     * Test saving a recurring reservation having some occurrences in the past.
     */
    public void testSaveRecurringRoomReservationStartingInThePast() {
        final Recurrence recurrence = createRecurrenceStartingInThePast();
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());
        final Time startTime = roomReservation.getStartTime();
        final Time endTime = roomReservation.getEndTime();

        try {
            final Date originalStartDate = recurrence.getStartDate();
            final List<RoomReservation> reservations = this.reservationService
                .saveRecurringReservation(roomReservation, recurrence, null);
            recurrence.setStartDate(originalStartDate);
            Assert.assertNotNull(roomReservation.getReserveId());
            Assert.assertEquals(roomReservation.getReserveId(), reservations.get(0).getReserveId());
            Assert.assertTrue(recurrence.getNumberOfOccurrences() > reservations.size());
            Assert.assertEquals(recurrence.getNumberOfOccurrences(),
                Integer.valueOf(reservations.size() + recurrence.getNumberOfSkippedOccurrences()));
            assertTrue("All reservations match the recurrence pattern.", this.reservationService
                .verifyRecurrencePattern(UNIQUE_ID, recurrence, startTime, endTime, HQ_TIMEZONE));

            // Check that each reservation is stored in the database with the added resource
            // allocation.
            final List<RoomReservation> savedReservations =
                    this.reservationService.getByUniqueId(UNIQUE_ID, null, HQ_TIMEZONE);
            int counter = savedReservations.get(0).getOccurrenceIndex();
            Assert.assertTrue(counter > 1);
            for (final RoomReservation reservation : savedReservations) {
                Assert.assertEquals(counter++, reservation.getOccurrenceIndex());
            }
        } catch (final ReservationException exception) {
            Assert.fail(exception.toString());
        }
    }

    /**
     * Test saving a recurring reservation in different time zones.
     */
    public void testSaveRecurringRoomReservationWithTimeZones() {
        withoutWorkRequests();
        final Recurrence recurrence = createRecurrence();
        final List<String> timeZones = new ArrayList<String>();
        timeZones.add("Europe/Brussels");
        timeZones.add("Europe/Moscow");
        timeZones.add("Asia/Bangkok");
        timeZones.add("Australia/Brisbane");
        timeZones.add("Pacific/Auckland");
        timeZones.add("America/Los_Angeles");

        for (final String timeZone : timeZones) {
            final RoomReservation roomReservation =
                    createReservationForRecurrenceTest(timeZone, recurrence.getStartDate());
            final Time startTime = roomReservation.getStartTime();
            final Time endTime = roomReservation.getEndTime();
            try {
                final List<RoomReservation> reservations = this.reservationService
                    .saveRecurringReservation(roomReservation, recurrence, null);
                Assert.assertNotNull(roomReservation.getReserveId());
                Assert.assertEquals(roomReservation.getReserveId(),
                    reservations.get(0).getReserveId());
                Assert.assertEquals(recurrence.getNumberOfOccurrences().intValue(),
                    reservations.size());

                assertTrue(timeZone + ": All reservations are according to the recurrence pattern.",
                    this.reservationService.verifyRecurrencePattern(UNIQUE_ID, recurrence,
                        startTime, endTime, timeZone));

                // cancel the reservations again
                this.cancelReservationService.cancelRoomReservationsByUniqueId(UNIQUE_ID, AFM_EMAIL,
                    null, false);
            } catch (final ReservationException exception) {
                Assert.fail(timeZone + ": " + exception.toString());
            }

        }
    }

}
