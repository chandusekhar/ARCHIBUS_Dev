package com.archibus.service.space.datachangeevent;

import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.organization.domain.*;
import com.archibus.app.common.space.dao.IRoomCategoryDao;
import com.archibus.app.common.space.domain.*;
import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.space.*;
import com.archibus.service.space.future.*;
import com.archibus.service.space.helper.SpaceTransactionAssignmentHelper;

/**
 * Recorder for "update employee" transaction.
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 *
 * @author Zhang Yi
 */
public class UpdateEmployeeRecorder extends AbstractRoomTransactionRecorder implements
IUpdateEmployeeRecorder {

    /**
     * activity parameter assignUnallocatedSpace value and used to determine new rmpct.primary_rm
     * value.
     */
    private String assignUnallocatedSpace;

    /**
     * flag of whether it is a location change for the update action.
     */
    private boolean locationChanged;

    /**
     * roomCategory Dao.
     */
    private IRoomCategoryDao roomCategoryDao;

    /**
     * From Location.
     */
    private Room fromRoom;

    /**
     * get room category dao.
     *
     * @return IRoomCategoryDao room category dao.
     */
    public IRoomCategoryDao getRoomCategoryDao() {
        return this.roomCategoryDao;
    }

    /**
     * set room category dao.
     *
     * @param roomCategoryDao room category dao.
     */
    public void setRoomCategoryDao(final IRoomCategoryDao roomCategoryDao) {
        this.roomCategoryDao = roomCategoryDao;
        ((DataSource) this.roomCategoryDao).setApplyVpaRestrictions(false);
    }

    /** {@inheritDoc} */
    public void recordUpdateTransaction(final User user, final Date dateTime,
            final Employee employee) {

        final boolean inferRoomDepartments = this.loadActivityParameterInferRoomDepartments();

        this.locationChanged = this.comparePrimaryLocation(employee);

        final boolean departmentChanged = this.compareDepartment(employee);

        this.assignUnallocatedSpace = this.loadActivityParameterAssignUnallocatedSpace();

        this.fromRoom = this.getFromLocation(employee, dateTime);

        if (this.locationChanged) {
            boolean existFutureTransactionForFromLocation = false;

            if (this.fromRoom != null) {
                existFutureTransactionForFromLocation =
                        SpaceFutureTransactionDataChangeEventProcess
                        .detectIfExistFutureTransForEmployeeLocationChange(employee.getId(),
                            this.fromRoom.getBuildingId(), this.fromRoom.getFloorId(),
                            this.fromRoom.getId(), dateTime);
            }

            // only process data change event logic when there are no future transactions for from
            // location
            if (!existFutureTransactionForFromLocation) {

                // process employee location change
                processLocationChange(user, dateTime, employee);

            }
        }

        if (departmentChanged && inferRoomDepartments) {
            // process employee dv-dp changes
            processDepartmentChange(user, dateTime, employee);
        }
    }

    /**
     * get from location for employee location change.
     *
     * @param employee The new employee object return JSONArray assignment list.
     * @param dateTime date.
     * @return Room
     */
    private Room getFromLocation(final Employee employee, final Date dateTime) {
        final List<RoomTransaction> roomTransactions =
                this.getRoomTransactionDao().findForPrimaryEmployee(employee, dateTime);

        Room room = null;

        // for each roomTransaction matching the room and dateTime
        for (final RoomTransaction roomTransaction : roomTransactions) {

            // get from room
            if (room == null) {
                room = new Room();
            }

            room.setBuildingId(roomTransaction.getBuildingId());
            room.setFloorId(roomTransaction.getFloorId());
            room.setId(roomTransaction.getRoomId());
        }

        if (room != null) {
            room = this.getRoomDao().getByPrimaryKey(room);
        }

        return room;

    }

    /**
     * Process location change.
     *
     * @param user to use name of.
     * @param dateTime to set in RoomTransaction.
     * @param employee for which RoomTransaction needs to be created or updated.
     */
    private void processLocationChange(final User user, final Date dateTime, final Employee employee) {

        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, true);
        }
        // future transaction handler
        final SpaceFutureTransactionHandler futurHandler = new SpaceFutureTransactionHandler();

        // handle future transactions for location change
        final boolean isNeedRevertFutureTransactionForLocationChange =
                SpaceFutureTransactionCommon.needRevertFutureTransactions(employee.getBuildingId(),
                    employee.getFloorId(), employee.getRoomId(), dateTime, false, false)
                        || (this.fromRoom != null && SpaceFutureTransactionCommon
                            .needRevertFutureTransactions(this.fromRoom.getBuildingId(),
                                this.fromRoom.getFloorId(), this.fromRoom.getId(), dateTime, true,
                                false));

        if (isNeedRevertFutureTransactionForLocationChange) {
            futurHandler.recurHandleFutureTrans(getAssignments(employee), dateTime, 0);
            futurHandler.deleteFutureAssignments();
        }

        final List<RoomTransaction> roomTransactions =
                this.getRoomTransactionDao().findForPrimaryEmployee(employee, dateTime);

        // for each roomTransaction matching the room and dateTime
        for (final RoomTransaction roomTransaction : roomTransactions) {

            // process from location
            processFromLocation(user, dateTime, roomTransaction);

        }

        // process to location
        processToLocation(user, dateTime, employee);

        // restore future transactions if revert before
        if (isNeedRevertFutureTransactionForLocationChange) {
            futurHandler.restoreFutureTrans(futurHandler);
        }
        if (eventHandlerContext != null) {
            eventHandlerContext.addInputParameter(SpaceConstants.NO_VPA, false);
        }
    }

    /**
     * process from location.
     *
     * @param user user
     * @param dateTime dateTime
     * @param roomTransaction roomTransaction
     */
    private void processFromLocation(final User user, final Date dateTime,
            final RoomTransaction roomTransaction) {

        // get from location
        Room room = new Room();
        room.setBuildingId(roomTransaction.getBuildingId());
        room.setFloorId(roomTransaction.getFloorId());
        room.setId(roomTransaction.getRoomId());
        // KB3037687 - the room object get from transaction not contain all attribute like
        // cap_em, so get the room object again
        room = this.getRoomDao().getByPrimaryKey(room);

        if (room != null) {
            // Apply an end date to previous record containing that em_id and his or her
            // primary location. Do this if the location changed, or if the org changed and
            // InferRoomDepartments is Yes
            applyEndDate(dateTime, roomTransaction);

            // insert a new empty room part without employee for the previous primary location
            // KB3037484 - only insert empty room part when 'rm.cap_em > all current rmpct count
            // else just re-calculate the pct_spac
            // KB3039001 - add new empty room part when cap_em = 0 and no other empty room part for
            // this room
            if ((room.getEmployeeCapacity() > this.getRoomTransactionDao()
                    .findForRoom(room, new Date()).size())
                    || (room.getEmployeeCapacity() == 0 && this.getRoomTransactionDao()
                    .findForRoom(room, new Date()).size() == 0)) {
                insertNewRoomTransactionForLocationChanged(user, dateTime, roomTransaction);
            } else {
                updatePercentageOfSpace(room);
            }
        }
    }

    /**
     * get assignment JSON object from the employee change.
     *
     * @param employee The employee object.
     * @return JSONObject
     */
    private AssignmentObject getAssignments(final Employee employee) {
        final JSONObject assignment = new JSONObject();

        assignment.put(SpaceConstants.STATUS, 1);
        assignment.put(SpaceConstants.EM_ID, employee.getId());
        assignment.put(SpaceConstants.BL_ID, employee.getBuildingId());
        assignment.put(SpaceConstants.FL_ID, employee.getFloorId());
        assignment.put(SpaceConstants.RM_ID, employee.getRoomId());

        if (this.fromRoom != null) {
            assignment.put(SpaceConstants.FROM_BL_ID, this.fromRoom.getBuildingId());
            assignment.put(SpaceConstants.FROM_FL_ID, this.fromRoom.getFloorId());
            assignment.put(SpaceConstants.FROM_RM_ID, this.fromRoom.getId());
        }

        final AssignmentObject rmpctObject =
                SpaceTransactionAssignmentHelper.convertJSONObjectToRmpctObject(assignment);
        return rmpctObject;

    }

    /**
     * Compare dv_id and dp_id properties of between employee and related rmpct, if any different
     * then return true.
     *
     * @param employee Employee object.
     *
     * @return boolean if department is changed
     */
    private boolean compareDepartment(final Employee employee) {

        boolean changed = false;
        if (this.getRoomTransactionDao().findForDepartmentChangeEmployee(employee, new Date())
                .size() > 0) {
            changed = true;
        }

        return changed;
    }

    /**
     * Compare location properties between employee and related rmpct, if any different then return
     * true.
     *
     * @param employee Employee object.
     *
     * @return boolean if location is changed
     */
    private boolean comparePrimaryLocation(final Employee employee) {

        boolean changed = false;
        if (this.getRoomTransactionDao().findForPrimaryEmployee(employee, new Date()).isEmpty()
                || this.getRoomTransactionDao().findForLocationChangeEmployee(employee, new Date())
                .size() > 0) {
            changed = true;
        }

        return changed;
    }

    /**
     * get rmpct.primary_rm value.
     *
     * @param roomTransaction to rassignUnallocatedSpaceetrieve primary_rm value.
     *
     * @return int determined primary_rm value.
     */
    private int getPrimaryRoom(final RoomTransaction roomTransaction) {
        int primaryRm;
        if (this.assignUnallocatedSpace.toLowerCase().startsWith("NoChange".toLowerCase())) {
            primaryRm = roomTransaction.getPrimaryRoom();
        } else if (this.assignUnallocatedSpace.toLowerCase().startsWith("Primary".toLowerCase())) {
            primaryRm = 1;
        } else {
            primaryRm = 0;
        }

        return primaryRm;
    }

    /**
     * insert empty room part for from location .
     *
     *
     * @param roomTransaction for which RoomTransaction needs to be created.
     * @param user to use name of.
     * @param dateTime to set in RoomTransaction.
     */
    private void insertNewRoomTransactionForLocationChanged(final User user, final Date dateTime,
            final RoomTransaction roomTransaction) {

        final RoomTransaction newRoomTransaction =
                roomTransactionToRoomTransaction(roomTransaction, user, dateTime);

        newRoomTransaction.setPrimaryRoom(this.getPrimaryRoom(roomTransaction));

        this.getRoomTransactionDao().save(newRoomTransaction);
    }

    /**
     * process to location for employee location change.
     *
     * @param user to use name of.
     * @param dateTime to set in RoomTransaction.
     * @param employee for which RoomTransaction needs to be created.
     *
     */
    private void processToLocation(final User user, final Date dateTime, final Employee employee) {

        Room room = new Room();
        room.setBuildingId(employee.getBuildingId());
        room.setFloorId(employee.getFloorId());
        room.setId(employee.getRoomId());
        // KB3037863 get the whole object from the database
        room = this.getRoomDao().getByPrimaryKey(room);

        if (room != null) {
            final List<RoomTransaction> roomTransactionsToLocation =
                    this.getRoomTransactionDao().findForRoom(room, dateTime);

            // kb#3039065:when picking an empty room part for an employee, consider
            // division-department
            final Department department = getDepartmentForNewTransaction(employee, room);

            // find one available empty room part
            final RoomTransaction emptyRoomPart =
                    getAvailableEmptyRoomPart(this.roomCategoryDao, roomTransactionsToLocation,
                        department);

            // If location changed and the new location is not NULL, then apply an end
            // date to the empty room part
            if (emptyRoomPart != null && this.locationChanged) {
                applyEndDate(dateTime, emptyRoomPart);
            }

            // Insert new a rmpct record to reflect the new primary location for the employee. Do
            // this if the location changed, or if the org changed and InferRoomDepartments is
            // 'Yes'.
            if (emptyRoomPart == null) {
                createRoomTransaction(employee, null, user, dateTime,
                    roomTransactionsToLocation.size() + 1, this.fromRoom);

                // KB3033050 - update pct_space value for all active room record
                updatePercentageOfSpace(room);
            } else {
                createRoomTransaction(employee, emptyRoomPart, user, dateTime, -1, this.fromRoom);
            }
        }

    }

    /**
     * Process department change.
     *
     * @param user to use name of.
     * @param dateTime to set in RoomTransaction.
     * @param employee for which RoomTransaction needs to be created.
     *
     *            <p>
     *            Suppress warning PMD.AvoidUsingSql.
     *            <p>
     *            Justification: Case #2.2: Statements with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void processDepartmentChange(final User user, final Date dateTime,
            final Employee employee) {
        // get all current transaction for employee include primary and no primary location
        final List<RoomTransaction> roomTransactionsForNoPrimaryEm =
                this.getRoomTransactionDao().findForEmployee(employee, dateTime);

        for (final RoomTransaction roomTransaction : roomTransactionsForNoPrimaryEm) {

            // To avoid redundant update for primary location
            if (this.locationChanged && roomTransaction.getPrimaryEmployee() == 1) {
                continue;
            }

            // KB3037727 - get the date_end value before apply end date
            final Date newRoomTransactionDateEnd = roomTransaction.getDateEnd();
            applyEndDate(dateTime, roomTransaction);

            final RoomTransaction newRoomTransaction = new RoomTransaction();

            newRoomTransaction.setBuildingId(roomTransaction.getBuildingId());
            newRoomTransaction.setFloorId(roomTransaction.getFloorId());
            newRoomTransaction.setRoomId(roomTransaction.getRoomId());

            newRoomTransaction.setEmployeeId(employee.getId());
            newRoomTransaction.setDivisionId(employee.getDivisionId());
            newRoomTransaction.setDepartmentId(employee.getDepartmentId());
            newRoomTransaction.setUserName(user.getName());

            newRoomTransaction.setCategory(roomTransaction.getCategory());
            newRoomTransaction.setType(roomTransaction.getType());
            newRoomTransaction.setProrate(roomTransaction.getProrate());

            newRoomTransaction.setDateCreated(dateTime);
            newRoomTransaction.setDateStart(dateTime);
            newRoomTransaction.setDateEnd(newRoomTransactionDateEnd);

            newRoomTransaction.setStatus(RoomTransaction.ROOM_STATUS_1);
            newRoomTransaction.setPrimaryRoom(0);
            newRoomTransaction.setPrimaryEmployee(roomTransaction.getPrimaryEmployee());
            newRoomTransaction.setPercentageOfSpace(roomTransaction.getPercentageOfSpace());
            newRoomTransaction.setParentId(roomTransaction.getId());
            this.getRoomTransactionDao().save(newRoomTransaction);
        }

        // bulk update to dealing with all employees location records which have a date_start value
        // latter than current date
        SqlUtils
        .executeUpdate(
            "rmpct",
            "Update rmpct SET "
                    + "rmpct.dv_id='"
                    + SqlUtils.makeLiteralOrBlank(employee.getDivisionId())
                    + "' "
                    + ", rmpct.dp_id='"
                    + SqlUtils.makeLiteralOrBlank(employee.getDepartmentId())
                    + "'"
                    + " WHERE rmpct.em_id= '"
                    + SqlUtils.makeLiteralOrBlank(employee.getId())
                    + "'  "
                    + " AND (rmpct.activity_log_id IS NULL OR EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = rmpct.activity_log_id AND activity_log.activity_type != 'SERVICE DESK - DEPARTMENT SPACE') )"
                    + " AND  rmpct.status=1  AND rmpct.date_start>  ${sql.currentDate}");
    }
}
