package com.archibus.app.sysadmin.updatewizard.schema.dbschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.JDBCUtil;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Utility class. Provides methods for Physical Schema.
 *
 * Used by Schema Change Wizard and Database Upgrade Wizard.
 *
 * @author Catalin Purice
 * @since 20.1
 *
 */
public final class DatabaseSchemaUtilities {

    /**
     * Constant.
     */
    private static final String AFM_TBLS_TABLE_NAME = "afm_tbls.table_name";

    /**
     * Constant.
     */
    private static final String ALIAS = "T";

    /**
     * Constant.
     */
    private static final String EXCEPT = " EXCEPT ";

    /**
     * Constant.
     */
    private static final String MINUS = " MINUS ";

    /**
     * SQL expression used as sub-query.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #1: SQL statements with subqueries.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String ARCH_TBLS_SQL = "SELECT LOWER(table_name) AS table_name"
            + " FROM afm_tbls WHERE is_sql_view=0";

    /**
     * SQL expression used as sub-query.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #1: SQL statements with subqueries.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String ARCH_FLDS_SQL = "SELECT LOWER(afm_flds.table_name) AS table_name, "
            + "LOWER(afm_flds.field_name) AS field_name FROM afm_flds, afm_tbls "
            + "WHERE afm_flds.table_name = afm_tbls.table_name AND afm_tbls.is_sql_view = 0";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DatabaseSchemaUtilities() {
        super();
    }

    /**
     *
     * @param roleName constraint name
     * @return true if the constraint exist and false otherwise
     */
    public static boolean existsConstraint(final String roleName) {
        
        String query = SystemSql.CONSTRAINT_FINDER_SYBASE;
        if (SqlUtils.isOracle()) {
            query = SystemSql.CONSTRAINT_FINDER_ORACLE;
        } else if (SqlUtils.isSqlServer()) {
            query = SystemSql.CONSTRAINT_FINDER_MSSQL;
        }

        final List<Map<String, Object>> records =
                JDBCUtil.executeQuery(query, Arrays.asList(roleName));
        
        return !records.isEmpty();
    }

    /**
     * Returns all table names from SQL DB.
     *
     * @return List<String>
     */
    public static List<String> getAllTableNames() {
        String query = SystemSql.ALL_TABLE_NAMES_SYBASE;
        if (SqlUtils.isOracle()) {
            query = SystemSql.ALL_TABLE_NAMES_ORACLE;
        } else if (SqlUtils.isSqlServer()) {
            query = SystemSql.ALL_TABLE_NAMES_MSSQL;
        }
        final DataSource tablesDS =
                DataSourceFactory.createDataSource()
                .addTable(ProjectUpdateWizardConstants.AFM_TBLS).addQuery(query);

        return getTablesNames(tablesDS);
    }

    /**
     *
     * @param tableName table name
     * @return missing fields
     */
    public static List<String> getMissingFieldsFromArchibus(final String tableName) {
        String sysRestriction = String.format(" AND UPPER(table_name)  = UPPER('%s')", tableName);
        final String afmRestriction = String.format(" AND afm_tbls.table_name = '%s'", tableName);
        String query =
                SystemSql.ALL_FIELDS_NAMES_SYBASE + sysRestriction + EXCEPT + ARCH_FLDS_SQL
                + afmRestriction;
        if (SqlUtils.isOracle()) {
            query =
                    SystemSql.ALL_FIELDS_NAMES_ORACLE + sysRestriction + MINUS + ARCH_FLDS_SQL
                    + afmRestriction;
        } else if (SqlUtils.isSqlServer()) {
            sysRestriction = String.format(" AND UPPER(T.table_name) = UPPER('%s')", tableName);
            query =
                    SystemSql.ALL_FIELDS_NAMES_MSSQL + sysRestriction + EXCEPT + ARCH_FLDS_SQL
                    + afmRestriction;
        }

        final DataSource tablesDS =
                DataSourceFactory.createDataSource()
                .addTable(ProjectUpdateWizardConstants.AFM_FLDS).addQuery(query);

        return getMissingFieldsNames(tablesDS);
    }

