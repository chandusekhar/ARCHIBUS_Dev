package com.archibus.app.assessment.mobile.service;

/**
 * API of the Condition Assessment Workflow Rule Service for mobile Condition Assessment
 * application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbCapitalPlanningCA-AssessmentMobileService'.
 * <p>
 * Provides methods for synchronization between sync table (activity_log_sync) and inventory table
 * (activity_log)
 * <p>
 * Invoked by mobile client.
 *
 * @author Cristina Moldovan
 * @since 21.2
 */
public interface IAssessmentMobileService {
    /**
     * Synchronizes all the data for the mobile Condition Assessment application.
     *
     * @param userName User Name
     * @param fullSync performs a full sync when true. A full sync causes all records to be deleted
     *            from the server side sync table. A timestamp sync is performed when false.
     */
    void syncWorkData(final String userName, final boolean fullSync);
}
