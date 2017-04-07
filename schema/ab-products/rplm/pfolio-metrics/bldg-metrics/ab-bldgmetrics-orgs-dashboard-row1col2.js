View.createController('abBldgMetricsOrgsDashboardRow1Col2_ctrl',{

	afterViewLoad:function(){
					
		//set a reference of the Chart to the main container
		View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').row1col2_chart = this.emHeadcount_chart;	
	}
	
});
