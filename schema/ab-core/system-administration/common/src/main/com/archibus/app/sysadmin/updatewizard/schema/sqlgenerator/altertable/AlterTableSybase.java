package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.altertable;

import com.archibus.app.sysadmin.updatewizard.schema.compare.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.datasource.DataSource;

/**
 *
 * Alters fields for Sybase DB.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class AlterTableSybase extends AbstractAlterTable implements AlterTable {
    
    /**
     * Constructor.
     *
     * @param fieldToCompareDefn field to compare
     * @param dontSetNotNull do'nt set null
     * @param output the output
     */
    public AlterTableSybase(final CompareFieldDef fieldToCompareDefn, final boolean dontSetNotNull,
            final SqlCommandOutput output) {
        super(fieldToCompareDefn, false, dontSetNotNull, SchemaUpdateWizardConstants.ALTER_TABLE
                + fieldToCompareDefn.getArcFieldDef().getTableName()
                + SchemaUpdateWizardConstants.MODIFY, output);
    }

    /**
     * Alter Default.
     */
    public void alterDefault() {
        String alterDefaultStmt =
                this.getAlterFieldStatementPrefix()
                        + this.fieldToCompare.getArcFieldDef().getName();
        alterDefaultStmt += this.sqlFieldDefinition.getDefaultStatement();
        this.output.runCommand(alterDefaultStmt, DataSource.ROLE_STANDARD);
    }

    /**
     *
     * Alter AllowNull.
     */
    public void alterAllowNull() {
        String alterAllowNullStmt =
                this.getAlterFieldStatementPrefix()
                + this.fieldToCompare.getArcFieldDef().getName();
        alterAllowNullStmt += this.sqlFieldDefinition.getAllowNullStatement();
        this.output.runCommand(alterAllowNullStmt, DataSource.ROLE_STANDARD);
    }
    
    /**
     * Alter Data type and size.
     */
    public void alterTypeAndSize() {
        final String alterFieldStmt = this.getAlterFieldStatementPrefix() + this.fieldDefinition;
        this.output.runCommand(alterFieldStmt, DataSource.ROLE_STANDARD);
    }

    /**
     * Alter the field when autoincrement changed.
     */
    private void alterAutoincrement() {
        final String alterFieldStmt = this.getAlterFieldStatementPrefix() + this.fieldDefinition;
        this.output.runCommand(alterFieldStmt, DataSource.ROLE_STANDARD);
    }

    @Override
    public void alterField() {
        if (this.isDataTypeOrSizeChanged()) {
            alterTypeAndSize();
        }
        
        if (this.fieldToCompare.get(PropertyType.DEFAULT).isChanged()) {
            alterDefault();
        }
        if (!this.fieldToCompare.getArcFieldDef().isAutoNumber()
                && this.fieldToCompare.get(PropertyType.ALLOWNULL).isChanged()) {
            alterAllowNull();
        }
        if (this.fieldToCompare.get(PropertyType.AUTONUM).isChanged()) {
            alterAutoincrement();
        }
    }
}
