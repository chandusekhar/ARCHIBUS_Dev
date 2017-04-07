package com.archibus.app.space.mobile.service;

import org.json.JSONObject;

/**
 * API of the space book management survey service for mobile applications.
 * <p>
 * Only authenticated users are allowed to invoke methods in this service.
 * 
 * @author Ying Qin
 * @since 21.1
 */
public interface ISpaceMobileService {
    
    /**
     * Copies all rooms' records to mobile sync survey table:
     * <p>
     * 1. Deletes from the surveyrm_sync table any records that already exist for that survey_id,
     * bl_id, fl_id. (Typically there should be none.)
     * <p>
     * 2. Copies all rm records to the surveyrm_sync table.
     * <p>
     * 3. Copies all common fields between the two tables, namely: bl_id, fl_id, rm_id, dv_id,
     * dp_id, rm_cat, rm_std, prorate, status, rm_use, name.
     * <p>
     * 4. Sets the surveyrm_sync.survey_id to the given value for each room.
     * 
     * @param surveyId survey code
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param buildingId building code
     * @param floorId floor code
     */
    void copyRoomsToSyncTable(final String surveyId, final String userName,
            final String buildingId, final String floorId);
    
    /**
     * Closes the current survey:
     * <p>
     * 1. Returns an error (and say a -1 as the number of records that failed) if the current user
     * is not a member of the SPAC-SURVEY-POST Security Group.
     * <p>
     * 2. Marks the surveymob_sync.status as Completed.
     * <p>
     * 3. For each record in the surveyrm_sync table that is assigned to surveymob_sync.survey_id
     * value: If the record exists in the rm table, update it by updating the non-pkey fields listed
     * above. Otherwise insert it. If the update or insert succeeds, delete the record from the
     * surveyrm_sync table.
     * <p>
     * 4. Count the number of records that remain in the surveyrm_sync table for this survey_id. If
     * there are any records left, they are validation records. If there are no validation errors,
     * delete the record with this survey_id from the surveymob_sync table.
     * <p>
     * In all cases
     * <p>
     * a. resynch to update the list of items with errors on the mobile device (if the survey was
     * not completed)
     * <p>
     * b. to remove the survey record and the room survey records from the mobile device (if the
     * survey completed completed).
     * <p>
     * If there are any, they are validation errors: Return an error (and ideally the number of
     * records in this survey that failed) Otherwise Return success.
     * 
     * @param surveyId the survey code
     * @return JSONObject with number of security or validated errors and the security error
     *         message, if any.
     */
    JSONObject closeSurveyTable(final String surveyId);
    
    /**
     * Deletes the survey record from surveymob_sync table and all associated room survey records
     * from surveyrm_sync table.
     * 
     * @param surveyId the survey code
     */
    void deleteSurvey(final String surveyId);
    
}
