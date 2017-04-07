package com.archibus.app.common.space.dao.datasource;

import java.util.Date;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.Room;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;

/**
 * Helper class for DataSource Class for RoomTransaction.
 * 
 * 
 * @author Zhang Yi
 * 
 */
public final class RoomTransactionDataSourceHelper {
    
    /**
     * Table name "rmpct".
     */
    public static final String RMPCT = "rmpct";
    
    /**
     * Private Constructor of utility class .
     * 
     */
    private RoomTransactionDataSourceHelper() {
        
    }
    
    /**
     * Assembles parsed restriction from room and dateTime. Uses primary key values from the room.
     * Uses status value "1". Uses dateTime to set restrictions on date_start and date_end.
     * 
     * 
     * @param room The room to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef prepareRestrictionForRoom(final Room room,
            final Date dateTime) {
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        // Use Room primary keys
        restrictionDef.addClause(RMPCT, Constants.BL_ID, room.getBuildingId(), Operation.EQUALS);
        restrictionDef.addClause(RMPCT, Constants.FL_ID, room.getFloorId(), Operation.EQUALS);
        restrictionDef.addClause(RMPCT, Constants.RM_ID, room.getId(), Operation.EQUALS);
        // status = 1
        restrictionDef.addClause(RMPCT, Constants.STATUS, 1, Operation.EQUALS);
        
        if (dateTime != null) {
            addClausesForDateStartAndEnd(dateTime, restrictionDef);
        }
        
        return restrictionDef;
    }
    
    /**
     * Assembles parsed restriction from employee and dateTime. Uses primary key values from the
     * employee. Uses status value "1". Uses dateTime to set restrictions on date_start and
     * date_end.
     * 
     * 
     * @param employee The employee to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef prepareRestrictionForEmployee(final Employee employee,
            final Date dateTime) {
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        // Use Employee primary keys
        restrictionDef.addClause(RMPCT, Constants.EM_ID, employee.getId(), Operation.EQUALS);
        // status = 1
        restrictionDef.addClause(RMPCT, Constants.STATUS, 1, Operation.EQUALS);
        
        addClausesForDateStartAndEnd(dateTime, restrictionDef);
        
        return restrictionDef;
    }
    
    /**
     * Adds clauses for dateStart and dateEnd.
     * 
     * @param dateTime The dateTime to assemble the restriction for.
     * @param restrictionDef to add clauses to.
     */
    private static void addClausesForDateStartAndEnd(final Date dateTime,
            final ParsedRestrictionDef restrictionDef) {
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
