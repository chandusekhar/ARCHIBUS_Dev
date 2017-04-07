function projActionsCostsVariancesCrossTable_onclick(obj) {
	var drilldown = View.panels.get('projActionsCostsVariancesColumnReport');
	if (obj.restriction.clauses.length < 3) {
		drilldown = View.panels.get('projActionsCostsVariancesActionsGrid');
		drilldown.addParameter('action_item_restriction', '1=1');
		drilldown.refresh(obj.restriction);
	}
	else {
		drilldown.addParameter('action_item_restriction', "RTRIM(action_title) ${sql.concat} ' - ' ${sql.concat} RTRIM(activity_log_id) = '" + obj.restriction.findClause('activity_log.action_item').value + "'");
		drilldown.refresh();
	}
	drilldown.showInWindow({
	    width: 800,
	    height: 400
	});
}