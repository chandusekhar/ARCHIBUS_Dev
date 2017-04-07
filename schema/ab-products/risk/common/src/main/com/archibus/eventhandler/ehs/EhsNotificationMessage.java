package com.archibus.eventhandler.ehs;

import java.io.*;
import java.util.*;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

import freemarker.template.*;

/**
 * Prepare and send notification email.
 * 
 * @author Ioan Draghici
 * 
 */
public class EhsNotificationMessage extends EventHandlerBase {
    
    /**
     * Field name.
     */
    private static final String IS_RICH_MSG_FORMAT = "is_rich_msg_format";
    
    /**
     * Table name.
     */
    private static final String TABLE_NAME = "messages";
    
    /**
     * Actvity id.
     */
    private String activityId;
    
    /**
     * Attachments list.
     */
    private List<String> attachments;
    
    /**
     * Email body.
     */
    private String body;
    
    /**
     * Body message id.
     */
    private List<String> bodyId;
    
    /**
     * If body is rich text formatted.
     */
    private List<Boolean> bodyRichFormatted;
    
    /**
     * Event handler context.
     */
    private final EventHandlerContext context;
    
    /**
     * Data model object.
     */
    private Map<String, Object> dataModel;
    
    /**
     * Email send to.
     */
    private String mailTo;
    
    /**
     * Message referenced by.
     */
    private String referencedBy;
    
    /**
     * Email subject.
     */
    private String subject;
    
    /**
     * Subject message id.
     */
    private String subjectId;
    
    /**
     * If subject is rich text formatted.
     */
    private Boolean subjectRichFormatted;
    
    /**
     * Constructor.
     * 
     * @param context event handler context
     */
    public EhsNotificationMessage(final EventHandlerContext context) {
        super();
        this.context = context;
    }
    
    /**
     * Format and prepare email message.
     * 
     * @param locale current locale
     */
    public void format(final String locale) {
        String localeName = null;
        if (!"DEFAULT".equals(locale)) {
            localeName = locale;
        }
        
        // prepare subject
        this.subject = formatMessage(localeName, this.subjectId, this.subjectRichFormatted, null);
        
        // prepare body
        this.body = "";
        for (int index = 0; index < this.bodyId.size(); index++) {
            final String crtBodyId = this.bodyId.get(index);
            final Boolean isRichFormatted = this.bodyRichFormatted.get(index);
            final String crtBodyMsg = formatMessage(localeName, crtBodyId, isRichFormatted, null);
            if (index > 0) {
                this.body += "\r\n";
            }
            this.body += crtBodyMsg;
        }
    }
    
    /**
     * Send email message.
     */
    public void sendMessage() {
        if (StringUtil.notNullOrEmpty(this.mailTo)) {
            // for multiple recipients email separator is , or ;
            String[] recipients = this.mailTo.split(";");
            if (recipients != null && recipients.length == 1) {
                recipients = this.mailTo.split(",");
            }
            
            if (recipients.length > 1) {
                for (final String recipient : recipients) {
                    final String localeName = getLocaleForRecipient(recipient);
                    format(localeName);
                    
                    sendEmail(this.body, this.subject, recipient, this.activityId, this.attachments);
                }
            } else {
                final String localeName = getLocaleForRecipient(this.mailTo);
                format(localeName);
                sendEmail(this.body, this.subject, this.mailTo, this.activityId, this.attachments);
            }
        } else {
            this.log.warn("E-mail address is empty..., can not send mail");
            return;
            
        }
    }
    
    /**
     * @param activityId the activityId to set
     */
    public void setActivityId(final String activityId) {
        this.activityId = activityId;
    }
    
    /**
     * Setter for the attachments property.
     * 
     * @see attachments attachments list
     * @param attachments the attachments to set
     */
    
    public void setAttachments(final List<String> attachments) {
        this.attachments = attachments;
    }
    
    /**
     * @param bodyId the bodyId to set
     */
    public void setBodyId(final List<String> bodyId) {
        this.bodyId = bodyId;
        this.bodyRichFormatted = new ArrayList<Boolean>();
        for (int index = 0; index < this.bodyId.size(); index++) {
            final String bodyMessageId = this.bodyId.get(index);
            final Object temp =
                    selectDbValue(this.context, TABLE_NAME, IS_RICH_MSG_FORMAT,
                        getMessageRestriction(bodyMessageId));
            if (temp != null) {
                this.bodyRichFormatted.add(index, getIntegerValue(this.context, temp) > 0);
            }
        }
    }
    
