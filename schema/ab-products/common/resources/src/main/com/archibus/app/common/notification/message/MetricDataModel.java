package com.archibus.app.common.notification.message;

import java.util.*;

import com.archibus.app.common.notification.domain.Notification;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * Metric data model. Generate data model for metric notifications.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class MetricDataModel {

    /**
     * Constant: table name.
     */
    private static final String AFM_METRIC_TREND_VALUES = "afm_metric_trend_values";

    /**
     * Constant: table name.
     */
    private static final String AFM_METRIC_GRAN_DEFS = "afm_metric_gran_defs";
    
    /**
     * Constant: table name.
     */
    private static final String AFM_METRIC_DEFINITIONS = "afm_metric_definitions";
    
    /**
     * Constant: field name.
     */
    private static final String METRIC_NAME = "metric_name";

    /**
     * Constant: field name.
     */
    private static final String COLLECT_GROUP_BY = "collect_group_by";

    /**
     * Constant: field name.
     */
    private static final String AUTO_NUMBER = "auto_number";
    
    /**
     * Constant: DOT.
     */
    private static final String DOT = ".";

    /**
     * Fields/Values Map for DataModel for notification.
     */
    protected Map<String, Object> dataModel;

    /**
     * Prepare data model used for notification.
     *
     * @param notification the notification to create data model from
     */
    public void generateDataModel(final Notification notification) {
        this.dataModel = new HashMap<String, Object>();
        // load trend value
        final Integer trendValueId = notification.getMetricValueId();
        loadRecordIntoDataModel(AFM_METRIC_TREND_VALUES, AUTO_NUMBER, trendValueId);
        // load granularity
        final HashMap<String, Object> afmMetricTrendValues =
                (HashMap<String, Object>) this.dataModel.get(AFM_METRIC_TREND_VALUES);
        if (afmMetricTrendValues != null) {
            final Object collectGroupBy = afmMetricTrendValues.get(COLLECT_GROUP_BY);
            loadRecordIntoDataModel(AFM_METRIC_GRAN_DEFS, COLLECT_GROUP_BY, collectGroupBy);
            final Object metricName = afmMetricTrendValues.get(METRIC_NAME);
            loadRecordIntoDataModel(AFM_METRIC_DEFINITIONS, METRIC_NAME, metricName);
        }
    }

    /**
     * Getter for the dataModel property.
     *
     * @see dataModel
     * @return the dataModel property.
     */
    public Map<String, Object> getDataModel() {
        return this.dataModel;
    }

    /**
     * Load record into data model for specified table and primary key.
     *
     * @param tableName table name
     * @param pkName primary key field name
     * @param pkValue primary key field value
     */
    private void loadRecordIntoDataModel(final String tableName, final String pkName,
            final Object pkValue) {
        final DataSource dataSource = getDataSourceForTable(tableName);
        dataSource.addRestriction(Restrictions.eq(tableName, pkName, pkValue));
        final DataRecord record = dataSource.getRecord();

        if (record != null) {
            final Map<String, DataValue> fields = record.getFieldsByName();
            final Map<String, Object> values = new HashMap<String, Object>();
            
            for (final String fieldName : fields.keySet()) {
                final String shorFieldName = fieldName.split("\\.")[1];
                if ((fieldName.indexOf("date") >= 0 || fieldName.indexOf("time") >= 0)
                        && fields.get(fieldName).getValue() != null) {
                    values.put(shorFieldName,
                        SqlUtils.normalizeValueForSql(fields.get(fieldName).getValue()).toString());
                } else {
                    values.put(shorFieldName, fields.get(fieldName).getValue());
                }
            }
            
            this.dataModel.put(tableName, values);
        }
    }

    /**
     * Load data source for specified table (create data source for all fields).
     *
     * @param tableName table name
     * @return DataSource
     */
    private DataSource getDataSourceForTable(final String tableName) {
        return DataSourceFactory.createDataSourceForFields(tableName, EventHandlerBase
            .getAllFieldNames(ContextStore.get().getEventHandlerContext(), tableName));
    }
    
}
