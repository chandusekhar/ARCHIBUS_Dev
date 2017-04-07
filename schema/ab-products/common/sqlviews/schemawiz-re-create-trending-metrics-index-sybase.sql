IF EXISTS (SELECT 1 FROM sysindex where index_name='afm_metrics_trending_values_scorecard') DROP INDEX afm_metric_trend_values.afm_metrics_trending_values_scorecard;

CREATE INDEX afm_metrics_trending_values_scorecard ON afm_metric_trend_values (metric_date, collect_group_by);