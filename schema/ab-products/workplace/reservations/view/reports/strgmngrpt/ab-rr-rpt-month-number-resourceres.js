/**
 * The controller is used for ab-rr-rpt-day-number-roomres.axvw.
 * it used for initilize the chart panel, hidden it.
 * 
 */
var abRrRptMonthNumResourceResController = View.createController('abRrRptMonthNumResourceResController', {
	
	afterViewLoad: function() {
		this.chartPanel.show(false);
	}
});
/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-month-number-resourceres.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrmonnumrres.date_start");
	var endDate = panel.getFieldValue("date_to");
	var startTime = panel.getFieldValue("rrmonnumrres.time_start");
	var endTime = panel.getFieldValue("rrmonnumrres.time_end");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrmonnumrres.date_start");
	restriction.removeClause("rrmonnumrres.date_start");
	restriction.removeClause("rrmonnumrres.time_start");
	restriction.removeClause("rrmonnumrres.time_end");
	
	if (startDate != '') {
		restriction.addClause("rrmonnumrres.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrmonnumrres.date_start", endDate, "&lt;=");
	}
	
	if (startTime !='') {
		restriction.addClause("rrmonnumrres.time_start", ABRV_formatTime(startTime), "&gt;=");
	}
	
	if (endTime !='') {
		restriction.addClause("rrmonnumrres.time_end", ABRV_formatTime(endTime), "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrmonnumrres.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
	
	return restriction;
}