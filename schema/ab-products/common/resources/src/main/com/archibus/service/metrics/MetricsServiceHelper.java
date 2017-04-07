package com.archibus.service.metrics;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.dao.*;
import com.archibus.app.common.metrics.dao.datasource.*;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.app.common.metrics.provider.MetricValuesSampleDataProvider;
import com.archibus.app.common.metrics.validation.Validator;
import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.datasource.SqlUtils;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.*;

/**
 * Helper class for metric service.
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public class MetricsServiceHelper {
    /**
     * Constant: list with trend value fields.
     */
    private static final String TREND_VALUES_FIELDS =
            "auto_number, collect_by_value, collect_err_msg, collect_group_by, metric_date, metric_name, metric_value, metric_value_last, metric_value_last_yr, metric_value_prev";

    /**
     * Trend value data source.
     */
    private IMetricTrendValueDao trendValueDao;

    /**
     * Metric data source.
     */
    private IMetricDao<Metric> metricDao;

    /**
     * Logger.
     */
    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * Constructor.
     *
     */
    public MetricsServiceHelper() {
        initPerRequestState();
    }

    /**
     * Check if current date is scheduled collect date.
     *
     * @param recurringRule xml recurring pattern
     * @param currentDate date to be tested
     * @param lastCollectDate last collect date
     * @return boolean
     */
    public boolean isCollectDate(final String recurringRule, final Date currentDate,
            final Date lastCollectDate) {
        Date startFromDate = currentDate;
        if (StringUtil.notNullOrEmpty(lastCollectDate)) {
            startFromDate = lastCollectDate;
        }
        final RecurringScheduleService recurringService = getRecurringScheduleService();
        final List<Date> dates = recurringService.getDatesList(startFromDate, null, recurringRule);
        return !dates.isEmpty() && dates.contains(currentDate);
    }

    /**
     * Returns start date for collect period that ends on endDate.
     *
     * @param recurringRule xml recurring pattern
     * @param endDate end date
     * @param lastCollectDate last collect date
     * @return date object
     */
    public Date getCollectPeriodStartDate(final String recurringRule, final Date endDate,
            final Date lastCollectDate) {
        final RecurringScheduleService recurringService = getRecurringScheduleService();
        Date startDate = recurringService.getPeriodStartDate(recurringRule, endDate);
        if (StringUtil.notNullOrEmpty(lastCollectDate) && lastCollectDate.after(startDate)) {
            startDate = lastCollectDate;
        }
        return startDate;
    }

    /**
     * Save collected values for metric and granularity.
     *
     * @param metric metric object
     * @param granularity granularity object
     * @param collectDate collect date
     * @param values values map Map<groupBy, value>
     * @param isSampleData if is sample data or not
     * @param jobStatus current job status
     */
    public void saveMetricValuesForGranularityAndDate(final Metric metric,
            final Granularity granularity, final Date collectDate, final Map<String, Double> values,
            final boolean isSampleData, final JobStatus jobStatus) {

        final Date lastYearDate = getLastYearDate(metric.getRecurringRule(), collectDate);
        final Iterator<String> itGroupByValues = values.keySet().iterator();
        while (itGroupByValues.hasNext()) {
            final String groupByValue = itGroupByValues.next();
            final Double metricValue = values.get(groupByValue);
            saveValue(metric.getName(), granularity.getGroupByFields(), collectDate, groupByValue,
                metricValue, lastYearDate, isSampleData);
            jobStatus.setCurrentNumber(jobStatus.getCurrentNumber() + 1);
        }
    }

    /**
     * Delete existing metric values for granularity and collect date.
     *
     * @param metricName metric name
     * @param granularityCode granularity code (group by)
     * @param collectDate collect date
     * @param isSampleData if is sample data or not
     */
    public void deleteMetricValuesForGranularityAndDate(final String metricName,
            final String granularityCode, final Date collectDate, final boolean isSampleData) {
        this.trendValueDao.deleteMetricValuesForGranularityAndDate(metricName, granularityCode,
            collectDate, isSampleData);
    }

    /**
     * Save given metric value.
     *
     * @param metricId metric code
     * @param groupByFields group by fields
     * @param collectDate collect date
     * @param groupByValue group by value
     * @param value metric value
     * @param lastYearDate last year collect date
     * @param isSampleData if is sample data or not
     */
    public void saveValue(final String metricId, final String groupByFields, final Date collectDate,
            final String groupByValue, final double value, final Date lastYearDate,
            final boolean isSampleData) {
        final int recordsNo = Integer.parseInt(Constants.PREVIOUS_VAL_NUMBER);
        final List<MetricTrendValue> lastValues =
                this.trendValueDao.getValues(metricId, groupByFields, groupByValue, recordsNo);
        final MetricTrendValue newValue =
                MetricTrendValue.createNewValueFor(metricId, groupByFields);
        newValue.setCollectDate(collectDate);
        if (StringUtil.notNullOrEmpty(groupByValue) && !Constants.NULL.equals(groupByValue)) {
            newValue.setGroupByValue(groupByValue);
        }

        newValue.setValue(value);

        if (isSampleData) {
            newValue.setErrorMessage(Constants.EXAMPLE);
        }
        // set previous values field
        // last values are sorted by date descending
        if (!lastValues.isEmpty()) {
            newValue.setLastValue(lastValues.get(0).getValue());
            // prepare previous values field
            String previousValue = "";
            for (int index = lastValues.size(); index > 0; index--) {
                final MetricTrendValue trendValue = lastValues.get(index - 1);
                previousValue = trendValue.getValue() + Constants.SEMICOLON + previousValue;
            }
            newValue.setPreviousValues(previousValue);
        }
        // set last year value field
        final MetricTrendValue lastYearValue =
                this.trendValueDao.getValue(metricId, groupByFields, groupByValue, lastYearDate);
        if (StringUtil.notNullOrEmpty(lastYearValue)) {
            newValue.setLastYearValue(lastYearValue.getValue());
        } else if (isSampleData && lastValues.size() == MetricsService.SAMPLE_DATA_PERIODS - 1) {
            newValue.setLastYearValue(lastValues.get(lastValues.size() - 1).getValue());
        }

        this.trendValueDao.save(newValue);
    }

    /**
     * Validate metric status. Metric status must be ACTIVE.
     *
     * @param metric metric object
     * @throws ExceptionBase exception
     */
    public void validateMetricStatus(final Metric metric) throws ExceptionBase {
        // try {
        final Validator validator = new Validator(metric);
        validator.validateStatus();
        // } catch (final ExceptionBase exceptionBase) {
        // throw exceptionBase;
        // }
    }

    /**
     * Validate given metric and update test status.
     *
     * @param metric metric object
     * @throws ExceptionBase exception
     */
    public void validateMetric(final Metric metric) throws ExceptionBase {
        try {
            final Validator validator = new Validator(metric);
            validator.validateMetric();
            updateTestStatus(metric, Constants.TEST_PASSED);
        } catch (final ExceptionBase originalException) {
            updateTestStatus(metric, Constants.TEST_FAILED);
            final ExceptionBase newException = originalException;
            // final ExceptionBase newException = ExceptionBaseFactory.newTranslatableException(
            // Messages.ERROR_GENERIC_MESSAGE, new Object[] { metric.getTitle() });
            // newException.setStackTrace(originalException.getStackTrace());
            throw newException;
        }
    }

    /**
     * Throw error to UI or log error into database.
     *
     * @param exceptionBase exception
     * @param metric metric object
     * @param granularity metric granularity
     * @param collectDate collect date
     * @param showError if error is throw to UI
     */
    public void handleError(final ExceptionBase exceptionBase, final Metric metric,
            final Granularity granularity, final Date collectDate, final boolean showError) {
        // log error into log file
        logError(exceptionBase);
        if (showError) {
            // update metric status and throw error to UI
            updateTestStatus(metric, Constants.TEST_FAILED);
            throw exceptionBase;
        } else {
            // save error into database
            final MetricTrendValue errorRecord =
                    MetricTrendValue.createErrorRecord(metric, granularity, "Error", collectDate);
            this.trendValueDao.save(errorRecord);
        }
    }

    /**
     * Update metric test status.
     *
     * @param metric metric
     * @param status test status
     */
    public void updateTestStatus(final Metric metric, final String status) {
        metric.setTestStatus(status);
        this.metricDao.update(metric);
        if (Constants.TEST_FAILED.equals(status)) {
            // error is throw but we must update the status
            SqlUtils.commit();
        }
    }

    /**
     * Get list of collect dates from start date to end date.
     *
     * @param recurringRule recurring rule
     * @param fromDate start date
     * @param toDate end date
     * @return list
     */
    public List<Date> getCollectDateList(final String recurringRule, final Date fromDate,
            final Date toDate) {
        final RecurringScheduleService recurringService = getRecurringScheduleService();
        return recurringService.getDatesList(fromDate, toDate, recurringRule);
    }

    /**
     * Returns list with periodsNo collect dates before reference date.
     *
     * @param recurringRule recurring rule
     * @param referenceDate reference date
     * @param periodsNo periods number
     * @return dates list
     */
    public List<Date> getPreviousCollectDateList(final String recurringRule,
            final Date referenceDate, final int periodsNo) {
        final RecurringScheduleService recurringScheduleService = getRecurringScheduleService();
        recurringScheduleService.setSchedulingLimits(1, 1, 1, 1);
        final List<Date> tmpDates =
                recurringScheduleService.getDatesList(referenceDate, null, recurringRule);
        Date currentEndDate = tmpDates.get(0);
        final List<Date> dates = new ArrayList<Date>();
        dates.add(currentEndDate);
        for (int counter = 0; counter < periodsNo; counter++) {
            final Date currentStartDate =
                    recurringScheduleService.getPeriodStartDate(recurringRule, currentEndDate);
            dates.add(0, currentStartDate);
            currentEndDate = currentStartDate;
        }
        return dates;
    }

    /**
     * Returns sample date records number for granularity.
     *
     * @param metric metric object
     * @param granularity granularity object
     * @return records number
     */
    public int getSampleDataRecordsForMetricAndGranularity(final Metric metric,
            final Granularity granularity) {
        final MetricValuesSampleDataProvider provider = new MetricValuesSampleDataProvider();
        provider.setMetric(metric);
        return provider.getRecordsNo(granularity);
    }

    /**
     * Archive metric values older than X days.
     *
     * @param metricName metric name
     * @param days older than X days
     *            <p>
     *
     *            SuppressWarning Justification
     *            <li><code>PMD.AvoidUsingSql</code> Case 2.1 Statements with INSERT ... SELECT
     *            pattern
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void archiveMetricValues(final String metricName, final int days) {
        final String sqlStatement = "INSERT INTO afm_hmetric_trend_values ( " + TREND_VALUES_FIELDS
                + " ) SELECT " + TREND_VALUES_FIELDS + " FROM afm_metric_trend_values WHERE "
                + getMaintenanceJobRestriction(metricName, days);
        SqlUtils.executeUpdate(DbConstants.AFM_METRIC_TREND_VALUES, sqlStatement);
    }

    /**
     * Delete metric values older than X days.
     *
     * @param metricName metric name
     * @param days days number
     *            <p>
     *
     *            SuppressWarning Justification
     *            <li><code>PMD.AvoidUsingSql</code> Case 2.3 Statements with DELETE FROM ...
     *            pattern
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void deleteMetricValues(final String metricName, final int days) {
        final String sqlStatement = "DELETE FROM afm_metric_trend_values WHERE "
                + getMaintenanceJobRestriction(metricName, days);

        SqlUtils.executeUpdate(DbConstants.AFM_METRIC_TREND_VALUES, sqlStatement);
    }

    /**
     * Returns sql restriction for maintenance job.
     *
     * @param metricName metric name
     * @param days days number
     * @return String
     */
    private String getMaintenanceJobRestriction(final String metricName, final int days) {
        return " (afm_metric_trend_values.collect_err_msg <> "
                + SqlUtils.formatValueForSql(Constants.EXAMPLE)
                + " OR  afm_metric_trend_values.collect_err_msg IS NULL) AND afm_metric_trend_values.metric_name = "
                + SqlUtils.formatValueForSql(metricName)
                + " AND ${sql.dateDiffInterval('day', 'afm_metric_trend_values.metric_date',  'CurrentDateTime')} > "
                + SqlUtils.formatValueForSql(days);
    }

    /**
     * Calculate and return last year date based on date and recurring rule.
     *
     * @param recurringRule recurring rule
     * @param date reference date
     * @return date
     */
    private Date getLastYearDate(final String recurringRule, final Date date) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.YEAR, -1);
        final RecurringScheduleService recurringService = getRecurringScheduleService();
        final List<Date> dates =
                recurringService.getDatesList(calendar.getTime(), date, recurringRule);
        Date lastYearDate = calendar.getTime();
        if (!dates.isEmpty()) {
            lastYearDate = dates.get(0);
        }
        return lastYearDate;
    }

    /**
     * Get recurring schedule service.
     *
     * @return service
     */
    private RecurringScheduleService getRecurringScheduleService() {
        final RecurringScheduleService recurringService = new RecurringScheduleService();
        recurringService.setSchedulingLimits(-1, -1, -1, -1);
        return recurringService;
    }

    /**
     * Initialize DAO objects if they are set by Spring config.
     */
    private void initPerRequestState() {
        if (this.metricDao == null) {
            this.metricDao =
                    new MetricDataSource<Metric>("metric", DbConstants.AFM_METRIC_DEFINITIONS);
        }
        if (this.trendValueDao == null) {
            this.trendValueDao = new MetricTrendValueDataSource();
        }
    }

    /**
     * Log error to log file.
     *
     * @param exceptionBase exception
     */
    private void logError(final ExceptionBase exceptionBase) {
        if (this.log.isDebugEnabled()) {
            this.log.debug(exceptionBase.toString());
        }
        this.log.error(exceptionBase.toStringForLogging());
    }
}
