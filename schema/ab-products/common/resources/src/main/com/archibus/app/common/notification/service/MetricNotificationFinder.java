package com.archibus.app.common.notification.service;

import java.util.List;

import com.archibus.app.common.notification.dao.INotificationDao;
import com.archibus.app.common.notification.dao.datasource.*;
import com.archibus.app.common.notification.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 *
 * Metric Notification Finder Implementation Class.
 *
 * @author Ana Paduraru
 *
 */
public class MetricNotificationFinder implements INotificationFinder {
    
    /**
     * {@inheritDoc}
     */
    @Override
    public List<Notification> find(final NotificationTemplate template) {
        
        final String restriction = getRestriction(template);
        final INotificationDao notificationDao = new NotificationDataSource();
        
        return notificationDao.getByRestriction(restriction);
    }
    
    /**
     * construct event trigger test sql by template.
     *
     * @param template notification template.
     *
     * @return String if match trigger return true else return false
     */
    private String getRestriction(final NotificationTemplate template) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String templateId = template.getId();
        
        EventHandlerBase
            .formatSqlDaysBetween(context, "notifications.date_sent", Constants.CURRENT);
        
        final StringBuilder restriction = new StringBuilder();
        restriction
            .append("notifications.template_id='")
            .append(templateId)
            .append(
                "' AND notifications.is_active=1 AND notifications.metric_value_id IS NOT NULL AND notifications.date_sent IS NULL");
        
        return restriction.toString();
        
    }
    
}
