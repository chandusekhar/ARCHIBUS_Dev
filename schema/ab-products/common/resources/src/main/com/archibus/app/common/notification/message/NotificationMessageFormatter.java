package com.archibus.app.common.notification.message;

import java.io.*;
import java.util.Map;

import org.apache.log4j.Logger;

import com.archibus.app.common.notification.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.common.FreeMakerTemplatePreProcessor;
import com.archibus.utility.*;

import freemarker.template.*;

/**
 * 
 * Compliance Notification Formatter Implementation Class.
 * 
 * @author Zhang Yi
 * 
 */
public class NotificationMessageFormatter {
    
    /**
     * Event handler context.
     */
    private final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    
    /**
     * Notification Body that is formatted.
     */
    private String formattedBody;
    
    /**
     * Notification Subject that is formatted.
     */
    private String formattedSubject;
    
    /**
     * Locale DataSource.
     */
    private final DataSource localeDs = DataSourceFactory.createDataSourceForFields("afm_users",
        new String[] { "locale", "email" });
    
    /**
     * Logger instance.
     */
    private final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * Format subject and body of Notification.
     * 
     * @param email email address
     * @param notification Notification Object name
     * @param dataModel Notification DataModel Object to set
     * 
     */
    public void format(final String email, final Notification notification,
            final NotificationDataModel dataModel) {
        
        // Format Notification's subject and body based on locale and Data Model
        final String localeName = this.getLocaleForRecipient(email);
        
        final String subject =
                StringUtil.notNullOrEmpty(notification.getSubjectLine()) ? notification
                    .getSubjectLine() : this.formatMessage(localeName, notification.getSubject(),
                    dataModel.getDataModel());
        this.setFormattedSubject(subject);
        
        final String body =
                this.formatMessage(localeName, notification.getBody(), dataModel.getDataModel());
        this.setFormattedBody(body);
    }
    
    /**
     * Format message and return formatted message.
     * 
     * @param localeName locale name address
     * @param message NotificationMessage object
     * @param arguments values prepared for message formatting
     * 
     * @return string format of formatted message
     */
    public String formatMessage(final String localeName, final NotificationMessage message,
            final Map<String, Object> arguments) {
        
        String formattedMessage = null;
        if (message != null && message.getIsRichText() == 1) {
            
            final String messageText =
                    EventHandlerBase.localizeMessage(this.context, message.getActivityId(),
                        message.getReferencedBy(), message.getId(), localeName);
            formattedMessage = messageText;
            
            try {
                formattedMessage =
                        processTemplate(message.getId(), message.getMessageText(), arguments);
                
            } catch (final ExceptionBase e) {
                
                this.log.debug("Parsing notification message for " + message.getId() + " failed; "
                        + e.getMessage());
                
            }
            
        } else if (message != null) {
            
            if (arguments == null) {
                formattedMessage =
                        EventHandlerBase.localizeMessage(this.context, message.getActivityId(),
                            message.getReferencedBy(), message.getId(), localeName);
            } else {
                formattedMessage =
                        EventHandlerBase.prepareMessage(this.context, message.getActivityId(),
                            message.getReferencedBy(), message.getId(), localeName, null);
            }
            
        }
        return formattedMessage;
    }
    
    /**
     * Getter for the formattedBody property.
     * 
     * @see formattedBody
     * @return the formattedBody property.
     */
    public String getFormattedBody() {
        return this.formattedBody;
    }
    
    /**
     * Getter for the formattedSubject property.
     * 
     * @see formattedSubject
     * @return the formattedSubject property.
     */
    public String getFormattedSubject() {
        return this.formattedSubject;
    }
    
    /**
     * Setter for the formattedBody property.
     * 
     * @see formattedBody
     * @param formattedBody the formattedBody to set
     */
    
    public void setFormattedBody(final String formattedBody) {
        this.formattedBody = formattedBody;
    }
    
    /**
     * Setter for the formattedSubject property.
     * 
     * @see formattedSubject
     * @param formattedSubject the formattedSubject to set
     */
    
    public void setFormattedSubject(final String formattedSubject) {
        this.formattedSubject = formattedSubject;
    }
    
    /**
     * Get locale name for current recipient.
     * 
     * @param email email address
     * @return string
     */
    private String getLocaleForRecipient(final String email) {
        final DataRecord record =
                this.localeDs.getRecord("email = " + EventHandlerBase.literal(this.context, email));
        
        final String locale = record == null ? "" : record.getString("afm_users.locale");
        
        return locale;
    }
    
    /**
     * Process message template and replace FreeMarker variables.
     * 
     * @param name message code
     * @param template message template code
     * @param datamodel data model object
     * @return string formatted text
     * 
     * @throws ExceptionBase if template cannot be processed
     */
    private String processTemplate(final String name, final String template,
            final Map<String, Object> datamodel) throws ExceptionBase {
        
        final Configuration configuration = new Configuration();
        configuration.setNumberFormat("#");
        
        final java.io.Reader reader =
                new StringReader(FreeMakerTemplatePreProcessor.preProcessTemplate(template));
        
        Template tpl;
        final StringWriter writer = new StringWriter();
        
        try {
            tpl = new Template(name, reader, configuration);
            tpl.process(datamodel, writer);
            
        } catch (final TemplateException te) {
            throw new ExceptionBase(null, "Could not process template - TemplateException", te);
        } catch (final IOException e) {
            throw new ExceptionBase(null, "Could not process template - IOException", e);
        }
        return writer.getBuffer().toString();
    }
    
}
