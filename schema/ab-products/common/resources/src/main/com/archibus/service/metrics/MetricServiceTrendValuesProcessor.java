package com.archibus.service.metrics;

import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.metrics.domain.*;
import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.context.*;
import com.archibus.model.config.*;
import com.archibus.utility.Utility;

/**
 * Processes data required to display the scorecard of metrics for specified scorecard and
 * granularity.
 * <p>
 *
 * @author Sergey Kuramshin
 * @since 21.2
 *
 */
public final class MetricServiceTrendValuesProcessor {

    /**
     * Separator in the previous values concatenated string.
     */
    private static final String PREVIOUS_VALUES_SEPARATOR = ";";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private MetricServiceTrendValuesProcessor() {
    }

    /**
     * Creates and populates the data transfer object for trend values.
     *
     * @param metric The metric definition.
     * @param granularity The metric granularity.
     * @param metricTrendValue The metric values.
     * @param forDrillDown True if the request is for metric drill-down values, e.g. per building.
     * @return JSONObject.
     */
    public static JSONObject createTrendValuesDto(final Metric metric,
            final Granularity granularity, final MetricTrendValue metricTrendValue,
            final boolean forDrillDown) {
        final JSONObject metricTrendValueDto = new JSONObject();
        metricTrendValueDto.put("metricName", metric.getName());
        metricTrendValueDto.put("metricTitle", metric.getTitle());
        metricTrendValueDto.put("description", metric.getDescription());
        metricTrendValueDto.put("businessImplication", metric.getBusinessImplication());
        metricTrendValueDto.put("assumptions", metric.getAssumptions());
        metricTrendValueDto.put("reportTrendDir", metric.getReportTrendDir());
        metricTrendValueDto.put("recurrence", new RecurringScheduleService()
        .getRecurringPatternDescription(metric.getRecurringRule()));

        if (metricTrendValue != null) {
            metricTrendValueDto.put("granularityValue", metricTrendValue.getGroupByValue());

            // Current and change values should be converted to user units/user currency and
            // formatted
            // as text using Numeric Format, Decimals, and Display Format properties.
            final Locale userLocale = ContextStore.get().getLocale();
            final Units baseUnits = ContextStore.get().getProject().getUnits();
            final User user = ContextStore.get().getUser();
            final CurrencyConversions currencyConversions =
                    ContextStore.get().getProject().getCurrencyConversions();
            final MetricTrendValueFormatter formatter =
                    new MetricTrendValueFormatter(metric, userLocale, user.getAreaUnits(),
                        new UnitsProperties(baseUnits, Measure.AREA), user.getUserCurrency(),
                        currencyConversions);
            {
                final double metricValue = metricTrendValue.getValue();
                final String formattedMetricValue = formatter.formatMetricValue(metricValue);
                metricTrendValueDto.put("metricValue", formattedMetricValue);
                metricTrendValueDto.put("metricValueRaw", metricValue);
            }
            {
                final String metricValueChange =
                        formatter.formatMetricValue(metricTrendValue.getValue()
                            - metricTrendValue.getLastValue());
                metricTrendValueDto.put("metricValueChange", metricValueChange);
            }
            {
                final String metricValueChangePerYear =
                        formatter.formatMetricValue(metricTrendValue.getValue()
                            - metricTrendValue.getLastYearValue());
                metricTrendValueDto.put("metricValueChangePerYear", metricValueChangePerYear);
            }

            // Previous values and report limit do not need to be converted or formatted because
            // they are only displayed graphically and relative to each other.
            metricTrendValueDto.put("metricPreviousValues",
                getPreviousValuesInReversedOrder(metricTrendValue));
            metricTrendValueDto.put("reportLimitTarget", metric.getReportLimitTarget());

            {
                final double reportLimitTarget = metric.getReportLimitTarget();
                double processVsTargetValue = metricTrendValue.getValue();
                if (processVsTargetValue != 0.0) {
                    processVsTargetValue =
                            (processVsTargetValue / reportLimitTarget)
                            * MetricTrendValueFormatter.FACTOR_100;
                }
                final String processVsTarget = formatter.formatDecimals(processVsTargetValue);
                metricTrendValueDto.put("processVsTarget", processVsTarget);
            }

            if (granularity != null) {
                metricTrendValueDto.put("drillDownView", granularity.getDrillDownView());
            }

            metricTrendValueDto.put("stoplightColor",
                metric.calculateStoplightColor(metricTrendValue.getValue(), forDrillDown)
                .toString());
        }
        return metricTrendValueDto;
    }

    /**
     * Returns previous values in reverse order, as required by the sparkline control.
     *
     * @param metricTrendValue The trend value.
     * @return The string containing concatenated values in reverse order.
     */
    private static String getPreviousValuesInReversedOrder(final MetricTrendValue metricTrendValue) {
        final List<String> previousValues =
                Utility.stringToList(metricTrendValue.getPreviousValues(),
                    PREVIOUS_VALUES_SEPARATOR);
        Collections.reverse(previousValues);

        return Utility
                .arrayToString(Utility.listToArray(previousValues), PREVIOUS_VALUES_SEPARATOR);
    }
}
