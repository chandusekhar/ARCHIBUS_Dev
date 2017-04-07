package com.archibus.eventhandler.steps;

import java.util.*;

import javax.mail.internet.MimeBodyPart;

import com.archibus.eventhandler.helpdesk.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * 
 * Notification Step
 */
public class Notification extends StepImpl {
    
    /**
     * Step name
     */
    private static final String STEP_NAME = "Notification";
    
    /**
     * Step type
     */
    private static final String STEP_TYPE = "notification";
    
    // additional fields for notification steps
    public String attachments;
    
    public String bodyMessageId;
    
    public String subjectMessageId;
    
    public Notification() {
        super(STEP_TYPE);
    }
    
    public Notification(final EventHandlerContext context, final String activity_id, final int id) {
        super(context, activity_id, id, STEP_TYPE, STEP_NAME);
    }
    
    public Notification(final EventHandlerContext context, final String activity_id, final int id,
            final Map<String, Object> values) {
        super(context, activity_id, id, values);
    }
    
    /**
     * 
     * Notification ends directly after invoke.
     * 
     * @return true
     */
    @Override
    public boolean hasEnded() {
        return true;
    }
    
    /**
     * Initialize Notification step Lookup custom subject, body and attachment(s) for the mail
     */
    @Override
    public void init(final EventHandlerContext context, final String activity_id, final int id,
            final Map<String, Object> values) {
        super.init(context, activity_id, id, values);
        
        // lookup subject,body and attachments
        final Object[] extra =
                selectDbValues(
                    context,
                    "afm_wf_steps",
                    new String[] { "subject_message_id", "body_message_id", "attachments" },
                    "activity_id = " + literal(context, this.activity_id) + " AND step = "
                            + literal(context, this.stepName) + " AND status = "
                            + literal(context, this.statusBefore));
        if (extra != null) {
            if (StringUtil.notNullOrEmpty(extra[0])) {
                this.subjectMessageId = (String) extra[0];
            }
            if (StringUtil.notNullOrEmpty(extra[1])) {
                this.bodyMessageId = (String) extra[1];
            }
            if (StringUtil.notNullOrEmpty(extra[2])) {
                this.attachments = (String) extra[2];
            }
            
        }
    }
    
    /**
     * 
     * Notification ends directly after invoke.
     * 
     * @return false
     */
    @Override
    public boolean inProgress() {
        return false;
    }
    
    /**
     * 
     * Invoke this step (send notification message).
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Check the condition for this specified in the SLA</li>
     * <li>{@link #createMessage() Create message}</li>
     * <li>Check if employee or role is given and send message</li>
     * <li>Set step ended and log step</li>
     * </ol>
     * </p>
     * 
     */
    @Override
    public void invoke() {
        if (!checkCondition()) {
            setStepEnded(true);
            return;
        }
        // create step log record
        if (this.id == 0) {
            // @translatable
            final String errorMessage =
                    localizeString(this.context,
                        "Cannot create step record without primary key value");
            throw new ExceptionBase(errorMessage, true);
        }
        
        // create the message to send
        final Message message = createMessage();
        
        // lookup recipient(s)
        if (this.afmRole != null) {
            final List<String> ems = this.getEmployeesFromAfmRole(this.afmRole);
            
            if (ems == null || ems.isEmpty()) {
                // @translatable
                final String errorMessage = "No employees found for role [{0}]";
                final Object[] args = { this.role };
                throw new ExceptionBase(errorMessage, args, true);
            }
            
            for (final String string : ems) {
                this.em_id = notNull(string);
                
                if (this.em_id != null) {
                    final String mailTo = getEmailAddress(this.context, this.em_id);
                    sendMail(message, this.em_id, mailTo);
                }
            }
        }else if (this.em_id != null) {
            final String mailTo = getEmailAddress(this.context, this.em_id);
            sendMail(message, this.em_id, mailTo);
        } else if (this.vn_id != null) {
            final String mailTo = getEmailAddressForVendor(this.context, this.vn_id);
            sendMail(message, this.vn_id, mailTo);
            
        } else if (this.cf_id != null) {
            final String mailTo = getEmailAddressForCraftsperson(this.context, this.cf_id);
            sendMail(message, this.cf_id, mailTo);
        } else if (this.role != null) {
            final List<String> ems =
                    HelpdeskRoles.getEmployeesFromHelpdeskRole(this.context, this.role,
                        this.tableName, this.fieldName, this.id);
            
            if (ems == null || ems.isEmpty()) {
                // @translatable
                final String errorMessage = "No employees found for role [{0}]";
                final Object[] args = { this.role };
                throw new ExceptionBase(errorMessage, args, true);
            }
            
            for (final String string : ems) {
                this.em_id = notNull(string);
                
                if (this.em_id != null) {
                    final String mailTo = getEmailAddress(this.context, this.em_id);
                    sendMail(message, this.em_id, mailTo);
                }
            }
        } else {
            // @translatable
            final String errorMessage =
                    localizeString(this.context,
                        "No employee, vendor, craftsperson or role to send notification");
            throw new ExceptionBase(errorMessage, true);
        }
    }
    
