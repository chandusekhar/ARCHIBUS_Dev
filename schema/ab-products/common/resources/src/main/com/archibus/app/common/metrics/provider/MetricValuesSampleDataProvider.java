package com.archibus.app.common.metrics.provider;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

/**
 * Provider for metric sample data.
 *
 * @author Ioan Draghici
 * @since 21.2
 *        <p>
 *
 *        SuppressWarning Justification
 *        <li><code>PMD.AvoidUsingSql</code> This class use custom query to generate granularity
 *        values.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class MetricValuesSampleDataProvider implements MetricValuesProvider {

    /**
     * Constant.
     */
    private static final double BIG_START_VARIATION = 0.30;

    /**
     * Constant.
     */
    private static final double SMALL_START_VARIATION = 0.10;

    /**
     * Constant.
     */
    private static final double MAX_VARIATION_PER_PERIOD = 0.07;

    /**
     * Constant.
     */
    private static final double ZERO_DOT_FIVE = 0.5;

    /**
     * Granularities sql queries.
     *
     * Suppress PMD warnings, "AvoidStaticFields".
     * <p>
     * Justification: this field is initialized with custom SQL queries for several granularities.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    private static final Map<String, String> GROUP_BY_QUERIES = new HashMap<String, String>();

    static {
        GROUP_BY_QUERIES.put("bl_id", "SELECT DISTINCT bl.bl_id ${sql.as} bl_id FROM bl");
        GROUP_BY_QUERIES.put("bl_id;dv_id",
            "SELECT DISTINCT bl.bl_id ${sql.as} bl_id, dv.dv_id ${sql.as} dv_id FROM bl CROSS JOIN dv");
        GROUP_BY_QUERIES.put("bl_id;dv_id;dp_id",
            "SELECT DISTINCT bl.bl_id ${sql.as} bl_id, dp.dv_id ${sql.as} dv_id, dp.dp_id ${sql.as} dp_id FROM bl CROSS JOIN dp");
        GROUP_BY_QUERIES.put("bl_id;prob_type",
            "SELECT DISTINCT bl.bl_id ${sql.as} bl_id, probtype.prob_type ${sql.as} prob_type FROM bl CROSS JOIN probtype");
        GROUP_BY_QUERIES.put("bl_id;tr_id",
            "SELECT DISTINCT bl.bl_id ${sql.as} bl_id, tr.tr_id ${sql.as} tr_id FROM bl CROSS JOIN tr");
        GROUP_BY_QUERIES.put("bl_id;use1",
            "SELECT DISTINCT bl.bl_id ${sql.as} bl_id, bl.use1 ${sql.as} use1 FROM bl");
        GROUP_BY_QUERIES.put("bu_id", "SELECT DISTINCT bu.bu_id ${sql.as} bu_id FROM bu");
        GROUP_BY_QUERIES.put("bu_id;bl_id",
            "SELECT DISTINCT bu.bu_id ${sql.as} bu_id, bl.bl_id ${sql.as} bl_id FROM bu CROSS JOIN bl");
        GROUP_BY_QUERIES.put("cause_type",
            "SELECT DISTINCT causetyp.cause_type ${sql.as} cause_type FROM causetyp");
        GROUP_BY_QUERIES.put("ctry_id;regn_id",
            "SELECT DISTINCT regn.ctry_id ${sql.as} ctry_id, regn.regn_id ${sql.as} regn_id FROM regn");
        GROUP_BY_QUERIES.put("dv_id", "SELECT DISTINCT dv.dv_id ${sql.as} dv_id FROM dv");
        GROUP_BY_QUERIES.put("dv_id;dp_id",
            "SELECT DISTINCT dp.dv_id ${sql.as} dv_id, dp.dp_id ${sql.as} dp_id FROM dp");
        GROUP_BY_QUERIES.put("eq_id", "SELECT DISTINCT eq.eq_id ${sql.as} eq_id FROM eq");
        GROUP_BY_QUERIES.put("eq_std", "SELECT DISTINCT eqstd.eq_std ${sql.as} eq_std FROM eqstd");
        GROUP_BY_QUERIES.put("fl_id", "SELECT DISTINCT fl.fl_id ${sql.as} fl_id FROM fl");
        GROUP_BY_QUERIES.put("geo_region_id",
            "SELECT DISTINCT geo_region.geo_region_id ${sql.as} geo_region_id FROM geo_region");
        GROUP_BY_QUERIES.put("org_id", "SELECT DISTINCT org.org_id ${sql.as} org_id FROM org");
        GROUP_BY_QUERIES.put("prob_type",
            "SELECT DISTINCT probtype.prob_type ${sql.as} prob_type FROM probtype");
        GROUP_BY_QUERIES.put("program_id",
            "SELECT DISTINCT program.program_id ${sql.as} program_id FROM program");
        GROUP_BY_QUERIES.put("project_id",
            "SELECT DISTINCT project.project_id ${sql.as} project_id FROM project");
        GROUP_BY_QUERIES.put("project_type",
            "SELECT DISTINCT projecttype.project_type ${sql.as} project_type FROM projecttype");
        GROUP_BY_QUERIES.put("site_id", "SELECT DISTINCT site.site_id ${sql.as} site_id FROM site");
        GROUP_BY_QUERIES.put("tr_id", "SELECT DISTINCT tr.tr_id ${sql.as} tr_id FROM tr");
        GROUP_BY_QUERIES.put("use1", "SELECT DISTINCT bl.use1 ${sql.as} use1 FROM bl");
        GROUP_BY_QUERIES.put("team_id",
            "SELECT DISTINCT team.team_id ${sql.as} team_id FROM team WHERE team_id IS NOT NULL");

    }

    /**
     * Metric definition.
     */
    private Metric metric;

    /**
     * Metric granularity.
     */
    private Granularity metricGranularity;

    /**
     * Setter for metric object.
     *
     * @param metric the metric to set
     */
    @Override
    public void setMetric(final Metric metric) {
        this.metric = metric;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, Double> getValues(final Granularity granularity, final Date fromDate,
            final Date toDate) throws ExceptionBase {
        this.metricGranularity = granularity;

        // try {
        List<String> groupByValues = new ArrayList<String>();
        if (Constants.PORTFOLIO.equals(this.metricGranularity.getGroupByFields())) {
            groupByValues.add(Constants.NULL);
        } else {
            groupByValues = getGroupByValues(this.metric.getCollectTable(),
                this.metricGranularity.getGroupByFields());
        }

        return generateValues(this.metricGranularity.getGroupByFields(), groupByValues);
        // } catch (final ExceptionBase originalException) {
        // throw originalException;
        // }
    }

    /**
     * Get sample data records number.
     *
     * @param granularity granularity
     * @return records number
     */
    public int getRecordsNo(final Granularity granularity) {
        int recordsNo = 0;
        this.metricGranularity = granularity;
        // try {
        if (Constants.PORTFOLIO.equals(this.metricGranularity.getGroupByFields())) {
            recordsNo = 1;
        } else {
            final List<String> groupByValues = getGroupByValues(this.metric.getCollectTable(),
                this.metricGranularity.getGroupByFields());
            recordsNo = groupByValues.size();
        }
        // } catch (final ExceptionBase originalException) {
        // throw originalException;
        // }
        return recordsNo;
    }

    /**
     * Generate metric values.
     *
     * @param groupByFields group by fields
     * @param groupByValues group by values
     * @return metric values
     */
    private Map<String, Double> generateValues(final String groupByFields,
            final List<String> groupByValues) {
        final Map<String, Double> metricValues = new HashMap<String, Double>();
        for (final String groupByValue : groupByValues) {
            Double startValue = getStartValue(this.metric.getName(), groupByFields, groupByValue);
            final int trendDirection = getTrendDirection();
            if (startValue == 0) {
                startValue = this.metric.getReportLimitTarget() == 0
                        ? this.metric.getReportBenchmarkValue()
                        : this.metric.getReportLimitTarget();
                if (this.metric.getReportTrendDir() == 1) {
                    startValue += trendDirection * getRandomNumberBetween(0, BIG_START_VARIATION)
                            * startValue;
                } else if (this.metric.getReportTrendDir() == 0) {
                    startValue += trendDirection * getRandomNumberBetween(0, BIG_START_VARIATION)
                            * startValue;
                } else {
                    startValue += trendDirection * getRandomNumberBetween(0, SMALL_START_VARIATION)
                            * startValue;
                }
            } else {
                startValue += trendDirection * getRandomNumberBetween(0, MAX_VARIATION_PER_PERIOD)
                        * startValue;
            }

            Integer numOfDecimals = this.metric.getMetricDecimals();
            if (Constants.NUMERIC_FORMAT_PERCENT.equals(this.metric.getNumericFormat())
                    && numOfDecimals == 0) {
                numOfDecimals = 2;
            }

            if (startValue > 0) {
                startValue = new BigDecimal(startValue.doubleValue())
                    .setScale(numOfDecimals, BigDecimal.ROUND_FLOOR).doubleValue();
            } else {
                startValue = new BigDecimal(startValue.doubleValue())
                    .setScale(numOfDecimals, BigDecimal.ROUND_CEILING).doubleValue();
            }
            metricValues.put(groupByValue, startValue);
        }
        return metricValues;
    }

    /**
     * Get trend direction factor.
     *
     * @return integer
     */
    private int getTrendDirection() {
        int result = 0;
        if (this.metric.getReportTrendDir() == 1) {
            result = 1;
        } else if (this.metric.getReportTrendDir() == 0) {
            result = -1;
        } else {
            result = getRandomUporDown();
        }

        if (this.metric.getSampleTrendDir() == 0) {
            this.metric.setSampleTrendDir(result);
        }

        return this.metric.getSampleTrendDir();
    }

    /**
     * Returns list of group by values.
     *
     * @param collectTable collect table
     * @param groupByFields group by fields
     * @return list of values
     */
    private List<String> getGroupByValues(final String collectTable, final String groupByFields) {
        final List<String> groupByValues = new ArrayList<String>();
        if (GROUP_BY_QUERIES.containsKey(groupByFields)) {
            final String tableName = StringUtil.notNullOrEmpty(collectTable) ? collectTable
                    : DbConstants.AFM_METRIC_DEFINITIONS;
            final String[] fields = groupByFields.split(Constants.SEMICOLON);
            final DataSourceImpl dataSource = (DataSourceImpl) DataSourceFactory.createDataSource();
            dataSource.addTable(tableName);
            for (final String field : fields) {
                dataSource.addVirtualField(tableName, field, DataSource.DATA_TYPE_TEXT);
            }
            dataSource.addQuery(GROUP_BY_QUERIES.get(groupByFields));
            dataSource.setDoNotWrapCustomSql(true);
            final List<DataRecord> records = dataSource.getAllRecords();
            for (final DataRecord record : records) {
                final String groupByValue = getGroupByValue(record, tableName, fields);
                groupByValues.add(groupByValue);
            }
        }
        return groupByValues;
    }

    /**
     * Get sql restriction for metric , granularity and collect value.
     *
     * @param metricName metric name
     * @param collectGroupBy collect group by fields
     * @param groupByValue group by value
     * @return string
     */
    private String getRestriction(final String metricName, final String collectGroupBy,
            final String groupByValue) {
        String restriction =
                "afm_metric_trend_values.metric_name = " + SqlUtils.formatValueForSql(metricName)
                        + " AND afm_metric_trend_values.collect_group_by = "
                        + SqlUtils.formatValueForSql(collectGroupBy)
                        + " AND afm_metric_trend_values.collect_err_msg = "
                        + SqlUtils.formatValueForSql(Constants.EXAMPLE);
        if (Constants.PORTFOLIO.equals(collectGroupBy)) {
            restriction += " AND afm_metric_trend_values.collect_by_value IS NULL";
        } else {
            restriction += " AND afm_metric_trend_values.collect_by_value = "
                    + SqlUtils.formatValueForSql(groupByValue);
        }
        return restriction;
    }

    /**
     * Get last metric value.
     *
     * @param metricName metric name
     * @param collectGroupBy collect group by fields
     * @param groupByValue group by value
     * @return integer
     */
    private double getStartValue(final String metricName, final String collectGroupBy,
            final String groupByValue) {
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(DbConstants.AFM_METRIC_TREND_VALUES);
        dataSource.addField(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.METRIC_VALUE);

        final String restriction = getRestriction(metricName, collectGroupBy, groupByValue);
        dataSource.addRestriction(Restrictions.sql(restriction));
        dataSource.addSort(DbConstants.AFM_METRIC_TREND_VALUES, DbConstants.AUTO_NUMBER,
            DataSource.SORT_DESC);
        final DataRecord record = dataSource.getRecord();
        double metricValue = 0;
        if (StringUtil.notNullOrEmpty(record) && record.valueExists(
            DbConstants.AFM_METRIC_TREND_VALUES + Constants.DOT + DbConstants.METRIC_VALUE)) {
            metricValue = record.getDouble(
                DbConstants.AFM_METRIC_TREND_VALUES + Constants.DOT + DbConstants.METRIC_VALUE);
        }
        return metricValue;
    }

    /**
     * Generate random number between two doubles.
     *
     * @param min minimum
     * @param max maximum
     * @return double
     */
    private double getRandomNumberBetween(final double min, final double max) {
        final Random random = new Random();
        return min + (max - min) * random.nextDouble();
    }

    /**
     * Returns 1 or -1 randomly.
     *
     * @return 1 or -1
     */
    private int getRandomUporDown() {
        return getRandomNumberBetween(0, 1.0) > ZERO_DOT_FIVE ? 1 : -1;
    }

    /**
     * Utility function return list with field values from records list.
     *
     * @param record record
     * @param tableName table name
     * @param fields array with full field names
     * @return string
     */
    private String getGroupByValue(final DataRecord record, final String tableName,
            final String[] fields) {
        String result = "";
        for (final String field : fields) {
            final String value = record.getString(tableName + Constants.DOT + field);
            if (StringUtil.notNullOrEmpty(value)) {
                result += value + Constants.SEMICOLON;
            } else {
                result += Constants.NULL + Constants.SEMICOLON;
            }
        }
        if (result.length() > 0) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }
}
