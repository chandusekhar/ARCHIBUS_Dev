package com.archibus.service.space.datachangeevent;

import java.util.Date;

import org.apache.log4j.Logger;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.*;
import com.archibus.app.common.space.domain.Room;
import com.archibus.config.*;
import com.archibus.config.Project.Immutable;
import com.archibus.context.User;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Implementation of <code>IRoomTransactionService</code>.
 *
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 *
 * @author Valery Tydykov
 *
 */
public class RoomTransactionService implements IRoomTransactionService {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * Recorder for "Delete" Room Transaction.
     */
    private IDeleteRoomTransactionRecorder deleteRoomTransactionRecorder;

    /**
     * Recorder for "Insert" Room Transaction.
     */
    private IInsertRoomTransactionRecorder insertRoomTransactionRecorder;

    /**
     * Dao for Room.
     */
    private IRoomDao roomDao;

    /**
     * Dao for Room.
     */
    private IRoomTransactionDao roomTransactionDao;

    /**
     * Recorder for "Update" Room Transaction.
     */
    private IUpdateRoomTransactionRecorder updateRoomTransactionRecorder;

    /**
     * Recorder for "Delete" Employee.
     */
    private IDeleteEmployeeRecorder deleteEmployeeRecorder;

    /**
     * Recorder for "Insert" Employee.
     */
    private IInsertEmployeeRecorder insertEmployeeRecorder;

    /**
     * Recorder for "Update" Employee.
     */
    private IUpdateEmployeeRecorder updateEmployeeRecorder;

    /**
     * @return the deleteRoomTransactionRecorder
     */
    public IDeleteRoomTransactionRecorder getDeleteRoomTransactionRecorder() {
        return this.deleteRoomTransactionRecorder;
    }

    /**
     * @return the insertRoomTransactionRecorder
     */
    public IInsertRoomTransactionRecorder getInsertRoomTransactionRecorder() {
        return this.insertRoomTransactionRecorder;
    }

    /**
     * @return the roomDao
     */
    public IRoomDao getRoomDao() {
        return this.roomDao;
    }

    /**
     * @return the roomDao
     */
    public IRoomTransactionDao getRoomTransactionDao() {
        return this.roomTransactionDao;
    }

    /**
     * @return the updateRoomTransactionRecorder
     */
    public IUpdateRoomTransactionRecorder getUpdateRoomTransactionRecorder() {
        return this.updateRoomTransactionRecorder;
    }

    /** {@inheritDoc} */
    @Override
    public void recordTransaction(final ChangeType changeType, final User user, final Room room,
            final Date dateTime, final BeforeOrAfter beforeOrAfter) {

        recordTransaction(changeType, user, dateTime, room, beforeOrAfter);

    }

    /**
     * Records room transaction of type changeType, so the corresponding RoomTransactions should be
     * updated or created.
     *
     * @param changeType type of the change: INSERT, DELETE, UPDATE.
     * @param user who performed transaction.
     * @param dateTime when the transaction happened.
     * @param room on which the transaction was performed.
     * @param beforeOrAfter - Is event triggered before or after the actual data operation.
     */
    private void recordTransaction(final ChangeType changeType, final User user,
            final Date dateTime, final Room room, final BeforeOrAfter beforeOrAfter) {

        if (changeType.equals(ChangeType.UPDATE) && beforeOrAfter.equals(BeforeOrAfter.AFTER)
                && haveRequiredFieldsChanged(room)) {
            this.updateRoomTransactionRecorder.recordUpdateTransaction(user, dateTime, room);
        } else if (changeType.equals(ChangeType.INSERT)
                && beforeOrAfter.equals(BeforeOrAfter.AFTER)) {

            this.insertRoomTransactionRecorder.recordInsertTransaction(user, dateTime, room);
        } else if (changeType.equals(ChangeType.DELETE)
                && beforeOrAfter.equals(BeforeOrAfter.BEFORE)) {

            this.deleteRoomTransactionRecorder.recordDeleteTransaction(user, dateTime, room);
        }
    }

    /**
     * @param deleteRoomTransactionRecorder the deleteRoomTransactionRecorder to set
     */
    public void setDeleteRoomTransactionRecorder(
            final IDeleteRoomTransactionRecorder deleteRoomTransactionRecorder) {
        this.deleteRoomTransactionRecorder = deleteRoomTransactionRecorder;
    }

    /**
     * @param insertRoomTransactionRecorder the insertRoomTransactionRecorder to set
     */
    public void setInsertRoomTransactionRecorder(
            final IInsertRoomTransactionRecorder insertRoomTransactionRecorder) {
        this.insertRoomTransactionRecorder = insertRoomTransactionRecorder;
    }

    /**
     * @param roomDao the roomDao to set
     */
    public void setRoomDao(final IRoomDao roomDao) {
        this.roomDao = roomDao;
        ((DataSource) this.roomDao).setApplyVpaRestrictions(false);
    }

