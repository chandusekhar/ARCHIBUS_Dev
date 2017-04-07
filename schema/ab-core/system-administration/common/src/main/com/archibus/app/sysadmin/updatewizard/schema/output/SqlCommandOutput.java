package com.archibus.app.sysadmin.updatewizard.schema.output;

import java.io.File;
import java.util.List;

/**
 * Schema update wizard output interface.
 * 
 * @author Catalin
 * 
 */
public interface SqlCommandOutput {
    
    /**
     * Execute or log a single sql command.
     */
    void close();
    
    /**
     * 
     * @return true if the SQL commands are logged and false is are executed
     */
    boolean isLog();
    
    /**
     * Execute or log a single sql command.
     * 
     * @param sqlCommand sql command
     * @param role db role name
     */
    void runCommand(String sqlCommand, String role);
    
    /**
     * Executes or log the sqlCommands with no parameters.
     * 
     * @param sqlCommands sql commands
     */
    void runCommandNoParams(List<String> sqlCommands);
    
    /**
     * Executes or log the sqlCommands.
     * 
     * @param sqlCommands List of sql commands
     */
    void runCommands(List<String> sqlCommands);
    
    /**
     * 
     * Ignores errors if the a SQL command fails from the list. The execution continues with the
     * rest of the commands.
     * 
     * @param sqlCommands list of SQL commands
     */
    void runCommandsNoException(final List<String> sqlCommands);
    
    /**
     * Setter for the throwException property.
     * 
     * @param throwException the throwException to set
     */
    void setThrowException(boolean throwException);
    
    /**
     * 
     * Return the File.
     * 
     * @return File
     */
    File getFile();
    
}