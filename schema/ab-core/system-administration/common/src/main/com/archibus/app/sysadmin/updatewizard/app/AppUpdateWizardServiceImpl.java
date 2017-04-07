package com.archibus.app.sysadmin.updatewizard.app;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.app.job.*;
import com.archibus.app.sysadmin.updatewizard.app.packager.PackagerUtilities;
import com.archibus.app.sysadmin.updatewizard.app.property.SaveProperty;
import com.archibus.app.sysadmin.updatewizard.app.util.*;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;

/**
 * Implements AppUpdateWizardService.
 * 
 * @author Catalin Purice
 * 
 */
public class AppUpdateWizardServiceImpl implements AppUpdateWizardService {
    
    /**
     * Folder Tree.
     */
    private final FolderTree appTree = new FolderTree();
    
    /**
     * Returns active folder paths.
     * 
     * @return List<Map<String, String>>
     */
    public List<Map<String, String>> getActiveProjectFolders() {
        return AppUpdateWizardUtilities.getProjectFolders();
    }
    
    /**
     * Returns ARCHIBUS root path.
     * 
     * @return Root path
     */
    public String getArchibusPath() {
        return ContextStore.get().getWebAppPath().toString();
    }
    
    /**
     * Get extension file details.
     * 
     * @return Date of file creation
     */
    public Date getExtensionsFileDetails() {
        return AppUpdateWizardUtilities.getExtensionsFileDetails();
    }
    
    /**
     * Gets folder list from /archibus.
     * 
     * @return folder list
     */
    public String getFolderList() {
        return this.appTree.getFolderList();
    }
    
    /**
     * Returns true if the file exists.
     * 
     * @param path Path
     * @return boolean
     */
    public boolean isFileExists(final String path) {
        return PackagerUtilities.isFileExists(path);
    }
    
    /**
     * Call Package Data job.
     * 
     * @return job id
     */
    public String packageData() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new PackageData();
        return jobManager.startJob(job);
    }
    
    /**
     * Call Package Deployment job.
     * 
     * @param isProdServer boolean
     * @return job id
     */
    public String packageDeployment(final boolean isProdServer) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new PackageDeployment(isProdServer);
        return jobManager.startJob(job);
    }
    
    /**
     * Call Package Deployment Workgroup job.
     * 
     * @return job id
     */
    public String packageDeploymentWorkgroup() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new PackageDeploymentWorkgroup();
        return jobManager.startJob(job);
    }
    
    /**
     * Call Package Extensions job.
     * 
     * @return job id
     */
    public String packageExtensions() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new PackageExtensions();
        return jobManager.startJob(job);
        
    }
    
    /**
     * Saves paths to .property file.
     * 
     * @param dataPaths data paths
     * @param extPaths extensions paths
     * @param updTypePaths update type
     * @param preserveTypePaths preserve type
     */
    public void saveToPropertiesFile(final List<String> dataPaths, final List<String> extPaths,
            final List<String> updTypePaths, final List<String> preserveTypePaths) {
        
        final SaveProperty appDeployPref =
                new SaveProperty(dataPaths, extPaths, updTypePaths, preserveTypePaths);
        appDeployPref.saveToPropertiesFile();
    }
}
