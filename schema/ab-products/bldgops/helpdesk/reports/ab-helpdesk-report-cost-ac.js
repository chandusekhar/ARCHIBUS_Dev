

var abhdrcacController =  View.createController("abhdrcacController",{
	afterInitialDataFetch: function(){
		ABHDC_populateYearConsole("hactivity_logmonth","date_requested","selectYear","activity_type LIKE 'SERVICE DESK%'");
	}
});