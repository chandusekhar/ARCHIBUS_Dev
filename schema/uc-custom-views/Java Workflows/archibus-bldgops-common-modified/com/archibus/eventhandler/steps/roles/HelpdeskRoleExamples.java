package com.archibus.eventhandler.steps.roles;

import java.util.*;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class HelpdeskRoleExamples extends EventHandlerBase  {
    /**
     * Return contact
     * @param context Workflow rule execution context
     * @return
     */
	public List<String> getContact(EventHandlerContext context) {		
		String tableName = context.getString("tableName");
		String fieldName = context.getString("fieldName");
		String pkField = tableName + "." + fieldName;
		int pkValue = context.getInt(pkField);
		
		String bl_id = notNull(selectDbValue(context, tableName, "bl_id", fieldName +"="+ pkValue));
		List<String> employees = new ArrayList<String>();	
		if (bl_id != null){
			employees.add("AFM");
		} else {
			employees.add(notNull( selectDbValue(context, tableName,"manager",fieldName +"="+pkValue)));
		}	 
			
		return employees;
	}
	
	/**Return management list
	 * @param context Workflow rule execution context
	 * @return
	 */
	public List getManagementList(EventHandlerContext context) {
		String tableName = context.getString("tableName");
		String fieldName = context.getString("fieldName");
		String pkField = tableName + "." + fieldName;
		int pkValue = context.getInt(pkField);
		
		String bl_id = notNull(selectDbValue(context, tableName, "bl_id", fieldName +"="+ pkValue));	
		
		 // get all matching records 		 
        List records = selectDbRecords(context, 
        "select em.em_id from bl, em where bl.bl_id = em.bl_id and em.dp_id = 'MANAGEMENT' " +
        "and bl.bl_id = " + literal(context, bl_id) );
		
        List employees = new ArrayList();
        
        for (Iterator it = records.iterator(); it.hasNext();  ) {
        	Object[] rec = (Object[]) it.next();
        	employees.add(notNull(rec[0]));
        }        
        
		return employees;
	}
	
	/**Return test
	 * @param context Workflow rule execution context
	 * @return
	 */
	public List getTest(EventHandlerContext context){
		List records = selectDbRecords(context,"em",new String[] {"em_id"},"em_std='TEST'");
		List employees = new ArrayList();
		
		Iterator it = records.iterator();
		while(it.hasNext()){
			Object[] record = (Object[]) it.next();
			employees.add(notNull(record[0]));
		}
		return employees;
	}

 
	/**
	 * Return senior executive
	 * @param context
	 * @return
	 */
	public List getSeniorExecutives(EventHandlerContext context){
		List records = selectDbRecords(context,"em",new String[] {"em_id"},"em_std='EXEC-SR'");
		List employees = new ArrayList();
		
		Iterator it = records.iterator();
		while(it.hasNext()){
			Object[] record = (Object[]) it.next();
			employees.add(notNull(record[0]));
		}
		return employees;
	}
	
	
}
