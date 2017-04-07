package com.archibus.service.common.report.pdf;

import java.awt.Dimension;

import com.archibus.ext.drawing.highlight.HighlightedImageResult;
import com.archibus.ext.drawing.highlight.png.ZoomedImageInfo;
import com.aspose.words.*;

/**
 *
 * Provides display information.
 * <p>
 *
 * Used by ScalableDrawingPdfBuilder.java.
 *
 * @author Yong Shao
 * @since 22.1
 *       
 */
public class DisplayInfo {
    /**
     * Image border in box.
     */
    private static final int IMAGE_BORDER = 10;
    
    /**
     * document.
     */
    private com.aspose.words.Document document;
    
    /**
     * body.
     */
    private Body body;
    
    /**
     * drawingShap.
     */
    private Shape drawingShap;
    
    /**
     * arrowShape.
     */
    private Shape arrowShape;
    
    /**
     * scale.
     */
    private String displayedScale;
    
    /**
     * predefinedScale. predefinedScale="null": no scale at all, all drawings fit into the page;
     * predefinedScale=empty or null : calculate scale per drawing; predefinedScale="1/16" : apply
     * the scale per drawing; predefinedScale="consistent": use smallest scale for all drawings.
     *
     */
    private String predefinedScale;
    
    /**
     * actualScaleIndexing.
     */
    private int actualScaleIndexing;

    /**
     * zoomedImageInfo.
     */
    private ZoomedImageInfo zoomedImageInfo;
    
    /**
     * scaleInfo.
     */
    private final transient ScaleInfo scaleInfo = new ScaleInfo();
    
    /**
     * drawingInfo.
     */
    private final transient DrawingInfo drawingInfo = new DrawingInfo();
    
    /**
     * userName.
     */
    private String userName;

    /**
     * drawingIndex.
     */
    private int drawingIndex;

    /**
     *
     * Gets Target Dimension.
     *
     * @return Dimension.
     */
    public java.awt.Dimension getTargetDimension() {
        final java.awt.Dimension dimension = new java.awt.Dimension();
        final double targetWidth = this.drawingShap.getWidth() - IMAGE_BORDER;
        final double targetHeight = this.drawingShap.getHeight() - IMAGE_BORDER;
        dimension.setSize(targetWidth, targetHeight);
        return dimension;
    }
    
    /**
     *
     * Gets Use Dimension.
     *
     * @return Dimension.
     */
    public java.awt.Dimension getUseDimension() {
        java.awt.Dimension dimension = new Dimension();
        final HighlightedImageResult imageResult = this.drawingInfo.getImage();
        if (imageResult != null && imageResult.getImage() != null) {
            final java.awt.Dimension targetDimension = getTargetDimension();
            final double imageWidth =
                    imageResult.getImageDimension().getWidth() * Constants.PIXEL_TO_POINT;
            final double imageHeight =
                    imageResult.getImageDimension().getHeight() * Constants.PIXEL_TO_POINT;
            final double scalex = targetDimension.getWidth() / imageWidth;
            final double scaley = targetDimension.getHeight() / imageHeight;
            final double factor = Math.min(scalex, scaley);
            final double useWidth = imageWidth * factor;
            final double useHeight = imageHeight * factor;
            
            dimension = new java.awt.Dimension();
            dimension.setSize(useWidth, useHeight);

        }
        return dimension;
    }
    
    /**
     *
     * Gets standard Scale Indexing.
     *
     * @param userScale String scale.
     * @return useScaleIndexing.
     */
    public int getScaleIndexing(final String userScale) {
        int result = -1;
        final HighlightedImageResult imageResult = this.drawingInfo.getImage();
        if (imageResult != null && imageResult.getImage() != null) {
            if (userScale == null) {
                // calculation of published scale
                result = processImageScaling(getTargetDimension(), getUseDimension(), imageResult);
            } else if (!Constants.NULL_VALUE.equalsIgnoreCase(userScale)) {
                // directly use passed scale
                result = getStandardScaleIndexing(userScale);
            }
        }

        return result;
    }
    
    /**
     *
     * Gets standard scale indexing by specified string value scale.
     *
     * @param scale String value scale.
     * @return index int.
     */
    public int getStandardScaleIndexing(final String scale) {
        int indexing = 0;
        for (final String standardScale : this.scaleInfo.getScaleDisplayNames()) {
            if (standardScale.equals(scale)) {
                break;
            }
            indexing++;
        }

        return indexing;
    }
    
    /**
     *
     * @param targetDimension target java.awt.Dimension.
     * @param useDimension use java.awt.Dimension.
     *           
     * @param imageResult HighlightedImageResult
     * @return useScaleIndexing.
     */
    private int processImageScaling(final java.awt.Dimension targetDimension,
            final java.awt.Dimension useDimension, final HighlightedImageResult imageResult) {
        int useScaleIndexing = 0;
        if (useDimension.getWidth() >= useDimension.getHeight()) {
            useScaleIndexing = getStandardScaleIndexing(useDimension.getWidth(),
                imageResult.getDrawingRealDimension().getWidth()
                        * this.scaleInfo.getPointConversionFactor());
        } else {
            useScaleIndexing = getStandardScaleIndexing(useDimension.getHeight(),
                imageResult.getDrawingRealDimension().getHeight()
                        * this.scaleInfo.getPointConversionFactor());
        }

        if (imageResult.getDrawingRealDimension().getWidth()
                * this.scaleInfo.getPointConversionFactor()
                / this.scaleInfo.getScaleFactors()[useScaleIndexing] > targetDimension.getWidth()
                || imageResult.getDrawingRealDimension().getHeight()
                        * this.scaleInfo.getPointConversionFactor()
                        / this.scaleInfo.getScaleFactors()[useScaleIndexing] > targetDimension
                            .getHeight()) {
            // increase scale indexing to reduce image's size
            useScaleIndexing++;
        }
        return useScaleIndexing;
    }

