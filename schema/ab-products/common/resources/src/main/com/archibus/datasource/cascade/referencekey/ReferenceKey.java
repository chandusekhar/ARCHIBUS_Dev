package com.archibus.datasource.cascade.referencekey;

import java.util.List;

/**
 * Interface to be implemented by classes that
 * OracleReferenceKey/SqlServerReferenceKey/ArchibusReferenceKey.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.2
 * 
 */
public interface ReferenceKey {
    
    /**
     * Loads foreign keys.
     * 
     * @param fromTableName from table name
     * @param toTableName to table name
     */
    void loadForeignKeys(final String fromTableName, final String toTableName);
    
    /**
     * Get constraints names.
     * 
     * @return list of constraint names.
     */
    List<String> getConstraintsNames();
    
    /**
     * 
     * Get Enable Constraints Statements.
     * 
     * @return list of statements
     */
    List<String> getEnableConstraintsStmts();
    
    /**
     * 
     * Get Disable Constraints Statements.
     * 
     * @return list of statements
     */
    List<String> getDisableConstraintsStmts();
    
    /**
     * Disable constraints.
     */
    void disable();
    
    /**
     * Enable constraints.
     * 
     * @return
     */
    void enable();
}
