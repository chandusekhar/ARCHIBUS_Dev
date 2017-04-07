package com.archibus.app.sysadmin.updatewizard.project;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.*;
import com.archibus.app.sysadmin.updatewizard.project.job.TransferOutJob;
import com.archibus.datasource.DataSourceTestBase;

/**
 * 
 * @author Catalin Purice
 * 
 */
public class TestProjUpWizTransferOut extends DataSourceTestBase {
    
    /**
     * Constant.
     */
    private static final String ALL_TABLES = "%";
    
    /**
     * transfer out one table.
     */
    public void testTransferOutOneTable() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, "activity_log", false);
        final TransferOutJob outJob = new TransferOutJob(true);
        outJob.run();
    }
    
    /**
     * transfer out many tables specified by like wild-card.
     */
    public void testTransferOutNamedTables() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, "bl%;rm;%ac", false);
        final TransferOutJob outJob = new TransferOutJob(true);
        outJob.run();
    }
    
    /**
     * transfer out many tables specified by table_type.
     */
    public void testTransferOutByGroupType() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        final List<String> tableTypes = new ArrayList<String>();
        tableTypes.add("PROJECT SECURITY");
        puw.addTableNamesToTransferSet(tableTypes, false, "", false);
        final TransferOutJob outJob = new TransferOutJob(true);
        outJob.run();
    }
    
    /**
     * transfer out all tables.
     */
    public void testTransferOutAllTables() {
        final ProjectUpdateWizardService puw = new ProjectUpdateWizardServiceImpl();
        puw.addTableNamesToTransferSet(new ArrayList<String>(), false, ALL_TABLES, false);
        final TransferOutJob outJob = new TransferOutJob(true);
        outJob.run();
    }
}
