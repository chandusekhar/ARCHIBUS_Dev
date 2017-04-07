package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.schema.*;
import com.archibus.utility.ListWrapper;

/**
 * Creates/drops physical foreign keys based on ARCHIBUS field definition.
 * 
 * @author Catalin Purice
 */
@SuppressWarnings("PMD.TooManyMethods")
public class ManageForeignKeys {
    
    /**
     * Output.
     */
    private SqlCommandOutput output;
    
    /**
     * sql table definition.
     */
    private DatabaseSchemaTableDef sqlTableDef;
    
    /**
     * sql table definition.
     */
    private final List<String> contraintsToDrop = new ArrayList<String>();
    
    /**
     * sql table definition.
     */
    private final List<String> contraintsToAdd = new ArrayList<String>();
    
    /**
     * Constructor.
     */
    public ManageForeignKeys() {
        // implicit constructor needed to avoid creating objects in a loop.
    }
    
    /**
     * Constructor.
     * 
     * @param sqlTableDef sql table definition
     * @param out output
     */
    public ManageForeignKeys(final DatabaseSchemaTableDef sqlTableDef, final SqlCommandOutput out) {
        this.sqlTableDef = sqlTableDef;
        this.output = out;
    }
    
    /**
     * Initialize members.
     * 
     * @param tableName table name
     * @param initOutput output
     */
    public void initializeObject(final String tableName, final SqlCommandOutput initOutput) {
        this.sqlTableDef = new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
        this.output = initOutput;
    }
    
    /**
     * Adds the specified foreign key.
     * 
     * @param foreignKey foreign key to be added
     * @return statement
     */
    public List<String> addFkey(final ForeignKey.Immutable foreignKey) {
        
        final String foreignTable = foreignKey.getForeignTable();
        final String constraintName =
                SchemaUpdateWizardUtilities.buildConstraintName(foreignTable, foreignKey.getName());
        List<String> stmtArray = new ArrayList<String>();
        final ValidateForeignKey fkChecker = new ValidateForeignKey(foreignKey);
        if (fkChecker.isValid() && !this.contraintsToAdd.contains(constraintName) 
                && !DatabaseSchemaUtilities.existsConstraint(constraintName)) {
            stmtArray = getAddFkeysStmts(foreignKey, constraintName);
        }
        return stmtArray;
    }
    
    /**
     * 
     * @param foreignKey foreign key
     * @param constraintName constraintName
     * @return add foreign key statement
     */
    private List<String> getAddFkeysStmts(final ForeignKey.Immutable foreignKey,
            final String constraintName) {
        final List<String> stmtArray = new ArrayList<String>();
        final String foreignTable = foreignKey.getForeignTable();
        
        String addFkeyStmt = SchemaUpdateWizardConstants.ALTER_TABLE;
        
        if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(foreignTable)) {
            addFkeyStmt +=
                    " " + SchemaUpdateWizardConstants.getSecureUser()
                            + SchemaUpdateWizardConstants.DOT;
        }
        addFkeyStmt += foreignTable;
        if (SqlUtils.isOracle() || SqlUtils.isSqlServer()) {
            addFkeyStmt += SchemaUpdateWizardConstants.ADD_CONSTRAINT;
        } else {
            addFkeyStmt += SchemaUpdateWizardConstants.ADD_FOREIGN_KEY;
        }
        
        addFkeyStmt += constraintName;
        
        this.contraintsToAdd.add(constraintName);
        
        if (SqlUtils.isOracle() || SqlUtils.isSqlServer()) {
            addFkeyStmt += SchemaUpdateWizardConstants.FOREIGN_KEY;
        }
        
        final ListWrapper.Immutable<String> fkCols = foreignKey.getForeignFields();
        addFkeyStmt +=
                SchemaUpdateWizardConstants.OPEN_BRACKET
                        + SchemaUpdateWizardUtilities.convertArrayToString(fkCols, ',')
                        + SchemaUpdateWizardConstants.CLOSE_BRACKET;
        
        final String refTable = foreignKey.getReferenceTable();
        addFkeyStmt += SchemaUpdateWizardConstants.REFERENCES + refTable;
        
