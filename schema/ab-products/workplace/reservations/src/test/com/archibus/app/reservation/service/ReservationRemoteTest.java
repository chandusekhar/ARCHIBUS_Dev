package com.archibus.app.reservation.service;

import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.*;
import com.archibus.app.reservation.dao.datasource.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.DailyPattern;
import com.archibus.app.reservation.service.helpers.ActivityParameterHelper;
import com.archibus.app.reservation.util.*;
import com.archibus.utility.LocalDateTimeUtil;

import junit.framework.Assert;

/**
 * Test for the ReservationRemoteService interface.
 * <p>
 * Suppress warning "PMD.TooManyMethods".
 * <p>
 * Justification: the JUnit tests for this class should be kept in one test class.
 */
@SuppressWarnings("PMD.TooManyMethods")
public class ReservationRemoteTest extends ReservationServiceTestBase {

    /** Building ID 2. */
    private static final String BL_ID2 = "JFK A";

    /** Dummy body message for a reservation. */
    private static final String BODY_MESSAGE = "body message";

    /** Email address used for testing. */
    private static final String EMAIL = "afm@tgd.com";

    /** Requestor time zone used for testing. */
    private static final String TIME_ZONE = "Europe/Brussels";

    /** Room capacity used for testing. */
    private static final int CAPACITY = 5;

    /** The object under test: implementation of ReservationRemoteService. */
    private ReservationRemoteService reservationRemoteService;

    /** Room reservation data source used for verifying test results. */
    private RoomReservationDataSource roomReservationDataSource;

    /** The calendar settings object (for verification). */
    private ICalendarSettings calendarSettings;

    /**
     * Test ReservationRemoteService.getSites().
     */
    public void testGetSites() {
        final List<Site> sites = this.reservationRemoteService.findSites(new Site());

        Assert.assertNotNull(sites);
        Assert.assertFalse(sites.isEmpty());
    }

    /**
     * Test ReservationRemoteService.getBuildings().
     */
    public void testGetBuildings() {
        final Building filter = new Building();
        filter.setSiteId(SITE_ID);
        final List<Building> buildings = this.reservationRemoteService.findBuildings(filter);

        Assert.assertNotNull(buildings);
        Assert.assertFalse(buildings.isEmpty());
        for (final Building building : buildings) {
            Assert.assertEquals(SITE_ID, building.getSiteId());
        }
    }

    /**
     * Test ReservationRemoteService.getBuildingDetails().
     */
    public void testGetBuildingDetails() {
        final Building filter = new Building();
        filter.setBuildingId(BL_ID);
        final List<Building> buildings = this.reservationRemoteService.findBuildings(filter);

        Assert.assertNotNull(buildings);
        Assert.assertEquals(1, buildings.size());
        Assert.assertEquals(BL_ID, buildings.get(0).getBuildingId());
    }

    /**
     * Test ReservationRemoteService.getFloors().
     */
    public void testGetFloors() {
        final Floor filter = new Floor();
        filter.setBuildingId(BL_ID);
        final List<Floor> floors = this.reservationRemoteService.getFloors(filter);

        Assert.assertNotNull(floors);
        Assert.assertFalse(floors.isEmpty());
        for (final Floor floor : floors) {
            Assert.assertEquals(BL_ID, floor.getBuildingId());
        }
    }

