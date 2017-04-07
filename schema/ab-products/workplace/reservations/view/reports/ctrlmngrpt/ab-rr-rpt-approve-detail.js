/**
 * Build a restriction from parameters in the console panel 
 * in the view ab-rr-rpt-approve-detail.axvw
 */
function buildReportRestriction(consolePanelId) {
	var panel = View.panels.get(consolePanelId);
	var restriction = panel.getFieldRestriction();
	
	return restriction;
}

