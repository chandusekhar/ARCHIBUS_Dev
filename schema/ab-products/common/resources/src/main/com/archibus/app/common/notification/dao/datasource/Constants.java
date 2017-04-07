package com.archibus.app.common.notification.dao.datasource;

/**
 * Public constants for Notification DAOs implementations.
 * <p>
 * Constants here are shared between several DAO implementation classes.
 * 
 * @author Zhang Yi
 * 
 *         <p>
 *         Suppress PMD warning "ShortVariable" in this class.
 *         <p>
 *         Justification: "EM" reflects table name.
 */
@SuppressWarnings("PMD.ShortVariable")
public final class Constants {
    
    /**
     * Constant: table name: "activity_log".
     */
    public static final String ACTIVITY_LOG = "activity_log";
    
    /**
     * Constant: string: "CurrentDateTime".
     */
    public static final String CURRENT = "CurrentDateTime";
    
    /**
     * Constant: table name: "notifications".
     */
    public static final String NOTIFICATIONS = "notifications";
    
    /**
     * Constant: table name: "notify_templates".
     */
    public static final String NOTIFY_TEMPLATES = "notify_templates";
    
    /**
     * Constant: table name: "messages".
     */
    public static final String MESSAGES = "messages";
    
    /**
     * Constant: table-field name: "activity_log.status".
     */
    public static final String ACTIVITY_LOG_STATUS = "activity_log.status";
    
    /**
     * Constant: string "${status}".
     */
    public static final String MACRO_STATUS = "${status}";
    
    /**
     * Constant: property name: "id".
     */
    public static final String ID = "id";
    
    /**
     * Constant: table name "activity_log_id".
     */
    public static final String ACTIVITY_LOG_ID = "activity_log_id";
    
    /**
     * Constant: field name: "notify_id".
     */
    public static final String NOTIFY_ID = "notify_id";
    
    /**
     * Constant: field name: "template_id".
     */
    public static final String TEMPLATE_ID = "template_id";
    
    /**
     * Constant: field name: "activity_id".
     */
    public static final String ACTIVITY_ID = "activity_id";
    
    /**
     * Constant: field name: "referenced_by".
     */
    public static final String REFERENCED_BY = "referenced_by";
    
    /**
     * Constant: field name: "message_id".
     */
    public static final String MESSAGE_ID = "message_id";
    
    /**
     * Constant: field name: "trigger_condition_to".
     */
    public static final String TRIGGER_CONDITION_TO = "trigger_condition_to";
    
    /**
     * Constant: field name: "trigger_condition_from".
     */
    public static final String TRIGGER_CONDITION_FROM = "trigger_condition_from";
    
    /**
     * Constant: field name: "trigger_date_field".
     */
    public static final String TRIGGER_DATE_FIELD = "trigger_date_field";
    
    /**
     * Constant: field name: "trigger_condition_from".
     */
    public static final String TRIGGER_TIME_FIELD = "trigger_time_field";
    
    /**
     * Constant: bean name: "notification".
     */
    public static final String NOTIFICATION = "notificationBean";
    
    /**
     * Constant: bean name: "notifytemplate".
     */
    public static final String NOTIFYTEMPLATE = "notifytemplateBean";
    
    /**
     * Constant: bean name: "messageBean".
     */
    public static final String MESSAGE = "messageBean";
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private Constants() {
    }
}
