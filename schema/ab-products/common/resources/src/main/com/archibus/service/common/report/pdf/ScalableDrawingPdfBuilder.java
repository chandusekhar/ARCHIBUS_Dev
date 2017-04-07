package com.archibus.service.common.report.pdf;

import java.util.ArrayList;

import com.archibus.context.Context;
import com.archibus.datasource.DataSource;
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
 * Used by a report axvw file by specifying it as a handler in view's
 * <panel type="drawing" handler="com.archibus.service.common.report.ScalableDrawingPdfBuilder">
 * element.
 *
 * @author Yong Shao
 * @since 21.2
 *       
 */
public class ScalableDrawingPdfBuilder
        extends com.archibus.ext.report.docx.drawinghighlight.DrawingPanelBuilder {
    /**
     * displayInfo.
     */
    private final transient java.util.List<DisplayInfo> displayInfos;

    /**
     * templateSection.
     */
    private Section templateSection;
    
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
        this.displayInfos = new ArrayList<DisplayInfo>();
    }

    /**
     * Overwrites processDrawingHighlightOutput() to call custom processReport(). {@inheritDoc}
     */
    @Override
    public void processDrawingHighlight(final int leftIndent, final String drawingName,
            final String drawingTitle, final HighlightedImageResult imageResult)
                    throws ExceptionBase {
        if (StringUtil.isNullOrEmpty(drawingName) || this.getDrawingProperties(drawingName) == null
                || StringUtil.notNullOrEmpty(imageResult.getErrorMessage())) {
            this.getDwgNames().remove(this.getDwgNames().size() - 1);
            return;
        }
        final String unitName =
                this.getDrawingProperties(drawingName).getUnits().name().toLowerCase();
        final DisplayInfo displayInfo = new DisplayInfo();
        
        if (Constants.METRIC.equalsIgnoreCase(unitName)) {
            final String baseUnitName =
                    this.getDrawingProperties(drawingName).getBaseUnits().name();

            displayInfo.getScaleInfo().init(unitName, baseUnitName);
        }
        displayInfo.setDrawingIndex(this.getDwgNames().size() - 1);

        displayInfo.getDrawingInfo().setImage(imageResult);
        displayInfo.getDrawingInfo().setName(drawingName);
        displayInfo.getDrawingInfo().setTitle(drawingTitle);
        displayInfo.getDrawingInfo().setRotation(
            this.getDrawingProperties(drawingName).getReportParameters().getGeoRotation());

        final com.aspose.words.Document doc = this.getReport().getDocument();

        if (displayInfo.getDrawingIndex() > 0) {
            addTemplateSection(doc);
        }
        
        final Body body = doc.getSections().get(displayInfo.getDrawingIndex()).getBody();
        displayInfo.setDocument(doc);
        displayInfo.setBody(body);
        
        final Shape drawingShap = getTextBoxShape(body, "DRAWINGIMAGE");
        displayInfo.setDrawingShap(drawingShap);
        final Shape arrowShape = getTextBoxShape(displayInfo.getBody(), "NORTH");
        displayInfo.setArrowShape(arrowShape);
        
        displayInfo.setUserName(this.getContext().getUser().getName());
        
        final String predefinedScale = this.getReportPropertiesDef().getScale();
        displayInfo.setPredefinedScale(predefinedScale);
        
        displayInfo.setZoomedImageInfo(this.getReportPropertiesDef().getZoomedImageInfo());
        
        if (Constants.SCALE_PREDEFINED_CONSISTENT.equalsIgnoreCase(predefinedScale)) {
            this.displayInfos.add(displayInfo);
        } else {
            DisplayUtilities.display(displayInfo);
        }
        
    }
    
    /**
     *
     * Adds TemplateSection to Document.
     *
     * @param doc com.aspose.words.Document.
     */
    private void addTemplateSection(final com.aspose.words.Document doc) {
        try {
            doc.appendChild(this.templateSection.deepClone());
            // CHECKSTYLE:OFF
            // new aspose.words - throw exception?
        } catch (final Exception e) {
            throw new ExceptionBase(e.getLocalizedMessage());
        }
    }
    
    @Override
    public void processLegend(final PanelBuilderBase legendPBuilder, final Report report,
            final java.util.List<DataSourceParameter> parameters, final int leftIndent,
            final int level) throws ExceptionBase {
        final com.aspose.words.Document doc = this.getReport().getDocument();
        
        final int recordIndex = this.getDwgNames().size() - 1;
        final Section section = doc.getSections().get(recordIndex);
        if (section == null) {
            return;
        }
        final Body body = section.getBody();
        final Shape legendShap = getTextBoxShape(body, Constants.LEGEND_TABLE);
        if (legendShap != null) {
            final Table table = new Table(doc);
            legendShap.appendChild(table);

            final TablePanelBuilderBase builder = (TablePanelBuilderBase) legendPBuilder;

            final DisplayStyles displayStyles = builder.getStyles();
            displayStyles.setParentDataStyle(null);
            displayStyles.setParentHeadingStyle(null);
            displayStyles.setHeadingStyle("legendHeading");
            displayStyles.setDataStyle("legendData");
            displayStyles.setTotalHeadingStyle("legendTotalHeading");
            displayStyles.setTotalDataStyle("legendTotalData");

            displayStyles.setEndTableWithPageBreak(false);

            // set up legend's docx table object
            builder.setDocxTable(table, doc);
            
            builder.build(report, parameters, leftIndent, level);
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
     *         @SuppressWarnings("unchecked"): Aspose API getChildNodes()
     */
    @SuppressWarnings("unchecked")
    private Shape getTextBoxShape(final Body body, final String alternativeText) {
        Shape result = null;
        final NodeCollection<Shape> shapes = body.getChildNodes(NodeType.SHAPE, true);
        for (final Shape shape : shapes) {
            if (alternativeText.equals(shape.getAlternativeText().trim())) {
                result = shape;
                break;
            }
        }
        return result;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void beforeBuild(final java.util.List<DataRecord> drawingNameRecords,
            final Report report) {
        try {
            // prepare doc template for multiple pages output
            final com.aspose.words.Document doc = report.getDocument();
            final Section section = doc.getSections().get(0);

            // XXX: make following appends at top
            final Shape legendShap = getTextBoxShape(section.getBody(), Constants.LEGEND_TABLE);
            if (legendShap != null) {
                legendShap.removeAllChildren();
            }
            this.templateSection = section.deepClone();
            
            // CHECKSTYLE:OFF
            // new aspose.words - throw exception?
        } catch (final Exception e) {
            throw new ExceptionBase();
        }

    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void afterRecords(final java.util.List<DataSourceParameter> dataSourceParameters,
            final int level) {
        this.getReportPropertiesDef().setZoomedImageInfo(null);

        int largetsIndexImperial = -1;
        int largetsIndexMetric = -1;
        // get largest scale indexing (smallest scale)
        for (final DisplayInfo displayInfo : this.displayInfos) {
            final int index = displayInfo.getScaleIndexing(null);
            if (Constants.METRIC.equalsIgnoreCase(displayInfo.getScaleInfo().getUnit())) {
                if (index > largetsIndexMetric) {
                    largetsIndexMetric = index;
                }
            } else {
                if (index > largetsIndexImperial) {
                    largetsIndexImperial = index;
                }
            }
            
        }
        // use the smallest scale to display all drawings in Pdf
        for (final DisplayInfo displayInfo : this.displayInfos) {
            if (Constants.IMPERIAL.equalsIgnoreCase(displayInfo.getScaleInfo().getUnit())) {
                displayInfo.setActualScaleIndexing(largetsIndexImperial);
            } else {
                displayInfo.setActualScaleIndexing(largetsIndexMetric);
            }
            DisplayUtilities.display(displayInfo);

        }
    }

}
