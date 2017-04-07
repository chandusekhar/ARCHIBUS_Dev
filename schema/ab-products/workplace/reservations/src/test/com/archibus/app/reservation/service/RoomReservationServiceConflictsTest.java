package com.archibus.app.reservation.service;

import java.util.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

/**
 * Test for the RoomReservationService class.
 */
public class RoomReservationServiceConflictsTest extends RoomReservationServiceTestBase {

    /** Email address of an attendee on the connected Exchange server. */
    private static final String ATTENDEE_EMAIL = "unittest1@procos1.onmicrosoft.com";

    /** The Constant RESERVATION_NAME_TEST_UPDATE. */
    private static final String RESERVATION_NAME_TEST_UPDATE = "test update";

    /** The Constant CANCEL_MESSAGE. */
    private static final String CANCEL_MESSAGE = "Cancel message";

    /**
     * Test save new recurring room reservation with conflicts on 2nd and 3rd occurrence.
     */
    public void testSaveRecurringRoomReservationWithConflicts() {
        final List<RoomReservation> conflictedReservations = this.saveWithConflicts(1);
        Assert.assertFalse(conflictedReservations.isEmpty());
    }

    /**
     * Test save new recurring room reservation with conflicts on 2 occurrences.
     *
     * @param firstConflictIndex index of the first conflict to create
     * @return list of conflicted reservations
     */
    private List<RoomReservation> saveWithConflicts(final int firstConflictIndex) {
        final List<Date> conflictDates = createConflicts(firstConflictIndex);
        final DataRecord record = createAndSaveRoomReservation(true);

        Assert.assertTrue(record.getInt(RESERVE_RES_ID) > 0);
        final String iCalUid = record.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(iCalUid);
        final List<RoomReservation> conflictedReservations = new ArrayList<RoomReservation>();

        try {
            final List<RoomReservation> reservations =
                    this.reservationService.getByUniqueId(iCalUid, null, Constants.TIMEZONE_UTC);
            
            final Appointment master = this.appointmentBinder.bindToAppointment(this.email, iCalUid);
            Assert.assertEquals(
                this.spaceService.getLocationString(reservations.get(firstConflictIndex + 2)),
                master.getLocation());
            
            for (final RoomReservation roomReservation : reservations) {
                if (conflictDates.contains(roomReservation.getStartDate())) {
                    Assert
                        .assertEquals(Constants.STATUS_ROOM_CONFLICT, roomReservation.getStatus());
                    Assert.assertTrue(roomReservation.getRoomAllocations().isEmpty());
                    Assert.assertEquals(BL_ID, roomReservation.determineBuildingId());
                    conflictedReservations.add(roomReservation);
                }
                final Appointment appointment =
                        this.appointmentBinder.bindToOccurrence(master.getService(),
                            roomReservation, master);
                Assert.assertNotNull(appointment);
                checkEquivalence(roomReservation, appointment);
            }
        } catch (final ServiceLocalException exception) {
            throw new ExceptionBase(exception.toString(), exception);
        }
        return conflictedReservations;
    }

    /**
     * Test save new recurring room reservation with conflicts.
     */
    public void testSaveConflictOnFirstOccurrence() {
        final List<RoomReservation> conflictedReservations = this.saveWithConflicts(0);
        Assert.assertFalse(conflictedReservations.isEmpty());
    }

    /**
     * Test resolving a conflicted room reservation.
     */
    public void testResolveConflict() {
        final List<RoomReservation> conflictedReservations = this.saveWithConflicts(1);
        RoomReservation reservation = conflictedReservations.get(0);

        // Find an available room for this reservation.
        final RoomAllocation roomAllocation = new RoomAllocation(BL_ID, null, null, null, null);
        reservation.addRoomAllocation(roomAllocation);
        final List<RoomArrangement> availableRooms =
                this.reservationService.findAvailableRooms(reservation, null, false, null, false,
                    null);
        Assert.assertFalse(availableRooms.isEmpty());

        final DataRecord reserveRecord =
                this.reservationDataSource.getRecord("reserve.res_id = "
                        + reservation.getReserveId());
        // Modify some properties.
        reservation.setReservationName(RESERVATION_NAME_TEST_UPDATE);

        final DataRecord roomAllocationRecord =
                createRoomAllocation(availableRooms.get(0), reservation.getTimePeriod());
        this.checkAfterUpdate(reserveRecord, roomAllocationRecord, reservation.getReserveId(),
            reservation.getUniqueId());

        reservation =
                this.reservationService.getActiveReservation(reservation.getReserveId(),
                    Constants.TIMEZONE_UTC);
        final Appointment appointment =
                this.appointmentBinder.bindToOccurrence(
                    this.serviceHelper.initializeService(this.email), reservation, null);
        try {
            this.checkEquivalence(reservation, appointment);
        } catch (final ServiceLocalException exception) {
            Assert.fail(exception.toString());
        }
    }

