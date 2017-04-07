package com.archibus.app.sysadmin.updatewizard.schema.job;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.loader.*;
import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.compare.CompareFieldDef;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardUtilities;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.*;
import com.archibus.schema.TableDef;
import com.archibus.utility.ListWrapper;

/**
 * Compare ARCHIBUS data dictionary against physical database and saves the results into
 * afm_transfer_set/afm_flds_trans tables.
 * 
 * @author Catalin Purice
 * 
 */
public class CompareJob extends JobBase {
    
    /**
     * Constant.
     */
    private static final String ALL_FLDS = "*all*";
    
    /**
     * Include validated tables.
     */
    private final transient boolean includeVTables;
    
    /**
     * Like wild card.
     */
    private final transient String likeWildcard;
    
    /**
     * Update tables modified by PUW only.
     */
    private final transient boolean puwTables;
    
    /**
     * recreate foreign key.
     */
    private final transient boolean recreateFKs;
    
    /**
     * Recreate table.
     */
    private final transient boolean recreateTable;
    
    /**
     * Constructor.
     * 
     * @param likeWildcard @see {@link CompareJob#likeWildcard}
     * @param includeVTables @see {@link CompareJob#includeVTables}
     * @param recreateTable @see {@link CompareJob#recreateTable}
     * @param puwTables @see {@link CompareJob#puwTables}
     * @param recreateFKs @see {@link CompareJob#recreateFKs}
     */
    public CompareJob(final String likeWildcard, final boolean includeVTables,
            final boolean recreateTable, final boolean puwTables, final boolean recreateFKs) {
        super();
        this.likeWildcard = likeWildcard;
        this.includeVTables = includeVTables;
        this.recreateTable = recreateTable;
        this.puwTables = puwTables;
        this.recreateFKs = recreateFKs;
    }
    
