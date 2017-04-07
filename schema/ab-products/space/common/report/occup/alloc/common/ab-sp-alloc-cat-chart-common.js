var abSpAllocCatChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.rm_cat");
	}
})