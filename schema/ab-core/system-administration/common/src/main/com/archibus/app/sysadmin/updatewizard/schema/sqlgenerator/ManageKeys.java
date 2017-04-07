package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.datasource.DataSource;
import com.archibus.schema.TableDef;

/**
 * Keys manager.
 * 
 * @author Catalin Purice
 * 
 */
public class ManageKeys {
    
    /**
     * Foreign keys manager.
     */
    private ManageForeignKeys manageFk;
    
    /**
     * Primary keys manager.
     */
    private ManagePrimaryKeys managePk;
    
    /**
     * ARCHIBUS table definition.
     */
    private TableDef.ThreadSafe archTableDef;
    
    /**
     * SQL table definition.
     */
    private DatabaseSchemaTableDef sqlTableDef;
    
    /**
     * Output.
     */
    private SqlCommandOutput output;
    
    /**
     * Constructor.
     */
    public ManageKeys() {
        this.manageFk = new ManageForeignKeys();
        this.managePk = new ManagePrimaryKeys();
    }
    
    /**
     * 
     * @param archTableDef ARCHIBUS table definition
     * @param out out
     */
    public ManageKeys(final TableDef.ThreadSafe archTableDef, final SqlCommandOutput out) {
        this.archTableDef = archTableDef;
        this.sqlTableDef = new DatabaseSchemaTableDef(archTableDef.getName());
        this.output = out;
        this.manageFk = new ManageForeignKeys(this.sqlTableDef, out);
        this.managePk = new ManagePrimaryKeys(archTableDef.getName(), out);
    }
    
    /**
     * @param out the output to set
     */
    public void setManagerKeysOutput(final SqlCommandOutput out) {
        this.output = out;
    }
    
    /**
     * @param sqlTDef the sqlTableDef to set
     */
    public void setManagerSqlTableDef(final DatabaseSchemaTableDef sqlTDef) {
        this.sqlTableDef = sqlTDef;
        this.manageFk = new ManageForeignKeys(sqlTDef, this.output);
        this.managePk = new ManagePrimaryKeys(sqlTDef.getTableName(), this.output);
    }
    
    /**
     * Recreates all foreign keys from to table.
     * 
     * @param dropFks weather or not to also drop the FKs
     * @return statements
     */
    public List<String> recreateAllFK(final boolean dropFks) {
        if (dropFks) {
            this.manageFk.dropAllFKeysFromAndToTable();
        }
        return this.manageFk.createAllForeignKeys(this.archTableDef);
    }
    
    /**
     * 
     * Creates foreign keys from and to table.
     */
    public void createAllForeignKeys() {
        this.output.runCommandsNoException(this.manageFk.createAllForeignKeys(this.archTableDef));
    }

    /**
     * Drops all Foreign keys from and to table.
     */
    public void dropAllFK() {
        this.manageFk.dropAllFKeysFromAndToTable();
    }
    
    /**
     * Adds constraints already dropped.
     * 
     * @param droppedConstraints constraints already dropped
     */
    public void addDroppedContraints(final List<String> droppedConstraints) {
        this.manageFk.addDroppedContraints(droppedConstraints);
    }

    /**
     * Adds constraints already dropped.
     * 
     * @param addedConstraints constraints already dropped
     */
    public void addCreatedContraints(final List<String> addedConstraints) {
        this.manageFk.addCreatedContraints(addedConstraints);
    }

    /**
     * @return names of foreign keys dropped
     */
    public List<String> getDroppedForeignKeysContraints() {
        return this.manageFk.getContraintsToDrop();
    }
    
    /**
     * @return names of foreign keys added
     */
    public List<String> getAddedForeignKeysContraints() {
        return this.manageFk.getContraintsToAdd();
    }

    /**
     * Create primary key.
     */
    public void reCreatePrimaryKeys() {
        this.managePk.dropAllPrimaryKey();
        final String stmts = this.managePk.createAllPrimaryKeys(true);
        this.output.runCommand(stmts, DataSource.DB_ROLE_SCHEMA);
    }
    
    /**
     * Drops primary keys.
     */
    public void dropPrimaryKeys() {
        this.managePk.dropAllPrimaryKey();
    }
    
    /**
     * Creates primary keys.
     * 
     * @param isCreateSequence create or not the sequence for Oracle
     */
    public void createPrimaryKeys(final boolean isCreateSequence) {
        final String createPkStmt = this.managePk.createAllPrimaryKeys(isCreateSequence);
        this.output.runCommand(createPkStmt, DataSource.DB_ROLE_SCHEMA);
    }
    
    /**
     * drop specified foreign keys.
     * 
     * @param sqlFkeys foreign keys
     */
    public void dropForeignKeys(final List<DatabaseSchemaForeignKeyDef> sqlFkeys) {
        for (final DatabaseSchemaForeignKeyDef sqlFkey : sqlFkeys) {
            if (DatabaseSchemaUtilities.existsConstraint(sqlFkey.getRole())) {
                this.manageFk.dropForeignKey(sqlFkey);
                addDroppedContraints(new ArrayList<String>(Arrays.asList(sqlFkey.getRole())));
            }
        }
    }
}
