package com.archibus.app.sysadmin.updatewizard.project.compare;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.LoadTableData;
import com.archibus.app.sysadmin.updatewizard.project.transfer.in.CircularReference;
import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.SaveDifference;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;

/**
 * Compare ARCHIBUS table between CSV file and physical database.
 * 
 * @author Catalin Purice
 * 
 */
public class CompareTableProperties extends LoadTableData {
    
    /**
     * Constant.
     */
    private static final String NEW = "[new]";
    
    /**
     * Constant.
     */
    private static final String NO_FIELD = "No Field";
    
    /**
     * Constant.
     */
    private static final String NAME_TEMPLATE = "[%s]";
    
    /**
     * Constant.
     */
    private static final String NO_TABLE_ARCH = "No Table ";
    
    /**
     * Constant.
     */
    private static final String NO_TABLE_SQL_CSV = "[No Table]";
    
    /**
     * Constant.
     */
    private static final String ALL = "*all*";
    
    /**
     * SQL table definition.
     */
    private final DatabaseSchemaTableDef sqlTableDef;
    
    /**
     * 
     * @param tableName table name
     * @param isSqlView true if the table is view
     */
    public CompareTableProperties(final String tableName, final boolean isSqlView) {
        super(tableName, isSqlView);
        this.sqlTableDef = new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
    }
    
    /**
     * @return the sqlTableDef
     */
    public DatabaseSchemaTableDef getSqlTableDef() {
        return this.sqlTableDef;
    }
    
    /**
     * 
     */
    public void compareTable() {
        compareExistence();
    }
    
    /**
     * Compares existence.
     */
    private void compareExistence() {
        boolean afmTableExists = true;
        
        final String tableName = this.getTableName();
        
        if (!ProjectUpdateWizardUtilities.isTableInArchibus(tableName)) {
            afmTableExists = false;
        }
        
        if (!isSqlView() && (!afmTableExists || !this.sqlTableDef.exists())) {
            
            final SaveDifference tableDiff = new SaveDifference();
            String dataDictDiff = "";
            String sqlDiff = "";
            
            if (!afmTableExists) {
                dataDictDiff = DifferenceMessage.TBL_IS_NEW.name();
            }
            
            if (!this.sqlTableDef.exists()) {
                sqlDiff = DifferenceMessage.TBL_IS_NEW.getMessage();
            }
            
            tableDiff.buildMapForTable(tableName, DifferenceMessage.ALL_FLDS.getMessage(),
                Actions.APPLY_CHANGE.getMessage(), DifferenceMessage.TBL_IS_NEW.getMessage(),
                dataDictDiff,
                String.format(CompareFieldUtilities.OLD_AND_NEW_VAL_MESS, dataDictDiff, sqlDiff));
            tableDiff.save();
        }
    }
    
    /**
     * check circular references for specified tables.
     * 
     * @param tableNames table names
     */
    public static void checkCircularReferencesForTables(final List<String> tableNames) {
        final List<Map<String, String>> circRefMap =
                CircularReference.getCircularReference(tableNames);
        final SaveDifference tableDiff = new SaveDifference();
        for (final Map<String, String> circRef : circRefMap) {
            tableDiff.buildMapForTable(circRef.get(ProjectUpdateWizardUtilities.TABLE_NAME),
                circRef.get(ProjectUpdateWizardUtilities.FIELD_NAME),
                Actions.NO_ACTION.getMessage(), DifferenceMessage.CIRC_REF.name(), "", "");
            tableDiff.save();
        }
    }
    
