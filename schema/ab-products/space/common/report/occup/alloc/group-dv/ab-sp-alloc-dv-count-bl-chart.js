var abSpAllocDvCountBlChartCtrl = abSpAllocBlChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocDvCountBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	}

})