BEGIN EXECUTE IMMEDIATE 'DROP INDEX afm_metric_trend_values_scard'; EXCEPTION WHEN OTHERS THEN null;END;;

CREATE INDEX afm_metric_trend_values_scard ON afm_metric_trend_values (metric_date, collect_group_by);