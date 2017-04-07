/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-cost-detail.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrcostdet.date_start");
	var endDate = panel.getFieldValue("date_to");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrcostdet.date_start");
	restriction.removeClause("rrcostdet.date_start");
	
	if (startDate != '') {
		restriction.addClause("rrcostdet.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrcostdet.date_start", endDate, "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrcostdet.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
		
	return restriction;
}
