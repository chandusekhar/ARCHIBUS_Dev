var abhdreportacController =  View.createController("abhdreportacController",{
	afterInitialDataFetch: function(){
		ABHDC_populateYearConsole("hactivity_log","date_requested","selectYear","activity_type LIKE 'SERVICE DESK%'");
	}
});

