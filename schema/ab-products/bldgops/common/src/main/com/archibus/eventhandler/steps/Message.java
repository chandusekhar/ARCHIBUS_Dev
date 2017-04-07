package com.archibus.eventhandler.steps;

import java.io.IOException;
import java.util.Map;

import com.archibus.eventhandler.helpdesk.HelpdeskEventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

import freemarker.template.TemplateException;

/**
 * 
 * Class for sending mail message
 */
public class Message extends HelpdeskEventHandlerBase {
	
	/**
	 * Mail subject
	 */
	private String subject;
	/**
	 * Mail text (part of the body)
	 */
	private String body;
	/**
	 * Addresse name
	 */
	private String nameTo;
	/**
	 * Addresse email
	 */
	private String mailTo;
	/**
	 * Sender name
	 */
	private String mailFrom;
	 
	/**
	 * Stepcode to use in link
	 */
	private String stepCode;
	
	private Map<String, Object> dataModel;
	
	/**
	 * Workflow rule execution context
	 */
	private final EventHandlerContext context;
	
	private String subjectMessageId;
	
	private String bodyMessageId;
	
	private String activityId;
	
	private String referencedBy;
	
	private Boolean subjectRichFormatted;
	
	private Boolean bodyRichFormatted;
	
	private Object[] subjectArguments;
	
	private Object[] bodyArguments;
	
	public Message(EventHandlerContext context) {
		super();
		this.context = context;
	}
	
	public void format() {
	    // do nothing, and the function is merged into sendMessage() method.
	    return;
	}	
	
	public void format(String localName) {
	    if ("DEFAULT".equals(localName)) {
	        localName = null;
	    }
	    
        if(isSubjectRichFormatted()){
            String subjectMsg = localizeMessage(this.context, this.activityId, this.referencedBy, this.subjectMessageId, localName);
            this.subject = subjectMsg;
            try {
                this.subject = MessageHelper.processTemplate(this.subjectMessageId, subjectMsg, this.dataModel,localName);
            } catch(TemplateException te){
                this.log.debug("Parsing template for "+formatWhere(this.subjectMessageId)+" failed");
                te.printStackTrace();
            } catch (IOException e) {
                this.log.debug("Parsing template for "+formatWhere(this.subjectMessageId)+" failed");
                e.printStackTrace();
            }
        } else {
            if(this.subjectArguments == null){
                try {
                    this.subject = localizeMessage(this.context, this.activityId, this.referencedBy, this.subjectMessageId, localName);
                }catch(Exception e){
                    e.printStackTrace();
                }
            } else {
                this.subject = prepareMessage(this.context, this.activityId, this.referencedBy, this.subjectMessageId, localName, this.subjectArguments);
            }
        }
        if(isBodyRichFormatted()){
            String bodyMsg = localizeMessage(this.context, this.activityId, this.referencedBy, this.bodyMessageId, localName);
            this.body = bodyMsg;
            try {
                this.body = MessageHelper.processTemplate(this.bodyMessageId, bodyMsg, this.dataModel, localName);
            } catch(TemplateException te){
                this.log.debug("Parsing template for "+formatWhere(this.bodyMessageId) +" failed");
                te.printStackTrace();
            } catch (IOException e) {
                this.log.debug("Parsing template for "+formatWhere(this.bodyMessageId) +" failed");
                e.printStackTrace();
            }
        } else {
            if(this.bodyArguments == null){
                this.body = localizeMessage(this.context, this.activityId, this.referencedBy, this.bodyMessageId, localName);
            } else {
                this.body = prepareMessage(this.context, this.activityId, this.referencedBy,this.bodyMessageId, localName, this.bodyArguments);
            }
        }
    }   
	
	public void sendMessage(){	

	    if (StringUtil.notNullOrEmpty(this.mailTo)){
	        // for multiple recipients, we assume separator for the multiple recipients is ","/";" 
	        String[] recipients = this.mailTo.split(";");
	        // for multiple recipients, 
	        if (recipients != null && recipients.length == 1) {
	            recipients = this.mailTo.split(",");
	        }
	        
	        if (recipients.length > 1) {
	            for (String recipient: recipients) {
	                String localName = (String) selectDbValue(this.context,"afm_users","locale","email = " + literal(this.context, recipient));
	                if((this.subjectMessageId != null) || (this.bodyMessageId != null)){
	                    format(localName);
	                }
	                sendEmail(this.context, this.body, this.subject, recipient, this.activityId);
	            }
	        } else {
	            String localName = (String) selectDbValue(this.context,"afm_users","locale","email = " + literal(this.context,this.mailTo));
                if((this.subjectMessageId != null) || (this.bodyMessageId != null)){
                    format(localName);
                }
                sendEmail(this.context, this.body, this.subject, this.mailTo, this.activityId);
	        }
	    } else {
	        this.log.warn("E-mail address is empty..., can not send mail");
	        return;
	    }
	}
	