    @Override
    public void sendRequest(final Message message) {
        if (!StringUtil.notNullOrEmpty(message.getMailTo())) {
            this.log.warn("E-mail address is empty..., can not send mail");
            return;
        }
        final String update =
                "UPDATE " + Constants.STEP_LOG_TABLE + " SET email_sent = 1 WHERE step_code = "
                        + literal(this.context, message.getStepCode());
        executeDbSql(this.context, update, true);
        // KB3032268, add commit after update to avoid eror that lock record
        //executeDbCommit(this.context);
        this.inProgress = true;
        
        // add to fix KB3028654(Notiication step does not send email) 2010-9-6 by Guo Jiangtao
        final String localName =
                (String) selectDbValue(this.context, "afm_users", "locale",
                    "email = " + literal(this.context, message.getMailTo()));
        if ((message.getSubjectMessageId() != null) || (message.getBodyMessageId() != null)) {
            message.format(localName);
        }
        
        this.log.debug("EMAIL to: " + message.getMailTo() + " subject: " + message.getSubject()
                + " attachments: " + this.attachments);
        if (StringUtil.notNullOrEmpty(this.attachments)) {
            final String[] attachmentsNames = this.attachments.split(";");
            
            final MimeBodyPart[] attachmentBodyParts = new MimeBodyPart[attachmentsNames.length];
            for (int i = 0; i < attachmentsNames.length; i++) {
                attachmentBodyParts[i] =
                        MessageHelper.getAttachment(this.context, this.tableName,
                            attachmentsNames[i], this.id);
            }
            MessageHelper.sendMessage(this.context, message, attachmentBodyParts, this.activity_id);
        } else {
            MessageHelper.sendMessage(this.context, message, null, this.activity_id);
        }
    }
    
    /**
     * 
     * Create notification message.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create new message object and load parameters for current activity_id and steptype</li>
     * <li>Append data from request record to the mail body</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @return Notification message
     *         </p>
     */
    private Message createMessage() {
        final Message message = new Message(this.context);
        message.setActivityId(this.activity_id);
        
        // if body_message_id and subject_message_id are entered, use rich formatting
        if (this.bodyMessageId != null && this.subjectMessageId != null) {// use the templates
            message.setDataModel(MessageHelper.getRequestDatamodel(this.context, this.tableName,
                this.fieldName, this.id));
            message.setReferencedBy(Constants.REFERENCE_BY_NOTIFICATION_STEP);
            message.setSubjectMessageId(this.subjectMessageId);
            message.setBodyMessageId(this.bodyMessageId);
        } else {
            message.setReferencedBy("SENDEMAIL_" + this.type.toUpperCase() + "_STEPMGR");
            message.setBodyMessageId("SENDEMAIL_TEXT");
            message.setSubjectMessageId("SENDEMAIL_TITLE");
            if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                message.setDataModel(MessageHelper.getRequestDatamodel(this.context,
                    this.tableName, this.fieldName, this.id));
            }
            if (!message.isBodyRichFormatted()) {// only original body contained {?} parameters
                final String status =
                        getEnumFieldDisplayedValue(this.context, this.tableName, "status",
                            Common.getStatusValue(this.context, this.tableName, this.fieldName,
                                this.id));
                final Object[] args =
                        new Object[] {
                                status,
                                MessageHelper.getRequestInfo(this.context, this.tableName,
                                    this.fieldName, this.id) };
                message.setBodyArguments(args);
            }
        }
        message.format();
        return message;
    }
    
    /**
     * Log the notification step and send the e-mail message.
     * 
     * @param message
     * @param name
     * @param mailTo
     */
    private void sendMail(final Message message, final String name, final String mailTo) {
        setStepEnded(true);
        // than log to database
        this.stepCode = logStep();
        // at last send e-mail
        message.setMailTo(mailTo);
        message.setNameto(name);
        message.setStepCode(this.stepCode);
        sendRequest(message);
    }
    
}
