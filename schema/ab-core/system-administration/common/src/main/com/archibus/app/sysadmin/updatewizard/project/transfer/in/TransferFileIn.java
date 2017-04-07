package com.archibus.app.sysadmin.updatewizard.project.transfer.in;

import java.io.*;
import java.util.*;

import org.apache.log4j.Category;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaTableDef;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.db.SqlLoggerWithOptions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.importexport.importer.*;
import com.archibus.ext.report.xls.XlsBuilder;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Transfer file in properties.
 * 
 * @author Catalin Purice
 * 
 */
public class TransferFileIn extends TransferFile {
    
    /**
     * Minimum file priority for project data tables.
     */
    private static final int MIN_TABLES_TO_FILE_PRIORITY = 4;
    
    /**
     * data transfer in manager.
     */
    private final transient DatabaseImporter dtInManager;
    
    /**
     * Constructor.
     * 
     */
    public TransferFileIn() {
        super();
        this.dtInManager =
                (DatabaseImporter) ContextStore.get().getBean(
                    DatabaseImporterImpl.DATABASEIMPORTOR_BEAN);
        this.dtInManager.setCheckKeysAndEnum(false);
    }
    
    /**
     * Order the table names in the list according to dependencies.
     * 
     * @param tablesToTransfer tables to transfer
     */
    public static void orderTables(final List<String> tablesToTransfer) {
        final ITablesImportPriority procOrder = new TablesImportPriority(tablesToTransfer, true);
        procOrder.calculatePriority();
        updateTablePosition(procOrder.getTablesByImportOrder());
    }
    
    /**
     * transfer into tableName the Map object.
     * 
     * @param tableName table name
     * @param fieldMap field map
     */
    public static void transferIn(final String tableName, final Map<String, Object> fieldMap) {
        final String sql = buildQuery(tableName, fieldMap);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        EventHandlerBase.executeDbSql(context, sql, false);
        EventHandlerBase.executeDbCommit(context);
    }
    
    /**
     * Builds sql query.
     * 
     * @param tableName table name
     * @param map map
     * @return query
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #2: Statements with INSERT ... SELECT pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static String buildQuery(final String tableName, final Map<String, Object> map) {
        final StringBuffer fieldsNames = new StringBuffer("");
        final StringBuffer fieldsValues = new StringBuffer("");
        for (final Iterator<String> it = map.keySet().iterator(); it.hasNext();) {
            final String key = String.valueOf(it.next());
            fieldsNames.append(key);
            String value = String.valueOf(map.get(key));
            if (value.length() == 0) {
                fieldsValues.append("NULL");
            } else {
                if (value.contains(SchemaUpdateWizardUtilities.APOS)) {
                    value = value.replace(SchemaUpdateWizardUtilities.APOS, "''");
                }
                fieldsValues.append('\'').append(value).append('\'');
            }
            if (it.hasNext()) {
                fieldsNames.append(',');
                fieldsValues.append(',');
            }
            
        }
        final String sql = "INSERT INTO " + tableName + "(%s) VALUES (%s)";
        return String.format(sql, fieldsNames, fieldsValues);
    }
    
    /**
     * @return the dtManager
     */
    public DatabaseImporter getDtInManager() {
        return this.dtInManager;
    }
    
    /**
     * Checks if the file to be transfered in exists.
     * 
     * @return true/false
     */
    public boolean fileExists() {
        boolean fileExists = false;
        final File file = getFile();
        if (file.exists()) {
            fileExists = true;
        }
        return fileExists;
    }
    
    /**
     * 
     * @return file path
     */
    public String getFilePath() {
        return this.getFile().getAbsolutePath();
    }
    
    /**
     * sets the table name.
     * 
     * @param fileName name of the file
     */
    public void setTableName(final String fileName) {
        loadTableParam(fileName);
    }
    
    /**
     * Checks if the table exists.
     * 
     * @return true/false
     */
    public boolean tableExists() {
        boolean tableExists = false;
        final String tableName = getTableName();
        final DatabaseSchemaTableDef sqlTableDef =
                new DatabaseSchemaTableDef(tableName).loadTableFieldsDefn();
        if (sqlTableDef.exists()) {
            tableExists = true;
        }
        return tableExists;
    }
    
