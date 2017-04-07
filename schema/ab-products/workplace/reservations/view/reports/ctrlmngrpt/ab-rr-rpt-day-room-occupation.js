/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-day-room-occupation.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrdayrmocc.date_start");
	var endDate = panel.getFieldValue("date_to");
	var startTime = panel.getFieldValue("rrdayrmocc.time_start");
	var endTime = panel.getFieldValue("rrdayrmocc.time_end");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrdayrmocc.date_start");
	restriction.removeClause("rrdayrmocc.date_start");
	restriction.removeClause("rrdayrmocc.time_start");
	restriction.removeClause("rrdayrmocc.time_end");
	
	if (startDate != '') {
		restriction.addClause("rrdayrmocc.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrdayrmocc.date_start", endDate, "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrdayrmocc.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
		
	if (startTime !='') {
		restriction.addClause("rrdayrmocc.time_start", ABRV_formatTime(startTime), "&gt;=");
	}
	
	if (endTime !='') {
		restriction.addClause("rrdayrmocc.time_end", ABRV_formatTime(endTime), "&lt;=");
	}
	
	return restriction;
}
