package com.archibus.app.reservation.service;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.app.reservation.exchange.service.AppointmentHelper;
import com.archibus.datasource.data.*;

/**
 * Base class for testing the conference calls reservation WFR.
 *
 * @author Yorik Gerlo
 * @since 22.1
 *        <p>
 *        Suppress warning "PMD.TestClassWithoutTestCases".
 *        <p>
 *        Justification: this is a base class for other service tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class ConferenceCallReservationServiceTestBase extends RoomReservationServiceTestBase {

    /** HQ time zone id. */
    protected static final String TIME_ZONE_ID = "America/New_York";

    /** Alternative time zone id, 2 hours to the west of HQ. */
    protected static final String ALTERNATIVE_TIME_ZONE_ID = "America/Denver";

    /** The conference reservation handler. */
    protected ConferenceCallReservationService conferenceCallReservationService;

    /** The appointment helper. */
    protected AppointmentHelper appointmentHelper;

    /**
     * Actual test code for editing a single room in a single conference call.
     *
     * @param reservation the reservation data record used to create the conference call
     * @param roomAllocations the room allocations used to create the conference call
     * @param originalReservation the reservation to edit
     * @return the modified reservations in the conference call
     */
    protected List<RoomReservation> editSingleRoom(final DataRecord reservation,
            final DataSetList roomAllocations, final RoomReservation originalReservation) {
        final DataRecord roomAllocation =
                getModifiedRoomAllocation(roomAllocations, originalReservation);
        // set the reservation id to the second reservation in the conference call and set the
        // conference id
        reservation.setValue(RESERVE_RES_ID, originalReservation.getReserveId());
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT
                + Constants.RES_CONFERENCE, originalReservation.getConferenceId());
        reservation.setValue(RESERVE_DATE_START, originalReservation.getStartDate());
        reservation.setValue(RESERVE_DATE_END, originalReservation.getEndDate());

        this.conferenceCallReservationService.editSingleRoomReservation(reservation,
            roomAllocation, null, null);

        final RoomReservation primaryReservation =
                this.reservationDataSource.get(originalReservation.getConferenceId());
        final List<RoomReservation> reservations =
                this.reservationDataSource.getByConferenceId(originalReservation.getConferenceId(),
                    false);
        for (final RoomReservation confCallReservation : reservations) {
            Assert.assertEquals(originalReservation.getConferenceId(),
                confCallReservation.getConferenceId());
            Assert.assertFalse(originalReservation.getComments().equals(
                confCallReservation.getComments()));
            Assert
                .assertEquals(primaryReservation.getComments(), confCallReservation.getComments());
        }
        return reservations;
    }

    /**
     * Get a modified room allocation based on the list of rooms and linked to the given
     * reservation.
     *
     * @param roomAllocations the room allocations used to create the conference call
     * @param originalReservation the reservation being used to modify a single location
     * @return the modified room allocation
     */
    protected DataRecord getModifiedRoomAllocation(final DataSetList roomAllocations,
            final RoomReservation originalReservation) {
        final DataRecord roomAllocation = roomAllocations.getRecord(1);
        setToDifferentRoom(roomAllocation);
        roomAllocation.setValue(Constants.RESERVE_RM_TABLE_NAME + Constants.DOT + Constants.RES_ID,
            originalReservation.getReserveId());
        if (!originalReservation.getRoomAllocations().isEmpty()) {
            roomAllocation.setValue(Constants.RESERVE_RM_TABLE_NAME + Constants.DOT
                    + Constants.RMRES_ID_FIELD_NAME, originalReservation.getRoomAllocations().get(0)
                .getId());
        }
        return roomAllocation;
    }
    
    /**
     * Actual test code for editing a single location in a recurring conference call.
     *
     * @param reservation the reservation record initially used to create the conference call
     * @param roomAllocations the room allocations used to create the conference call
     * @param originalReservation the specific reservation to modify along with all later
     *            occurrences
     */
    protected void editSingleRoomRecurring(final DataRecord reservation,
            final DataSetList roomAllocations, final RoomReservation originalReservation) {
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            originalReservation.getParentId());

        final DataRecord roomAllocation =
                getModifiedRoomAllocation(roomAllocations, originalReservation);
        // set the reservation id to the second reservation in the conference call and set the
        // conference id
        reservation.setValue(RESERVE_RES_ID, originalReservation.getReserveId());
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT
                + Constants.RES_CONFERENCE, originalReservation.getConferenceId());
        reservation.setValue(RESERVE_DATE_START, originalReservation.getStartDate());

        this.conferenceCallReservationService.editSingleRoomReservation(reservation,
            roomAllocation, null, null);
    }


    /**
     * Sets the conference call reservation service.
     *
     * @param conferenceCallReservationService the new conference call reservation service
     */
    public void setConferenceCallReservationService(
            final ConferenceCallReservationService conferenceCallReservationService) {
        this.conferenceCallReservationService = conferenceCallReservationService;
    }

    /**
     * Set the appointment helper.
     *
     * @param appointmentHelper the appointment helper
     */
    public void setAppointmentHelper(final AppointmentHelper appointmentHelper) {
        this.appointmentHelper = appointmentHelper;
    }

    /**
     * Set the room allocation to the different room employed in this test.
     *
     * @param roomAllocation the room allocation to change to the different room
     */
    protected void setToDifferentRoom(final DataRecord roomAllocation) {
        roomAllocation.setValue(RESERVE_RM_FL_ID, "19");
        roomAllocation.setValue(RESERVE_RM_RM_ID, "107");
        roomAllocation.setValue(RESERVE_RM_CONFIG_ID, "CONF-A1");
        roomAllocation.setValue(RESERVE_RM_RM_ARRANGE_TYPE_ID, CONFERENCE);
    }

}