package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.schema.*;
import com.archibus.utility.ListWrapper;

/**
 * Creates/drops physical primary keys based on ARCHIBUS field definition.
 * 
 * @author Catalin
 * 
 */
public class ManagePrimaryKeys {
    
    /**
     * Constant.
     */
    private static final String ADD_CONSTRAINT = " ADD CONSTRAINT ";
    
    /**
     * Constant.
     */
    private static final String ADD_PRIMARY_KEY = " ADD PRIMARY KEY ";
    
    /**
     * Constant.
     */
    private static final String ALTER_TABLE = "ALTER TABLE ";
    
    /**
     * Constant.
     */
    private static final String DROP_CONSTRAINT = " DROP CONSTRAINT ";
    
    /**
     * Constant.
     */
    private static final String DROP_PRIMARY_KEY = " DROP PRIMARY KEY ";
    
    /**
     * Constant.
     */
    private static final String PRIMARY_KEY = " PRIMARY KEY ";
    
    /**
     * Constant.
     */
    private static final String USING_INDEX = " USING INDEX";
    
    /**
     * Constraint suffix.
     */
    private static final String SUFFIX = "_PK";
    
    /**
     * Table name length.
     */
    private static final int MAX_ORACLE_LENGTH = 30;
    
    /**
     * Output.
     */
    private transient SqlCommandOutput output;
    
    /**
     * table name.
     */
    private transient String tableName;
    
    /**
     * Constructor.
     * 
     * @param tableName table name
     * @param out output
     */
    public ManagePrimaryKeys(final String tableName, final SqlCommandOutput out) {
        this.tableName = tableName;
        this.output = out;
    }
    
    /**
     * Constructor.
     */
    public ManagePrimaryKeys() {
        // Use initializeObject() method after calling this constructor.
        // This will avoid creating objects in a loop.
    }
    
