package com.archibus.app.common.mobile.space;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import org.apache.axis.utils.StringUtils;

import com.archibus.app.common.mobile.util.ServiceUtilities;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.Utility;

/**
 * Utility class. Provides supporting methods for retrieving restrictions for Space Mobile apps.
 * Some methods were moved from 21.1 com.archibus.app.space.mobile.service.impl package.
 * 
 * @author Ana Paduraru
 * @since 21.2
 * 
 */
public final class RestrictionUtilities {
    /**
     * Hide default constructor - should never be instantiated.
     */
    private RestrictionUtilities() {
    }
    
    /**
     * Composes a restriction based on values for building code, floor code and room code for
     * specified table.
     * 
     * @param tableName table name
     * @param buildingId building code
     * @param floorId floor code
     * @param roomId room code
     * 
     * @return ParsedRestrictionDef object
     */
    public static ParsedRestrictionDef composeRoomRestriction(final String tableName,
            final String buildingId, final String floorId, final String roomId) {
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        
        restriction.addClause(tableName, BL_ID, buildingId, Operation.EQUALS);
        restriction.addClause(tableName, FL_ID, floorId, Operation.EQUALS);
        
        if (!StringUtils.isEmpty(roomId)) {
            restriction.addClause(tableName, RM_ID, roomId, Operation.EQUALS);
        }
        return restriction;
    }
    
    /**
     * Composes a restriction based on values for survey code, building code, floor code and/or room
     * code for the specified table.
     * 
     * @param tableName the name of the table to apply restriction on
     * @param surveyId survey code
     * @param buildingId building code
     * @param floorId floor code
     * @param roomId room code
     * @return ParsedRestrictionDef object
     */
    public static ParsedRestrictionDef composeRoomSurveyRestriction(final String tableName,
            final String surveyId, final String buildingId, final String floorId,
            final String roomId) {
        
        final ParsedRestrictionDef restriction =
                composeRoomRestriction(tableName, buildingId, floorId, roomId);
        
        restriction.addClause(tableName, SURVEY_ID, surveyId, Operation.EQUALS);
        
        return restriction;
    }
    
