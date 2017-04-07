package com.archibus.service.space.datachangeevent;

import java.util.*;

import com.archibus.app.common.organization.domain.*;
import com.archibus.app.common.space.dao.*;
import com.archibus.app.common.space.domain.*;
import com.archibus.config.Project;
import com.archibus.context.User;
import com.archibus.datasource.DataSource;
import com.archibus.service.space.AllRoomPercentageUpdate;
import com.archibus.utility.*;

/**
 * Base class for RoomTransactionRecorder implementation classes. Provides common functionality for
 * recorders.
 * <p>
 *
 * @author Valery Tydykov
 *
 */
public abstract class AbstractRoomTransactionRecorder {

    /**
     * Constant: activity parameter "AssignUnallocatedSpace".
     */
    public static final String ASSIGN_UNALLOCATED_SPACE =
            "AbSpaceRoomInventoryBAR-AssignUnallocatedSpace";

    /**
     * Constant: activity parameter "InferRoomDepartments".
     */
    private static final String INFER_ROOM_DEPARTMENTS =
            "AbSpaceRoomInventoryBAR-InferRoomDepartments";

    /**
     * Constant: Primary flag of activity parameter value of
     * AbSpaceRoomInventoryBAR-AssignUnallocatedSpace.
     */
    private static final String PRIMARY_FLAG = "Primary";

    /**
     * Constant: NOCHANGE flag of activity parameter value of
     * AbSpaceRoomInventoryBAR-AssignUnallocatedSpace.
     */
    private static final String NOCHANGE_FLAG = "NoChange";

    /**
     * Project, required to get activity parameter value.
     */
    protected Project.Immutable project;

    /**
     * Dao for Room.
     */
    private IRoomDao roomDao;

    /**
     * Dao for RoomTransaction.
     */
    private IRoomTransactionDao roomTransactionDao;

    /**
     * @return the roomDao
     */
    public IRoomDao getRoomDao() {
        return this.roomDao;
    }

    /**
     * @return the roomTransactionDao
     */
    public IRoomTransactionDao getRoomTransactionDao() {
        return this.roomTransactionDao;
    }

    /**
     * @param roomDao the roomDao to set
     */
    public void setRoomDao(final IRoomDao roomDao) {
        this.roomDao = roomDao;
        ((DataSource) this.roomDao).setApplyVpaRestrictions(false);
    }

    /**
     * @param project the project to set
     */
    public void setProject(final Project.Immutable project) {
        this.project = project;
    }

    /**
     * @param roomTransactionDao the roomTransactionDao to set
     */
    public void setRoomTransactionDao(final IRoomTransactionDao roomTransactionDao) {
        this.roomTransactionDao = roomTransactionDao;
        ((DataSource) this.roomTransactionDao).setApplyVpaRestrictions(false);
    }

