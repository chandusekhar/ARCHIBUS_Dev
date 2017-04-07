var abSpAllocDvCountSiteChartCtrl = abSpAllocSiteChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocDvCountSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addSiteClauses(obj, restriction);
	}

})