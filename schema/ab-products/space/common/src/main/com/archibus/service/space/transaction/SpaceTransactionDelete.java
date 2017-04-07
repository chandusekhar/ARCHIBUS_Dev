package com.archibus.service.space.transaction;

import java.util.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.*;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 * <p>
 * 
 */
public final class SpaceTransactionDelete {
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN deleteEmployeeAssignment WFR
    // ---------------------------------------------------------------------------------------------
    
    /**
     * delete assignment employee.
     * 
     * @param activityLogId activity log id
     * @param assignments a list store assignments
     */
    public void deleteEmployeeAssignment(final Integer activityLogId,
            final List<AssignmentObject> assignments) {
        // Initial datasource
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        
        // CK KB# 3035311 - Moved this out of the getRmpctRecordForDelete function to avoid adding
        // multiple sorts
        rmpctDS.addSort(SpaceConstants.RMPCT, SpaceConstants.DATE_START, DataSource.SORT_DESC);
        
        // 2. For each retrieved rmpct record, call method updateAssignmentRmpctRecord() to update
        // or delete all possible affected rmpct records.
        
        for (final AssignmentObject assignment : assignments) {
            
            final RoomTransaction roomTransaction = assignment.getRoomTransaction();
            // 1. get rmpct record that will be deleted from assignment
            final DataRecord rmpctRec = getRmpctRecordForDelete(rmpctDS, assignment);
            
            if (rmpctRec != null) {
                
                final int status =
                        rmpctRec.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                                + SpaceConstants.STATUS);
                // 2. IF <status> = 1 THEN restore affected date_end and delete possible inserted
                // 'from' record.
                if (status == 1) {
                    updateAssignmentRmpctRecord(rmpctDS, rmpctRec, activityLogId);
                }
                
                // delete found rmpct record.
                rmpctDS.deleteRecord(rmpctRec);
                
                // 3. IF <parent_pct_id> IS NULL THEN call WFR updatePercentageOfSpace
                // (<date_start>, <to_bl_id>, <to_fl_id>, <to_rm_id>)
                final Integer parentRmpctId = roomTransaction.getParentId();
                final String blId = roomTransaction.getBuildingId();
                final String flId = roomTransaction.getFloorId();
                final String rmId = roomTransaction.getRoomId();
                final Date dateStart =
                        rmpctRec.getDate(SpaceConstants.RMPCT + SpaceConstants.DOT
                                + SpaceConstants.DATE_START);
                if (parentRmpctId == null || parentRmpctId == 0) {
                    AllRoomPercentageUpdate.updatePercentageOfSpace(dateStart, blId, flId, rmId);
                }
            }
            
        }
    }
    
    /**
     * set ParsedRestrictionDef for search logic with future trans.
     * 
     * @param rmpctResDef ParsedRestrictionDef
     * @param roomTransaction RoomTransaction
     * 
     */
    private void setResDefWithFutureLogic(final ParsedRestrictionDef rmpctResDef,
            final RoomTransaction roomTransaction) {
        /*
         * for future trans change, original logic search by pct_id would be wrong for some data
         * cause by 'updatePercentageOfSpace', change search logic.
         */
        if (StringUtil.notNullOrEmpty(roomTransaction.getBuildingId())
                && StringUtil.notNullOrEmpty(roomTransaction.getFloorId())
                && StringUtil.notNullOrEmpty(roomTransaction.getRoomId())) {
            
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID,
                roomTransaction.getActivityLogId(), Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID,
                roomTransaction.getEmployeeId(), Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID,
                roomTransaction.getBuildingId(), Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID,
                roomTransaction.getFloorId(), Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID,
                roomTransaction.getRoomId(), Operation.EQUALS);
            
        } else if (StringUtil.notNullOrEmpty(roomTransaction.getFromBuildingId())
                && StringUtil.notNullOrEmpty(roomTransaction.getFromFloorId())
                && StringUtil.notNullOrEmpty(roomTransaction.getFromRoomId())) {
            
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID,
                roomTransaction.getActivityLogId(), Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID,
                roomTransaction.getEmployeeId(), Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_BL_ID,
                roomTransaction.getFromBuildingId(), Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_FL_ID,
                roomTransaction.getFromFloorId(), Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_RM_ID,
                roomTransaction.getFromRoomId(), Operation.EQUALS);
        } else {
            final String pctId = String.valueOf(roomTransaction.getId());
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.PCT_ID, pctId,
                Operation.EQUALS);
        }
    }
    
    /**
     * @return found rmpct datarecord by given assignment.
     * 
     * @param rmpctDS rmpct datasource
     * @param assignment an assignment object
     * 
     */
    private DataRecord getRmpctRecordForDelete(final DataSource rmpctDS,
            final AssignmentObject assignment) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        DataRecord rmpctRec = null;
        
        final Integer activityLogId = roomTransaction.getActivityLogId();
        
        if (activityLogId == null) {
            // kb#3034359: for assignment initiated from Move Management, use mo_id but not
            // activity_log_id to find associated rmpct record
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.MO_ID,
                roomTransaction.getMoId(), Operation.EQUALS);
            
        } else {
            
            this.setResDefWithFutureLogic(rmpctResDef, roomTransaction);
        }
        
        final List<DataRecord> rmpctList = rmpctDS.getRecords(rmpctResDef);
        if (rmpctList != null && !rmpctList.isEmpty()) {
            rmpctRec = rmpctList.get(0);
        }
        
        return rmpctRec;
    }
    
    /**
     * update and delete affected rmpct records for an approved employee assignment deletion.
     * 
     * @param rmpctDS DataSource rmpct datasource
     * @param rmpctRecord DataRecord rmpct record
     * @param activityLogId Integer activity log code
     */
    private void updateAssignmentRmpctRecord(final DataSource rmpctDS,
            final DataRecord rmpctRecord, final Integer activityLogId) {
        
        final Integer parentRmpctId =
                rmpctRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PARENT_PCT_ID);
        
        final String fromBlId =
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.FROM_BL_ID);
        final String fromFlId =
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.FROM_FL_ID);
        final String fromRmId =
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.FROM_RM_ID);
        
        final String emId =
                rmpctRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.EM_ID);
        
        final Date dateStart =
                rmpctRecord.getDate(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.DATE_START);
        final Date dateEnd = new Date(dateStart.getTime() - SpaceConstants.ONE_DAY_TIME);
        
        // 1. Restore occupied 'To' rmpct: UPDATE rmpct SET date_end = NULL WHERE pct_id =
        // <parent_pct_id>
        final DataRecord emptyToRmpct =
                rmpctDS.getRecord(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PCT_ID
                        + Operation.EQUALS + parentRmpctId);
        if (emptyToRmpct != null) {
            emptyToRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                    + SpaceConstants.DATE_END, null);
            rmpctDS.saveRecord(emptyToRmpct);
        }
        
        // 2. Restore affected 'From' rmpct: UPDATE rmpct SET date_end = NULL WHERE (activity_log_id
        // IS NULL OR activity_id !=<activity_log_id>) AND bl_id = <from_bl_id> AND fl_id =
        // <from_fl_id> AND rm_id =<from_rm_id> AND em_id = <em_id> AND date_end = <date_start> - 1
        List<DataRecord> rmpctList = null;
        rmpctList =
                SpaceTransactionCommon.getAffectedFromRmpcts(rmpctDS, activityLogId, emId,
                    fromBlId, fromFlId, fromRmId, dateEnd);
        
        DataRecord fromRmpct = null;
        if (!rmpctList.isEmpty()) {
            fromRmpct = rmpctList.get(0);
            fromRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DATE_END,
                null);
            rmpctDS.saveRecord(fromRmpct);
        }
        
        // 3. Delete inserted empty 'From': DELETE rmpct WHERE activity_log_id IS NULL AND bl_id =
        // <from_bl_id> AND fl_id =
        // <from_fl_id> AND rm_id = <from_rm_id> AND em_id IS NULL AND date_start = <date_start>
        final DataRecord insertedFromRmpct =
                fromRmpct == null ? null : rmpctDS.getRecord(SpaceConstants.RMPCT
                        + SpaceConstants.DOT
                        + SpaceConstants.PARENT_PCT_ID
                        + Operation.EQUALS
                        + fromRmpct.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                                + SpaceConstants.PCT_ID));
        if (insertedFromRmpct == null) {
            if (fromBlId != null && fromFlId != null && fromRmId != null) {
                // if didn’t insert an empty 'From' rmpct record to hold the empty room portion,
                // then call updatePercentageOfSpace passing in the from location and start date
                AllRoomPercentageUpdate.updatePercentageOfSpace(dateStart, fromBlId, fromFlId,
                    fromRmId);
            }
            
        } else {
            // delete found empty 'From' rmpct record.
            rmpctDS.deleteRecord(insertedFromRmpct);
        }
        
    }
    
    // ---------------------------------------------------------------------------------------------
    // END deleteEmployeeAssignment WFR
    // ---------------------------------------------------------------------------------------------
    
    // BEGIN deleteDepartmentAssignment WFR
    /**
     * Deletes any existing department assignment information that was removed by either the service
     * provider or the approving manager. It also changes the end date to NULL for other rmpct
     * records that had been set to end as a result of the transaction.
     * 
     * @param activityLogId int activity log id
     * @param assignments a List<RmpctObject>
     * 
     *            Justification: Case #2.2 : Statement with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteDepartmentAssignment(final Integer activityLogId,
            final List<AssignmentObject> assignments) {
        
        // Since below sql is a batch update; so suppress PMD.AvoidUsingSql warning.
        for (final AssignmentObject assignment : assignments) {
            
            final RoomTransaction roomTransaction = assignment.getRoomTransaction();
            final String blId = roomTransaction.getBuildingId();
            final String flId = roomTransaction.getFloorId();
            final String rmId = roomTransaction.getRoomId();
            
            final DataSource dsRmpct = SpaceTransactionUtil.getRmpctDataSource();
            
            final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
            
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId,
                Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId,
                Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId,
                Operation.EQUALS);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID,
                activityLogId, Operation.EQUALS);
            
            final List<DataRecord> rmpctRecords = dsRmpct.getRecords(rmpctResDef);
            
            final DataSource updateRmpctDS = SpaceTransactionUtil.getRmpctDataSource();
            updateRmpctDS.addQuery("UPDATE rmpct SET date_end =null"
                    + "             WHERE (activity_log_id is null or activity_log_id !="
                    + activityLogId + " )AND status=1 "
                    + "                   AND bl_id=${parameters['blId']} "
                    + "                   AND fl_id=${parameters['flId']} "
                    + "                   AND rm_id=${parameters['rmId']} "
                    + "                   AND date_end=${parameters['dateEnd']} ");
            
            updateRmpctDS.addParameter(SpaceConstants.DATEEND, null, DataSource.DATA_TYPE_DATE);
            updateRmpctDS.addParameter(SpaceConstants.BLID, null, DataSource.DATA_TYPE_TEXT);
            updateRmpctDS.addParameter(SpaceConstants.FLID, null, DataSource.DATA_TYPE_TEXT);
            updateRmpctDS.addParameter(SpaceConstants.RMID, null, DataSource.DATA_TYPE_TEXT);
            
            for (final DataRecord record : rmpctRecords) {
                
                final Date dateStart = record.getDate("rmpct.date_start");
                final Date dayBeforeToday =
                        new Date(dateStart.getTime() - SpaceConstants.ONE_DAY_TIME);
                
                if (record
                    .getInt(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.STATUS) == 1) {
                    updateRmpctDS.setParameter(SpaceConstants.DATEEND, dayBeforeToday);
                    updateRmpctDS.setParameter(SpaceConstants.BLID, blId);
                    updateRmpctDS.setParameter(SpaceConstants.FLID, flId);
                    updateRmpctDS.setParameter(SpaceConstants.RMID, rmId);
                    updateRmpctDS.executeUpdate();
                }
                
                dsRmpct.deleteRecord(record);
            }
        }
    }
    
    // END deleteDepartmentAssignment WFR
    
    // BEGIN deleteDepartmentAssignment WFR
    /**
     * Delete rmpct records for cancel request action.
     * 
     * @param activityLogId activity log id.
     * @param assignmentsList assignment List<RmpctObject>.
     */
    public void deleteRmpctRecord(final Integer activityLogId,
            final List<AssignmentObject> assignmentsList) {
        
        final DataRecord dataRecord = SpaceTransactionCommon.getActivityLogRecord(activityLogId);
        final String activityType =
                (String) dataRecord.getValue(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                        + SpaceConstants.ACTIVITY_TYPE);
        
        if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
            new SpaceTransactionDelete().deleteDepartmentAssignment(activityLogId, assignmentsList);
        } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
            new SpaceTransactionDelete().deleteEmployeeAssignment(activityLogId, assignmentsList);
        }
    }
    
    // END deleteDepartmentAssignment WFR
}