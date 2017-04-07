var abSpMetricDpAreaDpChartCtrl = abSpMetricDpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricDpAreaDpChart; 
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
	}

})