
var rptNotVerifiedResController = View.createController('rptNotVerifiedResController', {
	
	afterInitialDataFetch: function() {
		var today = ABRV_getCurrentDate();
		this.consolePanel.setFieldValue("date_to", today);
	}

});

/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-not-verified-detail.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("reserve_rm.date_start");
	var endDate = panel.getFieldValue("date_to");
	
	// delete twice for date start and date end.
	restriction.removeClause("reserve_rm.date_start");
	restriction.removeClause("reserve_rm.date_start");
	
	if (startDate != '') {
		restriction.addClause("reserve_rm.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("reserve_rm.date_start", endDate, "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("reserve_rm.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
		
	return restriction;
}
