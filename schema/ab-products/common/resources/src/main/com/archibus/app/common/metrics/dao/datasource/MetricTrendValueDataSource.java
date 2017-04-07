package com.archibus.app.common.metrics.dao.datasource;

import java.util.*;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.dao.IMetricTrendValueDao;
import com.archibus.app.common.metrics.domain.MetricTrendValue;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.utility.StringUtil;

/**
 *
 * DataSource for Trend Values.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public class MetricTrendValueDataSource extends ObjectDataSourceImpl<MetricTrendValue> implements
IMetricTrendValueDao {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES =
        { { DbConstants.AUTO_NUMBER, "id" }, { DbConstants.METRIC_NAME, "metricName" },
        { "collect_err_msg", "errorMessage" },
        { DbConstants.COLLECT_GROUP_BY, "groupByFields" },
        { DbConstants.COLLECT_BY_VALUE, "groupByValue" },
        { "metric_date", "collectDate" }, { DbConstants.METRIC_VALUE, "value" },
        { "metric_value_last", "lastValue" },
        { "metric_value_last_yr", "lastYearValue" },
        { "metric_value_prev", "previousValues" } };

    /**
     * Constructs TrendValueDataSource, mapped to <code>afm_metric_trend_values</code> table, using
     * <code>trendValue</code> bean.
     */
    public MetricTrendValueDataSource() {
        super("trendValue", "afm_metric_trend_values");
    }

    /**
     * {@inheritDoc}
     */
    public List<MetricTrendValue> getValues(final String metricId, final String groupBy,
        final String groupByValue) {
        return getValues(metricId, groupBy, groupByValue, 0);
    }

    /**
     * {@inheritDoc}
     */
    public List<MetricTrendValue> getValues(final String metricId, final String groupBy,
        final String groupByValue, final int maxRecords) {
        final DataSource dataSource = this.createCopy();
        dataSource.setMaxRecords(maxRecords);
        dataSource
        .addRestriction(Restrictions.and(Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES,
            DbConstants.METRIC_NAME, metricId), Restrictions.eq(
                DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_GROUP_BY, groupBy),
                Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_BY_VALUE,
                    groupByValue)));
        // sort descending using primary key - auto_number
        dataSource.addSort(this.mainTableName, DbConstants.AUTO_NUMBER, DataSource.SORT_DESC);
        final List<DataRecord> records = dataSource.getRecords();
        return new DataSourceObjectConverter<MetricTrendValue>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}.
     * <p>
     *
     * SuppressWarning Justification
     * <li><code>PMD.AvoidUsingSql</code> Case 1.1 Select with condition on WHERE
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public List<MetricTrendValue> getLastValues(final String metricId, final String groupBy,
        final String sortOrder) {
        final DataSource dataSource = this.createCopy();
        dataSource
        .addRestriction(Restrictions.and(Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES,
            DbConstants.METRIC_NAME, metricId), Restrictions.eq(
                DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_GROUP_BY, groupBy)));
        // add restriction for collect date
        dataSource
        .addRestriction(Restrictions
            .sql("afm_metric_trend_values.metric_date = (SELECT MAX(internal.metric_date) "
                    + "FROM afm_metric_trend_values internal WHERE internal.metric_name = afm_metric_trend_values.metric_name AND internal.collect_group_by = afm_metric_trend_values.collect_group_by)"));
        // add sort field
        dataSource
        .addSort(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.METRIC_VALUE, sortOrder);

        final List<DataRecord> records = dataSource.getRecords();
        return new DataSourceObjectConverter<MetricTrendValue>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}
     */
    public MetricTrendValue getLastValue(final String metricId, final String groupBy) {
        final DataSource dataSource = this.createCopy();

        final Clause clauseMetricName =
                Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.METRIC_NAME,
                    metricId);
        final Clause clauseCollectGroupBy =
                Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_GROUP_BY,
                    groupBy);
        dataSource.addRestriction(Restrictions.and(clauseMetricName, clauseCollectGroupBy));

        // sort descending using primary key - auto_number
        dataSource.addSort(this.mainTableName, DbConstants.AUTO_NUMBER, DataSource.SORT_DESC);
        final DataRecord record = dataSource.getRecord();
        return new DataSourceObjectConverter<MetricTrendValue>().convertRecordToObject(record,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}
     */
    public MetricTrendValue getValue(final String metricId, final String groupBy,
            final String groupByValue, final Date collectDate) {
        final DataSource dataSource = this.createCopy();
        dataSource
        .addRestriction(Restrictions.and(Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES,
            DbConstants.METRIC_NAME, metricId), Restrictions.eq(
                DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_GROUP_BY, groupBy)));
        if (Constants.PORTFOLIO.equals(groupBy) && StringUtil.isNullOrEmpty(groupByValue)) {
            dataSource.addRestriction(Restrictions.isNull(DbConstants.AFM_METRIC_TREND_VALUES,
                DbConstants.COLLECT_BY_VALUE));
        } else {
            dataSource.addRestriction(Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES,
                DbConstants.COLLECT_BY_VALUE, groupByValue));
        }
        // add date restriction
        dataSource.addRestriction(Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES,
            DbConstants.METRIC_DATE, collectDate));
        final DataRecord record = dataSource.getRecord();
        return new DataSourceObjectConverter<MetricTrendValue>().convertRecordToObject(record,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}.
     * <p>
     *
     * SuppressWarning Justification
     * <li><code>PMD.AvoidUsingSql</code> Case 2.3 Bulk delete statement
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteMetricValuesForGranularityAndDate(final String metricId,
            final String groupBy, final Date collectDate, final boolean isSampleData) {
        String deleteStatement =
                "DELETE FROM afm_metric_trend_values WHERE afm_metric_trend_values.metric_name = "
                        + SqlUtils.formatValueForSql(metricId);
        if (StringUtil.notNullOrEmpty(groupBy)) {
            deleteStatement +=
                    " AND afm_metric_trend_values.collect_group_by = "
                            + SqlUtils.formatValueForSql(groupBy);
        }
        if (StringUtil.notNullOrEmpty(collectDate)) {
            deleteStatement +=
                    " AND afm_metric_trend_values.metric_date = "
                            + SqlUtils.formatValueForSql(collectDate);
        }
        if (isSampleData) {
            deleteStatement +=
                    " AND afm_metric_trend_values.collect_err_msg = "
                            + SqlUtils.formatValueForSql(Constants.EXAMPLE);
        }

        SqlUtils.executeUpdate(DbConstants.AFM_METRIC_TREND_VALUES, deleteStatement);
    }

    /**
     * {@inheritDoc}
     */
    public List<MetricTrendValue> getValuesForGranularityAndDate(final String metricId,
        final String groupBy, final Date collectDate) {
        final DataSource dataSource = this.createCopy();
        dataSource
        .addRestriction(Restrictions.and(Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES,
            DbConstants.METRIC_NAME, metricId), Restrictions.eq(
                DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_GROUP_BY, groupBy),
                Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.METRIC_DATE,
                    collectDate)));
        final List<DataRecord> records = dataSource.getRecords();
        return new DataSourceObjectConverter<MetricTrendValue>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}
     */
    public Date getLastCollectDateForMetricAndGranularity(final String metricId,
            final String groupBy, final Date collectDate, final boolean isSampleData) {
        final DataSource dataSource = this.createCopy();
        dataSource.addSort(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.METRIC_DATE,
            DataSource.SORT_DESC);
        dataSource
        .addRestriction(Restrictions.and(Restrictions.eq(DbConstants.AFM_METRIC_TREND_VALUES,
            DbConstants.METRIC_NAME, metricId), Restrictions.eq(
                DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.COLLECT_GROUP_BY, groupBy),
                Restrictions.lte(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.METRIC_DATE,
                    collectDate)));

        final DataRecord record = dataSource.getRecord();
        Date lastCollectDate = collectDate;
        if (record != null) {
            lastCollectDate =
                    record.getDate(DbConstants.AFM_METRIC_TREND_VALUES + "."
                            + DbConstants.METRIC_DATE);
        }
        return lastCollectDate;
    }
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
