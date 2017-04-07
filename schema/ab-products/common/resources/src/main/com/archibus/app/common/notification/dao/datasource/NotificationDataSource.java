package com.archibus.app.common.notification.dao.datasource;

import java.util.List;

import com.archibus.app.common.notification.dao.INotificationDao;
import com.archibus.app.common.notification.domain.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * DataSource for Notification.
 *
 * @see ObjectDataSourceImpl.
 *
 * @author Zhang Yi
 *
 */
public class NotificationDataSource extends ObjectDataSourceImpl<Notification> implements
INotificationDao {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { Constants.NOTIFY_ID, Constants.ID },
        { "notify_count", "count" }, { "date_sent", "dateSent" },
        { "activity_log_id", "eventId" }, { "metric_value_id", "metricValueId" } };

    /**
     * Constructs NotificationDataSource, mapped to <code>notifications</code> table, using
     * <code>notificationBean</code> bean.
     */
    public NotificationDataSource() {
        super(Constants.NOTIFICATION, Constants.NOTIFICATIONS);

        this.addTable(Constants.NOTIFY_TEMPLATES, DataSource.ROLE_STANDARD);
        this.addTable(Constants.ACTIVITY_LOG, DataSource.ROLE_STANDARD);
        this.addField(Constants.NOTIFY_TEMPLATES, "template_id");
        this.addField(Constants.ACTIVITY_LOG, Constants.ACTIVITY_LOG_ID);
    }

    /** {@inheritDoc} */
    @Override
    public Notification getByPrimaryKey(final Notification notification) {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(this.tableName + DOT + Constants.NOTIFY_ID);
            pkField.setValue(notification.getId());
            primaryKeysValues.getFieldsValues().add(pkField);
        }

        return this.get(primaryKeysValues);
    }

    /** {@inheritDoc} */
    @Override
    public List<Notification> getByRestriction(final String restriction) {

        return new DataSourceObjectConverter<Notification>().convertRecordsToObjects(
            this.getRecords(restriction), this.beanName, this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */
    @Override
    public List<Notification> getByTemplate(final NotificationTemplate template) {
        final DataSource dataSource = this.createCopy();

        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        // Use Notification Template key
        restrictionDef.addClause(this.tableName, Constants.TEMPLATE_ID, template.getId(),
            Operation.EQUALS);

        final List<DataRecord> records = dataSource.getRecords(restrictionDef);

        return new DataSourceObjectConverter<Notification>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */
    @Override
    public List<Notification> getConvertedNotifications(final List<DataRecord> records) {

        return new DataSourceObjectConverter<Notification>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
