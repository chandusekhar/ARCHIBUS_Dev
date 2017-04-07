var abSpAllocAllAreaSiteChartCtrl = abSpAllocAllTypeChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocAllAreaSiteChart;
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