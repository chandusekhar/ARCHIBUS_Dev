var abSpAllocScatCountFlChartCtrl = abSpAllocFlChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocScatCountFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addSuperCategoryClauses(obj, restriction);
		this.addFloorClauses(obj, restriction);
	}

})