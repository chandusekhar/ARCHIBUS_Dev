var abSpAllocCatAreaBlChartCtrl = abSpAllocBlChartCtrl.extend({

	initial: function(){
		this.chart =  this.abSpAllocCatAreaBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addCategoryClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	}

})