package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import com.archibus.app.helpdesk.mobile.maintenance.service.IMaintenanceMobileService;
import com.archibus.app.helpdesk.mobile.maintenance.service.impl.*;
import com.archibus.datasource.DataSourceTestBase;

/**
 * TODO comment: IntegrationTest Test TestMaintenanceMobileService.
 * 
 */
// TODO rename class to MaintenanceMobileServiceIntegrationTest
// TODO remove empty lines that do not serve any purpose
public class TestMaintenanceMobileService extends DataSourceTestBase {
    
    /**
     * User Name of Crafts Person.
     */
    // TODO naming for constants
    private static final String CFUSER = "TRAM";
    
    /**
     * Crafts Person Name.
     */
    // TODO naming for constants
    private static final String CFID = "WILL TRAM";
    
    /**
     * test syncWorkData.
     * 
     */
    public void testSyncWorkData() {
        
        // TODO more test cases
        // TODO naming for variables
        final IMaintenanceMobileService handler = new MaintenanceMobileService();
        handler.syncWorkData(CFUSER, CFID);
        
        // TODO assertions: verify that expected records are in database
        
    }
    
}
