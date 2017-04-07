package com.archibus.app.solution.common.eventhandler.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.Hashtable;

import javax.servlet.ServletException;

import org.xml.sax.SAXException;

import com.archibus.app.solution.common.eventhandler.service.WorkflowRuleServiceServlet;
import com.archibus.fixture.*;
import com.archibus.utility.ExceptionBase;

/**
 * Description of the Class
 * 
 * @author Valery
 * @created November 7, 2006
 */
public class TestWorkflowRuleServiceServlet extends IntegrationTestBase {
    private ServletServiceFixture fixture = null;

    /**
     * Gets the servlet attribute of the TestWorkflowRuleServiceServlet object
     * 
     * @return The servlet value
     */
    private WorkflowRuleServiceServlet getServlet() {
        return (WorkflowRuleServiceServlet) this.fixture.servlet;
    }

    /**
     * The JUnit setup method
     * 
     * @throws Exception
     * 
     * @exception Exception Description of the Exception
     */
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        this.fixture = new ServletServiceFixture(this);
        this.fixture.setUp();
    }

    /**
     * The teardown method for JUnit
     * 
     * @exception Exception Description of the Exception
     */
    @Override
    public void onTearDown() {
        this.fixture.tearDown();
        this.fixture = null;
        super.onTearDown();
    }

    /**
     * A unit test for JUnit
     * 
     * @exception ExceptionBase Description of the Exception
     * @exception IOException Description of the Exception
     * @exception SAXException Description of the Exception
     * @exception MalformedURLException Description of the Exception
     * @exception ServletException Description of the Exception
     */
    public void testAuthenticateNoAuthentication() throws ExceptionBase, IOException, SAXException,
            MalformedURLException, ServletException {
        {
            // create servlet

            String servletName = "WorkflowRuleServiceServlet";
            String servletClassName = WorkflowRuleServiceServlet.class.getName();
            // No Authentication handler specified
            Hashtable initParameters = new Hashtable();

            this.fixture.createServlet(servletName, servletClassName, initParameters);
        }

        // white-box servlet testing - invoke servlet method directly
        this.getServlet().authenticate(this.fixture.servletRequest, this.fixture.servletResponse);
    }

    /**
     * A unit test for JUnit
     * 
     * @exception ExceptionBase Description of the Exception
     * @exception IOException Description of the Exception
     * @exception SAXException Description of the Exception
     * @exception MalformedURLException Description of the Exception
     * @exception ServletException Description of the Exception
     */
    public void testHandleNoHandler() throws ExceptionBase, IOException, SAXException,
            MalformedURLException, ServletException {
        {
            // create servlet

            String servletName = "WorkflowRuleServiceServlet";
            String servletClassName = WorkflowRuleServiceServlet.class.getName();
            // No error handler specified
            Hashtable initParameters = new Hashtable();

            this.fixture.createServlet(servletName, servletClassName, initParameters);
        }

        try {
            // white-box servlet testing - invoke servlet method directly
            this.getServlet().handle(new Exception("Test"), this.fixture.servletRequest,
                this.fixture.servletResponse);
            fail("ServletException expected");
        } catch (ServletException ex) {
            // ServletException expected
            System.out.println(ex);
        }
    }

    /**
     * A unit test for JUnit
     * 
     * @exception ExceptionBase Description of the Exception
     * @exception IOException Description of the Exception
     * @exception ServletException Description of the Exception
     */
    public void testDoProcessRuleDoesNotExist() throws ExceptionBase, IOException, ServletException {
        {
            // create servlet

            String servletName = "WorkflowRuleServiceServlet";
            String servletClassName = WorkflowRuleServiceServlet.class.getName();
            // No Authentication handler specified
            Hashtable initParameters = new Hashtable();
            // add WFRule which does not exist
            initParameters.put(WorkflowRuleServiceServlet.WORKFLOW_RULE_NAME, "JUNK");

            this.fixture.createServlet(servletName, servletClassName, initParameters);
        }

        try {
            // white-box servlet testing - invoke servlet method directly
            this.getServlet().doProcess(this.fixture.servletRequest, this.fixture.servletResponse);
            fail("ExceptionBase expected");
        } catch (ExceptionBase ex) {
            // ExceptionBase expected
            if (ex.findFirstExceptionBase().getPattern().indexOf("Unable to find workflow rule") == -1) {
                fail("Unable to find workflow rule ExceptionBase expected");
            }
        }
    }
}
