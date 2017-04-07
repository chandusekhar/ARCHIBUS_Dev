package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.altertable;

import com.archibus.app.sysadmin.updatewizard.schema.compare.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.datasource.DataSource;

/**
 *
 * Alter fields for Oracle DB.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class AlterTableOracle extends AbstractAlterTable implements AlterTable {
    
    /**
     * Constructor.
     *
     * @param fieldToCompareDefn compared field
     * @param isNlsToChar for Oracle only
     * @param dontSetNotNull whether or not the field is to be set not null
     * @param output output
     */
    public AlterTableOracle(final CompareFieldDef fieldToCompareDefn, final boolean isNlsToChar,
            final boolean dontSetNotNull, final SqlCommandOutput output) {
        super(fieldToCompareDefn, isNlsToChar, dontSetNotNull, null, output);
        String alterFieldStmt = SchemaUpdateWizardConstants.ALTER_TABLE;
        if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(fieldToCompareDefn
            .getArcFieldDef().getTableName())) {
            alterFieldStmt +=
                    SchemaUpdateWizardConstants.getSecureUser() + SchemaUpdateWizardConstants.DOT;
        }
        this.setAlterFieldStatementPrefix(alterFieldStmt
            + fieldToCompareDefn.getArcFieldDef().getTableName()
            + SchemaUpdateWizardConstants.MODIFY);

    }

    /**
     * Alter Default.
     */
    private void alterDefault() {
        String alterDefaultStmt =
                this.getAlterFieldStatementPrefix()
                        + this.fieldToCompare.getArcFieldDef().getName();
        alterDefaultStmt += this.sqlFieldDefinition.getDefaultStatement();
        this.output.runCommand(alterDefaultStmt, DataSource.ROLE_STANDARD);
    }
    
    /**
     * Alter allow null.
     */
    private void alterAllowNull() {
        String alterAllowNullStmt =
                this.getAlterFieldStatementPrefix()
                + this.fieldToCompare.getArcFieldDef().getName();
        alterAllowNullStmt += this.sqlFieldDefinition.getAllowNullStatement();
        this.output.runCommand(alterAllowNullStmt, DataSource.ROLE_STANDARD);
    }

    /**
     * Alter the field when autoincrement changed.
     */
    private void alterAutoincrement() {
        final String alterFieldStmt = this.getAlterFieldStatementPrefix() + this.fieldDefinition;
        this.output.runCommand(alterFieldStmt, DataSource.ROLE_STANDARD);
    }
    
    /**
     * Alter data type and size.
     */
    private void alterTypeAndSize() {
        String alterFieldStmt = this.getAlterFieldStatementPrefix() + this.fieldDefinition;
        alterFieldStmt =
                this.getAlterFieldStatementPrefix()
                + this.fieldToCompare.getArcFieldDef().getName() + SPACE
                + this.sqlFieldDefinition.getDataTypeStatement()
                + this.sqlFieldDefinition.getAllowNullStatement();
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
                && this.fieldToCompare.get(PropertyType.ALLOWNULL).isChanged()
                && !this.isDataTypeOrSizeChanged()) {
            alterAllowNull();
        }
        if (this.fieldToCompare.get(PropertyType.AUTONUM).isChanged()) {
            alterAutoincrement();
        }
    }
}
