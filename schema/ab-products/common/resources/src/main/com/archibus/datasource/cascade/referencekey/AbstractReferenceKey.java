package com.archibus.datasource.cascade.referencekey;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.cascade.common.*;
import com.archibus.datasource.data.DataRecord;

/**
 * 
 * Abstract class used by OracleReferenceKey/SqlServerReferenceKey/ArchibusReferenceKey.
 * 
 * @author Catalin Purice
 * @since 21.2
 * 
 */
public abstract class AbstractReferenceKey {
    
    /**
     * List of constraints.
     */
    protected final List<ForeignKey> foreignKeys = new ArrayList<ForeignKey>();
    
    /**
     * Getter for the constraintName property.
     * 
     * @see constraintName
     * @return the constraintName property.
     */
    public List<String> getConstraintsNames() {
        final List<String> constraintNames = new ArrayList<String>();
        for (final ForeignKey fKey : this.foreignKeys) {
            constraintNames.add(fKey.getConstraintName());
        }
        return constraintNames;
    }
    
    /**
     * Returns statement to disable the constraint.
     * 
     * @return String
     */
    abstract String getDisableTemplateStmt();
    
    /**
     * Returns statement to enable the constraint.
     * 
     * @return String
     */
    abstract String getEnableTemplateStmt();
    
    /**
     * Returns SQL that loads foreign keys.
     * 
     * @param tableName from table name
     * @param refTableName to table name
     * @return String
     */
    abstract String getForeignKeySql(final String tableName, final String refTableName);
    
    /**
     * Loads foreign keys between tables.
     * 
     * @param tableName from table name
     * @param refTableName to table name
     */
    public void loadForeignKeys(final String tableName, final String refTableName) {
        
        final DataSource foreignKeyDS = DataSourceFactory.createDataSource();
        foreignKeyDS.addTable(CascadeConstants.AFM_TBLS);
        foreignKeyDS.addQuery(getForeignKeySql(tableName, refTableName));
        foreignKeyDS.addVirtualField(CascadeConstants.AFM_TBLS, "constraint_name",
            DataSource.DATA_TYPE_TEXT);
        foreignKeyDS.addVirtualField(CascadeConstants.AFM_TBLS, "table_name",
            DataSource.DATA_TYPE_TEXT);
        foreignKeyDS.addVirtualField(CascadeConstants.AFM_TBLS, "field_name",
            DataSource.DATA_TYPE_TEXT);
        
        final List<DataRecord> records = foreignKeyDS.getRecords();
        
        for (final DataRecord record : records) {
            
            final String constraintName = record.getString("afm_tbls.constraint_name");
            final String enableStmt =
                    String.format(getEnableTemplateStmt(), tableName, constraintName);
            final String disableStmt =
                    String.format(getDisableTemplateStmt(), tableName, constraintName);
            addForeignKey(tableName, refTableName, constraintName, enableStmt, disableStmt);
        }
    }
    
    /**
     * 
     * Adds Foreign Keys.
     * 
     * @param tableName table name
     * @param refTableName referenced table name
     * @param constraintName constraint name
     * @param enableStmt enable constraint statement
     * @param disableStmt disable constraint statement
     */
    protected void addForeignKey(final String tableName, final String refTableName,
            final String constraintName, final String enableStmt, final String disableStmt) {
        this.foreignKeys.add(new ForeignKey(tableName, refTableName, constraintName, enableStmt,
            disableStmt));
    }
    
    /**
     * Get statements to disable constraints.
     * 
     * @return statements as List<String>
     */
    public List<String> getDisableConstraintsStmts() {
        final List<String> disableStmts = new ArrayList<String>();
        for (final ForeignKey fKey : this.foreignKeys) {
            disableStmts.add(fKey.getDisableStmt());
        }
        return disableStmts;
    }
    
    /**
     * Get statements to enable constraints.
     * 
     * @return statements as List<String>
     */
    public List<String> getEnableConstraintsStmts() {
        final List<String> enableStmts = new ArrayList<String>();
        for (final ForeignKey fKey : this.foreignKeys) {
            enableStmts.add(fKey.getEnableStmt());
        }
        return enableStmts;
    }
    
    /**
     * Disable constraint.
     */
    public void disable() {
        ExecuteSql.runCommands(getDisableConstraintsStmts());
    }
    
    /**
     * Enable constraint.
     */
    public void enable() {
        ExecuteSql.runCommands(getEnableConstraintsStmts());
    }
}
