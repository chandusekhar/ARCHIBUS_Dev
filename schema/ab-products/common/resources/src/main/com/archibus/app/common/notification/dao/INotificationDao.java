package com.archibus.app.common.notification.dao;

import java.util.List;

import com.archibus.app.common.notification.domain.*;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;

/**
 * Dao for Notification.
 * 
 * @author Zhang Yi
 * 
 */
public interface INotificationDao extends IDao<Notification> {
    
    /**
     * Converts the data record to a bean instance.
     * 
     * @param record The data record.
     * @return The bean instance.
     */
    Notification convertRecordToObject(DataRecord record);
    
    /**
     * Gets Notification using primary key values supplied in the Notification.
     * 
     * @param notification with primary key values.
     * @return Notification matching the supplied primary key values, or null, if not found.
     */
    Notification getByPrimaryKey(Notification notification);
    
    /**
     * Gets Notifications list using string format of SQL restriction.
     * 
     * @param restriction notification template.
     * @return Notifications matching the supplied restriction, or null, if not found.
     */
    List<Notification> getByRestriction(String restriction);
    
    /**
     * Gets Notifications list using template id supplied in the NotificationTemplate.
     * 
     * @param template notification template.
     * @return Notification matching the supplied primary key values, or null, if not found.
     */
    List<Notification> getByTemplate(NotificationTemplate template);
    
    /**
     * Gets Notifications Objects list converted from Data Record.
     * 
     * @param records notification records.
     * 
     * @return Notification Objects list.
     */
    List<Notification> getConvertedNotifications(List<DataRecord> records);
}
