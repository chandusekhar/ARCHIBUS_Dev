
var abhdrclocationController =  View.createController("abhdrclocationController",{
	
	afterInitialDataFetch: function(){
		ABHDC_populateYearConsole("hactivity_logmonth","date_requested","selectYear","activity_type LIKE 'SERVICE DESK%'");
	},
	
	consolePanel_afterRefresh: function(){}
});

