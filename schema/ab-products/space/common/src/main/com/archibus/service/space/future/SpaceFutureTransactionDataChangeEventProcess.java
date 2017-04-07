package com.archibus.service.space.future;

import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.*;

/**
 * <p>
 * SpaceFutureTransactionDataChangeEventProcess Class include the logic of future transaction of
 * data change event.
 * <p>
 */
public final class SpaceFutureTransactionDataChangeEventProcess {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceFutureTransactionDataChangeEventProcess() {
        
    }
    
    /**
     * detect future transactions for primary room attribute change.
     * 
     * @param blId String building id
     * @param flId String floor id
     * @param rmId String room id
     * @param date String check date
     * @return boolean If exits future transaction return true, else return false.
     */
    public static boolean detectIfExistFutureTransForRoomAttributeChange(final String blId,
            final String flId, final String rmId, final Date date) {
        
        // detect result and the default value is true
        boolean detectResult = true;
        
        // create restriction object for future transaction query
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, date, Operation.GT);
        
        // get the result list of future transaction
        final DataSource futureRmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        final List<DataRecord> futureRmpcts = futureRmpctDS.getRecords(rmpctResDef);
        
        // if the future transaction is empty , set the detectResult to false
        if (futureRmpcts.isEmpty()) {
            detectResult = false;
        }
        
