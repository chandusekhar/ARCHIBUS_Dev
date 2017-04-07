package com.archibus.eventhandler.ondemandwork;

import java.util.Iterator;
import java.util.List;

import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.helpdesk.Common;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.helpdesk.HelpdeskStatusManager;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.eventhandler.steps.StatusConverter;
import com.archibus.eventhandler.steps.StatusManager;
import com.archibus.eventhandler.steps.StatusManagerImpl;
import com.archibus.eventhandler.steps.StepManager;
import com.archibus.eventhandler.steps.WorkflowFactory;
import com.archibus.jobmanager.EventHandlerContext;


/**
 * 
 * Status Manager for Work Requests (activity AbBldgOpsOnDemandWork)
 */

public class OnDemandWorkStatusManager extends StatusManagerImpl {
	
	private static final String REJECTED_STATUS = "Rej";

	/**
	 * Constructor only used by the WorkflowFactory class.
	 *  
	 * <p>This shouldn't be called from event handlers. When used
	 * always use the init method to initialize the object with context and id.
	 *
	 */
	public OnDemandWorkStatusManager(){
		this.tableName = "wr";
		this.fieldName = "wr_id";
		this.activity_id = Constants.ONDEMAND_ACTIVITY_ID;
	}
	
	/**
	 * Constructor used in the event handlers. 
	 * 
	 * @param context Workflow rule execution context
	 * @param id Work Request id (wr.wr_id)
	 */
	public OnDemandWorkStatusManager(EventHandlerContext context, int id){
		super(context, Constants.ONDEMAND_ACTIVITY_ID, id);
	} 
	
	/**
	 * 
	 * Update work request status.
	 *
	 * <p>
	 * <b>Pseudo-code:</b>
	 * 		<ol>
	 * 			<li>Update status of work request record</li>
	 * 			<li>{@link com.archibus.eventhandler.steps.WorkflowFactory#getStepManager(EventHandlerContext, String, int) Get step manager for current activity},
	 * 				{@link com.archibus.eventhandler.steps.StepManager#init(EventHandlerContext, String, int) initialize} and 
	 *				{@link com.archibus.eventhandler.steps.StepManager#invokeFirstStep() invoke first step}</li>
	 *			<li>Check if new status can be converted to a legal status for activity log by {@link com.archibus.eventhandler.steps.StatusConverter#getActionStatus(String) StatusConverter}</li>
	 *			<li>If so, check if help request(s) (records in activity_log) are linked to the current work request</li>
	 *			<li>If so, {@link com.archibus.eventhandler.helpdesk.HelpdeskStatusManager#updateStatus(String) update the status of these requests}</li>
	 * 		</ol>
	 * </p>
	 *  <p>	 
	 *	@param String status New status
	 *  @see com.archibus.eventhandler.steps.StatusManagerImpl#updateStatus(java.lang.String)
	 * </p>
	 *
	 */
	public void updateStatus(String status){
		String current_status = Common.getStatusValue(context, this.tableName, this.fieldName, this.id);
		if(! current_status.equals(status)){
			if(! context.parameterExists("wr.wr_id")) context.addResponseParameter("wr.wr_id", new Integer(id));
			if(StatusConverter.getWorkRequestDateField(status) != null && !"date_requested".equals(StatusConverter.getWorkRequestDateField(status))) 
				super.updateStatus(status, StatusConverter.getWorkRequestDateField(status), StatusConverter.getWorkRequestTimeField(status));
			else 
				super.updateStatus(status);
			
            if ("I".equals(status)) {
                // From bali5, add new field wrcf.status, when re-issue and self-assign, set all return wrcf to completed 
                SqlUtils.executeUpdate("wrcf",
                    "update wrcf set status = 'Complete' where wrcf.status = 'Returned' and wrcf.wr_id = " + this.id);
            }
			
			StepManager stepManager = WorkflowFactory.getStepManager(context, activity_id, id);
			stepManager.invokeFirstStep();
			
			String actionStatus = StatusConverter.getActionStatus(status);
			if(actionStatus != null){
				List records = selectDbRecords(context,Constants.ACTION_ITEM_TABLE,new String[]{"activity_log_id"},"wr_id = " + id);
				Iterator it = records.iterator();
				while (it.hasNext()){
					Object[] record = (Object[]) it.next();
					Integer activity_log_id = getIntegerValue(context, record[0]);
					if(! context.parameterExists("activity_log.activity_log_id")) context.addResponseParameter("activity_log.activity_log_id", activity_log_id);
					
					String activity_log_status = Common.getStatusValue(context, "activity_log", "activity_log_id", activity_log_id.intValue());
					if(! actionStatus.equals(activity_log_status)){
						StatusManager statusManager = new HelpdeskStatusManager(context, activity_log_id.intValue());
						statusManager.updateStatus(actionStatus);
					}
				}	
			}else {
                // KB3047211 - Notify requestor if work request status became On Hold
                // when there is a basic status change the requestor is notified by the status
                // change status might have changed by invoking steps, avoid to send mail twice, if sla is
                // auto create work order, not notify requestor here to avoid send mail twice, it
                // will send email in HelpdeskStatusManager.updateStatus()
                ServiceLevelAgreement sla = ServiceLevelAgreement.getInstance(context,
                    this.tableName, this.fieldName, this.id);
                if ((!("AA".equals(status) && sla.isAutocreate_wo())) && status.equals(
                    Common.getStatusValue(context, this.tableName, this.fieldName, this.id))) {
                    stepManager.notifyRequestor(); // the step manager checks the SLA if a
                                                   // notification has to be sent
                }
			}
			
			//KB3049239 - remove all pending steps if update work request to Stopped and Cancelled
            if ("S".equals(status) || "Can".equals(status)) {
                SqlUtils
                    .executeUpdate(
                        "helpdesk_step_log",
                        "delete from helpdesk_step_log where helpdesk_step_log.date_response is null and helpdesk_step_log.field_name='wr_id' and helpdesk_step_log.pkey_value="
                                + this.id);
            }
			
		}		
	}
	
	public String getRejectedStatus() {
		return REJECTED_STATUS;
	}
}
