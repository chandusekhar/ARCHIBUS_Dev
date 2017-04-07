package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.List;

/**
 * 
 * Provides operations for manipulating ARCHIBUS Data Dictionary tables.
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public interface ICommand {
    
    /**
     * 
     * Adds new table/field.
     */
    void add();
    
    /**
     * 
     * Update table/field.
     */
    void update();
    
    /**
     * 
     * Deletes table/field.
     */
    void remove();
    
    /**
     * 
     * getStatements.
     * 
     * @return SQL statements
     */
    List<String> getStatements();
    
    /**
     * 
     * getRefStatements.
     * 
     * @return SQL statements
     */
    List<String> getRefStatements();
    
    /**
     * 
     * getPostponedStatements.
     * 
     * @return SQL statements
     */
    List<String> getPostponedStatements();
}
