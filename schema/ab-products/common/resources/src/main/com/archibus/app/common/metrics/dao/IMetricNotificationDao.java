package com.archibus.app.common.metrics.dao;

import java.util.List;

import com.archibus.app.common.metrics.domain.*;
import com.archibus.app.common.notification.domain.NotificationTemplate;
import com.archibus.core.dao.IDao;

/**
 *
 * Dao for Metric notify.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public interface IMetricNotificationDao extends IDao<MetricNotification> {

    /**
     * Returns all notification templates that are assigned to specified metric.
     *
     * @param metricName metric name
     * @return List<NotificationTemplate>
     */
    List<NotificationTemplate> getNotificationTemplatesForMetric(final String metricName);
    
    /**
     * Get all metrics that are assigned to specified notification template id.
     *
     * @param notificationTemplateId notification template id
     * @return List<Metric>
     */
    List<Metric> getMetricsForNotificationTemplate(final String notificationTemplateId);
    
}
