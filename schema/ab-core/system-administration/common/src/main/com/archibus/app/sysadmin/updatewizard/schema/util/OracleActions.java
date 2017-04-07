package com.archibus.app.sysadmin.updatewizard.schema.util;

import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardConstants;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.*;
import com.archibus.utility.*;

/**
 * Describes different methods specific to Oracle database.
 * 
 * @author Catalin Purice
 *         <p>
 *         Suppress PMD warning "AvoidUsingSql" in this class.
 *         <p>
 *         Justification: Case #6: Changes to SQL schema.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class OracleActions {
    
    /**
     * constant.
     */
    public static final String SEQ_NAME = "AFM_%s_S";
    
    /**
     * constant.
     */
    public static final String TRIGGER_NAME = "%s_T";
    
    /**
     * Constant.
     */
    private static final String AFM_GROUPS = "afm_groups";
    
    /**
     * Constant.
     */
    private static final String AFM_USERS = "afm_users";
    
    /**
     * constant.
     */
    private static final String CLOSE_BRACKET = "')";
    
    /**
     * constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql".
     * <p>
     * Justification: Case #6: Changes to SQL schema.
     */
    private static final String CREATE_SEQUENCE = "CREATE SEQUENCE %s MINVALUE %s "
            + "MAXVALUE 999999999999999999999999999 INCREMENT BY 1 "
            + "START WITH %s CACHE 20 ORDER NOCYCLE";
    
    /**
     * constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql".
     * <p>
     * Justification: Case #6: Changes to SQL schema.
     */
    private static final String CREATE_TRIGGER =
            "CREATE OR REPLACE TRIGGER %s BEFORE INSERT ON %s "
                    + "FOR EACH ROW WHEN ( NEW.%s IS NULL ) BEGIN  SELECT %s.NEXTVAL INTO :NEW.%s FROM DUAL; END;";
    
    /**
     * Constant.
     */
    private static final String DOT = ".";
    
    /**
     * constant.
     */
    private static final String DROP_SEQUENCE = "DROP SEQUENCE ";
    
    /**
     * constant.
     */
    private static final String DROP_TRIGGER = "DROP TRIGGER ";
    
    /**
     * Constant.
     */
    private static final String GRANT_REF_ON = "GRANT REFERENCES ON ";
    
    /**
     * Constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql".
     * <p>
     * Justification: Case #6: Changes to SQL schema.
     */
    private static final String GRANT_ROLES = "GRANT ALTER, SELECT, INSERT, UPDATE, DELETE  ON ";
    
    /**
     * constant.
     */
    private static final int MAX_CONSTR_NAME_LENGTH = 29;
    
    /**
     * constant.
     */
    private static final int MAX_OBJECT_NAME_LENGTH = 30;
    
    /**
     * Constant.
     */
    private static final String TO_CONST = " TO ";
    
    /**
     * constructor.
     */
    private OracleActions() {
        
    }
    
    /**
     * Returns the blob storage clause.
     * 
     * @param fieldName field name
     * @param tableSpaceName Oracle tablespace name
     * @return BLOB clause
     */
    public static String blobClauseForOracle(final String fieldName, final String tableSpaceName) {
        return " lob(" + fieldName + ") STORE AS (TABLESPACE " + tableSpaceName + ")";
    }
    
    /**
     * this method will generate create trigger and create sequence statements(Oracle only) for the
     * specified table.
     * 
     * @param tDef table name
     * @param isCreateSequence weather or not to create the sequence
     * @return statements
     */
    public static List<String> createTriggerAndSequence(final TableDef.Immutable tDef,
            final boolean isCreateSequence) {
        
        final String tableName = tDef.getName().toUpperCase();
        final PrimaryKey.Immutable pKeys = tDef.getPrimaryKey();
        final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> pkFieldsDef = pKeys.getFields();
        String sequenceName = "";
        final List<String> createStmts = new ArrayList<String>();
        for (final ArchibusFieldDefBase.Immutable pkFieldDef : pkFieldsDef) {
            if (pkFieldDef.isAutoNumber()) {
                sequenceName = getSequenceName(tableName);
                final String fieldName = pkFieldDef.getName().toUpperCase();
                try {
                    if (isCreateSequence) {
                        final long startValue =
                                getStartValue(tableName.toLowerCase(), fieldName.toLowerCase());
                        final String createSeqStmt =
                                String
                                    .format(CREATE_SEQUENCE, sequenceName, startValue, startValue);
                        createStmts.add(createSeqStmt);
                    }
                    final String triggerName = getTriggerName(tableName);
                    final String createTriggerStmt =
                            String.format(CREATE_TRIGGER, triggerName, tableName, fieldName,
                                sequenceName, fieldName);
                    createStmts.add(createTriggerStmt);
                } catch (final ExceptionBase sqlException) {
                    final String errorMessage =
                            MessageFormat.format("Schema Update Wizard - : [{0}]",
                                sqlException.toStringForLogging());
                    Logger.getLogger(Class.class).error(errorMessage);
                }
            }
        }
        return createStmts;
    }
    
    /**
     * 
     * @param tName table name
     * @return statement
     */
    public static List<String> dropTriggerAndSequence(final String tName) {
        final String tableName = tName.toUpperCase(Locale.getDefault());
        final String triggerName = String.format(TRIGGER_NAME, tableName);
        final List<String> dropStmts = new ArrayList<String>();
        if (existsTrigger(triggerName)) {
            final String dropTriggerStmt = DROP_TRIGGER + triggerName;
            dropStmts.add(dropTriggerStmt);
        }
        final String seqName = String.format(SEQ_NAME, tableName);
        if (existsSequence(seqName)) {
            final String dropSeqStmt = DROP_SEQUENCE + seqName;
            dropStmts.add(dropSeqStmt);
        }
        return dropStmts;
    }
    
    /**
     * 
     * @param sequenceName sequence name
     * @return true if the sequence exists
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #6: Changes to SQL schema.
     */
    public static boolean existsSequence(final String sequenceName) {
        final String sql =
                "SELECT COUNT(*) AS exists_seq FROM ALL_SEQUENCES WHERE UPPER(sequence_name) = UPPER('"
                        + sequenceName + CLOSE_BRACKET;
        final DataSource getSequenceDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TBLS)
                    .addQuery(sql)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "exists_seq",
                        DataSource.DATA_TYPE_TEXT);
        final DataRecord record = getSequenceDS.getRecord();
        final int result = Integer.parseInt(record.getValue("afm_tbls.exists_seq").toString());
        return result > 0 ? true : false;
    }
    
    /**
     * 
     * @param triggerName trigger name
     * @return true if the trigger exists
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #6: Changes to SQL schema.
     */
    public static boolean existsTrigger(final String triggerName) {
        final String sql =
                "SELECT COUNT(*) AS exists_trigger FROM ALL_TRIGGERS WHERE UPPER(trigger_name) = UPPER('"
                        + triggerName + CLOSE_BRACKET;
        final DataSource getTriggerDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TBLS)
                    .addQuery(sql)
                    .addVirtualField(SchemaUpdateWizardConstants.AFM_TBLS, "exists_trigger",
                        DataSource.DATA_TYPE_TEXT);
        final DataRecord record = getTriggerDS.getRecord();
        final int result = Integer.parseInt(record.getValue("afm_tbls.exists_trigger").toString());
        return result > 0 ? true : false;
    }
    
    /**
     * This method will generate create sequence statement(Oracle only) for the AFM_TEMP table. This
     * is used in a single use case.
     * 
     * @param tableName table name
     * @return CREATE SEQUENCE statement
     */
    public static String getCreateSequenceStmt(final String tableName) {
        final String sequenceName = getSequenceName(tableName);
        return String.format(CREATE_SEQUENCE, sequenceName, 1, 1);
    }
    
    /**
     * Gets max of a numeric primary key used in autonumbered tables.
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return max value
     * @throws ExceptionBase exception
     */
    public static long getStartValue(final String tableName, final String fieldName)
            throws ExceptionBase {
        long startValue = 1;
        if (DatabaseSchemaUtilities.isFieldInSql(tableName, fieldName)) {
            final String query =
                    String.format(SystemSql.MAX_AUTONUM_VALUE_ORACLE_SQL, fieldName, fieldName,
                        tableName);
            final DataSource getMaxDS = DataSourceFactory.createDataSource().setApplyVpaRestrictions(false);
            getMaxDS.addTable(tableName);
            getMaxDS.addQuery(query);
            getMaxDS.addVirtualField(tableName, fieldName, DataSource.DATA_TYPE_TEXT);
            final DataRecord record = getMaxDS.getRecords().get(0);
            startValue = Long.parseLong(record.getValue(tableName + DOT + fieldName).toString()) + 1;
        }
        return startValue;
    }
    
    /**
     * @param foreignTable foreign table
     * @param refTable referenced table
     * @param stmtArray statement Array
     * @param output Output
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #6: Changes to SQL schema.
     */
    public static void grantOracleTableRights(final String foreignTable, final String refTable,
            final List<String> stmtArray, final SqlCommandOutput output) {
        if ((AFM_USERS.equalsIgnoreCase(foreignTable) || AFM_GROUPS.equalsIgnoreCase(foreignTable))
                && AFM_USERS.equalsIgnoreCase(refTable) && AFM_GROUPS.equalsIgnoreCase(refTable)) {
            String grantStmt = "GRANT REFERENCES ON afm." + refTable + " TO afm_secure";
            output.runCommand(grantStmt, DataSource.DB_ROLE_SCHEMA);
            
            grantStmt =
                    "GRANT ALTER, SELECT, INSERT, UPDATE, DELETE ON "
                            + SchemaUpdateWizardConstants.getDataUser() + DOT + refTable + TO_CONST
                            + SchemaUpdateWizardConstants.getSecureUser();
            stmtArray.add(grantStmt);
        }
    }
    
    /**
     * @param tableName table name
     * @param output Output
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #6: Changes to SQL schema.
     */
    public static void runOracleGrants(final String tableName, final SqlCommandOutput output) {
        if ("AFM_GROUPS".equalsIgnoreCase(tableName) || AFM_USERS.equalsIgnoreCase(tableName)) {
            String oracleGrantStmt =
                    GRANT_REF_ON + SchemaUpdateWizardConstants.getSecureUser() + DOT + tableName
                            + TO_CONST + SchemaUpdateWizardConstants.getDataUser();
            output.runCommand(oracleGrantStmt, DataSource.DB_ROLE_SECURITY);
            oracleGrantStmt =
                    GRANT_ROLES + SchemaUpdateWizardConstants.getSecureUser() + DOT + tableName
                            + TO_CONST + SchemaUpdateWizardConstants.getDataUser();
            output.runCommand(oracleGrantStmt, DataSource.DB_ROLE_SECURITY);
        } else if ("afm_groupsforroles".equalsIgnoreCase(tableName)
                || "afm_roles".equalsIgnoreCase(tableName)
                || "afm_tbls".equalsIgnoreCase(tableName) || "afm_flds".equalsIgnoreCase(tableName)) {
            String oracleGrantStmt =
                    GRANT_REF_ON + SchemaUpdateWizardConstants.getDataUser() + DOT + tableName
                            + TO_CONST + SchemaUpdateWizardConstants.getSecureUser();
            output.runCommand(oracleGrantStmt, DataSource.DB_ROLE_SECURITY);
            oracleGrantStmt =
                    GRANT_ROLES + SchemaUpdateWizardConstants.getDataUser() + DOT + tableName
                            + TO_CONST + SchemaUpdateWizardConstants.getSecureUser();
            output.runCommand(oracleGrantStmt, DataSource.DB_ROLE_SECURITY);
        }
    }
    
    /**
     * Limit the constraint name length to 30 for Oracle database.
     * 
     * @param constraintName name of the constraint
     * @return truncated constraint name
     */
    public static String truncateConstraintName(final String constraintName) {
        return constraintName.substring(0, MAX_CONSTR_NAME_LENGTH);
    }
    
    /**
     * Generates the name of the sequence based on maximum supported length.
     * 
     * @param tableName table name
     * @return sequence name
     */
    private static String getSequenceName(final String tableName) {
        String sequenceName = String.format(SEQ_NAME, tableName);
        if (sequenceName.length() > MAX_OBJECT_NAME_LENGTH) {
            final int maxTableLength = MAX_OBJECT_NAME_LENGTH - SEQ_NAME.length() + 2;
            final String newTableName = tableName.substring(0, maxTableLength);
            sequenceName = String.format(SEQ_NAME, newTableName);
        }
        return sequenceName;
    }
    
    /**
     * Generates the name of the trigger based on maximum supported length.
     * 
     * @param tableName table name
     * @return trigger name
     */
    private static String getTriggerName(final String tableName) {
        String triggerName = String.format(TRIGGER_NAME, tableName);
        if (triggerName.length() > MAX_OBJECT_NAME_LENGTH) {
            final int maxTableLength = MAX_OBJECT_NAME_LENGTH - TRIGGER_NAME.length() + 2;
            final String newTableName = tableName.substring(0, maxTableLength);
            triggerName = String.format(TRIGGER_NAME, newTableName);
        }
        return triggerName;
    }
}
