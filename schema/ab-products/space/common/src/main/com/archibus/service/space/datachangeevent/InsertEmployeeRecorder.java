package com.archibus.service.space.datachangeevent;

import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.organization.domain.*;
import com.archibus.app.common.space.dao.IRoomCategoryDao;
import com.archibus.app.common.space.domain.*;
import com.archibus.context.*;
import com.archibus.datasource.DataSource;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.space.*;
import com.archibus.service.space.future.*;
import com.archibus.service.space.helper.SpaceTransactionAssignmentHelper;
import com.archibus.utility.*;

/**
 * Recorder for "insert employee" Transaction.
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * @author Zhang Yi
 * 
 */
public class InsertEmployeeRecorder extends AbstractRoomTransactionRecorder implements
        IInsertEmployeeRecorder {
    /**
     * Dao for RoomCategory.
     */
    private IRoomCategoryDao roomCategoryDao;
    
    /**
     * @return the roomCategoryDao
     */
    public IRoomCategoryDao getRoomCategoryDao() {
        return this.roomCategoryDao;
    }
    
    /** {@inheritDoc} */
    public void recordInsertTransaction(final User user, final Date dateTime,
            final Employee employee) {

        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, true);
        }
        // future transaction handler
        final SpaceFutureTransactionHandler futurHandler = new SpaceFutureTransactionHandler();
        
        // flag of whether need revert future transaction
        final boolean needRevertFutureTransactions =
                SpaceFutureTransactionCommon.needRevertFutureTransactions(employee.getBuildingId(),
                    employee.getFloorId(), employee.getRoomId(), dateTime, false, false);
        
        // check if need revert future transactions, call future transaction logic to revert back
        // all future transactions
        if (needRevertFutureTransactions) {
            futurHandler.recurHandleFutureTrans(getAssignments(employee), dateTime, 0);
            futurHandler.deleteFutureAssignments();
        }
        
        // check if employee has all required location fields values
        final boolean isLocationEmpty =
                !StringUtil.notNullOrEmpty(employee.getBuildingId())
                        || !StringUtil.notNullOrEmpty(employee.getFloorId())
                        || !StringUtil.notNullOrEmpty(employee.getRoomId());
        
        if (isLocationEmpty) {
            return;
        }
        
        final Room room = new Room();
        // find room transactions that match the location of employee
        List<RoomTransaction> roomTransactions = null;
        {
            
            room.setBuildingId(employee.getBuildingId());
            room.setFloorId(employee.getFloorId());
            room.setId(employee.getRoomId());
            roomTransactions = this.getRoomTransactionDao().findForRoom(room, dateTime);
        }
        
        // kb#3039065:when picking an empty room part for an employee, consider
        // division-department
        final Department department = getDepartmentForNewTransaction(employee, room);
        
        // find one available empty room part and apply date_end
        final RoomTransaction emptyRoomPart =
                getAvailableEmptyRoomPart(this.roomCategoryDao, roomTransactions, department);
        // kb 3042668 Employee datachange event: error in log if add a new employee 
        //and set a location which is at/over capacity
        if (emptyRoomPart != null) {
            applyEndDate(emptyRoomPart, dateTime);
        }
        
        // Insert new a rmpct record for the new employee
        insertRoomPartForNewEmployee(employee, room, user, dateTime, emptyRoomPart);
        
        // recover the future transactions if need revert future transactions
        if (needRevertFutureTransactions) {
            futurHandler.restoreFutureTrans(futurHandler);
        }
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, false);
        }
    }
    
    /**
     * insert room part for the new inserted employee.
     * 
     * @param employee The new employee.
     * @param room The Room of the new employee.
     * @param user Current user.
     * @param dateTime Current time.
     * @param emptyRoomPart existing empty room part.
     */
    private void insertRoomPartForNewEmployee(final Employee employee, final Room room,
            final User user, final Date dateTime, final RoomTransaction emptyRoomPart) {
        
        // KB3037472-the new room part pct_space not get from the empty room part
        if (emptyRoomPart == null) {
            // If not exist empty room part, after create new room part, run updatePercentageOfSpace
            // wfr to re-calculate the pct_space
            createRoomTransaction(employee, null, user, dateTime, 1, null);
            updatePercentageOfSpace(room);
            
        } else {
            // If exist empty room part, get pac_space from the empty room part and not need
            // run updatePercentageOfSpace wfr
            createRoomTransaction(employee, emptyRoomPart, user, dateTime, -1, null);
            
        }
    }
    
    /**
     * @param employee The new employee object return JSONArray assignment list.
     * @return RmpctObject
     */
    private AssignmentObject getAssignments(final Employee employee) {
        final JSONObject assignment = new JSONObject();
        
        assignment.put(SpaceConstants.STATUS, 1);
        assignment.put(SpaceConstants.BL_ID, employee.getBuildingId());
        assignment.put(SpaceConstants.FL_ID, employee.getFloorId());
        assignment.put(SpaceConstants.RM_ID, employee.getRoomId());
        
        final AssignmentObject rmpctObject =
                SpaceTransactionAssignmentHelper.convertJSONObjectToRmpctObject(assignment);
        return rmpctObject;
        
    }
    
    /**
     * @param roomTransaction room transaction
     * @param dateTime current date
     */
    private void applyEndDate(final RoomTransaction roomTransaction, final Date dateTime) {
        final Date dateStart = roomTransaction.getDateStart();
        if (dateStart != null && dateStart.after(DateTime.addDays(dateTime, -1))) {
            // if rmpct.date_start is after current date -1, directly delete currnt room
            // transaction
            this.getRoomTransactionDao().delete(roomTransaction);
        } else {
            roomTransaction.setDateEnd(DateTime.addDays(dateTime, -1));
            this.getRoomTransactionDao().update(roomTransaction);
        }
    }
    
    /**
     * @param roomCategoryDao the roomCategoryDao to set
     */
    public void setRoomCategoryDao(final IRoomCategoryDao roomCategoryDao) {
        this.roomCategoryDao = roomCategoryDao;
        ((DataSource) this.roomCategoryDao).setApplyVpaRestrictions(false);
    }
}
