package com.archibus.app.reservation.service;

import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.app.reservation.util.*;
import com.archibus.utility.LocalDateTimeUtil;

import junit.framework.Assert;

/**
 * Base class fore reservation services.
 *
 * @author bv
 * @since 20.1
 *
 *        <p>
 *        Suppress warning "PMD.TestClassWithoutTestCases".
 *        <p>
 *        Justification: this is a base class for other tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class ReservationServiceTestBase extends AbstractReservationServiceTestBase {

    /** Semicolon is used as a list separator. */
    public static final String SEMICOLON = ";";

    /** test. */
    protected static final String TEST = "test";

    /** Dummy unique ID for testing. */
    protected static final String UNIQUE_ID = "12345678";

    /** Dummy reservation name. */
    protected static final String RESERVATION_NAME = "test name";

    /** confirmed. */
    protected static final String CONFIRMED = "Confirmed";

    /** regular. */
    protected static final String TYPE_REGULAR = "regular";

    /** email. */
    protected static final String AFM_EMAIL = "afm@tgd.com";

    /** The site id. */
    protected static final String SITE_ID = "MARKET";

    /** Number of days in a week. */
    protected static final int DAYS_IN_WEEK = 7;

    /** ID of the resource to allocate. */
    protected static final String RESOURCE_ID = "LCD-PROJECTOR2";

    /** Time zone of the HQ building. */
    protected static final String HQ_TIMEZONE = "America/New_York";

    /** The reservation service. */
    protected IConferenceReservationService reservationService;

    /** The reservation service. */
    protected CancelReservationService cancelReservationService;

    /** The employee service. */
    protected IEmployeeService employeeService;

    /** The space service. */
    protected ISpaceService spaceService;

    /** The time period. */
    protected TimePeriod timePeriod;

    /**
     * Set up time for a test case.
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
        this.timePeriod =
                new TimePeriod(this.startDate, this.endDate, this.startTime, this.endTime);
    }

    /**
     *
     * Create Room Reservation.
     *
     * @return Room Reservation.
     */
    protected RoomReservation createRoomReservation() {
        final String timeZone = LocalDateTimeUtil.getLocationTimeZone(null, null, null, BL_ID);

        this.timePeriod.setTimeZone(timeZone);

        final RoomReservation roomReservation = new RoomReservation(this.timePeriod, BL_ID, FL_ID,
            RM_ID, CONFIG_ID, ARRANGE_TYPE_ID);

        final Employee creator = this.employeeService.findEmployee(AFM_EMAIL);
        ReservationUtils.setCreator(roomReservation, creator, creator.getId());

        roomReservation.setReservationName(TEST);
        roomReservation.setReservationType(TYPE_REGULAR);
        roomReservation
            .setAttendees("jason@mailinator.com;martin@mailinator.com;linda@mailinator.com");

        return roomReservation;
    }

    /**
     * Make the given reservation reservation recurring, without saving it to the database. Use
     * dummy reservation id's based on the reservation id of the given reservation.
     *
     * @param reservation the reservation to make recurring
     */
    protected void addRecurrence(final RoomReservation reservation) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(reservation.getStartDate());
        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.TUESDAY) {
            calendar.add(Calendar.DATE, 1);
        }
        // use sql dates because only those are supported by freemarker
        reservation.setStartDate(createSqlDate(calendar.getTimeInMillis()));
        reservation.setEndDate(reservation.getStartDate());
        calendar.add(Calendar.MONTH, 1);
        final Date recurrenceEndDate = calendar.getTime();
        final List<com.archibus.app.reservation.domain.recurrence.DayOfTheWeek> dayOfTheWeek =
                new ArrayList<com.archibus.app.reservation.domain.recurrence.DayOfTheWeek>();
        dayOfTheWeek.add(com.archibus.app.reservation.domain.recurrence.DayOfTheWeek.Tuesday);
        final WeeklyPattern recurrence =
                new WeeklyPattern(reservation.getStartDate(), recurrenceEndDate, 1, dayOfTheWeek);

        // Add reservations for each occurrence to the main reservation object.
        final List<RoomReservation> createdReservations = new ArrayList<RoomReservation>();
        createdReservations.add(reservation);

        calendar.setTime(reservation.getStartDate());
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        int reservationId = reservation.getReserveId() + 1;
        while (!calendar.getTime().after(recurrenceEndDate)) {
            final RoomReservation reservationOccurrence =
                    new RoomReservation(reservation.getTimePeriod(),
                        reservation.getRoomAllocations().get(0).getRoomArrangement());
            reservationOccurrence.setReserveId(reservationId);
            reservationOccurrence.setStartDate(createSqlDate(calendar.getTimeInMillis()));
            reservationOccurrence.setEndDate(reservationOccurrence.getStartDate());
            reservationOccurrence.setEmail(reservation.getEmail());
            createdReservations.add(reservationOccurrence);
            calendar.add(Calendar.DATE, DAYS_IN_WEEK);
            ++reservationId;
        }
        reservation.setCreatedReservations(createdReservations);
        reservation.setRecurrence(recurrence);
    }

    /**
     * Add daily recurrence to the reservation object, without saving it to the database. Use dummy
     * reservation id's based on the reservation id of the given reservation.
     *
     * @param reservation the reservation to make recurring
     * @param count number of occurrences to add to the first one
     */
    protected void addDailyRecurrence(final RoomReservation reservation, final int count) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(reservation.getStartDate());
        calendar.add(Calendar.DATE, count);
        final Date recurrenceEndDate = calendar.getTime();

        final DailyPattern recurrence = new DailyPattern(reservation.getStartDate(), 1, count);

        // Add reservations for each occurrence to the main reservation object.
        final List<RoomReservation> createdReservations = new ArrayList<RoomReservation>();
        createdReservations.add(reservation);

        calendar.setTime(reservation.getStartDate());
        calendar.add(Calendar.DATE, 1);

        int reservationId = reservation.getReserveId() + 1;

        calendar.setTime(reservation.getStartDate());
        calendar.add(Calendar.DATE, 1);
        while (!calendar.getTime().after(recurrenceEndDate)) {
            final RoomReservation reservationOccurrence =
                    new RoomReservation(reservation.getTimePeriod(),
                        reservation.getRoomAllocations().get(0).getRoomArrangement());
            reservationOccurrence.setReserveId(reservationId);
            reservationOccurrence.setStartDate(calendar.getTime());
            reservationOccurrence.setEndDate(reservationOccurrence.getStartDate());
            createdReservations.add(reservationOccurrence);
            calendar.add(Calendar.DATE, 1);
            ++reservationId;
        }
        reservation.setCreatedReservations(createdReservations);
        reservation.setRecurrence(recurrence);
        Assert.assertEquals(count + 1, createdReservations.size());
    }

    /**
     * Add and remove attendees in the reservation.
     *
     * @param reservation the reservation to edit
     */
    public void changeAttendees(final RoomReservation reservation) {
        // Add & remove attendees.
        final List<String> emails = new ArrayList<String>();
        for (final String email : reservation.getAttendees().split(SEMICOLON)) {
            emails.add(email);
        }
        emails.remove(0);
        final StringBuffer attendees = new StringBuffer("martin.johnson@mailinator.com");
        for (final String email : emails) {
            attendees.append(';');
            attendees.append(email);
        }
        reservation.setAttendees(attendees.toString());
    }

    /**
     * Set the reservation service for this test.
     *
     * @param reservationService the new reservation service
     */
    public final void setReservationService(
            final IConferenceReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * Set the employee service for this test.
     *
     * @param employeeService the new employee service
     */
    public final void setEmployeeService(final IEmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Set the space service for this test.
     *
     * @param spaceService the new space service
     */
    public final void setSpaceService(final ISpaceService spaceService) {
        this.spaceService = spaceService;
    }

    /**
     * Set the cancel reservation service for this test.
     *
     * @param cancelReservationService the cancel reservation service
     */
    public void setCancelReservationService(
            final CancelReservationService cancelReservationService) {
        this.cancelReservationService = cancelReservationService;
    }

    /**
     * Add a resource allocation to the room reservation.
     *
     * @param roomReservation the room reservation to add a resource to
     */
    protected void addResource(final RoomReservation roomReservation) {
        final Resource resource = new Resource();
        resource.setResourceId(RESOURCE_ID);

        final ResourceAllocation resourceAllocation =
                new ResourceAllocation(resource, roomReservation, 1);

        // the resource allocation should be in a room
        resourceAllocation.setBlId(BL_ID);
        resourceAllocation.setFlId(FL_ID);
        resourceAllocation.setRmId(RM_ID);

        roomReservation.addResourceAllocation(resourceAllocation);
    }

    /**
     * Create a recurrence pattern for testing.
     *
     * @return the recurrence pattern.
     */
    protected Recurrence createRecurrence() {
        final Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DATE, DAYS_IN_WEEK);
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.FRIDAY);
        final Date startDate = TimePeriod.clearTime(calendar.getTime());
        // CHECKSTYLE:OFF Justification: magic number used for testing
        calendar.add(Calendar.DATE, 14);
        // CHECKSTYLE:ON
        final Date endDate = calendar.getTime();
        final List<DayOfTheWeek> daysOfTheWeek = new ArrayList<DayOfTheWeek>(3);
        daysOfTheWeek.add(DayOfTheWeek.Monday);
        daysOfTheWeek.add(DayOfTheWeek.Wednesday);
        daysOfTheWeek.add(DayOfTheWeek.Friday);
        final Recurrence pattern = new WeeklyPattern(startDate, endDate, 1, daysOfTheWeek);
        // CHECKSTYLE:OFF Justification: used for testing.
        pattern.setNumberOfOccurrences(7);
        // CHECKSTYLE:ON

        this.fixEndDate(pattern);
        return pattern;
    }

    /**
     * Fix the end date for a recurrence pattern used in this test.
     *
     * @param pattern the pattern to fix the end date for
     */
    protected void fixEndDate(final Recurrence pattern) {
        final List<Date> dateList = RecurrenceService.getDateList(pattern.getStartDate(),
            pattern.getEndDate(), pattern.toString());
        pattern.setEndDate(dateList.get(dateList.size() - 1));
    }

    /**
     * Create a recurrence pattern starting in the past for testing.
     *
     * @return the recurrence pattern.
     */
    protected Recurrence createRecurrenceStartingInThePast() {
        final Calendar calendar = Calendar.getInstance();
        // CHECKSTYLE:OFF Justification: magic numbers used for testing.
        calendar.add(Calendar.DATE, -2 * DAYS_IN_WEEK);
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.TUESDAY);
        final Date startDate = TimePeriod.clearTime(calendar.getTime());
        calendar.add(Calendar.DATE, 6 * DAYS_IN_WEEK);
        // CHECKSTYLE:ON
        final Date endDate = calendar.getTime();
        final List<DayOfTheWeek> daysOfTheWeek = new ArrayList<DayOfTheWeek>(2);
        daysOfTheWeek.add(DayOfTheWeek.Tuesday);
        final Recurrence pattern = new WeeklyPattern(startDate, endDate, 1, daysOfTheWeek);
        // CHECKSTYLE:OFF Justification: used for testing.
        pattern.setNumberOfOccurrences(7);
        // CHECKSTYLE:ON

        this.fixEndDate(pattern);
        return pattern;
    }

    /**
     * Create a reservation to use for recurrence testing. It is a different room with properties
     * more suitable for multiple bookings.
     *
     * @param timeZone time zone for the reservation
     * @param date the date for the reservation (in building time zone)
     * @return reservation to be used for recurrence testing.
     */
    protected RoomReservation createReservationForRecurrenceTest(final String timeZone,
            final Date date) {
        final RoomReservation roomReservation = createRoomReservation();
        final RoomAllocation allocation = roomReservation.getRoomAllocations().get(0);
        // change to a different room that allows more bookings
        allocation.setBlId("HQ");
        allocation.setFlId("17");
        allocation.setRmId("127");
        allocation.setConfigId("CONF-BIG-A");
        allocation.setArrangeTypeId("CONFERENCE");
        roomReservation.setUniqueId(UNIQUE_ID);
        roomReservation.setTimeZone(timeZone);
        roomReservation.setStartDate(date);
        roomReservation.setEndDate(date);

        if (!HQ_TIMEZONE.equals(roomReservation.getTimeZone())) {
            // The time currently in the reservation object is in building time.
            // Convert it to the requested time zone.
            final Date startDateTime =
                    TimeZoneConverter.calculateDateTime(roomReservation.getStartDateTime(),
                        TimeZoneConverter.getTimeZoneIdForBuilding(allocation.getBlId()),
                        roomReservation.getTimeZone());
            final int durationInMinutes = (int) (roomReservation.getEndDateTime().getTime()
                    - roomReservation.getStartDateTime().getTime())
                    / TimePeriod.MINUTE_MILLISECONDS;

            final TimePeriod timePeriodWithTimeZone = new TimePeriod(date,
                TimePeriod.clearDate(startDateTime), durationInMinutes, timeZone);
            roomReservation.setTimePeriod(timePeriodWithTimeZone);
        }

        return roomReservation;
    }

}
