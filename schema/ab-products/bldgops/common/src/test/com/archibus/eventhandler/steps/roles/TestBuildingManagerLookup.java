package com.archibus.eventhandler.steps.roles;

import java.util.*; 

import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

import com.archibus.eventhandler.helpdesk.TestAll;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class TestBuildingManagerLookup extends TestCase {	
	 	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestBuildingManagerLookup.class);
		
		TestSetup wrapper = new TestSetup(testSuite) {
			
			public void setUp() throws Exception {				
				fixture = new EventHandlerFixture(this, "ab-ex-echo.axvw");
				fixture.setUp();
				transactionContext = fixture.beginTransaction();				 	       
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
	
	public void testGetContact() throws ExceptionBase {
		Object transactionContext = fixture.beginTransaction();
		
        Map inputs = new HashMap();		
        
        inputs.put("tableName","activity_log");
        inputs.put("fieldName","activity_log_id");
        inputs.put("activity_log.activity_log_id", new Integer(320));
        		
	    EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		
	    HelpdeskRoleExamples buildingManagerLookup = new HelpdeskRoleExamples();
	    	    
	    List ems; 
	    ems = buildingManagerLookup.getContact(context);	    
	    assertNotNull(ems);	    	    
	    assertEquals("AFM", ems.get(0));
 
		fixture.commitTransaction(transactionContext);		
	}
	
	

}
