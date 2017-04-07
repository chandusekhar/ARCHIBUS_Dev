function projCommittedAnticipatedCrossTable_onclick(obj) {
	if (obj.restriction.clauses.length > 1)
		View.openDialog('ab-proj-costs-work-pkgs.axvw', obj.restriction);
}
