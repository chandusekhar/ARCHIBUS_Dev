package com.archibus.app.common.organization.domain;

/**
 * Domain object for department.
 * <p>
 * Mapped to dp table.
 * 
 * @author Valery Tydykov
 * 
 */
public class Department {
    /**
     * Division ID.
     */
    private String divisionId;
    
    /**
     * ID of the department.
     */
    private String id;
    
    /**
     * @return the divisionId
     */
    public String getDivisionId() {
        return this.divisionId;
    }
    
    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }
    
    /**
     * @param divisionId the divisionId to set
     */
    public void setDivisionId(final String divisionId) {
        this.divisionId = divisionId;
    }
    
    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
    }
}