    /**
     *
     * @param tableName table name
     * @return missing fields
     */
    public static List<String> getMissingFieldsFromSql(final String tableName) {
        String sqlRestriction = String.format(" AND UPPER(table_name) = UPPER('%s')", tableName);
        final String afmRestriction = String.format("  AND afm_tbls.table_name = '%s'", tableName);
        String query =
                ARCH_FLDS_SQL + afmRestriction + "  EXCEPT " + SystemSql.ALL_FIELDS_NAMES_SYBASE
                + sqlRestriction;
        if (SqlUtils.isOracle()) {
            query =
                    ARCH_FLDS_SQL + afmRestriction + "  MINUS " + SystemSql.ALL_FIELDS_NAMES_ORACLE
                    + sqlRestriction;
        } else if (SqlUtils.isSqlServer()) {
            sqlRestriction = String.format(" AND  UPPER(T.table_name) = UPPER('%s')", tableName);
            query =
                    ARCH_FLDS_SQL + afmRestriction + " EXCEPT  " + SystemSql.ALL_FIELDS_NAMES_MSSQL
                    + sqlRestriction;
        }

        final DataSource tablesDS =
                DataSourceFactory.createDataSource()
                .addTable(ProjectUpdateWizardConstants.AFM_FLDS).addQuery(query);
        return getMissingFieldsNames(tablesDS);
    }

    /**
     * @param restriction like restriction
     * @return missing fields
     */
    public static List<String> getMissingTablesFromArchibus(final String restriction) {
        final String sqlRestriction =
                restriction.replace(ProjectUpdateWizardConstants.AFM_TBLS, ALIAS);
        String query =
                SystemSql.ALL_TABLE_NAMES_SYBASE + sqlRestriction + EXCEPT + ARCH_TBLS_SQL
                + restriction;
        if (SqlUtils.isOracle()) {
            query =
                    SystemSql.ALL_TABLE_NAMES_ORACLE + sqlRestriction.toUpperCase() + MINUS
                    + ARCH_TBLS_SQL + restriction;
        } else if (SqlUtils.isSqlServer()) {
            query =
                    SystemSql.ALL_TABLE_NAMES_MSSQL + sqlRestriction + EXCEPT + ARCH_TBLS_SQL
                    + restriction;
        }

        final DataSource tablesDS =
                DataSourceFactory.createDataSource()
                .addTable(ProjectUpdateWizardConstants.AFM_TBLS).addQuery(query);

        return getTablesNames(tablesDS);
    }

    /**
     * @param restriction restriction
     * @return missing tables
     */
    public static List<String> getMissingTablesFromSql(final String restriction) {
        final String sqlRestriction =
                restriction.replace(ProjectUpdateWizardConstants.AFM_TBLS, ALIAS);
        String query =
                ARCH_TBLS_SQL + restriction + EXCEPT + SystemSql.ALL_TABLE_NAMES_SYBASE
                + sqlRestriction;
        if (SqlUtils.isOracle()) {
            query =
                    ARCH_TBLS_SQL + restriction + MINUS + SystemSql.ALL_TABLE_NAMES_ORACLE
                    + sqlRestriction;
        } else if (SqlUtils.isSqlServer()) {
            query =
                    ARCH_TBLS_SQL + restriction + EXCEPT + SystemSql.ALL_TABLE_NAMES_MSSQL
                    + sqlRestriction;
        }

        final DataSource tablesDS =
                DataSourceFactory.createDataSource()
                .addTable(ProjectUpdateWizardConstants.AFM_TBLS).addQuery(query);
        return getTablesNames(tablesDS);
    }

