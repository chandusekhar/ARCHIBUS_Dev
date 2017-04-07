package com.archibus.app.common.notification.service;

import java.util.List;

import com.archibus.app.common.notification.domain.*;

/**
 * 
 * Interface for find notifications.
 * 
 * @author Zhang Yi
 * 
 */
public interface INotificationFinder {
    
    /**
     * find notifications.
     * 
     * @param template notification template.
     * 
     * @return a list of found notifications.
     */
    List<Notification> find(final NotificationTemplate template);
    
}