    /**
     * Creates RoomTransaction for the specified employee change. If count is -1 then use
     * percentageOfSpace of existingRoomTransaction.
     *
     * @param employee with changed values for which RoomTransaction needs to be created.
     * @param existingRoomTransaction for which new RoomTransaction needs to be created, or null.
     * @param user who performed transaction.
     * @param dateTime to set in RoomTransaction.
     * @param numberOfOccupants number of room occupants, or -1.
     * @param fromRoom from room.
     */
    protected void createRoomTransaction(final Employee employee,
            final RoomTransaction existingRoomTransaction, final User user, final Date dateTime,
            final int numberOfOccupants, final Room fromRoom) {

        // if existingRoomTransaction was not supplied, get room from the employee room info
        Room room = new Room();
        if (existingRoomTransaction == null) {
            // existingRoomTransaction was not supplied, load room using employee room info
            room.setBuildingId(employee.getBuildingId());
            room.setFloorId(employee.getFloorId());
            room.setId(employee.getRoomId());
        } else {
            room.setBuildingId(existingRoomTransaction.getBuildingId());
            room.setFloorId(existingRoomTransaction.getFloorId());
            room.setId(existingRoomTransaction.getRoomId());
        }

        room = this.roomDao.getByPrimaryKey(room);

        // create room transaction
        final RoomTransaction roomTransaction = new RoomTransaction();

        // infer building, floor, room from the employee
        roomTransaction.setBuildingId(employee.getBuildingId());
        roomTransaction.setFloorId(employee.getFloorId());
        roomTransaction.setRoomId(employee.getRoomId());

        if (fromRoom != null) {
            roomTransaction.setFromBuildingId(fromRoom.getBuildingId());
            roomTransaction.setFromFloorId(fromRoom.getFloorId());
            roomTransaction.setFromRoomId(fromRoom.getId());
        }

        final boolean inferRoomDepartments = loadActivityParameterInferRoomDepartments();
        
        setRoomTransactionAttributes(employee, existingRoomTransaction, room, roomTransaction,
            inferRoomDepartments);

        roomTransaction.setEmployeeId(employee.getId());
        roomTransaction.setDateStart(dateTime);
        roomTransaction.setStatus(RoomTransaction.ROOM_STATUS_1);
        roomTransaction.setPrimaryEmployee(1);
        roomTransaction.setUserName(user.getName());
        roomTransaction.setDateCreated(dateTime);

        // calculate percentageOfSpace
        {
            double percentageOfSpace;
            if (numberOfOccupants == -1) {
                percentageOfSpace = existingRoomTransaction.getPercentageOfSpace();
            } else {
                percentageOfSpace = RoomTransaction.PERCENTAGE_SPACE_100 / numberOfOccupants;
            }

            roomTransaction.setPercentageOfSpace(percentageOfSpace);
        }

        if (existingRoomTransaction != null) {
            roomTransaction.setParentId(existingRoomTransaction.getId());
        }

        this.getRoomTransactionDao().save(roomTransaction);
    }

    /**
     * Set some attributes to current new room transaction from employee, room or possibly existing
     * picked-up empty room part as well as determined by 'inferRoomDepartments' parameter.
     *
     * @param employee with changed values for which RoomTransaction needs to be created.
     * @param existingRoomTransaction for which new RoomTransaction needs to be created, or null.
     * @param room Room.
     * @param roomTransaction newly created room transaction.
     * @param inferRoomDepartments activity parameter.
     */
    private void setRoomTransactionAttributes(final Employee employee,
            final RoomTransaction existingRoomTransaction, final Room room,
            final RoomTransaction roomTransaction, final boolean inferRoomDepartments) {
        // before set final real values of prorate, rm_cat and rm_type fistly set default values.
        roomTransaction.setCategory(room.getCategory());
        roomTransaction.setType(room.getType());
        roomTransaction.setProrate(null);

        if (inferRoomDepartments) {
            // infer department and division from the employee
            roomTransaction.setDivisionId(employee.getDivisionId());
            roomTransaction.setDepartmentId(employee.getDepartmentId());
            roomTransaction.setPrimaryRoom(0);
        } else if (existingRoomTransaction == null) {
            // infer department and division from the room
            roomTransaction.setDivisionId(room.getDivisionId());
            roomTransaction.setDepartmentId(room.getDepartmentId());
            // KB3033203 - set rmpct.primary_rm to 1 because dv_id, dp_id rm_cat, rm_type all come
            // from room table
            roomTransaction.setPrimaryRoom(1);
        } else {
            // kb#3045063: InferRoomDepartment=0 and there is empty room part then dv_id, dp_id,
            // prorate,primary_rm, rm_cat, rm_type value should inherit from that taken room part.
            roomTransaction.setDivisionId(existingRoomTransaction.getDivisionId());
            roomTransaction.setDepartmentId(existingRoomTransaction.getDepartmentId());
            roomTransaction.setPrimaryRoom(existingRoomTransaction.getPrimaryRoom());
            roomTransaction.setCategory(existingRoomTransaction.getCategory());
            roomTransaction.setType(existingRoomTransaction.getType());
            roomTransaction.setProrate(existingRoomTransaction.getProrate());
        }
    }