    /**
     * Checks project tables that are not in CSV file.
     * 
     * @param tablesDataFromFile all tables from afm_tbls.csv
     */
    public static void checkMissingTablesForCompare(final List<LoadTableData> tablesDataFromFile) {
        
        final List<String> csvTableNames = getTableNamesFromCsv(tablesDataFromFile);
        final List<String> projectTableNames = ProjectUpdateWizardUtilities.getProjectTableNames();
        final List<String> sqlTableNames = DatabaseSchemaUtilities.getAllTableNames();
        final Set<String> allTablesNames = new HashSet<String>(csvTableNames);
        allTablesNames.addAll(projectTableNames);
        allTablesNames.addAll(sqlTableNames);
        
        for (final String tableName : allTablesNames) {
            final boolean isTableInProj = projectTableNames.contains(tableName);
            final boolean isTableInCsv = csvTableNames.contains(tableName);
            final boolean isTableInSql = sqlTableNames.contains(tableName);
            
            if (!isTableInProj || !isTableInCsv || !isTableInSql) {
                prepareMissingTable(tableName, isTableInProj, isTableInCsv, isTableInSql);
            }
        }
    }
    
    /**
     * Prepare the missing table to be saved in afm_flds_trans table.
     * 
     * @param tableName table name
     * @param isTableInProj whether the table exist in project
     * @param isTableInCsv whether the table exist in extract files
     * @param isTableInSql whether the table exist in SQL database
     */
    private static void prepareMissingTable(final String tableName, final boolean isTableInProj,
            final boolean isTableInCsv, final boolean isTableInSql) {
        
        String changeType = DifferenceMessage.TBL_IS_NEW.name();
        String projectTable = NO_TABLE_ARCH;
        if (isTableInProj) {
            changeType = DifferenceMessage.TBL_IN_PROJ_ONLY.name();
            projectTable = tableName;
        }
        final String sqlTable =
                isTableInSql ? String.format(NAME_TEMPLATE, tableName) : NO_TABLE_SQL_CSV;
        final String csvTable =
                isTableInCsv ? String.format(NAME_TEMPLATE, tableName) : NO_TABLE_SQL_CSV;
        
        final SaveDifference tableDiff = new SaveDifference();
        
        tableDiff.buildMapForTable(tableName, ALL, Actions.NO_ACTION.getMessage(), changeType,
            projectTable + csvTable, projectTable + sqlTable);
        tableDiff.save();
    }
    
    /**
     * Checks project tables that are not in CSV file.
     * 
     * @param tablesDataFromFile all tables from afm_tbls.csv
     */
    public static void checkMissingTables(final List<LoadTableData> tablesDataFromFile) {
        
        final List<String> csvTableNames = getTableNamesFromCsv(tablesDataFromFile);
        
        final SaveDifference tableDiff = new SaveDifference();
        for (final String tableName : csvTableNames) {
            boolean tableInProj = false;
            boolean newTableFound = false;
            String archibusValue = NO_TABLE_ARCH;
            String sqlValue = String.format(NAME_TEMPLATE, tableName);
            DifferenceMessage changeType = DifferenceMessage.TBL_IS_NEW;
            
            if (ProjectUpdateWizardUtilities.isTableInArchibus(tableName)) {
                tableInProj = true;
                archibusValue = String.format(NAME_TEMPLATE, tableName);
            } else {
                newTableFound = true;
            }
            if (!DatabaseSchemaUtilities.isTableInSql(tableName)) {
                sqlValue = NO_TABLE_SQL_CSV;
                newTableFound = true;
                if (tableInProj) {
                    changeType = DifferenceMessage.TBL_IN_PROJ_ONLY;
                }
            }
            
            if (newTableFound) {
                final String csvValue = String.format(NAME_TEMPLATE, tableName);
                final String sqlDiff = archibusValue + sqlValue;
                final String ddDiff = archibusValue + csvValue;
                String action = Actions.NO_ACTION.getMessage();
                
                if (!tableInProj) {
                    action = Actions.APPLY_CHANGE.getMessage();
                }
                
                tableDiff.buildMapForTable(tableName, ALL, action, changeType.name(), ddDiff,
                    sqlDiff);
                tableDiff.save();
            }
        }
    }
    
