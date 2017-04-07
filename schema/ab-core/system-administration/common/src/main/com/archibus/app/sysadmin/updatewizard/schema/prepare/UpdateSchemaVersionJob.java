package com.archibus.app.sysadmin.updatewizard.schema.prepare;

import java.io.File;
import java.util.Set;

import org.apache.log4j.Category;

import com.archibus.app.sysadmin.updatewizard.project.transfer.in.*;
import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardConstants;
import com.archibus.app.sysadmin.updatewizard.schema.output.*;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardUtilities;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.*;

/**
 * Update ARCHIBUS schema version with the tables/fields/records required by DUW.
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class UpdateSchemaVersionJob extends JobBase {
    
    /**
     * Minimal DB version number supported by the schema update wizard.
     */
    private static final int MIN_DB_VER_NUM = 121;
    
    /**
     * Constant.
     */
    private static final String SCHEMA = "schema";
    
    /**
     * Total number for the job.
     */
    private static final int TOTAL_NO = 5;
    
    /**
     * Path.
     */
    private static final String PATH = ContextStore.get().getWebAppPath() + File.separator + SCHEMA
            + File.separator + "ab-core" + File.separator + "system-administration"
            + File.separator + "dbwiz";
    
    @Override
    public void run() {
        
        SchemaUpdateWizardUtilities.adjustTooBigFieldsSizes();
        
        this.getStatus().setTotalNumber(TOTAL_NO);
        
        final SqlCommandOutput output =
                new ExecuteAndLogSqlCommands(ProjectUpdateWizardConstants.BOOTSTRAP_FILE_DUW, true);
        // do not continue if any SQL command fails at this stage.
        output.setThrowException(true);
        final int dbVerNumber = UpdateSchemaVersion.getCurrentDbVersionNumber();
        final UpdateSchemaVersion dbVerUpdate = new UpdateSchemaVersion(output);
        
        if (dbVerNumber < MIN_DB_VER_NUM) {
            dbVerUpdate.updateDbVersion120to121();
        }
        
        Category sqlFileLogger = SqlFileLoggerBuilder.buildSqlFileLogger(output, false);
        /**
         * Import mandatory changes.
         */
        String fullFilePath =
                PATH + File.separator + SCHEMA + File.separator
                        + "dictionary-changes-database-update-wizard.csv";
        TransferFileIn.transferIn(fullFilePath, new File(fullFilePath).getParent(), sqlFileLogger);
        
        this.getStatus().incrementCurrentNumber();
        
        if (dbVerUpdate.isTableChanged(ProjectUpdateWizardConstants.AFM_FLDS)) {
            ContextStore.get().getProject().clearCachedTableDefs();
            dbVerUpdate.createOrAlterTable(ProjectUpdateWizardConstants.AFM_TBLS);
            dbVerUpdate.createOrAlterTable(ProjectUpdateWizardConstants.AFM_FLDS);
        }
        this.getStatus().incrementCurrentNumber();
        
        /**
         * Import mandatory tables.
         */
        fullFilePath =
                PATH + File.separator + SCHEMA + File.separator
                        + "new-tables-database-update-wizard.csv";
        sqlFileLogger.getAppender(SqlFileLoggerBuilder.LOGGER_NAME).close();
        sqlFileLogger = SqlFileLoggerBuilder.buildSqlFileLogger(output, true);
        TransferFileIn.transferIn(fullFilePath, new File(fullFilePath).getParent(), sqlFileLogger);
        
        this.getStatus().incrementCurrentNumber();
        
        /**
         * Import mandatory fields.
         */
        fullFilePath =
                PATH + File.separator + SCHEMA + File.separator
                        + "new-fields-database-update-wizard.csv";
        sqlFileLogger.getAppender(SqlFileLoggerBuilder.LOGGER_NAME).close();
        sqlFileLogger = SqlFileLoggerBuilder.buildSqlFileLogger(output, true);
        TransferFileIn.transferIn(fullFilePath, new File(fullFilePath).getParent(), sqlFileLogger);
        
        final Set<String> changedTables = dbVerUpdate.loadUpdatedTables();
        
        if (!changedTables.isEmpty()) {
            ContextStore.get().getProject().clearCachedTableDefs();
            for (final String tableName : changedTables) {
                dbVerUpdate.createOrAlterTable(tableName);
            }
        }
        this.getStatus().incrementCurrentNumber();
        
        /**
         * Import WFR.
         */
        fullFilePath =
                PATH + File.separator + "data" + File.separator
                        + "afm_wf_rules-database-update-wizard.csv";
        sqlFileLogger.getAppender(SqlFileLoggerBuilder.LOGGER_NAME).close();
        sqlFileLogger = SqlFileLoggerBuilder.buildSqlFileLogger(output, true);
        TransferFileIn.transferIn(fullFilePath, new File(fullFilePath).getParent(), sqlFileLogger);
        
        sqlFileLogger.getAppender(SqlFileLoggerBuilder.LOGGER_NAME).close();
        output.close();
        
        if (dbVerUpdate.isWfrChanged()) {
            ContextStore.get().getProject().reloadWorkflowRules();
        }
        
        this.getStatus().setCurrentNumber(TOTAL_NO);
        this.getStatus().setCode(JobStatus.JOB_COMPLETE);
    }
    
}
