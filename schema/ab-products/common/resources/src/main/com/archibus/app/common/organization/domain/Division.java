package com.archibus.app.common.organization.domain;

/**
 * Domain object for division.
 * <p>
 * Mapped to dv table.
 * 
 * @author Valery Tydykov
 * 
 */
public class Division {
    /**
     * ID of the division.
     */
    private String id;
    
    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }
    
    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
    }
}
