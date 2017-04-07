package com.archibus.eventhandler.helpdesk;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import com.archibus.fixture.*;

import java.util.HashMap;
import java.util.Map;
import com.archibus.utility.ExceptionBase;

import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;

/**
 *  Tests MovesHandler methods.
 */
public class TestReportHandler extends TestCase {
	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestReportHandler.class);
		
		TestSetup wrapper = new TestSetup(testSuite) {
			
			public void setUp() throws Exception {				
				fixture = new EventHandlerFixture(this, "ab-ex-echo.axvw");
				fixture.setUp();			 	       
			}
			
			public void tearDown() throws Exception {				 
				fixture.tearDown();				 
			}
			
		};		
		
		return wrapper;
	}  

 
    protected void setUp() throws Exception {
		if (TestAll.fixtureAll != null) {
			fixture = TestAll.fixtureAll; 		
		} 
		// always start transaction
		transactionContext = fixture.beginTransaction();
	}

	protected void tearDown() throws Exception {		
		// always rollback at the end of a test method
		fixture.rollbackTransaction(transactionContext);
	}

   
    public void testChartData() throws ExceptionBase {

        Map response = new HashMap();
        Map inputs = new HashMap();
        
        // dates in ISO format
        inputs.put("start_date", "2007-1-31");
        inputs.put("end_date", "2007-5-1");
        inputs.put("site_id", "MARKET");
        inputs.put("bl_id", "");
        inputs.put("activity_type", "");
        inputs.put("prob_type", "");
        inputs.put("dv_id", "");
        inputs.put("dp_id", "");   
        inputs.put("slicing", "month");      
        
        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
        ReportHandler reportHandler = new ReportHandler();
        reportHandler.getChartData(context);        
        response = context.getResponse();
        
        assertNotNull(response.get("jsonExpression"));    
    }
    
    public void testGetDepartments() throws ExceptionBase {

        Map response = new HashMap();
        Map inputs = new HashMap();        
        
        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
     
        ReportHandler reportHandler = new ReportHandler();        
        reportHandler.getDepartments(context);        
        response = context.getResponse();
        
        assertNotNull(response.get("jsonExpression"));       
    }
    
    public void testGetBuildings() throws ExceptionBase {

        Map response = new HashMap();
        Map inputs = new HashMap();        
        
        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
     
        ReportHandler reportHandler = new ReportHandler();        
        reportHandler.getBuildings(context);        
        response = context.getResponse();
        
        assertNotNull(response.get("jsonExpression"));       
    }
    
    public void testGetActivityTypes() throws ExceptionBase {

        Map response = new HashMap();
        Map inputs = new HashMap();        
        
        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
     
        ReportHandler reportHandler = new ReportHandler();        
        reportHandler.getActivityTypes(context);        
        response = context.getResponse();
        
        assertNotNull(response.get("jsonExpression"));   
    }
    
    public void testGetAccounts() throws ExceptionBase {

        Map response = new HashMap();
        Map inputs = new HashMap();        
        
        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
     
        ReportHandler reportHandler = new ReportHandler();        
        reportHandler.getAccounts(context);       
        response = context.getResponse();
        
        assertNotNull(response.get("jsonExpression"));   
    }

}
