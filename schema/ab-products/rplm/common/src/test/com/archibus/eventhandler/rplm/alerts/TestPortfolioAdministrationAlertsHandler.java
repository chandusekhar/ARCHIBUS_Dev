package com.archibus.eventhandler.rplm.alerts;

import java.util.Locale;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;

public class TestPortfolioAdministrationAlertsHandler extends DataSourceTestBase {
    
    public void testGenerateAlerts() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final LeaseAdministrationAlertsHandler handlerClass =
                new LeaseAdministrationAlertsHandler();
        handlerClass.generateAlerts(context);
    }
    
    public void localizeString() {
        final Locale locale = new Locale("it", "IT");
        final String localizedString = Messages.getLocalizedMessage(Messages.YELLOW, locale);
        assertEquals("Yellow_it", localizedString);
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "adminService.xml" };
    }
}
