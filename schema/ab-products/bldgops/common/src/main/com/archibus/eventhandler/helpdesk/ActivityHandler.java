package com.archibus.eventhandler.helpdesk;

import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;


/**
 * <p>
 * Handles workflow rules for adding and updating Request Types 
 * </p>
 */
public class ActivityHandler extends HelpdeskEventHandlerBase {
	
	/**
	 * Save Request Type in the <code>activitytype</code> table.
	 * <p>
	 * The request type should always start with <code>SERVICE DESK - </code>.
	 * <p>
	 * <b>Inputs:</b> 
	 * 		<ul>
	 * 			<li>record : form values submitted for a new request type</li>
	 * 			<li>quest  :'true','false' questionnaire used for this request type</li>
	 * 		</ul>
	 * <p>
	 * <b>Pseudo-code:</b>
	 * <ol>
	 * 		<li>Get activitytype fields from record</li>
	 * 		<li>If questionnaire is used, check if one already exists for this request type
	 * 		<br />&nbsp;&nbsp;If no questionnaire exists, save record in the <code>questionnaire</code> table</li> 
	 * 		<li>Save record in <code>activitytype</code> table</li>
	 * </ol>
	 * @param JSONObject record
	 * @param String quest
	 */
	public void saveActivity(JSONObject record,String quest){
	    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
		Map fieldValues = parseJSONObject(context, record);
		Map values = stripPrefix(fieldValues);
		
		String activitytype = notNull(values.get("activity_type"));
		if(activitytype.equals(Constants.ON_DEMAND_WORK)){
			//check if the current user is allowed to use on demand work
			String user_name = getParentContextAttributeXPath(context,"/*/preferences/@user_name");
			//fix KB3031972 - check both the afm_userprocs table and afm_roleprocs table
			String role_name = ContextStore.get().getUser().getRole();
			List userProcRecords = selectDbRecords(context, "afm_userprocs", new String[]{"process_id"}, "user_name = "+literal(context,user_name)+" AND process_id = 'Service Desk Manager' ");
			List roleProcRecords = selectDbRecords(context, "afm_roleprocs", new String[]{"process_id"}, "role_name = "+literal(context,role_name)+" AND process_id = 'Service Desk Manager' ");
			if(userProcRecords.isEmpty()&&roleProcRecords.isEmpty()){
				//@translatable
				String errormsg = localizeString(context,"License for On Demand Work required to create request type SERVICE DESK - MAINTENANCE");
				throw new ExceptionBase(errormsg);
			}
		}

		if(quest.equalsIgnoreCase("true")){
			//check if questionnaire already exists, else create
			String quest_id = notNull(values.get("activity_type"));
			if(selectDbValue(context, "questionnaire", "questionnaire_id", "questionnaire_id = " + literal(context,quest_id)) == null){
				Map quest_values = new HashMap();
				quest_values.put("questionnaire_id", quest_id);
				quest_values.put("table_name", Constants.ACTION_ITEM_TABLE);
				quest_values.put("field_name", "act_quest");
				quest_values.put("title", quest_id + " Questionnaire");
				executeDbAdd(context, "questionnaire", quest_values);
			}
		}
		executeDbSave(context, "activitytype", values);
		//executeDbCommit(context); // always commit when adding 
	}
}
