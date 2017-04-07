package com.archibus.app.sysadmin.updatewizard.schema.dbschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.output.JDBCUtil;
import com.archibus.datasource.SqlUtils;
import com.archibus.utility.StringUtil;

/**
 * Physical database table definition.
 *
 * @author Catalin Purice
 *
 */
public class DatabaseSchemaTableDef {
    
    /**
     * Constant.
     */
    private static final String FIELD_NAME = "FIELD_NAME";
    
    /**
     * Constant.
     */
    private static final String FOREIGN_FIELD = "FOREIGN_FIELD";
    
    /**
     * Constant.
     */
    private static final String FOREIGN_TABLE = "FOREIGN_TABLE";
    
    /**
     * Constant.
     */
    private static final String REF_TABLE = "REF_TABLE";
    
    /**
     * Constant.
     */
    private static final String COMMA = ",";
    
    /**
     * Constant.
     */
    private static final String POSITION = "POSITION";
    
    /**
     * Constant.
     */
    private static final String ROLE_NAME = "ROLE_NAME";
    
    /**
     * Constant.
     */
    private static final String SYBASE_SEPARATOR_KEY_DEFN = " IS ";
    
    /**
     * All Fields definition.
     */
    private transient List<DatabaseSchemaFieldDef> fields;
    
    /**
     * Foreign Key definition.
     */
    private transient List<DatabaseSchemaForeignKeyDef> fKeysDefn;
    
    /**
     * Primary key definition.
     */
    private transient List<DatabaseSchemaPrimaryKeyDef> pKeysDefn;
    
    /**
     * table exists in physical DB (true/false).
     */
    private transient boolean tableExists;
    
    /**
     * table name.
     */
    private final transient String tableName;

    /**
     * Fields names.
     */
    private final List<String> fieldsNames;

    /**
     * Constructor.
     *
     * @param tableName table name
     */
    public DatabaseSchemaTableDef(final String tableName) {
        this.tableName = tableName;
        this.tableExists = false;
        this.pKeysDefn = new ArrayList<DatabaseSchemaPrimaryKeyDef>();
        this.fKeysDefn = new ArrayList<DatabaseSchemaForeignKeyDef>();
        this.fieldsNames = new ArrayList<String>();
    }
    
    /**
     *
     * @return boolean
     */
    public boolean exists() {
        return this.tableExists;
    }
    
    /**
     * @param fieldName field name
     * @return the field definition
     */
    public DatabaseSchemaFieldDef getFieldDef(final String fieldName) {
        DatabaseSchemaFieldDef fieldDef = null;
        for (final DatabaseSchemaFieldDef field : this.fields) {
            final String name = field.getName();
            if (name.equalsIgnoreCase(fieldName)) {
                fieldDef = field;
            }
        }
        return fieldDef;
    }
    
    /**
     *
     * @return fields names
     */
    public List<String> getFieldsName() {
        return this.fieldsNames;
    }

    /**
     * @return the fKeysDefn
     */
    public List<DatabaseSchemaForeignKeyDef> getFKeysDefn() {
        return this.fKeysDefn;
    }
    
    /**
     * @param fieldName field name
     * @return the fk field definition
     */
    public DatabaseSchemaForeignKeyDef getForeignKeyDef(final String fieldName) {
        DatabaseSchemaForeignKeyDef fkey = null;
        final List<DatabaseSchemaForeignKeyDef> fkeys = getFKeysDefn();
        for (final DatabaseSchemaForeignKeyDef fk : fkeys) {
            final String name = fk.getName();
            if (name.equalsIgnoreCase(fieldName)) {
                fkey = fk;
            }
        }
        return fkey;
    }
    
    /**
     * @return the pKeysDefn
     */
    public List<DatabaseSchemaPrimaryKeyDef> getPKeysDefn() {
        // loadPrimaryKeys();
        return this.pKeysDefn;
    }
    
