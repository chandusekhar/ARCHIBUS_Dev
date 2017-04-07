var abSpAllocAllCountSiteChartCtrl = abSpAllocAllTypeChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocAllCountSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addSiteClauses(obj, restriction);
		this.addSpaceTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "bl.site_id");
		this.setAllTypeTitleSqlParameters();
	}
})