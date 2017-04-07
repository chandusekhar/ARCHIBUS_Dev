package com.archibus.app.sysadmin.updatewizard.schema.dbschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.SqlTypes;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.datasource.SqlUtils;
import com.archibus.utility.StringUtil;

/**
 * Physical database field definition.
 * 
 * @author Catalin Purice
 *         <p>
 *         Suppress PMD warning "TooManyFields" in this method.
 *         <p>
 *         Justification: This class contains one field more than the maximum number of accepted
 *         fields. There is too much work to avoid this warning, then I decided to suppress it.
 */
@SuppressWarnings("PMD.TooManyFields")
// TODO: (VT): This class should be re-factored.
public class DatabaseSchemaFieldDef {
    
    /**
     * Name of the field.
     */
    private transient String name;
    
    /**
     * reference table.
     */
    private String refTable;
    
    /**
     * size.
     */
    private int size;
    
    /**
     * is foreign key.
     */
    private boolean isForeignField;
    
    /**
     * is primary key.
     */
    private boolean isPrimaryField;
    
    /**
     * table definition.
     */
    private final transient DatabaseSchemaTableDef tableDef;
    
    /**
     * allow null.
     */
    private boolean allowNull;
    
    /**
     * auto-increment.
     */
    private boolean autonum;
    
    /**
     * SQL data type.
     */
    private String dataType;
    
    /**
     * decimals.
     */
    private int decimals;
    
    /**
     * depCols.
     */
    private String depCols;
    
    /**
     * default value.
     */
    private String dfltVal;
    
    /**
     * numeric type.
     */
    private boolean isNumericType;
    
    /**
     * char type.
     */
    private boolean isCharacterType;
    
    /**
     * date type.
     */
    private boolean isDateType;
    
    /**
     * binary type.
     */
    private boolean isFileType;
    
    /**
     * Constructor.
     * 
     * @param tableName table name
     */
    public DatabaseSchemaFieldDef(final String tableName) {
        this.tableDef = new DatabaseSchemaTableDef(tableName);
    }
    
    /**
     * Constructor.
     * 
     * @param tableName table name
     * @param fieldName field name
     */
    public DatabaseSchemaFieldDef(final String tableName, final String fieldName) {
        this.tableDef = new DatabaseSchemaTableDef(tableName);
        this.name = fieldName;
    }
    
    /**
     * @return the isBinaryType
     */
    public boolean isBinaryType() {
        return this.isFileType;
    }
    
    /**
     * @return the isForeignKey
     */
    public boolean isForeignKey() {
        return this.isForeignField;
    }
    
    /**
     * @param isForeign the isForeignKey to set
     */
    public void setForeignKey(final boolean isForeign) {
        this.isForeignField = isForeign;
    }
    
    /**
     * @return the isPrimaryKey
     */
    public boolean isPrimaryKey() {
        return this.isPrimaryField;
    }
    
    /**
     * @param isPrimary the isPrimaryKey to set
     */
    public void setPrimaryKey(final boolean isPrimary) {
        this.isPrimaryField = isPrimary;
    }
    
    /**
     * @return the dataType
     */
    public String getDataType() {
        return this.dataType;
    }
    
    /**
     * @return the decimals
     */
    public int getDecimals() {
        return this.decimals;
    }
    
    /**
     * @return the depCols
     */
    public String getDepCols() {
        return this.depCols;
    }
    
    /**
     * @return the dfltVal
     */
    public String getDfltVal() {
        return this.dfltVal;
    }
    
    /**
     * @return the fieldName
     */
    public String getName() {
        return this.name;
    }
    
    /**
     * sets SQL type.
     */
    public void setSqlTypes() {
        final String type = this.getDataType();
        if (SqlUtils.isSybase()) {
            setSybaseType(type);
        } else {
            if (type.toUpperCase().contains("DATE")) {
                this.isDateType = true;
            } else if (type.toUpperCase().contains("CHAR")) {
                this.isCharacterType = true;
            } else if ("IMAGE".equalsIgnoreCase(type) || "BLOB".equalsIgnoreCase(type)) {
                this.isFileType = true;
            } else {
                this.isNumericType = true;
            }
        }
    }
    
    /**
     * Sets the type for Sybase.
     * 
     * @param type data type
     */
    private void setSybaseType(final String type) {
        if (type.contains(String.valueOf(SqlTypes.SQL_DATE))) {
            this.isDateType = true;
        } else if (type.equals(String.valueOf(SqlTypes.SQL_CHAR))
                || type.equals(String.valueOf(SqlTypes.SQL_VARCHAR))) {
            this.isCharacterType = true;
        } else if (String.valueOf(SqlTypes.SQL_LONGVARBINARY).equals(type)) {
            this.isFileType = true;
        } else {
            this.isNumericType = true;
        }
    }
    
    /**
     * @return the isNumType
     */
    public boolean isNumType() {
        return this.isNumericType;
    }
    
    /**
     * @return the isCharType
     */
    public boolean isCharType() {
        return this.isCharacterType;
    }
    
    /**
     * Gets the oracle SQL type. Transform it to integer based on SQLTypes type.
     * 
     * @return oracle type as integer
     */
    public int getOracleSqlType() {
        final Set<Integer> set = SqlTypes.DATATYPE.keySet();
        final Iterator<Integer> itr = set.iterator();
        String type = "";
        int retType = 1;
        while (itr.hasNext()) {
            final int index = itr.next();
            type = SqlTypes.DATATYPE.get(index).isOracle();
            final int endIndex = type.indexOf('(');
            if (endIndex > 0) {
                type = type.substring(0, endIndex);
            }
            final String sqlType = this.getDataType();
            if (sqlType.equalsIgnoreCase(type)) {
                retType = index;
            }
        }
        return retType;
    }
    
