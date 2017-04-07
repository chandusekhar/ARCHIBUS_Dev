package com.archibus.app.sysadmin.updatewizard.project.job;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.*;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.StringUtil;

/**
 *
 * Validates chosen changes user selects from "Merge Data Dictionary" tab.
 *
 * @author Catalin Purice
 *
 */
public class ValidateChosenChangesJob extends JobBase {
    
    /**
     * Constant.
     */
    private static final String CHANGE_TYPE = "change_type";
    
    /**
     * Constant.
     */
    private static final String CHOSEN_ACTION = "chosen_action";
    
    /**
     * Constant.
     */
    private static final String TABLE_NAME = "table_name";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS = "afm_tbls";
    
    /**
     * If the job detects that a validation table is missing from selection, this becomes true.
     */
    private boolean isDependencyNeeded;

    /**
     * Tables names that need to be included in the selection. This is for displaying the UI
     * message.
     */
    private final List<String> requiredTablesNames = new ArrayList<String>();
    
    /**
     *
     * Loads the APPLY CHOSEN actions.
     *
     * @return list o records from afm_flds_trans table.
     */
    private List<DataRecord> loadRefTableChanges() {
        
        final DataSource changesDataSource =
                ProjectUpdateWizardUtilities
                .createDataSourceForTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        changesDataSource.addRestriction(Restrictions.in(
            ProjectUpdateWizardConstants.AFM_FLDS_TRANS, CHANGE_TYPE, DifferenceMessage.NEW.name()
                    + "," + DifferenceMessage.REF_TABLE.name()));
        changesDataSource.addRestriction(Restrictions.eq(
            ProjectUpdateWizardConstants.AFM_FLDS_TRANS, CHOSEN_ACTION,
            Actions.APPLY_CHANGE.getMessage()));

        return changesDataSource.getRecords();
    }
    
    /**
     *
     * Checks if the required table was selected.
     *
     * @param tableName table name
     * @return true if the table was selected.
     */
    private boolean isTableNameSelected(final String tableName) {
        
        final DataSource tableDataSource = DataSourceFactory.createDataSource();
        tableDataSource.addTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        tableDataSource.addField("autonumbered_id");
        tableDataSource.addRestriction(Restrictions.in(ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
            CHANGE_TYPE, DifferenceMessage.TBL_IS_NEW.name()));
        tableDataSource.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
            CHOSEN_ACTION, Actions.APPLY_CHANGE.getMessage()));
        tableDataSource.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_TRANS,
            TABLE_NAME, tableName));

        return tableDataSource.getRecords().size() > 0;
    }
    
    /**
     *
     * Checks if the table name exists in selection and updates the requiredTablesNames and
     * isDependencyNeeded.
     *
     * @param value table name in this case
     */
    private void checkTableRecord(final String value) {
        final DataSource dsValidatation = DataSourceFactory.createDataSource();
        dsValidatation.addTable(AFM_TBLS);
        dsValidatation.addField(TABLE_NAME);
        dsValidatation.addRestriction(Restrictions.eq(AFM_TBLS, TABLE_NAME, value));
        if (dsValidatation.getRecords().isEmpty() && !isTableNameSelected(value)) {
            this.requiredTablesNames.add(value);
            this.isDependencyNeeded = true;
        }
    }
    
    @Override
    public void run() {
        
        final List<DataRecord> records = loadRefTableChanges();
        
        this.status.setTotalNumber(records.size());
        
        for (final DataRecord record : records) {
            
            final DictionaryRecord changeRecord =
                    new DictionaryRecord(record, ActionType.CHOSEN_ACTION);
            switch (changeRecord.getChangeType()) {
                case NEW:
                case REF_TABLE:
                    final String refTable =
                    changeRecord.getChangedRecord().getString("afm_flds_trans.ref_table");
                    if (StringUtil.notNullOrEmpty(refTable)) {
                        checkTableRecord(refTable);
                    }
                    break;
                default:
                    this.status.incrementCurrentNumber();
            }
        }
        
        this.status.addPartialResult(new JobResult(this.requiredTablesNames.toString()));
        this.status.setResult(this.isDependencyNeeded ? "true" : "false");
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
