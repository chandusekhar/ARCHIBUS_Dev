package com.archibus.service.space.datachangeevent;

import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.*;
import com.archibus.context.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.space.*;
import com.archibus.service.space.future.*;
import com.archibus.service.space.helper.SpaceTransactionCommon;
import com.archibus.utility.DateTime;

/**
 * Recorder for "delete employee" Transaction.
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * @author Zhang Yi
 * 
 */
public class DeleteEmployeeRecorder extends DeleteRoomTransactionRecorder implements
        IDeleteEmployeeRecorder {
    
    /** {@inheritDoc} */
    public void recordDeleteTransaction(final User user, final Date dateTime,
            final Employee employee) {

        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, true);
        }
        // future transaction handler to handle the future transaction for the employee delete
        final SpaceFutureTransactionHandler futurHandler = new SpaceFutureTransactionHandler();
        // get all future transactions of employee location and employee
        final List<AssignmentObject> futureTransactions =
                SpaceFutureTransactionDataChangeEventProcess.getFutureTransForEmployeeDelete(employee
                    .getId());
        deleteFutureTransaction(futurHandler, futureTransactions);
        
        // find roomTransactions matching specified employee and dateTime
        final List<RoomTransaction> roomTransactions =
                this.getRoomTransactionDao().findForEmployee(employee, dateTime);
        
        // for each roomTransaction
        for (final RoomTransaction roomTransaction : roomTransactions) {
            
            final Date dateStart = roomTransaction.getDateStart();
            if (dateStart != null && dateStart.after(DateTime.addDays(dateTime, -1))) {
                // if rmpct.date_start is after current date -1, directly delete currnt room
                // transaction
                this.getRoomTransactionDao().delete(roomTransaction);
            } else {
                // update roomTransaction: apply end date
                updateRoomTransaction(user, dateTime, roomTransaction);
                
                // archive roomTransaction
                // KB3033368- remove the archive
                // archiveRoomTransaction(roomTransaction);
            }
            
            // get room object
            Room room = new Room();
            room.setBuildingId(roomTransaction.getBuildingId());
            room.setFloorId(roomTransaction.getFloorId());
            room.setId(roomTransaction.getRoomId());
            room = this.getRoomDao().getByPrimaryKey(room);
            
            // KB3037757 - if room over capacity, don't create new empty room part
            if (room.getEmployeeCapacity() > this.getRoomTransactionDao()
                .findForRoom(room, new Date()).size()) {
                // create room transaction that will contain deleted employee as vacant
                // instead if not over capacity
                createRoomTransaction(user, dateTime, roomTransaction);
            } else {
                // if the room is over capacity, just update percentage space of all rmpct for this
                // room
                updatePercentageOfSpace(room);
            }
        }
        
        addAddtionalFutureTransactionsToRestoreList(employee.getId(), futureTransactions,
            futurHandler);
        // restore future transactions if revert before
        futurHandler.restoreFutureTrans(futurHandler);
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, false);
        }
    }
    
    /**
     * add transaction that not include current employee to the restore list.
     * 
     * @param emId String employee id
     * @param futureTransactions future transactions list
     * @param futurHandler future transactions handler
     */
    public void addAddtionalFutureTransactionsToRestoreList(final String emId,
            final List<AssignmentObject> futureTransactions,
            final SpaceFutureTransactionHandler futurHandler) {
        
        for (final AssignmentObject record : futureTransactions) {
            
            final RoomTransaction roomTransaction = record.getRoomTransaction();
            // get activity type
            final Integer activityLogId = roomTransaction.getActivityLogId();
            if (activityLogId != null && activityLogId.intValue() > 0) {
                final DataRecord activityLogRecord =
                        SpaceTransactionCommon.getActivityLogRecord(activityLogId);
                final String activityType =
                        (String) activityLogRecord.getValue(SpaceConstants.ACTIVITY_LOG
                                + SpaceConstants.DOT + SpaceConstants.ACTIVITY_TYPE);
                
                // for department space request and move request that not include current employee
                // add them to restore list
                if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)
                        || !emId.equals(roomTransaction.getEmployeeId())) {
                    futurHandler.addCurrentAssignmentToRestoreArray(record);
                }
            }
            
        }
        
        // sort future transaction by date start
        futurHandler.sortFutureRecords();
        
    }
    
}
