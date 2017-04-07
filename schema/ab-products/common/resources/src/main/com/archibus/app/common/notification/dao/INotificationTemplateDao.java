package com.archibus.app.common.notification.dao;

import java.util.List;

import com.archibus.app.common.notification.domain.NotificationTemplate;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;

/**
 * Dao for Notification Template.
 * 
 * @author Zhang Yi
 * 
 */
public interface INotificationTemplateDao extends IDao<NotificationTemplate> {
    
    /**
     * Converts the data record to a bean instance.
     * 
     * @param record The data record.
     * @return The bean instance.
     */
    NotificationTemplate convertRecordToObject(DataRecord record);
    
    /**
     * Gets a list of All Notification Template Objects.
     * 
     * @return Notification Template Objects list.
     */
    List<NotificationTemplate> getAllNotificationTemplates();
    
    /**
     * Gets Notification Template by primary key value.
     * 
     * @param templateId primary key value of room category.
     * @return Notification Template matching the supplied primary key value, or null, if not found.
     */
    NotificationTemplate getByPrimaryKey(String templateId);
    
    /**
     * Gets Notification Template Objects list converted from Data Record.
     * 
     * @param records notification template records.
     * 
     * @return Notification Template Objects list.
     */
    List<NotificationTemplate> getConvertedNotificationTemplates(List<DataRecord> records);
}
