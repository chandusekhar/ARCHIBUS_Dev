package com.archibus.service.space.mobile.impl;

import static com.archibus.app.common.mobile.space.DataSourceUtilities.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.ServiceConstants.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.*;

import java.util.*;

import org.apache.cxf.common.util.StringUtils;

import com.archibus.app.common.mobile.space.RestrictionUtilities;
import com.archibus.app.common.mobile.util.DocumentsUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.service.space.SpaceConstants;
import com.archibus.utility.*;

/**
 * Utility class. Provides methods related with data sources for space occupancy mobile services.
 * <p>
 * Suppress PMD warning "AvoidUsingSql" in this method.
 * <p>
 * Justification: Case #2: Statement with INSERT ... SELECT pattern.
 *
 * @author Ana Paduraru, updated for 21.3
 * @since 21.2
 *
 */
@SuppressWarnings("PMD.AvoidUsingSql")
final class DataSourceUtilities {

    /**
     * Correct total of space percentages for each room: 100.
     */
    static final double TOTAL_PCT_SPACE_CORRECT_VALUE = 100;

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
     * Constant "<>".
     */
    private static final String NOT_EQUAL = "<>";

    /**
     * Constant "MID%".
     */
    private static final String LIKE_MOBILE_ID = "MID%";
    
    /**
     * Hide default constructor - should never be instantiated.
     */
    private DataSourceUtilities() {
    }

    /**
     * If workspace transactions are enabled copies active records from rmpct into rmpctmob_sync
     * table for the specified bl_id and fl_id. Copies all common fields between the two tables.
     * Sets the rmpctmob_sync.survey_id and rmpctmob_sync.mob_locked_by to the given values for each
     * room.
     *
     * @param surveyId survey code
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param buildingId building code
     * @param floorId floor code
     */
    static void copyRoomTransToSyncTable(final String surveyId, final String userName,
            final String buildingId, final String floorId) {
        DataSourceFactory.createDataSourceForFields(RMPCT_MOB_SYNC_TABLE, RMPCT_MOB_SYNC_FIELDS);
        final DataSource roomTransDatasource =
                DataSourceFactory.createDataSourceForFields(RMPCT_TABLE, RMPCT_FIELDS);
        roomTransDatasource.setContext();
        roomTransDatasource.setMaxRecords(0);

        final String roomTransRestriction =
                RestrictionUtilities.composeRoomTransRestriction(buildingId, floorId);

        String fieldList = Arrays.toString(RMPCT_FIELDS);
        fieldList = fieldList.replace(START_BRACKET, "").replace(END_BRACKET, "");

        /*
         * INSERT INTO rmpctmob_sync(pct_id, bl_id, fl_id, rm_id, dv_id, dp_id, em_id, status,
         * date_start, date_end, primary_em, primary_rm, pct_space, rm_cat, rm_type,
         * activity_log_id,survey_id,mob_locked_by) SELECT pct_id, bl_id, fl_id, rm_id, dv_id,
         * dp_id, em_id, status, date_start, date_end, primary_em, primary_rm, pct_space, rm_cat,
         * rm_type, activity_log_id,'<survey_id>','TRAM' FROM rmpct WHERE rmpct.bl_id='HQ' AND
         * rmpct.fl_id='19' AND rmpct.status='1' AND (rmpct.date_start IS NULL OR rmpct.date_start
         * <= <current date>) AND (rmpct.date_end IS NULL OR rmpct.date_end >= <current date>) AND (
         * rmpct.activity_log_id IS NULL OR rmpct.activity_log_id NOT IN (SELECT activity_log_id
         * FROM activity_log WHERE activity_type = 'SERVICE DESK - HOTELING'))
         */
        final String sql =
                SQL_INSERT_INTO + RMPCT_MOB_SYNC_TABLE + START_PARENTHESIS + fieldList + SQL_COMMA
                + SURVEY_ID + SQL_COMMA + MOB_LOCKED_BY + END_PARENTHESIS + EMPTY_STRING
                + SQL_SELECT + fieldList + SQL_COMMA + SqlUtils.formatValueForSql(surveyId)
                + SQL_COMMA + SqlUtils.formatValueForSql(userName) + SQL_FROM + RMPCT_TABLE
                + SQL_WHERE + roomTransRestriction;

        SqlUtils.executeUpdate(RMPCT_MOB_SYNC_TABLE, sql);
    }

