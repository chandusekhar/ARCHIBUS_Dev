var abSpAllocScatCountSiteChartCtrl = abSpAllocSiteChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocScatCountSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addSuperCategoryClauses(obj, restriction);
		this.addSiteClauses(obj, restriction);
	}

})