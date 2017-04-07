var abSpAllocDpCountSiteChartCtrl = abSpAllocSiteChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocDpCountSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
		this.addSiteClauses(obj, restriction);
	}

})