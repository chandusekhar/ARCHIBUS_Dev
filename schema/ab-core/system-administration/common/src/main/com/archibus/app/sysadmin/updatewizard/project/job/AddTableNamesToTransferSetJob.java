package com.archibus.app.sysadmin.updatewizard.project.job;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.loader.*;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.jobmanager.*;

/**
 * Adds tables to afm_transfer_set table in order to process them.
 * 
 * @author Catalin Purice
 * 
 */
public class AddTableNamesToTransferSetJob extends JobBase {
    
    /**
     * Table type group list.
     */
    private final List<String> tableTypesList;
    
    /**
     * Includes validating tables.
     */
    private final boolean includeValidatedTables;
    
    /**
     * Table names like wild card.
     */
    private final String likeWildcard;
    
    /**
     * Is transfer in?.
     */
    private final boolean isTransferIn;
    
    /**
     * Constructor.
     * 
     * @param tableTypesList @see {@link AddTableNamesToTransferSetJob#tableTypesList}
     * @param includeValidatedTables @see
     *            {@link AddTableNamesToTransferSetJob#includeValidatedTables}
     * @param likeWildcard @see {@link AddTableNamesToTransferSetJob#likeWildcard}
     * @param isTransferIn @see {@link AddTableNamesToTransferSetJob#isTransferIn}
     */
    public AddTableNamesToTransferSetJob(final List<String> tableTypesList,
            final boolean includeValidatedTables, final String likeWildcard,
            final boolean isTransferIn) {
        super();
        this.tableTypesList = tableTypesList;
        this.includeValidatedTables = includeValidatedTables;
        this.likeWildcard = likeWildcard;
        this.isTransferIn = isTransferIn;
    }
    
    @Override
    public void run() {
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        
        final TablesLoader loadTables =
                new TablesLoader(this.tableTypesList, this.likeWildcard,
                    this.includeValidatedTables, this.isTransferIn);
        
        final boolean isGroupSelected = this.tableTypesList.isEmpty() ? false : true;
        if (isGroupSelected) {
            loadTables.getTableNamesByType();
        } else {
            loadTables.getNamedTables(true);
        }
        final List<TableProperties> tables = loadTables.getTablesProp();
        this.status.setTotalNumber(tables.size());
        for (final TableProperties table : tables) {
            ProjectUpdateWizardUtilities.insertIntoAfmTransferSet(table, loadTables.isTransferIn());
            this.status.incrementCurrentNumber();
        }
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}