    /**
     * Transfer the file in.
     * 
     * @param inputStream file
     * @param generateSqlLog if true then the output is a SQL log file
     * @param executeSql if true then execute SQL commands on DB
     * @throws ExceptionBase exception
     */
    public void transferIn(final InputStream inputStream, final boolean generateSqlLog,
            final boolean executeSql) throws ExceptionBase {
        
        Category sqlFileLogger = null;
        
        if (generateSqlLog) {
            sqlFileLogger = SqlFileLoggerBuilder.buildSqlFileLogger(this.getTableName());
        }
        
        final SqlLoggerWithOptions sqlLoggerWithOptions =
                new SqlLoggerWithOptions(sqlFileLogger, executeSql);
        
        this.dtInManager.importData(inputStream, XlsBuilder.FileFormatType.CSV, executeSql
                && isDocTable(), getTransferFolderIn(), true, getTransferFolderIn(), true,
            sqlLoggerWithOptions);
        
        if (generateSqlLog) {
            sqlFileLogger.getAppender(SqlFileLoggerBuilder.LOGGER_NAME).close();
        }
        
        updateRecordsNo();
        
    }
    
    /**
     * Update transfered records in afm_transfer_set table.
     */
    private void updateRecordsNo() {
        final String[] fields =
                { "autonumbered_id", "nrecords_inserted", "nrecords_updated", "nrecords_missing" };
        final DataSource afmTransferSetUpdateDs =
                DataSourceFactory.createDataSourceForFields(
                    ProjectUpdateWizardConstants.AFM_TRANSFER_SET, fields).addRestriction(
                    Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
                        ProjectUpdateWizardUtilities.TABLE_NAME, getTableName().toLowerCase()));
        final DataRecord record = afmTransferSetUpdateDs.getRecord();
        if (StringUtil.notNullOrEmpty(record)) {
            record.setValue("afm_transfer_set.nrecords_inserted",
                (int) this.dtInManager.nRecordsInserted());
            record.setValue("afm_transfer_set.nrecords_updated",
                (int) this.dtInManager.nRecordsUpdated());
            record.setValue("afm_transfer_set.nrecords_missing",
                (int) this.dtInManager.nRecordsWithErrors());
            afmTransferSetUpdateDs.saveRecord(record);
        }
        this.dtInManager.resetCounters();
    }
    
    /**
     * Updates the processing order field in afm_transfer_set.
     *
     * @param orderedTableNames table names ordered
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static void updateTablePosition(final List<String> orderedTableNames) {
        int index = MIN_TABLES_TO_FILE_PRIORITY;
        for (final String tableName : orderedTableNames) {
            SqlUtils.executeUpdate(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, String.format(
                "UPDATE afm_transfer_set SET processing_order=%d WHERE table_name = '%s'", index++,
                tableName));
        }
        SqlUtils.commit();
    }
    
    /**
     * 
     * Transfer In the file(generate log and execute sql).
     * 
     * @param fullFileName full path
     * @param transferInFolder transfer in folder
     * @param sqlFileLogger SQL file logger
     */
    public static void transferIn(final String fullFileName, final String transferInFolder,
            final Category sqlFileLogger) {
        
        final DatabaseImporter dtImporter =
                (DatabaseImporter) ContextStore.get().getBean(
                    DatabaseImporterImpl.DATABASEIMPORTOR_BEAN);
        
        final SqlLoggerWithOptions sqlLoggerWithOptions =
                new SqlLoggerWithOptions(sqlFileLogger, true);
        
        InputStream inputStream = null;
        
        try {
            inputStream = new FileInputStream(fullFileName);
            
            dtImporter.importData(inputStream, XlsBuilder.FileFormatType.CSV, false,
                transferInFolder, true, transferInFolder, true, sqlLoggerWithOptions);
            
            sqlFileLogger.getAppender(SqlFileLoggerBuilder.LOGGER_NAME).close();
            
            SqlUtils.commit();
            
        } catch (final FileNotFoundException e) {
            ProjectUpdateWizardLogger
                .logWarning("File not found: " + fullFileName + e.getMessage());
        } catch (final ExceptionBase e) {
            ProjectUpdateWizardLogger.logException("Error while importing file " + fullFileName
                    + e.getMessage());
        } finally {
            try {
                if (inputStream != null) {
                    inputStream.close();
                }
            } catch (final IOException e) {
                ProjectUpdateWizardLogger.logException("Error closing stream.  " + e.getMessage());
            }
        }
    }
    
}
