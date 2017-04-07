package com.archibus.service.space.datachangeevent;

import java.util.Date;

import com.archibus.app.common.space.domain.Room;
import com.archibus.context.User;

/**
 * Recorder for "insert room" Transaction.
 * 
 * @author Valery Tydykov
 * 
 */
public interface IInsertRoomTransactionRecorder {
    
    /**
     * Records "insert room" transaction: the room was created, so the corresponding
     * RoomTransactions should be updated or created. Sets percentageOfSpace to 100, primaryRoom to
     * 1, status to 1.
     * 
     * 
     * @param user who performed transaction.
     * @param dateTime when the transaction happened.
     * @param room on which the transaction was performed.
     */
    void recordInsertTransaction(final User user, final Date dateTime, final Room room);
}