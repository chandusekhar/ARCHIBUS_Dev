var abSpAllocCatAreaSiteChartCtrl = abSpAllocSiteChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocCatAreaSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addCategoryClauses(obj, restriction);
		this.addSiteClauses(obj, restriction);
	}
})