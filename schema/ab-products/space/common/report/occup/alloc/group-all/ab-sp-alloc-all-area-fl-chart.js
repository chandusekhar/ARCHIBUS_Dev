var abSpAllocAllAreaFlChartCtrl = abSpAllocAllTypeChartCtrl.extend({

	/**
  * This function is called by base controller inside event handler afterViewLoad. 
  */
	initial: function(){
		this.chart = this.abSpAllocAllAreaFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addFloorClauses(obj, restriction);
		this.addSpaceTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "RTRIM(rm.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rm.fl_id)");
		this.setAllTypeTitleSqlParameters();
	}

})