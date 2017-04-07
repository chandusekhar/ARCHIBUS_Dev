package com.archibus.service.space.transaction;

import java.util.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.space.*;
import com.archibus.service.space.future.SpaceFutureTransactionCommon;
import com.archibus.service.space.helper.*;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Space Transaction Department Class, Added by ASC-BJ, Zhang Yi for 20.2 Space.<br>
 * 
 * <p>
 * 
 */
public class SpaceTransactionDepartment {
    
    /**
     * 
     * do submit and approve for one record.
     * 
     * @param assignment RmpctObject
     */
    public void insertUpdateOneRmpctRecordFromDpServiceRequest(final AssignmentObject assignment) {
        
        List<AssignmentObject> assignmentsList = new ArrayList<AssignmentObject>();
        assignmentsList.add(assignment);
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        
        roomTransaction.setStatus(0);
        assignment.setRoomTransaction(roomTransaction);
        assignment.setAction(SpaceConstants.ACTION_INSERT);
        
        final Date dateStart = roomTransaction.getDateStart();
        
        final Integer activityLogId1 = roomTransaction.getActivityLogId();
        final DataRecord dataRecordActivityLog =
                SpaceTransactionCommon.getActivityLogRecord(activityLogId1);
        final String activityType =
                (String) dataRecordActivityLog.getValue(SpaceConstants.ACTIVITY_LOG
                        + SpaceConstants.DOT + SpaceConstants.ACTIVITY_TYPE);
        
        if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
            this.insertUpdateRmpctRecordsFromDpServiceRequest(dateStart, assignmentsList);
            roomTransaction.setStatus(1);
            assignment.setRoomTransaction(roomTransaction);
            assignment.setAction(SpaceConstants.ACTION_UPDATE);
            this.insertUpdateRmpctRecordsFromDpServiceRequest(dateStart, assignmentsList);
        } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
            
