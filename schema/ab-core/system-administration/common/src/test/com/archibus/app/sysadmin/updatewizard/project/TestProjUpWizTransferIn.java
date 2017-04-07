package com.archibus.app.sysadmin.updatewizard.project;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.job.*;
import com.archibus.app.sysadmin.updatewizard.project.transfer.in.*;
import com.archibus.datasource.DataSourceTestBase;

/**
 * 
 * @author Catalin Purice
 * 
 */
public class TestProjUpWizTransferIn extends DataSourceTestBase {
    
    /**
     * transfer in one table.
     */
    
    public void testTransferInOneTable() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, "rm", true);
        final TransferInJob inJob = new TransferInJob(true, false, true);
        inJob.run();
    }
    
    /**
     * transfer in many tables specified by like wild-card.
     */
    public void testTransferInNamedTables() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, "rm;bl;bl%", true);
        final TransferInJob inJob = new TransferInJob(true, false, true);
        inJob.run();
    }
    
    /**
     * transfer in many tables specified by table type.
     */
    public void testTransferInByGroupType() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        final List<String> tableTypes = new ArrayList<String>();
        tableTypes.add("PROJECT SECURITY");
        puw.addTableNamesToTransferSet(tableTypes, false, "", true);
        final TransferInJob inJob = new TransferInJob(true, false, true);
        inJob.run();
    }
    
    /**
     * Runs comparison between ARCHIBUS data dictionary and csv data dictionary files.
     */
    public void testMergeDataDictionary() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        final List<String> tableTypes = new ArrayList<String>();
        tableTypes.add("DATA DICTIONARY");
        puw.addTableNamesToTransferSet(tableTypes, false, "", false);
        final TransferOutJob outJob = new TransferOutJob(true);
        outJob.run();
        
        puw.addTableNamesToTransferSet(tableTypes, false, "", true);
        final CompareArchibusToCsvSchemaJob compDDJob = new CompareArchibusToCsvSchemaJob();
        compDDJob.run();
    }
    
    /**
     * Prioritize tables.
     * 
     * testTablesPriority.
     */
    public void testTablesPriority() {
        final List<String> tables =
                Arrays.asList("rm", "bl", "fl", "activity_log", "rmcat", "afm_groups", "afm_roles",
                    "afm_users");
        final ITablesImportPriority priority = new TablesImportPriority(tables, true);
        priority.calculatePriority();
        
        System.out.print(priority.getTablesByImportOrder());
        
    }
}
