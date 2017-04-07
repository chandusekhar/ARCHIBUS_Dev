package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.loader.DataSourceFile;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.enterprisedt.util.debug.Logger;

/**
 * 
 * Provides methods that add/update/remove data dictionary table records.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class TableCommand implements ICommand {
    
    /**
     * Table record.
     */
    private final DictionaryRecord tableRecord;
    
    /**
     * Generated statements.
     */
    private final List<String> statements;
    
    /**
     * Generated referenced statements.
     */
    private final List<String> refStatements;
    
    /**
     * Postponed statements.
     */
    private final List<String> postponedStatements;
    
    /**
     * Constructor.
     * 
     * @param tableRecord table Record
     */
    public TableCommand(final DictionaryRecord tableRecord) {
        super();
        this.tableRecord = tableRecord;
        this.statements = new ArrayList<String>();
        this.refStatements = new ArrayList<String>();
        this.postponedStatements = new ArrayList<String>();
    }
    
    /**
     * {@inheritDoc}
     */
    public void add() {
        final List<Map<String, Object>> allTables = loadDsfTables();
        final Map<String, Object> tableMap =
                CsvUtilities.getTableMap(this.tableRecord.getTableName(), allTables);
        final DataRecord newTblRecord =
                CsvUtilities.mapToRecord(DataSourceBuilder.afmTbls(), tableMap);
        
        final List<DictionaryRecord> newFieldsRec =
                loadNewFieldsForTable(this.tableRecord.getTableName());
        
        if (newFieldsRec.isEmpty()) {
            
            Logger.getLogger(getClass()).warn(
                String.format("Table [%s] has no field defined.", this.tableRecord.getTableName()));
            
        } else {
            
            newTblRecord.setValue("afm_tbls.transfer_status", IMergeSchema.STATUS_INSERTED);
            
            /**
             * add new table record.
             */
            final StringBuffer statement = StatementBuilder.buildInsertStatement(newTblRecord);
            this.statements.add(statement.toString());
            
            /**
             * add new fields records.
             */
            for (final DictionaryRecord newFieldRec : newFieldsRec) {
                final FieldCommand newDictionaryField = new FieldCommand(newFieldRec);
                newDictionaryField.add();
                this.refStatements.addAll(newDictionaryField.getRefStatements());
                this.statements.addAll(newDictionaryField.getStatements());
                this.postponedStatements.addAll(newDictionaryField.getPostponedStatements());
            }
        }
    }
    
    /**
     * {@inheritDoc}
     */
    public void remove() {
        DataSourceBuilder.afmFlds().clearRestrictions();
        DataSourceBuilder.afmTbls().clearRestrictions();
        DataSourceBuilder.afmFlds().addRestriction(
            Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
                ProjectUpdateWizardUtilities.TABLE_NAME, this.tableRecord.getTableName()));
        
        final List<DataRecord> fldsRecords = DataSourceBuilder.afmFlds().getRecords();
        
        for (final DataRecord fldRecord : fldsRecords) {
            this.statements.add(StatementBuilder.buildDeleteStatement(fldRecord).toString());
        }
        
        DataSourceBuilder.afmTbls().addRestriction(
            Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
                ProjectUpdateWizardUtilities.TABLE_NAME, this.tableRecord.getTableName()));
        
        final DataRecord tblRecord = DataSourceBuilder.afmTbls().getRecord();
        
        this.statements.add(StatementBuilder.buildDeleteStatement(tblRecord).toString());
    }
    
    /**
     * Gets new DataRecords for a new table.
     * 
     * @param tableName table name
     * @return List<DataRecord> fields
     */
    private List<DictionaryRecord> loadNewFieldsForTable(final String tableName) {
        
        final DataSource dsNewFields =
                ProjectUpdateWizardUtilities
                    .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
                            ProjectUpdateWizardUtilities.TABLE_NAME, tableName))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
                            IMergeSchema.CHANGE_TYPE, DifferenceMessage.NEW));
        
        final List<DictionaryRecord> dRecords = new ArrayList<DictionaryRecord>();
        
        final List<DataRecord> allFields = dsNewFields.getRecords();
        
        for (final DataRecord record : allFields) {
            dRecords.add(new DictionaryRecord(record, ActionType.CHOSEN_ACTION));
        }
        
        return dRecords;
    }
    
    /**
     * {@inheritDoc}
     */
    public void update() {
        // tables records can't be updated.
    }
    
    /**
     * Getter for the dsfTables property.
     * 
     * @see dsfTables
     * @return the dsfTables property.
     */
    private static List<Map<String, Object>> loadDsfTables() {
        return new DataSourceFile("afm_tbls.csv").getAllRecords();
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
     * {@inheritDoc}
     */
    public List<String> getRefStatements() {
        return this.refStatements;
    }
    
    /**
     * {@inheritDoc}
     */
    public List<String> getPostponedStatements() {
        return this.postponedStatements;
    }
}
