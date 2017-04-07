var abSpAllocDvAreaSiteChartCtrl = abSpAllocSiteChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocDvAreaSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addSiteClauses(obj, restriction);
	}
})