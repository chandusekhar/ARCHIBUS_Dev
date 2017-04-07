package com.archibus.eventhandler.steps;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.sql.*;
import java.text.*;
import java.util.*;
import java.util.Date;

import javax.activation.DataHandler;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.jobmanager.*;
import com.archibus.model.mail.service.MailLoggerDatabaseImpl;
import com.archibus.schema.*;
import com.archibus.utility.*;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

public class MessageHelper extends EventHandlerBase{

    public static String processTemplate(String name, String template, Map<String,Object> datamodel,String locale) throws TemplateException, IOException {
        
        //KB3043040 - localize field value of enum field
        if(locale!=null) {
            final Locale recipientLocal = XmlImpl.stringToLocale(locale);
            final Map<String, Object> activityLogDataModel =
                    (Map<String, Object>) datamodel.get("activity_log");
            List<Map<String, Object>> wrDataModels = new ArrayList<Map<String, Object>>();
            if (datamodel.get("wr") != null && datamodel.get("wr") instanceof Map) {
                wrDataModels.add((Map<String, Object>) datamodel.get("wr"));
            } else if (datamodel.get("wr") != null && datamodel.get("wr") instanceof List) {
                wrDataModels = (List<Map<String, Object>>) datamodel.get("wr");
            }
            final Map<String, Object> woDataModel = (Map<String, Object>) datamodel.get("wo");
            final Map<String, Object> stepDataModel = (Map<String, Object>) datamodel.get("step");
            localizeDataModelByLocale(activityLogDataModel, "activity_log", recipientLocal);
            for (final Map<String, Object> wrDataModel : wrDataModels) {
                localizeDataModelByLocale(wrDataModel, "wr", recipientLocal);
            }
            
            localizeDataModelByLocale(woDataModel, "wo", recipientLocal);
            localizeDataModelByLocale(stepDataModel, "helpdesk_step_log", recipientLocal);
        }

		Configuration cfg = new Configuration();
		//fix KB3031484- do not format the number type field (Guo 2011/6/3)
		cfg.setNumberFormat("#");
		
		java.io.Reader reader = new StringReader(template);
	
		Template tpl = new Template(name, reader, cfg); 		
	
		StringWriter sw = new StringWriter();
		tpl.process(datamodel, sw);		
	
		return sw.getBuffer().toString();
    }
    
    public static void sendMessage(EventHandlerContext context, Message message, MimeBodyPart[] attachmentBodyParts,String activityId)  {
        final EmailJob emailJob = new EmailJob(context,message,attachmentBodyParts,activityId);
        JobManager.ThreadSafe jobManager = getJobManager(context);
        jobManager.startJob(emailJob);
    }

    public static MimeBodyPart getAttachment(EventHandlerContext context, String tableName,String fieldName,int pkeyValue){

		com.archibus.config.Database.Immutable db = getDatabase(context);
		Connection conn=null;
		PreparedStatement ps=null;
		try {	
		    conn = db.getDataSource().getConnection();
	
		    ps = conn.prepareStatement("SELECT file_contents, doc_file FROM afm_docvers WHERE table_name= ? AND field_name = ? AND pkey_value = ? ORDER BY version DESC");
		    ps.setString(1, tableName);
		    ps.setString(2, fieldName);
		    ps.setInt(3, pkeyValue);
	
		    ResultSet rs = ps.executeQuery();
		    InputStream stream = null;
		    String fileName = null;
		    if (rs.next()) {
				stream = rs.getBinaryStream("file_contents");
		
				MimeBodyPart messageBodyPart = new MimeBodyPart();				
				messageBodyPart.setDataHandler(new DataHandler(new ByteArrayDataSource(stream,"application/octet-stream")));
				fileName = rs.getString("doc_file").trim();    
				messageBodyPart.setFileName(fileName);
				return messageBodyPart;
		    }
	
		} catch(SQLException e){
		    e.printStackTrace();			
		} catch (IOException e) {
		    e.printStackTrace();
		} catch (MessagingException e) {
			e.printStackTrace();
		} finally {
		    try { ps.close(); } catch (SQLException e ) {};	
		    try { conn.close(); } catch (SQLException e ) {};
		}	
		return null;
    }

