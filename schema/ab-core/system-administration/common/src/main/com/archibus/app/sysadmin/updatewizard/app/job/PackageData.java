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
 * Package Data job.
 * 
 * @author Catalin Purice
 * 
 */
public class PackageData extends JobBase {
    
    /**
     * Logger.
     */
    private final java.util.logging.Logger pdwLogger = AppUpdateWizardLogger.initLogger(false);
    
    /**
     * Packager.
     */
    private final Packager appPackage = new Packager(0, this.status);
    
    @Override
    public void run() {
        int count = 0;
        this.pdwLogger.log(Level.INFO, "START PACKAGING DATA.");
        try {
            if (this.stopRequested) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                return;
            } else {
                this.status.setResult(new JobResult("Packaging Data", AppUpdateWizardLogger
                    .getLogFileName(), AppUpdateWizardLogger.getRelativePath()));
                this.status.setMessage(JobMessage.PACKAGE_DATA_MESSAGE);
                count = PackagerUtilities.getNoOfDataFilesToZip();
                this.status.setTotalNumber(count);
                this.appPackage.writeAppDataZip();
                this.pdwLogger.log(Level.INFO, "END PACKAGING DATA.");
            }
        } catch (final IOException e) {
            // @non-translatable
            this.status.setMessage(e.getMessage());
            this.status.setCode(JobStatus.JOB_TERMINATED);
            this.pdwLogger.log(Level.SEVERE, "Error packaging data: " + e.getMessage());
            Logger.getLogger(this.getClass()).error(
                MessageFormat.format("Package and Deploy Wizard - Package Data: [{0}]",
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        } finally {
            AppUpdateWizardLogger.close();
        }
        this.status.setCurrentNumber(count);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
