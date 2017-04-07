package com.archibus.eventhandler.CommonHandlers;

import java.io.InputStream;
import java.util.Iterator;
import java.util.List;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import com.archibus.config.ContextCacheable;
import com.archibus.config.RecordLimits;
import com.archibus.db.RestrictionBase;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * 
 * Event handler, which generates document as InputStream using view as a data source
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
 * @created January 18, 2005
 * @version 1.0
 */

public class GenerateDocument extends EventHandlerBase {

    /**
     * Input parameter names.
     */
    public final static String PARAMETER_FILE_NAME = "fileName";

    /**
     * Input parameter names.
     */
    public final static String PARAMETER_VIEW_NAME = "viewName";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_IS_PDF = "isPdf";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_XSLT_FILE_PATH = "xsltFilePath";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_RESTRICTIONS = "restrictions";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_INPUT_STREAM = "inputStream";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_RECORD_LIMIT_PER_TGRP = "recordLimitPerTgrp";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_RECORD_LIMIT_PER_VIEW = "recordLimitPerView";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_DESCRIPTION = "description";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_XML = "xml";

    /**
     * Description of the Field
     */
    public final static String PARAMETER_TITLE = "title";

    /**
     * Generate DOM XML, using supplied view as data source.
     * 
     * @param context Workflow rule execution context.
     * @exception ExceptionBase If viewName parameter is not supplied, or if generating DOM XML
     *                fails.
     */
    public void generateXml(EventHandlerContext context) throws ExceptionBase {
        final String viewName = (String) context.getParameter(PARAMETER_VIEW_NAME);

        prepareRecordLimits(context);

        Document xml = generateViewXml(context, viewName, prepareAction(context));
        context.addResponseParameter(PARAMETER_XML, xml);
    }

    /**
     * Loads specified view, generates XML, applies XSL, returns generated content as InputStream.
     * 
     * @param context Workflow rule execution context.
     * @exception ExceptionBase If viewName parameter is not supplied, or if generating DOM XML
     *                fails.
     */
    public void generateInputStream(EventHandlerContext context) throws ExceptionBase {
        final String viewName = (String) context.getParameter(PARAMETER_VIEW_NAME);

        if (this.log.isDebugEnabled()) {
            this.log.debug("viewName=[" + viewName + "]");
        }

        // override per-view record limits if optional input parameters are available
        prepareRecordLimits(context);

        // load view, generate XML
        Document xml = generateViewXml(context, viewName, prepareAction(context));
        context.addResponseParameter(PARAMETER_XML, xml);

        Element elementTitle = null;
        if (xml != null) {
            elementTitle = (Element) xml.selectSingleNode("//title");
        }

        // description is an optional parameter
        if (context.parameterExists(PARAMETER_DESCRIPTION)) {
            // if description parameter supplied
            // modify XML: set descritpion as view title
            String description = (String) context.getParameter(PARAMETER_DESCRIPTION);
            if (elementTitle != null) {
                elementTitle.setText(description);
            }
        }

        // extract view title, return as response parameter
        if (elementTitle != null) {
            String title = elementTitle.getText();
            context.addResponseParameter(PARAMETER_TITLE, title);
        }
        {
            // apply XSL and XSL-FO to transform XML

            String xsltFilePath = prepareXsltFilePath(context, viewName);
            Boolean isPdf = (Boolean) context.getParameter(PARAMETER_IS_PDF);

            InputStream result = applyViewXsl(context, viewName, xml, xsltFilePath, isPdf
                    .booleanValue());
            context.addResponseParameter(PARAMETER_INPUT_STREAM, result);
        }
    }

    /**
     * Opens specified file, returns file content as InputStream.
     * 
     * @param context Workflow rule execution context.
     * @exception ExceptionBase If fileName parameter is not supplied.
     */
    public void inputStreamFromFile(EventHandlerContext context) throws ExceptionBase {
        final String fileName = (String) context.getParameter(PARAMETER_FILE_NAME);

        if (this.log.isDebugEnabled()) {
            this.log.debug("fileName=[" + fileName + "]");
        }

        // open specified file
        InputStream inputStream = this.getClass().getResourceAsStream(fileName);
        context.addResponseParameter(PARAMETER_INPUT_STREAM, inputStream);
    }

    /**
     * Prepares context parameters for record limits. If "recordLimitPerTgrp" or
     * "recordLimitPerView" parameters are passed in from the caller, adds them to the context using
     * preference XPath keys obtained from RecordLimts helper class.
     * 
     * @param context Workflow rule execution context.
     */
    private void prepareRecordLimits(EventHandlerContext context) {
        if (context.parameterExists(PARAMETER_RECORD_LIMIT_PER_TGRP)) {
            String key = RecordLimits
                    .getRecordLimitKey(context, RecordLimits.RECORD_LIMIT_PER_TGRP);
            context
                    .addResponseParameter(key, context
                            .getParameter(PARAMETER_RECORD_LIMIT_PER_TGRP));
        }

        if (context.parameterExists(PARAMETER_RECORD_LIMIT_PER_VIEW)) {
            String key = RecordLimits
                    .getRecordLimitKey(context, RecordLimits.RECORD_LIMIT_PER_VIEW);
            context
                    .addResponseParameter(key, context
                            .getParameter(PARAMETER_RECORD_LIMIT_PER_VIEW));
        }
    }

    /**
     * Determines XSLT file path, using context parameter and view preferences.
     * 
     * @param context Workflow rule execution context.
     * @param viewName View name.
     * @return File path.
     * @exception ExceptionBase Exception might be thrown by the implementation.
     */
    private String prepareXsltFilePath(EventHandlerContext context, String viewName)
            throws ExceptionBase {
        String xsltFilePath = null;

        // xsltFilePath is an optional parameter
        if (context.parameterExists(PARAMETER_XSLT_FILE_PATH)) {
            // if xsltFilePath parameter supplied, use it
            xsltFilePath = (String) context.getParameter(PARAMETER_XSLT_FILE_PATH);
        } else {
            // use view preferences otherwise
            xsltFilePath = determineXsltFilePath(context, viewName);
        }

        if (this.log.isDebugEnabled()) {
            this.log.debug("xsltFilePath=[" + xsltFilePath + "]");
        }

        return xsltFilePath;
    }

    /**
     * If restrictions parameter supplied, creates an action, adds restrictions to the action.
     * 
     * @param context Workflow rule execution context.
     * @return Created action with restrictions.
     * @exception ExceptionBase Exception might be thrown by the implementation.
     */
    private Element prepareAction(EventHandlerContext context) throws ExceptionBase {
        Element action = DocumentHelper.createElement("afmAction");

        // add restrictions to the action
        if (context.parameterExists(PARAMETER_RESTRICTIONS)) {

            List restrictions = (List) context.getParameter(PARAMETER_RESTRICTIONS);
            if (this.log.isDebugEnabled()) {
                this.log.debug("restrictions=[" + restrictions + "]");
            }

            ContextCacheable.Immutable contextParent = getParentContext(context);

            Element restrictionsNode = action.addElement("restrictions");
            // for each restriction
            for (Iterator it = restrictions.iterator(); it.hasNext();) {
                final Element restrictionNode = restrictionsNode.addElement("restriction");

                RestrictionBase.Immutable restriction = (RestrictionBase.Immutable) it.next();
                // add restriction to the action
                restriction.save(restrictionNode, contextParent, null);
            }
        }

        return action;
    }
}
