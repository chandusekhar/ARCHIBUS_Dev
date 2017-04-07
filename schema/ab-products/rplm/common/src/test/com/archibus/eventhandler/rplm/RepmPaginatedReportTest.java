package com.archibus.eventhandler.rplm;

import org.json.JSONObject;

import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;

public class RepmPaginatedReportTest extends DataSourceTestBase {
    
    RepmPaginatedReport serviceClass = new RepmPaginatedReport(
        DataSourceFactory.createDataSource(), new JSONObject());
    
    public void testRun() {
        this.serviceClass.run();
    }
    
    public void testCloneRestriction() {
        
        Restriction restriction = new Restriction("");
        
        this.serviceClass.cloneRestriction(restriction);
    }
    
}
