package com.archibus.app.common.space.dao.datasource;

/**
 * Public constants for Space DAOs implementations.
 * <p>
 * Constants here are shared between several DAO implementation classes.
 * 
 * @author Valery Tydykov
 * 
 *         <p>
 *         Suppress PMD warning "ShortVariable" in this class.
 *         <p>
 *         Justification: "RM" reflects table name.
 */
@SuppressWarnings("PMD.ShortVariable")
public final class Constants {
    /**
     * Constant: table name: "rm".
     */
    public static final String RM = "rm";
    
    /**
     * Constant: table name: "rm".
     */
    public static final String EM = "em";
    
    /**
     * Constant: field name: "bl_id".
     */
    static final String BL_ID = "bl_id";
    
    /**
     * Constant: property name: "buildingId".
     */
    static final String BUILDING_ID = "buildingId";
    
    /**
     * Constant: property name: "category".
     */
    static final String CATEGORY = "category";
    
    /**
     * Constant: field name: "date_end".
     */
    static final String DATE_END = "date_end";
    
    /**
     * Constant: field name: "date_start".
     */
    static final String DATE_START = "date_start";
    
    /**
     * Constant: property name: "departmentId".
     */
    static final String DEPARTMENT_ID = "departmentId";
    
    /**
     * Constant: property name: "divisionId".
     */
    static final String DIVISION_ID = "divisionId";
    
    /**
     * Constant: field name: "dp_id".
     */
    static final String DP_ID = "dp_id";
    
    /**
     * Constant: field name: "dv_id".
     */
    static final String DV_ID = "dv_id";
    
    /**
     * Constant: field name: "em_id".
     */
    static final String EM_ID = "em_id";
    
    /**
     * Constant: property name: "employeeId".
     */
    static final String EMPLOYEE_ID = "employeeId";
    
    /**
     * Constant: field name: "bl_id".
     */
    static final String FL_ID = "fl_id";
    
    /**
     * Constant: property name: "floorId".
     */
    static final String FLOOR_ID = "floorId";
    
    /**
     * Constant: property name: "id".
     */
    static final String ID = "id";
    
    /**
     * Constant: field name: "primary_rm".
     */
    static final String PRIMARY_RM = "primary_rm";
    
    /**
     * Constant: field name: "primary_em".
     */
    static final String PRIMARY_EM = "primary_em";
    
    /**
     * Constant: property name: "prorate".
     */
    static final String PRORATE = "prorate";
    
    /**
     * Constant: field name: "rm_cat".
     */
    static final String RM_CAT = "rm_cat";
    
    /**
     * Constant: field name: "rm_id".
     */
    static final String RM_ID = "rm_id";
    
    /**
     * Constant: field name: "rm_type".
     */
    static final String RM_TYPE = "rm_type";
    
    /**
     * Constant: bean name: "room".
     */
    static final String ROOM = "roomBean";
    
    /**
     * Constant: property name: "status".
     */
    static final String STATUS = "status";
    
    /**
     * Constant: property name: "occupiable".
     */
    static final String OCCUPIABLE = "occupiable";
    
    /**
     * Constant: property name: "type".
     */
    static final String TYPE = "type";
    
    /**
     * Constant: property name: "name".
     */
    static final String NAME = "name";
    
    /**
     * Constant: property name: "cap_em".
     */
    static final String CAP_EM = "cap_em";
    
    /**
     * Constant: property name: "employeeCapacity".
     */
    static final String EMPLOYEE_CAPACITY = "employeeCapacity";
    
    /**
     * Constant: field name: "rm_std".
     */
    static final String RM_STD = "rm_std";
    
    /**
     * Constant: property name: "standard".
     */
    static final String STANDARD = "standard";
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private Constants() {
    }
}
