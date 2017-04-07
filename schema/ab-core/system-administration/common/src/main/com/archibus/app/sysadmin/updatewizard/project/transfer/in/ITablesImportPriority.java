package com.archibus.app.sysadmin.updatewizard.project.transfer.in;

import java.util.*;

/**
 * Interface to be implemented by class TablesImportPriority.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public interface ITablesImportPriority {
    
    /**
     * Order the list of tables for import into the database.
     */
    void calculatePriority();
    
    /**
     * 
     * Return the tables by import order.
     * 
     * @return list of ordered tables.
     */
    List<String> getTablesByImportOrder();
    
    /**
     * 
     * Get circular references .
     * 
     * @return the circular reference
     */
    List<Map<String, String>> getCircularReferences();
    
}
