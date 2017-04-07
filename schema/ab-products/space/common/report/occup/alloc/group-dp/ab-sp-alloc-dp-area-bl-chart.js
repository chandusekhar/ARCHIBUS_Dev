var abSpAllocDpAreaBlChartCtrl = abSpAllocBlChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocDpAreaBlChart; 
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	}

})