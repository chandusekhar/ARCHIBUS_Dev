package com.archibus.eventhandler.eam.datachangeevent;

/**
 * Database related constants = table and field names.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public final class DbConstants {
    
    /**
     * Constant - table name.
     */
    public static final String EQUIPMENT_DEPRECIATION_TABLE = "eq_dep";

    /**
     * Constant - table name.
     */
    public static final String FURNITURE_DEPRECIATION_TABLE = "ta_dep";
    
    /**
     * Constant - field name.
     */
    public static final String EQ_ID = "eq_id";

    /**
     * Constant - field name.
     */
    public static final String TA_ID = "ta_id";
    
    /**
     * Constant - field name.
     */
    public static final String DOT = ".";
    
    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private DbConstants() {
        
    }
    
    /**
     * Returns full field name.
     *
     * @param tableName table name
     * @param fieldName field name
     * @return string
     */
    public static String getFullFieldName(final String tableName, final String fieldName) {
        return tableName + DOT + fieldName;
    }
    
}
