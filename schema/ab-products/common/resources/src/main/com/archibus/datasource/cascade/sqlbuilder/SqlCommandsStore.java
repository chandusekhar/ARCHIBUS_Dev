package com.archibus.datasource.cascade.sqlbuilder;

import java.util.*;

/**
 * 
 * Utility class. Keeps the SQL commands after they were generated.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public class SqlCommandsStore {
    
    /**
     * Insert SQL statements.
     */
    private final List<String> insertCommands = new ArrayList<String>();
    
    /**
     * Delete SQL statements.
     */
    private final List<String> deleteCommands = new ArrayList<String>();
    
    /**
     * Update SQL statements.
     */
    private final List<String> updateCommands = new ArrayList<String>();
    
    /**
     * Update/Delete from document tables SQL statements.
     */
    private final List<String> afmDocCommands = new ArrayList<String>();
    
    /**
     * Getter for the insertCommands property.
     * 
     * @see insertCommands
     * @return the insertCommands property.
     */
    public List<String> getInsertCommands() {
        return this.insertCommands;
    }
    
    /**
     * Getter for the deleteCommands property.
     * 
     * @see deleteCommands
     * @return the deleteCommands property.
     */
    public List<String> getDeleteCommands() {
        return this.deleteCommands;
    }
    
    /**
     * Getter for the updateCommands property.
     * 
     * @see updateCommands
     * @return the updateCommands property.
     */
    public List<String> getUpdateCommands() {
        return this.updateCommands;
    }
    
    /**
     * Setter for the insertCommands property.
     * 
     * @see insertCommands
     * @param insertStmts the insertCommands to set
     */
    
    public void addInsertCommands(final List<String> insertStmts) {
        this.insertCommands.addAll(insertStmts);
    }
    
    /**
     * Setter for the deleteCommands property.
     * 
     * @see deleteCommands
     * @param deleteStmts the deleteCommands to set
     */
    
    public void addDeleteCommands(final List<String> deleteStmts) {
        this.deleteCommands.addAll(deleteStmts);
    }
    
    /**
     * Setter for the updateCommands property.
     * 
     * @see updateCommands
     * @param updateStmts the updateCommands to set
     */
    
    public void addUpdateCommands(final List<String> updateStmts) {
        this.updateCommands.addAll(updateStmts);
    }
    
    /**
     * Getter for the afmDocCommands property.
     * 
     * @see afmDocCommands
     * @return the afmDocCommands property.
     */
    public List<String> getAfmDocCommands() {
        return this.afmDocCommands;
    }
    
    /**
     * Adds to afmDocCommands property.
     * 
     * @see afmDocCommands
     * @param updateStmts the updateCommands to set
     */
    
    public void addAfmDocCommands(final List<String> updateStmts) {
        this.afmDocCommands.addAll(updateStmts);
    }
}
