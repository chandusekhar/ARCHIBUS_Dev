package com.archibus.app.common.notification.dao.datasource;

import java.util.List;

import com.archibus.app.common.notification.dao.INotificationTemplateDao;
import com.archibus.app.common.notification.domain.NotificationTemplate;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;

/**
 *
 * @see ObjectDataSourceImpl.
 *
 * @author Zhang Yi
 *
 */
public class NotificationTemplateDataSource extends ObjectDataSourceImpl<NotificationTemplate>
implements INotificationTemplateDao {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { Constants.TEMPLATE_ID, "id" },
        { Constants.TRIGGER_CONDITION_TO, "triggerConditionTo" },
        { Constants.TRIGGER_CONDITION_FROM, "triggerConditionFrom" },
        { Constants.TRIGGER_DATE_FIELD, "triggerDateField" },
        { "notify_recipients", "recipients" }, { "notify_message_id", "messageId" },
        { "notify_recipients_grp", "recipientsGroup" },
        { "notify_message_refby", "messageReferencedBy" },
        { Constants.ACTIVITY_ID, "activityId" }, { "notify_subject", "subject" },
        { "notify_subject_id", "subjectId" },
        { "notify_subject_refby", "subjectReferencedBy" }, { "notify_type", "type" },
            { "metric_collect_group_by", "metricCollectGroupBy" } };

    /**
     * Constructs NotificationTemplateDataSource, mapped to <code>notify_templates</code> table,
     * using <code>NotificationTemplate</code> bean.
     */
    public NotificationTemplateDataSource() {
        super("notificationTemplateBean", "notify_templates");
    }

    /** {@inheritDoc} */
    @Override
    public List<NotificationTemplate> getAllNotificationTemplates() {
        return new DataSourceObjectConverter<NotificationTemplate>().convertRecordsToObjects(
            this.getAllRecords(), this.beanName, this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */
    @Override
    public NotificationTemplate getByPrimaryKey(final String templateId) {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.TEMPLATE_ID);
            pkField.setValue(templateId);

            primaryKeysValues.getFieldsValues().add(pkField);

        }

        return this.get(primaryKeysValues);
    }

    /** {@inheritDoc} */
    @Override
    public List<NotificationTemplate> getConvertedNotificationTemplates(
        final List<DataRecord> records) {

        return new DataSourceObjectConverter<NotificationTemplate>().convertRecordsToObjects(
            records, this.beanName, this.fieldToPropertyMapping, null);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

}
