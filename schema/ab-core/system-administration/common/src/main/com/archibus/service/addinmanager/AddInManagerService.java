package com.archibus.service.addinmanager;

/**
 * Service for Add-in Manager actions, such as writeAddInLicenseFile, updateActivityParameter.
 * 
 * @author Sergey Kuramshin
 */
public interface AddInManagerService {
    
    /**
     * Writes the add-in application license file.
     * 
     * @param password Third-party password. Hard-coded in this class.
     * @param customerName Customer name as provided on the P.O. to ARCHIBUS, Inc.
     * @param applicationName Application name.
     * @param applicationTitle Application title.
     * @param concurrentUsers The number of concurrent users.
     * @param securityKey Application security key.
     */
    public abstract String writeAddInLicenseFile(String password, String customerName,
            String applicationName, String applicationTitle, int concurrentUsers, String securityKey);
    
    /**
     * Updates specified activity parameter value in memory and in the database.
     * 
     * @param activityId The activity ID.
     * @param parameterId The parameter ID.
     * @param value The new parameter value.
     * @param description The description.
     */
    public void updateActivityParameter(final String activityId, final String parameterId,
            final String value, final String description);
}