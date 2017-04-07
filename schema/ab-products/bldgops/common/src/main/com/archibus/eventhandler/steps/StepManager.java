package com.archibus.eventhandler.steps;


import com.archibus.eventhandler.steps.Step;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * Interface for a step manager<br />
 * This can be used for any activity.
 * 
 */

public interface StepManager {
	
	/**
	 * Initialize step manager with request record.<br/>
	 * This is used when the default constructor is used<br/>
	 * 
	 *  @param context Workflow rule execution context
	 *  @param activity_id Activity Id
	 *  @param id Request id
	 */
	public abstract void init(EventHandlerContext context, String activity_id, int id);

	/**
	 * Get current step.<br/>
	 * The current step is the step waiting for response
	 */
	public abstract Step getCurrentStep();

	/**
	 * After completion of a previous step, the next step is searched for.
	 */
	public abstract Step getNextStep();

	/**
	 * Invoke next step.
	 */
	public void invokeNextStep();
	
	/**
	 * Invoke first step (after basic status change).<br />
	 * The first step invokes the basic step for this status change
	 */
	public void invokeFirstStep(); 
	
	/**
	 * Notify requestor (after status change).
	 */
	public void notifyRequestor();

	/**
	 * Confirm step.
	 * @param stepLogId Id of step
	 * @param comments comment
	 * @param user_name name of current user
	 */
	abstract void confirmStep(int stepLogId, String comments, String user_name);
	
	/**
	 * Accept step.
	 * @param stepLogId Id of step
	 * @param comments comment
	 * @param user_name name of current user
	 */
	abstract void acceptStep(int stepLogId, String comments, String user_name);
	
	/**
	 * Reject step.
	 * @param stepLogId Id of step
	 * @param comments comment
	 * @param user_name name of current user
	 */
	abstract void rejectStep(int stepLogId, String comments, String user_name);
	
	/**
	 * Decline step.
	 * @param stepLogId Id of step
	 * @param comments comment
	 * @param user_name name of current user
	 */
	abstract void declineStep(int stepLogId, String comments, String user_name);
	
	/**
	 * Reissue step.
	 * @param stepLogId Id of step
	 * @param comments comment
	 * @param user_name name of current user
	 */
	abstract void reissueStep(int stepLogId, String comments, String user_name);
	
	/**
	 * 
	 * End all pending steps in the current workflow.
	 * 
	 *	@param comments Comments
	 *	@param user_name Manager ending the steps
	 */
	abstract void endAllPendingSteps(String comments, String user_name);
	
	/**
	 *  Insert a new step into the workflow.
	 *  
	 *	@param type Step type
	 *	@param name Step name
	 *	@param em_id Employee Code (employee who has to respond to the step)
	 */
	abstract void insertStep(String type, String name, String em_id);
	
	abstract void forwardStep(int stepLogId, String comments, String user, String forwardTo);
	
	
}