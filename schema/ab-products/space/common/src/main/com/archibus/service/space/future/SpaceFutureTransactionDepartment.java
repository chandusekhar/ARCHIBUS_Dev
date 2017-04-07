package com.archibus.service.space.future;

import java.util.*;

import com.archibus.service.space.*;
import com.archibus.service.space.transaction.*;

/**
 * <p>
 * Space Transaction Department Future Class, Added by ASC-BJ, Zhang Yi for 20.2 Space.<br>
 * 
 * <p>
 * 
 */
public class SpaceFutureTransactionDepartment extends SpaceTransactionDepartment {
    
    /**
     * restore deleted future datas by impacted order.
     * 
     * @param date String start date
     * @param assignment JSONObject current department assignment
     * @param future SpaceFutureTransactionHandler Object
     * @param cancelOrReassign 1: cancel , otherwise re-assign.
     */
    public void restoreFutureTrans(final AssignmentObject assignment, final Date date,
            final SpaceFutureTransactionHandler future, final int cancelOrReassign) {
        
        final List<AssignmentObject> assignments = new ArrayList<AssignmentObject>();
        assignments.add(assignment);
        
        if (cancelOrReassign == 0) {
            this.insertUpdateRmpctRecordsFromDpServiceRequest(date, assignments);
        } else {
            final Integer activityLogId = assignment.getRoomTransaction().getActivityLogId();
            new SpaceTransactionDelete().deleteRmpctRecord(activityLogId, assignments);
        }
        
        // restore original deleted future records.
        new SpaceFutureTransactionHandler().restoreFutureTrans(future);
    }
    
    /**
     * detect if exists future transaction before do Insert and update rmpct records from department
     * space service request. backup these record and restore after current assignment change.
     * 
     * @param date request date
     * @param assignmentsList List<RmpctObject> department space request assignment include blId,
     *            flId, rmId, dvId, dpId, status, activityLogId, action
     */
    public void superInsertUpdateRmpctRecordsFromDpServiceRequest(final Date date,
            final List<AssignmentObject> assignmentsList) {
        
        // change for exists future transactions.
        if (assignmentsList == null || assignmentsList.isEmpty()) {
            return;
        }
        
        final AssignmentObject firstAssignment = assignmentsList.get(0);
        if (firstAssignment.getAction().equalsIgnoreCase(SpaceConstants.ACTION_UPDATE)) {
            
            for (final AssignmentObject assignment : assignmentsList) {
                
                if (SpaceFutureTransactionCommon.detectIfExistFutureTransInvolved(assignment, date,
                    1)) {
                    
                    final SpaceFutureTransactionHandler future =
                            new SpaceFutureTransactionHandler();
                    future.recurHandleFutureTrans(assignment, date, 1);
                    future.deleteFutureAssignments();
                    this.restoreFutureTrans(assignment, date, future, 0);
                    
                } else {
                    final List<AssignmentObject> rmpctArray = new ArrayList<AssignmentObject>();
                    rmpctArray.add(assignment);
                    this.insertUpdateRmpctRecordsFromDpServiceRequest(date, rmpctArray);
                }
            }
        } else {
            
            this.insertUpdateRmpctRecordsFromDpServiceRequest(date, assignmentsList);
        }
    }
    
}
