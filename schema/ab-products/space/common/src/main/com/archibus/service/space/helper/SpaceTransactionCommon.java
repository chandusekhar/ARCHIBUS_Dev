package com.archibus.service.space.helper;

import java.util.*;

import org.json.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.helpdesk.QuestionnaireHandler;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.transaction.SpaceTransactionUpdate;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 */
public final class SpaceTransactionCommon {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceTransactionCommon() {
    }
    
    /**
     * 
     * This method apply end date to rmpcts of to location.
     * 
     * @param rmpctDS DataSource rmpct datasource
     * @param assignment RmpctObject an employee assignment
     * @param requestDate Date requested move date
     * 
     */
    public static void applyEndDateToMovingInRmpcts(final DataSource rmpctDS,
            final AssignmentObject assignment, final Date requestDate) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        int parentPctId = roomTransaction.getParentId();
        
        if (parentPctId == 0) {
            // if room part from assignment was null, check if it's really null use sql.if not
            // empty, give a default value and update rmpct record.
            final List<DataRecord> rmpctList =
                    SpaceTransactionCommon.getAllRoomPart(assignment, requestDate);
            if (!rmpctList.isEmpty()) {
                
                // current room part was till can not be used, assign a new room part.
                SpaceTransactionCommon.updateRmpctWithNewRoomPart(assignment, requestDate,
                    rmpctList);
                parentPctId = assignment.getRoomTransaction().getParentId();
            }
        } else {
            
            // if current room part was used then assign another room part, if no room part exists
            // assign null.
            final AssignmentObject newAssignment =
                    SpaceTransactionCommon.resetParentForAssignment(assignment, requestDate,
                        parentPctId);
            parentPctId = newAssignment.getRoomTransaction().getParentId();
            
        }
        if (parentPctId == 0) {
            
            // ELSE updatePercentageOfSpace (<to_bl_id>, <to_fl_id>, <to_rm_id>, <date>)
            AllRoomPercentageUpdate.updatePercentageOfSpace(requestDate,
                roomTransaction.getBuildingId(), roomTransaction.getFloorId(),
                roomTransaction.getRoomId());
        } else {
            // IF <selected_rmpct_id> IS NOT NULL THEN
            // UPDATE rmpct SET date_end = <date - 1> WHERE pct_id = <selected_rmpct_id>
            final DataRecord rmpct =
                    rmpctDS.getRecord(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.PCT_ID + SpaceConstants.EQUAL + parentPctId);
            if (rmpct != null) {
                setEndDate(rmpctDS, rmpct, requestDate);
            }
            
        }
    }
    
    /**
     * check if current room part was used and assign another room part or empty according different
     * situation.
     * 
     * @param requestDate String insert requestDate
     * @param assignment JSONObject
     * @param parentPctId Integer
     * @return assignment
     */
    private static AssignmentObject resetParentForAssignment(final AssignmentObject assignment,
            final Date requestDate, final Integer parentPctId) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final List<DataRecord> rmpctList =
                SpaceTransactionCommon.getAllRoomPart(assignment, requestDate);
        if (rmpctList.isEmpty()) {
            // no room part useable, set parent_pct_id empty.
            roomTransaction.setParentId(0);
            assignment.setRoomTransaction(roomTransaction);
        } else {
            // check if current room part was used in another approved assignment.
            boolean flag = true;
            for (final DataRecord dataRecord : rmpctList) {
                final Integer existsParentPctId =
                        dataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                                + SpaceConstants.PCT_ID);
                if (parentPctId.equals(existsParentPctId)) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                // current room part was till can not be used, assign a new room part.
                SpaceTransactionCommon.updateRmpctWithNewRoomPart(assignment, requestDate,
                    rmpctList);
            }
            
        }
        return assignment;
    }
    
    /**
     * if without or with wrong room part , given a room part and update rmpct record.
     * 
     * @param requestDate String insert requestDate
     * @param assignment JSONObject
     * @param rmpctList List<DataRecord>
     */
    private static void updateRmpctWithNewRoomPart(final AssignmentObject assignment,
            final Date requestDate, final List<DataRecord> rmpctList) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        
        // current room part was till can not be used, assign a new room part.
        final DataRecord dataRecord = rmpctList.get(0);
        
        final int newParentPctId =
                dataRecord
                    .getInt(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PCT_ID);
        
        roomTransaction.setParentId(newParentPctId);
        assignment.setRoomTransaction(roomTransaction);
        
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctJoinRmcat();
        
        int pctId = roomTransaction.getId();
        // if pct_id has changed. search new generated rmpct record .
        final ParsedRestrictionDef parsedRmpctResForEmptyToLocation =
                SpaceTransactionRestriction.getParsedRmpctRestrictionForOriginalRmpct(assignment,
                    requestDate);
        final List<DataRecord> newRmpctList = rmpctDS.getRecords(parsedRmpctResForEmptyToLocation);
        // current room part was till can not be used, assign a new room part.
        if (!newRmpctList.isEmpty()) {
            final DataRecord rmpctDataRecord = newRmpctList.get(0);
            pctId =
                    rmpctDataRecord.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.PCT_ID);
        }
        
        SpaceTransactionUpdate.updateRmpctParentByPctId(pctId, newParentPctId);
        
    }
    
    /**
     * get all room part if it's exists.
     * 
     * @param requestDate String insert requestDate
     * @param assignment JSONObject
     * @return assignment
     */
    private static List<DataRecord> getAllRoomPart(final AssignmentObject assignment,
            final Date requestDate) {
        
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctJoinRmcat();
        
        final ParsedRestrictionDef parsedRmpctResForEmptyToLocation =
                SpaceTransactionRestriction.getParsedRmpctRestrictionForEmptyToLocation(assignment,
                    requestDate);
        return rmpctDS.getRecords(parsedRmpctResForEmptyToLocation);
    }
    
    /**
     * @return if passed in parameter are all not null.
     * 
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     * 
     */
    public static boolean checkNotEmpty(final String blId, final String flId, final String rmId) {
        boolean notEmpty = false;
        
        if (StringUtil.notNullOrEmpty(blId) && StringUtil.notNullOrEmpty(flId)
                && StringUtil.notNullOrEmpty(rmId)) {
            notEmpty = true;
        }
        
        return notEmpty;
    }
    
    /**
     * This method found an existed and not-used empty rmpct and set its pct_id as assingment's
     * parent_pct_id.
     * 
     * @param rmpctList List<DataRecord> rmpct list
     * @param assignment RmpctObject an employee assignment
     * @param assignmentsToInsert List<DataRecord> of assignment object
     * 
     * @return index of matched empty room part
     */
    public static int findMatchedEmptyPctForRequestFromMoveManagement(
            final List<DataRecord> rmpctList, final AssignmentObject assignment,
            final List<AssignmentObject> assignmentsToInsert) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        int matched = -1;
        final int size = rmpctList.size();
        
        for (int i = size - 1; i >= 0; i--) {
            
            boolean found = false;
            final DataRecord existedEmptyRmpct = rmpctList.get(i);
            
            final int pctId =
                    existedEmptyRmpct.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.PCT_ID);
            for (final AssignmentObject assignmentToInsert : assignmentsToInsert) {
                
                final int parentPctId = assignmentToInsert.getRoomTransaction().getParentId();
                if (parentPctId == pctId && !assignment.equals(assignmentToInsert)) {
                    found = true;
                    break;
                }
            }
            final Integer moId = assignment.getRoomTransaction().getMoId();
            if (!found && moId != null) {
                
                // find a matched but not occupied empty 'to location' room part for request from
                // move management.
                matched = i;
                
                // kb#3035252: set selected pct id to assignment
                // kb#3035445: add checking if exists mo_id.
                roomTransaction.setParentId(pctId);
                assignment.setRoomTransaction(roomTransaction);
                break;
            }
        }
        
        return matched;
    }
    
    /**
     * Get activity log status by activity log id.
     * 
     * @param activityLogId activity log id .
     * @return status
     */
    public static DataRecord getActivityLogRecord(final Integer activityLogId) {
        final DataSource updateActivityLogDS = SpaceTransactionUtil.getActivityDataSource();
        
        return updateActivityLogDS.getRecord(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                + SpaceConstants.ACTIVITY_LOG_ID + SpaceConstants.EQUAL + activityLogId);
    }
    
    /**
     * @return a list of rmpct records that their from location and date_end or date-start value are
     *         matching passed-in parameter values.
     * 
     * @param rmpctDS DataSource rmpct datasource
     * @param emId String employee id
     * @param activityLogId String activity log id
     * @param fromBlId String building id
     * @param fromFlId String floor id
     * @param fromRmId String room id
     * @param date Date start date or end date
     * 
     */
    public static List<DataRecord> getAffectedFromRmpcts(final DataSource rmpctDS,
            final Integer activityLogId, final String emId, final String fromBlId,
            final String fromFlId, final String fromRmId, final Date date) {
        
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, fromBlId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, fromFlId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, fromRmId,
            Operation.EQUALS);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID, emId, Operation.EQUALS);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, activityLogId,
            Operation.NOT_EQUALS, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NULL, RelativeOperation.OR);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, date,
            Operation.EQUALS, RelativeOperation.AND_BRACKET);
        return rmpctDS.getRecords(rmpctResDef);
        
    }
    
    /**
     * @return a list of rmpct records that their location and date_end value are matching passed-in
     *         parameter values.
     * 
     * @param rmpctDS DataSource rmpct datasource
     * @param blId String building id
     * @param flId String floor id
     * @param rmId String room id
     * @param dateEnd Date end date
     * 
     */
    public static List<DataRecord> getAffectedToRmpcts(final DataSource rmpctDS, final String blId,
            final String flId, final String rmId, final Date dateEnd) {
        
        // construct a parsed restriction with below condition:
        // WHERE activity_log_id IS NULL AND bl_id = <to_bl_id> AND fl_id = <to_fl_id> AND rm_id =
        // <to_rm_id> AND em_id IS NULL AND date_end = dateEnd
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId, Operation.EQUALS);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID, null, Operation.IS_NULL);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NULL);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, dateEnd,
            Operation.EQUALS);
        
        return rmpctDS.getRecords(rmpctResDef);
        
    }
    
    /**
     * @return number of assignments that matching the from location.
     * 
     * @param assignments assignments
     * @param fromBlId String from building code
     * @param fromFlId String from floor code
     * @param fromRmId String from room code
     */
    public static int getCountOfAssignmentsByFromLocation(final List<AssignmentObject> assignments,
            final String fromBlId, final String fromFlId, final String fromRmId) {
        int count1 = 0;
        
        for (final AssignmentObject assignmentJ : assignments) {
            final RoomTransaction roomTransaction = assignmentJ.getRoomTransaction();
            if (roomTransaction.getFromBuildingId().equals(fromBlId)
                    && roomTransaction.getFromFloorId().equals(fromFlId)
                    && roomTransaction.getFromRoomId().equals(fromRmId)) {
                count1++;
            }
        }
        return count1;
    }
    
    /**
     * 
     * This workflow rule get date_end for 'group move' and date_start for 'individual move' by
     * activity_log_id. status
     * 
     * @param activityLogId activity log id
     * 
     */
    public static void getDateValByActivityLogId(final Integer activityLogId) {
        
        final DataSource acLogDS = SpaceTransactionUtil.getActivityDataSource();
        
        final DataRecord acLogRec =
                acLogDS.getRecord(SpaceConstants.ACTIVITY_LOG_ID + SpaceConstants.EQUAL
                        + activityLogId);
        if (acLogRec == null) {
            return;
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final QuestionnaireHandler questionnaireHandler = new QuestionnaireHandler();
        final Map<String, Object> questAnswers =
                questionnaireHandler.getAnswers(context, SpaceConstants.ACTIVITY_LOG,
                    SpaceConstants.ACTIVITY_LOG_ID, SpaceConstants.ACT_QUEST, activityLogId);
        String date = null;
        if (SpaceConstants.SERVICE_DESK_GROUP_MOVE.equalsIgnoreCase(acLogRec
            .getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                    + SpaceConstants.ACTIVITY_TYPE))) {
            date = (String) questAnswers.get(SpaceConstants.DATE_END);
        } else {
            date = (String) questAnswers.get(SpaceConstants.DATE_START);
        }
        final JSONObject dateResult = new JSONObject();
        dateResult.put(SpaceConstants.DATE_END, date);
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, dateResult.toString());
    }
    
    /**
     * Return em record.
     * 
     * @param emDS DataSource em datasource
     * 
     * @param emId String em id
     * 
     * @return DataRecord rmpct join activity log datasource
     */
    public static DataRecord getEmRecordById(final DataSource emDS, final String emId) {
        return emDS.getRecord(SpaceConstants.EM_ID + SpaceConstants.EQUAL + SpaceConstants.APO
                + SqlUtils.makeLiteralOrBlank(emId) + SpaceConstants.APO);
    }
    
    /**
     * Get a restriction use search if the record has exists in db.
     * 
     * @param newRecord using for getting role_name and activity_id
     * 
     * @return ParsedRestrictionDef
     */
    public static ParsedRestrictionDef getNewRecordRestrictionOfRoleProcess(
            final DataRecord newRecord) {
        final ParsedRestrictionDef hasRecordResDef = new ParsedRestrictionDef();
        hasRecordResDef.addClause(
            SpaceConstants.AFM_ROLEPROCS,
            SpaceConstants.ACTIVITY_ID,
            newRecord.getValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                    + SpaceConstants.ACTIVITY_ID), Operation.EQUALS);
        hasRecordResDef.addClause(
            SpaceConstants.AFM_ROLEPROCS,
            SpaceConstants.PROCESS_ID,
            newRecord.getValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                    + SpaceConstants.PROCESS_ID), Operation.EQUALS);
        hasRecordResDef.addClause(
            SpaceConstants.AFM_ROLEPROCS,
            SpaceConstants.ROLE_NAME,
            newRecord.getValue(SpaceConstants.AFM_ROLEPROCS + SpaceConstants.DOT
                    + SpaceConstants.ROLE_NAME), Operation.EQUALS);
        return hasRecordResDef;
    }
    
    /**
     * @return a list of rmpct records.
     * 
     * @param rmpctDS DataSource rmpct datasource
     * @param fieldsArray String[] field name array
     * @param values Object[] field value array
     * 
     */
    public static DataRecord getRmpctRecordByEqualClausesOfFields(final DataSource rmpctDS,
            final String[] fieldsArray, final Object[] values) {
        final ParsedRestrictionDef rmPctResDef = new ParsedRestrictionDef();
        for (int i = 0; i < fieldsArray.length; i++) {
            rmPctResDef
                .addClause(SpaceConstants.RMPCT, fieldsArray[i], values[i], Operation.EQUALS);
        }
        
        DataRecord rmpct = null;
        if (!rmpctDS.getRecords(rmPctResDef).isEmpty()) {
            rmpct = rmpctDS.getRecords(rmPctResDef).get(0);
        }
        
        return rmpct;
    }
    
    /**
     * return rm record restricted by given fields and their values.
     * 
     * @param rmDS DataSource rm datasource
     * @param fieldsArray String[]field name array
     * @param values Object[] values array of fieldsArray
     * 
     * @return DataRecord rm record.
     */
    public static DataRecord getRmRecordByLocationKey(final DataSource rmDS,
            final String[] fieldsArray, final Object[] values) {
        final ParsedRestrictionDef rmResDef = new ParsedRestrictionDef();
        for (int i = 0; i < fieldsArray.length; i++) {
            rmResDef.addClause(SpaceConstants.T_RM, fieldsArray[i], values[i], Operation.EQUALS);
        }
        
        DataRecord rmRec = null;
        if (!rmDS.getRecords(rmResDef).isEmpty()) {
            rmRec = rmDS.getRecords(rmResDef).get(0);
        }
        
        return rmRec;
    }
    
    /**
     * This method serve as a WFR to check to get Service Provider for java use.
     * 
     * @param activityLogId activityLogId.
     * @return a string of serviceProvider
     */
    public static String getServiceProvider(final Integer activityLogId) {
        String serviceProvider = "";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, "activity_log", "activity_log_id",
                    activityLogId);
        
        if (sla != null) {
            if (StringUtil.notNullOrEmpty(sla.getResponseStringParameter(SpaceConstants.EM_ID))) {
                serviceProvider = sla.getResponseStringParameter(SpaceConstants.EM_ID);
            } else if (StringUtil.notNullOrEmpty(sla
                .getResponseStringParameter(SpaceConstants.VN_ID))) {
                serviceProvider = sla.getResponseStringParameter(SpaceConstants.VN_ID);
            } else if (StringUtil.notNullOrEmpty(sla
                .getResponseStringParameter(SpaceConstants.ACTIVITY_ID))) {
                serviceProvider = sla.getResponseStringParameter(SpaceConstants.ACTIVITY_ID);
            }
        }
        return serviceProvider;
    }
    
    /**
     * @return number of un-empty rmpcts(em_id is not null) for from location.
     * 
     * @param rpList rmpct record list
     */
    public static int getUnEmptyCount(final List<DataRecord> rpList) {
        int count = 0;
        for (final DataRecord rp : rpList) {
            if (StringUtil.notNullOrEmpty(rp.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                    + SpaceConstants.EM_ID))) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * get distinct from location with employee.
     * 
     * @param fromLocationCount calculated count by from location
     * @param assignments assignments
     * @param requestDate Date requested move date
     * @param rmpctDS DataSource rmpct datasource
     * @param rmDS DataSource rm datasource
     */
    public static void initialFromLocationMap(final Map<String, int[]> fromLocationCount,
            final List<AssignmentObject> assignments, final Date requestDate,
            final DataSource rmpctDS, final DataSource rmDS) {
        String fromBlId;
        String fromFlId;
        String fromRmId;
        if (assignments != null) {
            for (final AssignmentObject assignment : assignments) {
                final RoomTransaction roomTransaction = assignment.getRoomTransaction();
                if (roomTransaction.getStatus() != 1) {
                    break;
                }
                fromBlId = roomTransaction.getFromBuildingId();
                fromFlId = roomTransaction.getFromFloorId();
                fromRmId = roomTransaction.getFromRoomId();
                
                if (!StringUtil.notNullOrEmpty(fromBlId) || !StringUtil.notNullOrEmpty(fromFlId)
                        || !StringUtil.notNullOrEmpty(fromRmId)) {
                    continue;
                }
                
                int[] count;
                /*
                 * count[0]: all records search by to location. count[1]:number of assignments that
                 * matching the from location. count[2]: capacity employee. count[3]: all records
                 * with em was empty.
                 */
                if (!fromLocationCount.containsKey(fromBlId + fromFlId + fromRmId)) {
                    count = new int[SpaceConstants.PROPERTY_COUNT];
                    
                    final ParsedRestrictionDef rmpctFromLocationRestriction =
                            SpaceTransactionRestriction.getParsedRmpctRestrictionForFromLocation(
                                assignment, requestDate, false);
                    
                    final List<DataRecord> rpList =
                            rmpctDS.getRecords(rmpctFromLocationRestriction);
                    count[0] = rpList.size();
                    
                    count[SpaceConstants.PROPERTY_COUNT - 1] =
                            count[0] - SpaceTransactionCommon.getUnEmptyCount(rpList);
                    
                    final ParsedRestrictionDef rmLocationRestriction =
                            SpaceTransactionRestriction.getParsedRmpctRestrictionForLocation(
                                fromBlId, fromFlId, fromRmId);
                    count[2] =
                            rmDS.getRecords(rmLocationRestriction)
                                .get(0)
                                .getInt(
                                    SpaceConstants.T_RM + SpaceConstants.DOT
                                            + SpaceConstants.CAP_EM);
                    count[1] =
                            SpaceTransactionCommon.getCountOfAssignmentsByFromLocation(assignments,
                                fromBlId, fromFlId, fromRmId);
                    
                    fromLocationCount.put(fromBlId + fromFlId + fromRmId, count);
                }
                count = fromLocationCount.get(fromBlId + fromFlId + fromRmId);
                
                final ParsedRestrictionDef rmpctFromLocationRestriction =
                        SpaceTransactionRestriction.getParsedRmpctRestrictionForFromLocation(
                            assignment, requestDate, true);
                if (rmpctDS.getRecords(rmpctFromLocationRestriction).size() == 0) {
                    count[1] = count[1] - 1;
                }
                
                fromLocationCount.put(fromBlId + fromFlId + fromRmId, count);
            }
            
        }
    }
    
    /**
     * merge two array 'insertAssignments' and 'unchangeAssignments' to one.
     * 
     * @param insertAssignments insert Assignments
     * @param unchangeAssignments unchange Assignments
     * @return JSONArray Object
     */
    public static JSONArray mergeJSONArray(final JSONArray insertAssignments,
            final JSONArray unchangeAssignments) {
        JSONArray assignments;
        if (insertAssignments == null) {
            assignments = unchangeAssignments;
        } else {
            for (int i = 0; i < unchangeAssignments.length(); i++) {
                insertAssignments.put(unchangeAssignments.getJSONObject(i));
            }
            assignments = insertAssignments;
        }
        return assignments;
    }
    
    /**
     * Set field values of assignment to new rmpct record.
     * 
     * 
     * @param assignment JSONObject assignment object
     * @param rmpctRec DataRecord rmpct record
     * @param requestDate Date request date
     * 
     */
    public static void saveValueToRmpct(final AssignmentObject assignment,
            final DataRecord rmpctRec, final Date requestDate) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final String fromBlId = roomTransaction.getFromBuildingId();
        final String fromFlId = roomTransaction.getFromFloorId();
        final String fromRmId = roomTransaction.getFromRoomId();
        
        saveValueFromAssignmentToRmpct(assignment, rmpctRec);
        
        // kb#3034359: add mo_id to inserted rmpct
        final Integer moId = roomTransaction.getMoId();
        if (moId != null) {
            rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.MO_ID,
                moId == 0 ? null : moId);
        }
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DATE_START,
            requestDate);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.FROM_BL_ID,
            fromBlId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.FROM_FL_ID,
            fromFlId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.FROM_RM_ID,
            fromRmId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.USER_NAME,
            ContextStore.get().getUser().getEmployee().getId());
    }
    
    /**
     * Set field values of assignment to new rmpct record.
     * 
     * new String[] { SpaceConstants.EM_ID, SpaceConstants.BL_ID, SpaceConstants.PARENT_PCT_ID,
     * SpaceConstants.FL_ID, SpaceConstants.RM_ID, SpaceConstants.STATUS,
     * SpaceConstants.ACTIVITY_LOG_ID, SpaceConstants.DV_ID, SpaceConstants.DP_ID,
     * SpaceConstants.RM_CAT, SpaceConstants.RM_TYPE, SpaceConstants.PCT_SPACE,
     * SpaceConstants.PRIMARY_EM, SpaceConstants.PRIMARY_RM, SpaceConstants.PRORATE }
     * 
     * @param assignment JSONObject assignment object
     * @param rmpctRec DataRecord rmpct record
     * 
     */
    public static void saveValueFromAssignmentToRmpct(final AssignmentObject assignment,
            final DataRecord rmpctRec) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final String emId = roomTransaction.getEmployeeId();
        final String blId = roomTransaction.getBuildingId();
        final String flId = roomTransaction.getFloorId();
        final String rmId = roomTransaction.getRoomId();
        
        final int parentId = roomTransaction.getParentId();
        final int status = roomTransaction.getStatus();
        final Integer activityLog = roomTransaction.getActivityLogId();
        final String dvId = roomTransaction.getDivisionId();
        final String dpId = roomTransaction.getDepartmentId();
        final String rmCat = roomTransaction.getCategory();
        final String rmType = roomTransaction.getType();
        final double pctSpace = roomTransaction.getPercentageOfSpace();
        final int primaryEm = roomTransaction.getPrimaryEmployee();
        final int primaryRm = roomTransaction.getPrimaryRoom();
        final String prorate = roomTransaction.getProrate();
        
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.EM_ID, emId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.BL_ID, blId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.FL_ID, flId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.RM_ID, rmId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PARENT_PCT_ID,
            parentId);
        rmpctRec
            .setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.STATUS, status);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.ACTIVITY_LOG_ID, activityLog);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DV_ID, dvId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DP_ID, dpId);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.RM_CAT, rmCat);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.RM_TYPE,
            rmType);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PCT_SPACE,
            pctSpace);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRIMARY_EM,
            primaryEm);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRIMARY_RM,
            primaryRm);
        rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRORATE,
            prorate);
    }
    
    /**
     * Set all date_end field value of rmpct records restricted to be requestDate -1.
     * 
     * @param rmpctDS DataSource rmpct datasource
     * @param rmpct DataRecord rmpct record
     * @param requestDate Date request date
     * 
     */
    public static void setEndDate(final DataSource rmpctDS, final DataRecord rmpct,
            final Date requestDate) {
        
        if (rmpct != null) {
            final Date dateEnd = new Date(requestDate.getTime() - SpaceConstants.ONE_DAY_TIME);
            final Date dateStart =
                    rmpct.getDate(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.DATE_START);
            if (dateStart != null && dateEnd.before(dateStart)) {
                rmpctDS.deleteRecord(rmpct);
                
            } else {
                rmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DATE_END,
                    dateEnd);
                rmpctDS.saveRecord(rmpct);
            }
        }
    }
    
    /**
     * Set all date_end field value of rmpct records restricted to be requestDate -1.
     * 
     * @param rmpctDS DataSource rmpct datasource
     * @param rmpctResDef ParsedRestrictionDef rmpct restriction
     * @param requestDate Date request date
     * 
     */
    public static void setEndDateToRmpct(final DataSource rmpctDS,
            final ParsedRestrictionDef rmpctResDef, final Date requestDate) {
        // get rmpct list and loop through it, for each rmpct record set date_end to requestDate -1
        final List<DataRecord> rmpctList = rmpctDS.getRecords(rmpctResDef);
        
        for (final DataRecord rmpct : rmpctList) {
            setEndDate(rmpctDS, rmpct, requestDate);
        }
    }
    
    /**
     * This method serve as a WFR to check if scenario_em matches the room standard and employee
     * standard restriction based on rMstd_emstd table.
     * 
     * @param matchResult JSONObject
     * @param rmRec DataRecord rm record
     * 
     */
    public static void setMatchResultByRm(final JSONObject matchResult, final DataRecord rmRec) {
        if (rmRec == null) {
            matchResult.put(SpaceConstants.IS_MATAHED, SpaceConstants.FALSE);
        } else {
            matchResult.put(SpaceConstants.IS_MATAHED, SpaceConstants.TRUE);
        }
    }
    
    /**
     * Set status and action.
     * 
     * @param assignments List<RmpctObject> that need inert or update.
     * @param status activity log status.
     * @param action insert or update rmpct record tag.
     */
    public static void setStatusAndAction(final List<AssignmentObject> assignments,
            final int status, final String action) {
        
        for (final AssignmentObject assignment : assignments) {
            final RoomTransaction roomTransaction = assignment.getRoomTransaction();
            roomTransaction.setStatus(status);
            assignment.setAction(action);
            assignment.setRoomTransaction(roomTransaction);
            
        }
    }
    
    /**
     * Set specified fields value from assignment to rmpct record.
     * 
     * @param srcRec DataRecord source record
     * @param destRec DataRecord destination record
     * @param srcTable String source table name
     * @param destTable String destination table name
     * @param fieldsArray String[] fields name array
     * 
     */
    public static void setValuesBetweenRecords(final DataRecord srcRec, final DataRecord destRec,
            final String srcTable, final String destTable, final String[] fieldsArray) {
        // Loop through fieldArray, for each field get value from srcRec and set it to destRec
        for (final String field : fieldsArray) {
            destRec.setNullableValue(destTable + SpaceConstants.DOT + field,
                srcRec.getValue(srcTable + SpaceConstants.DOT + field));
        }
    }
    
    /**
     * Get a certain room capacity.
     * 
     * @param blId building id.
     * @param flId floor id
     * @param rmId room id
     * 
     * @return room capacity.
     */
    public static Integer getRoomCapacity(final String blId, final String flId, final String rmId) {
        
        final DataSource theRoomDS = SpaceTransactionUtil.getRmDataSource();
        final ParsedRestrictionDef rmResDef = new ParsedRestrictionDef();
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.RM_ID, rmId, Operation.EQUALS);
        
        final List<DataRecord> list = theRoomDS.getRecords(rmResDef);
        final DataRecord dataRecord = list.get(0);
        return dataRecord.getInt("rm.cap_em");
    }
    
    /**
     * get records in define employee.
     * 
     * @param emId String em.
     * @param oldBlId String old building id.
     * @param oldFlId String old floor id.
     * @param oldRmId String old room id.
     * 
     * @return result activityLogIds if not null
     */
    public static List<DataRecord> getRecordsInDefineEm(final String emId, final String oldBlId,
            final String oldFlId, final String oldRmId) {
        
        // IF EXISTS SELECT 1 FROM rmpct where rmpct.em_id=<em_id> and rmpct.date_start >
        // <current date>
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        final Date currentDate = new Date();
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID, emId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_BL_ID, oldBlId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_FL_ID, oldFlId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_RM_ID, oldRmId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, currentDate,
            Operation.GT, RelativeOperation.AND_BRACKET);
        
        return rmpctDS.getRecords(rmpctResDef);
    }
}