            final SpaceTransactionMove transactionMove = new SpaceTransactionMove();
            assignmentsList =
                    SpaceFutureTransactionCommon.resetParentForAssignments(assignmentsList,
                        dateStart);
            transactionMove.insertUpdateRmpctRecordsFromMoveServiceRequest(dateStart,
                assignmentsList);
            roomTransaction.setStatus(1);
            assignment.setRoomTransaction(roomTransaction);
            assignment.setAction(SpaceConstants.ACTION_UPDATE);
            transactionMove.insertUpdateRmpctRecordsFromMoveServiceRequest(dateStart,
                assignmentsList);
        }
        
    }
    
    /**
     * Insert and update rmpct records from department space service request.
     * 
     * @param date request date
     * @param assignmentsList List<RmpctObject> department space request assignment include blId,
     *            flId, rmId, dvId, dpId, status, activityLogId, action
     */
    public void insertUpdateRmpctRecordsFromDpServiceRequest(final Date date,
            final List<AssignmentObject> assignmentsList) {
        
        // get needed data-sources
        final DataSource dsRm = SpaceTransactionUtil.getRmDataSource();
        
        final DataSource dsRmpct = SpaceTransactionUtil.getRmpctDataSource();
        
        final DataSource dsActivityLog = SpaceTransactionUtil.getActivityDataSource();
        
        for (final AssignmentObject assignment : assignmentsList) {
            
            if (assignment.getAction().equals(SpaceConstants.ACTION_INSERT)) {
                
                insertRmpctRecordsFromDpServiceRequest(date, assignment, dsActivityLog, dsRm,
                    dsRmpct);
                
            } else if (SpaceConstants.ACTION_UPDATE.equals(assignment.getAction())) {
                
                updateRmpctRecordsFromDpServiceRequest(date, assignment, dsActivityLog, dsRmpct);
                
            }
        }
    }
    
    /**
     * Sub-method of insertUpdateRmpctRecordsFromDpServiceRequest() is for updating rmpct table when
     * status is 'insert'.
     * 
     * @param date request date
     * @param assignment RmpctObject
     * @param dsActivityLog activity log datasource
     * @param dsRm room datasource
     * @param dsRmpct rmpct datasource
     */
    private void insertRmpctRecordsFromDpServiceRequest(final Date date,
            final AssignmentObject assignment, final DataSource dsActivityLog,
            final DataSource dsRm, final DataSource dsRmpct) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        // get parameter value "AssignUnallocatedSpace"
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String assignUnallocatedSpace =
                EventHandlerBase.getActivityParameterString(context, SpaceConstants.SPACE_ACTIVITY,
                    "AssignUnallocatedSpace");
        
        // get activity log record by id
        final DataRecord activityLogRec =
                dsActivityLog.getRecord(SpaceConstants.ACTIVITY_LOG_ID + SpaceConstants.EQUAL
                        + roomTransaction.getActivityLogId());
        
        // get rm record
        final DataRecord rmRecord =
                SpaceTransactionCommon.getRmRecordByLocationKey(dsRm, new String[] {
                        SpaceConstants.BL_ID, SpaceConstants.FL_ID, SpaceConstants.RM_ID },
                    new Object[] { roomTransaction.getBuildingId(), roomTransaction.getFloorId(),
                            roomTransaction.getRoomId() });
        
        // get rmpct records
        List<DataRecord> rmpctRecords;
        if (StringUtil.isNullOrEmpty(roomTransaction.getDivisionId())
                && StringUtil.isNullOrEmpty(roomTransaction.getDepartmentId())) {
            rmpctRecords =
                    dsRmpct.getRecords(SpaceTransactionRestriction
                        .getParsedRmpctRestrictionForDepartmentRelease(assignment, activityLogRec,
                            date));
        } else {
            rmpctRecords =
                    dsRmpct.getRecords(SpaceTransactionRestriction
                        .getParsedRmpctRestrictionForDepartmentClaim(assignment, date));
            
        }
        
        // loop through rmpct records
        for (final DataRecord record : rmpctRecords) {
            
            final DataRecord rmpctRecord = dsRmpct.createNewRecord();
            
            setFieldValuesFromExistedRmpct(rmpctRecord, record);
            
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                    + SpaceConstants.DATE_START, date);
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                    + SpaceConstants.USER_NAME, ContextStore.get().getUser().getName());
            
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.BL_ID,
                roomTransaction.getBuildingId());
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.FL_ID,
                roomTransaction.getFloorId());
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.RM_ID,
                roomTransaction.getRoomId());
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DV_ID,
                roomTransaction.getDivisionId());
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.STATUS,
                roomTransaction.getStatus());
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                    + SpaceConstants.ACTIVITY_LOG_ID, roomTransaction.getActivityLogId());
            
            SpaceTransactionCommon.setValuesBetweenRecords(rmRecord, rmpctRecord,
                SpaceConstants.T_RM, SpaceConstants.RMPCT, new String[] { SpaceConstants.RM_CAT,
                        SpaceConstants.RM_TYPE });
            
            setFieldValuesForClaimOrRelease(assignment, assignUnallocatedSpace, activityLogRec,
                rmpctRecord, record);
            
            SpaceTransactionUtil.convertNullFieldValues(rmpctRecord);
            dsRmpct.saveRecord(rmpctRecord);
            
            if (roomTransaction.getStatus() == 1) {
                SpaceTransactionCommon.setEndDate(dsRmpct, record, date);
            }
        }
    }
    
    /**
     * Set some field values of newly created rmpct properly based on Release or Claim.
     * 
     * @param assignment department space assignment
     * @param assignUnallocatedSpace value of activity parameter "AssignUnallocatedSpace"
     * @param activityLogRec activity log record
     * @param rmpctRecord new rmpct record
     * @param record existed rmpct record
     */
    private void setFieldValuesForClaimOrRelease(final AssignmentObject assignment,
            final String assignUnallocatedSpace, final DataRecord activityLogRec,
            final DataRecord rmpctRecord, final DataRecord record) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        
        // for release
        // kb#3044116 & kb#3044054: allow operation from user without department, so below only
        // judge the division id.
        if (StringUtil.isNullOrEmpty(roomTransaction.getDivisionId())) {
            SpaceTransactionCommon.setValuesBetweenRecords(record, rmpctRecord,
                SpaceConstants.RMPCT, SpaceConstants.RMPCT,
                new String[] { SpaceConstants.PRIMARY_RM });
            
            if (assignUnallocatedSpace.toLowerCase().contains("ProrateFloor".toLowerCase())) {
                
                rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PRORATE, "FLOOR");
            } else if (assignUnallocatedSpace.toLowerCase().contains(
                "ProrateBuilding".toLowerCase())) {
                rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PRORATE, "BUILDING");
            } else {
                rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PRORATE, "SITE");
            }
            
        } else {
            // for claim
            
            rmpctRecord.setValue(
                SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRORATE, "NONE");
            rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                    + SpaceConstants.PRIMARY_RM, 1);
            SpaceTransactionCommon.setValuesBetweenRecords(activityLogRec, rmpctRecord,
                SpaceConstants.ACTIVITY_LOG, SpaceConstants.RMPCT, new String[] {
                        SpaceConstants.DV_ID, SpaceConstants.DP_ID });
            
        }
    }
    
    /**
     * Copy some field values from existed rmpct to newly created one.
     * 
     * @param rmpctRecord new rmpct record
     * @param record existed rmpct record
     */
    private void setFieldValuesFromExistedRmpct(final DataRecord rmpctRecord,
            final DataRecord record) {
        
        rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.EM_ID,
            record.getValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.EM_ID));
        rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRIMARY_EM,
            record.getValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRIMARY_EM));
        rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.PARENT_PCT_ID,
            record.getValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PCT_ID));
        
        rmpctRecord.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PCT_SPACE,
            record.getValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PCT_SPACE));
        
    }
    
    /**
     * Update rmpct table when status is 'update'.
     * 
     * @param requestDate Date request date
     * @param assignment department space assignment
     * @param dsActivityLog activity log datasource
     * @param dsRmpct rmpct datasource
     */
    private void updateRmpctRecordsFromDpServiceRequest(final Date requestDate,
            final AssignmentObject assignment, final DataSource dsActivityLog,
            final DataSource dsRmpct) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final Integer activityLogId = roomTransaction.getActivityLogId();
        final int status = roomTransaction.getStatus();
        final DataRecord activityLogRec =
                dsActivityLog.getRecord(SpaceConstants.ACTIVITY_LOG_ID + SpaceConstants.EQUAL
                        + activityLogId);
        
        SpaceTransactionUpdate.updateRmpctStatusByActivityLogId(status, activityLogId);
        
        if (status == 1) {
            List<DataRecord> rmpctList;
            // kb#3044116 & kb#3044054: allow operation from user without department, so below only
            // judge the division id.
            if (StringUtil.isNullOrEmpty(roomTransaction.getDivisionId())) {
                rmpctList =
                        dsRmpct.getRecords(SpaceTransactionRestriction
                            .getParsedRmpctRestrictionForDepartmentRelease(assignment,
                                activityLogRec, requestDate));
                
            } else {
                rmpctList =
                        dsRmpct.getRecords(SpaceTransactionRestriction
                            .getParsedRmpctRestrictionForDepartmentClaim(assignment, requestDate));
                
            }
            for (final DataRecord rmpct : rmpctList) {
                SpaceTransactionCommon.setEndDate(dsRmpct, rmpct, requestDate);
            }
        }
        
    }
}
