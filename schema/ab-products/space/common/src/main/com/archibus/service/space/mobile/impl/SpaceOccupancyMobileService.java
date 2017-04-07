package com.archibus.service.space.mobile.impl;

import static com.archibus.app.common.mobile.space.DataSourceUtilities.*;
import static com.archibus.app.common.mobile.util.FieldNameConstantsCommon.*;
import static com.archibus.app.common.mobile.util.TableNameConstants.EM_SYNC_TABLE;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.service.space.Configuration;
import com.archibus.service.space.mobile.ISpaceOccupancyMobileService;

/**
 *
 * Implementation of the Space and Occupancy Mobile Management Workflow Rule Service.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as
 * 'AbSpaceRoomInventoryBAR-SpaceOccupancyMobileService'.
 * <p>
 * Provides methods for synchronize and close space book survey and business logic for space book
 * survey.
 * <p>
 * Invoked by web or mobile client.
 *
 * @author Ana Paduraru
 * @since 21.2, updated for 21.3
 *
 */
public class SpaceOccupancyMobileService implements ISpaceOccupancyMobileService {

    /** {@inheritDoc} */
    @Override
    public Map<String, Object> copyRmEmAndRmpctToSyncTable(final String surveyId,
            final String userName, final String buildingId, final String floorId) {

        // Copy rm records to the surveyrm_sync table for the specified bl_id and fl_id
        // and set the surveyrm_sync.survey_id to the given value for each room.
        copyRoomsToSyncTable(surveyId, userName, buildingId, floorId);

        // Copy employees from em into em_sync table
        final Map<String, Object> result = copyEmployeesToSyncTable(surveyId, userName);

        // Copy active records from rmpct into rmpctmob_sync table.
        if (isWorkspaceTransactionsEnbled()) {
            copyRoomTransToSyncTable(surveyId, userName, buildingId, floorId);
        }

        return result;
    }

    /**
     * Verifies if survey sync record exists and then removes any existing room records for the
     * current survey. After that, copies records from rm table into surveyrm_sync table.
     *
     * @param surveyId survey id
     * @param userName user name used for mob_locked_by field
     * @param buildingId bl_id
     * @param floorId fl_id
     */
    public void copyRoomsToSyncTable(final String surveyId, final String userName,
            final String buildingId, final String floorId) {

        // if there are records exists in surveymob_sync table
        if (DataSourceUtilities.existSurveyMobSyncRecord(surveyId)) {

            // remove the room sync records from surveyrm_sync table
            clearRoomSyncRecords(surveyId, buildingId, floorId);

            // copy the records from room table to the room sync (surveyrm_sync) table
            copyRoomsToSyncTableForFields(SPACE_OCCUP_ROOM_FIELDS, surveyId, userName, buildingId,
                floorId);
        }
    }

    /**
     * Verifies if survey sync record exists and then removes any existing workspace transaction
     * records for the current survey. After that, copies records from rmpct table into
     * rmpctmob_sync table.
     *
     * @param surveyId survey id
     * @param userName user name used for mob_locked_by field
     * @param buildingId bl_id
     * @param floorId fl_id
     */
    public void copyRoomTransToSyncTable(final String surveyId, final String userName,
            final String buildingId, final String floorId) {

        // if there are records exists in surveymob_sync table
        if (DataSourceUtilities.existSurveyMobSyncRecord(surveyId)) {
            // remove the room sync records from rmpctmob_sync table
            clearRoomTransSyncRecords(surveyId, buildingId, floorId);

            // copy the record from workspace transaction (rmpct) table to the workspace transaction
            // sync (rmpctmob_sync) table
            DataSourceUtilities.copyRoomTransToSyncTable(surveyId, userName, buildingId, floorId);
        }
    }

    /**
     * Copy all records from em table into em_sync table.
     *
     * @param surveyId survey id
     * @param userName user name used for mob_locked_by field
     * @return map with: emIdsWithDocIssues - list with em_id values concatenated, for em records
     *         for which the em_photo could not be copied;
     */
    protected Map<String, Object> copyEmployeesToSyncTable(final String surveyId,
            final String userName) {
        final Map<String, Object> result = new HashMap<String, Object>();

        // if there are records exists in surveymob_sync table
        if (DataSourceUtilities.existSurveyMobSyncRecord(surveyId)) {

            final DataSource emSyncDatasource =
                    DataSourceFactory.createDataSourceForFields(EM_SYNC_TABLE, EM_SYNC_FIELDS);

            // remove the em_sync records from em_sync table
            clearEmSyncRecords(surveyId);

            // copy the record from em table to em_sync table
            final String emIds =
                    DataSourceUtilities.copyEmToSyncTable(emSyncDatasource, surveyId, userName);

            result.put("emIdsWithDocIssues", emIds);
        }

        return result;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, Object> closeSurvey(final String surveyId, final String userName) {
        final Map<String, Object> result = new HashMap<String, Object>();

        // copy room percentage sync records into room percentage record
        if (isWorkspaceTransactionsEnbled()) {
            DataSourceUtilities.copySyncRecordsToRmpctTable(surveyId);
        }

        // copy rooms sync records into room table.
        DataSourceUtilities.copySyncRecordToRoomTable(surveyId);

        // copy employees sync records into employee table.
        DataSourceUtilities.copySyncRecordToEmployeeTable(surveyId);

        if (isWorkspaceTransactionsEnbled()) {
            // Check if total of space percentage is 100 for each room.
            // Allow close survey even though the records do not add up to exactly 100%, but display
            // a message.
            final boolean correctPctSpaceTotals =
                    DataSourceUtilities.arePercentageValueTotalsCorrect(surveyId);
            result.put("correctPctSpaceTotals", correctPctSpaceTotals);
        }

        DataSourceUtilities.clearSyncTables(surveyId);

        return result;
    }

    /**
     * Verify if workspace transactions are enabled or not using the value of activity parameter
     * UseWorkspaceTransactions.
     *
     * @return true if workspace transactions are enabled, else false.
     */
    public static boolean isWorkspaceTransactionsEnbled() {
        final String useRoomTransactions = Configuration
            .getActivityParameterString("AbSpaceRoomInventoryBAR", "UseWorkspaceTransactions");
        return "1".equals(useRoomTransactions);
    }
}
