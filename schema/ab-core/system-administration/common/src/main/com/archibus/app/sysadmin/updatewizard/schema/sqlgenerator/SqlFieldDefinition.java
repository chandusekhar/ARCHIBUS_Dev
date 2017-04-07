package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import java.util.Locale;

import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.datasource.SqlUtils;
import com.archibus.schema.*;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.utility.StringUtil;

/**
 * Builds field definition that will be used to create/alter table.
 * 
 * @author Catalin
 * 
 */
public class SqlFieldDefinition {
    
    /**
     * Constant.
     */
    private static final String NULL = " NULL";
    
    /**
     * Constant.
     */
    private static final String NOT_NULL = " NOT NULL ";
    
    /**
     * BYTE/CHAR type for Oracle.
     */
    private String nlsLengthSemantics = "";
    
    /**
     * default statement.
     */
    private String defaultStatement = "";
    
    /**
     * allow null statement.
     */
    private String allowNullStatement = "";
    
    /**
     * data type statement.
     */
    private String dataTypeStatement = "";
    
    /**
     * ARCHIBUS field definition.
     */
    private final ArchibusFieldDefBase.Immutable archibusFieldDefn;
    
    /**
     * Constructor.
     * 
     * @param archibusFieldDefn ARCHIBUS field definition
     * @param isSetToChar set to char
     */
    public SqlFieldDefinition(final Immutable archibusFieldDefn, final boolean isSetToChar) {
        super();
        this.archibusFieldDefn = archibusFieldDefn;
        if (SqlUtils.isOracle()) {
            if (isSetToChar) {
                this.nlsLengthSemantics = " CHAR";
            } else {
                this.nlsLengthSemantics = " BYTE";
            }
        }
    }
    
    /**
     * @return the defaultStatement
     */
    public String getDefaultStatement() {
        return this.defaultStatement;
    }
    
    /**
     * @return the allowNullStatement
     */
    public String getAllowNullStatement() {
        return this.allowNullStatement;
    }
    
    /**
     * @return the dataTypeStatement
     */
    public String getDataTypeStatement() {
        return this.dataTypeStatement;
    }
    
    /**
     * Returns the field definition for sql statements.
     * 
     * @param dontSetNotNull set or do not set field as NULL
     * @param newSize new size
     * @param modify the field will be modified?
     * @param fieldNamePrefix field name prefix for data type change
     * @param newDataType new data type for cascade
     * @return sql field definition
     */
    public String fieldDefinition(final boolean dontSetNotNull, final String newSize,
            final Integer newDataType, final boolean modify, final String fieldNamePrefix) {
        
        final String fieldName = this.archibusFieldDefn.getName().toLowerCase();
        String definitionStmt = fieldName + fieldNamePrefix + ' ';
        
        final int fieldType = this.archibusFieldDefn.getSqlType();
        int fieldSize = this.archibusFieldDefn.getSize();
        final int fieldDecimals = this.archibusFieldDefn.getDecimals();
        int arcType = this.archibusFieldDefn.getArchibusFieldType().getCode();
        
        if (newDataType != null) {
            arcType = newDataType;
        }
        if (newSize != null) {
            fieldSize = Integer.parseInt(newSize);
        }
        
        this.dataTypeStatement = sqlFieldType(arcType, fieldType, fieldSize, fieldDecimals);
        definitionStmt += this.dataTypeStatement;
        
        boolean ignoreDefaultClause = false;
        if (SqlUtils.isSqlServer() && this.archibusFieldDefn.isAutoNumber()) {
            definitionStmt += " IDENTITY ";
            ignoreDefaultClause = true;
        }
        
        String defaultStmt = " DEFAULT ";
        
        if (SqlUtils.isSybase() || (!this.archibusFieldDefn.isAutoNumber() && !SqlUtils.isSybase())) {
            defaultStmt += defaultValue(this.archibusFieldDefn);
            this.defaultStatement = defaultStmt;
        } else {
            defaultStmt += " NULL ";
        }
        
        // Add a NOT NULL/NULL
        final String nullStmt = getAllowNull(dontSetNotNull);
        this.allowNullStatement = nullStmt;
        
        // order of NOT NULL/NULL and DEFAULT is different for ORACLE and sybase/SQL Server
        definitionStmt =
                orderDefaultAndAllowNullStmt(definitionStmt, ignoreDefaultClause, defaultStmt,
                    nullStmt);
        return definitionStmt;
    }
    
