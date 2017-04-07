var abSpMetricDpChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "RTRIM(rm.dv_id)${sql.concat}' - '${sql.concat}RTRIM(rm.dp_id)");
	}
})