        final ListWrapper.Immutable<String> refTablePkCols = foreignKey.getPrimaryColumns();
        addFkeyStmt +=
                SchemaUpdateWizardConstants.OPEN_BRACKET
                        + SchemaUpdateWizardUtilities.convertArrayToString(refTablePkCols, ',')
                        + SchemaUpdateWizardConstants.CLOSE_BRACKET;
        
        if (SqlUtils.isSybase()) {
            addFkeyStmt = SybaseActions.setCascadeAndSetNull(foreignKey, foreignTable, addFkeyStmt);
        }
        stmtArray.add(addFkeyStmt);
        
        if (SqlUtils.isOracle()) {
            OracleActions.grantOracleTableRights(foreignTable, refTable, stmtArray, this.output);
        }
        return stmtArray;
        
    }
    
    /**
     * Drops all foreign keys from and to table.
     * 
     * @param sysTableDef
     */
    public void dropAllFKeysFromAndToTable() {
        
        if (this.sqlTableDef.exists()) {
            // Drop ALL the foreign keys from this table to other tables
            dropForeignKeysFromTableToTable(this.sqlTableDef, null);
            
            final String tableName = this.sqlTableDef.getTableName().toUpperCase();
            final List<String> validTables =
                    DatabaseSchemaUtilities.getSQLValidatedTables(tableName);
            
            for (final String vTableName : validTables) {
                final DatabaseSchemaTableDef vTableDef = new DatabaseSchemaTableDef(vTableName).loadTableFieldsDefn();
                
                // drop FK keys from sysTableDef to sysTableDefTo
                dropForeignKeysFromTableToTable(vTableDef, this.sqlTableDef);
            }
        }
    }
    
    /**
     * Drops the foreign key.
     * 
     * @param foreignKey Foreign Key
     */
    public void dropForeignKey(final DatabaseSchemaForeignKeyDef foreignKey) {
        if (!this.contraintsToDrop.contains(foreignKey.getRole())) {
            this.contraintsToDrop.add(foreignKey.getRole());
            this.output.runCommand(buildDropFkStmt(foreignKey.getTableName(), foreignKey.getRole()), 
                DataSource.DB_ROLE_SCHEMA);
        }
    }
    
    /**
     * Adds constraints already dropped.
     * 
     * @param droppedConstraints constraints already dropped
     */
    protected void addDroppedContraints(final List<String> droppedConstraints) {
        this.contraintsToDrop.addAll(droppedConstraints);
    }

    /**
     * Adds constraints already created.
     * 
     * @param addedConstraints constraints already created
     */
    protected void addCreatedContraints(final List<String> addedConstraints) {
        this.contraintsToAdd.addAll(addedConstraints);
    }

    /**
     * Getter for the contraintsToDrop property.
     * 
     * @see contraintsToDrop
     * @return the contraintsToDrop property.
     */
    protected List<String> getContraintsToDrop() {
        return contraintsToDrop;
    }

    /**
     * Getter for the contraintsToAdd property.
     * 
     * @see contraintsToAdd
     * @return the contraintsToAdd property.
     */
    protected List<String> getContraintsToAdd() {
        return contraintsToAdd;
    }

    /**
     * Drops foreign keys from one table to another. Both Tables should exist in the database.
     * 
     * @param sysTableDefFrom from sql table definition
     * @param sysTableDefTo to sql table definition
     */
    private void dropForeignKeysFromTableToTable(final DatabaseSchemaTableDef sysTableDefFrom,
            final DatabaseSchemaTableDef sysTableDefTo) {
        
        boolean hasToTable = false;
        final String tableNameFrom = sysTableDefFrom.getTableName().toUpperCase();
        String tableNameTo = "";
        
        if (sysTableDefTo != null) {
            hasToTable = true;
            tableNameTo = sysTableDefTo.getTableName().toUpperCase();
        }
        
        final List<DatabaseSchemaForeignKeyDef> foreignKeysFrom = sysTableDefFrom.getFKeysDefn();
        
        if (foreignKeysFrom != null) {
            // drop foreign key form tableName
            runDropForeignKeyStmt(tableNameFrom, tableNameTo, foreignKeysFrom, hasToTable);
        }
    }
    
    /**
     * 
     * @param tableNameFrom from table
     * @param tableNameTo to table
     * @param foreignKeysFrom foreign key
     * @param hasToTable has to table defined
     */
    private void runDropForeignKeyStmt(final String tableNameFrom, final String tableNameTo,
            final List<DatabaseSchemaForeignKeyDef> foreignKeysFrom, final boolean hasToTable) {
        
        for (final DatabaseSchemaForeignKeyDef fkey : foreignKeysFrom) {
            final String constraintName = fkey.getRole();
            if (!this.contraintsToDrop.contains(constraintName)) {
                
                final String refTable = fkey.getReferencedTableName();
                if (hasToTable && !refTable.equalsIgnoreCase(tableNameTo)) {
                    continue;
                }

                if (DatabaseSchemaUtilities.existsConstraint(constraintName)) {
                    this.contraintsToDrop.add(constraintName);
                    this.output.runCommand(buildDropFkStmt(tableNameFrom, constraintName), DataSource.DB_ROLE_SCHEMA);
                }
            }
        }
    }

    /**
     * Builds Drop statement.
     * 
     * @param tableName table name
     * @param constraintName contraint name
     * @return statement
     */
    private String buildDropFkStmt(final String tableName, final String constraintName) {
        String dropConstraintStmt = SchemaUpdateWizardConstants.ALTER_TABLE;
        if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(tableName)) {
            dropConstraintStmt += SchemaUpdateWizardConstants.getSecureUser() + SchemaUpdateWizardConstants.DOT;
        }
        dropConstraintStmt += tableName;
        if (SqlUtils.isOracle() || SqlUtils.isSqlServer()) {
            dropConstraintStmt += SchemaUpdateWizardConstants.DROP_CONSTRAINT;
        } else {
            dropConstraintStmt += SchemaUpdateWizardConstants.DELETE_FKEY;
        }
        dropConstraintStmt += constraintName;
        return dropConstraintStmt;
    }
    
    
    /**
     * Recreates all Foreign keys from tableDefFrom to validTableNames.
     * 
     * @param tableDefFrom archibus table definition
     * @return recreate foreign keys statements
     */
    protected List<String> createAllForeignKeys(final TableDef.ThreadSafe tableDefFrom) {
        final List<String> addFKeysFromTableStmts = addFKeysFromTable();
        final String tableName = this.sqlTableDef.getTableName();
        final List<String> validTableNames =
                SchemaUpdateWizardUtilities.getARCHValidatedTables(tableName);
        final String foreignTable = tableDefFrom.getName();
        final List<String> addFKeyStmts = new ArrayList<String>();
        for (final String vTableName : validTableNames) {
            //if (!fKeysAlreadyCreated.contains(vTableName)) {
                final TableDef.ThreadSafe vTableDef =
                        ContextStore.get().getProject().loadTableDef(vTableName);
                final ForeignKey.Immutable fkey =
                        vTableDef.findForeignKeyByReferenceTable(foreignTable);
                addFKeyStmts.addAll(addFkey(fkey));
            //}
        }
        final List<String> allStmts = addFKeysFromTableStmts;
        allStmts.addAll(addFKeyStmts);
        return allStmts;
    }
    
    /**
     * Add foreign keys from the specified table.
     * 
     * @return statements
     */
    private List<String> addFKeysFromTable() {
        final List<String> addFKeyStmts = new ArrayList<String>();
        final String tableName = this.sqlTableDef.getTableName();
        final TableDef.ThreadSafe tableDef =
                ContextStore.get().getProject().loadTableDef(tableName);
        final ListWrapper.Immutable<ForeignKey.Immutable> foreignKeys =
                SchemaUpdateWizardUtilities.getValidatedForeignKeys(tableDef);
        
        for (final ForeignKey.Immutable foreignKey : foreignKeys) {
            final List<String> addFKeyStmt = addFkey(foreignKey);
            addFKeyStmts.addAll(addFKeyStmt);
        }
        return addFKeyStmts;
    }
}