    /**
     * @param roomTransactionDao the roomTransactionDao to set
     */
    public void setRoomTransactionDao(final IRoomTransactionDao roomTransactionDao) {
        this.roomTransactionDao = roomTransactionDao;
        ((DataSource) this.roomTransactionDao).setApplyVpaRestrictions(false);
    }

    /**
     * @return the deleteEmployeeRecorder
     */
    public IDeleteEmployeeRecorder getDeleteEmployeeRecorder() {
        return this.deleteEmployeeRecorder;
    }

    /**
     * @param deleteEmployeeRecorder the deleteEmployeeRecorder to set
     */
    public void setDeleteEmployeeRecorder(final IDeleteEmployeeRecorder deleteEmployeeRecorder) {
        this.deleteEmployeeRecorder = deleteEmployeeRecorder;
    }

    /**
     * @return the insertEmployeeRecorder
     */
    public IInsertEmployeeRecorder getInsertEmployeeRecorder() {
        return this.insertEmployeeRecorder;
    }

    /**
     * @param insertEmployeeRecorder the insertEmployeeRecorder to set
     */
    public void setInsertEmployeeRecorder(final IInsertEmployeeRecorder insertEmployeeRecorder) {
        this.insertEmployeeRecorder = insertEmployeeRecorder;
    }

    /**
     * @return the updateEmployeeRecorder
     */
    public IUpdateEmployeeRecorder getUpdateEmployeeRecorder() {
        return this.updateEmployeeRecorder;
    }

    /**
     * @param updateEmployeeRecorder the updateEmployeeRecorder to set
     */
    public void setUpdateEmployeeRecorder(final IUpdateEmployeeRecorder updateEmployeeRecorder) {
        this.updateEmployeeRecorder = updateEmployeeRecorder;
    }

    /**
     * @param updateRoomTransactionRecorder the updateRoomTransactionRecorder to set
     */
    public void setUpdateRoomTransactionRecorder(
            final IUpdateRoomTransactionRecorder updateRoomTransactionRecorder) {
        this.updateRoomTransactionRecorder = updateRoomTransactionRecorder;
    }

    /**
     * Check the required fields value(<dv_id>, <dp_id>, <rm_cat>, <rm_type>, <prorate>) between
     * room and related rmpct if any any different return true, otherwise return false.
     *
     * @param room to compare current room.
     * @return true if room and rmpct have difference.
     */
    private boolean haveRequiredFieldsChanged(final Room room) {

        // KB3037736 - get the room object from the database to make sure it contain all values
        boolean changed = false;
        if (this.roomTransactionDao.findForAttributeChangeRoom(
            this.getRoomDao().getByPrimaryKey(room), new Date()).size() > 0) {
            changed = true;
        }
        return changed;
    }

    /** {@inheritDoc} */
    @Override
    public void recordTransaction(final ChangeType changeType, final User user,
            final Date dateTime, final Employee employee, final BeforeOrAfter beforeOrAfter,
            final Project.Immutable project) {

        recordTransaction(changeType, user, employee, dateTime, beforeOrAfter, project);

    }

    /**
     * change the associated room transaction records after employee change base on the changeType.
     *
     * @param changeType type of the change: INSERT, DELETE, UPDATE.
     * @param user who performed transaction.
     * @param employee employee object on which the transaction was performed.
     * @param dateTime when the transaction happened.
     * @param beforeOrAfter - Is event triggered before or after the actual data operation.
     * @param project project object that will provide activity parameter accessing
     */
    public void recordTransaction(final ChangeType changeType, final User user,
            final Employee employee, final Date dateTime, final BeforeOrAfter beforeOrAfter,
            final Project.Immutable project) {

        if (changeType.equals(ChangeType.UPDATE) && beforeOrAfter.equals(BeforeOrAfter.AFTER)) {
            this.updateEmployeeRecorder.recordUpdateTransaction(user, dateTime, employee);

        } else if (changeType.equals(ChangeType.INSERT)
                && beforeOrAfter.equals(BeforeOrAfter.AFTER)) {

            this.insertEmployeeRecorder.recordInsertTransaction(user, dateTime, employee);

        } else if (changeType.equals(ChangeType.DELETE)
                && beforeOrAfter.equals(BeforeOrAfter.BEFORE)) {
            this.deleteEmployeeRecorder.recordDeleteTransaction(user, dateTime, employee);
        }
    }
    
    @Override
    public void recordEmployeePrimaryChange(final String oldEmployeeId, final String employeeId,
            final Immutable project) {
        
        if (StringUtil.notNullOrEmpty(oldEmployeeId) && StringUtil.notNullOrEmpty(employeeId)) {
            
            final String whereClause = " where em_id='" + oldEmployeeId + "'";
            SqlUtils.executeUpdate("rmpct", "update rmpct set em_id='" + employeeId + "' "
                    + whereClause);
            SqlUtils.executeUpdate("hrmpct", "update hrmpct set em_id='" + employeeId + "'  "
                    + whereClause);
        }
    }

}
