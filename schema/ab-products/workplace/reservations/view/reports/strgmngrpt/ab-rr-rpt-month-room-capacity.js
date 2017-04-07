/**
 * The controller is used for ab-rr-rpt-month-room-capacity.axvw
 * it used for initilize the chart panel, hidden it.
 * 
 */
View.createController('abRrRptMonthRmCapacityController', {
	
	afterViewLoad: function() {
		this.chartPanel.show(false);
	}
});
/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-month-room-capacity.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrmonrmcap.date_start");
	var endDate = panel.getFieldValue("date_to");
	var startTime = panel.getFieldValue("rrmonrmcap.time_start");
	var endTime = panel.getFieldValue("rrmonrmcap.time_end");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrmonrmcap.date_start");
	restriction.removeClause("rrmonrmcap.date_start");
	restriction.removeClause("rrmonrmcap.time_start");
	restriction.removeClause("rrmonrmcap.time_end");
	
	if (startDate != '') {
		restriction.addClause("rrmonrmcap.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrmonrmcap.date_start", endDate, "&lt;=");
	}
	
	if (startTime !='') {
		restriction.addClause("rrmonrmcap.time_start", ABRV_formatTime(startTime), "&gt;=");
	}
	
	if (endTime !='') {
		restriction.addClause("rrmonrmcap.time_end", ABRV_formatTime(endTime), "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrmonrmcap.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
	
	return restriction;
}
