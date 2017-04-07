function activityLogListCrossTable_onClickItem(obj) {
	if (obj.restriction.clauses.length == 0) return;
	View.openDialog('ab-activity-log-edit.axvw', obj.restriction);
}
