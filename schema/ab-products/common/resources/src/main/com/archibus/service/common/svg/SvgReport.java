package com.archibus.service.common.svg;

import java.io.InputStream;
import java.util.*;

import org.apache.log4j.Logger;
import org.dom4j.Element;

import com.archibus.app.common.drawing.svg.service.domain.HighlightParameters;
import com.archibus.datasource.DataSourceFactory;
import com.archibus.ext.drawing.highlight.*;
import com.archibus.ext.report.ReportUtility;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.utility.*;

/**
 *
 * Provides methods for processing html5-based drawing svg document.
 * <p>
 * Loads requested enterprise-graphics svg file.
 * <p>
 * Processes svg document with specified highlight and label datatSources.
 * <p>
 * Invoked by other WFR.
 *
 * @author shao
 * @since 21.1
 *
 */
public class SvgReport {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /**
     * drawing name like HQ18.
     */
    private final String drawingName;

    /**
     * svgDocument svg document object.
     */
    private final org.dom4j.Document svgDocument;

    /**
     * asset to highlight.
     */
    private String assetToHighlight = "rm";

    /**
     * Hide no highlighted assets.
     */
    private boolean hideNoHighlightedAssets;

    /**
     *
     * Default constructor: initialize svg Document by its inputStream object.
     *
     * @param svgFile svg inputStream object.
     * @param drawingName the drawing name.
     */
    public SvgReport(final String drawingName, final InputStream svgFile) {
        this.svgDocument = ReportUtilities.loadSvg(svgFile);
        this.drawingName = drawingName;
    }

    /**
     *
     * Processes asset's highlighting and labeling.
     *
     * @param highlightParameter HighlightParameters
     * @throws ExceptionBase if SvgReport.processAssets() throws an exception.
     */
    public void processAsset(final HighlightParameters highlightParameter) throws ExceptionBase {
        this.setHideNoHighlightedAssets(highlightParameter.isHideNotHighlightedAssets());

        final com.archibus.datasource.DataSource highlightDataSource =
                DataSourceFactory.loadDataSourceFromFile(highlightParameter.getViewName(),
                    highlightParameter.getHighlightDatasourceId());

        com.archibus.datasource.DataSource labelDataSource = null;
        if (StringUtil.notNullOrEmpty(highlightParameter.getLabelDataSourceId())) {
            labelDataSource = DataSourceFactory.loadDataSourceFromFile(
                highlightParameter.getViewName(), highlightParameter.getLabelDataSourceId());
        }
        if (highlightParameter.getDataSourceParameters() != null) {
            ReportUtility.applyParameters2DataSource(highlightDataSource,
                highlightParameter.getDataSourceParameters());
            if (labelDataSource != null) {
                ReportUtility.applyParameters2DataSource(labelDataSource,
                    highlightParameter.getDataSourceParameters());
            }
        }

        processAsset(highlightDataSource, labelDataSource, highlightParameter.getAssetType(),
            highlightParameter.getLabelHeight(), highlightParameter.getLabelColorName(),
            highlightParameter.getRestriction(), null);
    }

    /**
     * Processes svg drawing by highlighting and labeling the asset.
     *
     *
     * @param highlightDataSource - highlight DataSource object.
     * @param labelDataSource - label DataSource object.
     * @param assetToHighlighted - asset to be highlighted.
     * @param labelHeight - label height display.
     * @param labelColor - label color to display.
     * @param clientHighlightRestriction - String.
     * @param clientLabelingRestriction2 - String.
     *
     * @throws ExceptionBase if highlighting svg throws an exception.
     */
    public void processAsset(final com.archibus.datasource.DataSource highlightDataSource,
            final com.archibus.datasource.DataSource labelDataSource,
            final String assetToHighlighted, final double labelHeight, final String labelColor,
            final String clientHighlightRestriction, final String clientLabelingRestriction2)
                    throws ExceptionBase {

        if (StringUtil.isNullOrEmpty(assetToHighlighted) && highlightDataSource != null) {
            this.setAssetToHighlight(highlightDataSource.getMainTableName());
        } else {
            this.setAssetToHighlight(assetToHighlighted);
        }

        final DrawingHighlightProperties drawingHighlightProperties =
                getDrawingHighlightProperties(highlightDataSource, labelDataSource,
                    clientHighlightRestriction, clientLabelingRestriction2);

        final Element labelsElement =
                (Element) this.svgDocument.selectSingleNode(Constants.LABELS_ELEMENT_XPATH);

        {
            final Element assetsElement = (Element) this.svgDocument.selectSingleNode(
                String.format(Constants.ASSETS_ELEMENT_XPATH, this.assetToHighlight));

            final Map<String, String> colors = drawingHighlightProperties.getColors();

            highlightAssets(assetsElement, colors, labelsElement);
        }

        {
            final Map<String, List<String>> labels = drawingHighlightProperties.getLabels();
            String asset = this.assetToHighlight;
            if (labelDataSource != null) {
                labelDataSource.setContext();
                asset = labelDataSource.getMainTableName();
            }
            LabelUtilities.processLabeling(labelsElement, asset, labels, labelHeight, labelColor);
        }
    }

