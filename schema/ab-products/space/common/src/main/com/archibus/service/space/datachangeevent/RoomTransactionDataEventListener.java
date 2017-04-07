package com.archibus.service.space.datachangeevent;

import java.util.Date;

import org.springframework.context.ApplicationEvent;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.IRoomDao;
import com.archibus.app.common.space.dao.datasource.Constants;
import com.archibus.app.common.space.domain.Room;
import com.archibus.config.Project;
import com.archibus.core.event.data.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecordField;
import com.archibus.service.space.SpaceConstants;
import com.archibus.service.space.helper.SpaceTransactionUtil;
import com.archibus.utility.StringUtil;

/**
 * Listener which is configured to be notified by the core when there is a DataEvent. Records
 * transaction using roomTransactionService, or Sets the ResyncWorkspaceTransactionsTable activity
 * parameter to 1.
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 *
 * @author Valery Tydykov
 * @author Guo Jiangtao
 * @author Yi Zhang
 *
 */

public class RoomTransactionDataEventListener implements IDataEventListener {

    /**
     * Project, required to get activity parameter value.
     */
    private Project.Immutable project;

    /**
     * Dao for Room.
     */
    private IRoomDao roomDao;

    /**
     * Employee dataSource.
     */
    private EmployeeDataSource employeeDataSource;

    /**
     * Room transaction service.
     */
    private IRoomTransactionService roomTransactionService;

    /**
     * @return the project
     */
    public Project.Immutable getProject() {
        return this.project;
    }

    /**
     * @return the roomDao
     */
    public IRoomDao getRoomDao() {
        return this.roomDao;
    }

    /**
     * @return the employeeDataSource
     */
    public EmployeeDataSource getEmployeeDataSource() {
        return this.employeeDataSource;
    }

    /**
     * @return the roomTransactionService
     */
    public IRoomTransactionService getRoomTransactionService() {
        return this.roomTransactionService;
    }

    /**
     * @param project the project to set
     */
    public void setProject(final Project.Immutable project) {
        this.project = project;
    }

    /**
     * @param roomDao the roomDao to set
     */
    public void setRoomDao(final IRoomDao roomDao) {
        this.roomDao = roomDao;
    }

    /**
     * @param employeeDataSource the employeeDataSource to set
     */
    public void setEmployeeDataSource(final EmployeeDataSource employeeDataSource) {
        this.employeeDataSource = employeeDataSource;
    }

    /**
     * @param roomTransactionService the roomTransactionService to set
     */
    public void setRoomTransactionService(final IRoomTransactionService roomTransactionService) {
        this.roomTransactionService = roomTransactionService;
    }

    /** {@inheritDoc} */
    @Override
    public void onApplicationEvent(final ApplicationEvent event) {

        if (event instanceof RecordChangedEvent || event instanceof SqlExecutedEvent) {
            // Activity parameter UseWorkspaceTransactions
            final boolean useRoomTransactions =
                    this.loadActivityParameter(SpaceConstants.USEWORKSPACETRANSACTIONS);
            // Activity parameter CaptureSpaceHistory
            final boolean captureSpaceHistory =
                    this.loadActivityParameter(SpaceConstants.CAPTURESPACEHISTORY);

            // if activity parameter UseWorkspaceTransactions is '1' or CaptureSpaceHistory is '1',
            // invoke the data change event logic
            if (useRoomTransactions || captureSpaceHistory) {
                invokeDataChangeEvent(event);
            }
        }

    }

    /**
     * invoke data change event logic.
     *
     * @param event event object
     */
    private void invokeDataChangeEvent(final ApplicationEvent event) {
        if (event instanceof RecordChangedEvent) {
            final RecordChangedEvent recordChangedEvent = (RecordChangedEvent) event;

            onApplicationEventRecordChanged(recordChangedEvent);
        } else if (event instanceof SqlExecutedEvent) {
            final SqlExecutedEvent sqlExecutedEvent = (SqlExecutedEvent) event;

            onApplicationEventSqlExecuted(sqlExecutedEvent);
        }
    }

