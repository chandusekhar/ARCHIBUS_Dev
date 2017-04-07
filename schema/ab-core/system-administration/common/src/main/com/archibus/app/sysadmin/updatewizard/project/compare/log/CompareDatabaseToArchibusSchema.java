package com.archibus.app.sysadmin.updatewizard.project.compare.log;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.IMergeSchema;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * 
 * @author Catalin Purice
 * 
 */
public class CompareDatabaseToArchibusSchema implements LogWriter {
    
    /**
     * constant.
     */
    private static final String SEPARATOR = ".";
    
    /**
     * constant.
     */
    private static final String SEMICOLUMN = ": ";
    
    /**
     * Head message.
     */
    private static final String TABLES_MISS_FROM_SQL_MSG =
            ">>>>>>>>TABLES that are in ARCHIBUS but NOT in Database<<<<<<<<";
    
    /**
     * Head message.
     */
    private static final String NO_TABLES_MISS_FROM_SQL_MSG =
            "There are NO Tables missing from the Database.";
    
    /**
     * Head message.
     */
    private static final String TABLES_MISS_FROM_ARCH_MSG =
            ">>>>>>>>TABLES that are in the Database but NOT in ARCHIBUS<<<<";
    
    /**
     * Head message.
     */
    private static final String NO_TABLES_MISS_FROM_ARCH_MSG =
            "There are NO Tables missing from ARCHIBUS (afm_tbls).";
    
    /**
     * Head message.
     */
    private static final String FIELDS_MISS_FROM_SQL_MSG =
            ">>>>>>>>FIELDS that are in ARCHIBUS but NOT in Database<<<<<<<<";
    
    /**
     * Head message.
     */
    private static final String NO_FIELDS_MISS_FROM_SQL_MSG =
            "There are NO Fields missing from the Database.";
    
    /**
     * Head message.
     */
    private static final String FIELDS_MISS_FROM_ARCH_MSG =
            ">>>>>>>>FIELDS that are in the Database but NOT in ARCHIBUS<<<<";
    
    /**
     * Head message.
     */
    private static final String NO_FIELDS_MISS_FROM_ARCH_MSG =
            "There are NO Fields missing from ARCHIBUS (afm_flds).";
    
    /**
     * Head message.
     */
    private static final String DATA_TYPE_DIFF_MSG =
            ">>>>>>>>>>>>>>>>>>>>DATA TYPE Differences<<<<<<<<<<<<<<<<<<<<<<";
    
    /**
     * No differences for Foreign Key message.
     */
    private static final String NO_DATA_TYPE_DIFF_MSG =
            "NO Differences were detected for Data Type.";
    
    /**
     * Head message.
     */
    private static final String SIZE_DIFF_MSG =
            ">>>>>>>>>>>>>>>>>>>>>SIZE DIFFERENCES<<<<<<<<<<<<<<<<<<<<<<<<<<";
    
    /**
     * No differences for Size message.
     */
    private static final String NO_SIZE_DIFF_MSG = "NO Differences were detected for Size.";
    
    /**
     * Head message.
     */
    private static final String ALLOW_NULL_DIFF_MSG =
            ">>>>>>>>>>>>>>>>>>ALLOW NULL DIFFERENCES<<<<<<<<<<<<<<<<<<<<<<<";
    
    /**
     * No differences for Allow Null message.
     */
    private static final String NO_ALLOW_NULL_DIFF_MSG =
            "NO Differences were detected for Allow Null.";
    
    /**
     * Head message.
     */
    private static final String DFLT_VAL_DIFF_MSG =
            ">>>>>>>>>>>>>>>>>DEFAULT VALUE DIFFERENCES<<<<<<<<<<<<<<<<<<<<<";
    
    /**
     * No differences for Default message.
     */
    private static final String NO_DFLT_DIFF_MSG =
            "NO Differences were detected for Default value.";
    
    /**
     * Head message.
     */
    private static final String PRIMARY_KEY_DIFF_MSG =
            ">>>>>>>>>>>>>>>>>>>>>PRIMARY KEY DIFFERENCES<<<<<<<<<<<<<<<<<<<<<<<<";
    
    /**
     * No differences for Primary Key message.
     */
    private static final String NO_PRIMARY_KEY_DIFF_MSG =
            "NO Differences were detected for Primary Key.";
    
