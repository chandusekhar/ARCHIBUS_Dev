package com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema;

import com.archibus.jobmanager.JobStatus;

/**
 * 
 * Interface to be implemented by class MergeSchemaImpl.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public interface IMergeSchema {
    
    /**
     * Constant.
     */
    String AFM_GROUPS_LOG_FILE = "00_afm_groups.sql";
    
    /**
     * constant.
     */
    String AFM_FLDS_TRANS_REC_ACTION = "afm_flds_trans.rec_action";
    
    /**
     * constant.
     */
    String CHANGE_TYPE_FIELD = "afm_flds_trans.change_type";
    
    /**
     * constant.
     */
    String CHANGE_TYPE = "change_type";
    
    /**
     * constant.
     */
    String REF_TABLE = "ref_table";
    
    /**
     * constant.
     */
    String TRANSFER_STATUS = "afm_flds.transfer_status";
    
    /**
     * constant.
     */
    String STATUS_UPDATED = "UPDATED";
    
    /**
     * constant.
     */
    String STATUS_INSERTED = "INSERTED";
    
    /**
     * constant.
     */
    String EMPTY_STRING = "";
    
    /**
     * constant.
     */
    String EDIT_GROUP = "afm_flds.edit_group";
    
    /**
     * constant.
     */
    String REVIEW_GROUP = "afm_flds.review_group";
    
    /**
     * constant.
     */
    String AFM_GROUPS_TABLE = "afm_groups";
    
    /**
     * constant.
     */
    String GROUP_NAME_FIELD = "group_name";
    
    /**
     * constant.
     */
    String AFM_FLDS_TRANS_CHOSEN_ACTION = "afm_flds_trans.chosen_action";
    
    /**
     * constant.
     */
    String AFM_FLDS_TABLE_NAME = "afm_flds.table_name";
    
    /**
     * constant.
     */
    String AFM_FLDS_FIELD_NAME = "afm_flds.field_name";
    
    /**
     * constant.
     */
    String ENUM_LIST = "enum_list";
    
    /**
     * constant.
     */
    String ML_HEADING = "ml_heading";
    
    /**
     * Output file.
     */
    String DATA_DICTIONARY_CHANGE_FILE = "02_changes-data-dictionary.sql";
    
    /**
     * 
     * Upgrades the schema.
     * 
     * @param status JobStatus
     */
    void upgradeSchema(final JobStatus status);
}