    /**
     *
     * @return primary keys
     */
    public List<DatabaseSchemaPrimaryKeyDef> getPrimaryKeys() {
        return this.pKeysDefn;
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * @return true if the table is AUTOINCREMENT.
     */
    public boolean isAutoNumber() {
        boolean isAutoNum = false;
        for (final String fieldName : getFieldsName()) {
            if (getFieldDef(fieldName).isAutonum()) {
                isAutoNum = true;
                break;
            }
        }
        return isAutoNum;
    }
    
    /**
     *
     * @param fieldName field name
     * @return true if the field is doesn't exist in physical database
     */
    public boolean isNewField(final String fieldName) {
        return getFieldDef(fieldName) == null;
    }
    
    /**
     * Load the physical table definition.
     *
     * @return current object
     */
    public DatabaseSchemaTableDef loadTableFieldsDefn() {
        final List<String> columnsNames = JDBCUtil.getColumnNames(this.tableName);
        if (!columnsNames.isEmpty()) {
            this.tableExists = true;
            
            final String sql = loadQuery();
            
            final List<Map<String, Object>> records =
                    JDBCUtil.executeQuery(sql, Arrays.asList(getTableName()));
            
            this.fields = new ArrayList<DatabaseSchemaFieldDef>();
            
            for (final Map<String, Object> record : records) {
                final DatabaseSchemaFieldDef fieldDef =
                        new DatabaseSchemaFieldDef(this.tableName, record.get(FIELD_NAME)
                            .toString().toLowerCase());

                fieldDef.setDataType(record.get("DATA_TYPE").toString());
                fieldDef.setSize(Integer.parseInt(record.get("AFM_SIZE").toString()));
                fieldDef.setDecimals(Integer.parseInt(record.get("DECIMALS").toString()));
                fieldDef.setAllowNull(record.get("ALLOW_NULL").toString());
                fieldDef.setSqlTypes();
                final Object dfltVal = record.get("DFLT_VAL");
                String defaultValue = "";
                if (StringUtil.notNullOrEmpty(dfltVal)) {
                    defaultValue = fieldDef.processDefaultValue(dfltVal.toString());
                }
                fieldDef.setDfltVal(defaultValue);
                
                this.fields.add(fieldDef);
                this.fieldsNames.add(fieldDef.getName());
            }
            
            this.pKeysDefn = loadPKeysDefn();
            this.fKeysDefn = loadFKeysDefn();
        }
        return this;
    }
    
    /**
     *
     * @param records list of table definition records
     */
    private void getForeignFieldsForOrclAndMsSql(final List<Map<String, Object>> records) {
        this.fKeysDefn = new ArrayList<DatabaseSchemaForeignKeyDef>();
        List<String> foreignFields = null;
        List<String> foreignPkFields = null;
        DatabaseSchemaForeignKeyDef fKeyDefn = null;
        int oldPosition = 0;
        int pos = 0;
        for (final Map<String, Object> record : records) {
            final int currPosition = Integer.parseInt(record.get(POSITION).toString());
            if (oldPosition == 1 && currPosition == 1 || oldPosition > 1 && currPosition == 1) {
                fKeyDefn.setForeignFields(foreignFields);
                this.fKeysDefn.add(fKeyDefn);
            }
            
            fKeyDefn = new DatabaseSchemaForeignKeyDef(this.tableName);
            final String foreignFieldName = record.get(FIELD_NAME).toString();
            fKeyDefn.setForeignTableName(record.get(FOREIGN_TABLE).toString());
            fKeyDefn.setFieldName(record.get(FIELD_NAME).toString());
            fKeyDefn.setReferencedTableName(record.get(REF_TABLE).toString());
            fKeyDefn.setRole(record.get(ROLE_NAME).toString());
            final String foreignPkField = record.get(FOREIGN_FIELD).toString();
            
            fKeyDefn.setForeignKey(true);
            getFieldDef(foreignFieldName).setForeignKey(true);
            
            if (currPosition == 1) {
                foreignFields = new ArrayList<String>();
                foreignPkFields = new ArrayList<String>();
            }
            foreignFields.add(foreignFieldName);
            foreignPkFields.add(foreignPkField);
            
            oldPosition = currPosition;
            
            if (pos == records.size() - 1) {
                fKeyDefn.setForeignFields(foreignFields);
                fKeyDefn.setPrimaryColumns(foreignPkFields);
                this.fKeysDefn.add(fKeyDefn);
            }
            pos++;
            setRefTableForField(fKeyDefn.getName(), fKeyDefn.getReferencedTableName());
        }
    }
    
    /**
     *
     * @param foreignKeyFields in format <fk_field> IS <pk_field>, <fk_field2> IS <pk_field2>
     * @return first group of fields
     */
    private List<String> getForeignFieldsforSybase(final String foreignKeyFields) {
        final List<String> fFields = new ArrayList<String>();
        final String[] arrayFKPK = foreignKeyFields.split(COMMA);
        for (final String element : arrayFKPK) {
            final String[] fkFields = element.split(SYBASE_SEPARATOR_KEY_DEFN);
            fFields.add(fkFields[0]);
        }
        return fFields;
    }
    
    /**
     *
     * @param records list of table definition records
     */
    private void getForeignFieldsForSybase(final List<Map<String, Object>> records) {
        this.fKeysDefn = new ArrayList<DatabaseSchemaForeignKeyDef>();
        for (final Map<String, Object> record : records) {
            final DatabaseSchemaForeignKeyDef fKeyDefn =
                    new DatabaseSchemaForeignKeyDef(this.tableName);
            final String fieldName = record.get(FIELD_NAME).toString();
            fKeyDefn.setForeignTableName(record.get(FOREIGN_TABLE).toString());
            fKeyDefn.setFieldName(fieldName);
            fKeyDefn.setReferencedTableName(record.get(REF_TABLE).toString());
            fKeyDefn.setRole(record.get(ROLE_NAME).toString());
            final String fkpkFields = record.get(FOREIGN_FIELD).toString();
            final List<String> fkFields = getForeignFieldsforSybase(fkpkFields);
            fKeyDefn.setForeignFields(fkFields);
            final List<String> pkFields = getPrimaryFieldsForSybase(fkpkFields);
            fKeyDefn.setPrimaryColumns(pkFields);
            fKeyDefn.setForeignKey(true);
            this.fKeysDefn.add(fKeyDefn);
            setRefTableForField(fKeyDefn.getName(), fKeyDefn.getReferencedTableName());
            getFieldDef(fieldName).setForeignKey(true);
        }
    }
    
    /**
     * Transform the Primary keys string from Sybase format into ArrayList.
     *
     * @param primaryKeyfields in format <fk_field> IS <pk_field>, <fk_field2> IS <pk_field2>
     * @return the second group of fields
     */
    private List<String> getPrimaryFieldsForSybase(final String primaryKeyfields) {
        final List<String> pFields = new ArrayList<String>();
        final String[] arrayFKPK = primaryKeyfields.split(COMMA);
        for (final String element : arrayFKPK) {
            final String[] pkFields = element.split(SYBASE_SEPARATOR_KEY_DEFN);
            pFields.add(pkFields[0]);
        }
        return pFields;
    }
    
    /**
     * @return the fKeysDefn
     */
    private List<DatabaseSchemaForeignKeyDef> loadFKeysDefn() {
        loadForeignKeys();
        return this.fKeysDefn;
    }
    
    /**
     * loads foreign keys from sql database.
     */
    private void loadForeignKeys() {
        String foreignKeyStmt = "";
        if (SqlUtils.isSqlServer()) {
            // get foreign keys implemented as constraints
            foreignKeyStmt = SystemSql.FKEY_SQL_MSSQL;
        } else if (SqlUtils.isOracle()) {
            foreignKeyStmt = SystemSql.FKEY_SQL_ORACLE;
        } else {
            foreignKeyStmt = SystemSql.FKEY_SQL_SYBASE;
        }
        
        final List<Map<String, Object>> records =
                JDBCUtil.executeQuery(foreignKeyStmt, Arrays.asList(this.tableName));

        if (SqlUtils.isSybase()) {
            getForeignFieldsForSybase(records);
        } else {
            getForeignFieldsForOrclAndMsSql(records);
        }
    }
    
    /**
     * @return the pKeysDefn
     */
    private List<DatabaseSchemaPrimaryKeyDef> loadPKeysDefn() {
        loadPrimaryKeys();
        return this.pKeysDefn;
    }
    
    /**
     * Loads primary keys for table.
     */
    private void loadPrimaryKeys() {
        String primaryKeyStmt = "";
        if (SqlUtils.isSqlServer()) {
            // get primary keys implemented as constraints
            primaryKeyStmt = SystemSql.PKEY_SQL_MSSQL;
        } else if (SqlUtils.isOracle()) {
            primaryKeyStmt = SystemSql.PKEY_SQL_ORACLE;
        } else {
            primaryKeyStmt = SystemSql.PKEY_SQL_SYBASE;
        }
        
        final List<Map<String, Object>> records =
                JDBCUtil.executeQuery(primaryKeyStmt, Arrays.asList(this.tableName));
        
        this.pKeysDefn = new ArrayList<DatabaseSchemaPrimaryKeyDef>();
        for (final Map<String, Object> record : records) {
            final String fieldName = record.get("COLUMN_NAME").toString();
            final String constraintName = record.get("CONSTRAINT_NAME").toString();
            final DatabaseSchemaPrimaryKeyDef pKeyDefn =
                    new DatabaseSchemaPrimaryKeyDef(this.tableName, fieldName, constraintName);
            this.pKeysDefn.add(pKeyDefn);
            final DatabaseSchemaFieldDef fDef = this.getFieldDef(fieldName);
            fDef.setAutonum(fDef.getDfltVal());
            fDef.setPrimaryKey(true);
        }
    }
    
    /**
     * Gets query for field properties.
     *
     * @return query
     */
    private String loadQuery() {
        String query = "";
        if (SqlUtils.isOracle()) {
            query = SystemSql.FLDS_PROP_SQL_ORACLE;
        } else if (SqlUtils.isSqlServer()) {
            query = SystemSql.FLDS_PROP_SQL_MSSQL;
        } else {
            query = SystemSql.FLDS_PROP_SQL_SYBASE;
        }
        return query;
    }
    
    /**
     * Sets reference table for SqlFieldDef field type.
     *
     * @param fieldName field name
     * @param refTable reference table
     */
    private void setRefTableForField(final String fieldName, final String refTable) {
        for (final DatabaseSchemaFieldDef field : this.fields) {
            if (fieldName.equalsIgnoreCase(field.getName())) {
                field.setRefTable(refTable);
            }
        }
    }
}