    /**
     * Handles ApplicationEvent "RecordChanged".
     *
     * @param recordChangedEvent the event to respond to.
     */
    private void onApplicationEventRecordChanged(final RecordChangedEvent recordChangedEvent) {
        // if table name is "rm"
        if (Constants.RM.equalsIgnoreCase(recordChangedEvent.getTableName())) {
            // TODO setApplyVpaRestrictions() calls do not belong to this class: move to
            // roomTransactionService
            // TODO code below will not handle exceptions correctly: it should use try/finally
            
            ((DataSource) this.roomDao).setApplyVpaRestrictions(false);
            final Room room = this.roomDao.convertRecordToObject(recordChangedEvent.getRecord());
            final Date dateTime = new Date(recordChangedEvent.getTimestamp());

            this.roomTransactionService
            .recordTransaction(recordChangedEvent.getChangeType(),
                recordChangedEvent.getUser(), room, dateTime,
                recordChangedEvent.getBeforeOrAfter());
            ((DataSource) this.roomDao).setApplyVpaRestrictions(true);
        } else if (Constants.EM.equalsIgnoreCase(recordChangedEvent.getTableName())) {
            // TODO setApplyVpaRestrictions() calls do not belong to this class: move to
            // roomTransactionService
            // TODO code below will not handle exceptions correctly: it should use try/finally
            
            ((DataSource) this.employeeDataSource).setApplyVpaRestrictions(false);
            // TODO this code does not belong to this class
            // Construct primary key by employee id
            final String oldEmployeeId =
                    (String) recordChangedEvent.getRecord().getOldValue(
                        SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.EM_ID);
            final String employeeId = recordChangedEvent.getRecord().getString("em.em_id");

            // kb#3050138: if primary key em_id is changed, then directly update corresponding value
            // of rmpct and hrmpct table.
            if (oldEmployeeId == null || !oldEmployeeId.equalsIgnoreCase(employeeId)) {
                this.roomTransactionService.recordEmployeePrimaryChange(oldEmployeeId, employeeId,
                    this.project);
            }
            
            ((DataSource) this.employeeDataSource).setApplyVpaRestrictions(false);
            // Construct primary key by employee id
            final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
            {
                final DataRecordField pkField = new DataRecordField();
                pkField.setName(SpaceConstants.T_EM + SpaceConstants.DOT + SpaceConstants.EM_ID);
                pkField.setValue(employeeId);
                primaryKeysValues.getFieldsValues().add(pkField);
            }
            // get Employee object with new values
            final Employee employee = this.employeeDataSource.get(primaryKeysValues);
            ((DataSource) this.employeeDataSource).setApplyVpaRestrictions(true);
            
            final Date dateTime = new Date(recordChangedEvent.getTimestamp());
            ((DataSource) this.roomDao).setApplyVpaRestrictions(false);
            this.roomTransactionService.recordTransaction(recordChangedEvent.getChangeType(),
                recordChangedEvent.getUser(), dateTime, employee,
                recordChangedEvent.getBeforeOrAfter(), this.project);
            ((DataSource) this.roomDao).setApplyVpaRestrictions(true);
        }
    }

    /**
     * Handles ApplicationEvent "SqlExecuted".
     *
     * @param sqlExecutedEvent the event to respond to.
     */
    private void onApplicationEventSqlExecuted(final SqlExecutedEvent sqlExecutedEvent) {
        // only set ResyncWorkspaceTransactionsTable when UseWorkspaceTransactions is 1
        if (this.loadActivityParameter(SpaceConstants.USEWORKSPACETRANSACTIONS)
                && (Constants.RM.equalsIgnoreCase(sqlExecutedEvent.getTableName()) || Constants.EM
                        .equalsIgnoreCase(sqlExecutedEvent.getTableName()))) {
            // below code don't work replace with sql update
            // TODO setBooleanActivityParameterset - confusing method name
            SpaceTransactionUtil.setBooleanActivityParameterset(
                SpaceConstants.RESYNC_WORKSPACE_TRANSACTIONS, true);
        }
    }

    /**
     * Loads activity parameter.
     *
     * @param parameterName parameter name.
     * @return activity parameter.
     */
    private boolean loadActivityParameter(final String parameterName) {
        final String parameterValue =
                this.project.getActivityParameterManager().getParameterValue(
                    SpaceConstants.SPACE_ACTIVITY + "-" + parameterName);

        boolean value = false;
        if (StringUtil.notNullOrEmpty(parameterValue) && !"0".equals(parameterValue)) {
            value = true;
        }
        return value;
    }

}
