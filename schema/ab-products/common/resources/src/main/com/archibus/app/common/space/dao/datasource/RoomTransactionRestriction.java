package com.archibus.app.common.space.dao.datasource;

import java.util.Date;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.Room;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;

/**
 * Class that providing Restrictions for RoomTransaction.
 * 
 * 
 * @author Zhang Yi
 * 
 */
public final class RoomTransactionRestriction {
    
    /**
     * Table name "rmpct".
     */
    public static final String RMPCT = "rmpct";
    
    /**
     * Private Constructor of utility class .
     * 
     */
    private RoomTransactionRestriction() {
        
    }
    
    /**
     * Assembles parsed restriction to 'Approved' transaction from room and dateTime.
     * 
     * 
     * @param room The room to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef fromRoomAndDate(final Room room, final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef = getDefault();
        
        RoomTransactionRestrictionHelper.addClausesForRoom(room, restrictionDef);
        
        RoomTransactionRestrictionHelper.addClausesForDateRange(dateTime, restrictionDef);
        
        return restrictionDef;
    }
    
    /**
     * Assembles parsed restriction to 'Approved' transaction from primary room and dateTime.
     * 
     * @param room The room to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef fromPrimaryRoomAndDate(final Room room, final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef = fromRoomAndDate(room, dateTime);
        
        // additional restriction: primary_rm = 1
        restrictionDef.addClause(RMPCT, Constants.PRIMARY_RM, 1, Operation.EQUALS);
        
        return restrictionDef;
    }
    
    /**
     * Assembles parsed restriction to 'Approved' transaction from attribute changed room.
     * 
     * @param room The room to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef fromAttributeChangeRoom(final Room room, final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef = fromRoomAndDate(room, dateTime);
        
        restrictionDef.addClause(RMPCT, Constants.PRIMARY_RM, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        RoomTransactionRestrictionHelper.addExcludeRestrictionForAttributeOfRoom(room,
            restrictionDef);
        
        return restrictionDef;
    }
    
    /**
     * Assembles parsed restriction to 'Approved' transaction from employee and dateTime.
     * 
     * 
     * @param employee The employee to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef fromEmployeeAndDate(final Employee employee,
            final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef = getDefault();
        
        // Use Employee primary keys
        restrictionDef.addClause(RMPCT, Constants.EM_ID, employee.getId(), Operation.EQUALS);
        
        RoomTransactionRestrictionHelper.addClausesForDateRange(dateTime, restrictionDef);
        
        return restrictionDef;
    }
    
    /**
     * Assembles parsed restriction to 'Approved' transaction from primary employee and dateTime.
     * 
     * @param employee The employee to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef fromPrimaryEmployeeAndDate(final Employee employee,
            final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef = fromEmployeeAndDate(employee, dateTime);
        
        // additional restriction: primary_em = 1
        // KB3037748 - the RelativeOperation should use RelativeOperation.AND_BRACKET
        restrictionDef.addClause(RMPCT, Constants.PRIMARY_EM, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        return restrictionDef;
    }
    
    /**
     * Assembles parsed restriction to 'Approved' transaction from department changed employee.
     * 
     * @param employee The employee to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef fromDepartmentChangeEmployee(final Employee employee,
            final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef = fromEmployeeAndDate(employee, dateTime);
        
        restrictionDef.addClause(RMPCT, Constants.PRIMARY_EM, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        RoomTransactionRestrictionHelper.addExcludeRestrictionForDepartmentOfEmployee(employee,
            restrictionDef);
        
        return restrictionDef;
    }
    
    /**
     * Assembles parsed restriction to 'Approved' transaction from location changed employee.
     * 
     * @param employee The employee to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef fromLocationChangeEmployee(final Employee employee,
            final Date dateTime) {
        
        final ParsedRestrictionDef restrictionDef = fromEmployeeAndDate(employee, dateTime);
        
        restrictionDef.addClause(RMPCT, Constants.PRIMARY_EM, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        RoomTransactionRestrictionHelper.addExcludeRestrictionForLocationOfEmployee(employee,
            restrictionDef);
        
        return restrictionDef;
    }
    
    /**
     * Assembles the default parsed restriction only contains clause status='Approved'.
     * 
     * @return Assembled default parsed restriction to RoomTransactions.
     */
    private static ParsedRestrictionDef getDefault() {
        
        final ParsedRestrictionDef defaultRestriction = new ParsedRestrictionDef();
        
        // status = 1 means 'Approved'
        defaultRestriction.addClause(RMPCT, Constants.STATUS, 1, Operation.EQUALS);
        
        return defaultRestriction;
    }
    
}
