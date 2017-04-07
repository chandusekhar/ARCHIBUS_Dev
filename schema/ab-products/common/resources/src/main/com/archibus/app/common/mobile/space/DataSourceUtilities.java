package com.archibus.app.common.mobile.space;

import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Utility class. Provides methods related with data sources for space mobile apps.
 *
 * <p>
 * Suppress PMD warning "AvoidUsingSql" in this method.
 * <p>
 * Justification: Case #2.3. Statements with DELETE FROM ... pattern
 *
 * @author Ana Paduraru
 * @since 21.2
 *
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class DataSourceUtilities {
    /**
     * Constant "INSERT INTO ".
     */
    private static final String SQL_INSERT_INTO = "INSERT INTO ";
    
    /**
     * Constant "SELECT ".
     */
    private static final String SQL_SELECT = "SELECT ";
    
    /**
     * Constant " FROM ".
     */
    private static final String SQL_FROM = " FROM ";
    
    /**
     * Constant " WHERE ".
     */
    private static final String SQL_WHERE = " WHERE ";

    /**
     * Constant "DELETE FROM ".
     */
    private static final String SQL_DELETE_FROM = "DELETE FROM ";

    /**
     * Hide default constructor - should never be instantiated.
     */
    private DataSourceUtilities() {
    }

    /**
     * Deletes from the surveyrm_sync table any records that already exist for that survey_id,
     * bl_id, fl_id. (Typically there should be none.)
     *
     * @param surveyId survey code
     * @param buildingId building code
     * @param floorId floor code
     */
    public static void clearRoomSyncRecords(final String surveyId, final String buildingId,
            final String floorId) {
        String sql =
                SQL_DELETE_FROM + SURVEY_RM_SYNC_TABLE + SQL_WHERE + SURVEY_ID + EQUAL
                + SqlUtils.formatValueForSql(surveyId);
        if (!StringUtil.isNullOrEmpty(buildingId)) {
            sql += SQL_AND + BL_ID + EQUAL + SqlUtils.formatValueForSql(buildingId);
        }
        if (!StringUtil.isNullOrEmpty(floorId)) {
            sql += SQL_AND + FL_ID + EQUAL + SqlUtils.formatValueForSql(floorId);
        }
        SqlUtils.executeUpdate(SURVEY_RM_SYNC_TABLE, sql);
    }

    /**
     * Deletes from the rmpctmob_sync table any records that already exist for that survey_id,
     * bl_id, fl_id. (Typically there should be none.)
     *
     * @param surveyId survey code
     * @param buildingId building code
     * @param floorId floor code
     */
    public static void clearRoomTransSyncRecords(final String surveyId, final String buildingId,
            final String floorId) {
        String sql =
                SQL_DELETE_FROM + RMPCT_MOB_SYNC_TABLE + SQL_WHERE + SURVEY_ID + EQUAL
                + SqlUtils.formatValueForSql(surveyId);
        if (!StringUtil.isNullOrEmpty(buildingId)) {
            sql += SQL_AND + BL_ID + EQUAL + SqlUtils.formatValueForSql(buildingId);
        }
        if (!StringUtil.isNullOrEmpty(floorId)) {
            sql += SQL_AND + FL_ID + EQUAL + SqlUtils.formatValueForSql(floorId);
        }
        SqlUtils.executeUpdate(RMPCT_MOB_SYNC_TABLE, sql);
    }

    /**
     * Delete all record for current survey from table em_sync.
     *
     * @param surveyId survey code
     */
    public static void clearEmSyncRecords(final String surveyId) {
        final String sql =
                SQL_DELETE_FROM + EM_SYNC_TABLE + SQL_WHERE + SURVEY_ID + EQUAL
                + SqlUtils.formatValueForSql(surveyId);
        SqlUtils.executeUpdate(EM_SYNC_TABLE, sql);
    }

    /**
     * Copy the field value from one table to another.
     *
     * @param fromTable source table name
     * @param fromRecord source record
     * @param toTable destination table name
     * @param toRecord destination record
     * @param field the field to copy
     */
    public static void importFieldValue(final String fromTable, final DataRecord fromRecord,
            final String toTable, final DataRecord toRecord, final String field) {
        final String roomSyncField = toTable + SQL_DOT + field;
        final String roomField = fromTable + SQL_DOT + field;
        final Object roomSyncValue = toRecord.getValue(roomSyncField);
        final Object roomValue = fromRecord.getValue(roomField);
        if (StringUtil.notNullOrEmpty(roomValue)) {
            toRecord.setValue(roomSyncField, roomValue);
        } else {
            if (StringUtil.notNullOrEmpty(roomSyncValue)) {
                if (roomSyncValue instanceof String) {
                    toRecord.setValue(roomSyncField, "");
                } else {
                    toRecord.setValue(roomSyncField, null);
                }
            }
        }
    }

    /**
     * Removes all the survey mobile sync records with the specified survey id from the
     * surveymob_sync table.
     *
     * @param surveyId the survey code
     */
    public static void removeSurveyMobSync(final String surveyId) {
        final DataSource surveyMobSyncDatasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_MOB_SYNC_TABLE,
                    SURVEY_SYNC_FIELDS);
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(SURVEY_MOB_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> surveyMobSyncRecords =
                surveyMobSyncDatasource.getRecords(restriction);

        for (final DataRecord surveyMobSyncRecord : surveyMobSyncRecords) {
            surveyMobSyncDatasource.deleteRecord(surveyMobSyncRecord);
        }

    }

    /**
     * Loops through the survey mobile sync records and marks the surveymob_sync.status as
     * Completed.
     *
     * @param surveyId the survey code
     */
    public static void updateSurveyMobSyncStatus(final String surveyId) {
        final DataSource surveyMobSyncDatasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_MOB_SYNC_TABLE,
                    SURVEY_SYNC_FIELDS);
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(SURVEY_MOB_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> surveyMobSyncRecords =
                surveyMobSyncDatasource.getRecords(restriction);

        for (final DataRecord surveyMobSyncRecord : surveyMobSyncRecords) {
            surveyMobSyncRecord.setValue(SURVEY_MOB_SYNC_TABLE + SQL_DOT + STATUS, COMPLETED);
            surveyMobSyncDatasource.saveRecord(surveyMobSyncRecord);
        }
    }

    /**
     * Copies all rooms' records from rm table to mobile sync survey table (surveyrm_sync) for the
     * current building and floor. Copies all common fields between the two tables, except for photo
     * field. Sets the surveyrm_sync.survey_id and surveyrm_sync.mob_locked_by to the given values
     * for each room.
     *
     * @param fields list of field to copy from rm table
     * @param surveyId survey code
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param buildingId building code
     * @param floorId floor code
     *
     */
    public static void copyRoomsToSyncTableForFields(final String[] fields, final String surveyId,
            final String userName, final String buildingId, final String floorId) {
        
        final String[] syncTableFields = new String[fields.length + 2];
        System.arraycopy(fields, 0, syncTableFields, 0, fields.length);
        syncTableFields[fields.length] = SURVEY_ID;
        syncTableFields[fields.length + 1] = MOB_LOCKED_BY;
        
        final DataSource roomSyncDatasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_RM_SYNC_TABLE, syncTableFields);

        String fieldList = Arrays.toString(fields);
        fieldList = fieldList.replace(START_BRACKET, "").replace(END_BRACKET, "");

        // INSERT INTO surveyrm_sync(bl_id, fl_id, rm_id, rm_cat, rm_type, dv_id, dp_id, rm_std,
        // rm_use, name, cap_em, survey_comments_rm,survey_id,mob_locked_by)
        // SELECT bl_id, fl_id, rm_id, rm_cat, rm_type, dv_id, dp_id, rm_std, rm_use, name, cap_em,
        // survey_comments_rm,'<surveyId>','<userNmae>' FROM rm
        // WHERE bl_id='HQ' AND fl_id='19'
        final String sql =
                SQL_INSERT_INTO + SURVEY_RM_SYNC_TABLE + START_PARENTHESIS + fieldList + SQL_COMMA
                + SURVEY_ID + SQL_COMMA + MOB_LOCKED_BY + END_PARENTHESIS + EMPTY_STRING
                + SQL_SELECT + fieldList + SQL_COMMA + SqlUtils.formatValueForSql(surveyId)
                + SQL_COMMA + SqlUtils.formatValueForSql(userName) + SQL_FROM + RM_TABLE
                + SQL_WHERE + BL_ID + EQUAL + SqlUtils.formatValueForSql(buildingId)
                + SQL_AND + FL_ID + EQUAL + SqlUtils.formatValueForSql(floorId);

        SqlUtils.executeUpdate(SURVEY_RM_SYNC_TABLE, sql);

        copySurveyPhotosIntoSurveyRmSyncRecords(fields, roomSyncDatasource, surveyId, buildingId,
            floorId);

    }

    /**
     * Copy survey_photo from rm records into surveyrm_sync records.
     *
     * @param fields list of field to copy from rm table
     * @param roomSyncDatasource mobile sync survey datasource with all common fields.
     * @param surveyId survey code
     * @param buildingId building code
     * @param floorId floor code
     */
    static void copySurveyPhotosIntoSurveyRmSyncRecords(final String[] fields,
            final DataSource roomSyncDatasource, final String surveyId, final String buildingId,
            final String floorId) {
        final DataSource roomDatasource =
                DataSourceFactory.createDataSourceForFields(RM_TABLE, fields);
        roomDatasource.setContext();
        roomDatasource.setMaxRecords(0);

        Arrays.sort(fields);
        final boolean hasRedlineField = Arrays.binarySearch(fields, SURVEY_REDLINE_RM) >= 0;
        // (rm.bl_id = 'HQ' and rm.fl_id = '19' )and( rm.survey_photo IS NOT NULL or
        // rm.survey_redline_rm IS NOT NULL )
        final ParsedRestrictionDef roomRestriction =
                RestrictionUtilities.composeRoomRestriction(RM_TABLE, buildingId, floorId, "");

        if (hasRedlineField) {
            roomRestriction.addClause(RM_TABLE, SURVEY_PHOTO, null, Operation.IS_NOT_NULL,
                RelativeOperation.AND_BRACKET);
            roomRestriction.addClause(RM_TABLE, SURVEY_REDLINE_RM, null, Operation.IS_NOT_NULL,
                RelativeOperation.OR);
        } else {
            roomRestriction.addClause(RM_TABLE, SURVEY_PHOTO, null, Operation.IS_NOT_NULL);
        }

        final List<DataRecord> roomRecords = roomDatasource.getRecords(roomRestriction);

        String roomId;
        ParsedRestrictionDef roomSurveyRestriction;
        DataRecord roomSyncRecord;

        if (roomRecords != null && !roomRecords.isEmpty()) {
            for (final DataRecord roomRecord : roomRecords) {
                roomId = roomRecord.getString(RM_TABLE + '.' + RM_ID);
                roomSurveyRestriction =
                        RestrictionUtilities.composeRoomSurveyRestriction(SURVEY_RM_SYNC_TABLE,
                            surveyId, buildingId, floorId, roomId);
                roomSyncRecord = roomSyncDatasource.getRecords(roomSurveyRestriction).get(0);

                if (hasRedlineField) {
                    DocumentsUtilities.copyDocuments(
                        new String[] { SURVEY_PHOTO, SURVEY_REDLINE_RM }, roomRecord,
                        roomSyncRecord);
                } else {
                    DocumentsUtilities.copyDocuments(new String[] { SURVEY_PHOTO }, roomRecord,
                        roomSyncRecord);
                }

            }
        }
    }
}
