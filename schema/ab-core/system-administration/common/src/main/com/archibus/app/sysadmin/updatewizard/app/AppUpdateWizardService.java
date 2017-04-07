package com.archibus.app.sysadmin.updatewizard.app;

import java.util.*;

/**
 * Interface of the Application Update Wizard Service.
 * 
 * @author Catalin Purice
 * 
 */
public interface AppUpdateWizardService {
    /**
     * Gets active project folders from afm-projects.xml file.
     * 
     * @return active project folders
     */
    List<Map<String, String>> getActiveProjectFolders();
    
    /**
     * Gets the ARCHIBUS path.
     * 
     * @return ARCHIBUS path
     */
    String getArchibusPath();
    
    /**
     * Returns the time stamp of "mysite-extensions.war" file.
     * 
     * @return Time stamp
     */
    Date getExtensionsFileDetails();
    
    /**
     * Gets the folder tree.
     * 
     * @return String
     */
    String getFolderList();
    
    /**
     * Checks if the file exists.
     * 
     * @param path full path of the file
     * @return true if the file exists and false otherwise
     */
    boolean isFileExists(String path);
    
    /**
     * Package data.
     * 
     * @return job id
     */
    String packageData();
    
    /**
     * Package Deployment.
     * 
     * @param isProdServer true if is production server.
     * @return job id
     */
    String packageDeployment(boolean isProdServer);
    
    /**
     * Package work-group.
     * 
     * @return job id
     */
    String packageDeploymentWorkgroup();
    
    /**
     * Package extensions.
     * 
     * @return job id
     */
    String packageExtensions();
    
    /**
     * Saves to .properties file.
     * 
     * @param dataPaths data paths
     * @param extPaths extensions paths
     * @param updTypePaths update type
     * @param preserveTypePaths preserve type
     */
    void saveToPropertiesFile(final List<String> dataPaths, final List<String> extPaths,
            final List<String> updTypePaths, final List<String> preserveTypePaths);
}
