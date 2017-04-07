package com.archibus.app.sysadmin.updatewizard.schema.output;

import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.IMergeSchema;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.datasource.*;

/**
 * 
 * Provides methods that creates the output object.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class OutputBuilder {
    /**
     * Oracle prefix commands.
     */
    private static final String ORACLE_PREFIX =
            "SET SQLBLANKLINES ON;\r\n"
                    + "SELECT ('Script executed in '|| global_name||' on '|| TO_CHAR(sysdate,'DD-MON-YYYY HH24:mi')) AS ScriptExecutedIn FROM global_name; \r\n"
                    + "WHENEVER OSERROR EXIT FAILURE ROLLBACK;\r\n"
                    + "WHENEVER SQLERROR EXIT FAILURE ROLLBACK;";
    
    /**
     * Sql Server prefix commands.
     */
    private static final String SQLSERVER_PREFIX =
            "SELECT 'Script executed in '+ db_name()+' on '+ CAST(getDate() AS VARCHAR) AS ScriptExecutedin\r\n"
                    + "SET XACT_ABORT ON";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private OutputBuilder() {
        super();
    }
    
    /**
     * Creates the output.
     * 
     * @param isExecuteCommand executes the commands
     * @param isLogDbCommand logs the commands
     * @return output object
     */
    public static SqlCommandOutput createSchemaChangeOutput(final boolean isExecuteCommand,
            final boolean isLogDbCommand) {
        
        SqlCommandOutput output = null;
        
        if (isExecuteCommand && isLogDbCommand) {
            output = new ExecuteAndLogSqlCommands(SchemaUpdateWizardConstants.SQL_FILE_NAME, false);
        } else if (isLogDbCommand) {
            output = new LogCommand(SchemaUpdateWizardConstants.SQL_FILE_NAME, false);
        } else if (isExecuteCommand) {
            output = new ExecuteCommand();
        }
        addPrefixCommand(output);
        return output;
    }
    
    /**
     * Creates the output.
     * 
     * @param isExecuteCommand executes the commands
     * @param isLogDbCommand logs the commands
     * @return output object
     */
    public static SqlCommandOutput createDataDictionaryChangesOutput(
            final boolean isExecuteCommand, final boolean isLogDbCommand) {
        
        SqlCommandOutput output = null;
        
        if (isExecuteCommand && isLogDbCommand) {
            output = new ExecuteAndLogSqlCommands(IMergeSchema.DATA_DICTIONARY_CHANGE_FILE, true);
        } else if (isLogDbCommand) {
            output = new LogCommand(IMergeSchema.DATA_DICTIONARY_CHANGE_FILE, true);
        } else if (isExecuteCommand) {
            output = new ExecuteCommand();
        }
        
        return output;
    }
    
    /**
     * Creates the output.
     * 
     * @param isExecuteCommand executes the commands
     * @param isLogDbCommand logs the commands
     * @return output object
     */
    public static SqlCommandOutput createAfmGroupsChangesOutput(final boolean isExecuteCommand,
            final boolean isLogDbCommand) {
        
        SqlCommandOutput output = null;
        
        if (isExecuteCommand && isLogDbCommand) {
            output = new ExecuteAndLogSqlCommands(IMergeSchema.AFM_GROUPS_LOG_FILE, false);
        } else if (isLogDbCommand) {
            output = new LogCommand(IMergeSchema.AFM_GROUPS_LOG_FILE, false);
        } else if (isExecuteCommand) {
            output = new ExecuteCommand();
        }
        
        return output;
    }
    
    /**
     *
     * Add prefixes to the SCW generated file.
     *
     * @param output the output
     */
    private static void addPrefixCommand(final SqlCommandOutput output) {
        if (SqlUtils.isOracle()) {
            output.runCommand(ORACLE_PREFIX, DataSource.DB_ROLE_DATA);
        } else if (SqlUtils.isSqlServer()) {
            if (output instanceof ExecuteAndLogSqlCommands) {
                ((ExecuteAndLogSqlCommands) output).logCommand(SQLSERVER_PREFIX);
            } else if (output instanceof LogCommand) {
                output.runCommand(SQLSERVER_PREFIX, DataSource.DB_ROLE_DATA);
            }
        }
    }
}
