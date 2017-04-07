package com.archibus.service.space.future;

import java.util.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.datasource.data.DataRecord;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.SpaceTransactionCommon;
import com.archibus.service.space.transaction.*;

/**
 * <p>
 * Space Transaction Handler Class, Added by ASC-BJ, Zhang Yi for 20.1 Space.<br>
 * 
 * <p>
 * 
 */
public class SpaceFutureTransactionMove extends SpaceTransactionMove {
    
    /**
     * insert current assignment into rmpct table and restore future transactions deleted with
     * impacted order.
     * 
     * @param date String start date
     * @param assignment JSONObject current move assignment
     * @param future SpaceFutureTransactionHandler Object
     * @param cancelOrReassign 1: cancel , otherwise resign.
     */
    public void restoreFutureTrans(final AssignmentObject assignment, final Date date,
            final SpaceFutureTransactionHandler future, final int cancelOrReassign) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final List<AssignmentObject> assignments = new ArrayList<AssignmentObject>();
        assignments.add(assignment);
        
        if (cancelOrReassign == 0) {
            this.insertUpdateRmpctRecordsFromMoveServiceRequest(date, assignments);
        } else {
            final Integer activityLogId = roomTransaction.getActivityLogId();
            new SpaceTransactionDelete().deleteRmpctRecord(activityLogId, assignments);
        }
        // restore original deleted future records.
        new SpaceFutureTransactionHandler().restoreFutureTrans(future);
        
    }
    
    /**
     * 
     * before call original 'deleteRmpctRecord' method, check if exists future transaction.
     * 
     * @param date String request start date.
     * @param assignmentsList JSONArray move employess assignment array
     */
    public void superDeleteRmpctRecord(final List<AssignmentObject> assignmentsList, final Date date) {
        // change for exists future transactions.
        if (assignmentsList == null || assignmentsList.isEmpty()) {
            return;
        }
        final AssignmentObject firstAssignment = assignmentsList.get(0);
        final RoomTransaction roomTransaction = firstAssignment.getRoomTransaction();
        final Integer activityLogId = roomTransaction.getActivityLogId();
        final DataRecord dataRecordActivityLog =
                SpaceTransactionCommon.getActivityLogRecord(activityLogId);
        final String activityType =
                (String) dataRecordActivityLog.getValue(SpaceConstants.ACTIVITY_LOG
                        + SpaceConstants.DOT + SpaceConstants.ACTIVITY_TYPE);
        int flag = 0;
        if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
            flag = 1;
        } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
            flag = 0;
        }
        
        SpaceTransactionCommon.setStatusAndAction(assignmentsList, 1, SpaceConstants.ACTION_UPDATE);
        
        for (final AssignmentObject assignment : assignmentsList) {
            
            if (SpaceFutureTransactionCommon.detectIfExistFutureTransInvolved(assignment, date,
                flag)) {
                final SpaceFutureTransactionHandler future = new SpaceFutureTransactionHandler();
                future.recurHandleFutureTrans(assignment, date, flag);
                future.deleteFutureAssignments();
                this.restoreFutureTrans(assignment, date, future, 1);
            } else {
                
                final List<AssignmentObject> list = new ArrayList<AssignmentObject>();
                list.add(assignment);
                new SpaceTransactionDelete().deleteRmpctRecord(activityLogId, list);
            }
        }
    }
    
    /**
     * 
     * before call original insertUpdateRmpctRecordsFromMoveServiceRequest method, check if exists
     * future transaction.
     * 
     * @param date String insert date
     * @param assignmentsList List<RmpctObject> move employess assignment array
     */
    public void superInsertUpdateRmpctRecordsFromMoveServiceRequest(final Date date,
            final List<AssignmentObject> assignmentsList) {
        // change for exists future transactions.
        if (assignmentsList == null || assignmentsList.isEmpty()) {
            return;
        }
        final AssignmentObject firstAssignment = assignmentsList.get(0);
        if (firstAssignment.getAction().equalsIgnoreCase(SpaceConstants.ACTION_UPDATE)) {
            
            for (final AssignmentObject assignment : assignmentsList) {
                
                if (SpaceFutureTransactionCommon.detectIfExistFutureTransInvolved(assignment, date,
                    0)) {
                    
                    final SpaceFutureTransactionHandler future =
                            new SpaceFutureTransactionHandler();
                    
                    future.recurHandleFutureTrans(assignment, date, 0);
                    future.deleteFutureAssignments();
                    this.restoreFutureTrans(assignment, date, future, 0);
                    
                } else {
                    
                    final List<AssignmentObject> assignments = new ArrayList<AssignmentObject>();
                    assignments.add(assignment);
                    this.insertUpdateRmpctRecordsFromMoveServiceRequest(date, assignments);
                }
            }
        } else {
            
            this.insertUpdateRmpctRecordsFromMoveServiceRequest(date, assignmentsList);
        }
    }
    
}
