package com.archibus.app.common.notification.service;

import java.util.*;

import com.archibus.app.common.notification.dao.INotificationMessageDao;
import com.archibus.app.common.notification.dao.datasource.NotificationMessageDataSource;
import com.archibus.app.common.notification.domain.*;
import com.archibus.app.common.notification.message.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.schema.*;
import com.archibus.utility.*;

/**
 *
 * Compliance Notification Formatter Implementation Class.
 *
 * @author Zhang Yi
 *
 */
public class NotificationFormatter implements INotificationFormatter {
    
    /** index for email field. */
    private static final int INDEX_EMAIL_FIELD = 3;
    
    /**
     * the dot constant.
     */
    private static final String DOT = ".";

    /**
     * Source name.
     */
    private static final String SRC_NAME = "notifications";
    
    /**
     * notifications messages DAO.
     */
    private INotificationMessageDao messageDao;
    
    /**
     * notifications email message formatter.
     */
    private NotificationMessageFormatter messageFormatter;
    
    /**
     * Constructor.
     *
     */
    public NotificationFormatter() {
        
        this.messageDao = new NotificationMessageDataSource();
        
    }
    
    /** {@inheritDoc} */
    @Override
    public void format(final List<Notification> notifications,
            final NotificationTemplate notificationTemplate) {
        
        // Get activity id
        final String activityId = notificationTemplate.getActivityId();
        
        final String subjectReferenceBy = notificationTemplate.getSubjectReferencedBy();
        final String subjectId = notificationTemplate.getSubjectId();
        
        // Get subject object of notification template
        final NotificationMessage subject =
                this.messageDao.getByPrimaryKey(activityId, subjectReferenceBy, subjectId);
        
        final String messageReferenceBy = notificationTemplate.getMessageReferencedBy();
        final String messageId = notificationTemplate.getMessageId();
        
        // Get body object of notification template
        final NotificationMessage body =
                this.messageDao.getByPrimaryKey(activityId, messageReferenceBy, messageId);
        
        // Only format mail message for 'Email' or 'Email and Alert' type of notifications
        if ("Email".equalsIgnoreCase(notificationTemplate.getType())
                || "Email and Alert".equalsIgnoreCase(notificationTemplate.getType())) {
            
            for (final Notification notification : notifications) {
                
                // get recipients from template
                final String[] recipients =
                        notificationTemplate.getRecipients() == null ? new String[] {}
                : notificationTemplate.getRecipients().split("[;,]");

                        if (StringUtil.notNullOrEmpty(notificationTemplate.getSubject())) {

                            notification.setSubjectLine(notificationTemplate.getSubject());

                        } else if (subject != null) {
                            notification.setSubject(subject);
                        }

                        if (body != null) {
                            notification.setBody(body);
                        }

                        this.formatMessagesOfNotification(notification, recipients);

            }
            
        }
    }
    
    /**
     * Getter for the messageFormatter property.
     *
     * @see messageFormatter
     * @return the messageFormatter property.
     */
    public NotificationMessageFormatter getMessageFormatter() {
        return this.messageFormatter;
    }
    
    /**
     * @param messageDao the message dao to set
     */
    public void setMessageDao(final INotificationMessageDao messageDao) {
        this.messageDao = messageDao;
    }
    
    /**
     * Setter for the messageFormatter property.
     *
     * @see messageFormatter
     * @param messageFormatter the messageFormatter to set
     */
    
    public void setMessageFormatter(final NotificationMessageFormatter messageFormatter) {
        this.messageFormatter = messageFormatter;
    }
    
    /**
     * Format message and return formatted message.
     *
     * @param notification Notification Object name
     * @param recipients Email address list
     *
     */
    private void formatMessagesOfNotification(final Notification notification,
            final String[] recipients) {
        
        // Only format mail message for not empty recipient list
        if (recipients != null && recipients.length > 0) {
            
            final List<MailMessage> mailMessages = new ArrayList<MailMessage>();
            
            // prepare data model for message formatting
            final NotificationDataModel dataModel = new NotificationDataModel();
            dataModel.generateDataModel(notification);
            
            // Loop through each recipient
            for (final String recipient : recipients) {
                
                final String email =
                        recipient.contains("@") ? recipient.trim() : this.resolveEmail(
                            recipient.trim(), notification.getEventId());

                        if (email != null) {
                    // format subject and body messages of notification according to email address
                    this.messageFormatter.format(email, notification, dataModel);
                    
                    // set formatted subject and body to Mail Message
                    final MailMessage mailMessage = new MailMessage();
                    mailMessage.setSubject(this.messageFormatter.getFormattedSubject());
                    mailMessage.setText(this.messageFormatter.getFormattedBody());
                    // set source and source_id
                    mailMessage.setSourceName(SRC_NAME);
                    mailMessage.setSourceId(StringUtil.toString(notification.getId()));
                    // set to address of email message
                    mailMessage.setTo(email);
                    
                    // add Mail Message to mails list of current Notification
                    mailMessages.add(mailMessage);
                }
            }
            
            notification.setMailMessages(mailMessages);
        }
    }

