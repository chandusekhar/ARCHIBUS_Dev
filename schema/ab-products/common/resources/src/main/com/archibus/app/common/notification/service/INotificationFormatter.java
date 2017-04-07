package com.archibus.app.common.notification.service;

import java.util.List;

import com.archibus.app.common.notification.domain.*;

/**
 * 
 * Interface for format notifications by its associated notification template.
 * 
 * @author Zhang Yi
 * 
 */
public interface INotificationFormatter {
    
    /**
     * format compliance notifications.
     * 
     * @param notifications list for formating.
     * @param notificationTemplate notification template.
     * 
     */
    void format(final List<Notification> notifications,
            final NotificationTemplate notificationTemplate);
}
