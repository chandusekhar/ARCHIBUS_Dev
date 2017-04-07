package com.archibus.app.common.metrics.dao.datasource;

import java.util.*;

import com.archibus.app.common.metrics.DbConstants;
import com.archibus.app.common.metrics.dao.IMetricNotificationDao;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.app.common.notification.dao.datasource.NotificationTemplateDataSource;
import com.archibus.app.common.notification.domain.NotificationTemplate;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 *
 * DataSource for metric notify.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class MetricNotificationDataSource extends ObjectDataSourceImpl<MetricNotification>
        implements IMetricNotificationDao {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES =
            { { "metric_name", "metricName" }, { "template_id", "notificationTemplateId" } };

    /**
     * Constructs MetricNotifyDataSource, mapped to <code>afm_metric_notify</code> table, using
     * <code>metricNotify</code> bean.
     */
    public MetricNotificationDataSource() {
        super("metricNotification", DbConstants.AFM_METRIC_NOTIFY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<NotificationTemplate> getNotificationTemplatesForMetric(final String metricName) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(
            Restrictions.eq(DbConstants.AFM_METRIC_NOTIFY, DbConstants.METRIC_NAME, metricName));
        final List<DataRecord> records = dataSource.getRecords();
        final List<MetricNotification> metricNotifications =
                new DataSourceObjectConverter<MetricNotification>().convertRecordsToObjects(records,
                    this.beanName, this.fieldToPropertyMapping, null);
        final NotificationTemplateDataSource notificationTemplateDataSource =
                new NotificationTemplateDataSource();
        final List<NotificationTemplate> notificationTemplates =
                new ArrayList<NotificationTemplate>();
        for (final MetricNotification metricNotify : metricNotifications) {
            notificationTemplates.add(notificationTemplateDataSource
                .getByPrimaryKey(metricNotify.getNotificationTemplateId()));
        }
        return notificationTemplates;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Metric> getMetricsForNotificationTemplate(final String notificationTemplateId) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(Restrictions.eq(DbConstants.AFM_METRIC_NOTIFY,
            DbConstants.TEMPLATE_ID, notificationTemplateId));
        final List<DataRecord> records = dataSource.getRecords();
        final List<MetricNotification> metricNotifications =
                new DataSourceObjectConverter<MetricNotification>().convertRecordsToObjects(records,
                    this.beanName, this.fieldToPropertyMapping, null);
        final MetricDataSource<Metric> metricDataSource =
                new MetricDataSource<Metric>("metric", DbConstants.AFM_METRIC_DEFINITIONS);
        final List<Metric> metrics = new ArrayList<Metric>();
        for (final MetricNotification metricNotify : metricNotifications) {
            metrics.add(metricDataSource.getByName(metricNotify.getMetricName()));
        }
        return metrics;
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
