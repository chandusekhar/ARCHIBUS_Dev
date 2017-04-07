package com.archibus.app.sysadmin.updatewizard.project.loader;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Loads tables from ARCHIBUS data dictionary.
 *
 * @author Catalin Purice
 *
 */
public class TablesLoader {
    
    /**
     * Constant.
     */
    private static final String TRANSFER_STATUS = "transfer_status";
    
    /**
     * Tables to be excluded from selection.
     */
    private static final String EXCLUDED_TABLES =
            "afm_tbls,afm_flds,afm_transfer_set,afm_flds_trans";
    
    /**
     * Constant.
     */
    private static final String TABLE_TYPE_FULL_NAME = "afm_tbls.table_type";
    
    /**
     * Constant.
     */
    private static final String TABLE_NAME_FULL_NAME = "afm_tbls.table_name";
    
    /**
     * Constant.
     */
    private static final String TABLE_TYPE = "table_type";
    
    /**
     * Used for Oracle BLOB tables.
     */
    private boolean isDocTables;
    
    /**
     * like wild card.
     */
    private final String likeWildcard;
    
    /**
     * like restriction.
     */
    private String likeRestriction = "";
    
    /**
     * true if the option is selected from UI.
     */
    private final boolean isValidated;
    
    /**
     * true if the process is transfer in.
     */
    private final boolean isDataTransferIn;
    
    /**
     * list of table types selected.
     */
    private final List<String> tableType;
    
    /**
     * Table properties.
     */
    private transient List<TableProperties> tablesProp;
    
    /**
     *
     * @param isTransferIn @see {@link #isDataTransferIn}
     * @param likeWildcard @see {@link #likeWildcard}
     * @param tableTypesList @see {@link #tableType}
     * @param isValidated @see {@link #isValidated}
     */
    public TablesLoader(final List<String> tableTypesList, final String likeWildcard,
            final boolean isValidated, final boolean isTransferIn) {
        this.tableType = tableTypesList;
        this.likeWildcard = likeWildcard;
        this.isValidated = isValidated;
        this.isDataTransferIn = isTransferIn;
        if (!StringUtil.isNullOrEmpty(likeWildcard)) {
            setLikeRestriction();
        }
    }
    
    /**
     * Initialize isDocTables. Used for Oracle only.
     *
     * @param puwSelected true if Project Update Wizard table option was selected in the UI
     * @param puwSelected
     */
    public void initializeBlobTables(final boolean puwSelected) {
        this.isDocTables = hasDocTables(puwSelected);
    }
    
    /**
     * Getter for the hasDocumentTables property.
     *
     * @see hasDocumentTables
     * @return the hasDocumentTables property.
     */
    public boolean hasDocumentTables() {
        return this.isDocTables;
    }
    
    /**
     * @return the isTransferIn
     */
    public boolean isTransferIn() {
        return this.isDataTransferIn;
    }
    