    /**
     * Resolve the email from expression.
     *
     * The format of the expression should be like: ${[event table].[recipient field FK].[source
     * table].[email address field]}, for instance ${activity_log.manager.em.email}. <br/>
     * If it doesn't use a lookup table, the e-mail address is assumed to be in the event table,for
     * instance ${activity_log.option1}
     *
     * @param recipient the recipient expression
     * @param eventId the event id (activity_log_id)
     * @return valid email or null
     */
    private String resolveEmail(final String recipient, final int eventId) {
        // ${event table.recipient field FK.source table.email address field}
        final String[] parts = recipient.split("\\.");

        String resolvedEmail = null;
        
        if (parts.length == 2) {
            // assume it is e.g. ${activity_log.option1}
            final String eventTable = parts[0].substring(parts[0].indexOf('{') + 1);
            final String emailField = parts[1].substring(0, parts[1].indexOf('}'));
            
            final String pkEventField = getPkeyField(eventTable);
            
            final DataSource eventDs =
                    DataSourceFactory.createDataSourceForFields(eventTable,
                        new String[] { emailField });
            
            eventDs.addRestriction(Restrictions.eq(eventTable, pkEventField, eventId));
            final DataRecord eventRecord = eventDs.getRecord();

            if (eventRecord != null) {
                resolvedEmail = eventRecord.getString(eventTable + DOT + emailField);
            }
            
        } else {
            if (parts.length < INDEX_EMAIL_FIELD + 1) {
                // @Translatable
                throw new ExceptionBase("Wrong format for recipient lookup field {0}", recipient);
            }
            
            final String eventTable = parts[0].substring(parts[0].indexOf('{') + 1);
            final String recipientField = parts[1];
            final String lookupTable = parts[2];
            final String emailField =
                    parts[INDEX_EMAIL_FIELD].substring(0, parts[INDEX_EMAIL_FIELD].indexOf('}'));
            
            final String pkEventField = getPkeyField(eventTable);
            
            // lookup in activity_log table
            final DataSource eventDs =
                    DataSourceFactory.createDataSourceForFields(eventTable,
                        new String[] { recipientField });
            eventDs.addRestriction(Restrictions.eq(eventTable, pkEventField, eventId));
            final DataRecord eventRecord = eventDs.getRecord();

            if (eventRecord != null) {
                final String lookupFieldValue =
                        eventRecord.getString(eventTable + DOT + recipientField);
                resolvedEmail = lookupEmail(lookupFieldValue, lookupTable, emailField);
            }

        }

        return resolvedEmail;
    }
    
    /**
     * Lookup the e-mail.
     *
     * @param lookupFieldValue lookup field
     * @param lookupTable lookup table
     * @param emailField email field
     * @return resolved email
     */
    private String lookupEmail(final String lookupFieldValue, final String lookupTable,
            final String emailField) {

        String resolvedEmail = null;

        if (lookupFieldValue != null) {
            final String pkField = getPkeyField(lookupTable);

            final DataSource lookupDs =
                    DataSourceFactory.createDataSourceForFields(lookupTable, new String[] {
                            emailField, pkField });
            lookupDs.addRestriction(Restrictions.eq(lookupTable, pkField, lookupFieldValue));

            final DataRecord record = lookupDs.getRecord();
            if (record != null) {
                resolvedEmail = record.getString(lookupTable + DOT + emailField);
            }
        }
        return resolvedEmail;
    }
    
    /**
     * Lookup (first) primary key field for a table. Assume there is only one primary key.
     *
     * @param lookupTable the table name to look for
     * @return the primary key field name
     */
    private String getPkeyField(final String lookupTable) {
        final TableDef.Immutable tableDef =
                ContextStore.get().getProject().loadTableDef(lookupTable);

        // get all primary key field definition
        final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> pkFieldsDef =
                tableDef.getPrimaryKey().getFields();

        return pkFieldsDef.get(0).getName();
    }
}
