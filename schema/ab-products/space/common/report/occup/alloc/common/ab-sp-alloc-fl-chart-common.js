var abSpAllocFlChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "RTRIM(rm.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rm.fl_id)");
	}
})