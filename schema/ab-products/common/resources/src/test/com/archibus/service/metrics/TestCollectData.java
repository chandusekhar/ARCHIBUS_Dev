package com.archibus.service.metrics;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.metrics.DbConstants;
import com.archibus.app.common.metrics.dao.*;
import com.archibus.app.common.metrics.dao.datasource.*;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.datasource.*;
import com.archibus.utility.ExceptionBase;

/**
 * Provide methods to test collect data WFR fro different metric types.
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public class TestCollectData extends DataSourceTestBase {
    /**
     * Constant.
     */
    private static final String SCHEDULED_MODE = "scheduled";

    /**
     * Constant.
     */
    private static final String MESSAGE_MODE = "message";

    /**
     * Logger.
     */
    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * Test track inventory metric.
     */
    public void testTrackInventoryMetric() {
        final Date systemDate = getCurrentDate();
        final String metricName = "spac_RentableArea";
        // collect metric for portfolio wide.
        final String collectGroupBy = "all";

        // collect metric for granularity By Building Use
        // collectGroupBy = "use1";

        // collect metric for granularity By Site
        // collectGroupBy = "site_id";

        final Metric metric = getMetricByName(metricName);
        final Date periodEndDate = getCollectEndDate(metric.getRecurringRule(), systemDate);
        final Date periodStartDate = getCollectStartDate(metric.getRecurringRule(), periodEndDate);
        final MetricsService metricsService = new MetricsService();
        metricsService.setJobRunMode(SCHEDULED_MODE);
        try {
            metricsService.collectMetricForPeriodAndGranularity(metric, periodStartDate,
                periodEndDate, collectGroupBy);
            SqlUtils.commit();
        } catch (final ExceptionBase exceptionBase) {
            // rollback
            SqlUtils.rollback();
        }

        final List<MetricTrendValue> metricTrendValues =
                getTrendValues(metricName, collectGroupBy, periodEndDate);
        this.log.debug(listToString(metricTrendValues));
        assertNotNull("Metric values : ", listToString(metricTrendValues));

    }

    /**
     * Test metric on transaction table.
     */
    public void testTransactionTableMetric() {
        final Date systemDate = getCurrentDate();
        final String metricName = "leas_Costs-Rent";
        // collect metric for portfolio wide.
        final String collectGroupBy = "all";

        // collect metric for granularity By Building
        // collectGroupBy = "bl_id";

        // collect metric for granularity By Business Unit
        // collectGroupBy = "bu_id";

        final Metric metric = getMetricByName(metricName);
        final Date periodEndDate = getCollectEndDate(metric.getRecurringRule(), systemDate);
        final Date periodStartDate = getCollectStartDate(metric.getRecurringRule(), periodEndDate);
        final MetricsService metricsService = new MetricsService();
        metricsService.setJobRunMode(SCHEDULED_MODE);
        try {
            metricsService.collectMetricForPeriodAndGranularity(metric, periodStartDate,
                periodEndDate, collectGroupBy);
            SqlUtils.commit();
        } catch (final ExceptionBase exceptionBase) {
            // rollback
            SqlUtils.rollback();
        }

        final List<MetricTrendValue> metricTrendValues =
                getTrendValues(metricName, collectGroupBy, periodEndDate);
        this.log.debug(listToString(metricTrendValues));
        assertNotNull("Metric values : ", listToString(metricTrendValues));
    }

    /**
     * Test method for metric with import value WFR.
     */
    public void testImportValuesMetric() {
        final Date systemDate = getCurrentDate();
        final String metricName = "repm_test_import";
        final String collectGroupBy = "bl_id";
        final Metric metric = getMetricByName(metricName);
        final Date periodEndDate = getCollectEndDate(metric.getRecurringRule(), systemDate);
        final Date periodStartDate = getCollectStartDate(metric.getRecurringRule(), periodEndDate);
        final MetricsService metricsService = new MetricsService();
        metricsService.setJobRunMode(SCHEDULED_MODE);
        try {
            metricsService.collectMetricForPeriodAndGranularity(metric, periodStartDate,
                periodEndDate, collectGroupBy);
            SqlUtils.commit();
        } catch (final ExceptionBase exceptionBase) {
            // rollback
            SqlUtils.rollback();
        }

        final List<MetricTrendValue> metricTrendValues =
                getTrendValues(metricName, collectGroupBy, periodEndDate);
        this.log.debug(listToString(metricTrendValues));
        assertNotNull("Metric values : ", listToString(metricTrendValues));
    }

    /**
     * Load metric.
     *
     * @param metricName metric name
     * @return object
     */
    private Metric getMetricByName(final String metricName) {
        final IMetricDao<Metric> metricDao =
                new MetricDataSource<Metric>("metric", DbConstants.AFM_METRIC_DEFINITIONS);
        return metricDao.getByName(metricName);
    }

    /**
     * Load trend values for metric , granularity and collect date.
     *
     * @param metricName metric name
     * @param collectGroupBy collect group by
     * @param collectDate collect date
     * @return records list
     */
    private List<MetricTrendValue> getTrendValues(final String metricName,
            final String collectGroupBy, final Date collectDate) {
        final IMetricTrendValueDao metricTrendValueDao = new MetricTrendValueDataSource();
        return metricTrendValueDao.getValuesForGranularityAndDate(metricName, collectGroupBy,
            collectDate);
    }

    /**
     * Get collect period start date.
     *
     * @param recurringRule recurring rule
     * @param collectEndDate reference date
     * @return date
     */
    private Date getCollectStartDate(final String recurringRule, final Date collectEndDate) {
        final RecurringScheduleService recurringScheduleService = new RecurringScheduleService();
        recurringScheduleService.setSchedulingLimits(-1, -1, -1, -1);
        return recurringScheduleService.getPeriodStartDate(recurringRule, collectEndDate);
    }

    /**
     * Get first collect date after reference date.
     *
     * @param recurringRule recurring rule
     * @param refDate collect period start date
     * @return date
     */
    private Date getCollectEndDate(final String recurringRule, final Date refDate) {
        Date result = null;
        final List<Date> dates = getCollectDates(recurringRule, refDate);
        if (!dates.isEmpty()) {
            result = dates.get(0);
        }
        return result;
    }

    /**
     * Get collect dates.
     *
     * @param recurringRule recurring rule
     * @param refDate reference date
     * @return dates
     */
    private List<Date> getCollectDates(final String recurringRule, final Date refDate) {
        final RecurringScheduleService recurringScheduleService = new RecurringScheduleService();
        recurringScheduleService.setSchedulingLimits(-1, -1, -1, -1);
        final List<Date> dates =
                recurringScheduleService.getDatesList(refDate, null, recurringRule);
        return dates;
    }

    /**
     * Returns list converted to string.
     *
     * @param list list object
     * @return string
     */
    private String listToString(final List<?> list) {
        final String pattern = "[ %s ]";
        String objects = "";
        for (final Object element : list) {
            objects += String.format(pattern, element.toString());
        }
        return String.format(pattern, objects);
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

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "metricBeans.xml" };
    }
}
