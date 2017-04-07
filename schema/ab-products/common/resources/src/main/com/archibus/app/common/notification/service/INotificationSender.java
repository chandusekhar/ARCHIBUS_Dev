package com.archibus.app.common.notification.service;

import java.util.List;

import com.archibus.app.common.notification.domain.*;

/**
 * 
 * Interface for send notifications.
 * 
 * @author Zhang Yi
 * 
 */
public interface INotificationSender {
    
    /**
     * Send notifications.
     * 
     * @param notifications a list of notifications need to send.
     * @param template notification template.
     */
    void send(final List<Notification> notifications, final NotificationTemplate template);
}
