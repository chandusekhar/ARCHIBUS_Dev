package com.archibus.app.reservation.dao.datasource;

import java.util.*;

import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.app.reservation.service.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.*;
import com.ibm.icu.util.Calendar;

import junit.framework.Assert;

/**
 * Test class for ConferenceCallReservationDataSource.
 *
 * Note it's configured via the reservation-service.xml in the com.archibus.app.reservation.service
 * package.
 *
 * @author Yorik Gerlo
 * @since 21.3
 */
public class ConferenceCallReservationDataSourceTest extends RoomReservationServiceTestBase {

    /** HQ time zone id. */
    private static final String TIME_ZONE_ID = "America/New_York";

    /** The conference reservation handler. */
    private ConferenceCallReservationService conferenceCallReservationService;

    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        // data source tests don't need work requests
        withoutWorkRequests();
    }

    /**
     * Test getting all conference id's in a recurring series.
     */
    public void testGetRecurringConferenceIds() {
        final int reservationId = createConferenceReservation(true);
        final Integer[] allIds =
                this.reservationDataSource.getRecurringConferenceIds(reservationId, reservationId);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, false);

        Assert.assertEquals(primaryReservations.size(), allIds.length);
        this.conferenceCallReservationService.cancelConferenceReservation(allIds[2], null);
        Assert.assertEquals(allIds.length - 1,
            this.reservationDataSource.getRecurringConferenceIds(reservationId, allIds[1]).length);
    }

    /**
     * Test getting the parent id for a reservation.
     */
    public void testGetParentId() {
        final int reservationId = createConferenceReservation(true);
        Assert.assertEquals(Integer.valueOf(reservationId),
            this.reservationDataSource.getParentId(reservationId));
        Assert.assertEquals(Integer.valueOf(reservationId),
            this.reservationDataSource.getParentId(reservationId + 1));
    }

    /**
     * Test getting the conference series of resrvations.
     */
    public void testGetConferenceSeries() {
        final int reservationId = createConferenceReservation(true);
        List<RoomReservation> conferenceSeries = this.reservationDataSource
            .getConferenceSeries(reservationId, null, DataSource.SORT_ASC, true);
        final List<RoomReservation> recurringSeries =
                this.reservationDataSource.getByParentId(reservationId, null, null, false);
        Assert.assertEquals(recurringSeries.size(), conferenceSeries.size());
        for (int i = 0; i < recurringSeries.size(); ++i) {
            Assert.assertEquals(recurringSeries.get(i).getReserveId(),
                conferenceSeries.get(i).getConferenceId());
            Assert.assertEquals(recurringSeries.get(i).getStartDate(),
                conferenceSeries.get(i).getStartDate());
        }

        // cancel one of the primaries
        this.reservationDataSource.cancel(recurringSeries.get(1));

        // conference series should not be modified
        conferenceSeries = this.reservationDataSource.getConferenceSeries(reservationId, null,
            DataSource.SORT_ASC, true);
        Assert.assertEquals(recurringSeries.size(), conferenceSeries.size());
        for (int i = 0; i < recurringSeries.size(); ++i) {
            Assert.assertEquals(recurringSeries.get(i).getReserveId(),
                conferenceSeries.get(i).getConferenceId());
        }

        // cancel all the primaries
        for (int i = 0; i < recurringSeries.size(); ++i) {
            this.reservationDataSource.cancel(recurringSeries.get(1));
        }

        // now change the date for the first occurrence
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(recurringSeries.get(0).getStartDate());
        calendar.add(Calendar.DATE, 1);
        final Date modifiedStartDate = calendar.getTime();
        final List<RoomReservation> firstReservations =
                this.reservationDataSource.getByConferenceId(reservationId, false);
        for (final RoomReservation firstReservation : firstReservations) {
            firstReservation.setStartDate(modifiedStartDate);
            firstReservation.setEndDate(modifiedStartDate);
            this.reservationDataSource.save(firstReservation);
        }

        // conference series should not be modified except for the date of the first occurrence.
        conferenceSeries = this.reservationDataSource.getConferenceSeries(reservationId, null,
            DataSource.SORT_ASC, true);
        Assert.assertEquals(recurringSeries.size(), conferenceSeries.size());
        Assert.assertEquals(modifiedStartDate, conferenceSeries.get(0).getStartDate());

        // Finally, cancel one occurrence completely.
        this.conferenceCallReservationService
            .cancelConferenceReservation(recurringSeries.get(2).getReserveId(), null);

        // Conference series should be one element shorter.
        conferenceSeries = this.reservationDataSource.getConferenceSeries(reservationId, null,
            DataSource.SORT_ASC, true);
        Assert.assertEquals(recurringSeries.size() - 1, conferenceSeries.size());
    }

    /**
     * Test getting all reservations in a conference series.
     */
    public void testGetAllReservationsInConferenceSeries() {
        final int reservationId = createConferenceReservation(true);
        Map<Integer, List<RoomReservation>> allReservations = this.reservationDataSource
            .getAllReservationsInConferenceSeries(reservationId, false);
        final List<RoomReservation> recurringSeries =
                this.reservationDataSource.getByParentId(reservationId, null, null, false);
        Assert.assertEquals(recurringSeries.size(), allReservations.size());

        // verify that the reservations are all there and sorted
        final int numberOfRooms = this.createRoomAllocations().getRecords().size();
        int expectedConferenceId = reservationId;
        for (final List<RoomReservation> reservations : allReservations.values()) {
            Assert.assertEquals(numberOfRooms, reservations.size());
            for (final RoomReservation reservation : reservations) {
                Assert.assertEquals(Integer.valueOf(expectedConferenceId),
                    reservation.getConferenceId());
            }
            ++expectedConferenceId;
        }

        // cancel one of the primaries
        this.reservationDataSource.cancel(recurringSeries.get(1));
        allReservations = this.reservationDataSource
            .getAllReservationsInConferenceSeries(reservationId, false);
        Assert.assertEquals(numberOfRooms - 1,
            allReservations.get(recurringSeries.get(1).getConferenceId()).size());

        // cancel one occurrence
        final int cancelConferenceId = recurringSeries.get(2).getConferenceId();
        this.conferenceCallReservationService.cancelConferenceReservation(cancelConferenceId, null);
        allReservations = this.reservationDataSource
            .getAllReservationsInConferenceSeries(reservationId, false);
        Assert.assertEquals(recurringSeries.size(), allReservations.size());
        Assert.assertTrue(allReservations.get(cancelConferenceId).isEmpty());

        // get all starting from the second occurrence
        allReservations = this.reservationDataSource
            .getAllReservationsInConferenceSeries(reservationId + 1, false);
        Assert.assertNull(allReservations.get(reservationId));
        Assert.assertEquals(recurringSeries.size() - 1, allReservations.size());
    }

    /**
     * Test extracting primary reservations from a map of all the reservations in a conference
     * series.
     */
    public void testExtractPrimaryReservations() {
        final int reservationId = createConferenceReservation(true);
        SortedMap<Integer, List<RoomReservation>> allReservations = this.reservationDataSource
            .getAllReservationsInConferenceSeries(reservationId, false);
        final List<RoomReservation> recurringSeries =
                this.reservationDataSource.getByParentId(reservationId, null, null, false);
        List<RoomReservation> extractedPrimaries =
                this.reservationDataSource.extractPrimaryReservations(allReservations);
        Assert.assertEquals(recurringSeries.size(), extractedPrimaries.size());
        for (int i = 0; i < recurringSeries.size(); ++i) {
            Assert.assertEquals(recurringSeries.get(i).getReserveId(),
                extractedPrimaries.get(i).getReserveId());
        }

        // cancel one of the primaries
        this.reservationDataSource.cancel(recurringSeries.get(1));
        // cancel one occurrence
        final int cancelConferenceId = recurringSeries.get(2).getConferenceId();
        this.conferenceCallReservationService.cancelConferenceReservation(cancelConferenceId, null);

        allReservations = this.reservationDataSource
            .getAllReservationsInConferenceSeries(reservationId, false);
        extractedPrimaries = this.reservationDataSource.extractPrimaryReservations(allReservations);
        Assert.assertEquals(recurringSeries.size() - 1, extractedPrimaries.size());
        Assert.assertEquals(recurringSeries.get(1).getReserveId(),
            extractedPrimaries.get(1).getConferenceId());
        Assert.assertFalse(
            recurringSeries.get(1).getReserveId().equals(extractedPrimaries.get(1).getReserveId()));
    }

    /**
     * Sets the conference call reservation handler.
     *
     * @param conferenceCallReservationService the conference call reservation handler
     */
    public void setConferenceCallReservationService(
            final ConferenceCallReservationService conferenceCallReservationService) {
        this.conferenceCallReservationService = conferenceCallReservationService;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "com/archibus/app/reservation/service/reservation-service.xml" };
    }

    /**
     * Create a conference call reservation.
     *
     * @param recurring true to create a recurring conference call reservation, false for regular
     * @return id of the primary reservation on the first occurrence
     */
    private int createConferenceReservation(final boolean recurring) {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, recurring);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        return reservation.getInt(RESERVE_RES_ID);
    }

}
