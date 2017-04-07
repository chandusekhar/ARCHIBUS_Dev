package com.archibus.datasource.cascade.priority;

import com.archibus.datasource.cascade.sqlbuilder.SqlCommandsStore;

/**
 * 
 * This object contains minimal information needed to organize tables in execution order.
 * <p>
 *
 * @author Catalin Purice
 * @since 21.4
 *
 */
public class TablePriority {
    
    /**
     * Table name.
     */
    private String name;
    
    /**
     * Execution level.
     */
    private int level;
    
    /**
     * Execution index.
     */
    private int execIndex;
    
    /**
     * Has primary key defined as primary key?
     */
    private final boolean primaryKeyReference;
    
    /**
     * Sql commands for table.
     */
    private final SqlCommandsStore sqlCommands;
    
    /**
     * Default TODO constructor specifying TODO. Private default constructor: utility class is
     * non-instantiable.
     * 
     * @param name table name
     * @param level level
     * @param execIndex execution index
     * @param hasPkReference has PK References
     * @param sqlCommands sql commands
     */
    public TablePriority(final String name, final int level, final int execIndex,
            final boolean hasPkReference,
            final SqlCommandsStore sqlCommands) {
        super();
        this.name = name;
        this.level = level;
        this.execIndex = execIndex;
        this.primaryKeyReference = hasPkReference;
        this.sqlCommands = sqlCommands;
    }
    
    /**
     * Getter for the name property.
     * 
     * @see name
     * @return the name property.
     */
    public String getName() {
        return this.name;
    }
    
    /**
     * Setter for the name property.
     * 
     * @see name
     * @param name the name to set
     */
    
    public void setName(final String name) {
        this.name = name;
    }
    
    /**
     * Getter for the level property.
     * 
     * @see level
     * @return the level property.
     */
    public int getLevel() {
        return this.level;
    }
    
    /**
     * Setter for the level property.
     * 
     * @see level
     * @param level the level to set
     */
    
    public void setLevel(final int level) {
        this.level = level;
    }
    
    /**
     * Getter for the execIndex property.
     * 
     * @see execIndex
     * @return the execIndex property.
     */
    public int getExecutionIndex() {
        return this.execIndex;
    }
    
    /**
     * Setter for the execIndex property.
     * 
     * @see execIndex
     * @param executionIndex the execIndex to set
     */
    
    public void setExecutionIndex(final int executionIndex) {
        this.execIndex = executionIndex;
    }
    
    /**
     * Getter for the sqlCommands property.
     * 
     * @see sqlCommands
     * @return the sqlCommands property.
     */
    public SqlCommandsStore getSqlCommands() {
        return this.sqlCommands;
    }
    
    /**
     * Getter for the primaryKeyReference property.
     * 
     * @see primaryKeyReference
     * @return the primaryKeyReference property.
     */
    public boolean hasPrimaryKeyReference() {
        return this.primaryKeyReference;
    }
}
