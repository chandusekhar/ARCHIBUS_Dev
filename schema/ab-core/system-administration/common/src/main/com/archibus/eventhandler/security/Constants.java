package com.archibus.eventhandler.security;

/**
 *
 * Constant declaration.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public final class Constants {
    /**
     * Database table name.
     */
    public static final String AFM_GROUPSFORROLES = "afm_groupsforroles";
    
    /**
     * Database table name.
     */
    public static final String AFM_ROLEPROCS = "afm_roleprocs";

    /**
     * Database field name.
     */
    public static final String ROLE_NAME = "role_name";
    
    /**
     * Database field name.
     */
    public static final String GROUP_NAME = "group_name";
    
    /**
     * Database field name.
     */
    public static final String ACTIVITY_ID = "activity_id";

    /**
     * Constant.
     */
    public static final String DOT = ".";

    /**
     * Constant.
     */
    public static final String COMMA = ",";
    
    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private Constants() {
        
    }
    
    /**
     * Return full field name.
     *
     * @param tableName table name
     * @param fieldName field name
     * @return String
     */
    public static String getFullName(final String tableName, final String fieldName) {
        return tableName + DOT + fieldName;
    }
    
}
