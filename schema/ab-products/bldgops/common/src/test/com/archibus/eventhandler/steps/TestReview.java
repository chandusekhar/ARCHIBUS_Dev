package com.archibus.eventhandler.steps;

import java.text.ParseException;
import java.util.*;

import org.json.JSONObject;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;

public class TestReview extends TestCase {

	private static final String ACTIVITY_ID = "AbBldgOpsHelpDesk";
	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestReview.class);
		
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
	
	/*public void testReviewRequest() throws ParseException{
		Map activity_log = new HashMap();        
        activity_log.put("activity_log.requestor","AFM");
        activity_log.put("activity_log.phone_requestor","227-2508");
        activity_log.put("activity_log.site_id","MARKET");
        activity_log.put("activity_log.description","test review");
        activity_log.put("activity_log.priority", new Integer(3));
        activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
        activity_log.put("activity_log.prob_type","TC-HARDWARE PROB");
        
        Map inputs = new HashMap();
        inputs.put("fields", activity_log);		
		
		Map response = new HashMap();
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "submitRequest",
	            inputs,
	            response, transactionContext);
		
		JSONObject json = new JSONObject((String) response.get("jsonExpression"));
		int activity_log_id = json.getInt("activity_log_id");
		
		//fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new String[]{"status"}, new String[]{"REQUESTED"});
		
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
		inputs = new HashMap();
		activity_log.put("activity_log.prob_type", "KEY");
		activity_log.put("activity_log.priority", new Integer(1));
		activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id));
		activity_log.put("activity_log_step_waiting.step_log_id", new Integer(stepLogId));
		activity_log.put("activity_log_step_waiting.step", "Review");
		inputs.put("fields", activity_log);
		
		response = new HashMap();
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "reviewRequest",
	            inputs,
	            response, transactionContext);
		
		fixture.verifyRow("helpdesk_step_log","step_type='review' AND user_name = 'AFM' AND table_name='activity_log' AND pkey_value = " + activity_log_id,new String[]{"step_status_result"},new String[]{"approved"});
		fixture.verifyRow("helpdesk_step_log","step_type='approval' AND user_name = 'AFM' AND table_name='activity_log' AND pkey_value = " + activity_log_id,new String[]{"step"},new String[]{"Financial Approval"});
		fixture.verifyRow("activity_log","activity_log_id = " + activity_log_id, new String[]{"status"},new String[]{"REQUESTED"});
	}
	
	
	public void testForwardReview() throws ParseException{
		Map activity_log = new HashMap();        
        activity_log.put("activity_log.requestor","AFM");
        activity_log.put("activity_log.phone_requestor","227-2508");
        activity_log.put("activity_log.site_id","MARKET");
        activity_log.put("activity_log.description","test review");
        activity_log.put("activity_log.priority", new Integer(3));
        activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
        activity_log.put("activity_log.prob_type","TC-HARDWARE PROB");
        
        Map inputs = new HashMap();
        inputs.put("fields", activity_log);		
		
		Map response = new HashMap();
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "submitRequest",
	            inputs,
	            response, transactionContext);
		
		JSONObject json = new JSONObject((String) response.get("jsonExpression"));
		int activity_log_id = json.getInt("activity_log_id");
				
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
		inputs = new HashMap();
		activity_log.put("activity_log.prob_type", "KEY");
		activity_log.put("activity_log.priority", new Integer(1));
		activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id));
		activity_log.put("activity_log_step_waiting.step_log_id", new Integer(stepLogId));
		activity_log.put("activity_log_step_waiting.step", "Review");
				
		inputs.put("tableName", "activity_log");
		inputs.put("fieldName","activity_log_id");
        inputs.put("activity_log.activity_log_id",new Integer(activity_log_id)); 
        inputs.put("fields", activity_log);
        inputs.put("comments", "test forward review");
        inputs.put("forwardTo", "BLUM, JOEL");
        
        response = new HashMap();
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "forwardApproval",
	            inputs,
	            response, transactionContext);
        
		fixture.verifyRow("helpdesk_step_log","step_type='review' AND user_name = 'BLUM' AND table_name='activity_log' AND pkey_value = " + activity_log_id,new String[]{"em_id","comments"},new String[]{"BLUM, JOEL","test forward review"});
		fixture.verifyRow("activity_log","activity_log_id = " + activity_log_id, new String[]{"status"},new String[]{"REQUESTED"});
	}*/
	
	public void testReviewByRole() throws ParseException{
		Map<String,Object> activity_log = new HashMap<String,Object>();        
        activity_log.put("activity_log.requestor","ABERNATHY, ALISON");
        activity_log.put("activity_log.phone_requestor","338-1011");
        activity_log.put("activity_log.site_id","MARKET");
        activity_log.put("activity_log.description","test review");
        activity_log.put("activity_log.priority", new Integer(1));
        activity_log.put("activity_log.activity_type","SERVICE DESK - FURNITURE");
        
        Map<String,Object> inputs = new HashMap<String,Object>();
        inputs.put("fields", activity_log);		
		
		Map response = new HashMap();
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "submitRequest",
	            inputs,
	            response, transactionContext);
		
		JSONObject json = new JSONObject((String) response.get("jsonExpression"));
		int activity_log_id = json.getInt("activity_log_id");
		
		//fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new String[]{"status"}, new String[]{"REQUESTED"});
		
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
//		int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
		int stepLogId = (Integer)Common.getValue(context, "activity_log_step_waiting", "step_log_id", "step_type='review' AND user_name='AFM' AND activity_log_id = "+activity_log_id);
		inputs = new HashMap();
		activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id));
		activity_log.put("activity_log_step_waiting.step_log_id", new Integer(stepLogId));
		activity_log.put("activity_log_step_waiting.step", "Edit and Approve");
		inputs.put("fields", activity_log);
		
		response = new HashMap();
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "reviewRequest",
	            inputs,
	            response, transactionContext);
		
		fixture.verifyRow("helpdesk_step_log","step_log_id = " + stepLogId,new String[]{"step_status_result"},new String[]{"approved"});
		fixture.verifyRow("helpdesk_step_log","step_type='approval' AND user_name = 'AFM' AND table_name='activity_log' AND pkey_value = " + activity_log_id,new String[]{"step"},new String[]{"Manager Approval"});
		fixture.verifyRow("activity_log","activity_log_id = " + activity_log_id, new String[]{"status"},new String[]{"REQUESTED"});
	}
}
