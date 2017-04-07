var abSpAllocOpCountSiteChartCtrl = abSpAllocOpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocOpCountSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addSiteClauses(obj, restriction);
		this.addOccupancyTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "bl.site_id");
		this.setOccupancyTitleSqlParameters();
	}
})