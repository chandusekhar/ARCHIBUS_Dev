package com.archibus.app.sysadmin.updatewizard.schema.dbschema;

import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;

/**
 * SQL used to get physical database objects definition for different databases.
 *
 * @author Catalin Purice
 *
 *         <p>
 *         Suppress PMD warning "AvoidUsingSql" in this method.
 *         <p>
 *         Justification: Case #4: Changes to SQL schema.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class SystemSql {

    /**
     * Constant.
     */
    public static final String UPPER = "'), UPPER('";

    /**
     * Constant.
     */
    public static final String SEPARATOR = "','";

    /**
     * SQL Server.
     */
    public static final String FKEY_SQL_MSSQL =
            "SELECT C.TABLE_NAME AS FOREIGN_TABLE, KCU.COLUMN_NAME AS FIELD_NAME, C2.TABLE_NAME AS REF_TABLE, KCU2.COLUMN_NAME AS FOREIGN_FIELD, C.CONSTRAINT_NAME AS ROLE_NAME, KCU.ORDINAL_POSITION AS POSITION FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS C "
                    + "INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KCU ON C.CONSTRAINT_SCHEMA = KCU.CONSTRAINT_SCHEMA AND C.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS RC "
                    + "ON C.CONSTRAINT_SCHEMA = RC.CONSTRAINT_SCHEMA AND C.CONSTRAINT_NAME = RC.CONSTRAINT_NAME INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS C2 ON RC.UNIQUE_CONSTRAINT_SCHEMA = C2.CONSTRAINT_SCHEMA "
                    + "AND RC.UNIQUE_CONSTRAINT_NAME = C2.CONSTRAINT_NAME INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KCU2 ON C2.CONSTRAINT_SCHEMA = KCU2.CONSTRAINT_SCHEMA AND C2.CONSTRAINT_NAME = KCU2.CONSTRAINT_NAME AND KCU.ORDINAL_POSITION = KCU2.ORDINAL_POSITION WHERE  C.CONSTRAINT_TYPE = 'FOREIGN KEY' AND C.TABLE_NAME = ? ORDER BY role_name, position";

    /**
     * Oracle.
     */
    public static final String FKEY_SQL_ORACLE =
            "SELECT a.table_name AS FOREIGN_TABLE, a.column_name AS FIELD_NAME, c.constraint_name AS ROLE_NAME, a.position AS POSITION,"
                    + "(SELECT ac.table_name FROM all_constraints ac WHERE ac.constraint_name = c.r_constraint_name) AS REF_TABLE,"
                    + "(SELECT aac.column_name FROM all_cons_columns aac WHERE aac.constraint_name = c.r_constraint_name and aac.position = a.position) AS FOREIGN_FIELD "
                    + "FROM all_cons_columns a, all_constraints c "
                    + "WHERE a.table_name = c.table_name  AND a.constraint_name = c.constraint_name AND c.constraint_type = 'R' "
                    + "AND UPPER(a.owner) IN (UPPER('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + UPPER
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "')) AND a.table_name=UPPER(?) ORDER BY 3,4";

    /**
     * Sybase.
     */
    public static final String FKEY_SQL_SYBASE =
            "SELECT foreign_tname AS FOREIGN_TABLE, "
                    + "                                          substring(role, char_length(foreign_table)+2, char_length(role)) AS FIELD_NAME, "
                    + "                                          primary_tname AS REF_TABLE, "
                    + "                                          role AS ROLE_NAME, columns AS FOREIGN_FIELD, 1 AS POSITION "
                    + "                                   FROM SYSFOREIGNKEYS "
                    + "                                   WHERE foreign_tname IN (SELECT table_name FROM SYSTABLE WHERE table_type='BASE' AND creator IN (SELECT user_id FROM SYSUSERPERMS WHERE user_name IN ('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + SEPARATOR
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "')) "
                    + "                                   AND table_name = ?) ORDER BY foreign_tname, primary_tname";

    /**
     * SQL Server.
     */
    public static final String FLDS_PROP_SQL_MSSQL =
            "SELECT LOWER(C.table_name) AS TABLE_NAME, LOWER(C.column_name) AS FIELD_NAME, C.data_type AS DATA_TYPE, (CASE WHEN C.CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN C.CHARACTER_MAXIMUM_LENGTH WHEN C.NUMERIC_PRECISION IS NOT NULL THEN C.NUMERIC_PRECISION ELSE C.DATETIME_PRECISION END) AS AFM_SIZE, ISNULL(C.numeric_scale, 0) AS DECIMALS, (CASE WHEN UPPER(C.IS_NULLABLE) = 'YES' THEN 1 ELSE 0 END) AS ALLOW_NULL, C.COLUMN_DEFAULT AS DFLT_VAL "
                    + "FROM INFORMATION_SCHEMA.COLUMNS as C, INFORMATION_SCHEMA.TABLES As T WHERE C.table_schema = T.table_schema "
                    + "AND C.table_name = T.table_name AND T.table_type = 'BASE TABLE' AND T.table_name <> 'dtproperties' AND C.table_name = ?";

    /**
     * Oracle.
     */
    public static final String FLDS_PROP_SQL_ORACLE =
            "SELECT C.TABLE_NAME AS TABLE_NAME, C.COLUMN_NAME AS FIELD_NAME, C.DATA_TYPE AS DATA_TYPE, (CASE WHEN (C.DATA_TYPE IN ('NUMBER', 'FLOAT') AND C.DATA_PRECISION IS NOT NULL) THEN C.DATA_PRECISION ELSE C.DATA_LENGTH END) AS AFM_SIZE, (CASE WHEN C.DATA_SCALE IS NULL THEN 0 ELSE C.DATA_SCALE END) AS DECIMALS, (CASE WHEN UPPER(C.NULLABLE) = 'Y' THEN 1 ELSE 0 END) AS ALLOW_NULL, C.DATA_DEFAULT AS DFLT_VAL "
                    + "FROM ALL_TAB_COLUMNS C WHERE UPPER(OWNER) IN (UPPER('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + UPPER
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "')) AND UPPER(C.TABLE_NAME) = UPPER(?)";

    /**
     * Queries that gets Primary key and foreign key properties
     */

    /**
     * Sybase.
     */
    public static final String FLDS_PROP_SQL_SYBASE =
            "SELECT LCase(T.table_name) AS TABLE_NAME, LCase(Z.column_name) AS FIELD_NAME, X.type_id AS DATA_TYPE, Z.width AS AFM_SIZE, Z.scale AS DECIMALS, (CASE WHEN Z.nulls = 'Y' THEN 1 ELSE 0 END) AS ALLOW_NULL, "
                    + "(CASE WHEN X.type_id IN (1,12) AND LENGTH(LTRIM(RTRIM(Z.[Default]))) > 1 AND SUBSTRING(LTRIM(RTRIM(Z.[Default])),0,1) = '''' AND SUBSTRING(LTRIM(RTRIM(Z.[Default])),LENGTH(LTRIM(RTRIM(Z.[Default]))),LENGTH(LTRIM(RTRIM(Z.[Default])))+1) = '''' THEN SUBSTRING(LTRIM(RTRIM(Z.[Default])), 2, LENGTH(LTRIM(RTRIM(Z.[Default])))-2) ELSE LTRIM(RTRIM(Z.[Default])) END) AS DFLT_VAL "
                    + "FROM SYSCOLUMN as Z, SYSTABLE as T, SYSDOMAIN AS X, SYSUSERPERMS WHERE T.table_id = Z.table_id AND T.table_type = 'BASE' AND T.creator = SYSUSERPERMS.user_id AND SYSUSERPERMS.user_name IN ('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + SEPARATOR
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "') AND Z.domain_id = X.domain_id AND LCase(T.table_name) = LCase(?)";

    /**
     * SQL Server.
     */
    public static final String PKEY_SQL_MSSQL =
            "SELECT tc.table_name AS TABLE_NAME, KCU.column_name AS COLUMN_NAME, KCU.ordinal_position AS POSITION, TC.constraint_name AS CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU, INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC WHERE "
                    + " TC.constraint_name = KCU.constraint_name AND TC.constraint_type = 'PRIMARY KEY' AND TC.table_name=? ORDER BY position";

    /**
     * Oracle.
     */
    public static final String PKEY_SQL_ORACLE =
            "SELECT A.table_name AS TABLE_NAME, A.column_name AS COLUMN_NAME, A.position AS POSITION, A.constraint_name AS CONSTRAINT_NAME "
                    + "FROM ALL_CONS_COLUMNS A JOIN ALL_CONSTRAINTS C ON A.CONSTRAINT_NAME = C.CONSTRAINT_NAME "
                    + "WHERE C.CONSTRAINT_TYPE = 'P' AND A.OWNER IN (UPPER('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + UPPER
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "')) AND UPPER(A.table_name)=UPPER(?) ORDER BY A.table_name, A.position";

    /**
     * Sybase.
     */
    public static final String PKEY_SQL_SYBASE =
            "SELECT SCS.tname AS TABLE_NAME, SCS.colno AS POSITION, SCS.cname AS COLUMN_NAME, 'OK' AS CONSTRAINT_NAME FROM sys.SYSCOLUMNS AS SCS WHERE SCS.creator IN ('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + SEPARATOR
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "') AND SCS.in_primary_key = 'Y' AND SCS.tname IN (SELECT table_name FROM SYSTABLE WHERE creator IN (SELECT user_id FROM SYSUSERPERMS WHERE user_name IN ('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + SEPARATOR
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "')) AND table_name = ?) ORDER BY SCS.tname, SCS.colno, SCS.cname";

    /**
     * SQL Server.
     */
    public static final String VALIDATED_TABLES_SQL_MSSQL =
            "SELECT f.name AS table_name FROM sysreferences, sysobjects f, sysobjects r, sysobjects c WHERE r.id = rkeyid AND f.id = fkeyid AND c.id = constid AND r.name = '%s'";

    /**
     * Oracle.
     */
    public static final String VALIDATED_TABLES_SQL_ORACLE =
            "SELECT c.table_name AS table_name FROM all_constraints c, all_constraints r "
                    + "WHERE c.constraint_type = 'R' AND c.r_owner = r.owner AND r.owner IN (UPPER('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + UPPER
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "')) AND c.r_constraint_name = r.constraint_name AND UPPER(r.table_name) = UPPER('%s')";

    /**
     * Sybase.
     */
    public static final String VALIDATED_TABLES_SQL_SYBASE =
            "SELECT DISTINCT foreign_tname AS table_name FROM SYSFOREIGNKEYS WHERE foreign_tname IN (SELECT table_name FROM SYSTABLE WHERE table_type='BASE' AND primary_tname='%s' AND creator IN (SELECT user_id FROM SYSUSERPERMS WHERE user_name IN ('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + SEPARATOR
                    + SchemaUpdateWizardConstants.getSecureUser() + "'))) ORDER BY foreign_tname";

    /**
     * Sybase constraint finder.
     */
    public static final String CONSTRAINT_FINDER_SYBASE =
            "SELECT 1 FROM SYSFOREIGNKEYS WHERE role=?";

    /**
     * Oracle constraint finder.
     */
    public static final String CONSTRAINT_FINDER_ORACLE =
            "SELECT 1 FROM all_constraints WHERE constraint_name=UPPER(?)";

    /**
     * SQL Server constraint finder.
     */
    public static final String CONSTRAINT_FINDER_MSSQL =
            "SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE constraint_type='FOREIGN KEY' AND constraint_name=?";

    /**
     * Oracle.
     */
    public static final String ALL_TABLE_NAMES_ORACLE =
            "SELECT LOWER(T.TABLE_NAME) AS table_name FROM ALL_TABLES T WHERE UPPER(OWNER) IN (UPPER('"
                    + SchemaUpdateWizardConstants.getDataUser() + UPPER
                    + SchemaUpdateWizardConstants.getSecureUser() + "') )";

    /**
     * Sybase.
     */
    public static final String ALL_TABLE_NAMES_SYBASE =
            "SELECT LCase(T.table_name) AS table_name FROM SYSTABLE as T, SYSUSERPERMS P WHERE T.table_type = 'BASE' AND T.creator = P.user_id AND P.user_name IN ('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + SEPARATOR
                    + SchemaUpdateWizardConstants.getSecureUser() + "')";

    /**
     * SQL Server.
     */
    public static final String ALL_TABLE_NAMES_MSSQL =
            "SELECT LOWER(T.table_name) AS table_name FROM INFORMATION_SCHEMA.TABLES As T WHERE "
                    + "T.table_type = 'BASE TABLE' AND T.table_name <> 'dtproperties'";

    /**
     * Oracle.
     */
    public static final String ALL_FIELDS_NAMES_ORACLE =
            "SELECT LOWER(C.TABLE_NAME) AS table_name, LOWER(C.COLUMN_NAME) AS field_name  FROM ALL_TAB_COLUMNS C WHERE UPPER(OWNER) IN (UPPER('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + UPPER
                    + SchemaUpdateWizardConstants.getSecureUser() + "'))";

    /**
     * Sybase.
     */
    public static final String ALL_FIELDS_NAMES_SYBASE =
            "SELECT LCase(T.table_name) AS table_name, LCase(Z.column_name) AS field_name FROM SYSCOLUMN as Z, SYSTABLE as T, SYSDOMAIN AS X, SYSUSERPERMS WHERE T.table_id = Z.table_id AND T.table_type = 'BASE' AND T.creator = SYSUSERPERMS.user_id AND SYSUSERPERMS.user_name IN ('"
                    + SchemaUpdateWizardConstants.getDataUser()
                    + SEPARATOR
                    + SchemaUpdateWizardConstants.getSecureUser()
                    + "') AND Z.domain_id = X.domain_id";

    /**
     * SQL Server.
     */
    public static final String ALL_FIELDS_NAMES_MSSQL =
            "SELECT LOWER(C.table_name) AS table_name, LOWER(C.column_name) AS field_name FROM INFORMATION_SCHEMA.COLUMNS as C, INFORMATION_SCHEMA.TABLES As T WHERE C.table_schema = T.table_schema "
                    + "AND C.table_name = T.table_name AND T.table_type = 'BASE TABLE' AND T.table_name <> 'dtproperties'";

    /**
     * Used to get the AUTOINCREMENT field value from Oracle DB.
     */
    public static final String MAX_AUTONUM_VALUE_ORACLE_SQL =
            "SELECT NVL(MAX(%s), 1) AS %s FROM %s";

    /**
     * Private constructor.
     */
    private SystemSql() {
    }
}
