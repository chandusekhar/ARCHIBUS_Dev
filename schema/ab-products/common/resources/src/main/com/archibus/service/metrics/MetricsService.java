package com.archibus.service.metrics;

import java.util.*;

import org.json.*;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.dao.*;
import com.archibus.app.common.metrics.dao.datasource.*;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.app.common.metrics.provider.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 *
 * User Defined Metrics service.
 * <p>
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */

public class MetricsService extends JobBase {
    /**
     * Sample data periods number.
     */
    public static final int SAMPLE_DATA_PERIODS = 20;

    /**
     * Constant 100.
     */
    private static final long ONE_HUNDRED = 100;

    /**
     * If is called scheduled WFR that collect data.
     */
    private boolean isScheduledMode;

    /**
     * If sample data is generated.
     */
    private boolean isSampleDataMode;

    /**
     * Granularity data source.
     */
    private IGranularityDao granularityDao;

    /**
     * Metric data source.
     */
    private IMetricDao<Metric> metricDao;

    /**
     * Provides all data required to display the scorecard of metrics for specified scorecard and
     * granularity.
     */
    private MetricServiceTrendValuesLoader trendValuesLoader;

    /**
     * Helper class.
     */
    private MetricsServiceHelper metricsHelper;

    /**
     * Main method called from scheduled WFR.
     *
     */
    public void collectData() {
        initPerRequestState();
        final Date currentDate = getCurrentDate();
        this.isScheduledMode = true;
        // load all active metrics
        final List<Metric> activeMetrics = this.metricDao.getActiveMetrics();
        for (final Metric metric : activeMetrics) {
            // if current date is scheduled collect date collect metric data.
            if (this.metricsHelper.isCollectDate(metric.getRecurringRule(), currentDate,
                metric.getLastCollectDate(this.isSampleDataMode))) {
                final Date startDate =
                        this.metricsHelper.getCollectPeriodStartDate(metric.getRecurringRule(),
                            currentDate, metric.getLastCollectDate(this.isSampleDataMode));

                collectMetricForPeriodAndGranularity(metric, startDate, currentDate, null);
            }
        }
    }

    /**
     * Collect data for given metric and date.
     *
     * @param metricName metric name
     * @param collectDate collect date
     */
    public void collectDataForMetricAndDate(final String metricName, final Date collectDate) {
        initPerRequestState();
        this.isScheduledMode = true;
        final Metric metric = this.metricDao.getByName(metricName);
        if (this.metricsHelper.isCollectDate(metric.getRecurringRule(), collectDate,
            metric.getLastCollectDate(this.isSampleDataMode))) {
            final Date periodStartDate =
                    this.metricsHelper.getCollectPeriodStartDate(metric.getRecurringRule(),
                        collectDate, metric.getLastCollectDate(this.isSampleDataMode));
            collectMetricForPeriodAndGranularity(metric, periodStartDate, collectDate, null);
        }
    }

    /**
     * Method called by test metric action.
     *
     * @param metricName metric code
     * @throws ExceptionBase exception
     */
    public void testMetric(final String metricName) throws ExceptionBase {
        initPerRequestState();
        this.isScheduledMode = false;
        final Date currentDate = getCurrentDate();
        Date startDate = null;
        // try {
        final Metric metric = this.metricDao.getByName(metricName);
        if (metric.isRatioMetric()) {
            // validate numerator and denominator.
            final Metric numerator = this.metricDao.getByName(metric.getNumerator());
            // validate metric status
            this.metricsHelper.validateMetricStatus(numerator);

            if (!Constants.TEST_PASSED.equals(numerator.getTestStatus())) {
                this.metricsHelper.validateMetric(numerator);
                // execute query
                startDate = this.metricsHelper
                    .getCollectPeriodStartDate(numerator.getRecurringRule(), currentDate, null);
                collectMetricForPeriodAndGranularity(numerator, startDate, currentDate, null);
            }

            final Metric denominator = this.metricDao.getByName(metric.getDenominator());
            // validate metric status
            this.metricsHelper.validateMetricStatus(denominator);
            if (!Constants.TEST_PASSED.equals(denominator.getTestStatus())) {
                this.metricsHelper.validateMetric(denominator);
                // execute query
                startDate = this.metricsHelper
                    .getCollectPeriodStartDate(denominator.getRecurringRule(), currentDate, null);
                collectMetricForPeriodAndGranularity(denominator, startDate, currentDate, null);
            }
        }
        // test metric
        this.metricsHelper.validateMetric(metric);
        // execute query
        startDate = this.metricsHelper.getCollectPeriodStartDate(metric.getRecurringRule(),
            currentDate, null);
        collectMetricForPeriodAndGranularity(metric, startDate, currentDate, null);
        // } catch (final ExceptionBase exception) {
        // throw exception;
        // }
    }

