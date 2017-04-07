function projActionsCostsVariancesCrossTable_onclick(obj) {
	var drilldown = View.panels.get('projActionsCostsVariancesColumnReport');
	if (obj.restriction.clauses.length < 3) drilldown = View.panels.get('projActionsCostsVariancesActionsGrid');

	drilldown.refresh(obj.restriction);
	drilldown.showInWindow({
	    width: 800,
	    height: 400
	});
}