    /**
     * Copies all em records from em table to mobile sync table (em_sync). Copies all common fields
     * between the two tables. Sets the rmpctmob_sync.mob_locked_by to the given value for each em.
     *
     * @param emSyncDatasource mobile sync employee datasource with all common fields.
     * @param surveyId survey code
     * @param userName the mobile user name validated from afm_users.user_name table
     * @return Concatenated list of em_id values for which documents could not be copied.
     */
    static String copyEmToSyncTable(final DataSource emSyncDatasource, final String surveyId,
            final String userName) {
        String fieldList = Arrays.toString(EM_FIELDS);
        fieldList = fieldList.replace(START_BRACKET, "").replace(END_BRACKET, "");

        // INSERT INTO em_sync(em_id, email, bl_id, fl_id, rm_id, phone, name_last, name_first,
        // dv_id, dp_id,survey_id,mob_locked_by)
        // SELECT em_id, email, bl_id, fl_id, rm_id, phone, name_last, name_first, dv_id,
        // dp_id,'<surveyId>','<userName>' FROM em
        final String sql =
                SQL_INSERT_INTO + EM_SYNC_TABLE + START_PARENTHESIS + fieldList + SQL_COMMA
                + SURVEY_ID + SQL_COMMA + MOB_LOCKED_BY + END_PARENTHESIS + EMPTY_STRING
                + SQL_SELECT + fieldList + SQL_COMMA + SqlUtils.formatValueForSql(surveyId)
                + SQL_COMMA + SqlUtils.formatValueForSql(userName) + SQL_FROM + EM_TABLE;

        SqlUtils.executeUpdate(EM_SYNC_TABLE, sql);

        return copyEmPhotosIntoEmSyncRecords(emSyncDatasource, surveyId);
    }

    /**
     * Copy em_photo from em records into em_sync records.
     *
     * @param emSyncDatasource mobile sync datasource with all common fields.
     * @param surveyId survey code
     * @return String of em_id values if an error occurred during document copy process
     */
    static String copyEmPhotosIntoEmSyncRecords(final DataSource emSyncDatasource,
            final String surveyId) {
        final DataSource emDatasource =
                DataSourceFactory.createDataSourceForFields(EM_TABLE, EM_FIELDS);
        emDatasource.setContext();
        emDatasource.setMaxRecords(0);
        final StringBuffer emIds = new StringBuffer();

        String emId;
        ParsedRestrictionDef emSyncRestriction;
        DataRecord emSyncRecord;

        final ParsedRestrictionDef emRestriction = new ParsedRestrictionDef();
        emRestriction.addClause(EM_TABLE, EM_PHOTO, null, Operation.IS_NOT_NULL);

        final List<DataRecord> emRecords = emDatasource.getRecords(emRestriction);
        for (final DataRecord emRecord : emRecords) {
            emId = emRecord.getString(EM_TABLE + SpaceConstants.DOT + EM_ID);

            emSyncRestriction = RestrictionUtilities.composeEmSyncRestriction(surveyId, emId);
            emSyncRecord = emSyncDatasource.getRecords(emSyncRestriction).get(0);

            try {
                DocumentsUtilities.copyDocuments(new String[] { EM_PHOTO }, emRecord, emSyncRecord);
            } catch (final ExceptionBase e) {
                if (emIds.length() > 0) {
                    emIds.append("; ");
                }
                emIds.append(emId);
            }
        }
        return emIds.toString();
    }

