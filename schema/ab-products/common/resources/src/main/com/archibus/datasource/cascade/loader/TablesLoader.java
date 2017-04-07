package com.archibus.datasource.cascade.loader;

import java.util.List;

/**
 * Interface to be implemented TablesLoaderDeleteImpl and TablesLoaderUpdateImpl.
 * <p>
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public interface TablesLoader {
    /**
     * Loads cascade tables.
     */
    void processCascadeTables();
    
    /**
     * 
     * Returns the cascade SQL commands.
     * 
     * @return List of statements
     */
    List<String> getCascadeSqlCommands();
    
    /**
     * 
     * Returns the postponed SQL commands.
     * 
     * @return List of statements
     */
    List<String> getPostponedCascadeSqlCommands();
    
    /**
     * 
     * returns the SQL commands for synchronizing document tables.
     * 
     * @return List of statements
     */
    List<String> getCascadeDocTableSqlCommands();
    
}
