package com.archibus.app.common.drawing.svg.service.domain;

/**
 * Domain class for Site .
 * <p>
 * Mapped to site table.
 * <p>
 * Designed to have prototype scope.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public class Site {
    /**
     * detail_dwg field.
     */
    private String detailDrawingName;
    
    /**
     * site_id field.
     */
    // TODO naming: should be named "id"
    private String siteId;
    
    /**
     * Getter for the detailDrawingName property.
     * 
     * @see detailDrawingName
     * @return the detailDrawingName property.
     */
    public String getDetailDrawingName() {
        return this.detailDrawingName;
    }
    
    /**
     * Setter for the detailDrawingName property.
     * 
     * @see detailDrawingName
     * @param detailDrawingName the detailDrawingName to set
     */
    
    public void setDetailDrawingName(final String detailDrawingName) {
        this.detailDrawingName = detailDrawingName;
    }
    
    /**
     * Getter for the siteId property.
     * 
     * @see siteId
     * @return the siteId property.
     */
    public String getSiteId() {
        return this.siteId;
    }
    
    /**
     * Setter for the siteId property.
     * 
     * @see siteId
     * @param siteId the siteId to set
     */
    
    public void setSiteId(final String siteId) {
        this.siteId = siteId;
    }
    
}
