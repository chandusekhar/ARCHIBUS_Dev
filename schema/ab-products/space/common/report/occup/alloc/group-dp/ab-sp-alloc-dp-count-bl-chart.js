var abSpAllocDpCountBlChartCtrl = abSpAllocBlChartCtrl.extend({

	initial: function(){
		this.chart =  this.abSpAllocDpCountBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	}

})