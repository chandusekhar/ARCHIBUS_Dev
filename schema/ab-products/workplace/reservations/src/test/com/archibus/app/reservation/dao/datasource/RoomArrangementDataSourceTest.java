package com.archibus.app.reservation.dao.datasource;

import java.sql.Time;
import java.text.ParseException;
import java.util.*;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.TimeZoneConverter;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

import junit.framework.Assert;

/**
 * Test class for RoomArrangementDataSource.
 */
public class RoomArrangementDataSourceTest extends ReservationDataSourceTestBase {

    /** Room table name. */
    private static final String ROOM_TABLE_NAME = "rm";

    /**
     * Test getting a specific room arrangement.
     */
    public void testGetRoomArrangement() {
        final RoomArrangement roomArrangement =
                this.roomArrangementDataSource.get(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

        Assert.assertNotNull(roomArrangement);
        Assert.assertEquals(BL_ID, roomArrangement.getBlId());
        Assert.assertEquals(FL_ID, roomArrangement.getFlId());
        Assert.assertEquals(RM_ID, roomArrangement.getRmId());
        Assert.assertEquals(CONFIG_ID, roomArrangement.getConfigId());
        Assert.assertEquals(ARRANGE_TYPE_ID, roomArrangement.getArrangeTypeId());
    }

    /**
     * Test finding available rooms on a specified date / time.
     *
     * @throws ParseException when the time specifications are invalid
     */
    public void testAvailableRooms() throws ParseException {
        Assert.assertNotNull(ContextStore.get().getDatabase());

        final Date startDate = Utils.getDate(DAYS_IN_ADVANCE);

        final Time startTime = new Time(this.timeFormatter.parse("1899-12-30 08:00:00").getTime());
        final Time endTime = new Time(this.timeFormatter.parse("1899-12-30 11:00:00").getTime());
        final TimePeriod timePeriod = new TimePeriod(startDate, startDate, startTime, endTime);

        List<RoomArrangement> availableRooms = this.roomArrangementDataSource
            .findAvailableRooms(BL_ID, null, null, null, timePeriod, null, null);

        Assert.assertNotNull(availableRooms);
        Assert.assertFalse(availableRooms.isEmpty());

        availableRooms = this.roomArrangementDataSource.findAvailableRooms(BL_ID, null, null,
            ARRANGE_TYPE_ID, timePeriod, null, null);

        Assert.assertNotNull(availableRooms);
        Assert.assertFalse(availableRooms.isEmpty());

        availableRooms = this.roomArrangementDataSource.findAvailableRooms(null, null, null,
            ARRANGE_TYPE_ID, new TimePeriod(startDate, null, null, null), null, null);

        Assert.assertNotNull(availableRooms);
        Assert.assertFalse(availableRooms.isEmpty());
    }

    /**
     * Test finding available rooms for a time period that spans across multiple days.
     *
     * @throws ParseException when the time specifications are invalid
     */
    public void testMultipleDays() throws ParseException {
        final Date startDate = Utils.getDate(DAYS_IN_ADVANCE);
        final Date endDate = Utils.getDate(DAYS_IN_ADVANCE + 1);

        final Time startTime = new Time(this.timeFormatter.parse("1899-12-30 08:30:00").getTime());
        final Time endTime = new Time(this.timeFormatter.parse("1899-12-30 10:00:00").getTime());
        final TimePeriod timePeriod = new TimePeriod(startDate, endDate, startTime, endTime);

        List<RoomArrangement> availableRooms = this.roomArrangementDataSource
            .findAvailableRooms(BL_ID, null, null, null, timePeriod, null, null);

        Assert.assertNotNull(availableRooms);
        Assert.assertTrue(availableRooms.isEmpty());

        timePeriod.setEndDate(Utils.getDate(DAYS_IN_ADVANCE + 2));
        availableRooms = this.roomArrangementDataSource.findAvailableRooms(BL_ID, null, null, null,
            timePeriod, null, null);

        Assert.assertNotNull(availableRooms);
        Assert.assertTrue(availableRooms.isEmpty());
    }

    /**
     * Test getting available rooms for an all day event.
     *
     * @throws ParseException when the time specification is invalid
     */
    public void testAllDayEvent() throws ParseException {
        final Date startDate = Utils.getDate(DAYS_IN_ADVANCE);
        final Date endDate = Utils.getDate(DAYS_IN_ADVANCE + 1);

        final Time time = new Time(this.timeFormatter.parse("1899-12-30 00:00:00").getTime());
        final TimePeriod timePeriod = new TimePeriod(startDate, endDate, time, time);

        // Create the corresponding domain objects for the query.
        final RoomArrangement roomArrangement = new RoomArrangement(BL_ID, null, null, null, null);
        final RoomReservation reservation = new RoomReservation(timePeriod, roomArrangement);

        final List<RoomArrangement> availableRooms = this.roomArrangementDataSource
            .findAvailableRooms(reservation, null, false, null, true, false);

        Assert.assertNotNull(availableRooms);
        Assert.assertFalse(availableRooms.isEmpty());
    }

    /**
     * Test using res_stds_not_allowed.
     */
    public void testResourceStandardsNotAllowed() {
        final RoomArrangement roomArrangement =
                this.roomArrangementDataSource.get(BL_ID, "19", "110", "A1", ARRANGE_TYPE_ID);

        Assert.assertNotNull(roomArrangement.getStandardsNotAllowed());
        Assert.assertTrue(roomArrangement.allowsResourceStandard("DUMMY"));
        Assert.assertFalse(roomArrangement.allowsResourceStandard("TV - 50 INCH"));
        Assert.assertFalse(roomArrangement.allowsResourceStandard("CATERING-COLD"));
    }

    /**
     * Test how day start and end are modified if you request available rooms in a different time
     * zone.
     */
    public void testTimeZoneAvailability() {
        this.existingReservation.getRoomAllocations().get(0).setRmId(null);
        this.existingReservation.getRoomAllocations().get(0).setFlId(null);
        this.existingReservation.getRoomAllocations().get(0).setConfigId(null);
        this.existingReservation.getRoomAllocations().get(0).setArrangeTypeId(null);
        final List<RoomArrangement> availableRoomsInLocalTime = this.roomArrangementDataSource
            .findAvailableRooms(this.existingReservation, null, false, null, false, false);
        TimeZoneConverter.convertToTimeZone(availableRoomsInLocalTime,
            this.existingReservation.getStartDate(), this.existingReservation.determineBuildingId(),
            "America/New_York");

        Assert.assertNotNull(availableRoomsInLocalTime);
        Assert.assertFalse(availableRoomsInLocalTime.isEmpty());

        final List<RoomArrangement> availableRoomsInRequestorTime = this.roomArrangementDataSource
            .findAvailableRooms(this.existingReservation, null, false, null, false, false);
        TimeZoneConverter.convertToTimeZone(availableRoomsInRequestorTime,
            this.existingReservation.getStartDate(), this.existingReservation.determineBuildingId(),
            "Asia/Tokyo");

        Assert.assertEquals(availableRoomsInLocalTime.size(), availableRoomsInRequestorTime.size());

        for (int i = 0; i < availableRoomsInLocalTime.size(); ++i) {
            final RoomArrangement roomInLocalTime = availableRoomsInLocalTime.get(i);
            final RoomArrangement roomInRequestorTime = availableRoomsInRequestorTime.get(i);
            Assert.assertEquals(roomInLocalTime.getBlId(), roomInRequestorTime.getBlId());
            Assert.assertEquals(roomInLocalTime.getFlId(), roomInRequestorTime.getFlId());
            Assert.assertEquals(roomInLocalTime.getRmId(), roomInRequestorTime.getRmId());
            Assert.assertEquals(roomInLocalTime.getConfigId(), roomInRequestorTime.getConfigId());
            Assert.assertEquals(roomInLocalTime.getArrangeTypeId(),
                roomInRequestorTime.getArrangeTypeId());
            Assert.assertTrue(roomInLocalTime.getDayEnd().toString()
                .compareTo(roomInLocalTime.getDayStart().toString()) > 0);
            Assert.assertFalse(roomInRequestorTime.getDayEnd().toString()
                .compareTo(roomInRequestorTime.getDayStart().toString()) > 0);
        }
    }

    /**
     * Test whether excluded configurations work correctly.
     */
    public void testExcludedConfigurations() {
        // first mark HQ-17-101 reservable.
        final DataSource roomDs = DataSourceFactory.createDataSourceForFields(ROOM_TABLE_NAME,
            new String[] { Constants.BL_ID_FIELD_NAME, Constants.FL_ID_FIELD_NAME,
                    Constants.RM_ID_FIELD_NAME, Constants.RESERVABLE_FIELD_NAME });
        roomDs.addRestriction(Restrictions.eq(ROOM_TABLE_NAME, Constants.BL_ID_FIELD_NAME, BL_ID));
        roomDs.addRestriction(Restrictions.eq(ROOM_TABLE_NAME, Constants.FL_ID_FIELD_NAME, FL_ID));
        roomDs.addRestriction(Restrictions.eq(ROOM_TABLE_NAME, Constants.RM_ID_FIELD_NAME, RM_ID));
        final DataRecord room = roomDs.getRecord();
        room.setValue(ROOM_TABLE_NAME + Constants.DOT + Constants.RESERVABLE_FIELD_NAME, 1);
        roomDs.updateRecord(room);

        /*
         * Now since we have an existing reservation in configuration C, verify none of the
         * configurations including C are available.
         */
        final List<RoomArrangement> arrangements =
                this.roomArrangementDataSource.findAvailableRooms(BL_ID, FL_ID, RM_ID, null,
                    this.existingReservation.getTimePeriod(), null, null);
        for (final RoomArrangement arrangement : arrangements) {
            Assert.assertFalse(arrangement.getConfigId().contains(CONFIG_ID));
        }
    }
}
