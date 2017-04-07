var abSpAllocDvCountFlChartCtrl = abSpAllocFlChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocDvCountFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addFloorClauses(obj, restriction);
	}

})