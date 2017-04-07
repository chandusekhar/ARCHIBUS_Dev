View.createController('abBldgMetricsOrgsDashboardRow1Col1_ctrl', {
	
	
	afterViewLoad:function(){
		//set a reference of the 'abBldgMetricsBldgsDashboardRow1Col1_report'  to the main container
		View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').row1col1_report = this.abBldgMetricsOrgsDashboardRow1Col1_report;
	}
});
