/**
 * The controller is used for ab-rr-rpt-month-resource-reject.axvw
 * it used for initilize the chart panel, hidden it.
 * 
 */
View.createController('abRrRptMonthResourceRejectController', {
	
	afterViewLoad: function() {
		this.chartPanel.show(false);
	}
});
/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-month-resource-reject.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrmonresrej.date_start");
	var endDate = panel.getFieldValue("date_to");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrmonresrej.date_start");
	restriction.removeClause("rrmonresrej.date_start");
	
	if (startDate != '') {
		restriction.addClause("rrmonresrej.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrmonresrej.date_start", endDate, "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrmonresrej.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
	
	return restriction;
}
