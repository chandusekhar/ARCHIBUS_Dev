package com.archibus.app.reservation.service;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.TestHelper;
import com.archibus.datasource.data.*;


/**
 * Test for the Conference Call Messages Service class.
 */
public class ConferenceCallMessagesServiceTest extends RoomReservationServiceTestBase {
    
    /** The reservation messages service. */
    private ConferenceCallMessagesService messagesService;

    /**
     * Test getting the location string for a conference call reservation and also updating an
     * existing one.
     */
    public void testInsertConferenceCallLocations() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        final DataSetList roomAllocations = createRoomAllocations();
        final List<RoomReservation> confCallReservations =
                createConferenceCallReservations(reservation, roomAllocations);
        
        this.messagesService.insertConferenceCallLocations(confCallReservations, spaceService, null);
        
        final List<RoomArrangement> roomArrangements = new ArrayList<RoomArrangement>();
        for (int i = 1; i < roomAllocations.getRecords().size(); ++i) {
            roomArrangements.add(this.roomAllocationDataSource.convertRecordToObject(
                roomAllocations.getRecord(i)).getRoomArrangement());
        }
        this.spaceService.setLocationString(roomArrangements);
        
        for (final RoomArrangement arrangement : roomArrangements) {
            for (final RoomReservation confCallReservation : confCallReservations) {
                final String flatComments = TestHelper.flatten(confCallReservation.getComments());
                Assert.assertTrue("[" + flatComments + "] contains [" + arrangement.getLocation()
                        + "]", flatComments.contains(arrangement.getLocation()));
            }
        }
        
        // now try updating with one location removed
        confCallReservations.remove(confCallReservations.size() - 1);
        this.messagesService.insertConferenceCallLocations(confCallReservations, spaceService, null);
        for (final RoomReservation confCallReservation : confCallReservations) {
            final String flatComments = TestHelper.flatten(confCallReservation.getComments());
            for (int i = 0; i < roomArrangements.size() - 1; ++i) {
                Assert.assertTrue(flatComments.contains(roomArrangements.get(i).getLocation()));
            }
            Assert.assertFalse(flatComments.contains(roomArrangements.get(
                roomArrangements.size() - 1).getLocation()));
        }
    }
    
    /**
     * Test stripping the locations from a reservation comment.
     */
    public void testStripConferenceCallLocations() {
        final DataRecord reservation = this.reservationDataSource.createNewRecord();
        createReservation(reservation, false);
        final DataSetList roomAllocations = createRoomAllocations();
        final List<RoomReservation> confCallReservations =
                createConferenceCallReservations(reservation, roomAllocations);
        
        final RoomReservation roomReservation = confCallReservations.get(0);
        final String originalComments = roomReservation.getComments();
        this.messagesService.insertConferenceCallLocations(confCallReservations, spaceService, null);
        
        final String strippedComments =
                this.messagesService.stripConferenceCallLocations(roomReservation.getEmail(),
                    roomReservation.getComments());
        Assert.assertEquals(originalComments, strippedComments);
    }
    
    /**
     * Sets the messages service.
     * 
     * @param messagesService the new messages service
     */
    public void setMessagesService(final ConferenceCallMessagesService messagesService) {
        this.messagesService = messagesService;
    }
    
    /**
     * Create Room Reservation objects for a conference call reservation.
     * @param reservation the reservation data record
     * @param roomAllocations the room allocation data records
     * @return room reservation objects
     */
    private List<RoomReservation> createConferenceCallReservations(final DataRecord reservation,
            final DataSetList roomAllocations) {
        final List<RoomReservation> confCallReservations =
                new ArrayList<RoomReservation>(roomAllocations.getRecords().size());
        for (int i = 0; i < roomAllocations.getRecords().size(); ++i) {
            final RoomReservation confCallReservation =
                    this.reservationDataSource.convertRecordToObject(reservation);
            confCallReservation.addRoomAllocation(this.roomAllocationDataSource
                .convertRecordToObject(roomAllocations.getRecord(i)));
            confCallReservations.add(confCallReservation);
        }
        return confCallReservations;
    }
    
}
