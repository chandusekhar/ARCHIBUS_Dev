package com.archibus.app.common.mobile.util;

/**
 * Constants used for all mobile services.
 *
 * @author Ying Qin
 * @since 21.1
 */
public final class ServiceConstants {
    /**
     * Constant.
     */
    public static final String EQUAL = "=";

    /**
     * Constant.
     */
    public static final String SQL_AND = " AND ";

    /**
     * Constant OR.
     */
    public static final String SQL_OR = " OR ";

    /**
     * Constant.
     */
    public static final String SQL_DOT = ".";

    /**
     * Constant FROM.
     */
    public static final String SQL_FROM = " FROM ";

    /**
     * Constant UNION.
     */
    public static final String SQL_UNION = " UNION ";

    /**
     * Constant.
     */
    public static final String SQL_ORDER_BY = " ORDER BY ";

    /**
     * Constant.
     */
    public static final String SQL_COMMA = ",";

    /**
     * Constant IS NULL.
     */
    public static final String SQL_IS_NULL = " IS NULL ";

    /**
     * Constant IS NOT NULL.
     */
    public static final String SQL_IS_NOT_NULL = " IS NOT NULL ";

    /**
     * Start parenthesis.
     */
    public static final String START_PARENTHESIS = "(";

    /**
     * End parenthesis.
     */
    public static final String END_PARENTHESIS = ")";

    /**
     * Start bracket.
     */
    public static final String START_BRACKET = "[";

    /**
     * End bracket.
     */
    public static final String END_BRACKET = "]";

    /**
     * End quote.
     */
    public static final String QUOTE = "'";

    /**
     * Constant.
     */
    public static final String LETTER_PIPE = "|";

    /**
     * Empty string.
     */
    public static final String EMPTY_STRING = " ";

    /**
     * Constant: 'Closed' value of survey.status field.
     */
    public static final String CLOSED = "Closed";

    /**
     * Constant: 'Completed' value of survey.status field.
     */
    public static final String COMPLETED = "Completed";

    /**
     * Completed Status.
     */
    public static final String COMPLETED_STATUS = "Com";

    /**
     * Project status "Issued-In Process".
     */
    public static final String PROJECT_STATUS_ISSUED_IN_PROCESS = "Issued-In Process";

    /**
     * "ASSESSMENT".
     */
    public static final String ASSESSMENT = "ASSESSMENT";

    /**
     * "ASSESSMENT - ENVIRONMENTAL".
     */
    public static final String ASSESSMENT_ENVIRONMENTAL = "ASSESSMENT - ENVIRONMENTAL";

    /**
     * "COMMISSIONING".
     */
    public static final String COMMISSIONING = "COMMISSIONING";

    /**
     * Constant: value 'N/A' for action field.
     */
    public static final String ACTION_NA = "N/A";

    /**
     * Constant: value 'delete' for action field.
     */
    public static final String ACTION_DELETE = "delete";

    /**
     * Constant value '1' for enumeration field rmpct.status = 'Approved'.
     */
    public static final String STATUS_APPROVED_VALUE = "1";

    /**
     * Constant value 'SERVICE DESK - HOTELING' for activity_log.activity_type field.
     */
    public static final String SERVICE_DESK_HOTELING_VALUE = "SERVICE DESK - HOTELING";

    /**
     * Constant value 'SERVICE DESK - MAINTENANCE'.
     */
    public static final String SERVICE_DESK_MAINTENANCE_VALUE = "SERVICE DESK - MAINTENANCE";

    /**
     * Service Desk Request types for this app.
     */
    public static final String[] SERVICE_DESK_ACTIVITY_TYPES = { "SERVICE DESK - COPY SERVICE",
            "SERVICE DESK - DEPARTMENT SPACE", "SERVICE DESK - FURNITURE",
            "SERVICE DESK - INDIVIDUAL MOVE", SERVICE_DESK_MAINTENANCE_VALUE };

    /**
     * Default activity type.
     */
    public static final String DEFAULT_ACTIVITY_TYPE = SERVICE_DESK_MAINTENANCE_VALUE;

    /**
     * Config Id Field Name.
     */
    public static final String CONFIG_ID = "config_id";

    /**
     * [table_name] marker string to be replaced with actual table name in SQL statements.
     */
    public static final String TABLE_NAME_MARKER = "[table_name]";

    /**
     * Bean name roomReservationService.
     */
    public static final String ROOM_RESERVATION_SERVICE = "roomReservationService";

    /**
     * The Constant RES_ID.
     */
    public static final String RES_ID = "res_id";

    /**
     * Constant.
     */
    public static final String RECURRING_RULE = "recurringRule";

    /**
     * Constant.
     */
    public static final String BOOKINGS = "bookings";

    /**
     * Number of days before the current day to sync the service desk requests.
     */
    public static final int NUMBER_OF_PAST_DAYS = 30;

    /**
     * Maximum number of Work Requests to Sync for each mobile user.
     */
    public static final String WORK_REQUESTS_TO_SYNC = "250";

    /**
     * Default days after work request archived.
     */
    public static final String SHOW_DAYS_AFTER_ARCHIVED = "7";

    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private ServiceConstants() {
    }
}