    /**
     * Head message.
     */
    private static final String FOREIGN_KEY_DIFF_MSG =
            ">>>>>>>>>>>>>>>>>FOREIGN KEY DIFFERENCES<<<<<<<<<<<<<<<<<<<<<<<<<";
    
    /**
     * No differences for Foreign Key message.
     */
    private static final String NO_FOREIGN_KEY_DIFF_MSG =
            "NO Differences were detected for Foreign Key.";
    
    /**
     * Head message.
     */
    private static final String ENUM_LIST_DIFF_MSG =
            ">>>>>>>>>>>>>>>>>Enum List DIFFERENCES<<<<<<<<<<<<<<<<<<<<<";
    
    /**
     * No differences for Enumeration List message.
     */
    private static final String NO_ENUM_LIST_DIFF_MSG =
            "NO Differences were detected for Enum List.";
    
    /**
     * differences.
     */
    private final List<DataRecord> diffRecords;
    
    /**
     * size messages.
     */
    private final List<String> sizeMsg;
    
    /**
     * data type messages.
     */
    private final List<String> dataTypeMsg;
    
    /**
     * default messages.
     */
    private final List<String> defaultMsg;
    
    /**
     * allow null messages.
     */
    private final List<String> allowNullMsg;
    
    /**
     * primary key messages.
     */
    private final List<String> primaryKeyMsg;
    
    /**
     * foreign key messages.
     */
    private final List<String> foreignKeyMsg;
    
    /**
     * foreign key messages.
     */
    private final List<String> enumListMsg;
    
    /**
     * logger.
     */
    private final ProjectUpdateWizardLogger comparatorLog;
    
    /**
     * Constructor.
     */
    public CompareDatabaseToArchibusSchema() {
        super();
        this.comparatorLog = new ProjectUpdateWizardLogger("Comparator.log");
        this.diffRecords = new ArrayList<DataRecord>();
        this.sizeMsg = new ArrayList<String>(Arrays.asList(SIZE_DIFF_MSG, NO_SIZE_DIFF_MSG));
        this.dataTypeMsg =
                new ArrayList<String>(Arrays.asList(DATA_TYPE_DIFF_MSG, NO_DATA_TYPE_DIFF_MSG));
        this.defaultMsg = new ArrayList<String>(Arrays.asList(DFLT_VAL_DIFF_MSG, NO_DFLT_DIFF_MSG));
        this.allowNullMsg =
                new ArrayList<String>(Arrays.asList(ALLOW_NULL_DIFF_MSG, NO_ALLOW_NULL_DIFF_MSG));
        this.primaryKeyMsg =
                new ArrayList<String>(Arrays.asList(PRIMARY_KEY_DIFF_MSG, NO_PRIMARY_KEY_DIFF_MSG));
        this.foreignKeyMsg =
                new ArrayList<String>(Arrays.asList(FOREIGN_KEY_DIFF_MSG, NO_FOREIGN_KEY_DIFF_MSG));
        this.enumListMsg =
                new ArrayList<String>(Arrays.asList(ENUM_LIST_DIFF_MSG, NO_ENUM_LIST_DIFF_MSG));
    }
    
    /**
     * Writes data into Comparator.log file.
     */
    public void writeToLogFile() {
        
        loadDifferencesFromDb();
        
        final List<String> missTblsFromSqlMess = getLogMessageForMissingTblsFromSql();
        this.comparatorLog.logMessages(missTblsFromSqlMess);
        this.comparatorLog.addNewLine();
        
        final List<String> missTblsFromArchMess = getLogMessageForMissingTblsFromArch();
        this.comparatorLog.logMessages(missTblsFromArchMess);
        this.comparatorLog.addNewLine();
        
        final List<String> missFldsFromSqlMess = getLogMessageForMissingFldsFromSql();
        this.comparatorLog.logMessages(missFldsFromSqlMess);
        this.comparatorLog.addNewLine();
        
        final List<String> missFldsFromArchMess = getLogMessageForMissingFldsFromArch();
        this.comparatorLog.logMessages(missFldsFromArchMess);
        this.comparatorLog.addNewLine();
        
        loadMessageForFieldDifferences();
        
        this.comparatorLog.logMessages(this.dataTypeMsg);
        this.comparatorLog.addNewLine();
        this.comparatorLog.logMessages(this.sizeMsg);
        this.comparatorLog.addNewLine();
        this.comparatorLog.logMessages(this.defaultMsg);
        this.comparatorLog.addNewLine();
        this.comparatorLog.logMessages(this.allowNullMsg);
        this.comparatorLog.addNewLine();
        this.comparatorLog.logMessages(this.primaryKeyMsg);
        this.comparatorLog.addNewLine();
        this.comparatorLog.logMessages(this.foreignKeyMsg);
        this.comparatorLog.addNewLine();
        this.comparatorLog.logMessages(this.enumListMsg);
        this.comparatorLog.addNewLine();
        this.comparatorLog.close();
    }
    
