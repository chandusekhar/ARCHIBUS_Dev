package com.archibus.app.common.drawing.svg.service.impl;

import java.io.*;
import java.net.URL;
import java.text.ParseException;
import java.util.*;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;

import com.archibus.app.common.drawing.svg.service.dao.*;
import com.archibus.app.common.drawing.svg.service.domain.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.service.common.svg.LabelPosition;
import com.archibus.utility.*;

/**
 *
 * Provides helper for DrawingSvgService.
 *
 * @author Yong Shao
 * @since 22.1
 *
 */
public final class HighlightUtilities {
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private HighlightUtilities() {
    }

    /**
     *
     * Retrieves drawing name by primary key values.
     *
     * @param pkeyValues Map<String, String> like {bl_id:HQ, fl_id:18} to get corresponding drawing
     *            name;
     *
     * @param siteDao Site Dao.
     * @param drawingDao Drawing Dao.
     * @return String found drawing name.
     */
    public static String retrieveDrawingName(final Map<String, String> pkeyValues,
            final ISiteDao siteDao, final IDrawingDao drawingDao) {
        String drawName = null;

        if (pkeyValues.get(Constants.SITE_ID) == null) {
            // XXX: from afm_dwgs table for building floor plan drawing
            final Drawing drawing = drawingDao
                .getBySpaceHierarchyValues(pkeyValues.get(Constants.BUILDING_ID).toString() + ';'
                        + pkeyValues.get(Constants.FLOOR_ID).toString());
            if (drawing != null) {
                drawName = drawing.getDrawingName();
            }
        } else {
            // XXX: from site table for site drawing???
            drawName = siteDao.getBySiteId(pkeyValues.get(Constants.SITE_ID).toString())
                .getDetailDrawingName();
        }

        return drawName;
    }

    /**
     *
     * Reads svg file by its drawing name.
     *
     * @param drawingName String drawing name like hq18.
     * @return svg InputStream object.
     *
     * @throws ExceptionBase if cannot get inputStream it throws ExceptionBase.
     */
    public static InputStream readSvgFile(final String drawingName) throws ExceptionBase {
        final String filePath =
                com.archibus.ext.drawing.highlight.HighLightUtilities.getDrawingSourcePath() + '/';

        return readSvgFile(drawingName + Constants.SVG_FILE_EXTENSION, filePath);
    }

    /**
     *
     * Reads svg file by its drawing name with path.
     *
     * @param fileName String drawing name like hq18.svg.
     * @param filePath file path.
     * @return svg InputStream object.
     *
     * @throws ExceptionBase if cannot get inputStream it throws ExceptionBase.
     */
    public static InputStream readSvgFile(final String fileName, final String filePath)
            throws ExceptionBase {
        InputStream result = null;

        final String fileFullName = filePath + fileName.toLowerCase();
        try {
            final URL url = new URL(fileFullName);
            result = url.openStream();
        } catch (final IOException e) {
            throw new ExceptionBase(
                String.format(Constants.SVG_FILE_READ_EXCEPTION_MESSAGE, fileName), e, true);
        }
        return result;
    }

    /**
     *
     * Checks if a svg file exits.
     *
     * @param drawingName drawing name.
     * @return boolean.
     */
    public static boolean exist(final String drawingName) {
        boolean exist = false;
        InputStream result = null;
        try {
            result = readSvgFile(drawingName);
            exist = true;
        } catch (final ExceptionBase e) {
            exist = false;
        } finally {
            IOUtils.closeQuietly(result);
        }
        return exist;
    }

    /**
     *
     * Extracts HighlightParameters from specified parameters.
     *
     * @param parameters List<Map<String, String>> list of name-value paired parameters.
     * @return list of HighlightParameters.
     */
    public static List<HighlightParameters> extractHighlightParameters(
            final List<Map<String, String>> parameters) {
        final List<HighlightParameters> result = new ArrayList<HighlightParameters>();

        for (final Map<String, String> parameter : parameters) {
            final HighlightParameters highlightParameter = new HighlightParameters();
            extractRequiredHighlightParameter(highlightParameter, parameter);
            extractOptionalHighlightParameter(highlightParameter, parameter);
            result.add(highlightParameter);
        }

        return result;
    }

    /**
     *
     * Extracts Required HighlightParameter.
     *
     * @param highlightParameter HighlightParameters.
     * @param parameter Map<String, String>.
     */
    public static void extractRequiredHighlightParameter(
            final HighlightParameters highlightParameter, final Map<String, String> parameter) {
        highlightParameter.setViewName(parameter.get(Constants.PARAMETER_VIEW_NAME));
        highlightParameter
            .setHighlightDatasourceId(parameter.get(Constants.PARAMETER_HIGHLIGHT_DATASOURCE_ID));

        highlightParameter
            .setLabelDataSourceId(parameter.get(Constants.PARAMETER_LABEL_DATASOURCE_ID));

        highlightParameter.setAssetType(parameter.get(Constants.ASSET_TYPE));

        highlightParameter.setLabelColorName(parameter.get(Constants.PARAMETER_LABEL_COLOR_NAME));
    }

    /**
     *
     * Extracts Optional HighlightParameter.
     *
     * @param highlightParameter HighlightParameters.
     * @param parameter Map<String, String>.
     */
    public static void extractOptionalHighlightParameter(
            final HighlightParameters highlightParameter, final Map<String, String> parameter) {
        if (parameter.get(Constants.PARAMETER_LABEL_HEIGHT) != null) {
            highlightParameter.setLabelHeight(Double
                .valueOf(StringUtil.notNull(parameter.get(Constants.PARAMETER_LABEL_HEIGHT))));
        }
        if (parameter.get(Constants.PARAMETER_HIDE_HIGHLIGHT) != null) {
            highlightParameter.setHideNotHighlightedAssets(
                StringUtil.toBoolean(parameter.get(Constants.PARAMETER_HIDE_HIGHLIGHT)));
        }

        if (parameter.get(Constants.HIGHLIGHT_REST) != null) {
            highlightParameter
                .setRestriction(StringUtil.notNull(parameter.get(Constants.HIGHLIGHT_REST)));
        }

        if (parameter.get(Constants.HIGHLIGHT_PARAM) != null) {
            try {
                final Map<String, Object> parametersObj = EventHandlerBase
                    .fromJSONObject(new JSONObject(parameter.get(Constants.HIGHLIGHT_PARAM)));
                highlightParameter.setDataSourceParameters(parametersObj);
            } catch (final ParseException e) {
                throw new ExceptionBase();
            }
        }
    }

    /**
     *
     * Extracts label position settings from parameters.
     *
     * @param parameters List<Map<String, String>>.
     * @return LabelPosition.
     */
    public static LabelPosition extractLabelsPosition(final List<Map<String, String>> parameters) {
        LabelPosition labelPosition = null;
        if (parameters != null && !parameters.isEmpty()) {
            final String labelsPosition =
                    parameters.get(0).get(Constants.PARAMETER_LABELS_POSITION);
            if (StringUtil.notNullOrEmpty(labelsPosition)) {
                labelPosition = new LabelPosition();
                final String[] positions =
                        labelsPosition.split(Constants.PARAMETER_VALUE_SEPARATOR);
                labelPosition.setAssetType(positions[0]);
                labelPosition.setOffset(Double.parseDouble(positions[1]));
            }
        }

        return labelPosition;
    }
}
