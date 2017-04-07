package com.archibus.eventhandler.Moves;

import java.io.UnsupportedEncodingException;
import java.util.*;

import com.archibus.app.common.notification.dao.datasource.NotificationMessageDataSource;
import com.archibus.app.common.notification.domain.NotificationMessage;
import com.archibus.app.common.notification.message.NotificationMessageFormatter;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 *
 * Move email notifications. Provides methods to format and send email notifications.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class MoveNotifications extends EventHandlerBase {

    /**
     * Activity id.
     */
    private static final String ACTIVITY_ID = "AbMoveManagement";

    /**
     * Activity id.
     */
    private static final String REFERENCED_BY = "MOVE_NOTIFICATIONS_WFR";

    /**
     * Activity id.
     */
    private static final String UNDERSCORE = "_";
    
    /**
     * Eventhandler context.
     */
    private final EventHandlerContext context;

    /**
     * If notification is for group move.
     */
    private boolean isGroupMove;

    /**
     * Move id.
     */
    private int moveId;
    
    /**
     * Project id.
     */
    private String projectId;
    
    /**
     * Email subject.
     */
    private NotificationMessage subject;
    
    /**
     * Email body.
     */
    private NotificationMessage body;

    /**
     * Free marker variables data model.
     */
    private Map<String, Object> dataModel;
    
    /**
     * Constructor.
     *
     * @param context eventhandler context
     */
    public MoveNotifications(final EventHandlerContext context) {
        super();
        this.context = context;
    }
    
    /**
     * Send email to recipient.
     *
     * @param moveStep move step (APPROVE, REQUEST, etc)
     * @param notificationType notification type (INFORM, REQUEST, INFORM_CONTACT)
     * @param recipient recipient email
     * @throws ExceptionBase exception
     */
    public void sendEmailToRecipient(final String moveStep, final String notificationType,
            final String recipient) throws ExceptionBase {
        if (StringUtil.notNullOrEmpty(recipient)) {
            // Load email subject and body from database
            getEmailSubjectAndBody(moveStep, notificationType);
            // prepare data model.
            try {
                prepareDataModel();
            } catch (final UnsupportedEncodingException exception) {
                throw new ExceptionBase("Unsuported URL Encoding", exception);
            }
            final NotificationMessageFormatter messageFormatter = new NotificationMessageFormatter();
            final String recipientLocale = this.getLocaleForRecipient(recipient);
            final String formattedSubject =
                    messageFormatter.formatMessage(recipientLocale, this.subject, this.dataModel);
            final String formattedBody =
                    messageFormatter.formatMessage(recipientLocale, this.body, this.dataModel);

            sendEmail(formattedBody, formattedSubject, recipient, ACTIVITY_ID, new ArrayList<String>());
        }
    }

    /**
     * Setter for the isGroupMove property.
     *
     * @see isGroupMove
     * @param isGroupMoveLcl the isGroupMove to set
     */
    
    public void setGroupMove(final boolean isGroupMoveLcl) {
        this.isGroupMove = isGroupMoveLcl;
    }

    /**
     * Setter for the moveId property.
     *
     * @see moveId
     * @param moveId the moveId to set
     */
    
    public void setMoveId(final int moveId) {
        this.moveId = moveId;
    }

    /**
     * Setter for the projectId property.
     *
     * @see projectId
     * @param projectId the projectId to set
     */
    
    public void setProjectId(final String projectId) {
        this.projectId = projectId;
    }

    /**
     * Load email subject and body from messages table.
     *
     * @param moveStep move step (APPROVE, REQUEST, etc)
     * @param notificationType notification type (INFORM, REQUEST)
     */
    private void getEmailSubjectAndBody(final String moveStep, final String notificationType) {
        final String moveType = this.isGroupMove ? "GROUP" : "SINGLE";
        final String subjectId =
                (moveStep + UNDERSCORE + moveType + UNDERSCORE + notificationType + UNDERSCORE + "SUBJECT")
                .toUpperCase();
        final String bodyId =
                (moveStep + UNDERSCORE + moveType + UNDERSCORE + notificationType + UNDERSCORE + "BODY")
                .toUpperCase();
        
        final NotificationMessageDataSource messageDataSource = new NotificationMessageDataSource();
        this.subject = messageDataSource.getByPrimaryKey(ACTIVITY_ID, REFERENCED_BY, subjectId);
        this.body = messageDataSource.getByPrimaryKey(ACTIVITY_ID, REFERENCED_BY, bodyId);
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
     * Prepare data model object.
     *
     * @throws UnsupportedEncodingException URL Encoder exception
     */
    private void prepareDataModel() throws UnsupportedEncodingException {
        this.dataModel = new HashMap<String, Object>();
        // add
        this.dataModel.put("web_central_path", getWebCentralPath(this.context));
        if (this.isGroupMove) {
            this.dataModel.put("project.project_id", this.projectId);
            this.dataModel.put("encoded_project_id",
                java.net.URLEncoder.encode(this.projectId, "UTF-8"));
        } else {
            this.dataModel.put("mo.mo_id", this.moveId);
            this.dataModel.put("encoded_mo_id", this.moveId);
        }
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
        try {
            sendEmail(emailBody, from, host, port, emailSubject, recipient, null, null, userId,
                password, (ArrayList<String>) attachmentFileNames, CONTENT_TYPE_TEXT_UFT8, activityCode);
        } catch (final ExceptionBase e) {
            // do nothing
        }
    }
}
