package com.archibus.app.reservation.service;

import java.util.List;

import junit.framework.Assert;
import microsoft.exchange.webservices.data.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

/**
 * Test for the RoomReservationService class.
 */
public class UpdateAppointmentSeriesTest extends RoomReservationServiceTestBase {

    /** The qualified reservation attendees field. */
    private static final String RESERVE_ATTENDEES = "reserve.attendees";

    /** The qualified reservation parent id field. */
    private static final String RESERVE_RES_PARENT = "reserve.res_parent";

    /** The Constant RESERVATION_NAME_TEST_UPDATE. */
    private static final String RESERVATION_NAME_TEST_UPDATE = "test update";

    /** The Constant TEST_MASTER_UPDATE. */
    private static final String TEST_MASTER_UPDATE = "test master update";

    /** The Constant RESERVE_RESERVATION_NAME. */
    private static final String RESERVE_RESERVATION_NAME = "reserve.reservation_name";

    /** Constant: 4. */
    private static final int FOUR = 4;

    /**
     * Test updating a recurring room reservation without exceptions, this shouldn't create any
     * exceptions in the pattern.
     */
    public void testUpdateSeriesWithoutExceptions() {
        final DataRecord reservation = createAndSaveRoomReservation(true);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertTrue(reservationId > 0);
        Assert.assertNotNull(uniqueId);

        reservation.setValue(RESERVE_RES_PARENT, reservationId);
        reservation.setValue(RESERVE_RESERVATION_NAME, RESERVATION_NAME_TEST_UPDATE);

        final DataRecord roomAllocation = createRoomAllocation();
        this.checkAfterUpdate(reservation, roomAllocation, reservationId, uniqueId);

        try {
            final List<RoomReservation> reservations =
                    this.reservationService.getByUniqueId(uniqueId, null, Constants.TIMEZONE_UTC);
            for (final RoomReservation roomReservation : reservations) {
                final Appointment appointment =
                        this.appointmentBinder.bindToOccurrence(
                            this.appointmentBinder.getInitializedService(roomReservation),
                            roomReservation, null);
                Assert.assertNotNull(appointment);
                Assert.assertEquals(AppointmentType.Occurrence, appointment.getAppointmentType());
                checkEquivalence(roomReservation, appointment);
            }
        } catch (final ServiceLocalException exception) {
            Assert.fail(exception.toString());
        }
    }

    /**
     * Test updating a recurring room reservation after cancelling one occurrence and changing
     * another to a different date.
     */
    public void testUpdateSeriesLocationWithExceptions() {
        final DataRecord reservation = createAndSaveRoomReservation(true);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertNotNull(uniqueId);
        Assert.assertTrue(reservationId > 0);

        reservation.setValue(RESERVE_RES_PARENT, reservationId);

        // apply modifications to some occurrences
        this.modifySeries(reservation, reservationId, uniqueId);

        reservation.setValue(RESERVE_ATTENDEES,
            "jason.matthews@mailinator.com;koni475@mailinator.com;yg37384@mailinator.com");
        final DataRecord roomAllocation = createRoomAllocation();
        roomAllocation.setValue(RESERVE_RM_FL_ID, "18");
        roomAllocation.setValue(RESERVE_RM_RM_ID, "109");
        roomAllocation.setValue(RESERVE_RM_CONFIG_ID, "AAA");
        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);

