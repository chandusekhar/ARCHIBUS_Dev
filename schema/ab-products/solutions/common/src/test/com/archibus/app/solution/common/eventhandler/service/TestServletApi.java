package com.archibus.app.solution.common.eventhandler.service;

import java.io.IOException;
import java.util.*;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import org.xml.sax.SAXException;

import com.archibus.config.ContextCacheable;
import com.archibus.fixture.*;
import com.archibus.jobmanager.EventHandlerContextImpl;
import com.archibus.utility.ExceptionBase;
import com.meterware.httpunit.*;
import com.meterware.servletunit.*;

/**
 * Description of the Class
 * 
 * @author Valery
 * @created November 7, 2006
 */
public class TestServletApi extends IntegrationTestBase {

    /**
     * Helper object providing test-related resource and methods.
     */
    private final ServletServiceFixture fixture = new ServletServiceFixture(this);

    /**
     * JUnit test initialization method.
     * 
     * @exception Exception Description of the Exception
     */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        this.fixture.setUp();
    }

    /**
     * JUnit clean-up method.
     */
    @Override
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
     * @exception ServletException Description of the Exception
     */
    public void testBypassServlet() throws ExceptionBase, IOException, SAXException,
            ServletException {
        // prepare HttpServletRequest/HttpServletResponse programmatically
        HttpServletRequest servletRequest = null;
        HttpServletResponse servletResponse = null;
        {
            // simulate servlet container
            // load web.xml configuration file
            ServletRunner servletRunner = ServletServiceFixture.prepareServletRunner(this
                .getClass(), "web1.xml");

            ServletUnitClient sc = servletRunner.newClient();

            // assemble request
            WebRequest request = new GetMethodWebRequest("http://JUNK/");
            request.setParameter("room_id", "101");
            request.setParameter("start_date", "20011121");
            request.setParameter("start_time", "092345");
            request.setParameter("end_date", "20021231");
            request.setParameter("end_time", "112356");

            InvocationContext ic = sc.newInvocation(request);
            servletRequest = ic.getRequest();
            servletResponse = ic.getResponse();
        }

        EventHandlerContextImpl context = null;
        {
            ContextCacheable.Immutable targetContext = this.fixture.currentLoginFixture
                .getProject().findRootContext();
            // this map will contain all input parameters for the workflow rule
            Map inputs = new HashMap();

            // add target context to the map
            inputs.put("context", targetContext);
            inputs.put("request", servletRequest);
            inputs.put("response", servletResponse);

            // create EventHandlerContext instance
            context = new EventHandlerContextImpl(inputs, null);
            context.setBackingXmlContext(targetContext);
        }

        // TODO: now you can test a method which requires HttpServletRequest/HttpServletResponse
        // parameters
    }
}
