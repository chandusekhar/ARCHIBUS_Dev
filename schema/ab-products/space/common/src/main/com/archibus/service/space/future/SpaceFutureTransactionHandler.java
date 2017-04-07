package com.archibus.service.space.future;

import java.util.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.datasource.data.DataRecord;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.SpaceTransactionCommon;
import com.archibus.service.space.transaction.*;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 */
public final class SpaceFutureTransactionHandler {
    
    /**
     * all future trans restore order by ASC.
     */
    private List<AssignmentObject> allFutureRecords;
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    public SpaceFutureTransactionHandler() {
        this.allFutureRecords = new ArrayList<AssignmentObject>();
    }
    
    /**
     * An employee requests to move out of a location, but there are future transactions for that
     * location that include the employee. return through records as a array and delete these
     * record.
     * 
     * @param date String start date
     * @param rmpctObject RmpctObject
     * @param flag 0: for move management , otherwise for department space.
     * @return List<JSONObject> with different future trans.
     */
    public List<AssignmentObject> getFutureRecords(final AssignmentObject rmpctObject,
            final Date date, final int flag) {
        // loop: for each assignment. order by start_date DESC, for each specific time, group by
        // activity_log_id.
        final List<DataRecord> rmpctRecs =
                SpaceFutureTransactionCommon.getAllFutureAssignments(rmpctObject, date, flag);
        final List<AssignmentObject> futureAssignments = new ArrayList<AssignmentObject>();
        if (rmpctRecs != null && !rmpctRecs.isEmpty()) {
            for (int j = 0; j < rmpctRecs.size(); j++) {
                final DataRecord dataRecord = rmpctRecs.get(j);
                if (dataRecord == null) {
                    continue;
                }
                final Integer activityLogId =
                        dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                                + SpaceConstants.ACTIVITY_LOG_ID);
                if (activityLogId == null || activityLogId.intValue() == 0) {
                    continue;
                }
                final AssignmentObject newAssign =
                        SpaceFutureTransactionCommon.modifyRecordToRoomTransaction(dataRecord);
                futureAssignments.add(newAssign);
            }
        }
        return futureAssignments;
    }
    
    /**
     * backup future trans.
     * 
     * @param futureAssignments List<RoomTransaction> future trans.
     * @param flag 0: for move management , otherwise for department space.
     */
    public void backUpFutureAssignments(final List<AssignmentObject> futureAssignments,
            final int flag) {
        
        for (final AssignmentObject rmpctObject : futureAssignments) {
            
            final Date dateStart = rmpctObject.getRoomTransaction().getDateStart();
            // call itself before approve.
            this.recurHandleFutureTrans(rmpctObject, dateStart, flag);
            
        }
    }
    
    /**
     * remove repeat future records and order by date.
     */
    public void sortFutureRecords() {
        
        final List<AssignmentObject> rmpctRecs = new ArrayList<AssignmentObject>();
        
        // remove repeat record.
        final Map<Integer, AssignmentObject> map = new HashMap<Integer, AssignmentObject>();
        for (final AssignmentObject dataRecord : this.allFutureRecords) {
            final Integer pctId = dataRecord.getRoomTransaction().getId();
            map.put(pctId, dataRecord);
        }
        rmpctRecs.clear();
        rmpctRecs.addAll(map.values());
        Collections.sort(rmpctRecs, new SpaceFutureTransactionSortProcess());
        
        this.allFutureRecords = rmpctRecs;
    }
    
    /**
     * delete backup future trans.
     */
    public void deleteFutureAssignments() {
        
        this.sortFutureRecords();
        
        for (final AssignmentObject rmpctObject : this.allFutureRecords) {
            
            final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
            final Integer activityLogId = roomTransaction.getActivityLogId();
            // for each record remove and update space.
            final DataRecord dataRecordActivityLog =
                    SpaceTransactionCommon.getActivityLogRecord(activityLogId);
            final String activityType =
                    (String) dataRecordActivityLog.getValue(SpaceConstants.ACTIVITY_LOG
                            + SpaceConstants.DOT + SpaceConstants.ACTIVITY_TYPE);
            final SpaceTransactionDelete spaceTransactionDelete = new SpaceTransactionDelete();
            
            final List<AssignmentObject> assignments = new ArrayList<AssignmentObject>();
            assignments.add(rmpctObject);
            
            final Integer moId = roomTransaction.getMoId();
            if (moId != null) {
                spaceTransactionDelete.deleteEmployeeAssignment(activityLogId, assignments);
                
            }
            
            if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
                spaceTransactionDelete.deleteDepartmentAssignment(activityLogId, assignments);
                
            } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                    || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
                
                spaceTransactionDelete.deleteEmployeeAssignment(activityLogId, assignments);
            }
        }
    }
    
    /**
     * get global variable 'allFutureRecords'.
     * 
     * @return global variable 'allFutureRecords'.
     */
    public List<AssignmentObject> getAllFutureRecords() {
        return this.allFutureRecords;
    }
    
    /**
     * delete all the future records by from-to older. Then save all the future assignments to a
     * final variable arrayList.
     * 
     * @param date String start date
     * @param rmpctObject RmpctObject
     * @param flag 0: for move management , otherwise for department space.
     */
    public void recurHandleFutureTrans(final AssignmentObject rmpctObject, final Date date,
            final int flag) {
        
        // use this variable tempFlag fix warning.
        int tempFlag = flag;
        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        
        final Integer activityLogId = roomTransaction.getActivityLogId();
        if (activityLogId == null || activityLogId.intValue() == 0) {
            tempFlag = 0;
        } else {
            // use activityType check if 'move request' or 'department space' function.
            final DataRecord dataRecordActivityLog =
                    SpaceTransactionCommon.getActivityLogRecord(activityLogId);
            final String activityType =
                    (String) dataRecordActivityLog.getValue(SpaceConstants.ACTIVITY_LOG
                            + SpaceConstants.DOT + SpaceConstants.ACTIVITY_TYPE);
            
            if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
                tempFlag = 1;
            } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                    || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
                tempFlag = 0;
            }
            
        }
        final List<AssignmentObject> futureRecords =
                this.getFutureRecords(rmpctObject, date, tempFlag);
        if (!futureRecords.isEmpty()) {
            for (final AssignmentObject dataRecord : futureRecords) {
                this.addNonRepeatFutureToList(dataRecord);
            }
            this.backUpFutureAssignments(futureRecords, tempFlag);
        }
    }
    
    /**
     * add non-repeat future records to 'allFutureRecords'.
     * 
     * @param dataRecord AssignmentObject
     */
    private void addNonRepeatFutureToList(final AssignmentObject dataRecord) {
        
        if (this.allFutureRecords.size() > 0) {
            boolean flag = false;
            for (final AssignmentObject assignment : this.allFutureRecords) {
                final RoomTransaction roomTransaction = assignment.getRoomTransaction();
                final RoomTransaction roomTransactionDataRecord = dataRecord.getRoomTransaction();
                if (roomTransaction.getId() == roomTransactionDataRecord.getId()) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                this.allFutureRecords.add(dataRecord);
            }
        } else {
            this.allFutureRecords.add(dataRecord);
        }
    }
    
    /**
     * add current assignment to restore array.
     * 
     * @param assignment RmpctObject :current assignment
     */
    public void addCurrentAssignmentToRestoreArray(final AssignmentObject assignment) {
        
        final List<AssignmentObject> originalfutureRecords = this.allFutureRecords;
        
        final List<AssignmentObject> newFutureRecords = new ArrayList<AssignmentObject>();
        newFutureRecords.add(assignment);
        for (final AssignmentObject futureRecord : originalfutureRecords) {
            newFutureRecords.add(futureRecord);
        }
        this.allFutureRecords = newFutureRecords;
    }
    
    /**
     * Restore future transactions deleted with impacted order.
     * 
     * @param future SpaceFutureTransactionHandler Object
     */
    public void restoreFutureTrans(final SpaceFutureTransactionHandler future) {
        
        final SpaceTransactionMove spaceTransactionMove = new SpaceTransactionMove();
        final SpaceFutureTransactionDepartment spaceFutureTransactionDepartment =
                new SpaceFutureTransactionDepartment();
        final List<AssignmentObject> futureRecords = future.getAllFutureRecords();
        
        for (int i = futureRecords.size() - 1; i >= 0; i--) {
            final AssignmentObject assignment = futureRecords.get(i);
            
            final Integer activityLogId = assignment.getRoomTransaction().getActivityLogId();
            if (activityLogId == null || activityLogId.intValue() == 0) {
                spaceTransactionMove.insertUpdateOneRmpctRecordFromMoveServiceRequest(assignment);
            } else {
                // use activityType check if 'move request' or 'department space' function.
                final DataRecord dataRecordActivityLog =
                        SpaceTransactionCommon.getActivityLogRecord(activityLogId);
                final String activityType =
                        (String) dataRecordActivityLog.getValue(SpaceConstants.ACTIVITY_LOG
                                + SpaceConstants.DOT + SpaceConstants.ACTIVITY_TYPE);
                
                if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
                    spaceFutureTransactionDepartment
                        .insertUpdateOneRmpctRecordFromDpServiceRequest(assignment);
                } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                        || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
                    spaceTransactionMove
                        .insertUpdateOneRmpctRecordFromMoveServiceRequest(assignment);
                    
                }
            }
            
        }
        
    }
}