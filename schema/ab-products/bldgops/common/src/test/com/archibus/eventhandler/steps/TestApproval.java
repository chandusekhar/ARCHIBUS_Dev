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

public class TestApproval extends TestCase {

	private static final String ACTIVITY_ID = "AbBldgOpsHelpDesk";
	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestApproval.class);
		
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
	
	/*public void testSubstitute() throws ParseException {
		Map inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		
		Map activity_log = new HashMap();        
        activity_log.put("activity_log.requestor","AFM");
        activity_log.put("activity_log.phone_requestor","227-2508");
        activity_log.put("activity_log.site_id","JFK");
        activity_log.put("activity_log.description","test approval, multiple required");
        activity_log.put("activity_log.priority", new Integer(1));
        activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
        activity_log.put("activity_log.prob_type", "FURNITURE");
        
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
		
		String where = "table_name = 'activity_log' AND pkey_value = " + activity_log_id+ " AND step_type = 'approval'";
		String[] fields = {"em_id","comments"};
		fixture.verifyRow("helpdesk_step_log", where, fields, new String[]{"DAMON, BEN",""});
		fixture.verifyRow("helpdesk_step_log", where, fields, new String[]{"ADAMS, ALBERT","Substitute for ABERNATHY, ALISON."});
		fixture.verifyRow("helpdesk_step_log", where, fields, new String[]{"ADAMS, ALBERT","Substitute for AFM."});
		fixture.verifyRow("helpdesk_step_log", where, fields, new String[]{"BECKWITH, BILL",""});
		
		
	}*/
	
	public void testForwardApproval() throws ParseException {
		Map inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		
		Map activity_log = new HashMap();        
		activity_log.put("activity_log.requestor","ABERNATHY, ALISON");
		activity_log.put("activity_log.site_id","MARKET");
		activity_log.put("activity_log.bl_id","HQ");
		activity_log.put("activity_log.description","test approval, forward");
		activity_log.put("activity_log.priority", new Integer(3));
		activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
		activity_log.put("activity_log.prob_type", "ELECTRICAL");
		
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
		int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id");
		
		activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id));
		activity_log.put("activity_log_step_waiting.step_log_id", new Integer(stepLogId));
		activity_log.put("activity_log_step_waiting.step", "Facility Approval");
		activity_log.put("activity_log_step_waiting.activity_log_id", new Integer(activity_log_id));
		
		inputs = new HashMap();
		response = new HashMap();
		
		inputs.put("fields", activity_log);
		inputs.put("forwardTo", "AFM");
		String comments = "forwarded to AFM";
		inputs.put("comments", comments);
		
		fixture.runEventHandlerMethod(
		        ACTIVITY_ID,
		        "com.archibus.eventhandler.helpdesk.RequestHandler",
		        "forwardApproval",
		        inputs,
		        response, transactionContext);
		
		inputs = new HashMap();
		inputs.put("fields", activity_log);
		inputs.put("comments", comments);
		
		fixture.runEventHandlerMethod(
		        ACTIVITY_ID,
		        "com.archibus.eventhandler.helpdesk.RequestHandler",
		        "approveRequest",
		        inputs,
		        response, transactionContext);
		
		fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new String[]{"status"}, new String[]{"IN PROGRESS"});
		fixture.verifyRow("helpdesk_step_log","step_log_id = "+stepLogId,new String[]{"step_status_result","comments"}, new String[]{"approved",comments});
	}
	
	/*public void testMultipleRequired() throws ParseException{
		Map activity_log = new HashMap();        
        activity_log.put("activity_log.requestor","AFM");
        activity_log.put("activity_log.phone_requestor","227-2508");
        activity_log.put("activity_log.site_id","JFK");
        activity_log.put("activity_log.description","test approval, multiple required");
        activity_log.put("activity_log.priority", new Integer(1));
        activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
        activity_log.put("activity_log.prob_type","FURNITURE");
        
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
		fixture.executeSql("UPDATE helpdesk_step_log SET date_response = " + Common.getCurrentDate(context)
				+ ", time_response = " + Common.getCurrentTime(context) + ", step_status_result = 'approved' WHERE table_name='activity_log' AND pkey_value = " + activity_log_id + " AND step_type = 'approval' AND user_name IS NOT NULL",transactionContext);
		
		Integer stepLogId = (Integer) Common.getValue(context, "helpdesk_step_log", "step_log_id", "step_type='approval' AND user_name IS NULL AND table_name='activity_log' AND pkey_value = " + activity_log_id);
		inputs = new HashMap();
		activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id));
		activity_log.put("activity_log_step_waiting.step_log_id", stepLogId);
		activity_log.put("activity_log_step_waiting.step", "Financial Approval");
		inputs.put("fields", activity_log);
		inputs.put("comments","test approval");
		response = new HashMap();
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "approveRequest",
	            inputs,
	            response, transactionContext);
		
		fixture.verifyRow("helpdesk_step_log","step_type='approval' AND user_name IS NULL AND table_name='activity_log' AND pkey_value = " + activity_log_id,new String[]{"step_status_result","comments"},new String[]{"approved","test approval"});
		fixture.verifyRow("activity_log","activity_log_id = " + activity_log_id, new String[]{"status"},new String[]{"APPROVED"});
	}*/
	
	/*public void testSingleRequired() throws ParseException{
		Map activity_log = new HashMap();        
        activity_log.put("activity_log.requestor","AFM");
        activity_log.put("activity_log.phone_requestor","227-2508");
        activity_log.put("activity_log.site_id","JFK");
        activity_log.put("activity_log.description","test approval, single required");
        activity_log.put("activity_log.priority", new Integer(2));
        activity_log.put("activity_log.activity_type","SERVICE DESK - COPY SERVICE");
        
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
		
		Integer stepLogId = (Integer) Common.getValue(context, "helpdesk_step_log", "step_log_id", "step_type='approval' AND user_name = 'AFM' AND table_name='activity_log' AND pkey_value = " + activity_log_id);
		inputs = new HashMap();
		activity_log.put("activity_log.activity_log_id", new Integer(activity_log_id));
		activity_log.put("activity_log_step_waiting.step_log_id", stepLogId);
		activity_log.put("activity_log_step_waiting.step", "Manager Approval");
		inputs.put("fields", activity_log);
		inputs.put("comments","test approval");
		
		System.err.println("test approval before " + activity_log_id);
		
		response = new HashMap();
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.helpdesk.RequestHandler",
	            "approveRequest",
	            inputs,
	            response, transactionContext);
		
		System.err.println("test approval after " + activity_log_id);
		
		fixture.verifyRow("helpdesk_step_log","step_type='approval' AND user_name = 'AFM' AND table_name='activity_log' AND pkey_value = " + activity_log_id,new String[]{"step_status_result","comments"},new String[]{"approved","test approval"});
		fixture.verifyRow("activity_log","activity_log_id = " + activity_log_id, new String[]{"status"},new String[]{"APPROVED"});
	}*/

}
