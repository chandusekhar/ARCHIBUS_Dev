package com.archibus.service.space.future;

import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.SpaceTransactionCommon;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 * 
 * <p>
 * 
 */

public final class SpaceFutureTransactionRestriction {
    
    /**
     * Return a parsed restriction object for querying rmpct records .
     */
    private static final String[] FROM_LOCATION_FIELDS = new String[] { SpaceConstants.FROM_BL_ID,
            SpaceConstants.FROM_FL_ID, SpaceConstants.FROM_RM_ID };
    
    /**
     * Return a parsed restriction object for querying rmpct records .
     */
    private static final String[] TO_LOCATION_FIELDS = new String[] { SpaceConstants.BL_ID,
            SpaceConstants.FL_ID, SpaceConstants.RM_ID };
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     * 
     */
    private SpaceFutureTransactionRestriction() {
    }
    
    /**
     * Return a parsed restriction An employee requests to move out of a location, but there are
     * future transactions for that location that include the employee.
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResForAllFutureMove(final AssignmentObject rmpctObject,
            final Date requestDate) {
        
        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        final String fromBlId = roomTransaction.getFromBuildingId();
        final String fromFlId = roomTransaction.getFromFloorId();
        final String fromRmId = roomTransaction.getFromRoomId();
        final String blId = roomTransaction.getBuildingId();
        final String flId = roomTransaction.getFloorId();
        final String rmId = roomTransaction.getRoomId();
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        if (SpaceTransactionCommon.checkNotEmpty(fromBlId, fromFlId, fromRmId)
                && SpaceTransactionCommon.checkNotEmpty(blId, flId, rmId)) {
            
            addPrimaryKeyClausesToRestriction(TO_LOCATION_FIELDS, FROM_LOCATION_FIELDS,
                rmpctObject, restriction, null);
            
            addPrimaryKeyClausesToRestriction(FROM_LOCATION_FIELDS, TO_LOCATION_FIELDS,
                rmpctObject, restriction, RelativeOperation.OR_BRACKET);
            
            addPrimaryKeyClausesToRestriction(TO_LOCATION_FIELDS, TO_LOCATION_FIELDS, rmpctObject,
                restriction, RelativeOperation.OR_BRACKET);
            
        } else if (SpaceTransactionCommon.checkNotEmpty(fromBlId, fromFlId, fromRmId)
                && !SpaceTransactionCommon.checkNotEmpty(blId, flId, rmId)) {
            
            addPrimaryKeyClausesToRestriction(TO_LOCATION_FIELDS, FROM_LOCATION_FIELDS,
                rmpctObject, restriction, null);
            
        } else if (!(fromBlId != null && fromFlId != null && fromRmId != null)
                && SpaceTransactionCommon.checkNotEmpty(blId, flId, rmId)) {
            
            addPrimaryKeyClausesToRestriction(FROM_LOCATION_FIELDS, TO_LOCATION_FIELDS,
                rmpctObject, restriction, null);
            
            addPrimaryKeyClausesToRestriction(TO_LOCATION_FIELDS, TO_LOCATION_FIELDS, rmpctObject,
                restriction, RelativeOperation.OR_BRACKET);
            
        }
        
        addClausesToRestrictionByActivityLog(requestDate, restriction);
        return restriction;
    }
    
    /**
     * Return a parsed restriction An employee requests to move out of a location, but there are
     * future transactions for that location that include the employee.
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResFutureFromLocationMoveIn(
            final AssignmentObject rmpctObject, final Date requestDate) {
        
        // IF EXISTS (SELECT 1 FROM rmpct WHERE em_id IS NOT NULL AND date_start > <date_start>
        // AND bl_id = <from_bl_id> AND fl_id = <from_fl_id> AND rm_id = <from_rm_id> and
        // activity_log_is IS NOT NULL)
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        addPrimaryKeyClausesToRestriction(TO_LOCATION_FIELDS, FROM_LOCATION_FIELDS, rmpctObject,
            rmpctResDef, null);
        
        addClausesToRestrictionByActivityLog(requestDate, rmpctResDef);
        return rmpctResDef;
        
    }
    
    /**
     * Return a parsed restriction if Another request exists involving the same employee for a
     * future assignment. for move manage management 'cancel'
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResFutureMoveOutAlert(final AssignmentObject rmpctObject,
            final Date requestDate) {
        
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        
        addPrimaryKeyClausesToRestriction(FROM_LOCATION_FIELDS, TO_LOCATION_FIELDS, rmpctObject,
            rmpctResDef, null);
        
        addClausesToRestrictionByEm(rmpctObject.getRoomTransaction().getEmployeeId(), requestDate,
            rmpctResDef);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        
        final List<String> activityType = new ArrayList<String>();
        activityType.add(SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE);
        activityType.add(SpaceConstants.SERVICE_DESK_GROUP_MOVE);
        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            activityType, Operation.IN, RelativeOperation.AND_BRACKET);
        
        return rmpctResDef;
    }
    
    /**
     * Return a parsed restriction for 'department space'.
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResFutureMoveOutForDp(final AssignmentObject rmpctObject,
            final Date requestDate) {
        
        // Select 1 From rmpct WHERE from_bl_id=<bl_id> and from_fl_id=<fl_id>
        // and from_rm_id=<rm_id> and date_end> =<date_start> andactivity_log_idIS NOT NULL
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        addPrimaryKeyClausesToRestriction(FROM_LOCATION_FIELDS, TO_LOCATION_FIELDS, rmpctObject,
            rmpctResDef, null);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.GTE, RelativeOperation.AND_BRACKET);
        // .addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
        // Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        return rmpctResDef;
    }
    
    /**
     * Return a parsed restriction if Another request exists involving the same employee for a
     * future assignment. for move manage management 'submit and approve'
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResFutureMoveOutFromAlert(
            final AssignmentObject rmpctObject, final Date requestDate) {
        
        // SELECT 1 FROM rmpct WHERE em_id = <em_id> AND date_start><date_start>
        // AND from_bl_id = <bl_id> AND from_fl_id = <fl_id> AND from_rm_id =<rm_id>
        final ParsedRestrictionDef parsedRestrictionDef = new ParsedRestrictionDef();
        
        addPrimaryKeyClausesToRestriction(FROM_LOCATION_FIELDS, FROM_LOCATION_FIELDS, rmpctObject,
            parsedRestrictionDef, null);
        
        addClausesToRestrictionByEm(rmpctObject.getRoomTransaction().getEmployeeId(), requestDate,
            parsedRestrictionDef);
        
        parsedRestrictionDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        
        final List<String> activityType = new ArrayList<String>();
        activityType.add(SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE);
        activityType.add(SpaceConstants.SERVICE_DESK_GROUP_MOVE);
        parsedRestrictionDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            activityType, Operation.IN, RelativeOperation.AND_BRACKET);
        
        return parsedRestrictionDef;
    }
    
    /**
     * Return a parsed restriction for 'department space' Changes need to do on dealing with
     * department space requests Another request exists involving the same room for a future
     * assignment. Please cancel or modify that assignment first before changing this assignment
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResFutureMoveToForDpAlert(
            final AssignmentObject rmpctObject, final Date requestDate) {
        
        // SELECT 1 FROM rmpct WHERE em_id = <em_id> AND date_start><date_start>
        // AND from_bl_id = <bl_id> AND from_fl_id = <fl_id> AND from_rm_id =<rm_id>
        
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        
        addPrimaryKeyClausesToRestriction(TO_LOCATION_FIELDS, TO_LOCATION_FIELDS, rmpctObject,
            rmpctResDef, null);
        
        addClausesToRestrictionByActivityLog(requestDate, rmpctResDef);
        
        return rmpctResDef;
    }
    
    /**
     * Return a parsed restriction An employee requests to move out of a location, but there are
     * future transactions for that location that include the employee.
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResFutureToLocationMoveIn(
            final AssignmentObject rmpctObject, final Date requestDate) {
        
        // SELECT 1 FROM rmpct WHERE bl_id=<bl_id> and fl_id=<fl_id> and rm_id=<rm_id> and
        // date_start > <date_start>
        // AND activity_log_id is NOT NULL
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        
        addPrimaryKeyClausesToRestriction(TO_LOCATION_FIELDS, TO_LOCATION_FIELDS, rmpctObject,
            rmpctResDef, null);
        
        addClausesToRestrictionByActivityLog(requestDate, rmpctResDef);
        
        return rmpctResDef;
        
    }
    
    /**
     * Return a parsed restriction An employee requests to move out of a location, but there are
     * future transactions for that location that include the employee.
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResFutureToLocationMoveOut(
            final AssignmentObject rmpctObject, final Date requestDate) {
        
        // IF EXISTS (SELECT 1 FROM rmpct WHERE em_id IS NOT NULL AND date_start><date_start>
        // AND bl_id = <from_bl_id> AND fl_id = <from_fl_id> AND rm_id = <from_rm_id>
        // and activity_log_is IS NOT NULL)
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        
        addPrimaryKeyClausesToRestriction(FROM_LOCATION_FIELDS, TO_LOCATION_FIELDS, rmpctObject,
            rmpctResDef, null);
        
        addClausesToRestrictionByActivityLog(requestDate, rmpctResDef);
        
        return rmpctResDef;
        
    }
    
    /**
     * Return a parsed restriction An employee requests to move from a location, but there are
     * future transactions for that location that include the employee.
     * 
     * @param rmpctObject RmpctObject
     * @param requestDate Date request date
     * 
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getResFutureFromLocationMoveOut(
            final AssignmentObject rmpctObject, final Date requestDate) {
        
        // IF EXISTS (SELECT 1 FROM rmpct WHERE date_start><date_start>
        // AND from_bl_id = <from_bl_id> AND from_fl_id = <from_fl_id> AND from_rm_id = <from_rm_id>
        // and activity_log_is IS NOT NULL)
        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        
        addPrimaryKeyClausesToRestriction(FROM_LOCATION_FIELDS, FROM_LOCATION_FIELDS, rmpctObject,
            rmpctResDef, null);
        
        addClausesToRestrictionByActivityLog(requestDate, rmpctResDef);
        
        return rmpctResDef;
        
    }
    
    /**
     * Add clauses by fields status, activity_log_id, date_start rmpct to restriction.
     * 
     * @param requestDate request date
     * @param restriction ParsedRestrictionDef object
     * 
     */
    private static void addClausesToRestrictionByActivityLog(final Date requestDate,
            final ParsedRestrictionDef restriction) {
        
        restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.GT, RelativeOperation.AND_BRACKET);
        restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        
        restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
    }
    
    /**
     * Add clauses by fields status, activity_log_id, date_start rmpct to restriction.
     * 
     * @param emId employee code
     * @param requestDate request date
     * @param restriction ParsedRestrictionDef object
     * 
     */
    private static void addClausesToRestrictionByEm(final String emId, final Date requestDate,
            final ParsedRestrictionDef restriction) {
        
        restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID, emId, Operation.EQUALS);
        
        restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        
        restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.GT, RelativeOperation.AND_BRACKET);
        restriction.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        
    }
    
    /**
     * Add clauses by primary keys of rmct to restriction.
     * 
     * @param fields String[] array of primary field names need to restrict
     * @param keys String[] array of primary keys to get values from assignment
     * @param rmpctObject RmpctObject
     * @param restriction ParsedRestrictionDef object
     * @param relativeOPeration RelativeOPeration object
     * 
     */
    private static void addPrimaryKeyClausesToRestriction(final String[] fields,
            final String[] keys, final AssignmentObject rmpctObject,
            final ParsedRestrictionDef restriction, final RelativeOperation relativeOPeration) {
        
        final JSONObject assignment = new JSONObject();
        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        
        assignment.put(SpaceConstants.FROM_BL_ID, roomTransaction.getFromBuildingId());
        assignment.put(SpaceConstants.FROM_FL_ID, roomTransaction.getFromFloorId());
        assignment.put(SpaceConstants.FROM_RM_ID, roomTransaction.getFromRoomId());
        assignment.put(SpaceConstants.BL_ID, roomTransaction.getBuildingId());
        assignment.put(SpaceConstants.FL_ID, roomTransaction.getFloorId());
        assignment.put(SpaceConstants.RM_ID, roomTransaction.getRoomId());
        
        for (int i = 0; i < keys.length; i++) {
            if (relativeOPeration != null && i == 0) {
                restriction.addClause(SpaceConstants.RMPCT, fields[i],
                    assignment.optString(keys[i], null), Operation.EQUALS, relativeOPeration);
            } else {
                
                restriction.addClause(SpaceConstants.RMPCT, fields[i],
                    assignment.optString(keys[i], null), Operation.EQUALS);
            }
            
        }
    }
    
}