    /**
     * Copies rooms sync records to room table.
     *
     * For each record in the surveyrm_sync table that is assigned to surveymob_sync.survey_id
     * value: If the record exists in the rm table, update it by updating the non-pkey fields.
     * Otherwise insert it.
     *
     * @param surveyId survey code
     */
    static void copySyncRecordToRoomTable(final String surveyId) {
        final String[] pkFields =
            { SpaceConstants.BL_ID, SpaceConstants.FL_ID, SpaceConstants.RM_ID };

        final List<DataRecord> roomSyncRecords = getRoomSyncRecordsForSurvey(surveyId);

        final DataSource roomDatasource =
                DataSourceFactory.createDataSourceForFields(RM_TABLE, SPACE_OCCUP_ROOM_FIELDS);

        // loop through all the room sync records
        for (final DataRecord roomSyncRecord : roomSyncRecords) {
            final ParsedRestrictionDef roomRestriction =
                    RestrictionUtilities.obtainRoomRecordRestriction(RM_TABLE, roomSyncRecord);

            final List<DataRecord> roomRecords = roomDatasource.getRecords(roomRestriction);

            DataRecord roomRecord;
            // If the record does not exist in the rm table, create a new final record with the
            // specified pks.
            if (roomRecords.isEmpty()) {
                // new record, does not final exist in the final room table
                roomRecord = roomDatasource.createNewRecord();

                for (final String fieldName : pkFields) {
                    importFieldValue(SURVEY_RM_SYNC_TABLE, roomSyncRecord, RM_TABLE, roomRecord,
                        fieldName);
                }
            } else {
                roomRecord = roomRecords.get(0);
            }

            // set all non-pk fields values
            for (final String fieldName : SPACE_OCCUP_ROOM_FIELDS) {
                if (!BL_ID.equals(fieldName) && !FL_ID.equals(fieldName)
                        && !RM_ID.equals(fieldName)) {
                    importFieldValue(SURVEY_RM_SYNC_TABLE, roomSyncRecord, RM_TABLE, roomRecord,
                        fieldName);
                }
            }

            // save the record
            roomDatasource.saveRecord(roomRecord);

            DocumentsUtilities.copyDocuments(new String[] { SURVEY_PHOTO, SURVEY_REDLINE_RM },
                roomSyncRecord, roomRecord);

        }
    }

    /**
     * Copies employee sync records to employee table.
     *
     * For each record in the em_sync table for the current survey: If the record exists in the em
     * table, update it by updating the non-pkey fields listed above. Otherwise insert it.
     *
     * @param surveyId surveyCode
     */
    static void copySyncRecordToEmployeeTable(final String surveyId) {

        final DataSource emSyncDatasource = DataSourceFactory.createDataSource();
        emSyncDatasource.addTable(EM_SYNC_TABLE, DataSource.ROLE_MAIN);
        emSyncDatasource.addTable(EM_TABLE, DataSource.ROLE_STANDARD);
        emSyncDatasource.addField(EM_SYNC_TABLE, EM_SYNC_FIELDS);
        emSyncDatasource.addField(EM_TABLE, EM_FIELDS);

        emSyncDatasource.setContext();
        emSyncDatasource.setMaxRecords(0);

        String sqlSubRestriction = "";
        for (final String fieldName : EM_FIELDS) {
            if (fieldName != EM_ID) {
                // em_sync.email<>em.email OR em_sync.email IS NOT NULL AND em.email IS NULL OR
                // em_sync.email IS NULL AND em.email IS NOT NULL OR
                sqlSubRestriction +=
                        EM_SYNC_TABLE + SpaceConstants.DOT + fieldName + NOT_EQUAL + EM_TABLE
                        + SpaceConstants.DOT + fieldName + SQL_OR + EM_SYNC_TABLE
                        + SpaceConstants.DOT + fieldName + SQL_IS_NOT_NULL + SQL_AND
                        + EM_TABLE + SpaceConstants.DOT + fieldName + SQL_IS_NULL + SQL_OR
                        + EM_SYNC_TABLE + SpaceConstants.DOT + fieldName + SQL_IS_NULL
                        + SQL_AND + EM_TABLE + SpaceConstants.DOT + fieldName
                        + SQL_IS_NOT_NULL + SQL_OR;
            }
        }
        // remove the last " OR "
        sqlSubRestriction =
                sqlSubRestriction.substring(0, sqlSubRestriction.length() - SQL_OR.length());

        String sqlRestriction =
                EM_SYNC_TABLE + SpaceConstants.DOT + SURVEY_ID + EQUAL
                + SqlUtils.formatValueForSql(surveyId);
        if (!StringUtils.isEmpty(sqlSubRestriction)) {
            sqlRestriction += SQL_AND + START_PARENTHESIS + sqlSubRestriction + END_PARENTHESIS;
        }

        final List<DataRecord> emSyncRecords = emSyncDatasource.getRecords(sqlRestriction);

        final DataSource emDatasource =
                DataSourceFactory.createDataSourceForFields(EM_TABLE, EM_FIELDS);
        String emId;
        List<DataRecord> emRecords;
        DataRecord emRecord;

        // loop through all changed employee sync records and update em records
        for (final DataRecord emSyncRecord : emSyncRecords) {
            final ParsedRestrictionDef emRestriction = new ParsedRestrictionDef();
            emId = emSyncRecord.getString(EM_SYNC_TABLE + SpaceConstants.DOT + EM_ID);
            emRestriction.addClause(EM_TABLE, EM_ID, emId, Operation.EQUALS);

            emRecords = emDatasource.getRecords(emRestriction);

            if (emRecords.isEmpty()) {
                emRecord = emDatasource.createNewRecord();

                // set all field values
                for (final String fieldName : EM_FIELDS) {
                    importFieldValue(EM_SYNC_TABLE, emSyncRecord, EM_TABLE, emRecord, fieldName);
                }

            } else {
                emRecord = emRecords.get(0);

                // set all field values
                for (final String fieldName : EM_FIELDS) {
                    if (!EM_ID.equals(fieldName)) {
                        importFieldValue(EM_SYNC_TABLE, emSyncRecord, EM_TABLE, emRecord, fieldName);
                    }
                }
            }

            // save the record
            emDatasource.saveRecord(emRecord);
        }

    }

