package com.archibus.app.common.notification.domain;

import java.util.*;

import com.archibus.utility.MailMessage;

/**
 * Domain object for Notification.
 * <p>
 * Mapped to notifications table.
 *
 * @author Zhang Yi
 *
 */
public class Notification {

    /**
     * Notification Email Body.
     */
    private NotificationMessage body;

    /**
     * Notification Count.
     */
    private int count;

    /**
     * Notification Date Send.
     */
    private Date dateSent;

    /**
     * Notification Event(activity_log_id) ID.
     */
    private Integer eventId;

    /**
     * Notification ID.
     */
    private int id;

    /**
     * MailMessage List.
     */
    private List<MailMessage> mailMessages;

    /**
     * Notification Email Subject.
     */
    private NotificationMessage subject;

    /**
     * Notification Subject Line.
     */
    private String subjectLine;

    /**
     * Metric trend value id.
     */
    private Integer metricValueId;

    /**
     * @return the email body
     */
    public NotificationMessage getBody() {
        return this.body;
    }

    /**
     * @return the count
     */
    public int getCount() {
        return this.count;
    }

    /**
     * @return the dateSent
     */
    public Date getDateSent() {
        return this.dateSent;
    }

    /**
     * Getter for the eventId property.
     *
     * @see eventId
     * @return the eventId property.
     */
    public Integer getEventId() {
        return this.eventId;
    }

    /**
     * @return the id
     */
    public int getId() {
        return this.id;
    }

    /**
     * Getter for the mailMessages property.
     *
     * @see mailMessages
     * @return the mailMessages property.
     */
    public List<MailMessage> getMailMessages() {
        return this.mailMessages;
    }

    /**
     * @return the email subject
     */
    public NotificationMessage getSubject() {
        return this.subject;
    }

    /**
     * Getter for the subjectLine property.
     *
     * @see subjectLine
     * @return the subjectLine property.
     */
    public String getSubjectLine() {
        return this.subjectLine;
    }

    /**
     * @param body the email body to set
     */
    public void setBody(final NotificationMessage body) {
        this.body = body;
    }

    /**
     * @param count the Notification Count to set
     */
    public void setCount(final int count) {
        this.count = count;
    }

    /**
     * @param dateSent the Notification Date Sent to set
     */
    public void setDateSent(final Date dateSent) {
        this.dateSent = dateSent;
    }

    /**
     * Setter for the eventId property.
     *
     * @see eventId
     * @param eventId the eventId to set
     */

    public void setEventId(final Integer eventId) {
        this.eventId = eventId;
    }

    /**
     * @param id the id to set
     */
    public void setId(final int id) {
        this.id = id;
    }

    /**
     * Setter for the mailMessages property.
     *
     * @see mailMessages
     * @param mailMessages the mailMessages to set
     */

    public void setMailMessages(final List<MailMessage> mailMessages) {
        this.mailMessages = mailMessages;
    }

    /**
     * @param subject the email subject to set
     */
    public void setSubject(final NotificationMessage subject) {
        this.subject = subject;
    }

    /**
     * Setter for the subjectLine property.
     *
     * @see subjectLine
     * @param subjectLine the subjectLine to set
     */

    public void setSubjectLine(final String subjectLine) {
        this.subjectLine = subjectLine;
    }
    
    /**
     * Getter for the metricValueId property.
     *
     * @see metricValueId
     * @return the metricValueId property.
     */
    public Integer getMetricValueId() {
        return this.metricValueId;
    }
    
    /**
     * Setter for the metricValueId property.
     *
     * @see metricValueId
     * @param metricValueId the metricValueId to set
     */

    public void setMetricValueId(final Integer metricValueId) {
        this.metricValueId = metricValueId;
    }

}
