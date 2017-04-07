package com.archibus.service.space.datachangeevent;

import java.util.Date;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.context.User;

/**
 * Recorder for "Insert" Room Transaction.
 * 
 * @author Zhang Yi
 * 
 */
public interface IInsertEmployeeRecorder {
    
    /**
     * Records "Insert" transaction: the employee was created, so the corresponding RoomTransactions
     * should be updated or created. Sets percentageOfSpace to 100, primaryEmployee to 1, status to
     * 1.
     * 
     * 
     * @param user who performed transaction.
     * @param dateTime when the transaction happened.
     * @param employee on which the transaction was performed.
     */
    void recordInsertTransaction(final User user, final Date dateTime, final Employee employee);
}