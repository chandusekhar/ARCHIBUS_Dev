package com.archibus.app.sysadmin.updatewizard.schema.prepare;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.*;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.altertable.AddDropFields;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.schema.TableDef;
import com.archibus.utility.XmlImpl;

/**
 * Updates old schemas to 20.1 an upper versions.
 * 
 * @author Catalin Purice
 */
public class UpdateSchemaVersion {
    
    /**
     * Constant.
     */
    private static final String TRANSFER_STATUS = "transfer_status";
    
    /**
     * Constant.
     */
    private static final String CHANGED_CONDITION = "UPDATED,INSERTED";
    
    /**
     * Constant.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String INSERT_FLDS =
            "INSERT INTO AFM_FLDS(TABLE_NAME,FIELD_NAME,AFM_TYPE,ALLOW_NULL,COMMENTS,DATA_TYPE,DECIMALS,DEP_COLS,DFLT_VAL,EDIT_GROUP,EDIT_MASK,ENUM_LIST,IS_ATXT,MAX_VAL,MIN_VAL,ML_HEADING,AFM_MODULE,NUM_FORMAT,PRIMARY_KEY,REF_TABLE,REVIEW_GROUP,AFM_SIZE,SL_HEADING,STRING_FORMAT,IS_TC_TRACEABLE,FIELD_GROUPING)";
    
    /**
     * constant.
     */
    private static final String MIN_DB_VER_NUM = "121";
    
    /**
     * constant.
     */
    private static final String WFR_TABLE = "afm_wf_rules";
    
    /**
     * constant.
     */
    private static final String AFM_SCM_PREF_TABLE = "afm_scmpref";
    
    /**
     * constant.
     */
    private static final String AFM_DB_VER_NUM_FIELD = "afm_db_version_num";
    
    /**
     * constant.
     */
    private static final String AFM_DB_VER_NUM_FULL_FIELD_NAME = "afm_scmpref.afm_db_version_num";
    
    /**
     * the output.
     */
    private final transient SqlCommandOutput output;
    
    /**
     * 
     * @param output output
     */
    public UpdateSchemaVersion(final SqlCommandOutput output) {
        this.output = output;
    }
    
    /**
     * Gets current version number.
     * 
     * @return the version number
     */
    public static int getCurrentDbVersionNumber() {
        final DataSource dbVerDS =
                DataSourceFactory.createDataSource().addTable(AFM_SCM_PREF_TABLE)
                    .addField(AFM_DB_VER_NUM_FIELD);
        final DataRecord record = dbVerDS.getRecord();
        return record.getInt(AFM_DB_VER_NUM_FULL_FIELD_NAME);
    }
    
    /**
     * Alter the tables.
     * 
     * @param tableName table name
     */
    public void createOrAlterTable(final String tableName) {
        DatabaseSchemaTableDef sqlTblDef =
                new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
        final TableDef.ThreadSafe afmTblDef =
                ContextStore.get().getProject().loadTableDef(tableName);
        final CreateAlterTable alterTable = new CreateAlterTable(afmTblDef, this.output, "");
        alterTable.setSqlTableDef(sqlTblDef);
        if (sqlTblDef.exists()) {
            final AddDropFields fldsToAddOrDrop = new AddDropFields(tableName, this.output, "");
            fldsToAddOrDrop.process();
            if (fldsToAddOrDrop.isTableChanged()) {
                sqlTblDef = new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
                alterTable.setSqlTableDef(sqlTblDef);
            }
            alterTable.alterTable();
        } else {
            alterTable.createTable();
            alterTable.dropAllFK();
            alterTable.createAllForeignKeys();
        }
    }
    
