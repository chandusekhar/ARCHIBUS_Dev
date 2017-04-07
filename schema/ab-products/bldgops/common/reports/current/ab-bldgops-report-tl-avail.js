var tlAvailRptController = View.createController('tlAvailRptController', {
	otherRes: ' 1=1 ',
	fieldsArraysForRestriction: new Array( ['tl.bl_id'], ['tl.fl_id'], ['tl.tool_type']),
	clickedDate: '',
	dateField: 'wrtl.date_assigned',
	
	afterInitialDataFetch:function(){
		this.fillQueryDateRange();
	},

	/**
	 * Search by console
	 */
    abBldgopsReportTlAvailConsole_onFilter: function(){
		var console = this.abBldgopsReportTlAvailConsole;
		var crossTable = this.abBldgopsReportTlAvailReport;
		//Call two common method to generate restriction string from console fields and given destination restrcition fields
		this.otherRes = getRestrictionStrFromConsole( console, this.fieldsArraysForRestriction); 
		var dateRes =  getRestrictionStrOfDateRange( console, "wrtl.date_assigned");
        crossTable.addParameter('dateRes', " 1=1 " + dateRes.replace(/wrtl.date_assigned/g, "afm_cal_dates.cal_date"));
        crossTable.addParameter('tlRes',  this.otherRes);
        crossTable.refresh();
        crossTable.show(true);
		this.otherRes = this.otherRes + dateRes;
    },
	/**
	 * Clear restriction of console
	 */
    abBldgopsReportTlAvailConsole_onClear: function(){
		clearConsole(this,this.abBldgopsReportTlAvailConsole);
		this.fillQueryDateRange();
        this.abBldgopsReportTlAvailReport.show(false);
    },

    showChart: function(dateValue){
		this.clickedDate =dateValue;
        View.openDialog('ab-bldgops-report-tl-avail-cht.axvw', null, false, {width:800, height:800});
    },
    
    /**
     * Fill the date range to avoid freezing report.
     */
    fillQueryDateRange: function() {
    	var currentDate = getCurrentDate();
		this.abBldgopsReportTlAvailConsole.setFieldValue("wrtl.date_assigned.from", currentDate);
		this.abBldgopsReportTlAvailConsole.setFieldValue("wrtl.date_assigned.to", fixedFromDate_toToDate(currentDate,13));
    }
})

function onReportClick(obj){
	onAvailabilityCrossTableClick(obj, View.controllers.get(0), View.panels.get('abBldgopsReportTlAvailGrid'),  "wrtl.tool_id", "wrtl.date_assigned",true);
}
