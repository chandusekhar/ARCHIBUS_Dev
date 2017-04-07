package com.archibus.service.space.datachangeevent;

import java.util.*;

import com.archibus.app.common.space.domain.*;
import com.archibus.context.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.future.SpaceFutureTransactionDataChangeEventProcess;

/**
 * Recorder for "Update" Room Transaction.
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * @author Valery Tydykov
 */
public class UpdateRoomTransactionRecorder extends AbstractRoomTransactionRecorder implements
        IUpdateRoomTransactionRecorder {
    
    /** {@inheritDoc} */
    public void recordUpdateTransaction(final User user, final Date dateTime, final Room room) {
        
        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, true);
        }
        // KB3033963 - get the room record with all field value from
        final Room currentRoom = this.getRoomDao().getByPrimaryKey(room);
        
        // detect future transaction for the room updated
        final boolean existsFutureTransaction =
                SpaceFutureTransactionDataChangeEventProcess
                    .detectIfExistFutureTransForRoomAttributeChange(currentRoom.getBuildingId(),
                        currentRoom.getFloorId(), currentRoom.getId(), dateTime);
        
        // only do data change event logic when there are no future transaction
        if (!existsFutureTransaction) {
            final List<RoomTransaction> roomTransactions =
                    this.getRoomTransactionDao().findForPrimaryRoom(currentRoom, dateTime);
            
            // for each roomTransaction matching the room and dateTime
            for (final RoomTransaction roomTransaction : roomTransactions) {
                
                // Apply an end date to the previous Room Transaction record that represented the
                // primary room assignment. This record is now historical data.
                applyEndDate(dateTime, roomTransaction);
                
                // Insert new rmpct record
                createRoomTransaction(user, dateTime, currentRoom,
                    roomTransaction.getPercentageOfSpace(), roomTransaction.getEmployeeId(),
                    roomTransaction.getPrimaryEmployee(), roomTransaction.getId());
            }
        }
        
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, false);
        }
    }
}
