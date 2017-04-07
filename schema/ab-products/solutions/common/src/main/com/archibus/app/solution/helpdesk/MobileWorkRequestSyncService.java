package com.archibus.app.solution.helpdesk;

import org.apache.log4j.Logger;

/**
 * Example of a Workflow Rule Service for a mobile application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as
 * 'AbBldgOpsHelpDesk-MobileWorkRequestSyncService'.
 * <p>
 * Provides methods for integrating "wr_sync" work requests sync table with "wr" work requests table
 * and the work requests business logic.
 * <p>
 * Invoked by mobile client.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class MobileWorkRequestSyncService {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Closes out data from craftsperson. The data is in "wr_sync" table.
     * 
     * @param username of the craftsperson.
     */
    public void closeOutDataFromCraftsperson(final String username) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(String
                .format("closeOutDataFromCraftsperson: username=[%s]", username));
        }
        
        // TODO implement
    }
    
    /**
     * Replicates data for craftsperson into "wr_sync" table.
     * 
     * @param username of the craftsperson.
     */
    public void replicateDataForCraftsperson(final String username) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(String
                .format("replicateDataForCraftsperson: username=[%s]", username));
        }
        
        // TODO implement
    }
}
