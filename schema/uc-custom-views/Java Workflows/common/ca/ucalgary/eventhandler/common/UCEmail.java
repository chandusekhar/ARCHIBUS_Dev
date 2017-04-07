package ca.ucalgary.eventhandler.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;


public class UCEmail extends EventHandlerBase{

	public void sendEmail2(EventHandlerContext context){
		
		 String subject = (String) context.getParameter("Subject");
		 String email_to = (String)context.getParameter("SendTo");
		 String body = (String)context.getParameter("emailBody");

		 
		 sendEmailStock(context, body,  subject, email_to);
	}
	
	private void sendEmailStock(EventHandlerContext context, String body, String subject,
            String recipient) {

        context.addResponseParameter("notifyEmailAddress", recipient);
        context.addResponseParameter("notifySubject", subject);
        context.addResponseParameter("notifyBody", body);

        runWorkflowRule(context, "AbCommonResources-notify", true);

    }
	
    /**
     * Sends an email to the specified recipients using a template from the messages table.
     * 
     * @param activityId	The activity_id of the message template from the messages table.
     * @param referencedBy	The referenced_by field of the message template from the messages table.
     * @param bodyMessageCode		The message_id of the message template for the body of the email.
     * @param subjectMessageCode	The message_id of the message template for the subject of the email.
     * @param tableName		The table name for the record being used to fill the message template.
     * @param keyField		The primary key field name for the record being used to fill the message template.
     * @param keyValue		The primary key value of the record used to fill the template.
     * @param axvwLink		The axvw page used for the {link} parameter in the template.
     * @param email			Semi-comma separated list of email recipients. 
     */
	public void sendEmail(String activityId, String referencedBy, String bodyMessageCode, String subjectMessageCode, 
			String tableName, String keyField, String keyValue, String axvwLink, String email) {
        this.sendEmailCustomTags(activityId, referencedBy, bodyMessageCode, subjectMessageCode, tableName, keyField, keyValue, axvwLink, email, null);
	}


	public void sendEmailCustomTags(String activityId, String referencedBy, String bodyMessageCode, String subjectMessageCode, 
			String tableName, String keyField, String keyValue, String axvwLink, String email, JSONObject customTemplateTags) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        UCMessage message = new UCMessage(context);
        message.setActivityId(activityId);
        message.setReferencedBy(referencedBy);

        try {	
	        String link = getWebCentralPath(context);
	        Map dataModel = getRequestDatamodel(context, tableName, keyField, keyValue);
	        
	        if (axvwLink != null && !axvwLink.equals("")) {
	        	link += "/"+axvwLink;
	        }
	        
	        dataModel.put("link", link);
	        
	        // put in the customTags into the dataModel.
	        if (customTemplateTags != null) {
		        Iterator<String> tagKeys = customTemplateTags.keys();
	
		        while( tagKeys.hasNext() ){
		            String tagKey = (String)tagKeys.next();
		            dataModel.put(tagKey, customTemplateTags.getString(tagKey));
		        }
	        }
 
	        message.setBodyMessageId(bodyMessageCode);
	        message.setSubjectMessageId(subjectMessageCode);
	
	        if(message.isBodyRichFormatted() || message.isSubjectRichFormatted()){
	            message.setDataModel(dataModel);
	        }
	        if(!message.isBodyRichFormatted()){
	            message.setBodyArguments(new Object[]{link});
	        }
	        message.format();
	
	        message.setMailTo(email);
	
	
	        String recepName = notNull(selectDbValue(context, "em", "em_number", "email = "
	            + literal(context, email)));
	
	        message.setNameto(recepName);
	
	        message.sendMessage();
        }
        catch (Exception e) {
        	log.error("Email Failed: " + e.getMessage());
        }
	}
	
	private Map<String,Object> getRequestDatamodel(EventHandlerContext context, String tableName,String fieldName,String id){
		Map<String,Object> result = new HashMap<String,Object>();
		if (tableName == null || tableName.equals("")
			|| fieldName == null || fieldName.equals("")
			|| id == null || id.equals("")) {
			return result;
		}
		
		if(tableName.equals("activity_log") || tableName.equals("wr") || tableName.equals("wo")){
			result = com.archibus.eventhandler.steps.MessageHelper.getRequestDatamodel(context, tableName, fieldName, Integer.parseInt(id));
			
			// for wr table, add in additional standard tables
			String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "bl");
			Object[] fieldValues = selectDbValues(context,"bl",fields_list,"bl_id="+literal(context,(String) ((Map)result.get("wr")).get("bl_id")));
			if(fieldValues != null){
				Map<String,Object> values = new HashMap<String,Object>();
				for(int i=0;i<fieldValues.length;i++){
					values.put(fields_list[i], fieldValues[i]);
				}
				result.put("bl",values);
			} else {
				//throw new ExceptionBase("Record with id " + id +" not found in bl");
			}	
			
			fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "eq");
			fieldValues = selectDbValues(context,"eq",fields_list,"eq_id="+literal(context,(String) ((Map)result.get("wr")).get("eq_id")));
			if(fieldValues != null){
				Map<String,Object> values = new HashMap<String,Object>();
				for(int i=0;i<fieldValues.length;i++){
					values.put(fields_list[i], fieldValues[i]);
				}
				result.put("eq",values);
			} else {
				//throw new ExceptionBase("Record with id " + id +" not found in eq");
			}				
			
			
		} else {
			String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, tableName);
			Object[] fieldValues = selectDbValues(context,tableName,fields_list,fieldName+"="+id);
			if(fieldValues != null){
				Map<String,Object> values = new HashMap<String,Object>();
				for(int i=0;i<fieldValues.length;i++){
					values.put(fields_list[i], fieldValues[i]);
				}
				result.put(tableName,values);
			} else {
				throw new ExceptionBase("Record with id " + id +" not found in "+tableName);
			}
		}

		return result;
	} 
}
