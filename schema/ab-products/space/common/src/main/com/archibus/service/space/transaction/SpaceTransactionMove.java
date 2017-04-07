package com.archibus.service.space.transaction;

import java.util.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.QuestionnaireHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.future.SpaceFutureTransactionCommon;
import com.archibus.service.space.helper.*;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Space Transaction Handler Class, Added by ASC-BJ, Zhang Yi for 20.1 Space.<br>
 *
 * <p>
 *
 */
public class SpaceTransactionMove {

    /**
     * Assignments list that need to insert, store it as field variable for using in a common
     * method.
     */
    private List<AssignmentObject> assignmentsToInsert = new ArrayList<AssignmentObject>();

    /**
     * Map stores necessary values for from location by location key.
     */
    private final Map<String, int[]> fromLocationCount = new HashMap<String, int[]>();

    /**
     * Number of properties in fromLocationCount Map.
     */
    private boolean ifAdjustPctSpace;

    /**
     *
     * This workflow rule inserts records into the mo table (Move Order), associated move tables
     * such as mo_eq, and the project table (for group move requests), based on information from the
     * activity_log and corresponding rmpct records. It inserts the move record in the Requested?
     * status
     *
     * @param activityLogId activity log id
     *
     */
    public void insertMoProjectRecordsFromApprovedServiceRequest(final Integer activityLogId) {

        final DataSource moDS = SpaceTransactionUtil.getMoDataSource();
        final DataSource acLogDS = SpaceTransactionUtil.getActivityDataSource();

        final DataRecord acLogRec =
                acLogDS.getRecord(SpaceConstants.ACTIVITY_LOG_ID + SpaceConstants.EQUAL
                    + activityLogId);
        if (acLogRec == null) {
            return;
        }

        final DataSource emDS = SpaceTransactionUtil.getEmDataSource();
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final QuestionnaireHandler questionnaireHandler = new QuestionnaireHandler();
        final Map<String, Object> questAnswers =
                questionnaireHandler.getAnswers(context, SpaceConstants.ACTIVITY_LOG,
                    SpaceConstants.ACTIVITY_LOG_ID, SpaceConstants.ACT_QUEST, activityLogId);

        final List<DataRecord> rmpctList =
                rmpctDS.getRecords(SpaceConstants.ACTIVITY_LOG_ID + SpaceConstants.EQUAL
                    + activityLogId);
        final String requestor =
                acLogRec.getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                    + SpaceConstants.REQUESTOR);
        final DataRecord requestorRec =
                SpaceTransactionCommon
                .getEmRecordById(emDS, SqlUtils.makeLiteralOrBlank(requestor));

