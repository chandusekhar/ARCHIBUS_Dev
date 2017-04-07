package com.archibus.service.space.helper;

import java.util.*;

import com.archibus.app.common.space.domain.RoomTransaction;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.*;
import com.archibus.utility.*;

/**
 * <p>
 * Helper Class for Space Transaction that holds methods and variables used in
 * SpaceTransactionHandler.java.<br>
 *
 * <p>
 *
 */

public final class SpaceTransactionRestriction {

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private SpaceTransactionRestriction() {
    }

    /**
     * Add restriction clauses for fields Start Date and End Date.
     *
     *
     * @param parsedRestriction restriction object
     * @param requestDate request date
     *
     */
    public static void addDateClausesToToLocationFields(
            final ParsedRestrictionDef parsedRestriction, final Date requestDate) {

        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.LTE, RelativeOperation.AND_BRACKET);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NULL, RelativeOperation.OR);

        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, requestDate,
            Operation.GTE, RelativeOperation.AND_BRACKET);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, null,
            Operation.IS_NULL, RelativeOperation.OR);

    }

    /**
     * Add restriction clauses for fields from_bl_id, from_fl_id,from_rm_id of table rmpct by given
     * building, floor and room code.
     *
     *
     * @param parsedRestriction restriction object
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     *
     */
    public static void addEqualClausesToFromLocationFields(
            final ParsedRestrictionDef parsedRestriction, final String blId, final String flId,
            final String rmId) {

        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_BL_ID, blId,
            Operation.EQUALS);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_FL_ID, flId,
            Operation.EQUALS);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.FROM_RM_ID, rmId,
            Operation.EQUALS);

    }

    /**
     * Add restriction clauses to an existed rmpct restriction based on values of given fields name
     * of assignment object.
     *
     *
     * @param rmpctRec DataRecord rmpct record
     * @param parsedRestriction ParsedRestrictionDef rmpct restriction that need to add more equal
     *            clauses
     * @param fieldArrays String[] fields name array
     *
     */
    public static void addEqualClausesToParsedeRestrictionByRmpct(final DataRecord rmpctRec,
            final ParsedRestrictionDef parsedRestriction, final String[] fieldArrays) {
        for (final String field : fieldArrays) {
            parsedRestriction.addClause(SpaceConstants.RMPCT, field,
                rmpctRec.getString(SpaceConstants.RMPCT + SpaceConstants.DOT + field),
                Operation.EQUALS);

        }
    }

    /**
     * Add restriction clauses for fields bl_id, fl_id, rm_id of table rmpct by given building,
     * floor and room code.
     *
     *
     * @param parsedRestriction restriction object
     * @param blId building code
     * @param flId floor code
     * @param rmId room code
     *
     */
    public static void addEqualClausesToToLocationFields(
            final ParsedRestrictionDef parsedRestriction, final String blId, final String flId,
            final String rmId) {

        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId,
            Operation.EQUALS);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId,
            Operation.EQUALS);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId,
            Operation.EQUALS);

    }

    /**
     * Add restriction clauses for fields bl_id, fl_id, rm_id of table rmpct from given assignment.
     *
     *
     * @param assignment RmpctObject assignment object
     * @param parsedRestriction restriction object
     *
     */
    public static void addEqualClausesFromToLocationOfAssignment(final AssignmentObject assignment,
            final ParsedRestrictionDef parsedRestriction) {

        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final String toBlId = roomTransaction.getBuildingId();
        final String toFlId = roomTransaction.getFloorId();
        final String toRmId = roomTransaction.getRoomId();

        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, toFlId,
            Operation.EQUALS);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, toRmId,
            Operation.EQUALS);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, toBlId,
            Operation.EQUALS);

    }

    /**
     * Add restriction clauses for fields from_bl_id, from_fl_id, from_rm_id of table rmpct from
     * given assignment.
     *
     *
     * @param assignment RmpctObject assignment object
     * @param parsedRestriction restriction object
     *
     */
    public static void addEqualClausesFromFromLocationOfAssignment(
            final AssignmentObject assignment, final ParsedRestrictionDef parsedRestriction) {

        final RoomTransaction roomTransaction = assignment.getRoomTransaction();
        final String fromBlId = roomTransaction.getFromBuildingId();
        final String fromFlId = roomTransaction.getFromFloorId();
        final String fromRmId = roomTransaction.getFromRoomId();

        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, fromFlId,
            Operation.EQUALS);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, fromRmId,
            Operation.EQUALS);
        parsedRestriction.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, fromBlId,
            Operation.EQUALS);

    }

    /**
     * Return a parsed restriction object for querying rmpct records for department space claim.
     *
     * @param rmpctObject RmpctObject assignment object
     * @param date Date request move date
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForDepartmentClaim(
            final AssignmentObject rmpctObject, final Date date) {

        // construct and return a ParsedRestrictionDef object that contains below conditions, the
        // <..> values are from assignment.
        // activity_log_id != <activity_log_id> AND status = 1 AND bl_id = <bl_id> AND fl_id =
        // <fl_id> AND rm_id = <rm_id> AND dv_id is NULL AND dp_id is NUL

        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        final Integer activityLogId = roomTransaction.getActivityLogId();
        final String blId = roomTransaction.getBuildingId();
        final String flId = roomTransaction.getFloorId();
        final String rmId = roomTransaction.getRoomId();

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId, Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, "status", 1, Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DV_ID, null, Operation.IS_NULL);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DP_ID, null, Operation.IS_NULL);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, activityLogId,
            Operation.NOT_EQUALS, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, date, Operation.LTE,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, date, Operation.GTE,
            RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, null,
            Operation.IS_NULL, RelativeOperation.OR);

        return rmpctResDef;
    }

    /**
     * Return a parsed restriction object for querying rmpct records for department space release.
     *
     * @param rmpctObject RmpctObject assignment object
     * @param activityLogRec DataRecord activity log record
     * @param requestDate Date request move date
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForDepartmentRelease(
            final AssignmentObject rmpctObject, final DataRecord activityLogRec,
            final Date requestDate) {

        // construct and return a ParsedRestrictionDef object that contains below conditions, the
        // <..> values are from assignment object except that
        // <requestor_dv_id> AND <requestor_dp_id> from activity log record activityLogRec.
        // (Activity_log_id is null or activity_log_id != <activity_log_id>) AND status = 1 AND
        // bl_id = <bl_id> AND fl_id = <fl_id> AND rm_id = <rm_id> AND dv_id = <requestor_dv_id> AND
        // dp_id = <requestor_dp_id>
        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        final Integer activityLogId = roomTransaction.getActivityLogId();
        final String blId = roomTransaction.getBuildingId();
        final String flId = roomTransaction.getFloorId();
        final String rmId = roomTransaction.getRoomId();

        final String dvId =
                activityLogRec.getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                    + SpaceConstants.DV_ID);
        final String dpId =
                activityLogRec.getString(SpaceConstants.ACTIVITY_LOG + SpaceConstants.DOT
                    + SpaceConstants.DP_ID);

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId, Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DV_ID, dvId, Operation.EQUALS);
        // kb#3044116 & kb#3044054: if release operation is from user without department, then pass
        // department restriction.
        if (!StringUtil.isNullOrEmpty(dpId)) {
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DP_ID, dpId,
                Operation.EQUALS);
        }

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, activityLogId,
            Operation.NOT_EQUALS, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.LTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, requestDate,
            Operation.GTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, null,
            Operation.IS_NULL, RelativeOperation.OR);

        return rmpctResDef;
    }

    /**
     * Return a parsed restriction object for querying rmpct records is not null and em_id is not
     * null and ACTIVITY_TYPE=SERVICE_DESK_DEPARTMENT_SPACE .
     *
     * @param rmpctObject RmpctObject assignment object
     * @param requestDate Date request date
     * @return rmpctResDef
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForDpToLocation(
            final AssignmentObject rmpctObject, final Date requestDate) {

        // construct and return a ParsedRestrictionDef object that contains below conditions, the
        // <..> values are from assignment object, and <date> is requestDate.
        // bl_id = <to_bl_id> AND fl_id = <to_fl_id> AND rm_id = <to_rm_id> AND em_id IS NULL AND
        // (activity_log_id IS NULL OR activity_log_id != <activity_log_id>) AND status = 1 AND
        // (date_start IS NULL OR date_start <= <date> ) AND (date_end IS NULL OR date_end >=
        // <date>)

        final ParsedRestrictionDef rmpctResDef1 = new ParsedRestrictionDef();
        addEqualClausesFromToLocationOfAssignment(rmpctObject, rmpctResDef1);

        rmpctResDef1.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);

        rmpctResDef1.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START,
            Utility.currentDate(), Operation.GTE);
        rmpctResDef1.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.LTE);
        rmpctResDef1.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL);
        rmpctResDef1.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE, Operation.EQUALS);

        return rmpctResDef1;
    }

    /**
     * Return a parsed restriction object for querying rmpct records by from location plus other
     * conditions: rmpct is not null and em_id is not null and
     * ACTIVITY_TYPE=SERVICE_DESK_DEPARTMENT_SPACE .
     *
     * @param rmpctObject RmpctObject assignment object
     * @param requestDate Date request date
     * @return rmpctResDef
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForDpFromLocation(
            final AssignmentObject rmpctObject, final Date requestDate) {

        // bl_id = <from_bl_id> AND fl_id = <from_fl_id> AND rm_id = <from_rm_id> AND em_id IS NULL
        // AND
        // (activity_log_id IS NULL OR activity_log_id != <activity_log_id>) AND status = 1 AND
        // (date_start IS NULL OR date_start <= <date> ) AND (date_end IS NULL OR date_end >=
        // <date>)

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        addEqualClausesFromFromLocationOfAssignment(rmpctObject, rmpctResDef);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START,
            Utility.currentDate(), Operation.GTE);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.LTE);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL);
        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE, Operation.EQUALS);

        return rmpctResDef;
    }

    /**
     * Return a parsed restriction object for querying rmpct records are empty for 'to' location.
     *
     * @param assignment RmpctObject assignment object
     * @param requestDate Date request date
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForEmptyToLocation(
            final AssignmentObject assignment, final Date requestDate) {

        // construct and return a ParsedRestrictionDef object that contains below conditions, the
        // <..> values are from assignment object, and <date> is requestDate.
        // bl_id = <to_bl_id> AND fl_id = <to_fl_id> AND rm_id = <to_rm_id> AND em_id IS NULL AND
        // (rmpct.rm_cat is occupiable) AND status = 1 AND (date_start IS NULL OR date_start <=
        // <date>) AND (date_end IS NULL OR date_end >= <date>)

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        addEqualClausesFromToLocationOfAssignment(assignment, rmpctResDef);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID, null, Operation.IS_NULL);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.LTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, requestDate,
            Operation.GTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, null,
            Operation.IS_NULL, RelativeOperation.OR);
        // adjust restriction condition to get empty occupiable room part
        rmpctResDef.addClause(SpaceConstants.RMCAT, SpaceConstants.OCCUPIABLE, 1, Operation.EQUALS);

        return rmpctResDef;
    }

    /**
     * Return a parsed restriction object for querying rmpct records that employee are moved out if
     * withEm was true. or return all the move From Location record.
     *
     * @param rmpctObject RmpctObject assignment object
     * @param requestDate Date request date
     * @param withEm whether use em_id as a query condition.
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForFromLocation(
            final AssignmentObject rmpctObject, final Date requestDate, final boolean withEm) {

        // construct and return a ParsedRestrictionDef object that contains below conditions, the
        // <..> values are from assignment object, and <date> is requestDate.
        // bl_id = <from_bl_id> AND fl_id = <from_fl_id> AND rm_id = <from_rm_id> AND em_id=<em_id>
        // AND (activity_log_id IS NULL OR activity_log_id != <activity_log_id>) AND status = 1 AND
        // (date_start IS NULL OR date_start <= <date>) AND (date_end IS NULL OR date_end >= <date>)

        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        final Integer activityLogId = roomTransaction.getActivityLogId();
        final String fromBlId = roomTransaction.getFromBuildingId();
        final String fromFlId = roomTransaction.getFromFloorId();
        final String fromRmId = roomTransaction.getFromRoomId();
        final String emId = roomTransaction.getEmployeeId();

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, fromBlId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, fromFlId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, fromRmId,
            Operation.EQUALS);
        if (withEm) {
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID, emId,
                Operation.EQUALS);
        }

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.LTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, requestDate,
            Operation.GTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, null,
            Operation.IS_NULL, RelativeOperation.OR);

        if (activityLogId == null) {
            final Integer moId = roomTransaction.getMoId();
            if (moId != null) {
                rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.MO_ID, moId,
                    Operation.NOT_EQUALS, RelativeOperation.AND_BRACKET);
                rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.MO_ID, null,
                    Operation.IS_NULL, RelativeOperation.OR);
            }

        } else {
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID,
                activityLogId, Operation.NOT_EQUALS, RelativeOperation.AND_BRACKET);
            rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
                Operation.IS_NULL, RelativeOperation.OR);
        }

        return rmpctResDef;
    }

    /**
     * Return a parsed restriction object for querying rm records based on location value.
     *
     * @param fromBlId String bl_id
     * @param fromFlId String fl_id object
     * @param fromRmId String rm_id
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForLocation(final String fromBlId,
            final String fromFlId, final String fromRmId) {

        final ParsedRestrictionDef rmResDef = new ParsedRestrictionDef();
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.BL_ID, fromBlId, Operation.EQUALS);
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.FL_ID, fromFlId, Operation.EQUALS);
        rmResDef.addClause(SpaceConstants.T_RM, SpaceConstants.RM_ID, fromRmId, Operation.EQUALS);

        return rmResDef;
    }

    /**
     * Return a parsed restriction object for querying rmpct records are occupied for 'to' location.
     *
     * @param rmpctObject RmpctObject assignment object
     * @param requestDate Date request date
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForToLocation(
            final AssignmentObject rmpctObject, final Date requestDate) {

        // construct and return a ParsedRestrictionDef object that contains below conditions, the
        // <..> values are from assignment object, and <date> is requestDate.
        // bl_id = <to_bl_id> AND fl_id = <to_fl_id> AND rm_id = <to_rm_id> AND status = 1 AND
        // (date_start IS NULL OR date_start <= <date>) AND (date_end IS NULL OR date_end >= <date>)
        // AND day_part IN (0, 1)

        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        final String toBlId = roomTransaction.getBuildingId();
        final String toFlId = roomTransaction.getFloorId();
        final String toRmId = roomTransaction.getRoomId();

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, toBlId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, toFlId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, toRmId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.LTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, null,
            Operation.IS_NULL, RelativeOperation.OR);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, requestDate,
            Operation.GTE, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_END, null,
            Operation.IS_NULL, RelativeOperation.OR);
        // current this 'Operation.IN' is not work, print 'sql' is rmpct.day_part is null
        final List<String> dayPart = new ArrayList<String>();
        dayPart.add("0");
        dayPart.add("1");
        rmpctResDef.addClause(SpaceConstants.RMPCT, "day_part", dayPart, Operation.IN);

        return rmpctResDef;
    }

    /**
     * Return a parsed restriction object for querying rmpct records when pct_id had change.
     *
     * @param rmpctObject RmpctObject assignment object
     * @param requestDate Date request date
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForOriginalRmpct(
            final AssignmentObject rmpctObject, final Date requestDate) {

        // construct and return a ParsedRestrictionDef object object for querying rmpct records when
        // pct_id had change.

        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        final String toBlId = roomTransaction.getBuildingId();
        final String toFlId = roomTransaction.getFloorId();
        final String toRmId = roomTransaction.getRoomId();
        final String employeeId = roomTransaction.getEmployeeId();
        final Integer activityLogId = roomTransaction.getActivityLogId();

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, toBlId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, toFlId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, toRmId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.STATUS, 1, Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.EM_ID, employeeId,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, activityLogId,
            Operation.EQUALS);

        return rmpctResDef;
    }

    /**
     * Return a parsed restriction object for querying same day department claim/release request.
     *
     * @param rmpctObject RmpctObject assignment object
     * @param requestDate Date request date
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForSameDayDepartmentRequests(
            final AssignmentObject rmpctObject, final Date requestDate) {

        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        final String blId = roomTransaction.getBuildingId();
        final String flId = roomTransaction.getFloorId();
        final String rmId = roomTransaction.getRoomId();
        final Integer activityLogId = roomTransaction.getActivityLogId();

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.EQUALS);

        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, activityLogId,
            Operation.NOT_EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL);
        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE, Operation.EQUALS);

        return rmpctResDef;
    }
    
    /**
     * Return a parsed restriction object for querying same day move requests.
     *
     * @param rmpctObject RmpctObject assignment object
     * @param requestDate Date request date
     *
     * @return ParsedRestrictionDef rmpct restriction
     */
    public static ParsedRestrictionDef getParsedRmpctRestrictionForSameDayMoveRequests(
            final AssignmentObject rmpctObject, final Date requestDate) {

        final RoomTransaction roomTransaction = rmpctObject.getRoomTransaction();
        final String blId = roomTransaction.getBuildingId();
        final String flId = roomTransaction.getFloorId();
        final String rmId = roomTransaction.getRoomId();
        final Integer activityLogId = roomTransaction.getActivityLogId();

        final ParsedRestrictionDef rmpctResDef = new ParsedRestrictionDef();

        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceConstants.SERVICE_DESK_DEPARTMENT_SPACE, Operation.EQUALS,
            RelativeOperation.OR);
        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceConstants.SERVICE_DESK_GROUP_MOVE, Operation.EQUALS, RelativeOperation.OR);
        rmpctResDef.addClause(SpaceConstants.ACTIVITY_LOG, SpaceConstants.ACTIVITY_TYPE,
            SpaceConstants.SERVICE_DESK_INDIVIDUAL_MOVE, Operation.EQUALS, RelativeOperation.OR);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, null,
            Operation.IS_NOT_NULL, RelativeOperation.AND_BRACKET);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.ACTIVITY_LOG_ID, activityLogId,
            Operation.NOT_EQUALS);
        
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.BL_ID, blId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.FL_ID, flId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.RM_ID, rmId, Operation.EQUALS);
        rmpctResDef.addClause(SpaceConstants.RMPCT, SpaceConstants.DATE_START, requestDate,
            Operation.EQUALS);
        
        return rmpctResDef;
    }
}