var ttAvailRptController = View.createController('ttAvailRptController', {
	otherRes: ' 1=1 ',
	clickedDate: '',
	dateField: 'wrtt.date_assigned',

	afterInitialDataFetch:function(){
		this.fillQueryDateRange();
	},
	/**
	 * Search by console
	 */
    abBldgopsReportTtAvailConsole_onFilter: function(){
		var console = this.abBldgopsReportTtAvailConsole;
		var crossTable = this.abBldgopsReportTtAvailReport;
		//Call two common method to generate restriction string from console fields and given destination restrcition fields
		var dateRes =  getRestrictionStrOfDateRange( console, "wrtt.date_assigned");
        crossTable.addParameter('dateRes', " 1=1 " + dateRes.replace(/wrtt.date_assigned/g, "afm_cal_dates.cal_date"));
        crossTable.refresh();
        crossTable.show(true);
		this.otherRes = ' 1=1 '+ dateRes;
    },
	/**
	 * Clear restriction of console
	 */
    abBldgopsReportTtAvailConsole_onClear: function(){
		clearConsole(this,this.abBldgopsReportTtAvailConsole);
		this.fillQueryDateRange();
        this.abBldgopsReportTtAvailReport.show(false);
    },

	 showChart: function(dateValue){
		this.clickedDate =dateValue;
        View.openDialog('ab-bldgops-report-tt-avail-cht.axvw', null, false, {width:800, height:800});
    },
    
    fillQueryDateRange: function() {
    	var currentDate = getCurrentDate();
		this.abBldgopsReportTtAvailConsole.setFieldValue("wrtt.date_assigned.from", currentDate);
		this.abBldgopsReportTtAvailConsole.setFieldValue("wrtt.date_assigned.to", fixedFromDate_toToDate(currentDate,13));
    }
})

function onReportClick(obj){
	onAvailabilityCrossTableClick(obj, ttAvailRptController, View.panels.get('abBldgopsReportTtAvailGrid'),  "wrtt.tool_type", "wrtt.date_assigned",true);
}
