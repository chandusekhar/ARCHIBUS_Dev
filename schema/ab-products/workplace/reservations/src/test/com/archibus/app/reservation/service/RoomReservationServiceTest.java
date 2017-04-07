package com.archibus.app.reservation.service;

import java.util.*;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

import org.json.JSONObject;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

/**
 * Test for the RoomReservationService class.
 */
public class RoomReservationServiceTest extends RoomReservationServiceTestBase {

    /** The Constant RESERVATION_NAME_TEST_UPDATE. */
    private static final String RESERVATION_NAME_TEST_UPDATE = "test update";

    /** The Constant RESERVE_RESERVATION_NAME. */
    private static final String RESERVE_RESERVATION_NAME = "reserve.reservation_name";

    /** The Constant CANCEL_MESSAGE. */
    private static final String CANCEL_MESSAGE = "Cancel message";

    /** Constant: 4. */
    private static final int FOUR = 4;

    /**
     * Test save new room reservation.
     */
    public void testSaveNewRoomReservation() {
        final DataRecord record = createAndSaveRoomReservation(false);

        Assert.assertTrue(record.getInt(RESERVE_RES_ID) > 0);
        Assert.assertNotNull(record.getString(RESERVE_OUTLOOK_UNIQUE_ID));
    }

    /**
     * Test copy room reservation.
     */
    public void testCopyRoomReservation() {
        final DataRecord record = createAndSaveRoomReservation(false);
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        calendar.add(Calendar.DATE, 1);
        final Integer reservationCopyId =
                this.roomReservationService.copyRoomReservation(record.getInt(RESERVE_RES_ID),
                    RESERVATION_NAME_TEST_UPDATE, calendar.getTime());
        Assert.assertNotNull(reservationCopyId);
        Assert.assertNotSame(record.getInt(RESERVE_RES_ID), reservationCopyId);

        final RoomReservation originalReservation =
                this.reservationDataSource.get(record.getInt(RESERVE_RES_ID));
        final RoomReservation copiedReservation = this.reservationDataSource.get(reservationCopyId);
        final RoomAllocation originalAllocation = originalReservation.getRoomAllocations().get(0);
        final RoomAllocation copiedAllocation = copiedReservation.getRoomAllocations().get(0);
        Assert.assertEquals(originalAllocation.getAttendeesInRoom(),
            copiedAllocation.getAttendeesInRoom());
        Assert.assertEquals(originalAllocation.getRoomArrangement(),
            copiedAllocation.getRoomArrangement());
        Assert.assertEquals(calendar.getTime(), copiedReservation.getStartDate());
    }

    /**
     * Test save new room reservation.
     */
    public void testSaveNewRecurringRoomReservation() {
        final DataRecord record = createAndSaveRoomReservation(true);

        Assert.assertTrue(record.getInt(RESERVE_RES_ID) > 0);
        final String iCalUid = record.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(iCalUid);

        try {
            final List<RoomReservation> reservations =
                    this.reservationService.getByUniqueId(iCalUid, null, Constants.TIMEZONE_UTC);
            for (final RoomReservation roomReservation : reservations) {
                final Appointment appointment =
                        this.appointmentBinder
                            .bindToOccurrence(this.serviceHelper.initializeService(this.email),
                                roomReservation, null);
                Assert.assertNotNull(appointment);
                Assert.assertEquals(AppointmentType.Occurrence, appointment.getAppointmentType());
                checkEquivalence(roomReservation, appointment);
            }
        } catch (final ServiceLocalException exception) {
            throw new ExceptionBase(exception.toString(), exception);
        }
    }

    /**
     * Test updating a room reservation.
     */
    public void testUpdateRoomReservation() {
        final DataRecord reservation = createAndSaveRoomReservation(false);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertTrue(reservationId > 0);
        Assert.assertNotNull(uniqueId);

        // Modify some properties.
        reservation.setValue(RESERVE_RESERVATION_NAME, RESERVATION_NAME_TEST_UPDATE);

        final DataRecord roomAllocation = createRoomAllocation();
        this.checkAfterUpdate(reservation, roomAllocation, reservationId, uniqueId);
    }

    /**
     * Test updating a room reservation.
     */
    public void testUpdateReservationOccurrence() {
        final DataRecord reservation = createAndSaveRoomReservation(true);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        reservation.setValue(RESERVE_RES_PARENT, reservationId);
        Assert.assertTrue(reservationId > 0);
        Assert.assertNotNull(uniqueId);

        // Modify some properties.
        reservation.setValue(RESERVE_RESERVATION_NAME, RESERVATION_NAME_TEST_UPDATE);
        // Set the end date to the same date as the start date, so only that occurrence is modified.
        reservation.setValue(RESERVE_DATE_END, reservation.getValue(RESERVE_DATE_START));
        final DataRecord roomAllocation = createRoomAllocation();
        this.checkAfterUpdate(reservation, roomAllocation, reservationId, uniqueId);

        // Check that the occurrence was updated and the others left unmodified.
        try {
            final List<RoomReservation> reservations =
                    this.reservationService.getByUniqueId(uniqueId, null, Constants.TIMEZONE_UTC);
            for (final RoomReservation roomReservation : reservations) {
                Assert.assertEquals(Integer.valueOf(reservationId), roomReservation.getParentId());
                final Appointment appointment =
                        this.appointmentBinder
                            .bindToOccurrence(this.serviceHelper.initializeService(this.email),
                                roomReservation, null);
                Assert.assertNotNull(appointment);

                // The modified occurrences are now of type Exception, the others are of type
                // Occurrence.
                // The reservations with an end time not rounded to the hour are the modified ones.
                final Calendar calendar = Calendar.getInstance();
                calendar.setTime(roomReservation.getEndTime());
                if (calendar.get(Calendar.MINUTE) == 0) {
                    Assert.assertEquals(AppointmentType.Occurrence,
                        appointment.getAppointmentType());
                } else {
                    Assert
                        .assertEquals(AppointmentType.Exception, appointment.getAppointmentType());
                }
                checkEquivalence(roomReservation, appointment);
            }
        } catch (final ServiceLocalException exception) {
            throw new ExceptionBase(exception.toString(), exception);
        }
    }

