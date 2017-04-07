package com.archibus.eventhandler.ondemandwork;


import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

import com.archibus.eventhandler.helpdesk.TestAll;
import com.archibus.fixture.EventHandlerFixture;
import com.archibus.fixture.EventHandlerFixture.EventHandlerContextImplTest;
import com.archibus.jobmanager.EventHandlerContext;

import junit.extensions.TestSetup;
import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;


public class TestScheduleHandler extends TestCase {
	/**
     *  Helper object providing test-related resource and methods.
     */ 
	static final String ACTIVITY_ID = "AbBldgOpsOnDemandWork";
    static final String EVENT_HANDLER_CLASS = "com.archibus.eventhandler.ondemandwork.ScheduleHandler";
    private static EventHandlerFixture fixture = null;
    private static Object transactionContext = null;
	
	public static Test suite() {
		TestSuite testSuite = new TestSuite(TestScheduleHandler.class);
		
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
		try {
			fixture.rollbackTransaction(transactionContext);
		} catch (Exception e){}
	}
	
	
	public void testSaveAssignment() {
		Map inputs = new HashMap();
		Map response = new HashMap();		
		
		JSONObject fieldValues = new JSONObject();
		fieldValues.put("wrcf.wr_id", "1");
		fieldValues.put("wrcf.cf_id", "WERKMAN1");
		fieldValues.put("wrcf.date_assigned", "2007-10-10");
		fieldValues.put("wrcf.time_assigned", "14:08.00.000");
		fieldValues.put("wrcf.work_type", "W");
		fieldValues.put("wrcf.comments", "test 8");
		fieldValues.put("wrcf.hours_est", "9");
				
		JSONObject oldFieldValues = new JSONObject();
		oldFieldValues.put("wrcf.wr_id", "1");
		oldFieldValues.put("wrcf.cf_id", "WERKMAN1");
		oldFieldValues.put("wrcf.date_assigned", "2007-10-10");
		oldFieldValues.put("wrcf.time_assigned", "14:08.00.000");
		oldFieldValues.put("wrcf.work_type", "W");
		oldFieldValues.put("wrcf.comments", "test");
		oldFieldValues.put("wrcf.hours_est", "2");
		
		/*
		JSONObject fieldValues = new JSONObject();
		fieldValues.put("wrcf.wr_id", "950000128");
		fieldValues.put("wrcf.cf_id", "FINERS PLUMBING");
		fieldValues.put("wrcf.date_assigned", "2007-10-10");
		fieldValues.put("wrcf.time_assigned", "14:08.00.000");
		fieldValues.put("wrcf.work_type", "W");
		fieldValues.put("wrcf.comments", "test 8");
		fieldValues.put("wrcf.hours_est", "9");
				
		JSONObject oldFieldValues = new JSONObject();
		oldFieldValues.put("wrcf.wr_id", "950000128");
		oldFieldValues.put("wrcf.cf_id", "FINERS PLUMBING");
		oldFieldValues.put("wrcf.date_assigned", "2007-10-10");
		oldFieldValues.put("wrcf.time_assigned", "14:08.00.000");
		oldFieldValues.put("wrcf.work_type", "W");
		oldFieldValues.put("wrcf.comments", "test");
		oldFieldValues.put("wrcf.hours_est", "2");*/
		
		JSONArray fieldNames = new JSONArray();		
		fieldNames.put("wrcf.wr_id");fieldNames.put("wrcf.cf_id");
		fieldNames.put("wrcf.date_assigned"); fieldNames.put("wrcf.time_assigned");
		fieldNames.put("wrcf.work_type"); fieldNames.put("wrcf.comments"); fieldNames.put("wrcf.hours_est");
		
		inputs.put("tableName", "wrcf"); 
		inputs.put("fieldNames", fieldNames); 
		inputs.put("fieldValues", fieldValues); 
		inputs.put("oldFieldValues", oldFieldValues); 
		inputs.put("isNewRecord", "true"); // for true
				
		fixture.runEventHandlerMethod(
				"AbBldgOpsOnDemandWork",
	            "com.archibus.eventhandler.ondemandwork.ScheduleHandler",
	            "saveAssignment",
	            inputs,
	            response, 
	            transactionContext);
		
		 
	}
	
	public void testGetWorkRequestDetails() {
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		Map fields = new HashMap();
		fields.put("wr_id", new Integer(1) ); 
		
		inputs.put("fields",fields);	       
		
		fixture.runEventHandlerMethod(
				"AbBldgOpsOnDemandWork",
	            "com.archibus.eventhandler.ondemandwork.ScheduleHandler",
	            "getWorkRequestDetails",
	            inputs,
	            response, 
	            transactionContext); 
		
		/* EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	     
		ScheduleHandler scheduleHandler = new ScheduleHandler();
			
		scheduleHandler.getWorkRequestDetails(context);*/
		
		assertNotNull(response.get("jsonExpression"));
		
		System.out.println("results details");
		
		System.out.println(response.get("jsonExpression"));		
	}
	
	
	public void testFilterWorkRequests() {
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		// Map fields = new HashMap();
		// fields.put("filter", "[ {'wo_id','1999000604'} ]" ); 
		
		// inputs.put("fields", fields);	
		
		inputs.put("restriction", "[ {'wo_id','1999000604'}, {'site_id','MARKET'} ]");		
		
		fixture.runEventHandlerMethod(
				"AbBldgOpsOnDemandWork",
	            "com.archibus.eventhandler.ondemandwork.ScheduleHandler",
	            "filterWorkRequests",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		
		System.out.println("results wr");
		
		System.out.println(response.get("jsonExpression"));		
	}
	
	public void testGetCraftspersons() {
		Map inputs = new HashMap();
		Map response = new HashMap();
						
		fixture.runEventHandlerMethod(
				"AbBldgOpsOnDemandWork",
	            "com.archibus.eventhandler.ondemandwork.ScheduleHandler",
	            "getCraftspersons",
	            inputs,
	            response, 
	            transactionContext); 
		
		/* EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	     
		ScheduleHandler scheduleHandler = new ScheduleHandler();
		scheduleHandler.getCraftspersons(context);*/
		
		assertNotNull(response.get("jsonExpression"));
		
		System.out.println("results cf");
		
		System.out.println(response.get("jsonExpression"));		
	}
	
 
	
	
	public void testGetAssignments() {
		Map inputs = new HashMap();
		
		inputs.put("startDate", "2007-02-01");
		inputs.put("endDate", "2007-12-11");
		
		
		EventHandlerContext context = new EventHandlerContextImplTest(inputs, fixture.getUserSession(), transactionContext, null);
	     
		ScheduleHandler scheduleHandler = new ScheduleHandler();
		
		JSONObject json = new JSONObject(inputs);
		
		scheduleHandler.getAssignments(json.toString()); 
		
		assertNotNull(context.getParameter("jsonExpression"));
			
	}
	
	
	public void testHolidays() {
		Map inputs = new HashMap();
		Map response = new HashMap();
		
		// inputs.put("site_id", ""); 
				
		fixture.runEventHandlerMethod(
				"AbBldgOpsOnDemandWork",
	            "com.archibus.eventhandler.ondemandwork.ScheduleHandler",
	            "getHolidays",
	            inputs,
	            response, 
	            transactionContext);
		
		assertNotNull(response.get("jsonExpression"));
		
		System.out.println("results holidays");
		
		System.out.println(response.get("jsonExpression"));		
	}
 
	

}
