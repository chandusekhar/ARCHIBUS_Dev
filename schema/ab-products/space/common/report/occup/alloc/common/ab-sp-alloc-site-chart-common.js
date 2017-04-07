var abSpAllocSiteChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "bl.site_id");
	}
})