
View.createController('metricTest', {

    scorecards_onClickItem: function(row) {
        var scorecardCode = row.getFieldValue('afm_metric_scard_defs.scorecard_code');
        try {
            var result = Workflow.callMethod('AbCommonResources-MetricsService-getTrendValuesForScorecard', scorecardCode, 'all');
            View.showMessage('message', result.data);
        } catch (e) {
            Workflow.handleError(e);
        }
    },

    metrics_onClickItem: function(row) {
        var metricName = row.getFieldValue('afm_metric_definitions.metric_name');
        try {
            var result = Workflow.callMethod('AbCommonResources-MetricsService-getTrendValuesForMetric', metricName, 'bl_id', 'desc');
            View.showMessage('message', result.data);
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});