    /**
     * @param tablesDataFromFile tables
     * @return list of tables as array
     */
    private static List<String> getTableNamesFromCsv(final List<LoadTableData> tablesDataFromFile) {
        // gets all tables names from CSV file.
        final List<String> csvTableNames = new ArrayList<String>();
        for (final LoadTableData tableData : tablesDataFromFile) {
            if (!tableData.isSqlView()) {
                csvTableNames.add(tableData.getTableName());
            }
        }
        return csvTableNames;
    }
    
    /**
     * @param fieldsDataFromFile fields properties from afm_flds.csv
     */
    public static void checkMissingFieldsFromCsv(final List<Map<String, Object>> fieldsDataFromFile) {
        // gets tables only, not views
        final List<String> csvTableNames = CsvUtilities.getAllTableNames(fieldsDataFromFile);
        
        final List<String> missingTablesNames = getMissingArchibusTablesFromCsv(csvTableNames);
        
        for (final String csvTableName : csvTableNames) {
            // skip missing tables
            if (missingTablesNames.contains(csvTableName)) {
                continue;
            }
            final List<String> csvFieldNames =
                    CsvUtilities.getFieldNamesForTable(csvTableName, fieldsDataFromFile);
            final List<String> missFieldNamesFromCsv =
                    getMissingFieldsFromCsvForTable(csvTableName, csvFieldNames);
            
            final List<String> missingFieldsFromSql =
                    DatabaseSchemaUtilities.getMissingFieldsFromSql(csvTableName);
            
            if (!missFieldNamesFromCsv.isEmpty()) {
                
                final SaveDifference tableDiff = new SaveDifference();
                String sqlDiff = "";
                for (final String missingField : missFieldNamesFromCsv) {
                    
                    if (missingFieldsFromSql.contains(missingField)) {
                        sqlDiff = "[No Field]";
                    }
                    
                    tableDiff.buildMapForTable(csvTableName, missingField,
                        Actions.NO_ACTION.getMessage(), DifferenceMessage.PROJECT_ONLY.name(), NEW,
                        sqlDiff);
                    tableDiff.save();
                }
            }
        }
    }
    
    /**
     * 
     * Check missing fields for compare.
     * 
     * @param fieldsDataFromFile fields from file
     */
    public static void checkMissingFieldsForCompare(
            final List<Map<String, Object>> fieldsDataFromFile) {
        final List<String> csvTableNames = CsvUtilities.getAllTableNames(fieldsDataFromFile);
        final List<String> projectTableNames = ProjectUpdateWizardUtilities.getProjectTableNames();
        final List<String> sqlTableNames = DatabaseSchemaUtilities.getAllTableNames();
        final Set<String> allTablesNames = new HashSet<String>(csvTableNames);
        allTablesNames.addAll(projectTableNames);
        allTablesNames.addAll(sqlTableNames);
        
        final List<String> missingTablesNamesFromCsv =
                getMissingArchibusTablesFromCsv(csvTableNames);
        final List<String> missingTablesNamesFromProj =
                DatabaseSchemaUtilities.getMissingTablesFromArchibus("");
        final List<String> missingTablesNamesFromSql =
                DatabaseSchemaUtilities.getMissingTablesFromSql("");
        
        allTablesNames.removeAll(missingTablesNamesFromCsv);
        allTablesNames.removeAll(missingTablesNamesFromProj);
        allTablesNames.removeAll(missingTablesNamesFromSql);
        
        for (final String tableName : allTablesNames) {
            
            final List<String> csvFieldNames =
                    CsvUtilities.getFieldNamesForTable(tableName, fieldsDataFromFile);
            final List<String> missingFieldNamesFromCsv =
                    getMissingFieldsFromCsvForTable(tableName, csvFieldNames);
            final List<String> missingFieldsFromSql =
                    DatabaseSchemaUtilities.getMissingFieldsFromSql(tableName);
            final List<String> missingFieldsFromProj =
                    DatabaseSchemaUtilities.getMissingFieldsFromArchibus(tableName);
            
            loadMissingFieldsForTable(tableName, missingFieldNamesFromCsv, missingFieldsFromProj,
                missingFieldsFromSql);
            
        }
    }
    
