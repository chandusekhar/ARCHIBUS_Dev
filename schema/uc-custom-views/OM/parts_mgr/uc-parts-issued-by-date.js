function setFilterAndRender() {

	var restriction = "1=1";
	var console = View.panels.get('uc_dateConsole');

	var date_from = console.getFieldValue('wrhwr.date_completed.from');
	if (date_from != '') {
		restriction += " AND wrotherhwrother.date_completed >= "+restLiteral(date_from);
	}

	var date_to = console.getFieldValue('wrhwr.date_completed.to');
	if (date_to != '') {
		restriction += " AND wrotherhwrother.date_completed <= "+restLiteral(date_to);
	}

	//add_restriction_clause_for_date_field('pms', 'date_next_todo', console, restriction);

	// apply restriction to the report
	var report = View.panels.get('grid_results');
	report.refresh(restriction);

	// show the report
	report.show(true);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}