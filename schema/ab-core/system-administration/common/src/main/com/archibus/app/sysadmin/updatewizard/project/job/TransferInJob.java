package com.archibus.app.sysadmin.updatewizard.project.job;

import java.io.*;
import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.app.sysadmin.updatewizard.project.transfer.in.TransferFileIn;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.*;

/**
 * Project update wizard transfer in job.
 * 
 * @author Catalin Purice
 * 
 */
public class TransferInJob extends JobBase {
    
    /**
     * Specifies if the file will be deleted after a successfully import.
     */
    private final transient boolean isDeleteFile;
    
    /**
     * Specifies if the SQL log file will be generated.
     */
    private final transient boolean isGenerateSqlLog;
    
    /**
     * Specifies if SQL commands will be executed on DB.
     */
    private final transient boolean isExecuteSql;
    
    /**
     * Constructor.
     * 
     * @param isDeleteEachFile @see {@link TransferInJob#isDeleteFile}
     * @param isLogSqlCommands @see {@link TransferInJob#isLogSqlCommands}
     * @param isExecuteSql @see {@link TransferInJob#isExecuteSql}
     */
    public TransferInJob(final boolean isDeleteEachFile, final boolean isLogSqlCommands,
            final boolean isExecuteSql) {
        super();
        this.isDeleteFile = isDeleteEachFile;
        this.isGenerateSqlLog = isLogSqlCommands;
        this.isExecuteSql = isExecuteSql;
    }
    
    /**
     * @return the isDeleteEachFile
     */
    public boolean isDeleteEachFile() {
        return this.isDeleteFile;
    }
    
    @Override
    public void run() {
        
        List<String> tablesToTransfer = ProjectUpdateWizardUtilities.getTablesNamesInPending();
        
        this.status.setResult(new JobResult("Calculate processing order..."));
        
        TransferFileIn.orderTables(tablesToTransfer);
        
        this.status.setResult(new JobResult(""));
        
        tablesToTransfer = ProjectUpdateWizardUtilities.getTablesNamesInPending();
        
        final TransferFileIn fileToTable = new TransferFileIn();
        
        fileToTable.getDtInManager().setResetTotalNumberForEachTable(false);
        
        this.status.setTotalNumber(TransferFile.getTotalNoOfRecordsToTransfer());
        
        fileToTable.getDtInManager().setJobStatus(this.status);
        
        for (final String tableName : tablesToTransfer) {
            
            if (this.stopRequested) {
                break;
            } else {
                // import the table
                fileToTable.setTableName(tableName);
                final boolean existsTable = fileToTable.tableExists();
                final boolean existsFile = fileToTable.fileExists();
                if (checkExistance(existsTable, existsFile, tableName)) {
                    continue;
                }
                
                ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                    ProjectUpdateWizardConstants.IN_PROGRESS);
                
                if (importFile(fileToTable)) {
                    ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                        ProjectUpdateWizardConstants.IMPORTED);
                } else {
                    ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                        ProjectUpdateWizardConstants.NOT_PROCESSED);
                    
                    // don't delete the file in this case
                    continue;
                }
                
                // delete each file
                if (this.isDeleteFile && existsFile) {
                    FileUtil.deleteFile(fileToTable.getFile().getAbsolutePath());
                }
            }
        }
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * 
     * @param fileToTable @see {@link TransferFileIn}
     * @return true if the file was imported successfully or false otherwise
     */
    
    private boolean importFile(final TransferFileIn fileToTable) {
        
        boolean importSuccess = true;
        
        InputStream inputStream = null;
        
        try {
            inputStream = new FileInputStream(fileToTable.getFile());
            fileToTable.transferIn(inputStream, this.isGenerateSqlLog, this.isExecuteSql);
        } catch (final ExceptionBase e) {
            ProjectUpdateWizardLogger.logException(e.toStringForLogging());
            ProjectUpdateWizardUtilities.updateTableStatus(fileToTable.getTableName(),
                ProjectUpdateWizardConstants.NOT_PROCESSED);
            importSuccess = false;
        } catch (final FileNotFoundException e) {
            ProjectUpdateWizardLogger.logException("Unable to find file :"
                    + fileToTable.getFile().getAbsolutePath());
            ProjectUpdateWizardUtilities.updateTableStatus(fileToTable.getTableName(),
                ProjectUpdateWizardConstants.NO_EXTRACT_FILE);
            importSuccess = false;
        } finally {
            try {
                if (inputStream != null) {
                    inputStream.close();
                }
            } catch (final IOException e) {
                ProjectUpdateWizardLogger.logException("Unable to close file :"
                        + fileToTable.getFile().getAbsolutePath());
                importSuccess = false;
            }
        }
        return importSuccess;
    }
    
    /**
     * 
     * @param tableName name of the table
     * @param existFile true if the file exist and false otherwise
     * @param existTable true if the table exist and false otherwise
     * @return true if the table/file does not exist
     */
    private boolean checkExistance(final boolean existTable, final boolean existFile,
            final String tableName) {
        boolean tableWasUpdated = false;
        if (!existTable || !existFile) {
            if (existFile) {
                ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                    ProjectUpdateWizardConstants.NO_PROJECT_TABLE);
            } else {
                ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                    ProjectUpdateWizardConstants.NO_EXTRACT_FILE);
            }
            tableWasUpdated = true;
        }
        return tableWasUpdated;
    }
}