    /**
     * @param dataModel the dataModel to set
     */
    public void setDataModel(final Map<String, Object> dataModel) {
        this.dataModel = dataModel;
    }
    
    /**
     * @param mailTo the mailTo to set
     */
    public void setMailTo(final String mailTo) {
        this.mailTo = mailTo;
    }
    
    /**
     * @param referencedBy the referencedBy to set
     */
    public void setReferencedBy(final String referencedBy) {
        this.referencedBy = referencedBy;
    }
    
    /**
     * @param subjectId the subjectId to set
     */
    public void setSubjectId(final String subjectId) {
        this.subjectId = subjectId;
        final Object temp =
                selectDbValue(this.context, TABLE_NAME, IS_RICH_MSG_FORMAT,
                    getMessageRestriction(this.subjectId));
        if (temp != null) {
            this.subjectRichFormatted = getIntegerValue(this.context, temp) > 0;
        }
    }
    
    /**
     * Format message and return formatted message.
     * 
     * @param localeName locale name
     * @param messageId message id
     * @param isRichFormatted boolean
     * @param arguments array
     * @return string
     */
    private String formatMessage(final String localeName, final String messageId,
            final Boolean isRichFormatted, final Object[] arguments) {
        String formattedMessage = null;
        if (isRichFormatted) {
            final String message =
                    localizeMessage(this.context, this.activityId, this.referencedBy, messageId,
                        localeName);
            formattedMessage = message;
            try {
                formattedMessage = processTemplate(messageId, message, this.dataModel);
            } catch (final ExceptionBase e) {
                this.log.debug("Parsing notification template for "
                        + getMessageRestriction(messageId) + " failed; " + e.getMessage());
            }
            
        } else {
            if (arguments == null) {
                formattedMessage =
                        localizeMessage(this.context, this.activityId, this.referencedBy,
                            messageId, localeName);
            } else {
                formattedMessage =
                        prepareMessage(this.context, this.activityId, this.referencedBy, messageId,
                            localeName, arguments);
            }
            
        }
        return formattedMessage;
    }
    
    /**
     * Get locale name for current recipient.
     * 
     * @param email email address
     * @return string
     */
    private String getLocaleForRecipient(final String email) {
        return (String) selectDbValue(this.context, "afm_users", "locale",
            "email = " + literal(this.context, email));
    }
    
    /**
     * Get Sql message restriction.
     * 
     * @param messageId message id
     * @return sql string
     */
    private String getMessageRestriction(final String messageId) {
        return "messages.activity_id = " + literal(this.context, this.activityId)
                + " AND messages.referenced_by = " + literal(this.context, this.referencedBy)
                + " AND messages.message_id = " + literal(this.context, messageId);
    }
    
    /**
     * Process message template and replace FreeMarker variables.
     * 
     * @param name message name
     * @param template message template
     * @param datamodel data model object
     * @return string
     * @throws ExceptionBase if template cannot be processed
     */
    private String processTemplate(final String name, final String template,
            final Map<String, Object> datamodel) throws ExceptionBase {
        final Configuration configuration = new Configuration();
        configuration.setNumberFormat("#");
        final java.io.Reader reader = new StringReader(template);
        
        Template tpl;
        final StringWriter stringWriter = new StringWriter();
        
        try {
            tpl = new Template(name, reader, configuration);
            tpl.process(datamodel, stringWriter);
            
        } catch (final TemplateException te) {
            throw new ExceptionBase(null, "Could not process template - TemplateException", te);
        } catch (final IOException e) {
            throw new ExceptionBase(null, "Could not process template - IOException", e);
        }
        return stringWriter.getBuffer().toString();
    }
    
    /**
     * Send email message.
     * 
     * @param emailBody email body
     * @param emailSubject email subject
     * @param recipient email recipient
     * @param activityCode activity id
     * @param attachmentFileNames list of attachment files
     */
    private void sendEmail(final String emailBody, final String emailSubject,
            final String recipient, final String activityCode,
            final List<String> attachmentFileNames) {
        
        final String from = getEmailFrom(this.context);
        final String host = getEmailHost(this.context);
        final String port = getEmailPort(this.context);
        final String userId = getEmailUserId(this.context);
        final String password = getEmailPassword(this.context);
        
        sendEmail(emailBody, from, host, port, emailSubject, recipient, null, null, userId,
            password, (ArrayList<String>) attachmentFileNames, CONTENT_TYPE_TEXT_UFT8, activityCode);
        
    }
    
}
