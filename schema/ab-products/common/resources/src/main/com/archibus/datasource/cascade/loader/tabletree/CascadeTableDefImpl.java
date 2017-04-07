package com.archibus.datasource.cascade.loader.tabletree;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.cascade.sqlbuilder.SqlCommandsStore;
import com.archibus.schema.*;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.StringUtil;

/**
 * 
 * Provides methods that implements the tables tree that cascades once a Primary Key is updated or
 * deleted.
 * 
 * @author Catalin Purice
 * 
 */
public class CascadeTableDefImpl implements CascadeTableDef {
    
    /**
     * root SQL restriction.
     */
    private String levelSqlRestriction;
    
    /**
     * Name of the table.
     */
    private final String name;
    
    /**
     * Parent table.
     */
    private CascadeTableDefImpl parent;
    
    /**
     * Foreign keys from child table to parent table.
     */
    private List<ForeignKeyRestriction> fkeys;
    
    /**
     * Foreign keys from child table to parent table that are primary keys in child.
     */
    private List<ForeignKeyRestriction> fkpkeys;
    
    /**
     * Child tables.
     */
    private final List<CascadeTableDef> children;
    
    /**
     * true if the table is root.
     */
    private boolean isTableRoot;
    
    /**
     * true if the table is root.
     */
    private final List<ArchibusFieldDefBase.Immutable> docFields;
    
    /**
     * SQL commands.
     */
    private SqlCommandsStore sqlCommands;
    
    /**
     * Processing index.
     */
    private int level;
    
    /**
     * Constructor.
     * 
     * @param name name of the table
     */
    public CascadeTableDefImpl(final String name) {
        this.name = name;
        this.isTableRoot = true;
        this.sqlCommands = new SqlCommandsStore();
        this.children = new LinkedList<CascadeTableDef>();
        this.docFields = new ArrayList<ArchibusFieldDefBase.Immutable>();
        loadDocumentFields();
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
     * {@inheritDoc}
     */
    public void addChild(final CascadeTableDef node, final List<ForeignKeyRestriction> foreignKeys,
            final List<ForeignKeyRestriction> foreignKeysPKeys) {
        ((CascadeTableDefImpl) node).fkeys = foreignKeys;
        ((CascadeTableDefImpl) node).fkpkeys = foreignKeysPKeys;
        ((CascadeTableDefImpl) node).parent = this;
        ((CascadeTableDefImpl) node).isTableRoot = false;
        this.children.add(node);
    }
    
    /**
     * Getter for the parentName property.
     * 
     * @see parent
     * @return the parent property.
     */
    public CascadeTableDefImpl getParent() {
        return this.parent;
    }
    
    /**
     * Return true if the node has a parent. False is returned in case the node is the root.
     * 
     * @return boolean
     */
    public boolean hasParent() {
        return StringUtil.notNullOrEmpty(this.parent);
    }
    
    /**
     * Return true if the node has a parent. False is returned in case the node is the root.
     * 
     * @return boolean
     */
    public boolean hasChildren() {
        return !this.children.isEmpty();
    }
    
    /**
     * Getter for the fkeys property.
     * 
     * @see fkeys
     * @return the fkeys property.
     */
    public List<ForeignKeyRestriction> getForeignKeys() {
        return this.fkeys;
    }
    
    /**
     * Getter for the isRoot property.
     * 
     * @see isRoot
     * @return the isRoot property.
     */
    public boolean isRoot() {
        return this.isTableRoot;
    }
    
    /**
     * Getter for the tableDef property.
     * 
     * @see tableDef
     * @return the tableDef property.
     */
    public ThreadSafe getTableDef() {
        return ContextStore.get().getProject().loadTableDef(this.name);
    }
    
    /**
     * {@inheritDoc}
     */
    public List<? extends CascadeTableDef> getChildren() {
        return Collections.unmodifiableList(this.children);
    }
    
    /**
     * Adds SQL command for table.
     * 
     * @param dmlCommand generated sqlCommand
     */
    public void setSqlCommand(final SqlCommandsStore dmlCommand) {
        this.sqlCommands = dmlCommand;
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
     * {@inheritDoc}
     */
    public List<String> getChildrenNames() {
        final List<String> childrenNames = new ArrayList<String>();
        for (final CascadeTableDef child : this.children) {
            childrenNames.add(child.getName());
        }
        return Collections.unmodifiableList(childrenNames);
    }
    
    /**
     * Loads document fields.
     */
    private void loadDocumentFields() {
        for (final ArchibusFieldDefBase.Immutable fieldDef : getTableDef().getFieldsList()) {
            if (fieldDef.isDocument()) {
                this.docFields.add(fieldDef);
            }
        }
    }
    
    /**
     * Getter for the docFields property.
     * 
     * @see docFields
     * @return the docFields property.
     */
    public List<ArchibusFieldDefBase.Immutable> getDocFields() {
        return this.docFields;
    }
    
    /**
     * 
     * Has document fields.
     * 
     * @return boolean
     */
    public boolean hasDocFields() {
        return !getDocFields().isEmpty();
    }
    
    /**
     * Getter for the levelSqlRestriction property.
     * 
     * @see levelSqlRestriction
     * @return the levelSqlRestriction property.
     */
    public String getLevelRestriction() {
        return this.levelSqlRestriction;
    }
    
    /**
     * Setter for the rootSqlRestriction property.
     * 
     * @see rootSqlRestriction
     * @param levelRestriction the rootSqlRestriction to set
     */
    
    public void setLevelSqlRestriction(final String levelRestriction) {
        this.levelSqlRestriction = levelRestriction;
    }
    
    /**
     * 
     * Getter for fkpkeys property.
     * 
     * @return the fkpkeys property
     */
    public List<ForeignKeyRestriction> getPrimaryKeysFKeys() {
        return this.fkpkeys;
    }
    
    /**
     * returns all foreign keys.
     * 
     * @return foreign keys
     */
    public List<ForeignKeyRestriction> getAllForeignKeys() {
        final List<ForeignKeyRestriction> allFKeys = new ArrayList<ForeignKeyRestriction>();
        if (!this.fkpkeys.isEmpty()) {
            allFKeys.addAll(this.fkpkeys);
        }
        if (!this.fkeys.isEmpty()) {
            allFKeys.addAll(this.fkeys);
        }
        return allFKeys;
    }
    
    /**
     * returns true if the table has primary key dependency with parent table.
     * 
     * @return boolean
     */
    public boolean hasPrimaryKeyReference() {
        return this.fkpkeys != null && !this.fkpkeys.isEmpty();
    }
    
    /**
     * {@inheritDoc}
     */
    public boolean isNewRecord() {
        return !this.sqlCommands.getInsertCommands().isEmpty();
    }
    
    /**
     * {@inheritDoc}
     */
    public boolean isDeleteRecord() {
        return !this.sqlCommands.getDeleteCommands().isEmpty();
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
}