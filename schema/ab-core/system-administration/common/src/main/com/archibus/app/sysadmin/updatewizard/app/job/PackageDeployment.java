package com.archibus.app.sysadmin.updatewizard.app.job;

import java.io.*;
import java.text.MessageFormat;
import java.util.logging.Level;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.app.packager.*;
import com.archibus.app.sysadmin.updatewizard.app.util.*;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

/**
 * Package Deployment job.
 * 
 * @author Catalin Purice
 * 
 */
public class PackageDeployment extends JobBase {
    
    /**
     * Logger.
     */
    private final java.util.logging.Logger pdwLogger = AppUpdateWizardLogger.initLogger(false);
    
    /**
     * Extract object.
     */
    private final Extractor extractAndPackage = new Extractor(0, this.status);
    
    /**
     * is prodServer.
     */
    private final boolean isProdServer;
    
    /**
     * Constructor.
     * 
     * @param isProdServer @see {@link PackageDeployment}
     */
    public PackageDeployment(final boolean isProdServer) {
        super();
        this.isProdServer = isProdServer;
    }
    
    @Override
    public void run() {
        this.pdwLogger.log(Level.INFO, "START PACKAGING DEPLOYMENT");
        int zipFilesCounter = 0;
        final String afmBase = ContextStore.get().getWebAppPath().toString();
        try {
            
            this.status.setResult(new JobResult("Packaging Deployment", AppUpdateWizardLogger
                .getLogFileName(), AppUpdateWizardLogger.getRelativePath()));
            
            if (this.isProdServer) {
                this.pdwLogger.log(Level.INFO, "Packaging data entries..");
                this.status.setMessage(JobMessage.PACKAGE_DATA_MESSAGE);
                this.extractAndPackage.writeAppDataZip();
            }
            
            final int countData = countDataFiles();
            final int countExt = countExtensionFiles();
            
            final String archWARPath =
                    afmBase + File.separator + AppUpdateWizardConstants.ARCHIBUS_WAR;
            
            zipFilesCounter = PackagerUtilities.getNoOfFilesFromZip(archWARPath);
            
            final int finalArchibusWarCounter = zipFilesCounter + countData + countExt;
            final int totalCounter =
            // zip, extract, copy to \temp
                    2 * countData
                            // zip, extract, copy to \temp
                            + 2 * countExt
                            // extract archibus.war, zip to archibus.war
                            + zipFilesCounter
                            // zipFilesCounter + countData + countExt
                            + finalArchibusWarCounter + finalArchibusWarCounter
                            / AppUpdateWizardConstants.THREE;
            
            this.status.setTotalNumber(totalCounter);
            
            expandWarFiles(countData, countExt);
            
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_EXPANDING_ARCH_MESSAGE);
            this.extractAndPackage.extractZipFiles(AppUpdateWizardConstants.ARCHIBUS_WAR);
            
            this.pdwLogger.log(Level.INFO, "Rename archibus.war file.");
            
            AppUpdateWizardUtilities.renameOrigArchibusZip(this.extractAndPackage.getTimeStamp());
            
            // copy files from in to out
            // will merge .properties files also
            if (countData > 0) {
                // this.appPackage.resetCounter();
                this.status.setMessage(JobMessage.PACKAGE_DEPLOY_COPY_DATA_MESSAGE);
                new CopyFiles(this.extractAndPackage).copyDataFiles("");
            }
            
            if (countExt > 0) {
                this.status.setMessage(JobMessage.PACKAGE_DEPLOY_COPY_EXT_MESSAGE);
                new CopyFiles(this.extractAndPackage).copyExtensionsFiles("");
            }
            
            // create archibus.WAR
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_CREATE_FINAL_WAR_MESSAGE);
            
            this.pdwLogger.log(Level.INFO, "Create archibus.war file.");
            
            this.extractAndPackage.writeFinalArchibusWAR();
            this.status.setCurrentNumber(totalCounter - finalArchibusWarCounter
                    / AppUpdateWizardConstants.THIRTY);
            
            final String temporaryDir = this.extractAndPackage.getTempDir();
            PackagerUtilities.moveArchibusZip(temporaryDir);
            this.status.setCurrentNumber(totalCounter - finalArchibusWarCounter
                    / AppUpdateWizardConstants.SIXTY);
            this.status.setMessage(JobMessage.REMOVE_TEMP_FOLDER);
            PackagerUtilities.removeTempFolders(temporaryDir);
            this.status.setCurrentNumber(totalCounter);
            this.status.setMessage("");
            this.status.setCode(JobStatus.JOB_COMPLETE);
            this.pdwLogger.log(Level.INFO, "END PACKAGING DEPLOYMENT.");
        } catch (final IOException e) {
            // @non-translatable
            this.status.setMessage(e.getMessage());
            this.status.setCode(JobStatus.JOB_TERMINATED);
            this.pdwLogger
                .log(Level.SEVERE, "Error during packaging deployment: " + e.getMessage());
            Logger.getLogger(this.getClass()).error(
                MessageFormat.format("Package and Deploy Wizard - Package Deployment: [{0}]",
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        } finally {
            AppUpdateWizardLogger.close();
        }
    }
    
    /**
     * @return no of files in archive
     * @throws IOException exception
     */
    private int countDataFiles() throws IOException {
        int countData = 0;
        if (PackagerUtilities.isFileExists(AppUpdateWizardConstants.DATA_WAR_FILE_NAME)) {
            final String dataWARPath =
                    ContextStore.get().getWebAppPath().toString() + File.separator
                            + AppUpdateWizardConstants.DATA_WAR_FILE_NAME;
            countData = PackagerUtilities.getNoOfFilesFromZip(dataWARPath);
        }
        return countData;
    }
    
    /**
     * @return no of files in archive
     * @throws IOException exception
     */
    private int countExtensionFiles() throws IOException {
        int countExt = 0;
        if (PackagerUtilities.isFileExists(AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME)) {
            final String extWARPath =
                    ContextStore.get().getWebAppPath().toString() + File.separator
                            + AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME;
            countExt = PackagerUtilities.getNoOfFilesFromZip(extWARPath);
        }
        return countExt;
    }
    
    /**
     * 
     * @param countData no of data files
     * @param countExt no of extensions files
     * @throws IOException exception
     */
    private void expandWarFiles(final int countData, final int countExt) throws IOException {
        // expand
        if (countData > 0) {
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_EXPANDING_DATA_MESSAGE);
            this.extractAndPackage.extractZipFiles(AppUpdateWizardConstants.DATA_WAR_FILE_NAME);
        }
        
        if (countExt > 0) {
            // this.appPackage.resetCounter();
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_EXPANDING_EXT_MESSAGE);
            this.extractAndPackage
                .extractZipFiles(AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME);
        }
    }
}