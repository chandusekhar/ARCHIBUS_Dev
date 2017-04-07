var abSpAllocCatCountBlChartCtrl = abSpAllocBlChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocCatCountBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addCategoryClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	}

})