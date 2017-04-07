package com.archibus.app.common.metrics.dao;

import java.util.List;

import com.archibus.core.dao.IDao;

/**
 * DAO for Metric. Interface to be implemented by MetricDataSource.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 * @param <Metric> type of the persistent object
 */

public interface IMetricDao<Metric> extends IDao<Metric> {

    /**
     * Load all metrics that are active and tested.
     *
     * @return list of metrics
     */
    List<Metric> getActiveMetrics();

    /**
     * Load active metric (if given metric is ratio metric load numerator and denominator first).
     *
     * @param metricName metric name
     * @return list of metrics
     */
    List<Metric> getActiveMetrics(final String metricName);

    /**
     * Load active metrics filtered by metric name and client restriction.
     *
     * @param metricName metric name
     * @param clientRestriction restriction type sql
     * @return List<Metric>
     */
    List<Metric> getActiveMetricsByRestriction(final String metricName,
            final String clientRestriction);

    /**
     * Load active metrics filtered by client restriction.
     *
     * @param clientRestriction restriction type sql
     * @return List<Metric>
     */
    List<Metric> getActiveMetricsByRestriction(final String clientRestriction);

    /**
     * Load active metrics filtered by client restriction.
     *
     * @param clientRestriction restriction type sql
     * @return List<Metric>
     */
    List<Metric> getMetricsByRestriction(final String clientRestriction);

    /**
     * Load metric for given metric name.
     *
     * @param name metric code
     * @return metric object
     */
    Metric getByName(final String name);

    /**
     * Copy metric data, assigned granularities and scorecards.
     *
     * @param sourceName source name
     * @param targetName target name
     * @param targetTitle target title
     */
    void copyMetric(final String sourceName, final String targetName, final String targetTitle);

}