    /**
     * Creates RoomTransaction, saves it using roomTransactionDao. If percentageOfSpace specified
     * (value is not -1), overwrites value from Room. If primaryEmployee specified (value is not
     * -1), overwrites value from Room. Sets primaryRoom to 1, status to 1.
     *
     * @param user who performed transaction.
     * @param dateTime when the transaction happened.
     * @param room on which the transaction was performed.
     * @param percentageOfSpace value to be set in the created RoomTransaction.
     * @param employeeId value to be set in the created RoomTransaction.
     * @param primaryEmployee value to be set in the created RoomTransaction.
     * @param parentId value to be set in the created RoomTransaction.
     */
    protected void createRoomTransaction(final User user, final Date dateTime, final Room room,
            final double percentageOfSpace, final String employeeId, final int primaryEmployee,
            final int parentId) {

        final RoomTransaction roomTransaction = this.roomToRoomTransaction(room, user, dateTime);

        if (percentageOfSpace != -1) {
            roomTransaction.setPercentageOfSpace(percentageOfSpace);
        }

        roomTransaction.setEmployeeId(employeeId);

        if (primaryEmployee != -1) {
            roomTransaction.setPrimaryEmployee(primaryEmployee);
        }

        roomTransaction.setStatus(RoomTransaction.ROOM_STATUS_1);
        roomTransaction.setPrimaryRoom(RoomTransaction.PRIMARY_ROOM_1);
        if (parentId != 0) {
            roomTransaction.setParentId(parentId);
        }
        this.roomTransactionDao.save(roomTransaction);
    }

    /**
     * Creates RoomTransaction, saves it using roomTransactionDao. If percentageOfSpace specified
     * (value is not -1), overwrites value from Room. Sets percentageOfSpace to 100, primaryRoom to
     * 1, status to 1.
     *
     * @param user who performed transaction.
     * @param dateTime when the transaction happened.
     * @param roomTransaction which the new room transaction was created.
     */
    protected void createRoomTransaction(final User user, final Date dateTime,
            final RoomTransaction roomTransaction) {

        final RoomTransaction newRoomTransaction =
                this.roomTransactionToRoomTransaction(roomTransaction, user, dateTime);

        this.roomTransactionDao.save(newRoomTransaction);
    }

    /**
     * Creates RoomTransaction for an existing RoomTransaction, using matching fields. Sets userName
     * to user.name, dateStart and dateCreated to dateTime.
     *
     * @param existingRoomTransaction which RoomTransaction needs to be created.
     * @param user to use name of.
     * @param dateTime to set in RoomTransaction.
     * @return RoomTransaction with values from room, user, dateTime.
     */
    protected RoomTransaction roomTransactionToRoomTransaction(
            final RoomTransaction existingRoomTransaction, final User user, final Date dateTime) {
        final RoomTransaction roomTransaction = new RoomTransaction();

        // get room object
        Room room = new Room();
        room.setBuildingId(existingRoomTransaction.getBuildingId());
        room.setFloorId(existingRoomTransaction.getFloorId());
        room.setId(existingRoomTransaction.getRoomId());
        room = this.roomDao.getByPrimaryKey(room);

        roomTransaction.setBuildingId(existingRoomTransaction.getBuildingId());
        roomTransaction.setFloorId(existingRoomTransaction.getFloorId());
        roomTransaction.setRoomId(existingRoomTransaction.getRoomId());

        final String assignUnallocatedSpace =
                loadActivityParameterAssignUnallocatedSpace().toLowerCase();
        {
            // determine divisionId and departmentId and primary_rm value
            String divisionId = null;
            String departmentId = null;
            roomTransaction.setPrimaryRoom(existingRoomTransaction.getPrimaryRoom());

            if (assignUnallocatedSpace.startsWith(NOCHANGE_FLAG.toLowerCase())) {
                divisionId = existingRoomTransaction.getDivisionId();
                departmentId = existingRoomTransaction.getDepartmentId();
            } else if (assignUnallocatedSpace.startsWith(PRIMARY_FLAG.toLowerCase())) {
                divisionId = room.getDivisionId();
                departmentId = room.getDepartmentId();
                // KB3037882 - set primray_rm to 1 when AssignUnallocatedSpace like "Primary%"
                roomTransaction.setPrimaryRoom(1);
            }

            roomTransaction.setDepartmentId(departmentId);
            roomTransaction.setDivisionId(divisionId);
        }

        {
            // determine Prorate value
            String prorate = "NONE";
            if ("ProrateFloor".equalsIgnoreCase(assignUnallocatedSpace)) {
                prorate = "FLOOR";
            } else if ("ProrateBuilding".equalsIgnoreCase(assignUnallocatedSpace)) {
                prorate = "BUILDING";
            } else if ("ProrateSite".equalsIgnoreCase(assignUnallocatedSpace)) {
                prorate = "SITE";
            } else if (assignUnallocatedSpace.startsWith(PRIMARY_FLAG.toLowerCase())) {
                prorate = room.getProrate();
            } else if (assignUnallocatedSpace.startsWith(NOCHANGE_FLAG.toLowerCase())) {
                prorate = existingRoomTransaction.getProrate();
            }

            roomTransaction.setProrate(prorate);
        }

        roomTransaction.setCategory(existingRoomTransaction.getCategory());
        roomTransaction.setType(existingRoomTransaction.getType());

        roomTransaction.setDateCreated(dateTime);
        roomTransaction.setDateStart(dateTime);

        roomTransaction.setStatus(RoomTransaction.ROOM_STATUS_1);
        roomTransaction.setPercentageOfSpace(existingRoomTransaction.getPercentageOfSpace());

        roomTransaction.setUserName(user.getName());
        roomTransaction.setParentId(existingRoomTransaction.getId());

        return roomTransaction;
    }

