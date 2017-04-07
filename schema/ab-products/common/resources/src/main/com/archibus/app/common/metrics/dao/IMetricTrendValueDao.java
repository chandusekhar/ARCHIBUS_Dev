package com.archibus.app.common.metrics.dao;

import java.util.*;

import com.archibus.app.common.metrics.domain.MetricTrendValue;
import com.archibus.core.dao.IDao;

/**
 *
 * DAO for TrendValue. Interface to be implemented by TrendValueDataSource.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
public interface IMetricTrendValueDao extends IDao<MetricTrendValue> {

    /**
     * Load metric trend values for metric, granularity and granularity value.
     *
     * @param metricId metric code
     * @param groupBy granularity code
     * @param groupByValue granularity value
     * @return List<TrendValue> object
     */
    List<MetricTrendValue> getValues(final String metricId, final String groupBy,
        final String groupByValue);

    /**
     * Load last <maxRecord> metric trend values for metric, granularity and granularity value.
     *
     * @param metricId metric code
     * @param groupBy granularity code
     * @param groupByValue granularity value
     * @param maxRecords records number
     * @return List<TrendValue> object
     */
    List<MetricTrendValue> getValues(final String metricId, final String groupBy,
        final String groupByValue, final int maxRecords);

    /**
     * Load metric trend values for granularity and collect date.
     *
     * @param metricId metric code
     * @param groupBy granularity code
     * @param collectDate collect date
     * @return List<TrendValue> object
     */
    List<MetricTrendValue> getValuesForGranularityAndDate(final String metricId,
        final String groupBy, final Date collectDate);

    /**
     * Return last metric trend value set for metric and granularity.
     *
     * @param metricId metric code
     * @param groupBy granularity code
     * @param sortOrder The sort order to sort records by trend value, either "asc" or "desc".
     * @return List<TrendValue> object
     */
    List<MetricTrendValue> getLastValues(final String metricId, final String groupBy,
        final String sortOrder);

    /**
     * Get last metric trend values for metric, granularity and granularity value.
     *
     * @param metricId metric code
     * @param groupBy granularity code
     * @return trend value object
     */
    MetricTrendValue getLastValue(final String metricId, final String groupBy);

    /**
     * Get trend value for metric, group by, group by value and date.
     *
     * @param metricId metric code
     * @param groupBy granularity code
     * @param groupByValue granularity value
     * @param collectDate current collect date
     * @return double
     */
    MetricTrendValue getValue(final String metricId, final String groupBy,
            final String groupByValue, final Date collectDate);

    /**
     * Delete metric values for granularity and collect date.
     *
     * @param metricId metric name
     * @param groupBy granularity code
     * @param collectDate collect date
     * @param isSampleData if is sample data or not
     */
    void deleteMetricValuesForGranularityAndDate(final String metricId, final String groupBy,
            final Date collectDate, final boolean isSampleData);

    /**
     * Get last collect date for metric and granularity.
     *
     * @param metricId metric name
     * @param groupBy granularity code
     * @param collectDate collect date
     * @param isSampleData if is sample data or not
     * @return Date
     */
    Date getLastCollectDateForMetricAndGranularity(final String metricId, final String groupBy,
            final Date collectDate, final boolean isSampleData);
}
