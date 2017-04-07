package com.archibus.service.metrics;

import java.util.*;

import com.archibus.app.common.metrics.Constants;
import com.archibus.app.common.metrics.dao.datasource.MetricNotificationDataSource;
import com.archibus.app.common.metrics.domain.Metric;
import com.archibus.app.common.notification.domain.NotificationTemplate;
import com.archibus.datasource.SqlUtils;
import com.archibus.utility.StringUtil;

/**
 *
 * Metric notifications.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class MetricNotificationHandler {

    /**
     * Trigger condition formula.
     */
    private static Map<String, String> triggerConditionFormula = new HashMap<String, String>();
    static {
        triggerConditionFormula.put("limit_high_warning",
                "${value} >= ${afm_metric_definitions.report_limit_high_warn}");
        triggerConditionFormula.put("limit_high_critical",
                "${value} >= ${afm_metric_definitions.report_limit_high_crit}");
        triggerConditionFormula.put("limit_low_warning",
                "${value} <= ${afm_metric_definitions.report_limit_low_warn}");
        triggerConditionFormula.put("limit_low_critical",
                "${value} <= ${afm_metric_definitions.report_limit_low_crit}");
        triggerConditionFormula
        .put(
            "limit_low_high_warning",
                "(${value} <= ${afm_metric_definitions.report_limit_low_warn} OR ${value} >= ${afm_metric_definitions.report_limit_high_warn})");
        triggerConditionFormula
        .put(
            "limit_low_high_critical",
                "(${value} <= ${afm_metric_definitions.report_limit_low_crit} OR ${value} >= ${afm_metric_definitions.report_limit_high_crit})");
        triggerConditionFormula.put("limit_low_target",
                "${value} <= ${afm_metric_definitions.report_limit_target}");
        triggerConditionFormula.put("limit_high_target",
                "${value} >= ${afm_metric_definitions.report_limit_target}");
    }

    /**
     * Add notifications for given metric if are defined and verify trigger condition.
     *
     * @param metric metric object
     * @param collectDate metric collect date
     */
    public void evaluateNotificationsForMetric(final Metric metric, final Date collectDate) {

        final MetricNotificationDataSource metricNotificationDataSource =
                new MetricNotificationDataSource();
        final List<NotificationTemplate> templates =
                metricNotificationDataSource.getNotificationTemplatesForMetric(metric.getName());
        for (final NotificationTemplate template : templates) {
            evaluateNotificationForMetric(template, metric, collectDate);
        }
    }

    /**
     * Check notification template for metric and collect date. Add notifications if required
     *
     * @param template notification template
     * @param metric metric
     * @param collectDate collect date
     */
    public void evaluateNotificationForMetric(final NotificationTemplate template,
            final Metric metric, final Date collectDate) {
        final List<String> groupByList = getCollectGroupBy(template.getMetricCollectGroupBy());
        final String triggerSqlFormula =
                getTriggerFormula(template.getTriggerConditionTo(), metric);
        for (final String groupBy : groupByList) {
            evaluateNotificationForMetricAndGroupBy(template, metric, collectDate, groupBy,
                triggerSqlFormula);
        }
    }

    /**
     * Check notification template for metric, collect date and group by. Add notifications if
     * required
     *
     * @param template notification template
     * @param metric metric
     * @param collectDate collect date
     * @param groupBy group by
     * @param triggerFormula sql trigger formula
     *
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #2: Statement with INSERT ... SELECT pattern.
     *
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void evaluateNotificationForMetricAndGroupBy(final NotificationTemplate template,
            final Metric metric, final Date collectDate,
            final String groupBy, final String triggerFormula) {
        
        final String sqlStatement =
                "INSERT INTO notifications (notify_type, template_id, is_active, metric_value_id) "
                        + "SELECT 'Email', "
                        + SqlUtils.formatValueForSql(template.getId())
                        + ", 1, afm_metric_trend_values.auto_number FROM afm_metric_trend_values WHERE metric_name = "
                        + SqlUtils.formatValueForSql(metric.getName()) + " AND collect_group_by = "
                        + SqlUtils.formatValueForSql(groupBy) + " AND metric_date = "
                        + SqlUtils.formatValueForSql(collectDate) + " AND " + triggerFormula;
        SqlUtils.executeUpdate("notifications", sqlStatement);
    }

    /**
     * Returns formatted trigger formula.
     *
     * @param triggerConditionTo trigger condition to
     * @param metric metric object
     * @return string
     */
    private String getTriggerFormula(final String triggerConditionTo, final Metric metric) {
        String triggerSqlFormula = triggerConditionFormula.get(triggerConditionTo);
        // replace ${value}
        triggerSqlFormula =
                triggerSqlFormula.replace("${value}", "afm_metric_trend_values.metric_value");
        // ${afm_metric_definitions.report_limit_high_warn}
        Double value = metric.getReportLimitHighWarning();
        if (StringUtil.notNullOrEmpty(value)) {
            triggerSqlFormula =
                    triggerSqlFormula.replace("${afm_metric_definitions.report_limit_high_warn}",
                        SqlUtils.formatValueForSql(value));
        }
        // ${afm_metric_definitions.report_limit_low_warn}
        value = metric.getReportLimitLowWarning();
        if (StringUtil.notNullOrEmpty(value)) {
            triggerSqlFormula =
                    triggerSqlFormula.replace("${afm_metric_definitions.report_limit_low_warn}",
                        SqlUtils.formatValueForSql(value));
        }
        // ${afm_metric_definitions.report_limit_high_crit}
        value = metric.getReportLimitHighCritical();
        if (StringUtil.notNullOrEmpty(value)) {
            triggerSqlFormula =
                    triggerSqlFormula.replace("${afm_metric_definitions.report_limit_high_crit}",
                        SqlUtils.formatValueForSql(value));
        }
        // ${afm_metric_definitions.report_limit_low_crit}
        value = metric.getReportLimitLowCritical();
        if (StringUtil.notNullOrEmpty(value)) {
            triggerSqlFormula =
                    triggerSqlFormula.replace("${afm_metric_definitions.report_limit_low_crit}",
                        SqlUtils.formatValueForSql(value));
        }
        // ${afm_metric_definitions.report_limit_target}
        value = metric.getReportLimitTarget();
        if (StringUtil.notNullOrEmpty(value)) {
            triggerSqlFormula =
                    triggerSqlFormula.replace("${afm_metric_definitions.report_limit_target}",
                        SqlUtils.formatValueForSql(value));
        }
        return triggerSqlFormula;
    }

    /**
     * Returns assigned group by.
     *
     * @param collectGroupBy collect group by
     * @return List<String>
     */
    private List<String> getCollectGroupBy(final String collectGroupBy) {
        List<String> result = new ArrayList<String>();
        if (StringUtil.notNullOrEmpty(collectGroupBy)) {
            final String[] collectGroups = collectGroupBy.split(Constants.COMMA);
            result = Arrays.asList(collectGroups);
        }
        return result;
    }

}
