package com.archibus.app.common.metrics.dao.datasource;

import java.util.List;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.dao.IMetricDao;
import com.archibus.app.common.util.SchemaUtils;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.utility.StringUtil;

/**
 *
 * Data Source for metric.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 * @param <Metric> type of the persistent object
 */
public class MetricDataSource<Metric> extends ObjectDataSourceImpl<Metric>
        implements IMetricDao<Metric> {
    /**
     * Constant.
     */
    private static final String SOURCE_FIELDS_PATTERN = "{source_fields}";

    /**
     * Constant.
     */
    private static final String TARGET_FIELDS_PATTERN = "{target_fields}";

    /**
     * Constant.
     */
    private static final String RESTRICTION_PATTERN = "{restriction}";

    /**
     * Constant.
     */
    private static final String TABLE_NAME_PATTERN = "\\{table_name\\}";

    /**
     * Constant. Restriction used to filter old metrics.
     * <p>
     *
     * SuppressWarning Justification
     * <li><code>PMD.AvoidUsingSql</code> Case 1.1 Select with EXISTS condition on WHERE
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static final String OLD_METRICS_RESTRICTION =
            "EXISTS(SELECT afm_metric_grans.metric_name FROM afm_metric_grans "
                    + "WHERE afm_metric_grans.metric_name = afm_metric_definitions.metric_name)";

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "metric_name", "name" },
            { "metric_title", "title" }, { "collect_date_field", "startDateField" },
            { "collect_date_end_field", "endDateField" }, { "collect_table", "collectTable" },
            { "metric_date", "collectDate" }, { "collect_formula", "formula" },
            { "collect_where_clause", "whereClause" }, { DbConstants.METRIC_STATUS, "status" },
            { DbConstants.METRIC_STATUS_TEST, "testStatus" }, { "recurring_rule", "recurringRule" },
            { "ratio_metric_num", "numerator" }, { "ratio_metric_denom", "denominator" },
            { "report_aggregate_as", "aggregateAs" }, { "value_disp_numeric", "numericFormat" },
            { "value_disp_format", "displayFormat" },
            { "value_disp_format_m", "displayFormatMetric" }, { "value_disp_decimals", "decimals" },
            { "report_trend_dir", "reportTrendDir" },
            { "report_limit_high_crit", "reportLimitHighCritical" },
            { "report_limit_high_warn", "reportLimitHighWarning" },
            { "report_limit_target", "reportLimitTarget" },
            { "report_limit_low_crit", "reportLimitLowCritical" },
            { "report_limit_low_warn", "reportLimitLowWarning" },
            { DbConstants.ASSUMPTIONS, DbConstants.ASSUMPTIONS },
            { DbConstants.DESCRIPTION, "description" },
            { "biz_implication", "businessImplication" },
            { "report_benchmark_value", "reportBenchmarkValue" } };

    /**
     * Constructs MetricDataSource, mapped to <code>afm_metric_definitions</code> table, using
     * <code>metric</code> bean.
     *
     * @param tableName Table name to map to.
     * @param beanName Bean name to use.
     */
    public MetricDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }

    /**
     * {@inheritDoc}
     *
     * @return list of active metrics
     */
    @Override
    public List<Metric> getActiveMetrics() {
        return getActiveMetrics(null);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Metric> getActiveMetrics(final String metricName) {
        return getActiveMetricsByRestriction(metricName, null);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Metric> getActiveMetricsByRestriction(final String clientRestriction) {
        return getActiveMetricsByRestriction(null, clientRestriction);
    }

    /**
     * {@inheritDoc}
     *
     * @return list of active metrics
     *         <p>
     *
     *         SuppressWarning Justification
     *         <li><code>PMD.AvoidUsingSql</code> Case 1.1 Select with EXISTS condition on WHERE
     */
    @Override
    @SuppressWarnings("PMD.AvoidUsingSql")
    public List<Metric> getActiveMetricsByRestriction(final String metricName,
            final String clientRestriction) {
        Restriction nonRatioRestriction = null;
        Restriction ratioRestriction = null;
        if (StringUtil.isNullOrEmpty(metricName)) {
            nonRatioRestriction = Restrictions.and(
                Restrictions.isNull(DbConstants.AFM_METRIC_DEFINITIONS,
                    DbConstants.RATIO_METRIC_NUM),
                Restrictions.isNull(DbConstants.AFM_METRIC_DEFINITIONS,
                    DbConstants.RATIO_METRIC_DENOM));
            ratioRestriction = Restrictions.and(
                Restrictions.isNotNull(DbConstants.AFM_METRIC_DEFINITIONS,
                    DbConstants.RATIO_METRIC_NUM),
                Restrictions.isNotNull(DbConstants.AFM_METRIC_DEFINITIONS,
                    DbConstants.RATIO_METRIC_DENOM));
        } else {
            nonRatioRestriction =
                    Restrictions.sql(
                        "afm_metric_definitions.ratio_metric_num IS NULL AND afm_metric_definitions.ratio_metric_denom IS NULL AND "
                                + "( afm_metric_definitions.metric_name = (SELECT denom.ratio_metric_denom FROM afm_metric_definitions denom WHERE denom.metric_name = "
                                + SqlUtils.formatValueForSql(
                                    metricName)
                            + " AND denom.ratio_metric_num IS NOT NULL AND denom.ratio_metric_denom IS NOT NULL) "
                            + "OR "
                            + "afm_metric_definitions.metric_name = (SELECT num.ratio_metric_num FROM afm_metric_definitions num WHERE num.metric_name = "
                            + SqlUtils.formatValueForSql(
                                metricName)
                        + " AND num.ratio_metric_num IS NOT NULL AND num.ratio_metric_denom IS NOT NULL ))");
            ratioRestriction = Restrictions.sql(
                "afm_metric_definitions.metric_name = " + SqlUtils.formatValueForSql(metricName));
        }
        final List<DataRecord> activeMetrics =
                getActiveMetricsRecords(nonRatioRestriction, clientRestriction);
        final List<DataRecord> ratioMetrics =
                getActiveMetricsRecords(ratioRestriction, clientRestriction);
        // add ratio metrics to the end of active metrics list
        if (!ratioMetrics.isEmpty()) {
            activeMetrics.addAll(ratioMetrics);
        }

        return new DataSourceObjectConverter<Metric>().convertRecordsToObjects(activeMetrics,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Metric getByName(final String name) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(
            Restrictions.eq(DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_NAME, name));
        final DataRecord record = dataSource.getRecord();
        return new DataSourceObjectConverter<Metric>().convertRecordToObject(record, this.beanName,
            this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Metric> getMetricsByRestriction(final String clientRestriction) {
        final DataSource dataSource = this.createCopy();
        // add client restriction
        if (StringUtil.notNullOrEmpty(clientRestriction)) {
            dataSource.addRestriction(Restrictions.sql(clientRestriction));
        }
        // ignore old space transaction metrics. Granularities were introduced in v21.2 with
        // trending metrics.
        dataSource.addRestriction(Restrictions.sql(OLD_METRICS_RESTRICTION));
        // add sort field
        dataSource.addSort(DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_NAME,
            DataSource.SORT_ASC);
        final List<DataRecord> records = dataSource.getRecords();

        return new DataSourceObjectConverter<Metric>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /**
     * {@inheritDoc}
     *
     * @param targetTitle
     *
     *            <p>
     *
     *            SuppressWarning Justification
     *            <li><code>PMD.AvoidUsingSql</code> INSERT FROM SELECT statement
     */
    @Override
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void copyMetric(final String sourceName, final String targetName,
            final String targetTitle) {
        final String copyPattern =
                "INSERT INTO {table_name} ( {target_fields} ) SELECT {source_fields} FROM {table_name} WHERE {restriction} ";
        // copy metric definition
        final String metricFields = getFieldsForTable(DbConstants.AFM_METRIC_DEFINITIONS);
        final String restriction =
                DbConstants.METRIC_NAME + " = " + SqlUtils.formatValueForSql(sourceName);

        String sourceFields = metricFields.replace(DbConstants.METRIC_NAME,
            SqlUtils.formatValueForSql(targetName));
        if (DbConstants.METRIC_TITLE.equals(
            sourceFields.substring(sourceFields.length() - DbConstants.METRIC_TITLE.length()))) {
            sourceFields = sourceFields.substring(0,
                sourceFields.length() - DbConstants.METRIC_TITLE.length())
                    + SqlUtils.formatValueForSql(targetTitle);
        } else {
            sourceFields = sourceFields.replace(DbConstants.METRIC_TITLE + Constants.COMMA,
                SqlUtils.formatValueForSql(targetTitle) + Constants.COMMA);
        }
        // set status
        sourceFields = sourceFields.replace(DbConstants.METRIC_STATUS_TEST, "'XT'");
        sourceFields = sourceFields.replace(DbConstants.METRIC_STATUS, "'D'");
        String sqlStatement =
                copyPattern.replaceAll(TABLE_NAME_PATTERN, DbConstants.AFM_METRIC_DEFINITIONS);
        sqlStatement = sqlStatement.replace(RESTRICTION_PATTERN, restriction);
        sqlStatement = sqlStatement.replace(TARGET_FIELDS_PATTERN, metricFields);
        sqlStatement = sqlStatement.replace(SOURCE_FIELDS_PATTERN, sourceFields);
        SqlUtils.executeUpdate(DbConstants.AFM_METRIC_DEFINITIONS, sqlStatement);

        // copy assigned granularities
        final String metricGranularitiesFields = getFieldsForTable(DbConstants.AFM_METRIC_GRANS);
        sourceFields = metricGranularitiesFields.replace(DbConstants.METRIC_NAME,
            SqlUtils.formatValueForSql(targetName));
        sqlStatement = copyPattern.replaceAll(TABLE_NAME_PATTERN, DbConstants.AFM_METRIC_GRANS);
        sqlStatement = sqlStatement.replace(RESTRICTION_PATTERN, restriction);
        sqlStatement = sqlStatement.replace(TARGET_FIELDS_PATTERN, metricGranularitiesFields);
        sqlStatement = sqlStatement.replace(SOURCE_FIELDS_PATTERN, sourceFields);
        SqlUtils.executeUpdate(DbConstants.AFM_METRIC_GRANS, sqlStatement);

        // copy assigned scorecards
        final String metricScorecardFields = getFieldsForTable(DbConstants.AFM_METRIC_SCORECARDS);
        sourceFields = metricScorecardFields.replace(DbConstants.METRIC_NAME,
            SqlUtils.formatValueForSql(targetName));
        sqlStatement =
                copyPattern.replaceAll(TABLE_NAME_PATTERN, DbConstants.AFM_METRIC_SCORECARDS);
        sqlStatement = sqlStatement.replace(RESTRICTION_PATTERN, restriction);
        sqlStatement = sqlStatement.replace(TARGET_FIELDS_PATTERN, metricScorecardFields);
        sqlStatement = sqlStatement.replace(SOURCE_FIELDS_PATTERN, sourceFields);
        SqlUtils.executeUpdate(DbConstants.AFM_METRIC_SCORECARDS, sqlStatement);

    }

    /**
     * Get active metrics records.
     *
     * @param restriction restriction object
     * @param clientRestriction restriction type sql
     * @return records list
     */
    private List<DataRecord> getActiveMetricsRecords(final Restriction restriction,
            final String clientRestriction) {
        final DataSource dataSource = this.createCopy();
        // add status restriction
        dataSource.addRestriction(Restrictions.and(
            Restrictions.eq(DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_STATUS,
                Constants.STATUS_ACTIVE),
            Restrictions.eq(DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_STATUS_TEST,
                Constants.TEST_PASSED)));
        dataSource.addRestriction(Restrictions.and(
            Restrictions.eq(DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_STATUS,
                Constants.STATUS_ACTIVE),
            Restrictions.eq(DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_STATUS_TEST,
                Constants.TEST_PASSED)));
        // this must process only tracking metrics when calc_type exists
        if (SchemaUtils.fieldExistsInSchema(DbConstants.AFM_METRIC_DEFINITIONS,
            DbConstants.CALC_TYPE)) {
            dataSource.addRestriction(Restrictions.eq(DbConstants.AFM_METRIC_DEFINITIONS,
                DbConstants.CALC_TYPE, CalculationType.TRACKING));
        }

        // add custom restriction
        if (StringUtil.notNullOrEmpty(restriction)) {
            dataSource.addRestriction(restriction);
        }
        // add client restriction
        if (StringUtil.notNullOrEmpty(clientRestriction)) {
            dataSource.addRestriction(Restrictions.sql(clientRestriction));
        }
        // ignore old space transaction metrics. Granularities were introduced in v21.2 with
        // trending metrics.
        dataSource.addRestriction(Restrictions.sql(OLD_METRICS_RESTRICTION));
        // add sort field
        dataSource.addSort(DbConstants.AFM_METRIC_DEFINITIONS, DbConstants.METRIC_NAME,
            DataSource.SORT_ASC);
        return dataSource.getRecords();
    }

    /**
     * Returns field list for specified table.
     *
     * @param tableName table name
     * @return String with comma separated list of fields.
     */
    private String getFieldsForTable(final String tableName) {
        final List<String> fields = SchemaUtils.getFieldsForTable(tableName);
        String result = "";
        for (final String field : fields) {
            result += field + Constants.COMMA;
        }
        if (result.length() > 0) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
