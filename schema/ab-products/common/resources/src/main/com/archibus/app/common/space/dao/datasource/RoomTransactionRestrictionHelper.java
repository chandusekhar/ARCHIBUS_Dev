package com.archibus.app.common.space.dao.datasource;

import java.util.Date;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.Room;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Helper class for Restriction Class for RoomTransaction.
 * 
 * 
 * @author Zhang Yi
 * 
 */
public final class RoomTransactionRestrictionHelper {
    
    /**
     * Table name "rmpct".
     */
    public static final String RMPCT = "rmpct";
    
    /**
     * Private Constructor of utility class .
     * 
     */
    private RoomTransactionRestrictionHelper() {
        
    }
    
    /**
     * Adds restriction clauses for location keys of room.
     * 
     * 
     * @param room The room to assemble the restriction for.
     * @param restrictionDef to add clauses to.
     */
    public static void addClausesForRoom(final Room room, final ParsedRestrictionDef restrictionDef) {
        
        // Use Room primary keys
        restrictionDef.addClause(RMPCT, Constants.BL_ID, room.getBuildingId(), Operation.EQUALS);
        restrictionDef.addClause(RMPCT, Constants.FL_ID, room.getFloorId(), Operation.EQUALS);
        restrictionDef.addClause(RMPCT, Constants.RM_ID, room.getId(), Operation.EQUALS);
        
    }
    
    /**
     * Adds restriction clauses for dateStart and dateEnd.
     * 
     * @param dateTime The dateTime to assemble the restriction for.
     * @param restrictionDef to add clauses to.
     */
    public static void addClausesForDateRange(final Date dateTime,
            final ParsedRestrictionDef restrictionDef) {
        
        if (dateTime != null) {
            
            // (date_start IS NULL OR date_start <= dateTime)
            restrictionDef.addClause(RMPCT, Constants.DATE_START, dateTime, Operation.LTE,
                RelativeOperation.AND_BRACKET);
            restrictionDef.addClause(RMPCT, Constants.DATE_START, null, Operation.IS_NULL,
                RelativeOperation.OR);
            
            // (date_end IS NULL OR date_end >= dateTime)
            restrictionDef.addClause(RMPCT, Constants.DATE_END, dateTime, Operation.GTE,
                RelativeOperation.AND_BRACKET);
            restrictionDef.addClause(RMPCT, Constants.DATE_END, null, Operation.IS_NULL,
                RelativeOperation.OR);
            
        }
    }
    
    /**
     * 
     * Add exclude clauses by the given room's attributes.
     * 
     * @param room The room that assemble excluded restriction for its attributes.
     * @param restrictionDef to add clauses to.
     */
    public static void addExcludeRestrictionForAttributeOfRoom(final Room room,
            final ParsedRestrictionDef restrictionDef) {
        
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.RM_CAT, room.getCategory(), true);
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.RM_TYPE, room.getType(), false);
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.DV_ID, room.getDivisionId(), false);
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.DP_ID, room.getDepartmentId(), false);
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.PRORATE, room.getProrate(), false);
        
    }
    
    /**
     * 
     * Add exclude clauses by the given employee's department.
     * 
     * @param employee The employee that assemble excluded restriction for its department.
     * @param restrictionDef to add clauses to.
     */
    public static void addExcludeRestrictionForDepartmentOfEmployee(final Employee employee,
            final ParsedRestrictionDef restrictionDef) {
        
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.DV_ID, employee.getDivisionId(), true);
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.DP_ID, employee.getDepartmentId(), false);
        
    }
    
    /**
     * 
     * Add exclude clauses by the given employee's location.
     * 
     * @param employee The employee that assemble excluded restriction for its location.
     * @param restrictionDef to add clauses to.
     */
    public static void addExcludeRestrictionForLocationOfEmployee(final Employee employee,
            final ParsedRestrictionDef restrictionDef) {
        
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.BL_ID, employee.getBuildingId(), true);
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.FL_ID, employee.getFloorId(), false);
        RoomTransactionRestrictionHelper.addExcludeClauseToRestrictionByField(restrictionDef,
            Constants.RM_ID, employee.getRoomId(), false);
        
    }
    
    /**
     * 
     * Add an exclude clause by a given field's name and value to a restriction to rmpct table. When
     * the field value exists, the SQL is like '(rmpct.dv_id!=fieldValue or rmpct.dv_id is null)';
     * when the field value is not existed, the SQL would be like 'rmpct.dv_id is not null'
     * 
     * 
     * @param restrictionDef The restriction need to add clause.
     * @param fieldName field's name.
     * @param fieldValue field's value.
     * @param needsBracket specify if clause needs a bracket, true or false.
     * 
     */
    public static void addExcludeClauseToRestrictionByField(
            final ParsedRestrictionDef restrictionDef, final String fieldName,
            final Object fieldValue, final boolean needsBracket) {
        
        // initial an RelativeOperation: if the sign 'needsBracket' is true, then use 'AND_BRACKET'
        // else just use a 'OR'.
        RelativeOperation relativeOperation;
        if (needsBracket) {
            relativeOperation = RelativeOperation.AND_BRACKET;
        } else {
            relativeOperation = RelativeOperation.OR;
        }
        
        if (StringUtil.notNullOrEmpty(fieldValue)) {
            
            // if field value exists, then add restriction clause for sql like
            // (rmpct.fieldName!=fieldValue or rmpct.fieldName is null)
            restrictionDef.addClause(RMPCT, fieldName, fieldValue, Operation.NOT_EQUALS,
                relativeOperation);
            restrictionDef.addClause(RMPCT, fieldName, null, Operation.IS_NULL,
                RelativeOperation.OR);
            
        } else {
            
            // if field value is empty or null, then add a clause of 'IS NOT NULL'.
            restrictionDef.addClause(RMPCT, fieldName, null, Operation.IS_NOT_NULL,
                relativeOperation);
            
        }
    }
}
