package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.datasource.*;
import com.archibus.schema.*;
import com.archibus.utility.StringUtil;

/**
 * Generates meta-data as INSERT statements.
 * 
 * @author Catalin Purice
 */
public class CopyProjectData {
    
    /**
     * Constant.
     */
    private static final String LINE_SEPARATOR = "line.separator";

    /**
     * Constant.
     */
    private static final String COMMA = ",";
    
    /**
     * ARCHIBUS table definition.
     */
    private final transient TableDef.ThreadSafe toArchibusTableDef;
    
    /**
     * SQL table definition.
     */
    private final transient DatabaseSchemaTableDef fromSqlTableDef;
    
    /**
     * Output. This can be to log file or execute to DB.
     */
    private final transient SqlCommandOutput out;
    
    /**
     * Name of the table to transfer data to.
     */
    private final transient String toTableName;
    
    /**
     * If table is AUTOINCREMENT now and was not before.
     */
    private final transient boolean newAutoincrementFound;
    
    /**
     * Constructor.
     * 
     * @param fromSqlTableDef @see {@link CopyProjectData#fromSqlTableDef}
     * @param toTableDef @see {@link CopyProjectData#toTableDef}
     * @param out @see {@link CopyProjectData#out}
     */
    public CopyProjectData(final TableDef.ThreadSafe toTableDef,
            final DatabaseSchemaTableDef fromSqlTableDef, final SqlCommandOutput out) {
        this.toArchibusTableDef = toTableDef;
        this.fromSqlTableDef = fromSqlTableDef;
        this.toTableName = SchemaUpdateWizardConstants.TEMP_TABLE;
        this.newAutoincrementFound =
                isNumberOfFieldsChanged() && this.toArchibusTableDef.getIsAutoNumber()
                        && !this.fromSqlTableDef.isAutoNumber();
        
        this.out = out;
    }
    
    /**
     * Getter for the newAutoincrementFound property.
     * 
     * @see newAutoincrementFound
     * @return the newAutoincrementFound property.
     */
    public boolean isTableAutoincrementNow() {
        return this.newAutoincrementFound;
    }
    
    /**
     * Copies rows from a table using INSERT .. SELECT command.
     */
    public void copyData() {
        
        this.out.runCommands(prepareNotNullFieldsStmt());
        
        boolean isIdentityOn = false;
        String identityInsertStmt = "";
        
        if (SqlUtils.isSqlServer() && !this.newAutoincrementFound
                && this.toArchibusTableDef.getIsAutoNumber()) {
            identityInsertStmt = SqlServerActions.setIdentity(this.toTableName, true) + ';';
            isIdentityOn = true;
        }
        
        if (SqlUtils.isOracle() && this.newAutoincrementFound) {
            this.out.runCommand(
                OracleActions.getCreateSequenceStmt(this.toArchibusTableDef.getName()),
                DataSource.DB_ROLE_DATA);
        }
        
        final String insertAllRowsStmt = identityInsertStmt + buildCopyDataStatement();
        this.out.runCommand(insertAllRowsStmt, DataSource.DB_ROLE_DATA);
        
        if (isIdentityOn) {
            this.out.runCommand(SqlServerActions.setIdentity(this.toTableName, false),
                DataSource.DB_ROLE_DATA);
        }
    }
    
    /**
     * Updates the fields, that were NULL and they are not anymore, with default values.
     * 
     * @return list of SQL commands
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #3: Statements with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private List<String> prepareNotNullFieldsStmt() {
        
        final List<String> updateStmt = new ArrayList<String>();
        
        for (final String fieldName : this.fromSqlTableDef.getFieldsName()) {
            
            if (this.toArchibusTableDef.getFieldNames().contains(fieldName.toLowerCase())) {
                final DatabaseSchemaFieldDef sqlFieldDef =
                        this.fromSqlTableDef.getFieldDef(fieldName.toLowerCase());
                final ArchibusFieldDefBase.Immutable archibusFieldDef =
                        this.toArchibusTableDef.getFieldDef(sqlFieldDef.getName().toLowerCase());
                if (!sqlFieldDef.isPrimaryKey() && sqlFieldDef.isAllowNull()
                        && !archibusFieldDef.getAllowNull()) {
                    updateStmt.add(String.format("UPDATE %s SET %s = %s WHERE %s IS NULL",
                        archibusFieldDef.getTableName(), archibusFieldDef.getName(),
                        getDefaultValue(archibusFieldDef), archibusFieldDef.getName()));
                }
            }
        }
        return updateStmt;
    }
    
    /**
     *
     * @return INSERT... SELECT statement pattern.
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this class.
     *         <p>
     *         Justification: Case #2: Statements with INSERT ... SELECT pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private String buildCopyDataStatement() {
        final StringBuilder newFields = new StringBuilder();
        final StringBuilder oldFields = new StringBuilder();
        final Iterator<String> iter = this.toArchibusTableDef.getFieldNames().iterator();
        while (iter.hasNext()) {
            final ArchibusFieldDefBase.Immutable archibusFieldDef =
                    this.toArchibusTableDef.getFieldDef(iter.next());
            addNewField(newFields, archibusFieldDef, iter.hasNext());
            addOldField(oldFields, archibusFieldDef, iter.hasNext());
        }

        final StringBuilder insertIntoAsSelect = new StringBuilder();
        
        insertIntoAsSelect.append("INSERT INTO ");
        insertIntoAsSelect.append(this.toTableName);
        insertIntoAsSelect.append("(");
        insertIntoAsSelect.append(newFields);
        insertIntoAsSelect.append(")");
        insertIntoAsSelect.append(System.getProperty(LINE_SEPARATOR));
        insertIntoAsSelect.append("SELECT ");
        insertIntoAsSelect.append(oldFields);
        insertIntoAsSelect.append(" FROM ");
        insertIntoAsSelect.append(this.fromSqlTableDef.getTableName());
        
        return insertIntoAsSelect.toString();
    }

    /**
     *
     * Add insert fields to string builder.
     *
     * @param newFields the StringBuilder
     * @param archibusFieldDef ARCHIBUS field definition
     * @param hasMoreFields if the field is the last
     */
    private void addNewField(final StringBuilder newFields,
            final ArchibusFieldDefBase.Immutable archibusFieldDef, final boolean hasMoreFields) {
        
        if (!SqlUtils.isOracle() && this.newAutoincrementFound && archibusFieldDef.isAutoNumber()) {
            // do not add new AUTOINCREMENT field for Sybase and Sql Server, because it will be
            // automatically incremented.
            removeSeparatorIfLast(newFields, hasMoreFields);
            return;
        } else {
            // for Oracle include all fields. Use sequences.
            newFields.append(archibusFieldDef.getName());
            if (hasMoreFields) {
                newFields.append(COMMA).append(System.getProperty(LINE_SEPARATOR));
            }
        }
    }

