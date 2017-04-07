package com.archibus.service.space.transaction;

import java.util.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.*;
import com.archibus.utility.*;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 *
 * <p>
 *
 */
public final class SpaceTransactionInsert {
    
    /**
     * iso date format pattern.
     *
     */
    private static final String DATE_FORMAT = "yyyy-MM-dd";
    
    /**
     * indicate string "today" that needed as a parameter for DateTime.stringToDate() API..
     *
     */
    private static final String TODAY = "today";
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private SpaceTransactionInsert() {
    }
    
    /**
     * Insert a mo_eq record with proper field values from rmpct record.
     *
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     *
     * @param context EventHandlerContext EventHandler Context
     * @param moRec DataRecord move order record
     * @param rmpct DataRecord rmpct record
     *
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void insertMoveEqRecord(final EventHandlerContext context,
            final DataRecord rmpct, final DataRecord moRec) {
        // since below sql is a batch update like insert(...) select (...) from ...; so suppress
        // PMD.AvoidUsingSql warning.
        String fromClause =
                " FROM eq  LEFT OUTER JOIN rmpct ON rmpct.mo_id = "
                        + moRec.getInt(SpaceConstants.T_MO + SpaceConstants.DOT
                                + SpaceConstants.MO_ID)
                        + " LEFT OUTER JOIN eqstd ON eqstd.eq_std = eq.eq_std";
        
        // kb#3034917: only insert moved furniture for primary location change of employee
        fromClause +=
                " WHERE eq.bl_id=rmpct.from_bl_id AND eq.fl_id=rmpct.from_fl_id AND eq.rm_id=rmpct.from_rm_id AND rmpct.primary_em=1 AND eq.em_id = "
                        + EventHandlerBase.literal(context, rmpct.getString("rmpct.em_id"));
        
        SqlUtils
            .executeUpdate(
                "mo_eq",
                "INSERT INTO mo_eq (eq_id,eq_std,mo_id,from_bl_id,from_fl_id,from_rm_id,cost_moving)"
                        + " SELECT eq_id, eq.eq_std"
                        + ","
                        + EventHandlerBase.literal(context,
                            String.valueOf(moRec.getInt("mo.mo_id")))
                        + ",rmpct.from_bl_id, rmpct.from_fl_id,rmpct.from_rm_id, "
                        + EventHandlerBase.formatSqlIsNull(context, "eqstd.cost_moving,0")
                        + fromClause);
    }
    
    /**
     * Insert a move order record with proper field values from answer map, activity log record,
     * requestor, deparement contact record, and rmpct record.
     *
     * @param acLogRec DataRecord activity log record
     * @param moDS DataSource move order datasource
     * @param emDS DataSource em datasource
     * @param questAnswers Map of questions and answers
     * @param requestor DataRecord requestor record
     * @param deptContactRec DataRecord department contact record
     * @param rmpct DataRecord rmpct record
     *
     * @return DataRecord new inserted mo record
     */
    public static DataRecord insertMoveOrderRecord(final DataRecord acLogRec,
            final DataSource moDS, final DataSource emDS, final Map<String, Object> questAnswers,
            final DataRecord requestor, final DataRecord deptContactRec, final DataRecord rmpct) {
        DataRecord moRec = moDS.createNewRecord();
        // Insert information from activity log to move order
        moRec.setValue("mo.activity_log_id", acLogRec.getInt("activity_log.activity_log_id"));
        moRec.setValue("mo.date_created", Utility.currentDate());
        moRec.setValue("mo.date_requested", Utility.currentDate());
        moRec.setValue("mo.time_requested", Utility.currentTime());
        moRec.setValue("mo.mo_type", "Employee");
        moRec.setValue("mo.status", SpaceConstants.REQUESTED);
        final Object projectName = questAnswers.get(SpaceConstants.PROJECT_NAME);
        if (projectName != null) {
            moRec.setValue("mo.project_id", projectName.toString().toUpperCase());
        }
        moRec.setValue("mo.dept_contact", questAnswers.get("dp_contact"));
        moRec.setValue("mo.description", acLogRec.getString("activity_log.description"));
        moRec.setValue("mo.requestor", acLogRec.getString("activity_log.requestor"));
        
        // Insert information from rmpct to move order
        moRec.setValue("mo.date_to_perform",
            rmpct.getValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DATE_START));
        moRec.setValue("mo.date_start_req", rmpct.getValue("rmpct.date_start"));
        moRec.setValue("mo.to_bl_id", rmpct.getValue("rmpct.bl_id"));
        moRec.setValue("mo.to_fl_id", rmpct.getValue("rmpct.fl_id"));
        moRec.setValue("mo.to_rm_id", rmpct.getValue("rmpct.rm_id"));
        moRec.setValue("mo.em_id",
            rmpct.getValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.EM_ID));
        
        // Insert information from em, requestor and department contact to move order
        final DataRecord emRec =
                SpaceTransactionCommon.getEmRecordById(
                    emDS,
                    rmpct.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.EM_ID));
        moRec.setValue("mo.from_bl_id", rmpct.getValue("rmpct.from_bl_id"));
        moRec.setValue("mo.from_fl_id", rmpct.getValue("rmpct.from_fl_id"));
        moRec.setValue("mo.from_rm_id", rmpct.getValue("rmpct.from_rm_id"));
        
        moRec.setValue("mo.phone",
            requestor.getValue(SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.PHONE));
        moRec.setValue("mo.phone_dept_contact", deptContactRec.getValue(SpaceConstants.T_EM
                + SpaceConstants.DOT + SpaceConstants.PHONE));
        moRec.setValue("mo.dv_id", deptContactRec.getValue(SpaceConstants.T_EM + SpaceConstants.DOT
                + SpaceConstants.DV_ID));
        moRec.setValue("mo.dp_id", deptContactRec.getValue(SpaceConstants.T_EM + SpaceConstants.DOT
                + SpaceConstants.DP_ID));
        moRec.setValue("mo.from_dv_id",
            emRec.getValue(SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.DV_ID));
        moRec.setValue("mo.from_dp_id",
            emRec.getValue(SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.DP_ID));
        moRec.setValue("mo.from_phone",
            emRec.getValue(SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.PHONE));
        moRec.setValue("mo.to_dv_id", emRec.getValue("em.dv_id"));
        moRec.setValue("mo.to_dp_id", emRec.getValue("em.dp_id"));
        moRec.setValue("mo.to_phone", emRec.getValue("em.phone"));
        SpaceTransactionUtil.convertNullFieldValues(moRec);
        
        moRec = moDS.saveRecord(moRec);
        return moRec;
    }
    
    /**
     *
     * Insert a move order record with proper field values from input project, employee pending
     * assignments, requestor and deparement contact record.
     *
     * @param project the project
     * @param assignment the pending assignments
     */
    public static void insertMoveOrderRecordFromPendingAssignment(
            final Map<String, Object> project, final Map<String, String> assignment) {
        final DataSource moDs = SpaceTransactionUtil.getMoDataSource();
        
        final DataRecord moRecord = moDs.createNewRecord();
        
        // set value for the moRecord
        moRecord.setValue("mo.date_created", Utility.currentDate());
        moRecord.setValue("mo.date_requested", Utility.currentDate());
        moRecord.setValue("mo.time_requested", Utility.currentTime());
        moRecord.setValue("mo.mo_type", "Employee");
        moRecord.setValue("mo.status", SpaceConstants.REQUESTED);
        moRecord.setValue("mo.project_id", project.get(SpaceConstants.PROJECT_ID).toString()
            .toUpperCase());
        moRecord.setValue("mo.dept_contact", project.get(SpaceConstants.DEPT_CONTACT));
        moRecord.setValue("mo.description", project.get(SpaceConstants.DESCRIPTION));
        moRecord.setValue("mo.requestor", project.get(SpaceConstants.REQUESTOR));

        final Date startDate =
                DateTime.stringToDate(project.get(SpaceConstants.DATE_START).toString(),
                    DATE_FORMAT);
        moRecord.setValue("mo.date_to_perform", startDate);
        moRecord.setValue("mo.date_start_req", startDate);
        moRecord.setValue("mo.date_end_req",
            DateTime.stringToDate(project.get(SpaceConstants.DATE_END).toString(), DATE_FORMAT));
        moRecord.setValue("mo.to_bl_id", assignment.get(SpaceConstants.TO_BL_ID));
        moRecord.setValue("mo.to_fl_id", assignment.get(SpaceConstants.TO_FL_ID));
        moRecord.setValue("mo.to_rm_id", assignment.get(SpaceConstants.TO_RM_ID));
        moRecord.setValue("mo.from_bl_id", assignment.get(SpaceConstants.FROM_BL_ID));
        moRecord.setValue("mo.from_fl_id", assignment.get(SpaceConstants.FROM_FL_ID));
        moRecord.setValue("mo.from_rm_id", assignment.get(SpaceConstants.FROM_RM_ID));
        moRecord.setValue("mo.em_id", assignment.get(SpaceConstants.EM_ID));
        
        // get the employee,requestor and department contact records from em table
        final DataSource emDs = SpaceTransactionUtil.getEmDataSource();
        
        DataRecord emRecord =
                SpaceTransactionCommon.getEmRecordById(emDs, assignment.get(SpaceConstants.EM_ID));
        moRecord.setValue("mo.from_dv_id", emRecord.getValue("em.dv_id"));
        moRecord.setValue("mo.from_dp_id", emRecord.getValue("em.dp_id"));
        moRecord.setValue("mo.from_phone", emRecord.getValue("em.phone"));
        moRecord.setValue("mo.to_dv_id", emRecord.getValue("em.dv_id"));
        moRecord.setValue("mo.to_dp_id", emRecord.getValue("em.dp_id"));
        moRecord.setValue("mo.to_phone", emRecord.getValue("em.phone"));

        emRecord =
                SpaceTransactionCommon.getEmRecordById(emDs, project.get(SpaceConstants.REQUESTOR)
                    .toString());
        moRecord.setValue("mo.phone", emRecord.getValue("em.phone"));

        emRecord =
                SpaceTransactionCommon.getEmRecordById(emDs,
                    project.get(SpaceConstants.DEPT_CONTACT).toString());
        moRecord.setValue("mo.phone_dept_contact", emRecord.getValue("em.phone"));
        moRecord.setValue("mo.dv_id", emRecord.getValue("em.dv_id"));
        moRecord.setValue("mo.dp_id", emRecord.getValue("em.dp_id"));
        
        // avoid null values in record, then save and return it.
        SpaceTransactionUtil.convertNullFieldValues(moRecord);
        moDs.saveRecord(moRecord);
    }
    
    /**
     * Insert another rmpct record from where the employee moved to capture allocation without the
     * employee occupying that space.
     *
     * @param assignment RmpctObject
     * @param rmpctRec DataRecord move to rmpct record with employee.
     * @param rmpctDS DataSource rmpct datasource
     * @param rmDS DataSource rm datasource
     * @param fromRmpctRec DataRecord rmpct record that current assignment move from
     * @param requestDate Date request date
     * @param isAssignUnallocatedSpace String value of activity parameter AssignUnallocatedSpace
     *
     */
    public static void insertMoveOutRmpct(final DataRecord rmpctRec,
            final AssignmentObject assignment, final DataSource rmpctDS, final DataSource rmDS,
            final DataRecord fromRmpctRec, final Date requestDate,
            final String isAssignUnallocatedSpace) {
        
        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        
        final int pctId =
                fromRmpctRec.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PCT_ID);
        final String fromBlId = roomTransaction.getFromBuildingId();
        final String fromFlId = roomTransaction.getFromFloorId();
        final String fromRmId = roomTransaction.getFromRoomId();
        
        final DataRecord newRmpct = rmpctDS.createNewRecord();
        // should use original room as new record.
        SpaceTransactionCommon.setValuesBetweenRecords(fromRmpctRec, newRmpct,
            SpaceConstants.RMPCT, SpaceConstants.RMPCT, new String[] { SpaceConstants.PCT_SPACE,
                    SpaceConstants.RM_CAT, SpaceConstants.RM_TYPE, SpaceConstants.BL_ID,
                    SpaceConstants.FL_ID, SpaceConstants.RM_ID });
        
        newRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PARENT_PCT_ID,
            pctId);
        
        newRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.DATE_START,
            requestDate);
        newRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.USER_NAME,
            "SYSTEM");
        
        // kb:3034976,Employee move,when create empty room portion record for FROM_Location should
        // get dv,dp value
        // from rmpct record if there is department request.
        final DataSource dsRmpctActivity = SpaceTransactionUtil.getRmpctJoinActivityLogDataSource();
        final List<DataRecord> rmpctList2 =
                dsRmpctActivity.getRecords(SpaceTransactionRestriction
                    .getParsedRmpctRestrictionForDpFromLocation(assignment, requestDate));
        
        if (isAssignUnallocatedSpace.toLowerCase().startsWith(SpaceConstants.PRIMARY.toLowerCase())) {
            
            final ParsedRestrictionDef rmResDef = new ParsedRestrictionDef();
            rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.BL_ID, fromBlId,
                Operation.EQUALS);
            rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.FL_ID, fromFlId,
                Operation.EQUALS);
            rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.RM_ID, fromRmId,
                Operation.EQUALS);
            
            final DataRecord rmRec = rmDS.getRecords(rmResDef).get(0);
            SpaceTransactionCommon.setValuesBetweenRecords(rmRec, newRmpct, SpaceConstants.T_RM,
                SpaceConstants.RMPCT, new String[] { SpaceConstants.DV_ID, SpaceConstants.DP_ID,
                        SpaceConstants.RM_CAT, SpaceConstants.RM_TYPE, SpaceConstants.PRORATE });
            
            // kb#3043537:Space Transaction:From Location, get dv,dp,prorate value from department
            // request when AssignUnallocatedSpace is like Primaryxxx
            if (rmpctList2.size() >= 1) {
                
                final DataRecord rmpct1 = rmpctList2.get(0);
                SpaceTransactionCommon.setValuesBetweenRecords(rmpct1, newRmpct,
                    SpaceConstants.RMPCT, SpaceConstants.RMPCT, new String[] {
                            SpaceConstants.DV_ID, SpaceConstants.DP_ID, SpaceConstants.PRORATE });
                
            }
            
        } else if (isAssignUnallocatedSpace.toLowerCase().startsWith(
            SpaceConstants.NO_CHANGE.toLowerCase())) {
            
            SpaceTransactionCommon.setValuesBetweenRecords(fromRmpctRec, newRmpct,
                SpaceConstants.RMPCT, SpaceConstants.RMPCT, new String[] { SpaceConstants.DV_ID,
                        SpaceConstants.DP_ID, SpaceConstants.PRORATE });
        } else {
            setProrateByAssignUnallocatedSpace(isAssignUnallocatedSpace, newRmpct);
        }
        
        setPrimaryRmByAssignUnallocatedSpace(fromRmpctRec, isAssignUnallocatedSpace, newRmpct);
        SpaceTransactionUtil.convertNullFieldValues(newRmpct);
        rmpctDS.saveRecord(newRmpct);
    }
    
    /**
     * Insert a move project record with proper field values from answer map and department contact.
     *
     *
     * @param questAnswers Map of questions and answers
     * @param deptContact String department conteac
     * @param requestor em_id
     */
    public static void insertMoveProjectRecord(final Map<String, Object> questAnswers,
            final String deptContact, final String requestor) {
        
        final DataSource projDS = SpaceTransactionUtil.getProjectDataSource();
        final DataRecord project = projDS.createNewRecord();
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("project", "project_id",
            questAnswers.get(SpaceConstants.PROJECT_NAME), Operation.EQUALS);

        final DataSource emDs = SpaceTransactionUtil.getEmDataSource();
        
        final DataRecord requestorRecord = SpaceTransactionCommon.getEmRecordById(emDs, requestor);
        final DataRecord deptContactRecord =
                SpaceTransactionCommon.getEmRecordById(emDs, deptContact);

        final List<DataRecord> existedProject = projDS.getRecords(restriction);
        if (existedProject.isEmpty()) {
            project.setValue("project.project_id", questAnswers.get(SpaceConstants.PROJECT_NAME)
                .toString().toUpperCase());
            project.setValue("project.project_type", "Move");
            project.setValue("project.dept_contact", deptContact);
            project.setValue("project.contact_id", "TBD");
            project.setValue("project.status", SpaceConstants.REQUESTED);
            project.setValue("project.bl_id", questAnswers.get(SpaceConstants.BL_ID).toString()
                .toUpperCase());
            project.setValue("project.requestor", requestor);
            project.setValue("project.description", questAnswers.get(SpaceConstants.DESCRIPTION));
            project.setValue("project.dv_id", requestorRecord.getString("em.dv_id"));
            project.setValue("project.dp_id", requestorRecord.getString("em.dp_id"));
            project.setValue("project.phone_req", requestorRecord.getString("em.phone"));
            project.setValue("project.phone_dept_contact", deptContactRecord.getString("em.phone"));

            if (StringUtil.notNullOrEmpty(questAnswers.get(SpaceConstants.DATE_START))) {
                project.setValue(SpaceConstants.PROJECT + SpaceConstants.DOT
                    + SpaceConstants.DATE_START, DateTime.stringToDate(
                        (String) questAnswers.get(SpaceConstants.DATE_START), TODAY, DATE_FORMAT));
            }

            if (StringUtil.notNullOrEmpty(questAnswers.get(SpaceConstants.DATE_END))) {
                project.setValue(SpaceConstants.PROJECT + SpaceConstants.DOT
                    + SpaceConstants.DATE_END, DateTime.stringToDate(
                        (String) questAnswers.get(SpaceConstants.DATE_END), TODAY, DATE_FORMAT));
            }

            projDS.saveRecord(project);
        }

    }
    
    /**
     * Insert a mo_ta record with proper field values from rmpct record.
     *
     * Justification: Case #2.1 : Statement with INSERT ... SELECT pattern.
     *
     * @param context EventHandlerContext EventHandler Context
     * @param moRec DataRecord move order record
     * @param rmpct DataRecord rmpct record
     *
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void insertMoveTaRecord(final EventHandlerContext context,
            final DataRecord rmpct, final DataRecord moRec) {
        String fromClause;
        // since below sql is a batch update like insert(...) select (...) from ...; so suppress
        // PMD.AvoidUsingSql warning.
        fromClause =
                " FROM ta LEFT OUTER JOIN rmpct ON rmpct.mo_id = "
                        + moRec.getInt(SpaceConstants.T_MO + SpaceConstants.DOT
                                + SpaceConstants.MO_ID)
                        + " LEFT OUTER JOIN fnstd ON fnstd.fn_std = ta.fn_std";
        if (StringUtil.notNullOrEmpty(rmpct.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.EM_ID))) {
            fromClause +=
                    " WHERE ta.em_id = "
                            + EventHandlerBase.literal(
                                context,
                                rmpct.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                                        + SpaceConstants.EM_ID));
        } else {
            fromClause +=
                    " WHERE ta.bl_id = rmpct.from_bl_id AND ta.fl_id = rmpct.from_fl_id AND ta.rm_id = rmpct.from_rm_id";
        }
        // kb#3034917: only insert moved furniture for primary location change of employee
        fromClause +=
                "  AND ta.bl_id=rmpct.from_bl_id AND ta.fl_id=rmpct.from_fl_id AND ta.rm_id=rmpct.from_rm_id AND rmpct.primary_em=1 ";
        
        SqlUtils
            .executeUpdate(
                "mo_ta",
                "INSERT INTO mo_ta (ta_id,fn_std,mo_id,from_bl_id,from_fl_id,from_rm_id,cost_moving)"
                        + " SELECT ta_id, ta.fn_std,"
                        + EventHandlerBase.literal(
                            context,
                            String.valueOf(moRec.getInt(SpaceConstants.T_MO + SpaceConstants.DOT
                                    + SpaceConstants.MO_ID))) + ",rmpct.from_bl_id,"
                        + " rmpct.from_fl_id,rmpct.from_rm_id, "
                        + EventHandlerBase.formatSqlIsNull(context, "fnstd.cost_moving,0")
                        + fromClause);
    }
    
    /**
     * Set proper primary_rm value to newRmpct.
     *
     * @param fromRmpctRec DataRecord
     * @param newRmpct DataRecord
     * @param isAssignUnallocatedSpace String value of activity parameter AssignUnallocatedSpace
     *
     */
    private static void setPrimaryRmByAssignUnallocatedSpace(final DataRecord fromRmpctRec,
            final String isAssignUnallocatedSpace, final DataRecord newRmpct) {
        
        // IF activity parameter 'AssignUnallocatedSpace' = 'ProrateFloor' THEN
        // 'FLOOR' ELSE IF 'ProrateBuilding' THEN 'BUILDING' ELSE IF
        // 'ProrateSite'
        // THEN 'SITE' ELSE 'NONE',
        if (isAssignUnallocatedSpace.toLowerCase().startsWith(
            SpaceConstants.NO_CHANGE.toLowerCase())) {
            newRmpct.setValue(
                SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRIMARY_RM,
                fromRmpctRec.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PRIMARY_RM));
        } else if (isAssignUnallocatedSpace.toLowerCase().startsWith(
            SpaceConstants.PRIMARY.toLowerCase())) {
            newRmpct.setValue(
                SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRIMARY_RM, 1);
        } else {
            newRmpct.setValue(
                SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRIMARY_RM, 0);
        }
    }
    
    /**
     * Set proper prorate value to newRmpct.
     *
     * @param newRmpct DataRecord
     * @param isAssignUnallocatedSpace String value of activity parameter AssignUnallocatedSpace
     *
     */
    private static void setProrateByAssignUnallocatedSpace(final String isAssignUnallocatedSpace,
            final DataRecord newRmpct) {
        // (IF activity parameter 'AssignUnallocatedSpace' LIKE 'NoChange%' THEN
        // <from_primary_rm> ELSE IF LIKE 'Primary%' THEN 1 ELSE
        // 0),
        if (isAssignUnallocatedSpace.equalsIgnoreCase(SpaceConstants.PRORATE_FLOOR)) {
            newRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRORATE,
                SpaceConstants.FLOOR);
        } else if ("ProrateBuilding".equalsIgnoreCase(isAssignUnallocatedSpace)) {
            newRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRORATE,
                SpaceConstants.BUILDING);
        } else if ("ProrateSite".equalsIgnoreCase(isAssignUnallocatedSpace)) {
            newRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRORATE,
                SpaceConstants.SITE);
        } else {
            newRmpct.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.PRORATE,
                SpaceConstants.NONE);
        }
    }
    
}