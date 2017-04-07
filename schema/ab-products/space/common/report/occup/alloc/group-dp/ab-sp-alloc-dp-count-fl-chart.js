var abSpAllocDpCountFlChartCtrl = abSpAllocFlChartCtrl.extend({

	initial: function(){
		this.chart =  this.abSpAllocDpCountFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
		this.addFloorClauses(obj, restriction);
	}

})