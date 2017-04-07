package com.archibus.eventhandler.CommonHandlers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import junit.framework.TestCase;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.dom4j.Document;

import com.archibus.db.RecordsPersistenceImpl;
import com.archibus.fixture.ConfigFixture;
import com.archibus.fixture.EventHandlerFixture;

/**
 * Tests GenerateDocument event handler.
 */
public class TestGenerateDocument extends TestCase {

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
        this.fixture = new EventHandlerFixture(this, "ab-ex-echo.axvw");
        this.fixture.setUp();
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

    public void testGenerateDocument() throws Exception {
        generateDocument("ab-ex-furniture-report.axvw", false, 100, 1000);
        generateDocument("ab-ex-furniture-report.axvw", false, 0, 5000);
        generateDocument("ab-ex-furniture-report.axvw", false, 0, 10000);
    }

    private Document generateDocument(String viewName, boolean isPdf, int recordLimitPerTgrp,
            int recordLimitPerView) {
        Map response = new HashMap();
        Map inputs = new HashMap();
        inputs.put("viewName", viewName);
        inputs.put("xsltFilePath", "default.xsl");
        inputs.put("isPdf", Boolean.valueOf(isPdf));
        inputs.put("restrictions", new ArrayList());
        inputs.put("recordLimitPerTgrp", Integer.toString(recordLimitPerTgrp));
        inputs.put("recordLimitPerView", Integer.toString(recordLimitPerView));

        this.fixture
                .runEventHandlerMethod("AbCommonResources",
                                       "com.archibus.eventhandler.CommonHandlers.GenerateDocument",
                                       "generateInputStream", inputs, response);

        Document xml = (Document) response.get("xml");
        return xml;
    }
}
