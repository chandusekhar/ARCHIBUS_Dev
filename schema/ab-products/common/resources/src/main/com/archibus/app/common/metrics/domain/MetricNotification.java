package com.archibus.app.common.metrics.domain;

/**
 * Domain object for metric notify.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class MetricNotification {
    /**
     * Metric name.
     */
    private String metricName;
    
    /**
     * Notification template id.
     */
    private String notificationTemplateId;

    /**
     * Getter for the metricName property.
     *
     * @see metricName
     * @return the metricName property.
     */
    public String getMetricName() {
        return this.metricName;
    }

    /**
     * Setter for the metricName property.
     *
     * @see metricName
     * @param metricName the metricName to set
     */
    
    public void setMetricName(final String metricName) {
        this.metricName = metricName;
    }

    /**
     * Getter for the notificationTemplateId property.
     *
     * @see notificationTemplateId
     * @return the notificationTemplateId property.
     */
    public String getNotificationTemplateId() {
        return this.notificationTemplateId;
    }

    /**
     * Setter for the notificationTemplateId property.
     *
     * @see notificationTemplateId
     * @param notificationTemplateId the notificationTemplateId to set
     */
    
    public void setNotificationTemplateId(final String notificationTemplateId) {
        this.notificationTemplateId = notificationTemplateId;
    }
    
}
