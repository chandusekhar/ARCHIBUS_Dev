
var abhdrslavdpController =  View.createController("abhdrslavdpController",{
	afterInitialDataFetch: function(){
		ABHDC_populateYearConsole("hactivity_log","date_requested","selectYear","activity_type LIKE 'SERVICE DESK%'");
	}
});