    /**
     * @return the refTable
     */
    public String getRefTable() {
        return this.refTable;
    }
    
    /**
     * @return the size
     */
    public int getSize() {
        return this.size;
    }
    
    /**
     * 
     * @return sql type as integer
     */
    public int getSqlServerSqlType() {
        final Set<Integer> set = SqlTypes.DATATYPE.keySet();
        final Iterator<Integer> itr = set.iterator();
        String type = "";
        int retType = 1;
        while (itr.hasNext()) {
            final int index = itr.next();
            type = SqlTypes.DATATYPE.get(index).isSqlServer();
            final int endIndex = type.indexOf('(');
            if (endIndex > 0) {
                type = type.substring(0, endIndex);
            }
            final String sqlType = this.getDataType();
            if (sqlType.equalsIgnoreCase(type)) {
                retType = index;
            } else if ("int".equalsIgnoreCase(sqlType)) {
                retType = SqlTypes.SQL_INTEGER;
            }
        }
        return retType;
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableDef.getTableName();
    }
    
    /**
     * @return the allowNull
     */
    public boolean isAllowNull() {
        return this.allowNull;
    }
    
    /**
     * @return the autonum
     */
    public boolean isAutonum() {
        return this.autonum;
    }
    
    /**
     * Returns true if type is Date.
     * 
     * @return boolean
     */
    public boolean isDateTimeType() {
        return this.isDateType;
    }
    
    /**
     * @param allowNull the allowNull to set
     */
    public void setAllowNull(final String allowNull) {
        
        boolean isNullable = false;
        if ("1".equals(allowNull)) {
            isNullable = true;
        }
        this.allowNull = isNullable;
    }
    
    /**
     * @param defaultValue the default value to set
     */
    public void setAutonum(final Object defaultValue) {
        if (SqlUtils.isSybase()) {
            if (StringUtil.isNullOrEmpty(defaultValue)) {
                this.autonum = false;
            } else {
                if ("AUTOINCREMENT".equalsIgnoreCase(defaultValue.toString())) {
                    this.autonum = true;
                } else {
                    this.autonum = false;
                }
            }
        } else if (SqlUtils.isOracle()) {
            final String seqName = String.format(OracleActions.SEQ_NAME, getTableName());
            final String triggerName = String.format(OracleActions.TRIGGER_NAME, getTableName());
            if (OracleActions.existsSequence(seqName) && OracleActions.existsTrigger(triggerName)) {
                this.autonum = true;
            } else {
                this.autonum = false;
            }
        } else {
            this.autonum = SqlServerActions.isIdentityTable(getTableName(), getName());
        }
    }
    
    /**
     * @param dataType the dataType to set
     */
    public void setDataType(final String dataType) {
        if ("-4".equals(dataType) && SqlUtils.isSybase()) {
            this.dataType = String.valueOf(SqlTypes.SQL_LONGVARBINARY);
        } else {
            this.dataType = dataType;
        }
    }
    
    /**
     * @param decimals the decimals to set
     */
    public void setDecimals(final int decimals) {
        this.decimals = decimals;
    }
    
    /**
     * @param depCols the depCols to set
     */
    public void setDepCols(final String depCols) {
        this.depCols = depCols;
    }
    
    /**
     * @param dfltVal the dfltVal to set
     */
    public void setDfltVal(final String dfltVal) {
        this.dfltVal = dfltVal;
    }
    
    /**
     * @param fieldName the fieldName to set
     */
    public void setFieldName(final String fieldName) {
        this.name = fieldName;
    }
    
    /**
     * @param refTable the refTable to set
     */
    public void setRefTable(final String refTable) {
        this.refTable = refTable;
    }
    
    /**
     * @param size the size to set
     */
    public void setSize(final int size) {
        this.size = size;
    }
    
    /**
     * process the default value.
     * 
     * @param defaultVal default value as String
     * @return new default value
     */
    public String processDefaultValue(final String defaultVal) {
        String defaultValue = defaultVal;
        
        if (SqlUtils.isSqlServer()) {
            if (this.isNumType()) {
                // sql server stores number values like ((<value>))
                defaultValue = SchemaUpdateWizardUtilities.trimChar(defaultValue, '(', ')');
                defaultValue = SchemaUpdateWizardUtilities.trimChar(defaultValue, '(', ')');
            } else if (this.isDateTimeType()) {
                defaultValue = SchemaUpdateWizardUtilities.trimChar(defaultValue, '(', ')');
            } else {
                if (containsNewLinesOnly(defaultValue)) {
                    defaultValue = "";
                } else {
                    defaultValue = SchemaUpdateWizardUtilities.trimChar(defaultValue, '(', ')');
                    defaultValue = SchemaUpdateWizardUtilities.trimChar(defaultValue, '\'', '\'');
                }
            }
        } else {
            if (this.isCharType() && containsNewLinesOnly(defaultValue)) {
                defaultValue = "";
            } else {
                defaultValue = SchemaUpdateWizardUtilities.trimChar(defaultValue, '\'', '\'');
            }
        }
        return defaultValue;
    }
    
    /**
     * 
     * @param defaultVal default value
     * @return boolean
     */
    private boolean containsNewLinesOnly(final String defaultVal) {
        boolean isNewLines = false;
        final String valueWithOutNewLines = defaultVal.replace("\\x0A", "").replace(" ", "");
        final String value = SchemaUpdateWizardUtilities.trimChar(valueWithOutNewLines, '\'', '\'');
        if (value.length() == 0) {
            isNewLines = true;
        }
        return isNewLines;
    }
}