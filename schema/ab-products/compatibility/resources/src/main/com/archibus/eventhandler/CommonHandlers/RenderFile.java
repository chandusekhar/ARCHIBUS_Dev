package com.archibus.eventhandler.CommonHandlers;

import java.text.MessageFormat;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * 
 * Event handler, renders specified view as Excel or PDF file (as InputStream).
 * </p>
 * <p>
 * 
 * Copyright: Copyright (c) 2004
 * </p>
 * <p>
 * 
 * Company: ARCHIBUS, Inc.
 * </p>
 * 
 * @author Valery Tydykov
 * @created May 19, 2006
 * @version 1.0
 */

public class RenderFile extends EventHandlerBase {

    /**
     * Input parameter names.
     */
    final static String CONTENT_TYPE_XPATH_PATTERN = "descendant-or-self::preferences/documentManagement/fileTypes/fileType[@extension=''{0}'']/operations/operation[@type=''showDocument'']/header/@contentType";

    final static String CONTENT_DISPOSITION_XPATH_PATTERN = "descendant-or-self::preferences/documentManagement/fileTypes/fileType[@extension=''{0}'']/operations/operation[@type=''showDocument'']/header/@contentDisposition";

    final static String EXPORT_TO_EXCEL_XSL_FILE_XPATH = "descendant-or-self::preferences/exportToExcel/xsl/@file";

    final static String EXPORT_MDX_TO_EXCEL_XSL_FILE_XPATH = "descendant-or-self::preferences/exportMdxToExcel/xsl/@file";

    final static String PRINTABLE_PDF_XSL_FILE_XPATH = "descendant-or-self::preferences/printablePdf/xsl/@file";

    final static String PARAMETER_FILE_NAME = "fileName";

    final static String PARAMETER_GENERATE_INPUT_STREAM = "AbCommonResources-generateInputStream";

    final static String PARAMETER_CONTENT_TYPE = "contentType";

    final static String PARAMETER_CONTENT_DISPOSITION = "contentDisposition";

    final static String PARAMETER_RENDERED = "rendered";

    final static String PARAMETER_TRUE = "true";

    final static String XLS = "xls";

    final static String PDF = "pdf";

    /**
     * Render specified view as Excel file (as InputStream).
     * 
     * @param context Workflow rule execution context.
     */
    public void renderExcelFile(EventHandlerContext context) {
        final String extension = XLS;
        boolean isPdf = false;

        determineXsltFilePathParameter(context, EXPORT_TO_EXCEL_XSL_FILE_XPATH);

        renderFile(context, extension, isPdf);
    }

    /**
     * Render specified MDX view as Excel file (as InputStream).
     * 
     * @param context Workflow rule execution context.
     */
    public void renderMdxToExcelFile(EventHandlerContext context) {
        final String extension = XLS;
        boolean isPdf = false;

        determineXsltFilePathParameter(context, EXPORT_MDX_TO_EXCEL_XSL_FILE_XPATH);

        renderFile(context, extension, isPdf);
    }

    /**
     * Render specified view as PDF file (as InputStream).
     * 
     * @param context Workflow rule execution context.
     */
    public void renderPdfFile(EventHandlerContext context) {
        final String extension = PDF;
        boolean isPdf = true;

        determineXsltFilePathParameter(context, PRINTABLE_PDF_XSL_FILE_XPATH);

        renderFile(context, extension, isPdf);
    }

    /**
     * Determine xsltFilePath parameter for the GenerateDocument handler. If xsltFilePath [optional]
     * parameter is not supplied, determine xsltFilePath from the preferences.
     * 
     * @param context Workflow rule execution context.
     * @param xsltXpath Xpath of the xsl/file attribute in the parent preferences.
     * @exception ExceptionBase Exception might be thrown by the implementation.
     */
    private void determineXsltFilePathParameter(EventHandlerContext context, String xsltXpath)
            throws ExceptionBase {
        // xsltFilePath is optional parameter
        if (!context.parameterExists(GenerateDocument.PARAMETER_XSLT_FILE_PATH)) {
            // if xsltFilePath parameter is not supplied, determine xsltFilePath from the
            // preferences
            String xsltFilePath = getParentContext(context).getAttribute(xsltXpath);

            context.addResponseParameter(GenerateDocument.PARAMETER_XSLT_FILE_PATH, xsltFilePath);
        }
    }

    /**
     * Render specified view as a file (as InputStream).
     * 
     * @param context Workflow rule execution context.
     * @param extension File extension.
     * @param isPdf Is file to be rendered a PDF file.
     * @exception ExceptionBase Exception might be thrown by the implementation.
     */
    private void renderFile(EventHandlerContext context, String extension, boolean isPdf)
            throws ExceptionBase {
        // Render specified view as a file (as InputStream)
        renderFile(context, isPdf);
        {
            String fileName = null;
            // file name is optional parameter
            if (context.parameterExists(PARAMETER_FILE_NAME)) {
                // if fileName parameter supplied, use it
                fileName = (String) context.getParameter(PARAMETER_FILE_NAME);
            } else {
                // use view title as file name otherwise
                fileName = (String) context.getParameter(GenerateDocument.PARAMETER_TITLE);
                fileName += ".";
                fileName += extension;
            }

            context.addResponseParameter(PARAMETER_FILE_NAME, fileName);
        }

        // ResponseParameter rendered=true tells the core to override the default content type and
        // content disposition
        context.addResponseParameter(PARAMETER_RENDERED, PARAMETER_TRUE);
        {
            // determine contentType from the documentManagement preferences
            String contentType = null;
            {
                final MessageFormat formatter = new MessageFormat(CONTENT_TYPE_XPATH_PATTERN);
                Object[] args = new Object[] { extension };
                final String xpath = formatter.format(args);

                contentType = getParentContext(context).getAttribute(xpath);
            }

            context.addResponseParameter(PARAMETER_CONTENT_TYPE, contentType);
        }
        {
            // determine contentDisposition from the documentManagement preferences
            String contentDisposition = null;
            {
                final MessageFormat formatter = new MessageFormat(CONTENT_DISPOSITION_XPATH_PATTERN);
                Object[] args = new Object[] { extension };
                final String xpath = formatter.format(args);

                contentDisposition = getParentContext(context).getAttribute(xpath);
            }

            context.addResponseParameter(PARAMETER_CONTENT_DISPOSITION, contentDisposition);
        }
    }

    /**
     * Render specified view as a file (as InputStream).
     * 
     * @param context Workflow rule execution context.
     * @param isPdf Is file to be rendered a PDF file.
     */
    private void renderFile(EventHandlerContext context, boolean isPdf) {
        // prepare parameters for GenerateDocument event handler
        context.addResponseParameter(GenerateDocument.PARAMETER_IS_PDF, Boolean.valueOf(isPdf));

        // run generateInputStream rule
        // Writes response parameter 'inputStream' into context.
        runWorkflowRule(context, PARAMETER_GENERATE_INPUT_STREAM, false);
    }
}
