package com.archibus.app.common.metrics.domain;

/**
 * Domain object for granularity definition.
 * <p>
 * Mapped to <code>afm_metric_gran_defs</code> table.
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class GranularityDef {
    
    /**
     * Group by fields.
     */
    private String groupByFields;
    
    /**
     * If field is present in table.
     */
    private int fieldPresence;
    
    /**
     * Required fields.
     */
    private String requiredFields;
    
    /**
     * Granularity title.
     */
    private String title;
    
    /**
     * Setter for the groupByFields property.
     * 
     * @see groupByFields
     * @param groupByFields the groupByFields to set
     */
    
    public void setGroupByFields(final String groupByFields) {
        this.groupByFields = groupByFields;
    }
    
    /**
     * Getter for the groupByFields property.
     * 
     * @see groupByFields
     * @return the groupByFields property.
     */
    public String getGroupByFields() {
        return this.groupByFields;
    }
    
    /**
     * If grouping and required fields are defined on main table.
     * 
     * @see fieldPresence
     * @return boolean value.
     */
    public boolean isFieldPresent() {
        return this.fieldPresence == 1;
    }
    
    /**
     * Getter for the fieldPresence property.
     * 
     * @see fieldPresence
     * @return the fieldPresence
     */
    public int getFieldPresence() {
        return this.fieldPresence;
    }
    
    /**
     * Setter for the fieldPresence property.
     * 
     * @see fieldPresence
     * @param fieldPresence the fieldPresence to set
     */
    
    public void setFieldPresence(final int fieldPresence) {
        this.fieldPresence = fieldPresence;
    }
    
    /**
     * Getter for the requiredFields property.
     * 
     * @see requiredFields
     * @return the requiredFields property.
     */
    public String getRequiredFields() {
        return this.requiredFields;
    }
    
    /**
     * Setter for the requiredFields property.
     * 
     * @see requiredFields
     * @param requiredFields the requiredFields to set
     */
    
    public void setRequiredFields(final String requiredFields) {
        this.requiredFields = requiredFields;
    }
    
    /**
     * @return the title
     */
    public String getTitle() {
        return this.title;
    }
    
    /**
     * @param title the title to set
     */
    public void setTitle(final String title) {
        this.title = title;
    }
    
}
