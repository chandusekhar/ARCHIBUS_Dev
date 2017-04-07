/**
 * 
 */
package com.archibus.eventhandler.sla;

import java.sql.Time;
import java.text.ParseException;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;

import org.dom4j.DocumentException;
import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.eventhandler.sla.ServiceLevelAgreementHandler;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 *
 *
 */
public class TestServiceLevelAgreementHandler extends TestCase {
	    
	    static final String ACTIVITY_ID = "AbBldgOpsHelpDesk";
	    static final String EVENT_HANDLER_CLASS = "com.archibus.eventhandler.sla.ServiceLevelAgreementHandler";
	    static final String ACTIVITY_TABLE = "activity_log";
	    static Integer activity_log_id;
	    
	    private static EventHandlerFixture fixture = null;
	    private static Object transactionContext = null;
		
		public static Test suite() {
			TestSuite testSuite = new TestSuite(TestServiceLevelAgreementHandler.class);
			
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
			try{
				fixture.rollbackTransaction(transactionContext);
			} catch(Exception e){}
		}
		
	public void testMoveRule(){
		 Map inputs = new HashMap();
		 EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
		 Object tmp = Common.getValue(context,"helpdesk_sla_request","ordering_seq",
				 "activity_type = 'SERVICE DESK - MAINTENANCE' AND ordering_seq = (SELECT MAX(ordering_seq) FROM helpdesk_sla_request WHERE activity_type = 'SERVICE DESK - MAINTENANCE')");
		 
		 Integer ord_seq = (Integer) tmp;
		 String xml = "<record helpdesk_sla_request.ordering_seq=\""+ord_seq+"\" helpdesk_sla_request.activity_type=\"SERVICE DESK - MAINTENANCE\">" +
			"<keys helpdesk_sla_request.ordering_seq=\""+ord_seq+"\" helpdesk_sla_request.activity_type=\"SERVICE DESK - MAINTENANCE\"/></record>";
		 
		 inputs.put("record", xml);
		 inputs.put("dir", "up");
		 
		 Map response = new HashMap();
		 try {
			 fixture.runEventHandlerMethod(
			   		ACTIVITY_ID,
			   		EVENT_HANDLER_CLASS,
				    "moveRule",
				    inputs,
				    response, transactionContext); 
		 } catch (ServiceLevelAgreementException slaE){}
	 }
		
		public void testCheckConflicts(){
			String xml = "<record helpdesk_sla_request.ordering_seq=\"2\" helpdesk_sla_request.activity_type=\"SERVICE DESK - TEST\">" +
					"<keys helpdesk_sla_request.ordering_seq=\"2\" helpdesk_sla_request.activity_type=\"SERVICE DESK - TEST\"/></record>";
			
			Map inputs = new HashMap();
			inputs.put("ordering_seq" , new Integer(2));
			inputs.put("activity_type", xml);
			
			Map response = new HashMap();
			fixture.runEventHandlerMethod(
		       		ACTIVITY_ID,
			        EVENT_HANDLER_CLASS,
			        "checkConflicts",
			        inputs,
			        response, transactionContext); 
		}
		
		public void testGetHelperRules() throws ExceptionBase {	    	
		     	
		        Map inputs = new HashMap();		
		        Map response = new HashMap();
		        
		        inputs.put("activity_type", "SERVICE DESK - REQUEST");	
		        inputs.put("priority", new Integer(0));	
		        inputs.put("ordering_seq", new Integer(2));	
		      
		        
		        fixture.runEventHandlerMethod(
			       		ACTIVITY_ID,
				           EVENT_HANDLER_CLASS,
				           "getHelperRules",
				           inputs,
				           response, transactionContext);     
		     
		      assertNotNull(response.get("jsonExpression"));		        
		} 		
		
		public void testGetServiceWindowStartFromSLA() throws ParseException{
			
			Map inputs = new HashMap();
			Map response = new HashMap();
			
			Map fields = new HashMap();
			fields.put("requestor", "AFM");
			fields.put("phone_requestor","227-2508");
			fields.put("site_id","MARKET");
			fields.put("bl_id","HQ");
			fields.put("priority",new Integer(1));
			fields.put("activity_type","SERVICE DESK - TEST");
			fields.put("created_by", "AFM");
			
			inputs.put("fields",fields);	       
			
			fixture.runEventHandlerMethod(
					"AbBldgOpsHelpDesk",
		            "com.archibus.eventhandler.helpdesk.RequestHandler",
		            "saveRequest",
		            inputs,
		            response, 
		            transactionContext);
			
			assertNotNull(response.get("jsonExpression"));
			  
			JSONObject jsonObject = new JSONObject((String) response.get("jsonExpression"));
			int activity_log_id = jsonObject.getInt("activity_log_id");
			
			inputs = new HashMap();
			response = new HashMap();
			
			inputs.put("table_name", "activity_log");
			inputs.put("field_name", "activity_log_id");
			inputs.put("pkey_value", new Integer(activity_log_id));
			
			fixture.runEventHandlerMethod(
					ACTIVITY_ID,
			        EVENT_HANDLER_CLASS,
			        "getServiceWindowStartFromSLA",
			        inputs,
			        response, transactionContext);
			
			assertNotNull(response.get("jsonExpression"));			
			JSONObject start = new JSONObject((String) response.get("jsonExpression"));
			assertEquals("'09:00:00'", start.get("time_start").toString());
		}
		
