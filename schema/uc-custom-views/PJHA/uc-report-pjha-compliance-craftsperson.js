function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";

	var date_from = console.getFieldValue('wrhwr.date_requested.from');
	if (date_from != '') {
		restriction += " AND wrcfhwrcf.date_requested >= "+restLiteral(date_from);
	}

	var date_to = console.getFieldValue('wrhwr.date_requested.to');
	if (date_to != '') {
		restriction += " AND wrcfhwrcf.date_requested <= "+restLiteral(date_to);
	}

	var work_team_id = console.getFieldValue('wrhwr.work_team_id');
	if (work_team_id != '') {
		restriction += " AND wrcfhwrcf.work_team_id = " + restLiteral(work_team_id);
	}

    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}