    /**
     * Composes a restriction based on values for survey code and employee code for em_sync table.
     * 
     * @param surveyId survey code
     * @param emId employee code
     * @return ParsedRestrictionDef object
     */
    public static ParsedRestrictionDef composeEmSyncRestriction(final String surveyId,
            final String emId) {
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(EM_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        
        if (!StringUtils.isEmpty(emId)) {
            restriction.addClause(EM_SYNC_TABLE, EM_ID, emId, Operation.EQUALS);
        }
        return restriction;
    }
    
    /**
     * Composes a restriction based on bl_id and fl_id for active records of rmpct table. Active
     * records are: (rmpct.date_start IS NULL OR rmpct.date_start <= <current date>) AND
     * (rmpct.date_end IS NULL OR rmpct.date_end >= <current date>), have status = 1 (Approved).
     * Exclude Hoteling records: rmpct.activity_log_id = activity_log_activity_log_id AND
     * activity_log.activity_type = 'SERVICE DESK - HOTELING'.
     * 
     * @param buildingId bl_id value
     * @param floorId fl_id value
     * @return a restriction string
     * 
     *         <p>
     * 
     *         SuppressWarning Justification
     *         <li><code>PMD.AvoidUsingSql</code> Case 1. SQL statements with subqueries.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static String composeRoomTransRestriction(final String buildingId, final String floorId) {
        final String table = RMPCT_TABLE;
        String restriction = ServiceUtilities.composeFieldRestriction("", table, BL_ID, buildingId);
        
        restriction = ServiceUtilities.composeFieldRestriction(restriction, table, FL_ID, floorId);
        
        restriction =
                ServiceUtilities.composeFieldRestriction(restriction, table, STATUS,
                    STATUS_APPROVED_VALUE);
        
        // (rmpct.date_start IS NULL OR rmpct.date_start <= <current date>)
        restriction =
                restriction + SQL_AND + START_PARENTHESIS + table + SQL_DOT + DATE_START
                        + SQL_IS_NULL + SQL_OR + table + SQL_DOT + DATE_START + "<="
                        + SqlUtils.formatValueForSql(Utility.currentDate()) + END_PARENTHESIS;
        
        // (rmpct.date_end IS NULL OR rmpct.date_end >= <current date>)
        final String dateEndRestriction =
                START_PARENTHESIS + table + SQL_DOT + DATE_END + SQL_IS_NULL + SQL_OR + table
                        + SQL_DOT + DATE_END + ">="
                        + SqlUtils.formatValueForSql(Utility.currentDate()) + END_PARENTHESIS;
        
        restriction = restriction + SQL_AND + dateEndRestriction;
        
        // *activity_log_id IS NULL OR activity_log_id NOT IN (SELECT activity_log_id FROM
        // activity_log WHERE activity_type =
        // 'SERVICE DESK - HOTELING'))
        final String excludeHoteling =
                "( " + table + SQL_DOT + ACTIVITY_LOG_ID + SQL_IS_NULL + SQL_OR + table + SQL_DOT
                        + ACTIVITY_LOG_ID + " NOT IN (SELECT " + ACTIVITY_LOG_ID + " FROM "
                        + ACTIVITY_LOG_TABLE + " WHERE " + ACTIVITY_TYPE + " = '"
                        + SERVICE_DESK_HOTELING_VALUE + "'))";
        
        restriction = restriction + SQL_AND + excludeHoteling;
        
        return restriction;
    }
    
    /**
     * Composes a restriction based on bl_id, fl_id, rm and primary_rm for active records of rmpct
     * table. Active records are: rmpct.date_start <= current date < rmpct.date_end) or
     * (rmpct.date_start <= current date and rmpct.date_end is null).
     * 
     * @param buildingId bl_id value
     * @param floorId fl_id value
     * @param roomId rm_id value
     * @return a restriction string
     */
    public static String composeRoomTransRestriction(final String buildingId, final String floorId,
            final String roomId) {
        final String table = RMPCT_TABLE;
        String restriction = composeRoomTransRestriction(buildingId, floorId);
        
        restriction = ServiceUtilities.composeFieldRestriction(restriction, table, RM_ID, roomId);
        
        restriction = ServiceUtilities.composeFieldRestriction(restriction, table, PRIMARY_RM, "1");
        
        return restriction;
    }
    
    /**
     * Composes a restriction based on bl_id, fl_id, rm_id, em_id, dv_id, dp_id from rmpct tacble
     * where rmpct.date_start <= current date < rmpct.date_end) or (rmpct.date_start <= current date
     * and rmpct.date_end is null).
     * 
     * @param blId bl_id value
     * @param flId fl_id value
     * @param rmId rm_id value
     * @param emId em_id value
     * @param dvId dv_id value
     * @param dpId dp_id value
     * @return a restriction string
     */
    public static String composeRoomTransRestriction(final String blId, final String flId,
            final String rmId, final String emId, final String dvId, final String dpId) {
        final String table = RMPCT_TABLE;
        String restriction = composeRoomTransRestriction(blId, flId);
        
        restriction = ServiceUtilities.composeFieldRestriction(restriction, table, RM_ID, rmId);
        
        restriction = ServiceUtilities.composeFieldRestriction(restriction, table, EM_ID, emId);
        
        restriction = ServiceUtilities.composeFieldRestriction(restriction, table, DV_ID, dvId);
        
        restriction = ServiceUtilities.composeFieldRestriction(restriction, table, DP_ID, dpId);
        
        // ((rmpct.date_end > current date) OR (rmpct.date_end is null))
        final String dateEndRestriction =
                "(( " + table + SQL_DOT + DATE_END + " > "
                        + SqlUtils.formatValueForSql(Utility.currentDate()) + " ) " + SQL_OR
                        + " ( " + table + SQL_DOT + DATE_END + SQL_IS_NULL + " ))";
        
        restriction = restriction + SQL_AND + dateEndRestriction;
        
        return restriction;
    }
    
    /**
     * Obtain String restriction from roomRecord for given table.
     * 
     * @param tableName table name
     * @param roomRecord record
     * @return ParsedRestrictionDef object
     */
    public static ParsedRestrictionDef obtainRoomRecordRestriction(final String tableName,
            final DataRecord roomRecord) {
        final String buildingId = roomRecord.getString(SURVEY_RM_SYNC_TABLE + SQL_DOT + BL_ID);
        final String floorId = roomRecord.getString(SURVEY_RM_SYNC_TABLE + SQL_DOT + FL_ID);
        final String roomId = roomRecord.getString(SURVEY_RM_SYNC_TABLE + SQL_DOT + RM_ID);
        
        final ParsedRestrictionDef roomRestriction =
                composeRoomRestriction(RM_TABLE, buildingId, floorId, roomId);
        
        return roomRestriction;
    }
}
