package com.archibus.app.sysadmin.updatewizard.project.compare.log;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.IMergeSchema;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Generates SchemDiff.log file.
 * 
 * @author Catalin Purice
 * 
 */
public class CompareArchibusToStockSchema implements LogWriter {
    
    /**
     * constant.
     */
    private static final String A_F_T_DATA_DICT_DIFFS = "afm_flds_trans.data_dict_diffs";
    
    /**
     * constant.
     */
    private static final String DATA_DICT_DIFFS = "data_dict_diffs";
    
    /**
     * constant.
     */
    private static final String FIELDS = " fields:";
    
    /**
     * constant.
     */
    private static final String NO_MISS_TABLES_MSG = "No missing tables.";
    
    /**
     * constant.
     */
    private static final String NO_MISS_FIELDS_MSG = "No missing fields.";
    
    /**
     * constant.
     */
    private static final String MISS_TABLES_FROM_PROJECT_MSG =
            "Project database table definitions missing:";
    
    /**
     * constant.
     */
    private static final String MISS_TABLES_FROM_CSV_MSG =
            "Schema database table definitions missing:";
    
    /**
     * constant.
     */
    private static final String MISS_FIELDS_FROM_CSV_MSG =
            "Schema database field definitions missing:";
    
    /**
     * constant.
     */
    private static final String MISS_FIELDS_FROM_PROJECT_MSG =
            "Project database field definitions missing:";
    
    /**
     * constant.
     */
    private static final String DIFF_COMMON_FIELD_HEADLINE_MSG =
            "Common field definition differences: Project Value[Schema Value]";
    
    /**
     * constant.
     */
    private static final String DIFF_COMMON_FIELD_TEMPLATE_MSG = "%s%s%s%s";
    
    /**
     * constant.
     */
    private static final String NO_DIFF_COMMON_FIELDS_MSG =
            "No differences found in common fields.";
    
    /**
     * constant.
     */
    private static final String SCHEM = "SCHEM";
    
    /**
     * constant.
     */
    private static final String PROJ = "PROJ";
    
    /**
     * logger.
     */
    private final ProjectUpdateWizardLogger schemaDiffLog;
    
    /**
     * differences.
     */
    private final List<DataRecord> diffRecords;
    
    /**
     * Constructor.
     * 
     */
    public CompareArchibusToStockSchema() {
        super();
        this.schemaDiffLog = new ProjectUpdateWizardLogger("SchemDiff.log");
        this.diffRecords = new ArrayList<DataRecord>();
    }
    
    /**
     * Writes to SchemaDiff.log file.
     */
    public void writeToLogFile() {
        
        loadMissingFromDb();
        
        final List<String> missTblsFromProjMess = getLogMessageForMissingTblsFrom(PROJ);
        this.schemaDiffLog.logMessages(missTblsFromProjMess);
        // this.schemaDiffLog.logMessage(MISS_FIELDS_FROM_PROJECT_MSG);
        
        final List<String> missTblsFromCsvMess = getLogMessageForMissingTblsFrom(SCHEM);
        this.schemaDiffLog.logMessages(missTblsFromCsvMess);
        // this.schemaDiffLog.logMessage(MISS_FIELDS_FROM_CSV_MSG);
        
        processTables();
        
        this.schemaDiffLog.close();
    }
    
    /**
     * Process tables for field differences.
     */
    private void processTables() {
        final List<String> tableNames = getTableNames();
        for (final String tableName : tableNames) {
            this.schemaDiffLog.logMessage(tableName + FIELDS);
            this.schemaDiffLog.addNewLine();
            
            final List<String> missingFieldsFromProj = getLogMessageForMissingFldsFrom(PROJ);
            final List<String> missingFieldsFromSchem = getLogMessageForMissingFldsFrom(SCHEM);
            
            if (missingFieldsFromProj.isEmpty() && missingFieldsFromSchem.isEmpty()) {
                this.schemaDiffLog.logMessage(ProjectUpdateWizardLogger.TAB_SPACE
                        + NO_MISS_FIELDS_MSG);
            } else {
                this.schemaDiffLog.logMessages(missingFieldsFromProj);
                this.schemaDiffLog.logMessages(missingFieldsFromSchem);
            }
            this.schemaDiffLog.addNewLine();
            
            final List<String> diffMessagesPerTable = getDiffMessagesForTable(tableName);
            
            if (diffMessagesPerTable.isEmpty()) {
                this.schemaDiffLog.logMessage(NO_MISS_FIELDS_MSG);
                this.schemaDiffLog.addNewLine();
                this.schemaDiffLog.logMessage(NO_DIFF_COMMON_FIELDS_MSG);
                this.schemaDiffLog.addNewLine();
            } else {
                this.schemaDiffLog.logMessages(diffMessagesPerTable);
            }
        }
    }
    
