package com.archibus.eventhandler.steps;

import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class TestNotification extends TestCase {

	private static final String ACTIVITY_ID = "AbBldgOpsHelpDesk";
	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestNotification.class);
		
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
		if (TestAll.fixtureAll != null ) {
			fixture = TestAll.fixtureAll; 		
		} 
		// always start transaction
		transactionContext = fixture.beginTransaction();
	}

	protected void tearDown() throws Exception {		
		// always rollback at the end of a test method
		try {
			fixture.rollbackTransaction(transactionContext);
		} catch (Exception e){
			
		}
	}
	
	public void testNotification() {
		Map inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		
		int id=359;
		String em_id = "AFM";
		
		Map<String,Object> values = new HashMap<String,Object>();
		values.put("status", "APPROVED");
		values.put("status_before", "APPROVED");
		values.put("em_id", em_id);
		values.put("step_type", "notification");
		
		Notification notification = new Notification(context,ACTIVITY_ID, id);
		notification.setStepName("Request Approved");
		notification.init(context, ACTIVITY_ID, id, values);
		notification.invoke();		
	}
}
