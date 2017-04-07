package com.archibus.service.space.mobile;

import java.util.Map;

/**
 * API of the Space and Occupancy Survey service for mobile application.
 * <p>
 * Only authenticated users are allowed to invoke methods in this service.
 *
 * @author Ana Paduraru
 * @since 21.2
 */
public interface ISpaceOccupancyMobileService {
    
    /**
     * Copy rooms and rooms transactions into the rooms survey table and room transactions table:
     * <p>
     * 1. Copy rm records to the surveyrm_sync table for the specified bl_id and fl_id.
     * <p>
     * 2. Set the surveyrm_sync.survey_id to the given value for each room.
     * <p>
     * 3. Copy active records from rmpct into rmpctmob_sync table.
     *
     * @param surveyId survey code
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param buildingId building code
     * @param floorId floor code
     * @return map with: emIdsWithDocIssues - list with em_id values concatenated, for em records
     *         for which the em_photo could not be copied;
     */
    Map<String, Object> copyRmEmAndRmpctToSyncTable(final String surveyId, final String userName,
        final String buildingId, final String floorId);
    
    /**
     * Closes the current survey:
     * <p>
     * 1. For each record in the surveyrm_sync table that is assigned to surveymob_sync.survey_id
     * value: copy the room sync record into the room table. If the record doesn't exist in the rm
     * table create a new one. Update the room record's non-pkey fields. If update succeeds, delete
     * the room sync record.
     * <p>
     * 2. If all room sync records where copied and deleted then the survey sync record is also
     * deleted, else it's status is changed to completed.
     * <p>
     * 3. Call insert insertUpdateRmpctRecordsFromMoveServiceRequest and
     * insertUpdateRmpctRecordsFromDpServiceRequest WFRs to update the rmpct table
     * <p>
     *
     * @param surveyId the survey code
     * @param userName user name
     * @return map with: correctPctSpaceTotals - boolean flag, true if space percentage total for
     *         each survey room is 100;
     */
    Map<String, Object> closeSurvey(final String surveyId, final String userName);
    
}
