package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.altertable;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.compare.CompareFieldDef;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaUtilities;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.*;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.StringUtil;

/**
 * Add/Drop fields from a table.
 *
 * @author Catalin Purice
 *
 */
public class AddDropFields extends CreateAlterTable {
    
    /**
     * Output.
     */
    private final SqlCommandOutput output;
    
    /**
     * Table name to check.
     */
    private final String tableName;
    
    /**
     * True if fields were added/dropped from table.
     */
    private boolean tableChanged;
    
    /**
     * Constructor.
     *
     * @param tblName table name
     * @param output output
     * @param tableSpaceName name of the table space for Oracle
     */
    public AddDropFields(final String tblName, final SqlCommandOutput output,
            final String tableSpaceName) {
        super(ContextStore.get().getProject().loadTableDef(tblName), output, tableSpaceName);
        this.tableName = tblName;
        this.output = output;
    }
    
    /**
     * @return the tableChanged
     */
    public boolean isTableChanged() {
        return this.tableChanged;
    }
    
    /**
     * drop tables that are missing from ARCHIBUS data dictionary.
     *
     * @param fieldsNames field names to drop
     */
    /*
     * private void drop(final List<String> fieldsNames) { for (final String fieldName :
     * fieldsNames) { final DatabaseSchemaTableDef sqlTblDef =
     * this.getSqlTableDef().loadTableFieldsDefn(); if
     * (sqlTblDef.getFieldDef(fieldName).isForeignKey()) { final List<DatabaseSchemaForeignKeyDef>
     * sqlFkeys = sqlTblDef.getFKeysDefn(); dropForeignKeys(sqlFkeys); } if
     * (sqlTblDef.getFieldDef(fieldName).isPrimaryKey()) { dropPrimaryKeys(); } if
     * (SqlUtils.isSqlServer()) { final String dropDfltConstr =
     * SqlServerActions.dropDefaultValueConstraintIfExists( sqlTblDef.getTableName(), fieldName);
     * this.output.runCommand(dropDfltConstr, DataSource.DB_ROLE_SCHEMA); } dropColumn(fieldName); }
     * }
     */
    
    /**
     * Drop column.
     *
     * @param oldFieldName field name to be dropped
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #6: Changes to SQL schema.
     */
    /*
     * @SuppressWarnings("PMD.AvoidUsingSql")
     * 
     * protected void dropColumn(final String oldFieldName) { String deleteColumn = " DELETE "; if
     * (SqlUtils.isOracle() || SqlUtils.isSqlServer()) { deleteColumn =
     * SchemaUpdateWizardConstants.DROP_COLUMN; } final String dropColumnStmt =
     * SchemaUpdateWizardConstants.ALTER_TABLE + this.getTableName() + deleteColumn + oldFieldName;
     * this.output.runCommand(dropColumnStmt, DataSource.DB_ROLE_SCHEMA); }
     */
    /**
     * creates tables that are missing from SQL database.
     *
     * @param fieldsNames field names to add
     */
    private void add(final List<String> fieldsNames) {
        
        final int noOfRecords =
                ProjectUpdateWizardUtilities.getNoOfRecordsFromDB(this.getSqlTableDef()
                    .getTableName());
        
        for (final String fieldName : fieldsNames) {
            final ArchibusFieldDefBase.Immutable fieldDef =
                    this.getTableDef().getFieldDef(fieldName);
            if (!fieldDef.getAllowNull() && StringUtil.isNullOrEmpty(fieldDef.getDefaultValue())
                    && noOfRecords > 0) {
                addNotNullFields(fieldName);
            } else {
                final String addFieldStmt = addField(fieldName, false, false);
                this.output.runCommand(addFieldStmt, DataSource.DB_ROLE_SCHEMA);
            }
            if (this.getTableDef().getFieldDef(fieldName).isValidateData()
                    && this.getTableDef().getFieldDef(fieldName).isForeignKey()
                    && this.getTableDef().getFieldDef(fieldName).getDefaultValue() != null) {
                final ValidateForeignKey fkValidator =
                        new ValidateForeignKey(this.getTableDef().findForeignKey(fieldName));
                final String insertStmt = fkValidator.getStatement();
                if (insertStmt.length() > 0) {
                    this.getPostponedStmts().add(insertStmt);
                }
            }
        }
    }
    
