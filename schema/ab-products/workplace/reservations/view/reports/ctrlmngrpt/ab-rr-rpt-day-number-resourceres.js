/**
 * The controller is used for ab-rr-rpt-day-number-resourceres.axvw.
 * it used for initilize the chart panel, hidden it.
 * 
 */
var rptDayNumResourceResController = View.createController('rptDayNumResourceResController', {
	
	afterViewLoad: function() {
		this.chartPanel.show(false);
	}
});

/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-day-number-resourceres.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrdayrresplus.date_start");
	var endDate = panel.getFieldValue("date_to");
	var startTime = panel.getFieldValue("rrdayrresplus.time_start");
	var endTime = panel.getFieldValue("rrdayrresplus.time_end");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrdayrresplus.date_start");
	restriction.removeClause("rrdayrresplus.date_start");
	restriction.removeClause("rrdayrresplus.time_start");
	restriction.removeClause("rrdayrresplus.time_end");
	
	if (startDate != '') {
		restriction.addClause("rrdayrresplus.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrdayrresplus.date_start", endDate, "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrdayrresplus.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
		
	if (startTime !='') {
		restriction.addClause("rrdayrresplus.time_start", ABRV_formatTime(startTime), "&gt;=");
	}
	
	if (endTime !='') {
		restriction.addClause("rrdayrresplus.time_end", ABRV_formatTime(endTime), "&lt;=");
	}
	
	return restriction;
}