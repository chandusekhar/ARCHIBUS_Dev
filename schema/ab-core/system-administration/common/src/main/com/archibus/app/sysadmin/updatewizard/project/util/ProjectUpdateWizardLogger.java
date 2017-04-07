package com.archibus.app.sysadmin.updatewizard.project.util;

import java.io.*;
import java.text.MessageFormat;
import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.utility.ExceptionBase;

/**
 * Project update wizard logger class.
 * 
 * @author Catalin
 * 
 */
public class ProjectUpdateWizardLogger {
    
    /**
     * Constant.
     */
    public static final String NEW_LINE = "\r\n";
    
    /**
     * Constant.
     */
    public static final String TAB_SPACE = "\t";
    
    /**
     * Constant.
     */
    private static final String BEGIN_MESSAGE_COMPARE_ONLY =
            "Project Update Wizard - Comparition Only: ";
    
    /**
     * Constant.
     */
    private static final String BEGIN_MESSAGE_GENERAL = "Project/Schema Update Wizard: {0}";
    
    /**
     * Constant.
     */
    private static final String LOG_PARAM = " [{0}]";
    
    /**
     * File Writer.
     */
    private transient FileWriter fileWriter;
    
    /**
     * File.
     */
    private final File logFile;
    
    /**
     * Constructor.
     * 
     * @param logFileName log file name
     */
    public ProjectUpdateWizardLogger(final String logFileName) {
        
        final String filePath =
                TransferFile.getTransferFolderOut() + File.separatorChar + logFileName;
        
        this.logFile = new File(filePath);
        try {
            if (!this.logFile.createNewFile()) {
                Logger.getLogger(ProjectUpdateWizardLogger.class).warn(
                    MessageFormat.format(BEGIN_MESSAGE_COMPARE_ONLY + LOG_PARAM,
                        new Object[] { this.logFile.getName()
                                + " file already exists. Overwrite it." }));
            }
            this.fileWriter = new FileWriter(this.logFile);
        } catch (final IOException e) {
            Logger.getLogger(ProjectUpdateWizardLogger.class).error(
                MessageFormat.format(BEGIN_MESSAGE_COMPARE_ONLY + LOG_PARAM,
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * log the exceptions.
     * 
     * @param message message to log
     */
    public static void logException(final String message) {
        final String errorMessage = MessageFormat.format(BEGIN_MESSAGE_GENERAL, message);
        Logger.getLogger(ProjectUpdateWizardLogger.class).error(errorMessage);
    }
    
    /**
     * log the warning.
     * 
     * @param message message to log
     */
    public static void logWarning(final String message) {
        final String warnMessage = MessageFormat.format(BEGIN_MESSAGE_GENERAL, message);
        Logger.getLogger(ProjectUpdateWizardLogger.class).warn(warnMessage);
    }
    
    /**
     * Adds new line into log file.
     */
    public void addNewLine() {
        try {
            this.fileWriter.write(NEW_LINE);
        } catch (final IOException e) {
            Logger.getLogger(ProjectUpdateWizardLogger.class).error(
                MessageFormat.format(BEGIN_MESSAGE_COMPARE_ONLY + LOG_PARAM,
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * Close file.
     */
    public void close() {
        try {
            if (this.fileWriter != null) {
                this.fileWriter.close();
            }
        } catch (final IOException e) {
            logException("Unable to close file : " + this.logFile.getAbsolutePath());
        }
    }
    
    /**
     * writes message to Comparator.log file.
     * 
     * @param message message to log
     */
    public void logMessage(final String message) {
        
        try {
            this.fileWriter.write(message);
            this.fileWriter.write(NEW_LINE);
            this.fileWriter.flush();
        } catch (final IOException e) {
            Logger.getLogger(ProjectUpdateWizardLogger.class).error(
                MessageFormat.format(BEGIN_MESSAGE_COMPARE_ONLY + LOG_PARAM,
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * writes messages to log file.
     * 
     * @param messages message to log
     */
    public void logMessages(final List<String> messages) {
        for (final String message : messages) {
            logMessage(message);
        }
    }
    
}
