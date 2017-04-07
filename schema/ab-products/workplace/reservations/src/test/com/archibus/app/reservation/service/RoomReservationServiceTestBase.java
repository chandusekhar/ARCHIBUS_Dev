package com.archibus.app.reservation.service;

import java.sql.Time;
import java.util.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

import com.archibus.app.reservation.dao.datasource.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.exchange.service.*;
import com.archibus.app.reservation.util.ReservationUtils;
import com.archibus.datasource.data.*;

/**
 * The Class RoomReservationServiceTestBase.
 * <p>
 * Suppress warning "PMD.TestClassWithoutTestCases".
 * <p>
 * Justification: this is a base class for other tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class RoomReservationServiceTestBase extends AbstractReservationServiceTestBase {

    /** The Constant RESERVE_OUTLOOK_UNIQUE_ID. */
    protected static final String RESERVE_OUTLOOK_UNIQUE_ID = "reserve.outlook_unique_id";

    /** The Constant RESERVE_RES_ID. */
    protected static final String RESERVE_RES_ID = "reserve.res_id";

    /** The Constant RESERVE_RES_PARENT. */
    protected static final String RESERVE_RES_PARENT = "reserve.res_parent";

    /** The Constant RESERVE_TIME_END. */
    protected static final String RESERVE_TIME_END = "reserve.time_end";

    /** The Constant RESERVE_TIME_START. */
    protected static final String RESERVE_TIME_START = "reserve.time_start";

    /** The Constant RESERVE_DATE_END. */
    protected static final String RESERVE_DATE_END = "reserve.date_end";

    /** The Constant RESERVE_DATE_START. */
    protected static final String RESERVE_DATE_START = "reserve.date_start";

    /** Room allocation primary key qualified field name. */
    protected static final String RESERVE_RM_RMRES_ID = "reserve_rm.rmres_id";

    /** Arrange type field. */
    protected static final String RESERVE_RM_RM_ARRANGE_TYPE_ID = "reserve_rm.rm_arrange_type_id";

    /** Config ID field. */
    protected static final String RESERVE_RM_CONFIG_ID = "reserve_rm.config_id";

    /** Room ID field. */
    protected static final String RESERVE_RM_RM_ID = "reserve_rm.rm_id";

    /** Floor ID field. */
    protected static final String RESERVE_RM_FL_ID = "reserve_rm.fl_id";

    /** Conference arrangement type. */
    protected static final String CONFERENCE = "CONFERENCE";

    /** Qualified field name for the occurrence index. */
    protected static final String RESERVE_OCCURRENCE_INDEX = "reserve.occurrence_index";

    /** Building ID field. */
    protected static final String RESERVE_RM_BL_ID = "reserve_rm.bl_id";

    /** Time End field. */
    private static final String RESERVE_RM_TIME_END = "reserve_rm.time_end";

    /** Time Start field. */
    private static final String RESERVE_RM_TIME_START = "reserve_rm.time_start";

    /** Date Start field. */
    private static final String RESERVE_RM_DATE_START = "reserve_rm.date_start";

    /** The Constant END_TIME. */
    private static final String END_TIME = "1899-12-30 12:30:00";

    /** The Constant START_TIME. */
    private static final String START_TIME = "1899-12-30 10:00:00";

    /** The reservation handler. */
    protected RoomReservationService roomReservationService;

    /** The room reservation data source. */
    protected ConferenceCallReservationDataSource reservationDataSource;

    /** The room allocation data source. */
    protected RoomAllocationDataSource roomAllocationDataSource;

    /** The resource allocation data source. */
    protected ResourceAllocationDataSource resourceAllocationDataSource;

    /** The Exchange Appointment binder. */
    protected AppointmentBinder appointmentBinder;

    /** The Exchange service helper. */
    protected ExchangeServiceHelper serviceHelper;

    /** The space service. */
    protected ISpaceService spaceService;

    /** The reservation service. */
    protected ConferenceReservationService reservationService;

    /**
     * Check equivalence between an appointment and a reservation (regardless of recurrence).
     *
     * @param roomReservation the reservation
     * @param appointment the appointment
     * @throws ServiceLocalException when an EWS error occurs
     */
    protected void checkEquivalence(final RoomReservation roomReservation,
            final Appointment appointment) throws ServiceLocalException {
        Assert.assertEquals(roomReservation.getStartDateTime(), appointment.getStart());
        Assert.assertEquals(roomReservation.getEndDateTime(), appointment.getEnd());
        Assert.assertEquals(roomReservation.getUniqueId(), appointment.getICalUid());
        Assert.assertEquals(roomReservation.getReservationName(), appointment.getSubject());
        Assert.assertEquals(this.spaceService.getLocationString(roomReservation),
            appointment.getLocation());
    }

    /**
     * Create a reservation.
     *
     * @param recurrent true for a recurring reservation, false for a regular one
     * @return DataRecord containing the new reservation
     */
    protected DataRecord createAndSaveRoomReservation(final boolean recurrent) {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, recurrent);

        final DataRecord roomAllocation = createRoomAllocation();

        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);
        return reservation;
    }

    /**
     * Create a room allocation data record.
     *
     * @return room allocation data record
     */
    protected DataRecord createRoomAllocation() {
        final DataRecord roomAllocation = this.roomAllocationDataSource.createNewRecord();
        roomAllocation.setValue(RESERVE_RM_DATE_START, this.startDate);
        roomAllocation.setValue(RESERVE_RM_TIME_START, this.startTime);
        roomAllocation.setValue(RESERVE_RM_TIME_END, this.endTime);

        roomAllocation.setValue(RESERVE_RM_BL_ID, BL_ID);
        roomAllocation.setValue(RESERVE_RM_FL_ID, FL_ID);
        roomAllocation.setValue(RESERVE_RM_RM_ID, RM_ID);
        roomAllocation.setValue(RESERVE_RM_CONFIG_ID, CONFIG_ID);
        roomAllocation.setValue(RESERVE_RM_RM_ARRANGE_TYPE_ID, ARRANGE_TYPE_ID);
        roomAllocation.setValue(Constants.RESERVE_RM_TABLE_NAME + ".attendees_in_room", 2);
        return roomAllocation;
    }

    /**
     * Create a room allocation data record.
     *
     * @param room the room arrangement
     * @param timePeriod the time period
     * @return room allocation data record
     */
    protected DataRecord createRoomAllocation(final RoomArrangement room,
            final TimePeriod timePeriod) {
        final DataRecord roomAllocation = this.roomAllocationDataSource.createNewRecord();
        roomAllocation.setValue(RESERVE_RM_DATE_START, timePeriod.getStartDate());
        roomAllocation.setValue(RESERVE_RM_TIME_START, timePeriod.getStartTime());
        roomAllocation.setValue(RESERVE_RM_TIME_END, timePeriod.getEndTime());

        roomAllocation.setValue(RESERVE_RM_BL_ID, room.getBlId());
        roomAllocation.setValue(RESERVE_RM_FL_ID, room.getFlId());
        roomAllocation.setValue(RESERVE_RM_RM_ID, room.getRmId());
        roomAllocation.setValue(RESERVE_RM_CONFIG_ID, room.getConfigId());
        roomAllocation.setValue(RESERVE_RM_RM_ARRANGE_TYPE_ID, room.getArrangeTypeId());
        return roomAllocation;
    }

    /**
     * Sets the date and time.
     *
     * @param reservation the reservation
     * @param roomAllocation the room allocation
     * @param reservationId the reservation id
     * @param uniqueId the unique id
     */
    protected void checkAfterUpdate(final DataRecord reservation, final DataRecord roomAllocation,
        final int reservationId, final String uniqueId) {
        final Time startTime = this.createTime(START_TIME);
        final Time endTime = this.createTime(END_TIME);
        reservation.setValue(RESERVE_TIME_START, startTime);
        reservation.setValue(RESERVE_TIME_END, endTime);
        roomAllocation.setValue(RESERVE_RM_TIME_START, startTime);
        roomAllocation.setValue(RESERVE_RM_TIME_END, endTime);

        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);
        // Check that the IDs are the same.
        Assert.assertEquals(reservationId, reservation.getInt(RESERVE_RES_ID));
        Assert.assertEquals(uniqueId, reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID));
    }

    /**
     * Create a number of room allocations to mimic a conference call reservation.
     *
     * @return list of room allocations
     */
    protected DataSetList createRoomAllocations() {
        final DataRecord roomAllocation1 = createRoomAllocation();
        final DataRecord roomAllocation2 = createRoomAllocation();
        roomAllocation2.setValue(RESERVE_RM_FL_ID, "17");
        roomAllocation2.setValue(RESERVE_RM_RM_ID, "127");
        roomAllocation2.setValue(RESERVE_RM_CONFIG_ID, "CONF-BIG-A");
        roomAllocation2.setValue(RESERVE_RM_RM_ARRANGE_TYPE_ID, CONFERENCE);
        final DataRecord roomAllocation3 = createRoomAllocation();
        roomAllocation3.setValue(RESERVE_RM_FL_ID, "18");
        roomAllocation3.setValue(RESERVE_RM_RM_ID, "109");
        roomAllocation3.setValue(RESERVE_RM_CONFIG_ID, "AAA");
        roomAllocation3.setValue(RESERVE_RM_RM_ARRANGE_TYPE_ID, CONFERENCE);

        final DataSetList roomAllocations = new DataSetList();
        roomAllocations.addRecord(roomAllocation1);
        roomAllocations.addRecord(roomAllocation2);
        roomAllocations.addRecord(roomAllocation3);
        return roomAllocations;
    }

    /**
     * Gets the room reservation service.
     *
     * @return the room reservation service
     */
    public RoomReservationService getRoomReservationService() {
        return this.roomReservationService;
    }

    /**
     * Sets the room reservation service.
     *
     * @param roomReservationService the new room reservation service
     */
    public void setRoomReservationService(final RoomReservationService roomReservationService) {
        this.roomReservationService = roomReservationService;
    }

    /**
     * Gets the room reservation data source.
     *
     * @return the room reservation data source
     */
    public ConferenceCallReservationDataSource getReservationDataSource() {
        return this.reservationDataSource;
    }

    /**
     * Set the room reservation data source for this test.
     *
     * @param reservationDataSource the new room reservation data source
     */
    public void setReservationDataSource(
            final ConferenceCallReservationDataSource reservationDataSource) {
        this.reservationDataSource = reservationDataSource;
    }

    /**
     * Gets the room allocation data source.
     *
     * @return the room allocation data source
     */
    public RoomAllocationDataSource getRoomAllocationDataSource() {
        return this.roomAllocationDataSource;
    }

    /**
     * Sets the data source for room allocations for this service test.
     *
     * @param roomAllocationDataSource the room allocation data source for this service test
     */
    public void setRoomAllocationDataSource(final RoomAllocationDataSource roomAllocationDataSource) {
        this.roomAllocationDataSource = roomAllocationDataSource;
    }

    /**
     * Sets the resource allocation data source.
     *
     * @param resourceAllocationDataSource the new room allocation data source
     */
    public void setResourceAllocationDataSource(
            final ResourceAllocationDataSource resourceAllocationDataSource) {
        this.resourceAllocationDataSource = resourceAllocationDataSource;
    }

    /**
     * Sets the SpaceService for this test.
     *
     * @param spaceService the space service
     */
    public void setSpaceService(final ISpaceService spaceService) {
        this.spaceService = spaceService;
    }

    /**
     * Set the Exchange service helper.
     *
     * @param serviceHelper the new service helper
     */
    public void setServiceHelper(final ExchangeServiceHelper serviceHelper) {
        this.serviceHelper = serviceHelper;
    }

    /**
     * Sets the appointment binder used for verifying test results.
     *
     * @param appointmentBinder the new appointment binder
     */
    public void setAppointmentBinder(final AppointmentBinder appointmentBinder) {
        this.appointmentBinder = appointmentBinder;
    }

    /**
     * Sets the reservation service.
     *
     * @param reservationService the new reservation service
     */
    public void setReservationService(final ConferenceReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * Check whether the updated primary reservation is linked to a new recurring meeting as
     * expected.
     *
     * @param updatedMaster the primary reservation for the first occurrence of the new recurring
     *            meeting
     * @throws ServiceLocalException when an error occurs accessing the local copy of an appointment
     */
    protected void checkUpdatedMaster(final RoomReservation updatedMaster) throws ServiceLocalException {
        ReservationUtils.convertToTimeZone(updatedMaster, Constants.TIMEZONE_UTC);
        final Appointment appointment =
                this.appointmentBinder.bindToAppointment(updatedMaster.getEmail(),
                    updatedMaster.getUniqueId());
        Assert.assertNotNull(appointment);

        // Check that the meeting is now a new series
        Assert.assertEquals(AppointmentType.RecurringMaster, appointment.getAppointmentType());
        checkEquivalence(updatedMaster, appointment);
    }

    /**
     * Create reservations that will cause room conflicts for 2 occurrences of the recurring
     * reservation.
     *
     * @param firstConflictIndex the first index for which to generate a room conflict
     * @return list of room conflict dates
     */
    protected List<Date> createConflicts(final int firstConflictIndex) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.TUESDAY) {
            calendar.add(Calendar.DATE, 1);
        }
        final Date recurrenceStartDate = calendar.getTime();
        final List<Date> conflictDates = new ArrayList<Date>();
        for (int i = 0; i < firstConflictIndex + 2; ++i) {
            if (i >= firstConflictIndex) {
                this.startDate = calendar.getTime();
                this.endDate = this.startDate;
                conflictDates.add(this.startDate);
                createAndSaveRoomReservation(false);
            }
            calendar.add(Calendar.WEEK_OF_YEAR, 1);
        }
        this.startDate = recurrenceStartDate;
        return conflictDates;
    }

}