    /**
     * Returns data required to display the scorecard of metrics for specified granularity.
     *
     * @param scorecardName The scorecard name.
     * @param granularityName The granularity name.
     * @return JSONArray<JSONObject> A JSON array containing one object per metric with granularity
     *         totals. <br>
     *         Each object contains:<br>
     *         metricTitle: string.<br>
     *         metricValue: formatted string value.<br>
     *         metricValuePrevious: formatted string value.<br>
     *         metricChange: formatted string value.<br>
     *         metricChangePerYear: formatted string value.<br>
     *         processVsTarget: formatted string value.<br>
     *         drillDownView: string.<br>
     *         stoplightColor: string, can be black, red, yellow, or green.<br>
     */
    public JSONArray getTrendValuesForScorecard(final String scorecardName,
            final String granularityName) {
        initPerRequestState();

        return this.trendValuesLoader.getTrendValuesForScorecard(scorecardName, granularityName);
    }

    /**
     * Returns data required to display the drill-down chart for specified metric and granularity.
     *
     * @param metricName The metric name.
     * @param granularityName The granularity name.
     * @param sortOrder The sort order to sort records by trend value, either "asc" or "desc".
     * @return JSONArray<JSONObject> A JSON array containing one object per granularity value. <br>
     *         Each object contains:<br>
     *         metricTitle: string.<br>
     *         metricValue: formatted string value.<br>
     *         metricValuePrevious: formatted string value.<br>
     *         metricChange: formatted string value.<br>
     *         metricChangePerYear: formatted string value.<br>
     *         processVsTarget: formatted string value.<br>
     *         drillDownView: string.<br>
     *         stoplightColor: string, can be black, red, yellow, or green.<br>
     */
    public JSONArray getTrendValuesForMetric(final String metricName, final String granularityName,
            final String sortOrder) {
        initPerRequestState();

        return this.trendValuesLoader.getTrendValuesForMetric(metricName, granularityName,
            sortOrder);
    }

    /**
     * Returns granularities available for specified metric.
     *
     * @param metricName The afm_metric_definitions.metric_name value.
     * @return JSONArray<JSONObject> A JSON array containing available granularities. <br>
     *         Each JSON object contains:<br>
     *         metricTitle: from afm_metric_definitions.metric_title <br>
     *         granularityTitle: from afm_metric_gran_defs.granularity_title <br>
     *         collectGroupBy: from afm_metric_gran_defs.collect_by_fields<br>
     */
    public JSONArray getGranularitiesForMetric(final String metricName) {
        initPerRequestState();

        final JSONArray granularitiesDto = new JSONArray();

        final Metric metric = this.metricDao.getByName(metricName);

        final List<Granularity> availableGranularities =
                this.granularityDao.getGranularitiesForMetric(metricName);
        for (final Granularity granularity : availableGranularities) {
            final JSONObject granularityDto = new JSONObject();
            granularityDto.put("metricTitle", metric.getTitle());
            granularityDto.put("granularityTitle", granularity.getTitle());
            granularityDto.put("collectGroupBy", granularity.getGroupByFields());
            granularitiesDto.put(granularityDto);
        }

        return granularitiesDto;
    }

