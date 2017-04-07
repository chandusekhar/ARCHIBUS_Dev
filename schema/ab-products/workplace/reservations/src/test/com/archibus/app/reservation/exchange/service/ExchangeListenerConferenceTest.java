package com.archibus.app.reservation.exchange.service;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.app.reservation.service.ConferenceCallReservationService;
import com.archibus.app.reservation.util.ReservationUtils;
import com.archibus.datasource.data.*;

/**
 * Test the Exchange Listener with conference call reservations.
 *
 * @author Yorik Gerlo
 *         <p>
 *         Suppress warning "PMD.TestClassWithoutTestCases".
 *         <p>
 *         Justification: this is a subclass, the generic test cases are in the base class
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class ExchangeListenerConferenceTest extends ExchangeListenerTest {

    /** HQ time zone id. */
    private static final String TIME_ZONE_ID = "America/New_York";

    /** The conference reservation handler. */
    private ConferenceCallReservationService conferenceCallReservationService;

    /**
     * Create a single conference call reservation.
     *
     * @return primary conference reservation id
     */
    @Override
    protected int createSingleReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        this.conferenceCallReservationService.saveReservation(reservation, createRoomAllocations(),
            TIME_ZONE_ID);
        return reservation.getInt("reserve.res_id");
    }

    /**
     * Set up a recurring meeting in the database and on the calendar.
     *
     * @return the list of created reservations (in building time)
     */
    @Override
    protected List<RoomReservation> setupRecurringMeeting() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final String uniqueId = reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID);

        final List<RoomReservation> createdReservations =
                this.reservationDataSource.getByUniqueId(uniqueId, null, null);
        Assert.assertTrue(createdReservations.size() > roomAllocations.getRecords().size() * 2);
        // Allow for some slack time.
        sleep();
        sleep();
        this.exchangeListener.processInbox(this.serviceHelper.initializeService(this.serviceHelper
            .getResourceAccount()));
        Assert.assertNotNull(this.appointmentBinder.bindToAppointment(
            this.serviceHelper.getResourceAccount(), uniqueId));
        return createdReservations;
    }

    /**
     * Check whether the correct reservations are cancelled / not modified.
     *
     * @param createdReservations the reservation which should be still active
     * @param reservationsToCancel the reservation which should be cancelled
     */
    @Override
    protected void checkRecurringCancellations(final List<RoomReservation> createdReservations,
            final List<RoomReservation> reservationsToCancel) {

        // First move all reservations with matching conference id's to the reservationsToCancel.
        final Set<Integer> conferenceIds = new HashSet<Integer>(reservationsToCancel.size());
        for (final RoomReservation reservation : reservationsToCancel) {
            Assert.assertNotNull(reservation.getConferenceId());
            conferenceIds.add(reservation.getConferenceId());
        }
        int index = 0;
        while (index < createdReservations.size()) {
            final RoomReservation reservation = createdReservations.get(index);
            if (conferenceIds.contains(reservation.getConferenceId())) {
                createdReservations.remove(index);
                reservationsToCancel.add(reservation);
            } else {
                ++index;
            }
        }

        // Then use the default implementation to verify.
        super.checkRecurringCancellations(createdReservations, reservationsToCancel);
    }

    /**
     * Verify the changes to the occurrences are stored in the database as expected.
     *
     * @param createdReservations the in-memory reservations with modifications as applied via
     *            Exchange
     */
    @Override
    protected void verifyOccurrenceChanges(final List<RoomReservation> createdReservations) {
        // first check which ones were cancelled and which were modified, apply the same changes
        // to the in-memory objects for the other locations
        final Set<Integer> cancelledConferenceIds = new HashSet<Integer>();
        final List<RoomReservation> modifiedReservations = new ArrayList<RoomReservation>();
        final Map<Integer, List<RoomReservation>> reservationsByConferenceId =
                new HashMap<Integer, List<RoomReservation>>();

        for (final RoomReservation reservation : createdReservations) {
            if (Constants.STATUS_CANCELLED.equals(reservation.getStatus())) {
                cancelledConferenceIds.add(reservation.getConferenceId());
            } else if (!INITIAL_RESERVATION_NAME.equals(reservation.getReservationName())) {
                modifiedReservations.add(reservation);
            }
            List<RoomReservation> reservationsInConfCall =
                    reservationsByConferenceId.get(reservation.getConferenceId());
            if (reservationsInConfCall == null) {
                reservationsInConfCall = new ArrayList<RoomReservation>();
                reservationsByConferenceId.put(reservation.getConferenceId(),
                    reservationsInConfCall);
            }
            reservationsInConfCall.add(reservation);
        }

        for (final Integer cancelledConferenceId : cancelledConferenceIds) {
            final List<RoomReservation> reservationsInConfCall =
                    reservationsByConferenceId.get(cancelledConferenceId);
            for (final RoomReservation reservation : reservationsInConfCall) {
                reservation.setStatus(Constants.STATUS_CANCELLED);
            }
        }

        for (final RoomReservation modifiedReservation : modifiedReservations) {
            final List<RoomReservation> reservationsInConfCall =
                    reservationsByConferenceId.get(modifiedReservation.getConferenceId());
            for (final RoomReservation reservation : reservationsInConfCall) {
                reservation.setReservationName(modifiedReservation.getReservationName());
                reservation.setTimePeriod(modifiedReservation.getTimePeriod());
                reservation.setAttendees(modifiedReservation.getAttendees());
            }
        }

        // then use the default implementation for verifying
        super.verifyOccurrenceChanges(createdReservations);
    }

    /**
     * Check the given reservation object against the same reservation in the database.
     *
     * @param reservation the reservation to compare with the stored copy
     */
    @Override
    protected void checkAgainstDatabase(final RoomReservation reservation) {
        final List<RoomReservation> updatedReservations =
                this.reservationDataSource.getByConferenceId(reservation.getConferenceId(), false);
        ReservationUtils.convertToTimeZone(reservation, Constants.TIMEZONE_UTC);
        for (final RoomReservation updatedReservation : updatedReservations) {
            ReservationUtils.convertToTimeZone(updatedReservation, Constants.TIMEZONE_UTC);
            Assert.assertEquals(reservation.getReservationName(),
                updatedReservation.getReservationName());
            Assert.assertEquals(reservation.getStartDateTime(),
                updatedReservation.getStartDateTime());
            Assert.assertEquals(reservation.getEndDateTime(), updatedReservation.getEndDateTime());
            Assert.assertEquals(reservation.getComments(), updatedReservation.getComments());
        }
    }

    /**
     * Sets the conference calls handler.
     *
     * @param conferenceCallReservationService the new conference calls handler
     */
    public void setConferenceCallReservationService(
            final ConferenceCallReservationService conferenceCallReservationService) {
        this.conferenceCallReservationService = conferenceCallReservationService;
    }

}
