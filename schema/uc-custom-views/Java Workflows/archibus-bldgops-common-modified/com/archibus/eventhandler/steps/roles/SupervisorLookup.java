package com.archibus.eventhandler.steps.roles;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Role lookup class to find the supervisor of a request.
 *
 */
public class SupervisorLookup extends EventHandlerBase  implements HelpdeskRoleLookup{

	/**
	 * 
	 * Lookup the supervisor(s) of a request.<br />
	 * 
	 * <p>
	 * <b>Inputs:</b> 
	 *	<ul>
	 * 		<li>tableName : Workflow table</li>
	 * 		<li>fieldName : Primary key field</li>
	 * 		<li><i>tableName</i>.<i>fieldName</i> : Primary key value</li>
	 *	</ul>
	 * </p>
	 * <p>
	 * <b>Pseudo-code:</b>
	 * <ol>
	 * 		<li>Get inputs from context</li>
	 * 		<li>Check if the given record has a supervisor</li>
	 * 		<li>If so, add the supervisor to the list and return</li>
	 * 		<li>Else check if the given record has a work team</li>
	 * 		<li>If so, get the supervisor(s) of this work team, add them to the list and return</li>
	 * </ol>
	 * </p>
	 * @param context Workflow rule execution context
	 * @return List of supervisors
	 */
	public List getList(EventHandlerContext context) {
		String tableName = context.getString("tableName");
		String fieldName = context.getString("fieldName");
		String pkField = tableName + "." + fieldName;
		int pkValue = context.getInt(pkField);
		
		String supervisor = (String) selectDbValue(context, tableName, "supervisor", fieldName +"="+ pkValue);
		List employees = new ArrayList();
		if (supervisor == null) {//not dispatched to supervisor but to trade?
			String work_team_id = notNull(selectDbValue(context,tableName,"work_team_id",fieldName+"="+pkValue));
			if(work_team_id != null){
			    List records = null;
			    //KB3044270 - get supervisor from table cf_work_team table in SupervisorLookup
			    if(getActivityParameterInt(context, "AbBldgOpsOnDemandWork", "UseBldgOpsConsole").intValue() > 0 && ContextStore.get().getProject().tableDefExists("cf_work_team")) {
			        records = selectDbRecords(context, "em", new String[]{"em_id"}, "email IN (SELECT cf.email FROM cf_work_team,cf WHERE cf_work_team.cf_id = cf.cf_id and cf_work_team.work_team_id = "+literal(context,work_team_id)+ " AND cf.is_supervisor = 1) ");
			    }else {
			        records = selectDbRecords(context, "em", new String[]{"em_id"}, "email IN (SELECT email FROM cf WHERE work_team_id = "+literal(context,work_team_id)+ " AND is_supervisor = 1) ");
			    }
			    
				if(records.isEmpty()) return null;
				for(Iterator it=records.iterator();it.hasNext();){
					Object[] record = (Object[]) it.next();
					String em_id = notNull(record[0]);
					employees.add(em_id);
				}
			}			
		}else {
			employees.add(notNull(supervisor));
			
		}
		return employees;	 
	}	
}