    /**
     * Collect metric values for prior periods.
     *
     * @param metricName metric name
     * @param startDate start date
     * @param granularityId granularity code
     */
    public void generateData(final String metricName, final Date startDate,
            final String granularityId) {
        initPerRequestState();
        long currentStep = 0;
        this.status.setCurrentNumber(currentStep);
        this.status.setTotalNumber(ONE_HUNDRED);
        final Metric metric = this.metricDao.getByName(metricName);
        if (metric.isRatioMetric()) {
            collectDataForMetricAndDate(metric.getNumerator(), startDate, granularityId);
            collectDataForMetricAndDate(metric.getDenominator(), startDate, granularityId);
        }
        final Date currentDate = getCurrentDate();
        final List<Date> collectDates = this.metricsHelper
            .getCollectDateList(metric.getRecurringRule(), startDate, currentDate);
        this.isScheduledMode = true;
        final long increment = ONE_HUNDRED / (collectDates.isEmpty() ? 1 : collectDates.size());
        for (final Date collectDate : collectDates) {
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOP_REQUESTED);
                this.status.setCurrentNumber(ONE_HUNDRED);
                break;
            }
            final Date periodStartDate = this.metricsHelper
                .getCollectPeriodStartDate(metric.getRecurringRule(), collectDate, null);
            collectMetricForPeriodAndGranularity(metric, periodStartDate, collectDate,
                granularityId);
            currentStep = currentStep + increment;
            this.status.setCurrentNumber(currentStep);
        }

        this.status.setCurrentNumber(ONE_HUNDRED);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }

    /**
     * Set job run mode scheduled or not.
     *
     * @param jobMode job mode "scheduled" or "message"
     */
    public void setJobRunMode(final String jobMode) {
        this.isScheduledMode = "scheduled".equals(jobMode);
    }

    /**
     * Returns sample data records number.
     *
     * @param metricName metric name
     * @return records number
     */
    public int getSampleDataRecordsNo(final String metricName) {
        initPerRequestState();
        int recordsNo = 0;
        // load metric
        final Metric metric = this.metricDao.getByName(metricName);
        // load metric granularities
        final List<Granularity> granularities =
                this.granularityDao.getGranularitiesForMetric(metricName);
        for (final Granularity granularity : granularities) {
            recordsNo = recordsNo + this.metricsHelper
                .getSampleDataRecordsForMetricAndGranularity(metric, granularity);
        }
        recordsNo = recordsNo * SAMPLE_DATA_PERIODS;
        return recordsNo;
    }

    /**
     * Generate sample data.
     *
     * @param metricName metric name
     * @param collectGroupBy collect group by
     * @param recordsNo sample data records
     */
    public void generateSampleData(final String metricName, final String collectGroupBy,
            final int recordsNo) {
        initPerRequestState();
        final Date referenceDate = getCurrentDate();
        this.isSampleDataMode = true;
        // get metric and collect dates
        final Metric metric = this.metricDao.getByName(metricName);
        final List<Date> collectDates = this.metricsHelper.getPreviousCollectDateList(
            metric.getRecurringRule(), referenceDate, SAMPLE_DATA_PERIODS);
        this.status.setCurrentNumber(0);
        this.status.setTotalNumber(recordsNo);

        for (int index = 0; index < collectDates.size() - 1; index++) {
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOP_REQUESTED);
                this.status.setCurrentNumber(recordsNo);
                break;
            }
            final Date fromDate = collectDates.get(index);
            final Date toDate = collectDates.get(index + 1);
            collectMetricForPeriodAndGranularity(metric, fromDate, toDate, collectGroupBy);
        }
        if (!this.status.isStopRequested()) {
            this.status.setCurrentNumber(recordsNo);
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }

    /**
     * Delete sample data for metric and granularity.
     *
     * @param metricName metric name
     * @param collectGroupBy collect group by fields
     */
    public void deleteSampleData(final String metricName, final String collectGroupBy) {
        initPerRequestState();
        this.metricsHelper.deleteMetricValuesForGranularityAndDate(metricName, collectGroupBy, null,
            true);
    }

    /**
     * Run maintenance job - delete, archive metric trend values.
     *
     */
    public void runMaintenanceJob() {
        if (ContextStore.get().getProject().loadTableDef(DbConstants.AFM_METRIC_DEFINITIONS)
            .findFieldDef("values_remove_method") != null
                && ContextStore.get().getProject().loadTableDef(DbConstants.AFM_METRIC_DEFINITIONS)
                    .findFieldDef("values_remove_older_than") != null) {
            initPerRequestState();
            final String sqlMaintenanceRestriction =
                    "afm_metric_definitions.values_remove_method IN ( "
                            + SqlUtils.formatValueForSql(Constants.REMOVE_METHOD_ARCHIVE) + ", "
                            + SqlUtils.formatValueForSql(Constants.REMOVE_METHOD_DELETE) + ")";
            final List<Metric> metrics =
                    this.metricDao.getMetricsByRestriction(sqlMaintenanceRestriction);
            for (final Metric metric : metrics) {
                // update archive field values
                metric.setArchiveFields();
                final String removeMethod = metric.getValuesRemoveMethod();
                if (Constants.REMOVE_METHOD_ARCHIVE.equals(removeMethod)) {
                    this.metricsHelper.archiveMetricValues(metric.getName(),
                        metric.getValuesRemoveOlderThan());
                }
                this.metricsHelper.deleteMetricValues(metric.getName(),
                    metric.getValuesRemoveOlderThan());
            }
        }
    }

    /**
     * Copy metric handler. Copy metric definitions, assigned granularities and scorecards.
     *
     * @param sourceName source name
     * @param targetName target name
     * @param targetTitle target title
     */
    public void copyMetric(final String sourceName, final String targetName,
            final String targetTitle) {
        initPerRequestState();
        this.metricDao.copyMetric(sourceName, targetName, targetTitle);
    }

    /**
     * Collect data for given metric.
     *
     * @param metric metric object
     * @param fromDate start of collect period
     * @param toDate end of collect period
     * @param granularityId granularity code, optional
     */
    protected void collectMetricForPeriodAndGranularity(final Metric metric, final Date fromDate,
            final Date toDate, final String granularityId) {
        initPerRequestState();
        // load metric granularities
        final List<Granularity> granularities =
                this.granularityDao.getGranularitiesForMetric(metric.getName(), granularityId);

        final MetricValuesProvider provider =
                MetricValuesProviderLoader.loadProviderForMetric(metric, this.isSampleDataMode);
        for (final Granularity granularity : granularities) {
            try {
                if (this.status.isStopRequested()) {
                    this.status.setCode(JobStatus.JOB_STOP_REQUESTED);
                    this.status.setCurrentNumber(this.status.getTotalNumber());
                    break;
                }
                // get metric values
                final Map<String, Double> metricValues =
                        provider.getValues(granularity, fromDate, toDate);
                if (this.isScheduledMode || this.isSampleDataMode) {
                    // delete existing values for metric, granularity and date
                    this.metricsHelper.deleteMetricValuesForGranularityAndDate(metric.getName(),
                        granularity.getGroupByFields(), toDate, this.isSampleDataMode);
                    // save metric values for granularity
                    this.metricsHelper.saveMetricValuesForGranularityAndDate(metric, granularity,
                        toDate, metricValues, this.isSampleDataMode, this.status);
                }
                // check metric notifications
                final MetricNotificationHandler metricNotificationHandler =
                        new MetricNotificationHandler();
                metricNotificationHandler.evaluateNotificationsForMetric(metric, toDate);

            } catch (final ExceptionBase exceptionBase) {
                this.metricsHelper.handleError(exceptionBase, metric, granularity, toDate,
                    !this.isScheduledMode);
            }
        }
    }

    /**
     * Generate data for metric, start date and granularity.
     *
     * @param metricName metric name
     * @param startDate start date
     * @param granularityId granularity code
     */
    private void collectDataForMetricAndDate(final String metricName, final Date startDate,
            final String granularityId) {
        final Metric metric = this.metricDao.getByName(metricName);
        final Date currentDate = getCurrentDate();
        final List<Date> collectDates = this.metricsHelper
            .getCollectDateList(metric.getRecurringRule(), startDate, currentDate);
        this.isScheduledMode = true;
        for (final Date collectDate : collectDates) {
            final Date periodStartDate = this.metricsHelper
                .getCollectPeriodStartDate(metric.getRecurringRule(), collectDate, null);
            collectMetricForPeriodAndGranularity(metric, periodStartDate, collectDate,
                granularityId);
        }
    }

    /**
     * Initialize variables<br>
     * <li>default implementation of DAO objects if they are not set in Spring configuration.<br>
     * <li>initialize helper class
     *
     */
    private void initPerRequestState() {
        if (this.metricDao == null) {
            this.metricDao =
                    new MetricDataSource<Metric>("metric", DbConstants.AFM_METRIC_DEFINITIONS);
        }
        if (this.granularityDao == null) {
            this.granularityDao = new GranularityDataSource();
        }

        if (this.metricsHelper == null) {
            this.metricsHelper = new MetricsServiceHelper();
        }
        if (this.trendValuesLoader == null) {
            this.trendValuesLoader = new MetricServiceTrendValuesLoader();
        }
    }

    /**
     * Get current date without time.
     *
     * @return date object
     */
    private Date getCurrentDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

}
