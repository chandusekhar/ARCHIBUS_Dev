var abSpAllocCatCountSiteChartCtrl = abSpAllocSiteChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocCatCountSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addCategoryClauses(obj, restriction);
		this.addSiteClauses(obj, restriction);
	}

})