    /**
     * Add a NOT NULL field to a non empty table.
     *
     * @param fieldName field name
     */
    private void addNotNullFields(final String fieldName) {
        final String addFieldAsNullableStmt = addField(fieldName, false, true);
        this.output.runCommand(addFieldAsNullableStmt, DataSource.DB_ROLE_SCHEMA);
        // reload table
        this.setSqlTableDef(this.getSqlTableDef().loadTableFieldsDefn());
        
        final String updateNullFields =
                TableUtilities.updateNullFields(this.getTableDef().getFieldDef(fieldName));
        this.output.runCommand(updateNullFields, DataSource.DB_ROLE_DATA);
        final CompareFieldDef fieldToCompare =
                new CompareFieldDef(this.getSqlTableDef(), this.getTableDef(), fieldName);
        final AlterTable fieldToAlter =
                AlterTableCreator.createAlterTable(fieldToCompare, false, this.output,
                    this.isNlsToChar());
        final StringBuilder alterFieldStmt = new StringBuilder();
        alterFieldStmt.append(fieldToAlter.getAlterFieldStatementPrefix());
        alterFieldStmt.append(fieldName);
        alterFieldStmt.append(" ");
        alterFieldStmt.append(fieldToAlter.getDataTypeStatement());
        alterFieldStmt.append(fieldToAlter.getAllowNullStatement());
        this.output.runCommand(alterFieldStmt.toString(), DataSource.DB_ROLE_SCHEMA);
    }
    
    /**
     * Add new field to table.
     *
     * @param fieldName field name
     * @param usePrefix true when you do not change data type
     * @param dontSetNotNull don't set null the field
     * @return add field statement
     */
    private String addField(final String fieldName, final boolean usePrefix,
            final boolean dontSetNotNull) {
        String addFieldStmt = SchemaUpdateWizardConstants.ALTER_TABLE;
        
        if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(this.tableName)) {
            addFieldStmt += SchemaUpdateWizardConstants.getSecureUser() + ".";
        }
        String prefix = "";
        if (usePrefix) {
            prefix = SchemaUpdateWizardConstants.AFM_TEMP_FIELD_PREFIX;
        }
        
        addFieldStmt += this.getTableDef().getName();
        addFieldStmt += " ADD ";
        
        final ArchibusFieldDefBase.Immutable fieldDef = this.getTableDef().getFieldDef(fieldName);
        addFieldStmt +=
                new SqlFieldDefinition(fieldDef, this.isNlsToChar()).fieldDefinition(
                    dontSetNotNull, null, null, false, prefix);
        
        // check whether the current field is DocMgmt
        // and server is oracle, because blob field for oracle need special treatment
        String blobStorage = "";
        if (fieldDef.getArchibusFieldType().getCode() == SchemaUpdateWizardConstants.AFM_DOC_TYPE
                && SqlUtils.isOracle()) {
            blobStorage = OracleActions.blobClauseForOracle(fieldName, this.getTableName());
        }
        addFieldStmt += blobStorage;
        
        return addFieldStmt;
    }
    
    /**
     * Process the tables.
     */
    public void process() {
        final List<String> fieldsToCreate =
                DatabaseSchemaUtilities.getMissingFieldsFromSql(this.tableName);
        final List<String> fieldsToDrop =
                DatabaseSchemaUtilities.getMissingFieldsFromArchibus(this.tableName);
        
        if (!fieldsToCreate.isEmpty()) {
            add(fieldsToCreate);
            this.tableChanged = true;
        }
        
        if (!fieldsToDrop.isEmpty()) {
            // drop(fieldsToDrop);
            this.tableChanged = true;
        }
    }
}
