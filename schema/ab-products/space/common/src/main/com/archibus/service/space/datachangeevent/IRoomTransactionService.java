package com.archibus.service.space.datachangeevent;

import java.util.Date;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.Room;
import com.archibus.config.Project;
import com.archibus.context.User;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;

/**
 * Records room transactions in the room transactions table.
 * <p>
 * Can be called on DataEvent or from a scheduled WFR.
 *
 * @author Valery Tydykov
 *
 */
public interface IRoomTransactionService {
    
    /**
     * Records room transaction from the values specified in the room object. This method is invoked
     * before or after the changes were made to RM table. The room object contains the new values.
     *
     * @param changeType type of the change: INSERT, DELETE, UPDATE.
     * @param user who performed transaction.
     * @param room on which the transaction was performed.
     * @param dateTime when the transaction happened.
     * @param beforeOrAfter - Is event triggered before or after the actual data operation.
     */
    void recordTransaction(final ChangeType changeType, final User user, final Room room,
            final Date dateTime, final BeforeOrAfter beforeOrAfter);
    
    /**
     * Records room transaction from the values specified in the room object. This method is invoked
     * before or after the changes were made to EM table. The employee object contains the new
     * values.
     *
     * @param changeType type of the change: INSERT, DELETE, UPDATE.
     * @param user who performed transaction.
     * @param employee employee object on which the transaction was performed.
     * @param dateTime when the transaction happened.
     * @param beforeOrAfter - Is event triggered before or after the actual data operation.
     * @param project project object that will provide activity parameter accessing
     */
    void recordTransaction(final ChangeType changeType, final User user, final Date dateTime,
            final Employee employee, final BeforeOrAfter beforeOrAfter,
            final Project.Immutable project);
    
    /**
     * Directly update the em_id field value of rmpct and hrmpct due to the primary key em_id change
     * of table em.
     *
     * @param oldEmployeeId old em_id value before the update.
     * @param employeeId current em_id value.
     * @param project project object that will provide activity parameter accessing
     */
    void recordEmployeePrimaryChange(final String oldEmployeeId, final String employeeId,
            final Project.Immutable project);
}