package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.altertable;

import com.archibus.app.sysadmin.updatewizard.schema.compare.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.SqlFieldDefinition;

/**
 *
 * Provides common logic for altering fields.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public abstract class AbstractAlterTable {
    /**
     * Constant.
     */
    protected static final String SPACE = " ";

    /**
     * compared field.
     */
    protected final CompareFieldDef fieldToCompare;

    /**
     * field definition.
     */
    protected final String fieldDefinition;

    /**
     * Output.
     */
    protected final SqlCommandOutput output;

    /**
     * SQL field definition.
     */
    protected final SqlFieldDefinition sqlFieldDefinition;
    
    /**
     * alter field statement prefix.
     */
    private String alterFieldStatementPrefix;
    
    /**
     * Constructor.
     *
     * @param fieldToCompareDefn compared field
     * @param isNlsToChar for Oracle only
     * @param dontSetNotNull whether or not the field is to be set not null
     * @param alterFieldStatementPrefix alter field statement prefix
     * @param output output
     */
    public AbstractAlterTable(final CompareFieldDef fieldToCompareDefn, final boolean isNlsToChar,
            final boolean dontSetNotNull, final String alterFieldStatementPrefix,
            final SqlCommandOutput output) {
        this.sqlFieldDefinition =
                new SqlFieldDefinition(fieldToCompareDefn.getArcFieldDef(), isNlsToChar);
        this.fieldToCompare = fieldToCompareDefn;
        this.fieldDefinition =
                this.sqlFieldDefinition.fieldDefinition(dontSetNotNull, null, null, true, "");
        this.alterFieldStatementPrefix = alterFieldStatementPrefix;
        this.output = output;
    }

    /**
     *
     * Is Data Type Or SizeChanged.
     *
     * @return boolean
     */
    protected boolean isDataTypeOrSizeChanged() {
        return this.fieldToCompare.get(PropertyType.SIZE).isChanged()
                || this.fieldToCompare.get(PropertyType.DECIMALS).isChanged()
                || this.fieldToCompare.get(PropertyType.TYPE).isChanged()
                || this.fieldToCompare.get(PropertyType.PK_CHG).isChanged();
    }
    
    /**
     * Getter for the alterFieldStatementPrefix property.
     *
     * @see alterFieldStatementPrefix
     * @return the alterFieldStatementPrefix property.
     */
    public String getAlterFieldStatementPrefix() {
        return this.alterFieldStatementPrefix;
    }
    
    /**
     * Setter for the alterFieldStatementPrefix property.
     *
     * @see alterFieldStatementPrefix
     * @param alterFieldStatementPrefix the alterFieldStatementPrefix to set
     */

    public void setAlterFieldStatementPrefix(final String alterFieldStatementPrefix) {
        this.alterFieldStatementPrefix = alterFieldStatementPrefix;
    }
    
    /**
     *
     * getAllowNullStatement.
     * 
     * @return String
     */
    public String getAllowNullStatement() {
        return this.sqlFieldDefinition.getAllowNullStatement();
    }
    
    /**
     *
     * get data type Statement.
     * 
     * @return String
     */
    public String getDataTypeStatement() {
        return this.sqlFieldDefinition.getDataTypeStatement();
    }
}
