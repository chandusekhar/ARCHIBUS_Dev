package com.archibus.app.common.metrics.provider;

import java.util.*;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.dao.IMetricTrendValueDao;
import com.archibus.app.common.metrics.dao.datasource.MetricTrendValueDataSource;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.utility.*;

/**
 * Ratio metric values provider.
 *
 * @author Ioan Draghici
 * @since 21.2
 */
public class MetricValuesRatioProvider implements MetricValuesProvider {

    /**
     * Metric definition.
     */
    private Metric metric;

    /**
     * Numerator metric values.
     */
    private Map<String, Double> numeratorValues;

    /**
     * Denominator metric values.
     */
    private Map<String, Double> denominatorValues;

    /**
     * Trend value data source.
     */
    private IMetricTrendValueDao trendValueDao;

    /**
     * Zero value double.
     */
    private final Double zeroDouble = new Double("0");

    /**
     * Huge double value.
     */
    private final Double hugeDouble = new Double("9999999999");

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
        initPerRequestState();
        try {
            final Date numeratorCollectDate =
                    this.trendValueDao.getLastCollectDateForMetricAndGranularity(
                        this.metric.getNumerator(), granularity.getGroupByFields(), toDate, false);
            this.numeratorValues = getValuesForMetricGranularityAndDate(this.metric.getNumerator(),
                granularity.getGroupByFields(), numeratorCollectDate);
            final Date denominatorCollectDate = this.trendValueDao
                .getLastCollectDateForMetricAndGranularity(this.metric.getDenominator(),
                    granularity.getGroupByFields(), toDate, false);
            this.denominatorValues =
                    getValuesForMetricGranularityAndDate(this.metric.getDenominator(),
                        granularity.getGroupByFields(), denominatorCollectDate);
            return getMetricValues();
        } catch (final ExceptionBase originalException) {
            final ExceptionBase newException = ExceptionBaseFactory.newTranslatableException(
                Messages.ERROR_GENERIC_MESSAGE, new Object[] { this.metric.getTitle() });
            newException.setStackTrace(originalException.getStackTrace());
            throw newException;
        }
    }

    /**
     * Returns map with groupBy value and metric value for metric, granularity and date.
     *
     * @param metricId metric name
     * @param groupBy group by value
     * @param collectDate collect date
     * @return Map<String, Double>
     */
    private Map<String, Double> getValuesForMetricGranularityAndDate(final String metricId,
            final String groupBy, final Date collectDate) {
        final List<MetricTrendValue> values =
                this.trendValueDao.getValuesForGranularityAndDate(metricId, groupBy, collectDate);
        final Map<String, Double> result = new HashMap<String, Double>();
        for (final MetricTrendValue trendValue : values) {
            result.put(trendValue.getGroupByValue(), trendValue.getValue());
        }
        return result;
    }

    /**
     * Calculate metric values and populate the map.
     *
     * @return Map<String, Double>
     * @throws ExceptionBase exception
     */
    private Map<String, Double> getMetricValues() throws ExceptionBase {
        final Map<String, Double> result = new HashMap<String, Double>();
        Iterator<String> itGroupByValue = null;
        // iterate on numerator values
        itGroupByValue = this.numeratorValues.keySet().iterator();
        while (itGroupByValue.hasNext()) {
            final String groupByValue = itGroupByValue.next();
            if (!Constants.PORTFOLIO.equals(groupByValue) && !result.containsKey(groupByValue)) {
                final Double value = calculateMetricValue(groupByValue);
                result.put(groupByValue, value);
            }
        }
        // iterate on denominator and try to find unsaved group by values
        itGroupByValue = this.denominatorValues.keySet().iterator();
        while (itGroupByValue.hasNext()) {
            final String groupByValue = itGroupByValue.next();
            if (!Constants.PORTFOLIO.equals(groupByValue) && !result.containsKey(groupByValue)) {
                final Double value = calculateMetricValue(groupByValue);
                result.put(groupByValue, value);
            }
        }
        return result;
    }

    /**
     * Calculate ratio value for given group by value.
     *
     * @param groupByValue group by value
     * @return double
     */
    private Double calculateMetricValue(final String groupByValue) {
        Double numerator = this.numeratorValues.get(groupByValue);
        if (numerator == null) {
            numerator = this.zeroDouble;
        }
        Double denominator = this.denominatorValues.get(groupByValue);
        if (denominator == null || denominator.equals(this.zeroDouble)) {
            denominator = this.hugeDouble;
        }
        return numerator / denominator;
    }

    /**
     * Initialize DAO objects if they are set by Spring config.
     */
    private void initPerRequestState() {
        if (this.trendValueDao == null) {
            this.trendValueDao = new MetricTrendValueDataSource();
        }
    }
}
