package com.archibus.eventhandler.steps;

import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class TestForward extends TestCase {
	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestForward.class);
		
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
	
	public void testForwardOnDemandRequest() throws ParseException{
		Map inputs = new HashMap();
		
		Map<String,Object> activity_log = new HashMap<String,Object>();
		activity_log.put("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
		activity_log.put("activity_log.prob_type", "DOOR");
		activity_log.put("activity_log.site_id", "MARKET");
		activity_log.put("activity_log.requestor", "ABERNATHY, ALISON");
		activity_log.put("activity_log.description", "test forward on demand");
		activity_log.put("activity_log.priority", 5);
		
		inputs.put("fields", activity_log);	
        
        Map response = new HashMap();		
		fixture.runEventHandlerMethod(
	            Constants.HELPDESK_ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "submitRequest",
	            inputs,
	            response, transactionContext);
		
		JSONObject json = new JSONObject((String) response.get("jsonExpression"));
		int activity_log_id = json.getInt("activity_log_id");
		
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		int wrId = Common.getMaxId(context,"wr","wr_id","activity_log_id = " + activity_log_id);
		int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id","step_type='forward' AND table_name='activity_log'");
		int stepLogIdWr = Common.getMaxId(context, "helpdesk_step_log", "step_log_id","step_type='forward' AND table_name='wr'");
		
		int woId = Common.getMaxId(context,"wo","wo_id");
		
		
		String supervisor = "CRAFTSPERSON";
		inputs = new HashMap();
		activity_log.put("activity_log.activity_log_id", activity_log_id);
		inputs.put("fields", activity_log);
		inputs.put("supervisor", supervisor);
		
		response = new HashMap();		
		fixture.runEventHandlerMethod(
	            Constants.HELPDESK_ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "updateRequest",
	            inputs,
	            response, transactionContext);
		
		fixture.verifyRow("wo", "wo_id = " + woId, new String[]{"supervisor"},new String[]{supervisor});
		fixture.verifyRow("wr", "wr_id = " + wrId, new String[]{"supervisor"},new String[]{supervisor});
		fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new String[]{"supervisor"},new String[]{supervisor});
		fixture.verifyRow("helpdesk_step_log","step_log_id = " + stepLogId, new String[]{"table_name","step"},
			new String[]{"activity_log",Forward.STEP_FORWARD_SUPERVISOR});
		fixture.verifyRow("helpdesk_step_log","step_log_id = " + stepLogIdWr, new String[]{"table_name","step"},
				new String[]{"wr",Forward.STEP_FORWARD_SUPERVISOR});
	}
}
