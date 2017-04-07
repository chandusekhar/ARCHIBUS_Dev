package com.archibus.app.common.notification.dao;

import java.util.List;

import com.archibus.app.common.notification.domain.NotificationMessage;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.data.DataRecord;

/**
 * Dao for NotificationMessage.
 * 
 * @author Valery Tydykov
 * @author Zhang Yi
 * 
 */
public interface INotificationMessageDao extends IDao<NotificationMessage> {
    
    /**
     * Gets Message by primary key value.
     * 
     * @param activityId value of primary key field activity_id.
     * @param referenceBy value of primary key field referenced_by.
     * @param messageId value of primary key field message_id.
     * 
     * @return Message matching the supplied primary key value, or null, if not found.
     */
    NotificationMessage getByPrimaryKey(String activityId, String referenceBy, String messageId);
    
    /**
     * Gets Notification Message Objects list converted from Data Record.
     * 
     * @param records notification Message records.
     * 
     * @return Notification Message Objects list.
     */
    List<NotificationMessage> getConvertedNotificationMessages(List<DataRecord> records);
    
    /**
     * Converts the data record to a bean instance.
     * 
     * @param record The data record.
     * @return The bean instance.
     */
    NotificationMessage convertRecordToObject(DataRecord record);
}
