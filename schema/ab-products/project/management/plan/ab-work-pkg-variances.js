function workPkgVariancesCrossTable_onClickItem(obj) {
	if (View.panels.get('workPkgVariancesCrossTable').restriction.clauses.length > 0)
	{
		var project_id = View.panels.get('workPkgVariancesCrossTable').restriction.clauses[0].value;
		if (obj.restriction.clauses.length > 0 && obj.restriction.clauses[0].value == 'Not specified') {
			obj.restriction = "activity_log.project_id = '" + project_id + "' AND activity_log.work_pkg_id IS NULL";
		}
		else obj.restriction.addClause('activity_log.project_id', project_id);
	}
	else {
		if (obj.restriction.clauses.length > 0) {
			if (obj.restriction.clauses[0].value == 'Not specified') {
				obj.restriction = "activity_log.work_pkg_id IS NULL";
			}
		}
	}
	View.openDialog('ab-activity-log-list.axvw', obj.restriction);
}
