

/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-day-resource-occupation.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrdayresocc.date_start");
	var endDate = panel.getFieldValue("date_to");
	var startTime = panel.getFieldValue("rrdayresocc.time_start");
	var endTime = panel.getFieldValue("rrdayresocc.time_end");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrdayresocc.date_start");
	restriction.removeClause("rrdayresocc.date_start");
	restriction.removeClause("rrdayresocc.time_start");
	restriction.removeClause("rrdayresocc.time_end");
	
	if (startDate != '') {
		restriction.addClause("rrdayresocc.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrdayresocc.date_start", endDate, "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrdayresocc.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
		
	if (startTime !='') {
		restriction.addClause("rrdayresocc.time_start", ABRV_formatTime(startTime), "&gt;=");
	}
	
	if (endTime !='') {
		restriction.addClause("rrdayresocc.time_end", ABRV_formatTime(endTime), "&lt;=");
	}
	
	return restriction;
}
