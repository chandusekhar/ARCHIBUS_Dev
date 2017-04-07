package com.archibus.app.sysadmin.updatewizard.project.util;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.IMergeSchema;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Utility class for update data dictionary.
 * 
 * @author Catalin Purice
 * 
 */
public final class UpdateArchibusSchemaUtilities {
    
    /**
     * Constant.
     */
    private static final String AUTONUM_ID = "autonumbered_id";
    
    /**
     * private constructor.
     */
    private UpdateArchibusSchemaUtilities() {
        
    }
    
    /**
     * Sets the recommended action of ML heading as Keep Existing.
     */
    public static void keepMlHeading() {
        final DataSource tableDS =
                ProjectUpdateWizardUtilities.createDataSourceForTable(
                    ProjectUpdateWizardConstants.AFM_FLDS_TRANS).addRestriction(
                    Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, "change_type",
                        "ML_HEADING"));
        final List<DataRecord> records = tableDS.getRecords();
        if (!records.isEmpty()) {
            for (final DataRecord record : records) {
                // build the record
                record.setValue(IMergeSchema.AFM_FLDS_TRANS_REC_ACTION,
                    Actions.KEEP_EXISTING.getMessage());
                record.setValue(IMergeSchema.AFM_FLDS_TRANS_CHOSEN_ACTION,
                    Actions.KEEP_EXISTING.getMessage());
                tableDS.saveRecord(record);
            }
            SqlUtils.commit();
        }
    }
    
    /**
     * Updates the afm_flds_trans.chosen_action with the value received from the UI.
     * 
     * @param autoNumId auto numbered id from afm_flds_trans table
     * @param chosenAction action
     */
    public static void setChosenAction(final String autoNumId, final String chosenAction) {
        final DataSource getChosenActionDs =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)
                    .addField(AUTONUM_ID)
                    .addField("chosen_action")
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, AUTONUM_ID,
                            autoNumId));
        final DataRecord record = getChosenActionDs.getRecord();
        record.setValue("afm_flds_trans.chosen_action", chosenAction);
        getChosenActionDs.saveRecord(record);
    }
}