	public Boolean isSubjectRichFormatted(){
	    if(this.subjectRichFormatted == null){
	        //initialize to false
	        this.subjectRichFormatted = false;
	        if(this.subjectMessageId != null && this.activityId != null && this.referencedBy != null){
				Object tmp = selectDbValue(this.context,"messages","is_rich_msg_format",formatWhere(this.subjectMessageId));
				if(tmp != null){
					this.subjectRichFormatted = getIntegerValue(this.context,tmp) > 0;
				}
			}
		}
		return this.subjectRichFormatted;
	}
	
	public Boolean isBodyRichFormatted(){
		if(this.bodyRichFormatted == null){
		    this.bodyRichFormatted = false;
		    if(this.bodyMessageId != null && this.activityId != null && this.referencedBy != null){
				Object tmp = selectDbValue(this.context,"messages","is_rich_msg_format",formatWhere(this.bodyMessageId));
				if(tmp != null){
					this.bodyRichFormatted = getIntegerValue(this.context,tmp) > 0;
				} 
			}
		}
		return this.bodyRichFormatted;
	}
	
	private String formatWhere(String messageId){
		return "activity_id = "+literal(this.context,this.activityId)+" AND referenced_by = " + literal(this.context,this.referencedBy)
			+" AND message_id = " + literal(this.context,messageId);
	}
	
	public String getText() {
		return this.body;
	}
	public void setText(String text) {
		this.body = text;
	}
	public String getMailFrom() {
		return this.mailFrom;
	}
	public void setMailFrom(String mailfrom) {
		this.mailFrom = mailfrom;
	}
		
	public String getNameto() {
		return this.nameTo;
	}
	public void setNameto(String nameto) {
		this.nameTo = nameto;
	}
	
	public String getMailTo() {
		return this.mailTo;
	}
	public void setMailTo(String mailto) {
		this.mailTo = mailto;
	} 
 
	public String getStepCode() {
		return this.stepCode;
	}
	public void setStepCode(String stepCode) {
		this.stepCode = stepCode;
	}
	public String getSubject() {
		return localizeString(this.context, this.subject);
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public Map<String, Object> getDataModel() {
		return this.dataModel;
	}

	public void setDataModel(Map<String, Object> dataModel) {
		this.dataModel = dataModel;
	}

	public String getSubjectMessageId() {
		return this.subjectMessageId;
	}

	public void setSubjectMessageId(String subjectMessageId) {
		this.subjectMessageId = subjectMessageId;
		Object tmp = selectDbValue(this.context,"messages","is_rich_msg_format",formatWhere(subjectMessageId));
		if(tmp != null){
			this.subjectRichFormatted = getIntegerValue(this.context,tmp) > 0;
		}
	}

	public String getBodyMessageId() {
		return this.bodyMessageId;
	}

	public void setBodyMessageId(String bodyMessageId) {
		this.bodyMessageId = bodyMessageId;
		Object tmp = selectDbValue(this.context,"messages","is_rich_msg_format",formatWhere(bodyMessageId));
		if(tmp != null){
			this.bodyRichFormatted = getIntegerValue(this.context,tmp) > 0;
		}
	}

	public String getActivityId() {
		return this.activityId;
	}

	public void setActivityId(String activityId) {
		this.activityId = activityId;
	}

	public String getReferencedBy() {
		return this.referencedBy;
	}

	public void setReferencedBy(String referencedBy) {
		this.referencedBy = referencedBy;
	}

	public void setSubjectRichFormatted(boolean subjectRichFormatted) {
		this.subjectRichFormatted = subjectRichFormatted;
	}

	public void setBodyRichFormatted(boolean bodyRichFormatted) {
		this.bodyRichFormatted = bodyRichFormatted;
	}

	public Object[] getSubjectArguments() {
		return this.subjectArguments;
	}

	public void setSubjectArguments(Object[] subjectArguments) {
		this.subjectArguments = subjectArguments;
	}

	public Object[] getBodyArguments() {
		return this.bodyArguments;
	}

	public void setBodyArguments(Object[] bodyArguments) {
		this.bodyArguments = bodyArguments;
	}

    public void setBody(String bodyText) {
        this.body = bodyText;
    }
	

}
