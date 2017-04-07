package com.archibus.service.space.future;

import java.util.*;

import org.apache.axis.utils.StringUtils;
import org.json.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.*;
import com.archibus.utility.StringUtil;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 */
public final class SpaceFutureTransactionCommon {
    
    /**
     * String Constant 'activityLogIds'.
     * 
     */
    private static final String ACTIVITY_LOG_IDS = "activityLogIds";
    
    /**
     * Represent 'Submit' or 'Approve' operation.
     * 
     */
    private static final int CANCELL = 1;
    
    /**
     * Represent 'Issue' operation.
     * 
     */
    private static final int ISSUE = 5;
    
    /**
     * Empty String Constant ' '.
     * 
     */
    private static final String STRING_SPACE = " ";
    
    /**
     * Represent 'Submit' or 'Approve' operation.
     * 
     */
    private static final int SUBMIT_APPROVE = 0;
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceFutureTransactionCommon() {
    }
    
    /**
     * An employee requests to move out of a location, but there are future transactions for that
     * location that include the employee. return through records as a array and delete these
     * record.
     * 
     * @param date String start date
     * @param flag int 0, move , otherwith dp.
     * @param rmpctObject RmpctObject
     * @return boolean exist return true else false.
     */
    public static boolean detectIfExistFutureTransInvolved(final AssignmentObject rmpctObject,
            final Date date, final int flag) {
        // loop: for each assignment. order by start_date DESC, for each specific time, group by
        // activity_log_id.
        boolean flagExistFuture = false;
        final List<DataRecord> rmpctRecs = getAllFutureAssignments(rmpctObject, date, flag);
        if (rmpctRecs != null && !rmpctRecs.isEmpty()) {
            flagExistFuture = true;
            if (flag == 0) {
                // for department space, need not consider capacity issue, return true if exists
                // future.
                // add new logic consider if over capacity condition.
                final boolean flagOverCapacity =
                        SpaceFutureTransactionCommon.detectFutureTransByCapacity(rmpctObject, date);
                flagExistFuture = flagOverCapacity;
            }
        }
        
        return flagExistFuture;
    }
    
    /**
     * logic consider if over capacity condition.
     * 
     * @param date String start date
     * @param rmpctObject RmpctObject
     * @return boolean exist return true else false.
     */
    private static boolean detectFutureTransByCapacity(final AssignmentObject rmpctObject,
            final Date date) {
        
        boolean flagOverCapacity = false;
        
        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        
        final String fromBlId = roomTransaction.getFromBuildingId();
        final String fromFlId = roomTransaction.getFromFloorId();
        final String fromRmId = roomTransaction.getFromRoomId();
        
        final String blId = roomTransaction.getBuildingId();
        final String flId = roomTransaction.getFloorId();
        final String rmId = roomTransaction.getRoomId();
        
        final Boolean fromIsNotNull =
                !StringUtils.isEmpty(fromBlId) && !StringUtils.isEmpty(fromFlId)
                        && !StringUtils.isEmpty(fromRmId);
        final Boolean toIsNotNull =
                !StringUtils.isEmpty(blId) && !StringUtils.isEmpty(flId)
                        && !StringUtils.isEmpty(rmId);
        
        if ((fromIsNotNull && SpaceFutureTransactionCommon.needRevertFutureTransactions(fromBlId,
            fromFlId, fromRmId, date, true, false))
                || (toIsNotNull && SpaceFutureTransactionCommon.needRevertFutureTransactions(blId,
                    flId, rmId, date, false, false))) {
            flagOverCapacity = true;
        }
        return flagOverCapacity;
    }
    
    /**
     * common method for 'move and department space'. check if Another request exists involving the
     * same employee for a future assignment.
     * 
     * @param emId String em.
     * @param oldBlId String old building id.
     * @param oldFlId String old floor id.
     * @param oldRmId String old room id.
     * 
     * @return result activityLogIds if not null
     */
    public static String detectIfExistsFutureInDefineEm(final String emId, final String oldBlId,
            final String oldFlId, final String oldRmId) {
        
        // IF EXISTS SELECT 1 FROM rmpct where rmpct.em_id=<em_id> and rmpct.date_start >
        // <current date>
        String returnValue = "";
        
        final List<DataRecord> rmpctRecsResult =
                SpaceTransactionCommon.getRecordsInDefineEm(emId, oldBlId, oldFlId, oldRmId);
        
        if (rmpctRecsResult != null && !rmpctRecsResult.isEmpty()) {
            final StringBuffer activityLogString = new StringBuffer();
            for (final DataRecord dataRecord : rmpctRecsResult) {
                if (activityLogString.length() > 0) {
                    activityLogString.append(SpaceConstants.COMMA);
                }
                activityLogString.append(dataRecord.getInt("rmpct.activity_log_id"));
            }
            
            returnValue = activityLogString.toString();
            
        }
        return returnValue;
    }
    
