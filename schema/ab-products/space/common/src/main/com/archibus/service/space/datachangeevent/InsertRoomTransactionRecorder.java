package com.archibus.service.space.datachangeevent;

import java.util.Date;

import com.archibus.app.common.space.domain.*;
import com.archibus.context.User;

/**
 * Recorder for "insert room" Transaction.
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * @author Valery Tydykov
 * 
 */
public class InsertRoomTransactionRecorder extends AbstractRoomTransactionRecorder implements
        IInsertRoomTransactionRecorder {
    /** {@inheritDoc} */
    public void recordInsertTransaction(final User user, final Date dateTime, final Room room) {
        // Set percentageOfSpace to 100, primaryRoom to 1, status to 1.
        this.createRoomTransaction(user, dateTime, room, RoomTransaction.PERCENTAGE_SPACE_100,
            null, -1, 0);
    }
}
