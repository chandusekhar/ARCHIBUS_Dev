package com.archibus.eventhandler.hoteling;

import java.util.*;

import org.json.JSONArray;

import com.archibus.datasource.*;

/**
 * Helper class for cancel or reject booking.
 * <p>
 * 
 * @author Guo
 * @since 20.3
 */
public final class HotelingBookingCancelAction {
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private HotelingBookingCancelAction() {
    }
    
    /**
     * Cancel or Reject parent booking.
     * 
     * @param pctId pct_id
     * @param status status
     */
    public static void cancelOrRejectParentBooking(final int pctId, final String status) {
        final int activiLogId = HotelingUtility.getActivityLogIdFromPctId(pctId);
        // SET activity log status to CANCELLED
        HotelingUtility.updateActivityLogStatus(activiLogId, status);
        
        // insert record into hactivity_log that deleted from activity_log
        HotelingBookingCancelAction.insertHactivityLog(pctId);
        
        // for kb:3025551
        HotelingBookingCancelAction.deleteNotApprovedRmpcts(pctId, true);
        
        // if cancel approved rmpct, just clear the em_id to null, not delete the rmpct
        // to show it is available again
        HotelingBookingCancelAction.clearEmployeeForApprovedRmpcts(pctId, true);
        
        // kb:3025551
        HotelingBookingCancelAction.deleteActivityLog(activiLogId);
    }
    
    /**
     * Cancel or Reject sub booking.
     * 
     * @param parentPctId parent_pct_id
     * @param pctId pct_id
     * @param status status
     * 
     * @return new parent_pct_id
     */
    public static int cancelOrRejectSubBooking(final int parentPctId, final int pctId,
            final String status) {
        
        int newParentPctId = parentPctId;
        final int activiLogId = HotelingUtility.getActivityLogIdFromPctId(pctId);
        
        if (pctId == parentPctId) {
            
            final int subRmpctCount =
                    HotelingUtility.getRmpctDataSource().getRecords(" parent_pct_id = " + pctId)
                        .size();
            
            if (subRmpctCount > 1) {
                
                HotelingBookingCancelAction.deleteNotApprovedRmpcts(pctId, false);
                // if cancel approved rmpct, just update the em_id to null, not delete the rmpct
                // to show it is available again
                HotelingBookingCancelAction.clearEmployeeForApprovedRmpcts(pctId, false);
                
                newParentPctId = HotelingUtility.selectMinPctIdAsParentPctId(pctId);
                
                HotelingUtility.setParentPctId(pctId, newParentPctId);
                
            } else {
                
                HotelingUtility.updateActivityLogStatus(activiLogId, status);
                
                // insert record into hactivity_log that deleted from activity_log
                HotelingBookingCancelAction.insertHactivityLog(pctId);
                
                HotelingBookingCancelAction.deleteNotApprovedRmpcts(pctId, false);
                
                // if cancel approved rmpct, just update the em_id to null, not delete the rmpct
                // to show it is available again
                HotelingBookingCancelAction.clearEmployeeForApprovedRmpcts(pctId, false);
                
                // for kb:3025551
                HotelingBookingCancelAction.deleteActivityLog(activiLogId);
                
            }
        } else {
            HotelingBookingCancelAction.deleteNotApprovedRmpcts(pctId, false);
            // if cancel approved rmpct, just update the em_id to null, not delete the rmpct
            // to show it is available again
            HotelingBookingCancelAction.clearEmployeeForApprovedRmpcts(pctId, false);
        }
        
        return newParentPctId;
    }
    
    /**
     * delete given activity_log record.
     * 
     * @param activiLogId activity_log_id
     */
    public static void deleteActivityLog(final int activiLogId) {
        // KB3037930 use DataSouce API to delete activity_log
        final DataSource deleteActivityLogDS =
                DataSourceFactory.createDataSource().addTable(HotelingConstants.ACTIVITY_LOG)
                    .addField(HotelingConstants.ACTIVITY_LOG_ID);
        final Map<String, String> record = new HashMap<String, String>();
        record.put(HotelingConstants.ACTIVITY_LOG + HotelingConstants.DOT
                + HotelingConstants.ACTIVITY_LOG_ID, String.valueOf(activiLogId));
        deleteActivityLogDS.deleteRecord(record);
    }
    
    /**
     * delete all not approved rmpct record for given parent_pct_id or pct_id.
     * 
     * @param pctId pct_id
     * @param isParent isParent
     * 
     *            <p>
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     *            Justification: Case #2.3: Statements with DELETE FROM ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void deleteNotApprovedRmpcts(final int pctId, final boolean isParent) {
        final String deleteParentRmpctSql =
                "Delete FROM rmpct WHERE  status = 0 and (parent_pct_id =" + pctId
                        + " OR   pct_id =" + pctId + ")  ";
        
        final String deleteSubRmpctSql =
                "Delete FROM rmpct WHERE  status = 0 and   pct_id = " + pctId;
        if (isParent) {
            HotelingUtility.getRmpctDataSource().addQuery(deleteParentRmpctSql).executeUpdate();
        } else {
            HotelingUtility.getRmpctDataSource().addQuery(deleteSubRmpctSql).executeUpdate();
        }
    }
    
    /**
     * clear employee for the given approved pct_id.
     * 
     * @param pctId pct_id
     * @param isParent isParent
     * 
     *            <p>
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     *            Justification: Case #2.2: Statements with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void clearEmployeeForApprovedRmpcts(final int pctId, final boolean isParent) {
        final String updateParentRmpctSql =
                "update rmpct set em_id = null, parent_pct_id = null,activity_log_id = null  WHERE  status = 1 and (parent_pct_id ="
                        + pctId + " OR pct_id =" + pctId + " )";
        
        final String updateSubRmpctSql =
                "update rmpct set em_id = null,parent_pct_id = null,activity_log_id = null WHERE  status = 1 and pct_id ="
                        + pctId;
        if (isParent) {
            HotelingUtility.getRmpctDataSource().addQuery(updateParentRmpctSql).executeUpdate();
        } else {
            HotelingUtility.getRmpctDataSource().addQuery(updateSubRmpctSql).executeUpdate();
        }
    }
    
    /**
     * insert hactivity_log for given rmpct.
     * 
     * @param pctId pct_id
     * 
     *            <p>
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     *            Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void insertHactivityLog(final int pctId) {
        final DataSource insertHactivityLogDS =
                DataSourceFactory.createDataSourceForFields("hactivity_log", new String[] {
                        "activity_log_id", "activity_type", "date_requested", "time_requested",
                        "status", "requestor" });
        final String insertHactivlog =
                " INSERT INTO hactivity_log "
                        + "("
                        + " activity_log_id,activity_type,date_requested,"
                        + " time_requested,status,requestor"
                        + " ) "
                        + " SELECT activity_log_id,activity_type,"
                        + " date_requested,time_requested,"
                        + " status,requestor "
                        + " FROM activity_log "
                        + " WHERE activity_log_id=("
                        + " SELECT activity_log_id FROM rmpct WHERE pct_id =  ${parameters['pctId']} "
                        + ")";
        insertHactivityLogDS.addQuery(insertHactivlog)
            .addParameter("pctId", pctId, DataSource.DATA_TYPE_INTEGER).executeUpdate();
    }
    
    /**
     * Get building code from building array.
     * 
     * @param blIdArray blIdArray
     * @param index index
     * @return building code
     */
    public static String getBuildingCodeFromArray(final JSONArray blIdArray, final int index) {
        return blIdArray == null ? null : blIdArray.getString(index);
    }
    
}