    /**
     * Test ReservationRemoteService.findAvailableRooms().
     */
    public void testFindAvailableRooms() {
        final RoomReservation reservation = new RoomReservation(this.timePeriod);
        reservation
            .addRoomAllocation(new RoomAllocation(BL_ID, null, null, null, null, reservation));
        reservation.setTimeZone(null);

        List<RoomArrangement> rooms = this.reservationRemoteService.findAvailableRooms(reservation,
            CAPACITY, false, null);

        Assert.assertNotNull(rooms);

        for (final RoomArrangement room : rooms) {
            Assert.assertEquals(BL_ID, room.getBlId());
        }

        reservation.setTimeZone(TIME_ZONE);

        rooms = this.reservationRemoteService.findAvailableRooms(reservation, CAPACITY, false,
            null);

        Assert.assertNotNull(rooms);
        Assert.assertEquals(0, rooms.size());

        this.startTime = createTime("1899-12-30 16:00:00");
        this.endTime = createTime("1899-12-30 17:00:00");
        reservation.setStartTime(this.startTime);
        reservation.setEndTime(this.endTime);

        rooms = this.reservationRemoteService.findAvailableRooms(reservation, CAPACITY, false,
            null);

        Assert.assertNotNull(rooms);
        Assert.assertFalse(rooms.isEmpty());
        for (final RoomArrangement room : rooms) {
            Assert.assertEquals(BL_ID, room.getBlId());
        }

        final ResourceStandard resourceStandard = new ResourceStandard();
        resourceStandard.setId("PROJECTOR-FIXED");
        rooms = this.reservationRemoteService.findAvailableRooms(reservation, CAPACITY, false,
            Arrays.asList(new ResourceStandard[] { resourceStandard }));
        Assert.assertFalse(rooms.isEmpty());
        Assert.assertEquals(BL_ID, rooms.get(0).getBlId());
        Assert.assertEquals("18", rooms.get(0).getFlId());
        Assert.assertEquals("109", rooms.get(0).getRmId());
    }

    /**
     * Test checking room availability for multiple rooms part of a conference call.
     */
    public void testCheckConferenceRoomsAvailability() {
        final List<RoomReservation> reservations = setupConfCallReservations();

        final ConferenceRoomsAvailability result = this.reservationRemoteService
            .checkConferenceRoomsAvailability(reservations, false, null);

        Assert.assertNotNull(result);
        Assert.assertNotNull(result.getRoomArrangements());
        Assert.assertEquals(reservations.size(), result.getRoomArrangements().size());

        Assert.assertNotNull(result.getLocation());
        Assert.assertNotNull(result.getLocationSeparator());
        Assert.assertTrue(result.getLocationSeparator().contains("****"));
        Assert.assertTrue(result.getLocation().contains(BL_ID));
        Assert.assertTrue(result.getLocation().contains(BL_ID2));
    }

