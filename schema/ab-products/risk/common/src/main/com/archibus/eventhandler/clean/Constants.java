package com.archibus.eventhandler.clean;

/**
 * Contains clean building constants definition.
 * 
 * @author Ioan Draghici
 * 
 */
public class Constants {
    /**
     * Activity type for action items.
     */
    public static final String ACTION_ACTIVITY_TYPE = "HAZMAT -%";
    
    /**
     * Activity type for assessments.
     */
    public static final String ASSESSMENT_ACTIVITY_TYPE = "ASSESSMENT - HAZMAT";
    
    /**
     * Building table name.
     */
    public static final String BUILDING_TABLE = "bl";
    
    /**
     * Floor.
     */
    public static final String FLOOR_TABLE = "fl";
    
    /**
     * Custom text marker.
     */
    public static final String INFO_MARKER_END = "</hazardInfo>";
    
    /**
     * Custom text marker.
     */
    public static final String INFO_MARKER_START = "<hazardInfo>";
    
    /**
     * Multiple value replacement.
     */
    public static final String COMMA = ",";
    
    /**
     * Multiple value replacement for string field.
     */
    public static final String MULTIPLE_VALUE_REPLACEMENT_FOR_STRING = "','";
    
    /**
     * One To One.
     */
    public static final String ONE_TO_ONE = "oneToOne";
    
    /**
     * Activity type for service request.
     */
    public static final String REQUEST_ACTIVITY_TYPE = "SERVICE DESK - MAINTENANCE";
    
    /**
     * Room.
     */
    public static final String ROOM_TABLE = "rm";
    
    /**
     * Action item type.
     */
    
    public static final String TYPE_ACTION_ITEM = "action";
    
    /**
     * Assessment item type.
     */
    public static final String TYPE_ASSESSMENT_ITEM = "assessment";
    
    /**
     * Service request type.
     */
    public static final String TYPE_SERVICE_REQUEST = "request";
    
    /**
     * Cause type field name.
     */
    public static final String CAUSE_TYPE = "cause_type";
    
    /**
     * "=" operator.
     */
    public static final String EQUALS_OPERATOR = "=";
    
    /**
     * Cb_hcm_places field name.
     */
    public static final String CB_HCM_PLACES_TABLE = "cb_hcm_places";
    
    /**
     * Hcm_loc_typ_id field name.
     */
    public static final String HCM_LOC_TYP_ID = "hcm_loc_typ_id";
    
    /**
     * Dot.
     */
    public static final String DOT = ".";
    
    /**
     * Cb_hcm_loc_typ_chk.
     */
    public static final String CB_HCM_LOC_TYP_CHK_TABLE = "cb_hcm_loc_typ_chk";
    
    /**
     * Date requested field name.
     */
    public static final String DATE_REQUESTED = "date_requested";
    
    /**
     * Abate by field name.
     */
    public static final String HCM_ABATE_BY = "hcm_abate_by";
    
    /**
     * Assessed by field name.
     */
    public static final String ASSESSED_BY = "assessed_by";
    
    /**
     * Assigned to field name.
     */
    public static final String ASSIGNED_TO = "assigned_to";
    
    /**
     * Copied from field name.
     */
    public static final String COPIED_FROM = "copied_from";
    
    /**
     * Prob type field name.
     */
    public static final String PROB_TYPE = "prob_type";
    
    /**
     * Assessment id field name.
     */
    public static final String ASSESSMENT_ID = "assessment_id";
    
    /**
     * Activity type field name.
     */
    public static final String ACTIVITY_TYPE = "activity_type";
    
    /**
     * Project field name.
     */
    public static final String PROJECT_ID = "project_id";
    
    /**
     * Activity log primary key field name.
     */
    public static final String ACTIVITY_LOG_ID = "activity_log_id";
    
    /**
     * Activity log table name.
     */
    public static final String ACTIVITY_LOG_TABLE = "activity_log";
    
    /**
     * Site table name.
     */
    public static final String SITE_TABLE = "site";
    
    /**
     * Site field name.
     */
    public static final String SITE_FLD_NAME = "site_id";
    
    /**
     * Building field name.
     */
    public static final String BUILDING_FLD_NAME = "bl_id";
    
    /**
     * Floor field name.
     */
    public static final String FLOOR_FLD_NAME = "fl_id";
    
    /**
     * Room field name.
     */
    public static final String ROOM_FLD_NAME = "rm_id";
    
    /**
     * Constant.
     */
    public static final int MY_FACTOR = 100;
    
    /**
     * - sign.
     */
    public static final String DASH = "-";
    
    /**
     * Cb_samples.
     */
    public static final String CB_SAMPLES_TABLE = "cb_samples";
    
    /**
     * Ls_comm.
     */
    public static final String LS_COMM_TABLE = "ls_comm";
    
    /**
     * Auto_number field name.
     */
    public static final String AUTO_NUMBER = "auto_number";
    
    /**
     * Description field name.
     */
    public static final String DESCRIPTION_FLD_NAME = "description";
    
    /**
     * Hcm_places_id field name.
     */
    public static final String HCM_PLACES_ID = "hcm_places_id";
    
    /**
     * "\n".
     */
    public static final String NEW_LINE = "\n";
    
    /**
     * ")".
     */
    public static final String RIGHT_ROUND_BRACKET = ")";
    
    /**
     * AND.
     */
    public static final String AND_STRING = "AND";
    
    /**
     * Space character.
     */
    public static final String SPACE_CHARACTER = " ";
    
    /**
     * Hide constructor.
     */
    protected Constants() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
    
}
