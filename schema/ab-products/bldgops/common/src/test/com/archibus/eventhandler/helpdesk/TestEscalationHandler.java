package com.archibus.eventhandler.helpdesk;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Test EscalationHandler
 */
public class TestEscalationHandler extends DataSourceTestBase {
    
    /**
     * test method runSLAEscalations().
     */
    public void testRunSLAEscalations() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final EscalationHandler handler = new EscalationHandler();
        handler.runSLAEscalations(context);
    }
}
