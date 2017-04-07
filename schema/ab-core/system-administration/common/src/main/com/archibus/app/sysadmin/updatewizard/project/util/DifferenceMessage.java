package com.archibus.app.sysadmin.updatewizard.project.util;

/**
 * Defines messages used in Project Update Wizard.
 * 
 * @author Catalin Purice
 * 
 */

public enum DifferenceMessage {
    /**
     * field difference property.
     */
    AFM_SIZE("SIZE"),
    /**
     * field difference property.
     */
    AFM_TYPE(""),
    /**
     * field difference property.
     */
    ALL_FLDS("*all*"),
    /**
     * field difference property.
     */
    ALLOW_NULL(""),
    /**
     * field difference property.
     */
    ATTRIBUTES(""),
    /**
     * field difference property.
     */
    COMMENTS(""),
    /**
     * field difference property.
     */
    DATA_TYPE(""),
    /**
     * field difference property.
     */
    DECIMALS(""),
    /**
     * field difference property.
     */
    DEP_COLS(""),
    /**
     * field difference property.
     */
    DFLT_VAL(""),
    /**
     * field difference property.
     */
    EDIT_GROUP(""),
    /**
     * field difference property.
     */
    EDIT_MASK(""),
    /**
     * field difference property.
     */
    ENUM_LIST(""),
    /**
     * field difference property.
     */
    FIELD_GROUPING(""),
    /**
     * field difference property.
     */
    TBL_IN_PROJ_ONLY(""),
    /**
     * field difference property.
     */
    IS_ATXT(""),
    /**
     * field difference property.
     */
    IS_TC_TRACEABLE(""),
    /**
     * field difference property.
     */
    MAX_VAL(""),
    /**
     * field difference property.
     */
    MIN_VAL(""),
    /**
     * field difference property.
     */
    ML_HEADING(""),
    /**
     * field difference property.
     */
    NEW(""),
    /**
     * field difference property.
     */
    NO_DEFAULT(""),
    /**
     * field difference property.
     */
    NUM_FORMAT(""),
    /**
     * field difference property.
     */
    PRIMARY_KEY(""),
    /**
     * field difference property.
     */
    PROJECT_ONLY(""),
    /**
     * field difference property.
     */
    REF_TABLE(""),
    /**
     * field difference property.
     */
    REVIEW_GROUP(""),
    /**
     * field difference property.
     */
    SL_HEADING(""),
    /**
     * field difference property.
     */
    STRING_FORMAT(""),
    /**
     * field difference property.
     */
    TBL_IS_NEW("Table is new"),
    /**
     * field difference property.
     */
    VALIDATE_DATA("VALIDATE"),
    /**
     * field difference property.
     */
    NO_DB_VAL_IN_ENUM(""),
    /**
     * field difference property.
     */
    CIRC_REF("");
    
    /**
     * Message.
     */
    private String message;
    
    /**
     * Constructor.
     * 
     * @param message message
     */
    DifferenceMessage(final String message) {
        this.message = message;
    }
    
    /**
     * @return this.message
     */
    public String getMessage() {
        return this.message;
    }
}
