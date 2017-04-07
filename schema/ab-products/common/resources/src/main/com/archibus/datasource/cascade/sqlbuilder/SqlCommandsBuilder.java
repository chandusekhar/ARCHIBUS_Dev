package com.archibus.datasource.cascade.sqlbuilder;

/**
 * Interface to be implemented by CascadeDeleteCommandsImpl and CascadeUpdateCommandsImpl classes.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public interface SqlCommandsBuilder {
    /**
     * build SQL commands.
     */
    void buildSqlCommands();
    
    /**
     * build SQL commands for document sync only.
     */
    void buildDocTablesSqlCommands();
}
