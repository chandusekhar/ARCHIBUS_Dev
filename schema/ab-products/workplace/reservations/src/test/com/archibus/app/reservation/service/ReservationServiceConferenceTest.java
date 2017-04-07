package com.archibus.app.reservation.service;

import java.text.ParseException;
import java.util.*;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.app.reservation.util.ReservationUtils;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;

import junit.framework.Assert;

/**
 * Tests for Reservation Service interaction with conference call reservations, i.e. editing and
 * retrieving full conference call reservations as applied by Outlook Plugin and Exchange Listener.
 */
public class ReservationServiceConferenceTest extends RoomReservationServiceTestBase {

    /** City id field name. */
    private static final String CITY_ID_FIELD = "city_id";

    /** City table name. */
    private static final String CITY_TABLE = "city";

    /** Alternative time zone id. */
    private static final String OTHER_TIMEZONE_ID = "Europe/London";

    /** Time zone of the HQ building. */
    private static final String TIMEZONE_ID = "America/New_York";

    /** Attendees for modified reservations. */
    private static final String OTHER_ATTENDEES = "dummy1@tgd.com;dummy2@tgd.com";

    /** Modified subject for testing. */
    private static final String MODIFIED_SUBJECT = "Modified subject for this conference call test";

    /** The conference reservation handler. */
    private ConferenceCallReservationService conferenceCallReservationService;

    /**
     * Test getting the active reservation in a conference call, when the primary is cancelled.
     */
    public final void testGetActiveReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        this.conferenceCallReservationService.saveReservation(reservation, createRoomAllocations(),
            TIMEZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        this.reservationDataSource.cancel(this.reservationDataSource.get(reservationId));

        final RoomReservation roomReservation =
                this.reservationService.getActiveReservation(reservationId, null);
        Assert.assertNotNull(roomReservation);
        Assert.assertEquals(Integer.valueOf(reservationId + 1), roomReservation.getReserveId());
        Assert.assertEquals(Integer.valueOf(reservationId), roomReservation.getConferenceId());
    }

    /**
     * Test saving a reservation part of a conference call.
     */
    public final void testSaveReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        this.conferenceCallReservationService.saveReservation(reservation, createRoomAllocations(),
            TIMEZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final RoomReservation roomReservation =
                this.reservationService.getActiveReservation(reservationId, null);

        // change the reservation to the next date and change the attendees
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(roomReservation.getStartDate());
        calendar.add(Calendar.DATE, 1);
        roomReservation.setStartDate(calendar.getTime());
        roomReservation.setEndDate(roomReservation.getStartDate());
        roomReservation.setAttendees(OTHER_ATTENDEES);

        this.reservationService.saveFullReservation(roomReservation);

        // now get all by conference id and verify they match
        final List<RoomReservation> confCallReservations =
                this.reservationDataSource.getByConferenceId(reservationId, true);
        for (final RoomReservation confCallReservation : confCallReservations) {
            ReservationUtils.convertToTimeZone(confCallReservation, TIMEZONE_ID);
            Assert.assertEquals(calendar.getTime(), confCallReservation.getStartDate());
            Assert.assertEquals(OTHER_ATTENDEES, confCallReservation.getAttendees());
        }
    }

