var abSpAllocScatAreaBlChartCtrl = abSpAllocBlChartCtrl.extend({

	initial: function(){
		this.chart =  this.abSpAllocScatAreaBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addSuperCategoryClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	}

})