    /**
     * 
     * Loads missing fields from Project/CSV/SQL.
     * 
     * @param tableName table name
     * @param missingFieldNamesFromCsv missing fields from csv file
     * @param missingFieldsFromProj missing fields from ARCHIBUS
     * @param missingFieldsFromSql missing fields from SQL
     */
    private static void loadMissingFieldsForTable(final String tableName,
            final List<String> missingFieldNamesFromCsv, final List<String> missingFieldsFromProj,
            final List<String> missingFieldsFromSql) {
        
        final Set<String> allMissingFieldsNames = new HashSet<String>();
        allMissingFieldsNames.addAll(missingFieldNamesFromCsv);
        allMissingFieldsNames.addAll(missingFieldsFromProj);
        allMissingFieldsNames.addAll(missingFieldsFromSql);
        
        for (final String fieldName : allMissingFieldsNames) {
            final boolean isFieldInCsv = !missingFieldNamesFromCsv.contains(fieldName);
            final boolean isFieldInProj = !missingFieldsFromProj.contains(fieldName);
            final boolean isFieldInSql = !missingFieldsFromSql.contains(fieldName);
            
            if (!isFieldInProj || !isFieldInCsv || !isFieldInSql) {
                
                prepareMissingField(tableName, fieldName, isFieldInCsv, isFieldInProj, isFieldInSql);
            }
        }
    }
    
    /**
     * Prepare missing field to be saved in afm_flds_trans.
     * 
     * @param tableName table name
     * @param fieldName field name
     * @param isFieldInCsv whether if field exists in CSV file
     * @param isFieldInProj whether if field exists in Project
     * @param isFieldInSql whether if field exists in SQL
     */
    private static void prepareMissingField(final String tableName, final String fieldName,
            final boolean isFieldInCsv, final boolean isFieldInProj, final boolean isFieldInSql) {
        String changeType = DifferenceMessage.NEW.name();
        String projectFieldName = NO_FIELD;
        if (isFieldInProj) {
            changeType = DifferenceMessage.PROJECT_ONLY.name();
            projectFieldName = fieldName;
        }
        final String sqlFieldName = isFieldInSql ? fieldName : NO_FIELD;
        final String csvFieldName = isFieldInCsv ? fieldName : NO_FIELD;
        
        final SaveDifference tableDiff = new SaveDifference();
        
        tableDiff.buildMapForTable(tableName, fieldName, Actions.NO_ACTION.getMessage(),
            changeType, projectFieldName + String.format(NAME_TEMPLATE, csvFieldName),
            projectFieldName + String.format(NAME_TEMPLATE, sqlFieldName));
        tableDiff.save();
    }
    
    /**
     * gets missing fields from csv for table.
     * 
     * @param csvTablesNames tables from afm_tbls.csv file
     * @return missing tables from csv
     */
    private static List<String> getMissingArchibusTablesFromCsv(final List<String> csvTablesNames) {
        final List<String> projTablesNames = ProjectUpdateWizardUtilities.getProjectTableNames();
        final List<String> missingTables = new ArrayList<String>();
        
        for (final String projTableName : projTablesNames) {
            if (!csvTablesNames.contains(projTableName)) {
                missingTables.add(projTableName);
            }
        }
        return missingTables;
    }
    
    /**
     * gets missing fields from csv for specified table name.
     * 
     * @param tableName table name
     * @param csvFieldNames fields properties from afm_flds.csv
     * @return missing fields
     */
    private static List<String> getMissingFieldsFromCsvForTable(final String tableName,
            final List<String> csvFieldNames) {
        final List<String> projFieldNames =
                ProjectUpdateWizardUtilities.getProjFldNamesForTable(tableName);
        final List<String> missingFieldsFromCsv = new ArrayList<String>();
        for (final String projFieldName : projFieldNames) {
            
            if (!csvFieldNames.contains(projFieldName)) {
                missingFieldsFromCsv.add(projFieldName);
            }
        }
        return missingFieldsFromCsv;
    }
}