    /**
     * Test canceling a room reservation.
     */
    public void testCancelRoomReservation() {
        final DataRecord reservation = createAndSaveRoomReservation(false);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertTrue(reservationId > 0);
        Assert.assertNotNull(uniqueId);

        Assert.assertNotNull(this.appointmentBinder.bindToAppointment(this.email, uniqueId));

        this.roomReservationService.cancelRoomReservation(reservationId, CANCEL_MESSAGE);

        Assert.assertNull(this.reservationService.getActiveReservation(reservationId, null));
        Assert.assertNull(this.appointmentBinder.bindToAppointment(this.email, uniqueId));
    }

    /**
     * Test canceling a single reservation that is part of a recurring reservation.
     */
    public void testCancelSingleOcurrence() {
        try {
            // Create a simple recurring appointment.
            final DataRecord reservation = createAndSaveRoomReservation(true);
            final int reservationId = reservation.getInt(RESERVE_RES_ID);
            final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
            Assert.assertTrue(reservationId > 0);
            Assert.assertNotNull(uniqueId);

            final List<RoomReservation> reservations =
                    this.reservationDataSource.getByParentId(reservationId, this.startDate, null,
                        false);

            // Cancel a single occurrence: the first one
            this.roomReservationService.cancelRoomReservation(reservationId, CANCEL_MESSAGE);
            Assert.assertEquals(Constants.STATUS_CANCELLED,
                this.reservationDataSource.get(reservationId).getStatus());
            Appointment appointment =
                    this.appointmentBinder.bindToAppointment(this.email, uniqueId);
            Assert.assertNotNull(appointment);
            Assert.assertEquals(AppointmentType.RecurringMaster, appointment.getAppointmentType());
            Assert.assertEquals(1, appointment.getDeletedOccurrences().getCount());
            Assert.assertEquals(
                this.startDate,
                TimePeriod.clearTime(appointment.getDeletedOccurrences().getPropertyAtIndex(0)
                    .getOriginalStart()));

            // Cancel a single occurrence: the fourth one.
            final int otherReservationId = reservations.get(FOUR - 1).getReserveId();
            this.roomReservationService.cancelRoomReservation(otherReservationId, "cancel");
            Assert.assertEquals(Constants.STATUS_CANCELLED,
                this.reservationDataSource.get(otherReservationId).getStatus());
            appointment = this.appointmentBinder.bindToAppointment(this.email, uniqueId);
            Assert.assertNotNull(appointment);
            Assert.assertEquals(AppointmentType.RecurringMaster, appointment.getAppointmentType());
            Assert.assertEquals(2, appointment.getDeletedOccurrences().getCount());
            try {
                Appointment.bindToOccurrence(appointment.getService(), appointment.getId(), FOUR);
                Assert.fail("Should not be able to bind to a cancelled occurrence.");
            } catch (final ServiceResponseException e) {
                // OK if this specific error code is given, otherwise rethrow.
                if (!ServiceError.ErrorCalendarOccurrenceIsDeletedFromRecurrence.equals(e
                    .getResponse().getErrorCode())) {
                    throw e;
                }
            }

            // Cancel the same occurrence again.
            this.roomReservationService.cancelRoomReservation(otherReservationId, CANCEL_MESSAGE);
            // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: third-party API method
            // throws a checked Exception.
        } catch (final Exception exception) {
            // CHECKSTYLE:ON
            Assert.fail(exception.toString());
        }
    }

    /**
     * Test canceling a recurring reservation as a whole.
     */
    public void testCancelRecurringRoomReservation() {
        // Create a simple recurring reservation.
        final DataRecord reservation = createAndSaveRoomReservation(true);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertTrue(reservationId > 0);
        Assert.assertNotNull(uniqueId);

        // Cancel the entire series.
        this.roomReservationService.cancelRecurringRoomReservation(reservationId, CANCEL_MESSAGE);

        Assert.assertNull(this.reservationService.getActiveReservation(reservationId, null));
        Assert.assertNull(this.appointmentBinder.bindToAppointment(this.email, uniqueId));
    }

    /**
     * Test getting attendees response status.
     */
    public void testGetAttendeesResponseStatus() {
        final DataRecord reservation = createAndSaveRoomReservation(false);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<JSONObject> responses =
                this.roomReservationService.getAttendeesResponseStatus(reservationId);
        Assert.assertFalse(responses.isEmpty());
    }

}
