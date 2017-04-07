package com.archibus.eventhandler.steps.roles;

import java.util.ArrayList;
import java.util.List;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Role lookup class to find the requestor of a request.
 *
 */
public class RequestorLookup extends EventHandlerBase  implements HelpdeskRoleLookup{

	/**
	 * 
	 * Lookup the requestor of a request.<br />
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
	 * 		<li>Check if the given record has a requestor</li>
	 * 		<li>If so, add the requestor to the list and return</li>
	 * </ol>
	 * </p>
	 * @param context Workflow rule execution context
	 * @return List containing requestor
	 */
	public List getList(EventHandlerContext context) {
		String tableName = context.getString("tableName");
		String fieldName = context.getString("fieldName"); 
		int pkValue = context.getInt(tableName + "." + fieldName);
		
		String requestor = notNull(selectDbValue(context, tableName, "requestor", fieldName +"="+ pkValue));
		List employees = new ArrayList();
		employees.add(requestor);	
		return employees;	 
	}	
}