    /**
     * Logs the missing tables.
     */
    private void loadDifferencesFromDb() {
        final DataSource comparatorDs = DataSourceFactory.createDataSource();
        comparatorDs.addTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        comparatorDs.addField("autonumbered_id");
        comparatorDs.addField("table_name");
        comparatorDs.addField("field_name");
        comparatorDs.addField("change_type");
        comparatorDs.addField(ProjectUpdateWizardConstants.SQL_TABLE_DIFFS);
        comparatorDs.addRestriction(Restrictions.isNotNull(
            ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
            ProjectUpdateWizardConstants.SQL_TABLE_DIFFS));
        this.diffRecords.addAll(comparatorDs.getRecords());
    }
    
    /**
     * Gets message log for missing tables from SQL.
     * 
     * @return list of differences
     */
    private List<String> getLogMessageForMissingTblsFromSql() {
        
        final List<String> messages = new ArrayList<String>();
        messages.add(TABLES_MISS_FROM_SQL_MSG);
        
        final List<String> missingTablesNamesFromSql =
                DatabaseSchemaUtilities.getMissingTablesFromSql("");
        
        messages.addAll(missingTablesNamesFromSql);
        
        if (missingTablesNamesFromSql.isEmpty()) {
            messages.add(NO_TABLES_MISS_FROM_SQL_MSG);
        }
        
        return messages;
    }
    
    /**
     * @return list of differences
     */
    private List<String> getLogMessageForMissingTblsFromArch() {
        
        final List<String> messages = new ArrayList<String>();
        messages.add(TABLES_MISS_FROM_ARCH_MSG);
        
        final List<String> missingTablesNamesFromArch =
                DatabaseSchemaUtilities.getMissingTablesFromArchibus("");
        
        messages.addAll(missingTablesNamesFromArch);
        
        if (missingTablesNamesFromArch.isEmpty()) {
            messages.add(NO_TABLES_MISS_FROM_ARCH_MSG);
        }
        return messages;
    }
    
    /**
     * @return list of differences
     */
    private List<String> getLogMessageForMissingFldsFromSql() {
        
        final List<String> messages = new ArrayList<String>();
        messages.add(FIELDS_MISS_FROM_SQL_MSG);
        
        final Set<String> tablesToCompare = getCommonTables();
        
        final List<String> missingFields = new ArrayList<String>();
        
        for (final String tableName : tablesToCompare) {
            final List<String> missingFieldsFromSql =
                    DatabaseSchemaUtilities.getMissingFieldsFromSql(tableName);
            for (final String fieldName : missingFieldsFromSql) {
                missingFields.add(tableName + SEPARATOR + fieldName);
            }
        }
        
        if (missingFields.isEmpty()) {
            messages.add(NO_FIELDS_MISS_FROM_SQL_MSG);
        } else {
            messages.addAll(missingFields);
        }
        
        return messages;
    }
    
    /**
     * @return list of differences
     */
    private List<String> getLogMessageForMissingFldsFromArch() {
        
        final List<String> messages = new ArrayList<String>();
        messages.add(FIELDS_MISS_FROM_ARCH_MSG);
        
        final Set<String> tablesToCompare = getCommonTables();
        
        final List<String> missingFields = new ArrayList<String>();
        
        for (final String tableName : tablesToCompare) {
            final List<String> missingFieldsFromArch =
                    DatabaseSchemaUtilities.getMissingFieldsFromArchibus(tableName);
            for (final String fieldName : missingFieldsFromArch) {
                missingFields.add(tableName + SEPARATOR + fieldName);
            }
        }
        
        if (missingFields.isEmpty()) {
            messages.add(NO_FIELDS_MISS_FROM_ARCH_MSG);
        } else {
            messages.addAll(missingFields);
        }
        
        return messages;
    }
    
