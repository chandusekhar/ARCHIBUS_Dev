package com.archibus.eventhandler.eam.survey.mobile;

import java.sql.Date;

/**
 * API of the Asset Management Workflow Rule Service for mobile asset survey application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbAssetManagement-AssetMobileService'.
 * <p>
 * Provides methods for synchronization between sync tables (survey, eq_audit) and inventory tables
 * (eq).
 * <p>
 * Invoked by web client or mobile client.
 * 
 * @author Ying Qin
 * @since 21.1
 */
public interface IAssetMobileService {
    
    /**
     * Creates a new equipment survey in survey table.
     * 
     * @param surveyId survey code
     * @param surveyDate date of the survey
     * @param performedBy employee that the survey will be performed by
     * @param description description of the new survey
     * @return user name from afm_users table that matches the em_id
     */
    String createSurvey(final String surveyId, final Date surveyDate, final String performedBy,
            final String description);
    
    /**
     * Searches for all the equipment records and import them into the equipment audit table. set
     * the survey code and performed by values.
     * 
     * @param surveyId survey code
     * @param buildingId building code for equipment
     * @param floorId floor code for equipment
     * @param divisionId division code for equipment
     * @param departmentId department code for equipment
     * @param userName the user name that the survey will be performed by
     * @param equipmentStandard equipment standard
     * @return number of records added to the eq_audit table
     */
    long importEquipmentToSurvey(final String surveyId, final String buildingId,
            final String floorId, final String divisionId, final String departmentId,
            final String userName, final String equipmentStandard);
    
    /**
     * Searches for all equipment audit records with the specified survey code and updates its
     * values for the selected fields.
     * 
     * @param surveyId survey code
     */
    void updateEquipmentToSurvey(final String surveyId);
    
    /**
     * Imports survey records into the equipment table.
     * 
     * 1.
     * <p>
     * 2. Creates new Equipment (eq) table records for all new Equipment Survey Audit records
     * (eq_audit).
     * <p>
     * 3. Updates the existing Equipment records for changed Equipment Survey Audit records.
     * <p>
     * 4. If the Marked for Deletion? field is active (per the task above), then this action deletes
     * all items that are Marked for Deletion (eq_audit.marked_for_deletion) from the Equipment
     * table. If the field is not active, this action does not delete any records.
     * <p>
     * 5. When the action copies the Equipment Status field, the status will still reflect the
     * Equipment item's disposition (e.g. In Service, Out of Service, In Repair, Salvaged, Sold).
     * 
     * 
     * @param surveyId the survey code of all the survey records.
     */
    void exportSurveyToEquipment(final String surveyId);
    
    /**
     * Update the existing eq_audit record with the specified performedBy value.
     * 
     * @param surveyId survey code
     * @param surveyDate date of the survey
     * @param performedBy employee that the survey will be performed by
     * @param description description of the survey
     * @param status survey status
     */
    void updateSurvey(final String surveyId, final Date surveyDate, final String performedBy,
            final String description, final String status);
    
    /**
     * Close the specified survey.
     * <p>
     * 1. Sets the Survey Project Status (survey.status) value to "Audit Completed".
     * <p>
     * 2. Transfer records from eq_audit table to eq table related with the survey.
     * 
     * @param surveyId the survey code
     */
    void closeSurvey(final String surveyId);
    
    /**
     * Deletes the Survey Project and all equipment audit task (eq_audit) records assigned to that
     * project.
     * 
     * @param surveyId the survey code
     */
    void deleteSurvey(final String surveyId);
    
    /**
     * Sets the survey.status to Completed and sets all eq_audit.mob_locked_by field values for this
     * survey to NULL.
     * 
     * @param surveyId the survey code
     */
    void markSurveyCompleted(final String surveyId);
    
    /**
     * Deletes the survey audit task (eq_audit) record.
     * 
     * @param surveyId the survey code
     * @param eqId the equipment code
     */
    void deleteSurveyTask(final String surveyId, final String eqId);
}