    /**
     * Load activity parameter AssignUnallocatedSpace.
     *
     * @return activity parameter AssignUnallocatedSpace.
     */
    protected String loadActivityParameterAssignUnallocatedSpace() {
        return this.project.getActivityParameterManager().getParameterValue(
            ASSIGN_UNALLOCATED_SPACE);
    }

    /**
     * Loads activity parameter InferRoomDepartments.
     *
     * @return activity parameter InferRoomDepartments.
     */
    protected boolean loadActivityParameterInferRoomDepartments() {
        boolean value = false;
        if (StringUtil.notNullOrEmpty(this.project.getActivityParameterManager().getParameterValue(
            INFER_ROOM_DEPARTMENTS))
            && "1".equals(this.project.getActivityParameterManager().getParameterValue(
                INFER_ROOM_DEPARTMENTS))) {
            value = true;
        }
        return value;
    }

    /**
     * Creates RoomTransaction for room, using matching fields. Sets userName to user.name,
     * dateStart and dateCreated to dateTime.
     *
     * @param room for which RoomTransaction needs to be created.
     * @param user to use name of.
     * @param dateTime to set in RoomTransaction.
     * @return RoomTransaction with values from room, user, dateTime.
     */
    private RoomTransaction roomToRoomTransaction(final Room room, final User user,
            final Date dateTime) {
        final RoomTransaction roomTransaction = new RoomTransaction();

        roomTransaction.setBuildingId(room.getBuildingId());
        roomTransaction.setFloorId(room.getFloorId());
        roomTransaction.setRoomId(room.getId());

        roomTransaction.setDivisionId(room.getDivisionId());
        roomTransaction.setDepartmentId(room.getDepartmentId());

        roomTransaction.setCategory(room.getCategory());
        roomTransaction.setType(room.getType());
        roomTransaction.setProrate(room.getProrate());

        roomTransaction.setDateCreated(dateTime);
        roomTransaction.setDateStart(dateTime);

        roomTransaction.setUserName(user.getName());

        return roomTransaction;
    }

    /**
     * rule workflow rule method.
     *
     * @param room Room
     */
    protected void updatePercentageOfSpace(final Room room) {

        AllRoomPercentageUpdate.updatePercentageOfSpace(Utility.currentDate(),
            room.getBuildingId(), room.getFloorId(), room.getId());
    }

