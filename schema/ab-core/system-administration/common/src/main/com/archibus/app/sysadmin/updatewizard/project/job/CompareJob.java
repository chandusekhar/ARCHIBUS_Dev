package com.archibus.app.sysadmin.updatewizard.project.job;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.compare.*;
import com.archibus.app.sysadmin.updatewizard.project.compare.log.*;
import com.archibus.app.sysadmin.updatewizard.project.loader.*;
import com.archibus.app.sysadmin.updatewizard.project.transfer.in.TransferFileIn;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Compare tables job.
 * 
 * @author Catalin Purice
 * 
 */
public class CompareJob extends JobBase {
    
    @Override
    public void run() {
        
        // delete from table
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        
        final TransferFileIn afmTblsFileToTable = new TransferFileIn();
        // check if file exists
        afmTblsFileToTable.setTableName(ProjectUpdateWizardConstants.AFM_TBLS);
        final boolean isAfmTblsFileExists = afmTblsFileToTable.fileExists();
        final TransferFileIn afmFldsFileToTable = new TransferFileIn();
        afmFldsFileToTable.setTableName(ProjectUpdateWizardConstants.AFM_FLDS);
        final boolean isAfmFldsFileExists = afmFldsFileToTable.fileExists();
        
        if (isAfmTblsFileExists && isAfmFldsFileExists) {
            final List<LoadTableData> tablesDataFromFile = LoadTableData.getAllTablesData();
            final List<Map<String, Object>> fieldsDataFromFile =
                    LoadLangFieldData.loadAllCSVFieldsData();
            
            // use number of tables as counter.
            this.status.setTotalNumber(tablesDataFromFile.size());
            this.status.setCurrentNumber(0);
            
            final List<String> tablesToCompare =
                    ProjectUpdateWizardUtilities.getTablesNamesInPending();
            
            CompareTableProperties.checkMissingTablesForCompare(tablesDataFromFile);
            CompareTableProperties.checkMissingFieldsForCompare(fieldsDataFromFile);
            CompareTableProperties.checkCircularReferencesForTables(tablesToCompare);
            
            compareFields(tablesDataFromFile, tablesToCompare, fieldsDataFromFile);
            
        } else {
            if (!isAfmFldsFileExists) {
                throw new ExceptionBase(String.format("Cannot find afm_flds.csv: "
                        + afmFldsFileToTable.getFilePath()));
            }
            if (!isAfmTblsFileExists) {
                throw new ExceptionBase(String.format("Cannot find afm_tbls.csv: "
                        + afmTblsFileToTable.getFilePath()));
            }
        }
        
        final CompareDatabaseToArchibusSchema comparatorLog = new CompareDatabaseToArchibusSchema();
        comparatorLog.writeToLogFile();
        final CompareArchibusToStockSchema schemaDiffLog = new CompareArchibusToStockSchema();
        schemaDiffLog.writeToLogFile();
        final CompareProjectData reCountLog = new CompareProjectData();
        reCountLog.writeToLogFile();
        
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * 
     * Compares fields for selected tables.
     * 
     * @param tablesDataFromFile tables from CSV file
     * @param tablesToCompare selected tables to compare
     * @param fieldsDataFromFile fields from CSV file
     */
    private void compareFields(final List<LoadTableData> tablesDataFromFile,
            final List<String> tablesToCompare, final List<Map<String, Object>> fieldsDataFromFile) {
        for (final LoadTableData loadTable : tablesDataFromFile) {
            if (this.stopRequested) {
                this.status.setCurrentNumber(tablesDataFromFile.size());
                this.status.setCode(JobStatus.JOB_STOPPED);
                break;
            } else if (tablesToCompare.contains(loadTable.getTableName())) {
                CompareFieldUtilities.compareEachField(loadTable, fieldsDataFromFile, true);
            }
            this.status.incrementCurrentNumber();
            ProjectUpdateWizardUtilities.updateTableStatus(loadTable.getTableName(),
                ProjectUpdateWizardConstants.COMPARED);
        }
    }
}