package com.archibus.datasource.cascade.loader.tabletree;

import com.archibus.schema.ForeignKey;

/**
 * 
 * Used to build SQL commands. This class holds SQL restriction by foreign key description.
 * 
 * @author Catalin Purice
 * 
 */
public class ForeignKeyRestriction {
    
    /**
     * Foreign key.
     */
    private ForeignKey.Immutable foreignKey;
    
    /**
     * SQL restriction corresponding to foreign key.
     */
    private String sqlRestriction;
    
    /**
     * Getter for the sqlRestriction property.
     * 
     * @see sqlRestriction
     * @return the sqlRestriction property.
     */
    public String getSqlRestriction() {
        return this.sqlRestriction;
    }
    
    /**
     * Getter for the foreignKey property.
     * 
     * @see foreignKey
     * @return the foreignKey property.
     */
    public ForeignKey.Immutable getForeignKey() {
        return this.foreignKey;
    }
    
    /**
     * Setter for the foreignKey property.
     * 
     * @see foreignKey
     * @param foreignKey the foreignKey to set
     */
    
    public void setForeignKey(final ForeignKey.Immutable foreignKey) {
        this.foreignKey = foreignKey;
    }
    
    /**
     * Setter for the sqlRestriction property.
     * 
     * @see sqlRestriction
     * @param sqlRestriction the sqlRestriction to set
     */
    
    public void setSqlRestriction(final String sqlRestriction) {
        this.sqlRestriction = sqlRestriction;
    }
}