    /**
     * get System tables that validates against tableName.
     *
     * @param tableName table name
     * @return dependent table names
     */
    public static List<String> getSQLValidatedTables(final String tableName) {
        // Get all the foreign keys that refer to tableNames's primary key.

        String vldTablesStmt = "";
        if (SqlUtils.isSqlServer()) {
            // get foreign keys implemented as constraints
            vldTablesStmt = String.format(SystemSql.VALIDATED_TABLES_SQL_MSSQL, tableName);
        } else if (SqlUtils.isOracle()) {
            vldTablesStmt = String.format(SystemSql.VALIDATED_TABLES_SQL_ORACLE, tableName);
        } else {
            vldTablesStmt = String.format(SystemSql.VALIDATED_TABLES_SQL_SYBASE, tableName);
        }
        final List<DataRecord> records =
                SqlUtils.executeQuery(SchemaUpdateWizardConstants.AFM_TBLS,
                    new String[] { ProjectUpdateWizardUtilities.TABLE_NAME }, vldTablesStmt);
        final List<String> tableNameList = new ArrayList<String>();
        for (final DataRecord record : records) {
            tableNameList.add(record.getValue(AFM_TBLS_TABLE_NAME).toString());
        }
        return tableNameList;
    }

    /**
     * To be used by Oracle only.
     *
     * @param tableName table name
     * @param fieldName field name
     * @return boolean
     */
    public static boolean isFieldInSql(final String tableName, final String fieldName) {
        return JDBCUtil.existsColumn(tableName, fieldName);
        // boolean fieldExists = true;
        // final String sql = String.format(SystemSql.EXISTS_FIELD_ORACLE_SQL, tableName,
        // fieldName);
        // final DataSource sqlFieldDS =
        // DataSourceFactory.createDataSource().addQuery(sql)
        // .addTable(ProjectUpdateWizardConstants.AFM_TBLS);
        // final List<DataRecord> records = sqlFieldDS.getRecords();
        // if (records.isEmpty()) {
        // fieldExists = false;
        // }
        // return fieldExists;
    }

    /**
     * returns true is the table exists in SQL.
     *
     * @param tableName table name
     * @return true if table exist in SQL
     */
    public static boolean isTableInSql(final String tableName) {
        return JDBCUtil.existsTable(tableName);
        // boolean tableExists = true;
        // String sql = String.format(SystemSql.SQL_TBLS_SYBASE, tableName);
        // if (SqlUtils.isOracle()) {
        // sql = String.format(SystemSql.SQL_TBLS_ORACLE, tableName);
        // } else if (SqlUtils.isSqlServer()) {
        // sql = String.format(SystemSql.SQL_TBLS_MSSQL, tableName);
        // }
        // final DataSource sqlTableDS =
        // DataSourceFactory
        // .createDataSource()
        // .addQuery(sql)
        // .addTable(ProjectUpdateWizardConstants.AFM_TBLS)
        // .addVirtualField(ProjectUpdateWizardConstants.AFM_TBLS,
        // ProjectUpdateWizardUtilities.TABLE_NAME, DataSource.DATA_TYPE_TEXT);
        // final List<DataRecord> records = sqlTableDS.getRecords();
        // if (records.isEmpty()) {
        // tableExists = false;
        // }
        // return tableExists;
    }

    /**
     * get table names from data source.
     *
     * @param missingFieldsDS DataSource
     * @return missing table names
     */
    private static List<String> getMissingFieldsNames(final DataSource missingFieldsDS) {
        final List<String> missingFields = new ArrayList<String>();
        final List<DataRecord> records = missingFieldsDS.getRecords();
        for (final DataRecord record : records) {
            missingFields.add(record.getValue("afm_flds.field_name").toString());
        }
        return missingFields;
    }

    /**
     * get table names from data source.
     *
     * @param missingTablesDS DataSource
     * @return missing table names
     */
    private static List<String> getTablesNames(final DataSource missingTablesDS) {
        final List<String> missingTables = new ArrayList<String>();
        final List<DataRecord> records = missingTablesDS.getRecords();
        for (final DataRecord record : records) {
            missingTables.add(record.getValue(AFM_TBLS_TABLE_NAME).toString());
        }
        return missingTables;
    }
}
