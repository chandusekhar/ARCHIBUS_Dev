package com.archibus.app.common.drawing.svg.service.domain;

/**
 * Domain class for Drawing .
 * <p>
 * Mapped to afm_dwgs table.
 * <p>
 * Designed to have prototype scope.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public class Drawing {
    /**
     * dwg_name field of table afm_dwgs.
     */
    private String drawingName;
    
    /**
     * space_hier_field_values field of table afm_dwgs.
     */
    private String spaceHierarchyValues;
    
    /**
     * Getter for the drawingName property.
     * 
     * @see drawingName
     * @return the drawingName property.
     */
    public String getDrawingName() {
        return this.drawingName;
    }
    
    /**
     * Setter for the drawingName property.
     * 
     * @see drawingName
     * @param drawingName the drawingName to set
     */
    
    public void setDrawingName(final String drawingName) {
        this.drawingName = drawingName;
    }
    
    /**
     * Getter for the spaceHierarchyValues property.
     * 
     * @see spaceHierarchyValues
     * @return the spaceHierarchyValues property.
     */
    public String getSpaceHierarchyValues() {
        return this.spaceHierarchyValues;
    }
    
    /**
     * Setter for the spaceHierarchyValues property.
     * 
     * @see spaceHierarchyValues
     * @param spaceHierarchyValues the spaceHierarchyValues to set
     */
    
    public void setSpaceHierarchyValues(final String spaceHierarchyValues) {
        this.spaceHierarchyValues = spaceHierarchyValues;
    }
    
}
