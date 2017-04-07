package com.archibus.eventhandler.steps;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
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

public class TestStepHandler extends TestCase {
	
	private static final String ACTIVITY_ID = "AbBldgOpsHelpDesk";
	private static final String EVENT_HANDLER_CLASS = "com.archibus.eventhandler.steps.StepHandler";
	
	private static EventHandlerFixture fixture = null;
	private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestStepHandler.class);
		
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
	
	/*public void testForwardStep() throws ParseException{
		Map inputs = new HashMap();
		
		Map activity_log = new HashMap();
		activity_log.put("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
		activity_log.put("activity_log.prob_type", "DOOR");
		activity_log.put("activity_log.site_id", "MARKET");
		activity_log.put("activity_log.requestor", "ABERNATHY, ALISON");
		activity_log.put("activity_log.description", "test forward step");
		activity_log.put("activity_log.priority", 3);
		
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
		int wrId = Common.getMaxId(context,"wr","wr_id","activity_log_id = " + activity_log_id);
		int stepLogId = Common.getMaxId(context, "helpdesk_step_log", "step_log_id","step_type='estimation'");
		
		assertNotNull(Common.getValue(context, "wr", "prob_type", "wr_id = " + wrId));
		assertEquals(wrId,Common.getValue(context,"helpdesk_step_log","pkey_value","step_log_id = " + stepLogId));
		
		inputs = new HashMap();
		inputs.put("activityId","AbBldgOpsOnDemandWork");
		inputs.put("id",wrId);
		inputs.put("stepLogId", stepLogId);
		inputs.put("comments", "test forward");
		inputs.put("forwardTo", "CRAFTSPERSON");
		
		response = new HashMap();		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            "com.archibus.eventhandler.steps.StepHandler",
	            "forwardStep",
	            inputs,
	            response, transactionContext);
		
		int stepLogIdNew = Common.getMaxId(context, "helpdesk_step_log", "step_log_id","step_type='estimation' AND pkey_value = " +wrId);
		
		
		inputs = new HashMap();
		Map fields = new HashMap();
		fields.put("wr.wr_id",wrId);
		fields.put("wr_step_waiting.step_log_id", stepLogIdNew);
		
		inputs.put("fields",fields);
		response = new HashMap();	
		
		fixture.runEventHandlerMethod(
	            Constants.ONDEMAND_ACTIVITY_ID,
	            "com.archibus.eventhandler.ondemandwork.WorkRequestHandler",
	            "completeEstimation",
	            inputs,
	            response, transactionContext);
		
		int stepLogIdEstApp = Common.getMaxId(context, "helpdesk_step_log", "step_log_id","step_type='approval' AND pkey_value = " +wrId);
		
		fixture.verifyRow("activity_log", "activity_log_id = " + activity_log_id, 
				new String[]{"status","wr_id"}, new String[]{"APPROVED",String.valueOf(wrId)});
		fixture.verifyRow("wr", "wr_id = " + wrId,
				new String[]{"status","step_status"}, new String[]{"A","waiting"});
		fixture.verifyRow("helpdesk_step_log", "step_log_id = " + stepLogId, 
				new String[]{"table_name","pkey_value","step_status_result","comments"}, 
				new String[]{"wr",String.valueOf(wrId),"forwarded","Step forwarded by SYSTEM :: test forward"});
		fixture.verifyRow("helpdesk_step_log", "step_log_id = " + stepLogIdNew, 
				new String[]{"table_name","pkey_value","step_type","em_id"}, 
				new String[]{"wr",String.valueOf(wrId),"estimation","CRAFTSPERSON"});
		fixture.verifyRow("helpdesk_step_log","step_log_id = " + stepLogIdEstApp,
				new String[]{"table_name","pkey_value","step_type"},
				new String[]{"wr",String.valueOf(wrId),"approval"});
	}*/
	
	/*public void testCheckWorkflowSubstitute() {
		Map inputs = new HashMap();
		
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		
		fixture.executeSql("DELETE FROM workflow_substitutes WHERE em_id = 'ABERNATHY, ALISON' AND substitute_id = 'ADAMS, CHRIS'", transactionContext);
		
		fixture.executeSql("DELETE FROM workflow_substitutes WHERE em_id = 'ADAMS, CHRIS' AND substitute_id = 'BLUM, JOEL'", transactionContext);
		
		String substitute = StepHandler.checkWorkflowSubstitute(context, "AFM");
		assertNotNull(substitute);
		//assertEquals("ABERNATHY, ALISON", substitute);
		
		substitute = StepHandler.checkWorkflowSubstitute(context, "BLUM, JOEL");
		assertNotNull(substitute);
		//assertEquals("ABERNATHY, ALISON", substitute);
		
		//assertNull(StepHandler.checkWorkflowSubstitute(context,"ABERNATHY, ALISON"));
		
		substitute = StepHandler.checkWorkflowSubstitute(context, "ABERNATHY, ALISON");
		assertNotNull(substitute);
		assertEquals("BLUM, JOEL", substitute);
		
		/*Date date = new Date();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		fixture.executeSql("INSERT INTO workflow_substitutes (em_id, substitute_id, start_date_unavailable,end_date_unavailable)" +
			" VALUES ('ABERNATHY, ALISON','ADAMS, CHRIS','"+sdf.format(date)+"' , '"+sdf.format(date)+"')", transactionContext);
		
		fixture.executeSql("INSERT INTO workflow_substitutes (em_id, substitute_id, start_date_unavailable,end_date_unavailable)" +
				" VALUES ('ADAMS, CHRIS','BLUM, JOEL','"+sdf.format(date)+"' , '"+sdf.format(date)+"')", transactionContext);
		
		substitute = StepHandler.checkWorkflowSubstitute(context, "AFM");
		assertNotNull(substitute);
		assertEquals("ADAMS, CHRIS", substitute);
	}*/
	
	/*public void testGetStepConditionFieldsForActivity() throws ParseException{
		Map inputs = new HashMap();
		Map response = new HashMap();
		inputs.put("activity_id", "AbBldgOpsHelpDesk");
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "getStepConditionFieldsForActivity",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		JSONArray result = new JSONArray((String) response.get("jsonExpression"));
		assertEquals(result.length(), 8);
		assertEquals(result.getJSONObject(1).getString("text"), "Building Code");
	}
	
	public void testGetSelectValueForConditionField()throws ParseException {
		Map inputs = new HashMap();
		Map response = new HashMap();
		inputs.put("activity_id", "AbBldgOpsHelpDesk");
		inputs.put("condition_field", "bl_id");
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "getSelectValueForConditionField",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		JSONObject result = new JSONObject((String) response.get("jsonExpression"));
		
		assertEquals("bl",result.get("table"));
		assertEquals("bl_id",result.get("field"));
		
		inputs = new HashMap();
		response = new HashMap();
		inputs.put("activity_id", "AbBldgOpsHelpDesk");
		inputs.put("condition_field", "dp_id");
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "getSelectValueForConditionField",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		result = new JSONObject((String) response.get("jsonExpression"));
		
		assertEquals("dp",result.get("table"));
		assertEquals("dp_id",result.get("field"));
		
		inputs = new HashMap();
		response = new HashMap();
		inputs.put("activity_id", "AbBldgOpsHelpDesk");
		inputs.put("condition_field", "cost_estimated");
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "getSelectValueForConditionField",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		result = new JSONObject((String) response.get("jsonExpression"));
		
		assertEquals("activity_log",result.get("table"));
		assertEquals("cost_estimated",result.get("field"));
		
		inputs = new HashMap();
		response = new HashMap();
		inputs.put("activity_id", "AbBldgOpsHelpDesk");
		inputs.put("condition_field", "dispatcher");
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "getSelectValueForConditionField",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		result = new JSONObject((String) response.get("jsonExpression"));
		
		assertEquals("em",result.get("table"));
		assertEquals("em_id",result.get("field"));	                     
	}
	
	public void testGetStatusValuesAndFormFieldsForActivity() throws ParseException{
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		inputs.put("activity_id", "AbBldgOpsHelpDesk");
		inputs.put("newStep",new Boolean(false));
		inputs.put("status", "REQUESTED");
		inputs.put("step", "Facility Approval");
		
		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "getStatusValuesAndFormFieldsForActivity",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		JSONObject result = new JSONObject((String) response.get("jsonExpression"));
		
		assertEquals(5, result.getJSONArray("fieldList").length());
		assertEquals(16, result.getJSONArray("statusList").length());
		
		JSONArray fields = result.getJSONArray("fieldList");
		for(int i=0;i<fields.length();i++){
			JSONObject json = fields.getJSONObject(i);
			if(json.getString("value").equals("dv_id") || json.getString("value").equals("dp_id")){
				assertEquals(json.getString("check"),"true");
			}
		}
	}
	
	public void testGetSteps() {
		Map inputs = new HashMap();
		Map response = new HashMap();

		fixture.runEventHandlerMethod(
	            ACTIVITY_ID,
	            EVENT_HANDLER_CLASS,
	            "getSteps",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
	}
	
	public void testGetStepForCode() throws ParseException{		
		String stepCode = Common.generateUUID();
		
		String sql = "INSERT INTO helpdesk_step_log (step_code,step,step_type,table_name,field_name,pkey_value,status,activity_id)" 
				+ " VALUES ('"+stepCode+"', 'Notification','notification','activity_log','activity_log_id',1,'Requested','AbBldgOpsHelpDesk')";
		
		fixture.executeSql(sql, transactionContext);
		fixture.commitTransaction(transactionContext);
		
		Map inputs = new HashMap();
		Map response = new HashMap();
		inputs.put("step_code",stepCode);
		
		fixture.runEventHandlerMethod(
		         ACTIVITY_ID,
		         EVENT_HANDLER_CLASS,
		         "getStepForCode",
		         inputs,
		         response, transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		JSONObject json = new JSONObject((String) response.get("jsonExpression"));
		assertEquals("Notification", json.get("step"));
		assertEquals("activity_log",json.get("table_name"));
	}
	
	public void testGetRequiredFieldsForStep(){
		 Map inputs = new HashMap();
		 //inputs.put("approval_type","Facility Approval");
		 inputs.put("approval_type","Estimation Approval");
		 inputs.put("status","AA");
	     Map response = new HashMap();
	                     
	     fixture.runEventHandlerMethod(
		         ACTIVITY_ID,
		         EVENT_HANDLER_CLASS,
		         "getRequiredFieldsForStep",
		         inputs,
		         response, transactionContext);
	      
	     assertNotNull(response.get("jsonExpression"));
	     System.err.println(response.get("jsonExpression"));
	}*/
	
	public void testGetStepInformation(){
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		inputs.put("table_name", "activity_log");
		inputs.put("field_name", "activity_log_id");
		inputs.put("pkey_value", new Integer(320));
		
		fixture.runEventHandlerMethod(
		         ACTIVITY_ID,
		         EVENT_HANDLER_CLASS,
		         "getStepInformation",
		         inputs,
		         response, transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		System.err.println(response.get("jsonExpression"));  
	}
	
	/*public void testCheckApprovalManager(){
		Map inputs = new HashMap();
		inputs.put("activity_log_id", "601");
		inputs.put("table_name","activity_log");
		Map response = new HashMap();
		
		fixture.runEventHandlerMethod(
		         ACTIVITY_ID,
		         EVENT_HANDLER_CLASS,
		         "checkApprovalManager",
		         inputs,
		         response, transactionContext);
		assertNotNull(response.get("message"));
	}*/

}
