package com.archibus.app.common.notification.dao.datasource;

import java.util.List;

import com.archibus.app.common.notification.dao.INotificationMessageDao;
import com.archibus.app.common.notification.domain.NotificationMessage;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;

/**
 * Implementation of DataSource for NotificationMessage.
 * 
 * @see ObjectDataSourceImpl.
 * 
 * @author Zhang Yi
 * 
 */
public class NotificationMessageDataSource extends ObjectDataSourceImpl<NotificationMessage>
        implements INotificationMessageDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { Constants.ACTIVITY_ID, "activityId" }, { "referenced_by", "referencedBy" },
            { Constants.MESSAGE_ID, "id" }, { "message_text", "messageText" },
            { "is_rich_msg_format", "isRichText" } };
    
    /**
     * Constructs NotificationMessageDataSource, mapped to <code>messages</code> table, using
     * <code>MESSAGE</code> bean.
     */
    public NotificationMessageDataSource() {
        super("notificationMessageBean", "messages");
    }
    
    /** {@inheritDoc} */
    public NotificationMessage getByPrimaryKey(final String activityId, final String referenceBy,
            final String messageId) {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.MESSAGE_ID);
            pkField.setValue(messageId);
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.ACTIVITY_ID);
            pkField.setValue(activityId);
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.REFERENCED_BY);
            pkField.setValue(referenceBy);
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        return this.get(primaryKeysValues);
    }
    
    /** {@inheritDoc} */
    public List<NotificationMessage> getConvertedNotificationMessages(final List<DataRecord> records) {
        
        return new DataSourceObjectConverter<NotificationMessage>().convertRecordsToObjects(
            records, this.beanName, this.fieldToPropertyMapping, null);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
}