    /**
     * common method for 'move and department space'. check if Another request exists involving the
     * same employee for a future assignment.
     * 
     * @param assignmentsObject JSONObject assignmentsObject
     * @param requestDate String insert date
     * @param bussnessType 0: move management submit or approve 1: move management cancel 5: issue
     *            others: department space.
     * @return result activityLogIds if not null
     */
    public static String detectIfExistsFutureTrans(final JSONObject assignmentsObject,
            final Date requestDate, final int bussnessType) {
        
        StringBuilder result = new StringBuilder().append("[activityLogIds] -- ");
        
        // for insert list
        final JSONArray insertAssignments =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_INSERT);
        // for delete list
        final JSONArray deleteAssignments =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_DELETE);
        boolean notFound = true;
        JSONArray assignments =
                SpaceTransactionCommon.mergeJSONArray(insertAssignments, deleteAssignments);
        if (assignmentsObject.has(SpaceConstants.SIGN_UPDATE)
                && assignmentsObject.get(SpaceConstants.SIGN_UPDATE) != null) {
            // for 'aprove' unchanged also need to check future, but 'issue' not,
            // for 'issue' , set unchange attribute null in parameter 'assignmentsObject'
            final JSONArray unchangedAssignments =
                    assignmentsObject.getJSONArray(SpaceConstants.SIGN_UPDATE);
            assignments = SpaceTransactionCommon.mergeJSONArray(assignments, unchangedAssignments);
        }
        
        final List<List<DataRecord>> rmpctRecs =
                findResultsByBusinessType(requestDate, bussnessType, insertAssignments,
                    deleteAssignments, assignments);
        
        final JSONObject[] jsons = new JSONObject[rmpctRecs.size() + 1];
        
        for (int i = 0; i < rmpctRecs.size(); i++) {
            final JSONObject json = new JSONObject();
            
            final List<DataRecord> dataRecords = rmpctRecs.get(i);
            String strs = STRING_SPACE;
            if (dataRecords != null && !dataRecords.isEmpty()) {
                for (int j = 0; j < dataRecords.size(); j++) {
                    final DataRecord dataRecord = dataRecords.get(j);
                    final Integer activityLogId =
                            dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                                    + SpaceConstants.ACTIVITY_LOG_ID);
                    strs += activityLogId + "-";
                }
                strs = strs.substring(0, strs.length() - 1);
                notFound = false;
            }
            result.append(strs).append(STRING_SPACE);
            json.put("number", String.valueOf(i));
            json.put(ACTIVITY_LOG_IDS, strs);
            jsons[i] = json;
        }
        
        if (notFound) {
            result = new StringBuilder().append("");
        }
        
        return result.length() > 0 ? result.substring(0, result.length() - 1) : "";
    }
    
    /**
     * get all the future trans without repeat pct_id.
     * 
     * @param rmpctObject RmpctObject type
     * @param flag int 0, move , otherwith dp.
     * @param date Date type
     * @return List<DataRecord> non repeat record.
     */
    public static List<DataRecord> getAllFutureAssignments(final AssignmentObject rmpctObject,
            final Date date, final int flag) {
        List<DataRecord> rmpctRecs = null;
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        rmpctDS.addSort(SpaceConstants.RMPCT, SpaceConstants.DATE_START, DataSource.SORT_DESC);
        ParsedRestrictionDef parsedResDef = null;
        if (flag == 0) {
            rmpctRecs = getFutureTransactionsForMove(rmpctObject, date, rmpctDS);
        } else if (flag == 1) {
            parsedResDef =
                    SpaceFutureTransactionRestriction.getResFutureMoveOutForDp(rmpctObject, date);
            rmpctRecs = rmpctDS.getRecords(parsedResDef);
        }
        
        return rmpctRecs;
    }
    
    /**
     * before restore, should consider field parent_pct_id may be taken by current move.
     * 
     * @param requestDate String insert requestDate
     * @param insertAssignments List<RmpctObject>
     * @return insertAssignments
     */
    public static List<AssignmentObject> resetParentForAssignments(
            final List<AssignmentObject> insertAssignments, final Date requestDate) {
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctJoinRmcat();
        for (final AssignmentObject assignment : insertAssignments) {
            
            final RoomTransaction roomTransaction = assignment.getRoomTransaction();
            final ParsedRestrictionDef parsedRmpctResForEmptyToLocation =
                    SpaceTransactionRestriction.getParsedRmpctRestrictionForEmptyToLocation(
                        assignment, requestDate);
            final List<DataRecord> rmpctList = rmpctDS.getRecords(parsedRmpctResForEmptyToLocation);
            if (rmpctList.isEmpty()) {
                roomTransaction.setParentId(0);
                assignment.setRoomTransaction(roomTransaction);
            } else {
                final DataRecord dataRecord = rmpctList.get(0);
                roomTransaction.setParentId(dataRecord.getInt(SpaceConstants.RMPCT
                        + SpaceConstants.DOT + SpaceConstants.PCT_ID));
                assignment.setRoomTransaction(roomTransaction);
                
            }
        }
        return insertAssignments;
    }
    
    /**
     * modify rmpct record to object RoomTransaction.
     * 
     * @param dataRecord DataRecord
     * @return rmpctObject RmpctObject.
     */
    public static AssignmentObject modifyRecordToRoomTransaction(final DataRecord dataRecord) {
        
        final Integer activityLogId =
                dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.ACTIVITY_LOG_ID);
        
        final RoomTransaction roomTransaction = new RoomTransaction();
        
        roomTransaction.setBuildingId(dataRecord.getString(SpaceConstants.RMPCT
                + SpaceConstants.DOT + SpaceConstants.BL_ID));
        roomTransaction.setFloorId(dataRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.FL_ID));
        roomTransaction.setRoomId(dataRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.RM_ID));
        
        roomTransaction.setFromBuildingId(dataRecord.getString(SpaceConstants.RMPCT
                + SpaceConstants.DOT + SpaceConstants.FROM_BL_ID));
        roomTransaction.setFromFloorId(dataRecord.getString(SpaceConstants.RMPCT
                + SpaceConstants.DOT + SpaceConstants.FROM_FL_ID));
        roomTransaction.setFromRoomId(dataRecord.getString(SpaceConstants.RMPCT
                + SpaceConstants.DOT + SpaceConstants.FROM_RM_ID));
        
        roomTransaction.setPrimaryRoom(dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.PRIMARY_RM));
        roomTransaction.setPrimaryEmployee(dataRecord.getInt(SpaceConstants.RMPCT
                + SpaceConstants.DOT + SpaceConstants.PRIMARY_EM));
        roomTransaction.setDivisionId(dataRecord.getString(SpaceConstants.RMPCT
                + SpaceConstants.DOT + SpaceConstants.DV_ID));
        roomTransaction.setDepartmentId(dataRecord.getString(SpaceConstants.RMPCT
                + SpaceConstants.DOT + SpaceConstants.DP_ID));
        
        roomTransaction.setType(dataRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.RM_TYPE));
        roomTransaction.setStatus(1);
        roomTransaction.setEmployeeId(dataRecord.getString(SpaceConstants.RMPCT
                + SpaceConstants.DOT + SpaceConstants.EM_ID));
        roomTransaction.setCategory(dataRecord.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.RM_CAT));
        
        roomTransaction.setId(dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.PCT_ID));
        roomTransaction.setParentId(dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.PARENT_PCT_ID));
        roomTransaction.setActivityLogId(activityLogId);
        
        final Date dateStart =
                dataRecord.getDate(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.DATE_START);
        final Date dateEnd =
                dataRecord.getDate(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.DATE_END);
        roomTransaction.setDateStart(dateStart);
        roomTransaction.setDateEnd(dateEnd);
        
        final AssignmentObject rmpctObject = new AssignmentObject();
        rmpctObject.setAction(SpaceConstants.ACTION_UPDATE);
        rmpctObject.setRoomTransaction(roomTransaction);
        return rmpctObject;
    }
    
    /**
     * common method for 'move and department space'. check if Another request exists involving the
     * same employee for a future assignment.
     * 
     * @param assignments JSONArray
     * @param requestDate String insert date
     * @param bussnessType 0 or 1.
     * @return List<List<DataRecord>> all the futures.
     */
    private static List<List<DataRecord>> addResultsForAssignments(final JSONArray assignments,
            final Date requestDate, final int bussnessType) {
        final List<List<DataRecord>> result = new ArrayList<List<DataRecord>>();
        if (assignments != null) {
            for (int i = 0; i < assignments.length(); i++) {
                
                final JSONObject assignment = assignments.getJSONObject(i);
                final AssignmentObject rmpctObject =
                        SpaceTransactionAssignmentHelper.convertJSONObjectToRmpctObject(assignment);
                // final int currentActivityLogId =
                // assignment.getInt(SpaceConstants.ACTIVITY_LOG_ID);
                ParsedRestrictionDef parsedResDef = null;
                if (bussnessType == 0) {
                    parsedResDef =
                            SpaceFutureTransactionRestriction.getResFutureMoveOutFromAlert(
                                rmpctObject, requestDate);
                } else if (bussnessType == 1) {
                    parsedResDef =
                            SpaceFutureTransactionRestriction.getResFutureMoveOutAlert(rmpctObject,
                                requestDate);
                } else {
                    parsedResDef =
                            SpaceFutureTransactionRestriction.getResFutureMoveToForDpAlert(
                                rmpctObject, requestDate);
                }
                
                final DataSource rmpctActivityDS =
                        SpaceTransactionUtil.getRmpctJoinActivityLogDataSource();
                
                final List<DataRecord> rmpctRecs = rmpctActivityDS.getRecords(parsedResDef);
                result.add(rmpctRecs);
            }
        }
        return result;
    }
    
    /**
     * Find future transaction list for each assignment inside assignments, inserAssignment and
     * deleteAssignment.
     * 
     * @param requestDate String insert date
     * @param bussnessType 0 or 1.
     * @param insertAssignments JSONArray
     * @param deleteAssignments JSONArray
     * @param assignments JSONArray
     * 
     * @return list of found future transactions list for each assignment
     */
    private static List<List<DataRecord>> findResultsByBusinessType(final Date requestDate,
            final int bussnessType, final JSONArray insertAssignments,
            final JSONArray deleteAssignments, final JSONArray assignments) {
        List<List<DataRecord>> rmpctRecs = new ArrayList<List<DataRecord>>();
        
        if (bussnessType == SUBMIT_APPROVE || bussnessType == CANCELL) {
            rmpctRecs = addResultsForAssignments(assignments, requestDate, bussnessType);
        } else if (bussnessType == ISSUE) {
            final List<List<DataRecord>> rmpctRecs0 =
                    addResultsForAssignments(insertAssignments, requestDate, SUBMIT_APPROVE);
            final List<List<DataRecord>> rmpctRecs1 =
                    addResultsForAssignments(deleteAssignments, requestDate, CANCELL);
            rmpctRecs.addAll(rmpctRecs0);
            rmpctRecs.addAll(rmpctRecs1);
        } else {
            rmpctRecs = addResultsForAssignments(assignments, requestDate, bussnessType);
        }
        return rmpctRecs;
    }
    
    /**
     * get all the future transactions for assignments of Move.
     * 
     * @param rmpctObject RmpctObject
     * @param date Date type
     * @param rmpctDS rmpct datasource.
     * 
     * @return list of found future transaction records.
     */
    private static List<DataRecord> getFutureTransactionsForMove(
            final AssignmentObject rmpctObject, final Date date, final DataSource rmpctDS) {
        
        final List<DataRecord> rmpctRecs = new ArrayList<DataRecord>();
        
        final ParsedRestrictionDef parsedInMoveIn =
                SpaceFutureTransactionRestriction.getResFutureFromLocationMoveIn(rmpctObject, date);
        final ParsedRestrictionDef parsedOutMoveIn =
                SpaceFutureTransactionRestriction.getResFutureToLocationMoveIn(rmpctObject, date);
        final ParsedRestrictionDef parsedOutMoveOut =
                SpaceFutureTransactionRestriction.getResFutureToLocationMoveOut(rmpctObject, date);
        final ParsedRestrictionDef parsedFromMoveOut =
                SpaceFutureTransactionRestriction
                    .getResFutureFromLocationMoveOut(rmpctObject, date);
        
        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        if (!StringUtils.isEmpty(roomTransaction.getFromBuildingId())
                && !StringUtils.isEmpty(roomTransaction.getFromFloorId())
                && !StringUtils.isEmpty(roomTransaction.getFromRoomId())) {
            final List<DataRecord> rmpctRecsInIn = rmpctDS.getRecords(parsedInMoveIn);
            final List<DataRecord> rmpctRecsInOut = rmpctDS.getRecords(parsedFromMoveOut);
            rmpctRecs.addAll(rmpctRecsInIn);
            rmpctRecs.addAll(rmpctRecsInOut);
        }
        if (!StringUtils.isEmpty(roomTransaction.getBuildingId())
                && !StringUtils.isEmpty(roomTransaction.getFloorId())
                && !StringUtils.isEmpty(roomTransaction.getRoomId())) {
            final List<DataRecord> rmpctRecsOutIn = rmpctDS.getRecords(parsedOutMoveIn);
            final List<DataRecord> rmpctRecsOutOut = rmpctDS.getRecords(parsedOutMoveOut);
            rmpctRecs.addAll(rmpctRecsOutIn);
            rmpctRecs.addAll(rmpctRecsOutOut);
        }
        
        return rmpctRecs;
    }
    
    /**
     * The intention for this method is to check if we need to use future transaction logic for the
     * give room on the given date.
     * 
     * IF EXISTS SELECT 1 FROM rmpct,activity_log WHERE bl_id=<bl_id> AND fl_id=<fl_id> AND
     * rm_id=<rm_id> and date_start > Date AND rmpct.activity_log_id=activity_log.activity_log_id
     * AND activity_log.activity_type='SERVICE DESK-DEPARTMENT SPACE' THEN TRUE
     * 
     * ELSE IF IsFromLocation= TRUE IF max occupancy > cap_em and max_date> <date> THEN TRUE ELSE
     * FALSE ELSE IF max occupancy >= cap_em and max_date> <date> THEN TRUE ELSE FALSE
     * 
     * @param blId String bl_id
     * @param flId String fl_id
     * @param rmId String rm_id
     * @param requestDate Date request date
     * @param isFromLocation check if it's from location.
     * @param includePending check if include pending request.
     * 
     * @return List<Map> with different form location.
     */
    public static boolean needRevertFutureTransactions(final String blId, final String flId,
            final String rmId, final Date requestDate, final Boolean isFromLocation,
            final Boolean includePending) {
        
        boolean flag = false;
        
        if (StringUtil.notNullOrEmpty(blId) && StringUtil.notNullOrEmpty(flId)
                && StringUtil.notNullOrEmpty(rmId)) {
            // once there is future department space request, no matter if the room is over capacity
            // or
            // not, call future transaction logic.
            
            if (SpaceFutureTransactionCommon.ifExistsDeptartmentFuture(blId, flId, rmId,
                requestDate)) {
                flag = true;
            } else {
                
                final Integer capacityEm = SpaceTransactionCommon.getRoomCapacity(blId, flId, rmId);
                final Integer maxEmOccupancy =
                        SpaceFutureTransactionCommon.getMaxOccupancy(blId, flId, rmId, requestDate,
                            includePending);
                
                // for from location, need to consider move out the em minus 1 condition.
                /*
                 * to location : maxOccupancy>=cap_em ; from location: maxOccupancy>cap_em
                 */
                final int tempCapictiy =
                        isFromLocation ? capacityEm.intValue() + 1 : capacityEm.intValue();
                
                flag = maxEmOccupancy != null && maxEmOccupancy.intValue() >= tempCapictiy;
            }
        }
        
        return flag;
    }
    
    /**
     * Check if exists future department space request.
     * 
     * @param blId building id.
     * @param flId floor id
     * @param rmId room id
     * @param requestDate Date
     * 
     * @return room capacity.
     */
    public static boolean ifExistsDeptartmentFuture(final String blId, final String flId,
            final String rmId, final Date requestDate) {
        
        // EXISTS SELECT 1 FROM rmpct,activity_log WHERE bl_id=<bl_id> AND fl_id=<fl_id> AND
        // rm_id=<rm_id> and date_start > Date AND
        // rmpct.activity_log_id=activity_log.activity_log_id AND
        // activity_log.activity_type=SERVICE DESK-DEPARTMENT SPACE
        final DataSource dsRmpctActivity = SpaceTransactionUtil.getRmpctJoinActivityLogDataSource();
        
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE, Operation.EQUALS);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.GT, RelativeOperation.AND_BRACKET);
        
        final List<DataRecord> list = dsRmpctActivity.getRecords(rmpctResDef);
        return list.isEmpty() ? false : true;
    }
    
    /**
     * get future list of all rmpct records.
     * 
     * @param blId String bl_id
     * @param flId String fl_id
     * @param rmId String rm_id
     * @param requestDate Date request date
     * @SupressWarnings "PMD.AvoidUsingSql": Use SQl with distinct keywords.
     * 
     *                  Justification: Case #1 : Statement with SELECT ... Exists sub-sql pattern.
     * @return List<Map> with different form location.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static List<DataRecord> getAllFutureRecords(final String blId, final String flId,
            final String rmId, final Date requestDate) {
        
        // SELECT DISTINCT (date_start) as <date_start>[count] FROM rmpct
        // WHERE bl_id=<bl_id> AND fl_id=<fl_id> AND rm_id=<rm_id> AND date_start >= <date>
        
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        rmpctDS.addTable(SpaceConstants.RMPCT);
        rmpctDS.addVirtualField(SpaceConstants.RMPCT, SpaceConstants.DATE_START,
            DataSource.DATA_TYPE_DATE);
        rmpctDS
            .addQuery("SELECT distinct(rmpct.date_start) ${sql.as} date_start  FROM rmpct WHERE rmpct.bl_id = '"
                    + blId
                    + "'  "
                    + "   and  rmpct.fl_id = '"
                    + flId
                    + "'  and  rmpct.rm_id =  '"
                    + rmId
                    + "' and  "
                    + "(rmpct.date_end is null or rmpct.date_end >= ${parameters['dateStart']}) ");
        
        rmpctDS.addParameter(SpaceConstants.DATESTART, requestDate, DataSource.DATA_TYPE_DATE);
        rmpctDS.addSort(SpaceConstants.RMPCT, SpaceConstants.DATE_START, DataSource.SORT_ASC);
        rmpctDS.setApplyVpaRestrictions(false);
        return rmpctDS.getRecords();
    }
    
    /**
     * return an occupancy of current location and time.
     * 
     * @param blId String bl_id
     * @param flId String fl_id
     * @param rmId String rm_id
     * @param requestDate Date request date
     * @param includePending check if include pending request.
     * @SupressWarnings "PMD.AvoidUsingSql": Use SQl with count(distinct) keywords.
     * 
     *                  Justification: Case #1 : Statement with SELECT ... Exists sub-sql pattern.
     * @return List<Map> with different form location.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static Integer getCurrentDateOccupancy(final String blId, final String flId,
            final String rmId, final Date requestDate, final Boolean includePending) {
        
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        rmpctDS.addTable(SpaceConstants.RMPCT);
        rmpctDS.addVirtualField("rmpct", "count_em_id", DataSource.DATA_TYPE_INTEGER);
        final String statusStatement = includePending ? "" : " and rmpct.status = 1 ";
        rmpctDS
            .addQuery("SELECT count(distinct(rmpct.em_id)) ${sql.as}  count_em_id  FROM rmpct WHERE rmpct.bl_id = '"
                    + blId
                    + "'"
                    + " and rmpct.fl_id = '"
                    + flId
                    + "' and rmpct.rm_id = '"
                    + rmId
                    + "' "
                    + "and rmpct.em_id is not null "
                    + statusStatement
                    + " and ((rmpct.date_start IS NULL OR rmpct.date_start <= ${parameters['dateStart']} "
                    + ")"
                    + " AND (rmpct.date_end IS NULL OR rmpct.date_end >= ${parameters['dateStart']}"
                    + "))");
        
        rmpctDS.addParameter("dateStart", requestDate, DataSource.DATA_TYPE_DATE);
        rmpctDS.addParameter("dateEnd", requestDate, DataSource.DATA_TYPE_DATE);
        rmpctDS.setApplyVpaRestrictions(false);
        final DataRecord record = rmpctDS.getRecord();
        return record.getInt("rmpct.count_em_id");
        
    }
    
    /**
     * This method is intend to return the max occupancy for the given room after a given date.
     * 
     * @param blId String bl_id
     * @param flId String fl_id
     * @param rmId String rm_id
     * @param requestDate Date request date
     * @param includePending check if include pending request.
     * 
     * @return List<Map> with different form location.
     */
    private static Integer getMaxOccupancy(final String blId, final String flId, final String rmId,
            final Date requestDate, final Boolean includePending) {
        
        final List<DataRecord> rmpctList =
                SpaceFutureTransactionCommon.getAllFutureRecords(blId, flId, rmId, requestDate);
        Integer returnValue = 0;
        // if not future record exists, needn't check capacity any more. return false directly.
        if (!rmpctList.isEmpty()) {
            final List<Integer> listOccupancy = new ArrayList<Integer>();
            for (final DataRecord dataRecord : rmpctList) {
                final Date futureRequireDate = dataRecord.getDate("rmpct.date_start");
                final Integer occupancy =
                        SpaceFutureTransactionCommon.getCurrentDateOccupancy(blId, flId, rmId,
                            futureRequireDate, includePending);
                listOccupancy.add(occupancy);
            }
            returnValue = Collections.max(listOccupancy);
        }
        return returnValue;
    }
    
    /**
     * return the real legend level of max occupancy, real max occupancy and room capacity for the
     * given floor after a given date.
     * 
     * @param blId String bl_id
     * @param flId String fl_id
     * @param rooms JSONArray rm_ids
     * @param requestDate Date request date
     * 
     * @return JSONObject with different form location.
     */
    public static JSONObject getRoomAttribute(final String blId, final String flId,
            final JSONArray rooms, final Date requestDate) {
        
        final JSONObject object = new JSONObject();
        final JSONArray jsonArray = new JSONArray();
        
        for (int i = 0; i < rooms.length(); i++) {
            
            final JSONObject room = rooms.getJSONObject(i);
            final String rmId = room.getString(SpaceConstants.RM_ID);
            final Integer legendLevel =
                    SpaceFutureTransactionCommon.getOccupancyRoomLegendLevel(blId, flId, rmId,
                        requestDate);
            if (legendLevel.intValue() != -1) {
                
                final JSONObject specificObject = new JSONObject();
                
                final int capacityEm = SpaceTransactionCommon.getRoomCapacity(blId, flId, rmId);
                final int maxEmOccupancy =
                        SpaceFutureTransactionCommon.getMaxOccupancy(blId, flId, rmId, requestDate,
                            true);
                specificObject.put("rmId", rmId);
                specificObject.put("maxEmOccupancy", maxEmOccupancy);
                specificObject.put("capacityEm", capacityEm);
                specificObject.put("legendLevel", legendLevel);
                jsonArray.put(specificObject);
                
            }
        }
        object.put("result", jsonArray);
        return object;
    }
    
    /**
     * return the real legend level of max occupancy for the given room after a given date.
     * 
     * @param blId String bl_id
     * @param flId String fl_id
     * @param rmId String rm_id
     * @param requestDate Date request date
     * 
     * @return List<Map> with different form location.
     */
    private static Integer getOccupancyRoomLegendLevel(final String blId, final String flId,
            final String rmId, final Date requestDate) {
        
        int returnValue = -1;
        
        if (SpaceFutureTransactionCommon.needRevertFutureTransactions(blId, flId, rmId,
            requestDate, false, true)) {
            
            final Integer capacityEm = SpaceTransactionCommon.getRoomCapacity(blId, flId, rmId);
            
            final Integer maxEmOccupancy =
                    SpaceFutureTransactionCommon.getMaxOccupancy(blId, flId, rmId, requestDate,
                        true);
            
            final int tempCapictiy = capacityEm.intValue();
            
            if (maxEmOccupancy.intValue() == 0) {
                returnValue = -1;
            } else if (maxEmOccupancy.intValue() < tempCapictiy) {
                // Available
                returnValue = 1;
            } else if (maxEmOccupancy.intValue() == tempCapictiy) {
                // At Capacity
                returnValue = 2;
            } else {
                // Exceeds Capacity
                returnValue = SpaceConstants.NUMBER_3;
            }
            
        }
        
        return returnValue;
    }
    
}