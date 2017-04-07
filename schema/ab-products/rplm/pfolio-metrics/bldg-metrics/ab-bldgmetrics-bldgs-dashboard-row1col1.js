View.createController('abBldgMetricsBldgsDashboardRow1Col1_ctrl', {
	
	
	afterViewLoad:function(){
		//set a reference of the 'abBldgMetricsBldgsDashboardRow1Col1_report'  to the main container
		View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').row1col1_report = this.abBldgMetricsBldgsDashboardRow1Col1_report;
	}
});