    /**
     * Test updating a conflicted room reservation without attaching a room. This doesn't update the
     * appointment, it can only be triggered via Exchange Listener or Outlook Plugin.
     */
    public void testUpdateConflictedOccurrence() {
        final List<RoomReservation> conflictedReservations = this.saveWithConflicts(1);
        final RoomReservation reservation = conflictedReservations.get(0);

        reservation.setReservationName(RESERVATION_NAME_TEST_UPDATE);
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(reservation.getStartDateTime());
        calendar.add(Calendar.DATE, 1);
        calendar.add(Calendar.HOUR_OF_DAY, 2);
        final Date startDateTime = calendar.getTime();
        reservation.setStartDateTime(startDateTime);
        calendar.add(Calendar.HOUR_OF_DAY, 1);
        final Date endDateTime = calendar.getTime();
        reservation.setEndDateTime(endDateTime);

        this.reservationService.saveReservation(reservation);
        final RoomReservation updatedReservation =
                this.reservationService.getActiveReservation(reservation.getReserveId(),
                    Constants.TIMEZONE_UTC);
        Assert.assertEquals(startDateTime, updatedReservation.getStartDateTime());
        Assert.assertEquals(endDateTime, updatedReservation.getEndDateTime());
        Assert.assertEquals(RESERVATION_NAME_TEST_UPDATE, updatedReservation.getReservationName());
    }

    /**
     * Test cancel a conflicted occurrence.
     */
    public void testCancelConflictedOccurrence() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.TUESDAY) {
            calendar.add(Calendar.DATE, 1);
        }
        final Date recurrenceStartDate = calendar.getTime();
        final List<Date> conflictDates = new ArrayList<Date>();
        for (int i = 0; i < 2; ++i) {
            calendar.add(Calendar.WEEK_OF_YEAR, 1);
            this.startDate = calendar.getTime();
            this.endDate = this.startDate;
            conflictDates.add(this.startDate);
            createAndSaveRoomReservation(false);
        }
        this.startDate = recurrenceStartDate;
        final DataRecord record = createAndSaveRoomReservation(true);

        Assert.assertTrue(record.getInt(RESERVE_RES_ID) > 0);
        final String iCalUid = record.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(iCalUid);

        final List<RoomReservation> reservations =
                this.reservationService.getByUniqueId(iCalUid, null, Constants.TIMEZONE_UTC);
        for (final RoomReservation roomReservation : reservations) {
            if (conflictDates.contains(roomReservation.getStartDate())) {
                Appointment appointment =
                        this.appointmentBinder
                            .bindToOccurrence(this.serviceHelper.initializeService(this.email),
                                roomReservation, null);
                Assert.assertNotNull(appointment);
                this.roomReservationService.cancelRoomReservation(roomReservation.getReserveId(),
                    "cancel conflict");
                appointment =
                        this.appointmentBinder
                            .bindToOccurrence(this.serviceHelper.initializeService(this.email),
                                roomReservation, null);
                Assert.assertNull(appointment);
                final RoomReservation storedReservation =
                        this.reservationDataSource.get(roomReservation.getReserveId());
                Assert.assertEquals(Constants.STATUS_CANCELLED, storedReservation.getStatus());
                break;
            }
        }
    }

    /**
     * Test canceling a recurring reservation as a whole.
     */
    public void testCancelSeriesWithConflicts() {
        // Create a simple recurring reservation with conflicts.
        final List<RoomReservation> conflictedReservations = this.saveWithConflicts(1);
        final Integer parentId = conflictedReservations.get(0).getParentId();
        final String uniqueId = conflictedReservations.get(0).getUniqueId();

        // Cancel the entire series.
        this.roomReservationService.cancelRecurringRoomReservation(parentId, CANCEL_MESSAGE);

        Assert.assertNull(this.appointmentBinder.bindToAppointment(this.email, uniqueId));
        Assert.assertTrue(this.reservationService.getByUniqueId(uniqueId, null, null).isEmpty());
        for (final RoomReservation reservation : conflictedReservations) {
            Assert.assertEquals(Constants.STATUS_CANCELLED,
                this.reservationDataSource.get(reservation.getReserveId()).getStatus());
        }
    }

    /**
     * Verify that the location is not removed from the attendees' calendars, unless the
     * exchange.organizerAccount is the meeting organizer.
     */
    public void testConflictLocationForAttendees() {
        final List<Date> conflictDates = createConflicts(1);
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        reservation.setValue(Constants.RESERVE_TABLE_NAME + ".attendees", ATTENDEE_EMAIL);
        final DataRecord roomAllocation = createRoomAllocation();

        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);
        final int parentId =
                reservation.getInt(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_ID);

        final List<RoomReservation> conflicts =
                this.reservationDataSource.getByParentId(parentId, conflictDates.get(0),
                    conflictDates.get(1), true);

        // the attendee's calendar should have the original location
        final RoomReservation parentReservation =
                this.reservationDataSource.getActiveReservation(parentId);
        final String originalLocation =
                this.spaceService.getLocationString(parentReservation.getRoomAllocations().get(0)
                    .getRoomArrangement());

        // initialize an Exchange service for the organizer's and attendee's calendars
        final ExchangeService organizerService =
                this.appointmentBinder.getInitializedService(this.email);
        final ExchangeService attendeeService =
                this.appointmentBinder.getInitializedService(ATTENDEE_EMAIL);

        for (final RoomReservation conflict : conflicts) {
            try {
                final Appointment organizerOccurrence =
                        this.appointmentBinder.bindToOccurrence(organizerService, conflict, null);
                Assert.assertNotNull(organizerOccurrence);
                Assert.assertEquals(this.spaceService.getLocationString(conflict),
                    organizerOccurrence.getLocation());

                final Appointment attendeeOccurrence =
                        this.appointmentBinder.bindToOccurrence(attendeeService, conflict, null);
                Assert.assertNotNull(attendeeOccurrence);
                Assert.assertEquals(originalLocation, attendeeOccurrence.getLocation());
            } catch (final ServiceLocalException exception) {
                Assert.fail("Error verifying location - " + exception.getMessage());
            }
        }
    }
}
