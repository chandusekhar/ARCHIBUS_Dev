package com.archibus.app.sysadmin.updatewizard.schema.dbschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.output.JDBCUtil;
import com.archibus.datasource.SqlUtils;

/**
 * Physical database primary key definition.
 *
 * @author Catalin Purice
 *
 */
public class DatabaseSchemaPrimaryKeyDef extends DatabaseSchemaFieldDef {
    /**
     * Constraint name.
     */
    private transient String constraintName;
    
    /**
     * Constructor.
     *
     * @param tableName table name
     */
    public DatabaseSchemaPrimaryKeyDef(final String tableName) {
        super(tableName);
    }
    
    /**
     * Constructor.
     *
     * @param tableName table name
     * @param fieldName field name
     * @param constraintName constraint name
     */
    public DatabaseSchemaPrimaryKeyDef(final String tableName, final String fieldName,
            final String constraintName) {
        super(tableName, fieldName);
        this.constraintName = constraintName;
    }
    
    /**
     * @return the constraintName
     */
    public String getConstraintName() {
        return this.constraintName;
    }
    
    /**
     * Returns true if the table has PK defined and false otherwise.
     *
     * @param tableName table name
     * @return true/false
     */
    public static boolean hasPrimaryKey(final String tableName) {
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
                JDBCUtil.executeQuery(primaryKeyStmt, Arrays.asList(tableName));

        return !records.isEmpty();
        
    }
}
