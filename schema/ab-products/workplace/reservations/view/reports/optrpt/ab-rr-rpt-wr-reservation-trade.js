
/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-day-resourceres-plus.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("date_start");
	var endDate = panel.getFieldValue("date_to");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrwrrestr.date_assigned");
	restriction.removeClause("rrwrrestr.date_assigned");
	
	if (startDate != '') {
		restriction.addClause("rrwrrestr.date_assigned", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrwrrestr.date_assigned", endDate, "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
	
	return restriction;
}

