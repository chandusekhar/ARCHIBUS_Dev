var abSpMetricOratePctSiteChartCtrl = abSpAllocOrateChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricOratePctSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addOccupancyRateClauses(obj, restriction);
		this.addSiteClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "bl.site_id");
		this.chart.addParameter('excludeVacant',	getMessage("vacantText"));
		this.setOccupancyRateTitleSqlParameters();
	}
})