    /**
     *
     * Add select fields to string builder.
     *
     * @param oldFields the StringBuilder
     * @param archibusFieldDef ARCHIBUS field definition
     * @param hasMoreFields if the field is the last
     */
    private void addOldField(final StringBuilder oldFields,
            final ArchibusFieldDefBase.Immutable archibusFieldDef, final boolean hasMoreFields) {
        
        if (this.fromSqlTableDef.getFieldsName().contains(archibusFieldDef.getName())) {
            oldFields.append(archibusFieldDef.getName());
        } else if (this.newAutoincrementFound && archibusFieldDef.isAutoNumber()) {
            if (SqlUtils.isOracle()) {
                oldFields.append(getOracleNextValueSintax());
            } else {
                removeSeparatorIfLast(oldFields, hasMoreFields);
                return;
            }
        } else {
            // field is new. Use DEFAULT value.
            oldFields.append(getDefaultValue(archibusFieldDef));
        }

        if (hasMoreFields) {
            oldFields.append(COMMA).append(System.getProperty(LINE_SEPARATOR));
        }
    }
    
    /**
     * 
     * Remove field separator if this is the last field.
     *  
     * @param fields all fields
     * @param hasMoreFields has more fields?
     */
    private void removeSeparatorIfLast(final StringBuilder fields, final boolean hasMoreFields) {
        if (!hasMoreFields) {
            fields.replace(fields.lastIndexOf(COMMA), fields.length(), "");
        }
    }
    
    /**
     * 
     * Get default value for a new field.
     * 
     * @param archibusFieldDef field definition
     * @return default value
     */
    private String getDefaultValue(final ArchibusFieldDefBase.Immutable archibusFieldDef) {
        final Object defaultValue = SchemaUpdateWizardUtilities.getDefaultValue(archibusFieldDef);
        
        Object value = defaultValue;
        
        if (StringUtil.isNullOrEmpty(defaultValue)) {
            if (archibusFieldDef.getAllowNull()) {
                value = "NULL";
            } else {
                if (archibusFieldDef.isCharType()) {
                    value = "' '";
                } else if (archibusFieldDef.IsNumType()) {
                    value = 0;
                } else if (archibusFieldDef.isDateTimeType()) {
                    
                    value =
                            SchemaUpdateWizardUtilities
                                .getFirstDate(((FieldDateTimeImpl) archibusFieldDef).isDate());
                }
            }
        } else {
            value =
                    SchemaUpdateWizardUtilities.formatDefaultValue(value.toString(),
                        archibusFieldDef);
        }
        
        return value.toString();
    }
    
    /**
     * 
     * Check if number of fields changed.
     * 
     * @return true if the number of field is different.
     */
    private boolean isNumberOfFieldsChanged() {
        boolean noOfFieldsChanged = false;
        if (this.toArchibusTableDef.getFieldNames().size() != this.fromSqlTableDef.getFieldsName()
            .size()) {
            noOfFieldsChanged = true;
        }
        return noOfFieldsChanged;
    }
    
    /**
     * 
     * Return NEXT VAL syntax for ORACLE sequence.
     * 
     * @return syntax for AUTOINCREMENTED field.
     */
    private String getOracleNextValueSintax() {
        return String.format(OracleActions.SEQ_NAME, this.toArchibusTableDef.getName())
                + ".NEXTVAL";
    }
}
