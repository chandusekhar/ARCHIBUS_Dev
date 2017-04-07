package com.archibus.app.solution.common.eventhandler.service;

import java.io.IOException;
import java.net.MalformedURLException;

import org.dom4j.Document;
import org.xml.sax.SAXException;

import com.archibus.fixture.IntegrationTestBase;
import com.archibus.fixture.ServletServiceFixture;
import com.archibus.utility.ExceptionBase;
import com.archibus.utility.XmlImpl;
import com.meterware.httpunit.GetMethodWebRequest;
import com.meterware.httpunit.WebRequest;
import com.meterware.httpunit.WebResponse;
import com.meterware.servletunit.ServletRunner;

/**
 * Tests example event handlers.
 * 
 * @author tydykov
 * @created November 1, 2006
 */
public class TestRoomWizard extends IntegrationTestBase {

    /**
     * Helper object providing test-related resource and methods.
     */
    private final ServletServiceFixture fixture = new ServletServiceFixture(this);

    /**
     * JUnit test initialization method.
     * 
     * @exception Exception Description of the Exception
     */
    public void onSetUp() throws Exception {
        super.onSetUp();
        this.fixture.setUp();
    }

    /**
     * JUnit clean-up method.
     */
    public void onTearDown() {
        this.fixture.tearDown();
        super.onTearDown();
    }

    /**
     * A unit test for JUnit
     * 
     * @exception ExceptionBase Description of the Exception
     * @exception IOException Description of the Exception
     * @exception SAXException Description of the Exception
     * @exception MalformedURLException Description of the Exception
     */
    public void testServletAboutConnectorCommand() throws ExceptionBase, SAXException,
            MalformedURLException, IOException {
        // test the servlet
        // load servlet configuration from web.xml
        ServletRunner servletRunner = this.fixture.prepareServletRunnerAttachAppInstance(this
            .getClass(), "web1.xml");

        WebRequest request = new GetMethodWebRequest(
            "http://JUNK/rwconnector?command=about_connector");

        // black-box servlet testing - invoke servlet using servlet container simulator
        WebResponse response = servletRunner.getResponse(request);

        assertNotNull("No response received", response);
        assertEquals("content type", "text/xml", response.getContentType());
        assertEquals("character set", "ISO-8859-1", response.getCharacterSet());
        assertEquals(200, response.getResponseCode());

        System.out.println(response.getText());

        Document document = null;
        {
            XmlImpl xml = new XmlImpl();
            xml.loadString(response.getText(), false, null);
            document = xml.getDocument();
        }

        TestRoomWizardHelper.verifyConnectorNode(document.getRootElement());
        TestRoomWizardHelper.verifyResultNodeBegin(document.getRootElement());
        TestRoomWizardHelper.verifyResultNodeFinish(document.getRootElement());
    }
}
