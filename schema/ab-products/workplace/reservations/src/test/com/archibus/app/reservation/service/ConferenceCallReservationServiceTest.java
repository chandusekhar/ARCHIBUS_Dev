package com.archibus.app.reservation.service;

import java.sql.Time;
import java.text.ParseException;
import java.util.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.RecurrenceParser;
import com.archibus.app.reservation.exchange.service.ExchangeCalendarVerifier;
import com.archibus.app.reservation.util.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.EventHandlerContext;

import junit.framework.Assert;

/**
 * Test for the ConferenceCallReservationService class.
 * <p>
 * Suppress warning "PMD.TooManyMethods".
 * <p>
 * Justification: the JUnit tests for this class should be kept in one test class.
 */
@SuppressWarnings("PMD.TooManyMethods")
public class ConferenceCallReservationServiceTest extends ConferenceCallReservationServiceTestBase {

    /** Comments for cancellation. */
    private static final String CANCEL_COMMENTS1 = "cancelled one location ";

    /** Comments for cancellation. */
    private static final String CANCEL_COMMENTS2 = "cancelled another location";

    /** HTML branch tag. */
    private static final String HTML_BR = "<br/>";

    /** HTML paragraph end tag. */
    private static final String HTML_P_END = "</p>";

    /** HTML paragraph start tag. */
    private static final String HTML_P_START = "<p>";

    /** Number of occurrences used for testing. */
    private static final int NUMBER_OF_OCCURRENCES = 3;

    /**
     * Test the check that verifies editing the full conf call is allowed.
     */
    public void testCanEditConferenceCall() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        this.conferenceCallReservationService.saveReservation(reservation, createRoomAllocations(),
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        this.conferenceCallReservationService.canEditConferenceCall(reservationId);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Assert.assertEquals("OK",
            context.getString(ReservationsContextHelper.RESULT_MESSAGE_PARAMETER, ""));
    }

