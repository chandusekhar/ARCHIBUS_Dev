
function apply_console_restriction() {
    var console = View.panels.get("appa_console");
    var restriction = "";

    var interval = console.getFieldValue('uc_appa_report_data.interval');
    if (interval != '') {
        restriction += " uc_appa_report_data.interval = "+restLiteral(interval);
    }

    var period = console.getFieldValue('uc_appa_report_data.period');
    if (period != '') {
        restriction += " AND uc_appa_report_data.period = "+restLiteral(period);
    }

    if (interval == "" && period == "") {
        View.showMessage("You must select an interval and a period.");
        return;
    }

    var reportView = View.panels.get("appa_wr_grid");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}