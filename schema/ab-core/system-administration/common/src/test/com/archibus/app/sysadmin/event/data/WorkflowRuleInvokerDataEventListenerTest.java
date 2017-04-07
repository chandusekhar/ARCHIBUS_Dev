package com.archibus.app.sysadmin.event.data;

import junit.framework.*;

import org.springframework.context.*;

import com.archibus.app.common.MockUtilities;
import com.archibus.core.event.data.SqlExecutedEvent;

/**
 * Tests for WorkflowRuleInvokerDataEventListener.
 *
 * @author Valery Tydykov
 *
 */
public class WorkflowRuleInvokerDataEventListenerTest extends TestCase {

    /**
     * Test method for
     * {@link com.archibus.app.sysadmin.event.data.WorkflowRuleInvokerDataEventListener#onApplicationEvent(org.springframework.context.ApplicationEvent)}
     * .
     */
    public void testOnApplicationEvent() {
        {
            // case 1: event is instance of DataEvent
            final WorkflowRuleInvokerDataEventListener workflowRuleInvokerDataEventListener =
                    new WorkflowRuleInvokerDataEventListener();
            final CallbackFlag callbackFlag = new CallbackFlag();
            final ApplicationContext applicationContext =
                    MockUtilities.createMockApplicationContext(callbackFlag);

            workflowRuleInvokerDataEventListener.setApplicationContext(applicationContext);
            workflowRuleInvokerDataEventListener.setProject(MockUtilities.createMockProject(null));

            // event parameters don't matter here
            final SqlExecutedEvent sqlExecutedEvent =
                    new SqlExecutedEvent(this, null, null, null, null);

            // invoke tested method
            workflowRuleInvokerDataEventListener.onApplicationEvent(sqlExecutedEvent);
            // verify that IDataEventListener.onApplicationEvent was called
            Assert.assertTrue(callbackFlag.called);
        }

        {
            // case 2: event is not an instance of DataEvent
            final WorkflowRuleInvokerDataEventListener workflowRuleInvokerDataEventListener =
                    new WorkflowRuleInvokerDataEventListener();
            final CallbackFlag callbackFlag = new CallbackFlag();

            // event parameters don't matter here
            final ApplicationEvent event =
                    new org.springframework.security.web.session.HttpSessionCreatedEvent(
                        MockUtilities.createMockHttpSession());

            // invoke tested method
            workflowRuleInvokerDataEventListener.onApplicationEvent(event);
            // verify that IDataEventListener.onApplicationEvent was not called
            Assert.assertFalse(callbackFlag.called);
        }
    }
}
