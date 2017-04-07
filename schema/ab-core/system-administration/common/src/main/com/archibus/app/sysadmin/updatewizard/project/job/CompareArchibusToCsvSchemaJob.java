package com.archibus.app.sysadmin.updatewizard.project.job;

import static com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardConstants.*;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.compare.*;
import com.archibus.app.sysadmin.updatewizard.project.loader.*;
import com.archibus.app.sysadmin.updatewizard.project.transfer.in.TransferFileIn;
import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardUtilities;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.StringUtil;

/**
 * Compares ARCHIBUS schema to afm_tbls.csv/afm_flds.csv files.
 * 
 * @author Catalin Purice
 */
public class CompareArchibusToCsvSchemaJob extends JobBase {
    @Override
    public void run() {
        
        // delete from table
        ProjectUpdateWizardUtilities.deleteFromTable(AFM_FLDS_TRANS);
        
        deleteAfmFldsLangTable();
        
        final TransferFileIn fileToTable = new TransferFileIn();
        // check if file exists
        fileToTable.setTableName(AFM_TBLS);
        final boolean isAfmTblsFileExists = fileToTable.fileExists();
        fileToTable.setTableName(AFM_FLDS);
        final boolean isAfmFldsFileExists = fileToTable.fileExists();
        
        if (isAfmTblsFileExists && isAfmFldsFileExists) {
            final List<LoadTableData> tablesDataFromFile = LoadTableData.getAllTablesData();
            final List<Map<String, Object>> fieldsDataFromFile =
                    LoadLangFieldData.loadAllCSVFieldsData();
            // use number of tables as counter.
            this.status.setTotalNumber(tablesDataFromFile.size());
            int currentTableNo = 0;
            ProjectUpdateWizardUtilities.updateTableStatus(AFM_TBLS, IN_PROGRESS);
            ProjectUpdateWizardUtilities.updateTableStatus(AFM_FLDS, IN_PROGRESS);
            
            this.status.setResult(new JobResult("Seeking for missing tables..."));
            CompareTableProperties.checkMissingTables(tablesDataFromFile);
            this.status.setResult(new JobResult("Seeking for missing fields..."));
            CompareTableProperties.checkMissingFieldsFromCsv(fieldsDataFromFile);
            this.status.setResult(new JobResult("Seeking for circular foreign keys..."));
            // CompareTableProperties.checkCircularReferencesForTables(ProjectUpdateWizardUtilities
            // .getProjectTableNames());

            for (final LoadTableData loadTable : tablesDataFromFile) {
                if (this.stopRequested) {
                    this.status.setCode(JobStatus.JOB_STOPPED);
                } else {
                    this.status.setResult(new JobResult(String.format(
                        "Compared tables out of total: %d/%d", currentTableNo,
                        tablesDataFromFile.size())));
                    CompareFieldUtilities.compareEachField(loadTable, fieldsDataFromFile, false);
                    this.status.setCurrentNumber(currentTableNo++);
                }
            }
        } else {
            if (!isAfmFldsFileExists) {
                ProjectUpdateWizardUtilities.updateTableStatus(AFM_FLDS, NO_EXTRACT_FILE);
            }
            if (!isAfmTblsFileExists) {
                ProjectUpdateWizardUtilities.updateTableStatus(AFM_TBLS, NO_EXTRACT_FILE);
            }
        }
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Delete afm_flds_lang when doing compare.
     */
    private void deleteAfmFldsLangTable() {
        final DataSource dsDelete = DataSourceFactory.createDataSource();
        dsDelete.addTable(AFM_TRANSFER_SET);
        dsDelete.addField("autonumbered_id");
        dsDelete.addField(TABLE_NAME);
        dsDelete.addRestriction(Restrictions.eq(AFM_TRANSFER_SET, TABLE_NAME, AFM_FLDS_LANG));
        final DataRecord record = dsDelete.getRecord();
        if (StringUtil.notNullOrEmpty(record)) {
            dsDelete.deleteRecord(record);
        }
    }
    
}