    /**
     * Test ReservationRemoteService.saveRoomReservation().
     */
    public void testSaveRoomReservation() {
        final RoomAllocation roomAllocation =
                new RoomAllocation(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        RoomReservation reservation = new RoomReservation(this.timePeriod);
        reservation.addRoomAllocation(roomAllocation);
        reservation.setEmail(EMAIL);
        reservation.setUniqueId(UNIQUE_ID);
        reservation.setReservationName(RESERVATION_NAME);
        reservation.setComments(BODY_MESSAGE);

        reservation = this.reservationRemoteService.saveRoomReservation(reservation);

        Assert.assertNotNull(reservation);

        final RoomReservation retrievedReservation =
                this.reservationRemoteService.getRoomReservationById(reservation.getReserveId());
        Assert.assertNotNull(retrievedReservation);
        Assert.assertEquals(reservation.getReserveId(), retrievedReservation.getReserveId());

        try {
            reservation = new RoomReservation(this.timePeriod);
            reservation.addRoomAllocation(roomAllocation);
            reservation.setEmail(EMAIL);
            reservation.setUniqueId(UNIQUE_ID);
            reservation.setReservationName(RESERVATION_NAME);
            reservation.setComments(BODY_MESSAGE);

            reservation.setTimeZone("GMT");

            this.reservationRemoteService.saveRoomReservation(reservation);

            Assert.fail(
                "The save should have thrown an exception because the room is not available at the given time.");
        } catch (final ReservationException exception) {
            Assert.assertNull(reservation.getReserveId());
        }
    }

    /**
     * Test saving a number of rooms in a single conference call.
     */
    public void testSaveConferenceCall() {
        final List<RoomReservation> reservations = setupConfCallReservations();

        final SavedConferenceCall result =
                this.reservationRemoteService.saveConferenceCall(reservations, null, false);
        Assert.assertNotNull(result);
        Assert.assertTrue(result.isCompleted());
        Assert.assertEquals(reservations.size(), result.getSavedReservations().size());
    }

    /**
     * Test updating a room reservation which was created by another user with a custom division and
     * department.
     */
    public void testUpdateRoomReservation() {
        final String timeZone = LocalDateTimeUtil.getLocationTimeZone(null, null, null, BL_ID);
        this.timePeriod.setTimeZone(timeZone);

        final RoomReservation roomReservation = new RoomReservation(this.timePeriod, BL_ID, FL_ID,
            RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

        final Employee creator = this.employeeService.findEmployee(AFM_EMAIL);
        final String userId = this.employeeService.findEmployee("abbot@tgd.com").getId();
        Assert.assertNotSame(userId, creator.getId());
        roomReservation.setEmail(AFM_EMAIL);
        ReservationUtils.setCreator(roomReservation, creator, userId);
        roomReservation.setDivisionId("EXECUTIVE");
        roomReservation.setDepartmentId("MANAGEMENT");

        roomReservation.setReservationName(TEST);
        roomReservation.setReservationType(TYPE_REGULAR);
        roomReservation
            .setAttendees("jason@mailinator.com;martin@mailinator.com;linda@mailinator.com");

        this.roomReservationDataSource.save(roomReservation);
        final RoomReservation reservationForUpdate = this.reservationRemoteService
            .getRoomReservationById(roomReservation.getReserveId());
        reservationForUpdate.setComments(TEST + TEST);
        this.reservationRemoteService.saveRoomReservation(reservationForUpdate);

        final RoomReservation updatedReservation = this.reservationRemoteService
            .getRoomReservationById(roomReservation.getReserveId());
        Assert.assertEquals(userId, updatedReservation.getCreatedBy());
        Assert.assertEquals(roomReservation.getDepartmentId(),
            updatedReservation.getDepartmentId());
        Assert.assertEquals(roomReservation.getDivisionId(), updatedReservation.getDivisionId());
    }

    /**
     * Test ReservationRemoteService.saveRecurringRoomReservation().
     */
    public void testSaveRecurringRoomReservation() {
        final RoomAllocation roomAllocation =
                new RoomAllocation(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.endDate);
        // CHECKSTYLE:OFF Justification: this 'magic number' is used for testing.
        calendar.add(Calendar.DATE, 3);
        // CHECKSTYLE:ON
        final Date endDateOfPattern = calendar.getTime();

        final RoomReservation reservation = new RoomReservation(this.timePeriod);
        reservation.addRoomAllocation(roomAllocation);
        reservation.setEmail(EMAIL);

        reservation.setUniqueId("123456789");
        reservation.setReservationName(RESERVATION_NAME);
        reservation.setComments(BODY_MESSAGE);

        final DailyPattern recurrence = new DailyPattern(this.startDate, 1);
        recurrence.setEndDate(endDateOfPattern);

        final List<RoomReservation> reservations =
                this.reservationRemoteService.saveRecurringRoomReservation(reservation, recurrence);

        Assert.assertNotNull(reservations);
        Assert.assertFalse(reservations.isEmpty());
        Assert.assertEquals(this.startDate, reservations.get(0).getStartDate());
    }

    /**
     * Test ReservationRemoteService.getRoomReservationsByUniqueId().
     */
    public void testGetRoomReservationsByUniqueId() {
        createReservation(UNIQUE_ID);

        final List<RoomReservation> reservations =
                this.reservationRemoteService.getRoomReservations(UNIQUE_ID, null);

        Assert.assertNotNull(reservations);
        Assert.assertFalse(reservations.isEmpty());
    }

    /**
     * Test getting a property value.
     */
    public void testGetActivityParameter() {
        Assert.assertEquals(this.calendarSettings.getResourceAccount(),
            this.reservationRemoteService
                .getActivityParameter(ActivityParameterHelper.RESOURCE_ACCOUNT_PARAMETER));
    }

    /**
     * Test getting localized messages through the activity parameter interface.
     */
    public void testGetLocalizedMessages() {
        final List<String> ids = Arrays.asList(new String[] { "MSG_ONE_CANCEL_FAILED_RETRY",
                "MSG_SHOW_RESERVATION_PANE", "MSG_SOMETHING_ELSE" });
        final List<String> values = this.reservationRemoteService.getActivityParameters(ids);
        Assert.assertEquals(ids.size(), values.size());
        Assert.assertTrue(values.get(0).contains("\n"));
        Assert.assertEquals("", values.get(2));
    }

    /**
     * Test getting multiple property values.
     */
    public void testGetActivityParameters() {
        final List<String> ids =
                Arrays.asList(new String[] { ActivityParameterHelper.RESOURCE_ACCOUNT_PARAMETER,
                        ActivityParameterHelper.SUPPORTED_METHODS_PARAMETER,
                        "PlugInFullReservationView", "DoesNotExist" });
        final List<String> values = this.reservationRemoteService.getActivityParameters(ids);
        Assert.assertEquals(ids.size(), values.size());
        Assert.assertEquals(this.calendarSettings.getResourceAccount(), values.get(0));
        Assert.assertTrue(values.get(1).contains("getActivityParameters"));
        Assert.assertTrue(values.get(1).contains("findLocations"));
        Assert.assertEquals(com.archibus.service.Configuration.getActivityParameterString(
            ActivityParameterHelper.RESERVATIONS_ACTIVITY, ids.get(2)), values.get(2));
        Assert.assertNull(values.get(values.size() - 1));
    }

    /**
     * Test ReservationRemoteService.cancelRoomReservation().
     */
    public void testCancelRoomReservation() {
        createReservation(UNIQUE_ID);

        final List<RoomReservation> reservations =
                this.reservationRemoteService.getRoomReservations(UNIQUE_ID, null);

        Assert.assertEquals(1, reservations.size());
        final RoomReservation roomReservation = reservations.get(0);

        this.reservationRemoteService.cancelRoomReservation(roomReservation);
        final RoomReservation cancelledReservation =
                this.roomReservationDataSource.get(roomReservation.getReserveId());
        Assert.assertEquals("Cancelled", cancelledReservation.getStatus());

        final List<RoomReservation> result =
                this.reservationRemoteService.getRoomReservations(UNIQUE_ID, null);

        Assert.assertTrue(result.isEmpty());

    }

    /**
     * Test ReservationRemoteService.disconnectRoomReservation().
     */
    public void testDisconnectRoomReservation() {
        createReservation(UNIQUE_ID);

        final List<RoomReservation> reservations =
                this.reservationRemoteService.getRoomReservations(UNIQUE_ID, null);

        Assert.assertEquals(1, reservations.size());
        RoomReservation roomReservation = reservations.get(0);
        final Integer reserveId = roomReservation.getReserveId();
        Assert.assertEquals(Constants.TIMEZONE_UTC, roomReservation.getTimeZone());
        final Date startDateTime = roomReservation.getStartDateTime();
        final Date endDateTime = roomReservation.getEndDateTime();
        final Date localStartDateTime =
                roomReservation.getRoomAllocations().get(0).getStartDateTime();
        final Date localEndDateTime = roomReservation.getRoomAllocations().get(0).getEndDateTime();

        this.reservationRemoteService.disconnectRoomReservation(roomReservation);

        final List<RoomReservation> result =
                this.reservationRemoteService.getRoomReservations(UNIQUE_ID, null);

        Assert.assertTrue(result.isEmpty());

        roomReservation = this.reservationRemoteService.getRoomReservationById(reserveId);
        Assert.assertNull(roomReservation.getUniqueId());

        // Verify that the timing has not changed (KB 3037586).
        Assert.assertEquals(Constants.TIMEZONE_UTC, roomReservation.getTimeZone());
        Assert.assertEquals(startDateTime, roomReservation.getStartDateTime());
        Assert.assertEquals(endDateTime, roomReservation.getEndDateTime());
        for (final RoomAllocation roomAllocation : roomReservation.getRoomAllocations()) {
            Assert.assertNull(roomAllocation.getTimeZone());
            Assert.assertEquals(localStartDateTime, roomAllocation.getStartDateTime());
            Assert.assertEquals(localEndDateTime, roomAllocation.getEndDateTime());
        }
    }

    /**
     * Test ReservationRemoteService.getUserLocation().
     */
    public void testGetUserLocation() {
        Assert.assertNotNull(this.reservationRemoteService.getUserLocation(EMAIL));

        String emailForTest = "abernathy@tgd.com";
        Assert.assertNotNull(this.reservationRemoteService.getUserLocation(emailForTest));

        emailForTest = "babic@tgd.com";
        Assert.assertNotNull("Employee-only email (not in afm_users) should also validate.",
            this.reservationRemoteService.getUserLocation(emailForTest));

        try {
            this.reservationRemoteService.getUserLocation(null);
            Assert.fail("Null email shouldn't validate.");
        } catch (final ReservationException exception) {
            Assert.assertTrue(exception.getPattern().contains("No email address"));
        }

        emailForTest = "doesnt.exist@tgd.com";
        try {
            this.reservationRemoteService.getUserLocation(emailForTest);
            Assert.fail("Non-employee email [" + emailForTest + "] shouldn't validate.");
        } catch (final ReservationException exception) {
            Assert.assertTrue(exception.getPattern().contains(emailForTest));
        }
    }

    /**
     * Test save room reservation.
     */
    public final void testGetRoomArrangmentDetails() {
        final RoomReservation roomReservation = createRoomReservation();
        final List<RoomArrangement> roomArrangements =
                Arrays.asList(roomReservation.getRoomAllocations().get(0).getRoomArrangement());

        final List<RoomArrangement> details =
                this.reservationRemoteService.getRoomArrangementDetails(roomArrangements);
        for (final RoomArrangement roomArrangement : details) {
            Assert.assertNotNull(roomArrangement.getName());
            Assert.assertNotNull(roomArrangement.getLocation());
        }
    }

    /**
     * Set the ReservationRemoteService to test.
     *
     * @param reservationRemoteServiceImpl the reservation remote service to set
     */
    public void setReservationRemoteServiceImpl(
            final ReservationRemoteServiceImpl reservationRemoteServiceImpl) {
        this.reservationRemoteService = reservationRemoteServiceImpl;
    }

    /**
     * Set the RoomReservationDataSource used for verifying test results.
     *
     * @param roomReservationDataSource the room reservation data source to set
     */
    public void setRoomReservationDataSource(
            final ConferenceCallReservationDataSource roomReservationDataSource) {
        this.roomReservationDataSource = roomReservationDataSource;
    }

    /**
     * Set the calendar settings object.
     *
     * @param calendarSettings the new calendar settings
     */
    public void setCalendarSettings(final ICalendarSettings calendarSettings) {
        this.calendarSettings = calendarSettings;
    }

    /**
     * Create a reservation based on the static test properties with the given unique ID.
     *
     * @param uniqueId the unique ID of the reservation to create
     */
    private void createReservation(final String uniqueId) {
        final RoomAllocation roomAllocation =
                new RoomAllocation(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);
        final RoomReservation reservation = new RoomReservation(this.timePeriod);
        reservation.addRoomAllocation(roomAllocation);
        reservation.setEmail(EMAIL);

        reservation.setUniqueId(uniqueId);
        reservation.setReservationName(RESERVATION_NAME);
        reservation.setComments(BODY_MESSAGE);
        this.reservationRemoteService.saveRoomReservation(reservation);
    }

    /**
     * Set up a list of room reservation objects for conference call.
     *
     * @return reservation objects
     */
    private List<RoomReservation> setupConfCallReservations() {
        final List<RoomReservation> reservations = Arrays.asList(new RoomReservation[2]);

        final RoomReservation reservation1 = new RoomReservation(this.timePeriod);
        reservation1.addRoomAllocation(
            new RoomAllocation(BL_ID, FL_ID, RM_ID, CONFIG_ID, ARRANGE_TYPE_ID, reservation1));
        reservation1.setTimeZone(null);
        reservation1.setUniqueId(UNIQUE_ID);
        reservation1.setEmail(EMAIL);
        reservation1.setReservationName(RESERVATION_NAME);
        reservation1.setComments(BODY_MESSAGE);
        reservations.set(0, reservation1);

        final RoomReservation reservation2 = new RoomReservation(this.timePeriod);
        reservation2.addRoomAllocation(
            new RoomAllocation(BL_ID2, "04", "004", "JFK-CONF-BIG", "CONFERENCE", reservation2));
        ReservationUtils.copyCommonConferenceProperties(reservation1, reservation2);
        reservation2.setEmail(EMAIL);
        reservations.set(1, reservation2);
        return reservations;
    }
}
