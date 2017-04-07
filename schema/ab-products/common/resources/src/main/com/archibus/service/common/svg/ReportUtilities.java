package com.archibus.service.common.svg;

import java.io.InputStream;
import java.util.*;

import org.apache.commons.io.IOUtils;
import org.dom4j.DocumentException;

import com.archibus.context.ContextStore;
import com.archibus.ext.report.ReportUtility;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Utilities for SvgReport. Provides methods for loading svg.
 *
 * @author shao
 * @since 21.1
 *
 */
public final class ReportUtilities {
    /**
     * Private constructor: utility class is non instantiable.
     */
    private ReportUtilities() {
    }

    /**
     *
     * Loads a svg XML document by its InputStream.
     *
     * @param svgInputStream svg file InputStream.
     * @return svg Document object.
     *
     * @throws ExceptionBase if svg is invalid xml document it throws an exception.
     */
    public static org.dom4j.Document loadSvg(final InputStream svgInputStream) throws ExceptionBase {
        org.dom4j.Document result = null;

        final Map<String, String> nsPrefixes = new HashMap<String, String>();
        nsPrefixes.put("svg", "http://www.w3.org/2000/svg");
        nsPrefixes.put("xlink", "http://www.w3.org/1999/xlink");

        final org.dom4j.DocumentFactory factory = new org.dom4j.DocumentFactory();
        factory.setXPathNamespaceURIs(nsPrefixes);

        final org.dom4j.io.SAXReader reader = new org.dom4j.io.SAXReader();

        reader.setDocumentFactory(factory);
        reader.setValidation(false);

        try {
            result = reader.read(svgInputStream);
        } catch (final DocumentException e) {
            throw new ExceptionBase(Constants.SVG_FILE_LOAD_EXCEPTION_MESSAGE, e);
        } finally {
            IOUtils.closeQuietly(svgInputStream);
        }

        return result;
    }

    /**
     *
     * Gets Report PropertiesDef.
     *
     * @return ReportPropertiesDef object.
     */
    public static ReportPropertiesDef getReportPropertiesDef() {
        return ReportUtility.getReportPropertiesDef(ContextStore.get());
    }

}
