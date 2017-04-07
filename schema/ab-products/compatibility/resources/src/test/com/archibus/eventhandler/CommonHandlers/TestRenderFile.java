package com.archibus.eventhandler.CommonHandlers;

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import junit.framework.TestCase;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;

import com.archibus.db.RecordsPersistenceImpl;
import com.archibus.fixture.ConfigFixture;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.utility.ExceptionBase;
import com.archibus.utility.FileCopy;

/**
 * Tests RenderFile event handler.
 * 
 * @author Valery
 * @created May 19, 2006
 */
public class TestRenderFile extends TestCase {

    /**
     * Helper object providing test-related resource and methods.
     */
    private EventHandlerFixture fixture = null;

    /**
     * JUnit test initialization method.
     * 
     * @exception Exception Description of the Exception
     */
    public void setUp() throws Exception {
        this.fixture = new EventHandlerFixture(this, "rooms.axvw");
        this.fixture.setUp();
        // disable object logging
        ConfigFixture.enableObjectLogging(Level.INFO);
        Logger.getLogger(RecordsPersistenceImpl.class).setLevel(Level.DEBUG);
    }

    /**
     * JUnit clean-up method.
     */
    public void tearDown() {
        this.fixture.tearDown();
    }

    // ----------------------- test methods ------------------------------------

    /**
     * Tests RenderFile event handler.
     * 
     * @exception ExceptionBase Description of the Exception
     */
    public void testRenderExcelFile() throws ExceptionBase {
        Map response = renderFile("rooms.axvw", "ab-excel-fo.xsl", false, 0, 0, "renderExcelFile");
        {
            // verify inputStream

            InputStream inputStream = (InputStream) response.get("inputStream");

            // save InputStream into file
            File file = new File("test-RenderExcelFile.xls");
            FileCopy.copy(FileCopy.copyToByteArray(inputStream), file);
        }
        {
            String rendered = (String) response.get(RenderFile.PARAMETER_RENDERED);
            assertEquals("true", rendered);
        }
        {
            String contentType = (String) response.get(RenderFile.PARAMETER_CONTENT_TYPE);
            assertEquals("application/octet-stream", contentType);
        }
        {
            String contentDisposition = (String) response
                    .get(RenderFile.PARAMETER_CONTENT_DISPOSITION);
            assertEquals("attachment; filename=", contentDisposition);
        }
        {
            String fileName = (String) response.get(RenderFile.PARAMETER_FILE_NAME);
            // TODO: remove code inserting default values from EventHandlerFixture
            // check: fileName should be generated from the view title.
            assertEquals("XXX", fileName);
        }
    }

    public void testRenderMdxToExcelFile() throws ExceptionBase {
        Map response = renderFile("test-mdx-rm-2d.axvw", "ab-mdx-2-excel-fo.xsl", false, 0, 0,
                                  "renderMdxToExcelFile");
        {
            // verify inputStream

            InputStream inputStream = (InputStream) response.get("inputStream");

            // save InputStream into file
            File file = new File("test-RenderMdxToExcelFile.xls");
            FileCopy.copy(FileCopy.copyToByteArray(inputStream), file);
        }
        {
            String rendered = (String) response.get(RenderFile.PARAMETER_RENDERED);
            assertEquals("true", rendered);
        }
        {
            String contentType = (String) response.get(RenderFile.PARAMETER_CONTENT_TYPE);
            assertEquals("application/octet-stream", contentType);
        }
        {
            String contentDisposition = (String) response
                    .get(RenderFile.PARAMETER_CONTENT_DISPOSITION);
            assertEquals("attachment; filename=", contentDisposition);
        }
        {
            String fileName = (String) response.get(RenderFile.PARAMETER_FILE_NAME);
            // TODO: remove code inserting default values from EventHandlerFixture
            // check: fileName should be generated from the view title.
            assertEquals("XXX", fileName);
        }
    }

    /**
     * Tests RenderFile event handler.
     * 
     * @exception ExceptionBase Description of the Exception
     */
    public void testRenderPdfFile() throws ExceptionBase {
        Map response = renderFile("rooms.axvw", "ab-printable-pdf-fo.xsl", true, 0, 0,
                                  "renderPdfFile");
        {
            // verify inputStream

            InputStream inputStream = (InputStream) response.get("inputStream");

            // save InputStream into file
            File file = new File("test-RenderPdfFile.pdf");
            FileCopy.copy(FileCopy.copyToByteArray(inputStream), file);
        }
        {
            String rendered = (String) response.get(RenderFile.PARAMETER_RENDERED);
            assertEquals("true", rendered);
        }
        {
            String contentType = (String) response.get(RenderFile.PARAMETER_CONTENT_TYPE);
            assertEquals("application/pdf", contentType);
        }
        {
            String contentDisposition = (String) response
                    .get(RenderFile.PARAMETER_CONTENT_DISPOSITION);
            assertEquals("inline", contentDisposition);
        }
        {
            String fileName = (String) response.get(RenderFile.PARAMETER_FILE_NAME);
            // TODO: remove code inserting default values from EventHandlerFixture
            // check: fileName should be generated from the view title.
            assertEquals("XXX", fileName);
        }
    }

    /**
     * Description of the Method
     * 
     * @param viewName Description of the Parameter
     * @param xsltFilePath Description of the Parameter
     * @param isPdf Description of the Parameter
     * @param recordLimitPerTgrp Description of the Parameter
     * @param recordLimitPerView Description of the Parameter
     * @param methodName Description of the Parameter
     * @return Description of the Return Value
     */
    private Map renderFile(String viewName, String xsltFilePath, boolean isPdf,
            int recordLimitPerTgrp, int recordLimitPerView, String methodName) {
        Map response = new HashMap();
        Map inputs = new HashMap();
        inputs.put("viewName", viewName);
        inputs.put("xsltFilePath", xsltFilePath);
        inputs.put("isPdf", Boolean.valueOf(isPdf));
        inputs.put("restrictions", new ArrayList());
        inputs.put("recordLimitPerTgrp", Integer.toString(recordLimitPerTgrp));
        inputs.put("recordLimitPerView", Integer.toString(recordLimitPerView));

        this.fixture.runEventHandlerMethod("XXX",
                                           "com.archibus.eventhandler.CommonHandlers.RenderFile",
                                           methodName, inputs, response);

        return response;
    }
}
