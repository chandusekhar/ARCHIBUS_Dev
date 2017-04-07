package com.archibus.eventhandler.helpdesk;

import com.archibus.eventhandler.steps.StatusConverter;
import com.archibus.eventhandler.steps.StatusManagerImpl;
import com.archibus.eventhandler.steps.StepManager;
import com.archibus.eventhandler.steps.WorkflowFactory;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * Status Manager for activity log table (AbBldgOpsHelpDesk activity).
 * 
 * <p>Whenever a basic status change occurs, updating the status should always be performed by the status manager.
 *
 */

public class HelpdeskStatusManager extends StatusManagerImpl {
	
	private static final String REJECTED_STATUS = "REJECTED";
	
	/**
	 * Constructor only used by the WorkflowFactory class.
	 *  
	 * <p>This shouldn't be called from event handlers. When used
	 * always use the init method to initialize the object with context and id.
	 *
	 */
	public HelpdeskStatusManager(){			
		super(Constants.HELPDESK_ACTIVITY_ID);
		this.tableName = "activity_log";
		this.fieldName = "activity_log_id";
	}
	
	/**
	 * Constructor used in the event handlers. 
	 * 
	 * @param context Workflow rule execution context
	 * @param id Request record id (activity_log.activity_log_id)
	 */
	public HelpdeskStatusManager(EventHandlerContext context, int id){
		super(context, Constants.HELPDESK_ACTIVITY_ID, id);
		this.tableName = "activity_log";
		this.fieldName = "activity_log_id";
	}
	
	/**
	 * 
	 * Update request status and start (continue) workflow.
	 * <p>	 
 	 * When a basic status change occurs, the step manager is called to invoke the step
 	 * sequence for this status. The step sequence is defined by the SLA applied.<br>
 	 * The step sequence is started by calling the <code>invokeFirstStep</code> method.
 	 * This will log the basic status change in the step log and look for the step sequence
 	 * to be started. After a basic status change, the requestor is notified, if enabled by the SLA.
	 * <p>
	 * <b>Pseudo-code:</b>
	 * 		<ol>
	 * 			<li>Get the date field from the {@link com.archibus.eventhandler.steps.StatusConverter status converter}</li>
	 * 			<li>Update status and date field of help request in the <code>activity_log</code> table</li>
	 * 			<li>Start workflow step sequence with {@link com.archibus.eventhandler.steps.StepManager stepmanager}</li>
	 * 			<li>{@link com.archibus.eventhandler.steps.StepManager#notifyRequestor() notify the requestor}</li>
	 * 		</ol>
	 * </p>
	 * 
	 *	@param status New status
	 *  @see com.archibus.eventhandler.steps.StatusManagerImpl#updateStatus(java.lang.String)
	*/
	public void updateStatus(String status){	
		String current_status = Common.getStatusValue(context, this.tableName, this.fieldName, this.id);
		if(! current_status.equals(status)){
			super.updateStatus(status, StatusConverter.getActionDateField(status),StatusConverter.getActionTimeField(status));
			 
			StepManager stepManager = WorkflowFactory.getStepManager(context, activity_id, id);
			stepManager.invokeFirstStep();
			
			// when there is a basic status change the requestor is notified by the status change
			//status might have changed by invoking steps, avoid to send mail twice
			if(status.equals(Common.getStatusValue(context, this.tableName, this.fieldName, this.id))){
				stepManager.notifyRequestor();	// the step manager checks the SLA if a notification has to be sent
			}
		}
	}
	
	public String getRejectedStatus() {
		return REJECTED_STATUS;
	}

}
