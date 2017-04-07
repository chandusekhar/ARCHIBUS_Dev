package com.archibus.app.reservation.dao.datasource;

import java.sql.Time;
import java.text.ParseException;
import java.util.*;

import com.archibus.app.reservation.domain.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.utility.Utility;

import junit.framework.Assert;

/**
 * Test class for RoomAllocationDataSource.
 */
public class RoomAllocationDataSourceTest extends ReservationDataSourceTestBase {

    /**
     * Test getting all room allocations within a time period.
     */
    public void testGetRoomAllocationsByDate() {
        Date startDate = this.existingReservation.getStartDate();

        List<RoomAllocation> roomAllocations = this.roomAllocationDataSource
            .getRoomAllocations(BL_ID, FL_ID, RM_ID, startDate, null);

        Assert.assertNotNull(roomAllocations);
        Assert.assertFalse(roomAllocations.isEmpty());

        final Calendar cal = Calendar.getInstance();
        cal.setTime(startDate);
        cal.add(Calendar.MONTH, -1);
        startDate = cal.getTime();

        cal.add(Calendar.MONTH, 2);
        final Date endDate = cal.getTime();

        roomAllocations = this.roomAllocationDataSource.getRoomAllocations(BL_ID, FL_ID, RM_ID,
            startDate, endDate);

        Assert.assertNotNull(roomAllocations);
        Assert.assertFalse(roomAllocations.isEmpty());
    }

    /**
     * Test getting room allocations linked to a reservation.
     */
    public void testGetRoomAllocationsByReservation() {
        // get all room allocations
        final List<DataRecord> roomAllocations = this.roomAllocationDataSource.getAllRecords();

        Assert.assertNotNull(roomAllocations);
        Assert.assertFalse(roomAllocations.isEmpty());

        List<RoomAllocation> rooms =
                this.roomAllocationDataSource.find((ParsedRestrictionDef) null);
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());

