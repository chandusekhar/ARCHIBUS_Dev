package com.archibus.app.common.notification.domain;

/**
 * Domain object for Notification Template.
 * <p>
 * Mapped to notify_templates table.
 *
 * @author Zhang Yi
 *
 */
public class NotificationTemplate {

    /**
     * Notification Template id.
     */
    private String id;

    /**
     * Notification Trigger Condition To.
     */
    private String triggerConditionTo;

    /**
     * Notification Trigger Condition From.
     */
    private String triggerConditionFrom;

    /**
     * Notification Trigger Date Field.
     */
    private String triggerDateField;

    /**
     * Notification Trigger Time Field.
     */
    private String triggerTimeField;

    /**
     * Message Id Field.
     */
    private String messageId;

    /**
     * Message Referenced By Field.
     */
    private String messageReferencedBy;

    /**
     * Activity Id Field.
     */
    private String activityId;

    /**
     * Subject Field.
     */
    private String subject;

    /**
     * Subject Id Field.
     */
    private String subjectId;

    /**
     * Subject Referenced By Field.
     */
    private String subjectReferencedBy;

    /**
     * Subject notify_recipients Field.
     */
    private String recipients;

    /**
     * Subject notify_recipients_grp Field.
     */
    private String recipientsGroup;

    /**
     * Notification Type.
     */
    private String type;

    /**
     * Metric collect group by
     */
    private String metricCollectGroupBy;
    
    /**
     * @return the recipients
     */
    public String getRecipients() {
        return this.recipients;
    }

    /**
     * @param recipients the notify_recipients to set
     */
    public void setRecipients(final String recipients) {
        this.recipients = recipients;
    }

    /**
     * @return the recipientsGroup
     */
    public String getRecipientsGroup() {
        return this.recipientsGroup;
    }

    /**
     * @param recipientsGroup the notify_recipients_grp to set
     */
    public void setRecipientsGroup(final String recipientsGroup) {
        this.recipientsGroup = recipientsGroup;
    }

    /**
     * @return the messageReferencedBy
     */
    public String getMessageReferencedBy() {
        return this.messageReferencedBy;
    }

    /**
     * @param messageRefby the notify_message_refby to set
     */
    public void setMessageReferencedBy(final String messageRefby) {
        this.messageReferencedBy = messageRefby;
    }

    /**
     * @return the subject
     */
    public String getSubject() {
        return this.subject;
    }

    /**
     * @param subject the notify_subject to set
     */
    public void setSubject(final String subject) {
        this.subject = subject;
    }

    /**
     * @return the activityId
     */
    public String getActivityId() {
        return this.activityId;
    }

    /**
     * @param activityId the activity_id to set
     */
    public void setActivityId(final String activityId) {
        this.activityId = activityId;
    }

    /**
     * @return the subjectReferencedBy
     */
    public String getSubjectReferencedBy() {
        return this.subjectReferencedBy;
    }

    /**
     * @param subjectRefby the notify_subject_refby to set
     */
    public void setSubjectReferencedBy(final String subjectRefby) {
        this.subjectReferencedBy = subjectRefby;
    }

    /**
     * @return the messageId
     */
    public String getMessageId() {
        return this.messageId;
    }

    /**
     * @param messageId the notify_message_id to set
     */
    public void setMessageId(final String messageId) {
        this.messageId = messageId;
    }

    /**
     * @return the subjectId
     */
    public String getSubjectId() {
        return this.subjectId;
    }

    /**
     * @param subjectId the notify_subject_id to set
     */
    public void setSubjectId(final String subjectId) {
        this.subjectId = subjectId;
    }

    /**
     * @return the triggerDateField
     */
    public String getTriggerDateField() {
        return this.triggerDateField;
    }

    /**
     * @param triggerDateField the trigger_date_field to set
     */
    public void setTriggerDateField(final String triggerDateField) {
        this.triggerDateField = triggerDateField;
    }

    /**
     * @return the triggerTimeField
     */
    public String getTriggerTimeField() {
        return this.triggerTimeField;
    }

    /**
     * @param triggerTimeField the trigger_time_field to set
     */
    public void setTriggerTimeField(final String triggerTimeField) {
        this.triggerTimeField = triggerTimeField;
    }

    /**
     * @return the triggerConditionFrom
     */
    public String getTriggerConditionFrom() {
        return this.triggerConditionFrom;
    }

    /**
     * @param triggerConditionFrom the trigger_condition_from to set
     */
    public void setTriggerConditionFrom(final String triggerConditionFrom) {
        this.triggerConditionFrom = triggerConditionFrom;
    }

    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }

    /**
     * @return the triggerConditionTo
     */
    public String getTriggerConditionTo() {
        return this.triggerConditionTo;
    }

    /**
     * @param triggerConditionTo the trigger_condition_to to set
     */
    public void setTriggerConditionTo(final String triggerConditionTo) {
        this.triggerConditionTo = triggerConditionTo;
    }

    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
    }
    
    /**
     * @return the notifyType
     */
    public String getType() {
        return this.type;
    }
    
    /**
     * @param notifyType the Notification Type to set
     */
    public void setType(final String notifyType) {
        this.type = notifyType;
    }
    
    /**
     * Getter for the metricCollectGroupBy property.
     *
     * @see metricCollectGroupBy
     * @return the metricCollectGroupBy property.
     */
    public String getMetricCollectGroupBy() {
        return this.metricCollectGroupBy;
    }
    
    /**
     * Setter for the metricCollectGroupBy property.
     *
     * @see metricCollectGroupBy
     * @param metricCollectGroupBy the metricCollectGroupBy to set
     */

    public void setMetricCollectGroupBy(final String metricCollectGroupBy) {
        this.metricCollectGroupBy = metricCollectGroupBy;
    }

}