    private static Map<String,Object> getActivityLogRecord(EventHandlerContext context,int activity_log_id){
		String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "activity_log_hactivity_log");
		Object[] fieldValues = selectDbValues(context,"activity_log_hactivity_log",fields_list,"activity_log_id ="+activity_log_id);
	
		Map<String,Object> values = new HashMap<String,Object>();
		if(fieldValues != null){
		    for(int i=0;i<fieldValues.length;i++){
				if(fields_list[i].equals("status") || fields_list[i].equals("step_status")){
					Map<String,String> valueText = new HashMap<String,String>();
					valueText.put("value", (String) fieldValues[i]);
					valueText.put("text", getEnumFieldDisplayedValue(context, "activity_log",fields_list[i], (String) fieldValues[i]));
				    values.put(fields_list[i],valueText);
				} else {
				    values.put(fields_list[i], fieldValues[i]);
				}
		    }
		    return values;
		} 
		return null;
    }

    private static Map<String,Object> getWrRecord(EventHandlerContext context, int wr_id){
		String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "wrhwr");
		Object[] fieldValues = selectDbValues(context,"wrhwr",fields_list,"wr_id ="+wr_id);
	
		Map<String,Object> values = new HashMap<String,Object>();
		if(fieldValues!=null) {
		    for(int i=0;i<fieldValues.length;i++){
	            if(fields_list[i].equals("status") || fields_list[i].equals("step_status")){
	                Map<String,String> valueText = new HashMap<String,String>();
	                valueText.put("value", (String) fieldValues[i]);
	                valueText.put("text", getEnumFieldDisplayedValue(context, "wr",fields_list[i], (String) fieldValues[i]));
	                values.put(fields_list[i],valueText);               
	            } else {
	                values.put(fields_list[i], notNull(fieldValues[i]));
	            }
	        }
		}
		
		return values;
    }

    private static Map<String,Object> getWoRecord(EventHandlerContext context, int wo_id){
		String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "wohwo");
		Object[] fieldValues = selectDbValues(context,"wohwo",fields_list,"wo_id ="+wo_id);
	
		Map<String,Object> values = new HashMap<String,Object>();
		for(int i=0;i<fieldValues.length;i++){
		    if(fields_list[i].equals("wo_type")){
		    	Map<String,String> valueText = new HashMap<String,String>();
				valueText.put("value", (String) fieldValues[i]);
				valueText.put("text", getEnumFieldDisplayedValue(context, "wo",fields_list[i], (String) fieldValues[i]));
			    values.put(fields_list[i],valueText);
		    } else {
		    	values.put(fields_list[i], fieldValues[i]);
		    }
		}
		return values;
    }

	public static Map<String,Object> getRequestDatamodel(EventHandlerContext context, String tableName,String fieldName,int id){
		Map<String,Object> result = new HashMap<String,Object>();
		if(tableName.equals("activity_log")){
			Map<String,Object> values = getActivityLogRecord(context, id);
			if(values != null){
				result.put(tableName, values);
				if(values.get("act_quest") != null){
					QuestionnaireHandler qh = new QuestionnaireHandler();
					List<Map<String,Object>> questions = qh.getQuestionnaireAnswers(context, "activity_log_hactivity_log", fieldName, "act_quest", id);
					result.put("questions", questions);
				}
				if(StringUtil.notNullOrEmpty(values.get("wr_id"))){
					int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
					Map<String,Object> wrValues = getWrRecord(context, wr_id);
					result.put("wr", wrValues);
					
					Object wo = selectDbValue(context,"wr","wo_id","wr_id = " + wr_id);
					if(wo != null){
						int wo_id = getIntegerValue(context, wo).intValue();
						Map<String,Object> woValues = getWoRecord(context, wo_id);
						result.put("wo", woValues);
					}
				}
			} else {
				throw new ExceptionBase("Record with id " + id +" not found in activity_log_hactivity_log");
			}
		} else if(tableName.equals("wr")){
			Map<String,Object> values = getWrRecord(context, id);
			if(values != null){
				result.put(tableName, values);
				if(StringUtil.notNullOrEmpty(values.get("wo_id"))){
					int wo_id = getIntegerValue(context, values.get("wo_id")).intValue();				
					Map<String,Object> woValues = getWoRecord(context, wo_id);
					result.put("wo", woValues);
				}
				if(StringUtil.notNullOrEmpty(values.get("activity_log_id"))){
					int activity_log_id = getIntegerValue(context, values.get("activity_log_id")).intValue();
					result.put("activity_log", getActivityLogRecord(context, activity_log_id));
				}
			} else {
				throw new ExceptionBase("Record with id " + id +" not found in wrhwr");
			}			
		} else if(tableName.equals("wo")){
			Map<String,Object> values = getWoRecord(context, id);
			if(values != null){
				result.put(tableName, values);
				List wrs = selectDbRecords(context,"wr",new String[]{"wr_id"},"wo_id = " + id);
				if(!wrs.isEmpty()){
					List wrRecords = new ArrayList();
					for(Iterator wrIt = wrs.iterator();wrIt.hasNext();){
						Object[] record = (Object[]) wrIt.next();
						wrRecords.add(getWrRecord(context,getIntegerValue(context, record[0])));
					}
					result.put("wr", wrRecords);
				}
				if(StringUtil.notNullOrEmpty(values.get("activity_log_id"))){
					int activity_log_id = getIntegerValue(context, values.get("activity_log_id")).intValue();
					result.put("activity_log", getActivityLogRecord(context, activity_log_id));
				}
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
		StepHandler sh = new StepHandler();		
		result.put("steps", sh.getStepsList(context, tableName, fieldName, id));
		return result;
	} 
	
	public static String getRequestInfo(EventHandlerContext context, String tableName,String fieldName,int id){
		Object[] record;
		StringBuffer requestInfo = new StringBuffer();
		if (tableName.equals(Constants.WORK_REQUEST_TABLE)) {
		    record = selectDbValues(context, tableName, Constants.WORK_REQUEST_FIELD_NAMES,
			    fieldName + "=" + id);
		    if (record == null) {
		    	requestInfo.append("Notification record not found");
		    }
		    for (int i = 0; i < Constants.WORK_REQUEST_FIELD_NAMES.length; i++) {
		    	if (record[i] != null) {
		    		if(Constants.WORK_REQUEST_FIELD_NAMES[i].equals("status")){
		    			requestInfo.append(Constants.WORK_REQUEST_FIELD_NAMES[i] + ": " + com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(context, Constants.WORK_REQUEST_TABLE, "status", (String) record[i]));
		    		} else {
			    		requestInfo.append(Constants.WORK_REQUEST_FIELD_NAMES[i] + ": " + record[i]
				                                                                             + "\n");	
		    		}
		    	} 
		    }
		} else {
		    record = selectDbValues(context, tableName, Constants.HELP_REQUEST_FIELD_NAMES,
			    fieldName + "=" + id);
		    if (record == null) {
		    	requestInfo.append("Notification record not found");
		    }
		    for (int i = 0; i < Constants.HELP_REQUEST_FIELD_NAMES.length; i++) {
		    	if (record[i] != null){
		    		if(Constants.HELP_REQUEST_FIELD_NAMES[i].equals("status")){
		    			requestInfo.append(Constants.HELP_REQUEST_FIELD_NAMES[i] +": " + com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(context, Constants.ACTION_ITEM_TABLE, "status", (String) record[i]));
		    		} else {
		    			requestInfo.append(Constants.HELP_REQUEST_FIELD_NAMES[i] + ": " + record[i]
				                                                                             + "\n");
		    		}
		    	}
		    }
		}
		return requestInfo.toString();
	}
	
	/**
     * Localize field value of enum field - add for KB3043040
     */
    public static void localizeDataModelByLocale(Map<String,Object> datamodel,String tableName, Locale locale) {
        if(datamodel != null) {
            Map<String,String> statusValues =  (Map<String,String>)datamodel.get("status");
            if(statusValues!=null) {
                statusValues.put("text", getEnumFieldDisplayedValueByLocal(tableName,"status",statusValues.get("value"),locale));
            }
            
            Map<String,String> stepStatusValues =  (Map<String,String>)datamodel.get("step_status");
            if(stepStatusValues!=null) {
                stepStatusValues.put("text", getEnumFieldDisplayedValueByLocal(tableName,"step_status",stepStatusValues.get("value"),locale));
            }
            
            Map<String,String> woTypeValues =  (Map<String,String>)datamodel.get("wo_type");
            if(woTypeValues!=null) {
                woTypeValues.put("text", getEnumFieldDisplayedValueByLocal(tableName,"wo_type",woTypeValues.get("value"),locale));
            }
            
            Map<String,String> stepTypeValues =  (Map<String,String>)datamodel.get("step_type");
            if(stepTypeValues!=null) {
                stepTypeValues.put("text", getEnumFieldDisplayedValueByLocal(tableName,"step_type",stepTypeValues.get("value"),locale));
            }
            
            Map<String,String> stepStatusResultValues =  (Map<String,String>)datamodel.get("step_status_result");
            if(stepStatusResultValues!=null) {
                stepStatusResultValues.put("text", getEnumFieldDisplayedValueByLocal(tableName,"step_status_result",stepStatusResultValues.get("value"),locale));
            }
            
            //Kb3043172 - support translate step name in notification messages
            String stepValues =  (String)datamodel.get("step");
            if(stepValues!=null) {
                final String localizedStepFieldValue = getStepFieldValueByLocal(datamodel, locale);
                if(localizedStepFieldValue != null) {
                    datamodel.put("step", localizedStepFieldValue);
                }
            }
            
            for (final String fieldId : datamodel.keySet()) {
                if(fieldId.indexOf("date_")!=-1) {
                    Object dateValue =  datamodel.get(fieldId);
                    if(dateValue!=null && dateValue instanceof Date) {
                        final String localizedDateValue = getDateFieldValueByLocal((Date)dateValue, locale);
                        if(localizedDateValue != null) {
                            datamodel.put(fieldId, localizedDateValue);
                        }
                    }
                }
                
            }
        }
    }
    
    /**
     * Get date field value display value by given locale
     */
    private static String getDateFieldValueByLocal(final Date dateValue, final Locale locale) {
        return DateFormat.getDateInstance(DateFormat.DEFAULT, locale).format(dateValue);
    }
	
	/**
     * Get enum field value display value by given locale
     */
    public static String getEnumFieldDisplayedValueByLocal(final String tableName, final String fieldName,  
            final String rawdValue, final Locale recipientLocal) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Locale  local = recipientLocal != null? recipientLocal: getLocale(context);
        
        ArchibusFieldDefBase.Immutable fieldDef = getParentContext(context).findProject()
            .loadTableDef(tableName).getFieldDef(fieldName);
        
        if(fieldDef instanceof FieldEnumImpl) {
            FieldEnumImpl fieldDefEnum = (FieldEnumImpl) fieldDef;
            ArrayList enumList = fieldDefEnum.getValues(local);
            for (Iterator it = enumList.iterator(); it.hasNext();) {
                final Vector values = (Vector) it.next();
                String value = values.elementAt(0).toString();
                String displayedValue = (String) values.elementAt(1);
                if (value.equals(rawdValue)) {
                    return displayedValue;
                }
            }
        }

        return rawdValue;
    }
    
    /**
     * Get afm_wf_steps field vlaue by locale
     */
    public static String getStepFieldValueByLocal(Map<String,Object> datamodel, Locale locale) {
        final String localizedStepFieldName = Common.getLocalizedStepFieldName(locale);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String localizedStepFieldValue =
                (String)com.archibus.eventhandler.EventHandlerBase.selectDbValue(
                    context,
                    "afm_wf_steps",
                    localizedStepFieldName,
                    "exists(select 1 from helpdesk_step_log where helpdesk_step_log.activity_id = afm_wf_steps.activity_id" +
                    " and helpdesk_step_log.activity_id = afm_wf_steps.activity_id" +
                    " and helpdesk_step_log.status = afm_wf_steps.status " +
                    " and helpdesk_step_log.step = afm_wf_steps.step " +
                    " and step_log_id = " + datamodel.get("step_log_id")+")");

        return localizedStepFieldValue;
    }

}

