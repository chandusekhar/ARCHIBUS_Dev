var abSpAllocCatCountFlChartCtrl = abSpAllocFlChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocCatCountFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addCategoryClauses(obj, restriction);
		this.addFloorClauses(obj, restriction);
	}

})