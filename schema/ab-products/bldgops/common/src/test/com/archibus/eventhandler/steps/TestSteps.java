/**
 * 
 */
package com.archibus.eventhandler.steps;

import java.text.ParseException;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
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


public class TestSteps extends TestCase { //DataSourceTestBase  {

	protected static final String ACTIVITY_HELPDESK = "AbBldgOpsHelpDesk";
	protected static final String ACTIVITY_ONDEMANDWORK = "AbBldgOpsOnDemandWork";
	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestSteps.class);
		
		TestSetup wrapper = new TestSetup(testSuite) {
			public void setUp() throws Exception {				
				fixture = new EventHandlerFixture(this);
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

	/*
	  public void testNotification() {		
		HashMap inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		Notification notification;		
		
		notification = new Notification(context, ACTIVITY_HELPDESK, 320);
		notification.setEmId("AFM");
		notification.invoke();		
		
		notification = new Notification(context, ACTIVITY_ONDEMANDWORK, 950000001);		
		notification.setEmId("AFM");
		notification.invoke();		
		
		notification = new Notification(context, ACTIVITY_HELPDESK, 320);	
		notification.setEmId("AFM");
		notification.invoke();		
		
		notification = new Notification(context, ACTIVITY_ONDEMANDWORK, 950000001);		
		notification.setEmId("AFM");
		notification.invoke();			
	}
	  
	public void testEscalation() {
		HashMap inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	 		
		Escalation escalationStep = new Escalation(context, Constants.HELPDESK_ACTIVITY_ID, 453, Escalation.STEP_ESCALATION_FOR_COMPLETION);
		escalationStep.invoke();			
	}*/
	
	/*public void testForward() { // re-assign
		HashMap inputs = new HashMap();
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	 	
		int id = Common.getMaxId(context, "activity_log", "activity_log_id");
		Forward forwardStep = new Forward(context, Constants.HELPDESK_ACTIVITY_ID, id, Forward.STEP_FORWARD_EMPLOYEE, "ABERNATHY, ALISON");
		forwardStep.invoke();			
	}*/
	
	//18.2 Estimation step assigned to role
	public void testEstimationByRole() throws ParseException{
		/*EventHandlerContext context = createTestContext();
        try {
            ContextStore.get().setEventHandlerContext(context);
         */   
            Map<String,Object> inputs = new HashMap<String,Object>();
            EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		
			Map<String,Object> activity_log = new HashMap<String,Object>();        
	        activity_log.put("activity_log.requestor","AFM");
	        activity_log.put("activity_log.site_id","MARKET");
	        activity_log.put("activity_log.bl_id", "HQ");
	        activity_log.put("activity_log.description","test estimation by role");
	        activity_log.put("activity_log.priority", new Integer(1));
	        activity_log.put("activity_log.activity_type","SERVICE DESK - MAINTENANCE");
	        activity_log.put("activity_log.prob_type", "LIGHTBULB");
        
	        inputs.put("fields", activity_log);	
	        
	        Map response = new HashMap();		
			fixture.runEventHandlerMethod(
					ACTIVITY_HELPDESK,
		            "com.archibus.eventhandler.helpdesk.RequestHandler",
		            "submitRequest",
		            inputs,
		            response, transactionContext);
			
			JSONObject json = new JSONObject((String) response.get("jsonExpression"));
			int activity_log_id = json.getInt("activity_log_id");
			
			assertNotNull(Common.getValue(context, "activity_log", "wr_id", "activity_log_id = " +activity_log_id));
			Integer wr_id = (Integer) Common.getValue(context, "activity_log", "wr_id", "activity_log_id = " +activity_log_id);
			
			Object tmp = Common.getValue(context,"helpdesk_step_log","step_log_id","table_name='wr' AND pkey_value="+wr_id+" AND user_name='AFM' AND step_type='estimation'");
			assertNotNull(tmp);
			Integer estimationStepId = (Integer) tmp;
			
			inputs = new HashMap();
			Map fields = new HashMap();
			fields.put("wr.wr_id",wr_id);
			fields.put("wr.prob_type", "LIGHTBULB");
			fields.put("wr.requestor","AFM");
			fields.put("wr.site_id","MARKET");
			fields.put("wr.bl_id", "HQ");
			fields.put("wr.description","test estimation by role");
			fields.put("wr.priority", new Integer(1));
			fields.put("wr.activity_type","SERVICE DESK - MAINTENANCE");
			fields.put("wr_step_waiting.step_log_id", estimationStepId);
			
			inputs.put("fields", fields);	
			
			fixture.runEventHandlerMethod(
					ACTIVITY_ONDEMANDWORK,
		            "com.archibus.eventhandler.ondemandwork.WorkRequestHandler",
		            "completeEstimation",
		            inputs,
		            response, transactionContext);
			
			assertNull(Common.getValue(context,"wr","step_status","wr_id = " +wr_id));
			assertEquals("estimated",Common.getValue(context,"helpdesk_step_log","step_status_result","step_log_id = " + estimationStepId));
			
			//assign WR to WO
			inputs = new HashMap();
			fields = new HashMap();
			fields.put("wo.bl_id","HQ");
			fields.put("wo.supervisor","AFM");
			fields.put("wo.description", "test estimation by role");
			inputs.put("fields",fields);
			
			JSONArray records = new JSONArray();
			JSONObject record = new JSONObject();
			record.put("wr.wr_id", wr_id);
			records.put(record);
			inputs.put("records", records);
			
			fixture.runEventHandlerMethod(
					ACTIVITY_ONDEMANDWORK,
		            "com.archibus.eventhandler.ondemandwork.WorkRequestHandler",
		            "saveNewWorkorder",
		            inputs,
		            response, transactionContext);
			
			int wo_id = Common.getMaxId(context, "wo", "wo_id");
			assertEquals(wo_id, Common.getValue(context,"wr","wo_id","wr_id = " +wr_id));
			assertEquals("AA", Common.getStatusValue(context, "wr", "wr_id", wr_id));
			
			tmp = Common.getValue(context,"helpdesk_step_log","step_log_id","table_name='wr' AND pkey_value="+wr_id+" AND user_name='AFM' AND step_type='scheduling'");
			assertNotNull(tmp);
			Integer scheduleStepId = (Integer) tmp;
			
			inputs = new HashMap();
			fields = new HashMap();
			fields.put("wr.wr_id",wr_id);
			fields.put("wr.prob_type", "LIGHTBULB");
			fields.put("wr.requestor","AFM");
			fields.put("wr.site_id","MARKET");
			fields.put("wr.bl_id", "HQ");
			fields.put("wr.description","test estimation by role");
			fields.put("wr.priority", new Integer(1));
			fields.put("wr.activity_type","SERVICE DESK - MAINTENANCE");
			fields.put("wr_step_waiting.step_log_id", scheduleStepId);
			
			inputs.put("fields", fields);	
			
			fixture.runEventHandlerMethod(
					ACTIVITY_ONDEMANDWORK,
		            "com.archibus.eventhandler.ondemandwork.WorkRequestHandler",
		            "completeScheduling",
		            inputs,
		            response, transactionContext);
			
			assertNull(Common.getValue(context,"wr","step_status","wr_id = " +wr_id));
			assertEquals("scheduled",Common.getValue(context,"helpdesk_step_log","step_status_result","step_log_id = " + scheduleStepId));
			fixture.verifyRow("helpdesk_step_log","step_log_id = " +scheduleStepId,new String[]{"step_status_result"},new String[]{"scheduled"});
			fixture.verifyRow("helpdesk_step_log","step_log_id = " +estimationStepId,new String[]{"step_status_result"},new String[]{"estimated"});
			fixture.verifyRow("wo", "wo_id="+wo_id, new String[]{"supervisor","bl_id"}, new String[]{"AFM","HQ"});
			fixture.verifyRow("wr","wr_id = " + wr_id, new String[]{"bl_id","status"}, new String[]{"HQ","AA"});
			fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, new String[]{"bl_id","status"},new String[]{"HQ","APPROVED"});
			
        /*} finally {
        	releaseTestContext(context);
        }*/
		
	}
	 
	  
	  
}