    /**
     * @param definitionStmt definition statement
     * @param ignoreDefaultClause if to ignore default statement
     * @param defaultStmt default statement
     * @param nullStmt null statement
     * @return statement
     */
    private String orderDefaultAndAllowNullStmt(final String definitionStmt,
            final boolean ignoreDefaultClause, final String defaultStmt, final String nullStmt) {
        String stmt = definitionStmt;
        if (SqlUtils.isOracle()) {
            stmt += defaultStmt;
            stmt += nullStmt;
        } else {
            stmt += nullStmt;
            if (!ignoreDefaultClause) {
                stmt += defaultStmt;
            }
        }
        return stmt;
    }
    
    /**
     * @param dontSetNotNull true/false
     * @return NULL/NOT NULL statement
     */
    private String getAllowNull(final boolean dontSetNotNull) {
        String nullStmt = NOT_NULL;
        if (dontSetNotNull) {
            nullStmt = "";
        } else if (this.archibusFieldDefn.getAllowNull() && !this.archibusFieldDefn.isPrimaryKey()) {
            nullStmt = NULL;
        }
        
        return nullStmt;
    }
    
    /**
     * Get the field's default value definition.
     * 
     * @param fieldDefn field definition
     * @return sql default value
     */
    private String defaultValue(final ArchibusFieldDefBase.Immutable fieldDefn) {
        String defaultStmt = " ";
        final Object dfltValue = SchemaUpdateWizardUtilities.getDefaultValue(fieldDefn);
        if (fieldDefn.isAutoNumber()) {
            defaultStmt += "AUTOINCREMENT";
        } else {
            if (StringUtil.isNullOrEmpty(dfltValue)) {
                defaultStmt = NULL;
            } else {
                defaultStmt +=
                        SchemaUpdateWizardUtilities.formatDefaultValue(String.valueOf(dfltValue),
                            fieldDefn);
            }
        }
        return defaultStmt;
    }
    
    /**
     * 
     * @param fieldDefn field definition
     * @return default value when the field is not null
     */
    /*
     * private String getValueForNotNullFields(final ArchibusFieldDefBase.Immutable fieldDefn) {
     * String defaultValue = NULL; if (!fieldDefn.isPrimaryKey() && !fieldDefn.getAllowNull()) { if
     * (fieldDefn.isCharType()) { defaultValue = SPACE; } else if (fieldDefn.IsNumType()) {
     * defaultValue = "0"; } else { defaultValue = SchemUpWizUtils.getCurrentDateTime(true); } }
     * return defaultValue; }
     */
    /**
     * Returns the database type.
     * 
     * @param sqlType sql type
     * @param afmType afm type
     * @param fieldSize field size
     * @param fieldDecimals field decimals
     * @return sql field type
     */
    private String sqlFieldType(final int afmType, final int sqlType, final int fieldSize,
            final int fieldDecimals) {
        int mySqlType = sqlType;
        if (afmType == SchemaUpdateWizardConstants.AFM_DOC_TYPE) {
            mySqlType = SqlTypes.SQL_LONGVARBINARY;
        }
        String dataFormat;
        String sqlStatement;
        
        if (SqlUtils.isOracle()) {
            dataFormat = SqlTypes.DATATYPE.get(mySqlType).isOracle();
        } else if (SqlUtils.isSqlServer()) {
            dataFormat = SqlTypes.DATATYPE.get(mySqlType).isSqlServer();
        } else {
            dataFormat = SqlTypes.DATATYPE.get(mySqlType).isSybase();
        }
        
        if (sqlType == SqlTypes.SQL_CHAR || sqlType == SqlTypes.SQL_VARCHAR) {
            if (SqlUtils.isOracle()) {
                sqlStatement =
                        String.format(Locale.getDefault(), dataFormat, fieldSize,
                            this.nlsLengthSemantics);
            } else {
                sqlStatement = String.format(Locale.getDefault(), dataFormat, fieldSize, "");
            }
        } else {
            sqlStatement = String.format(Locale.getDefault(), dataFormat, fieldSize, fieldDecimals);
        }
        
        return sqlStatement;
    }
}
