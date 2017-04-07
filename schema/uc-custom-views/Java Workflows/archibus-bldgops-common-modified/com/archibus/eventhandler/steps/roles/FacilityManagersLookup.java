package com.archibus.eventhandler.steps.roles;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Role lookup class to find the supervisor of a request.
 *
 */
public class FacilityManagersLookup extends EventHandlerBase  implements HelpdeskRoleLookup{
	
	private static final String EM_STD = "%MGR%";
	private static final String DV_ID = "FACILITIES";

	/**
	 * 
	 * Lookup the facility manager(s).<br />
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
	 * 		<li>If so, get the facility manager(s), add them to the list and return</li>
	 * </ol>
	 * </p>
	 * @param context Workflow rule execution context
	 * @return List of facility managers
	 */
	public List getList(EventHandlerContext context) {
		
		List records = selectDbRecords(context, "em", new String[]{"em_id"}, "dv_id = "+literal(context, DV_ID)+ " AND em_std LIKE "+literal(context, EM_STD));
		if(records.isEmpty()) return null;
		
		List employees = new ArrayList();
		for(Iterator it=records.iterator();it.hasNext();){
			Object[] record = (Object[]) it.next();
			String em_id = notNull(record[0]);
			employees.add(em_id);
		} 
		return employees;	 
	}	
}
