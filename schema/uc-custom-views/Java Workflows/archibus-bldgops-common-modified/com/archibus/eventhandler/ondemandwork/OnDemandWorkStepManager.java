package com.archibus.eventhandler.ondemandwork;

import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.steps.StepManagerImpl;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * <p>Step Manager implementation for On Demand Work is using the default
 * behaviour of the <code>StepManagerImpl</code> class. The ondemand
 * activity is passed to the constructor.
 */

public class OnDemandWorkStepManager extends StepManagerImpl {

	/**
	 * Constructor for the status manager, not used by event handlers.
	 * Only used by the WorkflowFactory class.
	 * 
	 * <p>Use the init method to initialize the object with the context and id.
	 *
	 */
	public OnDemandWorkStepManager() {
		super(Constants.ONDEMAND_ACTIVITY_ID);
	}

	/**
	 * Constructor setting activity_id and other properties from the request record.
	 * 
	 * <p>This is the constructor used in the event handlers. 
	 * 
	 * @param context Workflow execution context
	 * @param id Work Request id
	 */
	public OnDemandWorkStepManager(EventHandlerContext context, int id) {
		super(context, Constants.ONDEMAND_ACTIVITY_ID, id);
	}

}
