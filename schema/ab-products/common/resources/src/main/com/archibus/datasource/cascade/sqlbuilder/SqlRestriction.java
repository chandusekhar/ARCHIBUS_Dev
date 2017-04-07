package com.archibus.datasource.cascade.sqlbuilder;

import java.util.List;

import com.archibus.datasource.cascade.CascadeHandler;
import com.archibus.datasource.cascade.common.*;
import com.archibus.datasource.cascade.loader.tabletree.*;
import com.archibus.datasource.data.*;
import com.archibus.utility.StringUtil;

/**
 * 
 * Provides methods that generates SQL restrictions between tables.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public class SqlRestriction {
    
    /**
     * Table definition.
     */
    private final CascadeTableDef cascadeTableDef;
    
    /**
     * Cascade handler.
     */
    private final CascadeHandler cHandler;
    
    /**
     * Constructor.
     * 
     * @param table table
     * @param handler root cascade handler
     */
    public SqlRestriction(final CascadeTableDef table, final CascadeHandler handler) {
        this.cascadeTableDef = table;
        this.cHandler = handler;
    }
    
    /**
     * Getter for the parent table name.
     * 
     * @return the parent table name property.
     */
    public String getParentTableName() {
        return this.cascadeTableDef.getParent().getName();
    }
    
    /**
     * Getter for the childTableName property.
     * 
     * @return the childTableName property.
     */
    public String getChildTableName() {
        return this.cascadeTableDef.getName();
    }
    
    /**
     * Getter for the rootRecords property.
     * 
     * @see rootRecord
     * @return the rootRecord property.
     */
    public DataRecord getRootRecord() {
        return this.cHandler.getParentRecord();
    }
    
    /**
     * Builds branch restriction.
     */
    public void buildBranchRestriction() {
        if (this.cascadeTableDef.isRoot()) {
            buildRootRestriction();
        } else {
            buildDeeperLevelRestriction();
        }
    }
    
    /**
     * 
     * build deeper level restriction.
     */
    private void buildDeeperLevelRestriction() {
        // build level restriction for children
        ForeignKeyRestriction fKeyRestriction = null;
        if (this.cascadeTableDef.hasPrimaryKeyReference()) {
            fKeyRestriction = this.cascadeTableDef.getPrimaryKeysFKeys().get(0);
        } else if (this.cascadeTableDef.hasChildren()) {
            fKeyRestriction = this.cascadeTableDef.getForeignKeys().get(0);
        }
        if (StringUtil.notNullOrEmpty(fKeyRestriction)) {
            final String concatForeignFields =
                    CascadeUtility.concatForeignFieldNames(fKeyRestriction.getForeignKey());
            final String inRestriction =
                    String.format(CascadeConstants.OP_IN_RESTRICTION_SQL, concatForeignFields,
                        this.cascadeTableDef.getParent().getLevelRestriction());
            final String concatPrimaryKeys =
                    CascadeUtility.concatPrimaryKeyFieldNames(this.cascadeTableDef.getTableDef());
            final String selectPksFromTable =
                    String.format(CascadeConstants.SELECT_TEMPLATE_SQL, concatPrimaryKeys,
                        this.cascadeTableDef.getName(), inRestriction);
            
            ((CascadeTableDefImpl) this.cascadeTableDef).setLevelSqlRestriction(selectPksFromTable);
        }
        setForeignKeyRestriction();
    }
    
    /**
     * 
     * Generates root SQL Restriction.
     * 
     */
    private void buildRootRestriction() {
        
        final String concatPrimaryKeys =
                CascadeUtility.concatPrimaryKeyFieldNames(this.cascadeTableDef.getTableDef());
        final List<String> fullPkFieldNames =
                CascadeUtility.getPrimaryKeyFields(this.getRootRecord());
        String restriction = "";
        for (final String fullPkFieldName : fullPkFieldNames) {
            final DataValue value = getRootRecord().findField(fullPkFieldName);
            if (this.cHandler.isCascadeUpdate()) {
                restriction +=
                        fullPkFieldName + CascadeConstants.EQUALS + value.getOldDbValue()
                                + CascadeConstants.AND;
            } else {
                restriction +=
                        fullPkFieldName + CascadeConstants.EQUALS + value.getDbValue()
                                + CascadeConstants.AND;
                
            }
        }
        final String selectPksFromRoot =
                String.format(CascadeConstants.SELECT_TEMPLATE_SQL, concatPrimaryKeys,
                    this.cascadeTableDef.getName(),
                    restriction.substring(0, restriction.lastIndexOf(CascadeConstants.AND)));
        
        ((CascadeTableDefImpl) this.cascadeTableDef).setLevelSqlRestriction(selectPksFromRoot);
    }
    
    /**
     * Set restriction for each foreign key.
     */
    private void setForeignKeyRestriction() {
        
        final List<ForeignKeyRestriction> fKeyRestrictions =
                ((CascadeTableDefImpl) this.cascadeTableDef).getAllForeignKeys();
        
        for (final ForeignKeyRestriction fKeyRestriction : fKeyRestrictions) {
            final String concatFKeys =
                    CascadeUtility.concatForeignFieldNames(fKeyRestriction.getForeignKey());
             
            final String restriction =
                    String.format(CascadeConstants.OP_IN_RESTRICTION_SQL, concatFKeys,
                        this.cascadeTableDef.getParent().getLevelRestriction());
            
            fKeyRestriction.setSqlRestriction(restriction);
        }
    }
    
    /**
     * 
     * getPrimaryKeyValueByIndex.
     * 
     * @param index index
     * @return data value
     */
    public DataValue getPrimaryKeyValueByIndex(final int index) {
        DataValue dtVal = null;
        if (this.cHandler.getParentRecord().getFields().size() >= index + 1) {
            dtVal = this.cHandler.getParentRecord().getFields().get(index);
        }
        return dtVal;
    }
}