    /**
     * 
     * @param tableNameToLookFor table name
     * @return messages to log
     */
    private List<String> getDiffMessagesForTable(final String tableNameToLookFor) {
        
        final List<String> messages = new ArrayList<String>();
        
        for (final DataRecord difference : this.diffRecords) {
            final String tableName =
                    difference.getValue(ProjectUpdateWizardUtilities.A_F_T_TABLE_NAME).toString();
            if (tableName.equalsIgnoreCase(tableNameToLookFor)) {
                final List<String> fieldDiffMessages = getFieldDiffMessage(difference);
                if (!fieldDiffMessages.isEmpty()) {
                    messages.add(DIFF_COMMON_FIELD_HEADLINE_MSG);
                    messages.addAll(fieldDiffMessages);
                }
            }
        }
        return messages;
    }
    
    /**
     * 
     * @param difference record with difference
     * @return list of differences
     */
    private List<String> getFieldDiffMessage(final DataRecord difference) {
        final String fieldName =
                difference.getValue(ProjectUpdateWizardUtilities.A_F_T_FIELD_NAME).toString();
        final String changeType = difference.getValue(IMergeSchema.CHANGE_TYPE_FIELD).toString();
        final String diff = difference.getValue(A_F_T_DATA_DICT_DIFFS).toString();
        final String differsIn = changeType.toLowerCase();
        final List<String> fieldDiffMessages = new ArrayList<String>();
        fieldDiffMessages.add(ProjectUpdateWizardLogger.TAB_SPACE
                + ProjectUpdateWizardLogger.TAB_SPACE + fieldName);
        fieldDiffMessages.add(String.format(DIFF_COMMON_FIELD_TEMPLATE_MSG,
            ProjectUpdateWizardLogger.TAB_SPACE + ProjectUpdateWizardLogger.TAB_SPACE
                    + ProjectUpdateWizardLogger.TAB_SPACE, differsIn,
            ProjectUpdateWizardLogger.TAB_SPACE + ProjectUpdateWizardLogger.TAB_SPACE, diff));
        return fieldDiffMessages;
        /*
         * switch (diffType) { case AFM_TYPE: differsIn = "size"; break; case AFM_SIZE: differsIn =
         * "size"; break; case DFLT_VAL: differsIn = "default value"; break; case ALLOW_NULL:
         * differsIn = "allow null"; break; case PRIMARY_KEY: differsIn = "primary key"; break; case
         * REF_TABLE: differsIn = "reference table"; break; case ENUM_LIST: differsIn =
         * "enumeration list"; break; case ATTRIBUTES: differsIn = "attributes"; break; case
         * DECIMALS: differsIn = "attributes"; break; case EDIT_GROUP: differsIn = "edit_group";
         * break; case EDIT_MASK: differsIn = "attributes"; break; case FIELD_GROUPING: differsIn =
         * "attributes"; break; case IS_ATXT: differsIn = "attributes"; break; case NUM_FORMAT:
         * differsIn = "attributes"; break; case STRING_FORMAT: differsIn = "string_format"; break;
         * case VALIDATE_DATA: differsIn = "validate data"; break; default: differsIn = ""; }
         */
    }
    
