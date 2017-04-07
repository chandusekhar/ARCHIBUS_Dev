package com.archibus.service.space.transaction;

import java.util.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.app.common.util.*;
import com.archibus.context.Context;
import com.archibus.core.event.data.IDataEventListener;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.helpdesk.QuestionnaireHandler;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.*;
import com.archibus.utility.*;
import com.ibm.icu.text.SimpleDateFormat;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 * <p>
 * 
 * Justification: Please see particular case of justification in each method's comment.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class SpaceTransactionUpdate {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceTransactionUpdate() {
    }
    
    /**
     * Update employees record by rmpct table changes.
     * 
     */
    public static void updateEmByRmpct() {
        
        final DataSource dsRmpct = SpaceTransactionUtil.getRmpctJoinActivityLogDataSource();
        
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.PRIMARY_EM, 1, Operation.EQUALS);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START,
            Utility.currentDate(), Operation.LTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NULL, RelativeOperation.OR);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, Utility.currentDate(),
            Operation.GTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, null,
            Operation.IS_NULL, RelativeOperation.OR);
        
        // kb#3044491: comment below code lines for updating the null 'location' from transaction
        // record to its primary employee.
        /*
         * rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, null,
         * Operation.IS_NOT_NULL); rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID,
         * null, Operation.IS_NOT_NULL); rmpctResDef.addClause(SpaceConstants.RMPCT,
         * SpaceConstants.RM_ID, null, Operation.IS_NOT_NULL);
         */
        
        // KB#3037737: fix wrong restrictions of activity_log_id and activity_type
        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceTransactionUtil.getActivityTypeEnumList(), Operation.IN, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL);
        
        final DataSource emDS = SpaceTransactionUtil.getEmDataSource();
        
        final List<DataRecord> rmpctList = dsRmpct.getRecords(rmpctResDef);
        
        // kb#3035314: suspend triggering events for RoomTransactionDataEventListener
        final SuspendDataEventsTemplate suspendDataEventsTemplate =
                new SuspendDataEventsTemplate(IDataEventListener.class);
        
        for (final DataRecord rmpct : rmpctList) {
            final String emId =
                    rmpct.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.EM_ID);
            final DataRecord emRec = SpaceTransactionCommon.getEmRecordById(emDS, emId);
            
            // kb 3034865 location(blId, flId, rmId) might be empty, result rmRec was null throw
            // exception.
            if (emRec != null) {
                SpaceTransactionCommon.setValuesBetweenRecords(rmpct, emRec, SpaceConstants.RMPCT,
                    SpaceConstants.T_EM, new String[] { SpaceConstants.BL_ID, SpaceConstants.FL_ID,
                            SpaceConstants.RM_ID });
                
                // kb#3035314: suspend triggering events for RoomTransactionDataEventListener
                suspendDataEventsTemplate.doWithContext(new Callback() {
                    public Object doWithContext(final Context context) throws ExceptionBase {
                        emDS.updateRecord(emRec);
                        return null;
                    }
                });
            }
        }
    }
    
    /**
     * Update the from location of one rmpct record if it is different from what * values of
     * assignment object.
     * 
     * 
     * @param assignment RmpctObject assignment object
     * @param rmpctRec DataRecord rmpct record
     * 
     *            Justification: Case #2.2 : Statement with UPDATE ... WHERE pattern.
     */
    public static void updateFromLocationToRmpct(final AssignmentObject assignment,
            final DataRecord rmpctRec) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        // rmpct record
        final String existedFromBlId =
                rmpctRec.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.FROM_BL_ID);
        final String existedFromFlId =
                rmpctRec.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.FROM_FL_ID);
        final String existedFromRmId =
                rmpctRec.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.FROM_RM_ID);
        
        final String fromBlId = roomTransaction.getFromBuildingId();
        final String fromFlId = roomTransaction.getFromFloorId();
        final String fromRmId = roomTransaction.getFromRoomId();
        final Integer activityLogId = roomTransaction.getActivityLogId();
        final String emId = roomTransaction.getEmployeeId();
        
        if (fromBlId == null || fromFlId == null || fromRmId == null) {
            SqlUtils.executeUpdate(SpaceConstants.RMPCT, " UPDATE rmpct SET from_bl_id = NULL,"
                    + " from_fl_id = NULL, from_rm_id = NULL" + "  WHERE activity_log_id= "
                    + activityLogId + " AND  em_id='" + SqlUtils.makeLiteralOrBlank(emId) + "'  ");
        } else if (!fromBlId.equalsIgnoreCase(existedFromBlId)
                || !fromFlId.equalsIgnoreCase(existedFromFlId)
                || !fromRmId.equalsIgnoreCase(existedFromRmId)) {
            SqlUtils
                .executeUpdate(SpaceConstants.RMPCT,
                    " UPDATE rmpct SET from_bl_id ='" + fromBlId + "', from_fl_id ='" + fromFlId
                            + "', from_rm_id ='" + fromRmId + "' WHERE activity_log_id = "
                            + activityLogId + " AND em_id='" + SqlUtils.makeLiteralOrBlank(emId)
                            + "' ");
            
        }
    }
    
    /**
     * update questionnaire answer.
     * 
     * @param date current date.
     * @param activityLogId int rmpct record
     * 
     */
    public static void updateQuestionnaireAnswer(final Date date, final Integer activityLogId) {
        // update questionnaire answer
        final DataSource activityLogDS = SpaceTransactionUtil.getActivityDataSource();
        final List<DataRecord> records =
                activityLogDS.getRecords("activity_log_id = " + activityLogId);
        if (!records.isEmpty()) {
            final DataRecord record = records.get(0);
            final String activityType =
                    record.getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                            + SpaceConstants.ACTIVITY_TYPE);
            final QuestionnaireHandler questionnaireHandler = new QuestionnaireHandler();
            final SimpleDateFormat dateFormat =
                    new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            String questionName = SpaceConstants.DATE_START;
            if (SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
                questionName = SpaceConstants.DATE_END;
            }
            
            questionnaireHandler.saveAnswer(SpaceConstants.ACTIVITY_LOG,
                SpaceConstants.ACTIVITY_LOG_ID, SpaceConstants.ACT_QUEST, activityLogId,
                questionName, dateFormat.format(date));
        }
    }
    
    /**
     * Update room record by rmpct table changes.
     * 
     */
    public static void updateRmByRmpct() {
        
        final DataSource dsRmpct = SpaceTransactionUtil.getRmpctJoinActivityLogDataSource();
        
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, null,
            Operation.IS_NOT_NULL);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, null,
            Operation.IS_NOT_NULL);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, null,
            Operation.IS_NOT_NULL);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.PRIMARY_RM, 1, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START,
            Utility.currentDate(), Operation.LTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NULL, RelativeOperation.OR);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, Utility.currentDate(),
            Operation.GTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, null,
            Operation.IS_NULL, RelativeOperation.OR);
        
        // KB#3037737: fix wrong restrictions of activity_log_id and activity_type
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceTransactionUtil.getActivityTypeEnumList(), Operation.IN);
        
        final DataSource dsRm = SpaceTransactionUtil.getRmDataSource();
        
        final List<DataRecord> rmpctList = dsRmpct.getRecords(rmpctResDef);
        
        String blIdTemp = "";
        String flIdTemp = "";
        String rmIdTemp = "";
        
        // kb#3035314: suspend triggering events for RoomTransactionDataEventListener
        final SuspendDataEventsTemplate suspendDataEventsTemplate =
                new SuspendDataEventsTemplate(IDataEventListener.class);
        
        for (final DataRecord rmpct : rmpctList) {
            final String blId =
                    rmpct.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.BL_ID);
            final String flId =
                    rmpct.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.FL_ID);
            final String rmId =
                    rmpct.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.RM_ID);
            
            if (blIdTemp.equals(blId) && flIdTemp.equals(flId) && rmIdTemp.equals(rmId)) {
                continue;
            }
            blIdTemp = blId;
            flIdTemp = flId;
            rmIdTemp = rmId;
            
            final DataRecord rmRec =
                    SpaceTransactionCommon.getRmRecordByLocationKey(dsRm, new String[] {
                            SpaceConstants.BL_ID, SpaceConstants.FL_ID, SpaceConstants.RM_ID },
                        new Object[] { blId, flId, rmId });
            // kb 3034865 location(blId, flId, rmId) might be empty, result rmRec was null throw
            // exception.
            if (rmRec != null) {
                SpaceTransactionCommon
                    .setValuesBetweenRecords(rmpct, rmRec, SpaceConstants.RMPCT,
                        SpaceConstants.T_RM, new String[] { SpaceConstants.DV_ID,
                                SpaceConstants.DP_ID, SpaceConstants.RM_CAT,
                                SpaceConstants.RM_TYPE, SpaceConstants.PRORATE });
                SpaceTransactionUtil.convertNullFieldValues(rmRec);
                
                // kb#3035314: suspend triggering events for RoomTransactionDataEventListener
                suspendDataEventsTemplate.doWithContext(new Callback() {
                    public Object doWithContext(final Context context) throws ExceptionBase {
                        dsRm.saveRecord(rmRec);
                        return null;
                    }
                });
            }
        }
        // selectDbRecords
    }
    
    /**
     * Set status to all rmpct records by given activity log id.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     * 
     * @param date current date.
     * @param activityLogId int rmpct record
     * 
     */
    public static void updateRmpctDateByActivityLogId(final Date date, final Integer activityLogId) {
        SqlUtils.executeUpdate("rmpct", " UPDATE rmpct " + "SET date_start = ${sql.date('" + date
                + "')} WHERE activity_log_id = " + activityLogId);
        
        // update questionnaire answer
        SpaceTransactionUpdate.updateQuestionnaireAnswer(date, activityLogId);
    }
    
    /**
     * Set status to all rmpct records by activity log id or mo id.
     * 
     * 
     * @param status int assignment object
     * @param assignment RmpctObject an employee assignment
     * 
     *            Justification: Case #2.2 : Statement with UPDATE ... WHERE pattern.
     */
    public static void updateRmpctStatus(final int status, final AssignmentObject assignment) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        // change to only update one assignment. not all the assigments with activity_log_id.
        final String toBlId = roomTransaction.getBuildingId();
        final String toFlId = roomTransaction.getFloorId();
        final String toRmId = roomTransaction.getRoomId();
        final String emId = SqlUtils.makeLiteralOrBlank(roomTransaction.getEmployeeId());
        
        // kb 3034474 other restriction.
        // change consider 'to location' was null or ''.
        final String toBlIdSql = SpaceTransactionUtil.getSqlClauseForFieldValue(toBlId);
        final String toFlIdSql = SpaceTransactionUtil.getSqlClauseForFieldValue(toFlId);
        final String toRmIdSql = SpaceTransactionUtil.getSqlClauseForFieldValue(toRmId);
        
        final String others =
                " AND bl_id " + toBlIdSql + " AND fl_id " + toFlIdSql + " AND rm_id " + toRmIdSql
                        + " AND em_id = '" + emId + "'";
        
        final Integer activityLogId = roomTransaction.getActivityLogId();
        // Get mo_id for rmpcts created from move order within Move Management Application
        final Integer moId = roomTransaction.getMoId();
        if (activityLogId == null) {
            SqlUtils.executeUpdate(SpaceConstants.RMPCT, " UPDATE rmpct SET status = " + status
                    + " WHERE mo_id = " + moId);
        } else {
            SqlUtils.executeUpdate(SpaceConstants.RMPCT, " UPDATE  rmpct SET status = " + status
                    + " WHERE activity_log_id = " + activityLogId + others);
            
        }
    }
    
    /**
     * Set status to all rmpct records by given activity log id.
     * 
     * 
     * @param status int assignment object
     * @param activityLogId int rmpct record
     * 
     *            Justification: Case #2.2 : Statement with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void updateRmpctStatusByActivityLogId(final int status,
            final Integer activityLogId) {
        SqlUtils.executeUpdate(SpaceConstants.RMPCT, "  UPDATE rmpct SET status = " + status
                + "  WHERE activity_log_id = " + activityLogId);
    }
    
    /**
     * Set new parent pct id to rmpct record by given pct id.
     * 
     * 
     * @param pctId int pct id
     * @param parentPctId int parent pct id
     * 
     *            Justification: Case #2.2 : Statement with UPDATE ... WHERE pattern.
     */
    public static void updateRmpctParentByPctId(final int pctId, final int parentPctId) {
        SqlUtils.executeUpdate(SpaceConstants.RMPCT, "  UPDATE rmpct SET parent_pct_id = "
                + parentPctId + "  WHERE pct_id = " + pctId);
    }
}