    /**
     * Adds the afm_flds.validate_data, attributes field. Updates from 120 to 121 db version.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Use INSERT or DDL commands to manipulate the ARCHIBUS data dictionary.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    // TODO: (VT): Justification does not reference a particular case from the Wiki.
    public void updateDbVersion120to121() {
        final ArrayList<String> sqlCommands = new ArrayList<String>();
        
        sqlCommands
            .add("UPDATE afm_flds SET afm_size=850 WHERE table_name='afm_flds' AND field_name='enum_list'");
        
        if (!ProjectUpdateWizardUtilities.isFieldInArchibus(ProjectUpdateWizardConstants.AFM_FLDS,
            "attributes")) {
            sqlCommands.add(INSERT_FLDS
                    + " VALUES ('afm_flds','attributes',2050,1,'Trinidad',12,0,"
                    + "null,null,null,null,null,0,null,null,"
                    + "'Field Attributes',0,0,0,null,null,2000,null,40,0,null)");
        }
        if (!ProjectUpdateWizardUtilities.isFieldInArchibus(ProjectUpdateWizardConstants.AFM_FLDS,
            "validate_data")) {
            sqlCommands
                .add(INSERT_FLDS
                        + " VALUES ('afm_flds','validate_data',2050,0,'Trinidad - Only affects validated fields.',"
                        + "5,0,null,1,null,null,'0;No;1;Yes',0,null,null,'Validate Data?'"
                        + ",0,0,0,null,null,1,null,5,0,null)");
        }
        sqlCommands.add("DELETE FROM afm_flds WHERE table_name = 'afm_wf_rules'");
        sqlCommands.add("DELETE FROM afm_tbls WHERE table_name = 'afm_wf_rules'");
        sqlCommands
            .add("UPDATE afm_flds SET field_name='alt_title' WHERE field_name='Alt_title' AND table_name='vn'");
        sqlCommands.add("COMMIT");
        if (DatabaseSchemaUtilities.isTableInSql(WFR_TABLE)) {
            sqlCommands.add("DROP TABLE afm_wf_rules");
        }
        
        this.output.runCommands(sqlCommands);
        final Project.Immutable project = ContextStore.get().getProject();
        updateSchemPrefTable(MIN_DB_VER_NUM);
        project.clearCachedTableDefs();
        createOrAlterTable(ProjectUpdateWizardConstants.AFM_TBLS);
        createOrAlterTable(ProjectUpdateWizardConstants.AFM_FLDS);
        ((XmlImpl) project).setAttribute("/*/preferences", AFM_DB_VER_NUM_FIELD, MIN_DB_VER_NUM,
            true);
    }
    
    /**
     * Updates afm_scmpref table.
     * 
     * @param dbVerNum database version number
     */
    public void updateSchemPrefTable(final String dbVerNum) {
        final DataSource afmScmPrefDs =
                DataSourceFactory.createDataSource().addTable(AFM_SCM_PREF_TABLE)
                    .addField(AFM_SCM_PREF_TABLE).addField(AFM_DB_VER_NUM_FIELD);
        final DataRecord record = afmScmPrefDs.getRecord();
        record.setDbValue(AFM_DB_VER_NUM_FULL_FIELD_NAME, dbVerNum);
        afmScmPrefDs.saveRecord(record);
        afmScmPrefDs.commit();
    }
    
    /**
     * 
     * loadUpdatedTablesNames.
     * 
     * @return updated tables.
     */
    public Set<String> loadUpdatedTables() {
        
        final DataSource dsChangedTables = DataSourceFactory.createDataSource();
        dsChangedTables.addTable(ProjectUpdateWizardConstants.AFM_TBLS, DataSource.ROLE_MAIN);
        dsChangedTables.addTable(ProjectUpdateWizardConstants.AFM_FLDS, DataSource.ROLE_STANDARD);
        dsChangedTables.addField(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardConstants.TABLE_NAME);
        dsChangedTables.addField(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.TABLE_NAME);
        dsChangedTables.addField(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.FIELD_NAME);
        dsChangedTables.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardUtilities.IS_SQL_VIEW, 0));
        dsChangedTables.addRestriction(Restrictions.in(ProjectUpdateWizardConstants.AFM_FLDS,
            TRANSFER_STATUS, CHANGED_CONDITION));
        dsChangedTables.setDistinct(true);
        
        final List<DataRecord> tableNamesRec = dsChangedTables.getRecords();
        final Set<String> updatedTables = new HashSet<String>();
        for (final DataRecord record : tableNamesRec) {
            updatedTables.add(record.getString("afm_tbls.table_name"));
        }
        
        return updatedTables;
    }
    
    /**
     * 
     * Is table changed?
     * 
     * @param tableName table name
     * 
     * @return boolean.
     */
    public boolean isTableChanged(final String tableName) {
        final DataSource dsChangedTables =
                DataSourceFactory.createDataSource().addTable(
                    ProjectUpdateWizardConstants.AFM_TBLS, DataSource.ROLE_MAIN);
        dsChangedTables.addTable(ProjectUpdateWizardConstants.AFM_FLDS);
        dsChangedTables.addField(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardConstants.TABLE_NAME);
        dsChangedTables.addField(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.TABLE_NAME);
        dsChangedTables.addField(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.FIELD_NAME);
        dsChangedTables.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardUtilities.IS_SQL_VIEW, 0));
        dsChangedTables.addRestriction(Restrictions.in(ProjectUpdateWizardConstants.AFM_FLDS,
            TRANSFER_STATUS, CHANGED_CONDITION));
        dsChangedTables.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
            "table_name", tableName));
        dsChangedTables.setDistinct(true);
        
        return !dsChangedTables.getRecords().isEmpty();
    }
    
    /**
     * 
     * Records in table changed?
     * 
     * @return boolean.
     */
    public boolean isWfrChanged() {
        final Restriction restriction =
                Restrictions.sql("transfer_status IN ('UPDATED','INSERTED')");
        return DataStatistics.getInt(WFR_TABLE, "rule_id", "count", restriction) > 0 ? true : false;
    }
}
