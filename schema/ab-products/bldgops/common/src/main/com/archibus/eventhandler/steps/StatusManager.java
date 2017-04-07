package com.archibus.eventhandler.steps;

import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * Interface for status managers
 */
public interface StatusManager {
	 	
	public abstract String getRejectedStatus();
	
	/**
	 * Initialize status manager, set context, tablename, fieldname and id<br/>
	 * The Status Manager class must implement the default constructor (no args)<br/>
	 * When using the default constructor by a factory method, the init method<br/>
	 * must be called to initialize the status manager
	 * 
	 *	@param context Workflow rule execution context
	 *	@param activity_id activity (<code>afm_activities</code>)
	 *	@param id Primary key value defining the record in the workflow table
	 */
	public abstract void init(EventHandlerContext context, String activity_id, int id);
	
	/**
	 * Update the basic status in the workflow table<br/>
	 * This will trigger the step manager to invoke the step sequence for this status<br/>
	 * Auto-rules can cause propagation of the standard workflow<br/>
	 * 
	 * @param status new status
	 */
	public abstract void updateStatus(String status);
	
	/**
	 * Update the basic status in the workflow table and set the given date field to the current date<br/>
	 * This will trigger the step manager to invoke the step sequence for this status<br/>
	 * Auto-rules can cause propagation of the standard workflow<br/>
	 * 
	 * @param status new status
	 * @param dateField database field for a date (e.g. date_approved)
	 * @param timeField database field for a time (e.g. time_completed)
	 */
	public abstract void updateStatus(String status, String dateField, String timeField);
	
	// public abstract void rejectRequest();
			
	/**
	 * Update the step status in the workflow table<br/>
	 * @param step_status
	 */
	public abstract void updateStepStatus(String step_status);	
	
	/**
	 * Update the basic status to Rejected (or something similar according to the request table)
	 */
	public abstract void rejectRequest();
	
	/**
	 * Update the basic status to Issued (or something similar according to the request table)
	 */
	public abstract void issueRequest();

}