    /**
     *
     * Gets highlighted assets properties.
     *
     * @param highlightDataSource - highlight DataSource object.
     * @param labelDataSource - label DataSource object.
     * @param clientHLRestriction string.
     * @param clientLabelRestriction string.
     * @return DrawingHighlightProperties - highlighted assets properties.
     */
    private DrawingHighlightProperties getDrawingHighlightProperties(
            final com.archibus.datasource.DataSource highlightDataSource,
            final com.archibus.datasource.DataSource labelDataSource,
            final String clientHLRestriction, final String clientLabelRestriction) {
        final ReportPropertiesDef reportPropertiesDef = ReportUtilities.getReportPropertiesDef();
        reportPropertiesDef.setAssetTables(this.getAssetToHighlight());

        final HighlightImageService highlightImageService =
                new HighlightImageService(reportPropertiesDef);

        return highlightImageService.retrieveDrawingHighlightProperties(this.drawingName,
            highlightDataSource, labelDataSource, true, clientHLRestriction,
            clientLabelRestriction);
    }

    /**
     *
     * Highlights assets with colors.
     *
     * @param assetsElement svg element to present assets.
     * @param colors Map<String, String> - colors from highlight dataSource.
     * @param labelsElement - Element.
     *
     *
     */
    private void highlightAssets(final Element assetsElement, final Map<String, String> colors,
            final Element labelsElement) {
        if (assetsElement == null || (colors.isEmpty() && !this.hideNoHighlightedAssets)) {
            return;
        }

        @SuppressWarnings("unchecked")
        final List<Element> assets = assetsElement.elements();

        for (final Element asset : assets) {
            final String assetId = asset.attributeValue(Constants.ELEMENT_ID);
            final String color = colors.get(assetId);

            if (this.hideNoHighlightedAssets && color == null) {
                // XXX: remove asset element.
                asset.detach();
                // XXX: remove corresponding label element.
                removeAssetLabel(assetId, labelsElement);
            }

            if (color != null) {
                asset.addAttribute(Constants.STYLE, Constants.STYLE_FILL + ':' + color);
            }

            final Boolean highlighted = color != null;
            asset.addAttribute(Constants.HIGHLIGHTED_ASSET, highlighted.toString());
        }
    }

    /**
     *
     * Removes asset's label by specified asset id.
     *
     * @param assetId String like "HQ;17;124"
     * @param labels Element.
     */
    public void removeAssetLabel(final String assetId, final Element labels) {
        if (labels != null) {
            final org.dom4j.Node label = labels.selectSingleNode(
                String.format(Constants.LABEL_ELEMENT_XPATH, this.assetToHighlight, assetId));
            if (label != null) {
                label.detach();
            }
        }
    }

    /**
     * Getter for assetToHighlight.
     *
     * @see assetToHighlight
     * @return property.assetToHighlight
     */
    public String getAssetToHighlight() {
        return this.assetToHighlight;
    }

    /**
     * Setter for assetToHighlight.
     *
     * @see assetToHighlight
     * @param assetToHighlight - String value like "bl"
     */
    public void setAssetToHighlight(final String assetToHighlight) {
        this.assetToHighlight = assetToHighlight;
    }

    /**
     *
     * Gets svg Document.
     *
     * @return svg org.dom4j.Document.
     */
    public org.dom4j.Document getSvgDocument() {
        return this.svgDocument;
    }

    /**
     * Getter for the hideNoHighlightedAssets property.
     *
     * @see hideNoHighlightedAssets
     * @return the hideNoHighlightedAssets property.
     */
    public boolean isHideNoHighlightedAssets() {
        return this.hideNoHighlightedAssets;
    }

    /**
     * Setter for the hideNoHighlightedAssets property.
     *
     * @see hideNoHighlightedAssets
     * @param hideNoHighlightedAssets the hideNoHighlightedAssets to set
     */

    public void setHideNoHighlightedAssets(final boolean hideNoHighlightedAssets) {
        this.hideNoHighlightedAssets = hideNoHighlightedAssets;
    }

    /**
     *
     * Adjusts specified Asset Labels Position.
     *
     * @param labelPosition LabelPosition object.
     */
    public void adjustAssetLabelsPosition(final LabelPosition labelPosition) {
        if (labelPosition != null) {
            LabelUtilities.adjustAssetLabelsPosition(labelPosition, this.svgDocument);
        }
    }
}
