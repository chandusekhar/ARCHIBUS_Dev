package com.archibus.app.sysadmin.updatewizard.project.util;

/**
 * Constant class for Project Update Wizard.
 * 
 * @author Catalin
 * 
 */
public final class ProjectUpdateWizardConstants {
    
    /**
     * Constant.
     */
    public static final String TABLE_NAME = "table_name";
    
    /**
     * Constant.
     */
    public static final String FIELD_NAME = "field_name";
    
    /**
     * constant.
     */
    public static final String SQL_TABLE_DIFFS = "sql_table_diffs";
    
    /**
     * constant.
     */
    public static final String DATA_DICT_DIFFS = "data_dict_diffs";
    
    /**
     * constant.
     */
    public static final String CHANGE_TYPE = "change_type";
    
    /**
     * afm_flds table.
     */
    public static final String AFM_FLDS = "afm_flds";
    
    /**
     * afm_tbls table.
     */
    public static final String AFM_FLDS_TRANS = "afm_flds_trans";
    
    /**
     * afm_tbls table.
     */
    public static final String AFM_TBLS = "afm_tbls";
    
    /**
     * afm_transfer_set table.
     */
    public static final String AFM_TRANSFER_SET = "afm_transfer_set";
    
    /**
     * operation.
     */
    public static final String COMPARE = "COMPARE";
    
    /**
     * status code.
     */
    public static final String COMPARED = "COMPARED";
    
    /**
     * status code.
     */
    public static final String EXPORTED = "EXPORTED";
    
    /**
     * status code.
     */
    public static final String IMPORTED = "IMPORTED";
    
    /**
     * status code.
     */
    public static final String IN_PROGRESS = "IN PROCESS";
    
    /**
     * Character that separates the like wild cards conditions.
     */
    public static final String LIKE_SEPARATOR = ";";
    
    /**
     * status code.
     */
    public static final String NO_EXTRACT_FILE = "NO EXTRACT FILE";
    
    /**
     * status code.
     */
    public static final String NO_PROJECT_TABLE = "NO PROJECT TABLE";
    
    /**
     * status code.
     */
    public static final String NOT_PROCESSED = "NOT PROCESSED";
    
    /**
     * status code.
     */
    public static final String PENDING = "PENDING";
    
    /**
     * Used to be stored into afm_transfer_set.set field.
     */
    public static final String PROJUPWIZ = "DBWIZ";
    
    /**
     * operation.
     */
    public static final String TRANSFERIN = "TRANSFERIN";
    
    /**
     * operation.
     */
    public static final String TRANSFEROUT = "TRANSFEROUT";
    
    /**
     * status code.
     */
    public static final String UPDATED = "UPDATED";
    
    /**
     * Database Update Wizard folder name.
     */
    public static final String DUW_FOLDER = "database-update";
    
    /**
     * Current Database Update Wizard folder name.
     */
    public static final String CURRENT_DB_FOLDER = "personalized-database";
    
    /**
     * Constant.
     */
    public static final String AFM_FLDS_LANG = "afm_flds_lang";
    
    /**
     * Database update wizard bootstrap file.
     */
    public static final String BOOTSTRAP_FILE_DUW = "01_changes-database-update-wizard.sql";
    
    /**
     * Constructor.
     */
    private ProjectUpdateWizardConstants() {
    }
}
