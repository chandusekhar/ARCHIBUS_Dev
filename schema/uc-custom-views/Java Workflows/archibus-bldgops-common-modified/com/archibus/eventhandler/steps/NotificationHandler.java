package com.archibus.eventhandler.steps;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.helpdesk.HelpdeskEventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;
import com.archibus.utility.StringUtil;

import freemarker.template.TemplateException;

public class NotificationHandler extends HelpdeskEventHandlerBase {
	
	/**
	 * Save subject and body for Notification steps in messages table
	 * @param activity : activity name like 'AbBldgOpsOnDemandWork' ...
	 * @param stepName : step name
	 * @param status :  the status of step  
	 * @param subjectMessageId : Message subject id
	 * @param bodyMessageId : Message body id
	 * @param subject : message subject
	 * @param body : message body
	 * @param is_rich_msg_format_subject 
	 * @param is_rich_msg_format_body 
	 */
    public void saveNotificationMessage(String activity,String stepName,String status, String subjectMessageId,String bodyMessageId,String subject,String body,
            String is_rich_msg_format_subject, String is_rich_msg_format_body){
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    	String referenced_by = "NOTIFICATION_STEP";
    	
    	Map<String, Object> bodyValues = new HashMap<String, Object>();
		bodyValues.put("activity_id", activity);
		bodyValues.put("referenced_by", Constants.REFERENCE_BY_NOTIFICATION_STEP);
		bodyValues.put("message_text", body);		
		
		String bodyDescription = "Body for Notification '" + stepName+"' on status " + status;
		bodyValues.put("description",bodyDescription);
    	if(! context.parameterExists("body_message_id") || (! StringUtil.notNullOrEmpty(bodyMessageId) && !bodyMessageId.equals("0"))){
    		bodyMessageId = stepName+"_"+status+"_BODY";
    	} 
    	
    	//fix KB3030274 - converts to UPPER before inserting the messages.message_id field(Guo 2011/4/13)
    	bodyValues.put("message_id", bodyMessageId.toUpperCase());
    	bodyValues.put("is_rich_msg_format", Integer.parseInt(is_rich_msg_format_body));
    	executeDbSave(context, "messages", bodyValues);
    	//executeDbCommit(context);
    	
    	
    	Map<String, Object> subjectValues = new HashMap<String, Object>();
		subjectValues.put("activity_id", activity);
		subjectValues.put("referenced_by", referenced_by);

		subjectValues.put("message_text", subject);
		
		String description = "Subject for Notification '" + stepName+"' on status " + status;
		subjectValues.put("description",description);
    	if(! context.parameterExists("subject_message_id") || (! StringUtil.notNullOrEmpty(subjectMessageId) && ! subjectMessageId.equals("0"))){
	    	subjectMessageId = stepName+"_"+status+"_SUBJECT";
    	}
    	//fix KB3030274 - converts to UPPER before inserting the messages.message_id field(Guo 2011/4/13)
	    subjectValues.put("message_id", subjectMessageId.toUpperCase());
	    subjectValues.put("is_rich_msg_format", Integer.parseInt(is_rich_msg_format_subject));
	    executeDbSave(context, "messages", subjectValues);
	    //executeDbCommit(context);
    	
    	JSONObject result = new JSONObject();
    	result.put("subjectMessageId", subjectMessageId.toUpperCase());
    	result.put("bodyMessageId", bodyMessageId.toUpperCase());
    	
    	context.addResponseParameter("jsonExpression", result.toString());
   
    }
	
    /**
     * Test templates for notification messages
     * @param pSubject : message subject
     * @param pBody : message body
     * @param tableName : testing table name
     * @param fieldName : testing field name
     * @param pkeyValue : primary key value
     */
	public void testTemplate(String pSubject,String pBody,String tableName,String fieldName,String pkeyValue){
	    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
	    
	    int id = 0;
	    if (!pkeyValue.equals("null") && !pkeyValue.equals("")){
	        id = Integer.parseInt(pkeyValue);
	    }
		
		Map<String,Object> datamodel = MessageHelper.getRequestDatamodel(context, tableName, fieldName, id);		
		
		JSONObject result = new JSONObject();
		if(!pBody.equals("null") && !pBody.equals("")){
			try{
				String body = MessageHelper.processTemplate("testBody", pBody, datamodel, null);
				result.put("body", body);
			} catch (TemplateException e){
				String errorMessage = "Processing template body failed: " + e.getMessage();
	            throw new ExceptionBase(errorMessage, true);
			} catch (IOException e){
				String errorMessage = "Processing template body failed: " + e.getMessage();
	            throw new ExceptionBase(errorMessage, true);
			}
		} 
		if(!pSubject.equals("null") && !pSubject.equals("")){
			try {
				String subject = MessageHelper.processTemplate("testSubject", pSubject, datamodel, null);
				result.put("subject", subject);
			} catch (TemplateException e){
				String errorMessage = "Processing template subject failed: " + e.getMessage();
	            throw new ExceptionBase(errorMessage, true);
			} catch (IOException e){
				String errorMessage = "Processing template subject failed: " + e.getMessage();
	            throw new ExceptionBase(errorMessage, true);
			}
		}		
		context.addResponseParameter("jsonExpression", result.toString());
	}
}
