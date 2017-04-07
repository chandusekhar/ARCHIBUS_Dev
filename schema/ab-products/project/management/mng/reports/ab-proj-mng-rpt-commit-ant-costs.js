function projCommittedAnticipatedCrossTable_onclick(obj) {
	if (obj.restriction.clauses.length > 1)
		View.openDialog('ab-proj-mng-rpt-commit-ant-costs-dt.axvw', obj.restriction);
}
