package com.archibus.datasource.cascade.referencekey;

/**
 * 
 * Object that keeps foreign keys information.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.2
 * 
 */
public class ForeignKey {
    
    /**
     * FK from table name.
     */
    private final String tableName;
    
    /**
     * Referenced table name.
     */
    private final String refTableName;
    
    /**
     * List of constraints.
     */
    private final String constraintName;
    
    /**
     * Disable statement.
     */
    private final String disableStmt;
    
    /**
     * Disable statement.
     */
    private final String enableStmt;
    
    /**
     * 
     * Constructor.
     * 
     * @param tableName table name
     * @param refTableName referenced table name
     * @param constraintName constraint name
     * @param enableStmt enable statement
     * @param disableStmt disable statement
     */
    public ForeignKey(final String tableName, final String refTableName,
            final String constraintName, final String enableStmt, final String disableStmt) {
        super();
        this.tableName = tableName;
        this.refTableName = refTableName;
        this.constraintName = constraintName;
        this.enableStmt = enableStmt;
        this.disableStmt = disableStmt;
    }
    
    /**
     * Getter for the refTableName property.
     * 
     * @see refTableName
     * @return the refTableName property.
     */
    public String getRefTableName() {
        return this.refTableName;
    }
    
    /**
     * Getter for the disableStmt property.
     * 
     * @see disableStmt
     * @return the disableStmt property.
     */
    public String getDisableStmt() {
        return this.disableStmt;
    }
    
    /**
     * Getter for the tableName property.
     * 
     * @see tableName
     * @return the tableName property.
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * Getter for the enableStmt property.
     * 
     * @see enableStmt
     * @return the enableStmt property.
     */
    public String getEnableStmt() {
        return this.enableStmt;
    }
    
    /**
     * Getter for the constraintName property.
     * 
     * @see constraintName
     * @return the constraintName property.
     */
    public String getConstraintName() {
        return this.constraintName;
    }
}
