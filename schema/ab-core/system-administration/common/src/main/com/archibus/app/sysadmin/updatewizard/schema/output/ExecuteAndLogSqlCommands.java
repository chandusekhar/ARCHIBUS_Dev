package com.archibus.app.sysadmin.updatewizard.schema.output;

import java.io.File;
import java.util.List;

import com.archibus.datasource.DataSource;

/**
 * Executes and logs the SQL commands.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class ExecuteAndLogSqlCommands implements SqlCommandOutput {
    
    /**
     * Executes SQL commands.
     */
    private final ExecuteCommand executor;
    
    /**
     * Logs SQL commands.
     */
    private final LogCommand logger;
    
    /**
     * Private default constructor: utility class is non-instantiable.
     * 
     * @param fileName name of the log file
     * @param append append file
     */
    public ExecuteAndLogSqlCommands(final String fileName, final boolean append) {
        super();
        this.executor = new ExecuteCommand();
        this.logger = new LogCommand(fileName, append);
    }
    
    /**
     * {@inheritDoc}
     */
    public void close() {
        this.logger.close();
        this.executor.close();
    }
    
    /**
     * {@inheritDoc}
     */
    public boolean isLog() {
        return true;
    }
    
    /**
     * {@inheritDoc}
     */
    public void runCommand(final String sqlCommand, final String role) {
        this.logger.runCommand(sqlCommand, role);
        this.executor.runCommand(sqlCommand, role);
    }
    
    /**
     * 
     * To be used only to log commands for special cases.
     *  
     * @param sqlCommand the command to be logged
     */
    public void logCommand(final String sqlCommand) {
        this.logger.runCommand(sqlCommand, DataSource.DB_ROLE_DATA);
    }

    /**
     * {@inheritDoc}
     */
    public void runCommandNoParams(final List<String> sqlCommands) {
        this.logger.runCommandNoParams(sqlCommands);
        this.executor.runCommandNoParams(sqlCommands);
    }
    
    /**
     * {@inheritDoc}
     */
    public void runCommands(final List<String> sqlCommands) {
        this.logger.runCommands(sqlCommands);
        this.executor.runCommands(sqlCommands);
    }
    
    /**
     * {@inheritDoc}
     */
    public void runCommandsNoException(final List<String> sqlCommands) {
        this.logger.runCommandsNoException(sqlCommands);
        this.executor.runCommandsNoException(sqlCommands);
    }
    
    /**
     * {@inheritDoc}
     */
    public void setThrowException(final boolean throwException) {
        this.logger.setThrowException(throwException);
        this.executor.setThrowException(throwException);
    }
    
    /**
     * Getter for the file property.
     * 
     * @see file
     * @return the file property.
     */
    public File getFile() {
        return this.logger.getFile();
    }
    
    /**
     * Getter for the logger property.
     * 
     * @see logger
     * @return the logger property.
     */
    public LogCommand getLogger() {
        return this.logger;
    }
}
