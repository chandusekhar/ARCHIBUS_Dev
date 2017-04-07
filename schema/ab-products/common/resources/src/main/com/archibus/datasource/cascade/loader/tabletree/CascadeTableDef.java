package com.archibus.datasource.cascade.loader.tabletree;

import java.util.List;

import com.archibus.datasource.cascade.sqlbuilder.SqlCommandsStore;
import com.archibus.schema.TableDef.ThreadSafe;

/**
 * 
 * Interface to be implemented by classe CascadeTableDefImpl.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public interface CascadeTableDef {
    /**
     * 
     * @return name of the table
     */
    String getName();
    
    /**
     * 
     * Returns the foreigns keys for the current table.
     * 
     * @return List<ForeignKeyRestriction>
     */
    List<ForeignKeyRestriction> getForeignKeys();
    
    /**
     * 
     * Returns the foreigns keys that are primary keys for the current table.
     * 
     * @return List<ForeignKeyRestriction>
     */
    List<ForeignKeyRestriction> getPrimaryKeysFKeys();
    
    /**
     * 
     * Returns true if the table has children.
     * 
     * @return boolean
     */
    boolean hasChildren();
    
    /**
     * 
     * Gets the parent table.
     * 
     * @return CascadeTableDef
     */
    CascadeTableDef getParent();
    
    /**
     * Returns true if the table is not the root table.
     * 
     * @return boolean
     */
    boolean hasParent();
    
    /**
     * Has document fields.
     * 
     * @return boolean
     */
    boolean hasDocFields();
    
    /**
     * 
     * Returns true if the table is the root table.
     * 
     * @return boolean
     */
    boolean isRoot();
    
    /**
     * 
     * Gets ARCHIBUS table definition.
     * 
     * @return ThreadSafe
     */
    ThreadSafe getTableDef();
    
    /**
     * 
     * Adds child to the current table.
     * 
     * @param node child table
     * @param fkeys foreign keys of child table
     * @param pkfkeys foreign keys of child table
     */
    void addChild(CascadeTableDef node, List<ForeignKeyRestriction> fkeys,
            List<ForeignKeyRestriction> pkfkeys);
    
    /**
     * 
     * Gets children of this table.
     * 
     * @return List<? extends CascadeTableDef>
     */
    List<? extends CascadeTableDef> getChildren();
    
    /**
     * 
     * Gets children table names of this table. Used to compare.
     * 
     * @return List<String>
     */
    List<String> getChildrenNames();
    
    /**
     * Adds SQL commands to the table.
     * 
     * @param ddlCommand add cascadable SQL command for the current table
     */
    void setSqlCommand(SqlCommandsStore ddlCommand);
    
    /**
     * Get SQL commands for this table.
     * 
     * @return SQL commands
     */
    SqlCommandsStore getSqlCommands();
    
    /**
     * 
     * Gets the dependency level.
     * 
     * @return level index
     */
    int getLevel();
    
    /**
     * Sets the dependency level.
     * 
     * @param level index
     */
    void setLevel(int level);
    
    /**
     * Returns SQL Restriction property.
     * 
     * @return the levelSqlRestriction property.
     */
    String getLevelRestriction();
    
    /**
     * 
     * Has primary key dependency.
     * 
     * @return boolean
     */
    boolean hasPrimaryKeyReference();
    
    /**
     * 
     * The handler adds new record in the table.
     * 
     * @return boolean
     */
    boolean isNewRecord();
    
    /**
     * 
     * The handler delete a record in the table.
     * 
     * @return boolean
     */
    boolean isDeleteRecord();
}