    /**
     * sets tables list and compare fields.
     */
    @Override
    public void run() {
        ContextStore.get().getProject().clearCachedTableDefs();
        
        List<TableProperties> tables = null;
        TablesLoader archSelectedTables =
                new TablesLoader(null, this.likeWildcard, this.includeVTables, false);
        
        if (this.puwTables) {
            archSelectedTables = archSelectedTables.getTablesChangedByProjUpWiz();
        } else {
            archSelectedTables = archSelectedTables.getTablesFromDataDict(false);
        }
        tables = archSelectedTables.getTablesProp();
        checkTablesToBeDropped(archSelectedTables.getLikeRestriction());
        compareTables(tables);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Includes into afm_flds_trans table fields that are missing.
     * 
     * @param restriction Restriction generated from like wild card.
     */
    private void checkTablesToBeDropped(final String restriction) {
        String restrict = " AND " + "(" + restriction + ")";
        if (restriction.length() == 0) {
            restrict = "";
        }
        final List<String> tablesMissingFromArchibus =
                DatabaseSchemaUtilities.getMissingTablesFromArchibus(restrict);
        for (final String tableName : tablesMissingFromArchibus) {
            ProjectUpdateWizardUtilities.insertIntoAfmFldsTransWhenDrop(tableName, ALL_FLDS);
            ProjectUpdateWizardUtilities.insertIntoAfmTransferSetWhenDrop(tableName);
        }
    }
    
    /**
     * Includes into afm_flds_trans table fields that are missing from ARCHIBUS schema.
     * 
     * @param sqlTableDef SQL table definition
     */
    private void checkFieldsToBeDropped(final DatabaseSchemaTableDef sqlTableDef) {
        final List<String> fieldsToBeDropped =
                DatabaseSchemaUtilities.getMissingFieldsFromArchibus(sqlTableDef.getTableName());
        
        if (!fieldsToBeDropped.isEmpty()) {
            ProjectUpdateWizardUtilities.insertIntoAfmTransferSetWhenDrop(sqlTableDef
                .getTableName());
            for (final String fieldName : fieldsToBeDropped) {
                ProjectUpdateWizardUtilities.insertIntoAfmFldsTransWhenDrop(
                    sqlTableDef.getTableName(), fieldName);
            }
        }
    }
    
    /**
     * @param sqlTableDef sql table definition
     * @param archibusTableDef archibus table definition
     * @param fieldNames field names
     * @return true if table is changed or false otherwise
     */
    private boolean checkFields(final DatabaseSchemaTableDef sqlTableDef,
            final TableDef.ThreadSafe archibusTableDef,
            final ListWrapper.Immutable<String> fieldNames) {
        CompareFieldDef compareFields;
        boolean tableChanged = false;
        checkFieldsToBeDropped(sqlTableDef);
        compareFields = new CompareFieldDef(sqlTableDef, archibusTableDef, "PRIMARY KEY");
        if (compareFields.hasPrimaryKeysChanged()) {
            tableChanged = true;
            ProjectUpdateWizardUtilities.insertIntoAfmFldsTrans(compareFields, true, false);
        }
        compareFields = new CompareFieldDef(sqlTableDef, archibusTableDef, "FOREIGN KEY");
        
        if (!this.recreateFKs && compareFields.hasForeignKeysChanged()) {
            tableChanged = true;
            ProjectUpdateWizardUtilities.insertIntoAfmFldsTrans(compareFields, false, true);
        }
        
        for (final String fieldName : fieldNames) {
            compareFields = new CompareFieldDef(sqlTableDef, archibusTableDef, fieldName);
            if (compareFields.isNew()) {
                tableChanged = true;
                ProjectUpdateWizardUtilities.insertIntoAfmFldsTrans(compareFields, false, false);
            } else {
                compareFields.compareFieldProperties();
                // .setChangeMessage();
                if (compareFields.isChanged()) {
                    tableChanged = true;
                    ProjectUpdateWizardUtilities
                        .insertIntoAfmFldsTrans(compareFields, false, false);
                }
            }
        }
        return tableChanged;
    }
    
    /**
     * Verify table for differences.
     * 
     * @param table table properties
     */
    private void checkTable(final TableProperties table) {
        
        final Project.Immutable project = ContextStore.get().getProject();
        final DatabaseSchemaTableDef sqlTableDef =
                new DatabaseSchemaTableDef(table.getName()).loadTableFieldsDefn();
        final TableDef.ThreadSafe archibusTableDef = project.loadTableDef(table.getName());
        final ListWrapper.Immutable<String> fieldNames = archibusTableDef.getFieldNames();
        
        boolean tableChanged = false;
        
        if (sqlTableDef.exists()) {
            tableChanged = checkFields(sqlTableDef, archibusTableDef, fieldNames);
            if (tableChanged) {
                addRecordsForTable(table);
            } else if (this.recreateFKs) {
                addRecordsForRecreateAllFk(table);
            }
            if (!tableChanged) {
                // table has not been changed, so update the afm_flds.transfer_status
                ProjectUpdateWizardUtilities.setFieldsTransferStatusToNoAction(table.getName());
            }
        } else if (!SchemaUpdateWizardUtilities.isTableInAfmTransferSet(table.getName())) {
            ProjectUpdateWizardUtilities.insertIntoAfmTransferSet(table, false);
        }
        
    }
    
    /**
     * @param tables loaded tables
     */
    private void compareTables(final List<TableProperties> tables) {
        this.status.setTotalNumber(tables.size());
        int counter = 0;
        for (final TableProperties table : tables) {
            if (this.stopRequested) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                return;
            } else {
                // if alter table was selected check the differences
                if (this.recreateTable) {
                    addRecordsForRecreateTable(table);
                } else {
                    checkTable(table);
                }
                this.status.setCurrentNumber(++counter);
            }
        }
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Adds records to afm_transfer_set/afm_flds_trans table for specified table to indicate that FK
     * will be recreated.
     * 
     * @param table table properties
     */
    private void addRecordsForRecreateAllFk(final TableProperties table) {
        if (!SchemaUpdateWizardUtilities.isTableInAfmTransferSet(table.getName())) {
            ProjectUpdateWizardUtilities.insertIntoAfmTransferSet(table, false);
        }
        ProjectUpdateWizardUtilities.insertIntoAfmFldsTransWhenRecreate(table, this.recreateTable);
    }
    
    /**
     * Adds records to afm_transfer_set/afm_flds_trans table for specified table.
     * 
     * @param table table properties
     */
    private void addRecordsForTable(final TableProperties table) {
        if (!SchemaUpdateWizardUtilities.isTableInAfmTransferSet(table.getName())) {
            ProjectUpdateWizardUtilities.insertIntoAfmTransferSet(table, false);
        }
        if (this.recreateFKs) {
            ProjectUpdateWizardUtilities.insertIntoAfmFldsTransWhenRecreate(table,
                this.recreateTable);
        }
    }
    
    /**
     * Adds records to afm_transfer_set/afm_flds_trans table for specified table to indicate that
     * table is to be recreated.
     * 
     * @param table table properties
     */
    private void addRecordsForRecreateTable(final TableProperties table) {
        if (table.isTableInSql()) {
            ProjectUpdateWizardUtilities.insertIntoAfmTransferSet(table, false);
            ProjectUpdateWizardUtilities.insertIntoAfmFldsTransWhenRecreate(table,
                this.recreateTable);
        } else {
            ProjectUpdateWizardUtilities.insertIntoAfmTransferSet(table, false);
        }
    }
}
