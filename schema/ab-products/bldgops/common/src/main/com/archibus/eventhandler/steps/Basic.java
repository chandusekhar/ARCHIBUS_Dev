package com.archibus.eventhandler.steps;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * Basic Step
 */
public class Basic extends StepImpl {
	
	/**
	 * Constructor setting step type
	 *
	 */
	public Basic() {
		super(Constants.BASIC_STEP_TYPE); 
	}

	/**
	 * Constructor setting basic step information.
	 * @param context Workflow rule execution context
	 * @param activity_id Activity id
	 * @param id Primary key value
	 */
	public Basic(EventHandlerContext context, String activity_id, int id) {
		super(context, activity_id, id, Constants.BASIC_STEP_TYPE, Constants.BASIC_STEP);		
	}
	
	/**
	 * Constructor setting basic step information and extra properties.
	 * @param context Workflow rule execution context
	 * @param activity_id Activity id
	 * @param id Primary key value
	 * @param values Map with step {@link com.archibus.eventhandler.steps.StepImpl#setProperties(Map) properties}
	 */
	public Basic(EventHandlerContext context, String activity_id, int id, Map values) {
		super(context, activity_id, id, values);
	}
 
	/**
	 * 
	 *  Basic step ends directly after invoke.
	 *	@return true
	 *
	 */
	public boolean hasEnded() {
		return true;
	}

	/**
	 * 
	 *  Basic step is never in progress
	 *	@return false
	 *
	 */
	public boolean inProgress() {
		return false;
	}

	/**
	 * 
	 * Invoke this step.<br />
	 * This step only creates a record in the database (on a basic status change of a request)
	 * <p>
	 * <b>Pseudo-code:</b>
	 * 		<ol>
	 * 			<li>{@link #setStepEnded(boolean) Set step ended}</li>
	 * 			<li>{@link #logStep() Log step}</li>
	 * 		</ol>
	 * </p>
	 */
	public void invoke() {
		setStepEnded(true); // ended true, action date and time
		logStep(); // save to log table
		
		//KB3044816 - Response By fields are not filled in helpdesk_step_log for basic status changes
		String responseUser = ContextStore.get().getUser().getName();
        if (this.context.parameterExistsNotEmpty("response_user")
                && this.context.getString("response_user") != null && !"R".equals(this.statusBefore) && !"Com".equals(this.statusBefore)) {
            responseUser = this.context.getString("response_user");
        }
        
        if("R".equals(this.statusBefore)) {
            responseUser = notNull(selectDbValue(context, "afm_users", "user_name", "afm_users.email IN (select em.email from wr left join em on wr.requestor = em.em_id where wr.wr_id=" + id+")"));
        }
        
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put("step_log_id", new Integer(stepLogId));
        values.put("user_name", responseUser);
        
        executeDbSave(this.context, Constants.STEP_LOG_TABLE, values);
        //executeDbCommit(this.context);
	}

	/**
	 * 
	 * Step order: This step is always the first in row
	 * <p>	 
	 *	@return 0
	 * </p>
	 */
	public int getStepOrder() {
		return 0;
	}
}