    /**
     * Test verifying the recurrence pattern for a conference call reservation.
     */
    public final void testVerifyRecurrencePattern() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIMEZONE_ID);
        final List<RoomReservation> reservations = this.reservationDataSource.getConferenceSeries(
            reservation.getInt(RESERVE_RES_ID), null, DataSource.SORT_ASC, true);
        final WeeklyPattern recurrence = this.createRecurrenceObject(reservations);
        Assert.assertTrue(this.reservationService.verifyRecurrencePattern(
            reservation.getString("reserve.outlook_unique_id"), recurrence, this.startTime,
            this.endTime, TIMEZONE_ID));
    }

    /**
     * Test updating the time, subject and attendees for a recurring conference call through the
     * Conference Aware Reservation Service.
     *
     * @throws ParseException when a time format is invalid
     */
    public final void testUpdateRecurringConferenceCall() throws ParseException {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIMEZONE_ID);
        List<RoomReservation> reservations = this.reservationDataSource.getConferenceSeries(
            reservation.getInt(RESERVE_RES_ID), null, DataSource.SORT_ASC, true);
        final WeeklyPattern recurrence = this.createRecurrenceObject(reservations);

        // change the time
        final RoomReservation primary = this.reservationDataSource
            .getActiveReservation(reservations.get(0).getConferenceId());
        primary.setStartTime(createTime("1899-12-30 09:30:00"));
        primary.setEndTime(createTime("1899-12-30 11:30:00"));
        primary.setReservationName(MODIFIED_SUBJECT);
        primary.setAttendees(OTHER_ATTENDEES);
        this.reservationService.saveFullRecurringReservation(primary, recurrence);

        // check that all reservations in the conference call now have the new time and other
        // changes
        reservations = this.reservationDataSource.getByUniqueId(primary.getUniqueId(), null, null);
        for (final RoomReservation savedReservation : reservations) {
            Assert.assertEquals(primary.getStartTime(),
                TimePeriod.clearDate(savedReservation.getStartTime()));
            Assert.assertEquals(primary.getEndTime(),
                TimePeriod.clearDate(savedReservation.getEndTime()));
            Assert.assertEquals(primary.getAttendees(), savedReservation.getAttendees());
            Assert.assertEquals(primary.getReservationName(),
                savedReservation.getReservationName());
        }
    }

    /**
     * Test updating a recurring conference call while one occurrence of the primary was cancelled.
     *
     * @throws ParseException when a time format is invalid
     */
    public final void testUpdateRecurringConferenceCallWithCancelledPrimary()
            throws ParseException {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIMEZONE_ID);
        List<RoomReservation> reservations = this.reservationDataSource.getConferenceSeries(
            reservation.getInt(RESERVE_RES_ID), null, DataSource.SORT_ASC, true);
        final WeeklyPattern recurrence = this.createRecurrenceObject(reservations);

        // cancel the primary room in the second occurrence
        final RoomReservation secondRes = this.reservationDataSource
            .getActiveReservation(reservations.get(1).getConferenceId());
        this.reservationDataSource.cancel(secondRes);

        // change the subject
        final RoomReservation primary = this.reservationDataSource
            .getActiveReservation(reservations.get(0).getConferenceId());
        primary.setReservationName(MODIFIED_SUBJECT);
        this.reservationService.saveFullRecurringReservation(primary, recurrence);

        // check that all reservations in the conference call have the new subject and no new
        // reservation is created
        reservations = this.reservationDataSource.getByUniqueId(primary.getUniqueId(), null, null);
        Assert.assertEquals(
            recurrence.getNumberOfOccurrences() * roomAllocations.getRecords().size() - 1,
            reservations.size());

        boolean replacementFound = false;
        for (final RoomReservation savedReservation : reservations) {
            Assert.assertEquals(primary.getReservationName(),
                savedReservation.getReservationName());
            if (savedReservation.getOccurrenceIndex() == secondRes.getOccurrenceIndex()) {
                // ensure no new reservation was created to replace the cancelled one
                Assert.assertNotSame(secondRes.getReserveId(), savedReservation.getReserveId());
                Assert.assertEquals(secondRes.getConferenceId(),
                    savedReservation.getConferenceId());
                if (secondRes.getParentId().equals(savedReservation.getParentId())) {
                    replacementFound = true;
                }
            }
        }
        Assert.assertFalse(replacementFound);
    }

    /**
     * Test updating a recurring conference call with rooms in different time zones.
     *
     * @throws ParseException when a time format is invalid
     */
    public final void testUpdateRecurringConferenceCallTimeZones() throws ParseException {
        this.changeCityTimeZone("BOSTON");
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataRecord roomAllocation1 = createRoomAllocation();
        final DataRecord roomAllocation2 = createRoomAllocation();

        // change the first room to a room in BOSMED
        roomAllocation1.setValue(RESERVE_RM_BL_ID, "BOSMED");
        roomAllocation1.setValue(RESERVE_RM_FL_ID, "01");
        roomAllocation1.setValue(RESERVE_RM_RM_ID, "102");
        roomAllocation1.setValue(RESERVE_RM_CONFIG_ID, "CONF-102-SMALL");
        roomAllocation1.setValue(RESERVE_RM_RM_ARRANGE_TYPE_ID, "CONFERENCE");
        final DataSetList roomAllocations = new DataSetList();
        roomAllocations.addRecord(roomAllocation1);
        roomAllocations.addRecord(roomAllocation2);

        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIMEZONE_ID);
        List<RoomReservation> reservations = this.reservationDataSource.getConferenceSeries(
            reservation.getInt(RESERVE_RES_ID), null, DataSource.SORT_ASC, true);
        final WeeklyPattern recurrence = this.createRecurrenceObject(reservations);

        // change the time
        final RoomReservation primary = this.reservationDataSource
            .getActiveReservation(reservations.get(0).getConferenceId());
        primary.setStartTime(createTime("1899-12-30 14:30:00"));
        primary.setEndTime(createTime("1899-12-30 16:30:00"));
        this.reservationService.saveFullRecurringReservation(primary, recurrence);

        // check that all reservations in the conference call now have the new time
        reservations = this.reservationDataSource.getByUniqueId(primary.getUniqueId(), null, null);
        for (final RoomReservation savedReservation : reservations) {
            ReservationUtils.convertToTimeZone(savedReservation, OTHER_TIMEZONE_ID);
            Assert.assertEquals(primary.getStartTime(),
                TimePeriod.clearDate(savedReservation.getStartTime()));
            Assert.assertEquals(primary.getEndTime(),
                TimePeriod.clearDate(savedReservation.getEndTime()));
        }
    }

    /**
     * Change the time zone of the given city to London time.
     *
     * @param cityId the city to modify
     */
    private void changeCityTimeZone(final String cityId) {
        final DataSource cityDs = DataSourceFactory.createDataSourceForFields(CITY_TABLE,
            new String[] { CITY_ID_FIELD, "timezone_id" });
        cityDs.addRestriction(Restrictions.eq(CITY_TABLE, CITY_ID_FIELD, cityId));
        final DataRecord record = cityDs.getRecord();
        record.setValue("city.timezone_id", OTHER_TIMEZONE_ID);
        cityDs.updateRecord(record);
    }

    /**
     * Create the recurrence object matching the recurrence defined for the reservations in this
     * test.
     *
     * @param reservations the created reservations
     * @return the recurrence object defining the recurrence pattern
     */
    private WeeklyPattern createRecurrenceObject(final List<RoomReservation> reservations) {
        final WeeklyPattern recurrence = new WeeklyPattern(this.startDate, this.endDate, 1,
            Arrays.asList(DayOfTheWeek.Tuesday));
        recurrence.setNumberOfOccurrences(reservations.size());
        return recurrence;
    }

    /**
     * Test updating the subject and attendees for a recurring conference call with exceptions.
     *
     * @throws ParseException when a time format is invalid
     */
    public final void testUpdateRecurringConferenceCallWithExceptions() throws ParseException {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIMEZONE_ID);
        List<RoomReservation> reservations = this.reservationDataSource.getConferenceSeries(
            reservation.getInt(RESERVE_RES_ID), null, DataSource.SORT_ASC, true);
        final WeeklyPattern recurrence = createRecurrenceObject(reservations);

        // cancel the next to last occurrence
        final RoomReservation cancelledOccurrence = reservations.get(reservations.size() - 2);
        this.conferenceCallReservationService
            .cancelConferenceReservation(cancelledOccurrence.getConferenceId(), "Cancel comments");
        final OccurrenceInfo cancelledInfo = new OccurrenceInfo();
        cancelledInfo.setOriginalDate(cancelledOccurrence.getStartDate());
        cancelledInfo.setCancelled(true);

        // move the first occurrence without actually saving it to the database
        final RoomReservation primary = this.reservationDataSource
            .getActiveReservation(reservations.get(0).getConferenceId());
        final OccurrenceInfo movedInfo = new OccurrenceInfo();
        movedInfo.setOriginalDate(primary.getStartDate());
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(primary.getStartDateTime());
        calendar.add(Calendar.DATE, -1);
        calendar.add(Calendar.HOUR, 1);
        movedInfo.setModifiedStartDateTime(calendar.getTime());
        calendar.add(Calendar.HOUR, 1);
        movedInfo.setModifiedEndDateTime(calendar.getTime());

        recurrence.setExceptions(Arrays.asList(new OccurrenceInfo[] { cancelledInfo, movedInfo }));

        // change the subject and attendees
        primary.setReservationName(MODIFIED_SUBJECT);
        primary.setAttendees(OTHER_ATTENDEES);
        this.reservationService.saveFullRecurringReservation(primary, recurrence);

        // check that all reservations in the conference call now have the changes
        reservations = this.reservationDataSource.getByUniqueId(primary.getUniqueId(), null, null);
        Assert.assertEquals(
            (recurrence.getNumberOfOccurrences() - 1) * roomAllocations.getRecords().size(),
            reservations.size());
        for (final RoomReservation savedReservation : reservations) {
            Assert.assertEquals(primary.getAttendees(), savedReservation.getAttendees());
            Assert.assertEquals(primary.getReservationName(),
                savedReservation.getReservationName());
            if (savedReservation.getOccurrenceIndex() == 1) {
                Assert.assertEquals(movedInfo.getModifiedStartDateTime(),
                    savedReservation.getStartDateTime());
                Assert.assertEquals(movedInfo.getModifiedEndDateTime(),
                    savedReservation.getEndDateTime());
            }
        }
    }

    /**
     * Set the conference call reservation service.
     *
     * @param conferenceCallReservationService the new conference call reservation service
     */
    public void setConferenceCallReservationService(
            final ConferenceCallReservationService conferenceCallReservationService) {
        this.conferenceCallReservationService = conferenceCallReservationService;
    }

}
