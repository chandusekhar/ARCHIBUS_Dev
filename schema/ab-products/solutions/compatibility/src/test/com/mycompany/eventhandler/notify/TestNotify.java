package com.mycompany.eventhandler.notify;

import junit.framework.TestCase;

import com.archibus.fixture.EventHandlerFixture;
import com.archibus.utility.ExceptionBase;

/**
 * Tests example event handlers.
 * 
 * @author Valery
 * @created May 10, 2005
 */
public class TestNotify extends TestCase {

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
        this.fixture = new EventHandlerFixture(this, "ab-ex-notify.axvw");
        this.fixture.setUp();
    }

    /**
     * JUnit clean-up method.
     */
    public void tearDown() {
        this.fixture.tearDown();
    }

    /**
     * Tests NotifyMain event handler.
     * 
     * @exception ExceptionBase Description of the Exception
     */
    public void testNotifyMain() throws ExceptionBase {
        try {
            this.fixture.runWorkflowRule("request-notifymain.xml");

            try {
                // email notification is async
                Thread.sleep(3000);
            } catch (InterruptedException e) {
            }
        } catch (ExceptionBase e) {
            // we expect the event handler to fail because the host name is blank
            // any other exception will not be tolerated
            boolean hasExpectedException = (e != null) && (e.getPattern() != null)
                    && e.getPattern().indexOf("Required argument is not specified") != -1;

            assertTrue("Unexpected exception: " + e, hasExpectedException);
        }
    }

    /**
     * Tests NotifyMain event handler.
     * 
     * @exception ExceptionBase Description of the Exception
     */
    public void testNotifyChain() throws ExceptionBase {
        try {
            this.fixture.runWorkflowRule("request-notifychain.xml");
        } catch (ExceptionBase e) {
            // we expect the event handler to fail because the host name is blank
            // any other exception will not be tolerated
            boolean hasExpectedException = (e != null) && (e.getPattern() != null)
                    && e.getPattern().indexOf("Required argument is not specified") != -1;

            assertTrue("Unexpected exception: " + e, hasExpectedException);
        }
    }
}