    /**
     * Test getting the location string for a conference call reservation.
     */
    public void testGetLocationString() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);

        final DataSetList roomAllocations = createRoomAllocations();

        final String location = this.conferenceCallReservationService.getLocationString(reservation,
            roomAllocations);
        Assert.assertNotNull(location);

        final List<RoomArrangement> roomArrangements = new ArrayList<RoomArrangement>();
        for (final DataRecord record : roomAllocations.getRecords()) {
            roomArrangements.add(
                this.roomAllocationDataSource.convertRecordToObject(record).getRoomArrangement());
        }
        this.spaceService.setLocationString(roomArrangements);

        for (final RoomArrangement arrangement : roomArrangements) {
            Assert.assertTrue(location.contains(arrangement.getLocation()));
            Assert.assertTrue(
                location.contains(HTML_P_START + arrangement.getLocation() + HTML_P_END));
        }
    }

    /**
     * Test getting the location string for editing a single room in a conference call reservation.
     */
    public void testGetLocationStringForSingleEdit() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);

        final List<RoomArrangement> roomArrangements = new ArrayList<RoomArrangement>();
        for (final DataRecord record : roomAllocations.getRecords()) {
            roomArrangements.add(
                this.roomAllocationDataSource.convertRecordToObject(record).getRoomArrangement());
        }
        this.spaceService.setLocationString(roomArrangements);
        reservation.setValue(
            Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_CONFERENCE,
            reservation.getInt(RESERVE_RES_ID));

        final String location = this.conferenceCallReservationService
            .getLocationStringForSingleEdit(reservation, roomAllocations.getRecord(0));

        for (final RoomArrangement arrangement : roomArrangements) {
            Assert.assertTrue(location.contains(arrangement.getLocation()));
            if (location.contains(HTML_P_START + arrangement.getLocation() + HTML_P_END)) {
                Assert.assertFalse(location.contains(arrangement.getLocation() + HTML_BR));
            } else {
                Assert.assertTrue(location.contains(arrangement.getLocation() + HTML_BR));
            }
        }
    }

    /**
     * Test getting the time zone for a building.
     */
    public void testGetLocationTimeZone() {
        final DataRecord record = this.conferenceCallReservationService.getLocationTimeZone(BL_ID);
        Assert.assertNotNull(record);
        Assert.assertEquals(TIME_ZONE_ID, record.getString("afm_timezones.timezone_id"));
    }

    /**
     * Test calculating the total cost for a conference call reservation.
     */
    public void testCalculateTotalCost() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);

        final DataSetList roomAllocations = createRoomAllocations();
        final double totalCost = this.conferenceCallReservationService
            .calculateTotalCost(reservation, roomAllocations, 1);
        double separateCosts = 0.0;
        for (final DataRecord record : roomAllocations.getRecords()) {
            separateCosts += this.roomReservationService.calculateTotalCost(reservation, record,
                new DataSetList(), new DataSetList(), 1);
        }
        Assert.assertTrue(totalCost > 0.0);
        Assert.assertEquals(separateCosts, totalCost);
        Assert.assertEquals(NUMBER_OF_OCCURRENCES * totalCost, this.conferenceCallReservationService
            .calculateTotalCost(reservation, roomAllocations, NUMBER_OF_OCCURRENCES));
    }

    /**
     * Test saving a recurring conference call reservation.
     */
    public void testSaveReservation() {
        final int reservationId = this.saveReservation(TIME_ZONE_ID);
        Assert.assertTrue(reservationId > 0);
    }

    /**
     * Test saving a recurring conference call reservation with a custom time zone.
     *
     * @throws ParseException when the times are invalid
     */
    public void testSaveReservationCustomTimeZone() throws ParseException {
        this.startTime = createTime("1899-12-30 15:30:00");
        this.endTime = createTime("1899-12-30 17:00:00");

        final int reservationId = this.saveReservation("Europe/Brussels");
        Assert.assertTrue(reservationId > 0);
    }

    /**
     * Test saving a conference call reservation.
     *
     * @param timeZone the time zone 'specified by the user'
     * @return the primary reservation id
     */
    private int saveReservation(final String timeZone) {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);

        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            timeZone);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        Assert.assertTrue(reservationId > 0);
        final RoomReservation primaryReservation = this.reservationDataSource.get(reservationId);
        Assert.assertEquals(Integer.valueOf(reservationId), primaryReservation.getConferenceId());
        Assert.assertNotNull(primaryReservation.getUniqueId());

        final List<RoomReservation> reservations = this.reservationDataSource
            .getByUniqueId(primaryReservation.getUniqueId(), null, null);
        Assert.assertEquals(roomAllocations.getRecords().size(), reservations.size());
        for (final RoomReservation confCallReservation : reservations) {
            Assert.assertEquals(Integer.valueOf(reservationId),
                confCallReservation.getConferenceId());
        }
        ExchangeCalendarVerifier.checkExchangeEquivalence(primaryReservation,
            this.appointmentBinder, this.appointmentHelper, this.serviceHelper);
        return reservationId;
    }

    /**
     * Test saving a recurring conference call reservation.
     */
    public void testSaveRecurringReservation() {
        final int reservationId = this.saveRecurringReservation(TIME_ZONE_ID);
        Assert.assertTrue(reservationId > 0);
    }

    /**
     * Test saving a recurring conference call reservation with a custom time zone.
     *
     * @throws ParseException when the times are invalid
     */
    public void testSaveRecurringReservationCustomTimeZone() throws ParseException {
        this.startTime = createTime("1899-12-30 15:00:00");
        this.endTime = createTime("1899-12-30 16:00:00");

        final int reservationId = this.saveRecurringReservation("Europe/Amsterdam");
        Assert.assertTrue(reservationId > 0);
    }

    /**
     * Save a recurring conference call reservation with the specified time zone.
     *
     * @param timeZone the time zone 'specified by the user'
     * @return the primary reservation id
     */
    private int saveRecurringReservation(final String timeZone) {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);

        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            timeZone);

        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        Assert.assertTrue(reservationId > 0);
        final RoomReservation primaryReservation = this.reservationDataSource.get(reservationId);
        Assert.assertEquals(Integer.valueOf(reservationId), primaryReservation.getConferenceId());

        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);
        for (final RoomReservation occurrence : primaryReservations) {
            final List<RoomReservation> confCallReservations = this.reservationDataSource
                .getByConferenceId(occurrence.getConferenceId(), true);
            Assert.assertEquals(roomAllocations.getRecords().size(), confCallReservations.size());
            for (final RoomReservation confCallReservation : confCallReservations) {
                Assert.assertEquals(primaryReservation.getComments(),
                    confCallReservation.getComments());
                Assert.assertEquals(confCallReservation.getConferenceId() - reservationId + 1,
                    confCallReservation.getOccurrenceIndex());
            }
        }

        primaryReservation.setRecurrence(RecurrenceParser.parseRecurrence(this.startDate,
            this.endDate, primaryReservation.getRecurringRule()));
        primaryReservation.setCreatedReservations(primaryReservations);
        ExchangeCalendarVerifier.checkExchangeEquivalence(primaryReservation,
            this.appointmentBinder, this.appointmentHelper, this.serviceHelper);
        return reservationId;
    }

    /**
     * Test editing a single room in a conference call reservation.
     */
    public void testEditSingleRoomReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);

        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        final RoomReservation originalReservation =
                this.reservationDataSource.get(reservationId + 1);
        Assert.assertNotNull(originalReservation);
        this.editSingleRoom(reservation, roomAllocations, originalReservation);
    }

    /**
     * Test editing a single room on a single occurrence of a recurring conference call reservation.
     */
    public void testEditSingleRoomReservationOccurrence() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        // Get the second room on the second occurrence.
        final RoomReservation originalReservation =
                this.reservationDataSource.getByConferenceId(reservationId + 1, false).get(1);
        Assert.assertNotNull(originalReservation);
        reservation.setValue(Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT,
            originalReservation.getParentId());
        this.editSingleRoom(reservation, roomAllocations, originalReservation);
    }

    /**
     * Test editing a single room on a single occurrence of a recurring conference call reservation.
     */
    public void testEditSingleRoomReservationRecurring() {
        withoutWorkRequests();

        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        // Get the second room on the first occurrence.
        final RoomReservation originalReservation =
                this.reservationDataSource.getByConferenceId(reservationId, false).get(1);
        Assert.assertNotNull(originalReservation);
        editSingleRoomRecurring(reservation, roomAllocations, originalReservation);
        verifyEditSingleRoomRecurring(originalReservation);
    }

    /**
     * Verify the changes after editing a single room for a recurring meeting. This verification
     * assumes no other changes have been applied to the series.
     *
     * @param originalReservation the original reservation which was used to edit the single
     *            location (that occurrence and later occurrences)
     */
    private void verifyEditSingleRoomRecurring(final RoomReservation originalReservation) {
        final RoomReservation primaryReservation =
                this.reservationDataSource.get(originalReservation.getConferenceId());
        final List<RoomReservation> reservations = this.reservationDataSource
            .getByUniqueId(originalReservation.getUniqueId(), null, null);

        final microsoft.exchange.webservices.data.Appointment master = this.appointmentBinder
            .bindToAppointment(originalReservation.getEmail(), originalReservation.getUniqueId());

        try {
            for (final RoomReservation confCallReservation : reservations) {
                if (confCallReservation.getConferenceId() >= originalReservation
                    .getConferenceId()) {
                    Assert.assertFalse(originalReservation.getComments()
                        .equals(confCallReservation.getComments()));
                    Assert.assertEquals(primaryReservation.getComments(),
                        confCallReservation.getComments());
                } else {
                    // comments should not have been modified
                    Assert.assertTrue(originalReservation.getComments()
                        .equals(confCallReservation.getComments()));
                }
                // also check the time matches
                Assert.assertEquals(originalReservation.getEndTime(),
                    confCallReservation.getEndTime());

                // and verify the location string of the exchange meeting
                if (confCallReservation.getConferenceId()
                    .equals(confCallReservation.getReserveId())) {
                    final microsoft.exchange.webservices.data.Appointment occurrence =
                            this.appointmentBinder.bindToOccurrence(master.getService(),
                                confCallReservation, master);
                    Assert.assertEquals(this.spaceService.getLocationString(confCallReservation),
                        occurrence.getLocation());
                }
            }
        } catch (final microsoft.exchange.webservices.data.ServiceLocalException exception) {
            Assert.fail(
                "Unable to verify location specified in occurrence " + exception.getMessage());
        }
    }

    /**
     * Test editing a single room on a single occurrence of a recurring conference call reservation.
     */
    public void testEditSingleRoomReservationModifiedRecurrence() {
        withoutWorkRequests();

        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        // Get the primary reservation on the third occurrence and change the end time.
        final RoomReservation modifiedOccurrence =
                this.reservationDataSource.getActiveReservation(reservationId + 2);
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(modifiedOccurrence.getEndTime());
        calendar.add(Calendar.HOUR, 1);
        modifiedOccurrence.setEndTime(new Time(calendar.getTimeInMillis()));
        this.reservationService.saveFullReservation(modifiedOccurrence);

        // Get the second room on the second occurrence.
        final RoomReservation originalReservation =
                this.reservationDataSource.getByConferenceId(reservationId + 1, false).get(1);
        Assert.assertNotNull(originalReservation);
        editSingleRoomRecurring(reservation, roomAllocations, originalReservation);
        verifyEditSingleRoomRecurring(originalReservation);
    }

    /**
     * Test removing all rooms in a conference call and add different ones.
     */
    public void testReplaceAllRooms() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> createdReservations =
                this.reservationDataSource.getByConferenceId(reservationId, false);
        Assert.assertEquals(roomAllocations.getRecords().size(), createdReservations.size());

        // We simulate adding different ones by removing the first room allocation.
        final List<DataRecord> replacementAllocations = new ArrayList<DataRecord>();
        for (int i = 1; i < roomAllocations.getRecords().size(); ++i) {
            replacementAllocations.add(roomAllocations.getRecord(i));
        }
        roomAllocations = new DataSetList(replacementAllocations);

        // Indicate a different time by changing the time zone.
        reservation.setValue(
            Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_CONFERENCE, reservationId);
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            ALTERNATIVE_TIME_ZONE_ID);
        final List<RoomReservation> editedReservations =
                this.reservationDataSource.getByConferenceId(reservationId, false);
        Assert.assertEquals(roomAllocations.getRecords().size(), editedReservations.size());
        for (final RoomReservation createdReservation : createdReservations) {
            Assert.assertEquals(Constants.STATUS_CANCELLED,
                this.reservationDataSource.get(createdReservation.getReserveId()).getStatus());
        }
        for (final RoomReservation editedReservation : editedReservations) {
            ReservationUtils.convertToTimeZone(editedReservation, ALTERNATIVE_TIME_ZONE_ID);
            Assert.assertEquals(Integer.valueOf(reservationId),
                editedReservation.getConferenceId());
            Assert.assertEquals(this.startTime.toString(),
                editedReservation.getStartTime().toString());
            Assert.assertEquals(this.endTime.toString(), editedReservation.getEndTime().toString());

            final String flatComments = TestHelper.flatten(editedReservation.getComments());
            Assert.assertFalse(flatComments.contains(this.getLocation(createdReservations.get(0))));
            Assert.assertTrue(flatComments.contains(this.getLocation(createdReservations.get(1))));
            Assert.assertTrue(flatComments.contains(this.getLocation(createdReservations.get(2))));
        }
    }

    /**
     * Test editing a conference call reservation by adding a different room.
     */
    public void testAddRoom() {
        final int reservationId = this.editConferenceCall(0, true, false);
        // CHECKSTYLE:OFF Justification: magic number used for testing.
        Assert.assertEquals(4,
            this.reservationDataSource.getByConferenceId(reservationId, false).size());
        // CHECKSTYLE:ON
    }

    /**
     * Test editing a conference call by removing one room and adding another.
     */
    public void testEditConferenceCall() {
        final int reservationId = this.editConferenceCall(1, true, false);
        // CHECKSTYLE:OFF Justification: magic number used for testing.
        Assert.assertEquals(3,
            this.reservationDataSource.getByConferenceId(reservationId, false).size());
        // CHECKSTYLE:ON
    }

    /**
     * Test editing a conference call reservation by removing some of the rooms.
     */
    public void testRemoveRoom() {
        final int reservationId = this.editConferenceCall(2, false, false);
        Assert.assertEquals(1,
            this.reservationDataSource.getByConferenceId(reservationId, false).size());
    }

    /**
     * Test editing a conference call, keeping the original rooms starting from the given index.
     *
     * @param keepFromIndex index from which to keep the existing rooms in the call
     * @param addNew true to add a new room allocation
     * @param recurring whether to test with recurring conference call
     * @return conference id
     */
    private int editConferenceCall(final int keepFromIndex, final boolean addNew,
            final boolean recurring) {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, recurring);
        DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        reservation.setValue(
            Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_CONFERENCE, reservationId);

        final Integer[] conferenceIds =
                loadConferenceIdsInTest(reservation, reservationId, recurring);

        final Map<Integer, List<RoomReservation>> createdReservationsByConferenceId =
                new HashMap<Integer, List<RoomReservation>>();
        for (final int conferenceId : conferenceIds) {
            final List<RoomReservation> createdReservations =
                    this.reservationDataSource.getByConferenceId(conferenceId, false);
            Assert.assertEquals(roomAllocations.getRecords().size(), createdReservations.size());
            createdReservationsByConferenceId.put(conferenceId, createdReservations);
        }

        // We get the saved room allocations from db for all except the first.
        final List<DataRecord> replacementAllocations = new ArrayList<DataRecord>();
        for (int i = keepFromIndex; i < roomAllocations.getRecords().size(); ++i) {
            replacementAllocations.add(this.roomAllocationDataSource.getRecord(
                "res_id = " + (reservationId + i * createdReservationsByConferenceId.size())));
        }
        if (addNew) {
            final DataRecord roomAllocation = createRoomAllocation();
            setToDifferentRoom(roomAllocation);
            replacementAllocations.add(roomAllocation);
        }
        roomAllocations = new DataSetList(replacementAllocations);

        // Indicate a different time by changing the time zone.
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            ALTERNATIVE_TIME_ZONE_ID);

        final microsoft.exchange.webservices.data.Appointment master =
                this.appointmentBinder.bindToAppointment(
                    reservation.getString(
                        Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.EMAIL_FIELD_NAME),
                reservation.getString(RESERVE_OUTLOOK_UNIQUE_ID));

        for (final int conferenceId : conferenceIds) {
            final List<RoomReservation> createdReservations =
                    createdReservationsByConferenceId.get(conferenceId);
            final List<RoomReservation> editedReservations =
                    this.reservationDataSource.getByConferenceId(conferenceId, false);
            Assert.assertEquals(roomAllocations.getRecords().size(), editedReservations.size());
            for (final RoomReservation editedReservation : editedReservations) {
                ReservationUtils.convertToTimeZone(editedReservation, ALTERNATIVE_TIME_ZONE_ID);
                Assert.assertEquals(Integer.valueOf(conferenceId),
                    editedReservation.getConferenceId());
                Assert.assertEquals(this.startTime.toString(),
                    editedReservation.getStartTime().toString());
                Assert.assertEquals(this.endTime.toString(),
                    editedReservation.getEndTime().toString());
                if (recurring) {
                    Assert.assertNotNull(editedReservation.getParentId());
                    Assert.assertEquals(editedReservation.getConferenceId() - reservationId + 1,
                        editedReservation.getOccurrenceIndex());
                }
                for (int i = 0; i < keepFromIndex; ++i) {
                    Assert.assertFalse(TestHelper.flatten(editedReservation.getComments())
                        .contains(getLocation(createdReservations.get(i))));
                }
                for (int i = 1; i < editedReservations.size(); ++i) {
                    Assert.assertTrue(TestHelper.flatten(editedReservation.getComments())
                        .contains(getLocation(editedReservations.get(i))));
                }
            }

            checkExchangeEquivalence(editedReservations, recurring, master);
        }
        return reservationId;
    }

    /**
     * Get the location line for a room in a reservation.
     *
     * @param reservation the reservation
     * @return the location line
     */
    private String getLocation(final RoomReservation reservation) {
        return this.spaceService
            .getLocationString(reservation.getRoomAllocations().get(0).getRoomArrangement());
    }

    /**
     * Check Exchange Equivalence after editing via the Conference Call Reservations WFR.
     *
     * @param editedReservations the reservations that were edited
     * @param recurring whether the reservations are recurring
     * @param master the master appointment in Exchange
     */
    private void checkExchangeEquivalence(final List<RoomReservation> editedReservations,
            final boolean recurring, final microsoft.exchange.webservices.data.Appointment master) {
        if (recurring) {
            final RoomReservation reservationOccurrence = this.reservationDataSource
                .getActiveReservation(editedReservations.get(0).getReserveId());
            final microsoft.exchange.webservices.data.Appointment appointment =
                    this.appointmentBinder.bindToOccurrence(master.getService(),
                        reservationOccurrence, master);
            final TimePeriod timePeriodUtc = ReservationUtils
                .getTimePeriodInTimeZone(reservationOccurrence, Constants.TIMEZONE_UTC);
            try {
                Assert.assertEquals(timePeriodUtc.getStartDateTime(), appointment.getStart());
                Assert.assertEquals(timePeriodUtc.getEndDateTime(), appointment.getEnd());
            } catch (final microsoft.exchange.webservices.data.ServiceLocalException exception) {
                Assert.fail("Unable to verify time frame for occurrence " + exception.getMessage());
            }
        } else {
            final RoomReservation activeReservation = this.reservationDataSource
                .getActiveReservation(editedReservations.get(0).getReserveId());
            // Set the conference id as the reservation id for the purpose of checking equivalence.
            activeReservation.setReserveId(activeReservation.getConferenceId());
            ExchangeCalendarVerifier.checkExchangeEquivalence(activeReservation,
                this.appointmentBinder, this.appointmentHelper, this.serviceHelper);
        }
    }

    /**
     * Load the conference id's for this unit test, and set some properties in the data record.
     *
     * @param reservation the data record
     * @param reservationId the reservation id
     * @param recurring whether the test is for recurring reservations
     * @return list of conference id's
     */
    private Integer[] loadConferenceIdsInTest(final DataRecord reservation, final int reservationId,
            final boolean recurring) {
        Integer[] conferenceIds = null;
        if (recurring) {
            reservation.setValue(
                Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.RES_PARENT, reservationId);
            reservation.setValue(
                Constants.RESERVE_TABLE_NAME + Constants.DOT + Constants.OCCURRENCE_INDEX_FIELD, 1);
            conferenceIds = this.reservationDataSource.getRecurringConferenceIds(reservationId,
                reservationId);
        } else {
            conferenceIds = new Integer[] { reservationId };
        }
        return conferenceIds;
    }

    /**
     * Test editing a recurring conference call without changing any rooms. This does involve
     * changing the time zone.
     */
    public void testChangeTimeZoneRecurring() {
        final int reservationId = this.editConferenceCall(0, false, true);
        Assert.assertTrue(reservationId > 0);
    }

    /**
     * Test editing a conference call reservation by adding a different room.
     */
    public void testAddRoomRecurring() {
        final int reservationId = this.editConferenceCall(0, true, true);
        final Integer[] conferenceIds =
                this.reservationDataSource.getRecurringConferenceIds(reservationId, reservationId);
        for (final Integer conferenceId : conferenceIds) {
            // CHECKSTYLE:OFF Justification: magic number used for testing.
            Assert.assertEquals(4,
                this.reservationDataSource.getByConferenceId(conferenceId, false).size());
            // CHECKSTYLE:ON
        }
    }

    /**
     * Test editing a conference call by removing one room and adding another.
     */
    public void testEditRecurringConferenceCall() {
        final int reservationId = this.editConferenceCall(1, true, true);
        final Integer[] conferenceIds =
                this.reservationDataSource.getRecurringConferenceIds(reservationId, reservationId);
        for (final Integer conferenceId : conferenceIds) {
            // CHECKSTYLE:OFF Justification: magic number used for testing.
            Assert.assertEquals(3,
                this.reservationDataSource.getByConferenceId(conferenceId, false).size());
            // CHECKSTYLE:ON
        }
    }

    /**
     * Test editing a conference call reservation by removing some of the rooms.
     */
    public void testRemoveRoomRecurring() {
        final int reservationId = this.editConferenceCall(2, false, true);
        final Integer[] conferenceIds =
                this.reservationDataSource.getRecurringConferenceIds(reservationId, reservationId);
        for (final Integer conferenceId : conferenceIds) {
            Assert.assertEquals(1,
                this.reservationDataSource.getByConferenceId(conferenceId, false).size());
        }
    }

    /**
     * Test editing a conference call reservation by removing all rooms and adding a new one.
     */
    public void testReplaceAllRoomsRecurring() {
        final int reservationId = this.editConferenceCall(3, true, true);
        final Integer[] conferenceIds =
                this.reservationDataSource.getRecurringConferenceIds(reservationId, reservationId);
        for (final Integer conferenceId : conferenceIds) {
            Assert.assertEquals(1,
                this.reservationDataSource.getByConferenceId(conferenceId, false).size());
        }
    }

    /**
     * Test cancelling a conference call reservation.
     */
    public void testCancelConferenceReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        this.conferenceCallReservationService.cancelConferenceReservation(reservationId,
            CANCEL_COMMENTS1);
        Assert.assertTrue(
            this.reservationDataSource.getByConferenceId(reservationId, true).isEmpty());
    }

    /**
     * Test cancelling a single location of a conference call.
     */
    public void testCancelOneLocationInConferenceReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);

        this.roomReservationService.cancelRoomReservation(reservationId + 1, CANCEL_COMMENTS1);
        List<RoomReservation> confCallReservations =
                this.reservationDataSource.getByConferenceId(reservationId, true);
        Assert.assertEquals(2, confCallReservations.size());
        for (final RoomReservation confCallReservation : confCallReservations) {
            Assert.assertTrue(confCallReservation.getComments().contains(CANCEL_COMMENTS1));
        }

        this.roomReservationService.cancelRoomReservation(reservationId, CANCEL_COMMENTS2);
        confCallReservations = this.reservationDataSource.getByConferenceId(reservationId, true);
        Assert.assertEquals(1, confCallReservations.size());
        for (final RoomReservation confCallReservation : confCallReservations) {
            Assert.assertFalse(confCallReservation.getComments().contains(CANCEL_COMMENTS1));
            Assert.assertTrue(confCallReservation.getComments().contains(CANCEL_COMMENTS2));
        }

        this.roomReservationService.cancelRoomReservation(reservationId + 2, CANCEL_COMMENTS1);
        confCallReservations = this.reservationDataSource.getByConferenceId(reservationId, true);
        Assert.assertTrue(confCallReservations.isEmpty());
    }

    /**
     * Test cancelling a recurring conference call reservation.
     */
    public void testCancelRecurringConferenceReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);

        this.conferenceCallReservationService.cancelRecurringConferenceReservation(
            primaryReservations.get(2).getConferenceId(), CANCEL_COMMENTS1);

        final List<RoomReservation> confCallReservations = this.reservationDataSource
            .getByUniqueId(primaryReservations.get(0).getUniqueId(), null, null);
        Assert.assertEquals(roomAllocations.getRecords().size() * 2, confCallReservations.size());

        // now cancel the full series
        this.conferenceCallReservationService.cancelRecurringConferenceReservation(
            primaryReservations.get(0).getConferenceId(), CANCEL_COMMENTS2);
        Assert.assertTrue(this.reservationDataSource
            .getByUniqueId(primaryReservations.get(0).getUniqueId(), null, null).isEmpty());
    }

    /**
     * Test cancelling a single location of a recurring conference call.
     */
    public void testCancelOneLocationInRecurringConferenceReservation() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);

        this.roomReservationService.cancelRecurringRoomReservation(
            reservationId + primaryReservations.size(), CANCEL_COMMENTS1);

        for (final RoomReservation primaryReservation : primaryReservations) {
            final List<RoomReservation> confCallReservations = this.reservationDataSource
                .getByConferenceId(primaryReservation.getConferenceId(), true);
            Assert.assertEquals(2, confCallReservations.size());
            for (final RoomReservation confCallReservation : confCallReservations) {
                Assert.assertTrue(confCallReservation.getComments().contains(CANCEL_COMMENTS1));
            }
        }

        this.roomReservationService.cancelRecurringRoomReservation(reservationId + 2,
            CANCEL_COMMENTS2);
        for (final RoomReservation primaryReservation : primaryReservations) {
            final List<RoomReservation> confCallReservations = this.reservationDataSource
                .getByConferenceId(primaryReservation.getConferenceId(), true);
            if (primaryReservation.getReserveId() < reservationId + 2) {
                Assert.assertEquals(2, confCallReservations.size());
                for (final RoomReservation confCallReservation : confCallReservations) {
                    Assert.assertTrue(confCallReservation.getComments().contains(CANCEL_COMMENTS1));
                    Assert
                        .assertFalse(confCallReservation.getComments().contains(CANCEL_COMMENTS2));
                }
            } else {
                Assert.assertEquals(1, confCallReservations.size());
                for (final RoomReservation confCallReservation : confCallReservations) {
                    Assert
                        .assertFalse(confCallReservation.getComments().contains(CANCEL_COMMENTS1));
                    Assert.assertTrue(confCallReservation.getComments().contains(CANCEL_COMMENTS2));
                }
            }
        }

        this.roomReservationService.cancelRecurringRoomReservation(reservationId, CANCEL_COMMENTS2);
        for (final RoomReservation primaryReservation : primaryReservations) {
            final List<RoomReservation> confCallReservations = this.reservationDataSource
                .getByConferenceId(primaryReservation.getConferenceId(), true);
            Assert.assertEquals(1, confCallReservations.size());
        }

        this.roomReservationService.cancelRecurringRoomReservation(
            reservationId + 2 * primaryReservations.size(), CANCEL_COMMENTS1);
        Assert.assertTrue(this.reservationDataSource
            .getByUniqueId(primaryReservations.get(0).getUniqueId(), null, null).isEmpty());
    }

    /**
     * Test cancelling a single location of a single occurrence of a recurring conference call.
     */
    public void testRemoveRoomSingleOccurrence() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);
        Assert.assertFalse(primaryReservations.isEmpty());

        cancelOneRoomOneOccurrence(primaryReservations, roomAllocations);
    }

    /**
     * Cancel the second room of the next to last occurrence and verify this action completed.
     *
     * @param primaryReservations the primary reservations in the recurring conference call
     * @param roomAllocations the room allocations booked for each occurrence
     * @return conference call id of the occurrence where one room was cancelled
     */
    private int cancelOneRoomOneOccurrence(final List<RoomReservation> primaryReservations,
            final DataSetList roomAllocations) {
        // Cancel the next-to-last occurrence of the second room.
        final int primaryReservationId =
                primaryReservations.get(primaryReservations.size() - 2).getReserveId();
        final int reservationIdToCancel = primaryReservationId + primaryReservations.size();
        final int roomCount = roomAllocations.getRecords().size();

        this.roomReservationService.cancelRoomReservation(reservationIdToCancel, CANCEL_COMMENTS1);

        for (final RoomReservation primaryReservation : primaryReservations) {
            final List<RoomReservation> confCallReservations = this.reservationDataSource
                .getByConferenceId(primaryReservation.getConferenceId(), true);
            if (primaryReservation.getReserveId().equals(primaryReservationId)) {
                Assert.assertEquals(roomCount - 1, confCallReservations.size());
                for (final RoomReservation confCallReservation : confCallReservations) {
                    Assert.assertTrue(confCallReservation.getComments().contains(CANCEL_COMMENTS1));
                }
            } else {
                Assert.assertEquals(roomCount, confCallReservations.size());
            }
        }
        return primaryReservationId;
    }

    /**
     * Test editing a single room that's cancelled for one of the occurrences.
     */
    public void testEditSingleRoomSkipOccurrence() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, true);
        final DataSetList roomAllocations = createRoomAllocations();
        this.conferenceCallReservationService.saveReservation(reservation, roomAllocations,
            TIME_ZONE_ID);
        final int reservationId = reservation.getInt(RESERVE_RES_ID);
        final List<RoomReservation> primaryReservations =
                this.reservationDataSource.getByParentId(reservationId, null, null, true);
        final RoomReservation originalReservation =
                this.reservationDataSource.getByConferenceId(reservationId, false).get(1);
        Assert.assertEquals(Integer.valueOf(reservationId), originalReservation.getConferenceId());

        final int skippedReservationId =
                this.cancelOneRoomOneOccurrence(primaryReservations, roomAllocations);
        this.editSingleRoomRecurring(reservation, roomAllocations, originalReservation);

        final RoomReservation primaryReservation =
                this.reservationDataSource.get(originalReservation.getConferenceId());
        final List<RoomReservation> reservations = this.reservationDataSource
            .getByUniqueId(originalReservation.getUniqueId(), null, null);

        this.appointmentBinder.bindToAppointment(originalReservation.getEmail(),
            originalReservation.getUniqueId());

        for (final RoomReservation confCallReservation : reservations) {
            if (skippedReservationId == confCallReservation.getConferenceId()) {
                Assert.assertTrue(confCallReservation.getComments().contains(CANCEL_COMMENTS1));
            } else {
                Assert.assertFalse(
                    originalReservation.getComments().equals(confCallReservation.getComments()));
                Assert.assertEquals(primaryReservation.getComments(),
                    confCallReservation.getComments());
            }
        }

    }

}