    /**
     * 
     * @param schProj can be "SCHEM" or "PROJ"
     * @return missing tables from
     */
    private List<String> getLogMessageForMissingTblsFrom(final String schProj) {
        final List<String> messages = new ArrayList<String>();
        
        String changeTypeToCompareWith = "";
        if (SCHEM.equalsIgnoreCase(schProj)) {
            messages.add(MISS_TABLES_FROM_CSV_MSG);
            messages.add(ProjectUpdateWizardLogger.NEW_LINE);
            changeTypeToCompareWith = DifferenceMessage.TBL_IN_PROJ_ONLY.name();
        } else {
            messages.add(MISS_TABLES_FROM_PROJECT_MSG);
            messages.add(ProjectUpdateWizardLogger.NEW_LINE);
            changeTypeToCompareWith = "Table is in CSV";
        }
        
        boolean hasDiffs = false;
        for (final DataRecord difference : this.diffRecords) {
            
            final String changeType = difference.getValue(IMergeSchema.CHANGE_TYPE_FIELD).toString();
            
            if (changeType.equals(changeTypeToCompareWith)) {
                hasDiffs = true;
                messages.add(ProjectUpdateWizardLogger.TAB_SPACE
                        + difference.getValue(ProjectUpdateWizardUtilities.A_F_T_TABLE_NAME)
                            .toString());
            }
        }
        if (!hasDiffs) {
            messages.add(NO_MISS_TABLES_MSG);
            messages.add(ProjectUpdateWizardLogger.NEW_LINE);
        }
        return messages;
    }
    
    /**
     * 
     * @param schProj can be "SCHEM" or "PROJ"
     * @return missing tables from
     */
    private List<String> getLogMessageForMissingFldsFrom(final String schProj) {
        final List<String> messages = new ArrayList<String>();
        
        String changeTypeToCompareWith = "";
        if (SCHEM.equalsIgnoreCase(schProj)) {
            messages.add(ProjectUpdateWizardLogger.TAB_SPACE + MISS_FIELDS_FROM_CSV_MSG);
            messages.add(ProjectUpdateWizardLogger.NEW_LINE);
            changeTypeToCompareWith = DifferenceMessage.PROJECT_ONLY.name();
        } else {
            messages.add(ProjectUpdateWizardLogger.TAB_SPACE + MISS_FIELDS_FROM_PROJECT_MSG);
            messages.add(ProjectUpdateWizardLogger.NEW_LINE);
            changeTypeToCompareWith = DifferenceMessage.NEW.name();
        }
        
        boolean hasDiff = false;
        for (final DataRecord difference : this.diffRecords) {
            final String changeType = difference.getValue(IMergeSchema.CHANGE_TYPE_FIELD).toString();
            if (changeType.equals(changeTypeToCompareWith)) {
                hasDiff = true;
                messages.add(ProjectUpdateWizardLogger.TAB_SPACE
                        + ProjectUpdateWizardLogger.TAB_SPACE
                        + difference.getValue(ProjectUpdateWizardUtilities.A_F_T_FIELD_NAME)
                            .toString());
                messages.add(ProjectUpdateWizardLogger.NEW_LINE);
            }
        }
        if (!hasDiff) {
            messages.clear();
        }
        return messages;
    }
    
    /**
     * 
     */
    private void loadMissingFromDb() {
        final DataSource comparatorDs = DataSourceFactory.createDataSource();
        comparatorDs.addTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        comparatorDs.addField("autonumbered_id");
        comparatorDs.addField("table_name");
        comparatorDs.addField("field_name");
        comparatorDs.addField("change_type");
        comparatorDs.addField(DATA_DICT_DIFFS);
        comparatorDs.addRestriction(Restrictions.isNotNull(
            ProjectUpdateWizardConstants.AFM_FLDS_TRANS, DATA_DICT_DIFFS));
        
        this.diffRecords.addAll(comparatorDs.getRecords());
    }
    
    /**
     * Gets unique table names to process.
     * 
     * @return table names list
     */
    private List<String> getTableNames() {
        final List<String> tableNames = new ArrayList<String>();
        
        for (final DataRecord difference : this.diffRecords) {
            final String tableName =
                    difference.getValue(ProjectUpdateWizardUtilities.A_F_T_TABLE_NAME).toString();
            if (!tableNames.contains(tableName)) {
                tableNames.add(tableName);
            }
        }
        return tableNames;
    }
}
