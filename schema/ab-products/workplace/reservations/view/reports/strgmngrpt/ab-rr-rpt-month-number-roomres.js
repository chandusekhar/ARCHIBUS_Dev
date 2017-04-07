/**
 * The controller is used for ab-rr-rpt-day-number-roomres.axvw.
 * it used for initilize the chart panel, hidden it.
 * 
 */
View.createController('abRrRptMonthNumRmResController', {
	
	afterViewLoad: function() {
		this.chartPanel.show(false);
	}
});

/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-month-number-roomres.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrdayrmres.date_start");
	var endDate = panel.getFieldValue("date_to");
	var startTime = panel.getFieldValue("rrdayrmres.time_start");
	var endTime = panel.getFieldValue("rrdayrmres.time_end");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrdayrmres.date_start");
	restriction.removeClause("rrdayrmres.date_start");
	restriction.removeClause("rrdayrmres.time_start");
	restriction.removeClause("rrdayrmres.time_end");
	
	if (startDate != '') {
		restriction.addClause("rrdayrmres.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrdayrmres.date_start", endDate, "&lt;=");
	}
	
	if (startTime !='') {
		restriction.addClause("rrdayrmres.time_start", ABRV_formatTime(startTime), "&gt;=");
	}
	
	if (endTime !='') {
		restriction.addClause("rrdayrmres.time_end", ABRV_formatTime(endTime), "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrdayrmres.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
	
	return restriction;
}
