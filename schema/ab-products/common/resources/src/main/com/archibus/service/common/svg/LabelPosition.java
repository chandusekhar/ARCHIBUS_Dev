package com.archibus.service.common.svg;

/**
 * 
 * Provides Helper class to hold label position properties.
 * 
 * @author Yong Shao
 * @since 21.2
 * 
 */
public class LabelPosition {
    /**
     * Asset type like eq..
     */
    private String assetType;
    
    /**
     * label horizontal alignment.
     */
    private String horizontalAlignment = "start";
    
    /**
     * label offset int.
     */
    private double offset;
    
    /**
     * Getter for the assetType property.
     * 
     * @see assetType
     * @return the assetType property.
     */
    public String getAssetType() {
        return this.assetType;
    }
    
    /**
     * Setter for the assetType property.
     * 
     * @see assetType
     * @param assetType the assetType to set
     */
    
    public void setAssetType(final String assetType) {
        this.assetType = assetType;
    }
    
    /**
     * Getter for the offset property.
     * 
     * @see offset
     * @return the offset property.
     */
    public double getOffset() {
        return this.offset;
    }
    
    /**
     * Setter for the offset property.
     * 
     * @see offset
     * @param offset the offset to set
     */
    
    public void setOffset(final double offset) {
        this.offset = offset;
    }
    
    /**
     * Getter for the horizontalAlignment property.
     * 
     * @see horizontalAlignment
     * @return the horizontalAlignment property.
     */
    public String getHorizontalAlignment() {
        return this.horizontalAlignment;
    }
    
    /**
     * Setter for the horizontalAlignment property.
     * 
     * @see horizontalAlignment
     * @param horizontalAlignment the horizontalAlignment to set
     */
    
    public void setHorizontalAlignment(final String horizontalAlignment) {
        this.horizontalAlignment = horizontalAlignment;
    }
    
}
