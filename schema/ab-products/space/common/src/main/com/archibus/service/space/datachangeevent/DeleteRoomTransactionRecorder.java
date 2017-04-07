package com.archibus.service.space.datachangeevent;

import java.text.SimpleDateFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.space.domain.*;
import com.archibus.context.*;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.future.*;
import com.archibus.service.space.helper.SpaceTransactionCommon;
import com.archibus.service.space.transaction.SpaceTransactionDelete;
import com.archibus.utility.DateTime;

/**
 * Recorder for "Delete" Room Transaction.
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * @author Valery Tydykov
 * 
 */
public class DeleteRoomTransactionRecorder extends AbstractRoomTransactionRecorder implements
        IDeleteRoomTransactionRecorder {
    /**
     * Dao for ArchivedRoomTransaction.
     */
    private IDao<ArchivedRoomTransaction> archivedRoomTransactionDao;
    
    /**
     * @return the archivedRoomTransactionDao
     */
    public IDao<ArchivedRoomTransaction> getArchivedRoomTransactionDao() {
        return this.archivedRoomTransactionDao;
    }
    
    /** {@inheritDoc} */
    public void recordDeleteTransaction(final User user, final Date dateTime, final Room room) {
        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, true);
        }
        // future transaction handler
        final SpaceFutureTransactionHandler futureHandler = new SpaceFutureTransactionHandler();
        
        // if exists future transaction for the deleted room, CALL future transaction logic to
        // delete them
        // get all future transactions of the deleted room
        final List<AssignmentObject> futureTransactions =
                SpaceFutureTransactionDataChangeEventProcess.getFutureTransForRoomDelete(
                    room.getBuildingId(), room.getFloorId(), room.getId(), new Date());
        deleteFutureTransaction(futureHandler, futureTransactions);
        
        // all room transaction of the deleted room
        final List<RoomTransaction> roomTransactions =
                this.getRoomTransactionDao().findForRoom(room, null);
        
        // for each roomTransaction
        for (final RoomTransaction roomTransaction : roomTransactions) {
            final Date dateStart = roomTransaction.getDateStart();
            roomTransaction.getDateEnd();
            // KB3037648 - set date_end = current date -1 for all rmpct of this room even this rmpct
            // date_end is not null
            if (dateStart != null && dateStart.after(DateTime.addDays(dateTime, -1))) {
                // if rmpct.date_start is after current date -1, directly delete current room
                // transaction
                this.getRoomTransactionDao().delete(roomTransaction);
            } else {
                // update roomTransaction
                updateRoomTransaction(user, dateTime, roomTransaction);
                
                // archive roomTransaction
                archiveRoomTransaction(roomTransaction);
            }
        }
        
        // restore future of recurring delete, but not include transaction of the current deleted
        // room
        futureHandler.restoreFutureTrans(futureHandler);
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, false);
        }
    }
    
    /**
     * @param archivedRoomTransactionDao the archivedRoomTransactionDao to set
     */
    public void setArchivedRoomTransactionDao(
            final IDao<ArchivedRoomTransaction> archivedRoomTransactionDao) {
        this.archivedRoomTransactionDao = archivedRoomTransactionDao;
    }
    
    /**
     * Archives roomTransaction.
     * 
     * @param roomTransaction to be archived.
     */
    protected void archiveRoomTransaction(final RoomTransaction roomTransaction) {
        // create ArchivedRoomTransaction for RoomTransaction
        final ArchivedRoomTransaction archivedRoomTransaction =
                this.roomTransactionToArchivedRoomTransaction(roomTransaction);
        // save ArchivedRoomTransaction
        this.archivedRoomTransactionDao.save(archivedRoomTransaction);
        this.getRoomTransactionDao().delete(roomTransaction);
    }
    
    /**
     * Creates ArchivedRoomTransaction for RoomTransaction, using matching fields.
     * 
     * @param roomTransaction for which ArchivedRoomTransaction needs to be created.
     * @return ArchivedRoomTransaction with values from RoomTransaction.
     */
    private ArchivedRoomTransaction roomTransactionToArchivedRoomTransaction(
            final RoomTransaction roomTransaction) {
        final ArchivedRoomTransaction archivedRoomTransaction = new ArchivedRoomTransaction();
        
        archivedRoomTransaction.setId(roomTransaction.getId());
        
        archivedRoomTransaction.setBuildingId(roomTransaction.getBuildingId());
        archivedRoomTransaction.setFloorId(roomTransaction.getFloorId());
        archivedRoomTransaction.setRoomId(roomTransaction.getRoomId());
        
        archivedRoomTransaction.setDivisionId(roomTransaction.getDivisionId());
        archivedRoomTransaction.setDepartmentId(roomTransaction.getDepartmentId());
        
        archivedRoomTransaction.setCategory(roomTransaction.getCategory());
        archivedRoomTransaction.setType(roomTransaction.getType());
        archivedRoomTransaction.setProrate(roomTransaction.getProrate());
        archivedRoomTransaction.setEmployeeId(roomTransaction.getEmployeeId());
        archivedRoomTransaction.setPrimaryEmployee(roomTransaction.getPrimaryEmployee());
        archivedRoomTransaction.setPercentageOfSpace(roomTransaction.getPercentageOfSpace());
        
        archivedRoomTransaction.setDateCreated(roomTransaction.getDateCreated());
        archivedRoomTransaction.setDateStart(roomTransaction.getDateStart());
        archivedRoomTransaction.setDateEnd(roomTransaction.getDateEnd());
        archivedRoomTransaction.setDateDeleted(roomTransaction.getDateDeleted());
        
        archivedRoomTransaction.setStatus(roomTransaction.getStatus());
        
        archivedRoomTransaction.setUserName(roomTransaction.getUserName());
        archivedRoomTransaction.setDeletionUserName(roomTransaction.getDeletionUserName());
        archivedRoomTransaction.setParentId(roomTransaction.getParentId());
        
        archivedRoomTransaction.setPrimaryRoom(roomTransaction.getPrimaryRoom());
        archivedRoomTransaction.setActivityLogId(roomTransaction.getActivityLogId());
        archivedRoomTransaction.setMoId(roomTransaction.getMoId());
        archivedRoomTransaction.setDayPart(roomTransaction.getDayPart());
        
        archivedRoomTransaction.setFromBuildingId(roomTransaction.getFromBuildingId());
        archivedRoomTransaction.setFromFloorId(roomTransaction.getFromFloorId());
        archivedRoomTransaction.setFromRoomId(roomTransaction.getFromRoomId());
        
        return archivedRoomTransaction;
    }
    
    /**
     * Updates specified roomTransaction to record "Delete" Transaction:
     * <p>
     * sets dateEnd to dateTime�1, status to 3, dateDeleted to dateTime, deletionUserName to the
     * name of the user.
     * 
     * @param user who performed transaction.
     * @param dateTime when the transaction happened.
     * @param roomTransaction to be updated.
     */
    protected void updateRoomTransaction(final User user, final Date dateTime,
            final RoomTransaction roomTransaction) {
        // set dateEnd to <dateTime � 1>
        // KB3037648 - set date_end = current date -1 for all rmpct of this room even this rmpct
        final Date newDateEnd = DateTime.addDays(dateTime, -1);
        if (roomTransaction.getDateEnd() == null || roomTransaction.getDateEnd().after(newDateEnd)) {
            roomTransaction.setDateEnd(newDateEnd);
        }
        
        // for fixing kb3034179: since status 'obselete' is not useful, comment below lines for
        // setting status=3. - by ZY
        // roomTransaction.setStatus(RoomTransaction.ROOM_STATUS_3);
        roomTransaction.setDateDeleted(dateTime);
        roomTransaction.setDeletionUserName(user.getName());
        
        this.getRoomTransactionDao().update(roomTransaction);
    }
    
    /**
     * Delete future transactions related to the deleted room.
     * 
     * @param handler future transaction handler.
     * @param futureTransactions The room object.
     */
    protected void deleteFutureTransaction(final SpaceFutureTransactionHandler handler,
            final List<AssignmentObject> futureTransactions) {
        
        final SimpleDateFormat dateFormat = new SimpleDateFormat();
        dateFormat.applyPattern("yyyy-MM-dd");
        Logger.getLogger(this.getClass());
        
        for (final AssignmentObject futureTransactionRecord : futureTransactions) {
            final RoomTransaction roomTransaction = futureTransactionRecord.getRoomTransaction();
            // if not from move management, recurring delete future for move in and move out and
            // department space request
            if (roomTransaction.getMoId() == null) {
                
                // get activity type
                final Integer activityLogId = roomTransaction.getActivityLogId();
                final DataRecord activityLogRecord =
                        SpaceTransactionCommon.getActivityLogRecord(activityLogId);
                final String activityType =
                        (String) activityLogRecord.getValue(SpaceConstants.ACTIVITY_LOG
                                + SpaceConstants.DOT + SpaceConstants.ACTIVITY_TYPE);
                
                // get date start from the assignment
                final Date dateStart = roomTransaction.getDateStart();
                
                // get delete handler
                final SpaceTransactionDelete spaceTransactionDelete = new SpaceTransactionDelete();
                
                final List<AssignmentObject> assignments = new ArrayList<AssignmentObject>();
                assignments.add(futureTransactionRecord);
                
                if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
                    // for department space request, recurring delete future transaction
                    handler.recurHandleFutureTrans(futureTransactionRecord, dateStart, 1);
                    handler.deleteFutureAssignments();
                    
                    // for department space request, delete current future transaction
                    spaceTransactionDelete.deleteDepartmentAssignment(activityLogId, assignments);
                    
                } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                        || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
                    
                    // for move request, recurring delete future transaction
                    handler.recurHandleFutureTrans(futureTransactionRecord, dateStart, 0);
                    handler.deleteFutureAssignments();
                    
                    // for move request, delete current future transaction
                    spaceTransactionDelete.deleteEmployeeAssignment(activityLogId, assignments);
                }
                
            } else {
                // directly delete transaction if from move management
                final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
                restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.PCT_ID,
                    roomTransaction.getId(), Operation.EQUALS);
                
                final List<RoomTransaction> roomTransactions =
                        this.getRoomTransactionDao().find(restriction);
                
                if (!roomTransactions.isEmpty()) {
                    this.getRoomTransactionDao().delete(roomTransactions.get(0));
                }
            }
        }
    }
}
