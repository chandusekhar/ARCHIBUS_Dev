package com.archibus.service.space;

import java.util.*;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.datasource.*;
import com.archibus.app.common.space.domain.Room;
import com.archibus.context.ContextStore;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.service.space.datachangeevent.RoomTransactionService;
import com.archibus.service.space.helper.SpaceTransactionUtil;
import com.archibus.utility.Utility;

/**
 * Reconcile Workspace Transactions.
 * 
 * <p>
 * History:
 * <li>Bali1: Extract from AllRoomPercentageUpdate.java.
 * 
 * @author Zhang Yi
 * 
 *         Justification: Please see particular case of justification in each method's comment.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class Reconcile {
    
    /**
     * String constant "roomTransactionService".
     * 
     */
    private static final String ROOM_TRANSACTION_SERVICE = "roomTransactionService";
    
    /**
     * Constant number 100.
     */
    private static final int ONE_HUNDRED = 100;
    
    /**
     * Constant number 10.
     */
    private static final int TEN = 10;
    
    /**
     * Constant number 30.
     */
    private static final int TWENTY = 20;
    
    /**
     * Constant number 40.
     */
    private static final int FOURTY_FIVE = 45;
    
    /**
     * Constant number 60.
     */
    private static final int SIXTY = 60;
    
    /**
     * Constant number 85.
     */
    private static final int EIGHTY_FIVE = 85;
    
    /**
     * Reconcile Workspace Transactions.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void run(JobStatus status) {
        
        status.setTotalNumber(ONE_HUNDRED);
        
        // deal with the rooms in rmpct but doesn't exist in rm table
        updateRmpctWithNotExistedRooms();
        status.setCurrentNumber(TEN);
        
        // insert rmpct records for the rooms in rm table but doesn't exist in rmpct table.
        insertRmpctFromRoom();
        status.setCurrentNumber(TWENTY);
        
        // deal with employee location change
        synchronizeEmLocationInRmpct();
        status.setCurrentNumber(FOURTY_FIVE);
        
        // Guo add to for KB3040473- deal with employee dv/dp changes when application parameter
        // InferRoomDepartment=1,
        synchronizeEmDeparmentInRmpct();
        status.setCurrentNumber(SIXTY);
        
        // add room part according to capacity.
        synchronizeRoomCapacity();
        status.setCurrentNumber(EIGHTY_FIVE);
        
        // update rmpct from rm table, this only get the rmpct records which primary_rm=1,
        updateRmpctAttributeFromRoom();
        
        // Re-set the activity parameter 'ResyncWorkspaceTransactionsTable' to 'No'
        final String updateActivityParameterSql =
                "UPDATE afm_activity_params SET param_value = '0'"
                        + " WHERE activity_id='AbSpaceRoomInventoryBAR' AND param_id ='ResyncWorkspaceTransactionsTable'";
        SqlUtils.executeUpdate("afm_activity_params", updateActivityParameterSql);
        
        status.setCurrentNumber(ONE_HUNDRED);
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Update rmpct records which the related room not existed.
     * 
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     * 
     * Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    private static void updateRmpctWithNotExistedRooms() {
        String sql = "";
        // delete rmpct that with bl_id and fl_id ,rm_id, and activity_log_id empty
        sql =
                "DELETE FROM rmpct "
                        + " WHERE rmpct.bl_id is NULL AND rmpct.fl_id IS NULL AND rmpct.rm_id IS NULL AND rmpct.activity_log_id IS NULL ";
        
        SqlUtils.executeUpdate(SpaceConstants.RMPCT, sql);
        
        // If the UseWorkspaceTransactions activity parameter is set to 'Yes', instead of deleting
        // records whose associated rooms don't exist,
        // set an end date and make them obsolete
        // for fixing kb3034179: since status 'obselete' is not useful, remove status=3. - by ZY
        sql =
                "UPDATE rmpct SET date_end = ${sql.currentDate} "
                        + " WHERE rmpct.bl_id is NOT NULL AND rmpct.fl_id IS NOT NULL AND rmpct.rm_id IS NOT NULL"
                        + "     AND NOT EXISTS (SELECT 1 FROM rm WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id)";
        
        SqlUtils.executeUpdate(SpaceConstants.RMPCT, sql);
    }
    
    /**
     * Insert rmpct records for rooms that without any rmpct records.
     * 
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     */
    private static void insertRmpctFromRoom() {
        // Insert rmpct records that do not exist, but do in the rooms table, taking into
        // account only 'current' records
        
        final String insertSql =
                "INSERT INTO rmpct  (date_start,bl_id, fl_id, rm_id, rm_cat, rm_type, dv_id, dp_id, area_rm, prorate, pct_space, pct_time, status, primary_rm, user_name, date_created)"
                        + " SELECT  ${sql.currentDate}, bl_id, fl_id, rm_id, rm_cat, rm_type, dv_id, dp_id, area, prorate, 100.0, 100.0, 1, 1, 'SYSTEM', ${sql.currentDate}"
                        + " FROM rm   "
                        + " WHERE NOT EXISTS (SELECT 1 FROM rmpct WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id "
                        + " AND (rmpct.date_start <= ${sql.currentDate} OR rmpct.date_start IS NULL) AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL))";
        SqlUtils.executeUpdate(SpaceConstants.RMPCT, insertSql);
    }
    
    /**
     * synchronize employee location in rmpct.
     * 
     * Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     * 
     * Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    private static void synchronizeEmLocationInRmpct() {
        
        // select em where may be differences in any employee primary locations
        final String emQuerySql =
                "SELECT em.bl_id, em.fl_id, em.rm_id, em.em_id, em.dv_id, em.dp_id,email,name_first, name_last, em_std, phone, em_number FROM em"
                        + " WHERE EXISTS(SELECT 1 FROM rmpct WHERE rmpct.bl_id = em.bl_id AND rmpct.fl_id = em.fl_id AND rmpct.rm_id = em.rm_id"
                        + "  AND (rmpct.date_start <= ${sql.currentDate} OR rmpct.date_start IS NULL) "
                        + " AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL) AND rmpct.status=1 AND rmpct.primary_em=1 AND (rmpct.em_id IS NULL OR rmpct.em_id != em.em_id))"
                        + " OR NOT EXISTS (SELECT 1 FROM rmpct WHERE rmpct.bl_id = em.bl_id AND rmpct.fl_id = em.fl_id AND rmpct.rm_id = em.rm_id"
                        + "      AND (rmpct.date_start <= ${sql.currentDate} OR rmpct.date_start IS NULL) "
                        + "      AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL) AND rmpct.status=1 AND rmpct.primary_em=1)";
        
        getEmRecordsAndInvokeDataChangeEvent(emQuerySql);
        
        final DataSource rmpctDs =
                DataSourceFactory
                    .createDataSource()
                    .addTable(SpaceConstants.RMPCT)
                    .addVirtualField(SpaceConstants.RMPCT, "em_id", DataSource.DATA_TYPE_TEXT)
                    .addQuery(
                        "SELECT DISTINCT em_id FROM rmpct WHERE rmpct.status = 1 AND rmpct.em_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM em WHERE em.em_id = rmpct.em_id) AND (rmpct.date_start <= ${sql.currentDate} OR rmpct.date_start IS NULL) AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL) ");
        rmpctDs.setApplyVpaRestrictions(false);
        final List<DataRecord> rmpctRecords = rmpctDs.getAllRecords();
        for (final DataRecord rmpctRecord : rmpctRecords) {
            final Employee employee = new Employee();
            employee.setId(rmpctRecord.getString("rmpct.em_id"));
            ((RoomTransactionService) ContextStore.get().getBean(ROOM_TRANSACTION_SERVICE))
                .recordTransaction(ChangeType.DELETE, ContextStore.get().getUser(), new Date(),
                    employee, BeforeOrAfter.BEFORE, ContextStore.get().getProject());
        }
        
        // KB3033838 and KB3037739 - Make the employee's location agree in both em and rmpct, UNLESS
        // there is a future transaction to move the employee anyway
        final String rmpctSql =
                "DELETE FROM rmpct WHERE  (rmpct.date_start <= ${sql.currentDate} OR rmpct.date_start IS NULL) AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL) "
                        + " AND rmpct.status=1 AND rmpct.primary_em=1 "
                        + " AND rmpct.em_id NOT IN (SELECT em.em_id from em WHERE em.bl_id = rmpct.bl_id AND em.fl_id = rmpct.fl_id AND em.rm_id = rmpct.rm_id)"
                        + " AND NOT EXISTS(SELECT 1 FROM rmpct a where a.activity_log_id IS NOT NULL AND a.status = 1 AND a.primary_em = 1 AND a.em_id = rmpct.em_id "
                        + "     AND a.date_start > ${sql.currentDate} AND a.from_bl_id = rmpct.bl_id AND a.from_fl_id = rmpct.fl_id AND a.from_rm_id = rmpct.rm_id)";
        
        SqlUtils.executeUpdate(SpaceConstants.RMPCT, rmpctSql);
    }
    
    /**
     * synchronize employee department in rmpct.
     * 
     * Justification: Case #1: Statement with SELECT WHERE EXISTS ... pattern.
     * 
     * Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    private static void synchronizeEmDeparmentInRmpct() {
        if (SpaceTransactionUtil.loadBooleanActivityParameter("InferRoomDepartments")) {
            // select em where may be differences in any employee primary locations
            final String emQuerySql =
                    "SELECT em.bl_id, em.fl_id, em.rm_id, em.em_id,  em.dv_id,  em.dp_id, email,name_first, name_last, em_std, phone, em_number FROM em"
                            + " WHERE EXISTS(SELECT 1 FROM rmpct WHERE rmpct.em_id = em.em_id AND rmpct.bl_id = em.bl_id AND rmpct.fl_id = em.fl_id AND rmpct.rm_id = em.rm_id"
                            + "  AND (rmpct.date_start <= ${sql.currentDate} OR  rmpct.date_start IS NULL ) "
                            + "  AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL) AND rmpct.status=1 "
                            + "  AND ((rmpct.dv_id IS NULL AND em.dv_id IS NOT NULL) OR (rmpct.dv_id IS NOT NULL AND em.dv_id IS NULL) OR (rmpct.dv_id != em.dv_id)"
                            + "     OR (rmpct.dp_id IS NULL AND em.dp_id IS NOT NULL) OR (rmpct.dp_id IS NOT NULL AND em.dp_id IS NULL) OR (rmpct.dp_id != em.dp_id)))";
            
            getEmRecordsAndInvokeDataChangeEvent(emQuerySql);
        }
    }
    
    /**
     * Get employee records fro data change event.
     * 
     * @param emQuerySql sql query
     */
    private static void getEmRecordsAndInvokeDataChangeEvent(final String emQuerySql) {
        final String[] emFields =
                { SpaceConstants.BL_ID, SpaceConstants.FL_ID, SpaceConstants.RM_ID,
                        SpaceConstants.EM_ID, SpaceConstants.DV_ID, SpaceConstants.DP_ID, "email",
                        "name_first", "name_last", "em_std", "phone", "em_number" };
        final DataSource emDs = DataSourceFactory.createDataSourceForFields("em", emFields);
        emDs.setApplyVpaRestrictions(false);
        emDs.addQuery(emQuerySql);
        
        final List<DataRecord> emRecords = emDs.getAllRecords();
        for (final DataRecord emRecord : emRecords) {
            // use dependency injection instead -KB3038266
            final EmployeeDataSource emDataSource =
                    (EmployeeDataSource) ContextStore.get().getBean("employeeDataSource");
            final Employee employee = emDataSource.convertRecordToObject(emRecord);
            ((RoomTransactionService) ContextStore.get().getBean(ROOM_TRANSACTION_SERVICE))
                .recordTransaction(ChangeType.UPDATE, ContextStore.get().getUser(), new Date(),
                    employee, BeforeOrAfter.AFTER, ContextStore.get().getProject());
        }
    }
    
    /**
     * synchronize rmpct count with room capacity.
     * 
     * Justification: Case #1 : Statement with SELECT ... Exists pattern.
     * 
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     */
    private static void synchronizeRoomCapacity() {
        
        // select room which capacity > current rmpct count
        final String rmQuerySql =
                "SELECT rm.bl_id, rm.fl_id, rm.rm_id, "
                        + "   ( rm.cap_em- (select count(1) FROM rmpct"
                        + " WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id  AND rmpct.status=1"
                        + " AND (rmpct.date_start <= ${sql.currentDate} OR rmpct.date_start IS NULL ) "
                        + " AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL) )) ${sql.as} available_rmpct  "
                        + " FROM  rm   "
                        + " WHERE rm.cap_em> (select count(1) from rmpct "
                        + " WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id  AND rmpct.status=1 "
                        + " AND (rmpct.date_start <= ${sql.currentDate} OR rmpct.date_start IS NULL) "
                        + " AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL) )";
        
        final String[] rmFields =
                { SpaceConstants.BL_ID, SpaceConstants.FL_ID, SpaceConstants.RM_ID };
        final DataSource rmDs = DataSourceFactory.createDataSourceForFields(Constants.RM, rmFields);
        rmDs.setApplyVpaRestrictions(false);
        rmDs.addQuery(rmQuerySql);
        rmDs.addVirtualField(Constants.RM, "available_rmpct", DataSource.DATA_TYPE_INTEGER);
        final List<DataRecord> rmRecords = rmDs.getAllRecords();
        
        // for each of rm create all availble room portion in rmpct table
        for (final DataRecord rmRecord : rmRecords) {
            
            final String blId = rmRecord.getString("rm.bl_id");
            final String flId = rmRecord.getString("rm.fl_id");
            final String rmId = rmRecord.getString("rm.rm_id");
            final int availableRmpct = rmRecord.getInt("rm.available_rmpct");
            
            for (int i = 0; i < availableRmpct; i++) {
                final String insertSql =
                        "INSERT INTO rmpct (date_start,bl_id, fl_id, rm_id, rm_cat, rm_type, dv_id, dp_id, area_rm, prorate, pct_space, pct_time, status, primary_rm, user_name, date_created)"
                                + " SELECT ${sql.currentDate}, bl_id, fl_id, rm_id, rm_cat, rm_type, dv_id, dp_id, area, prorate, 100.0, 100.0, 1, 1, 'SYSTEM', ${sql.currentDate}"
                                + " FROM   rm "
                                + " WHERE rm.bl_id = ${sql.literal('"
                                + blId
                                + "')} "
                                + "  AND  rm.fl_id = ${sql.literal('"
                                + flId
                                + "')}  "
                                + "  AND  rm.rm_id = ${sql.literal('" + rmId + "')}";
                
                SqlUtils.executeUpdate(SpaceConstants.RMPCT, insertSql);
            }
            
            // update percentage of space for every room portion for this room
            AllRoomPercentageUpdate
                .updatePercentageOfSpace(Utility.currentDate(), blId, flId, rmId);
            
        }
    }
    
    /**
     * synchronize Room Percentages.
     * 
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     * 
     * Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     * 
     * Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    public static void synchronizeRoomPercentages() {
        
        // Keep rmpct in sync with rm table;
        // Remove records whose associated rooms don't exist in the rm table.
        String sql =
                "DELETE FROM rmpct WHERE NOT EXISTS "
                        + "(SELECT 1 FROM rm WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id)";
        SqlUtils.executeUpdate(SpaceConstants.RMPCT, sql);
        
        sql =
                "INSERT INTO rmpct"
                        + " (bl_id,fl_id,rm_id,rm_cat,rm_type, dv_id,dp_id,area_rm,prorate,pct_space,pct_time)"
                        + " SELECT bl_id,fl_id,rm_id,rm_cat,rm_type, dv_id,dp_id,area,prorate,100.0,100.0"
                        + " FROM rm  "
                        + " WHERE NOT EXISTS (SELECT 1 FROM rmpct"
                        + " WHERE rm.bl_id = rmpct.bl_id AND rm.fl_id = rmpct.fl_id AND rm.rm_id = rmpct.rm_id)";
        SqlUtils.executeUpdate(SpaceConstants.RMPCT, sql);
        
        // For single percentage records match the percentage records to the room records.
        // Need different statements for Oracle because of different support for correlated
        // subqueries.
        if (SqlUtils.isOracle()) {
            sql =
                    " UPDATE rmpct" + " SET (rmpct.dv_id, rmpct.dp_id,"
                            + " rmpct.rm_cat, rmpct.rm_type," + " rmpct.area_rm, rmpct.prorate) = "
                            + "(SELECT rm.dv_id, rm.dp_id," + " rm.rm_cat, rm.rm_type,"
                            + " rm.area, rm.prorate " + " FROM  rm "
                            + " WHERE rm.bl_id = rmpct.bl_id " + " AND rm.fl_id = rmpct.fl_id  "
                            + " AND rm.rm_id = rmpct.rm_id) "
                            + " WHERE 1 = (SELECT COUNT(*) FROM rmpct a_inner "
                            + " WHERE a_inner.bl_id = rmpct.bl_id "
                            + " AND a_inner.fl_id = rmpct.fl_id "
                            + " AND a_inner.rm_id = rmpct.rm_id) ";
        } else {
            sql = "UPDATE rmpct ";
            
            if (SqlUtils.isSybase()) {
                sql = sql + ", rm ";
            }
            
            sql =
                    sql + " SET rmpct.dv_id = rm.dv_id," + " rmpct.dp_id = rm.dp_id, "
                            + " rmpct.rm_cat = rm.rm_cat," + " rmpct.rm_type = rm.rm_type, "
                            + " rmpct.area_rm = rm.area," + " rmpct.prorate = rm.prorate ";
            
            if (SqlUtils.isSqlServer()) {
                sql = sql + " FROM rm ";
            }
            
            sql =
                    sql + " WHERE rm.bl_id = rmpct.bl_id" + " AND rm.fl_id = rmpct.fl_id "
                            + " AND rm.rm_id = rmpct.rm_id "
                            + " AND 1 = (SELECT COUNT(*) FROM rmpct "
                            + " WHERE rmpct.bl_id = rm.bl_id" + " AND rmpct.fl_id = rm.fl_id "
                            + " AND rmpct.rm_id = rm.rm_id) ";
        }
        SqlUtils.executeUpdate("rmpct", sql);
    }
    
    /**
     * Update rmpct attribute from room.
     * 
     * Justification: Case #1 : Statement with SELECT ... Exists sub-sql pattern.
     */
    private static void updateRmpctAttributeFromRoom() {
        
        // update rmpct with the room's attributes where primary_rm is set to 1 for current
        // records
        final String[] rmFields =
                { "bl_id", "fl_id", "rm_id", "dv_id", "dp_id", "rm_cat", "rm_type", "prorate" };
        final DataSource rmDs = DataSourceFactory.createDataSourceForFields("rm", rmFields);
        final String restriction =
                "EXISTS(SELECT 1 FROM rmpct WHERE rmpct.primary_rm = 1 AND rmpct.bl_id = rm.bl_id"
                        + " AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id"
                        + " AND (rmpct.date_start <= ${sql.currentDate} OR rmpct.date_start IS NULL)"
                        + " AND (rmpct.date_end >= ${sql.currentDate} OR rmpct.date_end IS NULL)"
                        + " AND (rmpct.dv_id != rm.dv_id OR rmpct.dp_id != rm.dp_id OR rmpct.rm_cat != rm.rm_cat OR rmpct.rm_type != rm.rm_type OR rmpct.prorate != rm.prorate"
                        + "        OR (rmpct.dv_id IS NOT NULL AND rm.dv_id IS NULL)  OR (rm.dv_id IS NOT NULL AND rmpct.dv_id IS NULL)  "
                        + "        OR (rmpct.dp_id IS NOT NULL AND rm.dp_id IS NULL)  OR (rm.dp_id IS NOT NULL AND rmpct.dp_id IS NULL)  "
                        + "        OR (rmpct.rm_cat IS NOT NULL AND rm.rm_cat IS NULL)  OR (rm.rm_cat IS NOT NULL AND rmpct.rm_cat IS NULL)  "
                        + "        OR (rmpct.rm_type IS NOT NULL AND rm.rm_type IS NULL)  OR (rm.rm_type IS NOT NULL AND rmpct.rm_type IS NULL)  "
                        + "        OR (rmpct.prorate IS NOT NULL AND rm.prorate IS NULL)  OR (rm.prorate IS NOT NULL AND rmpct.prorate IS NULL))  "
                        + ")";
        rmDs.addRestriction(Restrictions.sql(restriction));
        rmDs.setApplyVpaRestrictions(false);
        final List<DataRecord> rmRecords = rmDs.getAllRecords();
        for (final DataRecord rmRecord : rmRecords) {
            final Room room = new RoomDataSource().convertRecordToObject(rmRecord);
            ((RoomTransactionService) ContextStore.get().getBean(ROOM_TRANSACTION_SERVICE))
                .recordTransaction(ChangeType.UPDATE, ContextStore.get().getUser(), room,
                    new Date(), BeforeOrAfter.AFTER);
        }
    }
    
}