    /**
     * Copies rmpct sync records to rmpct table.
     *
     * For each record in the rmpctmob_sync table for the current survey: update it if the record
     * exists in the rmpct table, otherwise insert it.
     *
     * @param surveyId survey code
     */
    static void copySyncRecordsToRmpctTable(final String surveyId) {
        final DataSource rmpctSyncDatasource =
                DataSourceFactory.createDataSourceForFields(RMPCT_MOB_SYNC_TABLE,
                    RMPCT_MOB_SYNC_FIELDS);
        rmpctSyncDatasource.setContext();
        rmpctSyncDatasource.setMaxRecords(0);

        final ParsedRestrictionDef rmpctSyncRestriction = new ParsedRestrictionDef();
        rmpctSyncRestriction.addClause(RMPCT_MOB_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        rmpctSyncRestriction.addClause(RMPCT_MOB_SYNC_TABLE, PCT_ID, LIKE_MOBILE_ID,
            Operation.NOT_LIKE);
        final List<DataRecord> rmpctSyncRecords =
                rmpctSyncDatasource.getRecords(rmpctSyncRestriction);

        final DataSource rmpctDatasource =
                DataSourceFactory.createDataSourceForFields(RMPCT_TABLE, RMPCT_FIELDS);

        // loop through all the rmpct sync records that existed before survey
        for (final DataRecord rmpctSyncRecord : rmpctSyncRecords) {
            final String[] updatedFields = getUpdateFieldsList(rmpctSyncRecord);

            final ParsedRestrictionDef rmpctRestriction = new ParsedRestrictionDef();
            rmpctRestriction.addClause(RMPCT_TABLE, PCT_ID,
                rmpctSyncRecord.getValue(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + PCT_ID),
                Operation.EQUALS);

            final List<DataRecord> rmpctRecords = rmpctDatasource.getRecords(rmpctRestriction);

            DataRecord rmpctRecord;
            // If the record does not exist in the rm table, create a new final record with the
            // specified pks.
            rmpctRecord = rmpctRecords.get(0);

            // set all non-pk fields values
            for (final String fieldName : updatedFields) {
                if (!PCT_ID.equals(fieldName)) {
                    importFieldValue(RMPCT_MOB_SYNC_TABLE, rmpctSyncRecord, RMPCT_TABLE,
                        rmpctRecord, fieldName);
                }
            }

            // save the record
            rmpctDatasource.saveRecord(rmpctRecord);

        }

        insertNewRmpctRecords(surveyId);

    }
    
    /**
     * Calculate the list of fields to be updated based on value primary_rm and rpiemary_em field
     * values.
     *
     * @param rmpctSyncRecord sync record
     * @return array of field names
     */
    private static String[] getUpdateFieldsList(final DataRecord rmpctSyncRecord) {
        final int primaryEm =
                rmpctSyncRecord.getInt(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + PRIMARY_EM);
        final int primaryRm =
                rmpctSyncRecord.getInt(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT + PRIMARY_RM);
        
        // If primary_em is 1 and primary_rm is 1, then update pct_space
        String[] updatedFields = { PCT_SPACE };

        if (primaryRm == 0 && primaryEm == 0) {
            // If both primary values are 0, then update all fields in the record
            updatedFields = RMPCT_FIELDS;
        } else if (primaryRm == 1 && primaryEm == 0) {
            // If the rm is 1 and em is 0, then update em_id & pct_space
            final String[] tempArray = { EM_ID, PCT_SPACE };
            updatedFields = tempArray;
        } else if (primaryRm == 0 && primaryEm == 1) {
            // If primary_em is 1 and primary_rm is 0, then update dv_id, dp_id, rm_cat,
            // rm_type, pct_space
            final String[] tempArray = { DV_ID, DP_ID, RM_CAT, RM_TYPE, PCT_SPACE };
            updatedFields = tempArray;
        }
        return updatedFields;
    }

    /**
     *
     * Add rmpct records created during survey.
     *
     * @param surveyId survey code
     */
    static void insertNewRmpctRecords(final String surveyId) {
        final DataSource rmpctSyncDatasource =
                DataSourceFactory.createDataSourceForFields(RMPCT_MOB_SYNC_TABLE,
                    RMPCT_MOB_SYNC_FIELDS);
        rmpctSyncDatasource.setContext();
        rmpctSyncDatasource.setMaxRecords(0);

        final ParsedRestrictionDef rmpctSyncRestriction = new ParsedRestrictionDef();
        rmpctSyncRestriction.addClause(RMPCT_MOB_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        rmpctSyncRestriction
        .addClause(RMPCT_MOB_SYNC_TABLE, PCT_ID, LIKE_MOBILE_ID, Operation.LIKE);
        final List<DataRecord> rmpctSyncRecords =
                rmpctSyncDatasource.getRecords(rmpctSyncRestriction);

        DataRecord rmpctRecord;
        final DataSource rmpctDatasource =
                DataSourceFactory.createDataSourceForFields(RMPCT_TABLE, RMPCT_FIELDS);

        // loop through all the rmpct sync records
        for (final DataRecord rmpctSyncRecord : rmpctSyncRecords) {
            rmpctRecord = rmpctDatasource.createNewRecord();

            if (rmpctRecord != null) {
                // set all non-pk fields values for

                for (final String fieldName : RMPCT_FIELDS) {
                    if (!PCT_ID.equals(fieldName)) {
                        importFieldValue(RMPCT_MOB_SYNC_TABLE, rmpctSyncRecord, RMPCT_TABLE,
                            rmpctRecord, fieldName);
                    }
                }

                // save the record
                rmpctDatasource.saveRecord(rmpctRecord);
            }
        }
    }

    /**
     * Check if total of space percentage is 100 for each room. Allow close survey even though the
     * records do not add up to exactly 100%, but display a message on the client side.
     *
     * @param surveyId the survey code
     * @return boolean flag if all percentage totals are 100 or not
     */
    static boolean arePercentageValueTotalsCorrect(final String surveyId) {
        final List<DataRecord> roomSyncRecords = getRoomSyncRecordsForSurvey(surveyId);

        double total;
        String blId;
        String flId;
        String rmId;
        ParsedRestrictionDef rmpctMobSyncRestriction;
        List<DataRecord> rmpctMobSyncRecords;
        boolean areCorrect = true;

        final DataSource rmpctMobSyncDatasource =
                DataSourceFactory.createDataSourceForFields(RMPCT_MOB_SYNC_TABLE,
                    RMPCT_MOB_SYNC_FIELDS);
        rmpctMobSyncDatasource.setContext();
        rmpctMobSyncDatasource.setMaxRecords(0);

        // for each room calculate the total percentage
        for (final DataRecord roomSyncRecord : roomSyncRecords) {
            total = 0;

            blId = roomSyncRecord.getString(SURVEY_RM_SYNC_TABLE + SpaceConstants.DOT + BL_ID);
            flId = roomSyncRecord.getString(SURVEY_RM_SYNC_TABLE + SpaceConstants.DOT + FL_ID);
            rmId = roomSyncRecord.getString(SURVEY_RM_SYNC_TABLE + SpaceConstants.DOT + RM_ID);
            rmpctMobSyncRestriction =
                    RestrictionUtilities.composeRoomSurveyRestriction(RMPCT_MOB_SYNC_TABLE,
                        surveyId, blId, flId, rmId);
            rmpctMobSyncRecords = rmpctMobSyncDatasource.getRecords(rmpctMobSyncRestriction);
            total = 0;
            for (final DataRecord rmpctMobSyncRecord : rmpctMobSyncRecords) {
                total +=
                        rmpctMobSyncRecord.getDouble(RMPCT_MOB_SYNC_TABLE + SpaceConstants.DOT
                            + PCT_SPACE);
            }

            // if total percentage is not 100 return flag for displaying message on the client side
            if (total != TOTAL_PCT_SPACE_CORRECT_VALUE) {
                areCorrect = false;
                break;
            }
        }

        return areCorrect;

    }

    /**
     * Delete all record for current survey from tables: surveyrm_sync, em_sync, rmpctmob_sync and
     * surveymob_sync.
     *
     * @param surveyId survey code
     */
    static void clearSyncTables(final String surveyId) {
        clearRoomSyncRecords(surveyId, "", "");

        clearEmSyncRecords(surveyId);

        clearRoomTransSyncRecords(surveyId, "", "");

        final String sql =
                SQL_DELETE_FROM + SURVEY_MOB_SYNC_TABLE + SQL_WHERE + SURVEY_ID + EQUAL
                + SqlUtils.formatValueForSql(surveyId);
        SqlUtils.executeUpdate(SURVEY_MOB_SYNC_TABLE, sql);
    }

    /**
     * Obtain the list of surveyrm_sync records for current survey.
     *
     * @param surveyId survey code
     * @return list of surveyrm_sync records
     */
    static List<DataRecord> getRoomSyncRecordsForSurvey(final String surveyId) {
        // search for the records in the surveyrm_sync table for the current survey.
        final DataSource roomSyncDatasource =
                DataSourceFactory.createDataSourceForFields(SURVEY_RM_SYNC_TABLE,
                    SPACE_OCCUP_ROOM_SURVEY_SYNC_FIELDS);
        roomSyncDatasource.setContext();
        roomSyncDatasource.setMaxRecords(0);

        final ParsedRestrictionDef roomSyncRestriction = new ParsedRestrictionDef();
        roomSyncRestriction.addClause(SURVEY_RM_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> roomSyncRecords = roomSyncDatasource.getRecords(roomSyncRestriction);

        return roomSyncRecords;
    }

    /**
     * Verify is survey sync record exists in table syrveymob_sync for given survey id.
     *
     * @param surveyId survey id
     * @return true if records exists
     */
    static boolean existSurveyMobSyncRecord(final String surveyId) {
        // check if there is any existing record in surveymob_sync table
        final DataSource surveySyncDataSource =
                DataSourceFactory.createDataSourceForFields(SURVEY_MOB_SYNC_TABLE,
                    SURVEY_SYNC_FIELDS);

        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(SURVEY_MOB_SYNC_TABLE, SURVEY_ID, surveyId, Operation.EQUALS);
        final List<DataRecord> surveySyncRecords = surveySyncDataSource.getRecords(restriction);

        // if there are records exists in surveymob_sync table return true
        return StringUtil.notNullOrEmpty(surveyId) && surveySyncRecords != null
                && !surveySyncRecords.isEmpty();
    }

}
