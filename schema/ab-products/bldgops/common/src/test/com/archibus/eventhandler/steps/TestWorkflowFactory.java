package com.archibus.eventhandler.steps;

import java.util.HashMap;

import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;


import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class TestWorkflowFactory extends TestCase {
	
	static final String ACTIVITY_ID = "AbBldgOpsHelpDesk";
	 	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestWorkflowFactory.class);
		
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
		if (TestAll.fixtureAll != null ) {
			fixture = TestAll.fixtureAll; 		
		} 
		// always start transaction
		transactionContext = fixture.beginTransaction();
	}

	protected void tearDown() throws Exception {		
		// always rollback at the end of a test method
		fixture.rollbackTransaction(transactionContext);
	}
	
	
	public void testGetStatusManager() {
		
		HashMap inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		
		StatusManager statusManager = WorkflowFactory.getStatusManager(context, ACTIVITY_ID, 320);		
		assertNotNull(statusManager);		
		
		StepManager stepManager = WorkflowFactory.getStepManager(context, ACTIVITY_ID, 320);		
		assertNotNull(stepManager);	
		
	}
	
	
	
	



}
