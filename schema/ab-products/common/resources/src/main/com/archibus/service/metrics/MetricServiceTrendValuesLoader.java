package com.archibus.service.metrics;

import java.util.List;

import org.json.*;

import com.archibus.app.common.metrics.DbConstants;
import com.archibus.app.common.metrics.dao.*;
import com.archibus.app.common.metrics.dao.datasource.*;
import com.archibus.app.common.metrics.domain.*;

/**
 * Loads metric trend values for a scorecard or a metric.
 * <p>
 *
 * @author Sergey Kuramshin
 * @since 21.2
 *
 */
public class MetricServiceTrendValuesLoader {

    /**
     * Scorecard assignment data source.
     */
    private IScorecardDao scorecardDao;

    /**
     * Metric data source.
     */
    private IMetricDao<Metric> metricDao;

    /**
     * Granularity data source.
     */
    private IGranularityDao granularityDao;

    /**
     * Trend value data source.
     */
    private IMetricTrendValueDao trendValueDao;

    /**
     * Constructor.
     *
     */
    public MetricServiceTrendValuesLoader() {
        initPerRequestState();
    }

    /**
     * Loads metric trend values required to display the scorecard of metrics for specified
     * scorecard and granularity.
     *
     * @param scorecardName The scorecard name.
     * @param granularityName The granularity name.
     * @return JSONArray<JSONObject> A JSON array containing one object per metric with granularity
     *         totals.
     */
    public JSONArray getTrendValuesForScorecard(final String scorecardName,
            final String granularityName) {
        final JSONArray metricTrendValuesDto = new JSONArray();

        // get all metric assignments for this scorecard
        final List<Scorecard> scorecardAssignments =
                this.scorecardDao.getScorecardAssignments(scorecardName);
        for (final Scorecard scorecardAssignment : scorecardAssignments) {
            final Metric metric = this.metricDao.getByName(scorecardAssignment.getMetricName());
            final List<Granularity> granularities = this.granularityDao
                .getGranularitiesForMetric(scorecardAssignment.getMetricName(), granularityName);
            Granularity granularity = null;
            if (!granularities.isEmpty()) {
                granularity = granularities.get(0);
            }

            // get total metric trend values for granularity
            // pass Constants.PORTFOLIO as the granularity value.
            final MetricTrendValue metricTrendValue =
                    this.trendValueDao.getLastValue(metric.getName(), granularityName);

            final JSONObject metricTrendValueDto = MetricServiceTrendValuesProcessor
                .createTrendValuesDto(metric, granularity, metricTrendValue, false);
            metricTrendValuesDto.put(metricTrendValueDto);
        }

        return metricTrendValuesDto;
    }

    /**
     * Loads metric trend values required to display the drill-down chart for specified metric and
     * granularity.
     *
     * @param metricName The metric name.
     * @param granularityName The granularity name.
     * @param sortOrder The sort order to sort records by trend value, either "asc" or "desc".
     * @return JSONArray<JSONObject> A JSON array containing one object per granularity value.
     */
    public JSONArray getTrendValuesForMetric(final String metricName, final String granularityName,
            final String sortOrder) {
        final JSONArray metricTrendValuesDto = new JSONArray();

        final Metric metric = this.metricDao.getByName(metricName);
        final List<Granularity> granularities =
                this.granularityDao.getGranularitiesForMetric(metricName, granularityName);
        Granularity granularity = null;
        if (!granularities.isEmpty()) {
            granularity = granularities.get(0);
        }

        // get metric trend values from all values of the granularity
        final List<MetricTrendValue> metricTrendValues =
                this.trendValueDao.getLastValues(metric.getName(), granularityName, sortOrder);
        for (final MetricTrendValue metricTrendValue : metricTrendValues) {
            final JSONObject metricTrendValueDto = MetricServiceTrendValuesProcessor
                .createTrendValuesDto(metric, granularity, metricTrendValue, true);

            metricTrendValuesDto.put(metricTrendValueDto);
        }

        return metricTrendValuesDto;
    }

    /**
     * Initialize default implementations of DAO objects if they are not set in Spring
     * configuration.
     *
     */
    private void initPerRequestState() {
        if (this.metricDao == null) {
            this.metricDao =
                    new MetricDataSource<Metric>("metric", DbConstants.AFM_METRIC_DEFINITIONS);
        }
        if (this.scorecardDao == null) {
            this.scorecardDao = new ScorecardDataSource();
        }
        if (this.granularityDao == null) {
            this.granularityDao = new GranularityDataSource();
        }
        if (this.trendValueDao == null) {
            this.trendValueDao = new MetricTrendValueDataSource();
        }
    }
}
