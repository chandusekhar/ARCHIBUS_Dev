package com.archibus.service.cost;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * Defines translatable messages used in cost service.
 */
public final class CostMessages {
    
    // @translatable
    public static final String MESSAGE_BUILDING = "Building";
    
    // @translatable
    public static final String MESSAGE_BUILDINGS = "Buildings";
    
    // @translatable
    public static final String MESSAGE_FROM_DATE_DUE = "From Date Due:";
    
    // @translatable
    public static final String MESSAGE_LEASE = "Lease";
    
    // @translatable
    public static final String MESSAGE_LEASES = "Leases";
    
    // @translatable
    public static final String MESSAGE_OF = "of";
    
    // @translatable
    public static final String MESSAGE_PROPERTIES = "Properties";
    
    // @translatable
    public static final String MESSAGE_PROPERTY = "Property";
    
    // @translatable
    public static final String MESSAGE_PRORATE_PORTION_FROM = "Prorated portion from";
    
    // @translatable
    public static final String MESSAGE_ROLLUP_TOTAL_FROM = "Rolled up total from";
    
    // @translatable
    public static final String MESSAGE_TO_DATE_DUE = "To Date Due:";
    
    // @translatable
    public static final String MESSAGE_CALCULATE_STRAIGHT_LINE = "Calculating Straight Line Rent";
    
    // @translatable
    public static final String MESSAGE_CALCULATE_COST_PROJECTION = "Generate cost projection";
    
    // @translatable
    public static final String MESSAGE_FIXED_CHARGEBACK = "Fixed chargeback from Lease";
    
    // @translatable
    public static final String MESSAGE_PERCENT_PRORATE_PORTION_FROM =
            "Percentage of prorated portion from";
    
    // @translatable
    public static final String JOB_STATUS_PRORATION_UPDATE_LS_AREA =
            "Perform Proration and Update Lease Areas";
    
    // @translatable
    public static final String JOB_STATUS_UPDATE_BL_PR_AREA =
            "Update Building and Property Area Totals";
    
    // @translatable
    public static final String JOB_STATUS_PROCESSING_COSTS = "Processing costs";
    
    /**
     * Class name.
     */
    public static final String CLASS_NAME = "com.archibus.service.cost.CostMessages";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private CostMessages() {
        
    }
    
    /**
     * Returns localized string.
     * 
     * @param message message name
     * @return string
     */
    public static String getLocalizedMessage(final String message) {
        return EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
            message, CLASS_NAME);
    }
}
