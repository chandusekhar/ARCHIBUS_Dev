package com.archibus.service.space;

import java.util.*;

import org.json.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.service.space.future.*;
import com.archibus.service.space.helper.*;
import com.archibus.service.space.transaction.*;

/**
 * <p>
 * Space Transaction Process Class, Added for 20.1 Space.<br>
 *
 * @author ASC-BJ, Zhang Yi
 *
 *         Justification: This class contains public Workflow rule entries. It need to contain WFR
 *         methods and reference to actual methods
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public class SpaceTransactionProcess {
    
    /**
     * Approve department space request.
     *
     * @param date request date
     * @param activityLogId activity log id
     * @param assignmentsList assignment JSONObject that will be approved or deleted
     * @param record JSONObject for submit request
     * @param comments String for submit request
     */
    public void approveDepartmentSpace(final JSONObject record, final String comments,
            final Date date, final Integer activityLogId, final JSONObject assignmentsList) {
        
        new RequestHandler().approveRequest(record, comments);
        
        final JSONArray deleteAssignmentsArray =
                assignmentsList.getJSONArray(SpaceConstants.SIGN_DELETE);
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(deleteAssignmentsArray);
        
        new SpaceFutureTransactionMove().superDeleteRmpctRecord(deleteAssignments, date);
        
        final JSONArray insertAssignmentsArray =
                assignmentsList.getJSONArray(SpaceConstants.SIGN_INSERT);
        final List<AssignmentObject> insertAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(insertAssignmentsArray);
        SpaceTransactionCommon.setStatusAndAction(insertAssignments, 0,
            SpaceConstants.ACTION_INSERT);
        
        final DataRecord actLogRecord = SpaceTransactionCommon.getActivityLogRecord(activityLogId);
        // move this code line down fix the warning.
        new SpaceFutureTransactionDepartment().insertUpdateRmpctRecordsFromDpServiceRequest(date,
            insertAssignments);
        
        if (SpaceConstants.STATUS_APPROVED.equalsIgnoreCase(actLogRecord
            .getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT + SpaceConstants.STATUS))) {
            
            SpaceTransactionCommon.setStatusAndAction(insertAssignments, 1,
                SpaceConstants.ACTION_UPDATE);
            new SpaceFutureTransactionDepartment()
                .superInsertUpdateRmpctRecordsFromDpServiceRequest(date, insertAssignments);
            
            final JSONArray unChangedAssignmentArray =
                    assignmentsList.getJSONArray(SpaceConstants.SIGN_UPDATE);
            
            final List<AssignmentObject> unChangedAssignment =
                    SpaceTransactionAssignmentHelper
                        .convertJSONObjectArrayToRmpctObjectList(unChangedAssignmentArray);
            
            SpaceTransactionCommon.setStatusAndAction(unChangedAssignment, 1,
                SpaceConstants.ACTION_UPDATE);
            new SpaceFutureTransactionDepartment()
                .superInsertUpdateRmpctRecordsFromDpServiceRequest(date, unChangedAssignment);
        }
    }
    
    /**
     * for approve function for overdue request Approve department space request.
     *
     * @param date request date
     * @param activityLogId activity log id
     * @param assignmentsList assignment JSONObject that will be approved or deleted
     * @param record JSONObject for submit request
     * @param comments String for submit request
     */
    public void approveDepartmentSpaceForPastDate(final JSONObject record, final String comments,
            final Date date, final Integer activityLogId, final JSONObject assignmentsList) {
        
        SpaceTransactionUpdate.updateRmpctDateByActivityLogId(date, activityLogId);
        this.approveDepartmentSpace(record, comments, date, activityLogId, assignmentsList);
        // update questionnaire again.
        SpaceTransactionUpdate.updateQuestionnaireAnswer(date, activityLogId);
    }
    
    /**
     *
     * for approve function when appprove button click. call method 'approveRequest' in file
     * RequestHandler
     *
     * 4.get states form field "activity_log.status" if it is 'Approve' 5. call WFT
     * 'getServiceProvider' if serviceProvider!='AbMoveManagement' call method 'insertRmpct' update
     * assign info. otherwise cal WFR 'insertMoProjectRecordsFromApprovedServiceRequest' 6.if no
     * exception throw, call sub-method changeTab complete invoke.
     *
     * @param activityLogId activityLogId
     * @param objRecordAndComments record and coomments
     * @param date String insert date
     * @param assignmentsObject assignment array
     */
    public void approveMove(final Integer activityLogId, final JSONObject objRecordAndComments,
            final Date date, final JSONObject assignmentsObject) {
        // call original wfr change statues.
        final RequestHandler requestHandler = new RequestHandler();
        requestHandler.approveRequest(objRecordAndComments.getJSONObject("record"),
            objRecordAndComments.getString("comments"));
        final JSONArray deleteAssignmentsArray =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_DELETE);
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(deleteAssignmentsArray);
        new SpaceFutureTransactionMove().superDeleteRmpctRecord(deleteAssignments, date);
        // for insert list
        final JSONArray insertAssignmentArray =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_INSERT);
        
        final List<AssignmentObject> insertAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(insertAssignmentArray);
        
        SpaceTransactionCommon.setStatusAndAction(insertAssignments, 0,
            SpaceConstants.ACTION_INSERT);
        new SpaceTransactionMove().insertUpdateRmpctRecordsFromMoveServiceRequest(date,
            insertAssignments);
        
        final DataRecord dataRecord = SpaceTransactionCommon.getActivityLogRecord(activityLogId);
        final String status =
                (String) dataRecord.getValue(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                        + SpaceConstants.STATUS);
        // if statues is approved
        if (SpaceConstants.STATUS_APPROVED.equals(status)) {
            final SpaceTransactionMove spaceTransactionMove = new SpaceTransactionMove();
            final String serviceProvider = SpaceTransactionCommon.getServiceProvider(activityLogId);
            
            if (SpaceConstants.AB_MOVE_MANAGEMENT.equals(serviceProvider)) {
                spaceTransactionMove
                    .insertMoProjectRecordsFromApprovedServiceRequest(activityLogId);
                
            } else {
                SpaceTransactionCommon.setStatusAndAction(insertAssignments, 1,
                    SpaceConstants.ACTION_UPDATE);
                final JSONArray unchangeAssignments =
                        assignmentsObject.getJSONArray(SpaceConstants.SIGN_UPDATE);
                
                SpaceTransactionCommon.mergeJSONArray(insertAssignmentArray, unchangeAssignments);
                
                final List<AssignmentObject> assignments =
                        SpaceTransactionAssignmentHelper
                            .convertJSONObjectArrayToRmpctObjectList(insertAssignmentArray);
                
                SpaceTransactionCommon.setStatusAndAction(assignments, 1,
                    SpaceConstants.ACTION_UPDATE);
                
                new SpaceFutureTransactionMove()
                    .superInsertUpdateRmpctRecordsFromMoveServiceRequest(date, assignments);
                
            }
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, SpaceConstants.SUCCESS);
        
    }
    
    /**
     *
     * for approve function for overdue request when appprove button click. call method
     * 'approveRequest' in file RequestHandler
     *
     * @param activityLogId activityLogId
     * @param objRecordAndComments record and coomments
     * @param date String insert date was currentDate
     * @param assignmentsObject assignment array
     */
    public void approveMoveForPastDate(final Integer activityLogId,
            final JSONObject objRecordAndComments, final Date date,
            final JSONObject assignmentsObject) {
        
        SpaceTransactionUpdate.updateRmpctDateByActivityLogId(date, activityLogId);
        
        this.approveMove(activityLogId, objRecordAndComments, date, assignmentsObject);
        // update questionnaire again.
        SpaceTransactionUpdate.updateQuestionnaireAnswer(date, activityLogId);
    }
    
    /**
     *
     * Issue � All Request Types � Issue button.
     *
     * @param activityLogId activityLogId
     * @param record record
     * @param assignmentsList assignment array
     * @param date String request start date.
     */
    public void cancelAll(final Integer activityLogId, final JSONObject record,
            final JSONArray assignmentsList, final Date date) {
        // 1. Call OD/SD WFR 'cancelRequest'
        new RequestHandler().cancelRequest(record);
        
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsList);
        
        new SpaceFutureTransactionMove().superDeleteRmpctRecord(deleteAssignments, date);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, SpaceConstants.SUCCESS);
    }
    
    /**
     * Reject all department space request. for mo order use
     *
     * @param activityLogId activity log id
     * @param assignmentsList assignment JSONObject that will be delete
     */
    public void cancelMoveOrder(final Integer activityLogId, final JSONArray assignmentsList) {
        // Since currently assignment from Move Management may not contain activity log id, while
        // Future Transaction related logic require this value to be not null, thus here can only
        // call deleteRmpctRecord method that without future
        // transaction logic
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsList);
        new SpaceTransactionDelete().deleteEmployeeAssignment(null, deleteAssignments);
    }
    
    /**
     *
     * Called from Move Management Application: when in Issue Process press 'Issue' button.
     * KB#3034359: create a new wfr method for only creating requested rmpct when issue move order
     * in Move Management.
     *
     * @param date String insert date
     * @param assignmentsObject assignment array
     *
     */
    public void closeMoveOrder(final Date date, final JSONObject assignmentsObject) {
        
        // delete assignments
        final JSONArray assignmentsList =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_DELETE);
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsList);
        new SpaceTransactionDelete().deleteEmployeeAssignment(null, deleteAssignments);
        
        // insert new assignments
        final JSONArray insertAssignmentsArray =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_INSERT);
        
        final List<AssignmentObject> insertAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(insertAssignmentsArray);
        
        SpaceTransactionCommon.setStatusAndAction(insertAssignments, 0,
            SpaceConstants.ACTION_INSERT);
        
        final SpaceTransactionMove spaceTransactionMove = new SpaceTransactionMove();
        
        spaceTransactionMove
            .insertUpdateRmpctRecordsFromMoveServiceRequest(date, insertAssignments);
        
        SpaceTransactionCommon.setStatusAndAction(insertAssignments, 1,
            SpaceConstants.ACTION_UPDATE);
        final JSONArray unchangeAssignments =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_UPDATE);
        
        final JSONArray assignmentsArray =
                SpaceTransactionCommon.mergeJSONArray(insertAssignmentsArray, unchangeAssignments);
        
        final List<AssignmentObject> assignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsArray);
        
        SpaceTransactionCommon.setStatusAndAction(assignments, 1, SpaceConstants.ACTION_UPDATE);
        
        // kb 3034913 change contains future trans logic.
        new SpaceFutureTransactionMove().superInsertUpdateRmpctRecordsFromMoveServiceRequest(date,
            assignments);
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, SpaceConstants.SUCCESS);
    }
    
    /**
     *
     * Cancel All Request for View Service Requests task second tab cancel button.
     *
     * @param activityLogId activityLogId
     * @param record record
     * @param assignmentsList assignment array
     * @param date String request start date.
     */
    public void deleteAll(final Integer activityLogId, final JSONObject record,
            final JSONArray assignmentsList, final Date date) {
        
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsList);
        new SpaceFutureTransactionMove().superDeleteRmpctRecord(deleteAssignments, date);
        
        new RequestHandler().deleteRequest(record);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, SpaceConstants.SUCCESS);
    }
    
    /**
     * check if Another request exists involving Future trans. prompt user before save the dv-dp
     * change in Define Emloyees view
     *
     * @param emId String em.
     * @param oldBlId String old building id.
     * @param oldFlId String old floor id.
     * @param oldRmId String old room id.
     *
     * @return result if not exist return "".
     */
    public String detectIfExistsFutureInDefineEm(final String emId, final String oldBlId,
            final String oldFlId, final String oldRmId) {
        return SpaceFutureTransactionCommon.detectIfExistsFutureInDefineEm(emId, oldBlId, oldFlId,
            oldRmId);
    }
    
    /**
     * 'for move assignment' and 'department space'. check if Another request exists involving the
     * same employee for a future assignment.
     *
     * @param requestDate String insert date
     * @param assignmentsObject JSONObject assignmentsObject
     * @param bussnessType 0: move management submit or approve issue 1: move management cancel
     *            others: department space.
     * @return result activityLogIds if not null
     */
    public String detectIfExistsMoveFuture(final JSONObject assignmentsObject,
            final Date requestDate, final int bussnessType) {
        return SpaceFutureTransactionCommon.detectIfExistsFutureTrans(assignmentsObject,
            requestDate, bussnessType);
    }
    
    /**
     *
     * Issue � All Request Types � Issue button.
     *
     * @param activityLogId activityLogId
     * @param record record
     * @param date String insert date
     * @param assignmentsObject assignment array
     * @param flag if not true only save do not call issueRequest method.
     */
    public void issueAll(final Integer activityLogId, final JSONObject record, final Date date,
            final JSONObject assignmentsObject, final boolean flag) {
        // 1. Call OD/SD WFR 'issueRequest'
        if (!flag) {
            new RequestHandler().issueRequest(record);
        }
        
        final JSONArray insertAssignmentsArray =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_INSERT);
        
        final List<AssignmentObject> insertAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(insertAssignmentsArray);
        
        final JSONArray assignmentsArray =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_DELETE);
        
        // b. Insert insertAssignment list.
        final DataRecord dataRecord = SpaceTransactionCommon.getActivityLogRecord(activityLogId);
        
        final String activityType =
                (String) dataRecord.getValue(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                        + SpaceConstants.ACTIVITY_TYPE);
        
        SpaceTransactionCommon.setStatusAndAction(insertAssignments, 0,
            SpaceConstants.ACTION_INSERT);
        
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsArray);
        
        new SpaceFutureTransactionMove().superDeleteRmpctRecord(deleteAssignments, date);
        
        if (SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE.equals(activityType)) {
            new SpaceFutureTransactionDepartment()
                .superInsertUpdateRmpctRecordsFromDpServiceRequest(date, insertAssignments);
            SpaceTransactionCommon.setStatusAndAction(insertAssignments, 1,
                SpaceConstants.ACTION_UPDATE);
            new SpaceFutureTransactionDepartment()
                .superInsertUpdateRmpctRecordsFromDpServiceRequest(date, insertAssignments);
            
        } else if (SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE.equals(activityType)
                || SpaceConstants.SERVICE_DESK_GROUP_MOVE.equals(activityType)) {
            new SpaceFutureTransactionMove().superInsertUpdateRmpctRecordsFromMoveServiceRequest(
                date, insertAssignments);
            
            SpaceTransactionCommon.setStatusAndAction(insertAssignments, 1,
                SpaceConstants.ACTION_UPDATE);
            new SpaceFutureTransactionMove().superInsertUpdateRmpctRecordsFromMoveServiceRequest(
                date, insertAssignments);
            
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, SpaceConstants.SUCCESS);
    }
    
    /**
     *
     * Issue for past date - All Request Types - Issue button. first delete all the original
     * assignments, and then assign again.
     *
     * @param activityLogId activityLogId
     * @param record record
     * @param date String insert date
     * @param assignmentsObject assignment array contains: D:original assignments I: assignments
     *            after changed.
     * @param flag if not true only save do not call issueRequest method.
     */
    public void issueAllForPastDate(final Integer activityLogId, final JSONObject record,
            final Date date, final JSONObject assignmentsObject, final boolean flag) {
        final Date currentDate = new Date();
        SpaceTransactionUpdate.updateQuestionnaireAnswer(currentDate, activityLogId);
        
        final JSONArray assignmentsList =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_DELETE);
        
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsList);
        new SpaceFutureTransactionMove().superDeleteRmpctRecord(deleteAssignments, date);
        
        assignmentsObject.put(SpaceConstants.SIGN_DELETE, new JSONArray());
        final Object inserted = assignmentsObject.get(SpaceConstants.SIGN_INSERT);
        if (inserted == null || "null".equals(inserted.toString())) {
            if (!flag) {
                new RequestHandler().issueRequest(record);
            }
        } else {
            this.issueAll(activityLogId, record, currentDate, assignmentsObject, flag);
        }
    }
    
    /**
     *
     * Called from Move Management Application: when in Close Process press 'Close' button.
     * RequestHandler
     *
     * @param date String insert date
     * @param assignmentsObject assignment array
     *
     */
    public void issueMoveOrder(final Date date, final JSONObject assignmentsObject) {
        
        // for delete assignment list
        final JSONArray assignmentsList =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_DELETE);
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsList);
        new SpaceTransactionDelete().deleteEmployeeAssignment(null, deleteAssignments);
        
        // for insert assignment list
        final List<AssignmentObject> insertAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsObject
                        .getJSONArray(SpaceConstants.SIGN_INSERT));
        
        SpaceTransactionCommon.setStatusAndAction(insertAssignments, 0,
            SpaceConstants.ACTION_INSERT);
        
        final SpaceTransactionMove spaceTransactionMove = new SpaceTransactionMove();
        
        // Since currently assignment from Move Management may not contain activity log id, while
        // Future Transaction related logic require this value to be not null, thus here can only
        // call insertUpdateRmpctRecordsFromMoveServiceRequest WFR method that without future
        // transaction logic
        spaceTransactionMove
            .insertUpdateRmpctRecordsFromMoveServiceRequest(date, insertAssignments);
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, SpaceConstants.SUCCESS);
    }
    
    /**
     * Reject all department space request.
     *
     * @param record that will be rejected by rejectRequest from RequestHandler.java
     * @param comments comments from client.
     * @param activityLogId activity log id
     * @param assignmentsList assignment JSONObject that will be delete
     * @param date String request start date.
     */
    public void rejectAll(final JSONObject record, final String comments,
            final Integer activityLogId, final JSONArray assignmentsList, final Date date) {
        
        final List<AssignmentObject> deleteAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(assignmentsList);
        new SpaceFutureTransactionMove().superDeleteRmpctRecord(deleteAssignments, date);
        new RequestHandler().rejectRequest(record, comments);
    }
    
    /**
     * Submit a department space request.
     *
     * @param date date request date
     * @param activityLogId activity log id
     * @param assignmentsList assignment JSONObject that will be approved or deleted
     * @param record JSONObject for submit request
     */
    public void submitDepartmentSpace(final JSONObject record, final Date date,
            final Integer activityLogId, final JSONObject assignmentsList) {
        
        new RequestHandler().submitRequest(String.valueOf(activityLogId), record);
        
        final JSONArray insertAssignmentsArray =
                assignmentsList.getJSONArray(SpaceConstants.SIGN_INSERT);
        
        final List<AssignmentObject> insertAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(insertAssignmentsArray);
        
        SpaceTransactionCommon.setStatusAndAction(insertAssignments, 0,
            SpaceConstants.ACTION_INSERT);
        
        new SpaceFutureTransactionDepartment().insertUpdateRmpctRecordsFromDpServiceRequest(date,
            insertAssignments);
        
        final DataRecord actLogRecord = SpaceTransactionCommon.getActivityLogRecord(activityLogId);
        
        if (SpaceConstants.STATUS_APPROVED.equalsIgnoreCase(actLogRecord
            .getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT + SpaceConstants.STATUS))) {
            
            SpaceTransactionCommon.setStatusAndAction(insertAssignments, 1,
                SpaceConstants.ACTION_UPDATE);
            new SpaceFutureTransactionDepartment()
                .superInsertUpdateRmpctRecordsFromDpServiceRequest(date, insertAssignments);
        }
        
    }
    
    /**
     *
     * @param activityLogId
     * @param date end_date
     * @param record original parameter in WFR submitRequest file: requestHandler.
     * @param activityLogId :current activityLogId value.
     * @param assignmentsObject JSONObject of employee assignments
     */
    public void submitMove(final Integer activityLogId, final JSONObject record, final Date date,
            final JSONObject assignmentsObject) {
        
        // call exist WFR submitRequest in file RequestHandler change the status.
        final RequestHandler requestHandler = new RequestHandler();
        requestHandler.submitRequest(String.valueOf(activityLogId), record);
        
        // Since in current process there are only assignments with sign I,
        // so directly call 'superInsertUpdateRmpctRecordsFromMoveServiceRequest'
        final JSONArray insertAssignmentsArray =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_INSERT);
        
        final List<AssignmentObject> insertAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(insertAssignmentsArray);
        
        SpaceTransactionCommon.setStatusAndAction(insertAssignments, 0,
            SpaceConstants.ACTION_INSERT);
        new SpaceTransactionMove().insertUpdateRmpctRecordsFromMoveServiceRequest(date,
            insertAssignments);
        
        final DataRecord dataRecord = SpaceTransactionCommon.getActivityLogRecord(activityLogId);
        final String status =
                dataRecord.getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                        + SpaceConstants.STATUS);
        
        // if status is approved.
        if (SpaceConstants.STATUS_APPROVED.equals(status)) {
            final SpaceFutureTransactionMove spaceTransactionMove =
                    new SpaceFutureTransactionMove();
            final String serviceProvider = SpaceTransactionCommon.getServiceProvider(activityLogId);
            
            if (SpaceConstants.AB_MOVE_MANAGEMENT.equals(serviceProvider)) {
                spaceTransactionMove
                    .insertMoProjectRecordsFromApprovedServiceRequest(activityLogId);
                
            } else {
                
                SpaceTransactionCommon.setStatusAndAction(insertAssignments, 1,
                    SpaceConstants.ACTION_UPDATE);
                spaceTransactionMove.superInsertUpdateRmpctRecordsFromMoveServiceRequest(date,
                    insertAssignments);
            }
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, SpaceConstants.SUCCESS);
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
     */
    public void getRoomAttribute(final String blId, final String flId, final JSONArray rooms,
            final Date requestDate) {
        
        final JSONObject json =
                SpaceFutureTransactionCommon.getRoomAttribute(blId, flId, rooms, requestDate);
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.setResponse(json);
    }

    /**
     * Detect if there are department claim/release requests and move requests on same day.
     *
     * @param assignmentsObject assignment array contains: D:original assignments I: assignments
     *            after changed.
     * @param requestDate Date request date
     * @param type Integer 1/0 indicate is detecting department requests or move requests
     *
     */
    public void detectDepartmentAndMoveOnSameDay(final JSONObject assignmentsObject,
            final Date requestDate, final Integer type) {
        
        final JSONArray insertAssignmentsArray =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_INSERT);
        final List<AssignmentObject> insertAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(insertAssignmentsArray);
        
        final JSONArray updateAssignmentsArray =
                assignmentsObject.getJSONArray(SpaceConstants.SIGN_UPDATE);
        final List<AssignmentObject> updateAssignments =
                SpaceTransactionAssignmentHelper
                    .convertJSONObjectArrayToRmpctObjectList(updateAssignmentsArray);

        updateAssignments.addAll(insertAssignments);

        final StringBuilder result = new StringBuilder();
        final DataSource rmpctDs = SpaceTransactionUtil.getRmpctJoinActivityLogDataSource();
        
        for (final AssignmentObject assignment : updateAssignments) {

            final RoomTransaction roomTransaction = assignment.getRoomTransaction();
            final String blId = roomTransaction.getBuildingId();
            final String flId = roomTransaction.getFloorId();
            final String rmId = roomTransaction.getRoomId();
            
            final ParsedRestrictionDef restriction =
                    type == 1 ? SpaceTransactionRestriction
                        .getParsedRmpctRestrictionForSameDayDepartmentRequests(assignment,
                            requestDate) : SpaceTransactionRestriction
                                .getParsedRmpctRestrictionForSameDayMoveRequests(assignment, requestDate);

                            if (!rmpctDs.getRecords(restriction).isEmpty()) {

                                result.append(result.length() > 0 ? ", " : "");
                                result.append(blId).append(SpaceConstants.SLASH).append(flId)
                    .append(SpaceConstants.SLASH).append(rmId);
                            }
        }

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(SpaceConstants.JSON_EXPRESSION, result.toString());
    }

    /**
     * Create group move orders with employee pending assignments information.
     *
     * @param groupMoveOrder group move order properties
     * @param assignments the employee pending assignments
     */
    public void insertMoProjectRecordsFromPendingAssignments(final JSONObject groupMoveOrder,
            final JSONArray assignments) {
        ContextStore.get().getEventHandlerContext();
        final Map<String, Object> project =
                HandlerParameterParser.getProjectFromMoveOrderPendingAssignments(groupMoveOrder);
        final List<Map<String, String>> employeeAssignments =
                HandlerParameterParser.getEmployeeAssigmentsForMoveOrders(assignments);
        // insert move order and associated table values.
        final SpaceTransactionMove move = new SpaceTransactionMove();
        move.insertMoProjectRecordsFromEmployeePendingAssignments(project, employeeAssignments);
    }
}
