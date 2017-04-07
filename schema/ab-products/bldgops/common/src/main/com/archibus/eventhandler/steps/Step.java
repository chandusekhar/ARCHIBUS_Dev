package com.archibus.eventhandler.steps;

import java.util.Map;

import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * Interface for every step in the workflow
 * 
 * <p>A step is part of the flexible workflow. Execution of the step is always started 
 * by calling the <code>invoke()</code> method.
 * 
 * <p>The base class implementing this interface is the {@link StepImpl}. It is recommended
 * to extend the base class when implemnting a new step.
 * 
 * @see StepImpl
 *
 */
public interface Step {	
	
	/**
	 * Initialize step, set activity_id, id and other values<br>
	 * This is used when the default constructor is called<br>
	 * 	 
	 *  @param context Workflow rule execution context
	 *	@param activity_id  Activity id
	 *	@param id Primary key value
	 *	@param values Extra step information
	 */
	void init(EventHandlerContext context, String activity_id, int id, Map<String,Object> values);
	
	/**
	 * Invoke step (Create record in the database and send email)
	 */	
	public void invoke();
	
	
	/**
	 * Get step order. This is the ranking order in the step sequence for this status
	 */
	public int getStepOrder();
	
	/**
	 * Step ended. Response is received. 
	 */
	public boolean hasEnded();
	
	/**
	 * Step in progress (waiting for response)
	 */
	public boolean inProgress();
	
	
	/**
	 * Get (basic) status after. <br />
	 * A step can cause a change in basic status in some cases.
	 * Most of the time this contains a null value, meaning no basic status change.
	 */
	
	public String getStatusBefore();
	public String getStatusAfter();
	
	public String getStepName();
	public String getType();
	
	public boolean checkCondition();
	
	public boolean checkRequired();
	
	/**
	 * 
	 * Confirm step. Used by an {@link Action} step.
	 * 
	 *	@param stepLogId Step log id
	 *	@param comment User comments on confirm
	 *	@param user Name of confirming user (afm_users.user_name)
	 *
	 */
	public void confirm(int stepLogId, String comment, String user);
	
	/**
	 * 
	 * Reject step. Used by an {@link Action} step.
	 * 
	 *	@param stepLogId Step log id
	 *	@param comment User comments on rejection
	 *	@param user Name of rejecting user (afm_users.user_name)
	 */
	public void reject(int stepLogId, String comment, String user);
	
	/**
	 * 
	 * Accept step
	 * 
	 *	@param stepLogId Step log id
	 *	@param comment User comments on acceptance
	 *	@param user Name of accepting user (afm_users.user_name)
	 */
	public void accept(int stepLogId, String comment, String user);
	
	/**
	 * 
	 * Decline step
	 * 
	 *	@param stepLogId Step log id
	 *	@param comment User comments on decline
	 *	@param user Name of declining user (afm_users.user_name)
	 */
	public void decline(int stepLogId, String comment, String user);
	
	/**
	 * 
	 * Reissue step. This is used by a Verification step. The user can disapprove the work
	 * and ask for a reissue of the request.
	 * 
	 *	@param stepLogId Step log id
	 *	@param comment User comments on reissue
	 *	@param user Name of reissueing user (afm_users.user_name)
	 */
	public void reissue (int stepLogId, String comment, String user);
	
	/**
	 * 
	 * Forward Step. Possible for Approval, Edit and Approve, Estimation and Scheduling
	 * 
	 * @param stepLogId Step log id
	 * @param comment User comments on forward
	 * @param user Current user
	 * @param em_id Forward to this Employee
	 */
	public void forward (int stepLogId, String comment, String user, String em_id);
	
}
