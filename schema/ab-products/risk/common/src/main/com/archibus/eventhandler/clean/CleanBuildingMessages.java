package com.archibus.eventhandler.clean;

import java.util.*;

import com.archibus.context.Context;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * Contains translatable messages for clean building.
 * 
 * @author Ioan Draghici
 * 
 */
public class CleanBuildingMessages {
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_ACTION_TITLE = "Material Description: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_AFFECTED_LOCATIONS = "Affected Locations: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_CAUSE_TYPE = "Abatement Reason: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_CB_UNITS_ID = "Units: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_COND_VALUE = "Condition Value: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_CLASS1_ID = "Classification I: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_CLASS2_ID = "Classification II: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_CLASS3_ID = "Classification III: ";
    
    /**
     * Translatable label.
     */
    // KB3032717 - Rename field's title from "Hazard Condition" to "Material Condition" in all forms
    // where it appears.
    // @translatable
    public static final String MESSAGE_HCM_COND_ID = "Material Condition: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_FITTINGS_NUM = "Number of Fittings: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_FRIABLE = "Friability: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_HAREA_ID = "Homogeneous Area ID: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_HAZ_RANK_ID = "Hazard Rank: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_HAZ_RATING_ID = "Hazard Rating: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_HAZ_STATUS_ID = "Status: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_ID = "Material Code: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_IS_HAZARD = "Hazardous?: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_LABELED = "Labeled?: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_LOC_NOTES = "Location Notes: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_LOC_TYP_ID = "Location of Material: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_PIPE_CNT = "Number of Pipes: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_HCM_QTY = "Quantity: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_LAT = "Latitude: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_LOCATION = "Location Detail: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_LOCATION_TYPES = "Location Types: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_LON = "Longitude: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_PROB_TYPE = "Hazardous Substance: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_REC_ACTION = "Recommended Action: ";
    
    /**
     * Translatable label.
     */
    // @translatable
    public static final String MESSAGE_REPAIR_TYPE = "Hazard Response: ";
    
    /**
     * Map with field labels.
     * <p>
     * Suppress PMD.AvoidStaticFields warning.
     * <p>
     * Justification: Map with translatable assessment information fields.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    private static Map<String, String> assessmentInfoFields = new HashMap<String, String>();
    
    static {
        assessmentInfoFields.put("prob_type", MESSAGE_PROB_TYPE);
        assessmentInfoFields.put("hcm_loc_typ_id", MESSAGE_HCM_LOC_TYP_ID);
        assessmentInfoFields.put("hcm_harea_id", MESSAGE_HCM_HAREA_ID);
        assessmentInfoFields.put("location", MESSAGE_LOCATION);
        assessmentInfoFields.put("lat", MESSAGE_LAT);
        assessmentInfoFields.put("lon", MESSAGE_LON);
        assessmentInfoFields.put("hcm_loc_notes", MESSAGE_HCM_LOC_NOTES);
        assessmentInfoFields.put("hcm_haz_status_id", MESSAGE_HCM_HAZ_STATUS_ID);
        assessmentInfoFields.put("hcm_id", MESSAGE_HCM_ID);
        assessmentInfoFields.put("hcm_qty", MESSAGE_HCM_QTY);
        assessmentInfoFields.put("action_title", MESSAGE_ACTION_TITLE);
        assessmentInfoFields.put("cb_units_id", MESSAGE_CB_UNITS_ID);
        assessmentInfoFields.put("hcm_is_hazard", MESSAGE_HCM_IS_HAZARD);
        assessmentInfoFields.put("hcm_pipe_cnt", MESSAGE_HCM_PIPE_CNT);
        assessmentInfoFields.put("hcm_friable", MESSAGE_HCM_FRIABLE);
        assessmentInfoFields.put("hcm_fittings_num", MESSAGE_HCM_FITTINGS_NUM);
        assessmentInfoFields.put("hcm_haz_rank_id", MESSAGE_HCM_HAZ_RANK_ID);
        assessmentInfoFields.put("hcm_class1_id", MESSAGE_HCM_CLASS1_ID);
        assessmentInfoFields.put("hcm_class2_id", MESSAGE_HCM_CLASS2_ID);
        assessmentInfoFields.put("hcm_class3_id", MESSAGE_HCM_CLASS3_ID);
        assessmentInfoFields.put("hcm_haz_rating_id", MESSAGE_HCM_HAZ_RATING_ID);
        assessmentInfoFields.put("hcm_cond_id", MESSAGE_HCM_COND_ID);
        assessmentInfoFields.put("cond_value", MESSAGE_COND_VALUE);
        assessmentInfoFields.put("rec_action", MESSAGE_REC_ACTION);
        assessmentInfoFields.put("cause_type", MESSAGE_CAUSE_TYPE);
        assessmentInfoFields.put("hcm_labeled", MESSAGE_HCM_LABELED);
    }
    
    /**
     * Hide constructor.
     */
    protected CleanBuildingMessages() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
    
    /**
     * Get localized field title.
     * 
     * @param field field name
     * @param context current context
     * @return localized title
     */
    public static String getInfoFieldTitle(final String field, final Context context) {
        return EventHandlerBase.localizeString(context.getCurrentContext(),
            assessmentInfoFields.get(field),
            "com.archibus.eventhandler.clean.CleanBuildingMessages");
    }
    
}
