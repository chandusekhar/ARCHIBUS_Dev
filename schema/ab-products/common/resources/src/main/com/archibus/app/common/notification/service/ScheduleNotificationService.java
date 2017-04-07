package com.archibus.app.common.notification.service;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.common.notification.dao.INotificationTemplateDao;
import com.archibus.app.common.notification.dao.datasource.NotificationTemplateDataSource;
import com.archibus.app.common.notification.domain.*;
import com.archibus.app.common.notification.message.*;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 *
 * Compliance Service Class for Scheduled Notification workflow rule.
 *
 * @author ASC-BJ:Zhang Yi
 */
public class ScheduleNotificationService {

    /**
     * Error message for mail server.
     */
    // @translatable
    private static final String ERROR_MSG_MAIL_SERVER =
            "Mail server configuration error, aborting all remaining email notifications.";
    
    /**
     * Activity id for Metrics: "AbSystemAdministration".
     */
    private static final String METRIC_ACTIVITY_ID = "AbSystemAdministration";
    
    /**
     * Logger to write messages to archibus.log.
     */
    private final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Generic Notification Finder.
     */
    private INotificationFinder finder;

    /**
     * Compliance Notification FInder.
     */
    private final NotificationFinder notificationFinder = new NotificationFinder();

    /**
     * Metric Notification FInder.
     */
    private final MetricNotificationFinder metricNotificationFinder =
            new MetricNotificationFinder();

    /**
     * Compliance Notification Formatter.
     */
    private final NotificationFormatter formatter = new NotificationFormatter();

    /**
     * Metric Notification Formatter.
     */
    private final MetricNotificationFormatter metricFormatter = new MetricNotificationFormatter();
    
    /**
     * Compliance Notification Sender.
     */
    private final NotificationSender sender = new NotificationSender();
    
    /**
     * Schedule Workflow rule method to send notifications for Compliance Event dialy.
     */
    public void sendEmailNotifications() {

        final INotificationTemplateDao notificationTemplateDao =
                new NotificationTemplateDataSource();

        final List<NotificationTemplate> templates =
                notificationTemplateDao.getAllNotificationTemplates();

        final NotificationMessageFormatter messageFormatter = new NotificationMessageFormatter();

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (StringUtil.isNullOrEmpty(EventHandlerBase.getEmailHost(context))) {
            // @translatable
            this.logger.error(ERROR_MSG_MAIL_SERVER
                    + "Please configure mail.host.name in mail.properties file.");

        } else if (StringUtil.isNullOrEmpty(EventHandlerBase.getEmailPort(context))) {
            this.logger.error(ERROR_MSG_MAIL_SERVER
                    + "Please configure mail.host.port in mail.properties file.");
        } else {

            // for each notification template retrieved from Notification Template DAO
            for (final NotificationTemplate notificationTemplate : templates) {

                // by NotificationFinder instance finder, call setTemplate() to set notification
                // template, then get a notifications list by call find()
                if (METRIC_ACTIVITY_ID.equalsIgnoreCase(notificationTemplate.getActivityId())) {
                    this.finder = this.metricNotificationFinder;
                } else {
                    this.finder = this.notificationFinder;
                }

                final List<Notification> notifications = this.finder.find(notificationTemplate);

                if (notifications == null || notifications.isEmpty()) {
                    continue;
                }

                // Format notifications messages based on different activity type
                if ("AbRiskCompliance".equalsIgnoreCase(notificationTemplate.getActivityId())) {

                    // for compliance notification set its own data model to Message Formatter
                    this.formatter.setMessageFormatter(messageFormatter);

                    // format notifications by template
                    this.formatter.format(notifications, notificationTemplate);
                    
                } else if (METRIC_ACTIVITY_ID
                        .equalsIgnoreCase(notificationTemplate.getActivityId())) {
                    // Metric notifications
                    final MetricMessageFormatter metricMessageFormatter =
                            new MetricMessageFormatter();
                    
                    this.metricFormatter.setMessageFormatter(metricMessageFormatter);
                    // format notifications by template
                    this.metricFormatter.format(notifications, notificationTemplate);
                }

                // by NotificationSender instance sender, call send() to send email for
                // each notifications.
                try {
                    this.sender.send(notifications, notificationTemplate);
                } catch (final ExceptionBase originalException) {
                    Logger.getLogger(ScheduleNotificationService.class).warn(
                        "Mail server error, aborting all remaining email notifications");
                    return;
                }
            }

        }
    }
}
