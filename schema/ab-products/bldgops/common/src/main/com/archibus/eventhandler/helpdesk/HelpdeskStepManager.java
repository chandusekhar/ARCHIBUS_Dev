package com.archibus.eventhandler.helpdesk;

import com.archibus.eventhandler.steps.StepManagerImpl;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * <p>Step Manager implementation for Helpdesk is using the default
 * behaviour of the <code>StepManagerImpl</code> class. The helpdesk
 * activity is passed to the constructor.
 * 
 */
public class HelpdeskStepManager extends StepManagerImpl {

	/**
	 * Constructor for the status manager, not used by event handlers.
	 * Only used by the WorkflowFactory class.
	 * 
	 * <p>Use the init method to initialize the object with the context and id.
	 *
	 */
	public HelpdeskStepManager() {
		super(Constants.HELPDESK_ACTIVITY_ID);
	}

	/**
	 * Constructor setting activity_id and other properties from the request record.
	 * 
	 * <p>This is the constructor used in the event handlers. 
	 * 
	 * @param context Workflow execution context
	 * @param id Service Request record id
	 */
	public HelpdeskStepManager(EventHandlerContext context, int id) {
		super(context, Constants.HELPDESK_ACTIVITY_ID, id);
	}

}
