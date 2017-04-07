package com.archibus.app.common.drawing.svg.service.domain;

/**
 *
 * Supper class for HighlightParameters domain to wrap label parameters.
 *
 * @author shao
 * @since 21.1
 *
 */
public class LabelParameters {
    /**
     * the id of label DataSource.
     */
    private String labelDataSourceId;
    
    /**
     * the height of the label.
     */
    private double labelHeight;
    
    /**
     * the color name of the label.
     */
    private String labelColorName;
    
    /**
     * Getter for the labelDataSourceId property.
     *
     * @see labelDataSourceId
     * @return the labelDataSourceId property.
     */
    public String getLabelDataSourceId() {
        return this.labelDataSourceId;
    }

    /**
     * Setter for the labelDataSourceId property.
     *
     * @see labelDataSourceId
     * @param labelDataSourceId the labelDataSourceId to set
     */

    public void setLabelDataSourceId(final String labelDataSourceId) {
        this.labelDataSourceId = labelDataSourceId;
    }

    /**
     * Getter for the labelHeight property.
     *
     * @see labelHeight
     * @return the labelHeight property.
     */
    public double getLabelHeight() {
        return this.labelHeight;
    }

    /**
     * Setter for the labelHeight property.
     *
     * @see labelHeight
     * @param labelHeight the labelHeight to set
     */

    public void setLabelHeight(final double labelHeight) {
        this.labelHeight = labelHeight;
    }

    /**
     * Getter for the labelColorName property.
     *
     * @see labelColorName
     * @return the labelColorName property.
     */
    public String getLabelColorName() {
        return this.labelColorName;
    }

    /**
     * Setter for the labelColorName property.
     *
     * @see labelColorName
     * @param labelColorName the labelColorName to set
     */

    public void setLabelColorName(final String labelColorName) {
        this.labelColorName = labelColorName;
    }

}
