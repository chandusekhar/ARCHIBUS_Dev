package com.archibus.service.common.svg;

import java.util.*;

import org.dom4j.Element;

import com.archibus.utility.StringUtil;

/**
 *
 * Utilities for SvgReport. Provides methods for handling label texts.
 *
 * @author shao
 * @since 21.1
 *
 */
final class LabelUtilities {
    /**
     * Private constructor: utility class is non instantiable.
     */
    private LabelUtilities() {
    }

    /**
     *
     * Processes labeling by adding specified labels to specified assets and removing the rest
     * published asset labels.
     *
     * @param labelsRootElement svg element to present all asset labels.
     * @param assetToHighlight - asset to be highlighted.
     * @param labels - Map<String, String[]>.
     * @param labelHeight - label height display.
     * @param labelColor - label color to display.
     */
    public static void processLabeling(final Element labelsRootElement,
            final String assetToHighlight, final Map<String, List<String>> labels,
            final double labelHeight, final String labelColor) {
        if (labelsRootElement == null) {
            return;
        }

        final List<Element> labelsElements = labelsRootElement.elements();

        for (final Element labelsElement : labelsElements) {
            labelsElement.addAttribute(Constants.STYLE, "");
            final String id = labelsElement.attributeValue(Constants.ELEMENT_ID);
            if ((assetToHighlight + "-labels").equals(id)) {
                // Labeling assets by specified label dataSource records
                labelAssets(labelsElement, assetToHighlight, labels, labelHeight, labelColor);
            } else {
                labelsElement.addAttribute(Constants.STYLE, "display: none;");
            }
        }

    }

    /**
     *
     * Labels assets based on label dataSource records and configurable properties.
     *
     * @param labelsElement svg element to present specified labels.
     * @param assetToHighlight - asset to be highlighted.
     * @param labels - Map<String, String[]>.
     * @param labelHeight - label height display.
     * @param labelColor - label color to display.
     */
    private static void labelAssets(final Element labelsElement, final String assetToHighlight,
            final Map<String, List<String>> labels, final double labelHeight,
            final String labelColor) {
        if (labels.isEmpty()) {
            return;
        }

        labelsElement.addAttribute("text-anchor", "middle");

        final String labelIdPrefix = String.format(Constants.LABEL_ID_PREFIX, assetToHighlight);

        final List<Element> labelsElements = labelsElement.elements();
        for (final Element labelElement : labelsElements) {
            final String labelId = labelElement.attributeValue(Constants.ELEMENT_ID)
                .substring(labelIdPrefix.length());

            final List<String> texts = labels.get(labelId);
            if (texts != null) {
                labelElement.remove(labelElement.element(Constants.TEXT_ELEMENT_NAME));
                writeTexts(labelElement, texts, labelHeight, labelColor);
            }
        }
    }

    /**
     *
     * Writes Texts into specified element.
     *
     * @param labelElement - specified label element.
     * @param texts List<String> - specified texts.
     * @param labelHeight - label height display.
     * @param labelColor - label color to display.
     */
    static void writeTexts(final Element labelElement, final List<String> texts,
            final double labelHeight, final String labelColor) {
        double verticalCoordinate = -(texts.size() - 1) / 2.0;

        for (final String text : texts) {
            final Element textEle = labelElement.addElement(Constants.TEXT_ELEMENT_NAME);

            if (StringUtil.notNullOrEmpty(labelColor)) {
                textEle.addAttribute(Constants.STYLE_FILL, labelColor);
            }

            if (labelHeight > 0.00) {
                textEle.addAttribute(Constants.STYLE_FONT_SIZE,
                    labelHeight + Constants.TEXT_ELEMENT_FONT_SIZE_UNIT);
            }

            textEle.addAttribute(Constants.TEXT_ELEMENT_VERTICAL_COORDINATE,
                verticalCoordinate + Constants.TEXT_ELEMENT_FONT_SIZE_UNIT);

            verticalCoordinate += 1;

            textEle.addText(text);
        }

        final Boolean highlighted = !texts.isEmpty();
        labelElement.addAttribute(Constants.HIGHLIGHTED_ASSET, highlighted.toString());
    }

    /**
     *
     * Adjusts Asset Labels Position.
     *
     * @param labelPosition LabelPosition object.
     * @param svgDocument org.dom4j.Document .
     */
    static void adjustAssetLabelsPosition(final LabelPosition labelPosition,
            final org.dom4j.Document svgDocument) {
        final Element labelsElement = (Element) svgDocument.selectSingleNode(
            String.format(Constants.ASSSET_LABELS_ELEMENT_XPATH, labelPosition.getAssetType()));

        if (labelsElement != null) {
            final List<Element> labels = labelsElement.elements();
            for (final Element label : labels) {
                final String tansfromAttributeValue =
                        label.attributeValue(Constants.ATTRIBUTE_TRANSFORM);
                final char firstCharTranslateY =
                        tansfromAttributeValue.split(Constants.COMMA_SEPARATOR)[1].charAt(0);

                final StringBuffer prefixTranslateY = new StringBuffer();

                if (firstCharTranslateY == '-') {
                    prefixTranslateY.append('-');
                }

                final String labelElementId = label.attributeValue(Constants.ELEMENT_ID);

                final String assetId =
                        labelElementId.substring(1 + 1 + 1 + labelPosition.getAssetType().length());

                final Element assetElement = (Element) svgDocument
                    .selectSingleNode(String.format("//svg:use[@id='%s']", assetId));

                if (assetElement != null) {
                    label.addAttribute(Constants.ATTRIBUTE_TEXT_ANCHOR,
                        labelPosition.getHorizontalAlignment());

                    final double xValue = Double.parseDouble(assetElement.attributeValue("x"))
                            + labelPosition.getOffset();
                    final double yValue =
                            Math.abs(Double.parseDouble(assetElement.attributeValue("y")));
                    label.addAttribute(Constants.ATTRIBUTE_TRANSFORM,
                        "translate(" + xValue + ',' + prefixTranslateY.toString() + yValue + ')');

                }
            }
        }
    }
}
