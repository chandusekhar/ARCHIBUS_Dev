package com.archibus.app.common.drawing.svg.service.impl;

import java.util.*;

import com.archibus.app.common.drawing.svg.service.dao.*;
import com.archibus.app.common.drawing.svg.service.domain.HighlightParameters;
import com.archibus.service.common.svg.SvgReport;
import com.archibus.utility.*;

/**
 *
 * Utilities for class DrawingSvgService.
 * <p>
 * Provides methods to retrieve drawing name, read svg file inputStream and extract
 * HighlightParameters.
 *
 * @author shao
 * @since 21.1
 *
 */
public final class ServiceUtilities {
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ServiceUtilities() {
    }

    /**
     *
     * Highlights Svg Drawing.
     *
     * @param pkeyValues Map<String, String>.
     * @param planTypeValue String.
     * @param parameters List<Map<String, String>>.
     * @param highlightParametersDao IHighlightParametersDao.
     * @param drawingDao IDrawingDao.
     * @param siteDao ISiteDao.
     * @return svg xml in string.
     * @throws ExceptionBase if loading svg or highlighting it throws an exception.
     */
    public static String highlightSvgDrawing(final Map<String, String> pkeyValues,
            final String planTypeValue, final List<Map<String, String>> parameters,
            final IHighlightParametersDao highlightParametersDao, final IDrawingDao drawingDao,
            final ISiteDao siteDao) throws ExceptionBase {
        String svgXML = null;
        // TODO: move all to separate class.
        final String drawingName =
                HighlightUtilities.retrieveDrawingName(pkeyValues, siteDao, drawingDao);

        if (StringUtil.notNullOrEmpty(drawingName)) {
            final SvgReport svgReport =
                    new SvgReport(drawingName, HighlightUtilities.readSvgFile(drawingName));
            // TODO: rename HighlightParameters.java
            final List<HighlightParameters> highlightParameters =
                    retrieveHighlightParameters(planTypeValue, parameters, highlightParametersDao);

            svgReport.adjustAssetLabelsPosition(HighlightUtilities
                .extractLabelsPosition(parameters));
            
            for (final HighlightParameters highlightParameter : highlightParameters) {
                svgReport.processAsset(highlightParameter);
            }

            svgXML = svgReport.getSvgDocument().asXML();
        }

        // return processed svg xml
        return svgXML;
    }

    /**
     *
     * Retrieves HighlightParameters from database or specified parameters.
     *
     * @param planType plan type value.
     * @param parameters List<Map<String, String>> highlight parameters.
     * @param highlightParametersDao IHighlightParametersDao.
     *
     * @return list of HighlightParameters.
     */
    private static List<HighlightParameters> retrieveHighlightParameters(final String planType,
            final List<Map<String, String>> parameters,
            final IHighlightParametersDao highlightParametersDao) {
        // TODO: move all to separate class.
        List<HighlightParameters> highlightParameters = new ArrayList<HighlightParameters>();
        
        if (StringUtil.notNullOrEmpty(planType) && !("null".equals(planType))) {
            highlightParameters = highlightParametersDao.getByPlanType(planType);
            // client-side to overwrite some parameters from database
            if (parameters != null) {
                for (int i = 0; i < parameters.size(); i++) {
                    HighlightUtilities.extractOptionalHighlightParameter(
                        highlightParameters.get(i), parameters.get(i));
                }
            }
        } else if (parameters != null) {
            highlightParameters = HighlightUtilities.extractHighlightParameters(parameters);
        }
        
        return highlightParameters;
    }

    /**
     * Loads Svg XML as String.
     *
     * @param fileName string.
     * @return XML in String.
     */
    public static String loadSvg(final String fileName) {
        final SvgReport svgReport =
                new SvgReport(fileName,
                    HighlightUtilities.readSvgFile(fileName,
                        com.archibus.ext.drawing.highlight.HighLightUtilities
                            .getDrawingSourcePath() + '/'));
        return svgReport.getSvgDocument().asXML();
    }

}