    /**
     * Applies specified dateTime as end date in the roomTransaction: sets dateEnd to dateTime�1.
     *
     * @param date when the transaction happened.
     * @param roomTransaction to be updated.
     */
    protected void applyEndDate(final Date date, final RoomTransaction roomTransaction) {
        final Date dateStart = roomTransaction.getDateStart();
        final Date dateEnd = DateTime.addDays(date, -1);
        if (dateStart != null && dateStart.after(dateEnd)) {
            // if rmpct.date_start is after current date -1, directly delete currnt room
            // transaction
            this.getRoomTransactionDao().delete(roomTransaction);
        } else {
            // set dateEnd to <dateTime � 1>
            roomTransaction.setDateEnd(DateTime.addDays(date, -1));
            this.getRoomTransactionDao().update(roomTransaction);
        }
    }

    /**
     * Get one available empty room part from given list.
     *
     * @param roomCategoryDao Room category dao
     * @param roomTransactionsList roomTransactions List
     * @param department Department object
     * @return available empty room part
     */
    protected RoomTransaction getAvailableEmptyRoomPart(final IRoomCategoryDao roomCategoryDao,
            final List<RoomTransaction> roomTransactionsList, final Department department) {

        RoomCategory roomCategory;

        RoomTransaction emptyRoomPart = null;
        RoomTransaction availableEmptyRoomPart = null;
        RoomTransaction availableEmptyRoomPartForDp = null;

        for (final RoomTransaction roomTransaction : roomTransactionsList) {

            if (StringUtil.isNullOrEmpty(roomTransaction.getEmployeeId())) {

                roomCategory = roomCategoryDao.getByPrimaryKey(roomTransaction.getCategory());

                // KB3037886: store empty room part
                emptyRoomPart = roomTransaction;

                if (roomCategory != null && roomCategory.getOccupiable() == 1) {

                    availableEmptyRoomPart = roomTransaction;
                }

                // kb#3039065: firstly search available room part that match the new transaction's
                // department
                if (availableEmptyRoomPart != null
                        && this.sameDeaprtment(department, availableEmptyRoomPart)) {

                    availableEmptyRoomPartForDp = availableEmptyRoomPart;
                    break;
                }
            }
        }

        // KB3037886 - If there is no occupiable empty room part, use the last empty room
        // part.
        return availableEmptyRoomPartForDp == null ? (availableEmptyRoomPart == null ? emptyRoomPart
                : availableEmptyRoomPart)
                : availableEmptyRoomPartForDp;
    }

    /**
     * Get the division/department that would be set to the new room transaction for the employee.
     *
     * @param employee Employee object
     * @param room Room object
     *
     * @return available empty room part
     */
    protected Department getDepartmentForNewTransaction(final Employee employee, final Room room) {

        final Department department = new Department();

        final boolean inferRoomDepartments = loadActivityParameterInferRoomDepartments();
        if (inferRoomDepartments) {
            // infer department and division from the employee
            department.setDivisionId(employee.getDivisionId());
            department.setId(employee.getDepartmentId());

        } else {
            // infer department and division from the room
            department.setDivisionId(room.getDivisionId());
            department.setId(room.getDepartmentId());
        }

        return department;

    }

    /**
     * Get the division/department that would be set to the new room transaction for the employee.
     *
     * @param department Department object
     * @param roomTransaction RoomTransactions object
     *
     * @return if roomTransaction has the same department
     */
    private boolean sameDeaprtment(final Department department,
            final RoomTransaction roomTransaction) {

        boolean isSameDepartment = false;
        boolean isSameDivision = false;

        if (StringUtil.isNullOrEmpty(department.getId())
                && StringUtil.isNullOrEmpty(roomTransaction.getDepartmentId())) {

            isSameDepartment = true;

        } else if (StringUtil.notNullOrEmpty(department.getId())
                && department.getId().equals(roomTransaction.getDepartmentId())) {

            isSameDepartment = true;
        }

        if (StringUtil.isNullOrEmpty(department.getDivisionId())
                && StringUtil.isNullOrEmpty(roomTransaction.getDivisionId())) {

            isSameDivision = true;

        } else if (StringUtil.notNullOrEmpty(department.getDivisionId())
                && department.getDivisionId().equals(roomTransaction.getDivisionId())) {

            isSameDivision = true;
        }

        return isSameDepartment && isSameDivision;

    }
}