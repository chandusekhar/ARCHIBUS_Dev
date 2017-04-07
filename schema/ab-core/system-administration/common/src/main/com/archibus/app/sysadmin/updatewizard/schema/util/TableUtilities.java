package com.archibus.app.sysadmin.updatewizard.schema.util;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaTableDef;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.SqlFieldDefinition;
import com.archibus.datasource.*;
import com.archibus.schema.*;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.*;

/**
 * Utility class. Provides methods used for table creation/alteration.
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public final class TableUtilities {

    /**
     * Find if primary keys are unique.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String FIND_PRIMARY_KEYS =
            "SELECT %1$s AS pkeys, COUNT(*) AS records FROM %2$s GROUP BY %1$s HAVING (COUNT(*) > 1)";
    
    /**
     * Constants.
     */
    private static final List<String> SECURABLES = Arrays.asList("afm_users", "afm_groups",
        "afm_roles", "afm_groupsforroles");
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private TableUtilities() {
    }
    
    /**
     * @param nlsToChar NLS to CHAR
     * @param tableSpaceName table-space name for Oracle
     * @param tableFieldsDef fields definition
     * @return fields definition statement
     */
    public static String buildTableFields(final boolean nlsToChar, final String tableSpaceName,
            final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> tableFieldsDef) {
        final StringBuilder fieldsDefinitionStmt = new StringBuilder();
        fieldsDefinitionStmt.append(" (");
        String fieldDefStmt = "";
        boolean firstFieldAdded = false;
        String blobStmt = "";
        for (final ArchibusFieldDefBase.Immutable archFieldDef : tableFieldsDef) {
            fieldDefStmt =
                    new SqlFieldDefinition(archFieldDef, nlsToChar).fieldDefinition(false, null,
                        null, false, "");
            if (SqlUtils.isOracle()
                    && archFieldDef.getArchibusFieldType().getCode() == SchemaUpdateWizardConstants.AFM_DOC_TYPE) {
                blobStmt =
                        OracleActions.blobClauseForOracle(archFieldDef.getName(), tableSpaceName);
            }
            
            if (fieldDefStmt.length() > 0) {
                if (firstFieldAdded) {
                    fieldsDefinitionStmt.append(", ").append(System.getProperty("line.separator"));
                } else {
                    firstFieldAdded = true;
                }
                fieldsDefinitionStmt.append(fieldDefStmt);
            }
        }
        fieldsDefinitionStmt.append(")");
        fieldsDefinitionStmt.append(blobStmt);

        return fieldsDefinitionStmt.toString();
    }
    
    /**
     * Grants permissions.
     * 
     * @param tableName name of the table
     * @param output output type
     */
    public static void grantPermissionToTable(final String tableName, final SqlCommandOutput output) {
        if (SqlUtils.isOracle()) {
            OracleActions.runOracleGrants(tableName, output);
        } else {
            final String grantStmt = SchemaUpdateWizardUtilities.sybaseAndMsSqlGrants(tableName);
            output.runCommand(grantStmt, DataSource.DB_ROLE_SECURITY);
        }
    }
    
    /**
     * Decide if to recreate table or not.
     *
     * @param isSqlAutoincrement is Physical table auto-increment?
     * @param isArchibusAutoincrement is Archibus table auto-increment?
     * @return true if we recreate the table
     */
    public static boolean isRecreateTable(final boolean isSqlAutoincrement,
            final boolean isArchibusAutoincrement) {
        return !isSqlAutoincrement && isArchibusAutoincrement ? true : false;
    }
    
    /**
     * Updates the NULL fields with default value if exists.
     * 
     * @param arcFieldDef ARCHIBUS field definition
     * @return UPDATE SQL command
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #3: Statements with UPDATE ... WHERE pattern.
     */
    
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static String updateNullFields(final ArchibusFieldDefBase.Immutable arcFieldDef) {
        String statement = "";
        if (!arcFieldDef.isAutoNumber()) {
            final Object defaultValue = getDefaultDbValue(arcFieldDef);
            final String sqlDefaultValue =
                    "NULL".equals(SqlUtils.formatValueForSql(defaultValue)) ? "' '" : SqlUtils
                        .formatValueForSql(defaultValue);
            statement =
                    String.format("UPDATE %s SET %s = %s WHERE %s IS NULL",
                        arcFieldDef.getTableName(), arcFieldDef.getName(), sqlDefaultValue,
                        arcFieldDef.getName());
        }
        return statement;
    }

    /**
     *
     * Format default value for specific DB.
     *
     * @param arcFieldDef ARCHIBUS field definition
     * @return the default value in the new format.
     */
    private static Object getDefaultDbValue(final ArchibusFieldDefBase.Immutable arcFieldDef) {
        Object defaultValue = arcFieldDef.getDefaultValue();
        if (StringUtil.isNullOrEmpty(defaultValue)) {
            if (arcFieldDef.IsNumType()) {
                defaultValue = 0;
            } else {
                // can't use empty string because ORACLE converts it to NULL.
                if (SqlUtils.isOracle()) {
                    defaultValue = " ";
                } else {
                    defaultValue = "";
                }
            }
        }
        return defaultValue;
    }

    /**
     *
     * If the primary keys is unique then return true.
     *
     * @param tableDef table definition
     * @param sqlTableDef sql table definition
     * @return boolean
     */
    public static boolean isPrimaryKeyUnique(final ThreadSafe tableDef,
            final DatabaseSchemaTableDef sqlTableDef) {
        final ListWrapper.Immutable<Immutable> primaryKeys = tableDef.getPrimaryKey().getFields();
        final Iterator<Immutable> iter = primaryKeys.iterator();
        final StringBuffer concatPkNames = new StringBuffer();
        final String concatSequence = SqlUtils.isSqlServer() ? "+" : "||";
        boolean isFieldMissing = false;
        while (iter.hasNext()) {
            final Immutable fieldDef = iter.next();
            final String fieldName = fieldDef.getName();
            if (sqlTableDef.isNewField(fieldName)) {
                isFieldMissing = true;
                break;
            } else {
                concatPkNames.append(fieldExpression(fieldDef));
                if (iter.hasNext()) {
                    concatPkNames.append(concatSequence);
                }
            }
        }
        return isFieldMissing ? false : SqlUtils.executeQuery(tableDef.getName(),
            new String[] { "pkeys" },
            String.format(FIND_PRIMARY_KEYS, concatPkNames, tableDef.getName())).isEmpty();
    }

    /**
     * 
     * Cast the date field to char. 
     * 
     * @param fieldDef field definition
     * @return the field name or database expression for date fields
     */
    private static String fieldExpression(final Immutable fieldDef) {
        String sqlCastField = fieldDef.getName();
        if (fieldDef.isDateTimeType()) {
            if (SqlUtils.isOracle()) {
                sqlCastField = String.format("TO_CHAR(%s, 'YYYY-MM-DD HH24:MI:SS')", fieldDef.getName()); 
            } else {
                sqlCastField = String.format("CONVERT(VARCHAR(32), %s, 120)", fieldDef.getName()); 
            }
        }        
        return sqlCastField;
    }
    
    /**
     *
     * Is secure table.
     * 
     * @param tableName table name
     * @return true if is a secure table.
     */
    public static boolean isSecureTable(final String tableName) {
        return SECURABLES.contains(tableName.toLowerCase());
    }
}