class EmailJob extends JobBase {
    private EventHandlerContext context;
    private Message message;
    private MimeBodyPart[] attachmentBodyParts;
    private String activityId;
    
    EmailJob(EventHandlerContext context,Message message, MimeBodyPart[] attachmentBodyParts,String activityId){
        this.context = context;
        this.message = message;
        this.attachmentBodyParts = attachmentBodyParts;
        this.activityId = activityId;
    }
    public void run() {
        if(this.attachmentBodyParts == null) {
            sendEmailWithoutAttachments();
        }else {
            try {
                sendEmailWithAttachments();
            } catch (final Exception e) {
                sendEmailWithoutAttachments();
            }
        }
    }
    
    private void sendEmailWithoutAttachments() {
        MailSender mailSender = new MailSender();
        mailSender.setHost(EventHandlerBase.getEmailHost(context));
        mailSender.setUser(EventHandlerBase.getEmailUserId(context));
        mailSender.setPassword(EventHandlerBase.getEmailPassword(context));
        mailSender.setFrom(EventHandlerBase.getEmailFrom(context));
        mailSender.setContentType(EventHandlerBase.CONTENT_TYPE_TEXT_UFT8);
        mailSender.setText(message.getText());
        mailSender.setSubject(message.getSubject());
        mailSender.setTo(message.getMailTo());
        mailSender.send();
    }
    
