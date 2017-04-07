package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.altertable;

import com.archibus.app.sysadmin.updatewizard.schema.compare.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.datasource.DataSource;

/**
 * Alter fields for Sql Server DB.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class AlterTableSqlServer extends AbstractAlterTable implements AlterTable {

    /**
     * Constructor.
     *
     * @param fieldToCompareDefn field to compare
     * @param dontSetNotNull do'nt set null
     * @param output the output
     */
    public AlterTableSqlServer(final CompareFieldDef fieldToCompareDefn,
            final boolean dontSetNotNull, final SqlCommandOutput output) {
        super(fieldToCompareDefn, false, dontSetNotNull, SchemaUpdateWizardConstants.ALTER_TABLE
            + fieldToCompareDefn.getArcFieldDef().getTableName()
            + SchemaUpdateWizardConstants.ALTER_COLUMN, output);
    }
    
    /**
     *
     * Alter default.
     */
    public void alterDefault() {
        final String dropDfltConstr =
                SqlServerActions.dropDefaultValueConstraintIfExists(this.fieldToCompare
                    .getArchTableDef().getName(), this.fieldToCompare.getArcFieldDef().getName());
        this.output.runCommand(dropDfltConstr, DataSource.ROLE_STANDARD);
        final String addDfltConstr =
                SqlServerActions.changeDefaultValue(this.fieldToCompare.getArcFieldDef());
        this.output.runCommand(addDfltConstr, DataSource.ROLE_STANDARD);
    }

    /**
     *
     * alterAllowNull.
     */
    public void alterAllowNull() {
        String alterAllowNullStmt =
                this.getAlterFieldStatementPrefix()
                        + this.fieldToCompare.getArcFieldDef().getName();
        alterAllowNullStmt += SPACE + this.sqlFieldDefinition.getDataTypeStatement();
        alterAllowNullStmt += this.sqlFieldDefinition.getAllowNullStatement();
        this.output.runCommand(alterAllowNullStmt, DataSource.ROLE_STANDARD);
    }

    /**
     *
     * Alter Data Type and Size.
     */
    public void alterTypeAndSize() {
        this.output.runCommand(SqlServerActions.dropDefaultValueConstraintIfExists(
            this.fieldToCompare.getArchTableDef().getName(), this.fieldToCompare.getArcFieldDef()
                .getName()), DataSource.ROLE_STANDARD);

        final String allowNull =
                this.fieldToCompare.getArcFieldDef().isPrimaryKey() ? " NOT NULL "
                        : this.sqlFieldDefinition.getAllowNullStatement();
        
        this.output.runCommand(
            this.getAlterFieldStatementPrefix() + this.fieldToCompare.getArcFieldDef().getName()
            + SPACE + this.sqlFieldDefinition.getDataTypeStatement() + allowNull,
            DataSource.ROLE_STANDARD);
        
        if (!this.fieldToCompare.getArcFieldDef().isPrimaryKey()) {
            this.output.runCommand(
                SqlServerActions.changeDefaultValue(this.fieldToCompare.getArcFieldDef()),
                DataSource.ROLE_STANDARD);
        }
    }
    
    @Override
    public void alterField() {
        if (this.isDataTypeOrSizeChanged()) {
            alterTypeAndSize();
        } else if (!this.fieldToCompare.getArcFieldDef().isPrimaryKey()) {
            if (this.fieldToCompare.get(PropertyType.DEFAULT).isChanged()) {
                alterDefault();
            }
            if (!this.fieldToCompare.getArcFieldDef().isAutoNumber()
                    && this.fieldToCompare.get(PropertyType.ALLOWNULL).isChanged()) {
                alterAllowNull();
            }
        }
        
        if (this.fieldToCompare.get(PropertyType.AUTONUM).isChanged()) {
            alterAutoincrement();
        }
    }
    
    /**
     * Alter the field when autoincrement changed.
     */
    private void alterAutoincrement() {
        final String alterFieldStmt = this.getAlterFieldStatementPrefix() + this.fieldDefinition;
        this.output.runCommand(alterFieldStmt, DataSource.ROLE_STANDARD);
    }
    
}
