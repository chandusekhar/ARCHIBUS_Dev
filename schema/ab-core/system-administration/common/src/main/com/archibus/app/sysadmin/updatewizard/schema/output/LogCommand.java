package com.archibus.app.sysadmin.updatewizard.schema.output;

import java.io.*;
import java.text.MessageFormat;
import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.utility.ExceptionBase;

/**
 * Log the commands into update.sql file.
 * 
 * @author Catalin Purice
 * 
 */
public class LogCommand implements SqlCommandOutput {
    
    /**
     * Constant.
     */
    public static final String BLANK_FILE_MESSAGE = "--No changes. File left deliberately blank";
    
    /**
     * Constant.
     */
    private static final char END_OF_DML = ';';
    
    /**
     * Constant.
     */
    private static final String NEW_LINE = "\r\n";
    
    /**
     * Constant.
     */
    private static final String SECURITY_TEXT = "--***RUN UNDER SECURITY ROLE***";
    
    /**
     * Constant.
     */
    private static final String LOG_PREFIX = "Schema Update Wizard - [{0}]";
    
    /**
     * GO command for SQL Server logging.
     */
    private static final String GO_STMT = "GO";
    
    /**
     * Constant.
     */
    private final Logger logger = Logger.getLogger(LogCommand.class);
    
    /**
     * The file writer.
     */
    private transient FileWriter fileWriter;
    
    /**
     * Log File.
     */
    private final File file;
    
    /**
     * Constructor.
     * 
     * @param fileName name of SQL log file
     * @param append append
     */
    public LogCommand(final String fileName, final boolean append) {
        final String filePath = getLogFolder() + File.separatorChar + fileName;
        
        this.file = new File(filePath);
        try {
            if (!this.file.exists() && !this.file.createNewFile()) {
                throw new IOException();
            }
            
            this.fileWriter = new FileWriter(this.file, append);
            
        } catch (final IOException e) {
            this.logger.error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * Close the file.
     */
    public void close() {
        try {
            this.fileWriter.close();
        } catch (final IOException e) {
            this.logger.error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * @param sqlCommand sql command to be logged.
     * @param role db role
     */
    public void runCommand(final String sqlCommand, final String role) {
        // writes command to logFile
        
        if (sqlCommand.length() > 0) {
            try {
                if (role.equals(DataSource.DB_ROLE_SECURITY)) {
                    this.fileWriter.write(SECURITY_TEXT);
                    this.fileWriter.write(NEW_LINE);
                }
                this.fileWriter.write(sqlCommand + END_OF_DML);
                this.fileWriter.write(NEW_LINE);
                if (SqlUtils.isSqlServer()) {
                    this.fileWriter.write(GO_STMT);
                    this.fileWriter.write(NEW_LINE);
                }
                this.fileWriter.flush();
            } catch (final IOException e) {
                this.logger
                    .error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
                throw new ExceptionBase(null, e.getMessage(), e);
            }
        }
    }
    
    /**
     * 
     * @param sqlCommands sql Command
     */
    public void runCommandNoParams(final List<String> sqlCommands) {
        for (final String sqlCommand : sqlCommands) {
            if (sqlCommand.length() > 0) {
                String sqlCommandToLog = sqlCommand;
                try {
                    if (sqlCommand.trim().startsWith("CREATE SEQUENCE")) {
                        sqlCommandToLog += END_OF_DML;
                    } else if (sqlCommand.startsWith("CREATE OR REPLACE TRIGGER")) {
                        sqlCommandToLog += System.getProperty("line.separator");
                        sqlCommandToLog += "/";
                    }
                    this.fileWriter.write(sqlCommandToLog);
                    this.fileWriter.write(NEW_LINE);
                    if (SqlUtils.isSqlServer()) {
                        this.fileWriter.write(GO_STMT);
                        this.fileWriter.write(NEW_LINE);
                    }
                    this.fileWriter.flush();
                } catch (final IOException e) {
                    this.logger.error(MessageFormat.format(LOG_PREFIX,
                        new Object[] { e.getMessage() }));
                    throw new ExceptionBase(null, e.getMessage(), e);
                }
            }
        }
    }
    
    /**
     * @param sqlCommands sql commands to be logged.
     */
    public void runCommands(final List<String> sqlCommands) {
        try {
            for (final String command : sqlCommands) {
                if (command.length() > 0) {
                    this.fileWriter.write(command + END_OF_DML);
                    this.fileWriter.write(NEW_LINE);
                    if (SqlUtils.isSqlServer()) {
                        this.fileWriter.write(GO_STMT);
                        this.fileWriter.write(NEW_LINE);
                    }
                }
            }
            this.fileWriter.flush();
        } catch (final IOException e) {
            this.logger.error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * Gets the log folder.
     * 
     * @return log folder
     */
    private String getLogFolder() {
        final String archibusPath = ContextStore.get().getWebAppPath();
        final String logFolder =
                archibusPath + File.separator + "projects" + File.separator + "users"
                        + File.separator + "public" + File.separator + "dt" + File.separator
                        + ProjectUpdateWizardConstants.DUW_FOLDER + File.separator
                        + ProjectUpdateWizardConstants.CURRENT_DB_FOLDER;
        
        final File logFile = new File(logFolder);
        if (!logFile.exists()) {
            try {
                logFile.mkdirs();
            } catch (final SecurityException e) {
                this.logger
                    .error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
                throw new ExceptionBase(null, e.getMessage(), e);
            }
        }
        return logFolder;
    }
    
    /**
     * @return true
     */
    public boolean isLog() {
        return true;
    }
    
    /**
     * Setter for the throwException property.
     * 
     * @param throwException the throwException to set
     */
    
    public void setThrowException(final boolean throwException) {
        /**
         * This setter is used by the ExecuteCommand class only. Because this class implements an
         * interface we need this method here too.
         */
    }
    
    /**
     * {@inheritDoc}
     */
    public void runCommandsNoException(final List<String> sqlCommands) {
        runCommands(sqlCommands);
    }
    
    /**
     * Getter for the file property.
     * 
     * @see file
     * @return the file property.
     */
    public File getFile() {
        return this.file;
    }
    
}
