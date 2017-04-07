package com.archibus.eventhandler.steps;

import java.util.*;

/**
 * 
 * Status conversion from activity_log to work request and vice versa<br />
 * Date fields per status for activity_log and wr 
 *
 */
public class StatusConverter {
	
	/**
	 * Basic request states activity_log -> wr 
	 */
	private static Map actionToWorkRequest = new HashMap();	
	/**
	 * Activity log corresponding date fields for basic states
	 */
	private static Map actionDateFields = new HashMap();	 
	/**
	 * Basic request states wr -> activity_log
	 */
	private static Map workRequestToAction = new HashMap();
	/**
	 * Wr corresponding date fields for basic states
	 */
	private static Map workRequestDateFields = new HashMap();
	
	/**
	 * Activity log corresponding time fields for basic states
	 */
	private static Map actionTimeFields = new HashMap();
	/**
	 * Wr corresponding time fields for basic states
	 */
	private static Map workRequestTimeFields = new HashMap();
	
	/* 
	 * N/A;N/A;CREATED;CREATED;REQUESTED;REQUESTED;APPROVED;APPROVED;REJECTED;REJECTED;
	 * TRIAL;TRIAL;BUDGETED;BUDGETED;PLANNED;PLANNED;SCHEDULED;SCHEDULED;
	 * CANCELLED;CANCELLED;IN PROGRESS;IN PROGRESS;IN PROCESS-H;IN PROCESS - ON HOLD;
	 * STOPPED;STOPPED;COMPLETED;COMPLETED;COMPLETED-V;COMPLETED AND VERIFIED;CLOSED;CLOSED;
	 */
	
	static {	 
		actionToWorkRequest.put("CREATED", "C");
		actionToWorkRequest.put("REQUESTED", "R");
		actionToWorkRequest.put("APPROVED", "A");
		actionToWorkRequest.put("REJECTED", "Rej");
		actionToWorkRequest.put("IN PROGRESS", "I");
		actionToWorkRequest.put("STOPPED", "S");
		actionToWorkRequest.put("CANCELLED", "Can");
		actionToWorkRequest.put("COMPLETED", "Com");
		actionToWorkRequest.put("CLOSED", "Clo");		

		
		actionDateFields.put("CREATED", "date_requested");
		actionDateFields.put("REQUESTED", "date_requested");
		actionDateFields.put("APPROVED", "date_approved");
		actionDateFields.put("IN PROGRESS", "date_issued");
		actionDateFields.put("COMPLETED", "date_completed");
		actionDateFields.put("CLOSED", "date_closed");	
		
		actionTimeFields.put("REQUESTED","time_requested");		
					
		workRequestToAction.put("C", "CREATED");
		workRequestToAction.put("R", "REQUESTED");
		workRequestToAction.put("A", "APPROVED");
		workRequestToAction.put("Rej", "REJECTED");
		workRequestToAction.put("Rev", null);
		workRequestToAction.put("AA", null);
		workRequestToAction.put("I", "IN PROGRESS");
		workRequestToAction.put("HP", null);
		workRequestToAction.put("HA", null);
		workRequestToAction.put("HL", null);
		workRequestToAction.put("S", "STOPPED");
		workRequestToAction.put("Can", "CANCELLED");
		workRequestToAction.put("Com", "COMPLETED");
		workRequestToAction.put("Clo", "CLOSED");		
		
		workRequestDateFields.put("C", "date_requested");
		workRequestDateFields.put("R", "date_requested");
		workRequestDateFields.put("Com", "date_completed");
		workRequestDateFields.put("Clo", "date_closed");
		workRequestDateFields.put("Can", "date_closed");
		
		workRequestTimeFields.put("C", "time_requested");
		workRequestTimeFields.put("R", "time_requested");
		workRequestTimeFields.put("Com", "time_completed");
		
		/* UofC Customized 12/2010: Added workRequest Date fields for Close Status. */
		workRequestDateFields.put("Clo", "date_closed");

		/* UofC Customized 06/2011: Added new workRequest Status mappings. */
		workRequestToAction.put("Prj", null);
		workRequestToAction.put("PC", null);
		workRequestToAction.put("CPA", null);
		workRequestToAction.put("FWC", null);
		workRequestToAction.put("POL", null);
		workRequestToAction.put("HD", null);
		workRequestToAction.put("IN", null);
		workRequestToAction.put("IR", null);
		workRequestToAction.put("Exp", null);
	}
	
	/**
	 * Retrieves work request status for activity_log status
	 * @param status activity_log status
	 * @return wr status
	 */
	public static String getWorkRequestStatus(String status) {
		if (actionToWorkRequest.containsKey(status))
			return (String) actionToWorkRequest.get(status);
		else
			return "N/A";
	}
 
	/**
	 * Retrieves activity_log status for work request status
	 * @param status wr status
	 * @return activity_log status
	 */
	public static String getActionStatus(String status) {
		if (workRequestToAction.containsKey(status))
			return (String) workRequestToAction.get(status);
		else
			return "N/A";
	}
	
	/**
	 * Retrieves activity_log date field for status
	 * @param status activity_log status
	 * @return activity_log date field
	 */
	public static String getActionDateField(String status) {
		if (actionDateFields.containsKey(status))
			return (String) actionDateFields.get(status);
		else
			return null;
	}
	
	/**
	 * Retrieves wr date field for status
	 * @param status wr status
	 * @return wr date field
	 */
	public static String getWorkRequestDateField(String status) {
		if (workRequestDateFields.containsKey(status))
			return (String) workRequestDateFields.get(status);
		else
			return null;
	}
	
	/**
	 * Retrieves activity_log time field for status
	 * @param status activity_log status
	 * @return activity_log time field
	 */
	public static String getActionTimeField(String status) {
		if (actionTimeFields.containsKey(status))
			return (String) actionTimeFields.get(status);
		else
			return null;
	}
	
	/**
	 * Retrieves wr time field for status
	 * @param status wr status
	 * @return wr time field
	 */
	public static String getWorkRequestTimeField(String status) {
		if (workRequestTimeFields.containsKey(status))
			return (String) workRequestTimeFields.get(status);
		else
			return null;
	}
	
	
}
