package com.archibus.app.common.drawing.svg.service.dao.datasource;

/**
 * 
 * Constants for the classes in this package.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public final class Constants {
    /**
     * Constant: active_plantypes table name.
     */
    public static final String ACTIVE_PLAN_TYPES = "active_plantypes";
    
    /**
     * Constant: plan_type field of table active_plantypes.
     */
    public static final String PLAN_TYPE = "plan_type";
    
    /**
     * Constant: hs_ds field of table active_plantypes.
     */
    public static final String HIGHLIGHT_DATASOURCE = "hs_ds";
    
    /**
     * Constant: label_ds field of table active_plantypes.
     */
    public static final String LABEL_DATASOURCE = "label_ds";
    
    /**
     * Constant: view_file field of table active_plantypes.
     */
    public static final String VIEW_FILE_NAME = "view_file";
    
    /**
     * active field of table active_plantypes.
     */
    public static final String PLAN_TYPE_ACTIVE = "active";
    
    /**
     * Constant: label_ht field of table active_plantypes.
     */
    public static final String LABEL_HEIGHT = "label_ht";
    
    /**
     * Constant: label_clr field of table active_plantypes.
     */
    public static final String LABEL_COLOR = "label_clr";
    
    /**
     * Constant: hs_hide field of table active_plantypes.
     */
    public static final String HIGHLIGHT_HIDE = "hs_hide";
    
    /**
     * Constant: Suffix number 2 for all secondary asset highlight field names of table
     * active_plantypes.
     */
    public static final String SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX = "2";
    
    /**
     * Constant: Site id of site table.
     */
    public static final String SITE_ID = "site_id";
    
    /**
     * Constant: site table name.
     */
    public static final String SITE_TABLE = "site";
    
    /**
     * Constant: detail_dwg field of table site.
     */
    public static final String SITE_DETAIL_DWG = "detail_dwg";
    
    /**
     * afm_dwgs table name.
     */
    public static final String DRAWING_TABLE_NAME = "afm_dwgs";
    
    /**
     * dwg_name field name of afm_dwgs table.
     */
    public static final String DRAWING_FIELD_NAME = "dwg_name";
    
    /**
     * space_hier_field_values field name of afm_dwgs table .
     */
    public static final String SPACE_HIER_FIELD_VALUES_FIELD_NAME = "space_hier_field_values";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private Constants() {
    }
}