    /**
     *
     * @param isPuwOnlySelected true if Project Update Wizard table option was selected in the UI.
     * @return true if the selected tables contains at least one document table
     */
    private boolean hasDocTables(final boolean isPuwOnlySelected) {
        final DataSource dsHasDocumentTables =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TBLS, DataSource.ROLE_MAIN)
                    .addTable(ProjectUpdateWizardConstants.AFM_FLDS, DataSource.ROLE_STANDARD)
                    .addField(ProjectUpdateWizardConstants.AFM_TBLS,
                        ProjectUpdateWizardConstants.TABLE_NAME)
                    .addField(ProjectUpdateWizardConstants.AFM_FLDS,
                        ProjectUpdateWizardConstants.TABLE_NAME)
                    .addField(ProjectUpdateWizardConstants.AFM_FLDS,
                        ProjectUpdateWizardConstants.FIELD_NAME)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS, "is_sql_view", 0))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, "afm_type",
                            SchemaUpdateWizardConstants.AFM_DOC_TYPE));
        
        if (isPuwOnlySelected) {
            dsHasDocumentTables.addRestriction(Restrictions.in(
                ProjectUpdateWizardConstants.AFM_TBLS, TRANSFER_STATUS, "INSERTED,UPDATED"));
        } else {
            String restriction = "";
            if (this.isValidated) {
                restriction = getIsValidatedRestriction();
            } else {
                restriction = this.likeRestriction;
            }
            dsHasDocumentTables.addRestriction(Restrictions.sql(restriction));
        }
        
        return !dsHasDocumentTables.getRecords().isEmpty();
    }
    
    /**
     * @return restriction for validated tables.
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #1: SQL statements with subqueries.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private String getIsValidatedRestriction() {
        final StringBuilder validateTableRestriction = new StringBuilder(this.likeRestriction);
        validateTableRestriction
            .append(") OR afm_tbls.table_name IN (SELECT ref_table FROM afm_flds WHERE is_sql_view = 0 AND ");
        validateTableRestriction.append(this.likeRestriction.replaceAll(
            ProjectUpdateWizardConstants.AFM_TBLS, ProjectUpdateWizardConstants.AFM_FLDS));
        validateTableRestriction
            .append("UNION SELECT table_name FROM afm_flds WHERE is_sql_view = 0 AND ");
        validateTableRestriction.append(this.likeRestriction.replaceAll(TABLE_NAME_FULL_NAME,
            "afm_flds.ref_table"));
        return validateTableRestriction.toString();
    }
    
    /**
     * Gets the tables according to LIKE operator.
     *
     * @param countRecords true if the records from CSV files will be counted
     * @return {@link TablesLoader}
     */
    public TablesLoader getNamedTables(final boolean countRecords) {
        
        final DataSource dsGetNamedTables = DataSourceFactory.createDataSource();
        dsGetNamedTables.addTable(ProjectUpdateWizardConstants.AFM_TBLS);
        dsGetNamedTables.addField(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardConstants.TABLE_NAME);
        dsGetNamedTables.addField(ProjectUpdateWizardConstants.AFM_TBLS, TABLE_TYPE);
        dsGetNamedTables.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardUtilities.IS_SQL_VIEW, 0));
        dsGetNamedTables.addRestriction(Restrictions.notIn(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardConstants.TABLE_NAME, EXCLUDED_TABLES));
        dsGetNamedTables.setDistinct(true);
        
        if (this.isValidated) {
            // get the parents
            final String tblRestriction = getIsValidatedRestriction();
            
            dsGetNamedTables.addRestriction(Restrictions.sql(tblRestriction));
        } else {
            dsGetNamedTables.addRestriction(Restrictions.sql(this.likeRestriction));
        }
        
        final List<DataRecord> tableNamesRec = dsGetNamedTables.getRecords();
        this.tablesProp = new ArrayList<TableProperties>();
        
        for (final DataRecord record : tableNamesRec) {
            final String name = record.getValue(TABLE_NAME_FULL_NAME).toString();
            String type = "";
            if (record.getValue(TABLE_TYPE_FULL_NAME) == null) {
                type = "NULL";
            } else {
                type = record.getValue(TABLE_TYPE_FULL_NAME).toString();
            }
            final TableProperties tableProp = new TableProperties();
            tableProp.setName(name);
            tableProp.setType(type);
            tableProp.setTableInArchibus(true);
            tableProp.setTableInSql(DatabaseSchemaUtilities.isTableInSql(name));
            if (countRecords) {
                if (tableProp.isTableInSql()) {
                    tableProp.getNoOfRecordsFromDB();
                    tableProp.countNoOfRecordsFromCsv();
                } else {
                    tableProp.setNoOfRecords(0);
                }
            }
            this.tablesProp.add(tableProp);
        }
        return this;
    }
    
    /**
     * Gets the afm_tbls.table_name based on afm_tbls.table_type.
     */
    public void getTableNamesByType() {
        final String[] afmFldsFields = { ProjectUpdateWizardUtilities.TABLE_NAME };
        
        final DataSource tblNamesByTypeDS =
                DataSourceFactory.createDataSourceForFields(ProjectUpdateWizardConstants.AFM_TBLS,
                    afmFldsFields);
        
        this.tablesProp = new ArrayList<TableProperties>();
        
        for (final String type : this.tableType) {
            // for project dash-board then export specific tables
            /*
             * if ("PROCESS DASHBOARD".equals(type)) { loadProjectDashboardTables(); continue; }
             */
            tblNamesByTypeDS.addRestriction(
                Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS, TABLE_TYPE, type))
                .addRestriction(
                    Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
                        ProjectUpdateWizardUtilities.IS_SQL_VIEW, 0));
            final List<DataRecord> tableNamesRec = tblNamesByTypeDS.getRecords();
            tblNamesByTypeDS.clearRestrictions();
            
            for (final DataRecord record : tableNamesRec) {
                final String name = record.getValue(TABLE_NAME_FULL_NAME).toString();
                if (DatabaseSchemaUtilities.isTableInSql(name)) {
                    final TableProperties tableProp = new TableProperties();
                    if ("PROCESS NAVIGATOR".equals(type)
                            && ("afm_processes".equalsIgnoreCase(name) || "afm_ptasks"
                                .equalsIgnoreCase(name))) {
                        tableProp.setSetName("PNAV");
                    }
                    tableProp.setName(name);
                    tableProp.setType(type);
                    tableProp.getNoOfRecordsFromDB();
                    tableProp.countNoOfRecordsFromCsv();
                    this.tablesProp.add(tableProp);
                }
            }
        }
    }
    
    /**
     * @param countRecords true/false if to count records from CSV files
     * @return loaded tables
     */
    public TablesLoader getTablesFromDataDict(final boolean countRecords) {
        TablesLoader selectedTables = null;
        if (this.likeWildcard != null) {
            ProjectUpdateWizardUtilities
                .deleteFromTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
            ProjectUpdateWizardUtilities
                .deleteFromTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
            selectedTables = getNamedTables(countRecords);
        }
        return selectedTables;
    }
    
    /**
     * Gets the afm_tbls.table_name based on afm_tbls.table_type.
     *
     * @param status status of table from afm_transfer_set
     * @return {@link TablesLoader}
     */
    public TablesLoader getTableNamesByStatus(final String status) {
        final String[] afmFldsFields = { ProjectUpdateWizardUtilities.TABLE_NAME, TABLE_TYPE };
        
        final DataSource tblNamesByTypeDS =
                DataSourceFactory.createDataSourceForFields(
                    ProjectUpdateWizardConstants.AFM_TRANSFER_SET, afmFldsFields).addRestriction(
                    Restrictions
                        .eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, "status", status));
        
        final List<DataRecord> records = tblNamesByTypeDS.getRecords();
        this.tablesProp = new ArrayList<TableProperties>();
        
        for (final DataRecord record : records) {
            final String name = record.getValue("afm_transfer_set.table_name").toString();
            final String type = record.getValue("afm_transfer_set.table_type").toString();
            final TableProperties tableProp = new TableProperties();
            tableProp.setName(name);
            tableProp.setType(type);
            tableProp.getNoOfRecordsFromDB();
            this.tablesProp.add(tableProp);
        }
        return this;
    }
    
    /**
     * Return the table names changed by DCW as TablesLoader object. This will use the context
     * attribute and not the database meta-data.
     *
     * @return {@link TablesLoader}
     */
    public TablesLoader getTablesChangedByProjUpWiz() {
        
        final Set<String> changedTables =
                (Set<String>) ContextStore.get().getHttpSession().getServletContext()
                    .getAttribute("tablesChangedByDCW");
        this.tablesProp = new ArrayList<TableProperties>();
        if (changedTables != null) {
            for (final String name : changedTables) {
                final TableProperties tableProp = new TableProperties();
                tableProp.setName(name);
                tableProp.setTableInArchibus(true);
                tableProp.setTableInSql(DatabaseSchemaUtilities.isTableInSql(name));
                this.tablesProp.add(tableProp);
            }
        }
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        return this;
    }
    
    /**
     * @return the tablesProp
     */
    public List<TableProperties> getTablesProp() {
        return this.tablesProp;
    }
    
    /**
     * Split string to build the like restriction.
     */
    private void setLikeRestriction() {
        final String[] restrArr =
                this.likeWildcard.split(ProjectUpdateWizardConstants.LIKE_SEPARATOR);
        String sqlRestriction = " afm_tbls.table_name LIKE '";
        for (int i = 0; i < restrArr.length; i++) {
            sqlRestriction += restrArr[i];
            sqlRestriction += "' ";
            if (i < restrArr.length - 1) {
                sqlRestriction += " OR afm_tbls.table_name LIKE '";
            }
        }
        this.likeRestriction = sqlRestriction;
    }
    
    /**
     * @return the likeRestriction
     */
    public String getLikeRestriction() {
        return this.likeRestriction;
    }
    
    /**
     * Gets distinct table names from Database Schema, ARCHIBUS Schema and CSV file.
     *
     * @param tableNamesData List of CSV table objects
     * @return List of tables
     */
    public static List<String> getAllTableNamesFromArchibusAndDatabaseAndCsv(
            final List<LoadTableData> tableNamesData) {
        final List<String> tableNamesFromCsv = LoadTableData.getAllTableNames(tableNamesData);
        final List<String> tableNamesFromAchibus =
                ProjectUpdateWizardUtilities.getProjectTableNames();
        final List<String> tableNamesFromDatabase = DatabaseSchemaUtilities.getAllTableNames();
        final List<String> allTableNames = new ArrayList<String>();
        
        allTableNames.addAll(tableNamesFromCsv);
        
        for (final String archTableName : tableNamesFromAchibus) {
            if (!allTableNames.contains(archTableName)) {
                allTableNames.add(archTableName);
            }
        }
        
        for (final String dbTableNames : tableNamesFromDatabase) {
            if (!allTableNames.contains(dbTableNames)) {
                allTableNames.add(dbTableNames);
            }
        }
        return allTableNames;
    }
    
    /**
     * Returns the tables changed by DCW. This looks at afm_flds.transfer_status parameter.
     *
     * @return set of tables
     */
    public static Set<String> getTablesNamesChangedByProjUpWiz() {
        
        final DataSource dsGetPuwTables = DataSourceFactory.createDataSource();
        dsGetPuwTables.addTable(ProjectUpdateWizardConstants.AFM_TBLS, DataSource.ROLE_MAIN);
        dsGetPuwTables.addTable(ProjectUpdateWizardConstants.AFM_FLDS, DataSource.ROLE_MAIN);
        dsGetPuwTables.addField(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardConstants.TABLE_NAME);
        dsGetPuwTables.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardUtilities.IS_SQL_VIEW, 0));
        dsGetPuwTables.addRestriction(Restrictions.notIn(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardConstants.TABLE_NAME, EXCLUDED_TABLES));
        dsGetPuwTables.addRestriction(Restrictions.or(
            Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, TRANSFER_STATUS, "INSERTED"),
            Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, TRANSFER_STATUS, "UPDATED")));
        dsGetPuwTables.setDistinct(true);
        final List<DataRecord> tableNamesRec = dsGetPuwTables.getRecords();
        final Set<String> changedTables = new HashSet<String>();
        for (final DataRecord record : tableNamesRec) {
            changedTables.add(record.getString(TABLE_NAME_FULL_NAME));
        }
        return changedTables;
    }
}