		public void testDeterminePriority() throws ParseException{
			Map inputs = new HashMap();
			inputs.put("ord_seq",new Integer(1));
			
			Map fields = new HashMap();
			fields.put("activity_type", "SERVICE DESK - FURNITURE");
			Calendar cal = new GregorianCalendar();
			cal.add(Calendar.DATE, 10);
			fields.put("date_required",cal.getTime());			
			inputs.put("fields", fields);
			
			Map response = new HashMap();
			
			fixture.runEventHandlerMethod(
					ACTIVITY_ID,
			        EVENT_HANDLER_CLASS,
			        "determinePriority",
			        inputs,
			        response, transactionContext);
			
			assertNotNull(response.get("jsonExpression"));
			JSONObject result = new JSONObject((String) response.get("jsonExpression"));
			assertEquals(new Integer(1), result.get("possible"));
			assertEquals(new Integer(2),result.get("priority"));
		}
				
		public void testDeterminePriority2() throws ParseException{
			Map inputs = new HashMap();
			inputs.put("ord_seq",new Integer(1));
			
			Map fields = new HashMap();
			fields.put("activity_type", "SERVICE DESK - MAINTENANCE");
			fields.put("prob_type", "AN EMERGENCY");
			Calendar cal = new GregorianCalendar();
			cal.add(Calendar.MONTH, 1);
			fields.put("date_required",cal.getTime());			
			inputs.put("fields", fields);
			
			Map response = new HashMap();
			
			fixture.runEventHandlerMethod(
					ACTIVITY_ID,
			        EVENT_HANDLER_CLASS,
			        "determinePriority",
			        inputs,
			        response, transactionContext);
			
			assertNotNull(response.get("jsonExpression"));
			JSONObject result = new JSONObject((String) response.get("jsonExpression"));
			assertEquals(new Integer(-1), result.get("possible"));
		}
		
		public void testGetPriorityLevels() throws ParseException{
			Map inputs = new HashMap();
			inputs.put("ordering_seq", new Integer(5));
			inputs.put("activity_type", "SERVICE DESK - FURNITURE");
			
			Map response = new HashMap();
			
			fixture.runEventHandlerMethod(
					ACTIVITY_ID,
			        EVENT_HANDLER_CLASS,
			        "getPriorityLevels",
			        inputs,
			        response, transactionContext);
			
			assertNotNull(response.get("jsonExpression"));
			
			JSONObject json = new JSONObject((String) response.get("jsonExpression"));
			assertEquals("Urgent",json.getString("priority_level_1"));
			assertEquals("Normal",json.getString("priority_level_2"));
			assertEquals("Low",json.getString("priority_level_3"));
		}
		
		public void testGetSLAInformation(){
			Map inputs = new HashMap();
			inputs.put("ordering_seq", new Integer(5));
			inputs.put("activity_type", "SERVICE DESK - FURNITURE");
			inputs.put("priority", new Integer(1));
			
			Map response = new HashMap();
			
			fixture.runEventHandlerMethod(
					ACTIVITY_ID,
			        EVENT_HANDLER_CLASS,
			        "getSLAInformation",
			        inputs,
			        response, transactionContext);
			
			assertNotNull(response.get("jsonExpression"));
			System.err.println(response.get("jsonExpression"));
		}
		