    /**
     * Return common tables.
     * 
     * @return list of tables
     */
    private Set<String> getCommonTables() {
        final List<String> projectTablesNames = ProjectUpdateWizardUtilities.getProjectTableNames();
        final List<String> sqlTablesNames = DatabaseSchemaUtilities.getAllTableNames();
        final List<String> missingTablesNamesFromProj =
                DatabaseSchemaUtilities.getMissingTablesFromArchibus("");
        final List<String> missingTablesNamesFromSql =
                DatabaseSchemaUtilities.getMissingTablesFromSql("");
        
        final Set<String> tablesToCompare = new HashSet<String>();
        tablesToCompare.addAll(projectTablesNames);
        tablesToCompare.addAll(sqlTablesNames);
        tablesToCompare.removeAll(missingTablesNamesFromProj);
        tablesToCompare.removeAll(missingTablesNamesFromSql);
        return tablesToCompare;
    }
    
    /**
     * Loads differences for all fields in database into member variables.
     */
    private void loadMessageForFieldDifferences() {
        
        for (final DataRecord difference : this.diffRecords) {
            
            final String changeType =
                    difference.getValue(IMergeSchema.CHANGE_TYPE_FIELD).toString();
            
            if (changeType.equals(DifferenceMessage.DATA_TYPE.name())) {
                this.dataTypeMsg.remove(1);
                this.dataTypeMsg.add(getDiffMessage(difference, DifferenceMessage.DATA_TYPE));
            }
            if (changeType.equals(DifferenceMessage.AFM_SIZE.getMessage())) {
                this.sizeMsg.remove(1);
                this.sizeMsg.add(getDiffMessage(difference, DifferenceMessage.AFM_SIZE));
            }
            if (changeType.equals(DifferenceMessage.DFLT_VAL.name())) {
                this.defaultMsg.remove(1);
                this.defaultMsg.add(getDiffMessage(difference, DifferenceMessage.DFLT_VAL));
            }
            if (changeType.equals(DifferenceMessage.ALLOW_NULL.name())) {
                this.allowNullMsg.remove(1);
                this.allowNullMsg.add(getDiffMessage(difference, DifferenceMessage.ALLOW_NULL));
            }
            if (changeType.equals(DifferenceMessage.PRIMARY_KEY.name())) {
                this.primaryKeyMsg.remove(1);
                this.primaryKeyMsg.add(getDiffMessage(difference, DifferenceMessage.PRIMARY_KEY));
            }
            if (changeType.equals(DifferenceMessage.REF_TABLE.name())) {
                this.foreignKeyMsg.remove(1);
                this.foreignKeyMsg.add(getDiffMessage(difference, DifferenceMessage.REF_TABLE));
            }
            if (changeType.equals(DifferenceMessage.ENUM_LIST.name())) {
                this.enumListMsg.remove(1);
                this.enumListMsg.add(getDiffMessage(difference, DifferenceMessage.ENUM_LIST));
            }
        }
    }
    
    /**
     * 
     * @param difference record from afm_flds_trans
     * @param diffType difference
     * @return log message
     */
    private String getDiffMessage(final DataRecord difference, final DifferenceMessage diffType) {
        final String tableName = difference.getValue("afm_flds_trans.table_name").toString();
        final String fieldName = difference.getValue("afm_flds_trans.field_name").toString();
        final String values = difference.getValue("afm_flds_trans.sql_table_diffs").toString();
        String differsIn = "type";
        switch (diffType) {
            case AFM_SIZE:
                differsIn = "size";
                break;
            case DFLT_VAL:
                differsIn = "default value";
                break;
            case ALLOW_NULL:
                differsIn = "allow null";
                break;
            case PRIMARY_KEY:
                differsIn = "primary key";
                break;
            case REF_TABLE:
                differsIn = "reference table";
                break;
            case ENUM_LIST:
                differsIn = "enumeration list";
                break;
            default:
                differsIn = "none";
        }
        
        final String message =
                tableName + SEPARATOR + fieldName + SEMICOLUMN + "afm_flds " + differsIn
                        + "[Database " + differsIn + "]: " + values;
        return message;
    }
}
