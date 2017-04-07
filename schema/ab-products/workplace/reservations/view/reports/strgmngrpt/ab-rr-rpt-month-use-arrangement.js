/**
 * The controller is used for ab-rr-rpt-month-use-arrangement.axvw
 * it used for initilize the chart panel, hidden it.
 * 
 */
View.createController('abRrRptMonthUseArrangeController', {
	
	afterViewLoad: function() {
		this.chartPanel.show(false);
	}
});
/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-month-use-arrangement.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	var startDate = panel.getFieldValue("rrmonusearr.date_start");
	var endDate = panel.getFieldValue("date_to");
	var startTime = panel.getFieldValue("rrmonusearr.time_start");
	var endTime = panel.getFieldValue("rrmonusearr.time_end");
	
	// delete twice for date start and date end.
	restriction.removeClause("rrmonusearr.date_start");
	restriction.removeClause("rrmonusearr.date_start");
	restriction.removeClause("rrmonusearr.time_start");
	restriction.removeClause("rrmonusearr.time_end");
	
	if (startDate != '') {
		restriction.addClause("rrmonusearr.date_start", startDate, "&gt;=");
	}
	
	if (endDate != '') {
		restriction.addClause("rrmonusearr.date_start", endDate, "&lt;=");
	}
	
	if (startTime !='') {
		restriction.addClause("rrmonusearr.time_start", ABRV_formatTime(startTime), "&gt;=");
	}
	
	if (endTime !='') {
		restriction.addClause("rrmonusearr.time_end", ABRV_formatTime(endTime), "&lt;=");
	}
	
	if (startDate != '' && endDate != '') {
		var strStartDate = panel.getFieldElement("rrmonusearr.date_start").value;
		var strEndDate = panel.getFieldElement("date_to").value;

		if (compareLocalizedDates(strEndDate, strStartDate)) {
			View.showMessage(getMessage("errorDateRange"));
			return false;
		}
	}
	
	return restriction;
}

