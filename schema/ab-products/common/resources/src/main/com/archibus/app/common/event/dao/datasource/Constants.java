package com.archibus.app.common.event.dao.datasource;

/**
 * Constants for Event DAOs implementations.
 * <p>
 * Constants are shared between several DAO implementation classes in this package.
 * 
 * @author Valery Tydykov
 */
final class Constants {
    /**
     * Constant: table name: "afm_data_event_log".
     */
    static final String AFM_DATA_EVENT_LOG = "afm_data_event_log";
    
    /**
     * Constant: field name: "auto_number".
     */
    static final String AUTO_NUMBER = "auto_number";
    
    /**
     * Constant: field name: "change_type".
     */
    static final String CHANGE_TYPE = "change_type";
    
    /**
     * Constant: field name: "date_occurred".
     */
    static final String DATE_OCCURRED = "date_occurred";
    
    /**
     * Constant: field name: "event_type".
     */
    static final String EVENT_TYPE = "event_type";
    
    /**
     * Constant: field name: "field_list".
     */
    static final String FIELD_LIST = "field_list";
    
    /**
     * Constant: bean name: "recordChanged".
     */
    static final String RECORD_CHANGED = "recordChanged";
    
    /**
     * Constant: bean name: "sqlExecuted".
     */
    static final String SQL_EXECUTED = "sqlExecuted";
    
    /**
     * Constant: field name: "sql_statement".
     */
    static final String SQL_STATEMENT = "sql_statement";
    
    /**
     * Constant: field name: "table_name".
     */
    static final String TABLE_NAME = "table_name";
    
    /**
     * Constant: field name: "time_occurred".
     */
    static final String TIME_OCCURRED = "time_occurred";
    
    /**
     * Constant: field name: "user_name".
     */
    static final String USER_NAME = "user_name";
    
    /**
     * Constant: field name: "values_new".
     */
    static final String VALUES_NEW = "values_new";
    
    /**
     * Constant: field name: "values_old".
     */
    static final String VALUES_OLD = "values_old";
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private Constants() {
    }
}
