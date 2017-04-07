var abhdcrdvdpController =  View.createController("abhdcrdvdpController",{
	
	afterInitialDataFetch: function(){
		ABHDC_populateYearConsole("activity_logview","date_requested","selectYear","activity_type LIKE 'SERVICE DESK%'");
	},
	
	consolePanel_afterRefresh: function(){}
});
