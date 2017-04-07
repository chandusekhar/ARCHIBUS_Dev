
var abhdcrrtController =  View.createController("abhdcrrtController",{
	
	afterInitialDataFetch: function(){
		ABHDC_populateYearConsole("activity_logview","date_requested","selectYear","activity_type LIKE 'SERVICE DESK%'");
	},
	
	consolePanel_afterRefresh: function(){}
});