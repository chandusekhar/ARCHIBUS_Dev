package com.archibus.service.common.report.pdf;

import com.archibus.ext.drawing.highlight.HighlightedImageResult;

/**
 *
 * Provides drawing information.
 * <p>
 *
 * Used by DisplayInfo.java.
 *
 * @author Yong Shao
 * @since 22.1
 *
 */
public class DrawingInfo {
    /**
     * drawing name.
     */
    private String name;

    /**
     * drawing title.
     */
    private String title;

    /**
     * geo rotation.
     */
    private double rotation;

    /**
     * highlight image.
     */
    private HighlightedImageResult image;
    
    /**
     *
     * Gets Name.
     *
     * @return name.
     */
    public String getName() {
        return this.name;
    }

    /**
     *
     * Sets Name.
     *
     * @param name string.
     */
    public void setName(final String name) {
        this.name = name;
    }

    /**
     *
     * Gets Title.
     *
     * @return title.
     */
    public String getTitle() {
        return this.title;
    }

    /**
     *
     * Sets Title.
     *
     * @param title String.
     */
    public void setTitle(final String title) {
        this.title = title;
    }

    /**
     *
     * Gets Rotation.
     *
     * @return rotation.
     */
    public double getRotation() {
        return this.rotation;
    }

    /**
     *
     * Sets Rotation.
     *
     * @param rotation double.
     */
    public void setRotation(final double rotation) {
        this.rotation = rotation;
    }

    /**
     *
     * Gets Image.
     *
     * @return image.
     */
    public HighlightedImageResult getImage() {
        return this.image;
    }

    /**
     *
     * Sets Image.
     *
     * @param image HighlightedImageResult.
     */
    public void setImage(final HighlightedImageResult image) {
        this.image = image;
    }
    
}