        // return the detect result
        return detectResult;
    }
    
    /**
     * get future transactions for room delete.
     * 
     * @param blId String building id
     * @param flId String floor id
     * @param rmId String room id
     * @param date String check date
     * @return List<DataRecord> future transaction list.
     */
    public static List<AssignmentObject> getFutureTransForRoomDelete(final String blId,
            final String flId, final String rmId, final Date date) {
        
        final List<AssignmentObject> futureAssignments = new ArrayList<AssignmentObject>();
        
        // create restriction object for future transaction query
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, date, Operation.GT);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.MO_ID, null,
            Operation.IS_NOT_NULL, RelativeOperation.OR);
        
        // get the result list of future transaction
        final DataSource futureRmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        final List<DataRecord> futureRmpcts = futureRmpctDS.getRecords(rmpctResDef);
        
        if (futureRmpcts != null && !futureRmpcts.isEmpty()) {
            for (int j = 0; j < futureRmpcts.size(); j++) {
                
                final DataRecord dataRecord = futureRmpcts.get(j);
                final JSONObject newAssignObject =
                        SpaceTransactionAssignmentHelper.saveRecordToAssianments(dataRecord);
                final AssignmentObject newAssign =
                        SpaceTransactionAssignmentHelper
                            .convertJSONObjectToRmpctObject(newAssignObject);
                futureAssignments.add(newAssign);
            }
        }
        
        Collections.sort(futureAssignments, new SpaceFutureTransactionSortProcess());
        
        // return the detect result
        return futureAssignments;
    }
    
    /**
     * detect future transactions for employee location change.
     * 
     * @param emId String employee id
     * @param fromBlId String from building id
     * @param fromFlId String from floor id
     * @param fromRmId String from room id
     * @param date String from check date
     * @return boolean If exits future transaction return true, else return false.
     */
    public static boolean detectIfExistFutureTransForEmployeeLocationChange(final String emId,
            final String fromBlId, final String fromFlId, final String fromRmId, final Date date) {
        
        // detect result and the default value is true
        boolean detectResult = true;
        
        // create restriction object for future transaction query
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.PRIMARY_EM, 1, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID, emId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_BL_ID, fromBlId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_FL_ID, fromFlId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_RM_ID, fromRmId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, date, Operation.GT);
        
        // get the result list of future transaction
        final DataSource futureRmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        final List<DataRecord> futureRmpcts = futureRmpctDS.getRecords(rmpctResDef);
        
        // if the future transaction is empty , set the flag detectResult to false
        if (futureRmpcts.isEmpty()) {
            detectResult = false;
        }
        
        // return the detect result
        return detectResult;
    }
    
    /**
     * get future transactions for Employee delete.
     * 
     * @param emId String employee id
     * @return List<DataRecord> future transaction list.
     * 
     *         Justification: Case #1 : Statement with SELECT ... Exists sub-sql pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static List<AssignmentObject> getFutureTransForEmployeeDelete(final String emId) {
        
        final List<DataRecord> rmpctRecs = new ArrayList<DataRecord>();
        final List<AssignmentObject> futureAssignments = new ArrayList<AssignmentObject>();
        
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();
        rmpctDS.addParameter(SpaceConstants.BLID, null, DataSource.DATA_TYPE_TEXT);
        rmpctDS.addParameter(SpaceConstants.FLID, null, DataSource.DATA_TYPE_TEXT);
        rmpctDS.addParameter(SpaceConstants.RMID, null, DataSource.DATA_TYPE_TEXT);
        rmpctDS.addParameter("emId", emId, DataSource.DATA_TYPE_TEXT);
        
        // create room restriction - complex restriction and cannot use parse restriction, so use
        // string restriction instead
        final String rmRestriction =
                " EXISTS(select 1 from rmpct where rmpct.bl_id = rm.bl_id and rmpct.fl_id = rm.fl_id "
                        + " and rmpct.rm_id = rm.rm_id and rmpct.date_start >${sql.currentDate}"
                        + " and  rmpct.em_id ='" + SqlUtils.makeLiteralOrBlank(emId) + "')";
        
        // get the result list of future transaction
        final DataSource rmDS = SpaceTransactionUtil.getRmDataSource();
        final List<DataRecord> rmList = rmDS.getRecords(rmRestriction);
        
        for (final DataRecord rm : rmList) {
            // create rmpct restriction - complex restriction and cannot use parse restriction, so
            // use string restriction instead
            final String rmpctRestriction =
                    " rmpct.date_start >  ${sql.currentDate} "
                            + " and  ((rmpct.activity_log_id IS NOT NULL and ((bl_id= ${parameters['blId']} AND fl_id=${parameters['flId']} AND rm_id=${parameters['rmId']}) "
                            + " or (from_bl_id=${parameters['blId']} AND from_fl_id=${parameters['flId']} AND from_rm_id=${parameters['rmId']}))) "
                            + " )";
            
            // get the result list of future transaction
            rmpctDS.setParameter(SpaceConstants.BLID,
                rm.getString(SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.BL_ID));
            rmpctDS.setParameter(SpaceConstants.FLID,
                rm.getString(SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.FL_ID));
            rmpctDS.setParameter(SpaceConstants.RMID,
                rm.getString(SpaceConstants.T_RM + SpaceConstants.DOT + SpaceConstants.RM_ID));
            
            final List<DataRecord> rmpctList = rmpctDS.getRecords(rmpctRestriction);
            rmpctRecs.addAll(rmpctList);
        }
        
        final String rmpctRestriction =
                " rmpct.date_start >${sql.currentDate} "
                        + " AND em_id = ${parameters['emId']} AND mo_id IS NOT NULL ";
        
        // get the result list of future transaction from move management
        final List<DataRecord> rmpctList = rmpctDS.getRecords(rmpctRestriction);
        rmpctRecs.addAll(rmpctList);
        
        if (rmpctRecs != null && !rmpctRecs.isEmpty()) {
            for (int j = 0; j < rmpctRecs.size(); j++) {
                final DataRecord dataRecord = rmpctRecs.get(j);
                final JSONObject newAssignObject =
                        SpaceTransactionAssignmentHelper.saveRecordToAssianments(dataRecord);
                
                final AssignmentObject newAssign =
                        SpaceTransactionAssignmentHelper
                            .convertJSONObjectToRmpctObject(newAssignObject);
                
                futureAssignments.add(newAssign);
            }
        }
        
        final Map<String, AssignmentObject> map = new HashMap<String, AssignmentObject>();
        for (final AssignmentObject dataRecord : futureAssignments) {
            final RoomTransaction roomTransaction = dataRecord.getRoomTransaction();
            final String pctId = String.valueOf(roomTransaction.getId());
            map.put(pctId, dataRecord);
        }
        futureAssignments.clear();
        futureAssignments.addAll(map.values());
        
        Collections.sort(futureAssignments, new SpaceFutureTransactionSortProcess());
        
        // return the detect result
        return futureAssignments;
    }
}
