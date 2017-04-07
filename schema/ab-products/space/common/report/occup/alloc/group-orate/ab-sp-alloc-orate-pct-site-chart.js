var abSpAllocOratePctSiteChartCtrl = abSpAllocOrateChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocOratePctSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addOccupancyRateClauses(obj, restriction);
		this.addSiteClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "bl.site_id");
		this.setOccupancyRateTitleSqlParameters();
	}
})