package com.archibus.service.common.report;

import java.text.SimpleDateFormat;
import java.util.ArrayList;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.drawing.highlight.HighlightedImageResult;
import com.archibus.ext.report.docx.*;
import com.archibus.ext.report.docx.table.TablePanelBuilderBase;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.model.view.report.panel.AbstractReportPanelDef;
import com.archibus.utility.*;
import com.aspose.words.*;

/**
 * 
 * Provides scalable drawing highlight paginated Pdf report by overwriting core standard
 * DrawingPanelBuilder APIs. Overwrites processDrawingHighlightOutput() for a custom drawing image
 * output; overwrites processLegendOutput() for a custom legend output.
 * <p>
 * 
 * Used by a report axvw file by specifying it as a handler in view's <panel type="drawing"
 * handler="com.archibus.service.common.report.ScalableDrawingPdfBuilder"> element.
 * 
 * @author Yong Shao
 * @since 21.2
 * 
 */
public class ScalableDrawingPdfBuilder extends
        com.archibus.ext.report.docx.drawinghighlight.DrawingPanelBuilder {
    /**
     * Constant: room table name.
     */
    static final String RM_TABLE = "rm";
    
    /**
     * Constant: room table field names.
     */
    static final String[] RM_FIELDS = { "bl_id", "fl_id", "dwgname" };
    
    /**
     * Image border in box.
     */
    static final int IMAGE_BORDER = 10;
    
    /**
     * bl_fl_records.
     */
    private java.util.List<DataRecord> uniqueFloorsRecords = new ArrayList<DataRecord>();
    
    /**
     * scaleDisplayNames.
     */
    private String[] scaleDisplayNames = Constants.STANDARD_SCALE_IMPERIAL;
    
    /**
     * scaleFractions.
     */
    private double[] scaleFactors = Constants.STANDARD_SCALES_FACTORS_IMPERIAL;
    
    /**
     * scaleDisplayPattern.
     */
    private String scaleDisplayPattern = Constants.SCALE_DISPLAYED_PATTERN_IMPERIAL;
    
    /**
     * pointConversionFactor.
     */
    private double pointConversionFactor = Constants.INCHE_TO_POINTS;
    
    /**
     * scaleBarNumbers.
     */
    private String[] scaleBarNumbers = Constants.SCALE_BAR_IMPERIAL;
    
    /**
     * 
     * Default constructor.
     * 
     * @param reportPanelDef - AbstractReportPanelDef.
     * @param reportPropertiesDef - ReportPropertiesDef.
     * @param context - Context.
     * @param dataSource - DataSource.
     */
    public ScalableDrawingPdfBuilder(final AbstractReportPanelDef reportPanelDef,
            final ReportPropertiesDef reportPropertiesDef, final Context context,
            final DataSource dataSource) {
        super(reportPanelDef, reportPropertiesDef, context, dataSource);
        // TODO Auto-generated constructor stub
    }
    
    /**
     * Overwrites processDrawingHighlightOutput() to call custom processReport(). {@inheritDoc}
     */
    @Override
    public void processDrawingHighlight(final int leftIndent, final String drawingName,
            final String drawingTitle, final HighlightedImageResult imageResult)
            throws ExceptionBase {
        if (this.getDrawingProperties(drawingName) == null) {
            return;
        }
        String unitName = Constants.IMPERIAL;
        if (this.getDrawingProperties(drawingName).getUnits() != null
                && this.getDrawingProperties(drawingName).getUnits().name() != null) {
            unitName = this.getDrawingProperties(drawingName).getUnits().name().toLowerCase();
        }
        
        if (Constants.METRIC.equalsIgnoreCase(unitName)) {
            this.scaleDisplayNames = Constants.STANDARD_SCALE_METRIC;
            
            this.scaleFactors = Constants.STANDARD_SCALES_FACTORS_METRIC;
            
            this.scaleDisplayPattern = Constants.SCALE_DISPLAYED_PATTERN_METRIC;
            
            this.scaleBarNumbers = Constants.SCALE_BAR_METRIC;
            
            final String baseUnitName =
                    this.getDrawingProperties(drawingName).getBaseUnits().name();
            if ("centimeters".equalsIgnoreCase(baseUnitName)) {
                this.pointConversionFactor = Constants.CM_TO_POINTS;
            } else if ("millimeters".equalsIgnoreCase(baseUnitName)) {
                this.pointConversionFactor = Constants.MM_TO_POINTS;
            } else if ("meters".equalsIgnoreCase(baseUnitName)) {
                this.pointConversionFactor = Constants.M_TO_POINTS;
            }
        }
        
        processReport(imageResult, drawingTitle, this.getDrawingProperties(drawingName)
            .getReportParameters().getGeoRotation());
    }
    
    @Override
    public void processLegend(final PanelBuilderBase legendPBuilder, final Report report,
            final java.util.List<DataSourceParameter> parameters, final int leftIndent,
            final int level) throws ExceptionBase {
        final com.aspose.words.Document doc = this.getReport().getDocument();
        
        final int recordIndex = this.getDwgNames().size() - 1;
        final Body body = doc.getSections().get(recordIndex).getBody();
        final Shape legendShap = getTextBoxShape(body, Constants.LEGEND_TABLE);
        if (legendShap != null) {
            final Table table = new Table(doc);
            
            legendShap.appendChild(table);
            
            final TablePanelBuilderBase tableLegendBuilder = (TablePanelBuilderBase) legendPBuilder;
            
            // set up legend's docx table object
            tableLegendBuilder.setDocxTable(table, doc);
            
            tableLegendBuilder.build(report, parameters, leftIndent, level);
            
            // XXXX: append a paragraph to align append table???
            appendBreak(legendShap, doc);
        }
    }
    
    /**
     * 
     * Gets text box shape object by its unique alternative text value.
     * 
     * @param body Body object.
     * @param alternativeText - alternative text value.
     * @return found Shape object.
     * 
     * @SuppressWarnings("unchecked"): Aspose API getChildNodes()
     */
    @SuppressWarnings("unchecked")
    private Shape getTextBoxShape(final Body body, final String alternativeText) {
        Shape result = null;
        final NodeCollection<Shape> shapes = body.getChildNodes(NodeType.SHAPE, true, false);
        for (final Shape shape : shapes) {
            if (alternativeText.equals(shape.getAlternativeText().trim())) {
                result = shape;
                break;
            }
        }
        return result;
    }
    
    /**
     * 
     * Provides custom drawing panel out with specified doc template content.
     * 
     * @param imageResult - HighlightedImageResult.
     * @param title - String.
     * @param rotation - rotation angle from afm_dwgs.geo_rotation if it exists in database,
     *            otherwise, default value is 0.0.
     */
    private void processReport(final HighlightedImageResult imageResult, final String title,
            final double rotation) {
        final com.aspose.words.Document doc = this.getReport().getDocument();
        final int recordIndex = this.getDwgNames().size() - 1;
        final Body body = doc.getSections().get(recordIndex).getBody();
        String scale = null;
        // highlight drawing image
        final Shape drawingShap = getTextBoxShape(body, "DRAWINGIMAGE");
        if (drawingShap != null) {
            scale = publishDrawing(doc, drawingShap, imageResult);
        }
        
        // North Arrow
        final Shape arrowShape = getTextBoxShape(body, "NORTH");
        if (arrowShape != null) {
            arrowShape.setRotation(rotation);
        }
        
        // dynamic texts
        publishDynamicTexts(body, title, recordIndex, scale);
        
    }
    
    /**
     * 
     * @param body Body.
     * @param title drawing's title.
     * @param recordIndex current record index.
     * @param scale used scale.
     */
    private void publishDynamicTexts(final Body body, final String title, final int recordIndex,
            final String scale) {
        DocxUtility.replaceText(body, "{DRAWING.TITLE}", StringUtil.notNull(title));
        
        final String currentDate =
                SimpleDateFormat.getDateInstance(SimpleDateFormat.SHORT,
                    ContextStore.get().getLocale()).format(new java.util.Date());
        DocxUtility.replaceText(body, "{DATE}", currentDate);
        
        DocxUtility.replaceText(body, "{USER}", this.getContext().getUser().getName());
        
        if (scale != null) {
            DocxUtility
                .replaceText(body, "{SCALE}", String.format(this.scaleDisplayPattern, scale));
            int indexing = getStandardScaleIndexing(scale);
            final String[] scaleBarNumbersArray = this.scaleBarNumbers[indexing].split(";");
            indexing = 0;
            for (final String displayedNumber : scaleBarNumbersArray) {
                DocxUtility.replaceText(body, "{N" + indexing + "}", displayedNumber);
                indexing++;
            }
        }
        
        final DataRecord dataRecord = this.retrieveRecord(this.getDwgNames().get(recordIndex));
        if (dataRecord != null) {
            DocxUtility.replaceText(body, "{bl_id}",
                StringUtil.notNull(dataRecord.getValue("rm.bl_id")));
            DocxUtility.replaceText(body, "{fl_id}",
                StringUtil.notNull(dataRecord.getValue("rm.fl_id")));
        }
    }
    
    /**
     * 
     * Publishes drawing into report.
     * 
     * @param document com.aspose.words.Document.
     * @param drawingShap Shape.
     * @param imageResult image result object.
     * @return use scale float.
     */
    private String publishDrawing(final com.aspose.words.Document document,
            final Shape drawingShap, final HighlightedImageResult imageResult) {
        String predefinedScale = this.getReportPropertiesDef().getScale();
        if (imageResult.getDrawingRealDimension().getWidth() == 0.00
                || imageResult.getDrawingRealDimension().getHeight() == 0.00) {
            predefinedScale = Constants.NULL_VALUE;
        }
        
        int useScaleIndexing = -1;
        String publishedScale = null;
        
        final double targetWidth = drawingShap.getWidth() - IMAGE_BORDER;
        final double targetHeight = drawingShap.getHeight() - IMAGE_BORDER;
        final double imageWidth =
                imageResult.getImageDimension().getWidth() * Constants.PIXEL_TO_POINT;
        final double imageHeight =
                imageResult.getImageDimension().getHeight() * Constants.PIXEL_TO_POINT;
        
        final double scalex = targetWidth / imageWidth;
        final double scaley = targetHeight / imageHeight;
        final double factor = Math.min(scalex, scaley);
        final double useWidth = imageWidth * factor;
        final double useHeight = imageHeight * factor;
        
        if (predefinedScale == null) {
            // calculation of published scale
            useScaleIndexing =
                    processImageScaling(targetWidth, targetHeight, useWidth, useHeight, imageResult);
            
        } else if (Constants.NULL_VALUE.equalsIgnoreCase(predefinedScale)) {
            // without consideration of published scale
            DocxUtility.insertImage(document, drawingShap.getFirstParagraph(),
                imageResult.getImage(), useHeight, useWidth);
        } else {
            // directly use predefined published scale
            useScaleIndexing = getStandardScaleIndexing(predefinedScale);
        }
        
        // XXX: recalculate displayed image's height and width by the standard scale
        if (useScaleIndexing != -1) {
            DocxUtility.insertImage(document, drawingShap.getFirstParagraph(),
                imageResult.getImage(), imageResult.getDrawingRealDimension().getHeight()
                        * this.pointConversionFactor / this.scaleFactors[useScaleIndexing],
                imageResult.getDrawingRealDimension().getWidth() * this.pointConversionFactor
                        / this.scaleFactors[useScaleIndexing]);
            
            publishedScale = this.scaleDisplayNames[useScaleIndexing];
        }
        
        return publishedScale;
    }
    
    /**
     * 
     * @param targetWidth target width.
     * @param targetHeight target height.
     * @param useWidth use width.
     * @param useHeight use height.
     * @param imageResult HighlightedImageResult
     * @return useScaleIndexing.
     */
    private int processImageScaling(final double targetWidth, final double targetHeight,
            final double useWidth, final double useHeight, final HighlightedImageResult imageResult) {
        int useScaleIndexing = 0;
        if (useWidth >= useHeight) {
            useScaleIndexing =
                    getStandardScaleIndexing(useWidth, imageResult.getDrawingRealDimension()
                        .getWidth() * this.pointConversionFactor);
        } else {
            useScaleIndexing =
                    getStandardScaleIndexing(useHeight, imageResult.getDrawingRealDimension()
                        .getHeight() * this.pointConversionFactor);
        }
        
        if (imageResult.getDrawingRealDimension().getWidth() * this.pointConversionFactor
                / this.scaleFactors[useScaleIndexing] > targetWidth
                || imageResult.getDrawingRealDimension().getHeight() * this.pointConversionFactor
                        / this.scaleFactors[useScaleIndexing] > targetHeight) {
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
        final double[] calculatedWidths = new double[this.scaleFactors.length];
        int indexing = 0;
        for (final double factor : this.scaleFactors) {
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
     * Gets standard scale indexing by specified string value scale.
     * 
     * @param scale String value scale.
     * @return index int.
     */
    private int getStandardScaleIndexing(final String scale) {
        int indexing = 0;
        for (final String standardScale : this.scaleDisplayNames) {
            if (standardScale.equals(scale)) {
                break;
            }
            indexing++;
        }
        
        return indexing;
    }
    
    /**
     * 
     * Retrieves a data record restricted by drawing name.
     * 
     * @param dwgname - drawing name.
     * @return found DataRecord object.
     */
    private DataRecord retrieveRecord(final String dwgname) {
        DataRecord result = null;
        for (final DataRecord record : this.uniqueFloorsRecords) {
            if (dwgname.equalsIgnoreCase(record.getString("rm.dwgname"))) {
                result = record;
                break;
            }
        }
        return result;
    }
    
    /**
     * Provides data and template preparations before processing each drawing record. {@inheritDoc}
     */
    @Override
    public void beforeBuild(final java.util.List<DataRecord> drawingNameRecords, final Report report) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(RM_TABLE, RM_FIELDS);
        dataSource.setDistinct(true);
        
        this.uniqueFloorsRecords = dataSource.getRecords();
        
        // prepare doc template for multiple pages output
        final com.aspose.words.Document doc = report.getDocument();
        final Section section = doc.getSections().get(0);
        // XXX: make following appends at top
        final Shape legendShap = getTextBoxShape(section.getBody(), Constants.LEGEND_TABLE);
        if (legendShap != null) {
            legendShap.removeAllChildren();
        }
        if (drawingNameRecords != null) {
            for (int recordNum = 1; recordNum < drawingNameRecords.size(); recordNum++) {
                doc.appendChild(section.deepClone());
            }
        }
    }
    
}
