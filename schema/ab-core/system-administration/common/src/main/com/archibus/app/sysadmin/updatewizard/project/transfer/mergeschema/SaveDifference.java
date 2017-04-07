package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.in.TransferFileIn;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.context.ContextStore;

/**
 * Creates the map and save it into afm_flds_trans table.
 * 
 * @author Catalin Purice
 * 
 */
public class SaveDifference {
    
    /**
     * constant.
     */
    private static final String REC_ACTION = "rec_action";
    
    /**
     * Max data afm_flds_trans.data_dict_diff size.
     */
    private final int maxDataDictSize = ContextStore.get().getProject()
        .loadTableDef(ProjectUpdateWizardConstants.AFM_FLDS_TRANS)
        .getFieldDef(ProjectUpdateWizardConstants.DATA_DICT_DIFFS).getSize();
    
    /**
     * map to be saved.
     */
    private transient Map<String, Object> mapToSave;
    
    /**
     * Constructor.
     */
    public SaveDifference() {
        this.mapToSave = new HashMap<String, Object>();
    }
    
    /**
     * Builds the map for field.
     * 
     * @param fieldMap field map
     * @param diffType difference type
     * @param dataDictDiff message for data dictionary difference
     * @param sqlDiff message for sql difference
     * @param recommAction recommended action
     */
    public void buildMapForField(final Map<String, Object> fieldMap,
            final DifferenceMessage diffType, final String dataDictDiff, final String sqlDiff,
            final Actions recommAction) {
        final Map<String, Object> fieldToSave = new HashMap<String, Object>(fieldMap);
        if (diffType.equals(DifferenceMessage.AFM_SIZE)
                || diffType.equals(DifferenceMessage.VALIDATE_DATA)) {
            fieldToSave.put(ProjectUpdateWizardConstants.CHANGE_TYPE, diffType.getMessage());
        } else {
            fieldToSave.put(ProjectUpdateWizardConstants.CHANGE_TYPE, diffType.toString());
        }
        
        boolean hasDataDictDiffs = false;
        if (dataDictDiff.length() > 0) {
            String trucatedMessage = dataDictDiff;
            if (this.maxDataDictSize < dataDictDiff.length()) {
                trucatedMessage = dataDictDiff.substring(0, this.maxDataDictSize);
            }
            fieldToSave.put(ProjectUpdateWizardConstants.DATA_DICT_DIFFS, trucatedMessage);
            hasDataDictDiffs = true;
        }
        boolean hasSqlDiffs = false;
        if (sqlDiff.length() > 0) {
            fieldToSave.put(ProjectUpdateWizardConstants.SQL_TABLE_DIFFS, sqlDiff);
            hasSqlDiffs = true;
        }
        if (hasSqlDiffs && !hasDataDictDiffs
                && !DifferenceMessage.NO_DEFAULT.name().equals(diffType.name())) {
            fieldToSave.put(REC_ACTION, Actions.NO_ACTION.getMessage());
        } else {
            fieldToSave.put(REC_ACTION, recommAction.getMessage());
        }
        this.mapToSave = fieldToSave;
    }
    
    /**
     * Build the map for a table.
     * 
     * @param tableName table name
     * @param fieldName field name
     * @param recAction recommended action
     * @param changeType change type
     * @param ddDiffs message for data dictionary difference
     * @param sqlDiffs message for sql difference
     */
    public void buildMapForTable(final String tableName, final String fieldName,
            final String recAction, final String changeType, final String ddDiffs,
            final String sqlDiffs) {
        this.mapToSave.put("table_name", tableName);
        this.mapToSave.put("field_name", fieldName);
        this.mapToSave.put(REC_ACTION, recAction);
        this.mapToSave.put(ProjectUpdateWizardConstants.CHANGE_TYPE, changeType);
        this.mapToSave.put(ProjectUpdateWizardConstants.DATA_DICT_DIFFS, ddDiffs);
        this.mapToSave.put(ProjectUpdateWizardConstants.SQL_TABLE_DIFFS, sqlDiffs);
    }
    
    /**
     * save the record.
     */
    public void save() {
        TransferFileIn.transferIn(ProjectUpdateWizardConstants.AFM_FLDS_TRANS, this.mapToSave);
    }
}