    /**
     *
     * Gets Standard Scale Indexing.
     *
     * @param useWidth target use width in points.
     * @param realWidth real drawing width in points.
     * @return standard scale indexing.
     */
    private int getStandardScaleIndexing(final double useWidth, final double realWidth) {
        final double[] calculatedWidths = new double[this.scaleInfo.getScaleFactors().length];
        int indexing = 0;
        for (final double factor : this.scaleInfo.getScaleFactors()) {
            calculatedWidths[indexing++] = Math.abs(useWidth - realWidth / factor);
        }

        double minValue = calculatedWidths[0];
        for (final double calculatedWidth : calculatedWidths) {
            if (calculatedWidth < minValue) {
                minValue = calculatedWidth;
            }
        }

        int result = 0;
        for (final double calculatedWidth : calculatedWidths) {
            if (calculatedWidth == minValue) {
                break;
            }
            result++;
        }

        return result;
    }

    /**
     *
     * Gets Document.
     *
     * @return document.
     */
    public com.aspose.words.Document getDocument() {
        return this.document;
    }

    /**
     *
     * Sets Document.
     *
     * @param document Document.
     */
    public void setDocument(final com.aspose.words.Document document) {
        this.document = document;
    }
    
    /**
     *
     * Gets Body.
     *
     * @return Body.
     */
    public Body getBody() {
        return this.body;
    }
    
    /**
     *
     * Sets Body.
     *
     * @param body Body.
     */
    public void setBody(final Body body) {
        this.body = body;
    }

    /**
     *
     * Gets Drawing Shap.
     *
     * @return drawingShap.
     */
    public Shape getDrawingShap() {
        return this.drawingShap;
    }
    
    /**
     *
     * Sets Drawing Shap.
     *
     * @param drawingShap Shape.
     */
    public void setDrawingShap(final Shape drawingShap) {
        this.drawingShap = drawingShap;
    }

    /**
     *
     * Gets Arrow Shape.
     *
     * @return arrowShape.
     */
    public Shape getArrowShape() {
        return this.arrowShape;
    }

    /**
     *
     * Sets Arrow Shape.
     *
     * @param arrowShape Shape.
     */
    public void setArrowShape(final Shape arrowShape) {
        this.arrowShape = arrowShape;
    }
    
    /**
     *
     * Gets Displayed Scale.
     *
     * @return displayedScale.
     */
    public String getDisplayedScale() {
        return this.displayedScale;
    }
    
    /**
     *
     * Sets Displayed Scale.
     *
     * @param displayedScale String.
     */
    public void setDisplayedScale(final String displayedScale) {
        this.displayedScale = displayedScale;
    }

    /**
     *
     * Gets ScaleInfo.
     *
     * @return ScaleInfo.
     */
    public ScaleInfo getScaleInfo() {
        return this.scaleInfo;
    }
    
    /**
     *
     * Sets DrawingInfo.
     *
     * @return DrawingInfo.
     */
    public DrawingInfo getDrawingInfo() {
        return this.drawingInfo;
    }
    
    /**
     *
     * Gets DrawingIndex.
     *
     * @return drawingIndex.
     */
    public int getDrawingIndex() {
        return this.drawingIndex;
    }
    
    /**
     *
     * Sets DrawingIndex.
     *
     * @param drawingIndex drawing indexing.
     */
    public void setDrawingIndex(final int drawingIndex) {
        this.drawingIndex = drawingIndex;
    }

    /**
     *
     * Gets UserName.
     *
     * @return user name.
     */
    public String getUserName() {
        return this.userName;
    }

    /**
     *
     * Sets UserName.
     *
     * @param userName user name.
     */
    public void setUserName(final String userName) {
        this.userName = userName;
    }

    /**
     *
     * Gets Predefined Scale.
     *
     * @return Predefined Scale.
     */
    public String getPredefinedScale() {
        return this.predefinedScale;
    }
    
    /**
     *
     * Sets Predefined Scale.
     *
     * @param predefinedScale Predefined Scale.
     */
    public void setPredefinedScale(final String predefinedScale) {
        this.predefinedScale = predefinedScale;
    }

    /**
     *
     * Gets Actual Scale Indexing.
     *
     * @return actualScaleIndexing.
     */
    public int getActualScaleIndexing() {
        return this.actualScaleIndexing;
    }

    /**
     *
     * Sets Actual Scale Indexing.
     *
     * @param actualScaleIndexing int.
     */
    public void setActualScaleIndexing(final int actualScaleIndexing) {
        this.actualScaleIndexing = actualScaleIndexing;
    }
    
    /**
     *
     * Gets ZoomedImageInfo.
     *
     * @return ZoomedImageInfo.
     */
    public ZoomedImageInfo getZoomedImageInfo() {
        return this.zoomedImageInfo;
    }
    
    /**
     *
     * Sets ZoomedImageInfo.
     *
     * @param zoomedImageInfo ZoomedImageInfo.
     */
    public void setZoomedImageInfo(final ZoomedImageInfo zoomedImageInfo) {
        this.zoomedImageInfo = zoomedImageInfo;
    }

}
