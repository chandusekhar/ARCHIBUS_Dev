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
public class BuildingManagerLookup extends EventHandlerBase  implements HelpdeskRoleLookup{
	
	private static final String EM_STD = "BLD-MGR";

	/**
	 * 
	 * Lookup the building manager(s) of a request.<br />
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
	 * 		<li>If so, get the building manager(s), add them to the list and return</li>
	 * </ol>
	 * </p>
	 * @param context Workflow rule execution context
	 * @return List of building manager
	 */
	public List getList(EventHandlerContext context) {
		String tableName = context.getString("tableName");
		String fieldName = context.getString("fieldName");
		String pkField = tableName + "." + fieldName;
		int pkValue = context.getInt(pkField);
	 
		List employees = new ArrayList();
 		String bl_id = notNull( selectDbValue(context,tableName, "bl_id",fieldName+"="+pkValue) );
  		
		if(bl_id != null){
			List records = selectDbRecords(context, "em", new String[]{"em_id"}, "bl_id = "+literal(context, bl_id)+ " AND em_std = "+literal(context, EM_STD));
			if(records.isEmpty()) return null;
			for(Iterator it=records.iterator();it.hasNext();){
				Object[] record = (Object[]) it.next();
				String em_id = notNull(record[0]);
				employees.add(em_id);
			}
		}	 
		return employees;	 
	}	
}
