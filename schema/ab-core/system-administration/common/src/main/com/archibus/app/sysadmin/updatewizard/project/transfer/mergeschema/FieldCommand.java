package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.DataSourceFile;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

/**
 * 
 * Provides methods that add/updates/deletes data dictionary fields.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class FieldCommand implements ICommand {
    
    /**
     * Constant.
     */
    private static final String AFM_FLDS_TRANS_DOT = "afm_flds_trans.";
    
    /**
     * Constant.
     */
    private static final String AFM_FLDS_REF_TABLE = "afm_flds.ref_table";
    
    /**
     * Constant.
     */
    private static final List<String> AFM_FLDS_GROUPS = Arrays.asList("review_group", "edit_group");
    
    /**
     * Generated statements.
     */
    protected final List<String> statements;
    
    /**
     * Postponed statements.
     */
    private final List<String> postponedStatements;
    
    /**
     * Field record.
     */
    private final DictionaryRecord fieldRecord;
    
    /**
     * Generated statements for referenced tables.
     */
    private final List<String> refStatements;
    
    /**
     * Constructor.
     * 
     * @param fieldRecord change record
     */
    public FieldCommand(final DictionaryRecord fieldRecord) {
        super();
        this.fieldRecord = fieldRecord;
        this.statements = new ArrayList<String>();
        this.refStatements = new ArrayList<String>();
        this.postponedStatements = new ArrayList<String>();
    }
    
    /**
     * {@inheritDoc}
     */
    public void add() {
        
        final DataRecord newFieldRecord = prepareNewFieldRecord();
        
        newFieldRecord.setValue(IMergeSchema.TRANSFER_STATUS, IMergeSchema.STATUS_INSERTED);
        
        /**
         * check referenced tables that may not exists.
         */
        final String refTable = newFieldRecord.getString(AFM_FLDS_REF_TABLE);
        /**
         * add afm_flds record.
         */
        final StringBuffer statement = StatementBuilder.buildInsertStatement(newFieldRecord);
        
        if (StringUtil.notNullOrEmpty(refTable)
                && !ProjectUpdateWizardUtilities.isTableInArchibus(refTable)) {
            this.postponedStatements.add(statement.toString());
            this.postponedStatements.add(getInsertIntoLangTableStatement());
        } else {
            this.statements.add(statement.toString());
            this.statements.add(getInsertIntoLangTableStatement());
        }
        
        for (final String groupFieldName : AFM_FLDS_GROUPS) {
            validateAndAddIfMissing(groupFieldName);
        }
    }

    /**
     * Generates commands to add record into afm_flds_lang table if missing.
     * 
     * @return insert statement
     */
    private String getInsertIntoLangTableStatement() {
        final DataSource afmFldsLangDs =
                ProjectUpdateWizardUtilities
                .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_LANG);
        afmFldsLangDs.addField(ProjectUpdateWizardConstants.AFM_FLDS_LANG,
            ProjectUpdateWizardConstants.TABLE_NAME);
        afmFldsLangDs.addField(ProjectUpdateWizardConstants.AFM_FLDS_LANG,
            ProjectUpdateWizardConstants.FIELD_NAME);
        afmFldsLangDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_LANG,
            ProjectUpdateWizardConstants.TABLE_NAME, this.fieldRecord.getTableName()));
        afmFldsLangDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_LANG,
            ProjectUpdateWizardConstants.FIELD_NAME, this.fieldRecord.getFieldName()));
        
        String statement = "";

        if (StringUtil.isNullOrEmpty(afmFldsLangDs.getRecord())) {
            final DataRecord langFieldRecord = afmFldsLangDs.createNewRecord();
            langFieldRecord.setValue("afm_flds_lang.table_name", this.fieldRecord.getTableName());
            langFieldRecord.setValue("afm_flds_lang.field_name", this.fieldRecord.getFieldName());
            langFieldRecord.setValue("afm_flds_lang.transfer_status", IMergeSchema.STATUS_INSERTED);
            statement = StatementBuilder.buildInsertStatement(langFieldRecord).toString();
        }
        return statement;
    }
    
    /**
     * {@inheritDoc}
     */
    public void update() {
        
        final DataSource fieldDs = DataSourceBuilder.afmFlds().clearRestrictions();
        fieldDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.TABLE_NAME, this.fieldRecord.getTableName()));
        fieldDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.FIELD_NAME, this.fieldRecord.getFieldName()));
        
        final DataRecord changedRecord = fieldDs.getRecord();
        
        if (StringUtil.notNullOrEmpty(changedRecord)) {
            final String propertyToUpdate = this.fieldRecord.getPropertyToUpdate();
            final Object propertyValue =
                    this.fieldRecord.getChangedRecord().getValue(
                        AFM_FLDS_TRANS_DOT + propertyToUpdate);
            changedRecord.setValue("afm_flds." + propertyToUpdate, propertyValue == null ? "" : propertyValue);
            changedRecord.setValue(IMergeSchema.TRANSFER_STATUS, "UPDATED");
            final StringBuffer statement = StatementBuilder.buildUpdateStatement(changedRecord);
            this.statements.add(statement.toString());
        }
    }
    
    /**
     * {@inheritDoc}
     */
    public void remove() {
        
        final DataRecord record = prepareNewFieldRecord();
        final StringBuffer statement = StatementBuilder.buildDeleteStatement(record);
        this.statements.add(statement.toString());
    }
    
    /**
     * Validate against field name.
     * 
     * @param fieldName field name
     */
    public void validateAndAddIfMissing(final String fieldName) {
        
        /**
         * Check group names edit_group and review_group. If doesn't exits, add them.
         */
        final Object value =
                this.fieldRecord.getChangedRecord().getValue(AFM_FLDS_TRANS_DOT + fieldName);
        
        if (StringUtil.notNullOrEmpty(value) && !existsGroup(value.toString())) {
            
            addGroupName(value.toString());
            
        }
        
    }
    
    /**
     * 
     * Adds the required group name to the afm_groups table.
     * 
     * @param groupName group name
     */
    private void addGroupName(final String groupName) {
        // if ref table is not null and ref field != null then add new ref table record.
        // log exception if the csv of the ref table does not exist
        final List<Map<String, Object>> allGroups = loadDsfGroups();
        
        final Map<String, Object> groupMap =
                CsvUtilities.getMapByKey("group_name", groupName, allGroups);
        if (groupMap.isEmpty()) {
            this.refStatements.add("-- group_name " + groupName
                    + " is missing from afm_groups.csv file.");
        } else {
            final DataSource refTableDs =
                    ProjectUpdateWizardUtilities.createDataSourceForTable("afm_groups");

            final DataRecord newGroupRecord = CsvUtilities.mapToRecord(refTableDs, groupMap);

            newGroupRecord.setValue("afm_groups.transfer_status", IMergeSchema.STATUS_INSERTED);

            /**
             * add afm_groups record.
             */
            final StringBuffer statement = StatementBuilder.buildInsertStatement(newGroupRecord);
            this.refStatements.add(statement.toString());
        }
    }
    
    /**
     * Prepare the new field record for insert.
     * 
     * @throws ExceptionBase write warning to log if the statement fails
     * @return the new record
     */
    private DataRecord prepareNewFieldRecord() throws ExceptionBase {
        final List<String> excludeFields =
                new ArrayList<String>(Arrays.asList(IMergeSchema.AFM_FLDS_TRANS_CHOSEN_ACTION,
                    IMergeSchema.AFM_FLDS_TRANS_REC_ACTION, IMergeSchema.CHANGE_TYPE_FIELD,
                    "afm_flds_trans.data_dict_diffs", "afm_flds_trans.sql_table_diffs",
                    "afm_flds_trans.autonumbered_id"));
        final DataSource amFldsDs =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS);
        
        final DataRecord newRecord = amFldsDs.createNewRecord();
        
        for (final DataRecordField dataRec : this.fieldRecord.getChangedRecord().getFieldValues()) {
            if (!excludeFields.contains(dataRec.getName())) {
                final String name = dataRec.getName().replace("afm_flds_trans", "afm_flds");
                final Object value = dataRec.getValue();
                newRecord.setValue(name, value);
            }
        }
        return newRecord;
    }
    
    /**
     * 
     * Checks if the group_name exists.
     * 
     * @param groupName group name
     * @return true if the group name exists
     */
    private boolean existsGroup(final String groupName) {
        final DataSource dsGroups = DataSourceFactory.createDataSource();
        dsGroups.addTable(IMergeSchema.AFM_GROUPS_TABLE);
        dsGroups.addField(IMergeSchema.GROUP_NAME_FIELD);
        dsGroups.addRestriction(Restrictions.eq(IMergeSchema.AFM_GROUPS_TABLE,
            IMergeSchema.GROUP_NAME_FIELD, groupName));
        return !dsGroups.getRecords().isEmpty();
    }
    
    /**
     * Getter for the dsfGroups property.
     * 
     * @see dsfGroups
     * @return the dsfGroups property.
     */
    private static List<Map<String, Object>> loadDsfGroups() {
        return new DataSourceFile("afm_groups.csv").getAllRecords();
    }
    
    /**
     * Getter for the statements property.
     * 
     * @see statements
     * @return the statements property.
     */
    public List<String> getStatements() {
        return this.statements;
    }
    
    /**
     * Getter for the refStatements property.
     * 
     * @see refStatements
     * @return the refStatements property.
     */
    public List<String> getRefStatements() {
        return this.refStatements;
    }
    
    /**
     * Getter for the fieldRecord property.
     * 
     * @see fieldRecord
     * @return the fieldRecord property.
     */
    public DictionaryRecord getFieldRecord() {
        return this.fieldRecord;
    }
    
    /**
     * {@inheritDoc}
     */
    public List<String> getPostponedStatements() {
        return this.postponedStatements;
    }
    
}