		public void testGetWrSLAConditionParameters() throws ExceptionBase {	   
		 	
	        Map inputs = new HashMap();		        
	        Map fields = new HashMap();
		    
		    fields.put("wr.requestor", "AFM");	
		    fields.put("wr.created_by", "");	
		    
		    fields.put("wr.dv_id", "227-2508");	
		    fields.put("wr.dp_id", "");	
		    
		    fields.put("wr.phone", "");	
		    fields.put("wr.site_id", "MARKET");	
		    fields.put("wr.bl_id", "HQ");	
		    fields.put("wr.fl_id", "17");
		    fields.put("wr.rm_id", "126");
		    
		    fields.put("wr.activity_type", "SERVICE DESK - MAINTENANCE");
		    fields.put("wr.prob_type", "DOOR");
		    fields.put("wr.priority", "1");		 
		    
		    fields.put("wr.wr_id",new Integer(950000192));
		    fields.put("wr.wo_id", new Integer(1999000047));
	        
		    JSONObject record = new JSONObject(fields);
	        inputs.put("fields", fields);	        
	        
	        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	          
	        
	        ServiceLevelAgreementHandler handler = new ServiceLevelAgreementHandler();	        
	        handler.getSLAConditionParameters("wr","wr_id",record);
	        
	        assertNotNull(context.getParameter("jsonExpression"));
	        System.err.println("Get SLA WR " + context.getParameter("jsonExpression"));
		}
		
		public void testGetSLAConditionParameters() throws ExceptionBase {	   
		 	
	        Map inputs = new HashMap();		        
	        Map fields = new HashMap();
		    
		    fields.put("activity_log.requestor", "");	
		    fields.put("activity_log.created_by", "");	
		    
		    fields.put("activity_log.dv_id", "");	
		    fields.put("activity_log.dp_id", "");	
		    
		    fields.put("activity_log.phone", "");	
		    fields.put("activity_log.site_id", "");	
		    fields.put("activity_log.bl_id", "");	
		    fields.put("activity_log.fl_id", "");		    
		    
		    fields.put("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");	
		    fields.put("activity_log.prob_type", "TC-NETWORK CONN.");	 
	        
		    JSONObject record = new JSONObject(fields);
	        inputs.put("fields", fields);
	        
	        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	          
	        
	        ServiceLevelAgreementHandler handler = new ServiceLevelAgreementHandler();	        
	        handler.getSLAConditionParameters("activity_log","activity_log_id",record);
	        
	        assertNotNull(context.getParameter("jsonExpression"));
	        System.err.println(context.getParameter("jsonExpression"));
		}
		
	public void testSaveSLAProblemParameters() throws ExceptionBase, ParseException {	    	
	    Map inputs = new HashMap();		
	    Map response = new HashMap();
	        
	    Map fields = new HashMap();
	    fields.put(Constants.SLA_REQUEST_TABLE+".activity_type", Constants.ON_DEMAND_WORK);
	    fields.put(Constants.SLA_REQUEST_TABLE+".ordering_seq",new Integer(1));
	    inputs.put("fields", fields);
	        	            
	    fixture.runEventHandlerMethod(
	    		ACTIVITY_ID,
			    EVENT_HANDLER_CLASS,
			    "saveSLAProblemParameters",
			    inputs,
			    response, transactionContext
	    	);  
	    
	    assertNotNull(response.get("jsonExpression"));
	    JSONObject json = new JSONObject((String) response.get("jsonExpression"));
	    assertEquals(json.get("found"),new Integer(1));
	    assertEquals(json.get("conflict"),new Integer(0));
	}
		
	public void testSaveSLAProblemParameters2() throws ExceptionBase {	    	
	     	
	        Map inputs = new HashMap();		        
	        Map fields = new HashMap();
	        
	        fields.put(Constants.SLA_REQUEST_TABLE+".activity_type", Constants.ON_DEMAND_WORK);
	        fields.put(Constants.SLA_REQUEST_TABLE+".site_id", "MARKET");
	        fields.put(Constants.SLA_REQUEST_TABLE+".bl_id", "HQ");
	        
	        fields.put(Constants.SLA_REQUEST_TABLE+".prob_type", "DOOR");
	        
	        JSONObject record = new JSONObject(fields);
	        inputs.put("fields", fields);
	        
	        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	          
	        ServiceLevelAgreementHandler handler = new ServiceLevelAgreementHandler();	        
	        handler.saveSLAProblemParameters(record,null,null);
	        
	        assertNotNull(context.getParameter("jsonExpression"));         	
	} 
	
