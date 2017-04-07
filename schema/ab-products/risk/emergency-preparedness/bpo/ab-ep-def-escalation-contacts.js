
function refreshDetailPanel() {
	var panel = View.panels.get("ab-ep-def-escalation-contacts_detailsPanel");
	
	var dvId = panel.getFieldValue("recovery_team.dv_id");
	var role = panel.getFieldValue("recovery_team.role");
	var emId = panel.getFieldValue("recovery_team.em_id");
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("recovery_team.dv_id", dvId, "=");
	restriction.addClause("recovery_team.role", role, "=");
	restriction.addClause("recovery_team.em_id", emId, "=");
	
	panel.refresh(restriction);
}