package com.archibus.eventhandler.CommonHandlers;

import junit.framework.TestCase;

import com.archibus.fixture.EventHandlerFixture;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Tests CapitalProjectsHandler.
 */
public class TestCommonHandlers extends TestCase {

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
    }

    /**
     * JUnit clean-up method.
     */
    public void tearDown() {
        this.fixture.tearDown();
    }

    // ----------------------- test methods ------------------------------------

    public void rule1(EventHandlerContext context) {

        System.out.println("chainedRule 1 executed");

    }

    public void rule2(EventHandlerContext context) {

        System.out.println("chainedRule 2 executed");
    }

    public void rule3(EventHandlerContext context) {

        System.out.println("chainedRule 3 executed");
    }

    /**
     * Test for setFieldDefaultValue event handler.
     */
    public void testNotify() throws Exception {
        this.fixture.runWorkflowRule("notify.xml");

    }

    /**
     * Test for setFieldDefaultValue event handler.
     */
    public void testChainRule() throws Exception {
        this.fixture.createRule("TestActivity", "Rule1", this.getClass().getName(), "rule1");
        this.fixture.createRule("TestActivity", "Rule2", this.getClass().getName(), "rule2");
        this.fixture.createRule("TestActivity", "Rule3", this.getClass().getName(), "rule3");

        this.fixture.runWorkflowRule("chainRule.xml");

    }

    /**
     * Test for setFieldDefaultValue event handler.
     */
    public void testExecuteSQL() throws Exception {
        this.fixture.runWorkflowRule("executeSQL.xml");

    }

    /**
     * Test for setFieldDefaultValue event handler.
     */
    public void testNotifyUsingArchibusIdentity() throws Exception {
        this.fixture.runWorkflowRule("notifyUsingArchibusIdentity.xml");

    }

    /**
     * Test for setFieldDefaultValue event handler.
     */
    public void testSaveRecordOverridingValues() throws Exception {
        this.fixture.runWorkflowRule("saveRecordOverridingValues.xml");

    }

}
