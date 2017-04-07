package com.archibus.app.sysadmin.updatewizard.app.job;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.logging.Level;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.app.packager.*;
import com.archibus.app.sysadmin.updatewizard.app.util.AppUpdateWizardLogger;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

/**
 * Package Extensions job.
 * 
 * @author Catalin Purice
 * 
 */
public class PackageExtensions extends JobBase {
    /**
     * Exception message template.
     */
    private static final String MESSAGE = "Package and Deploy Wizard - Package Extensions: [{0}]";
    
    /**
     * Packager.
     */
    private final Packager appPackage = new Packager(0, this.status);
    
    /**
     * Logger.
     */
    private final java.util.logging.Logger pdwLogger = AppUpdateWizardLogger.initLogger(false);
    
    @Override
    public void run() {
        
        this.pdwLogger.log(Level.INFO, "START PACKAGING EXTENSIONS.");
        
        this.status.setMessage(JobMessage.PACKAGE_EXTENSIONS_MESSAGE);
        int count = 0;
        this.status.setTotalNumber(count);
        
        try {
            if (this.stopRequested) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                return;
            } else {
                this.status.setResult(new JobResult("Packaging Extensions", AppUpdateWizardLogger
                    .getLogFileName(), AppUpdateWizardLogger.getRelativePath()));
                count = PackagerUtilities.getNoOfExtensionsFilesToZip();
                this.status.setTotalNumber(count);
                this.appPackage.writeAppExtensionsZip();
                this.pdwLogger.log(Level.INFO, "END PACKAGING EXTENSIONS.");
            }
        } catch (final IOException e) {
            this.status.setMessage(e.getMessage());
            this.status.setCode(JobStatus.JOB_TERMINATED);
            this.pdwLogger.log(Level.SEVERE, "Error packaging extensions: " + e.getMessage());
            Logger.getLogger(this.getClass()).error(
                MessageFormat.format(MESSAGE, new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        } finally {
            AppUpdateWizardLogger.close();
        }
        this.status.setCurrentNumber(count);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
