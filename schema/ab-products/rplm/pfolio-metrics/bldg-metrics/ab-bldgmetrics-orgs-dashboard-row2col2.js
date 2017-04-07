View.createController('abBldgMetricsOrgsDashboardRow2Col2_ctrl',{
	
	afterViewLoad:function(){

		//set a reference of the Chart to the main container
		View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').row2col2_chart = this.costCheargeble_chart;
	}
	
});
