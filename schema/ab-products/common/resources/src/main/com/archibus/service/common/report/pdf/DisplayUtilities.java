package com.archibus.service.common.report.pdf;

import com.archibus.ext.report.docx.DocxUtility;

/**
 *
 * Utilities for class ScalableDrawingPdfBuilder to display image in PDF.
 *
 * @author Yong Shao
 * @since 22.1
 *        
 */
public final class DisplayUtilities {
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DisplayUtilities() {
    }
    
    /**
     *
     * Displays drawing in Pdf.
     *
     * @param displayInfo DisplayInfo.
     */
    public static void display(final DisplayInfo displayInfo) {
        // display highlighted drawing image
        if (displayInfo.getDrawingShap() != null
                && displayInfo.getDrawingInfo().getImage() != null) {
            if (displayInfo.getZoomedImageInfo() == null) {
                displayDrawing(displayInfo);
            } else {
                displayZoomedDrawing(displayInfo);
            }

        }

        // North Arrow
        if (displayInfo.getArrowShape() != null) {
            displayInfo.getArrowShape().setRotation(displayInfo.getDrawingInfo().getRotation());
        }
        
        // dynamic texts - title block.
        final TitleBlock titleBlock = new TitleBlock();
        titleBlock.display(displayInfo.getDisplayedScale(), displayInfo);
    }
    
    /**
     *
     * Publishes drawing into report.
     *
     * @param displayInfo DisplayInfo.
     */
    private static void displayDrawing(final DisplayInfo displayInfo) {
        final String predefinedScale = displayInfo.getPredefinedScale();
        if (Constants.NULL_VALUE.equalsIgnoreCase(predefinedScale)) {
            // without consideration of published scale
            DocxUtility.insertImage(displayInfo.getDocument(),
                displayInfo.getDrawingShap().getFirstParagraph(),
                displayInfo.getDrawingInfo().getImage().getImage(),
                displayInfo.getUseDimension().getHeight(),
                displayInfo.getUseDimension().getWidth());
        }

        int useScaleIndexing = -1;
        if (Constants.SCALE_PREDEFINED_CONSISTENT.equalsIgnoreCase(predefinedScale)) {
            useScaleIndexing = displayInfo.getActualScaleIndexing();
        } else {
            useScaleIndexing = displayInfo.getScaleIndexing(predefinedScale);
        }
        displayInfo.setDisplayedScale(null);
        
        if (useScaleIndexing != -1) {
            DocxUtility.insertImage(displayInfo.getDocument(),
                displayInfo.getDrawingShap().getFirstParagraph(),
                displayInfo.getDrawingInfo().getImage().getImage(),
                displayInfo.getDrawingInfo().getImage().getDrawingRealDimension().getHeight()
                        * displayInfo.getScaleInfo().getPointConversionFactor()
                        / displayInfo.getScaleInfo().getScaleFactors()[useScaleIndexing],
                displayInfo.getDrawingInfo().getImage().getDrawingRealDimension().getWidth()
                        * displayInfo.getScaleInfo().getPointConversionFactor()
                        / displayInfo.getScaleInfo().getScaleFactors()[useScaleIndexing]);

            displayInfo.setDisplayedScale(
                displayInfo.getScaleInfo().getScaleDisplayNames()[useScaleIndexing]);
        }

    }

    /**
     *
     * Displays ZoomedDrawing.
     *
     * @param displayInfo DisplayInfo.
     */
    private static void displayZoomedDrawing(final DisplayInfo displayInfo) {
        DocxUtility.insertImageWithFit(displayInfo.getDocument(),
            displayInfo.getDrawingShap().getFirstParagraph(),
            displayInfo.getZoomedImageInfo().getImage(),
            displayInfo.getTargetDimension().getHeight(),
            displayInfo.getTargetDimension().getWidth());
        displayInfo.setZoomedImageInfo(null);
    }

}