        verifyModifiedSeries(reservationId, uniqueId, false);
    }

    /**
     * Test updating a recurring room reservation after cancelling one occurrence and changing
     * another to a different date.
     */
    public void testUpdateSeriesAttendeesWithExceptions() {
        final DataRecord reservation = createAndSaveRoomReservation(true);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertTrue(reservationId > 0);
        Assert.assertNotNull(uniqueId);

        reservation.setValue(RESERVE_RES_PARENT, reservationId);

        // apply modifications to some occurrences
        this.modifySeries(reservation, reservationId, uniqueId);

        // this will update the attendees of the master and apply a full update to the exception
        reservation.setValue(RESERVE_ATTENDEES,
            "jason.matthews@mailinator.com;koni485@mailinator.com;yg373@mailinator.com");
        final DataRecord roomAllocation = createRoomAllocation();
        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);

        verifyModifiedSeries(reservationId, uniqueId, false);

        // changing only the attendees the second time
        reservation.setValue(RESERVE_ATTENDEES,
            "joan.sling47@mailinator.com;tony.park45@mailinator.com");
        this.roomReservationService.saveRoomReservation(reservation, roomAllocation, null, null);
        verifyModifiedSeries(reservationId, uniqueId, false);
    }

    /**
     * Test updating a recurring room reservation after cancelling one occurrence and changing
     * another to a different date.
     */
    public void testUpdateSeriesSubjectWithExceptions() {
        final DataRecord reservation = createAndSaveRoomReservation(true);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertTrue(reservationId > 0);
        Assert.assertNotNull(uniqueId);
        reservation.setValue(RESERVE_RES_PARENT, reservationId);

        // apply an initial update of location and time to the full series
        DataRecord roomAllocation = createRoomAllocation();
        this.checkAfterUpdate(reservation, roomAllocation, reservationId, uniqueId);

        // apply modifications to some occurrences, not changing location and time
        this.modifySeries(reservation, reservationId, uniqueId);

        /*
         * This will update the subject and body of the master and exception, but since the
         * exception is already in the same room and time frame as the series, only a limited update
         * is required.
         */
        reservation.setValue(RESERVE_RESERVATION_NAME, TEST_MASTER_UPDATE);
        reservation.setValue("reserve.comments", "modified comments field contains some text");
        roomAllocation = createRoomAllocation();
        this.checkAfterUpdate(reservation, roomAllocation, reservationId, uniqueId);

        verifyModifiedSeries(reservationId, uniqueId, false);
    }

    /**
     * Test updating a recurring room reservation after cancelling one occurrence and changing
     * another to a different date.
     */
    public void testUpdateSeriesTimeWithExceptions() {
        final DataRecord reservation = createAndSaveRoomReservation(true);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);
        Assert.assertTrue(reservationId > 0);
        Assert.assertNotNull(uniqueId);
        reservation.setValue(RESERVE_RES_PARENT, reservationId);

        // apply modifications to some occurrences
        this.modifySeries(reservation, reservationId, uniqueId);

        /*
         * Update location and time of the full series. The series already has an exception so this
         * will result in all occurrences becoming exceptions.
         */
        final DataRecord roomAllocation = createRoomAllocation();
        this.checkAfterUpdate(reservation, roomAllocation, reservationId, uniqueId);

        verifyModifiedSeries(reservationId, uniqueId, true);
    }

    /**
     * Add some modifications to the recurring series: cancel an occurrence and change the time and
     * location for another occurrence.
     *
     * @param reservation the reservation data record
     * @param reservationId the reservation id of the first occurrence (i.e. the parent id)
     * @param uniqueId the unique id of the series
     */
    private void modifySeries(final DataRecord reservation, final int reservationId,
            final String uniqueId) {
        final List<RoomReservation> reservations =
                this.reservationDataSource
                    .getByParentId(reservationId, this.startDate, null, false);

        // Cancel the 4th occurrence.
        final int otherReservationId = reservations.get(FOUR - 1).getReserveId();
        this.roomReservationService.cancelRoomReservation(otherReservationId, "cancel");
        Assert.assertEquals(Constants.STATUS_CANCELLED,
            this.reservationDataSource.get(otherReservationId).getStatus());

        // Modify the second occurrence
        final RoomReservation secondRes = reservations.get(1);
        reservation.setValue(RESERVE_RES_ID, secondRes.getReserveId());
        reservation.setValue(RESERVE_RESERVATION_NAME, RESERVATION_NAME_TEST_UPDATE);
        reservation.setValue(RESERVE_DATE_START, secondRes.getStartDate());
        reservation.setValue(RESERVE_DATE_END, secondRes.getEndDate());
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, secondRes.getOccurrenceIndex());
        final DataRecord roomAllocation = createRoomAllocation();
        roomAllocation.setValue(RESERVE_RM_RM_ID, "107");
        roomAllocation.setValue(RESERVE_RM_CONFIG_ID, "CONF-A1");
        roomAllocation.setValue(RESERVE_RM_RM_ARRANGE_TYPE_ID, "CONFERENCE");
        this.checkAfterUpdate(reservation, roomAllocation, secondRes.getReserveId(), uniqueId);

        // Revert changes to the reservation data record.
        reservation.setValue(RESERVE_RES_ID, reservationId);
        reservation.setValue(RESERVE_RESERVATION_NAME, TEST_MASTER_UPDATE);
        reservation.setValue(RESERVE_DATE_START, this.startDate);
        reservation.setValue(RESERVE_DATE_END, this.endDate);
        reservation.setValue(RESERVE_OCCURRENCE_INDEX, 1);
        reservation.setValue(RESERVE_TIME_START, this.startTime);
        reservation.setValue(RESERVE_TIME_END, this.endTime);
    }

    /**
     * Check that the recurring meeting series still has one modified occurrence, one cancelled
     * occurrence and all occurrences correspond to their matching reservation.
     *
     * @param reservationId the parent reservation id
     * @param uniqueId the unique id of the series in Exchange
     * @param allExceptions indicates whether all occurrences should be exceptions
     */
    private void verifyModifiedSeries(final int reservationId, final String uniqueId,
            final boolean allExceptions) {
        // Check that the series still has only one modified occurrence but all updates have been
        // applied.
        try {
            final List<RoomReservation> reservations =
                    this.reservationService.getByUniqueId(uniqueId, null, Constants.TIMEZONE_UTC);
            final Appointment master =
                    this.appointmentBinder.bindToAppointment(this.email, uniqueId);
            Assert.assertEquals(1, master.getDeletedOccurrences().getCount());
            if (allExceptions) {
                Assert
                    .assertEquals(reservations.size(), master.getModifiedOccurrences().getCount());
            } else {
                Assert.assertEquals(1, master.getModifiedOccurrences().getCount());
            }
            for (final RoomReservation roomReservation : reservations) {
                Assert.assertEquals(Integer.valueOf(reservationId), roomReservation.getParentId());
                final Appointment appointment =
                        this.appointmentBinder
                            .bindToOccurrence(this.serviceHelper.initializeService(this.email),
                                roomReservation, null);
                Assert.assertNotNull(appointment);

                // only the second occurrence was modified
                if (roomReservation.getOccurrenceIndex() == 2 || allExceptions) {
                    Assert
                        .assertEquals(AppointmentType.Exception, appointment.getAppointmentType());
                } else {
                    Assert.assertEquals(AppointmentType.Occurrence,
                        appointment.getAppointmentType());
                }
                checkEquivalence(roomReservation, appointment);
            }
        } catch (final ServiceLocalException exception) {
            throw new ExceptionBase(exception.toString(), exception);
        }
    }

}