    /**
     * Creates all PKs for tDef.
     * 
     * @param isCreateSequence create or not the sequence for Oracle
     * @return sql create primary keys statements
     */
    public String createAllPrimaryKeys(final boolean isCreateSequence) {
        
        final TableDef.Immutable tableDef =
                ContextStore.get().getProject().loadTableDef(this.tableName);
        
        // get all primary key field definition
        final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> pkFieldsDef =
                tableDef.getPrimaryKey().getFields();
        
        String addPkStmt = "";
        if (pkFieldsDef.size() > 0
                && (!DatabaseSchemaPrimaryKeyDef.hasPrimaryKey(this.tableName) || this.output
                    .isLog())) {
            String sqlAlter = ALTER_TABLE;
            if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(this.tableName)) {
                sqlAlter +=
                        SchemaUpdateWizardConstants.getSecureUser()
                                + SchemaUpdateWizardConstants.DOT;
            }
            
            sqlAlter += this.tableName;
            
            // SQLServer and Oracle
            if (SqlUtils.isOracle() || SqlUtils.isSqlServer()) {
                sqlAlter +=
                        ADD_CONSTRAINT + getConstraintName() + PRIMARY_KEY
                                + SchemaUpdateWizardConstants.OPEN_BRACKET;
                sqlAlter += getKeys(pkFieldsDef);
                sqlAlter += SchemaUpdateWizardConstants.CLOSE_BRACKET;
                sqlAlter +=
                        (SqlUtils.isOracle()) ? handleOraclePrimaryKeyCreation(tableDef,
                            isCreateSequence) : "";
                
            } else {
                sqlAlter += ADD_PRIMARY_KEY + SchemaUpdateWizardConstants.OPEN_BRACKET;
                sqlAlter += getKeys(pkFieldsDef);
                sqlAlter += SchemaUpdateWizardConstants.CLOSE_BRACKET;
            }
            addPkStmt = sqlAlter;
        }
        return addPkStmt;
    }
    
    /**
     * 
     * @return constraint name
     */
    private String getConstraintName() {
        String name = this.tableName + SUFFIX;
        if (SqlUtils.isOracle() && name.length() > MAX_ORACLE_LENGTH) {
            final int maxTableLength = MAX_ORACLE_LENGTH - SUFFIX.length();
            final String newTableName = this.tableName.substring(0, maxTableLength);
            name = newTableName + SUFFIX;
        }
        return name;
    }
    
    /**
     * @param tableDef table definition
     * @param isCreateSeq weather or not to create the sequence
     * @return the alter statement
     */
    private String handleOraclePrimaryKeyCreation(final TableDef.Immutable tableDef,
            final boolean isCreateSeq) {
        final String sqlAlter = USING_INDEX;
        if (tableDef.getIsAutoNumber()) {
            if (isCreateSeq) {
                final List<String> dropTrigAndSeqStmts =
                        OracleActions.dropTriggerAndSequence(tableDef.getName());
                this.output.runCommands(dropTrigAndSeqStmts);
            }
            final List<String> createTrigAndSeqStmts =
                    OracleActions.createTriggerAndSequence(tableDef, isCreateSeq);
            this.output.runCommandNoParams(createTrigAndSeqStmts);
            
        } else {
            final List<String> dropTrigAndSeqStmts =
                    OracleActions.dropTriggerAndSequence(tableDef.getName());
            this.output.runCommands(dropTrigAndSeqStmts);
        }
        return sqlAlter;
    }
    
    /**
     * gets the primary keys.
     * 
     * @param pkFieldsDef list of primary keys
     * @return the primary keys
     */
    private String getKeys(final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> pkFieldsDef) {
        String pkFields = "";
        int pkCount = pkFieldsDef.size();
        for (final ArchibusFieldDefBase.Immutable pkFieldDef : pkFieldsDef) {
            pkFields += pkFieldDef.getName();
            if (pkCount > 1) {
                pkFields += ",";
                pkCount--;
            }
        }
        return pkFields;
    }
    
    /**
     * Drops all primary keys.
     */
    public void dropAllPrimaryKey() {
        final String tblName = getTableName();
        String sqlAlter = "";
        
        if ((SqlUtils.isOracle() || SqlUtils.isSqlServer())
                && DatabaseSchemaPrimaryKeyDef.hasPrimaryKey(this.tableName)) {
            
            final DatabaseSchemaTableDef sqlTableDef =
                    new DatabaseSchemaTableDef(tblName).loadTableFieldsDefn();
            final List<DatabaseSchemaPrimaryKeyDef> sqlPKsdef = sqlTableDef.getPrimaryKeys();
            
            for (final DatabaseSchemaPrimaryKeyDef sqlPKdef : sqlPKsdef) {
                final String constraintName = sqlPKdef.getConstraintName();
                sqlAlter = ALTER_TABLE;
                
                if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(tblName)) {
                    sqlAlter +=
                            SchemaUpdateWizardConstants.getSecureUser()
                                    + SchemaUpdateWizardConstants.DOT;
                }
                
                sqlAlter += tblName;
                sqlAlter += DROP_CONSTRAINT;
                sqlAlter += constraintName;
            }
            if (SqlUtils.isOracle()) {
                // final List<String> dropTrigAndSeqStmt =
                // OracleActions.dropTriggerAndSequence(tblName);
                // this.output.runCommands(dropTrigAndSeqStmt);
                sqlAlter += " CASCADE";
            }
            
            /*
             * for Sybase we do not need to specify constraint name
             */
        } else if (SqlUtils.isSybase() && DatabaseSchemaPrimaryKeyDef.hasPrimaryKey(this.tableName)) {
            sqlAlter = ALTER_TABLE + this.tableName + DROP_PRIMARY_KEY;
        }
        // Execute the alter table statement.
        this.output.runCommand(sqlAlter, DataSource.DB_ROLE_SCHEMA);
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * initialize members.
     * 
     * @param tName table name
     * @param out output
     */
    public void initializeObject(final String tName, final SqlCommandOutput out) {
        this.tableName = tName;
        this.output = out;
    }
}
