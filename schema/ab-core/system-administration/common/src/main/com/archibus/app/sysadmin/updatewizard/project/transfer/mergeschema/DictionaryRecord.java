package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.data.DataRecord;

/**
 * 
 * Provides methods that handles data dictionary record.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public class DictionaryRecord {
    
    /**
     * Change type.
     */
    private DifferenceMessage changeType;
    
    /**
     * Action type.
     */
    private Actions actionType;
    
    /**
     * Table name.
     */
    private final String tableName;
    
    /**
     * Field name.
     */
    private final String fieldName;
    
    /**
     * Dictionary record.
     */
    private final DataRecord changedRecord;
    
    /**
     * Action type.
     */
    private final String propertyToUpdate;
    
    /**
     * 
     * Constructor.
     * 
     * @param dictionaryRecord dictionary record
     * @param actionType action type
     */
    public DictionaryRecord(final DataRecord dictionaryRecord, final ActionType actionType) {
        super();
        final String actionField =
                actionType == ActionType.CHOSEN_ACTION ? IMergeSchema.AFM_FLDS_TRANS_CHOSEN_ACTION
                        : IMergeSchema.AFM_FLDS_TRANS_REC_ACTION;
        this.actionType = Actions.KEEP_EXISTING;
        this.tableName = dictionaryRecord.getString(ProjectUpdateWizardUtilities.A_F_T_TABLE_NAME);
        this.fieldName = dictionaryRecord.getString(ProjectUpdateWizardUtilities.A_F_T_FIELD_NAME);
        
        if (Actions.APPLY_CHANGE.getMessage().equals(dictionaryRecord.getString(actionField))) {
            this.actionType = Actions.APPLY_CHANGE;
        } else if (Actions.DELETE_FIELD.getMessage()
            .equals(dictionaryRecord.getString(actionField))) {
            this.actionType = Actions.DELETE_FIELD;
        }
        
        String chgType = dictionaryRecord.getString(IMergeSchema.CHANGE_TYPE_FIELD);
        
        if (DifferenceMessage.AFM_SIZE.getMessage().equalsIgnoreCase(chgType)) {
            chgType = DifferenceMessage.AFM_SIZE.name();
        } else if (DifferenceMessage.VALIDATE_DATA.getMessage().equalsIgnoreCase(chgType)) {
            chgType = DifferenceMessage.VALIDATE_DATA.name();
        }
        
        for (final DifferenceMessage diff : DifferenceMessage.values()) {
            if (diff.name().equalsIgnoreCase(chgType)) {
                this.changeType = diff;
                break;
            }
        }
        
        this.changedRecord = dictionaryRecord;
        this.propertyToUpdate = chgType.toLowerCase();
        
    }
    
    /**
     * Getter for the changeType property.
     * 
     * @see changeType
     * @return the changeType property.
     */
    public DifferenceMessage getChangeType() {
        return this.changeType;
    }
    
    /**
     * Getter for the actionType property.
     * 
     * @see actionType
     * @return the actionType property.
     */
    public Actions getActionType() {
        return this.actionType;
    }
    
    /**
     * Getter for the tableName property.
     * 
     * @see tableName
     * @return the tableName property.
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * Getter for the fieldName property.
     * 
     * @see fieldName
     * @return the fieldName property.
     */
    public String getFieldName() {
        return this.fieldName;
    }
    
    /**
     * Getter for the dictionaryRecord property.
     * 
     * @see dictionaryRecord
     * @return the dictionaryRecord property.
     */
    public DataRecord getChangedRecord() {
        return this.changedRecord;
    }
    
    /**
     * Getter for the propertyToUpdate property.
     * 
     * @see propertyToUpdate
     * @return the propertyToUpdate property.
     */
    public String getPropertyToUpdate() {
        return this.propertyToUpdate.toLowerCase();
    }
    
}
