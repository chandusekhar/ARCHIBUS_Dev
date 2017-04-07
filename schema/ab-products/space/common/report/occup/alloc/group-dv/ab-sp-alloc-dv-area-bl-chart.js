var abSpAllocDvAreaBlChartCtrl = abSpAllocBlChartCtrl.extend({

	initial: function(){
		this.chart =  this.abSpAllocDvAreaBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	}

})