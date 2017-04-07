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
import com.archibus.utility.*;

/**
 * Package Deployment Workgroup job.
 * 
 * @author Catalin Purice
 * 
 */
public class PackageDeploymentWorkgroup extends JobBase {
    /**
     * Logger.
     */
    private final java.util.logging.Logger pdwLogger = AppUpdateWizardLogger.initLogger(false);
    
    /**
     * Extract object.
     */
    private final Extractor extractAndPackage = new Extractor(0, this.status);
    
    @Override
    public void run() {
        
        this.pdwLogger.log(Level.INFO, "START PACKAGING DEPLOYMENT WORKGROUP.");
        
        boolean isExt = false;
        boolean isData = false;
        int countData = 0;
        int countExt = 0;
        int zipFilesCounter = 0;
        
        try {
            
            this.status.setResult(new JobResult("Packaging Deployment Workgroup",
                AppUpdateWizardLogger.getLogFileName(), AppUpdateWizardLogger.getRelativePath()));

            countData = PackagerUtilities.getNoOfDataFilesToZip();
            countExt = PackagerUtilities.getNoOfExtensionsFilesToZip();
            
            // package data
            if (countData > 0) {
                isData = true;
            }
            // package extensions
            if (countExt > 0) {
                isExt = true;
            }
            final String afmBase = ContextStore.get().getWebAppPath().toString();
            final String warPath = afmBase + File.separator + AppUpdateWizardConstants.ARCHIBUS_WAR;
            
            zipFilesCounter = PackagerUtilities.getNoOfFilesFromZip(warPath);
            
            final int finalArchibusWarCounter = zipFilesCounter + countData + countExt;
            
            final int totalCounter =
                    AppUpdateWizardConstants.THREE * countData + AppUpdateWizardConstants.THREE
                            * countExt + zipFilesCounter + finalArchibusWarCounter
                            + finalArchibusWarCounter / AppUpdateWizardConstants.THREE;
            
            this.status.setTotalNumber(totalCounter);
            
            if (isData) {
                packageData(afmBase);
            }
            
            if (isExt) {
                packageExtension(afmBase);
            }
            
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_EXPANDING_ARCH_MESSAGE);
            this.extractAndPackage.extractZipFiles(AppUpdateWizardConstants.ARCHIBUS_WAR);
            
            AppUpdateWizardUtilities.renameOrigArchibusZip(this.extractAndPackage.getTimeStamp());
            
            expandWarFiles(isExt, isData);
            
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_CREATE_FINAL_WAR_MESSAGE);
            
            packageArchibusWar(finalArchibusWarCounter, totalCounter);
            
            this.status.setMessage(JobMessage.REMOVE_TEMP_FOLDER);
            PackagerUtilities.removeTempFolders(this.extractAndPackage.getTempDir());
            this.status.setCurrentNumber(totalCounter);
            
            this.status.setMessage("");
            this.status.setCode(JobStatus.JOB_COMPLETE);
            
            this.pdwLogger.log(Level.INFO, "END PACKAGING DEPLOYMENT WORKGROUP.");
            
        } catch (final IOException e) {
            this.status.setCode(JobStatus.JOB_TERMINATED);
            this.status.setMessage(e.getMessage());
            this.pdwLogger
                .log(Level.SEVERE, "Error during packaging deployment: " + e.getMessage());
            // @non-translatable
            Logger.getLogger(this.getClass()).error(
                MessageFormat.format("Package and Deploy Wizard - Workgroup: [{0}]",
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        } finally {
            AppUpdateWizardLogger.close();
        }
    }
    
    /**
     * 
     * @param isExt has files
     * @param isData has files
     * @throws IOException exception
     */
    private void expandWarFiles(final boolean isExt, final boolean isData) throws IOException {
        if (isData) {
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_COPY_DATA_MESSAGE);
            new CopyFiles(this.extractAndPackage).copyDataFiles("");
        }
        if (isExt) {
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_COPY_EXT_MESSAGE);
            new CopyFiles(this.extractAndPackage).copyExtensionsFiles("");
        }
    }
    
    /**
     * @param finalArchibusWarCounter counter
     * @param totalCounter total counter
     * @throws IOException exception
     */
    private void packageArchibusWar(final int finalArchibusWarCounter, final int totalCounter)
            throws IOException {
        // create archibus.WAR
        this.extractAndPackage.writeFinalArchibusWAR();
        
        this.status.setCurrentNumber(totalCounter - finalArchibusWarCounter
                / AppUpdateWizardConstants.THIRTY);
        
        PackagerUtilities.moveArchibusZip(this.extractAndPackage.getTempDir());
        this.status.setCurrentNumber(totalCounter - finalArchibusWarCounter
                / AppUpdateWizardConstants.SIXTY);
    }
    
    /**
     * 
     * @param afmBase afmBase ARCHIBUS base path
     * @throws IOException exception
     */
    private void packageData(final String afmBase) throws IOException {
        this.status.setMessage(JobMessage.PACKAGE_DATA_MESSAGE);
        this.pdwLogger.log(Level.INFO, "START PACKAGING DATA.");
        this.extractAndPackage.writeAppDataZip();
        if (PackagerUtilities.isFileExists(AppUpdateWizardConstants.DATA_WAR_FILE_NAME)) {
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_EXPANDING_DATA_MESSAGE);
            this.extractAndPackage.extractZipFiles(AppUpdateWizardConstants.DATA_WAR_FILE_NAME);
            FileUtil.deleteFile(afmBase + File.separator
                    + AppUpdateWizardConstants.DATA_WAR_FILE_NAME);
        }
        this.pdwLogger.log(Level.INFO, "END PACKAGING DATA.");
    }
    
    /**
     * 
     * @param afmBase ARCHIBUS base path
     * @throws IOException exception
     */
    private void packageExtension(final String afmBase) throws IOException {
        this.status.setMessage(JobMessage.PACKAGE_DATA_MESSAGE);
        this.pdwLogger.log(Level.INFO, "START PACKAGING EXTENSIONS.");
        
        this.extractAndPackage.writeAppExtensionsZip();
        
        if (PackagerUtilities.isFileExists(AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME)) {
            this.status.setMessage(JobMessage.PACKAGE_DEPLOY_EXPANDING_EXT_MESSAGE);
            this.extractAndPackage
                .extractZipFiles(AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME);
            FileUtil.deleteFile(afmBase + File.separator
                    + AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME);
        }
        this.pdwLogger.log(Level.INFO, "END PACKAGING EXTENSIONS.");
    }
    
}
