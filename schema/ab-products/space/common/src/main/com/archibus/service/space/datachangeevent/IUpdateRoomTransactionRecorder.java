package com.archibus.service.space.datachangeevent;

import java.util.Date;

import com.archibus.app.common.space.domain.Room;
import com.archibus.context.User;

/**
 * Recorder for "Update" Room Transaction.
 * 
 * @author Valery Tydykov
 * 
 */
public interface IUpdateRoomTransactionRecorder {
    
    /**
     * Records "Update" transaction: the room was updated, so the corresponding RoomTransactions
     * should be updated or created.
     * 
     * @param user who performed transaction.
     * @param dateTime when the transaction happened.
     * @param room on which the transaction was performed.
     */
    void recordUpdateTransaction(final User user, final Date dateTime, final Room room);
}