        final RoomReservation reservation =
                new RoomReservation(this.existingReservation.getReserveId());
        rooms = this.roomAllocationDataSource.find(reservation);
        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());
        RoomAllocation alloc = rooms.get(0);
        Assert.assertEquals(this.existingReservation.getReserveId(), alloc.getReserveId());

        alloc = this.roomAllocationDataSource.get(alloc.getId());
        Assert.assertEquals(this.existingReservation.getReserveId(), alloc.getReserveId());
    }

    /**
     * Test getting room allocations linked to a reservation.
     */
    public void testGetRoomAllocationsByParentId() {
        this.roomReservationDataSource.markRecurring(this.existingReservation,
            this.existingReservation.getReserveId(), null, 1);

        final TimePeriod secondTimeFrame = this.existingReservation.getTimePeriod();
        final Calendar secondDate = Calendar.getInstance();
        secondDate.setTime(secondTimeFrame.getStartDate());
        secondDate.add(Calendar.DATE, 1);
        secondTimeFrame.setStartDate(secondDate.getTime());
        secondTimeFrame.setEndDate(secondDate.getTime());

        final RoomReservation secondReservation = this.createReservation(secondTimeFrame,
            this.existingReservation.getRoomAllocations().get(0).getRoomArrangement());

        this.roomReservationDataSource.markRecurring(this.existingReservation,
            this.existingReservation.getReserveId(), null, 1);
        this.roomReservationDataSource.markRecurring(secondReservation,
            this.existingReservation.getReserveId(), null, 2);
        final List<RoomAllocation> rooms = this.roomAllocationDataSource
            .findByParentId(this.existingReservation.getParentId());
        Assert.assertNotNull(rooms);
        Assert.assertEquals(2, rooms.size());
        Assert.assertEquals(this.existingReservation.getReserveId(), rooms.get(0).getReserveId());
        Assert.assertEquals(secondReservation.getReserveId(), rooms.get(1).getReserveId());
    }

    /**
     * Test saving and deleting modified room allocation.
     */
    public void testSaveRoomAllocation() {
        RoomAllocation roomAllocation =
                this.roomAllocationDataSource.find(this.existingReservation).get(0);
        Assert.assertEquals(ALLOCATION_COMMENTS, roomAllocation.getComments());
        Assert.assertEquals(ATTENDEES_IN_ROOM, roomAllocation.getAttendeesInRoom());

        roomAllocation.setComments(ALLOCATION_COMMENTS_CHANGED);
        roomAllocation.setAttendeesInRoom(ATTENDEES_IN_ROOM + 1);
        this.roomAllocationDataSource.update(roomAllocation);

        roomAllocation = this.roomAllocationDataSource.find(this.existingReservation).get(0);
        Assert.assertEquals(ALLOCATION_COMMENTS_CHANGED, roomAllocation.getComments());
        Assert.assertEquals(ATTENDEES_IN_ROOM + 1, roomAllocation.getAttendeesInRoom());

        this.roomAllocationDataSource.delete(roomAllocation);

        assertTrue("After delete, no more room allocation linked to the reservation.",
            this.roomAllocationDataSource.find(this.existingReservation).isEmpty());
    }

    /**
     * Test total cost calculation for standard.
     */
    public void testRoomAllocationCostReservation() {

        final RoomArrangement roomArrangement =
                this.roomArrangementDataSource.get(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

        final RoomAllocation roomAllocation =
                this.roomAllocationDataSource.find(this.existingReservation).get(0);

        if (roomArrangement.getCostUnit() == Constants.COST_UNIT_RESERVATION) {
            Assert.assertEquals(roomArrangement.getCostPerUnit(), roomAllocation.getCost());
        }

    }

    /**
     * Test total cost calculation for unit per hours.
     *
     * @throws ParseException ParseException
     */
    public void testRoomAllocationCostHours() throws ParseException {

        final RoomArrangement roomArrangement =
                this.roomArrangementDataSource.get(BL_ID, "18", "109", "AAA", "CLASSROOM");

        final Calendar cal = Calendar.getInstance();
        cal.setTime(Utility.currentDate());
        cal.add(Calendar.DATE, DAYS_IN_ADVANCE);

        final Date startDate = TimePeriod.clearTime(cal.getTime());

        final Time startTime = new Time(this.timeFormatter.parse("1899-12-30 15:00:00").getTime());
        final Time endTime = new Time(this.timeFormatter.parse("1899-12-30 16:00:00").getTime());

        final TimePeriod timePeriod = new TimePeriod(startDate, startDate, startTime, endTime);

        final RoomReservation roomReservation = new RoomReservation(timePeriod, roomArrangement);
        roomReservation.setReservationName("Test");
        roomReservation.setRequestedBy(USER_ID);
        roomReservation.setRequestedFor(USER_ID);
        roomReservation.setCreatedBy(USER_ID);

        this.roomReservationDataSource.save(roomReservation);

        if (roomArrangement.getCostUnit() == Constants.COST_UNIT_HOUR) {
            Assert.assertEquals(roomArrangement.getCostPerUnit() * timePeriod.getHoursDifference(),
                roomReservation.getCost());
        }

    }

    /**
     * Test checking the cancellation deadline for a room allocation.
     */
    public void testCheckCancelling() {
        final TimePeriod timePeriod = getCurrentLocalTimePeriod();
        final RoomArrangement arrangement = modifyAnnounceAndCancelLimits(timePeriod);
        final RoomReservation reservation = this.createReservation(timePeriod, arrangement);

        try {
            this.roomAllocationDataSource.checkCancelling(reservation.getRoomAllocations().get(0));
            Assert.fail("Cancelling a reservation that already started should not be allowed");
        } catch (final ReservableNotAvailableException exception) {
            Assert.assertEquals("The room reservation cannot be cancelled.",
                exception.getPattern());
        }
    }

    /**
     * Test checking the editing deadline for a room allocation.
     */
    public void testCheckEditing() {
        final TimePeriod timePeriod = getCurrentLocalTimePeriod();
        final RoomArrangement arrangement = modifyAnnounceAndCancelLimits(timePeriod);
        final RoomReservation reservation = this.createReservation(timePeriod, arrangement);
        final RoomAllocation allocation = reservation.getRoomAllocations().get(0);

        // move the reservation to the next date as if we're trying to reschedule it
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(allocation.getStartDate());
        calendar.add(Calendar.DATE, 1);
        allocation.setStartDate(calendar.getTime());
        allocation.setEndDate(allocation.getStartDate());

        try {
            this.roomAllocationDataSource.checkEditing(reservation.getRoomAllocations().get(0));
            Assert.fail("Editing a reservation that already started should not be allowed");
        } catch (final ReservableNotAvailableException exception) {
            Assert.assertTrue(exception.getPattern().contains(arrangement.getBlId()));
        }
    }

    /**
     * Get a modified room arrangement which allows cancelling and updating reservations with the
     * given time period taking place today.
     *
     * @param timePeriod time period for a reservation which should still be allowed to cancel /
     *            edit
     * @return modified room arrangement
     */
    private RoomArrangement modifyAnnounceAndCancelLimits(final TimePeriod timePeriod) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(timePeriod.getEndDateTime());
        calendar.add(Calendar.HOUR, 1);
        final RoomArrangement arrangement =
                this.roomArrangementDataSource.get(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        arrangement.setCancelDays(0);
        arrangement.setCancelTime(new Time(calendar.getTimeInMillis()));
        arrangement.setAnnounceDays(arrangement.getCancelDays());
        arrangement.setAnnounceTime(arrangement.getCancelTime());
        this.roomArrangementDataSource.update(arrangement);
        return arrangement;
    }

}