    private void sendEmailWithAttachments() throws MessagingException, UnsupportedEncodingException {
        Properties props = new Properties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.host", EventHandlerBase.getEmailHost(context));     
        props.put("mail.smtp.port", EventHandlerBase.getEmailPort(context)); 
        props.put("mail.smtp.user", EventHandlerBase.getEmailUserId(context)); 
        
        String userName = EventHandlerBase.getEmailUserId(context);
        String password = EventHandlerBase.getEmailPassword(context);
        
        Session mailSession = null;
        if (password != null && ! password.equals("")) {
            props.put("mail.smtp.auth", "true");    
            mailSession = Session.getDefaultInstance(props, new BasicAuthenticator(password,userName) );     
        } else {
            props.put("mail.smtp.auth", "false");   
            mailSession = Session.getDefaultInstance(props);            
        }    
    
        MimeMessage mimeMessage = new MimeMessage(mailSession);
        mimeMessage.setSubject(message.getSubject());
    
        mimeMessage.setContent(message.getText(), "text/plain");
        mimeMessage.setFrom(new InternetAddress(EventHandlerBase.getEmailFrom(context)));
        mimeMessage.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(message.getMailTo(),message.getNameto()));
    
        Multipart multipart = new MimeMultipart();
    
        //set body          
        MimeBodyPart messageBodyPart = new MimeBodyPart();
        multipart.addBodyPart(messageBodyPart);
        messageBodyPart.setText(message.getText());
    
