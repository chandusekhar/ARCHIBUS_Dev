package com.archibus.eventhandler.sla;

import java.text.ParseException;
import java.util.*;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.json.JSONObject;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import com.archibus.db.RecordsPersistenceImpl;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.fixture.ConfigFixture;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;

public class TestSLAAutomation extends TestCase {
	/**
     *  Helper object providing test-related resource and methods.
     */
       
    private static final String ACTIVITY_ID = "AbBldgOpsHelpDesk";
	private static final String EVENT_HANDLER_CLASS = "com.archibus.eventhandler.helpdesk.RequestHandler";
		
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestSLAAutomation.class);
		
		TestSetup wrapper = new TestSetup(testSuite) {
			
			public void setUp() throws Exception {				
				fixture = new EventHandlerFixture(this, "ab-ex-echo.axvw");
				fixture.setUp();		
				ConfigFixture.enableObjectLogging(Level.INFO);
		        Logger.getLogger(RecordsPersistenceImpl.class).setLevel(Level.DEBUG);
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
		//fixture.rollbackTransaction(transactionContext);
		try {
			fixture.commitTransaction(transactionContext);
		} catch (Exception e) {
			
		}
	}
	
	/*public void testWorkTeams() throws ParseException{
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		Map fields = new HashMap();
		fields.put("activity_type", "SERVICE DESK - MAINTENANCE");
		fields.put("prob_type", "REPLACE");
		fields.put("requestor", "REQUESTOR");
		fields.put("site_id", "MARKET");
		fields.put("bl_id", "HQ");
		fields.put("fl_id", "RF");
		fields.put("eq_id", "FIRE-EX-1603");
		fields.put("description", "test autodispatch to team");
		fields.put("priority", new Integer(2));
		inputs.put("fields",fields);
		
		fixture.runEventHandlerMethod(
				ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "submitRequest",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		  
		JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression"));
		int activity_log_id = jsonObject.getInt("activity_log_id");
		
		fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new String[]{"status","work_team_id"}, new String[]{"Approved","CENTRAL ELECTRICAL TEAM"});
	}*/
	
	/*public void testAutoCreateWR() throws ParseException{
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		Map fields = new HashMap();
		fields.put("activity_type", "SERVICE DESK - MAINTENANCE");
		fields.put("prob_type", "LEAK");
		fields.put("requestor", "ADAMS,ALBERT");
		fields.put("site_id", "WEST");
		fields.put("bl_id", "PLAZA 1");
		fields.put("description", "test autocreate WR");
		fields.put("priority", new Integer(2));
		inputs.put("fields",fields);
		
		fixture.runEventHandlerMethod(
				ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "submitRequest",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		  
		JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression"));
		int activity_log_id = jsonObject.getInt("activity_log_id");
		
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		int wr_id = Common.getMaxId(context, "wr", "wr_id");
		
		int act_wr_id = ((Integer)Common.getValue(context, "activity_log", "wr_id", "activity_log_id = " +activity_log_id)).intValue();
		assertEquals(wr_id, act_wr_id);
		
		int wr_act_id = ((Integer)Common.getValue(context, "wr", "activity_log_id", "wr_id = " +wr_id)).intValue();
		assertEquals(activity_log_id, wr_act_id);
		
		fixture.verifyRow("activity_log", "activity_log_id = " +activity_log_id, new String[]{"status"}, new String[]{"APPROVED"});
		fixture.verifyRow("wr", "wr_id = " +wr_id, new String[]{"status"}, new String[]{"A"});
	}*/
	
	public void testAutoIssue() throws ParseException{
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		Map fields = new HashMap();
		fields.put("activity_type", "SERVICE DESK - MAINTENANCE");
		fields.put("prob_type", "DOOR");
		fields.put("requestor", "AFM");
		fields.put("site_id", "MARKET");
		fields.put("bl_id", "HQ");
		fields.put("description", "test autoissue");
		fields.put("priority", new Integer(5));
		inputs.put("fields",fields);
		
		fixture.runEventHandlerMethod(
				ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "submitRequest",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		  
		JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression"));
		int activity_log_id = jsonObject.getInt("activity_log_id");
		
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		int wr_id = Common.getMaxId(context, "wr", "wr_id");
		int wo_id = Common.getMaxId(context,"wo","wo_id");
		
		int act_wo_id = ((Integer)Common.getValue(context, "activity_log", "wo_id", "activity_log_id = " +activity_log_id)).intValue();
		assertEquals(wo_id, act_wo_id);
		
		int wr_act_id = ((Integer)Common.getValue(context, "wr", "activity_log_id", "wr_id = " +wr_id)).intValue();
		assertEquals(activity_log_id, wr_act_id);
		
		assertNotNull(Common.getValue(context,"wo","date_issued","wo_id = " + wo_id));
		
		fixture.verifyRow("activity_log", "activity_log_id = " +activity_log_id, new String[]{"status"}, new String[]{"IN PROGRESS"});
		fixture.verifyRow("wr", "wr_id = " +wr_id, new String[]{"status"}, new String[]{"I"});
		
		
		/*inputs = new HashMap();
		response = new HashMap();
		fields.put("wr_id", new Integer(wr_id));
		inputs.put("fields", fields);
		inputs.put("status", "S");
		
		fixture.runEventHandlerMethod(
				Constants.ONDEMAND_ACTIVITY_ID,
				"com.archibus.eventhandler.ondemandwork.WorkRequestHandler",
	            "updateWorkRequestStatus",
	            inputs,
	            response, 
	            transactionContext);
		
		fixture.verifyRow("activity_log", "activity_log_id = " +activity_log_id, new String[]{"status"}, new String[]{"STOPPED"});
		fixture.verifyRow("wr", "wr_id = " +wr_id, new String[]{"status"}, new String[]{"S"});*/
	}
	
	/*public void testAutoIssue2() throws ParseException{
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		Map fields = new HashMap();
		fields.put("activity_type", "SERVICE DESK - MAINTENANCE");
		fields.put("prob_type", "LEAK");
		fields.put("requestor", "ADAMS,ALBERT");
		fields.put("site_id", "WEST");
		fields.put("bl_id", "PLAZA 1");
		fields.put("description", "test autoissue");
		fields.put("priority", new Integer(4));
		inputs.put("fields",fields);
		
		fixture.runEventHandlerMethod(
				ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "submitRequest",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		  
		JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression"));
		int activity_log_id = jsonObject.getInt("activity_log_id");
		
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		int wr_id = Common.getMaxId(context, "wr", "wr_id");
		int wo_id = Common.getMaxId(context,"wo","wo_id");
		
		int act_wo_id = ((Integer)Common.getValue(context, "activity_log", "wo_id", "activity_log_id = " +activity_log_id)).intValue();
		assertEquals(wo_id, act_wo_id);
		
		int wr_act_id = ((Integer)Common.getValue(context, "wr", "activity_log_id", "wr_id = " +wr_id)).intValue();
		assertEquals(activity_log_id, wr_act_id);
		
		/*fixture.commitTransaction(transactionContext);
		fixture.verifyRow("activity_log", "activity_log_id = " +activity_log_id, new String[]{"status"}, new String[]{"In PROGRESS"});
		fixture.verifyRow("wr", "wr_id = " +wr_id, new String[]{"status"}, new String[]{"I"});
		
		
		inputs = new HashMap();
		response = new HashMap();
		fields.put("wr_id", new Integer(wr_id));
		inputs.put("fields", fields);
		inputs.put("status", "Com");
		
		fixture.runEventHandlerMethod(
				Constants.ONDEMAND_ACTIVITY_ID,
				"com.archibus.eventhandler.ondemandwork.WorkRequestHandler",
	            "updateWorkRequestStatus",
	            inputs,
	            response, 
	            transactionContext);
		
		inputs = new HashMap();
		response = new HashMap();
		inputs.put("wo_id", new Integer(wo_id));
		
		fixture.runEventHandlerMethod(
				Constants.ONDEMAND_ACTIVITY_ID,
				"com.archibus.eventhandler.ondemandwork.WorkRequestHandler",
	            "closeWorkOrder",
	            inputs,
	            response, 
	            transactionContext);
		
		/*fixture.commitTransaction(transactionContext);
		fixture.verifyRow("activity_log", "activity_log_id = " +activity_log_id, new String[]{"status"}, new String[]{"CLOSED"});
		fixture.verifyRow("wr", "wr_id = " +wr_id, new String[]{"status"}, new String[]{"Clo"});
		
		response = new HashMap();
		fixture.runEventHandlerMethod(
				Constants.ONDEMAND_ACTIVITY_ID,
				"com.archibus.eventhandler.ondemandwork.WorkRequestHandler",
	            "archiveWorkOrder",
	            inputs,
	            response, 
	            transactionContext);
		
		fixture.commitTransaction(transactionContext);
		fixture.verifyRow("hactivity_log", "activity_log_id = " +activity_log_id, new String[]{"status"}, new String[]{"CLOSED"});
		fixture.verifyRow("hwr", "wr_id = " +wr_id, new String[]{"status"}, new String[]{"Clo"});
		fixture.verifyRow("hwo", "wo_id = " + wo_id, new String[]{"bl_id"}, new String[]{"PLAZA 1"});
		
			
	}*/
	
	

}
