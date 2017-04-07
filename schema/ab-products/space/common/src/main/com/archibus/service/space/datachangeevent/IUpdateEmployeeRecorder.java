package com.archibus.service.space.datachangeevent;

import java.util.Date;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.context.User;

/**
 * Recorder for "Update" Room Transaction.
 * 
 * @author Zhang Yi
 * 
 */
public interface IUpdateEmployeeRecorder {
    
    /**
     * Records "Update" transaction: the employee was updated, so the corresponding RoomTransactions
     * should be updated or created.
     * 
     * @param user who performed transaction.
     * @param dateTime when the transaction happened.
     * @param employee on which the transaction was performed.
     */
    void recordUpdateTransaction(final User user, final Date dateTime, final Employee employee);
}