package com.archibus.app.sysadmin.updatewizard.project.util;

/**
 * Recommended/chosen actions.
 * 
 * @author Catalin Purice
 * 
 *         <p>
 *         Suppress PMD warning "AvoidUsingSql" in this enum.
 *         <p>
 *         Justification: This is not an SQL command.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public enum Actions {
    /**
     * Apply change.
     */
    APPLY_CHANGE("APPLY CHANGE"),
    /**
     * Delete field.
     */
    DELETE_FIELD("DELETE FIELD"),
    /**
     * Keep existing.
     */
    KEEP_EXISTING("KEEP EXISTING"),
    /**
     * No action.
     */
    NO_ACTION("NO ACTION"),
    /**
     * Review error.
     */
    REVIEW_ERROR("REVIEW ERROR");
    
    /**
     * Message.
     */
    private String message;
    
    /**
     * Constructor.
     * 
     * @param message message
     */
    private Actions(final String message) {
        this.message = message;
    }
    
    /**
     * Gets the message.
     * 
     * @return this.message
     */
    public String getMessage() {
        return this.message;
    }
}
