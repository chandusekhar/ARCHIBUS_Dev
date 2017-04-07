var abSpAllocBlChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.bl_id");
	}
})