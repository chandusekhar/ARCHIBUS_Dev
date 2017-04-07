package com.archibus.datasource.cascade.loader;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.cascade.CascadeHandler;
import com.archibus.datasource.cascade.common.CascadeUtility;
import com.archibus.datasource.cascade.loader.tabletree.*;
import com.archibus.datasource.cascade.priority.*;
import com.archibus.datasource.cascade.sqlbuilder.*;
import com.archibus.schema.*;
import com.archibus.utility.ListWrapper.Immutable;

/**
 * Provides common and abstract methods for TablesLoderDeleteImpl and TablesLoaderUpdateImpl
 * classes.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public abstract class AbstractTablesLoader {
    
    /**
     * Logger to write messages to archibus.log.
     */
    protected final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * Table Name.
     */
    private final CascadeTableDef tablesTree;
    
    /**
     * Tables commands.
     */
    private final List<SqlExecPriorityUpdateImpl> tableCommands;
    
    /**
     * Circular references handler.
     */
    private final HandleCircularReferences circRef;
    
    /**
     * Cascade manager object.
     */
    private final CascadeHandler cascManager;
    
    /**
     * true if we are going to generate commands for ARCHIBUS document tables. This is used when
     * running on Sybase DB where the normal cascade process is done by DB engine itself. Use false
     * for other DB types.
     */
    private boolean generateSqlForDocOnly;
    
    /**
     * All tables from ARCHIBUS Data Dictionary.
     */
    private final List<String> allProjectTables = CascadeUtility.getProjectTableNames();
    
    /**
     * Constructor.
     * 
     * @param cascadeMan cascade manager
     */
    public AbstractTablesLoader(final CascadeHandler cascadeMan) {
        super();
        this.circRef = new HandleCircularReferences();
        this.tableCommands = new ArrayList<SqlExecPriorityUpdateImpl>();
        this.cascManager = cascadeMan;
        this.tablesTree = new CascadeTableDefImpl(cascadeMan.getParentTableName());
    }
    
    /**
     * Setter for the generateForDocOnly property.
     * 
     * @see generateForDocOnly
     * @param generateForDocOnly the generateForDocOnly to set
     */
    
    public void setGenerateForDocOnly(final boolean generateForDocOnly) {
        this.generateSqlForDocOnly = generateForDocOnly;
    }
    
    /**
     * Getter for the rootTableName property.
     * 
     * @see rootTableName
     * @return the rootTableName property.
     */
    public CascadeTableDef getRootTable() {
        return this.tablesTree;
    }
    
    /**
     * Getter for the tableCommands property.
     * 
     * @see tableCommands
     * @return the tableCommands property.
     */
    public List<SqlExecPriorityUpdateImpl> getTableCommands() {
        return this.tableCommands;
    }
    
    /**
     * Getter for the allProjectTables property.
     * 
     * @see allProjectTables
     * @return the allProjectTables property.
     */
    public List<String> getAllProjectTables() {
        return this.allProjectTables;
    }
    
    /**
     * Getter for the cascManager property.
     * 
     * @see cascManager
     * @return the cascManager property.
     */
    public CascadeHandler getCascManager() {
        return this.cascManager;
    }
    
    /**
     * Get all descendants tables of specified table name.
     * 
     * @param tableNode tables
     */
    protected void loadChildren(final CascadeTableDef tableNode) {
        
        if (tableNode.isRoot() && !SqlUtils.isSybase()) {
            this.circRef.addToCurrentBranch(tableNode.getName());
        }
        for (final String table : getAllProjectTables()) {
            
            final List<ForeignKeyRestriction> fkeys = new ArrayList<ForeignKeyRestriction>();
            final List<ForeignKeyRestriction> fkeyspk = new ArrayList<ForeignKeyRestriction>();
            
            if (determineForeignKeys(table, tableNode.getName(), fkeys, fkeyspk)) {
                
                if (!SqlUtils.isSybase()) {
                    this.circRef.handleCircularReferenceIfAny(table);
                    // if (this.circRef.hasCircularRef()) {
                    // break;
                    // } else {
                    this.circRef.addToCurrentBranch(table);
                    // }
                }
                final CascadeTableDef childTableDef = new CascadeTableDefImpl(table);
                
                tableNode.addChild(childTableDef, fkeys, fkeyspk);
                
                if (hasDependentChildren(childTableDef)) {
                    loadChildren(childTableDef);
                }
                
                if (!SqlUtils.isSybase()) {
                    this.circRef.removeFromCurrentBranch();
                }
            }
        }
    }
    
    /**
     * 
     * Decide if the table has dependent children.
     * 
     * @param childTableDef table definition
     * @return true if the table has children or false otherwise
     */
    abstract boolean hasDependentChildren(final CascadeTableDef childTableDef);
    
    /**
     * 
     * Generates foreign keys.
     * 
     * @param pTableName table name
     * @param refTable parent table name
     * @param fKeyRestrictions list of foreign keys
     * @param fKeyPKeyRestrictions list of foreign keys
     * @return if foreign key found true else false
     */
    protected boolean determineForeignKeys(final String pTableName, final String refTable,
            final List<ForeignKeyRestriction> fKeyRestrictions,
            final List<ForeignKeyRestriction> fKeyPKeyRestrictions) {
        
        boolean isRelated = false;
        
        final TableDef.ThreadSafe tableDefn =
                ContextStore.get().getProject().loadTableDef(pTableName);
        
        final Immutable<ForeignKey.Immutable> fKeys = tableDefn.getForeignKeys();
        
        for (final ForeignKey.Immutable fKey : fKeys) {
            if (refTable.equalsIgnoreCase(fKey.getReferenceTable())) {
                final ArchibusFieldDefBase.Immutable fieldDef =
                        tableDefn.getFieldDef(fKey.getName());
                if (isForeignKeyValid(fieldDef, fKey, fKeyRestrictions, fKeyPKeyRestrictions)) {
                    isRelated = true;
                }
            }
        }
        return isRelated;
    }
    
    /**
     * Gets children of indicated parent table. Called recursively.
     * 
     * @param table parent table
     */
    protected void buildSqlCommands(final CascadeTableDef table) {
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: Loading sql commands for table " + table.getName()
                    + ".");
        }
        
        loadSqlCommands(table);
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("Cascade Handler: Sql commands for table " + table.getName()
                    + " loaded successfully.");
        }
        
        final List<? extends CascadeTableDef> childrenTables = table.getChildren();
        
        for (final CascadeTableDef childTable : childrenTables) {
            buildSqlCommands(childTable);
        }
    }
    
    /**
     * Loads SQL commands for child table.
     * 
     * @param childTable child table definition
     */
    private void loadSqlCommands(final CascadeTableDef childTable) {
        final SqlRestriction sqlRestriction = new SqlRestriction(childTable, getCascManager());
        
        sqlRestriction.buildBranchRestriction();
        
        final SqlCommandsBuilder sqlCommandsBuilder =
                createCommandsBuilder(childTable, sqlRestriction);
        
        if (this.generateSqlForDocOnly) {
            if (childTable.hasDocFields()) {
                sqlCommandsBuilder.buildDocTablesSqlCommands();
            }
        } else {
            sqlCommandsBuilder.buildSqlCommands();
        }
        
        saveSqlCommands(childTable, sqlCommandsBuilder);
    }
    
    /**
     * 
     * Call the specific method for Delete or Update commands.
     * 
     * @param childTable child table
     * @param sqlRestriction SqlRestriction
     * @return SqlCommandsBuilder
     */
    abstract SqlCommandsBuilder createCommandsBuilder(final CascadeTableDef childTable,
            final SqlRestriction sqlRestriction);
    
    /**
     * 
     * Save the SQL Commands.
     * 
     * @param cascadeTable cascade table
     * @param sqlCommandsObject SQL builder object
     */
    abstract void saveSqlCommands(final CascadeTableDef cascadeTable,
            final SqlCommandsBuilder sqlCommandsObject);
    
    /**
     * 
     * Decide what Foreign Keys to consider.
     * 
     * @param fieldDef ARCHIBUD field definition
     * @param fKey current foreign key
     * @param fKeyRestrictions list of foreign keys
     * @param fKeyPKeysRestrictions list of foreign keys
     * @return true if the foreign key was added
     */
    
    private boolean isForeignKeyValid(final ArchibusFieldDefBase.Immutable fieldDef,
            final ForeignKey.Immutable fKey, final List<ForeignKeyRestriction> fKeyRestrictions,
            final List<ForeignKeyRestriction> fKeyPKeysRestrictions) {
        boolean isRelated = false;
        if (fieldDef.isValidateData()) {
            isRelated = true;
            addForeignKeys(fieldDef, fKey, fKeyRestrictions, fKeyPKeysRestrictions);
        }
        return isRelated;
    }
    
    /**
     * 
     * Decide what foreign keys to consider in cascade process.
     * 
     * @param fieldDef ARCHIBUS field definition
     * @param fKey foreign key
     * @param fKeyRestrictions list of foreign keys
     * @param fKeyPkRestrictions list of foreign keys
     */
    protected void addForeignKeys(final ArchibusFieldDefBase.Immutable fieldDef,
            final ForeignKey.Immutable fKey, final List<ForeignKeyRestriction> fKeyRestrictions,
            final List<ForeignKeyRestriction> fKeyPkRestrictions) {
        
        final ForeignKeyRestriction fkRestriction = new ForeignKeyRestriction();
        fkRestriction.setForeignKey(fKey);
        
        if (fieldDef.isPrimaryKey()) {
            fKeyPkRestrictions.add(fkRestriction);
        } else {
            fKeyRestrictions.add(fkRestriction);
        }
    }
    
    /**
     * 
     * Returns all SQL commands in dependency order.
     * 
     * @return List<String>
     */
    public List<String> getCascadeSqlCommands() {
        SqlExecPriority orderedSqlStmts = null;
        if (this.cascManager.isCascadeDelete()) {
            orderedSqlStmts = new SqlExecPriorityDeleteImpl(this.tablesTree);
        } else {
            orderedSqlStmts = new SqlExecPriorityUpdateImpl(this.tablesTree);
        }
        
        orderedSqlStmts.prioritize();
        
        return orderedSqlStmts.getSqlCommands();
    }
    
    /**
     * 
     * Returns all SQL commands which synchronize document tables.
     * 
     * @return List<String> of statements
     */
    public List<String> getCascadeDocTableSqlCommands() {
        SqlExecPriority orderedSqlStmts = null;
        if (this.cascManager.isCascadeDelete()) {
            orderedSqlStmts = new SqlExecPriorityDeleteImpl(this.tablesTree);
        } else {
            orderedSqlStmts = new SqlExecPriorityUpdateImpl(this.tablesTree);
        }
        
        return orderedSqlStmts.getDocumentSqlCommands();
    }
    
    /**
     * Load children only.
     */
    public void loadChildren() {
        loadChildren(getRootTable());
    }
    
    /**
     * 
     * Returns all postponed SQL commands. These commands will recreated the circular foreign keys
     * in ARCHIBUS and SQL DB if any.
     * 
     * @return List<String> of statements
     */
    public List<String> getPostponedCascadeSqlCommands() {
        return this.circRef.getPostponedStmts();
    }
}