package com.archibus.app.common.space.domain;

/**
 * Domain object for Room Category.
 * <p>
 * Mapped to rmcat table.
 * 
 * @author Zhang Yi
 * 
 */
public class RoomCategory {
    
    /**
     * Room category id.
     */
    private String id;
    
    /**
     * Room category.
     */
    private String superCategory;
    
    /**
     * Occupiable.
     */
    private int occupiable;
    
    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }
    
    /**
     * @return the superCategory
     */
    public String getSuperCategory() {
        return this.superCategory;
    }
    
    /**
     * @return the occupiable
     */
    public int getOccupiable() {
        return this.occupiable;
    }
    
    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
    }
    
    /**
     * @param superCategory the superCategory to set
     */
    public void setSuperCategory(final String superCategory) {
        this.superCategory = superCategory;
    }
    
    /**
     * @param occupiable the occupiable to set
     */
    public void setOccupiable(final int occupiable) {
        this.occupiable = occupiable;
    }
}