        for (MimeBodyPart attachmentBodyPart: attachmentBodyParts ) {
            if(attachmentBodyPart != null){
                multipart.addBodyPart(attachmentBodyPart);
            }
        }
    
        mimeMessage.setContent(multipart);
        mimeMessage.setSentDate(new java.util.Date()); 
        
        Transport.send(mimeMessage); 
        
        //KB3043411, insert notification log to table afm_notifications_log
        MailMessage messageToLog = new MailMessage();
        messageToLog.setActivityId(activityId);
        messageToLog.setFrom(EventHandlerBase.getEmailFrom(context));
        messageToLog.setTo(message.getMailTo());
        messageToLog.setSubject(message.getSubject());
        messageToLog.setText(message.getText());
        messageToLog.setHost(EventHandlerBase.getEmailHost(context));
        messageToLog.setPort(EventHandlerBase.getEmailPort(context));
        messageToLog.setUser(EventHandlerBase.getEmailUserId(context));
        java.util.Date dateSent = new java.util.Date();
        Time timeSent = new Time(System.currentTimeMillis());
        messageToLog.setDateSent(dateSent);
        messageToLog.setTimeSent(timeSent);
        messageToLog.setStatus("SENT");
        new MailLoggerDatabaseImpl().logMessage(messageToLog);
    }
}