        final DataRecord deptContactRec =
                SpaceTransactionCommon.getEmRecordById(emDS,
                    (String) questAnswers.get(SpaceConstants.DEPARTMENT_CONTACT));
        // kb 3034343 request without rmpct record generate also need to create project.
        // Insert a project record for group move
        if (SpaceConstants.SERVICE_DESK_GROUP_MOVE.equalsIgnoreCase(acLogRec
            .getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                + SpaceConstants.ACTIVITY_TYPE))) {

            SpaceTransactionInsert.insertMoveProjectRecord(questAnswers,
                (String) questAnswers.get(SpaceConstants.DEPARTMENT_CONTACT), requestor);
        }
        if (!rmpctList.isEmpty()) {

            for (final DataRecord rmpct : rmpctList) {
                final DataRecord moRec =
                        SpaceTransactionInsert.insertMoveOrderRecord(acLogRec, moDS, emDS,
                            questAnswers, requestorRec, deptContactRec, rmpct);
                // kb3034359: add mo_id to rmpct
                rmpct
                .setValue(
                    SpaceConstants.RMPCT + SpaceConstants.DOT + SpaceConstants.MO_ID,
                    moRec.getValue(SpaceConstants.T_MO + SpaceConstants.DOT
                        + SpaceConstants.MO_ID));
                rmpctDS.saveRecord(rmpct);

                SpaceTransactionInsert.insertMoveEqRecord(context, rmpct, moRec);
                SpaceTransactionInsert.insertMoveTaRecord(context, rmpct, moRec);
            }
        }

        // Finally, put the Service Request into 'Approved' status.
        acLogRec.setValue("activity_log.status", "APPROVED");
        acLogDS.saveRecord(acLogRec);
    }
    
    /**
     *
     * insert move order records from employee pending assignments.
     *
     * @param project the project map that contains values
     * @param pendingAssignment the employee assignments
     */
    public void insertMoProjectRecordsFromEmployeePendingAssignments(
            final Map<String, Object> project, final List<Map<String, String>> pendingAssignment) {
        // Insert project
        final String deptContact = (String) project.get(SpaceConstants.DEPT_CONTACT);
        final String requestor = (String) project.get(SpaceConstants.REQUESTOR);
        SpaceTransactionInsert.insertMoveProjectRecord(project, deptContact, requestor);
        
        // Insert move orders
        for (final Map<String, String> assignment : pendingAssignment) {
            SpaceTransactionInsert.insertMoveOrderRecordFromPendingAssignment(project, assignment);
        }
    }

    /**
     *
     * This workflow rule is designed to either insert new records into the rmpct table, based on
     * new move service request information, or update existing rmpct records to reflect a status
     * change in the corresponding move service request. When the corresponding move service
     * requests status changes to Approved, then this workflow rule must also update other rmpct
     * record values to record end dates of employee assignments that will end due to the upcoming
     * move.
     *
     * @param date String insert date
     * @param assignmentsList List<RmpctObject> move employess assignment array
     */
    public void insertUpdateRmpctRecordsFromMoveServiceRequest(final Date date,
            final List<AssignmentObject> assignmentsList) {

        this.assignmentsToInsert = assignmentsList;

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        String action;

        // Prepare needed activity parameters in below process
        final boolean isInferRoomDepartments =
                SpaceTransactionUtil.loadBooleanActivityParameter("InferRoomDepartments");

        final String isAssignUnallocatedSpace =
                EventHandlerBase.getActivityParameterString(context, SpaceConstants.SPACE_ACTIVITY,
                    SpaceConstants.ASSIGN_UNALLOCATED_SPACE);

        // Prepare datasource of rmpct, em, rm
        final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();

        final DataSource emDS = SpaceTransactionUtil.getEmDataSource();

        final DataSource rmDS = SpaceTransactionUtil.getRmDataSource();

        SpaceTransactionCommon.initialFromLocationMap(this.fromLocationCount, assignmentsList,
            date, rmpctDS, rmDS);

        // Loop through all assignments to insert or update rmpct

        for (final AssignmentObject assignment : assignmentsList) {
            final RoomTransaction roomTransaction = assignment.getRoomTransaction();
            // KB 3046253 (IOAN) - add mo.date_to_perform as rmpct.date_start for each move
            Date tmpDate = date;
            if (StringUtil.notNullOrEmpty(assignment.getRoomTransaction().getDateStart())) {
                tmpDate = assignment.getRoomTransaction().getDateStart();
            }
            action = assignment.getAction();

            if (SpaceConstants.ACTION_INSERT.equalsIgnoreCase(action)) {
                this.insertRmpctForMoveRequest(rmpctDS, emDS, rmDS, assignment, tmpDate,
                    isInferRoomDepartments);

            } else if (SpaceConstants.ACTION_UPDATE.equalsIgnoreCase(action)) {

                final int status = roomTransaction.getStatus();

                if (status == 1) {

                    this.updateRmpctForMoveRequest(rmpctDS, rmDS, assignment, tmpDate,
                        isAssignUnallocatedSpace);
                }
            }
        }

        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, SpaceConstants.SUCCESS);

    }

    /**
     *
     * do submit and approve for one record. after current move, restore future trans deleted
     * before.
     *
     * @param assignment RmpctObject
     */
    public void insertUpdateOneRmpctRecordFromMoveServiceRequest(final AssignmentObject assignment) {

        List<AssignmentObject> assignmentsList = new ArrayList<AssignmentObject>();
        assignmentsList.add(assignment);

        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final Integer activityLogId = roomTransaction.getActivityLogId();
        final DataRecord dataRecordActivityLog =
                SpaceTransactionCommon.getActivityLogRecord(activityLogId);
        final String activityType =
                (String) dataRecordActivityLog.getValue(SpaceConstants.ACTIVITY_LOG
                    + SpaceConstants.DOT + SpaceConstants.ACTIVITY_TYPE);
        roomTransaction.setStatus(0);
        assignment.setRoomTransaction(roomTransaction);
        assignment.setAction(SpaceConstants.ACTION_INSERT);

        final Date dateStart = roomTransaction.getDateStart();

        if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
            final SpaceTransactionDepartment transactionDepartment =
                    new SpaceTransactionDepartment();
            transactionDepartment.insertUpdateRmpctRecordsFromDpServiceRequest(dateStart,
                assignmentsList);

            roomTransaction.setStatus(1);
            assignment.setRoomTransaction(roomTransaction);
            assignment.setAction(SpaceConstants.ACTION_UPDATE);

            transactionDepartment.insertUpdateRmpctRecordsFromDpServiceRequest(dateStart,
                assignmentsList);
        } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
            assignmentsList =
                    SpaceFutureTransactionCommon.resetParentForAssignments(assignmentsList,
                        dateStart);

            this.insertUpdateRmpctRecordsFromMoveServiceRequest(dateStart, assignmentsList);

            roomTransaction.setStatus(1);
            assignment.setRoomTransaction(roomTransaction);
            assignment.setAction(SpaceConstants.ACTION_UPDATE);
            this.insertUpdateRmpctRecordsFromMoveServiceRequest(dateStart, assignmentsList);
        }

    }

    /**
     *
     * This method does insert logic for an assignment.
     *
     * @param rmpctDS DataSource rmpct datasource
     * @param emDS DataSource em datasource
     * @param rmDS DataSource rm datasource
     * @param assignment RmpctObject an employee assignment
     * @param requestDate Date requested move date
     * @param isInferRoomDepartments boolean value of activity parameter 'InferRoomDepartments'
     *
     */
    private void insertRmpctForMoveRequest(final DataSource rmpctDS, final DataSource emDS,
            final DataSource rmDS, final AssignmentObject assignment, final Date requestDate,
            final boolean isInferRoomDepartments) {
        // float pctSpace = (float) SpaceConstants.ONE_HUNDRED;
        final DataRecord rmpctRec = rmpctDS.createNewRecord();

        final ParsedRestrictionDef parsedRmpctResForEmptyToLocation =
                SpaceTransactionRestriction.getParsedRmpctRestrictionForEmptyToLocation(assignment,
                    requestDate);

        final List<DataRecord> rmpctList =
                // kb 3035118 addSort in mssql will generate ' rmpct.pct_id DESC, rmpct.pct_id DESC', remove
                // the sort logic.
                // com.microsoft.sqlserver.jdbc.SQLServerException: A column has been specified
                // more than once in the order by list.Columns in the order by list must be unique.
                // rmpctDS.addSort(SpaceConstants.RMPCT, SpaceConstants.PCT_ID, DataSource.SORT_DESC)
                SpaceTransactionUtil.getRmpctJoinRmcat().getRecords(
                    parsedRmpctResForEmptyToLocation);

        // There is at least one empty rmpct record in the to location
        if (rmpctList.isEmpty()) {
            // This method does insert logic for an not exist rmpcts of empty 'to' Location.
            insertRmpctForMoveRequestWithoutRecords(rmpctDS, assignment, requestDate);
        } else {
            // This method does insert logic for an exist rmpcts of empty 'to' Location.
            insertRmpctForMoveRequestWithRecords(rmpctDS, assignment, rmpctList);

        }

        if (isInferRoomDepartments) {
            insertRmpctForMoveRequestWithInferRmDps(emDS, assignment);
        } else {
            insertRmpctForMoveRequestWithoutInferRmDps(rmDS, assignment, requestDate);
        }

        SpaceTransactionCommon.saveValueToRmpct(assignment, rmpctRec, requestDate);

        // kb#3034359: when inserted from Move Management, set activity_log_id to null.
        if (rmpctRec.getInt(SpaceConstants.RMPCT + SpaceConstants.DOT
            + SpaceConstants.ACTIVITY_LOG_ID) == 0) {
            rmpctRec.setValue(SpaceConstants.RMPCT + SpaceConstants.DOT
                + SpaceConstants.ACTIVITY_LOG_ID, null);
        }
        rmpctDS.saveRecord(rmpctRec);
    }

    /**
     *
     * This method does insert logic for InferRoomDepartments is '1'.
     *
     * @param emDS DataSource em datasource
     * @param assignment JSONObject an employee assignment
     *
     */
    private void insertRmpctForMoveRequestWithInferRmDps(final DataSource emDS,
            final AssignmentObject assignment) {

        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final ParsedRestrictionDef emResDef = new ParsedRestrictionDef();
        emResDef.addClause(SpaceConstants.T_EM, SpaceConstants.EM_ID,
            roomTransaction.getEmployeeId(), Operation.EQUALS);

        final DataRecord emRec = emDS.getRecords(emResDef).get(0);

        roomTransaction.setDivisionId(emRec.getString(SpaceConstants.T_EM + SpaceConstants.DOT
            + SpaceConstants.DV_ID));
        roomTransaction.setDepartmentId(emRec.getString(SpaceConstants.T_EM + SpaceConstants.DOT
            + SpaceConstants.DP_ID));
        roomTransaction.setPrimaryRoom(0);
        assignment.setRoomTransaction(roomTransaction);

    }

    /**
     *
     * This method search database get all DataRecord by to location.
     *
     * @param rmDS DataSource rm datasource
     * @param roomTransaction RoomTransaction
     * @return list List<DataRecord>
     */
    private List<DataRecord> getDataRecordbyToLocation(final DataSource rmDS,
        final RoomTransaction roomTransaction) {

        final String blId = roomTransaction.getBuildingId();
        final String flId = roomTransaction.getFloorId();
        final String rmId = roomTransaction.getRoomId();

        final ParsedRestrictionDef rmResDef = new ParsedRestrictionDef();
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.RM_ID, rmId, Operation.EQUALS);
        return rmDS.getRecords(rmResDef);
    }

    /**
     *
     * This method does insert logic for InferRoomDepartments is '0'.
     *
     * @param rmDS DataSource rm datasource
     * @param assignment RmpctObject an employee assignment
     * @param requestDate request date
     */
    private void insertRmpctForMoveRequestWithoutInferRmDps(final DataSource rmDS,
            final AssignmentObject assignment, final Date requestDate) {

        final RoomTransaction roomTransaction = assignment.getRoomTransaction();

        // get record by location from rm table.
        final List<DataRecord> list = this.getDataRecordbyToLocation(rmDS, roomTransaction);

        final DataSource dsRmpctActivity = SpaceTransactionUtil.getRmpctJoinActivityLogDataSource();
        final List<DataRecord> rmpctList2 =
                dsRmpctActivity.getRecords(SpaceTransactionRestriction
                    .getParsedRmpctRestrictionForDpToLocation(assignment, requestDate));

        if (list != null && !list.isEmpty()) {
            final DataRecord rmRec = list.get(0);

            if (StringUtil.isNullOrEmpty(roomTransaction.getDivisionId())
                    || StringUtil.isNullOrEmpty(roomTransaction.getDepartmentId())) {

                roomTransaction.setDivisionId(rmRec.getString(SpaceConstants.T_RM
                    + SpaceConstants.DOT + SpaceConstants.DV_ID));
                roomTransaction.setDepartmentId(rmRec.getString(SpaceConstants.T_RM
                    + SpaceConstants.DOT + SpaceConstants.DP_ID));
                roomTransaction.setProrate(rmRec.getString(SpaceConstants.T_RM + SpaceConstants.DOT
                    + SpaceConstants.PRORATE));
            }
            // kb;3034726, dv_id and dp_id came from department request record under
            // SpaceTransactionRestriction.getParsedRmpctRestrictionForDpToLocation(assignment,
            // requestDate))
            if (!rmpctList2.isEmpty()) {
                final DataRecord recordFromDp = rmpctList2.get(0);
                final String dvId =
                        recordFromDp.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.DV_ID);
                final String dpId =
                        recordFromDp.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.DP_ID);
                final String prorate =
                        recordFromDp.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
                            + SpaceConstants.PRORATE);
                roomTransaction.setDivisionId(dvId);
                roomTransaction.setDepartmentId(dpId);
                roomTransaction.setProrate(prorate);

            }

            if (StringUtil.isNullOrEmpty(roomTransaction.getCategory())
                    || StringUtil.isNullOrEmpty(roomTransaction.getType())) {

                roomTransaction.setCategory(rmRec.getString(SpaceConstants.T_RM
                    + SpaceConstants.DOT + SpaceConstants.RM_CAT));
                roomTransaction.setType(rmRec.getString(SpaceConstants.T_RM + SpaceConstants.DOT
                    + SpaceConstants.RM_TYPE));
            }
            assignment.setRoomTransaction(roomTransaction);
        }
        this.setPrimaryRoomAndProrate(assignment, roomTransaction);
    }

    /**
     *
     * set primary room and prorate.
     *
     * @param assignment AssignmentObject
     * @param roomTransaction RoomTransaction
     *
     */
    private void setPrimaryRoomAndProrate(final AssignmentObject assignment,
            final RoomTransaction roomTransaction) {

        // IF selected_primary_rm IS NOT NULL THEN <selected_primary_rm> ELSE 1
        final int parentPctId = roomTransaction.getParentId();
        if (0 == parentPctId) {
            roomTransaction.setPrimaryRoom(1);
            assignment.setRoomTransaction(roomTransaction);

        } else {
            final DataSource rmpctDS = SpaceTransactionUtil.getRmpctDataSource();
            final DataRecord existedRmpct =
                    rmpctDS.getRecord(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PCT_ID + SpaceConstants.EQUAL + parentPctId);
            if (existedRmpct != null) {
                roomTransaction.setPrimaryRoom(existedRmpct.getInt(SpaceConstants.RMPCT
                    + SpaceConstants.DOT + SpaceConstants.PRIMARY_RM));
                roomTransaction.setProrate(existedRmpct.getString(SpaceConstants.RMPCT
                    + SpaceConstants.DOT + SpaceConstants.PRORATE));
                assignment.setRoomTransaction(roomTransaction);
            }

        }

    }

    /**
     *
     * This method does insert logic for an not exist rmpcts of empty 'to' Location.
     *
     * @param rmpctDS DataSource rmpct datasource
     * @param assignment RmpctObject an employee assignment
     * @param requestDate Date requested move date
     *
     */
    private void insertRmpctForMoveRequestWithoutRecords(final DataSource rmpctDS,
            final AssignmentObject assignment, final Date requestDate) {

        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        // Return a parsed restriction object for querying rmpct records are occupied for
        // location.
        final List<DataRecord> rmpctList1 =
                rmpctDS.getRecords(SpaceTransactionRestriction
                    .getParsedRmpctRestrictionForToLocation(assignment, requestDate));
        if (rmpctList1.isEmpty()) {
            roomTransaction.setPercentageOfSpace((float) SpaceConstants.ONE_HUNDRED);
        } else {
            final float pctSpace = (float) (SpaceConstants.ONE_HUNDRED / (rmpctList1.size() + 1));
            roomTransaction.setPercentageOfSpace(pctSpace);
        }

        assignment.setRoomTransaction(roomTransaction);
    }

    /**
     *
     * This method does insert logic for an exist rmpcts of empty 'to' Location.
     *
     * @param rmpctDS DataSource rmpct datasource
     * @param assignment RmpctObject an employee assignment
     * @param rmpctList List<DataRecord> rmpct list
     *
     */
    private void insertRmpctForMoveRequestWithRecords(final DataSource rmpctDS,
            final AssignmentObject assignment, final List<DataRecord> rmpctList) {

        final int parentPctId = assignment.getRoomTransaction().getParentId();
        DataRecord existedRmpct = null;
        if (parentPctId == 0) {
            // There is only one vacant, active rmpct record
            // kb3034359: If rooms are selected in Move Management, the user will not have the
            // option to select from multiple parts of the room. Therefore, the above logic may
            // actually run even if there is more than one vacant, active rmpct record. If that
            // the case, then SELECT MAX(pct_id) and get only the one record attributes associated
            // with the MAX(pct_id). Here the rmpctList is sort by pct_id descenent - ZY
            // kb 3035118, default order by was ASC, so got the last record.
            // existedRmpct = rmpctList.get(0);
            existedRmpct = rmpctList.get(rmpctList.size() - 1);
            // find a matched but not occupied empty 'to location' room part for request from move
            // management.
            final int matched =
                    SpaceTransactionCommon.findMatchedEmptyPctForRequestFromMoveManagement(
                        rmpctList, assignment, this.assignmentsToInsert);
            if (matched >= 0) {
                existedRmpct = rmpctList.get(matched);
            }

        } else {
            // There is more than one vacant, active rmpct record.
            existedRmpct =
                    rmpctDS.getRecord(SpaceConstants.RMPCT + SpaceConstants.DOT
                        + SpaceConstants.PCT_ID + SpaceConstants.EQUAL + parentPctId);
        }
        setSelectValuesToAssignment(assignment, existedRmpct);
    }

    /**
     * Set specified field values from rmpct record to assignment object, those field values is
     * necessary for final insert into new rmpct record from assignment object.
     *
     * new String[] { SpaceConstants.DV_ID, SpaceConstants.DP_ID, SpaceConstants.RM_CAT,
     * SpaceConstants.RM_TYPE, SpaceConstants.PCT_SPACE }
     *
     * @param assignment RmpctObject assignment object
     * @param record DataRecord data record
     *
     */
    private void setSelectValuesToAssignment(final AssignmentObject assignment,
            final DataRecord record) {

        final RoomTransaction roomTransaction = assignment.getRoomTransaction();

        roomTransaction.setPercentageOfSpace(record.getDouble(SpaceConstants.RMPCT
            + SpaceConstants.DOT + SpaceConstants.PCT_SPACE));
        roomTransaction.setDivisionId(record.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
            + SpaceConstants.DV_ID));

        roomTransaction.setDepartmentId(record.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
            + SpaceConstants.DP_ID));
        roomTransaction.setCategory(record.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
            + SpaceConstants.RM_CAT));
        roomTransaction.setType(record.getString(SpaceConstants.RMPCT + SpaceConstants.DOT
            + SpaceConstants.RM_TYPE));
        assignment.setRoomTransaction(roomTransaction);
    }

    /**
     * This method does insert logic for an assignment.
     *
     * @param rmpctDS DataSource rmpct datasource
     * @param rmDS DataSource rm datasource
     * @param assignment RmpctObject an employee assignment
     * @param requestDate Date requested move date
     * @param isAssignUnallocatedSpace String value of activity parameter 'AssignUnallocatedSpace'
     *
     */
    private void updateRmpctForMoveRequest(final DataSource rmpctDS, final DataSource rmDS,
            final AssignmentObject assignment, final Date requestDate,
            final String isAssignUnallocatedSpace) {

        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        // If status = 1 This is an 'approved' request. The system must:
        // final ParsedRestrictionDef parsedResDef = SpaceTransactionHelper
        // .getParsedRmpctRestrictionForEmptyToLocation(assignment, requestDate);

        final ParsedRestrictionDef parsedResDef = new ParsedRestrictionDef();
        parsedResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID,
            SqlUtils.makeLiteralOrBlank(roomTransaction.getEmployeeId()), Operation.EQUALS);
        parsedResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID,
            roomTransaction.getActivityLogId(), Operation.EQUALS, RelativeOperation.AND_BRACKET);
        parsedResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.MO_ID,
            roomTransaction.getMoId(), Operation.EQUALS, RelativeOperation.OR);

        final List<DataRecord> records = rmpctDS.getRecords(parsedResDef);

        DataRecord rmpctRec = null;
        if (records != null && !records.isEmpty()) {
            rmpctRec = records.get(0);
        }

        // 1.Update the from location if it is different from what was originally stored in the
        // rmpct record
        if (rmpctRec != null) {
            SpaceTransactionUpdate.updateFromLocationToRmpct(assignment, rmpctRec);
        }

        // 2. Update the to location if it is different from what was originally stored in the
        // rmpct record
        // Pay attention: this step is removed because any to location changed assignment will
        // be split into
        // two assignments: one deleted assignment and one inserted assignment, thus don't need
        // to update to location anymore.

        // 3. Get a value for <selected_rmpct_id>.
        // Pay attention: this step is implemented in the last step 7 since <selected_rmpct_id>
        // is only used there.

        // 4. Update status to approved for the inserted rmpct record that matches to the
        // request.
        SpaceTransactionUpdate.updateRmpctStatus(1, assignment);

        // 5. If a rmpct record does not exist, insert another rmpct record from where the
        // employee moved to capture allocation without the employee occupying that space.
        // Allocation depends on activity parameter assignUnallocatedSpace?
        final ParsedRestrictionDef moveOutRestriction =
                SpaceTransactionRestriction.getParsedRmpctRestrictionForFromLocation(assignment,
                    requestDate, true);

        // IF <from_bl_id>, <from_fl_id>, <from_rm_id> are NOT NULL,
        if (StringUtil.notNullOrEmpty(roomTransaction.getFromBuildingId())
                && StringUtil.notNullOrEmpty(roomTransaction.getFromFloorId())
                && StringUtil.notNullOrEmpty(roomTransaction.getFromRoomId())) {
            if (rmpctRec != null) {
                updateRmpctForMoveRequestForNoNullFrom(rmpctRec, rmpctDS, rmDS, assignment,
                    requestDate, isAssignUnallocatedSpace, moveOutRestriction);
            }

            // 6. Apply an end date to the rmpct record from where the employee moved.
            SpaceTransactionCommon.setEndDateToRmpct(rmpctDS, moveOutRestriction, requestDate);

            final String fromBlId = roomTransaction.getFromBuildingId();
            final String fromFlId = roomTransaction.getFromFloorId();
            final String fromRmId = roomTransaction.getFromRoomId();

            if (this.ifAdjustPctSpace) {
                // if we don't need to create a rmpct record to hold the empty room portion,
                // then call updatePercentageOfSpace passing in the from location and start date
                AllRoomPercentageUpdate.updatePercentageOfSpace(requestDate, fromBlId, fromFlId,
                    fromRmId);
                this.ifAdjustPctSpace = false;
            }
        }

        // 7.Apply an end date to the rmpct record to where the employee is moving, that held
        // allocation information about that room but without the new employee
        SpaceTransactionCommon.applyEndDateToMovingInRmpcts(rmpctDS, assignment, requestDate);
    }

    /**
     *
     * This method does insert logic for an assignment.
     *
     * @param rmpctRec DataRecord move to rmpct record with employee.
     * @param rmpctDS DataSource rmpct datasource
     * @param rmDS DataSource rm datasource
     * @param assignment RmpctObject an employee assignment
     * @param requestDate Date requested move date
     * @param isAssignUnallocatedSpace String value of activity parameter 'AssignUnallocatedSpace'
     * @param moveOutRestriction ParsedRestrictionDef parsed rmpct restriction object
     *
     */
    private void updateRmpctForMoveRequestForNoNullFrom(final DataRecord rmpctRec,
            final DataSource rmpctDS, final DataSource rmDS, final AssignmentObject assignment,
            final Date requestDate, final String isAssignUnallocatedSpace,
            final ParsedRestrictionDef moveOutRestriction) {
        final List<DataRecord> fromRmpctList = rmpctDS.getRecords(moveOutRestriction);

        // If existed rmpct that currnet employee of assignment move out from
        if (!fromRmpctList.isEmpty()) {

            final DataRecord fromRmpctRec = fromRmpctList.get(0);

            final RoomTransaction roomTransaction = assignment.getRoomTransaction();
            final String fromBlId = roomTransaction.getFromBuildingId();
            final String fromFlId = roomTransaction.getFromFloorId();
            final String fromRmId = roomTransaction.getFromRoomId();

            final int[] count = this.fromLocationCount.get(fromBlId + fromFlId + fromRmId);
            // if cap_em of room is 0, then at least insert one empty rmpct for from location.
            if (count[2] == 0 && count[SpaceConstants.PROPERTY_COUNT - 1] == 0) {
                SpaceTransactionInsert.insertMoveOutRmpct(rmpctRec, assignment, rmpctDS, rmDS,
                    fromRmpctRec, requestDate, isAssignUnallocatedSpace);
                count[2] = -1;

            } else if (count[0] - count[1] < count[2]) {

                SpaceTransactionInsert.insertMoveOutRmpct(rmpctRec, assignment, rmpctDS, rmDS,
                    fromRmpctRec, requestDate, isAssignUnallocatedSpace);
                count[1] = count[1] - 1;
            } else {
                this.ifAdjustPctSpace = true;
            }
            this.fromLocationCount.put(fromBlId + fromFlId + fromRmId, count);
        }
    }
}
