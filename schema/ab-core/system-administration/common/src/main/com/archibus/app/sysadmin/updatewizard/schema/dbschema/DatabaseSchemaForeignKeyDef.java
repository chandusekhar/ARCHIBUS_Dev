package com.archibus.app.sysadmin.updatewizard.schema.dbschema;

import java.util.List;

/**
 * Physical database foreign keys definition.
 * 
 * @author Catalin Purice
 * 
 */
public class DatabaseSchemaForeignKeyDef extends DatabaseSchemaFieldDef {
    
    /**
     * foreign fields.
     */
    private List<String> foreignFields;
    
    /**
     * table name.
     */
    private String foreignTableName;
    
    /**
     * primary key of referenced table.
     */
    private List<String> primaryColumns;
    
    /**
     * referenced table name.
     */
    private transient String refTableName;
    
    /**
     * Constraint Name.
     */
    private String role;
    
    /**
     * Constructor.
     * 
     * @param tableName table name
     */
    public DatabaseSchemaForeignKeyDef(final String tableName) {
        super(tableName);
    }
    
    /**
     * @return the foreignFields
     */
    public List<String> getForeignFields() {
        return this.foreignFields;
    }
    
    /**
     * @return the foreignTableName
     */
    public String getForeignTableName() {
        return this.foreignTableName.toLowerCase();
    }
    
    /**
     * @return the primaryColumns
     */
    public List<String> getPrimaryColumns() {
        return this.primaryColumns;
    }
    
    /**
     * @return the referencedTableName
     */
    public String getReferencedTableName() {
        return this.refTableName;
    }
    
    /**
     * @return the role
     */
    public String getRole() {
        return this.role;
    }
    
    /**
     * @param foreignFields the foreignFields to set
     */
    public void setForeignFields(final List<String> foreignFields) {
        this.foreignFields = foreignFields;
    }
    
    /**
     * @param foreignTableName the foreignTableName to set
     */
    public void setForeignTableName(final String foreignTableName) {
        this.foreignTableName = foreignTableName;
    }
    
    /**
     * @param primaryColumns the primaryColumns to set
     */
    public void setPrimaryColumns(final List<String> primaryColumns) {
        this.primaryColumns = primaryColumns;
    }
    
    /**
     * @param tableName the referenced table name to set
     */
    public void setReferencedTableName(final String tableName) {
        this.refTableName = tableName;
    }
    
    /**
     * @param role the role to set
     */
    public void setRole(final String role) {
        this.role = role;
    }
    
}
