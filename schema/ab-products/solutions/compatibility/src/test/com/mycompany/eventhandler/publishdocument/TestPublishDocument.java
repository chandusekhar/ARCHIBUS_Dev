package com.mycompany.eventhandler.publishdocument;

import junit.framework.TestCase;

import org.apache.log4j.*;

import com.archibus.db.RecordsPersistenceImpl;
import com.archibus.fixture.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Tests example event handlers.
 *
 * @author Valery
 * @created June 16, 2005
 */
public class TestPublishDocument extends TestCase {

    /**
     * Helper object providing test-related resource and methods.
     */
    private EventHandlerFixture fixture = null;

    /**
     * JUnit test initialization method.
     *
     * @exception Exception Description of the Exception
     */
    @Override
    public void setUp() throws Exception {
        this.fixture = new EventHandlerFixture(this, "ab-ex-publish-document.axvw");
        this.fixture.setUp();
        // disable object logging
        ConfigFixture.enableObjectLogging(Level.INFO);
        Logger.getLogger(RecordsPersistenceImpl.class).setLevel(Level.DEBUG);
    }

    /**
     * JUnit clean-up method.
     */
    @Override
    public void tearDown() {
        this.fixture.tearDown();
    }

    /**
     * Tests NextView event handler.
     *
     * @exception ExceptionBase Description of the Exception
     */
    public void testPublishDocument() throws ExceptionBase {
        WorkflowRulesContainer.ThreadSafe container = this.fixture.getWorkflowRulesContainer();
        WorkflowRuleImpl rule = (WorkflowRuleImpl) container
                .getWorkflowRule("AbSolutionsExtras-publishDocument");
        rule.setActive(true);
        this.fixture.runWorkflowRule("request-publishdocument.xml");
    }
}