	public void testSaveSLAProblemParametersCopy() throws ExceptionBase, ParseException {	    	
     	fixture.executeSql("DELETE FROM helpdesk_sla_request WHERE activity_type='SERVICE DESK - MAINTENANCE' AND prob_type='REPLACE' AND eq_std = 'FIRE-EXT.-20-CO2'", transactionContext);
        Map inputs = new HashMap();		        
        Map fields = new HashMap();
        
        fields.put(Constants.SLA_REQUEST_TABLE+".activity_type", Constants.ON_DEMAND_WORK);        
        fields.put(Constants.SLA_REQUEST_TABLE+".prob_type", "REPLACE");
        fields.put(Constants.SLA_REQUEST_TABLE+".eq_std", "FIRE-EXT.-20-CO2");
        
        inputs.put("fields", fields);
		inputs.put("activity_type_copy", Constants.ON_DEMAND_WORK);
		inputs.put("ordering_seq_copy", new Integer(6));
        
        Map response = new HashMap();
          
        fixture.runEventHandlerMethod(
	       		ACTIVITY_ID,
		        EVENT_HANDLER_CLASS,
		        "saveSLAProblemParameters",
		        inputs,
		        response, transactionContext);
        fixture.commitTransaction(transactionContext);
        
        assertNotNull(response.get("jsonExpression"));
        JSONObject result = new JSONObject((String) response.get("jsonExpression"));
        assertEquals(result.get("found"), new Integer(0));
        assertNotNull(result.get("ordering_seq"));
        assertEquals(result.get("activity_type"),Constants.ON_DEMAND_WORK);
        
        int ordering_seq = result.getInt("ordering_seq");
        fixture.verifyRow("helpdesk_sla_request", 
        		"activity_type = '"+Constants.ON_DEMAND_WORK+"' AND ordering_seq" +ordering_seq,
        		new String[]{"prob_type","eq_std"}, new String[]{"REPLACE","FIRE-EXT.-20-CO2"});
        
        fixture.verifyRow(Constants.SLA_RESPONSE_TABLE,"activity_type = 'SERVICE DESK - MAINTENANCE' AND ordering_seq" +ordering_seq + " AND priority = 1",
        		new String[]{"priority_label"},new String[]{"urgent"});
        
	} 
	
	
	  public void testSaveSLAResponseParameters() throws ExceptionBase, DocumentException {	    	
     	
        Map inputs = new HashMap();		        
        Map fields = new HashMap();
                
        fields.put(Constants.SLA_RESPONSE_TABLE+".activity_type", Constants.ON_DEMAND_WORK);         
        fields.put(Constants.SLA_RESPONSE_TABLE+".ordering_seq", new Integer(2));
        fields.put(Constants.SLA_RESPONSE_TABLE+".priority", new Integer(1));
        
        fields.put(Constants.SLA_RESPONSE_TABLE+".manager", "AFM");
        fields.put(Constants.SLA_RESPONSE_TABLE+".supervisor", "AFM");
        fields.put(Constants.SLA_RESPONSE_TABLE+".serv_window_days", "0,1,1,1,1,1,0");
        fields.put(Constants.SLA_RESPONSE_TABLE+".serv_window_start", new Time(9,0,0));
        fields.put(Constants.SLA_RESPONSE_TABLE+".serv_window_end", new Time(17,0,0));
        
        JSONObject record = new JSONObject(fields);
        inputs.put("fields", fields);
        
        String xml = "<states><state activity='AbBldgOpsHelpDesk' value='REQUESTED'><approval step='manager approval' em_id='AFM' /></state></states>";
        inputs.put("xml_helper_rules",xml );
        
        EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
          
        ServiceLevelAgreementHandler handler = new ServiceLevelAgreementHandler();	        
        handler.saveSLAResponseParameters(record,xml);
        
        assertNotNull(context.getParameter("jsonExpression"));           	
	} 
		
		public void testCopyRule() throws ParseException {
			JSONArray records = new JSONArray();
			JSONObject record = new JSONObject();
			record.put("helpdesk_sla_request.activity_type", "SERVICE DESK - FURNITURE");
			record.put("helpdesk_sla_request.ordering_seq", "1");
			records.put(record);

			Map inputs = new HashMap();
			inputs.put("records", records);
			Map response = new HashMap();
			
			fixture.runEventHandlerMethod(
		       		ACTIVITY_ID,
			           EVENT_HANDLER_CLASS,
			           "copyRule",
			           inputs,
			           response, transactionContext);
			
			assertTrue(response.containsKey("jsonExpression"));
			String strjson = (String) response.get("jsonExpression");
			JSONObject json = new JSONObject(strjson);
			
			int ordering_seq = json.getInt("ordering_seq");
			String activity_type = json.getString("activity_type");
			String where = "ordering_seq = " + ordering_seq + " AND activity_type = '" + activity_type + "'";
			System.err.println(where);
			String[] fields = {"activity_type"};
			String[] values = {"SERVICE DESK - FURNITURE"};
			fixture.verifyRow(Constants.SLA_REQUEST_TABLE, where, fields, values);
			
		}
		
}
