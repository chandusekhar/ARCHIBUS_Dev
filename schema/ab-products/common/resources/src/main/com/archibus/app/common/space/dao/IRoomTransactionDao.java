package com.archibus.app.common.space.dao;

import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.*;
import com.archibus.core.dao.IDao;

/**
 * Dao for RoomTransaction.
 * 
 * @author Valery Tydykov
 * @author Zhang Yi
 * 
 */
public interface IRoomTransactionDao extends IDao<RoomTransaction> {
    /**
     * Finds RoomTransaction objects for the given room and dateTime.
     * 
     * @param room for which the RoomTransaction objects should be found.
     * @param dateTime for which the RoomTransaction objects should be found.
     * @return List of RoomTransaction objects.
     */
    List<RoomTransaction> findForRoom(Room room, Date dateTime);
    
    /**
     * Finds "primary" (primary_rm="1") RoomTransaction objects for the given room and dateTime.
     * 
     * @param room for which the RoomTransaction objects should be found.
     * @param dateTime for which the RoomTransaction objects should be found.
     * @return List of RoomTransaction objects.
     */
    List<RoomTransaction> findForPrimaryRoom(Room room, Date dateTime);
    
    /**
     * Finds RoomTransaction objects for the given employee and dateTime.
     * 
     * @param employee for which the RoomTransaction objects should be found.
     * @param dateTime for which the RoomTransaction objects should be found.
     * @return List of RoomTransaction objects.
     */
    List<RoomTransaction> findForEmployee(Employee employee, Date dateTime);
    
    /**
     * Finds "primary" (primary_em="1") RoomTransaction objects for the given employee and dateTime.
     * 
     * @param employee for which the RoomTransaction objects should be found.
     * @param dateTime for which the RoomTransaction objects should be found.
     * @return List of RoomTransaction objects.
     */
    List<RoomTransaction> findForPrimaryEmployee(Employee employee, Date dateTime);
    
    /**
     * Finds RoomTransaction objects for the given employee and dateTime which primary locations are
     * different.
     * 
     * @param employee for which the RoomTransaction objects should be found.
     * @param dateTime for which the RoomTransaction objects should be found.
     * @return List of RoomTransaction objects.
     */
    List<RoomTransaction> findForLocationChangeEmployee(final Employee employee, final Date dateTime);
    
    /**
     * Finds RoomTransaction objects for the given employee and dateTime which department are
     * different.
     * 
     * @param employee for which the RoomTransaction objects should be found.
     * @param dateTime for which the RoomTransaction objects should be found.
     * @return List of RoomTransaction objects.
     */
    List<RoomTransaction> findForDepartmentChangeEmployee(final Employee employee,
            final Date dateTime);
    
    /**
     * Finds RoomTransaction objects for the given Room and dateTime which room attributes are
     * different.
     * 
     * @param room for which the RoomTransaction objects should be found.
     * @param dateTime for which the RoomTransaction objects should be found.
     * @return List of RoomTransaction objects.
     */
    List<RoomTransaction> findForAttributeChangeRoom(Room room, Date dateTime);
    
}
